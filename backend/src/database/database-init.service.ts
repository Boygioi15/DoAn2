import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class DatabaseInitService implements OnModuleInit {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async onModuleInit() {
    console.log('[DatabaseInit] Starting database initialization...');
    await this.createTextIndexes();
    console.log('[DatabaseInit] Database initialization complete');
  }

  private async createTextIndexes() {
    try {
      console.log('[DatabaseInit] Creating text indexes...');

      // Check if text index already exists on Product collection
      const existingIndexes = await this.productModel.collection.indexes();
      const hasTextIndex = existingIndexes.some(
        (index) => index.name === 'product_text_search',
      );

      if (hasTextIndex) {
        console.log(
          '[DatabaseInit] Text index "product_text_search" already exists',
        );
        return;
      }

      // Create text index on multiple fields for product search
      await this.productModel.collection.createIndex(
        {
          name: 'text',
          categoryName: 'text',
          descriptionString: 'text',
          propertyString: 'text',
        },
        {
          name: 'product_text_search',
          weights: {
            name: 10, // Product name is most important
            categoryName: 5,
            descriptionString: 2,
            propertyString: 1,
          },
          default_language: 'none', // Set to 'none' for better multilingual support
        },
      );

      console.log(
        '[DatabaseInit] Text index "product_text_search" created successfully',
      );
    } catch (error) {
      console.error('[DatabaseInit] Error creating text indexes:', error);
      // Don't throw - let the app continue even if index creation fails
    }
  }
}
