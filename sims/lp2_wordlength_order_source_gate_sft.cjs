"use strict";

/**
 * Original-source LP2 printed-word-order discriminator.
 * Run: node sims/lp2_wordlength_order_source_gate_sft.cjs
 * Read-only, reproducible, single-file test. No network or third-party modules.
 * @typedef {{spans:number[][],words:number[],runes:number,ends:number[]}} Parsed
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const source = read("resources/liber-primus/lp2-transcription.txt");
const alphabet = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const oldSource = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const beowulf = JSON.parse(read("resources/control/beowulf_oe_gp_profile_corrected.json"));
const latin = read("resources/control/latin-vulgate-gp-wholewords.txt");
const gibran = read("resources/control/gibran_prophet_58585.txt");
const gp = new Set(alphabet.runes);
const translits = alphabet.translit.slice().sort((a, b) => b.length - a.length);
const MAX = 15;

/** @param {string} input @returns {Parsed} */
function parseRunes(input) {
  /** @type {number[][]} */
  const spans = [];
  /** @type {number[]} */
  let span = [];
  /** @type {number[]} */
  const words = [];
  /** @type {number[]} */
  const ends = [];
  let count = 0;
  let offset = 0;
  function endWord() {
    if (count) {
      words.push(count);
      ends.push(offset);
      span.push(count);
      count = 0;
    }
  }
  function endSpan() {
    endWord();
    if (span.length) spans.push(span);
    span = [];
  }
  for (const ch of input) {
    if (gp.has(ch)) {
      offset++;
      count++;
    } else if (ch === "-") {
      endWord();
    } else if (".&$§".includes(ch) || /[0-9]/.test(ch)) {
      endSpan();
    }
  }
  endSpan();
  return { spans, words, runes: offset, ends };
}

/** @param {string} w @returns {number} */
function englishLength(w) {
  const s = w.replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  let i = 0;
  let n = 0;
  while (i < s.length) {
    const token = translits.find((x) => s.startsWith(x, i));
    i += token ? token.length : 1;
    n++;
  }
  return Math.min(MAX, n);
}

/** @param {string} sourceText @returns {number[][]} */
function englishSpans(sourceText) {
  const seq = [];
  let row = [];
  const parts = sourceText.toUpperCase().match(/[A-Z]+|[.,;:?!]/g) || [];
  for (const part of parts) {
    if (part.length === 1 && /[.,;:?!]/.test(part)) {
      if (row.length) seq.push(row);
      row = [];
    } else {
      row.push(englishLength(part));
    }
  }
  if (row.length) seq.push(row);
  return seq;
}

const segments = source.split("%");
const unknown = parseRunes(segments.slice(0, -2).join("%"));
const lp1 = oldSource.split("%");
const clearPages = [3, 8, 9, 10, 11, 14];
const cipherPages = [0, 1, 2, 4, 5, 6, 7, 12, 13];
const lp1clear = parseRunes(clearPages.map((i) => lp1[i]).join("&"));
const lp1cipher = parseRunes(cipherPages.map((i) => lp1[i]).join("&"));
assert.equal(unknown.runes, 12956);
assert.equal(unknown.words.length, 2896);
assert.equal(unknown.words.filter((n) => n === 1).length, 83);
assert.equal(lp1clear.runes, 1001);
assert.equal(lp1cipher.runes, 1796);
assert.equal(unknown.spans.length, 176);
// 176 parser spans include editorial numeric-table breaks; the independently
// adjudicated original-ink punctuation inventory has 175 genuine spans.

const gspans = englishSpans(gibran);
const split = Math.floor(gspans.length * 0.72);
const train = gspans.slice(0, split);
const held = gspans.slice(split);
const weights = Array.from({ length: 16 }, () => Array(16).fill(0));
const from = Array(16).fill(0);
const hist = Array(16).fill(1);
for (const seq of train) {
  for (const n of seq) hist[n]++;
  for (let i = 1; i < seq.length; i++) {
    weights[seq[i - 1]][seq[i]]++;
    from[seq[i - 1]]++;
  }
}
const htotal = hist.reduce((a, b) => a + b, 0);
const prob = hist.map((n) => n / htotal);
const logOdds = weights.map((row, x) => row.map((n, y) =>
  Math.log2((n + 35 * prob[y]) / (from[x] + 35) / prob[y])
));

