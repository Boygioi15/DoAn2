import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import OpenAI from 'openai';
import { Product, ProductDocument } from 'src/database/schemas/product.schema';
import {
  ProductEmbedding,
  ProductEmbeddingDocument,
} from 'src/database/schemas/product_embedding.schema';

@Injectable()
export class ProductEmbeddingService {
  private openai: OpenAI;

  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(ProductEmbedding.name)
    private readonly productEmbeddingModel: Model<ProductEmbeddingDocument>,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate text embedding using OpenAI
   */
  async generateTextEmbedding(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) {
      console.log('Empty text provided for embedding, returning empty array');
      return [];
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',
      });

      return response.data[0]?.embedding || [];
    } catch (error) {
      console.error('Error generating text embedding:', error);
      throw new InternalServerErrorException('Failed to generate embedding');
    }
  }

  /**
   * Generate image description using OpenAI Vision
   */
  async generateImageDescription(
    imageData: string,
    mimeType: string,
  ): Promise<string> {
    try {
      const imageUrl = imageData.startsWith('data:')
        ? imageData
        : `data:${mimeType};base64,${imageData}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Chú trọng mô tả quần áo có trong hình bằng tiếng Việt. Bao gồm: loại sản phẩm, màu sắc, kiểu dáng, chất liệu (nếu có thể nhận biết). Không nói thêm về ngữ cảnh xung quanh. Viết ngắn gọn trong 1-2 câu.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 300,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating image description:', error);
      throw new InternalServerErrorException(
        'Failed to generate image description',
      );
    }
  }

  /**
   * Generate text embedding from an image (via description)
   */
  async generateEmbeddingFromImage(
    file: Express.Multer.File,
  ): Promise<number[]> {
    try {
      // Convert file buffer to base64
      const base64Data = file.buffer.toString('base64');
      const mimeType = file.mimetype;

      // Generate description for the image
      const description = await this.generateImageDescription(
        base64Data,
        mimeType,
      );
      console.log('Generated image description:', description);

      // Generate embedding from description
      const embedding = await this.generateTextEmbedding(description);
      console.log(
        `Generated embedding from image, dimensions: ${embedding.length}`,
      );

      return embedding;
    } catch (error) {
      console.error('Error generating embedding from image:', error);
      throw new InternalServerErrorException(
        'Failed to generate embedding from image',
      );
    }
  }

  /**
   * Generate text embedding from a product given productId
   */
  async generateAndSaveEmbeddingForProduct(productId: string) {
    const product = await this.productModel.findOne({ productId });
    if (!product) {
      console.error(`Product ${productId} not found`);
      throw new InternalServerErrorException('Product not found');
    }
    try {
      const productSearchableText =
        this.buildFullProductTextDescription(product);
      const productEmbedding = await this.generateTextEmbedding(
        productSearchableText,
      );
      await this.productEmbeddingModel.create({
        productId,
        description: productSearchableText,
        embedding: productEmbedding,
      });
      console.log('Create embedding for product: ', product.productId);
    } catch (error) {
      console.error(
        `Error generating embedding for product ${product.productId}:`,
        error,
      );
      throw error;
    }
  }

  buildFullProductTextDescription(product: ProductDocument): string {
    const parts: string[] = [];

    // Product name (most important)
    if (product.name) {
      parts.push(product.name);
    }

    // Colors
    if (product.allColors && product.allColors.length > 0) {
      parts.push(product.allColors.join(' '));
    }

    // Sizes
    if (product.allSizes && product.allSizes.length > 0) {
      parts.push(product.allSizes.join(' '));
    }

    // Property string (material, brand, etc.)
    if (product.propertyString) {
      parts.push(product.propertyString);
    }

    // Description string (cleaned HTML)
    if (product.descriptionString) {
      parts.push(product.descriptionString);
    }

    return parts.join(' ').trim();
  }
}
