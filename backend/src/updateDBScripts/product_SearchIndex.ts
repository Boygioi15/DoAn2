import { MongoClient } from 'mongodb';

const uri =
  'mongodb://user:pass@localhost:27019/database?directConnection=true&authSource=admin';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('database');
    const products = db.collection('product');

    console.log('Creating text index on products...');

    await products.createIndex(
      {
        name: 'text',
        description: 'text',
        brand: 'text',
      },
      {
        name: 'ProductTextIndex', // optional but nice for debugging
        weights: {
          name: 10,
          brand: 5,
          description: 2,
        },
      },
    );

    console.log('Text index created successfully!');
  } catch (err) {
    console.error('Error creating index:', err);
  } finally {
    await client.close();
  }
}

run();
