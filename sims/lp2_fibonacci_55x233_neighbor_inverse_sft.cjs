"use strict";

/**
 * Source-motivated, key-free Fibonacci-neighbor inverse on the 55 x 233
 * predecessor-excluding GP28 stream.  A bounded negative control, not a
 * claim about the historical LP2 cipher.
 *
 * Run on Windows 11 or elsewhere: node sims/lp2_fibonacci_55x233_neighbor_inverse_sft.cjs
 *
 * Input: source-indexed original pages 0..55; physical p50 has no runes.
 * Skip one page IV and transparent adjacent duplicate events, map each
 * remaining successor into 0..27 by excluding its previous ciphertext rune.
 * The original ciphertext and IV/duplicate positions are preserved exactly.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpusRaw = read("resources/liber-primus/lp2-corpus.json");
const englishRaw = read("resources/control/shakespeare_first300k.txt");
const corpus = JSON.parse(corpusRaw);
const MOD = 28, ROWS = 55, COLS = 233, LENGTH = ROWS * COLS;

/** @param {number} n @returns {number} */
function mod(n) { return ((n % MOD) + MOD) % MOD; }

/**
 * Reversible predecessor-excluding GP29-to-GP28 rank reduction.
 * @param {{page:number,indices:number[]}[]} pages
 * @returns {{rank:number[],records:{page:number,iv:number,events:boolean[]}[],duplicates:number}}
 */
function compact(pages) {
  const rank = [], records = [];
  let duplicates = 0;
  for (const page of pages) {
    assert.ok(page.indices.length);
    const iv = page.indices[0];
    let previous = iv;
    const events = [];
    for (const next of page.indices.slice(1)) {
      const repeat = next === previous;
      events.push(repeat);
      if (repeat) { duplicates++; continue; }
      rank.push(next < previous ? next : next - 1);
      previous = next;
    }
    records.push({page:page.page,iv,events});
  }
  return {rank,records,duplicates};
}

/**
 * Reinsert exact original page IV and duplicate-marker positions.
 * The event schedule is original-derived side information; its provenance
 * is a limitation of the proposed encoding interpretation.
 * @param {number[]} rank
 * @param {{page:number,iv:number,events:boolean[]}[]} records
 * @returns {number[][]}
 */
function restore(rank, records) {
  let cursor = 0;
  const pages = [];
  for (const entry of records) {
    let previous = entry.iv;
    const indices = [previous];
    for (const repeat of entry.events) {
      if (!repeat) {
        const k = rank[cursor++];
        assert.ok(Number.isInteger(k) && k >= 0 && k < MOD);
        previous = k < previous ? k : k + 1;
      }
      indices.push(previous);
    }
    pages.push(indices);
  }
  assert.equal(cursor, rank.length);
  return pages;
}

/**
 * Key-free Fibonacci recurrence variants. One-dimensional recurrence resets
 * optionally every 233 entries. Two-dimensional recurrence uses the
 * previous column and previous row of a 55 x 233 rectangle.
 * @param {number[]} ciphertext
 * @param {"one-book"|"one-row"|"two-dimensional"} mode
 * @returns {number[]}
 */
function inverse(ciphertext, mode) {
  assert.equal(ciphertext.length, LENGTH);
  return ciphertext.map((v, i) => {
    const col = i % COLS, row = Math.floor(i / COLS);
    if (mode === "one-book") return mod(v - (i ? ciphertext[i - 1] : 0) - (i > 1 ? ciphertext[i - 2] : 0));
    if (mode === "one-row") return mod(v - (col ? ciphertext[i - 1] : 0) - (col > 1 ? ciphertext[i - 2] : 0));
    assert.equal(mode,"two-dimensional");
    return mod(v - (col ? ciphertext[i - 1] : 0) - (row ? ciphertext[i - COLS] : 0));
  });
}

/**
 * Exact forward two-dimensional recurrence for planted plain GP28.
 * @param {number[]} plain
 * @returns {number[]}
 */
