"use strict";
/**
 * Source-constrained 13^i mod 256 lookup test for the LP2 256-event channel.
 * Run with Node.js 22 from the repository root:
 *   node sims/red13_power_grid_lookup_gate.cjs
 *
 * This is a finite candidate test, not a decryption claim.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const gridSource = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const shakespeare = read("resources/control/shakespeare_first300k.txt");
const mod = (x, n) => (x % n + n) % n;

function powMod(a, n, m) {
  let x = 1;
  while (n > 0) {
    if (n % 2) x = x * a % m;
    a = a * a % m;
    n = Math.floor(n / 2);
  }
  return x;
}

function sourceEvents() {
  const out = [];
  for (const record of ink.pages) {
    const page = corpus.pages.find(p => p.page === record.page);
    assert.ok(page, "ink page exists in canonical corpus");
    for (const span of record.red_spans || []) {
      const glyphs = [...span.runes];
      assert.equal(glyphs.length, span.length);
      for (let i = 0; i < span.length; i++) {
        const value = page.indices[span.start + i];
        assert.equal(corpus.runes[value], glyphs[i]);
        out.push({page: record.page, offset: span.start + i,
          kind: 1, value});
      }
    }
    for (const mark of record.large_punctuation || []) {
      if (mark[1] === 13)
        out.push({page: record.page, offset: mark[0], kind: 0});
    }
  }
  out.sort((a, b) => a.page - b.page || a.offset - b.offset ||
    a.kind - b.kind);
  assert.equal(out.length, 256);
  assert.equal(out.filter(e => e.kind === 1).length, 225);
  assert.equal(out.filter(e => e.kind === 0).length, 31);
  return out;
}

function gridVariants() {
  const base60 = gridSource.byte_rows.flat();
  assert.equal(base60.length, 256);
  const alpha59 = gridSource.alphabet.replace("f", "");
  const tokens = gridSource.rows.flat();
  assert.equal(tokens.length, 256);
  assert(tokens.every(token => !token.includes("f")),
    "base-59 reading assumes the absent lower-case f");
  const base59 = tokens.map(token =>
    alpha59.indexOf(token[0]) * 59 + alpha59.indexOf(token[1]));
  assert(base59.every(x => x >= 0 && x <= 255));
  return {base60, base59};
}

function originalStream() {
  const segments = transcription.split("%");
  const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
  const xs = [], pages = [], starts = [], ends = [];
  for (const page of corpus.pages) {
    if (page.page >= 56 || page.page === 50) continue;
    const raw = segments[page.page >= 51 ? page.page - 1 : page.page] || "";
    const pageXs = [], pageStarts = [], pageEnds = [];
    let active = false;
    for (const ch of raw) {
      if (runeMap.has(ch)) {
        pageXs.push(runeMap.get(ch));
        pageStarts.push(!active);
        pageEnds.push(false);
        active = true;
      } else if ("-.$&§".includes(ch)) {
        if (pageEnds.length) pageEnds[pageEnds.length - 1] = true;
        active = false;
      }
    }
    assert.deepEqual(pageXs, page.indices,
      "word parser agrees with canonical rune sequence on page " + page.page);
    for (let i = 0; i < pageXs.length; i++) {
      xs.push(pageXs[i]);
      pages.push(page.page);
      starts.push(pageStarts[i]);
      ends.push(pageEnds[i]);
    }
  }
  assert.equal(xs.length, 12956);
  return {xs, pages, starts, ends};
}

function encodeWord(word) {
  const s = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < s.length;) {
    const digraph = s.slice(i, i + 2);
    const d = corpus.translit.indexOf(digraph);
    if (d >= 0) {
      out.push(d);
      i += 2;
    } else {
      const single = corpus.translit.indexOf(s[i]);
      assert.notEqual(single, -1, "English character maps to GP");
      out.push(single);
      i++;
    }
  }
  return out;
}

function words(text) {
  return (text.match(/[A-Za-z]+/g) || []).map(encodeWord);
}

function flattenWords(wordList, limit = Infinity) {
  const xs = [], starts = [], ends = [];
  for (const word of wordList) {
    for (let i = 0; i < word.length && xs.length < limit; i++) {
      xs.push(word[i]);
      starts.push(i === 0);
      ends.push(i === word.length - 1);
    }
    if (xs.length >= limit) break;
  }
  return {xs, starts, ends};
}

function trainBigram(wordList) {
  const N = 31, START = 29, END = 30;
  const counts = new Float64Array(N * N);
  const unigrams = new Float64Array(N);
  const totals = new Float64Array(N);
  for (const word of wordList) {
    let previous = START;
    for (const current of [...word, END]) {
      counts[previous * N + current]++;
      unigrams[current]++;
      totals[previous]++;
      previous = current;
    }
  }
  const total = unigrams.reduce((a, b) => a + b, 0);
  const prior = Float64Array.from(unigrams,
    x => (x + 1) / (total + N));
  const logp = new Float64Array(N * N);
  for (let a = 0; a < N; a++) for (let b = 0; b < N; b++)
    logp[a * N + b] = Math.log(
      (counts[a * N + b] + 5 * prior[b]) / (totals[a] + 5));
  return logp;
}

function languageScore(stream, logp) {
  const N = 31, START = 29, END = 30;
  let previous = START, score = 0;
  for (let i = 0; i < stream.xs.length; i++) {
    if (stream.starts[i]) previous = START;
    const current = stream.xs[i];
    score += logp[previous * N + current];
    if (stream.ends[i]) score += logp[current * N + END];
    previous = current;
  }
  return score / stream.xs.length;
}

function ioc(xs) {
  const counts = new Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (xs.length * (xs.length - 1));
}

function reduceByte(byte, reducer) {
  return reducer === "mod29" ? byte % 29 : Math.floor(byte * 29 / 256);
}

function transform(input, key, pages, mode, encode) {
  const out = new Array(input.length);
  let clock = 0, previousPage = -1;
  for (let i = 0; i < input.length; i++) {
    if (mode.reset === "page" && pages[i] !== previousPage) clock = 0;
    const k = reduceByte(key[clock++ % key.length], mode.reducer);
    out[i] = mod(input[i] + (encode ? -1 : 1) * mode.sign * k, 29);
    previousPage = pages[i];
  }
  return out;
}

function run() {
  const events = sourceEvents();
  const grids = gridVariants();
  const original = originalStream();
  const trainingWords = words(shakespeare.slice(0, 240000));
  const heldoutWords = words(shakespeare.slice(240000));
  const logp = trainBigram(trainingWords);
  const english = flattenWords(heldoutWords, original.xs.length);
  assert.equal(english.xs.length, original.xs.length);

  const fixedPoints = corpus.prime.map((prime, index) => ({
    index, prime, power: powMod(13, index, 256)
  })).filter(x => x.prime === x.power);
  assert.deepEqual(fixedPoints, [{index: 24, prime: 97, power: 97}]);

  const candidates = [];
  let originalReplaySymbols = 0, syntheticRecoverySymbols = 0;
  const keyStats = {};
  for (const [gridName, grid] of Object.entries(grids)) {
    for (const markerExponent of [0, 13]) {
      const key = events.map(event =>
        grid[powMod(13, event.kind ? event.value : markerExponent, 256)]);
      keyStats[gridName + "/marker-" + markerExponent] = {
        distinctBytes: new Set(key).size,
        minByte: Math.min(...key), maxByte: Math.max(...key)
      };
      for (const reducer of ["mod29", "scaled29"])
        for (const sign of [-1, 1])
          for (const reset of ["book", "page"]) {
            const mode = {reducer, sign, reset};
            const decoded = transform(original.xs, key, original.pages, mode, false);
            const replay = transform(decoded, key, original.pages, mode, true);
            assert.deepEqual(replay, original.xs);
            originalReplaySymbols += replay.length;

            const plantedCipher = transform(
              english.xs, key, original.pages, mode, true);
            const recovered = transform(
              plantedCipher, key, original.pages, mode, false);
            assert.deepEqual(recovered, english.xs);
            syntheticRecoverySymbols += recovered.length;

            const decodedStream = {
              xs: decoded, starts: original.starts, ends: original.ends
            };
            candidates.push({
              grid: gridName, markerExponent, reducer, sign, reset,
              IoC: ioc(decoded),
              bigramPerRune: languageScore(decodedStream, logp),
              preview: decoded.slice(0, 64)
                .map(x => corpus.translit[x]).join(" ")
            });
          }
    }
  }
  candidates.sort((a, b) => b.bigramPerRune - a.bigramPerRune);

  const directMaps = {};
  for (const [gridName, grid] of Object.entries(grids)) {
    for (const reducer of ["mod29", "scaled29"]) {
      const map = Array.from({length: 29}, (_, i) =>
        reduceByte(grid[powMod(13, i, 256)], reducer));
      directMaps[gridName + "/" + reducer] = {
        distinctOutputs: new Set(map).size,
        collisions: 29 - new Set(map).size
      };
    }
  }

  return {
    classification: "bounded original negative; no LP2 plaintext or key recovered",
    source: {
      redRunes: 225, thirteenDotStencils: 31, totalEvents: events.length,
      tableCells: 256, base13: 13, enlargedAcGpIndex: 24,
      enlargedAcGpPrime: 97, powerIdentity: "13^24 mod 256 = 97",
      onlySameIndexGpPrimeFixedPoint: fixedPoints,
      gridByteAtCell97: {base60: grids.base60[97], base59: grids.base59[97]}
    },
    controls: {
      trainingText: "Shakespeare first 240,000 characters",
      heldoutText: "Shakespeare remaining 60,000 characters",
      heldoutRunes: english.xs.length,
      heldoutIoC: ioc(english.xs),
      heldoutBigramPerRune: languageScore(english, logp),
      originalIoC: ioc(original.xs),
      originalBigramPerRune: languageScore(original, logp)
    },
    candidateFamily: {
      exactModels: candidates.length,
      dimensions: "2 table readings x 2 marker exponents x 2 byte reducers x 2 signs x 2 clocks",
      keyStats, directMaps,
      originalReencryptionSymbols: originalReplaySymbols,
      syntheticRecoverySymbols: syntheticRecoverySymbols,
      best: candidates.slice(0, 8),
      worst: candidates.slice(-2)
    }
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {sourceEvents, powMod, run};
