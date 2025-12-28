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

let options = new chrome.Options();

async function main() {
  const products = loadJson("../results/products.json");
  const productsArray = Object.values(products); // [ {}, {}, ... ]
  //load via frontend
  // const tasks = Object.values(products).map(async (product, index) => {
  //   let driver = await new Builder().forBrowser("chrome").build();
  //   await addProductToAdminViaFrontend(driver, product);
  // });
  //load via JSON

  for (let [index, product] of productsArray.entries()) {
    console.log("PROGRESS: ", index, "/", productsArray.length);
    try {
      await addProductToAdminViaJSON(product);
      product.done = true; // FIXED
    } catch (error) {
      console.log("FAILED AT ", product.sku);
      console.log(error);
    }
  }
  saveJson(PRODUCT_JSON_PATH, products);
}

async function addProductToAdminViaFrontend(driver, product) {
  await driver.get("http://localhost:5173/edit-product");

  // Fill text fields
  await driver
    .findElement(By.id("basicinfo-name"))
    .sendKeys(product.productName);
  await driver
    .findElement(By.id("category-input"))
    .sendKeys(product.categoryId);
  await uploadThumbnail(driver, product);

  for (let i = 0; i < product.property.length; i++) {
    // Clean <br> and </br> tags
    const clean = product.property[i].replace(/<br\s*\/?>/gi, "").trim();

    // Split into name and value
    const [pName, pValue] = clean.split(":").map((s) => s.trim());

    console.log("pName:", pName, "pValue:", pValue);

    // Send keys
    if (pName)
      await driver.findElement(By.id(`property-i-${i}`)).sendKeys(pName);
    if (pValue)
      await driver.findElement(By.id(`property-v-${i}`)).sendKeys(pValue);
    if (pName && pValue) {
      const buttonEl = driver.findElement(By.id("add-new-property"));
      await driver.executeScript("arguments[0].click();", buttonEl);
    }
  }

  await driver.findElement(By.css(".ql-editor")).sendKeys(product.description);

  await uploadColorImages(driver, product);
  await inputSizeList(driver, product);

  console.log(`✅ Finished type product ${product.sku}`);

  const price = parseVND(product.displayedPrice);
  await driver.findElement(By.id("all-price")).sendKeys(price);
  await driver.findElement(By.id("all-stock")).sendKeys("20");
  await driver
    .findElement(By.id("all-seller-sku"))
    .sendKeys(slugify(product.productName, slugifyOption));
  let buttonEl = await driver.findElement(By.id("apply-all-submit"));
  await driver.executeScript("arguments[0].click();", buttonEl);

  await driver.sleep(3000);
  buttonEl = await driver.findElement(By.id("submit-button"));
  await driver.executeScript("arguments[0].click();", buttonEl);
}
async function addProductToAdminViaJSON(product) {
  if (product.done) {
    console.log("Product was done!");
    return;
  }
  console.log("Working on: ", product);
  const formData = await formFormDataJSON(product);
  const response = await axios.post("http://localhost:3000/product", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
async function formFormDataJSON(product) {
  const formData = new FormData();
  formData.append("productName", product.productName);
  formData.append("categoryId", product.categoryId);

  const thumbnailFilePath = getFirstImageOfFirstFolder(product);
  console.log("TF path: ", thumbnailFilePath);
  // Append file correctly
  formData.append("thumbnailFile", fs.createReadStream(thumbnailFilePath), {
    filename: thumbnailFilePath.split("/").pop(), // make sure to send a filename
    contentType: "image/jpeg", // set MIME type if known
  });

  let propertyList = [];
  for (let i = 0; i < product.property.length; i++) {
    // Clean <br> and </br> tags
    const clean = product.property[i].replace(/<br\s*\/?>/gi, "").trim();
    const [pName, pValue] = clean.split(":").map((s) => s.trim());
    if (pName && pValue) {
      propertyList.push({ name: pName, value: pValue });
    }
  }
  propertyList = JSON.stringify(propertyList);
  formData.append("propertyList", propertyList);
  formData.append("description", product.description);
  formData.append("sizeGuidance", JSON.stringify(product.sizeGuidance));
  formData.append("totalVariant", 2);

  const variant1Data = {
    index: 0,
    name: "Màu sắc",
    valueList: [],
  };
  const colorCodeTempIdMap = new Map();
  product.colorList.forEach((color) => {
    const lastWord = color.match(/\w+$/)[0];
    const tempid = v4();
    colorCodeTempIdMap.set(lastWord, tempid);
    variant1Data.valueList.push({
      value: color,
      tempId: tempid,
    });
  });
  console.log("Map: ", colorCodeTempIdMap);

  //path to folder
  for (let i = 0; i < product.colorList.length; i++) {
    const colorName = product.colorList[i];
    const lastWord = colorName.match(/\w+$/)[0];
    // Example: ../images/3ot25w005/sk010/
    const imagesPath = path.join(
      __dirname,
      "..",
      "results",
      "images",
      product.sku,
      lastWord.toLowerCase()
    );

    const files = fs
      .readdirSync(imagesPath)
      .map((file) => path.join(imagesPath, file));

    const tempIdMatch = colorCodeTempIdMap.get(lastWord);

    for (const filePath of files) {
      console.log(filePath);

      formData.append(`v1_${tempIdMatch}`, fs.createReadStream(filePath), {
        filename: path.basename(filePath), // just the file name
        contentType: "image/jpeg", // set MIME type if known
      });
    }
  }
  const variant2Data = {
    index: 1,
    name: "Kích thước",
    valueList: [],
  };
  product.sizeList.forEach((size) => {
    variant2Data.valueList.push({
      value: size,
      tempId: v4(),
    });
  });

  const variantTableData = [];
  for (let i = 0; i < variant1Data.valueList.length; i++) {
    for (let j = 0; j < variant2Data.valueList.length; j++) {
      const index = i * variant2Data.valueList.length + j + 1;
      const offset = j;
      const sellingPrice = parseVND(product.displayedPrice) + offset * 10000;

      const toPush = {
        seller_sku: slugify(product.productName, slugifyOption) + `-${index}`,
        sellingPrice: sellingPrice,
        stock: 20,
        isInUse: true,
        isOpenToSale: true,
        v1_name: variant1Data.valueList[i].value,
        v1_tempId: variant1Data.valueList[i].tempId,
        v2_name: variant2Data.valueList[j].value,
        v2_tempId: variant2Data.valueList[j].tempId,
      };
      variantTableData.push(toPush);
    }
  }

  formData.append("variant1Data", JSON.stringify(variant1Data));
  formData.append("variant2Data", JSON.stringify(variant2Data));
  formData.append("variantTableData", JSON.stringify(variantTableData));

  console.log("v1: ", JSON.stringify(variant1Data));
  console.log("v2: ", JSON.stringify(variant2Data));
  console.log("Vtable: ", variantTableData);
  console.log("-----");
  console.log("-----");
  console.log("-----");
  return formData;
}
async function uploadThumbnail(driver, product) {
  const imagePath = getFirstImageOfFirstFolder(product);

  const uploadInput = await driver.wait(
    until.elementLocated(By.id("upload-component-input")),
    5000
  );

  await uploadInput.sendKeys(imagePath);

  // Wait for upload animation (optional)
  await driver.sleep(1000);
}
function getFirstImageOfFirstFolder(product) {
  // 1️⃣ Build imagesPath
  const imagesPath = path.join(
    __dirname,
    "..",
    "results",
    "images",
    product.sku
  );

  if (!fs.existsSync(imagesPath)) {
    throw new Error(`Images path does not exist: ${imagesPath}`);
  }

  // 2️⃣ Read first folder inside imagesPath
  const folders = fs
    .readdirSync(imagesPath)
    .filter((name) => fs.lstatSync(path.join(imagesPath, name)).isDirectory());

  if (folders.length === 0) {
    throw new Error(`No folders found inside: ${imagesPath}`);
  }

  const firstFolder = path.join(imagesPath, folders[0]);

  // 3️⃣ Read first image inside firstFolder
  const images = fs
    .readdirSync(firstFolder)
    .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file));

  if (images.length === 0) {
    throw new Error(`No images found inside: ${firstFolder}`);
  }

  const firstImagePath = path.join(firstFolder, images[0]);

  // 4️⃣ Return absolute path
  return path.resolve(firstImagePath);
}
async function uploadColorImages(driver, product) {
  for (let i = 0; i < product.colorList.length; i++) {
    const colorName = product.colorList[i];
    const lastWord = colorName.match(/\w+$/)[0];
    console.log("CN: ", colorName);
    // Example: ../images/3ot25w005/sk010/
    const imagesPath = path.join(
      __dirname,
      "..",
      "results",
      "images",
      product.sku,
      lastWord.toLowerCase()
    );

    // console.log("Uploading images from:", imagesPath);

    // 1. Find the div for this color
    const colorDiv = await driver.findElement(By.id(`option-value-0-${i}`));
    // console.log("cD: ", colorDiv);
    // console.log("cD HTML: ", await colorDiv.getAttribute("innerHTML"));
    // 2. Locate the first input inside that div → type color name
    const nameInput = await colorDiv.findElement(By.css("input"));
    // console.log("cDI: ", nameInput);
    // console.log("cDI HTML: ", await nameInput.getAttribute("innerHTML"));
    await nameInput.sendKeys(colorName);

    // 3. Locate the file input (inside same div)
    // Usually something like: input[type='file']
    const fileInput = await colorDiv.findElement(By.css("input[type='file']"));
    // 4. Collect all files in the folder
    const files = fs
      .readdirSync(imagesPath)
      .map((file) => path.join(imagesPath, file));

    // 5. Upload all files
    // Selenium accepts multiple files separated by \n
    await fileInput.sendKeys(files.join("\n"));

    console.log(`Uploaded ${files.length} file(s) for color: ${colorName}`);

    // Optional: wait for preview images to load
  }
}
async function inputSizeList(driver, product) {
  for (let i = 0; i < product.sizeList.length; i++) {
    const sizeName = product.sizeList[i];
    // 1. Find the div for this color
    const sizeDiv = await driver.findElement(By.id(`option-value-1-${i}`));
    const nameInput = await sizeDiv.findElement(By.css("input"));
    await nameInput.sendKeys(sizeName);
  }
}
main();
function parseVND(priceStr) {
  return Number(priceStr.replace(/[^\d]/g, ""));
}
