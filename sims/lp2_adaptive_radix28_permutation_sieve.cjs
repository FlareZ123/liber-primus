"use strict";
/**
 * Exact, label-permutation-independent capacity sieve for adaptive radix-28
 * byte blocks on LP2. Works without guessing any of the 29! rune orders.
 * The 55 rune-bearing unsolved LP2 pages are the only original data input.
 *
 * node sims/lp2_adaptive_radix28_permutation_sieve.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const M = 29;
const WIDTHS = [5, 10, 15, 20, 25, 30];

/** @returns {number[][]} */
function originalPages() {
  const filename = path.resolve(__dirname, "../resources/liber-primus/lp2-corpus.json");
  const data = JSON.parse(fs.readFileSync(filename, "utf8"));
  const pages = data.pages.filter(p => p.status === "unsolved" && p.indices.length > 0)
    .map(p => p.indices);
  assert.equal(pages.length, 55);
  assert.equal(pages.reduce((a, p) => a + p.length, 0), 12956);
  assert(pages.every(p => p.every(x => Number.isInteger(x) && x >= 0 && x < M)));
  return pages;
}

/**
 * Keep the first rune as context, not a digit. Optional page resets prevent
 * byte codewords from crossing original physical rune-bearing pages.
 * A repeated glyph may either be dropped or retained as an unknown marker
 * occupying a digit position. Markers are never used to falsify a candidate.
 * @param {number[][]} pages
 * @param {boolean} dropRepeat
 * @param {boolean} resetPage
 * @returns {Array<Array<{glyph:number, repeat:boolean}>>}
 */
function digitStreams(pages, dropRepeat, resetPage) {
  const partitions = resetPage ? pages : [pages.flat()];
  return partitions.map(page => {
    const out = [];
    for (let i = 1; i < page.length; i++) {
      const repeat = page[i] === page[i - 1];
      if (!repeat || !dropRepeat) out.push({glyph: page[i], repeat});
    }
    return out;
  });
}

/**
 * The maximum permissible most-significant base-28 digit in an integer
 * representing exactly 3n bytes in 5n digits.
 * @param {number} digits
 */
function leadingCeiling(digits) {
  assert.equal(digits % 5, 0);
  const byteCount = digits / 5 * 3;
  return Number(((256n ** BigInt(byteCount)) - 1n) /
    (28n ** BigInt(digits - 1)));
}

/**
 * Exhaustive necessary-condition screen across 29 possible top rune labels.
 * Handles both normal/reverse digit order, arbitrary fixed rune order,
 * every block phase, two segmentation policies, and two repeat policies.
 * @param {number[][]} pages
 * @param {{digits:number,phase:number,dropRepeat:boolean,resetPage:boolean,reverse:boolean}} cfg
 */
function screen(pages, cfg) {
  const {digits, phase, dropRepeat, resetPage, reverse} = cfg;
  const leaderFollowers = Array.from({length:M}, () => new Set());
  const leaders = new Set();
  let completeBlocks = 0, ignoredLeaders = 0;
  for (const stream of digitStreams(pages, dropRepeat, resetPage)) {
    for (let i = phase; i + digits <= stream.length; i += digits) {
      completeBlocks++;
      const first = stream[i + (reverse ? digits - 1 : 0)];
      if (first.repeat) {
        ignoredLeaders++;
        continue;
      }
      leaders.add(first.glyph);
      if (digits !== 5) continue;
      const second = stream[i + (reverse ? digits - 2 : 1)];
      if (!second.repeat) leaderFollowers[first.glyph].add(second.glyph);
    }
  }
  const ceiling = leadingCeiling(digits);
  if (digits === 5) {
    assert.equal(ceiling, 27);
    // For any hidden ordering, its maximum glyph is one of all 29 glyphs.
    // When this max glyph leads a block, its digit is exactly 27.
    // The next digit cannot exceed 8; see proof in the companion report.
    const followerBound = reverse ? 10 : 9;
    const minFollowerDistinct = Math.min(...leaderFollowers.map(s => s.size));
    return {...cfg, completeBlocks, ignoredLeaders, ceiling,
      minFollowerDistinct, followerBound, excluded: minFollowerDistinct > followerBound};
  }
  // A glyph at absolute rank r has adaptive rank r or r-1; to be <= ceiling
  // its absolute rank must be <= ceiling+1. At most ceiling+2 distinct glyphs
  // can lead valid blocks for any unknown global rune ordering.
  const leadingDistinct = leaders.size;
  const leadingBound = ceiling + 2;
  return {...cfg, completeBlocks, ignoredLeaders, ceiling,
    leadingDistinct, leadingBound, excluded: leadingDistinct > leadingBound};
}

