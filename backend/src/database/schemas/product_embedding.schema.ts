import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductEmbeddingDocument = HydratedDocument<ProductEmbedding>;

@Schema({ timestamps: true, collection: 'product_embedding' })
export class ProductEmbedding {
  @Prop({ index: true, unique: true })
  productId: string;

  @Prop()
  description: string;

  @Prop({ type: [Number], default: [] })
  embedding: number[];

  @Prop({ default: false })
  isEmbedded: boolean;
}

export const ProductEmbeddingSchema =
  SchemaFactory.createForClass(ProductEmbedding);

// Create vector search index for embedding field (for MongoDB Atlas)
// Note: This needs to be created manually in MongoDB Atlas or via script
// Index definition for Atlas Search:
// {
//   "type": "vectorSearch",
//   "fields": [{
//     "type": "vector",
//     "path": "embedding",
//     "numDimensions": 1536,
//     "similarity": "cosine"
//   }]
// }
