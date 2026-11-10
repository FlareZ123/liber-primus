'use strict';

/**
 * Exact zero-residue invariant of the red-pointer-derived F79 hypothesis.
 *
 * Source arithmetic: GPprime[15]=53, prime_22=79, phi(79)=78.
 * The standard 29 GP prime weights modulo79 form 29 distinct field elements,
 * with exactly one zero (GP index21, ᛝ, NG). For a multiplicative field-unit
 * transducer E(C_i)=K_i E(P_i) mod79, every nonzero K_i preserves zero:
 *    C_i==21 if and only if P_i==21.
 *
 * This excludes pure F79 unit multiplication for GP-English source plaintext
 * irrespective of its key/state schedule and any variable rejection skips.
 * It does NOT exclude affine translations, symbolic remappings, homophones,
 * non-GP intermediary plaintext, or arbitrary erasures and insertions.
 *
 * Run on Windows Node.js 22:
 * node sims/red_f79_zero_mask_invariant.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const SYMBOL = 21;
const WINDOW = 12956;
const SOURCES = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt'
];

/**
 * @param {number} page
 * @param {number} offset
 * @returns {number}
 */
function sourceSum(page, offset) {
  const row = ink.pages.find(p => p.page === page);
  const span = row.red_spans.find(s => s.start === offset);
  const ids = [...span.runes].map(r => corpus.runes.indexOf(r));
  assert.deepEqual(ids, corpus.pages[page].indices.slice(
    offset, offset + span.length));
  return ids.reduce((v, i) => v + corpus.prime[i], 0);
}

/** @returns {number[]} The exact GP symbol embedding in F79. */
function embedding() {
  assert.equal(sourceSum(40, 0), 435);
  assert.equal(sourceSum(15, 0), 638);
  assert.equal(sourceSum(53, 128), 2262);
  assert.deepEqual([435/29,638/29,2262/29], [15,22,78]);
  assert.equal(corpus.prime[15], 53);
  assert.equal(corpus.prime[21], 79);
  assert.equal(corpus.translit[SYMBOL], 'NG');
  const e = corpus.prime.map(p => p % 79);
  assert.equal(new Set(e).size, 29);
  assert.deepEqual(e.flatMap((v,i) => v === 0 ? [i] : []), [SYMBOL]);
  return e;
}

const mapping = embedding();
const decodeResidue = new Int8Array(79).fill(-1);
mapping.forEach((v, i) => { decodeResidue[v] = i; });
const powers = [];
for (let i = 0, v = 1; i < 78; i++, v = v * 53 % 79) powers.push(v);
assert.equal(new Set(powers).size, 78);
assert.equal(powers[0], 1);

/**
 * @param {string} original
 * @returns {number[]} GP rune text from independent English source.
 */
function gpEncode(original) {
  const words = original.toUpperCase().match(/[A-Z]+/g) || [];
  const labels = new Map(corpus.translit.map((glyph, i) => [glyph, i]));
  const out = [];
  for (let word of words) {
    word = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/ING/g, 'NG');
    for (let i = 0; i < word.length;) {
      const two = labels.get(word.slice(i, i + 2));
      if (two !== undefined) {
        out.push(two); i += 2;
      } else {
        const one = labels.get(word[i]);
        assert.notEqual(one, undefined, 'unmapped GP character');
        out.push(one); i++;
      }
    }
  }
  return out;
}

/**
 * @param {number[]} source
 * @param {number} length
 * @returns {{first:number,min:number,max:number,windows:number}}
 */
function windowCounts(source, length) {
  assert.ok(source.length >= length);
  let count = 0;
  for (let i = 0; i < length; i++)
    count += Number(source[i] === SYMBOL);
  const first = count;
  let min = count, max = count;
  for (let i = length; i < source.length; i++) {
    count += Number(source[i] === SYMBOL) - Number(source[i-length] === SYMBOL);
    min = Math.min(min, count);
    max = Math.max(max, count);
  }
  return {first, min, max, windows:source.length-length+1};
}

/**
 * Forward-only illustrative F79 unit multiplication with rejection to the
 * 29-element embedded alphabet. Variable skip lengths mean the full encoder
 * may not be uniquely invertible from its output alone; it demonstrates the
 * exact zero-mask equivalence, not a valid recovered original cipher.
 * @param {number[]} plain
 * @param {number} phase
 * @returns {{glyphs:number[],skipped:number}}
 */
function plant(plain, phase) {
  const glyphs = [];
  let clock = phase;
  let skipped = 0;
  for (const rune of plain) {
    let encoded = -1;
    for (let k = 0; k < 78; k++) {
      const candidate = mapping[rune] * powers[clock % 78] % 79;
      clock++;
      const target = decodeResidue[candidate];
      if (target >= 0) { encoded = target; break; }
      skipped++;
    }
    assert.ok(encoded >= 0);
    assert.equal(encoded === SYMBOL, rune === SYMBOL);
    glyphs.push(encoded);
  }
  return {glyphs, skipped};
}

function run() {
  const original = corpus.pages.filter(p => p.page <= 55)
    .flatMap(p => p.indices);
  assert.equal(original.length, WINDOW);
  const observed = original.filter(i => i === SYMBOL).length;
  assert.equal(observed, 454);
  const result = SOURCES.map(filename => {
    const source = gpEncode(read(filename));
    const marker = source.filter(x => x === SYMBOL).length;
    const windows = windowCounts(source, WINDOW);
    assert.ok(windows.max < observed);
    const positive = plant(source.slice(0, WINDOW), 22);
    const zeroPositionsEqual = positive.glyphs.every((x,i) =>
      (x === SYMBOL) === (source[i] === SYMBOL));
    assert.ok(zeroPositionsEqual);
    const outputMarker = positive.glyphs.filter(x => x === SYMBOL).length;
    assert.equal(outputMarker, windows.first);
    return {source:filename,totalRunes:source.length,sourceNg:marker,
      sourceNgFrequency:marker/source.length,contiguous:windows,
      markerMaskPositive:{sourceNg:windows.first,outputNg:outputMarker,
        exactZeroMask:true,additionalKeySteps:positive.skipped}};
  });
  const report = {
    source: 'red quotients 15/22/78 and canonical 29 GP prime weights',
    fieldPrime: 79, sourceUnit: 53, unitOrder: 78,
    zeroResidue: {runeIndex:21,translit:'NG',rune:corpus.runes[SYMBOL],
      gpPrime:79},
    originalUnsolved: {runes:WINDOW,marker:observed,
      rate:observed/WINDOW},
    sourceControls:result,
    status: 'Pure F79 unit multiplication necessarily preserves NG positions; 454 original NG far exceeds every length-matched GP-English source window, no original plaintext/key recovered'
  };
  console.log(JSON.stringify(report,null,2));
  return report;
}
if(require.main === module)run();
module.exports = {embedding,gpEncode,windowCounts,plant,run};
