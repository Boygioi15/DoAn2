import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ProductQueryService } from './product-query.service';
import { ProductDeleteService } from './product-delete.service';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly productQueryService: ProductQueryService,
    private readonly productDeleteService: ProductDeleteService,
  ) {}
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  create(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() createProductDto: CreateProductDto,
  ) {
    // console.log('F: ', files);
    return this.productService.createNewProduct(createProductDto, files);
  }
  @Get('get-detail/admin/:id')
  async getProductDetail_Admin(@Param('id') productId: string) {
    const product =
      await this.productQueryService.getProductDetail_Admin(productId);

    return product;
  }
  @Get('get-detail/client/:id')
  async getProductDetail_Client(@Param('id') productId: string) {
    const product =
      await this.productQueryService.getProductDetail_Client(productId);
    return product;
  }
  @Get('admin')
  async getAllProducts_ItemManagement(@Query() q) {
    const productList = await this.productQueryService.getAllProduct({
      role: 'ADMIN',
      filters: {
        priceMin: q.priceMin,
        priceMax: q.priceMax,
        categoryId: q.categoryId,
        search: q.query,
      },
      pagination: {
        from: q.from || 1,
        size: q.size || 24,
      },
      sortBy: q.sort,
    });
    return productList;
  }
  @Get('client')
  async getAllProducts_Client(@Query() q) {
    const { productList, metadata } =
      await this.productQueryService.getAllProductWrapper({
        role: 'CLIENT',
        filters: {
          categoryId: q.categoryId,
          search: q.query,

          priceMin: q.priceMin,
          priceMax: q.priceMax,

          colorList: q.colorList,
          sizeList: q.sizeList,
        },
        pagination: {
          from: q.from || 1,
          size: q.size || 24,
        },
        sortBy: q.sortBy,
      });
    // console.log('Result: ', productList, metadata);
    return { productList, metadata };
  }
  @Delete('reset-all-product-data')
  async resetAllData() {
    this.productDeleteService.resetAllProductData();
  }
  @Post('update-published/:id')
  async updateProductPublished(
    @Param('id') id: string,
    @Body('state') state: boolean,
  ) {
    const newProductList = await this.productService.updateProductPublished(
      id,
      state,
    );
    return newProductList;
  }
  @Delete(`/real-delete/:id`)
  async realDeleteProduct(@Param('id') id: string) {
    const newProductList =
      await this.productDeleteService.deleteProductData(id);
    return newProductList;
  }
  @Delete('/:id')
  async softDeleteProduct(@Param('id') id: string) {
    const newProductList =
      await this.productDeleteService.softDeleteProduct(id);
    return newProductList;
  }
  @Post('/restore/:id')
  async restoreProduct(@Param('id') id: string) {
    const newProductList = await this.productDeleteService.restoreProduct(id);
    return newProductList;
  }
}
