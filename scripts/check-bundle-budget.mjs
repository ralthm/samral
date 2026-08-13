/**
 * Initial-route JS budget check.
 *
 * Run after `vite build`:  node scripts/check-bundle-budget.mjs
 *
 * Guards the two routes that matter most for cold loads. The budget counts
 * gzipped JS only. If a new feature pushes a route over budget, either trim it
 * or lazy-load it — do not just raise the number without a reason.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const DIST = "dist/assets";

// Chunks the browser must download before /miles-calculator is usable.
const INITIAL_CALCULATOR = [/^index-/, /^jsx-runtime-/, /^MilesCalculator-/, /^milesCalculator-/, /^promotions-/, /^SiteFooter-/, /^createLucideIcon-/, /^track-/, /^plus-/];

// gzip KB
const BUDGETS = {
  "miles-calculator initial JS": 100,
  "largest single chunk": 60,
};

if (!existsSync(DIST)) {
  console.error("dist/assets not found — run `vite build` first.");
  process.exit(1);
}

const files = readdirSync(DIST).filter((f) => f.endsWith(".js"));
const sizes = new Map(
  files.map((f) => [f, gzipSync(readFileSync(join(DIST, f))).length / 1024]),
);

const initial = files.filter((f) => INITIAL_CALCULATOR.some((re) => re.test(f)));
const initialKb = initial.reduce((sum, f) => sum + sizes.get(f), 0);
const largest = Math.max(...sizes.values());

const rows = [
  ["miles-calculator initial JS", initialKb],
  ["largest single chunk", largest],
];

let failed = false;
for (const [label, value] of rows) {
  const budget = BUDGETS[label];
  const ok = value <= budget;
  if (!ok) failed = true;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}: ${value.toFixed(1)} kB gzip (budget ${budget} kB)`);
}

console.log("\nDeferred chunks (loaded on demand):");
for (const f of files.filter((f) => !initial.includes(f)).sort((a, b) => sizes.get(b) - sizes.get(a))) {
  console.log(`  ${f.padEnd(40)} ${sizes.get(f).toFixed(1)} kB gzip`);
}

process.exit(failed ? 1 : 0);
