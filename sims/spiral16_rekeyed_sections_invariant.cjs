"use strict";
/**
 * Original-source necessary-condition test for 16-phase predecessor-context
 * substitution, rekeyed on all eight genuine LP2 text sections or every
 * physical page. Supports six exact PUBLIC position/skip clock definitions.
 * Under every independent 29! S-box per (epoch,phase,previous published rune),
 * a ciphertext equality within the same state is EXACTLY invariant.
 *
 * This is a key-independent source-language rejection gate, not an LP2
 * plaintext or historical-key recovery.
 * Node22 CommonJS; no writes. Run:
 *   node sims/spiral16_rekeyed_sections_invariant.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const {gpWords} = require("./spiral16_public_row_invariant.cjs");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const originalSource = read("resources/liber-primus/lp2-corpus.json");
const corpus = JSON.parse(originalSource);
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length)
  .map(p => p.indices);
const total = 12956, M = 29, EA = 28, PHASES = 16;
const SECTION_LENGTHS = [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316];
const SECTION_STARTS = [0];
for (const len of SECTION_LENGTHS) SECTION_STARTS.push(SECTION_STARTS.at(-1) + len);
assert.equal(SECTION_STARTS.at(-1), total);
assert.equal(pages.length, 55);
assert.equal(pages.flat().length, total);
const ORIG_LENGTHS = parseSharedCorpus().words.map(x => x.length);
assert.equal(ORIG_LENGTHS.length, 2896);
assert.equal(ORIG_LENGTHS.reduce((a, b) => a + b, 0), total);
const SECTION_ID = new Uint8Array(total);
for (let j = 0; j < SECTION_LENGTHS.length; j++)
  SECTION_ID.fill(j, SECTION_STARTS[j], SECTION_STARTS[j+1]);
const CLOCKS = ["page", "book", "section", "skip-page", "skip-book", "skip-section"];
const EPOCHS = ["sections", "page"];
const TRIALS = 80, NULLS = 100;
const sourceNative = read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split(/\r?\n/u).filter(line => {
    const s = line.trim();
    return !s.startsWith("#") && !s.startsWith("[")
      && !/^[0-9a-f]{25,}$/iu.test(s);
  }).join(" ");
const SOURCES = [
  ["solved-Cicada", gpWords(sourceNative)],
  ["Shakespeare", gpWords(read("resources/control/shakespeare_first300k.txt"))]
];
const mod16 = value => value & 15;

/** @param {number} seed @returns {() => number} */
function random32(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}

/** @param {number[][]} words */
function buckets(words) {
  const byLength = new Map();
  for (const w of words) {
    if (!byLength.has(w.length)) byLength.set(w.length, []);
    byLength.get(w.length).push(w);
  }
  for (const l of ORIG_LENGTHS) assert(byLength.has(l));
  return byLength;
}

/** @param {Map<number,number[][]>} byLength @param {number} seed */
function nativePlant(byLength, seed) {
  const next = random32(seed);
  const flat = ORIG_LENGTHS.flatMap(len => {
    const b = byLength.get(len);
    return b[next() % b.length];
  });
  assert.equal(flat.length, total);
  let pos = 0;
  return pages.map(page => {
    const slice = flat.slice(pos, pos + page.length);
    pos += page.length;
    return slice;
  });
}

/** @param {number} absolute @param {number} page @param {"sections"|"page"} epochMode */
function epoch(absolute, page, epochMode) {
  return epochMode === "page" ? page : SECTION_ID[absolute];
}

/** @param {string} clock @param {number} local @param {number} absolute @param {number} section @param {{page:number,book:number,section:number}} steps */
function clockPhase(clock, local, absolute, section, steps) {
  switch(clock) {
    case "page": return mod16(local);
    case "book": return mod16(absolute);
    case "section": return mod16(absolute - SECTION_STARTS[section]);
    case "skip-page": return mod16(steps.page);
    case "skip-book": return mod16(steps.book);
    case "skip-section": return mod16(steps.section);
  }
  throw Error("Unknown clock " + clock);
}

/**
 * Scan (epoch,public phase,preceding visible ciphertext) equality invariant.
 * @param {number[][]} ciphertext
 * @param {"sections"|"page"} epochMode
 * @param {string} clock
 */
function collision(ciphertext, epochMode, clock) {
  const rows = new Map();
  let matching = 0, eligible = 0, absolute = 0, repeats = 0;
  const steps = {page: 0, book: 0, section: 0};
  let formerSection = -1;
  for (const [pg, page] of ciphertext.entries()) {
    steps.page = 0;
    for (let i = 0; i < page.length; i++) {
      const position = absolute + i;
      const section = SECTION_ID[position];
      if (section !== formerSection) {
        steps.section = 0;
        formerSection = section;
      }
      if (i === 0) continue; // transmitted page seeds
      const previous = page[i - 1], current = page[i];
      const ph = clockPhase(clock, i, position, section, steps);
      const key = ((epoch(position, pg, epochMode) * PHASES + ph) * M + previous);
      let counts = rows.get(key);
      if (!counts) {
        counts = new Uint16Array(M+1);
        rows.set(key, counts);
      }
      matching += counts[current];
      eligible += counts[M];
      counts[current]++;
      counts[M]++;
      if (previous === current) repeats++;
      else { steps.page++; steps.book++; steps.section++; }
    }
    absolute += page.length;
  }
  assert.equal(absolute, total);
  return {matching, eligible, rate: matching / eligible,
    occupiedRows: rows.size, repeats, transitions: total - pages.length};
}

