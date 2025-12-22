const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { Builder, until, By } = require("selenium-webdriver");
const { saveProductData } = require("./productSaver");
const chrome = require("selenium-webdriver/chrome");
const { loadJson } = require("./jsonWorking");
const baseFolder = "../results/images";
const slugify = require("slugify");

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

const XLSX = require("xlsx");

async function readFromExcel() {
  const urlPath = path.join("..", "url.xlsx");

  // Correct method for reading from file
  const workbook = XLSX.readFile(urlPath);

  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw_data = XLSX.utils.sheet_to_json(worksheet);
  // console.log("Excel data: ", raw_data);
  return raw_data;
}

async function main() {
  const dataRows = await readFromExcel();

  if (dataRows.length === 0) {
    console.log("No URLs found in url.xlsx");
    return;
  }

  console.log("Loaded URLs:", dataRows);

  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
  let startRowForProduct = 2;
  for (let [index, dataRow] of dataRows.entries()) {
    try {
      console.log(`Opening: `, dataRow);
      if (dataRow.status) {
        console.log("Skip row ", index, dataRow);
        continue;
      }
      await driver.get(dataRow.categoryUrl);

      //handle click load more
      let totalLoadmoreClick = 0;
      let totalProduct = 0;
      //total product is located at toolbar-amount, the value is 44 Sản phẩm, extract the number
      //for every 500ms, if there is button with class toolbar-loadmore__button
      //click, until a check where there is not loadmore anymore

      try {
        const amountSpan = await driver.findElement(By.css(".toolbar-amount"));

        const text = await amountSpan.getAttribute("innerHTML"); // "44 Sản phẩm"
        // console.log("T", text);
        const match = text.match(/\d+/);

        if (match) {
          totalProduct = parseInt(match[0], 10);
        }
      } catch (err) {
        console.log(err);
        console.warn("Could not extract total product count");
      }

      // 2️⃣ Click load more until it no longer exists
      while (true) {
        try {
          const loadMoreBtn = await driver.wait(
            until.elementLocated(By.css(".toolbar-loadmore__button")),
            1000
          );

          // Optional: ensure it's visible & clickable
          await driver.wait(until.elementIsVisible(loadMoreBtn), 1000);

          await loadMoreBtn.click();
          totalLoadmoreClick++;

          // Small delay after click
          await driver.sleep(1000);
        } catch (err) {
          // No more load more button
          break;
        }
      }

      console.log("total loadmore click", totalLoadmoreClick);
      console.log("total product: ", totalProduct);

      const productUrls = await driver.executeScript(() => {
        return Array.from(document.querySelectorAll("a.product-item__image"))
          .map((a) => a.getAttribute("href"))
          .filter(Boolean);
      });

      console.log("Total products found:", productUrls.length);
      // console.log(productUrls.slice(0, 5));
      await writeCategoryProgressExcel(
        index + 2,
        totalProduct,
        productUrls.length
      );
      await populateProductDataExcel(
        startRowForProduct,
        productUrls,
        dataRow.categoryId
      );
      startRowForProduct += productUrls.length;
      // After finishing crawling product details:
      // let productJson = await crawlProductData(driver);
      // productJson = {
      //   ...productJson,
      //   categoryId: dataRow.catId,
      //   url: dataRow.URL,
      // };
      // console.log("PJ: ", productJson);
      // // Save to file
      // saveProductData(productJson);
      // writeDoneToRow(index);
    } catch (error) {
      console.log(error);
    } finally {
      await driver.sleep(2000);
    }
  }
  await driver.quit();
}
main();
function writeCategoryProgressExcel(
  row,
  totalProductGathered,
  totalProductFound
) {
  const excelPath = path.join(__dirname, "..", "url.xlsx");

  // 1️⃣ Read workbook
  const workbook = XLSX.readFile(excelPath);

  // 2️⃣ Get CategoryList sheet
  const sheetName = "CategoryList";
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }

  // 4️⃣ Write progress
  sheet[`C${row}`] = { t: "n", v: totalProductFound };
  sheet[`D${row}`] = { t: "n", v: totalProductGathered };

  // 5️⃣ Auto status
  const status = "DONE";
  sheet[`E${row}`] = { t: "s", v: status };

  // 6️⃣ Write back
  XLSX.writeFile(workbook, excelPath);

  console.log(
    `📊 Category row ${row}: ${totalProductGathered}/${totalProductFound} → ${status}`
  );
}

function populateProductDataExcel(startRow, productUrls, categoryId) {
  const urlPath = path.join(__dirname, "..", "url.xlsx");

  // 1️⃣ Read workbook
  const workbook = XLSX.readFile(urlPath);

  // 2️⃣ Get ProductList sheet
  const sheetName = "ProductList";
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }

  // 3️⃣ Find last row
  let currentRow = startRow; //getLastRow(sheet);

  // 4️⃣ Write each product URL
  productUrls.forEach((url) => {
    sheet[`A${currentRow}`] = { t: "s", v: url }; // productUrl
    sheet[`B${currentRow}`] = { t: "s", v: categoryId }; // categoryId
    currentRow++;
  });

  // 5️⃣ Update sheet range
  sheet["!ref"] = `A1:C${currentRow - 1}`;

  // 6️⃣ Write back to file
  XLSX.writeFile(workbook, urlPath);

  console.log(`✅ Wrote ${productUrls.length} product URLs to Excel`);
}
function getLastRow(sheet) {
  const range = XLSX.utils.decode_range(sheet["!ref"]);
  return range.e.r + 1; // rows are 0-based
}
