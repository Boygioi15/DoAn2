const { loadJson, saveJson } = require("./jsonWorking");
const { saveCategoryData } = require("./saver");
const baseUrl = "https://canifa.com";

const PROCESSED_PATH = "../results/processed_url.json";
async function main() {
  const categories = loadJson("../results/categories.json");
  const categoryList = Object.values(categories); // [ {}, {}, ... ]

  const normalizedData = await NormalizeCategoryList(categoryList);
  console.log("Raw data length: ", normalizedData.length);
  console.log(normalizedData.slice(0, 10));

  console.log("Checking data integrity");
  console.log("Check parsable url");
  await CheckUrlParsability(normalizedData.map((data) => data.productUrl));
  console.log("Check duplicate url");
  await CheckDuplicateUrl(normalizedData);

  let processingData = await FilterOutDuplicate(normalizedData);
  console.log("Check duplicate sku");
  await CheckDuplicateSku(processingData);

  console.log("Finished: ", processingData.slice(0, 10));
  console.log("Processed data length: ", processingData.length);

  saveJson(PROCESSED_PATH, processingData);
}
async function NormalizeCategoryList(rawCategoryList) {
  const result = [];

  for (const key of Object.keys(rawCategoryList)) {
    const category = rawCategoryList[key];
    const categoryId = category.categoryId;

    for (const productUrl of category.productUrLList) {
      result.push({
        productUrl: `${baseUrl}${productUrl}`,
        categoryId,
      });
    }
  }

  return result;
}
function CheckUrlParsability(productUrls) {
  const invalid = [];

  for (const url of productUrls) {
    const parsed = parseProductUrl(url);
    if (!parsed.valid || !parsed.sku) {
      invalid.push(url);
    }
  }
  if (invalid.length > 0) {
    console.log("Un-parsable url: ");
    console.log(invalid);
  }
}
async function CheckDuplicateSku(normalizedData) {
  const skuSet = new Set();
  for (const item of normalizedData) {
    const { sku } = parseProductUrl(item.productUrl);
    if (!skuSet.has(sku)) {
      skuSet.add(sku);
    } else {
      console.log("DUPLICATE SKU: ", item.productUrl);
    }
  }
}
async function CheckDuplicateUrl(normalizedData) {
  /* CHECK!!! 
    The url is of the form: "/bo-mac-nha-nu-6ls25w012-sk010?color=SK010" 
    TERM: /bo-mac-nha-nu aka prefix, 6ls25w012 aka sku. sk010 aka color;
    1. Filter out the no color section
    2. Check the prefix+sku part to see if any overlap
    */

  const prefixSkuSet = new Set();
  //   console.log(normalizedData.slice(0, 5));
  const filtered = normalizedData.filter((item) => {
    // console.log(item.productUrl);
    const { hasColorInPath } = parseProductUrl(item.productUrl);
    return hasColorInPath;
  });
  for (const item of filtered) {
    const [prefixSku, color] = item.productUrl.split("?");
    if (prefixSkuSet.has(prefixSku)) {
      issues.push("OVER LAP AT: ", prefixSku);
    } else {
      prefixSkuSet.set(prefixSku);
    }
  }
  const issues = [];
  if (issues.length > 0) {
    console.warn("❌ DATA INTEGRITY ISSUES FOUND:");
    console.warn(JSON.stringify(issues, null, 2));
  }

  return issues;
}
async function FilterOutDuplicate(normalizedData) {
  const skuSet = new Set();
  const result = [];
  let filtered = 0;

  for (const item of normalizedData) {
    const { sku } = parseProductUrl(item.productUrl);

    if (skuSet.has(sku)) {
      filtered++;
      continue; // duplicate → skip
    }

    skuSet.add(sku);
    result.push(item); // first occurrence wins
  }
  console.log("Filter out ", filtered, " result");
  return result;
}

main();

// console.log(parseProductUrl("/ao-len-nu-6te25c001?color=SE137"));
// console.log(
//   parseProductUrl("/bo-mac-nha-nu-sua-mau-6ls25w012-sk011?color=SK011")
// );
// console.log(parseProductUrl("https://canifa.com/2ot25c006?color=SK010"));
//HELPER
function parseProductUrl(rawUrl) {
  try {
    // normalize
    const url = rawUrl.startsWith("http")
      ? new URL(rawUrl)
      : new URL(rawUrl, "https://canifa.com");

    const path = url.pathname.replace(/^\/+/, "");
    const parts = path.split("-");

    let prefix = null;
    let sku = null;
    let color = null;

    // extract color from query
    color = url.searchParams.get("color");

    // CASE 1: has hyphens → prefix + sku (+ maybe color in path)
    if (parts.length >= 2) {
      sku = parts.at(-1);

      // if last part is color-like (sk010), remove it
      if (/^[a-z]{2}\d{3}$/i.test(sku)) {
        color = sku.toUpperCase();
        sku = parts.at(-2);
        prefix = "/" + parts.slice(0, -2).join("-");
      } else {
        prefix = "/" + parts.slice(0, -1).join("-");
      }
    }

    // CASE 2: no hyphens → sku only
    if (!sku && /^[a-z0-9]{6,}$/i.test(path)) {
      sku = path;
    }

    if (!sku) {
      return { valid: false, reason: "SKU_NOT_FOUND", rawUrl };
    }

    return {
      valid: true,
      rawUrl,
      prefix,
      sku,
      color,
    };
  } catch (err) {
    return { valid: false, reason: "URL_PARSE_ERROR", rawUrl };
  }
}
