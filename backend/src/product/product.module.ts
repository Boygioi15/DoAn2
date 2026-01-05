import { Module } from '@nestjs/common';
import { ProductService } from './services/product.service';
import { ProductController } from './product.controller';
import { DatabaseModule } from 'src/database/database.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CategoryModule } from 'src/category/category.module';
import { ProductQueryService } from './services/product-query.service';
import { ProductDeleteService } from './services/product-delete.service';
import { ProductInventoryService } from './services/product-inventory.service';
import { ProductEmbeddingService } from './services/product-embedding.service';

@Module({
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductQueryService,
    ProductDeleteService,
    ProductInventoryService,
    ProductEmbeddingService,
  ],
  imports: [DatabaseModule, CloudinaryModule, CategoryModule],
  exports: [
    ProductService,
    ProductQueryService,
    ProductInventoryService,
    ProductEmbeddingService,
  ],
})
export class ProductModule {}
