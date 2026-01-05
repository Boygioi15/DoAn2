import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  CreateProductDto,
  ProductPropertyDto,
  ProductSizeGuidanceDto,
  ProductVariantDetailDto,
} from '../dto/product.dto';
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
  ProductSizeGuidance,
  ProductSizeGuidanceDocument,
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
import { Multer } from 'multer';
import { ProductDeleteService } from './product-delete.service';
import { ProductEmbeddingService } from './product-embedding.service';
import { extractSearchableText } from 'src/ultility';
@Injectable()
export class ProductService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly categoryService: CategoryService,
    private readonly productQueryService: ProductQueryService,
    private readonly productDeleteService: ProductDeleteService,
    private readonly productEmbeddingService: ProductEmbeddingService,

    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(ProductVariant.name)
    private readonly productVariantModel: Model<ProductVariantDocument>,
    @InjectModel(VariantOption.name)
    private readonly variantOptionModel: Model<VariantOptionDocument>,
    @InjectModel(Product_Option.name)
    private readonly productOptionModel: Model<Product_OptionDocument>,

    @InjectModel(ProductSizeGuidance.name)
    private readonly productSizeModel: Model<ProductSizeGuidanceDocument>,
    @InjectModel(ProductProperty.name)
    private readonly productPropertyModel: Model<ProductPropertyDocument>,
    @InjectModel(ProductDescription.name)
    private readonly productDescriptionModel: Model<ProductDescriptionDocument>,
  ) {}
  async publishNewProduct(
    createProductDto: CreateProductDto,
    files: Array<Express.Multer.File>,
  ) {
    //full create new
    const productId = await this.createNewProduct(createProductDto, files);
    const product = await this.denormalizeProduct(productId);
    console.log('Product: ', product);

    try {
      await this.productEmbeddingService.generateAndSaveEmbeddingForProduct(
        productId,
      );
    } catch (error) {
      console.log('Generate embedding for product failed', error);
    }
  }
  async createNewDraft(
    createProductDto: CreateProductDto,
    files: Array<Express.Multer.File>,
  ) {
    //full create new
    return await this.createNewProduct(createProductDto, files, true);
  }
  async publishDraft(
    createProductDto: CreateProductDto,
    files: Array<Express.Multer.File>,
    productId: string,
  ) {
    //delete then create
    await this.productDeleteService.deleteProductData(productId, true);
    const _productId = await this.createNewProduct(
      createProductDto,
      files,
      false,
      productId,
    );
    await this.denormalizeProduct(_productId);
    try {
      await this.productEmbeddingService.generateAndSaveEmbeddingForProduct(
        _productId,
      );
    } catch (error) {
      console.log('Generate embedding for product failed', error);
    }
  }
  async updateDraft(
    updateProductDto: CreateProductDto,
    files: Array<Express.Multer.File>,
    productId: string,
  ) {
    //delete then create, but with initalId
    await this.productDeleteService.deleteProductData(productId, true);
    return await this.createNewProduct(
      updateProductDto,
      files,
      true,
      productId,
    );
  }
  async updateProduct(
    productId: string,
    updateProductDto: CreateProductDto,
    files: Array<Express.Multer.File>,
  ) {
    const {
      productName,
      categoryId,
      description,
      propertyList,
      sizeGuidance,
      variantTableData,
    } = updateProductDto;

    // Parse JSON first (sync work)
    const parsedPropertyList: ProductPropertyDto[] = JSON.parse(propertyList);
    const parsedSizeGuidance: ProductSizeGuidanceDto[] =
      JSON.parse(sizeGuidance);
    const parsedVariantDetailList: ProductVariantDetailDto[] =
      JSON.parse(variantTableData);

    // Create promises (do NOT await yet)
    const updateBasicInfoPromise = this.updateProductBasicInfo(
      productId,
      productName,
      categoryId,
    );

    const updateDescriptionPromise = this.updateProductDescription(
      productId,
      description,
    );

    const updatePropertyPromise = this.updateProductProperty(
      productId,
      parsedPropertyList,
    );

    const updateSizeGuidancePromise = this.updateProductSizeGuidance(
      productId,
      parsedSizeGuidance,
    );

    const updateVariantDetailPromise = this.updateProductVariantDetailList(
      productId,
      parsedVariantDetailList,
    );

    // Await everything at the end
    await Promise.all([
      updateBasicInfoPromise,
      updateDescriptionPromise,
      updatePropertyPromise,
      updateSizeGuidancePromise,
      updateVariantDetailPromise,
    ]);

    await this.denormalizeProduct(productId);
    try {
      await this.productEmbeddingService.generateAndSaveEmbeddingForProduct(
        productId,
      );
    } catch (error) {
      console.log('Generate embedding for product failed', error);
    }
  }

  async createNewProduct(
    createProductDto: CreateProductDto,
    files: Array<Express.Multer.File>,
    isDrafted: boolean = false,
    initialProductId: string | undefined = undefined,
  ): Promise<string> {
    let thumbnailFile: Express.Multer.File | undefined = undefined;
    if (!isDrafted) {
      thumbnailFile = files.find((file) => file.fieldname === 'thumbnailFile');
      if (!thumbnailFile) {
        console.log('Failed to locate thumbnail file');
        throw new BadRequestException('Trường đặt thumbnail file không hợp lệ');
      }
    }
    const productId = await this.createProductBasicInfo(
      createProductDto,
      thumbnailFile,
      isDrafted,
      initialProductId,
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
    return productId;
  }
  //return product id on success, null otherwise
  async createProductBasicInfo(
    createProductDto: CreateProductDto,
    thumbnailFile: Express.Multer.File | undefined,
    isDrafted: boolean,
    initialProductId: string | undefined = undefined,
  ) {
    const { productName, categoryId, uploadCode } = createProductDto;
    const trimmedCategory = categoryId.trimStart().trimEnd();
    const sku = this.generateSKU();
    //slugify
    const productSlug = slugify(productName, slugifyOption);

    //get the lowest variant price
    const productPrice = 49000;

    //upload thumbnail to cloudinary then get its url
    let thumbnailUrl: string | undefined = undefined;
    if (thumbnailFile) {
      try {
        const response = await this.cloudinaryService.uploadFile(thumbnailFile);
        if (!response)
          throw new InternalServerErrorException(
            'Upload thumbnail to Cloudinary failed',
          );
        thumbnailUrl = response?.secure_url;
      } catch (error) {
        console.log('error while upload thumbnail', error);
      }
    }
    console.log('create ', initialProductId);
    let newProduct: ProductDocument | null;

    if (!initialProductId) {
      // CREATE
      console.log('create initial data');
      newProduct = await this.productModel.create({
        name: productName,
        slug: productSlug,
        uploadCode,
        sku,
        display_price: productPrice,
        display_thumbnail_image: thumbnailUrl,
        categoryId: trimmedCategory,
        isDrafted,
        isPublished: !isDrafted,
      });
    } else {
      // UPDATE
      newProduct = await this.productModel.findOneAndUpdate(
        { productId: initialProductId },
        {
          name: productName,
          slug: productSlug,
          sku,
          display_price: productPrice,
          display_thumbnail_image: thumbnailUrl,
          categoryId,
          isDrafted,
          isPublished: !isDrafted,
        },
        { new: true, upsert: true },
      );
    }

    console.log('New product basic info created: ', newProduct);
    return newProduct?.productId;
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
    const { sizeGuidance } = createProductDto;
    const _sizeList: ProductSizeGuidanceDto[] = JSON.parse(sizeGuidance);
    if (!_sizeList) {
      console.log('No size list! for ', productId);
      return;
    }
    const tobeInserted = _sizeList.map((size: ProductSizeGuidanceDto) => {
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
        price: dataRow.price,
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

  async updateProductBasicInfo(
    productId: string,
    productName: string,
    categoryId: string,
  ) {
    const productSlug = slugify(productName, slugifyOption);

    const newBasicInfo = await this.productModel.findOneAndUpdate(
      { productId },
      {
        name: productName,
        slug: productSlug,
        categoryId: categoryId,
        isDrafted: false,
      },
      { new: true },
    );

    if (!newBasicInfo) {
      console.log('Product basic info update failed!');
      throw new InternalServerErrorException(
        'Product basic info update failed!',
      );
    }
  }
  async updateProductDescription(productId: string, description: string) {
    const _newDescription = await this.productDescriptionModel.findOneAndUpdate(
      { productId: productId },
      {
        description: description,
      },
    );
    console.log('Product description updated: ', _newDescription);
    if (!_newDescription) {
      console.log('Product basic info update failed!');
      throw new InternalServerErrorException(
        'Product description update failed!',
      );
    }
    return _newDescription;
  }
  async updateProductSizeGuidance(
    productId: string,
    sizeGuidanceList: ProductSizeGuidanceDto[],
  ) {
    const tobeInserted = sizeGuidanceList.map(
      (size: ProductSizeGuidanceDto) => {
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
      },
    );
    //delete old
    await this.productSizeModel.deleteMany({ productId });
    const response = await this.productSizeModel.insertMany(tobeInserted);
    console.log('Product size updated: ', response);
    return response;
  }
  async updateProductProperty(
    productId: string,
    propertyList: ProductPropertyDto[],
  ) {
    const tobeInserted: ProductPropertyDto[] = propertyList.map((property) => ({
      productId,
      name: property.name,
      value: property.value,
    }));
    await this.productPropertyModel.deleteMany({ productId });
    const response = await this.productPropertyModel.insertMany(tobeInserted);
    console.log('Product property updated: ', response);
    return response;
  }
  async updateProductVariantDetailList(
    productId: string,
    variantDetailList: ProductVariantDetailDto[],
  ) {
    const promises = variantDetailList.map(async (variantDetail) => {
      const newVariantDetail: ProductVariantDetailDto = {
        ...variantDetail,
      };
      return await this.productVariantModel.findOneAndUpdate(
        { variantId: newVariantDetail.variantId },
        {
          ...newVariantDetail,
        },
      );
    });
    await Promise.all(promises);
  }

  async deleteVariantAndOptionOfProduct(productId: string) {
    const options = await this.productOptionModel
      .find({ productId })
      .select('variantId optionId')
      .lean();
    const variantIdList = options.map((option) => option.variantId);
    const optionIdList = options.map((option) => option.optionId);
    await this.productVariantModel.deleteMany({
      variantId: { $in: variantIdList },
    });
    await this.variantOptionModel.deleteMany({
      variantId: { $in: optionIdList },
    });
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
    if (!minPrice) {
      console.log('ERROR AT: ', productId);
    }
    let allColors = Array.from(_allColors);
    let allSizes = Array.from(_allSizes);
    let categoryName = await this.categoryService.getCategoryDetail(
      product.productId,
    );

    //denormalize properties and description
    let propertyList = await this.productPropertyModel
      .find({ productId })
      .select('value')
      .lean();
    const description = await this.productDescriptionModel.findOne({
      productId,
    });

    let propertyString = '';
    for (const property of propertyList) {
      propertyString = propertyString.concat(property.value.toString() + ' ');
    }
    let descriptionString = extractSearchableText(
      description?.description || '',
    );
    const newProduct = await this.productModel.findOneAndUpdate(
      { productId },
      {
        minPrice,
        totalStock,
        allColors,
        allSizes,
        categoryName,
        propertyString,
        descriptionString,
      },
      { new: true },
    );

    // Create search_index embedding after denormalization
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
