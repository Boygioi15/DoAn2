import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category-';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getAllCategories(filterUndefined = false) {
    const allCategories =
      await this.categoryService.getAllCategories(filterUndefined);
    return allCategories;
  }
  @Get('/:categoryId/landing')
  async getCategoryLandingPage(@Param('categoryId') categoryId: string) {
    const landingData = await this.categoryService.getLandingPage(categoryId);
    return landingData;
  }
  @Get('by-name')
  async getCategoryByName(@Query('categoryName') categoryName: string) {
    const matchingCategory =
      await this.categoryService.getCategoryByName(categoryName);
    return matchingCategory;
  }
  @Get('direct-children/:categoryId')
  async getAllDirectChildrenOfCategory(
    @Param('categoryId') categoryId: string,
  ) {
    return this.categoryService.getAllDirectChildrenOfCategory(categoryId);
  }
  //cat2
  @Get('direct-children-img')
  async getAllDirectChildrenOfCategoryWithImageOfRoot() {
    return this.categoryService.getAllDirectChildrenOfCategoryWithImage();
  }
  @Get('direct-children-img/:categoryId')
  async getAllDirectChildrenOfCategoryWithImage(
    @Param('categoryId') categoryId: string,
  ) {
    return this.categoryService.getAllDirectChildrenOfCategoryWithImage(
      categoryId,
    );
  }
  @Post('/')
  async createNewCategory(@Body() newCategory: CreateCategoryDto) {
    // console.log('NC: ', newCategory);
    const _new = await this.categoryService.createNewCategory(newCategory);
    return this.getAllCategories();
  }
  @Patch(':categoryId')
  async updateCategory(
    @Param('categoryId') categoryId: string,
    @Body() updateCategory: UpdateCategoryDto,
  ) {
    const _updated = await this.categoryService.updateCategory(
      categoryId,
      updateCategory,
    );
    return this.getAllCategories();
  }
  @Delete(':categoryId')
  async deleteCategory(@Param('categoryId') categoryId: string) {
    await this.categoryService.deleteCategory(categoryId);
    return this.getAllCategories();
  }
}
