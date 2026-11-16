"use strict";

/**
 * 2013 Liber AL vel Legis as an LP2 running key under a collision-rejection
 * transport. This tests one source-motivated family, with both ordinary GP
 * spellings and both additive signs, rather than sweeping arbitrary key texts.
 *
 * From the repo root on Windows 11: node sims/lp2_liber_al_antirepeat_runningkey_sft.cjs
 *
 * Source originals: resources/external/2013-book-of-law-[I,II,III].txt.
 * Ciphertext: resources/liber-primus/lp2-corpus.json AND lp2-transcription.txt.
 * Language model and independent planted control: Gibran Prophet control file.
 *
 * A skip may occur only when the candidate ciphertext equals its predecessor.
 * The same plaintext is retried with the NEXT book symbol. At each such event
 * the failed symbol is skipped with conditional probability q=0.81. This is a
 * hypothetical transport mechanism, not an authenticated Cicada instruction.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const input = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(input("resources/liber-primus/lp2-corpus.json"));
const original = input("resources/liber-primus/lp2-transcription.txt");
const english = input("resources/control/gibran_prophet_58585.txt");
const books = ["I", "II", "III"].map((n) => input("resources/external/2013-book-of-law-" + n + ".txt"));
const alphabet = new Map(corpus.translit.map((s, i) => [s, i]));
alphabet.set("IO", 27);
alphabet.set("ING", 21);
const symbols = new Map(corpus.runes.map((s, i) => [s, i]));
const Q = 29;
const STOP = 29;
const LN_Q = Math.log(0.81);
const LN_KEEP = Math.log(0.19);
const MODELS = [
  {name: "legacy", digraphs: ["TH", "NG", "EO", "OE", "AE", "IA", "EA"]},
  {name: "authored", digraphs: ["ING", "TH", "NG", "EO", "OE", "AE", "IO", "EA"]},
];

/**
 * Tokenize an English text into independent GP29 words.
 * @param {string} text
 * @param {string[]} digraphs
 * @returns {number[][]}
 */
function tokens(text, digraphs) {
  return (text.toUpperCase().match(/[A-Z]+/g) || []).map((raw) => {
    const s = raw.replaceAll("K", "C").replaceAll("V", "U")
      .replaceAll("Q", "CW").replaceAll("Z", "S");
    const a = [];
    for (let i = 0; i < s.length;) {
      const found = digraphs.find((x) => s.startsWith(x, i)) || s[i];
      const glyph = alphabet.get(found);
      assert.notEqual(glyph, undefined, "Unmapped token " + found + " from source " + raw);
      a.push(glyph);
      i += found.length;
    }
    return a;
  }).filter((w) => w.length);
}

/**
 * Preserve rune positions and printed breaks; a slash or page break is a wrap.
 * @param {string} text
 * @param {number} n
 * @returns {{c:number[], starts:boolean[]}}
 */
function parseOriginal(text, n) {
  const c = [], starts = [];
  let nextStart = true;
  for (const ch of text) {
    if (symbols.has(ch)) {
      c.push(symbols.get(ch));
      starts.push(nextStart);
      nextStart = false;
      if (c.length === n) break;
    } else if (ch === "-" || ch === ".") {
      nextStart = true;
    }
  }
  assert.equal(c.length, n);
  return {c, starts};
}

/**
 * Smoothed native-English GP trigram log likelihood against iid GP29.
 * Model training and planted evaluation spans have disjoint source offsets.
 * @param {number[][]} training
 * @returns {Float64Array}
 */
