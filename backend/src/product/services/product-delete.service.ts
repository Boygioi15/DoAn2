import { Injectable } from '@nestjs/common';
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
import {
  ProductEmbedding,
  ProductEmbeddingDocument,
} from 'src/database/schemas/product_embedding.schema';
@Injectable()
export class ProductDeleteService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(ProductVariant.name)
    private readonly productVariantModel: Model<ProductVariantDocument>,
    @InjectModel(VariantOption.name)
    private readonly variantOptionModel: Model<VariantOptionDocument>,
    @InjectModel(Product_Option.name)
    private readonly productOptionModel: Model<Product_OptionDocument>,
    @InjectModel(ProductSizeGuidance.name)
    private readonly productSizeGuidanceModel: Model<ProductSizeGuidanceDocument>,
    @InjectModel(ProductProperty.name)
    private readonly productPropertyModel: Model<ProductPropertyDocument>,
    @InjectModel(ProductDescription.name)
    private readonly productDescriptionModel: Model<ProductDescriptionDocument>,
    @InjectModel(ProductEmbedding.name)
    private readonly productEmbeddingModel: Model<ProductEmbeddingDocument>,
  ) {}
  async deleteProductData(
    productId: string,
    deleteVariantData: boolean = true,
  ) {
    //to be deleted:

    //basic info
    let p1, p2, p3, p4, p5, p6, p7;
    p1 = this.productModel.findOneAndDelete({ productId });
    //property
    p2 = this.productPropertyModel.deleteMany({ productId });
    //description
    p3 = this.productDescriptionModel.findOneAndDelete({ productId });
    //size guidance
    p4 = this.productSizeGuidanceModel.deleteMany({ productId });

    if (deleteVariantData) {
      //all links
      const allLinks = await this.productOptionModel.find({ productId });
      const allVariants = allLinks.map((link) => link.variantId);
      const allOptions = allLinks.map((link) => link.optionId);
      //option
      p5 = this.productVariantModel.deleteMany({
        variantId: { $in: allVariants },
      });
      //variant
      p6 = this.variantOptionModel.deleteMany({
        optionId: { $in: allOptions },
      });
      p7 = this.productOptionModel.deleteMany({ productId });
      await Promise.all([p1, p2, p3, p4, p5, p6, p7]);
    } else {
      await Promise.all([p1, p2, p3, p4]);
    }

    console.log('Delete item ', productId, ' successfully');
    return true;
    //variant option
  }
  async softDeleteProduct(productId: string) {
    const result = await this.productModel.findOneAndUpdate(
      { productId },
      { isDeleted: true },
    );
    return result;
  }
  async restoreProduct(productId: string) {
    const result = await this.productModel.findOneAndUpdate(
      { productId },
      { isDeleted: false, isPublished: false },
    );
    // console.log(result);
    return result;
  }
  async resetAllProductData() {
    await this.productModel.deleteMany();
    await this.productOptionModel.deleteMany();
    await this.productVariantModel.deleteMany();
    await this.variantOptionModel.deleteMany();
    await this.productPropertyModel.deleteMany();
    await this.productSizeGuidanceModel.deleteMany();
    await this.productDescriptionModel.deleteMany();
    await this.productEmbeddingModel.deleteMany();
  }
}
