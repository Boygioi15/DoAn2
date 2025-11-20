import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Category,
  CategoryDocument,
} from 'src/database/schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category-';
import { Product, ProductDocument } from 'src/database/schemas/product.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,

    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
  ) {}
  async getAllCategories() {
    const allCategories = await this.categoryModel.find();
    return allCategories;
  }
  async createNewCategory(newCategory: CreateCategoryDto) {
    const _new = await this.categoryModel.create(newCategory);
    return _new;
  }
  async updateCategory(categoryId: string, newCategory: UpdateCategoryDto) {
    const _new = await this.categoryModel.findOneAndUpdate(
      { categoryId: categoryId },
      newCategory,
      { new: true },
    );
    return _new;
  }
  async deleteCategory(categoryId: string) {
    const _deleted = await this.categoryModel.findOneAndDelete({
      categoryId: categoryId,
    });
    //update all products of matching category
    return _deleted;
  }
  async getAllProductIdOfCategories(categoryId: string) {
    const allProducts = await this.productModel.find({
      categoryId: categoryId,
    });
    const allProductId = allProducts.map((product) => product.productId);
    return allProductId;
  }
}