function language(training) {
  const a = new Float64Array(29);
  const b = new Float64Array(30 * 29);
  const c = new Float64Array(30 * 30 * 29);
  const nb = new Float64Array(30);
  const nc = new Float64Array(900);
  for (const word of training) {
    let u = STOP, v = STOP;
    for (const w of word) {
      a[w]++; b[v * 29 + w]++; nb[v]++;
      c[(u * 30 + v) * 29 + w]++; nc[u * 30 + v]++;
      u = v; v = w;
    }
  }
  const total = a.reduce((s, v) => s + v, 0);
  const out = new Float64Array(30 * 30 * 29);
  for (let u = 0; u < 30; u++) for (let v = 0; v < 30; v++) {
    for (let w = 0; w < 29; w++) {
      const prior = (a[w] + 0.2) / (total + 5.8);
      const bigram = (b[v * 29 + w] + 8 * prior) / (nb[v] + 8);
      const trigram = (c[(u * 30 + v) * 29 + w] + 4 * bigram) / (nc[u * 30 + v] + 4);
      out[(u * 30 + v) * 29 + w] = Math.log(29 * trigram);
    }
  }
  return out;
}

/**
 * Fixed-alphabet, exact collision-gated skip inverse with a bounded beam.
 * Key is doubled, so every original book offset admits one complete wrap.
 *
 * @param {number[]} cipher
 * @param {boolean[]} starts
 * @param {number[]} key
 * @param {number} offset
 * @param {number} len
 * @param {Float64Array} lm
 * @param {number} sign
 * @param {number} width
 * @param {boolean} trace
 * @returns {{score:number,skip:number,plain:number[]}}
 */
function inverse(cipher, starts, key, offset, len, lm, sign, width, trace = false) {
  let beam = [{j:offset, u:STOP, v:STOP, score:0, skip:0, plain:[]}];
  for (let i = 0; i < len; i++) {
    const now = cipher[i], prev = i ? cipher[i - 1] : -1;
    const candidates = [], seen = new Set();
    for (const state of beam) {
      for (let skip = 0; skip <= 2; skip++) {
        const j = state.j + skip;
        if (j >= key.length) continue;
        let plain;
        if (skip === 0) plain = (now - sign * key[j] + 58) % Q;
        else {
          if (prev < 0 || now === prev) continue;
          plain = (prev - sign * key[state.j] + 58) % Q;
          if (skip === 2 && key[state.j + 1] !== key[state.j]) continue;
          if ((plain + sign * key[j] + Q) % Q !== now) continue;
        }
        const u = starts[i] ? STOP : state.u;
        const v = starts[i] ? STOP : state.v;
        const score = state.score + lm[(u * 30 + v) * 29 + plain]
          + skip * LN_Q + (now === prev ? LN_KEEP : 0);
        const id = String(j + 1) + "," + String(v) + "," + String(plain);
        if (seen.has(id)) continue;
        seen.add(id);
        candidates.push({
          j:j + 1, u:v, v:plain, score, skip:state.skip + skip,
          plain:trace ? state.plain.concat(plain) : [],
        });
      }
    }
    candidates.sort((x, y) => y.score - x.score);
    beam = candidates.slice(0, width);
    if (beam.length === 0) return {score:-Infinity, skip:0, plain:[]};
  }
  return beam[0];
}

/**
 * Fixed-q reference emitter, including deterministic collision decisions.
 * @param {number[]} plain
 * @param {number[]} key
 * @param {number} o
 * @param {number} sign
 * @returns {{cipher:number[],skips:number}}
 */
function emit(plain, key, o, sign) {
  const cipher = [];
  let j = o, prev = -1, skips = 0, rng = 3301;
  for (const p of plain) {
    let x = (p + sign * key[j] + Q) % Q;
    while (x === prev) {
      rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
      if (rng / 4294967296 >= 0.81) break;
      j++; skips++;
      x = (p + sign * key[j] + Q) % Q;
    }
    cipher.push(x);
    prev = x; j++;
  }
  return {cipher, skips};
}

/**
 * Convert consecutive native-English words to a rune stream and its breaks.
 * @param {number[][]} words
 * @param {number} n
 */
function flatten(words, n) {
  const plain = [], starts = [];
  for (const word of words) {
    for (let i = 0; i < word.length; i++) {
      if (plain.length === n) return {plain, starts};
      plain.push(word[i]);
      starts.push(i === 0);
    }
  }
  assert.equal(plain.length, n, "Insufficient heldout plaintext");
  return {plain, starts};
}

