"use strict";
/** Regression for all 256 base60 LP2 grid cells (pages 49–51).
 * The reference JSON is derived from the runic master; the page JPEGs
 * remain authoritative for disputed typography.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const master = fs.readFileSync(path.join(ROOT, "resources/transcriptions/liber_primus_master.txt"), "utf8");
const start = master.indexOf("ᛋᚻᛖᚩᚷᛗᛡᚠ");
assert.ok(start > 0);
const pages = master.slice(start).split("%");

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
assert.equal(data.alphabet, alphabet);
assert.deepEqual(data.pages.map(p => [p.page, p.rows, p.cols, p.tokens.length]), [
  [49, 10, 8, 80], [50, 13, 8, 104], [51, 9, 8, 72]
]);

const extracted = [];
for (const block of data.pages) {
  const tokens = pages[block.page].match(/(?<![A-Za-z0-9])[0-4][0-9A-Za-z](?![A-Za-z0-9])/g) || [];
  assert.deepEqual(block.tokens, tokens);
  const bytes = tokens.map(token => alphabet.indexOf(token[0]) * 60 + alphabet.indexOf(token[1]));
  assert.ok(bytes.every(n => Number.isInteger(n) && n >= 0 && n < 256));
  assert.deepEqual(block.bytes, bytes);
  extracted.push(...bytes);
}
assert.deepEqual(data.bytes, extracted);
assert.equal(extracted.length, 256);

const sha = crypto.createHash("sha256").update(Buffer.from(extracted)).digest("hex");
assert.equal(sha, "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
console.log(JSON.stringify({
  status: "pass",
  imagePageBlocks: data.pages.map(p => ({ page: p.page, image: p.image, cells: p.tokens.length })),
  byteCount: extracted.length,
  sha256: sha,
  distinctByteValues: new Set(extracted).size
}, null, 2));