/** Secret 29-way permutation for each used public row, generated lazily. */
function makeTables(seed) {
  const next = random32(seed);
  const map = new Map();
  const tableFor = (key, previous) => {
    let row = map.get(key);
    if (row) return row;
    const shuffled = Array.from({length: M}, (_, i) => i).filter(i => i !== previous);
    for (let i = 27; i > 0; i--) {
      const j = next() % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const enc = new Uint8Array(M), dec = new Uint8Array(M);
    for (let p = 0; p < 28; p++) enc[p] = shuffled[p];
    enc[EA] = previous;
    for (let p = 0; p < M; p++) dec[enc[p]] = p;
    row = {enc, dec};
    map.set(key, row);
    return row;
  };
  return {tableFor, map};
}

/**
 * Same source-tracked state on encode and inverse. Every row is a bijection;
 * given its secret table, all 12,956 planted source runes are recoverable.
 * @param {number[][]} input @param {ReturnType<typeof makeTables>} tables
 * @param {"sections"|"page"} epochMode @param {string} clock
 * @param {"enc"|"dec"} direction
 */
function transform(input, tables, epochMode, clock, direction) {
  const out = [];
  let absolute = 0, formerSection = -1;
  const steps = {page: 0, book: 0, section: 0};
  for (const [pg, page] of input.entries()) {
    steps.page = 0;
    const result = [];
    for (let i = 0; i < page.length; i++) {
      const position = absolute + i, section = SECTION_ID[position];
      if (section !== formerSection) {
        steps.section = 0;
        formerSection = section;
      }
      if (i === 0) { result.push(page[0]); continue; }
      const previous = direction === "enc" ? result[i-1] : page[i-1];
      const ph = clockPhase(clock, i, position, section, steps);
      const key = ((epoch(position, pg, epochMode) * PHASES + ph) * M + previous);
      const row = tables.tableFor(key, previous);
      const value = row[direction][page[i]];
      result.push(value);
      const published = direction === "enc" ? value : page[i];
      if (published !== previous) {
        steps.page++; steps.book++; steps.section++;
      }
    }
    absolute += page.length;
    out.push(result);
  }
  assert.equal(absolute, total);
  return out;
}

/** Null retains all original page lengths and exactly the repeated positions. */
function repeatedPositionNull(seed) {
  const next = random32(seed);
  return pages.map(page => {
    const out = [page[0]];
    for (let i = 1; i < page.length; i++) {
      const prev = out[i-1];
      if (page[i] === page[i-1]) out.push(prev);
      else { const rank = next() % 28; out.push(rank < prev ? rank : rank+1); }
    }
    return out;
  });
}
function summary(a, original) {
  const sorted = a.slice().sort((x,y) => x-y);
  return {n:a.length, mean: a.reduce((s,x)=>s+x,0)/a.length,
    minimum: sorted[0], maximum: sorted.at(-1),
    noGreaterThanOriginal: a.filter(x=>x<=original).length,
    lowerTailAddOne: (a.filter(x=>x<=original).length+1)/(a.length+1),
    noLessThanOriginal: a.filter(x=>x>=original).length};
}
function run() {
  const results=[];
  for (const [e,epochMode] of EPOCHS.entries()) for (const [c,clock] of CLOCKS.entries()) {
    const observed = collision(pages, epochMode, clock);
    assert.equal(observed.repeats, 86);
    const nulls = [];
    for (let j = 0; j < NULLS; j++)
      nulls.push(collision(repeatedPositionNull(0x2516f000 + j*311), epochMode, clock).rate);
    const controls = {};
    for (const [s,[name,words]] of SOURCES.entries()) {
      const b = buckets(words), values = [], counts = [], numRows = [];
      for (let trial = 0; trial < TRIALS; trial++) {
        const plain = nativePlant(b, (0x25163001 + 1511*trial + 9971*s)>>>0);
        const tables = makeTables((0x25164001 + 1217*trial + 19*s + 7*c + 97*e)>>>0);
        const encrypted = transform(plain, tables, epochMode, clock, "enc");
        assert.deepEqual(transform(encrypted, tables, epochMode, clock, "dec"), plain);
        // Every valid key rounds any input. The authentic original is tested
        // by invariant equality, not treated as a key-discriminating roundtrip.
        const stat = collision(encrypted, epochMode, clock);
        values.push(stat.rate);
        counts.push(stat.repeats);
        numRows.push(tables.map.size);
      }
      controls[name] = {sourceWords:words.length,
        collision:summary(values, observed.rate),
        meanVisibleRepeats:counts.reduce((a,b)=>a+b,0)/TRIALS,
        meanOccupiedSecretRows:numRows.reduce((a,b)=>a+b,0)/TRIALS};
    }
    results.push({epochMode,clock,observed,
      conditionalAntiRepeatNull:summary(nulls,observed.rate), controls});
  }
  return {
    sourceSHA256: crypto.createHash("sha256").update(originalSource).digest("hex"),
    ices:"The visible outputs define public phase and previous-cipher state; all secret substitution rows are free 29-way bijections, independently rekeyed at each declared epoch.",
    exactOriginalScope:{pages:55,positions:total,transitions:total-55,
      wordLengths:ORIG_LENGTHS.length,sectionLengths:SECTION_LENGTHS},
    candidateFamilies:{epochPolicies:EPOCHS,clocks:CLOCKS,
      completeModels:EPOCHS.length*CLOCKS.length,positiveTrialsPerRegister:TRIALS,
      plaintextSources:SOURCES.map(x=>({name:x[0],words:x[1].length}))},
    results,
    interpretation:"Original conditional collision structure constrains each public row independent of all secret 29! keys. Rejection is conditional on author-native GP source, not evidence of a particular original key. A hidden evolving state or unobserved key skips remain possible."
  };
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {collision, transform, makeTables, run};
