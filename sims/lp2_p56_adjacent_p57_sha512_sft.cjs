"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const ROOT = path.join(__dirname, "..");
const TARGET = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";

function sha512(bytes) {
  return crypto.createHash("sha512").update(bytes).digest("hex");
}

function main() {
  const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
  const reference = fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp1-plaintext-reference.txt"), "utf8");
  const image = fs.readFileSync(path.join(ROOT, "resources/liber-primus/74.jpg"));
  const p57 = corpus.pages.find(page => page.page === 57).indices;
  assert.equal(p57.length, 95);

  const glyphs = p57.map(i => corpus.runes[i]).join("");
  const transliteration = p57.map(i => corpus.translit[i]).join("");
  const p57Section = reference.split(/^### 57$/m)[1];
  assert.ok(p57Section, "p57 plaintext section must exist");
  const exactReference = p57Section.replace(/^\r?\n/, "").trimEnd() + "\n";
  const normalizedWords = exactReference.toUpperCase().replace(/[^A-Z]+/g, " ").trim();
  const lettersOnly = exactReference.toUpperCase().replace(/[^A-Z]/g, "");

  // Only source-grounded serializations of the adjacent final page are tested:
  // original image bytes, original GP rune glyphs, canonical GP labels, raw
  // GP29 indices, and the repository's exact/normalized p57 plaintext.
  const candidates = {
    p57_original_scan_74_jpg: image,
    p57_original_rune_glyphs_utf8: Buffer.from(glyphs, "utf8"),
    p57_canonical_gp_transliteration: Buffer.from(transliteration, "ascii"),
    p57_gp29_index_bytes: Buffer.from(p57),
    p57_reference_exact_text: Buffer.from(exactReference, "utf8"),
    p57_reference_normalized_words: Buffer.from(normalizedWords, "ascii"),
    p57_reference_letters_only: Buffer.from(lettersOnly, "ascii")
  };

  const results = Object.entries(candidates).map(([name, bytes]) => ({
    name,
    byteLength: bytes.length,
    sha512: sha512(bytes),
    matchesTarget: sha512(bytes) === TARGET
  }));

  assert.equal(results.filter(result => result.matchesTarget).length, 0);

  console.log(JSON.stringify({
    targetSha512: TARGET,
    hypothesis: "the final physical LP2 page p57 is the page named by the immediately preceding p56 digest",
    page: 57,
    runeCount: p57.length,
    imageBytes: image.length,
    runeGlyphs: glyphs,
    transliteration,
    plaintextReference: exactReference,
    results
  }, null, 2));
}

if (require.main === module) main();

module.exports = { main, sha512 };
