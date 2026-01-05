// run-migrate-denormalize.js
import { MongoClient } from 'mongodb';
import { htmlToText } from 'html-to-text';

function extractSearchableText(description: string): string {
  return htmlToText(description, {
    wordwrap: false,
    selectors: [
      { selector: 'img', format: 'skip' },
      { selector: 'a', options: { ignoreHref: true } },
    ],
  });
}

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://user:pass@localhost:27019/database?directConnection=true&authSource=admin';
const DB_NAME = process.env.DB_NAME || 'database';
const BATCH_SIZE = 200;

const client = new MongoClient(MONGO_URI);

async function run() {
  try {
    await client.connect();
    const db = client.db(DB_NAME);

    const productsColl = db.collection('product');
    const productOptionColl = db.collection('product_option');
    const variantOptionColl = db.collection('variant_option');
    const variantColl = db.collection('product_variant');
    const categoryColl = db.collection('category');
    const propertyColl = db.collection('product_property');
    const descriptionColl = db.collection('product_description');

    // // Optional: ensure helpful indexes exist for speed
    // await productOptionColl.createIndex({ productId: 1 });
    // await productOptionColl.createIndex({ variantId: 1 });
    // await variantOptionColl.createIndex({ optionId: 1 });
    // await variantColl.createIndex({ variantId: 1 });

    const cursor = productsColl.find({}, { batchSize: BATCH_SIZE });

    while (await cursor.hasNext()) {
      const product = await cursor.next();
      if (!product) continue;
      const productId = product.productId;
      // Aggregate on product_variant to reconstruct the same projection as getAllVariantsOfProduct
      const pipeline = [
        // 1. Join each variant with all option links
        {
          $lookup: {
            from: 'product_option',
            localField: 'variantId',
            foreignField: 'variantId',
            as: 'links',
          },
        },
        // 2. Keep only variants belonging to this product
        {
          $match: {
            'links.productId': productId,
          },
        },
        // 3. Extract optionIds from links
        {
          $addFields: {
            optionIds: {
              $map: {
                input: '$links',
                as: 'l',
                in: '$$l.optionId',
              },
            },
          },
        },
        // 4. Lookup option documents for all optionIds (variant_option)
        {
          $lookup: {
            from: 'variant_option',
            localField: 'optionIds',
            foreignField: 'optionId',
            as: 'optionsData',
          },
        },
        // 5. Assume up to 2 options => split them by index (same strategy as your code)
        {
          $addFields: {
            option1: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: '$optionsData',
                    as: 'opt',
                    cond: { $eq: ['$$opt.index', 0] },
                  },
                },
                0,
              ],
            },
            option2: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: '$optionsData',
                    as: 'opt',
                    cond: { $eq: ['$$opt.index', 1] },
                  },
                },
                0,
              ],
            },
          },
        },
        // 6. Project fields we need
        {
          $project: {
            _id: 0,
            variantId: 1,
            price: 1,
            stock: 1,
            optionValue1: '$option1.value',
            optionValue2: '$option2.value',
          },
        },
      ];

      // Run aggregation
      const variantDocs = await variantColl.aggregate(pipeline).toArray();

      // Get category name (product level)
      let categoryName = 'corrupted';
      const cat = await categoryColl.findOne({
        categoryId: product.categoryId,
      });
      if (cat) {
        categoryName = cat.categoryName;
      }

      // Get properties and build propertyString (product level, not variant)
      const propertyList = await propertyColl.find({ productId }).toArray();
      let propertyString = '';
      for (const property of propertyList) {
        propertyString = propertyString.concat(
          (property.value?.toString() || '') + ' ',
        );
      }

      // Get description and build descriptionString (product level, not variant)
      const description = await descriptionColl.findOne({ productId });
      const descriptionString = extractSearchableText(
        description?.description || '',
      );

      // If no variants matched, set defaults for variant-related fields
      if (!variantDocs || variantDocs.length === 0) {
        await productsColl.updateOne(
          { productId },
          {
            $set: {
              minPrice: 0,
              totalStock: 0,
              allColors: [],
              allSizes: [],
              categoryName,
              propertyString,
              descriptionString,
            },
          },
        );
        console.log(
          `Product ${productId} → no variants. Defaulted. props=${propertyString.length}chars, desc=${descriptionString.length}chars`,
        );
        continue;
      }
      // Compute denormalized values
      let minPrice = Infinity;
      let totalStock = 0;
      const colorSet = new Set();
      const sizeSet = new Set();

      for (const v of variantDocs) {
        if (typeof v.price === 'number') {
          minPrice = Math.min(minPrice, v.price);
        }
        if (typeof v.stock === 'number') {
          totalStock += v.stock;
        }
        const [cName, cCode] = v.optionValue1.split(' ');
        if (v.optionValue1) colorSet.add(cName);
        if (v.optionValue2) sizeSet.add(v.optionValue2);
      }

      if (minPrice === Infinity) minPrice = 0;

      const allColors = [...colorSet];
      const allSizes = [...sizeSet];

      // Update the product doc with all denormalized fields
      await productsColl.updateOne(
        { productId },
        {
          $set: {
            minPrice,
            totalStock,
            allColors,
            allSizes,
            categoryName,
            propertyString,
            descriptionString,
          },
        },
      );

      console.log(
        `Updated productId=${productId}: minPrice=${minPrice}, totalStock=${totalStock}, colors=${allColors.length}, sizes=${allSizes.length}, props=${propertyString.length}chars, desc=${descriptionString.length}chars`,
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
