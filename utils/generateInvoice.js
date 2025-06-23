const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs").promises;

async function generateInvoice(data) {
  const templatePath = path.join(__dirname, "../templates/b2b_invoice.hbs");
  const htmlTemplate = await fs.readFile(templatePath, "utf8");
  const template = handlebars.compile(htmlTemplate);
  const html = template(data);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.emulateMediaType("screen");

  // Set viewport to 80mm width (80mm * 96dpi / 25.4mm/inch ≈ 302px)
  const widthPx = 302;
  await page.setViewport({ width: widthPx, height: 100 });

  // Reset default margins/padding
  await page.evaluate(() => {
    document.body.style.margin = "0";
    document.documentElement.style.margin = "0";
  });

  // Calculate content height
  const contentHeight = await page.evaluate(() => {
    const body = document.body;
    const html = document.documentElement;
    const height = Math.max(body.offsetHeight, html.offsetHeight);
    return height;
  });

  // Generate PDF as a buffer
  const pdfBuffer = await page.pdf({
    width: "80mm",
    height: `${contentHeight}px`,
    printBackground: true,
    margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
  });

  await browser.close();
  console.log("PDF buffer generated, size:", pdfBuffer.length, "bytes");
  return pdfBuffer;
}

module.exports = generateInvoice;
