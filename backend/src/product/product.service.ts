import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import slugify from 'slugify';
import { InjectModel } from '@nestjs/mongoose';
import {
  Product,
  Product_Option,
  Product_OptionDocument,
  ProductDescription,
  ProductDescriptionDocument,
  ProductDocument,
  ProductProperty,
  ProductPropertyDocument,
  ProductVariant,
  ProductVariantDocument,
  VariantOption,
  VariantOptionDocument,
} from 'src/database/schemas/product.schema';
import { Model } from 'mongoose';
import { slugifyOption } from 'src/constants';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CategoryService } from 'src/category/category.service';
@Injectable()
export class ProductService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly categoryService: CategoryService,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(ProductVariant.name)
    private readonly productVariantModel: Model<ProductVariantDocument>,
    @InjectModel(VariantOption.name)
    private readonly variantOptionModel: Model<VariantOptionDocument>,
    @InjectModel(Product_Option.name)
    private readonly productOptionModel: Model<Product_OptionDocument>,

    @InjectModel(ProductProperty.name)
    private readonly productPropertyModel: Model<ProductPropertyDocument>,
    @InjectModel(ProductDescription.name)
    private readonly productDescriptionModel: Model<ProductDescriptionDocument>,
  ) {}

  async createNewProduct(
    createProductDto: CreateProductDto,
    files: Array<Express.Multer.File>,
  ) {
    const thumbnailFile = files.find(
      (file) => file.fieldname === 'thumbnailFile',
    );
    if (!thumbnailFile) {
      console.log('Failed to locate thumbnail file');
      throw new BadRequestException('Trường đặt thumbnail file không hợp lệ');
    }
    const productId = await this.createProductBasicInfo(
      createProductDto,
      thumbnailFile,
    );

    if (!!!productId) {
      console.log('Create product info failed!');
      throw new InternalServerErrorException(
        'Tạo mới sản phẩm thất bại tại bước 1',
      );
    }
    this.createProductDescription(productId, createProductDto);
    this.createProductProperty(productId, createProductDto);

    const { totalVariant } = createProductDto;
    if (totalVariant === '1') {
    } else if (totalVariant === '2') {
      console.log('A');
      const v1TempIdRealIdMap = await this.createProductVariant1(
        createProductDto,
        files,
      );
      console.log('A1');
      const v2TempIdRealIdMap =
        await this.createProductVariant2(createProductDto);
      console.log('A2');
      const { v1TempIdVariantIdMap, v2TempIdVariantIdMap } =
        await this.createProductVariantTable(createProductDto);
      console.log('A3');
      const insertDbPromises1 = v1TempIdVariantIdMap.forEach(
        async (v1TempId, variantId) => {
          const optionId = v1TempIdRealIdMap.get(v1TempId);
          const dbEntry = {
            productId,
            optionId,
            variantId,
          };
          await this.productOptionModel.create(dbEntry);
        },
      );
      const insertDbPromises2 = v2TempIdVariantIdMap.forEach(
        async (v2TempId, variantId) => {
          const optionId = v2TempIdRealIdMap.get(v2TempId);
          const dbEntry = {
            productId,
            optionId,
            variantId,
          };
          await this.productOptionModel.create(dbEntry);
        },
      );
      await Promise.all([insertDbPromises1, insertDbPromises2]);
      console.log('A4');
      console.log('Linkage created');
    }
  }
  //return product id on success, null otherwise
  async createProductBasicInfo(
    createProductDto: CreateProductDto,
    thumbnailFile: Express.Multer.File,
  ) {
    const { productName, isDrafted, categoryId } = createProductDto;
    const sku = this.generateSKU();
    //slugify
    const productSlug = slugify(productName, slugifyOption);

    //get the lowest variant price
    const productPrice = 49000;

    //upload thumbnail to cloudinary then get its url
    const response = await this.cloudinaryService.uploadFile(thumbnailFile);
    if (!response)
      throw new InternalServerErrorException(
        'Upload thumbnail to Cloudinary failed',
      );
    const thumbnailURL = response?.secure_url;
    let newProduct: ProductDocument;
    if (isDrafted) {
      newProduct = await this.productModel.create({
        name: productName,
        slug: productSlug,
        sku: sku,
        display_price: productPrice,
        display_thumbnail_image: thumbnailURL,
        categoryId: categoryId,
        isDrafted: true,
      });
    } else {
      newProduct = await this.productModel.create({
        name: productName,
        slug: productSlug,
        display_price: productPrice,
        display_thumbnail_image: thumbnailURL,
        categoryId: categoryId,
        isPublished: true,
      });
    }

    console.log('New product basic info created: ', newProduct);
    return newProduct.productId;
  }
  async createProductDescription(
    productId: string,
    createProductDto: CreateProductDto,
  ) {
    const _newDescription = await this.productDescriptionModel.create({
      productId: productId,
      description: createProductDto.description,
    });
    console.log('Product description created: ', _newDescription);
    return _newDescription;
  }
  async createProductProperty(
    productId: string,
    createProductDto: CreateProductDto,
  ) {
    const { propertyList } = createProductDto;
    let deStringed = JSON.parse(propertyList);
    deStringed = deStringed.map((element) => ({
      ...element,
      productId,
    }));
    const response = await this.productPropertyModel.insertMany(deStringed);
    console.log('Product property created: ', response);
    return response;
  }
  async createProductVariant1(
    createProductDto: CreateProductDto,
    files: Array<Express.Multer.File>,
  ) {
    //upload file to cloudinary
    const urlFileNameMap = new Map<string, Array<string>>();
    const v1ImgFile = files.filter((file) => file.fieldname.startsWith('v1_'));

    const uploadPromises = v1ImgFile.map(async (file) => {
      const response = await this.cloudinaryService.uploadFile(file);

      // Get existing array (or undefined)
      const fileName = file.fieldname.substring(3);
      const existing = urlFileNameMap.get(fileName);

      if (existing) {
        existing.push(response?.secure_url);
      } else {
        urlFileNameMap.set(fileName, [response?.secure_url]);
      }
    });
    await Promise.all(uploadPromises);
    console.log('URL filename map: ', urlFileNameMap);

    //create db entry
    const { variant1Data } = createProductDto;
    const v1 = JSON.parse(variant1Data);
    const tempIdRealIdMap = new Map<string, string>();
    const createOptionPromises = v1.valueList.map(async (value) => {
      const toBeCreated = {
        name: v1.name,
        value: value.value,
        index: v1.index,
        image: urlFileNameMap.get(value.tempId),
      };
      const response = await this.variantOptionModel.create(toBeCreated);
      tempIdRealIdMap.set(value.tempId, response.optionId);
    });
    await Promise.all(createOptionPromises);

    console.log('V1 - tempId RealId map: ', tempIdRealIdMap);
    return tempIdRealIdMap;
  }
  async createProductVariant2(createProductDto: CreateProductDto) {
    //create db entry
    const { variant2Data } = createProductDto;
    const v2 = JSON.parse(variant2Data);
    const tempIdRealIdMap = new Map<string, string>();
    const createOptionPromises = v2.valueList.map(async (value) => {
      const toBeCreated = {
        name: v2.name,
        value: value.value,
        index: v2.index,
      };
      const response = await this.variantOptionModel.create(toBeCreated);
      tempIdRealIdMap.set(value.tempId, response.optionId);
    });
    await Promise.all(createOptionPromises);

    console.log('V2 - tempId RealId map: ', tempIdRealIdMap);
    return tempIdRealIdMap;
  }
  async createProductVariantTable(createproductDto: CreateProductDto) {
    const { totalVariant, variantTableData } = createproductDto;
    const v1TempIdVariantIdMap = new Map<string, string>();
    const v2TempIdVariantIdMap = new Map<string, string>();

    const _variantTableData = JSON.parse(variantTableData);
    // console.log('Variant table data: ', _variantTableData);
    const promises = _variantTableData.map(async (dataRow) => {
      const response = await this.productVariantModel.create({
        platform_sku: this.generateSKU(),
        seller_sku: dataRow.seller_sku,
        price: dataRow.sellingPrice,
        stock: dataRow.stock,
        isInUse: dataRow.isInUse,
        isOpenToSale: dataRow.isOpenToSale,
      });
      // console.log(totalVariant);
      // console.log('DR: ', dataRow);
      if (totalVariant === '2') {
        v2TempIdVariantIdMap.set(response.variantId, dataRow.v2_tempId);
        v1TempIdVariantIdMap.set(response.variantId, dataRow.v1_tempId);
      }
    });
    await Promise.all(promises);
    console.log('V1 variant map: ', v1TempIdVariantIdMap);
    console.log('V2 variant map: ', v2TempIdVariantIdMap);
    return { v1TempIdVariantIdMap, v2TempIdVariantIdMap };
  }

  /////get block
  async getAllProduct_ItemManagement() {
    const basicProductInfo = await this.productModel.find();
    const productListPromises = basicProductInfo.map(async (product) => {
      const { minPrice, maxPrice } = await this.getProductSellingPrice(product);
      return {
        productId: product.productId,
        thumbnailURL: product.display_thumbnail_image,
        name: product.name,
        categoryName:
          (await this.getProductCategoryName(product)) || 'Không có dữ liệu',
        sku: product.sku,
        sellingPriceBot: minPrice,
        sellingPriceTop: maxPrice,
        inStorageTotal: await this.getProductTotalStock(product),
        isPublished: product.isPublished,
        isDrafted: product.isDrafted,
        isDeleted: product.isDeleted,
      };
    });
    const productList = await Promise.all(productListPromises);
    return productList;
  }
  async getProductCategoryName(product: ProductDocument) {
    const { categoryId } = product;
    const categoryName =
      await this.categoryService.getCategoryDetail(categoryId);
    return categoryName;
  }
  async getAllVariantsOfProduct(product: ProductDocument) {
    const { productId } = product;
    const variants = await this.productVariantModel.aggregate([
      // 1. Join each variant with all option links
      {
        $lookup: {
          from: 'product_option', // your Product_Option collection
          localField: 'variantId',
          foreignField: 'variantId',
          as: 'links',
        },
      },

      // 2. Keep only variants belonging to this product
      {
        $match: {
          'links.productId': productId,
        },
      },

      // 3. Extract only optionIds from links
      {
        $addFields: {
          optionIds: {
            $map: {
              input: '$links',
              as: 'l',
              in: '$$l.optionId',
            },
          },
        },
      },

      // 4. Lookup option documents for all optionIds
      {
        $lookup: {
          from: 'variant_option',
          localField: 'optionIds',
          foreignField: 'optionId',
          as: 'optionsData',
        },
      },

      // 5. Assume exactly 2 options → split them
      {
        $addFields: {
          option1: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$optionsData',
                  as: 'opt',
                  cond: { $eq: ['$$opt.index', 0] },
                },
              },
              0,
            ],
          },
          option2: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$optionsData',
                  as: 'opt',
                  cond: { $eq: ['$$opt.index', 1] },
                },
              },
              0,
            ],
          },
        },
      },

      // 6. Final projection
      {
        $project: {
          _id: 0,
          variantId: 1,
          sku: 1,
          price: 1,
          stock: 1,
          isInUse: 1,
          isOpenToSale: 1,
          seller_sku: 1,
          platform_sku: 1,
          optionId1: '$option1.optionId',
          optionName1: '$option1.name',
          optionValue1: '$option1.value',

          optionId2: '$option2.optionId',
          optionName2: '$option2.name',
          optionValue2: '$option2.value',
        },
      },
    ]);
    if (!variants) {
      throw new InternalServerErrorException(
        `Can't fetch variant of product: ${product}`,
      );
    }
    console.log('All variants: ', variants);
    return variants;
  }
  async getAllProductOptions(product: ProductDocument) {
    const { productId } = product;
    const allLinks = await this.productOptionModel
      .find({
        productId: productId,
      })
      .lean();

    const allLinkId = allLinks.map((link) => link.optionId);
    const allOptions = await this.variantOptionModel.find({
      optionId: { $in: allLinkId },
    });
    console.log('All product options: ', allOptions);
    return allOptions;
  }
  async getProductSellingPrice(product: ProductDocument) {
    const variants = await this.getAllVariantsOfProduct(product);
    const variantsPrice = variants.map((variant) => variant.price);
    const minPrice = Math.min(...variantsPrice);
    const maxPrice = Math.max(...variantsPrice);
    return { minPrice, maxPrice };
  }
  async getProductTotalStock(product: ProductDocument) {
    const variants = await this.getAllVariantsOfProduct(product);
    const variantsStock = variants.map((variant) => variant.stock);
    let totalStock = variantsStock.reduce(
      (accumulator, current) => accumulator + current,
      0,
    );
    return totalStock;
  }
  async getProductPropertyList(product: ProductDocument) {
    const { productId } = product;
    const data = await this.productPropertyModel
      .find({ productId: productId })
      .lean();
    console.log('Property list: ', data);
    return data;
  }
  async getProductDescription(product: ProductDocument) {
    const { productId } = product;
    const data = await this.productDescriptionModel
      .findOne({ productId: productId })
      .lean();
    console.log('Description: ', data);
    return data;
  }
  //get detail

  async getProductDetail_Admin(productId: string) {
    const product = await this.productModel.findOne({ productId: productId });
    if (!product) {
      throw new InternalServerErrorException('Product not found!');
    }
    const propertyListDb = await this.getProductPropertyList(product);
    const propertyList = propertyListDb.map((property) => ({
      name: property.name,
      value: property.value,
    }));
    const descriptionDb = await this.getProductDescription(product);
    const description = descriptionDb?.description;
    const options = await this.getAllProductOptions(product);
    let optionsGrouped = this.groupOptions(options);
    const v1 = optionsGrouped.find((grouped: any) => grouped.index === 0);
    const v2 = optionsGrouped.find((grouped: any) => grouped.index === 1);
    const allVariantsSellingPoint = await this.getAllVariantsOfProduct(product);
    return {
      name: product.name,
      categoryId: product.categoryId,
      thumbnailURL: product.display_thumbnail_image,
      propertyList: JSON.stringify(propertyList),
      description: JSON.stringify(description),
      variant1: v1,
      variant2: v2,
      variantSellingPoint: allVariantsSellingPoint,
      isPublised: product.isPublished,
      isDrafted: product.isDrafted,
      isDeleted: product.isDeleted,
    };
  }
  async resetAllProductData() {
    await this.productModel.deleteMany();
    await this.productOptionModel.deleteMany();
    await this.productVariantModel.deleteMany();
    await this.variantOptionModel.deleteMany();
    await this.productPropertyModel.deleteMany();
    await this.productDescriptionModel.deleteMany();
  }

  async updateProductPublished(productId: string, state: boolean) {
    const result = await this.productModel.findOneAndUpdate(
      { productId },
      { isPublished: state },
    );
    return await this.getAllProduct_ItemManagement();
  }
  async softDeleteProduct(productId: string) {
    const result = await this.productModel.findOneAndUpdate(
      { productId },
      { isDeleted: true },
    );
    return await this.getAllProduct_ItemManagement();
  }
  async restoreProduct(productId: string) {
    const result = await this.productModel.findOneAndUpdate(
      { productId },
      { isDeleted: false },
    );
    console.log(result);
    return await this.getAllProduct_ItemManagement();
  }
  generateSKU(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from(
      { length },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join('');
  }
  groupOptions(options) {
    const map = {};

    for (const opt of options) {
      const key = `${opt.name}_${opt.index}`;

      if (!map[key]) {
        map[key] = {
          name: opt.name,
          index: opt.index,
          valueList: [],
        };
      }

      map[key].valueList.push({
        name: opt.value,
        img: opt.image ?? [],
        optionId: opt.optionId,
      });
    }

    // return as an array
    return Object.values(map);
  }
}
