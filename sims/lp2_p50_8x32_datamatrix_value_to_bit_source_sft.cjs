"use strict";

/**
 * Source-geometry gate: p50's original 32x8 token grid rotates to the exact
 * 8x32 ISO/IEC 16022 Data Matrix ECC200 rectangular symbol size.
 *
 * A genuine 8x32 ECC200 symbol has two 8x16 regions with deterministic
 * L-shaped solid and alternating finder/timing borders.
 * Verify whether ANY static function f(rawToken)->{0,1} could satisfy those
 * borders on the unmodified p50 tokens, in each of four rotations/reflections.
 * No threshold or symbol-to-bit mapping is fitted.
 *
 * Positive source standard:
 * https://gs1ca.org/documents/standards/GS1-DataMatrix-Introduction-and-technical-overview-v.pdf
 * table 1.2.2-2: 8x32; two 6x14 data regions, with 8x16 outer borders.
 *
 * Run: node sims/lp2_p50_8x32_datamatrix_value_to_bit_source_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const file = path.resolve(__dirname, "../resources/liber-primus/base60-grid.json");
const source = JSON.parse(fs.readFileSync(file, "utf8"));
const rows = source.rows;
assert.deepEqual([rows.length, ...new Set(rows.map((row) => row.length))], [32, 8]);
assert.equal(source.original_scans.join(","), "66.jpg,67.jpg,68.jpg");
const flatten = rows.flat();
assert.equal(flatten.length, 256);
assert(flatten.every((token) => /^[0-9A-Za-z]{2}$/u.test(token)));

/**
 * Each 8x16 data region of a rectangular ECC200 module symbol has top
 * alternating, bottom solid, left solid, right alternating locator borders.
 * r 0..7, c 0..31. Return null for interior data modules.
 * @param {number} r
 * @param {number} c
 * @returns {0|1|null}
 */
function borderBit(r, c) {
  assert(r >= 0 && r < 8 && c >= 0 && c < 32);
  if (r === 0) return c % 2 === 0 ? 1 : 0;
  if (r === 7) return 1;
  if (c % 16 === 0) return 1;
  if (c % 16 === 15) return r % 2 === 1 ? 1 : 0;
  return null;
}

/**
 * A static token-to-bit conversion is possible only when no token seen on
 * the mandatory border occurs in both black and white roles.
 * @param {(r:number,c:number)=>string} tokenAt
 */
function study(tokenAt) {
  /** @type {Map<string,Array<{row:number,col:number,bit:0|1}>>} */
  const occurrences = new Map();
  let requiredBlack = 0;
  let requiredWhite = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 32; c++) {
      const bit = borderBit(r, c);
      if (bit === null) continue;
      if (bit) requiredBlack++; else requiredWhite++;
      const token = tokenAt(r, c);
      if (!occurrences.has(token)) occurrences.set(token, []);
      occurrences.get(token).push({row:r+1,col:c+1,bit});
    }
  }
  const conflicts = [];
  let minimumFinderErrors = 0;
  for (const [token, positions] of occurrences) {
    const black = positions.filter((x) => x.bit === 1).length;
    const white = positions.length - black;
    if (!black || !white) continue;
    conflicts.push({token, black, white, positions});
    minimumFinderErrors += Math.min(black, white);
  }
  return {requiredBlack,requiredWhite,uniqueBorderTokens:occurrences.size,
    conflicts,minimumFinderErrors};
}

// Known-positive synthetic valid finder/timing framing, independently of payload.
// Its complete 8x32 surface uses only two source tokens; no contradictions.
const positive = study((r,c) => borderBit(r,c) === 1 ? "BLACK" : "WHITE");
assert.deepEqual([positive.requiredBlack,positive.requiredWhite], [66,22]);
assert.equal(positive.minimumFinderErrors, 0);
assert.equal(positive.conflicts.length, 0);

// Original p50 32 rows x8 columns -> 8 rows x32 columns via 90-degree
// rotation. The four row/column reversal conventions cover 90/270,
// reflection and 180-degree orientation in the rectangular dimensions.
const outcomes = [];
for (const flipRows of [false,true]) {
  for (const flipColumns of [false,true]) {
    const name = `rowFlip=${flipRows},colFlip=${flipColumns}`;
    const result = study((r,c) =>
      rows[flipColumns ? 31-c : c][flipRows ? 7-r : r]);
    outcomes.push({name,...result});
  }
}
const byName = new Map(outcomes.map((x) => [x.name,x]));
assert.deepEqual(outcomes.map((x) => x.conflicts.length), [6,4,4,5]);
assert.deepEqual(outcomes.map((x) => x.minimumFinderErrors), [6,4,4,5]);
assert(outcomes.every((x) => x.minimumFinderErrors > 0));
const witness = byName.get("rowFlip=false,colFlip=false");
assert(witness);
assert(witness.conflicts.find((x) => x.token === "22")
  .positions.some((x) => x.bit === 1));
assert(witness.conflicts.find((x) => x.token === "22")
  .positions.some((x) => x.bit === 0));

console.log(JSON.stringify({
  hypothesis: "exact p50 32x8 tokens -> ECC200 8x32 DataMatrix modules",
  source:"resources/liber-primus/base60-grid.json original raw two-character tokens",
  nullFamily:"any fixed global raw-token-to-one-bit lookup, including parity/threshold",
  standard:"ISO/IEC 16022 ECC200 rectangular 8x32, two 8x16 finder-bordered data regions",
  syntheticFinderPositive: {
    black:positive.requiredBlack,white:positive.requiredWhite,
    minimumErrors:positive.minimumFinderErrors,
  },
  original:outcomes.map(({name,requiredBlack,requiredWhite,
    uniqueBorderTokens,conflicts,minimumFinderErrors}) => ({
      name,requiredBlack,requiredWhite,uniqueBorderTokens,
      conflictingTokenCount:conflicts.length,
      minimumUnavoidableFinderBorderErrors:minimumFinderErrors,
      exampleContradiction:conflicts[0],
    })),
  decision:"direct fixed token->module encoding impossible for all rectangular orientations; position-dependent or multi-token coding remains untested/unselected",
},null,2));
