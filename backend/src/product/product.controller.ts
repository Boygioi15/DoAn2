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
    //console.log('F: ', files);
    return this.productService.createNewProduct(createProductDto, files);
  }
}
