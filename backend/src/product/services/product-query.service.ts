import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateProductDto } from '../dto/product.dto';
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
import {
  ProductEmbedding,
  ProductEmbeddingDocument,
} from 'src/database/schemas/product_embedding.schema';
import { Model } from 'mongoose';
import { slugifyOption } from 'src/constants';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CategoryService } from 'src/category/category.service';
import { ProductEmbeddingService } from './product-embedding.service';
import { filter } from 'rxjs';

type FilterObject = {
  categoryId: string | null;
  price: {
    min: number;
    max: number;
  };
};
@Injectable()
export class ProductQueryService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly categoryService: CategoryService,
    private readonly productEmbeddingService: ProductEmbeddingService,
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
    @InjectModel(ProductSizeGuidance.name)
    private readonly productSizeGuidanceModel: Model<ProductSizeGuidanceDocument>,
    @InjectModel(ProductDescription.name)
    private readonly productDescriptionModel: Model<ProductDescriptionDocument>,
    @InjectModel(ProductEmbedding.name)
    private readonly productEmbeddingModel: Model<ProductEmbeddingDocument>,
  ) {}

  //filter
  async buildAdminQueryPipeline(
    filter: {
      queryProductName: string;
      queryCategoryName: string;
      queryProductSku: string;
      productTab: string;
      stockState: string;
      categoryId: string;
    },
    pagination: {
      from: number;
      size: number;
    },
    sortBy: string,
  ) {
    const {
      queryProductName,
      queryCategoryName,
      queryProductSku,
      productTab,
      stockState,
      categoryId,
    } = filter;
    const { from, size } = pagination;
    // console.log('F: ', filters);
    // console.log('P: ', pagination);
    const queryPipeline: any = [];

    const matchStage: any = {};
    if (queryProductName) {
      matchStage.name = {
        $regex: queryProductName.trim(),
        $options: 'i',
      };
    }
    if (queryCategoryName) {
      matchStage.categoryName = {
        $regex: queryCategoryName.trim(),
        $options: 'i',
      };
    }
    if (queryProductSku) {
      matchStage.sku = {
        $regex: queryProductSku.trim(),
        $options: 'i',
      };
    }
    if (productTab) {
      if (productTab === 'all') {
        matchStage.isDeleted = false;
      }
      if (productTab === 'published') {
        matchStage.isPublished = true;
        matchStage.isDrafted = false;
        matchStage.isDeleted = false;
      } else if (productTab === 'not-published') {
        matchStage.isPublished = false;
        matchStage.isDrafted = false;
        matchStage.isDeleted = false;
      } else if (productTab === 'draft') {
        matchStage.isPublished = false;
        matchStage.isDrafted = true;
        matchStage.isDeleted = false;
      } else if (productTab === 'deleted') {
        matchStage.isDeleted = true;
      }
    }
    if (stockState) {
      if (stockState === '1') {
        matchStage.totalStock = { $eq: 0 };
      } else if (stockState === '0') {
        matchStage.totalStock = { $gt: 0 };
      }
    }
    if (categoryId) {
      matchStage.categoryId = categoryId;
    }
    //sort
    const sortObj: any = {};

    if (sortBy === 'newest') sortObj.createdAt = -1;
    if (sortBy === 'alphabetical-az') sortObj.name = -1;
    if (sortBy === 'alphabetical-za') sortObj.name = 1;

    //pagination:
    const skip = (Number(from) - 1) * size;

    if (Object.keys(matchStage).length > 0) {
      queryPipeline.push({ $match: matchStage });
    }
    if (Object.keys(sortObj).length > 0) {
      queryPipeline.push({
        $facet: {
          productList: [
            { $sort: sortObj },
            { $skip: skip },
            { $limit: Number(size) },
          ],
          total: [{ $count: 'count' }],
        },
      });
    } else {
      queryPipeline.push({
        $facet: {
          productList: [{ $skip: skip }, { $limit: Number(size) }],
          total: [{ $count: 'count' }],
        },
      });
    }
    queryPipeline.push({ $match: {} });
    return queryPipeline;
  }

  async buildClientQueryPipeline(
    filters: {
      search?: string;
      categoryIdList?: string;

      colorList?: string;
      sizeList?: string;

      priceMin?: number;
      priceMax?: number;
    },
    pagination: {
      from: number;
      size: number;
    },
    sortBy: string,
  ) {
    const { categoryIdList, colorList, sizeList, priceMin, priceMax, search } =
      filters;
    const { from, size } = pagination;
    // console.log('F: ', filters);
    // console.log('P: ', pagination);
    const queryPipeline: any = [];
    // if (search) {
    //   queryPipeline.push({
    //     $search: {
    //       index: 'search_index',
    //       text: {
    //         query: search,
    //         path: [
    //           'name',
    //           'categoryName',
    //           'descriptionString',
    //           'propertyString',
    //         ],
    //       },
    //     },
    //   });
    // }
    if (search) {
      queryPipeline.push({
        $match: {
          $text: {
            $search: search,
          },
        },
      });
    }
    queryPipeline.push({
      $match: {
        isDeleted: false,
        isPublished: true,
        isDrafted: false,
        totalStock: { $gt: 0 },
      },
    });

    if (categoryIdList) {
      queryPipeline.push({
        $match: {
          categoryId: {
            $in: categoryIdList,
          },
        },
      });
    }
    //facet stage -- end of stage 1
    queryPipeline.push({
      $facet: {
        stage1ComputedResults: [
          {
            $group: {
              _id: null,
              allColors: {
                $addToSet: '$allColors',
              },
              allSizes: {
                $addToSet: '$allSizes',
              },
              minPrice: {
                $min: '$minPrice',
              },
              maxPrice: {
                $max: '$minPrice',
              },
              totalItem1: { $sum: 1 },
            },
          },
          {
            $project: {
              allColors: {
                $reduce: {
                  input: '$allColors',
                  initialValue: [],
                  in: {
                    $concatArrays: ['$$value', '$$this'],
                  },
                },
              },
              allSizes: {
                $reduce: {
                  input: '$allSizes',
                  initialValue: [],
                  in: {
                    $concatArrays: ['$$value', '$$this'],
                  },
                },
              },
              minPrice: 1,
              maxPrice: 1,
              totalItem1: 1,
            },
          },
          {
            $project: {
              allColors: {
                $setUnion: ['$allColors', []],
              },
              allSizes: {
                $setUnion: ['$allSizes', []],
              },
              minPrice: 1,
              maxPrice: 1,
              totalItem1: 1,
            },
          },
        ],
        stage1ArrayResults: [
          {
            $replaceRoot: {
              newRoot: '$$ROOT',
            },
          },
        ],
      },
    });
    let _colorList: any = [],
      _sizeList: any = [];
    if (colorList) _colorList = colorList.split(',');
    if (sizeList) _sizeList = sizeList.split(',');

    const colorFilter =
      _colorList && _colorList.length > 0
        ? {
            $gt: [
              {
                $size: {
                  $setIntersection: ['$$p.allColors', _colorList],
                },
              },
              0,
            ],
          }
        : true; // if no colors, always true

    const sizeFilter =
      _sizeList && _sizeList.length > 0
        ? {
            $gt: [
              {
                $size: {
                  $setIntersection: ['$$p.allSizes', _sizeList],
                },
              },
              0,
            ],
          }
        : true;
    const priceFilterBot = priceMin
      ? {
          $gte: ['$$p.minPrice', Number(priceMin)],
        }
      : true;
    const priceFilterTop = priceMax
      ? {
          $lte: ['$$p.minPrice', Number(priceMax)],
        }
      : true;
    const sortObj: any = {};
    if (sortBy) {
      if (sortBy === 'newest') {
        sortObj.createdAt = -1;
      }
      if (sortBy === 'alphabetical-az') {
        sortObj.name = -1;
      }
      if (sortBy === 'alphabetical-za') {
        sortObj.name = 1;
      }
      if (sortBy === 'price-asc') {
        sortObj.minPrice = 1;
      }
      if (sortBy === 'price-desc') {
        sortObj.minPrice = -1;
      }
    }
    //stage2 result -- append sort
    queryPipeline.push({
      $project: {
        stage1ComputedResults: 1,
        productList: {
          $filter: {
            input: '$stage1ArrayResults',
            as: 'p',
            cond: {
              $and: [colorFilter, sizeFilter, priceFilterBot, priceFilterTop],
            },
          },
        },
      },
    });
    //stage2 result -- append sort

    if (sortBy) {
      queryPipeline.push({
        $project: {
          stage1ComputedResults: 1,
          productList: {
            $sortArray: {
              input: '$productList',
              sortBy: sortObj,
            },
          },
        },
      });
    }
    //stage 2 computed result
    queryPipeline.push({
      $project: {
        stage1ComputedResults: 1,
        productList: 1,
        stage2ComputedResults: {
          totalItem2: { $size: '$productList' },
        },
      },
    });
    const skip = (Number(from) - 1) * size;

    //pagination:
    queryPipeline.push({
      $project: {
        stage1ComputedResults: 1,
        productList: { $slice: ['$productList', skip, Number(size)] },
        stage2ComputedResults: 1,
      },
    });
    queryPipeline.push({
      $match: {},
    });
    return queryPipeline;
  }
  // category handling
  async getAllProductWrapper({ role, filters, sortBy, pagination }) {
    if (!filters.categoryId) {
      return this.getAllProduct({
        role,
        filters,
        sortBy,
        pagination,
      });
    }
    // console.log('FI: ', filters.categoryId);
    let catId = filters.categoryId;
    console.log('CID: ', catId);
    const catDetail = await this.categoryService.getCategoryDetail(catId);
    if (!catDetail) {
      throw new InternalServerErrorException(
        'Không tồn tại danh mục tương ứng',
      );
    }
    const lv = catDetail.categoryLevel;
    if (lv === 1) {
      throw new BadGatewayException(
        'Hệ thống chưa hỗ trợ lấy sản phẩm danh mục cấp độ 1',
      );
    }
    if (lv === 2) {
      let cat3List =
        await this.categoryService.getAllDirectChildrenOfCategory(catId);
      let cat3IdList = cat3List.map((cat3) => cat3.categoryId);
      let _filters = { ...filters, categoryIdList: cat3IdList };
      return this.getAllProduct({
        role,
        filters: _filters,
        sortBy,
        pagination,
      });
    }
    if (lv === 3) {
      let _filters = { ...filters, categoryIdList: [catId] };
      return this.getAllProduct({
        role,
        filters: _filters,
        sortBy,
        pagination,
      });
    } else {
      throw new InternalServerErrorException(
        'Hệ thống không hỗ trợ ngoài danh mục cấp 1,2,3',
      );
    }
  }
  async getAllProduct({ role, filters, sortBy, pagination }) {
    //filter => sort => pagination
    console.log('Filters: ', filters);
    let queryPipeline: any;
    if (role === 'CLIENT') {
      queryPipeline = await this.buildClientQueryPipeline(
        filters,
        pagination,
        sortBy,
      );
    } else if (role === 'ADMIN') {
      queryPipeline = await this.buildAdminQueryPipeline(
        filters,
        pagination,
        sortBy,
      );
    }

    console.log('Query pipeline: ', queryPipeline);

    //console.log('P: ', pagination);
    let result: any = await this.productModel.aggregate(queryPipeline);

    // .sort(sortObj),
    const productList = result[0].productList;

    //admin
    // console.log('Result: ', result[0]);
    let totalItemAdmin = 0;
    if (role === 'ADMIN' && result[0].productList.length > 0) {
      totalItemAdmin = result[0].total[0].count;
    }
    // console.log('T: ', totalItem);
    console.log('PL: ', productList.slice(0, 5));
    const metadata1 = result[0].stage1ComputedResults;
    const metadata2 = result[0].stage2ComputedResults;
    // const metadata1 = result[0].stage1ComputedResults;

    ////JOIN MORE DATA
    if (role === 'ADMIN') {
      const productListPromises = productList.map(async (product) => {
        const { minPrice, maxPrice } =
          await this.getProductSellingPrice(product);
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
      let _productList = await Promise.all(productListPromises);
      return {
        productList: _productList,
        metadata: { totalItem: totalItemAdmin },
      };
    } else {
      console.log('Go to this branch');
      //all color & sizes
      const productListPromises = productList.map(async (product) => {
        try {
          console.log('Processing product:', product.productId);
          //price
          const { minPrice } = await this.getProductSellingPrice(product);
          console.log('Got price for:', product.productId);
          let allProductVariants = await this.getAllVariantsOfProduct(product);
          console.log(
            'Got variants for:',
            product.productId,
            'count:',
            allProductVariants.length,
          );
          // console.log('APV: ', allProductVariants);
          allProductVariants = allProductVariants.filter(
            (variant) => variant.isOpenToSale,
          );
          //option data
          let optionData: any = [];
          for (const variant of allProductVariants) {
            const exists = optionData.find(
              (o) => o.optionId === variant.optionId1,
            );
            if (!exists) {
              optionData.push({
                optionId: variant.optionId1,
                optionName: variant.optionName1,
                optionValue: variant.optionValue1,
                optionImage: variant.optionImage1[0],
              });
            }
          }
          const categoryName = await this.getProductCategoryName(product);
          console.log('Got category for:', product.productId);
          return {
            productId: product.productId,
            thumbnailURL: product.display_thumbnail_image,
            name: product.name,
            categoryName: categoryName || 'Không có dữ liệu',
            displayedPrice: minPrice,
            optionData,
          };
        } catch (error) {
          console.error('Error processing product:', product.productId, error);
          throw error;
        }
      });
      console.log(
        'Starting Promise.all with',
        productListPromises.length,
        'promises',
      );
      let _productList = await Promise.all(productListPromises);
      console.log('PLFinal: ', _productList.slice(0, 5));

      return {
        productList: _productList,
        metadata: { ...metadata1[0], ...metadata2 },
      };
    }
  }

  async getProductCategoryName(product: ProductDocument) {
    const { categoryId } = product;
    const category = await this.categoryService.getCategoryDetail(categoryId);
    return category?.categoryName;
  }
  async getAllVariantsOfProduct(product: ProductDocument) {
    const { productId } = product;
    const startTime = Date.now();
    console.log(`[getAllVariantsOfProduct] Starting for product: ${productId}`);

    // OPTIMIZED: First get the variant IDs for this product (much faster)
    const t1 = Date.now();
    const productOptions = await this.productOptionModel
      .find({ productId })
      .select('variantId optionId')
      .lean();
    console.log(
      `[getAllVariantsOfProduct] Step 1 - Got productOptions: ${productOptions.length} items in ${Date.now() - t1}ms`,
    );

    if (!productOptions || productOptions.length === 0) {
      console.log(
        `[getAllVariantsOfProduct] No product options found, returning empty`,
      );
      return [];
    }

    const variantIds = [...new Set(productOptions.map((po) => po.variantId))];
    const optionIds = [...new Set(productOptions.map((po) => po.optionId))];
    console.log(
      `[getAllVariantsOfProduct] Found ${variantIds.length} variants, ${optionIds.length} options`,
    );

    // Get all variants and options in parallel
    const t2 = Date.now();
    const [variants, options] = await Promise.all([
      this.productVariantModel.find({ variantId: { $in: variantIds } }).lean(),
      this.variantOptionModel.find({ optionId: { $in: optionIds } }).lean(),
    ]);
    console.log(
      `[getAllVariantsOfProduct] Step 2 - Parallel fetch complete: ${variants.length} variants, ${options.length} options in ${Date.now() - t2}ms`,
    );

    // Create option map for fast lookup
    const optionMap = new Map(options.map((opt) => [opt.optionId, opt]));

    // Build result by mapping variants with their options
    const t3 = Date.now();
    const result = variants.map((variant) => {
      const variantOptions = productOptions
        .filter((po) => po.variantId === variant.variantId)
        .map((po) => optionMap.get(po.optionId))
        .filter((opt) => opt !== undefined)
        .sort((a, b) => (a.index || 0) - (b.index || 0));

      const option1 = variantOptions[0];
      const option2 = variantOptions[1];

      return {
        variantId: variant.variantId,
        price: variant.price,
        stock: variant.stock,
        isOpenToSale: variant.isOpenToSale,
        seller_sku: variant.seller_sku,
        platform_sku: variant.platform_sku,
        optionId1: option1?.optionId,
        optionName1: option1?.name,
        optionValue1: option1?.value,
        optionImage1: option1?.image,
        optionId2: option2?.optionId,
        optionName2: option2?.name,
        optionValue2: option2?.value,
      };
    });
    console.log(
      `[getAllVariantsOfProduct] Step 3 - Result mapping done in ${Date.now() - t3}ms`,
    );
    console.log(
      `[getAllVariantsOfProduct] TOTAL TIME: ${Date.now() - startTime}ms for product ${productId}`,
    );

    return result;
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
    // console.log('All product options: ', allOptions);
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
      .find({
        productId: productId,
      })
      .select('name value')
      .lean();
    // console.log('Property list: ', data);
    return data;
  }
  async getProductDescription(product: ProductDocument) {
    const { productId } = product;
    const data = await this.productDescriptionModel
      .findOne({ productId: productId })
      .lean();
    // console.log('Description: ', data);
    return data;
  }
  async getProductSizeGuidance(product: ProductDocument) {
    const { productId } = product;
    const data = await this.productSizeGuidanceModel
      .find({
        productId: productId,
      })
      .select('name fit')
      .lean();
    // console.log('Size guidance: ', data);
    return data;
  }
  //get detail
  async getProductDetail_Admin(productId: string) {
    const product = await this.productModel.findOne({ productId: productId });
    if (!product) {
      throw new InternalServerErrorException('Product not found!');
    }
    const propertyList = await this.getProductPropertyList(product);
    const sizeGuidance = await this.getProductSizeGuidance(product);
    const descriptionDb = await this.getProductDescription(product);
    const description = descriptionDb?.description;
    const options = await this.getAllProductOptions(product);
    let optionsGrouped = this.groupOptions(options);
    const v1 = optionsGrouped.find((grouped: any) => grouped.index === 0);
    const v2 = optionsGrouped.find((grouped: any) => grouped.index === 1);
    const variantDetailList = await this.getAllVariantsOfProduct(product);
    return {
      productId: product.productId,
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId,
      thumbnailURL: product.display_thumbnail_image,
      propertyList: propertyList,
      sizeGuidance,
      description: description,
      variant1: v1,
      variant2: v2,
      variantDetailList,
      isPublished: product.isPublished,
      isDrafted: product.isDrafted,
      isDeleted: product.isDeleted,
    };
  }
  async getProductDetail_Client(productId: string) {
    const product = await this.productModel.findOne({ productId: productId });
    if (!product) {
      throw new InternalServerErrorException('Product not found!');
    }
    const category = await this.categoryService.getCategoryDetail(
      product.categoryId,
    );
    if (!category) {
      throw new InternalServerErrorException('Không có category tương ứng!');
    }
    const categoryName = category.categoryName;
    const propertyList = await this.getProductPropertyList(product);
    const sizeGuidance = await this.getProductSizeGuidance(product);
    const descriptionDb = await this.getProductDescription(product);
    const description = descriptionDb?.description;
    let allProductVariants = await this.getAllVariantsOfProduct(product);
    allProductVariants = allProductVariants.filter(
      (variant) => variant.isOpenToSale,
    );
    let optionData: any = [];
    const totalStock = await this.getProductTotalStock(product);
    for (const variant of allProductVariants) {
      const exists = optionData.find((o) => o.optionId === variant.optionId1);
      if (!exists) {
        optionData.push({
          optionId: variant.optionId1,
          optionName: variant.optionName1,
          optionValue: variant.optionValue1,
          optionImage: variant.optionImage1,
        });
      }
    }
    optionData = optionData.map((option1) => {
      let allAssociatedOption2 = allProductVariants
        .filter((variant) => variant.optionId1 === option1.optionId)
        .map((variant) => ({
          optionId: variant.optionId2,
          optionName: variant.optionName2,
          optionValue: variant.optionValue2,
        }));
      // console.log('ASS: ', allAssociatedOption2);
      return {
        ...option1,
        subOption: allAssociatedOption2,
      };
    });
    return {
      name: product.name,
      categoryName: categoryName,
      thumbnailURL: product.display_thumbnail_image,
      sku: product.sku,
      propertyList: JSON.stringify(propertyList),
      sizeGuidance: JSON.stringify(sizeGuidance),
      description: JSON.stringify(description),
      allProductVariants,
      optionData,
      isOutOfStock: totalStock === 0,
    };
  }

  async checkAndGetIfProductAndVariantExisted(
    productId: string,
    variantId: string,
  ) {
    let product = await this.productModel.findOne({ productId });
    let variant = await this.productVariantModel.findOne({ variantId });
    const linked = await this.productOptionModel.findOne({
      productId,
      variantId,
    });
    if (!linked) {
      throw new InternalServerErrorException(
        'Product and variant exist, but not linked!',
      );
    }
    if (!product || !variant) {
      throw new BadRequestException(
        'Không tồn tại sản phẩm hoặc biến thể tương ứng!',
      );
    }
    let _product = await this.getProductDetail_Admin(productId);
    let _variant = await _product.variantDetailList.find(
      (variant) => variant.variantId === variantId,
    );
    return { product: _product, variant: _variant };
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

  /**
   * Search products by image using MongoDB Atlas Vector Search
   * Uses pre-computed embeddings from product_embedding collection
   */
  async searchByImage(
    file: Express.Multer.File,
    size: number,
    threshold: string,
  ): Promise<any[]> {
    const thresholdMap = {
      low: 0.4,
      medium: 0.6,
      high: 0.8,
    };
    try {
      // Step 1: Generate embedding from the uploaded image
      const imageEmbedding =
        await this.productEmbeddingService.generateEmbeddingFromImage(file);

      if (!imageEmbedding || imageEmbedding.length === 0) {
        console.log('Failed to generate embedding from image');
        return [];
      }

      // Step 2: Use MongoDB Atlas Vector Search to find similar products
      const vectorSearchResults = await this.productEmbeddingModel.aggregate([
        {
          $vectorSearch: {
            index: 'default', // Name of your vector search index
            path: 'embedding',
            queryVector: imageEmbedding,
            numCandidates: 1000, // Number of candidates to consider
            limit: 1000,
          },
        },
        {
          $project: {
            productId: 1,
            score: { $meta: 'vectorSearchScore' },
          },
        },
        { $sort: { score: -1 } },
        {
          // Step 2: apply threshold
          $match: {
            score: { $gte: thresholdMap[threshold] },
          },
        },
        {
          $limit: 10,
        },
        {
          $match: {},
        },
      ]);

      if (!vectorSearchResults || vectorSearchResults.length === 0) {
        console.log('No similar products found via vector search');
        return [];
      }
      console.log('search result list: ', vectorSearchResults);

      // Step 3: Get product details for matched products
      const productIds = vectorSearchResults.map((r) => r.productId);

      const products = await this.productModel.find({
        productId: { $in: productIds },
        isDeleted: false,
        isPublished: true,
        isDrafted: false,
      });

      const productListPromises = products.map(async (product) => {
        //price
        const { minPrice } = await this.getProductSellingPrice(product);
        let allProductVariants = await this.getAllVariantsOfProduct(product);
        // console.log('APV: ', allProductVariants);
        allProductVariants = allProductVariants.filter(
          (variant) => variant.isOpenToSale,
        );
        //option data
        let optionData: any = [];
        for (const variant of allProductVariants) {
          const exists = optionData.find(
            (o) => o.optionId === variant.optionId1,
          );
          if (!exists) {
            optionData.push({
              optionId: variant.optionId1,
              optionName: variant.optionName1,
              optionValue: variant.optionValue1,
              optionImage: variant.optionImage1[0],
            });
          }
        }
        return {
          productId: product.productId,
          thumbnailURL: product.display_thumbnail_image,
          name: product.name,
          categoryName:
            (await this.getProductCategoryName(product)) || 'Không có dữ liệu',
          displayedPrice: minPrice,
          optionData,
        };
      });
      let _productList = await Promise.all(productListPromises);
      return _productList;
    } catch (error) {
      console.error('Error searching by image:', error);
      // Fallback to in-memory cosine similarity if vector search fails
      return this.searchByImageFallback(file, size);
    }
  }

  /**
   * Fallback search using in-memory cosine similarity
   * Used when MongoDB Atlas Vector Search is not available
   */
  private async searchByImageFallback(
    file: Express.Multer.File,
    limit: number = 10,
  ): Promise<any[]> {
    try {
      const imageEmbedding =
        await this.productEmbeddingService.generateEmbeddingFromImage(file);

      if (!imageEmbedding || imageEmbedding.length === 0) {
        return [];
      }

      const productEmbeddings = await this.productEmbeddingModel
        .find({
          isEmbedded: true,
          embedding: { $exists: true, $ne: [] },
        })
        .select('productId embedding')
        .lean();

      if (!productEmbeddings || productEmbeddings.length === 0) {
        return [];
      }

      const similarities = productEmbeddings
        .map((pe) => ({
          productId: pe.productId,
          similarity: this.cosineSimilarity(imageEmbedding, pe.embedding),
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      const topProductIds = similarities.map((s) => s.productId);
      const products = await this.productModel
        .find({
          productId: { $in: topProductIds },
          isDeleted: false,
          isPublished: true,
          isDrafted: false,
        })
        .select(
          'productId name slug display_thumbnail_image minPrice totalStock allColors allSizes',
        )
        .lean();

      const productMap = new Map(products.map((p) => [p.productId, p]));
      return similarities
        .map((s) => {
          const product = productMap.get(s.productId);
          if (!product) return null;
          return {
            ...product,
            similarity: s.similarity,
          };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null);
    } catch (error) {
      console.error('Error in fallback search:', error);
      return [];
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length || vecA.length === 0) {
      return 0;
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      magnitudeA += vecA[i] * vecA[i];
      magnitudeB += vecB[i] * vecB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }
}
