"use strict";
/**
 * 2014 sexagesimal upstream-source SFT.
 * The exact original 2014 Git text blobs are preserved as raw_text in the JSON
 * resource; no external network or unknown LP2 ciphertext is required.
 * Run: node sims/cicada2014_sexagesimal_upstream_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const source = JSON.parse(fs.readFileSync(
  path.join(root, "resources/external/cicada2014-stage11-original-transcriptions.json"), "utf8"));
const archive = JSON.parse(fs.readFileSync(
  path.join(root, "resources/cicada2014-sexagesimal-source.json"), "utf8"));
const printed = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/base60-grid.json"), "utf8"));

assert.equal(source.files.length, 3);
const texts = source.files.map((file, i) => {
  const bytes = Buffer.from(file.raw_text, "utf8");
  const sha = crypto.createHash("sha1")
    .update("blob " + bytes.length + "\0")
    .update(bytes).digest("hex");
  assert.equal(sha, file.git_blob_sha1, "original 2014 page " + (49 + i));
  return file.raw_text;
});
const tokens = texts.flatMap((txt) => txt.split(/\r?\n\s*\r?\n/)[0]
  .trim().split(/\s+/));
assert.equal(tokens.length, 256);
assert.equal(printed.alphabet.length, 60);

const values = tokens.map((token) => {
  assert.equal(token.length, 2);
  const a = printed.alphabet.indexOf(token[0]);
  const b = printed.alphabet.indexOf(token[1]);
  assert.ok(a >= 0 && b >= 0);
  const result = a * 60 + b;
  assert.ok(result >= 0 && result <= 255);
  return result;
});
assert.deepEqual(values, archive.decimal_values);
const binary = Buffer.from(values);
assert.equal(binary.toString("hex"), archive.binary_hex);
assert.equal(crypto.createHash("sha256").update(binary).digest("hex"),
  archive.source_sha256.binary);

const lp2Tokens = printed.rows.flat();
assert.equal(lp2Tokens.length, 256);
const disagreements = tokens.flatMap((token, i) => token === lp2Tokens[i] ? [] : [i]);
assert.deepEqual(disagreements, [25, 45, 50, 165, 170, 172, 175, 182, 199, 246]);

// Unlike the preceding token block, the original 50.txt lower numeric block
// already contains the three exact corrections, explicitly annotated in 2014.
const numeric = texts[1].split(/\r?\n\s*\r?\n/)[1].trim().split(/\r?\n/)
  .map(line => line.trim().split(/\s+/).slice(0, 8).map(Number));
assert.equal(numeric.length, 13);
assert.ok(numeric.every(row => row.length === 8 && row.every(Number.isInteger)));
assert.match(texts[1], /<-------CORRECTED\. Previously 233 217 192 82 105 47 250 248/);
assert.match(texts[1], /<-------CORRECTED\. Previously 240 228 194 54 174 117 209 44/);
const corrections = [
  { index: 165, oldToken: "0l", oldValue: 47, newValue: 18, newToken: "0I" },
  { index: 170, oldToken: "3E", oldValue: 194, newValue: 254, newToken: "4E" },
  { index: 172, oldToken: "2s", oldValue: 174, newValue: 148, newToken: "2S" }
];
for (const entry of corrections) {
  const local = entry.index - 80;
  assert.equal(tokens[entry.index], entry.oldToken);
  assert.equal(values[entry.index], entry.oldValue);
  assert.equal(numeric[Math.floor(local / 8)][local % 8], entry.newValue);
  assert.equal(lp2Tokens[entry.index], entry.newToken);
}
const remaining = disagreements.filter(i => !corrections.some(c => c.index === i));
assert.deepEqual(remaining, [25, 45, 50, 175, 182, 199, 246]);

console.log(JSON.stringify({
  originalSource: source.first_committed_ref,
  tokens: values.length,
  bytesRecovered: binary.length,
  sourceSha256: archive.source_sha256.binary,
  originalPrintedDisagreements: disagreements,
  explicitlyCorrectedButUnpropagated: corrections,
  remainingPureCaseDisagreements: remaining
}, null, 2));
