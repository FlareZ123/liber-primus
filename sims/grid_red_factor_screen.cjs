"use strict";
/**
 * Original-source factor gate for a hypothetical page53/red-rune
 * interpretation of the 2048-bit LP2 numeric grid.
 * This is a finite exact exclusion, not a historical decipherment.
 * Run: node sims/grid_red_factor_screen.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const load = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const corpus = load("resources/liber-primus/lp2-corpus.json");
const marks = load("resources/liber-primus/lp2-ink-annotations.json");
const grid = load("resources/liber-primus/lp2-grid-256.json");
const bytes = grid.pages.flatMap(page => page.bytes);
assert.equal(bytes.length, 256);
assert.equal(
  crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);
const N = bytes.reduce((n, x) => 256n * n + BigInt(x), 0n);
const smooth = 36528277968n;
assert.equal(N % smooth, 0n);
const quotient = N / smooth;
assert.equal(quotient.toString(2).length, 2013);

const red = marks.pages.flatMap(page =>
  (page.red_spans || []).flatMap(span => {
    const source = corpus.pages.find(item => item.page === page.page);
    assert.ok(source);
    const selected = source.indices.slice(span.start, span.start + span.length);
    assert.equal(selected.length, span.length);
    return selected;
  })
);
assert.equal(red.length, 225);
const models = [
  { label: "GP-index-base29", base: 29n, digits: red },
  { label: "GP-onebased-base30", base: 30n, digits: red.map(x => x + 1) },
  { label: "GP-prime-base110", base: 110n, digits: red.map(x => corpus.prime[x]) },
];
/**
 * @param {bigint} a
 * @param {bigint} b
 * @returns {bigint}
 */
function gcd(a, b) {
  while (b !== 0n) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }
  return a;
}
/**
 * Scan every contiguous red-marked substring of length 100..225
 * in both directions and every specified positional encoding.
 * @param {bigint} candidate
 */
function scan(candidate) {
  let tested = 0;
  let nontrivial = 0;
  const hits = [];
  for (const model of models) {
    for (const reverse of [false, true]) {
      const digits = reverse ? [...model.digits].reverse() : model.digits;
      for (let begin = 0; begin < digits.length; begin++) {
        let value = 0n;
        for (let end = begin; end < digits.length; end++) {
          value = value * model.base + BigInt(digits[end]);
          if (end - begin + 1 < 100) continue;
          tested++;
          const common = gcd(candidate, value);
          if (common > 1n) {
            nontrivial++;
            if (hits.length < 10) {
              hits.push({ model: model.label, reverse, begin, end,
                factor: common.toString() });
            }
          }
        }
      }
    }
  }
  return { tested, nontrivial, hits };
}
const original = scan(quotient);
assert.equal(original.tested, 48006);
assert.equal(original.nontrivial, 0);

// Positive gate: a known red positional window is deliberately a factor.
const planted = red.slice(0, 207).reduce((v, d) => v * 29n + BigInt(d), 0n);
assert.equal(planted.toString(2).length, 1005);
assert.equal(gcd(planted * 1000000007n, planted), planted);
const control = scan(planted * 1000000007n);
assert.equal(control.tested, 48006);
assert.ok(control.nontrivial > 0);
assert.ok(control.hits.some(hit => hit.model === "GP-index-base29"));
process.stdout.write(JSON.stringify({
  originalGridBits: N.toString(2).length,
  quotientBits: quotient.toString(2).length,
  allRedRunesIncludingSolvedControls: red.length,
  candidateWindows: original.tested,
  originalNontrivialFactors: original.nontrivial,
  plantedFactorBits: planted.toString(2).length,
  controlNontrivialWindows: control.nontrivial,
  verdict: "No literal red-window prime factor of the grid quotient in the declared family; no plaintext or key recovered."
}, null, 2) + "\n");
