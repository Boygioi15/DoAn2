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
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

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
    const product = await this.productService.getProductDetail_Admin(productId);
    return product;
  }
  @Get('get-detail/client/:id')
  async getProductDetail_Client(@Param('id') productId: string) {
    const product =
      await this.productService.getProductDetail_Client(productId);
    return product;
  }
  @Get('item-management')
  async getAllProducts_ItemManagement() {
    const productList =
      await this.productService.getAllProduct_ItemManagement();
    return productList;
  }
  @Get('client')
  async getAllProducts_Client() {
    const productList = await this.productService.getAllProduct_Client();
    return productList;
  }
  @Post('reset-all-product-data')
  async resetAllData() {
    this.productService.resetAllProductData();
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
  @Delete('/:id')
  async softDeleteProduct(@Param('id') id: string) {
    const newProductList = await this.productService.softDeleteProduct(id);
    return newProductList;
  }
  @Post('/restore/:id')
  async restoreProduct(@Param('id') id: string) {
    const newProductList = await this.productService.restoreProduct(id);
    return newProductList;
  }
}
