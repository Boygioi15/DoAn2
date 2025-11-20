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
@Injectable()
export class ProductService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,

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
    const promises = _variantTableData.map(async (dataRow) => {
      const response = await this.productVariantModel.create({
        sku: dataRow.sellerSku,
        price: dataRow.sellingPrice,
        stock: dataRow.stock,
        isInUse: dataRow.isInUse,
        isOpenToSale: dataRow.isOpenToSale,
      });
      // console.log(totalVariant);
      // console.log('DR: ', dataRow);
      if (totalVariant === '2') {
        v2TempIdVariantIdMap.set(dataRow.v2_tempId, response.variantId);
        v1TempIdVariantIdMap.set(dataRow.v1_tempId, response.variantId);
      }
    });
    await Promise.all(promises);
    console.log('V1 variant map: ', v1TempIdVariantIdMap);
    console.log('V2 variant map: ', v2TempIdVariantIdMap);
    return { v1TempIdVariantIdMap, v2TempIdVariantIdMap };
  }
}
