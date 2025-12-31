// Script to generate product embeddings for vector search
// Run: npx ts-node ./product_GenerateEmbedding.ts
import { MongoClient } from 'mongodb';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../.env' });

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://user:pass@localhost:27019/database?directConnection=true&authSource=admin';
const DB_NAME = process.env.DB_NAME || 'database';
const BATCH_SIZE = 5; // Process 5 products at a time

const client = new MongoClient(MONGO_URI);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate embedding for text using OpenAI
 */
async function generateTextEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });

    return response.data[0]?.embedding || [];
  } catch (error) {
    console.error('Error generating text embedding:', error);
    throw error;
  }
}

/**
 * Build full text description for a product
 */
function buildProductDescription(product: any): string {
  const parts: string[] = [];

  // Product name
  if (product.name) {
    parts.push(`Tên sản phẩm: ${product.name}`);
  }

  // Category
  if (product.categoryName) {
    parts.push(`Danh mục: ${product.categoryName}`);
  }

  // Colors
  if (product.allColors && product.allColors.length > 0) {
    parts.push(`Màu sắc: ${product.allColors.join(', ')}`);
  }

  // Sizes
  if (product.allSizes && product.allSizes.length > 0) {
    parts.push(`Kích cỡ: ${product.allSizes.join(', ')}`);
  }

  // Properties (denormalized string)
  if (product.propertyString) {
    parts.push(`Thuộc tính: ${product.propertyString}`);
  }

  // Description (denormalized string)
  if (product.descriptionString) {
    parts.push(`Mô tả: ${product.descriptionString}`);
  }

  return parts.join('. ');
}

/**
 * Process a single product - generate description and embedding
 */
async function processProduct(
  product: any,
  productEmbeddingColl: any,
): Promise<boolean> {
  const { productId } = product;

  // Check if already processed
  const existing = await productEmbeddingColl.findOne({ productId });
  if (existing?.isEmbedded) {
    console.log(`Skipping product ${productId} - already has embedding`);
    return false;
  }

  try {
    console.log(`Processing product ${productId}...`);

    // Build full text description
    const description = buildProductDescription(product);
    console.log(`  Description: ${description.substring(0, 100)}...`);

    // Generate embedding from description
    const embedding = await generateTextEmbedding(description);
    console.log(`  Embedding generated (${embedding.length} dimensions)`);

    // Upsert to database
    await productEmbeddingColl.updateOne(
      { productId },
      {
        $set: {
          productId,
          description,
          embedding,
          isEmbedded: true,
          createdAt: existing?.createdAt || new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );

    console.log(`  ✓ Product ${productId} processed successfully`);
    return true;
  } catch (error) {
    console.error(`  ✗ Error processing product ${productId}:`, error);
    return false;
  }
}

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    const db = client.db(DB_NAME);

    const productsColl = db.collection('product');
    const productEmbeddingColl = db.collection('product_embedding');

    // Create index on productId for faster lookups
    try {
      await productEmbeddingColl.createIndex(
        { productId: 1 },
        { unique: true },
      );
    } catch (error) {
      console.log(error);
    }

    // Get all products that are not deleted
    const products = await productsColl
      .find({
        isDeleted: false,
      })
      .project({
        productId: 1,
        name: 1,
        categoryName: 1,
        allColors: 1,
        allSizes: 1,
        propertyString: 1,
        descriptionString: 1,
      })
      .toArray();

    console.log(`Found ${products.length} products to process`);

    let processed = 0;
    let skipped = 0;
    let failed = 0;

    // Process in batches
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(products.length / BATCH_SIZE);

      console.log(`\n--- Processing batch ${batchNumber}/${totalBatches} ---`);

      // Process batch concurrently
      const results = await Promise.all(
        batch.map((product) =>
          processProduct(product, productEmbeddingColl),
        ),
      );

      results.forEach((success) => {
        if (success) {
          processed++;
        } else {
          skipped++;
        }
      });

      // Add delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < products.length) {
        console.log('Waiting 2 seconds before next batch...');
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    console.log('\n========== Summary ==========');
    console.log(`Total products: ${products.length}`);
    console.log(`Processed: ${processed}`);
    console.log(`Skipped (already embedded): ${skipped}`);
    console.log(`Failed: ${failed}`);
    console.log('==============================');
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await client.close();
    console.log('\nMongoDB connection closed.');
  }
}

run();
