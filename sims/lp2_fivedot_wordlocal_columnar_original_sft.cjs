"use strict";
/**
 * Director #894. One exact original-input, per-word five-column inverse.
 *
 * Historical hypothesis: the original LP2 five-dot stencil (p7,p23,p56)
 * plus the historically used 2014 columnar operation might select five
 * columns *inside each printed word*. Neither source authenticates that
 * composition. This script tests only that frozen interpretation.
 *
 * SFT: node sims/lp2_fivedot_wordlocal_columnar_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} pathname @returns {string} */
const read = pathname => fs.readFileSync(path.join(root, pathname), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const letters = new Map(corpus.runes.map((x, i) => [x, i]));
const pageRunes = Array.from({length: 58}, () => []);
const printedWords = [];
let page = 0;
let firstPage = 0;
let current = [];
/** @returns {void} */
function finish() {
  if (!current.length) return;
  printedWords.push({
    symbols: current,
    physical: firstPage >= 50 ? firstPage + 1 : firstPage
  });
  current = [];
}
for (const ch of read("resources/liber-primus/lp2-transcription.txt")) {
  if (letters.has(ch)) {
    if (!current.length) firstPage = page;
    current.push(letters.get(ch));
    pageRunes[page >= 50 ? page + 1 : page].push(letters.get(ch));
  } else if (ch === "%") {
    page++;
  } else if ("-.$&§0123456789".includes(ch)) {
    finish();
  }
}
finish();
assert.equal(page, 56);
for (const record of corpus.pages) {
  assert.deepEqual(pageRunes[record.page], record.indices, 
    "original rune mismatch physical p" + record.page);
}
const unknown = printedWords.filter(w => w.physical <= 55);
assert.equal(unknown.length, 2896);
assert.equal(unknown.reduce((s,w) => s + w.symbols.length, 0), 12956);
assert.equal(Math.max(...unknown.map(w => w.symbols.length)), 14);

/**
 * Historical-columnar-inspired encryption: write row-major in five columns,
 * no padding or dummy cells, then read each column top-to-bottom.
 * @param {number[]} original
 * @returns {number[]}
 */
function columnarForward(original) {
  const width = Math.min(5, original.length);
  const columns = Array.from({length: width}, () => []);
  for (let i = 0; i < original.length; i++) {
    columns[i % 5].push(original[i]);
  }
  return columns.flat();
}

/**
 * The single predeclared original-input inverse. Each of five columns has
 * floor(n/5) symbols, with one extra in the first n%5 columns. Reconstruct
 * row-major, retaining original boundaries. For n<=5 the map is identity.
 * @param {number[]} cipher
 * @returns {number[]}
 */
function columnarInverse(cipher) {
  const n = cipher.length;
  const width = Math.min(5, n);
  const rows = Math.ceil(n / 5);
  const q = Math.floor(n / 5);
  const rem = n % 5;
  const columns = [];
  let next = 0;
  for (let col = 0; col < width; col++) {
    const length = n < 5 ? 1 : q + Number(col < rem);
    columns.push(cipher.slice(next, next + length));
    next += length;
  }
  assert.equal(next, n, "lossless column split");
  const out = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < width; col++) {
      if (row < columns[col].length) out.push(columns[col][row]);
    }
  }
  assert.equal(out.length, n);
  return out;
}
for (let n = 1; n <= 14; n++) {
  const native = Array.from({length:n}, (_,i) => (i * 7 + 3) % 29);
  assert.deepEqual(columnarInverse(columnarForward(native)), native);
  assert.deepEqual(columnarForward(columnarInverse(native)), native);
}
const first = unknown.filter(w => w.physical <= 2);
const last = unknown.filter(w => w.physical >= 54);
const transformed = ws => ws.map(w => columnarInverse(w.symbols));
const original = ws => ws.map(w => w.symbols);
const flatten = ws => ws.flat();

/** @param {number[]} seq @returns {number} */
function ioc(seq) {
  const f = Array(29).fill(0);
  for (const x of seq) f[x]++;
  return f.reduce((sum,k) => sum+k*(k-1), 0) / (seq.length*(seq.length-1));
}
/**
 * @param {number[][]} sourceWords
 * @returns {{words:number,runes:number,adjacent:number,adjacentSites:number,lag5:number,lag5Sites:number,paired:number,ioc:number}}
 */
function statistics(sourceWords) {
  let length = 0, adjacent = 0, adjacentSites = 0;
  let lag5 = 0, lag5Sites = 0, paired = 0;
  for (const w of sourceWords) {
    length += w.length;
    for (let i = 1; i < w.length; i++) {
      adjacentSites++;
      if (w[i] === w[i-1]) adjacent++;
    }
    for (let i = 5; i < w.length; i++) {
      lag5Sites++;
      if (w[i] === w[i-5]) {
        lag5++;
        if (i >= 6 && w[i-1] === w[i-6]) paired++;
      }
    }
  }
  return {words:sourceWords.length, runes:length, adjacent, adjacentSites,
    lag5,lag5Sites,paired,ioc:ioc(flatten(sourceWords))};
}

