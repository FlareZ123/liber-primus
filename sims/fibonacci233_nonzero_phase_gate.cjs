"use strict";
/**
 * Fibonacci 233-step hidden-alphabet original-cipher gate.
 *
 * Every nonzero within-page GP29 predecessor step becomes one of 28 output
 * symbols. A repeated ciphertext glyph is a source-independent marker.
 * Tests unrestricted secret 28-way permutations per phase for 233 or 466
 * nonmarker steps, under continuous and physical-page reset clocks.
 *
 * For any bijective hidden phase row, identical observed output symbols in
 * that row MUST originate from identical plaintext GP symbols. Thus the
 * maximum number of occurrences of ANY one plaintext symbol is the sum of
 * the largest glyph histogram bin at every phase, and same-phase collision
 * counts are exactly preserved by every possible secret phase permutation.
 *
 * Source-native controls scan ALL contiguous 12,815-symbol non-EA GP windows
 * from Shakespeare, Gibran, and Emerson, not an arbitrary set of 300 samples.
 * Each synthetic source-native plant uses a hidden independent permutation
 * in every row, replays the 86 original marker slots, and checks every
 * nonmarker plaintext and all 12,956 ciphertext glyphs by exact inverse.
 *
 * Usage: node sims/fibonacci233_nonzero_phase_gate.cjs
 * Node 22, CommonJS, built-in modules only. No disk writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = filename => fs.readFileSync(path.join(ROOT, filename), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const PAGES = corpus.pages.filter(p => p.page < 56 && p.indices.length > 0)
  .map(p => p.indices);
const PERIODS = [233, 466];
const MODES = ["cyclic", "sorted"];
const RESETS = [false, true];
const CONTROLS = {
  Shakespeare: "resources/control/shakespeare_first300k.txt",
  Gibran: "resources/control/gibran_prophet_58585.txt",
  Emerson: "resources/control/emerson_essays_2944.txt"
};
const TOKENS = new Map(corpus.translit.map((value, index) => [value, index]));
const RAW_LENGTH = PAGES.reduce((n, page) => n + page.length, 0);
const INITIALS = PAGES.length;
const REPEATS = PAGES.reduce((n, p) => n +
  p.slice(1).filter((v, i) => v === p[i]).length, 0);
const DATA_LENGTH = RAW_LENGTH - INITIALS - REPEATS;

assert.equal(RAW_LENGTH, 12956);
assert.equal(INITIALS, 55);
assert.equal(REPEATS, 86);
assert.equal(DATA_LENGTH, 12815);
assert.equal(DATA_LENGTH, 55 * 233);

/**
 * @param {number} previous
 * @param {number} next
 * @param {"cyclic"|"sorted"} mode
 * @returns {number|null}
 */
function decodeRank(previous, next, mode) {
  if (next === previous) return null;
  return mode === "cyclic"
    ? (next - previous + 28) % 29
    : next - Number(next > previous);
}

/**
 * @param {number} previous
 * @param {number} rank
 * @param {"cyclic"|"sorted"} mode
 * @returns {number}
 */
function encodeRank(previous, rank, mode) {
  assert.ok(rank >= 0 && rank < 28);
  return mode === "cyclic"
    ? (previous + rank + 1) % 29
    : rank + Number(rank >= previous);
}

/** @param {"cyclic"|"sorted"} mode @returns {number[][]} */
function rankPages(mode) {
  return PAGES.map(page => {
    const ranks = [];
    for (let i = 1; i < page.length; i++) {
      const value = decodeRank(page[i - 1], page[i], mode);
      if (value !== null) ranks.push(value);
    }
    return ranks;
  });
}

/**
 * @param {number[][]} pages
 * @param {number} period
 * @param {boolean} pageReset
 * @returns {{cap:number,pairEqual:number,pairTotal:number,rate:number,valid:number}}
 */
function gate(pages, period, pageReset) {
  const counts = new Uint16Array(period * 28);
  let t = 0, valid = 0;
  for (const page of pages) {
    if (pageReset) t = 0;
    for (const x of page) {
      assert.ok(Number.isInteger(x) && x >= 0 && x < 28);
      counts[(t++ % period) * 28 + x]++;
      valid++;
    }
  }
  let cap = 0, pairEqual = 0, pairTotal = 0;
  for (let phase = 0; phase < period; phase++) {
    let n = 0, largest = 0;
    for (let i = 0; i < 28; i++) {
      const frequency = counts[phase * 28 + i];
      n += frequency;
      largest = Math.max(largest, frequency);
      pairEqual += frequency * (frequency - 1) / 2;
    }
    cap += largest;
    pairTotal += n * (n - 1) / 2;
  }
  assert.equal(valid, DATA_LENGTH);
  return {cap, pairEqual, pairTotal, rate:pairEqual/pairTotal, valid};
}

