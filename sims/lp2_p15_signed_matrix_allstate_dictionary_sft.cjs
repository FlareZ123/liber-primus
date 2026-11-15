"use strict";

/**
 * Windows Node 22 SFT for a fully unknown 4-component state under the
 * manuscript's source-derived signed p15 matrix.
 *
 * Run: node sims/lp2_p15_signed_matrix_allstate_dictionary_sft.cjs
 *
 * Reads exact repository source; does not write files or use random seeds.
 * Original data and matrix provenance:
 * im-results/lp2-p15-p39-signed-matrix-eigen-crosslink.md
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const sections = fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-transcription.txt"), "utf8").trim().split("%");
const lexiconText = fs.readFileSync(path.join(root, "resources", "control", "english_wordfreq_textblob.txt"), "utf8");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const gpIndex = new Map(corpus.translit.map((r, i) => [r, i]));
const alphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
const pairs = new Set(["TH", "NG", "EO", "OE", "AE", "IA", "EA"]);
const N = 29;
const M = [
  [10, 3, 20, 22],
  [1, 22, 21, 25],
  [11, 17, 19, 7],
  [8, 12, 12, 22],
];

/** @type {number[]} */
const ciphertext = [];
/** @type {{start:number,len:number}[]} */
const words = [];
let cursor = 0;
let currentLength = 0;
for (let page = 40; page <= 53; page++) {
  if (page === 50) continue;
  const section = sections[page < 50 ? page : page - 1];
  let seen = 0;
  for (const ch of section) {
    if (runeIndex.has(ch)) {
      if (page === 40 && seen++ < 8) continue;
      ciphertext.push(runeIndex.get(ch));
      currentLength++;
    } else if (!"/ \n\r\t".includes(ch) && currentLength) {
      words.push({ start: cursor, len: currentLength });
      cursor += currentLength;
      currentLength = 0;
    }
  }
}
if (currentLength) words.push({ start: cursor, len: currentLength });
const source = corpus.pages.filter((p) => p.page >= 40 && p.page <= 53).flatMap((p, i) => i ? p.indices : p.indices.slice(8));
assert.deepEqual(ciphertext, source);
assert.equal(ciphertext.length, 3000);
assert.equal(words.length, 667);
assert.equal(cursor + currentLength, 3000);

/** @type {Set<string>} */
const dictionary = new Set();
/** @type {Set<string>} */
const prefixes = new Set();
/** @type {Map<number,{key:string,f:number}[]>} */
const byLength = new Map();
for (const line of lexiconText.split("\n")) {
  const match = /^([A-Za-z]+)\s+(\d+)$/.exec(line);
  if (!match) continue;
  const normalized = match[1].toUpperCase().replace(/[KQ]/g, "C").replace(/V/g, "U").replace(/Z/g, "S");
  const encoded = [];
  for (let i = 0; i < normalized.length;) {
    const pair = normalized.slice(i, i + 2);
    if (pairs.has(pair)) {
      encoded.push(gpIndex.get(pair));
      i += 2;
    } else {
      const value = gpIndex.get(normalized[i]);
      if (value === undefined) {
        encoded.length = 0;
        break;
      }
      encoded.push(value);
      i++;
    }
  }
  if (encoded.length === 0) continue;
  const key = encoded.map((v) => alphabet[v]).join("");
  dictionary.add(key);
  if (encoded.length >= 4) prefixes.add(key.slice(0, 4));
  const list = byLength.get(encoded.length) || [];
  list.push({ key, f: Number(match[2]) });
  byLength.set(encoded.length, list);
}
for (const list of byLength.values()) list.sort((a, b) => b.f - a.f);
assert.equal(dictionary.size, 29061);
assert.equal(prefixes.size, 7612);

/** Coefficient rows for all 750 powers M^t, where t=floor(rune/4). */
const coefficients = [];
let power = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
for (let block = 0; block < 750; block++) {
  for (let r = 0; r < 4; r++) coefficients.push(power.slice(r * 4, r * 4 + 4));
  const next = Array(16).fill(0);
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      for (let k = 0; k < 4; k++)
        next[r * 4 + c] = (next[r * 4 + c] + power[r * 4 + k] * M[k][c]) % N;
  power = next;
}
assert.deepEqual(coefficients.slice(0, 4), [
  [1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1],
]);

/** @param {number[]} sourceText @param {number[]} state */
function encrypt(sourceText, state) {
  return sourceText.map((value, i) => {
    const r = coefficients[i];
    return (value + r[0] * state[0] + r[1] * state[1] + r[2] * state[2] + r[3] * state[3]) % N;
  });
}

