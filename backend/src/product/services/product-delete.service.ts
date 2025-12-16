import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
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
import { ProductQueryService } from './product-query.service';
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

    @InjectModel(ProductProperty.name)
    private readonly productPropertyModel: Model<ProductPropertyDocument>,
    @InjectModel(ProductDescription.name)
    private readonly productDescriptionModel: Model<ProductDescriptionDocument>,
  ) {}
  async deleteProductData(productId: string) {
    //to be deleted:
    //basic info
    let p1, p2, p3, p4, p5, p6;
    p1 = this.productModel.findOneAndDelete({ productId });
    //property
    p2 = this.productPropertyModel.deleteMany({ productId });

    //description
    p3 = this.productDescriptionModel.findOneAndDelete({ productId });
    //variant
    //all links
    const allLinks = await this.productOptionModel.find({ productId });
    const allVariants = allLinks.map((link) => link.variantId);
    const allOptions = allLinks.map((link) => link.optionId);
    //option
    p4 = this.productVariantModel.deleteMany({
      variantId: { $in: allVariants },
    });
    p5 = this.variantOptionModel.deleteMany({
      optionId: { $in: allOptions },
    });
    p6 = this.productOptionModel.deleteMany({ productId });
    await Promise.all([p1, p2, p3, p4, p5, p6]);
    console.log('Delete item ', productId, ' successfully');
    return true;
    //variantoption
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
      { isDeleted: false },
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
    await this.productDescriptionModel.deleteMany();
  }
}
