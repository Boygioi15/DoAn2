import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  CreateProductDto,
  ProductPropertyDto,
  ProductSizeDto,
} from '../dto/create-product.dto';
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
  ProductSize,
  ProductSizeDocument,
  ProductVariant,
  ProductVariantDocument,
  VariantOption,
  VariantOptionDocument,
} from 'src/database/schemas/product.schema';
import { Model } from 'mongoose';
import { slugifyOption } from 'src/constants';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CategoryService } from 'src/category/category.service';
import { ProductQueryService } from './product-query.service';
@Injectable()
export class ProductService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly categoryService: CategoryService,
    private readonly productQueryService: ProductQueryService,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(ProductVariant.name)
    private readonly productVariantModel: Model<ProductVariantDocument>,
    @InjectModel(VariantOption.name)
    private readonly variantOptionModel: Model<VariantOptionDocument>,
    @InjectModel(Product_Option.name)
    private readonly productOptionModel: Model<Product_OptionDocument>,

    @InjectModel(ProductSize.name)
    private readonly productSizeModel: Model<ProductSizeDocument>,
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
    this.createProductSize(productId, createProductDto);
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
    const finalProduct = await this.denormalizeProduct(productId);
    console.log('Product backfilled: ', finalProduct);
    return finalProduct;
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
        display_price: productPrice,
        display_thumbnail_image: thumbnailURL,
        categoryId: categoryId,
        isDrafted: true,
      });
    } else {
      newProduct = await this.productModel.create({
        sku: sku,
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
  async createProductSize(
    productId: string,
    createProductDto: CreateProductDto,
  ) {
    const { sizeList } = createProductDto;
    const _sizeList: ProductSizeDto[] = JSON.parse(sizeList);
    const tobeInserted = _sizeList.map((size: ProductSizeDto) => {
      const sizeRow: any = {};
      sizeRow.productId = productId;
      sizeRow.name = size.name;
      sizeRow.fit = {};
      if (size.fit.height) {
        sizeRow.fit.height = {
          min: size.fit.height.min,
          max: size.fit.height.max,
        };
      }
      if (size.fit.weight) {
        sizeRow.fit.weight = {
          min: size.fit.weight.min,
          max: size.fit.weight.max,
        };
      }
      if (size.fit.bust) {
        sizeRow.fit.bust = {
          min: size.fit.bust.min,
          max: size.fit.bust.max,
        };
      }
      if (size.fit.waist) {
        sizeRow.fit.waist = {
          min: size.fit.waist.min,
          max: size.fit.waist.max,
        };
      }
      if (size.fit.hip) {
        sizeRow.fit.hip = {
          min: size.fit.hip.min,
          max: size.fit.hip.max,
        };
      }

      return sizeRow;
    });

    const response = await this.productSizeModel.insertMany(tobeInserted);
    console.log('Product size created: ', response);
    return response;
  }
  async createProductProperty(
    productId: string,
    createProductDto: CreateProductDto,
  ) {
    const { propertyList } = createProductDto;
    const _propertyList: ProductPropertyDto[] = JSON.parse(propertyList);
    const tobeInserted: ProductProperty[] = _propertyList.map((property) => ({
      productId,
      name: property.name,
      value: property.value,
    }));
    const response = await this.productPropertyModel.insertMany(tobeInserted);
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
    return {
      v1TempIdVariantIdMap,
      v2TempIdVariantIdMap,
    };
  }

  async updateProductPublished(productId: string, state: boolean) {
    const result = await this.productModel.findOneAndUpdate(
      { productId },
      { isPublished: state },
    );
    return result;
  }

  async denormalizeProduct(productId: string) {
    const product = await this.productModel.findOne({ productId });
    if (!product) {
      throw new InternalServerErrorException(
        'Denormalize product failed, no matching product',
      );
    }
    //denormalize totalPrice and stock
    const allProductVariants =
      await this.productQueryService.getAllVariantsOfProduct(product);
    let minPrice = 999999999,
      totalStock = 0;

    //denormalize color and size
    let _allColors: Set<string> = new Set<string>(),
      _allSizes: Set<string> = new Set<string>();

    allProductVariants.forEach((variant) => {
      minPrice = Math.min(minPrice, variant.price);
      totalStock += variant.stock;
      _allColors.add(variant.optionValue1);
      _allSizes.add(variant.optionValue2);
    });
    let allColors = Array.from(_allColors);
    let allSizes = Array.from(_allSizes);
    let categoryName = await this.categoryService.getCategoryDetail(
      product.productId,
    );

    const newProduct = await this.productModel.findOneAndUpdate(
      { productId },
      {
        minPrice,
        totalStock,
        allColors,
        allSizes,
        categoryName,
      },
      { new: true },
    );

    return newProduct;
  }
  generateSKU(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from(
      { length },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join('');
  }
}
