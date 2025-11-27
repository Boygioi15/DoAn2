import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { DatabaseModule } from 'src/database/database.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CategoryModule } from 'src/category/category.module';
import { ProductQueryService } from './product-query.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService, ProductQueryService],
  imports: [DatabaseModule, CloudinaryModule, CategoryModule],
  exports: [ProductService],
})
export class ProductModule {}
