"use strict";
/**
 * Original-image-selected 256-item red/large-punctuation streams versus the
 * already established GF29 H2013 * Gp39 polynomial code of the 256-cell table.
 * All three source-described event classes, both natural coefficient directions,
 * and every possible single nonzero GP29 residue correction are covered.
 *
 * Run: node sims/lp2_red256_event_vs_grid_HG_code_sft.cjs
 * Node22, CJS, read-only. Inputs are canonical local JSON source, no fitting.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname, "..");
const read = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const gp = read("resources/liber-primus/lp2-corpus.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const grid = read("resources/liber-primus/lp2-grid-256.json");
const MOD = 29, LENGTH = 256;
const mod = x => ((x % MOD) + MOD) % MOD;
const inv = a => {
  for (let i = 1; i < MOD; i++) if (mod(i * a) === 1) return i;
  throw Error("Noninvertible leading polynomial coefficient");
};
const H = [3, 26, 24]; // 2013 PGP-signed BASE29(3301)="3QO", ascending.
const G = [27, 5, 15]; // Original physical p39 red triad, ascending.
/** GF29 long-division remainder on HIGH-FIRST source digits. */
function rem(hi, divisor) {
  const work = hi.slice().reverse();
  while (work.length && work.at(-1) === 0) work.pop();
  while (work.length >= divisor.length) {
    const at = work.length - divisor.length;
    const coefficient = mod(work.at(-1) * inv(divisor.at(-1)));
    for (let j = 0; j < divisor.length; j++) {
      work[at + j] = mod(work[at + j] - coefficient * divisor[j]);
    }
    while (work.length && work.at(-1) === 0) work.pop();
  }
  return work.concat(Array(divisor.length - 1).fill(0))
    .slice(0, divisor.length - 1);
}
/** Ascending-power GF29 polynomial multiplication. */
function multiply(left, right) {
  const out = Array(left.length + right.length - 1).fill(0);
  for (let i = 0; i < left.length; i++)
    for (let j = 0; j < right.length; j++)
      out[i + j] = mod(out[i + j] + left[i] * right[j]);
  return out;
}
const HG = multiply(H, G);
assert.deepEqual(HG, [23, 21, 11, 17, 12]);

/** Interleave exactly original red rune positions and large punctuation. */
function originalEventClasses() {
  const tapes = {A: [], B: [], C: []};
  let redCount = 0;
  for (let p = 0; p <= 57; p++) {
    const page = ink.pages.find(x => x.page === p);
    if (!page) continue;
    const red = new Map();
    for (const span of page.red_spans || []) {
      const glyphs = [...span.runes];
      assert.equal(glyphs.length, span.length);
      for (let j = 0; j < span.length; j++) {
        const symbol = gp.runes.indexOf(glyphs[j]);
        assert.ok(symbol >= 0);
        red.set(span.start + j, symbol);
        redCount++;
      }
    }
    for (let offset = 0; offset <= page.rune_count; offset++) {
      for (const [at, dots, color] of page.large_punctuation || []) {
        if (at !== offset) continue;
        if (dots === 13) tapes.A.push(dots);
        if ((dots === 13 && color === "red")
            || (dots === 23 && color === "red")) tapes.B.push(dots);
        // Original chapter marks: 28 thirteen-dot plus 3 ten-dot,
        // all before the independent solved p56 and p57 passages.
        if (p <= 55 && (dots === 13 || dots === 10)) tapes.C.push(dots);
      }
      if (red.has(offset)) {
        for (const tape of Object.values(tapes)) tape.push(red.get(offset));
      }
    }
  }
  assert.equal(redCount, 225);
  for (const tape of Object.values(tapes)) assert.equal(tape.length, LENGTH);
  return tapes;
}

/**
 * The original p39 G has a double root x=24.
 * For a one-error polynomial delta*x^e, the two G syndromes identify
 * e modulo29 and the magnitude delta, leaving only <=9 candidate locations.
 * Exact H and G remainder checks then exhaust every possible one-site repair.
 * @param {number[]} digits Source order, high coefficient first.
 */
function singleErrorRepairs(digits) {
  const [r0, r1] = rem(digits, G);
  const value = mod(r0 + 24 * r1);
  const deriv = r1;
  if (value === 0) return [];
  const exponentResidue = mod(24 * deriv * inv(value));
  const repairs = [];
  for (let e = exponentResidue; e < LENGTH; e += MOD) {
    let power = 1;
    for (let j = 0; j < e; j++) power = mod(power * 24);
    const delta = mod(value * inv(power));
    const at = LENGTH - 1 - e;
    const fixed = digits.slice();
    fixed[at] = mod(fixed[at] - delta);
    if (rem(fixed, H).every(x => x === 0)
        && rem(fixed, G).every(x => x === 0)) {
      repairs.push({index: at, delta});
    }
  }
  return repairs;
}
const table = grid.pages.flatMap(p => p.bytes).map(x => x % MOD);
assert.equal(table.length, LENGTH);
assert.deepEqual(rem(table, H), [0, 0]);
assert.deepEqual(rem(table, G), [0, 0]);
assert.deepEqual(rem(table, HG), [0, 0, 0, 0]);

// Source-code positive, including four widely separated actual table sites.
for (const at of [0, 64, 128, 255])
  for (const delta of [1, 7, 17, 28]) {
    const planted = table.slice();
    planted[at] = mod(planted[at] + delta);
    assert.deepEqual(singleErrorRepairs(planted), [{index: at, delta}]);
  }

const result = {};
for (const [klass, tape] of Object.entries(originalEventClasses())) {
  result[klass] = {};
  for (const [direction, digits] of [
    ["printedHighFirst", tape],
    ["printedLowFirst", tape.slice().reverse()],
  ]) {
    const Hremain = rem(digits, H);
    const Gremain = rem(digits, G);
    const HGreg = rem(digits, HG);
    const repairs = singleErrorRepairs(digits);
    assert.ok(Hremain.some(Boolean) || Gremain.some(Boolean));
    assert.deepEqual(repairs, []);
    result[klass][direction] = {H: Hremain, G: Gremain,
      HG: HGreg, oneSymbolRepairs: repairs.length};
  }
}
console.log(JSON.stringify(result, null, 2));
console.log("PASS: All 3 source-visible 256-event classes fail p50 H×G code in both directions, including one-GP-residue repair. Synthetic codeword controls pass.");
