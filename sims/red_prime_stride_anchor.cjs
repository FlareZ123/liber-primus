'use strict';

/**
 * Source-constrained prime-index-stride attack against original LP2 page 53 red ink.
 *
 * Independent source numbers: page15 red sum/29=22; its spiral prime p_22=79;
 * page53 red sum/29=78=phi(79). The actual historically solved LP2 page 56
 * uses phi(prime_n). Test those three source numbers as prime-index strides,
 * permitting initial indices 0..79, without fitting a stride to plaintext.
 *
 * Each 11-rune long word is required to be a GP-English dictionary spelling
 * within <=2 arbitrary ciphertext symbol changes. Exact 9-of-11 deletion
 * signatures enumerate all such anchors, and other words are evaluated only
 * after the key is fixed. No original plaintext is claimed by this screen.
 *
 * Run: node sims/red_prime_stride_anchor.cjs
 */
const assert = require('node:assert/strict');
const {dictionary, source} = require('./red_verse_second_order_key.cjs');
const {totientPrimes, variations} = require('./red_verse_prime_totient_anchor.cjs');

const mod = (n) => (n % 29 + 29) % 29;
const STARTS = 80;
const STRIDES = [22, 78, 79];
const RUNES = 51;
const MASKS = [];
for (let a = 0; a < 11; a++) {
  for (let b = a + 1; b < 11; b++) MASKS.push([a, b]);
}
assert.equal(MASKS.length, 55);

/**
 * @param {number[]} values Eleven GP rune indices
 * @param {number} mask Index of omitted two positions
 * @returns {number} exact safe-integer signature
 */
function signature(values, mask) {
  const [omitA, omitB] = MASKS[mask];
  let h = 0;
  for (let i = 0; i < 11; i++) {
    if (i !== omitA && i !== omitB) h = h * 29 + values[i];
  }
  const answer = h * 64 + mask;
  assert(Number.isSafeInteger(answer));
  return answer;
}

/** @param {ReturnType<typeof dictionary>['anchors']} anchors */
function indexAnchors(anchors) {
  const lookup = new Map();
  for (let i = 0; i < anchors.length; i++) {
    for (let m = 0; m < 55; m++) {
      const code = signature(anchors[i].values, m);
      const found = lookup.get(code);
      if (found) found.push(i);
      else lookup.set(code, [i]);
    }
  }
  return lookup;
}

/**
 * The 0-based start refers to the ordinary prime sequence (0 -> prime 2).
 * @param {Uint8Array} primeValues
 * @param {number} start
 * @param {number} stride
 */
function stridedKey(primeValues, start, stride) {
  const key = Array.from({length: RUNES}, (_, i) => primeValues[start + stride * i]);
  assert(key.every((v) => v !== undefined));
  return key;
}

/** @param {number[]} cipher @param {boolean} skipF */
function clockPhases(cipher, skipF) {
  const phases = [];
  let phase = 0;
  for (const c of cipher) {
    phases.push(phase);
    if (!(skipF && c === 0)) phase++;
  }
  return phases;
}

/**
 * @param {number[]} cipher
 * @param {number[]} lengths
 * @param {number[]} key
 * @param {-1|1} sign
 * @param {boolean} flip
 * @param {boolean} skipF
 */
function decrypt(cipher, lengths, key, sign, flip, skipF) {
  const phases = clockPhases(cipher, skipF);
  const clear = cipher.map((c, i) =>
    skipF && c === 0 ? 0 : mod((flip ? 28 - c : c) + sign * key[phases[i]])
  );
  assert.equal(clear.length, lengths.reduce((a, b) => a + b, 0));
  return clear;
}

/**
 * @param {number[]} decoded
 * @param {number[]} lengths
 * @param {Map<string,{english:string,freq:number}>} lexicon
 */
function heldout(decoded, lengths, lexicon) {
  let index = 0;
  let words = 0;
  let longWords = 0;
  const visible = [];
  for (const [wi, n] of lengths.entries()) {
    const segment = decoded.slice(index, index + n);
    const hit = lexicon.get(segment.join(','));
    visible.push(hit ? hit.english : segment.join(','));
    if (wi !== lengths.indexOf(11) && hit) {
      words++;
      if (n >= 3) longWords++;
    }
    index += n;
  }
  return {words, longWords, visible};
}

/**
 * @param {{cipher:number[],lengths:number[],name:string}} reading
 * @param {number[]} key
 * @param {ReturnType<typeof dictionary>} dict
 * @param {Map<number,number[]>} lookup
 */