/** @param {number[][]} s @returns {number} */
function syntaxScore(s) {
  let total = 0;
  let count = 0;
  for (const seq of s) {
    for (let i = 1; i < seq.length; i++) {
      total += logOdds[Math.min(MAX, seq[i - 1])][Math.min(MAX, seq[i])];
      count++;
    }
  }
  return total / count;
}

/** @param {number[][]} s @returns {number} */
function mutualInformation(s) {
  const counts = Array.from({ length: 16 }, () => Array(16).fill(0));
  const r = Array(16).fill(0);
  const c = Array(16).fill(0);
  let total = 0;
  for (const seq of s) {
    for (let i = 1; i < seq.length; i++) {
      const x = Math.min(MAX, seq[i - 1]);
      const y = Math.min(MAX, seq[i]);
      counts[x][y]++;
      r[x]++;
      c[y]++;
      total++;
    }
  }
  let ans = 0;
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      const count = counts[x][y];
      if (count) ans += (count / total) * Math.log2(count * total / (r[x] * c[y]));
    }
  }
  return ans;
}

let rngState = 0x33441;
/** Reproducible deterministic null PRNG (Mulberry32). @returns {number} */
function random() {
  let x = rngState = (rngState + 0x6D2B79F5) | 0;
  x = Math.imul(x ^ (x >>> 15), x | 1);
  x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
  return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
}
/** @param {number[]} a @returns {number[]} */
function shuffle(a) {
  const out = a.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
/** @param {number[][]} a @returns {number[][]} */
function shuffled(a) { return a.map(shuffle); }

/** @param {number} original @param {number[]} samples */
function nullStats(original, samples) {
  const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
  const sd = Math.sqrt(samples.reduce((a, b) => a + (b - avg) ** 2, 0) / samples.length);
  return {
    original, nullMean: avg, nullSd: sd, z: (original - avg) / sd,
    pUpper: (samples.filter((n) => n >= original).length + 1) / (samples.length + 1),
  };
}

/** @param {number[][]} s @param {number} draws */
function syntaxGate(s, draws = 1600) {
  const obs = syntaxScore(s);
  const sims = [];
  for (let i = 0; i < draws; i++) sims.push(syntaxScore(shuffled(s)));
  return { words: s.flat().length, pairs: s.reduce((n, a) => n + a.length - 1, 0), ...nullStats(obs, sims) };
}

/** @param {number[]} seq @param {number} size */
function blocks(seq, size = 20) {
  const out = [];
  for (let i = 0; i < seq.length; i += size) {
    out.push(seq.slice(i, i + size).map((n) => Math.min(MAX, n)));
  }
  return out;
}
/** @param {number[][]} s @param {number} draws */
function miGate(s, draws = 700) {
  const obs = mutualInformation(s);
  const sims = [];
  for (let i = 0; i < draws; i++) sims.push(mutualInformation(shuffled(s)));
  return { words: s.flat().length, ...nullStats(obs, sims) };
}

const latinLengths = latin.split(/\r?\n/).filter((s) => /^[0-9A-S]+$/.test(s)).map((s) => s.length);
const common = {
  LP2: unknown.words,
  LP1_clear: lp1clear.words,
  LP1_encrypted: lp1cipher.words,
  Beowulf: beowulf.allSourceGpWordLengths,
  Latin_Vulgate: latinLengths,
  Gibran: (gibran.toUpperCase().match(/[A-Z]+/g) || []).map(englishLength),
};

const chapterEnds = [0, 729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
const chapters = Array.from({ length: 9 }, () => []);
for (let i = 0; i < unknown.words.length; i++) {
  const chapter = chapterEnds.findIndex((n, j) => j > 0 && unknown.ends[i] <= n) - 1;
  assert(chapter >= 0);
  chapters[chapter].push(Math.min(MAX, unknown.words[i]));
}
assert.deepEqual(chapters.map((x) => x.length), [158,255,383,437,224,326,378,669,66]);

/** @param {number[][]} data @param {number} maxLag */
function lagScores(data, maxLag = 32) {
  const sums = Array(maxLag).fill(0);
  const counts = Array(maxLag).fill(0);
  for (const seq of data) {
    for (let j = 1; j <= maxLag; j++) {
      for (let i = 0; i + j < seq.length; i++) {
        sums[j - 1] += logOdds[seq[i]][seq[i + j]];
        counts[j - 1]++;
      }
    }
  }
  return sums.map((s, i) => s / counts[i]);
}

/** @param {number[][]} data @param {number} draws */
function lagGate(data, draws = 1200) {
  const observed = lagScores(data);
  const all = Array.from({length: 32}, () => []);
  for (let i = 0; i < draws; i++) {
    const sims = lagScores(shuffled(data));
    for (let j = 0; j < 32; j++) all[j].push(sims[j]);
  }
  const avg = all.map((s) => s.reduce((a, b) => a + b, 0) / draws);
  const sd = all.map((s, j) => Math.sqrt(s.reduce((a, b) => a + (b - avg[j]) ** 2, 0) / draws));
  const z = observed.map((s, j) => (s - avg[j]) / sd[j]);
  const best = Math.max(...z);
  const nullBest = Array.from({ length: draws }, (_, i) =>
    Math.max(...all.map((s, j) => (s[i] - avg[j]) / sd[j]))
  );
  return {
    bestLag: z.indexOf(best) + 1, bestZ: best, lag1Z: z[0],
    familywiseP: (nullBest.filter((s) => s >= best).length + 1) / (draws + 1),
    topLags: z.map((x, j) => ({ lag: j + 1, z: x }))
      .sort((a, b) => b.z - a.z).slice(0, 6),
  };
}

/** Word transpose on each punctuated span, 4 columns, row-major to column-major.
 * @param {number[]} src @returns {number[]}
 */
function fourColumn(src) {
  const out = [];
  const rows = Math.ceil(src.length / 4);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < rows; row++) {
      const index = 4 * row + col;
      if (index < src.length) out.push(src[index]);
    }
  }
  return out;
}
const chapterSpans = Array.from({ length: 9 }, () => []);
let runeEnd = 0;
for (const s of unknown.spans) {
  runeEnd += s.reduce((a, b) => a + b, 0);
  const c = chapterEnds.findIndex((n, j) => j > 0 && runeEnd <= n) - 1;
  assert(c >= 0);
  chapterSpans[c].push(s);
}

