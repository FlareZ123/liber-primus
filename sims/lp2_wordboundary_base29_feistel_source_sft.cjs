"use strict";

/**
 * Original LP2 complete word-boundary/rune Feistel hypothesis, Director #1208.
 *
 * Sources selecting ingredients: 2013 BASE29, 2016 words/numbers message,
 * published 3301 identifier, p56 consecutive-prime-totient shifts.
 * The Feistel composition is a hypothesis, not an author-authenticated cipher.
 *
 * Exact source-original and native-GP positive SFT:
 * node sims/lp2_wordboundary_base29_feistel_source_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source = read("resources/liber-primus/lp2-transcription.txt");
const index = new Map(gp.runes.map((r, i) => [r, i]));
const mod29 = x => (x % 29 + 29) % 29;
/**
 * Parse only actual rune/word/punctuation segmentation. Line wraps and
 * physical pages carry words; source '§.$&' separate punctuation spans.
 * @param {string} text
 * @returns {number[][][]}
 */
function parse(text) {
  /** @type {number[][][]} */
  const spans = [];
  let words = [], word = [];
  const endWord = () => {
    if (word.length) { words.push(word); word = []; }
  };
  const endSpan = () => {
    endWord();
    if (words.length) { spans.push(words); words = []; }
  };
  for (const ch of text) {
    if (index.has(ch)) word.push(index.get(ch));
    else if (ch === "-") endWord();
    else if (".$&§".includes(ch)) endSpan();
  }
  endSpan();
  return spans;
}
/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let v = 1n;
  for (let i = 1; i <= k; i++) v = v * BigInt(n-k+i)/BigInt(i);
  return v;
}
/**
 * Exact positive-integer composition combination rank, lexicographic gap order.
 * @param {number[][]} words
 */
function rank(words) {
  const N = words.reduce((s, w) => s + w.length, 0);
  const W = words.length;
  assert.ok(W >= 1 && N >= W);
  const B = choose(N-1, W-1);
  let r = 0n, prev = 0, gap = 0;
  for (let i = 0; i < W-1; i++) {
    gap += words[i].length;
    for (let j = prev+1; j < gap; j++)
      r += choose(N-1-j, W-i-2);
    prev = gap;
  }
  assert.ok(r >= 0n && r < B);
  return {r, B, N, W};
}
/**
 * @param {bigint} r
 * @param {number} N
 * @param {number} W
 * @returns {number[]}
 */
function unrank(r, N, W) {
  assert.ok(r >= 0n && r < choose(N-1,W-1));
  const lengths = [];
  let prev = 0;
  for (let i = 0; i < W-1; i++) {
    let gap = prev+1;
    for (;;) {
      const count = choose(N-1-gap, W-i-2);
      if (r < count) break;
      r -= count;
      gap++;
    }
    lengths.push(gap-prev);
    prev = gap;
  }
  lengths.push(N-prev);
  assert.equal(r, 0n);
  return lengths;
}
/** @param {number[]} flat @param {number[]} lengths */
function resegment(flat, lengths) {
  let at = 0;
  const result = lengths.map(len => {
    const word = flat.slice(at, at + len);
    at += len;
    return word;
  });
  assert.equal(at,flat.length);
  return result;
}
/** @param {bigint} B @returns {number} */
function keyWidth(B) {
  let v = B-1n, width = 1;
  while (v >= 29n) { v /= 29n; width++; }
  return width;
}
/**
 * Fixed-width, MSB-first BASE29 digits for the transmitted boundary rank.
 * @param {bigint} v
 * @param {bigint} B
 * @returns {number[]}
 */
function keyDigits(v, B) {
  const digits = Array(keyWidth(B)).fill(0);
  for (let i = digits.length-1; i >= 0; i--) {
    digits[i] = Number(v % 29n);
    v /= 29n;
  }
  assert.equal(v,0n);
  return digits;
}
/** @param {number} count @returns {number[]} */
function primeTotients(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let d = 2; d*d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) out.push((n-1)%29);
  }
  return out;
}
/** @param {number[]} flat @returns {bigint} */
function primeSum(flat) {
  return flat.reduce((s, x) => s+BigInt(gp.prime[x]), 0n);
}
/**
 * Modulus factors have prime factors at most N-1, with every original
 * punctuation span shorter than 3301; hence 3301 has an inverse.
 * @param {bigint} B
 */