/** @param {number[]} cipher @param {number[]} state @param {boolean} skipEveryCipherF */
function decrypt(cipher, state, skipEveryCipherF = false) {
  const out = new Uint8Array(cipher.length);
  let clock = 0;
  for (let i = 0; i < cipher.length; i++) {
    if (skipEveryCipherF && cipher[i] === 0) {
      out[i] = 0;
      continue;
    }
    const r = coefficients[clock++];
    const key = (r[0] * state[0] + r[1] * state[1] + r[2] * state[2] + r[3] * state[3]) % N;
    out[i] = (cipher[i] + N - key) % N;
  }
  return out;
}

/** @param {number[] | Uint8Array} symbols */
function indexOfCoincidence(symbols) {
  const bins = new Uint16Array(N);
  for (const v of symbols) bins[v]++;
  let pairs = 0;
  for (const count of bins) pairs += count * (count - 1);
  return pairs / (symbols.length * (symbols.length - 1));
}

/**
 * Exhaust every possible four-dimensional initial state, regardless
 * of whether its first four decrypted runes resemble any word.
 * Dynamic matrix powers are known, so each state has exactly one inverse.
 * @param {number[]} sourceText
 */
function allStatesFirst300(sourceText) {
  const table = Array.from({ length: 4 }, (_, k) =>
    Uint8Array.from(coefficients.slice(0, 300).flatMap((row) =>
      Array.from({ length: N }, (_, value) => (row[k] * value) % N))));
  const histogram = new Uint16Array(N);
  let bestPairs = -1, bestStateID = -1, above041 = 0;
  for (let packed = 0; packed < N ** 4; packed++) {
    const s0 = packed % N;
    const s1 = Math.floor(packed / N) % N;
    const s2 = Math.floor(packed / (N * N)) % N;
    const s3 = Math.floor(packed / (N * N * N)) % N;
    histogram.fill(0);
    for (let i = 0, off = 0; i < 300; i++, off += N) {
      const key = (table[0][off + s0] + table[1][off + s1] + table[2][off + s2] + table[3][off + s3]) % N;
      histogram[(sourceText[i] + N - key) % N]++;
    }
    let pairs = 0;
    for (const count of histogram) pairs += count * (count - 1);
    if (pairs > bestPairs) { bestPairs = pairs; bestStateID = packed; }
    if (pairs >= 0.041 * 300 * 299) above041++;
  }
  const state = Array.from({ length: 4 }, (_, i) => Math.floor(bestStateID / N ** i) % N);
  return { states: N ** 4, bestStateID, state, bestIoC: bestPairs / (300 * 299), above041 };
}

/** @param {number[]} cipher @param {boolean} skipF */
function fullDictionarySearch(cipher, skipF = false) {
  let maxLongWords = 0, maxIoC = 0, maxRun = 0;
  let best = null;
  for (const prefix of prefixes) {
    const state = Array.from(prefix, (symbol, i) => (cipher[i] + N - alphabet.indexOf(symbol)) % N);
    const decoded = decrypt(cipher, state, skipF);
    let longWords = 0, longRunes = 0, match3 = 0, streak = 0, bestRun = 0;
    for (const { start, len } of words) {
      let token = "";
      for (let i = start; i < start + len; i++) token += alphabet[decoded[i]];
      const known = dictionary.has(token);
      if (known && len >= 4) {
        longWords++;
        longRunes += len;
        streak++;
        bestRun = Math.max(bestRun, streak);
      } else {
        streak = 0;
      }
      if (known && len >= 3) match3++;
    }
    const ioc = indexOfCoincidence(decoded);
    maxLongWords = Math.max(maxLongWords, longWords);
    maxIoC = Math.max(maxIoC, ioc);
    maxRun = Math.max(maxRun, bestRun);
    const score = longRunes * 2 + match3 + bestRun * 7;
    if (!best || score > best.score) best = { state, score, longWords, longRunes, match3, bestRun, ioc };
  }
  return { testedPrefixStates: prefixes.size, maxLongWords, maxIoC, maxRun, best };
}

console.log("source:", JSON.stringify({ positions: ciphertext.length, words: words.length, sourcePrefix: corpus.translit.slice(0, 4) }));
const exhaustive = allStatesFirst300(ciphertext);
assert.equal(exhaustive.states, 707281);
assert.equal(exhaustive.bestStateID, 673998);
assert.equal(exhaustive.above041, 0);
assert(Math.abs(exhaustive.bestIoC - 0.04064659977703456) < 1e-12);
console.log("full four-vector seed universe, original first 300:", JSON.stringify(exhaustive));