const result = {
  source: {
    unknownRunes: unknown.runes, unknownWords: unknown.words.length,
    originalParserSpans: unknown.spans.length,
    knownClearRunes: lp1clear.runes, knownEncryptedRunes: lp1cipher.runes,
    gibranTrainWords: train.flat().length, gibranTestWords: held.flat().length,
  },
  syntax: {
    LP2_unknown: syntaxGate(unknown.spans),
    LP1_original_clear: syntaxGate(lp1clear.spans),
    LP1_original_encrypted: syntaxGate(lp1cipher.spans),
    Gibran_heldout: syntaxGate(held),
  },
  nativeUntrainedMI: Object.fromEntries(
    Object.entries(common).map(([name, lengths]) => [name, miGate(blocks(lengths))])
  ),
  fixedLag32: {
    LP2_unknown: lagGate(chapters),
    LP1_original_encrypted: lagGate([lp1cipher.words.map((n) => Math.min(MAX,n))], 700),
  },
  sourceWidth4WordRoute: {
    LP2_raw: syntaxScore(unknown.spans),
    LP2_4col: syntaxScore(unknown.spans.map(fourColumn)),
    p0_2_raw: syntaxScore(chapterSpans[0]),
    p0_2_4col: syntaxScore(chapterSpans[0].map(fourColumn)),
    p40_53_raw: syntaxScore(chapterSpans[7]),
    p40_53_4col: syntaxScore(chapterSpans[7].map(fourColumn)),
    p54_55_raw: syntaxScore(chapterSpans[8]),
    p54_55_4col: syntaxScore(chapterSpans[8].map(fourColumn)),
  },
};

assert(result.syntax.LP2_unknown.z < 1);
assert(result.syntax.LP1_original_encrypted.z > 1.5);
assert(result.nativeUntrainedMI.LP2.z < 1);
assert(result.nativeUntrainedMI.Gibran.z > 10);
assert(result.fixedLag32.LP2_unknown.bestZ < 4);
console.log(JSON.stringify(result, null, 2));
