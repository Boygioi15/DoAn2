const fs = require("fs");
const path = require("path");
const axios = require("axios");
const chrome = require("selenium-webdriver/chrome");
const { loadJson, saveJson } = require("./jsonWorking");
const slugify = require("slugify");
const { v4 } = require("uuid");
const FormData = require("form-data");
const PRODUCT_JSON_PATH = path.join(__dirname, "../results/products.json");

const slugifyOption = {
  replacement: "-", // replace spaces with replacement character, defaults to `-`
  remove: undefined, // remove characters that match regex, defaults to `undefined`
  lower: true, // convert to lower case, defaults to `false`
  strict: false, // strip special characters except replacement, defaults to `false`
  locale: "vi", // language code of the locale to use
  trim: true, // trim leading and trailing replacement chars, defaults to `true`
};

async function main() {
  const products = loadJson("../results/products.json");
  const productsArray = Object.values(products); // [ {}, {}, ... ]

  const urls = loadJson("../results/urlList.json");
  const urlArray = Object.values(urls); // [ {}, {}, ... ]

  let totalDone = 0;
  const notDone = [];
  for (let [index, product] of productsArray.entries()) {
    if (product.done) {
      totalDone++;
    }
    if (!product.done || product.done === "false") {
      notDone.push(product);
    }
  }
  console.log("URL length: ", urlArray.length);
  console.log("Product length: ", productsArray.length);
  console.log("Total done: ", totalDone);
  console.log("Undone products: ", notDone.slice(0, 5));
}
main();
