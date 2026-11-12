"use strict";

/**
 * Independent full 76-rune original p55 JPEG-reading regression.
 * It preserves the frozen blind read, 15 initial discrepancies and
 * original-pixel coordinate resolution separately from canonical source text.
 *
 * Run: node sims/lp2_p55_blind_read_76_positions_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} name */
const resource = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));

const c = resource("resources/liber-primus/lp2-corpus.json");
const r = resource("im-results/lp2-p55-original-blind-76-position-adjudication.json");
const original = c.pages[55].indices.map(i => c.runes[i]);
assert.equal(c.runes.length, 29);
assert.equal(original.length, 76);
assert.equal(r.original_image, "resources/liber-primus/72.jpg");
assert.deepEqual(r.original_jpeg_size, [2400, 3600]);
assert.equal(r.initial_blind_symbol_count, 76);
assert.equal(r.canonical_symbol_count, 76);
assert.equal(r.positions.length, 76);
const expectedLineCounts = [24, 22, 22, 8];
assert.deepEqual(
  expectedLineCounts,
  [1, 2, 3, 4].map(line => r.positions.filter(p => p.line === line).length),
);
const lineOriginals = r.positions.map(p => p.rune);
assert.deepEqual(lineOriginals, original);
const expectedDisagreementOrdinals = [12, 13, 14, 17, 18, 35, 39, 40, 52, 54, 59, 60, 63, 64, 71];
const discrepancies = [];
for (let i = 0; i < r.positions.length; i++) {
  const p = r.positions[i];
  assert.equal(p.ordinal, i + 1);
  assert.equal(p.rune, original[i]);
  assert(c.runes.includes(p.blind_rune));
  assert.equal(p.source_read_confidence,
    p.rune === p.blind_rune ? "high" : "adjudicated_with_same_page_exemplars");
  const [x0, y0, x1, y1] = p.original_scan_bbox_xyxy;
  assert(x0 >= 0 && x0 < x1 && x1 <= 2400);
  assert(y0 >= 0 && y0 < y1 && y1 <= 3600);
  if (p.rune !== p.blind_rune) {
    discrepancies.push(p);
    const record = r.first_pass_discrepancies.find(d => d.ordinal === p.ordinal);
    assert(record && record.reason && record.reason.length > 12);
    assert.deepEqual(record.original_scan_bbox_xyxy, p.original_scan_bbox_xyxy);
  }
}
assert.deepEqual(discrepancies.map(p => p.ordinal), expectedDisagreementOrdinals);
const blindFromLines = r.before_unblinding_lines.join("")
  .split("").filter(glyph => c.runes.includes(glyph));
assert.equal(blindFromLines.length, 76);
assert.deepEqual(blindFromLines, r.positions.map(p => p.blind_rune));
assert.equal(r.agreement_after_original_pixel_review, "76/76 equal to unchanged canonical");
assert.equal(r.transcription_edit, "none");
assert(r.source_marks.some(m => m.kind === "red 13-dot terminal mark"));

console.log(JSON.stringify({
  source: r.original_image,
  physical_page: 55,
  line_rune_counts: expectedLineCounts,
  blind_count: blindFromLines.length,
  first_pass_mismatches: discrepancies.length,
  first_pass_mismatch_ordinals: expectedDisagreementOrdinals,
  adjudicated_canonical_match: "76/76",
  original_pixels_review: "Source glyph shapes and same-page exemplars, see JSON",
  new_key_or_plaintext: false,
}, null, 2));
