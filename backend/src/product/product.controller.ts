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
  UploadedFile,
  Query,
  Request,
} from '@nestjs/common';
import { ProductService } from './services/product.service';
import { CreateProductDto } from './dto/product.dto';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ProductQueryService } from './services/product-query.service';
import { ProductDeleteService } from './services/product-delete.service';
import { ProductEmbeddingService } from './services/product-embedding.service';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly productQueryService: ProductQueryService,
    private readonly productDeleteService: ProductDeleteService,
    private readonly productEmbeddingService: ProductEmbeddingService,
  ) {}
  @Post('publish-new-product')
  @UseInterceptors(AnyFilesInterceptor())
  async publishNewProduct(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() createProductDto: CreateProductDto,
  ) {
    // console.log('CPD: ', createProductDto);
    // console.log('F: ', files);
    return await this.productService.publishNewProduct(createProductDto, files);
  }
  @Post('create-new-draft')
  @UseInterceptors(AnyFilesInterceptor())
  async createNewDraft(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() createProductDto: CreateProductDto,
  ) {
    console.log('CPD: ', createProductDto);
    // console.log('F: ', files);
    return await this.productService.createNewDraft(createProductDto, files);
  }
  @Patch('update-draft/:productId')
  @UseInterceptors(AnyFilesInterceptor())
  async updateDraft(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() createProductDto: CreateProductDto,
    @Param('productId') productId: string,
  ) {
    return await this.productService.updateDraft(
      createProductDto,
      files,
      productId,
    );
  }
  @Patch('publish-draft/:productId')
  @UseInterceptors(AnyFilesInterceptor())
  async publishDraft(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() createProductDto: CreateProductDto,
    @Param('productId') productId: string,
  ) {
    return await this.productService.publishDraft(
      createProductDto,
      files,
      productId,
    );
  }
  @Patch('update-product/:productId')
  @UseInterceptors(AnyFilesInterceptor())
  updateProduct(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() updateProductDto: CreateProductDto,
    @Param('productId') productId: string,
  ) {
    console.log('CPD: ', updateProductDto);
    return this.productService.updateProduct(
      productId,
      updateProductDto,
      files,
    );
  }

  @Get('get-detail/admin/:productId')
  async getProductDetail_Admin(@Param('productId') productId: string) {
    const product =
      await this.productQueryService.getProductDetail_Admin(productId);

    return product;
  }
  @Get('get-detail/client/:productId')
  async getProductDetail_Client(@Param('productId') productId: string) {
    const product =
      await this.productQueryService.getProductDetail_Client(productId);
    return product;
  }
  @Get('admin')
  async getProductList_Admin(@Query() q) {
    const productList = await this.productQueryService.getAllProduct({
      role: 'ADMIN',
      filters: {
        queryProductName: q.queryProductName,
        queryCategoryName: q.queryCategoryName,
        queryProductSku: q.queryProductSku,
        productTab: q.productTab,
        stockState: q.stockState,
        categoryId: q.categoryId,
      },
      pagination: {
        from: q.from || 1,
        size: q.size || 10,
      },
      sortBy: q.sortBy,
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

  @Post('search-by-image')
  @UseInterceptors(FileInterceptor('image'))
  async searchByImage(@UploadedFile() file: Express.Multer.File, @Query() q) {
    if (!file) {
      return { error: 'No image file provided' };
    }

    const results = await this.productQueryService.searchByImage(
      file,
      q.size ? q.size : 10,
      q.threshold ? q.threshold : 'low',
    );
    return results;
  }
}
