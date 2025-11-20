import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { DatabaseModule } from 'src/database/database.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [DatabaseModule, CloudinaryModule],
  exports: [ProductService],
})
export class ProductModule {}
