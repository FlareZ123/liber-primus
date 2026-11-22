'use strict';

/**
 * All-secret previous-ciphertext-rune-state gate for original LP2.
 *
 * Candidate class: for each of nine source-visible chapter spans, a fixed,
 * arbitrary mapping C_i = F_chapter(C_(i-1), P_i) over GP29. The mappings may
 * be different and secret on every chapter and every previous-cipher state.
 * No absolute position, extra hidden state or per-word/per-page rekey exists.
 *
 * For any chosen k distinct plaintext rune values, the number of their
 * appearances in one predecessor-ciphertext row is bounded by the k largest
 * next-ciphertext counts in that row. Summation gives a key-blind bound.
 *
 * Run on Windows 11 / Node 22: node sims/lp2_prevcipher_state_rowbound_sft.cjs
 * No writes, network calls or added dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} =
  require('./lp2_native_gp_source_orthography_sft.cjs');

const root = path.join(__dirname, '..');
/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = gp.pages.filter(p => p.page <= 55 && p.indices.length > 0);
const full = pages.flatMap(p => p.indices);
assert.equal(full.length, 12956);
assert.equal(pages.length, 55);

const chapterRanges = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const chapters = chapterRanges.map(([first, last]) =>
  pages.filter(p => p.page >= first && p.page <= last)
    .flatMap(p => p.indices));
assert.deepEqual(chapters.map(c => c.length),
  [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);

const KMAX = 8;
/**
 * Universal upper bounds for counts of any chosen k plaintext symbols.
 * Chapter starts have no observed predecessor and each gets one free slot.
 * @param {number[][]} parts
 * @returns {number[]}
 */
function rowBounds(parts) {
  const caps = Array(KMAX).fill(parts.length);
  for (const tape of parts) {
    const row = Array.from({length:29}, () => new Uint32Array(29));
    for (let i=1; i<tape.length; i++) row[tape[i-1]][tape[i]]++;
    for (const counts of row) {
      const sorted = Array.from(counts).sort((a,b) => b-a);
      let total = 0;
      for (let k=0; k<KMAX; k++) {
        total += sorted[k];
        caps[k] += total;
      }
    }
  }
  return caps;
}

/**
 * A window's unconstrained top-k GP29 plaintext rune occupancies.
 * @param {ArrayLike<number>} counter
 * @returns {number[]}
 */
function topK(counter) {
  const sorted = Array.from(counter).sort((a,b) => b-a);
  const result = [];
  let s=0;
  for(let k=0;k<KMAX;k++) {
    s+=sorted[k];
    result.push(s);
  }
  return result;
}

/**
 * Test every possible contiguous length-N source-native English passage.
 * @param {number[]} tape
 * @param {number[]} caps
 * @returns {{windows:number,minimum:number[],minAt:number[],admitted:number[]}}
 */
function allWindows(tape, caps) {
  assert(tape.length >= full.length);
  const counter = new Int32Array(29);
  for (let i=0;i<full.length;i++) counter[tape[i]]++;
  const minimum=Array(KMAX).fill(Infinity);
  const minAt=Array(KMAX).fill(-1);
  const admitted=Array(KMAX).fill(0);
  for (let start=0;start<=tape.length-full.length;start++) {
    const top = topK(counter);
    for (let k=0;k<KMAX;k++) {
      if (top[k]<minimum[k]) {
        minimum[k]=top[k];
        minAt[k]=start;
      }
      if(top[k]<=caps[k]) admitted[k]++;
    }
    if(start+full.length<tape.length) {
      counter[tape[start]]--;
      counter[tape[start+full.length]]++;
    }
  }
  return {windows:tape.length-full.length+1,minimum,minAt,admitted};
}

const caps = {
  book: rowBounds([full]),
  chapters: rowBounds(chapters),
  pages: rowBounds(pages.map(p => p.indices))
};
assert.deepEqual(caps.book, [717,1365,1980,2574,3147,3703,4249,4777]);
assert.deepEqual(caps.chapters, [1267,2303,3218,4062,4832,5547,6221,6848]);
assert.deepEqual(caps.pages, [2790,4787,6429,7893,9224,10391,11314,11985]);
const controls = [
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt',204151],
  ['Gibran', 'resources/control/gibran_prophet_58585.txt',49537],
  ['Emerson', 'resources/control/emerson_essays_2944.txt',308372]
];
const sourceMinima = [
  [1408,2441,3376,4259,5131,5894,6598,7280],
  [1416,2548,3478,4368,5227,6067,6843,7536],
  [1491,2514,3491,4429,5336,6208,7036,7811]
];
const summary = [];
let tested = 0;
let firstNative = null;
for(let j=0;j<controls.length;j++) {
  const [name, file, expected] = controls[j];
  const native = encodeSourceNativeGP(read(file));
  if(j===0) firstNative=native;
  const test = allWindows(native,caps.chapters);
  assert.equal(test.windows,expected);
  assert.deepEqual(test.minimum,sourceMinima[j]);
  assert(test.admitted.every(x=>x===0), name + ' should violate bound');
  tested += test.windows;
  summary.push({name, ...test});
}
assert.equal(tested,562060);

/**
 * Reversible 29-state planted cipher with distinct chapter keys:
 * C_i=11*P_i+7*C_(i-1)+3*chapter mod29, resetting previous C to 0
 * at each chapter start. The scalar 11 has inverse 8 in GF29.
 * @param {number} x
 * @returns {number}
 */
const mod29 = x => ((x %29)+29)%29;
const plain = firstNative.slice(0,full.length);
const ciphertext = [];
const decrypted = [];
let at = 0;
for(let chapter=0;chapter<chapters.length;chapter++) {
  const segment = [];
  let prev = 0;
  for(let i=0;i<chapters[chapter].length;i++) {
    const p=plain[at++];
    const c=mod29(11*p+7*prev+3*chapter);
    const recovered=mod29(8*(c-7*prev-3*chapter));
    assert.equal(recovered,p,'exact recovered GP plaintext');
    segment.push(c);
    decrypted.push(recovered);
    prev=c;
  }
  ciphertext.push(segment);
}
assert.deepEqual(decrypted,plain);
const plantCaps=rowBounds(ciphertext);
const counts=new Uint32Array(29);
for(const rune of plain) counts[rune]++;
const originalTop=topK(counts);
assert(originalTop.every((n,k)=>n<=plantCaps[k]));

if(require.main===module) {
  console.log(JSON.stringify({
    status:'key-independent exclusion only; zero new LP2 plaintext',
    originalRunes:full.length,
    originalPhysicalChapters:chapters.length,
    kValues:[1,2,3,4,5,6,7,8],
    originalBounds:caps,
    exactAllWindowControls:summary,
    controlWindows:tested,
    positivePlant:{
      recoveredRunes:decrypted.length,
      exactReencryption:true,
      plaintextTopK:originalTop,
      ciphertextRowUpperBounds:plantCaps
    },
    limitation:'Permits additional state, absolute-time keys, per-page/word changes, reordered plaintext, or non-reference language'
  },null,2));
}
