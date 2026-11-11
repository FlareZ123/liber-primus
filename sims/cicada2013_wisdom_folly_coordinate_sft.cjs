"use strict";
/**
 * SFT: test whether the actual 2013 "wisdom" = "folly" source bytes contain
 * an explicit 4-byte header + 58x58 coordinate/permutation matrix.
 * Source bytes are retained in resources/historical as RFC4648 base64.
 * This does not attempt already-excluded GP29/GP28 pads or Hill ciphers.
 * Node.js 22, no external dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const data = Buffer.from(fs.readFileSync(path.join(root,
  "resources/historical/cicada2013-wisdom-folly.b64"), "utf8"), "base64");
const sha256 = crypto.createHash("sha256").update(data).digest("hex");
assert.equal(data.length, 3368);
assert.equal(sha256, "7e5ec097728197f5c0dba0729980565658fba486965809ffa25e3910a31c385a");
assert.equal(data.subarray(0, 16).toString("hex"), "bf53c0cc9f66938e8043e8c4be9f2328");
/** @param {Buffer} payload @returns {number} */
function crc32(payload) {
  let state = 0xFFFFFFFF;
  for (const v of payload) {
    state ^= v;
    for (let i = 0; i < 8; i++) {
      state = (state >>> 1) ^ ((state & 1) ? 0xEDB88320 : 0);
    }
  }
  return (state ^ 0xFFFFFFFF) >>> 0;
}
/** @param {Buffer} payload @returns {number} */
function adler32(payload) {
  let a = 1, b = 0;
  for (const v of payload) {
    a = (a + v) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}
/** @param {number[]} x @returns {number} */
const unique = x => new Set(x).size;
/** @param {number[]} x @param {number} n @returns {number[]} */
const frequencies = (x, n) => {
  const counts = Array(n).fill(0);
  for (const v of x) counts[v]++;
  return counts;
};
/** @param {Buffer} payload @returns {object} */
function matrixFacts(payload) {
  assert.equal(payload.length, 58 * 58);
  const rows = Array.from({length:58}, (_,r) => [...payload.subarray(r*58,(r+1)*58)]);
  const cols = Array.from({length:58}, (_,c) => rows.map(r=>r[c]));
  const position = r => r.indexOf(Math.min(...r));
  const minChoices = rows.map(position);
  const maxChoices = rows.map(r => r.indexOf(Math.max(...r)));
  const mod58 = rows.map(r => r.map(v=>v%58));
  const exactColumnPerRows = mod58.filter(r => unique(r) === 58).length;
  const exactRowPerCols = cols.filter(r => unique(r.map(v=>v%58)) === 58).length;
  const alphabetSubsetRows = rows.filter(r=>r.every(v=>v<58)).length;
  const zeros=rows.flat().filter(v=>v===0).length;
  const ones=rows.flat().filter(v=>v===1).length;
  const duplicateRows=58-unique(rows.map(r=>r.join(",")));
  const diagonal=rows.map((r,i)=>r[i]);
  const transposeFixed=rows.flat().filter((v,i)=>v===rows[i%58][Math.floor(i/58)]).length;
  return {
    matrix_byte_shape:[58,58],
    direct_byte_range:[Math.min(...payload),Math.max(...payload)],
    distinct_byte_values:unique([...payload]),
    zero_cells:zeros,one_cells:ones,
    binary_zero_one_matrix_possible:(zeros+ones===3364),
    rows_all_bytes_0_to_57:alphabetSubsetRows,
    direct_mod58_row_permutations:exactColumnPerRows,
    direct_mod58_column_permutations:exactRowPerCols,
    distinct_row_argmin_columns:unique(minChoices),
    distinct_row_argmax_columns:unique(maxChoices),
    example_first_10_row_argmin:minChoices.slice(0,10),
    example_first_10_row_argmax:maxChoices.slice(0,10),
    duplicate_complete_rows:duplicateRows,
    transpose_equal_cells:transposeFixed,
    unique_diagonal_bytes:unique(diagonal),
    row_zero_frequency_distribution:frequencies(rows.map(r=>r.filter(v=>v===0).length),6)
  };
}
const first=data.subarray(0,4),last=data.subarray(-4);
const bodyAfterPrefix=data.subarray(4),bodyBeforeTrailer=data.subarray(0,-4);
const headerStats={
  first4_hex:first.toString("hex"),
  first4_uint32_be:first.readUInt32BE(0),
  first4_uint32_le:first.readUInt32LE(0),
  last4_hex:last.toString("hex"),
  last4_uint32_be:last.readUInt32BE(0),
  last4_uint32_le:last.readUInt32LE(0),
  crc32_body_after_prefix:crc32(bodyAfterPrefix),
  adler32_body_after_prefix:adler32(bodyAfterPrefix),
  crc32_body_before_trailer:crc32(bodyBeforeTrailer),
  adler32_body_before_trailer:adler32(bodyBeforeTrailer)
};
for(const [pos,h,body] of [["prefix",first,bodyAfterPrefix],["trailer",last,bodyBeforeTrailer]]){
  assert.notEqual(h.readUInt32BE(0),crc32(body),pos+" is a CRC32");
  assert.notEqual(h.readUInt32LE(0),crc32(body),pos+" is a reversed CRC32");
  assert.notEqual(h.readUInt32BE(0),adler32(body),pos+" is an Adler32");
  assert.notEqual(h.readUInt32LE(0),adler32(body),pos+" is a reversed Adler32");
}
const asPrefix=matrixFacts(bodyAfterPrefix),asTrailer=matrixFacts(bodyBeforeTrailer);
assert.equal(asPrefix.zero_cells,16);
assert.equal(asPrefix.one_cells,12); // check before committing
assert.equal(asPrefix.direct_mod58_row_permutations,0);
assert.equal(asPrefix.direct_mod58_column_permutations,0);
assert.equal(asPrefix.distinct_row_argmin_columns,35);
assert.equal(asPrefix.distinct_row_argmax_columns,35);
assert.equal(asPrefix.duplicate_complete_rows,0);
assert.equal(asTrailer.zero_cells,16);
assert.equal(asTrailer.direct_mod58_row_permutations,0);
assert.equal(asTrailer.direct_mod58_column_permutations,0);
assert.equal(asTrailer.duplicate_complete_rows,0);
console.log(JSON.stringify({
  source_sha256:sha256,
  status:"No recognizable integrity prefix/trailer or direct 58-page permutation; no source-selected coordinate decoder",
  note:"The byte count 3368=4+58^2 alone does not select a header convention or a page routing operation.",
  headerStats,
  prefixMatrix:asPrefix,
  trailerMatrix:asTrailer
},null,2));