function forward2D(plain) {
  assert.equal(plain.length, LENGTH);
  const out = new Array(plain.length);
  for (let i = 0; i < plain.length; i++) {
    const col = i % COLS, row = Math.floor(i / COLS);
    out[i] = mod(plain[i] + (col ? out[i - 1] : 0) + (row ? out[i - COLS] : 0));
  }
  return out;
}

/**
 * Frozen GP-digraph approximation used solely as a native-English positive
 * control. Unrepresented Latin K/Q/V/Z map to C/C/U/S respectively.
 * @param {string} raw
 * @returns {number[]}
 */
function nativeEnglish(raw) {
  const map = new Map(corpus.translit.map((s,i) => [s,i]));
  const s = raw.toUpperCase().replace(/K/g,"C").replace(/Q/g,"C")
    .replace(/V/g,"U").replace(/Z/g,"S").replace(/[^A-Z]/g,"");
  const out = [];
  for (let i = 0; i < s.length;) {
    const pair = map.get(s.slice(i,i+2));
    if (pair !== undefined && pair < MOD) {out.push(pair);i += 2;continue;}
    const one = map.get(s[i]);
    if (one !== undefined && one < MOD) out.push(one);
    i++;
  }
  return out;
}

/** @param {number[]} native @returns {(seq:number[])=>number} */
function trigramScore(native) {
  const counts = new Uint32Array(MOD ** 3);
  for (let i = 0; i < native.length - 2; i++)
    counts[(native[i] * MOD + native[i+1]) * MOD + native[i+2]]++;
  const denom = native.length - 2 + 0.2 * counts.length;
  return seq => {
    let log = 0;
    for (let i = 0; i < seq.length - 2; i++)
      log += Math.log((counts[(seq[i] * MOD + seq[i+1]) * MOD + seq[i+2]] + 0.2) / denom);
    return log / (seq.length - 2);
  };
}

function main() {
  const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
  const packed = compact(pages);
  assert.equal(pages.length, ROWS);
  assert.equal(packed.duplicates, 86);
  assert.equal(packed.rank.length, LENGTH);
  const restored = restore(packed.rank, packed.records);
  for (let i=0;i<pages.length;i++) assert.deepEqual(restored[i],pages[i].indices);
  const native = nativeEnglish(englishRaw), plant = native.slice(0,LENGTH);
  assert.equal(plant.length,LENGTH);
  const syntheticCipher = forward2D(plant);
  assert.deepEqual(inverse(syntheticCipher,"two-dimensional"),plant);
  const score = trigramScore(native);
  const modes = ["one-book","one-row","two-dimensional"];
  const result = {
    source: {
      pages:pages.length, originalRunes:pages.reduce((n,p)=>n+p.indices.length,0),
      duplicates:packed.duplicates, activeRanks:packed.rank.length,
      corpusSha256:crypto.createHash("sha256").update(corpusRaw).digest("hex"),
      englishSha256:crypto.createHash("sha256").update(englishRaw).digest("hex"),
      exactOriginalRankRoundtrip:true
    },
    methodology:"subtract preceding two ranks, or left+upper neighboring ranks modulo 28, with fixed zero boundaries",
    scoreUnits:"mean GP28 log probability per trigram; greater is more English-like",
    baseline:{ciphertext:score(packed.rank),nativeShakespeare:score(plant),twoDimensionalPlantCipher:score(syntheticCipher)},
    syntheticPlantExact:true,
    original:modes.map(mode => {
      const output = inverse(packed.rank,mode);
      return {
        mode,
        score:score(output),
        firstFortyGP:output.slice(0,40).map(i=>corpus.translit[i]).join(" ")
      };
    }),
    conclusion:"No source-supported original plaintext under these exact key-free neighbor recurrences; the 55x233 compaction and assumed transparent duplicate events are provisional."
  };
  assert.ok(result.original.every(o=>o.score < result.baseline.nativeShakespeare - 2));
  console.log(JSON.stringify(result,null,2));
}

if (require.main === module) main();
module.exports = {compact,restore,inverse,forward2D,nativeEnglish,trigramScore,main};
