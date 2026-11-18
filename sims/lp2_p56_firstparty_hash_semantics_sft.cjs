"use strict";

/**
 * Source-semantic census for the LP2 p56 deep-web digest.
 *
 * Separates OpenPGP clear-signature Hash: metadata from authored message text
 * and asks whether the pinned authenticated 2012-2016 Cicada messages actually
 * specify a page-hash family, serialization, or byte boundary.
 *
 * Run:
 *   node sims/lp2_p56_firstparty_hash_semantics_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const historical = path.join(root, "resources", "historical");
const manifestPath = path.join(root, "resources", "cicada2014-archive-hash-manifest.json");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const targetHex = manifest.targetHex;

assert.match(targetHex, /^[0-9a-f]{128}$/);
assert.equal(targetHex.length, 128);

/**
 * Extract OpenPGP clear-signature metadata and authored body.
 * @param {string} source
 * @returns {{hashHeader: string | null, body: string}}
 */
function parseClearSigned(source) {
  const signatureMarker = "-----BEGIN PGP SIGNATURE-----";
  const markerAt = source.indexOf(signatureMarker);
  assert.ok(markerAt >= 0, "missing PGP signature marker");

  const signedPart = source.slice(0, markerAt);
  const normalized = signedPart.replace(/\r\n/g, "\n");
  const headerEnd = normalized.indexOf("\n\n");
  assert.ok(headerEnd >= 0, "missing clear-signature header/body separator");

  const header = normalized.slice(0, headerEnd);
  const hashMatch = header.match(/^Hash:\s*(.+)$/mi);

  return {
    hashHeader: hashMatch ? hashMatch[1].trim() : null,
    body: normalized.slice(headerEnd + 2)
  };
}

const files = fs.readdirSync(historical)
  .filter((name) => /^cicada201[2-6].*[.]asc$/i.test(name))
  .sort();

assert.equal(files.length, 16, "expected the pinned 2012-2016 authenticated-message census");

const semanticPattern = /\b(?:hash(?:es|ed|ing)?|digest|checksum|sha-?(?:1|2|3|224|256|384|512)?|whirlpool|blake2?|skein|streebog)\b/gi;

/** @type {Array<{file:string, hashHeader:string|null, bodyTerms:string[], targetPresent:boolean, targetPrefixPresent:boolean}>} */
const rows = [];

for (const file of files) {
  const source = fs.readFileSync(path.join(historical, file), "utf8");
  assert.ok(source.includes("-----BEGIN PGP SIGNED MESSAGE-----"), `${file}: not clear-signed`);

  const parsed = parseClearSigned(source);
  const bodyTerms = [...parsed.body.matchAll(semanticPattern)].map((match) => match[0]);

  rows.push({
    file,
    hashHeader: parsed.hashHeader,
    bodyTerms,
    targetPresent: parsed.body.toLowerCase().includes(targetHex),
    targetPrefixPresent: parsed.body.toLowerCase().includes(targetHex.slice(0, 26))
  });
}

const authoredSemanticHits = rows.filter((row) => row.bodyTerms.length > 0);
const targetHits = rows.filter((row) => row.targetPresent || row.targetPrefixPresent);
const headerCounts = rows.reduce((counts, row) => {
  const key = row.hashHeader || "<missing>";
  counts[key] = (counts[key] || 0) + 1;
  return counts;
}, {});

console.log(JSON.stringify({
  targetHex,
  targetBytes: targetHex.length / 2,
  authenticatedMessages2012to2016: rows.length,
  headerCounts,
  authoredSemanticHits,
  targetHits,
  rows
}, null, 2));

assert.deepEqual(headerCounts, { SHA1: 16 });
assert.equal(authoredSemanticHits.length, 0, "unexpected authored hash-semantic term in authenticated message body");
assert.equal(targetHits.length, 0, "p56 target unexpectedly appears in a pre-2017 signed message body");

const htmlFiles = [
  "cicada2014-onion7-index.html",
  "external/2014-stage03-index.html",
  "external/2014-stage04-index.html",
  "external/2014-stage10-post-square-response.html",
  "external/cicada2014-stage11-index-archived.html",
  "external/cicada2014-stage11-onion7-original-index.html",
  "historical/cicada2014-onion2-20140107-170byte.html",
  "historical/cicada2014-onion2-20140107-201byte.html",
  "historical/cicada2014-onion7-index.html",
  "historical/stage11-2014-index.html"
];

/** @type {Array<{file:string, semanticTerms:string[], targetPrefixPresent:boolean}>} */
const htmlRows = [];
for (const relative of htmlFiles) {
  const source = fs.readFileSync(path.join(root, "resources", relative), "utf8");
  htmlRows.push({
    file: relative,
    semanticTerms: [...source.matchAll(semanticPattern)].map((match) => match[0]),
    targetPrefixPresent: source.toLowerCase().includes(targetHex.slice(0, 26))
  });
}

const htmlSemanticHits = htmlRows.filter((row) => row.semanticTerms.length > 0);
const htmlTargetHits = htmlRows.filter((row) => row.targetPrefixPresent);
assert.equal(htmlSemanticHits.length, 0, "unexpected hash-semantic term in preserved 2014 HTML source");
assert.equal(htmlTargetHits.length, 0, "p56 target unexpectedly appears in preserved 2014 HTML source");

console.log(JSON.stringify({
  preserved2014HtmlCopies: htmlRows.length,
  preserved2014HtmlSemanticHits: htmlSemanticHits,
  preserved2014HtmlTargetHits: htmlTargetHits,
  htmlRows
}, null, 2));

console.log("PASS: authenticated 2012-2016 message bodies and preserved 2014 HTML were censused separately from OpenPGP Hash: metadata.");
