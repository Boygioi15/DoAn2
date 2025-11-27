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
  async buildProductQuery(filters: {
    role?: string;
    categoryId?: string;
    priceMin?: number;
    priceMax?: number;
    search?: string;
  }) {
    const { role, categoryId, priceMin, priceMax, search } = filters;
    const q: any = {};
    if (search) {
      q.$text = { $search: search };
    }
    if (categoryId) q.categoryId = categoryId;
    if (priceMin) q.minPrice.$gte = priceMin;
    if (priceMax) q.minPrice.$lte = priceMax;

    if (role === 'CLIENT') {
      q.isDeleted = false;
      q.isPublished = true;
      q.isDrafted = false;
      q.totalStock = { $gt: 0 };
    }

    return q;
  }
  async getAllProduct({ role, filters, sort, pagination }) {
    //filter => sort => pagination
    const query = await this.buildProductQuery({ role, ...filters });
    console.log('Query object: ', query);
    let sortObj: any = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortObj = {
        [field]: order === 'desc' ? -1 : 1,
      };
    }
    const skip = (pagination.from - 1) * pagination.size;
    console.log('P: ', pagination);
    let [basicProductInfo, total] = await Promise.all([
      this.productModel
        .find(query)
        .skip(skip)
        .limit(Number(pagination.size))
        .sort(sortObj),
      this.productModel.countDocuments(query),
    ]);
    if (role === 'ADMIN') {
      const productListPromises = basicProductInfo.map(async (product) => {
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
      let productList = await Promise.all(productListPromises);
      return { data: productList, total };
    } else {
      const productListPromises = basicProductInfo.map(async (product) => {
        const { minPrice } = await this.getProductSellingPrice(product);
        const totalStock = await this.getProductTotalStock(product);

        let allProductVariants = await this.getAllVariantsOfProduct(product);
        allProductVariants = allProductVariants.filter(
          (variant) => variant.isInUse && variant.isOpenToSale,
        );
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
          isPublished: product.isPublished,
          isDrafted: product.isDrafted,
          isDeleted: product.isDeleted,
        };
      });
      let productList = await Promise.all(productListPromises);
      return { data: productList, total };
    }
  }

  /////get block
  // async getAllProduct_ItemManagement() {
  //   const basicProductInfo = await this.productModel.find();
  //   const productListPromises = basicProductInfo.map(async (product) => {
  //     const { minPrice, maxPrice } = await this.getProductSellingPrice(product);
  //     return {
  //       productId: product.productId,
  //       thumbnailURL: product.display_thumbnail_image,
  //       name: product.name,
  //       categoryName:
  //         (await this.getProductCategoryName(product)) || 'Không có dữ liệu',
  //       sku: product.sku,
  //       sellingPriceBot: minPrice,
  //       sellingPriceTop: maxPrice,
  //       inStorageTotal: await this.getProductTotalStock(product),
  //       isPublished: product.isPublished,
  //       isDrafted: product.isDrafted,
  //       isDeleted: product.isDeleted,
  //     };
  //   });
  //   const productList = await Promise.all(productListPromises);
  //   return productList;
  // }
  // async getAllProduct_Client() {
  //   const basicProductInfo = await this.productModel.find();
  //   const productListPromises = basicProductInfo.map(async (product) => {
  //     const { minPrice } = await this.getProductSellingPrice(product);
  //     const totalStock = await this.getProductTotalStock(product);

  //     let allProductVariants = await this.getAllVariantsOfProduct(product);
  //     allProductVariants = allProductVariants.filter(
  //       (variant) => variant.isInUse && variant.isOpenToSale,
  //     );
  //     let optionData: any = [];
  //     for (const variant of allProductVariants) {
  //       const exists = optionData.find((o) => o.optionId === variant.optionId1);
  //       if (!exists) {
  //         optionData.push({
  //           optionId: variant.optionId1,
  //           optionName: variant.optionName1,
  //           optionValue: variant.optionValue1,
  //           optionImage: variant.optionImage1[0],
  //         });
  //       }
  //     }

  //     return {
  //       productId: product.productId,
  //       thumbnailURL: product.display_thumbnail_image,
  //       name: product.name,
  //       categoryName:
  //         (await this.getProductCategoryName(product)) || 'Không có dữ liệu',
  //       displayedPrice: minPrice,
  //       optionData,
  //       totalStock,
  //       isPublished: product.isPublished,
  //       isDrafted: product.isDrafted,
  //       isDeleted: product.isDeleted,
  //     };
  //   });
  //   let productList = await Promise.all(productListPromises);
  //   productList = productList.filter(
  //     (product) =>
  //       product.totalStock > 0 &&
  //       product.isPublished &&
  //       !product.isDrafted &&
  //       !product.isDeleted,
  //   );
  //   return productList;
  // }

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
    const categoryName = await this.categoryService.getCategoryDetail(
      product.categoryId,
    );
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
