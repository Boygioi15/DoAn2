import { MongoClient, ObjectId } from 'mongodb';

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('database');

    const products = db.collection('product');
    const productOptions = db.collection('product_option');
    const variants = db.collection('product_variant');

    const cursor = products.find({}, { batchSize: 100 });

    while (await cursor.hasNext()) {
      const product = await cursor.next();
      if (!product) {
        console.log('NO PRODUCT BATCH IS FOUND!');
        return;
      }
      // 1. Get all product_option of this product
      const options = await productOptions
        .find({ productId: product.productId })
        .toArray();

      const variantIds = options.map((o) => o.variantId);

      if (variantIds.length === 0) {
        // Product has no variants — set defaults
        await products.updateOne(
          { productId: product.productId },
          {
            $set: {
              minPrice: 0,
              totalStock: 0,
            },
          },
        );
        continue;
      }

      // 2. Get all variants
      const variantDocs = await variants
        .find({ variantId: { $in: variantIds } })
        .toArray();

      // 3. Calculate minPrice & totalStock
      const minPrice = Math.min(...variantDocs.map((v) => v.price));
      const totalStock = variantDocs.reduce((s, v) => s + v.stock, 0);

      // 4. Update product
      await products.updateOne(
        { _id: product._id },
        {
          $set: {
            minPrice,
            totalStock,
          },
        },
      );

      console.log(`Updated product: ${product._id}`);
    }

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.close();
  }
}

run();
