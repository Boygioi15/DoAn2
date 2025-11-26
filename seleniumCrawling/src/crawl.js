const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { Builder, until, By } = require("selenium-webdriver");
const { saveProductData } = require("./productSaver");
const chrome = require("selenium-webdriver/chrome");
const { loadJson } = require("./jsonWorking");
const baseFolder = "../results/images";
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

options.addArguments("--blink-settings=imagesEnabled=false");
options.addArguments("--disable-gpu");
options.addArguments("--disable-extensions");
options.addArguments("--disable-dev-shm-usage");
options.addArguments("--disable-blink-features=AutomationControlled");
options.addArguments("--no-sandbox");
options.addArguments("--disable-background-networking");
options.addArguments("--disable-default-apps");
options.addArguments("--disable-sync");
options.addArguments("--disable-translate");
options.addArguments("--disable-features=site-per-process");

async function loadUrls() {
  const raw = fs.readFileSync("../urls.txt", "utf-8");
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

async function main() {
  const urls = await loadUrls();

  if (urls.length === 0) {
    console.log("No URLs found in urls.txt");
    return;
  }

  console.log("Loaded URLs:", urls);

  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  for (const url of urls) {
    console.log(`Opening: ${url}`);
    await driver.get(url);
    await clickColorsAndDownload(driver, baseFolder);
    // After finishing crawling product details:
    const productJson = await crawlProductData(driver);

    // Save to file
    saveProductData(productJson);
    await driver.sleep(2000); // just to see it open for now
  }
  await driver.sleep(10000);
  await driver.quit();
}
async function clickColorsAndDownload(driver, baseFolder) {
  let colorEls = await driver.findElements(By.css(".product__option-color"));

  console.log("Found colors:", colorEls.length);

  for (let i = 0; i < colorEls.length; i++) {
    // Re-fetch elements to avoid stale references
    colorEls = await driver.findElements(By.css(".product__option-color"));
    const colorEl = colorEls[i];
    const childDiv = await colorEl.findElement(By.css("div")); // get the first child div

    const colorStyle =
      (await childDiv.getAttribute("style")) || `color_${i + 1}`;
    console.log(`Clicking color: ${colorStyle}`);

    // Match the product ID before the first dash in the filename
    // Extract the product ID and color code
    const match = colorStyle.match(/\/([0-9a-z]+)-([0-9a-z]+)-/i);

    const productID = match ? match[1] : null; // "8te25w008"
    const colorCode = match ? match[2] : null; // "sa799"

    console.log("Product ID:", productID);
    console.log("Color code:", colorCode);
    await colorEl.click();
    await driver.sleep(1200); // wait for images to load

    // //create a folder with the product code
    const productFolderPath = path.join(baseFolder, productID);
    if (!fs.existsSync(productFolderPath)) {
      fs.mkdirSync(productFolderPath, { recursive: true });
    }
    const colorFolderPath = path.join(productFolderPath, colorCode);
    if (!fs.existsSync(colorFolderPath)) {
      fs.mkdirSync(colorFolderPath, { recursive: true });
    }

    // // Download all images for this color
    await downloadImagesForColor(driver, colorFolderPath);
  }
}

async function downloadImage(url, folderPath, index) {
  // Ensure folder exists
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const fileName = `image_${index + 1}${path.extname(url.split("?")[0])}`;
  const filePath = path.join(folderPath, fileName);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(fs.createWriteStream(filePath));

  return new Promise((resolve, reject) => {
    response.data.on("end", () => {
      console.log(`Downloaded: ${filePath}`);
      resolve();
    });
    response.data.on("error", (err) => {
      console.error("Download failed:", err);
      reject(err);
    });
  });
}
async function downloadImagesForColor(driver, targetFolder) {
  // Get all image containers
  const imgContainers = await driver.findElements(
    By.css(".hover-zoom-container img")
  );

  console.log("Found images:", imgContainers.length);

  for (let i = 0; i < imgContainers.length; i++) {
    const imgEl = imgContainers[i];
    const src = await imgEl.getAttribute("src");

    if (src) {
      await downloadImage(src, targetFolder, i);
    }
  }
}

async function crawlProductData(driver) {
  const basic = await crawlProductBasicInfo(driver);
  const colorList = await crawlColorList(driver);
  const sizeList = await crawlSizeList(driver);
  const detail = await crawlDescriptionAndProperty(driver);
  const breadcrumb = await crawlBreadcrumb(driver);

  return {
    productName: basic.productName,
    sku: basic.sku,
    displayedPrice: basic.displayedPrice,
    saledPrice: basic.saledPrice,
    description: detail.description,
    property: detail.property,
    colorList,
    sizeList,
    breadcrumb,
  };
}

async function crawlProductBasicInfo(driver) {
  // const html = await driver.getPageSource();
  // console.log(html.includes("product__name"));

  // Product Name
  const productEl = await driver.findElement(By.css(".product__name"));
  const productName = await productEl.getAttribute("innerHTML");
  console.log("PN: ", productName);
  // SKU
  const sku = await driver
    .findElement(By.css(".product__sku-value"))
    .getAttribute("innerHTML");

  // Price handling
  let displayedPrice = null;
  let saledPrice = null;

  const hasSale = await driver.findElements(By.css(".product__price--old"));

  if (hasSale.length > 0) {
    // Sale case
    displayedPrice = await driver
      .findElement(By.css(".product__price--old"))
      .getText();
    saledPrice = await driver
      .findElement(By.css(".product__price--normal"))
      .getText();
  } else {
    // Non-sale case
    displayedPrice = await driver
      .findElement(By.css(".product__price--regular"))
      .getText();
    saledPrice = displayedPrice;
  }

  return { productName, sku, displayedPrice, saledPrice };
}
async function crawlColorList(driver) {
  const optionBlocks = await driver.findElements(
    By.css(".product__options .product__option")
  );
  const colorBlock = optionBlocks[0]; // first block is color

  const colorEls = await colorBlock.findElements(
    By.css(".product__option-items > div")
  );
  const colorList = [];

  for (let i = 0; i < colorEls.length; i++) {
    const colorEl = colorEls[i];
    await colorEl.click();
    await driver.sleep(500); // wait for color name update

    const colorName = await colorBlock
      .findElement(By.css(".product__option-value"))
      .getText();
    colorList.push(colorName);
  }

  return colorList;
}
async function crawlSizeList(driver) {
  const optionBlocks = await driver.findElements(
    By.css(".product__options .product__option")
  );
  const sizeBlock = optionBlocks[1]; // second block is size

  const sizeEls = await sizeBlock.findElements(
    By.css(".product__option-items > div > div")
  );
  const sizeList = [];

  for (let el of sizeEls) {
    sizeList.push(await el.getText());
  }

  return sizeList;
}
async function crawlDescriptionAndProperty(driver) {
  const blocks = await driver.findElements(By.css(".product__detailed-item"));

  let description = "";
  let property = [];

  for (let block of blocks) {
    const title = (
      await block.findElement(By.css(".product__detailed-title")).getText()
    ).trim();

    // Content under this block
    const content = await block
      .findElement(By.css(".product__detailed-content"))
      .getAttribute("innerHTML");

    if (title.includes("Mô tả")) {
      description = content;
    }

    if (title.includes("Chất liệu")) {
      property = content.split("\n"); // each property in one line
    }
  }

  return { description, property };
}
async function crawlBreadcrumb(driver) {
  const crumbs = await driver.findElements(By.css(".breadcrumbs__item"));
  const breadcrumb = [];

  for (let li of crumbs) {
    breadcrumb.push(await li.getText());
  }

  return breadcrumb;
}
main();