/** @param {string} content @returns {number[]} Ordinary English in native GP, excluding EA. */
function nativeGP(content) {
  const out = [];
  for (let word of content.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < word.length;) {
      const pair = TOKENS.get(word.slice(i, i+2));
      if (pair !== undefined) {
        if (pair !== 28) out.push(pair);
        i += 2;
      } else {
        const one = TOKENS.get(word[i]);
        if (one !== undefined && one !== 28) out.push(one);
        i++;
      }
    }
  }
  return out;
}

/**
 * True minimum of the maximum frequency of any one GP symbol over ALL
 * native-GP source windows of exactly DATA_LENGTH. Runs in O(N*28).
 * @param {number[]} source
 */
function minMaxLetter(source) {
  assert.ok(source.length >= DATA_LENGTH);
  const counts = new Int32Array(28);
  for (let i = 0; i < DATA_LENGTH; i++) counts[source[i]]++;
  let minimum = Infinity, at = -1, symbol = -1;
  for (let start = 0; start + DATA_LENGTH <= source.length; start++) {
    let top = 0;
    for (let k = 1; k < 28; k++)
      if (counts[k] > counts[top]) top = k;
    if (counts[top] < minimum) {
      minimum = counts[top]; at = start; symbol = top;
    }
    if (start + DATA_LENGTH < source.length) {
      counts[source[start]]--;
      counts[source[start + DATA_LENGTH]]++;
    }
  }
  return {sourceLength:source.length, windowCount:source.length-DATA_LENGTH+1,
    minimumLargestGlyphCount:minimum, minAt:at,
    glyph:corpus.translit[symbol]};
}

/**
 * Minimum same-phase equal pairs in EVERY contiguous native GP source window.
 * The fixed-length window slides in O(N); shifting the absolute phase labels
 * does not affect the sum of collisions among the phase groups.
 * @param {number[]} source
 * @param {number} period
 */
function minPhaseEqualPairs(source, period) {
  assert.ok(source.length >= DATA_LENGTH);
  const counts = new Uint16Array(period * 28);
  let same = 0;
  for (let i = 0; i < DATA_LENGTH; i++) {
    const bin = (i % period) * 28 + source[i];
    same += counts[bin]++;
  }
  let minimum = same, minAt = 0;
  for (let start = 1; start + DATA_LENGTH <= source.length; start++) {
    const leaving = start - 1;
    const oldBin = (leaving % period) * 28 + source[leaving];
    same -= --counts[oldBin];
    const entering = start + DATA_LENGTH - 1;
    const newBin = (entering % period) * 28 + source[entering];
    same += counts[newBin]++;
    if (same < minimum) {minimum = same; minAt = start;}
  }
  return {minimum, minAt};
}

/** @param {number} seed @returns {() => number} */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * Blind synthetic cipher generated with a distinct secret 28! key row for
 * every phase. Uses exactly the original manuscript's repeated-rune slots.
 * Reconstructs every 28-code native-GP plaintext symbol and exactly
 * re-encrypts the entire synthetic manuscript.
 * @param {number[]} plaintext
 * @param {"cyclic"|"sorted"} mode
 * @param {number} period
 * @param {boolean} pageReset
 */