/**
 * Stable score leaderboard. First stage exhausts every original book offset.
 * Second and third stages only rerank candidates surviving an independent
 * very short prefix gate; no plaintext/offset is tuned after later decoding.
 * @param {number[]} c
 * @param {boolean[]} starts
 * @param {number[]} key
 * @param {Float64Array} lm
 * @param {number} sign
 */
function screen(c, starts, key, lm, sign) {
  const n = key.length / 2;
  const short = [];
  for (let o = 0; o < n; o++) {
    const score = inverse(c, starts, key, o, 90, lm, sign, 24).score;
    short.push([score, o]);
  }
  short.sort((a, b) => b[0] - a[0]);
  const middle = short.slice(0, 400).map((item) => {
    const z = inverse(c, starts, key, item[1], 262, lm, sign, 32);
    return [z.score, item[1], z.skip];
  }).sort((a, b) => b[0] - a[0]);
  const long = middle.slice(0, 40).map((item) => {
    const z = inverse(c, starts, key, item[1], 729, lm, sign, 48, true);
    return {score:z.score, offset:item[1], skips:z.skip,
      head:z.plain.slice(0, 150).map((p) => corpus.translit[p]).join("")};
  }).sort((a, b) => b.score - a.score);
  return {totalOffsets:n, best90:short[0], median90:short[n >>> 1],
    best262:middle[0], best729:long.slice(0, 3)};
}

function main() {
  const first = parseOriginal(original, 729);
  const expected = corpus.pages.slice(0, 3).flatMap((p) => p.indices);
  assert.deepEqual(first.c, expected, "Original p0-p2 GP29 mismatch");
  const solved = parseOriginal(original.split("%").at(-1), 95);
  assert.deepEqual(solved.c, corpus.pages[57].indices, "Solved p57 mismatch");

  const report = {source:"Original 2013 Cicada Book of the Law, chapters I/II/III",
    target:"Original LP2 physical pages 0-2, 729 runes, exact source words",
    q:0.81, alphabet:29, stages:[90,262,729], findings:[]};

  for (const mode of MODELS) {
    const all = tokens(english, mode.digraphs);
    const train = all.slice(1000, Math.floor(all.length * 0.75));
    const heldout = all.slice(Math.floor(all.length * 0.75), Math.floor(all.length * 0.82));
    const key0 = tokens(books.join("\n"), mode.digraphs).flat();
    const key = key0.concat(key0);
    const lm = language(train);
    const plant = flatten(heldout, 729);
    for (const sign of [1, -1]) {
      const p = emit(plant.plain, key, 500, sign);
      const recovered = inverse(p.cipher, plant.starts, key, 500, 729, lm, sign, 48, true);
      assert.equal(recovered.plain.length, 729);
      assert.deepEqual(recovered.plain, plant.plain, "Native-English full-length plant not recovered");
      assert.equal(recovered.skip, p.skips, "Native-English control skip clock failed");
      const realPlant = emit(solved.c, key, 800, sign);
      const realRecovered = inverse(realPlant.cipher, solved.starts, key, 800, 90, lm, sign, 32, true);
      assert.deepEqual(realRecovered.plain, solved.c.slice(0, 90),
        "Genuine solved-Cicada GP prose positive control failed");
      const t0 = Date.now();
      const originalScores = screen(first.c, first.starts, key, lm, sign);
      const cell = {mode:mode.name, sign, keyLength:key0.length,
        control729Score:recovered.score, control729Skips:p.skips,
        originalP57Control90Score:realRecovered.score,
        ...originalScores, elapsedMs:Date.now() - t0};
      assert(cell.best90[0] < realRecovered.score, "Unknown original prefix outranks known-Cicada plant");
      report.findings.push(cell);
      process.stdout.write(JSON.stringify(cell) + "\n");
    }
  }
  process.stdout.write("COMPLETE: " + report.findings.length
    + " sourced candidate cells, all p0-p2 originals unchanged; no plaintext accepted.\n");
}

if (require.main === module) main();

module.exports = {corpus, input, tokens, language, parseOriginal, inverse, emit, flatten, MODELS};
