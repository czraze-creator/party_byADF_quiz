import { chromium } from "playwright";
import fs from "node:fs";

const BASE = "http://localhost:3210";
const ADMIN_PW = process.env.ADMIN_PW;
const browser = await chromium.launch();
const ctx = await browser.newContext();
await ctx.request.post(`${BASE}/api/admin/login`, { data: { password: ADMIN_PW } });

async function captureImages(route, label, expected) {
  const page = await ctx.newPage();
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // Intercept window.print so it doesn't block playwright
  await page.evaluate(() => {
    if (window.contentWindow) return;
    HTMLIFrameElement.prototype.__origContentWindow = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, "contentWindow");
  });

  await page.addInitScript(() => {
    const origPrint = Window.prototype.print;
    Window.prototype.print = function () {
      console.log("print called (intercepted)");
    };
  });

  // Click the Tisknout button
  await page.click("text=Tisknout");

  // Wait for the print iframe (recognised by .sheet wrappers) to render
  await page.waitForFunction(() => {
    const ifs = document.querySelectorAll("iframe");
    for (const f of ifs) {
      const sheets = f.contentDocument?.querySelectorAll(".sheet img");
      if (sheets && sheets.length > 0) {
        return Array.from(sheets).every((i) => i.complete && i.naturalWidth > 0);
      }
    }
    return false;
  }, { timeout: 30000 });

  const urls = await page.evaluate(() => {
    const ifs = document.querySelectorAll("iframe");
    for (const f of ifs) {
      const sheets = f.contentDocument?.querySelectorAll(".sheet img");
      if (sheets && sheets.length > 0) return Array.from(sheets).map((i) => i.src);
    }
    return [];
  });
  console.log(`${label}: ${urls.length} image(s) captured (expected ${expected})`);

  urls.forEach((url, i) => {
    if (!url.startsWith("data:image")) {
      console.warn(`${label}: img ${i+1} not a data URL`);
      return;
    }
    const b64 = url.split(",")[1];
    fs.writeFileSync(`/tmp/${label}-img-${i + 1}.png`, Buffer.from(b64, "base64"));
  });

  await page.close();
}

await captureImages("/admin/qr/invite", "invite", 1);
await captureImages("/admin/qr", "stations", 4);

await browser.close();
