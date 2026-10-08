// modules/agents/utils/downloadIdCard.ts
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

const W = 638;
const H = 1011;

/** Fetch every <img> as a data URL so the canvas is never tainted. */
async function inlineImages(root: HTMLElement) {
  const imgs = Array.from(root.querySelectorAll("img"));
  const originals: [HTMLImageElement, string][] = [];

  await Promise.all(
    imgs.map(async (img) => {
      const src = img.getAttribute("src");
      if (!src || src.startsWith("data:")) return;
      try {
        const res = await fetch(src, { mode: "cors", cache: "no-cache" });
        const blob = await res.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.onerror = reject;
          r.readAsDataURL(blob);
        });
        originals.push([img, src]);
        img.src = dataUrl;
        await img.decode().catch(() => {});
      } catch {
        /* leave as-is if fetch fails */
      }
    }),
  );

  return () => originals.forEach(([img, src]) => (img.src = src));
}

async function render(node: HTMLElement, pixelRatio = 1) {
  const restore = await inlineImages(node);
  try {
    // first call warms up fonts/images (known html-to-image quirk)
    await toPng(node, { width: W, height: H, pixelRatio, cacheBust: true });
    return await toPng(node, {
      width: W,
      height: H,
      pixelRatio,
      cacheBust: true,
      backgroundColor: "#ffffff",
      style: { transform: "none", margin: "0" },
    });
  } finally {
    restore();
  }
}

function save(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function downloadIdCardPng(node: HTMLElement, filename: string) {
  const dataUrl = await render(node, 2);
  save(dataUrl, `${filename}.png`);
}

export async function downloadIdCardPdf(node: HTMLElement, filename: string) {
  const dataUrl = await render(node, 2);
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [54, 85.6],
  });
  pdf.addImage(dataUrl, "PNG", 0, 0, 54, 85.6);
  pdf.save(`${filename}.pdf`);
}