function testKey(reading, key, dict, lookup) {
  const anchorWord = reading.lengths.indexOf(11);
  assert(anchorWord >= 0);
  const at = reading.lengths.slice(0, anchorWord).reduce((a,b) => a+b, 0);
  let cases = 0;
  const errors = [0, 0, 0];
  const hits = [];
  for (const sign of [-1, 1]) {
    for (const flip of [false, true]) {
      for (const skipF of [false, true]) {
        const decoded = decrypt(reading.cipher, reading.lengths, key, sign, flip, skipF);
        const anchor = decoded.slice(at, at + 11);
        const seen = new Set();
        for (let mask = 0; mask < 55; mask++) {
          const indices = lookup.get(signature(anchor, mask)) || [];
          for (const wi of indices) {
            if (seen.has(wi)) continue;
            seen.add(wi);
            let mismatch = 0;
            for (let i = 0; i < 11; i++) mismatch += Number(anchor[i] !== dict.anchors[wi].values[i]);
            if (mismatch > 2) continue;
            cases++;
            errors[mismatch]++;
            const other = heldout(decoded, reading.lengths, dict.byCode);
            hits.push({reading:reading.name, sign, flip, skipF,
              anchor:dict.anchors[wi].english, anchorErrors:mismatch,
              otherDictionaryWords:other.words, otherLongWords:other.longWords,
              text:other.visible.join(' ')});
          }
        }
      }
    }
  }
  return {cases, errors, hits};
}

/** @param {ReturnType<typeof dictionary>} dict @param {number[]} key */
function plantedControl(dict, key, lookup) {
  const s = source();
  const wordsByLen = new Map();
  for (const [code, hit] of dict.byCode.entries()) {
    const parts = code.split(',').map(Number);
    if (hit.freq < 30) continue;
    const arr = wordsByLen.get(parts.length) || [];
    arr.push(parts);
    wordsByLen.set(parts.length, arr);
  }
  const words = s.lengths.map((len, wi) => {
    const options = wordsByLen.get(len);
    assert(options.length > 10);
    if (wi !== 3) return options[(wi * 7 + 4) % options.length];
    // Keep the planted long anchor free of literal F so both skip policies
    // are defined under the same fixed source-selected anchor coordinates.
    const chosen = options.find((word) =>
      word.every((p,j) => mod(p - key[13+j]) !== 0));
    assert(chosen, 'No eligible planted anchor');
    return chosen;
  });
  const clear = words.flat();
  assert.equal(clear.length, 51);
  const encrypted = clear.map((p, i) => mod(p - key[i]));
  for (const pos of [15, 22]) {
    const increment = mod(encrypted[pos] + 3) ? 3 : 4;
    encrypted[pos] = mod(encrypted[pos] + increment);
  }
  const result = testKey({name:'plant-printed',cipher:encrypted,lengths:s.lengths},
    key, dict, lookup);
  const correct = result.hits.find((r) =>
    r.sign === 1 && !r.flip && !r.skipF &&
    r.anchorErrors === 2 && r.otherLongWords >= 7);
  assert(correct, 'Synthetic source-stride key not recovered with 2 corrupted anchor runes');
  return {start:22, stride:79, twoChangedAnchorRunes:[2,9],
    recoveredAnchor:correct.anchor, heldoutLongWords:correct.otherLongWords,
    pass:true};
}

function main() {
  const input = source(), dict = dictionary();
  const lookup = indexAnchors(dict.anchors);
  const primeValues = totientPrimes(STARTS + 79 * RUNES + 1);
  const positive = plantedControl(dict, stridedKey(primeValues, 22, 79), lookup);
  const readings = variations(input.cipher, input.lengths);
  const byStride = [];
  const allHits = [];
  for (const stride of STRIDES) {
    const byStart = [];
    let total = 0;
    const errors = [0,0,0];
    for (let start = 0; start < STARTS; start++) {
      let count = 0;
      for (const reading of readings) {
        const found = testKey(reading, stridedKey(primeValues, start, stride), dict, lookup);
        count += found.cases;
        found.errors.forEach((v, i) => { errors[i] += v; });
        for (const hit of found.hits) allHits.push({stride, start, ...hit});
      }
      total += count;
      if (count) byStart.push({start, count});
    }
    byStride.push({stride, starts:STARTS, orientationFamilies:4,
      signs:2, carriers:2, literalFClocks:2,
      anchoredCases:total, errors, byStart});
  }
  allHits.sort((a,b) => b.otherLongWords-a.otherLongWords);
  const report = {
    input:'Original LP2 physical page 53 / scan 70.jpg, 51 red runes, fixed 11-rune word',
    sources:'p15 red /29=22; spiral p22=79; p53 red /29=78=phi(79)',
    hypothesis:'K_i=phi(prime_(start + stride*i + 1)) mod29; initial prime index 0..79; strides 22,78,79',
    casesPerStride:STARTS*4*2*2*2,
    dictionaryAnchorWords:dict.anchors.length, deletionMasks:MASKS.length,
    positive, byStride, topHits:allHits.slice(0,10),
    qualification:'Only exactly specified GP-English anchor and <=2 original-rune errors; no LP2 plaintext claim'
  };
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) main();
module.exports = {signature,indexAnchors,stridedKey,testKey,plantedControl,main};
