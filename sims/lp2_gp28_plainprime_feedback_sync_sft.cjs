"use strict";
/**
 * Lossless GP28 original page inverse with a running *plaintext*-prime clock,
 * plus exact all-seed convergence and source-native matched positives.
 *
 * Node 22 CommonJS, built-ins only. This original-input SFT writes no files.
 * Distinct from preceding-ciphertext-prime and previous-*word* feedback.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "../resources/liber-primus/lp2-corpus.json"), "utf8"));
const english = fs.readFileSync(
  path.join(__dirname, "../resources/control/shakespeare_first300k.txt"), "utf8");
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((s, p) => s + p.indices.length, 0), 12956);
const prime = corpus.prime;
const powers = [];
const log = new Int8Array(29).fill(-1);
let value = 1;
for (let k = 0; k < 28; k++) {
  powers.push(value);
  assert.equal(log[value], -1);
  log[value] = k;
  value = value * 15 % 29;
}
assert.equal(value, 1);

/** @param {number} n @returns {number} */
const mod = n => ((n % 28) + 28) % 28;

/**
 * Decode one original page using guessed secret prime-state seed.
 * GP index28 represents the reserved, repeated-cipher-rune channel.
 * The leader is an observed ciphertext IV.
 * @param {number[]} cipher
 * @param {-1|1} sign
 * @param {number} seed
 * @returns {number[]}
 */
function decode(cipher, sign, seed) {
  let q = seed;
  const out = [cipher[0]];
  for (let i = 1; i < cipher.length; i++) {
    const d = (cipher[i] - cipher[i - 1] + 29) % 29;
    const symbol = d === 0 ? 28 : mod(log[d] - sign * q);
    out.push(symbol);
    q = mod(q + prime[symbol]);
  }
  return out;
}

/**
 * Encode an entire page from its 28-ary GP content and transparent IV.
 * @param {number[]} original
 * @param {number} leader
 * @param {-1|1} sign
 * @param {number} seed
 * @returns {number[]}
 */
function encode(original, leader, sign, seed) {
  let q = seed;
  const cipher = [leader];
  for (let i = 1; i < original.length; i++) {
    const p = original[i];
    const predecessor = cipher[i - 1];
    cipher.push(p === 28 ? predecessor
      : (predecessor + powers[mod(p + sign * q)]) % 29);
    q = mod(q + prime[p]);
  }
  return cipher;
}

/** @param {number[]} data @returns {number} */
function ioc(data) {
  const h = new Uint32Array(28);
  for (const x of data) {
    assert.ok(x >= 0 && x < 28);
    h[x]++;
  }
  return h.reduce((total, n) => total + n * (n - 1), 0)
    / (data.length * (data.length - 1));
}

/**
 * Walk every secret seed simultaneously, record original content positions
 * where all 28 possibilities have become the identical rune.
 * @param {number[]} cipher
 * @param {-1|1} sign
 * @returns {{unique:number[],deciphered:Array<[number,number]>,
 *    firstCoalescence:number, finalStates:number,countsAt10:number}}
 */
function ambiguity(cipher, sign) {
  let states = Array.from({length: 28}, (_, j) => j);
  const deciphered = [];
  const unique = [];
  let firstCoalescence = -1;
  let countsAt10 = -1;
  for (let i = 1; i < cipher.length; i++) {
    const d = (cipher[i] - cipher[i - 1] + 29) % 29;
    const out = states.map(q => d === 0 ? 28 : mod(log[d] - sign * q));
    if (new Set(out).size === 1) {
      unique.push(i);
      deciphered.push([i, out[0]]);
    }
    states = states.map((q, k) => mod(q + prime[out[k]]));
    const distinct = new Set(states).size;
    if (i === 10) countsAt10 = distinct;
    if (distinct === 1 && firstCoalescence < 0) firstCoalescence = i;
  }
  return {unique, deciphered, firstCoalescence,
    finalStates:new Set(states).size, countsAt10};
}

/** Conventional independently pinned GP transliteration for prose controls. */
function encodeNative(s) {
  const map = new Map(corpus.translit.map((x, i) => [x, i]));
  s = s.toUpperCase().replace(/QU/g, "CW").replace(/[KQ]/g, "C")
    .replace(/V/g, "U").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < s.length;) {
    const two = s.slice(i, i + 2);
    if (map.has(two)) {
      out.push(map.get(two) === 28 ? 18 : map.get(two));
      i += 2;
    } else {
      if (map.has(s[i])) {
        out.push(map.get(s[i]) === 28 ? 18 : map.get(s[i]));
      }
      i++;
    }
  }
  return out;
}

