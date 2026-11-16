#!/usr/bin/env node
"use strict";

// Source-motivated but speculative 243 = 9 x 27 p50-table key test.
// Run from repository root: node sims/lp2_243_9x27_p50_chapter_key_gate.cjs
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const quadText = fs.readFileSync(path.join(root, "resources/control/duko_round27_english_quadgrams.txt"), "utf8");

const chapterPageRanges = [[0,3],[3,8],[8,15],[15,23],[23,27],[27,33],[33,40],[40,54],[54,56]];
const pages = corpus.pages.filter(p => p.page <= 55);
const chapterStreams = chapterPageRanges.map(([a,b]) =>
  pages.filter(p => p.page >= a && p.page < b).flatMap(p => p.indices));
const chapterLengths = chapterStreams.map(x => x.length);
const chapterOffsets = [0];
for (const n of chapterLengths) chapterOffsets.push(chapterOffsets[chapterOffsets.length - 1] + n);
const ciphertext = chapterStreams.flat();
if (ciphertext.length !== 12956 || chapterOffsets[9] !== 12956) {
  throw new Error("Unexpected source dimensions; refusing to run.");
}

// The p32 13-dot hypothesis is interpreted as a leading 13-cell skip.
// Remaining 243 cells are either one continuous key or nine chapter keys of 27.
const tableBytes = grid.pages.flatMap(p => p.bytes);
if (tableBytes.length !== 256) throw new Error("Expected 256 table cells.");
const key = tableBytes.slice(13).map(x => x % 29);
if (key.length !== 243) throw new Error("Expected 243 key values.");
const translit = ["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
const mod29 = x => ((x % 29) + 29) % 29;

const quadCounts = new Map();
let quadTotal = 0;
for (const line of quadText.trim().split(/\r?\n/)) {
  const [gram, count] = line.trim().split(/\s+/);
  if (gram && count !== undefined) {
    const n = Number(count);
    quadCounts.set(gram.toUpperCase(), n);
    quadTotal += n;
  }
}
const quadV = 26 ** 4;
function quadgramScore(indices) {
  const letters = indices.map(i => translit[i]).join("");
  let logSum = 0, countSum = 0, n = 0;
  for (let i = 0; i + 4 <= letters.length; i++) {
    const q = letters.slice(i, i + 4);
    const c = quadCounts.get(q) || 0;
    logSum += Math.log((c + 1) / (quadTotal + quadV));
    countSum += c;
    n++;
  }
  return {mean_log_add_one: logSum / n, mean_raw_quadgram_count: countSum / n, letters: letters.length, quadgrams: n};
}
function ioc(indices) {
  const f = Array(29).fill(0);
  for (const x of indices) f[x]++;
  return f.reduce((s,n) => s + n*(n-1), 0) / (indices.length*(indices.length-1));
}
function locate(globalIndex) {
  let n = 0;
  for (const p of pages) {
    if (globalIndex < n + p.runic_count) return {page:p.page, rune_offset:globalIndex-n};
    n += p.runic_count;
  }
  return null;
}
function decodeNoSkip(mode, sign) {
  const out = [];
  for (let ch = 0; ch < chapterStreams.length; ch++) {
    const stream = chapterStreams[ch];
    const start = chapterOffsets[ch];
    for (let j = 0; j < stream.length; j++) {
      const k = mode === "continuous243" ? key[(start+j) % 243] : key[ch*27 + (j % 27)];
      out.push(mod29(stream[j] + sign*k));
    }
  }
  return out;
}
function fTransparentReachability(mode, sign) {
  // Exact rule: plaintext F is copied unchanged and does not consume key.
  // Ciphertext F may also be a keyed non-F symbol. A keyed branch yielding
  // plaintext F from non-F ciphertext is forbidden.
  const nstates = mode === "continuous243" ? 243 : 27;
  let counts = Array(nstates).fill(0n);
  counts[0] = 1n;
  let globalIndex = 0;
  for (let ch = 0; ch < chapterStreams.length; ch++) {
    if (mode === "nine27") {
      counts = Array(27).fill(0n);
      counts[0] = 1n;
    }
    for (let j = 0; j < chapterStreams[ch].length; j++, globalIndex++) {
      const c = chapterStreams[ch][j];
      const next = Array(nstates).fill(0n);
      for (let phase = 0; phase < nstates; phase++) {
        if (counts[phase] === 0n) continue;
        const k = mode === "continuous243" ? key[phase] : key[ch*27 + phase];
        const p = mod29(c + sign*k);
        if (c === 0) next[phase] += counts[phase]; // literal F, no key advance
        if (p !== 0) next[(phase+1) % nstates] += counts[phase]; // keyed non-F
      }
      counts = next;
      if (counts.every(x => x === 0n)) {
        return {legal:false, first_dead_global_index:globalIndex, ...locate(globalIndex)};
      }
    }
  }
  return {legal:true, ending_phases:counts.map((n,i)=>n>0n?i:null).filter(x=>x!==null),
    total_path_count_digits:counts.reduce((a,b)=>a+b,0n).toString().length};
}

const raw = {ioc:ioc(ciphertext), quadgram:quadgramScore(ciphertext)};
const p57 = corpus.pages.find(p => p.page === 57);
const solvedControl = {ioc:ioc(p57.indices), quadgram:quadgramScore(p57.indices)};
const additive = [];
for (const mode of ["continuous243","nine27"]) {
  for (const sign of [-1,1]) {
    const decoded = decodeNoSkip(mode, sign);
    additive.push({mode,sign,ioc:ioc(decoded),quadgram:quadgramScore(decoded)});
  }
}
const fTransparent = [];
for (const mode of ["continuous243","nine27"]) {
  for (const sign of [-1,1]) fTransparent.push({mode,sign,...fTransparentReachability(mode,sign)});
}
const blockUniqueCounts = Array.from({length:9}, (_,i) =>
  new Set(tableBytes.slice(13+i*27,13+(i+1)*27).map(x=>x%27)).size);

console.log(JSON.stringify({
  hypothesis: "skip 13 leading p50 table cells, use remaining 243 as 9x27 additive GP29 key schedule over 9 visual chapters",
  source_dimensions: {table_cells:tableBytes.length, skipped:13, key_values:key.length,
    key_periods:9, period:27, chapters:chapterLengths, total_cipher_runes:ciphertext.length},
  block_unique_counts_mod27: blockUniqueCounts,
  controls: {raw, p57:solvedControl},
  additive_no_F_skip: additive,
  exact_F_transparent_reachability: fTransparent
}, null, 2));
