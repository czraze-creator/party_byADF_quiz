// Render DOM elements to PNG via html2canvas, then send them to the
// browser's print dialog as a borderless image-only document.
//
// Why: home/office printers reproduce CSS gradients, filters and
// backdrop-filter very inconsistently. Rasterising the card on the
// client first means the printer just inks what it already sees as
// pixels — no per-printer fudging. The price is a brief delay while
// html2canvas runs.

type PrintAsImageOptions = {
  // CSS @page size string ("A5", "148mm 105mm", etc.)
  pageSize: string;
  // mm width × height of each printed image (must match pageSize box)
  widthMm: number;
  heightMm: number;
  // px-per-mm at which to rasterise. Default 8 (≈ 200 dpi) — sharp on paper.
  pxPerMm?: number;
};

export async function printElementsAsImages(
  elements: Element[],
  { pageSize, widthMm, heightMm, pxPerMm = 8 }: PrintAsImageOptions,
): Promise<void> {
  if (elements.length === 0) return;
  const { default: html2canvas } = await import("html2canvas");

  const widthPx = Math.round(widthMm * pxPerMm);
  const heightPx = Math.round(heightMm * pxPerMm);

  const dataUrls: string[] = [];
  for (const el of elements) {
    const canvas = await html2canvas(el as HTMLElement, {
      backgroundColor: "#051427",
      useCORS: true,
      // Scale to hit the target physical resolution regardless of the
      // element's actual on-screen size.
      scale: Math.max(1, widthPx / (el as HTMLElement).offsetWidth),
      logging: false,
    });
    dataUrls.push(canvas.toDataURL("image/png"));
  }

  // Build a tiny standalone document and print it from an iframe so we
  // never block the parent window or fight a popup blocker.
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8" />
    <title>Print</title>
    <style>
      @page { size: ${pageSize}; margin: 0; }
      html, body { margin: 0; padding: 0; background: #fff; }
      .sheet {
        width: ${widthMm}mm;
        height: ${heightMm}mm;
        display: block;
        page-break-after: always;
        break-after: page;
      }
      .sheet:last-child { page-break-after: auto; break-after: auto; }
      img { width: 100%; height: 100%; display: block; }
    </style></head><body>
    ${dataUrls.map((u) => `<div class="sheet"><img src="${u}" /></div>`).join("")}
    </body></html>`;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(html);
  doc.close();

  // Wait for the embedded images to decode before printing.
  await new Promise<void>((resolve) => {
    const imgs = Array.from(doc.images);
    if (imgs.length === 0) return resolve();
    let left = imgs.length;
    const done = () => {
      if (--left === 0) resolve();
    };
    imgs.forEach((img) => {
      if (img.complete) done();
      else {
        img.addEventListener("load", done);
        img.addEventListener("error", done);
      }
    });
  });

  iframe.contentWindow?.focus();
  iframe.contentWindow?.print();

  // Clean up shortly after the print dialog closes. Browsers fire no
  // reliable event here, so we just wait long enough that the user has
  // either printed or cancelled.
  window.setTimeout(() => {
    iframe.remove();
  }, 60_000);
}

// Print a list of pre-rendered PNG URLs (one per page). Simpler sibling
// of printElementsAsImages — no DOM capture, just an iframe document
// with one image per sheet. Used by the admin print routes since live
// rendering kept drifting from the approved screenshot designs.
export async function printImageUrls(
  urls: string[],
  { pageSize, widthMm, heightMm }: Omit<PrintAsImageOptions, "pxPerMm">,
): Promise<void> {
  if (urls.length === 0) return;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8" />
    <title>Print</title>
    <style>
      @page { size: ${pageSize}; margin: 0; }
      html, body { margin: 0; padding: 0; background: #fff; }
      .sheet {
        width: ${widthMm}mm;
        height: ${heightMm}mm;
        display: block;
        page-break-after: always;
        break-after: page;
      }
      .sheet:last-child { page-break-after: auto; break-after: auto; }
      img { width: 100%; height: 100%; display: block; object-fit: cover; }
    </style></head><body>
    ${urls.map((u) => `<div class="sheet"><img src="${u}" /></div>`).join("")}
    </body></html>`;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(html);
  doc.close();

  await new Promise<void>((resolve) => {
    const imgs = Array.from(doc.images);
    if (imgs.length === 0) return resolve();
    let left = imgs.length;
    const done = () => {
      if (--left === 0) resolve();
    };
    imgs.forEach((img) => {
      if (img.complete) done();
      else {
        img.addEventListener("load", done);
        img.addEventListener("error", done);
      }
    });
  });

  iframe.contentWindow?.focus();
  iframe.contentWindow?.print();

  window.setTimeout(() => {
    iframe.remove();
  }, 60_000);
}
