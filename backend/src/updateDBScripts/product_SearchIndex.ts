// Script to create Atlas Search index programmatically
// Note: This requires MongoDB Atlas and appropriate permissions
// Run: npx ts-node ./product_CreateAtlasSearchIndex.ts

import { MongoClient } from 'mongodb';

const MONGO_URI =
  process.env.MONGODB_URI ||
  'mongodb://user:pass@localhost:27019/database?directConnection=true&authSource=admin';
const DB_NAME = process.env.DB_NAME || 'database';

const client = new MongoClient(MONGO_URI);

async function run() {
  try {
    await client.connect();
    const db = client.db(DB_NAME);

    console.log('Creating Atlas Search index on products collection...');

    // Atlas Search index definition
    const searchIndexDefinition = {
      name: 'search_index', // This matches your buildClientQueryPipeline
      definition: {
        mappings: {
          dynamic: false,
          fields: {
            name: {
              type: 'string',
              indexOptions: 'offsets',
              store: true,
              norms: 'include',
            },
            propertyString: {
              type: 'string',
              indexOptions: 'offsets',
              store: true,
              norms: 'include',
            },
            categoryName: {
              type: 'string',
              indexOptions: 'offsets',
              store: true,
              norms: 'include',
            }
          },
        },
      },
    };

    // Create the search index (MongoDB 7.0+ with Atlas)
    const collection = db.collection('product');
    
    // Check if index already exists
    const existingIndexes = await collection.listSearchIndexes().toArray();
    const indexExists = existingIndexes.some(
      (idx) => idx.name === 'search_index',
    );

    if (indexExists) {
      console.log('Search index "search_index" already exists. Updating...');
      await collection.updateSearchIndex('search_index', searchIndexDefinition.definition);
      console.log('Search index updated successfully!');
    } else {
      await collection.createSearchIndex(searchIndexDefinition);
      console.log('Atlas Search index "search_index" created successfully!');
    }

    console.log('\nIndex configuration:');
    console.log(JSON.stringify(searchIndexDefinition, null, 2));
  } catch (err: any) {
    if (err.codeName === 'CommandNotSupported') {
      console.error(
        'Atlas Search indexes can only be created on MongoDB Atlas clusters.',
      );
      console.error(
        'For local MongoDB, use the standard text index instead (see product_SearchIndex.ts)',
      );
    } else {
      console.error('Error creating search index:', err);
    }
  } finally {
    await client.close();
  }
}

run();