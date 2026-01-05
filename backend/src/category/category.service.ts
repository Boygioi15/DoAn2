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
import {
  FrontendSetting,
  FrontendSettingDocument,
} from 'src/database/schemas/frontend-setting.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,

    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,

    @InjectModel(FrontendSetting.name)
    private frontendSettingModel: Model<FrontendSettingDocument>,
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
  async getAllLevel1Categories() {
    return await this.categoryModel.find({ categoryLevel: { $eq: 1 } });
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

  async getImageOfCategory(categoryId: string): Promise<string | null> {
    // Get the category to check its level
    const category = await this.categoryModel.findOne({ categoryId }).lean();
    if (!category) return null;

    const categoryLevel = category.categoryLevel;

    if (categoryLevel === 1) {
      // Level 1: Try to get image from any level 2 child
      const level2Children = await this.categoryModel
        .find({
          parentId: categoryId,
        })
        .lean();
      if (level2Children.length === 0) return null;

      // Try each child until we find one with an image
      for (const child of level2Children) {
        const img = await this.getImageOfCategory(child.categoryId);
        if (img) return img;
      }
      return null;
    } else if (categoryLevel === 2) {
      // Level 2: Try to get image from any level 3 child
      const level3Children = await this.categoryModel
        .find({
          parentId: categoryId,
        })
        .lean();
      if (level3Children.length === 0) return null;

      // Try each child until we find one with an image
      for (const child of level3Children) {
        const img = await this.getImageOfCategory(child.categoryId);
        if (img) return img;
      }
      return null;
    } else if (categoryLevel === 3) {
      // Level 3: Get image of first product with an image
      const firstProduct: any = await this.productModel
        .findOne({
          categoryId,
          display_thumbnail_image: { $exists: true, $ne: null },
        })
        .lean();
      if (!firstProduct) return null;
      return firstProduct.display_thumbnail_image || null;
    }

    return null;
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
    // console.log('ADC1: ', allDirectChilren);
    allDirectChilren = await Promise.all(
      allDirectChilren.map(async (children: any) => {
        const img = await this.getImageOfCategory(children.categoryId);
        return {
          ...children,
          img,
        };
      }),
    );
    // console.log('ADC: ', allDirectChilren);
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

  async getLandingPage(categoryId: string) {
    // Get hero image from categoryPageSetting
    const frontendSetting = await this.frontendSettingModel.findOne();
    const heroImage = frontendSetting?.categoryPageSetting?.get(categoryId);
    // Get children categories with images
    const childrenCategories =
      await this.getAllDirectChildrenOfCategoryWithImage(categoryId);

    return {
      heroImage,
      childrenCategories,
    };
  }
}