/** @param {number[][]} pages */
function study(pages) {
  const byWidth = [];
  for (const digits of WIDTHS) {
    const cases = [];
    for (const dropRepeat of [false, true])
      for (const resetPage of [false, true])
        for (const reverse of [false, true])
          for (let phase = 0; phase < digits; phase++)
            cases.push(screen(pages, {digits, phase, dropRepeat, resetPage, reverse}));
    const minEvidence = digits === 5 ?
      Math.min(...cases.map(c => c.minFollowerDistinct)) :
      Math.min(...cases.map(c => c.leadingDistinct));
    const allowed = digits === 5 ? Math.max(...cases.map(c => c.followerBound)) :
      leadingCeiling(digits) + 2;
    byWidth.push({digits, bytes: digits / 5 * 3, tested: cases.length,
      impossible: cases.filter(c => c.excluded).length,
      leadingCeiling: leadingCeiling(digits),
      minObservedDistinct: minEvidence, maxAllowedDistinct: allowed,
      minCompleteBlocks: Math.min(...cases.map(c => c.completeBlocks)),
      maxIgnoredLeaders: Math.max(...cases.map(c => c.ignoredLeaders)),
      ...(digits === 5 ? {
        minForwardFollowers: Math.min(...cases.filter(c => !c.reverse).map(c => c.minFollowerDistinct)),
        minReversedFollowers: Math.min(...cases.filter(c => c.reverse).map(c => c.minFollowerDistinct))
      } : {})});
    assert.equal(cases.filter(c => c.excluded).length, cases.length,
      "An original LP2 case escaped the declared necessary-condition sieve");
  }
  return {source: "resources/liber-primus/lp2-corpus.json",
    hypothesis: "fixed-width byte integer -> base28 digits -> unknown fixed global ordering of 29 glyphs excluding previous output glyph",
    originalPages:pages.length, originalRunes:pages.reduce((s,p)=>s+p.length,0),
    variants:byWidth.reduce((s,x)=>s+x.tested,0), byWidth};
}

/** Fixed-seed generator used only for the independent codec positive controls. */
function randomGenerator(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return s >>> 0;
  };
}

/** @param {number[]} glyphs @param {number[]} permutation */
function decodeDigits(glyphs, permutation) {
  let previous = glyphs[0];
  const digits = [];
  for (const glyph of glyphs.slice(1)) {
    assert.notEqual(glyph, previous);
    const available = permutation.filter(x => x !== previous);
    const rank = available.indexOf(glyph);
    assert(rank >= 0 && rank < 28);
    digits.push(rank);
    previous = glyph;
  }
  return digits;
}

/** @param {number} width @param {number} blocks */
function positiveControl(width, blocks=600) {
  const rand = randomGenerator(0x4a4b27d0 + width);
  const permutation = Array.from({length:M}, (_,i) => i);
  for (let i=M-1; i>0; i--) {
    const j = rand() % (i+1);
    [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
  }
  const seed = permutation[11];
  const ciphertext = [seed], digits = [];
  const bytes = width / 5 * 3;
  for (let block=0; block<blocks; block++) {
    let integer = 0n;
    for (let k=0; k<bytes; k++) integer = integer*256n + BigInt(rand() & 255);
    const packet = Array(width).fill(0);
    for (let j=width-1; j>=0; j--) {
      packet[j] = Number(integer%28n);
      integer /= 28n;
    }
    assert.equal(integer, 0n);
    for (const digit of packet) {
      const available = permutation.filter(x => x !== ciphertext.at(-1));
      ciphertext.push(available[digit]);
      digits.push(digit);
    }
  }
  assert.deepEqual(decodeDigits(ciphertext, permutation), digits);
  const result = screen([ciphertext], {digits:width, phase:0,
    dropRepeat:true, resetPage:false, reverse:false});
  assert.equal(result.excluded,false, "Sieve must admit an authentic encoded byte stream");
  return {width, blocks, allDigitsRoundTrip:true,
    maximumTopSymbolFollowers: width===5 ?
      result.minFollowerDistinct : undefined,
    distinctLeaders:width>5 ? result.leadingDistinct : undefined};
}

function main() {
  const report = study(originalPages());
  report.positiveControls = [5,10,15,20,25,30].map(n=>positiveControl(n));
  console.log(JSON.stringify(report,null,2));
}

if (require.main === module) main();
module.exports = {digitStreams,leadingCeiling,screen,study,positiveControl};
