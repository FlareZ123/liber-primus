'use strict';
/**
 * LP2 original-source, ALL-SECRET predecessor-conditioned S-box exclusion.
 * Complete nine-chapter one-back mechanism with 29 entirely arbitrary
 * secret state alphabets per chapter. Every original adjacent doublet and
 * chapter first rune is adversarially free (need not fit its alphabet).
 *
 * Reproduce in Node.js 22 on Windows:
 * node sims/lp2_ninechapter_predecessor_sbox_capacity_sft.cjs
 *
 * No authorial claim: this explores the most generous static one-back
 * alphabet mechanism suggested by the original rare-adjacent-repeat signal.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeWords} = require('./lp2_difference_allletter_capacity_sft.cjs');
const root = path.resolve(__dirname, '..');
/** @param {string} filename @returns {string} */
const read = filename => fs.readFileSync(path.join(root, filename), 'utf8');
const source = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const Q = 29;
const E = source.translit.indexOf('E');
const O = source.translit.indexOf('O');
const EA = source.translit.indexOf('EA');
assert.deepEqual([Q,E,O,EA], [source.runes.length,18,3,28]);
const chapterRanges = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],
  [33,39],[40,53],[54,55]];
const pages = source.pages.filter(p => p.page <= 55 && p.indices.length);
const chapters = chapterRanges.map(([begin,end]) =>
  pages.filter(p => p.page >= begin && p.page <= end)
    .flatMap(p => p.indices)
);

/**
 * Per-state unknown bijection has no effect on counts: the most favorable
 * target plaintext letter uses the highest next-rune cell of each source
 * predecessor row. Two different letters require two different cells.
 *
 * Count repeats and initial glyphs as completely FREE; that is deliberately
 * more generous than a repeat->special-plaintext-letter rule.
 * @param {number[][]} units
 * @returns {{one:number,two:number,free:number,repeats:number,transitions:number,rows:Array<{one:number,two:number,repeats:number}>}}
 */
function capacity(units) {
  let one = 0, two = 0, repeats = 0, transitions = 0;
  const rows = [];
  for (const symbols of units) {
    const t = Array.from({length:Q}, () => new Uint32Array(Q));
    let currentRepeats = 0;
    for (let j = 1; j < symbols.length; j++) {
      transitions++;
      const before = symbols[j-1], after = symbols[j];
      assert.ok(Number.isInteger(before) && Number.isInteger(after)
        && before >= 0 && before < Q && after >= 0 && after < Q);
      if (before === after) { currentRepeats++; continue; }
      t[before][after]++;
    }
    let u = 0, v = 0;
    for (const line of t) {
      let first = 0, second = 0;
      for (const n of line) {
        if (n > first) { second = first; first = n; }
        else if (n > second) second = n;
      }
      u += first;
      v += first + second;
    }
    rows.push({one:u,two:v,repeats:currentRepeats});
    one += u; two += v; repeats += currentRepeats;
  }
  const free = units.length + repeats;
  return {one:one + free, two:two + free, free, repeats,
    transitions, rows};
}

/** @param {number[]} sequence @param {number} n @returns {{count:number,offset:number}} */
function minimumEO(sequence,n) {
  assert.ok(sequence.length >= n);
  let current = 0, min = Infinity, offset = -1;
  for (let j = 0; j < sequence.length; j++) {
    if (sequence[j] === E || sequence[j] === O) current++;
    if (j >= n && (sequence[j-n] === E || sequence[j-n] === O))
      current--;
    if (j >= n-1 && current < min) {
      min = current;
      offset = j-n+1;
    }
  }
  return {count:min,offset};
}

/** @returns {()=>number} */
function generator() {
  let x = 0x33012929;
  return () => {x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return x >>> 0;};
}

/**
 * Construct a full, native-English source plant in which the next ciphertext
 * symbol comes from an otherwise unrestricted secret 29-way permutation
 * chosen separately for every preceding ciphertext symbol AND every chapter.
 * Reserve ciphertext repetition for plaintext EA (historically plausible
 * 29th rune marker), then verify complete causal inverse and entropy gate.
 * @param {number[]} plain
 * @returns {{recovered:number,repeatEvents:number,nativeEO:number,plantedCapacity:number}}
 */
