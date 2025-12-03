import {
  BadGatewayException,
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

  //filter
  async buildQueryPipeline(
    role: string,
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
    console.log('F: ', filters);
    console.log('P: ', pagination);
    const queryPipeline: any = [];
    if (search) {
      queryPipeline.push({
        $search: {
          index: 'search_index',
          text: {
            query: search,
            path: 'name',
          },
        },
      });
    }
    if (role === 'CLIENT') {
      queryPipeline.push({
        $match: {
          isDeleted: false,
          isPublished: true,
          isDrafted: false,
          totalStock: { $gt: 0 },
        },
      });
    }
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
    let catId = filters.categoryId;
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

    const queryPipeline: any = await this.buildQueryPipeline(
      role,
      filters,
      pagination,
      sortBy,
    );
    console.log('Query object: ', queryPipeline);

    //console.log('P: ', pagination);
    let result: any = await this.productModel.aggregate(queryPipeline);

    // .sort(sortObj),
    console.log('Result: ', result);
    const productList = result[0].productList;
    // console.log('T: ', totalItem);
    // console.log('PL: ', productList);
    const metadata1 = result[0].stage1ComputedResults;
    const metadata2 = result[0].stage2ComputedResults;
    // const metadata1 = result[0].stage1ComputedResults;
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
        data: _productList,
        metadata: { ...metadata1[0], ...metadata2 },
      };
    } else {
      //all color & sizes
      const productListPromises = productList.map(async (product) => {
        //price
        const { minPrice } = await this.getProductSellingPrice(product);
        let allProductVariants = await this.getAllVariantsOfProduct(product);
        allProductVariants = allProductVariants.filter(
          (variant) => variant.isInUse && variant.isOpenToSale,
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
      return {
        productList: _productList,
        metadata: { ...metadata1[0], ...metadata2 },
      };
    }
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
          optionImage1: '$option1.image',
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
    // console.log('All variants: ', variants);
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
      .find({ productId: productId })
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
    const propertyListDb = await this.getProductPropertyList(product);
    const propertyList = propertyListDb.map((property) => ({
      name: property.name,
      value: property.value,
    }));
    const descriptionDb = await this.getProductDescription(product);
    const description = descriptionDb?.description;
    let allProductVariants = await this.getAllVariantsOfProduct(product);
    allProductVariants = allProductVariants.filter(
      (variant) => variant.isInUse && variant.isOpenToSale,
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
      description: JSON.stringify(description),
      allProductVariants,
      optionData,
      isOutOfStock: totalStock === 0,
    };
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