function positive(plaintext, mode, period, pageReset) {
  assert.equal(plaintext.length, DATA_LENGTH);
  const random = xorshift32(0x5f223301 ^ period ^ (pageReset?0x9999:0) ^
    (mode==="cyclic"?0x3222:0));
  const rows = Array.from({length:period}, () => {
    const table = Array.from({length:28},(_,k)=>k);
    for (let i = table.length - 1; i > 0; i--) {
      const j = random() % (i + 1);
      [table[i],table[j]] = [table[j],table[i]];
    }
    return table;
  });
  const inverse = rows.map(table => {
    const inv = new Array(28);
    table.forEach((v,i) => {inv[v]=i;});
    return inv;
  });
  const cipher = [], recovered = [];
  let cursor = 0, t = 0, markerCount = 0;
  for (const original of PAGES) {
    if (pageReset) t = 0;
    const page = [original[0]];
    for (let i = 1; i < original.length; i++) {
      const previous = page[i-1];
      if (original[i] === original[i-1]) {
        page.push(previous);
        markerCount++;
      } else {
        const rank = rows[t++ % period][plaintext[cursor++]];
        page.push(encodeRank(previous,rank,mode));
      }
    }
    cipher.push(page);
  }
  assert.equal(markerCount,REPEATS);
  assert.equal(cursor,DATA_LENGTH);
  cursor=0;t=0;
  for (const page of cipher) {
    if (pageReset) t=0;
    for (let i=1;i<page.length;i++) {
      const observed = decodeRank(page[i-1],page[i],mode);
      if (observed===null) continue;
      const source = inverse[t++ % period][observed];
      recovered.push(source);
      assert.equal(source,plaintext[cursor++]);
    }
  }
  assert.deepEqual(recovered,plaintext);
  const reencryption = [];
  cursor=0;t=0;
  for (const page of cipher) {
    if (pageReset) t=0;
    const reconstructed=[page[0]];
    for (let i=1;i<page.length;i++) {
      if (page[i]===page[i-1]) reconstructed.push(reconstructed[i-1]);
      else reconstructed.push(encodeRank(reconstructed[i-1],
        rows[t++ % period][recovered[cursor++]],mode));
    }
    reencryption.push(reconstructed);
  }
  assert.deepEqual(reencryption,cipher);
  const statistic=gate(cipher.map(page=>{
    const ranks=[];
    for(let i=1;i<page.length;i++){
      const x=decodeRank(page[i-1],page[i],mode);
      if(x!==null)ranks.push(x);
    }
    return ranks;
  }),period,pageReset);
  let greatest=0;
  const frequency=new Int32Array(28);
  for(const p of plaintext)frequency[p]++;
  for(const n of frequency)greatest=Math.max(greatest,n);
  assert.ok(statistic.cap>=greatest,
    "A true synthetic hidden-key plant must satisfy the capacity bound");
  assert.ok(statistic.rate>0.05,
    "Native-GP plant must preserve same-phase language collisions");
  return {exactRecoveredSymbols:recovered.length,
    exactReencryptedRunes:cipher.reduce((n,p)=>n+p.length,0),
    originalRepeatSlotsPreserved:markerCount,
    secretKeyRows:rows.length, plantLargestGlyph:greatest,
    equalityRate:statistic.rate};
}

function run() {
  const ranks = Object.fromEntries(MODES.map(mode=>[mode,rankPages(mode)]));
  const sources=Object.fromEntries(Object.entries(CONTROLS).map(([name,file])=>
    [name,nativeGP(read(file))]));
  const minima=Object.fromEntries(Object.entries(sources).map(([name,values])=>
    [name,{...minMaxLetter(values),
      phase466:minPhaseEqualPairs(values,466)}]));
  const plantSource=sources.Shakespeare.slice(40000,40000+DATA_LENGTH);
  assert.equal(plantSource.length,DATA_LENGTH);
  const variants=[];
  for(const mode of MODES)for(const period of PERIODS)
    for(const pageReset of RESETS) {
      const actual=gate(ranks[mode],period,pageReset);
      const sourceLanguageRejected=period===466&&!pageReset
        ? Object.values(minima).every(s=>
          actual.pairEqual<s.phase466.minimum)
        : Object.values(minima).every(s=>
          actual.cap<s.minimumLargestGlyphCount);
      assert.ok(sourceLanguageRejected,
        "Declared source-language family must fail its exact gate");
      const plant=positive(plantSource,mode,period,pageReset);
      variants.push({mode,period,clock:pageReset?"nonmarker-page-reset":
        "nonmarker-book-continuous",...actual,
      sourceLanguageRejected,plant});
    }
  return {model:"Static 28-way hidden permutation at each Fibonacci 233/466 nonzero-step phase",
    input:"resources/liber-primus/lp2-corpus.json",
    transcriptPages:PAGES.length,originalRunes:RAW_LENGTH,
    independentPageInitials:INITIALS,markerDoublets:REPEATS,
    nonzeroSteps:DATA_LENGTH,exactFibonacciProduct:"55*233",
    sources:minima,variants,
    interpretation:"All eight exact static-phase secret-permutation models conflict with every source-native GP control window under the declared EA/nonzero-step register. The authentic source provides no recovered plaintext, key, or evidence that the candidate period is real."};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={decodeRank,encodeRank,rankPages,gate,nativeGP,
  minMaxLetter,minPhaseEqualPairs,positive,run};