function inverse3301(B) {
  if (B === 1n) return 0n;
  let a = 3301n, b = B, x = 1n, y = 0n;
  while (b) {
    const q = a/b;
    [a,b] = [b,a-q*b];
    [x,y] = [y,x-q*y];
  }
  assert.equal(a, 1n);
  return (x % B + B) % B;
}
/**
 * Proposed full inverse. The 3301 multiplication varies printed boundaries;
 * the repeat of the boundary BASE29 digits and the prime-totient clock vary
 * every GP29 symbol. Neither composition nor reset is source-authenticated.
 * @param {number[][]} cipherWords
 * @param {number} start Global GP-rune clock (ignores punctuation marks)
 * @param {number[]} phi
 * @param {bigint} [factor]
 * @returns {number[][]}
 */
function decode(cipherWords, start, phi, factor=3301n) {
  const {r,B,N,W} = rank(cipherWords);
  const C = cipherWords.flat();
  const T = (factor*r + primeSum(C)) % B;
  const key = keyDigits(T,B);
  const P = C.map((v,i) => mod29(v-key[i%key.length]-phi[start+i]));
  return resegment(P,unrank(T,N,W));
}
/**
 * Inverse direction, also changing word separators. Every original
 * transmitted rune and separator is recovered exactly after round trip.
 * @param {number[][]} plainWords
 * @param {number} start
 * @param {number[]} phi
 * @returns {number[][]}
 */
function encode(plainWords, start, phi) {
  const {r:T,B,N,W} = rank(plainWords);
  const key = keyDigits(T,B);
  const C = plainWords.flat().map((v,i) =>
    mod29(v + key[i%key.length] + phi[start+i]));
  const q = (T-primeSum(C)) % B;
  const rankCipher = ((inverse3301(B)*q)%B+B)%B;
  return resegment(C,unrank(rankCipher,N,W));
}
/** @param {number[]} runes @returns {number} */
function ioc(runes) {
  const bins = Array(29).fill(0);
  for (const x of runes) bins[x]++;
  return bins.reduce((sum,n) => sum+n*(n-1),0) /
    (runes.length*(runes.length-1));
}
/** @param {number[][][]} spans @returns {number[]} */
const flatten = spans => spans.flat(2);
/** @param {number[][][]} spans @returns {number[][][]} */
function decipher(spans) {
  const phi = primeTotients(flatten(spans).length);
  let start = 0;
  return spans.map(span => {
    const result = decode(span,start,phi);
    start += span.flat().length;
    return result;
  });
}
/** @param {number[][][]} spans @returns {number[][][]} */
function encipher(spans) {
  const phi = primeTotients(flatten(spans).length);
  let start = 0;
  return spans.map(span => {
    const result = encode(span,start,phi);
    start += span.flat().length;
    return result;
  });
}
const unknown = parse(source.split("%").slice(0,55).join("%"));
const C = flatten(unknown);
const original = gp.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.deepEqual(C,original);
assert.equal(C.length,12956);
assert.equal(unknown.length,175);
assert.equal(unknown.flat().length,2896);
assert.equal(unknown.flat().filter(w => w.length === 1).length,83);
const largest = Math.max(...unknown.map(s => s.flat().length));
assert.ok(largest < 3301);
const plaintext = decipher(unknown);
assert.deepEqual(encipher(plaintext),unknown,
  "all original GP rune identities and all 2,896 printed word boundaries");
const p57 = parse(source.split("%")[56]);
assert.equal(flatten(p57).length,95);
assert.equal(p57.flat().length,20);
const plant = encipher(p57);
assert.deepEqual(decipher(plant),p57,
  "independently sourced solved p57 recovers every rune and word boundary");
assert.notDeepEqual(plant,p57,"plant must exercise both channels");
const phi = primeTotients(flatten(plant).length);
assert.notDeepEqual(decode(plant[1],7,phi,3310n),p57[1],
  "incorrect boundary multiplier cannot decode a native-GP positive");
/**
 * Full-length native GP-word positive. Retain every original punctuation
 * span's N/W inventory, selecting independently attested native GP words
 * of exactly the source word lengths. The sentence grammar is not native;
 * the symbol strings themselves all occur in reference English prose.
 * @param {number[][][]} layout
 */
