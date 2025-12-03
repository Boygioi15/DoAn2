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
  async getAllCategories(filterUndefined: boolean) {
    let allCategories: CategoryDocument[] = [];
    allCategories = await this.categoryModel.find();
    if (filterUndefined) {
      allCategories = allCategories.filter(
        (cat) => cat.categoryName !== 'Không xác định',
      );
    }
    return allCategories;
  }
  async getAllProductOfCategories(categoryId: string) {
    const allProducts = await this.productModel.find({
      categoryId: categoryId,
    });
    return allProducts;
  }
  async getCategoryByName(categoryName: string) {
    return await this.categoryModel.findOne({
      categoryName: categoryName,
    });
  }
  async getAllDirectChildrenOfCategory(
    categoryId: string | null = null,
  ): Promise<CategoryDocument[]> {
    let allDirectChilren = [];
    if (!categoryId) {
      allDirectChilren = await this.categoryModel.find({ parentId: null });
    } else {
      allDirectChilren = await this.categoryModel.find({
        parentId: categoryId,
      });
    }
    return allDirectChilren;
  }
  async getAllDirectChildrenOfCategoryWithImage(
    categoryId: string | null = null,
  ): Promise<CategoryDocument[]> {
    let allDirectChilren: any = [];
    if (!categoryId) {
      allDirectChilren = await this.categoryModel
        .find({ parentId: null })
        .lean();
    } else {
      allDirectChilren = await this.categoryModel
        .find({
          parentId: categoryId,
        })
        .lean();
    }
    console.log('ADC1: ', allDirectChilren);
    allDirectChilren = await Promise.all(
      allDirectChilren.map(async (children: any) => {
        const firstProduct: any = await this.productModel
          .findOne({
            categoryId: children.categoryId,
          })
          .lean();
        let img = null;
        if (firstProduct) {
          img = firstProduct.display_thumbnail_image;
        }

        return {
          ...children,
          img,
        };
      }),
    );
    console.log('ADC: ', allDirectChilren);
    return allDirectChilren;
  }
  async getCategoryDetail(categoryId: string) {
    const category = await this.categoryModel.findOne({
      categoryId: categoryId,
    });
    return category;
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
