import { Injectable } from '@nestjs/common';
import { CategoryService } from 'src/category/category.service';
import { CategoryDocument } from 'src/database/schemas/category.schema';

@Injectable()
export class FrontendSettingService {
  constructor(private categoryService: CategoryService) {}
  async getTopCategoryTree() {
    const allT1Cats =
      await this.categoryService.getAllDirectChildrenOfCategory();

    const t1List = allT1Cats
      .filter((cat) => cat.categoryName !== 'Không xác định')
      .map((cat) => ({
        name: cat.categoryName,
        categoryId: cat.categoryId,
      }));

    const t2Promises = t1List.map(async (t1Cat) => {
      const t2Cat = await this.categoryService.getAllDirectChildrenOfCategory(
        t1Cat.categoryId,
      );

      const subCats = t2Cat.map((cat) => ({
        name: cat.categoryName,
        categoryId: cat.categoryId,
      }));

      return {
        ...t1Cat,
        subCategory: subCats,
      };
    });

    const result = await Promise.all(t2Promises);

    return result;
  }
}
