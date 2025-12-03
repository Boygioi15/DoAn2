// run-migrate-denormalize.js
import { MongoClient } from 'mongodb';

const MONGO_URI =
  process.env.MONGODB_URI ||
  'mongodb://user:pass@localhost:27019/database?directConnection=true&authSource=admin';
const DB_NAME = process.env.DB_NAME || 'database';

if (!MONGO_URI) {
  throw new Error('NO MONGODB_URI!');
}
const client = new MongoClient(MONGO_URI);

async function run() {
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const categoryColl = db.collection('category');

    // Load all categories into memory
    const allCategories = await categoryColl
      .find({})
      .project({ categoryId: 1, parentId: 1 })
      .toArray();

    // Create lookup map by ID for quick parent traversal
    const categoryMap = new Map();
    allCategories.forEach((doc) => {
      categoryMap.set(String(doc.categoryId), doc);
    });

    console.log('Total categories:', allCategories.length);

    // Process each category
    for (const category of allCategories) {
      let level = 1;
      let current = category;

      // Walk up the parent chain
      while (current.parentId) {
        const parent = categoryMap.get(String(current.parentId));
        if (!parent) break;
        level++;
        current = parent;
      }

      // Update document
      await categoryColl.updateOne(
        { categoryId: category.categoryId },
        { $set: { categoryLevel: level } },
      );
    }

    console.log('Migration finished successfully.');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.close();
  }
}

run();
