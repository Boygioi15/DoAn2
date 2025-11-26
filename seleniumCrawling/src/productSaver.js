const path = require("path");
const { loadJson, saveJson } = require("./jsonWorking");

const PRODUCT_JSON_PATH = path.join(__dirname, "../results/products.json");

function saveProductData(product) {
  const db = loadJson(PRODUCT_JSON_PATH);

  // Use SKU as key (safe and unique)
  //only get the first part before the dash.
  console.log("PSKU: ", product.sku);
  const match = product.sku.match(/^\w+/g);

  const sku = match ? match[0] : null; // "8te25w008"
  product.sku = sku;
  db[product.sku] = product;

  saveJson(PRODUCT_JSON_PATH, db);

  console.log(`✅ Saved product: ${product.sku}`);
}
module.exports = { saveProductData };
