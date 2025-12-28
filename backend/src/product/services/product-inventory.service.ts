import {
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
  ProductVariant,
  ProductVariantDocument,
  VariantOption,
  VariantOptionDocument,
} from 'src/database/schemas/product.schema';
import { ClientSession, Model } from 'mongoose';
import { slugifyOption } from 'src/constants';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CategoryService } from 'src/category/category.service';
import { ProductQueryService } from './product-query.service';
@Injectable()
export class ProductInventoryService {
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
  async updateVariantStock(variantId: string, newStock: number) {
    if (newStock < 0) {
      throw new BadRequestException('Số lượng phải lớn hơn 0!');
    }
    const variant = await this.productVariantModel.findOneAndUpdate(
      { variantId },
      { stock: newStock },
      { new: true },
    );
    if (!variant) {
      throw new BadRequestException('Không tìm thấy biến thể');
    }
    return variant;
  }
  async takeAwayAmountOfVariantStock(
    variantId: string,
    takeAwayAmount: number,
    session?: ClientSession,
  ) {
    if (takeAwayAmount <= 0) {
      throw new BadRequestException('Lượng trừ đi phải lớn hơn 0');
    }
    const variant = await this.productVariantModel.findOneAndUpdate(
      { variantId, stock: { $gte: takeAwayAmount } },
      { $inc: { stock: -takeAwayAmount } },
      { new: true, session },
    );
    if (!variant) {
      throw new BadRequestException(
        'Không tìm thấy biến thể hoặc không đủ hàng',
      );
    }
    return variant;
  }
  async returnAmountOfVariantStock(
    variantId: string,
    returnAmount: number,
    session?: ClientSession,
  ) {
    if (returnAmount <= 0) {
      throw new BadRequestException('Lượng thêm vào phải lớn hơn 0');
    }
    const variant = await this.productVariantModel.findOneAndUpdate(
      { variantId },
      { $inc: { stock: returnAmount } },
      { new: true, session },
    );
    if (!variant) {
      throw new BadRequestException('Không tìm thấy biến thể');
    }
    return variant;
  }
}
