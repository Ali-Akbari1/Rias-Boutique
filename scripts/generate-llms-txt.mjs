// Generates public/llms.txt: a plain Markdown summary of the store for AI
// assistants (https://llmstxt.org). Runs before each build alongside the sitemap.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(scriptDir, "..");
const productsPath = join(projectRoot, "src", "content", "products.json");
const routeManifestPath = join(projectRoot, "src", "features", "navigation", "route-manifest.data.json");
const outputPath = join(projectRoot, "public", "llms.txt");

const routeManifest = JSON.parse(readFileSync(routeManifestPath, "utf8"));
const siteUrl = (process.env.SITE_URL ?? routeManifest.siteUrl ?? "https://www.riasboutique.com").replace(/\/+$/, "");

// Same env vars and defaults as src/shared/config/commerce.ts.
const toMinor = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : fallback;
};
const freeShippingThreshold = toMinor(process.env.FREE_SHIPPING_THRESHOLD_MINOR, 40_000) / 100;
const flatRate = toMinor(process.env.FLAT_SHIPPING_RATE_MINOR, 3_000) / 100;
const intlRate =
  toMinor(process.env.FLAT_SHIPPING_RATE_INTL_MINOR ?? process.env.VITE_FLAT_SHIPPING_RATE_INTL_MINOR, 4_000) / 100;
const cad = (value) => `CA$${value.toFixed(2)}`;

// Mirrors normalizeAvailability in src/features/catalog/data/products.ts.
const isSoldOut = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value <= 0;
  const normalized = String(value ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return ["sold_out", "out_of_stock", "unavailable"].includes(normalized);
};

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

const rawProducts = JSON.parse(readFileSync(productsPath, "utf8"));
const seen = new Set();
const products = [];
for (const row of Array.isArray(rawProducts.products) ? rawProducts.products : []) {
  const id = clean(row?.id ?? row?.slug);
  const name = clean(row?.name);
  if (!id || !name || seen.has(id)) continue;
  seen.add(id);

  const price = Number(row.price);
  const priceLabel =
    row.price_on_inquiry === true || !Number.isFinite(price) || price <= 0 ? "price on request" : cad(price);
  const soldOut = isSoldOut(row.inventory);
  const details = [priceLabel, soldOut ? "sold out" : "in stock", clean(row.category), clean(row.fabric)]
    .filter(Boolean)
    .join(", ");
  const description = clean(row.description);

  products.push({
    department: clean(row.department).toLowerCase() || "women",
    soldOut,
    line: `- [${name}](${siteUrl}/products/${encodeURIComponent(id)}): ${details}${description ? `. ${description}` : ""}`,
  });
}

const sections = [
  ["women", "Women's Products"],
  ["men", "Men's Products"],
  ["jewelry", "Jewelry"],
];

const productSections = sections
  .map(([department, heading]) => {
    const items = products
      .filter((product) => product.department === department)
      .sort((a, b) => Number(a.soldOut) - Number(b.soldOut));
    return items.length ? [`## ${heading}`, "", ...items.map((item) => item.line), ""].join("\n") : "";
  })
  .filter(Boolean);

const content = [
  "# Ria's Boutique",
  "",
  "> Afghan clothing boutique in Balzac, Alberta (Calgary area), Canada. Sells handcrafted Afghan dresses, bridal wear, men's traditional clothing (parantoban), and 925 silver jewelry online with shipping worldwide, and in person at the store.",
  "",
  "Ria's Boutique specializes in traditional Afghan styles such as cheerma dozi (hand embroidery), Banaras, gulabatoon, Hazaragi, and Kochi dresses. Prices are in Canadian dollars (CAD).",
  "",
  "## Store Information",
  "",
  "- Address: 260300 Writing Creek Cres Floor 1, Unit H10B, Balzac, AB T4A 0X8, Canada",
  "- Hours: 11:00 AM - 6:00 PM",
  "- Phone: +1 (403) 465-0640",
  "- Email: rias.afghanboutique@gmail.com",
  "- Instagram: https://www.instagram.com/riasboutique__/",
  `- Shipping: ${cad(flatRate)} flat rate in Canada (free on orders over ${cad(freeShippingThreshold)}, Canada only); ${cad(intlRate)} to the US and internationally. Canada and US delivery takes 5-10 business days; orders ship within 1-3 business days.`,
  "- Local pickup is available at the Balzac store.",
  "- Returns: all sales are final; no returns, exchanges, or refunds.",
  "- Custom and pre-order items: at least 4 weeks of production plus about 2 weeks of shipping.",
  "",
  "## Main Pages",
  "",
  `- [Home](${siteUrl}/): Featured collections and new arrivals`,
  `- [All Products](${siteUrl}/collection): Full catalog`,
  `- [Women's Collection](${siteUrl}/collection/women): Afghan dresses and bridal wear`,
  `- [Men's Collection](${siteUrl}/collection/men): Parantoban and men's traditional clothing`,
  `- [Jewelry](${siteUrl}/collection/jewelry): 925 silver jewelry sets`,
  `- [About](${siteUrl}/about): About the boutique`,
  `- [Location](${siteUrl}/location): Store address, hours, and directions`,
  `- [FAQ](${siteUrl}/faq): Sizing, shipping, returns, and ordering`,
  "",
  ...productSections,
].join("\n");

writeFileSync(outputPath, content, "utf8");
console.log(`[llms.txt] wrote ${products.length} products -> ${outputPath}`);
