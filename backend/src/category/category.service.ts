import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Category,
  CategoryDocument,
} from 'src/database/schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category-';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
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
}