// Original full-book source invariants and exact frozen-transform effects.
const allSource = statistics(original(unknown));
const allInverse = statistics(transformed(unknown));
assert.equal(allSource.adjacent, 63);
assert.equal(allSource.lag5, 104);
assert.equal(allSource.paired, 9);
assert.equal(allInverse.adjacent, 164);
assert.equal(allInverse.lag5, 14);
assert.equal(allInverse.paired, 0);
assert.equal(allSource.ioc, 0.03447839786450569);
assert.equal(allInverse.ioc, allSource.ioc);
assert.equal(unknown.filter(w => w.symbols.length <= 5).length, 2081);

// Independent original sections, frozen before reading transform results.
const firstSource = statistics(original(first));
const firstInv = statistics(transformed(first));
const lastSource = statistics(original(last));
const lastInv = statistics(transformed(last));
assert.deepEqual([firstSource.runes,firstSource.lag5,firstSource.adjacent],
  [729,7,2]);
assert.deepEqual([firstInv.runes,firstInv.lag5,firstInv.adjacent],
  [729,0,11]);
assert.deepEqual([lastSource.runes,lastSource.lag5,lastSource.adjacent],
  [308,3,1]);
assert.deepEqual([lastInv.runes,lastInv.lag5,lastInv.adjacent],
  [308,0,1]);
for (const w of unknown) {
  assert.deepEqual(columnarForward(columnarInverse(w.symbols)), w.symbols);
}

// Historical solved-Cicada source-calibrated orthography. No arbitrary
// rune labels: ᛝ=ING, ᛡ=IO, with witnessed older QU/K/V/Z normalization.
const tokens = corpus.translit.map((s,i) => ({s,i}))
  .sort((a,b) => b.s.length-a.s.length);
/** @param {string} word @returns {number[]} */
function encodeNativeWord(word) {
  const w=word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out=[];
  for (let i=0;i<w.length;) {
    if (w.startsWith("ING",i)) {
      out.push(21);
      i+=3;
    } else if (w.startsWith("IO",i)) {
      out.push(27);
      i+=2;
    } else {
      const token=tokens.find(t => w.startsWith(t.s,i));
      assert(token, "unmapped token in native word "+word);
      out.push(token.i);
      i+=token.s.length;
    }
  }
  return out;
}
const trainingWords=(read("resources/liber-primus/lp1-plaintext-reference.txt")
  .replace(/^#.*$/gm,"").toUpperCase().match(/[A-Z]+/g)||[])
  .map(encodeNativeWord);
const training=flatten(trainingWords);
assert.equal(training.length, 3510);
const bigrams=new Map();
const trigrams=new Map();
for (let i=2;i<training.length;i++) {
  const bi=29*training[i-2]+training[i-1];
  bigrams.set(bi, (bigrams.get(bi)||0)+1);
  const tri=29*bi+training[i];
  trigrams.set(tri,(trigrams.get(tri)||0)+1);
}
/** @param {number[]} seq @returns {number} */
function trigramScore(seq) {
  let sum=0;
  for(let i=2;i<seq.length;i++) {
    const bi=29*seq[i-2]+seq[i-1];
    sum+=Math.log(((trigrams.get(29*bi+seq[i])||0)+1)/
      ((bigrams.get(bi)||0)+29));
  }
  return sum/(seq.length-2);
}
assert(Math.abs(trigramScore(training)-(-2.260728012730832))<1e-10);
const solved57=corpus.pages.find(p=>p.page===57).indices;
assert(Math.abs(trigramScore(solved57)-(-2.468144714244746))<1e-10);
assert.equal(solved57.length, 95);

// Original 2014-player-readable solved plaintext is planted into the
// proposed five-column transport, and all 650 native-word symbols restore.
const nativePlant=trainingWords.slice(0,650);
assert.deepEqual(nativePlant.map(columnarForward).map(columnarInverse), nativePlant);
const p57Words=original(printedWords.filter(w=>w.physical===57));
assert.equal(p57Words.length,20);
assert.deepEqual(flatten(p57Words),solved57);
assert.deepEqual(p57Words.map(columnarForward).map(columnarInverse),p57Words);

const effects=[
  ["full LP2",original(unknown),transformed(unknown)],
  ["p0–2",original(first),transformed(first)],
  ["p54–55",original(last),transformed(last)],
  ["native first650 LP1 prose words",nativePlant,nativePlant.map(columnarForward)],
  ["authentic clear p57",p57Words,p57Words.map(columnarForward)]
];
console.log("DIRECTOR #894: frozen word-local five-column inverse");
console.log("Source authenticated: five-dot source stencil and historical columnar separately; composition hypothetical");
console.log("GP-native language controls: 3510 training runes, score "+
  trigramScore(training).toFixed(9)+"; clear p57 score "+
  trigramScore(solved57).toFixed(9));
console.log("Unchanged printed words length<=5: 2081/2896; every original value exactly re-encodes");
for (const [name,before,after] of effects) {
  console.log(JSON.stringify({name,before:statistics(before),
    after:statistics(after),trigramBefore:trigramScore(flatten(before)),
    trigramAfter:trigramScore(flatten(after))}));
}
console.log("Original first 100 decoded GP indices:");
for (const ws of [transformed(first),transformed(last)]) {
  console.log(flatten(ws).slice(0,100).map(i=>corpus.translit[i]).join(" "));
}
console.log("Source exactness, native positive plants, inverse and untouched chapters: PASS");
