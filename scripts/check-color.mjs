import { chromium } from "playwright";
const BASE = "http://localhost:3210";
const ADMIN_PW = process.env.ADMIN_PW;
const browser = await chromium.launch();
const ctx = await browser.newContext();
await ctx.request.post(`${BASE}/api/admin/login`, { data: { password: ADMIN_PW } });
const page = await ctx.newPage();
await page.goto(`${BASE}/admin/qr`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const colors = await page.evaluate(() => {
  const root = window.getComputedStyle(document.documentElement);
  const codeEl = document.querySelector(".text-\\[var\\(--color-accent\\)\\]") || document.querySelector(".qr-print-card div.font-mono");
  const codeStyle = codeEl ? window.getComputedStyle(codeEl) : null;
  return {
    "--color-accent": root.getPropertyValue("--color-accent").trim(),
    codeColor: codeStyle?.color,
    codeText: codeEl?.textContent?.slice(0, 20),
  };
});
console.log(JSON.stringify(colors, null, 2));
await browser.close();