function nativeLengthMatched(layout) {
  const templates = gp.translit.map((t,i) => ({t,i}))
    .sort((a,b) => b.t.length-a.t.length);
  /** @param {string} word @returns {number[]|null} */
  const encodeWord = word => {
    const src = word.toUpperCase().replace(/QU/g,"CW")
      .replace(/V/g,"U").replace(/K/g,"C")
      .replace(/Z/g,"S").replace(/Q/g,"C");
    const result = [];
    for (let i=0;i<src.length;) {
      const token = templates.find(x => src.startsWith(x.t,i));
      if (!token) return null;
      result.push(token.i);
      i += token.t.length;
    }
    return result;
  };
  const byLength = new Map();
  const corpora = [
    "resources/control/gibran_prophet_58585.txt",
    "resources/control/emerson_essays_2944.txt",
    "resources/control/shakespeare_first300k.txt"
  ];
  for (const name of corpora) {
    for (const match of read(name).match(/[A-Za-z]+/g) || []) {
      const word = encodeWord(match);
      if (!word) continue;
      if (!byLength.has(word.length)) byLength.set(word.length,[]);
      byLength.get(word.length).push(word);
    }
  }
  const positions = new Map();
  return layout.map(span => span.map(originalWord => {
    const len=originalWord.length,bucket=byLength.get(len);
    assert.ok(bucket && bucket.length,"native reference has missing word length");
    const at=positions.get(len)||0;
    positions.set(len,at+1);
    return bucket[at%bucket.length];
  }));
}
const nativeOriginal = nativeLengthMatched(unknown);
assert.equal(flatten(nativeOriginal).length,12956);
const nativeCipher = encipher(nativeOriginal);
assert.deepEqual(decipher(nativeCipher),nativeOriginal,
  "full original-length 12,956-rune / 2,896-word native GP plant");
const nativeSyntheticSingles = nativeCipher.flat()
  .filter(w => w.length===1).length;
const nativeSyntheticRunes = flatten(nativeCipher);
const nativeSyntheticRepeats = nativeSyntheticRunes.reduce(
  (s,x,i) => s+Number(i>0&&x===nativeSyntheticRunes[i-1]),0);
const nativePlantedIoC = ioc(flatten(nativeOriginal));
const nativeSyntheticIoC = ioc(nativeSyntheticRunes);
const flatP = flatten(plaintext);
assert.equal(flatP.length,C.length);
assert.equal(plaintext.flat().length,2896);
const pages = gp.pages.filter(p => p.page <= 55);
let bookAt = 0;
const pagesP = new Map();
for (const p of pages) {
  pagesP.set(p.page,flatP.slice(bookAt, bookAt+p.indices.length));
  bookAt += p.indices.length;
}
assert.equal(bookAt,12956);
const chapter0 = [0,1,2].flatMap(p => pagesP.get(p));
const chapter8 = Array.from({length:14},(_,i) => pagesP.get(40+i)).flat();
assert.equal(chapter0.length,729);
assert.equal(chapter8.length,3008);
/** @param {number[][]} ws @returns {string} */
function transliterate(ws) {
  return ws.map(w => w.map(r => gp.translit[r]).join("")).join(" ");
}
console.log(JSON.stringify({
  classification:"frozen source-clue Feistel hypothesis, not a solution",
  source:{runes:C.length,words:unknown.flat().length,spans:unknown.length,
    observedSingletons:83,largestPunctuationSpan:largest},
  fullOriginalRoundtrip:true,
  nativeP57Plant:{runes:95,words:20,roundtrip:true,
    syntheticSingletons:plant.flat().filter(w=>w.length===1).length},
  nativeFullLengthPlant:{runes:12956,words:2896,exactRoundtrip:true,
    nativeGPwordIoC:nativePlantedIoC,syntheticCipherIoC:nativeSyntheticIoC,
    syntheticSingletons:nativeSyntheticSingles,
    syntheticAdjacentRepeats:nativeSyntheticRepeats},
  sourceOutputs:{
    originalIoC:ioc(C),transformedIoC:ioc(flatP),
    firstChapterIoC:ioc(chapter0),untouchedFloralChapterIoC:ioc(chapter8),
    firstOriginalP0Words:transliterate(plaintext.slice(0,3).flat().slice(0,40)),
    p40OpeningGp:chapter8.slice(0,100).map(v => gp.translit[v]).join(" ")
  }
},null,2));