const original = fullDictionarySearch(ciphertext);
assert.equal(original.testedPrefixStates, 7612);
assert.equal(original.maxLongWords, 4);
assert.equal(original.maxRun, 1);
assert(Math.abs(original.maxIoC - 0.03491097032344115) < 1e-12);
console.log("all English four-rune dictionary prefixes, original 3000:", JSON.stringify(original));

const trueState = [3, 5, 7, 11];
const plant = [];
for (let i = 0; i < words.length; i++) {
  const list = byLength.get(words[i].len);
  const key = list[(i * 73) % Math.min(100, list.length)].key;
  for (const symbol of key) plant.push(alphabet.indexOf(symbol));
}
assert.equal(plant.length, 3000);
const encryptedPlant = encrypt(plant, trueState);
assert.deepEqual(Array.from(decrypt(encryptedPlant, trueState)), plant);
const positive = fullDictionarySearch(encryptedPlant);
assert.equal(positive.maxLongWords, 384);
assert.equal(positive.maxRun, 11);
assert.deepEqual(positive.best.state, trueState);
assert.equal(positive.best.match3, 553);
console.log("genuine-English original-word-length plant:", JSON.stringify(positive));

const forcedF = fullDictionarySearch(ciphertext, true);
assert.equal(ciphertext.filter((v) => v === 0).length, 124);
assert.equal(forcedF.maxLongWords, 4);
assert(Math.abs(forcedF.maxIoC - 0.03732866511059242) < 1e-12);
console.log("force all 124 printed F to bypass and not advance key:", JSON.stringify(forcedF));

/** Full-period dynamic 4x4 Hill transform under both time directions. */
function dynamicHillGate() {
  const multiply = (a, b) => {
    const next = Array(16).fill(0);
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++)
        for (let k = 0; k < 4; k++)
          next[4*r+c] = (next[4*r+c] + a[4*r+k]*b[4*k+c])%N;
    return next;
  };
  const identity = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
  const powers = [identity];
  for (let t=1;t<=812;t++) powers.push(multiply(powers[t-1],M.flat()));
  assert.deepEqual(powers[812],identity);
  /** @param {number[]} input @param {number} phase @param {number} direction */
  const apply = (input,phase,direction) => {
    const output = new Uint8Array(input.length);
    for(let t=0;t<input.length/4;t++){
      const key=powers[(phase+direction*t+1624)%812];
      for(let r=0;r<4;r++){
        let value=0;
        for(let k=0;k<4;k++) value+=key[4*r+k]*input[4*t+k];
        output[4*t+r]=value%N;
      }
    }
    return output;
  };
  let maxLong=0,maxIoC=0,maxStreak=0,best=null;
  for(const direction of [-1,1])for(let phase=0;phase<812;phase++){
    const decoded=apply(ciphertext,phase,direction);
    let long=0,streak=0,run=0;
    for(const {start,len} of words){
      let token="";
      for(let i=start;i<start+len;i++)token+=alphabet[decoded[i]];
      if(len>=4&&dictionary.has(token)){long++;streak++;run=Math.max(run,streak)}
      else streak=0;
    }
    const ioc=indexOfCoincidence(decoded);
    if(long>maxLong){maxLong=long;best={phase,direction,long,ioc}};
    maxStreak=Math.max(maxStreak,run);
    maxIoC=Math.max(maxIoC,ioc);
  }
  assert.equal(maxLong,4);
  assert.equal(maxStreak,1);
  assert(Math.abs(maxIoC-0.03483627875958653)<1e-12);
  assert.deepEqual(best,{phase:455,direction:-1,long:4,ioc:0.03468311659442036});
  const planted=apply(plant,103,1);
  const recovered=apply(Array.from(planted),709,-1);
  assert.deepEqual(Array.from(recovered),plant);
  let controlHits=0;
  for(const {start,len} of words){
    if(len<4)continue;
    let token="";
    for(let i=start;i<start+len;i++)token+=alphabet[recovered[i]];
    if(dictionary.has(token))controlHits++;
  }
  assert.equal(controlHits,384);
  return {clockVariants:1624,maxLongWords:maxLong,maxOriginalIoC:maxIoC,maxLongWordRun:maxStreak,best,positiveLongWords:controlHits};
}
console.log("all 1624 full-order matrix Hill clocks:",JSON.stringify(dynamicHillGate()));

console.log("PASS: original exhaustive hidden-state inverse, dictionary-positive control and forced-F variant");
