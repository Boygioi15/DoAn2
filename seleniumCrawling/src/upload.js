const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { Builder, until, By } = require("selenium-webdriver");
const { saveProductData } = require("./productSaver");
const chrome = require("selenium-webdriver/chrome");
const { loadJson } = require("./jsonWorking");
const slugify = require("slugify");

const slugifyOption = {
  replacement: "-", // replace spaces with replacement character, defaults to `-`
  remove: undefined, // remove characters that match regex, defaults to `undefined`
  lower: true, // convert to lower case, defaults to `false`
  strict: false, // strip special characters except replacement, defaults to `false`
  locale: "vi", // language code of the locale to use
  trim: true, // trim leading and trailing replacement chars, defaults to `true`
};

let options = new chrome.Options();

// options.addArguments("--blink-settings=imagesEnabled=false");
// options.addArguments("--disable-gpu");
// options.addArguments("--disable-extensions");
// options.addArguments("--disable-dev-shm-usage");
// options.addArguments("--disable-blink-features=AutomationControlled");
// options.addArguments("--no-sandbox");
// options.addArguments("--disable-background-networking");
// options.addArguments("--disable-default-apps");
// options.addArguments("--disable-sync");
// options.addArguments("--disable-translate");
// options.addArguments("--disable-features=site-per-process");

async function main() {
  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  // json loading
  const products = loadJson("../results/products.json");

  const tasks = Object.values(products).map((product) =>
    processProduct(product)
  );

  await Promise.all(tasks); // run all in parallel
}
async function processProduct(product) {
  let driver = await new Builder().forBrowser("chrome").build();

  await addProductToAdmin(driver, product);
}

async function addProductToAdmin(driver, product) {
  await driver.get("http://localhost:5173/add-product");

  // Fill text fields
  await driver
    .findElement(By.id("basicinfo-name"))
    .sendKeys(product.productName);
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
    const buttonEl = driver.findElement(By.id("add-new-property"));
    await driver.executeScript("arguments[0].click();", buttonEl);
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
  const buttonEl = await driver.findElement(By.id("apply-all-submit"));
  await driver.executeScript("arguments[0].click();", buttonEl);
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