function plantedPositive(plain) {
  const random = generator();
  let offset = 0, recovered = 0, repeatEvents = 0;
  const cipher = [];
  for (let chapter=0;chapter<chapters.length;chapter++) {
    const native = plain.slice(offset, offset+chapters[chapter].length);
    offset += native.length;
    const secret = [], inverse = [];
    for (let before=0;before<Q;before++) {
      const outputs = Array.from({length:Q}, (_,i)=>i)
        .filter(v=>v!==before);
      for (let j=outputs.length-1;j>0;j--) {
        const k = random()%(j+1);
        [outputs[j],outputs[k]] = [outputs[k],outputs[j]];
      }
      const forward = new Array(Q), backward = new Array(Q);
      let next=0;
      for (let letter=0;letter<Q;letter++) {
        const value = letter===EA ? before : outputs[next++];
        forward[letter] = value;
        backward[value] = letter;
      }
      assert.equal(next,Q-1);
      assert.equal(new Set(forward).size,Q);
      secret.push(forward);
      inverse.push(backward);
    }
    const crypt = [native[0]], decrypted = [native[0]];
    for (let j=1;j<native.length;j++) {
      crypt[j] = secret[crypt[j-1]][native[j]];
      decrypted[j] = inverse[crypt[j-1]][crypt[j]];
      assert.equal(crypt[j]===crypt[j-1],native[j]===EA);
    }
    assert.deepEqual(decrypted,native);
    repeatEvents += crypt.slice(1).filter((v,i)=>v===crypt[i]).length;
    recovered += native.length;
    cipher.push(crypt);
  }
  assert.equal(offset,plain.length);
  const limit = capacity(cipher);
  const nativeEO = plain.filter(v=>v===E||v===O).length;
  assert.ok(nativeEO <= limit.two);
  assert.equal(limit.repeats,repeatEvents);
  return {recovered,repeatEvents,nativeEO,plantedCapacity:limit.two};
}

function main() {
  assert.equal(pages.length,55);
  assert.equal(chapters.length,9);
  const sizes = chapters.map(c=>c.length);
  assert.deepEqual(sizes,[729,1145,1729,1903,1021,1433,1680,3008,308]);
  assert.equal(sizes.reduce((a,b)=>a+b,0),12956);
  const actual = capacity(chapters);
  assert.deepEqual([actual.transitions,actual.repeats,actual.free,
    actual.one,actual.two],[12947,86,95,1353,2389]);
  assert.deepEqual(actual.rows.map(x=>x.repeats),[4,6,9,10,11,13,12,18,3]);
  const referenceSources = [
    ['Gibran','resources/control/gibran_prophet_58585.txt'],
    ['Shakespeare','resources/control/shakespeare_first300k.txt'],
    ['Emerson','resources/control/emerson_essays_2944.txt']
  ];
  const controls = referenceSources.map(([name,file])=>{
    const reference = read(file);
    const traditional = encodeWords(reference).flat();
    const sourceNative = encodeWords(reference.toUpperCase()
      .replace(/ING/g,'NG').replace(/IO/g,'IA')).flat();
    const ordinary = minimumEO(traditional,12956);
    const historical = minimumEO(sourceNative,12956);
    assert.ok(ordinary.count>actual.two);
    assert.ok(historical.count>actual.two);
    return {name,regular:{runes:traditional.length,...ordinary},
      ingIo:{runes:sourceNative.length,...historical}};
  });
  assert.deepEqual(controls.map(x=>x.regular.count),[2556,2430,2455]);
  assert.deepEqual(controls.map(x=>x.ingIo.count),[2548,2441,2408]);
  const originalGlobal = capacity([chapters.flat()]);
  assert.deepEqual([originalGlobal.one,originalGlobal.two],
    [803,1451]);
  const plantedSource = encodeWords(read(referenceSources[0][1]))
    .flat().slice(0,12956);
  assert.equal(plantedSource.length,12956);
  const plant = plantedPositive(plantedSource);
  console.log(JSON.stringify({
    status:'all-secret 9-chapter predecessor S-box cannot decode tested native GP English',
    originalRunaCount:12956, chapters:sizes,
    free:actual.free,freeDoublets:actual.repeats,
    globalAllSecretEO:originalGlobal.two,
    nineIndependentChapterAllSecretE:actual.one,
    nineIndependentChapterAllSecretEO:actual.two,
    controls,plant
  }, null, 2));
}
if(require.main === module) main();
module.exports = {main,capacity,minimumEO,plantedPositive};