const native = encodeNative(english);
assert.equal(native.length, 218800);
let consecutiveContent = 0;
const dataBySign = {};
const ambiguityBySign = {};
for (const sign of [1,-1]) {
  let singletonContent = [], nativeOffsets = [], runes = 0, markerCount=0;
  const observations = [];
  for (const page of pages) {
    const original = page.indices;
    const all = ambiguity(original, sign);
    const unambig = new Map(all.deciphered);
    for (let seed = 0; seed < 28; seed++) {
      const decoded = decode(original, sign, seed);
      assert.deepEqual(encode(decoded, original[0], sign, seed), original);
      for (const [offset, symbol] of all.deciphered) {
        assert.equal(decoded[offset], symbol);
      }
    }
    for (let i=1; i < original.length; i++) {
      const repeat = original[i] === original[i-1];
      if (repeat) markerCount++;
      if (!repeat) {
        if (unambig.has(i)) {
          singletonContent.push(unambig.get(i));
          nativeOffsets.push(runes);
        }
        runes++;
      }
    }
    observations.push({
      page:page.page,
      runeCount:original.length,
      firstCoalescence:all.firstCoalescence,
      finalStates:all.finalStates,
      uniquePositions:all.unique.length,
    });
  }
  assert.equal(runes, 12815);
  assert.equal(markerCount, 86);
  let first=Infinity,last=-Infinity;
  const controls = [];
  for (let start=0;start+runes<=native.length;start+=199) {
    const score = ioc(nativeOffsets.map(pos => native[start+pos]));
    controls.push({start, ioc:score});
  }
  assert.equal(controls.length, 1036);
  controls.sort((a,b)=>a.ioc-b.ioc);
  dataBySign[sign] = {
    sign,
    unambiguousContent:singletonContent.length,
    unambiguousAll:observations.reduce((s,p)=>s+p.uniquePositions,0),
    convergedPages:observations.filter(p=>p.firstCoalescence>=0).length,
    totalPages:observations.length,
    observedContentIoC:ioc(singletonContent),
    nativeWindows:controls.length,
    nativeMinimum:controls[0], nativeMedian:controls[518],
    nativeMaximum:controls.at(-1),
    lastRemainingStateCountMaximum:Math.max(...observations.map(x=>x.finalStates)),
    nonConvergedPages:observations.filter(p=>p.firstCoalescence<0)
      .map(x=>x.page),
    largestFirstCoalescence:Math.max(...observations.map(x=>x.firstCoalescence)),
  };
  ambiguityBySign[sign] = observations;
}
// Frozen original-input assertions establish that the decoder did not
// simply choose a lucky seed or leak target symbols into its controls.
assert.equal(dataBySign[1].unambiguousContent, 9462);
assert.equal(dataBySign[1].unambiguousAll, 9548);
assert.equal(dataBySign[1].convergedPages, 54);
assert.deepEqual(dataBySign[1].nonConvergedPages, [55]);
assert.equal(dataBySign[1].observedContentIoC, 0.0356630768759538);
assert.equal(dataBySign[1].nativeMinimum.ioc, 0.05938222820464821);
assert.equal(dataBySign[-1].unambiguousContent, 4001);
assert.equal(dataBySign[-1].unambiguousAll, 4087);
assert.equal(dataBySign[-1].convergedPages, 37);
assert.equal(dataBySign[-1].observedContentIoC, 0.03568357910522369);
assert.equal(dataBySign[-1].nativeMinimum.ioc, 0.05848125468632842);

// Whole-book native-GP positive with each original repeat marker retained,
// the entire original page geometry, and a different secret initial q per page.
let nativePtr = 45000;
const plants = {};
for (const sign of [1,-1]) {
  let recoveredCount=0,sourceCount=0,repeatCount=0;
  nativePtr=45000;
  for (const page of pages) {
    const secret=mod(7*page.page+3);
    const desired=[page.indices[0]];
    for (let i=1;i<page.indices.length;i++) {
      const repeat=page.indices[i]===page.indices[i-1];
      desired.push(repeat?28:native[nativePtr++]);
      if (repeat) repeatCount++;
    }
    const cipher=encode(desired,page.indices[0],sign,secret);
    assert.deepEqual(decode(cipher,sign,secret),desired);
    assert.deepEqual(cipher.map((x,i)=>i>0&&x===cipher[i-1]),
      page.indices.map((x,i)=>i>0&&x===page.indices[i-1]));
    recoveredCount+=desired.length;
    sourceCount+=cipher.length;
  }
  assert.equal(recoveredCount,12956);
  assert.equal(sourceCount,12956);
  assert.equal(repeatCount,86);
  plants[sign]={recoveredSymbols:recoveredCount,
    encryptedSymbols:sourceCount, originalMarkerPositions:repeatCount};
}

console.log(JSON.stringify({
  status:"source-motivated plaintext-prime rank28 model excluded as direct native-GP decoder",
  secretInitialStatesPerPage:28, examinedPages:55, sourceRunes:12956,
  original:dataBySign,
  sourceNativePlants:plants
},null,2));
