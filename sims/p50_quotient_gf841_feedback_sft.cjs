"use strict";
/**
 * Source-quotient GF(29^2) trace-feedback gate on the original LP2 stream.
 *
 * Source inputs:
 *   p3 red polynomial F3 = 13 + 23X + 2X^2, hence u^2 = 3u + 8;
 *   p39 red polynomial F39 = 27 + 5X + 15X^2 = 15(X-24)^2;
 *   p50's original 256-byte row-major table polynomial P50.
 *
 * Exact quotient: (P50 / F39) mod F3 = g = 19 + 13u, order 840.
 * The p54 enlarged Ac gives beta=24. The field trace is Tr(a+bu)=2a+3b.
 *
 * Test c_i = p_i + sign*Tr(s_i), s_(i+1)=g^(+/-1)*s_i+24*f_i,
 * with f_i either recovered plaintext or ciphertext. Exhausts both signs,
 * book/page clocks, both feedback conventions, both generator directions,
 * and all 841 initial states: 13,456 exact original-input inversions.
 *
 * Shakespeare 240k-character training / 60k heldout GP trigram model;
 * Gibran and heldout Shakespeare are independent native-GP controls.
 * Node.js 22, no external packages.
 *
 * Run: node sims/p50_quotient_gf841_feedback_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const load = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const mod = x => ((x % 29) + 29) % 29;
const inv29 = x => {
  for (let i = 1; i < 29; i++) if (mod(i * x) === 1) return i;
  throw new Error("noninvertible F29 element");
};
const multiply = (x, y) => [
  mod(x[0] * y[0] + 8 * x[1] * y[1]),
  mod(x[0] * y[1] + x[1] * y[0] + 3 * x[1] * y[1])
];
function power(x, n) {
  let r = [1, 0], b = x;
  while (n) {
    if (n & 1) r = multiply(r, b);
    b = multiply(b, b);
    n = Math.floor(n / 2);
  }
  return r;
}
function deriveSource() {
  const corpus = load("resources/liber-primus/lp2-corpus.json");
  const grid = load("resources/liber-primus/base60-grid.json");
  const ink = load("resources/liber-primus/lp2-ink-annotations.json");
  const triads = ink.pages.flatMap(p => (p.red_spans || [])
    .filter(s => s.length === 3)
    .map(s => [p.page, s.start, [...s.runes].map(r => corpus.runes.indexOf(r))]));
  assert.deepEqual(triads, [[3, 119, [13, 23, 2]], [39, 119, [27, 5, 15]]]);
  const F3 = [13, 23, 2], F39 = [27, 5, 15];
  for (let x = 0; x < 29; x++) assert.notEqual(mod(F3[0] + F3[1] * x + F3[2] * x * x), 0);
  assert.deepEqual(F39, [27, 5, 15]);
  const beta = corpus.pages.find(p => p.page === 54).indices[0];
  assert.equal(beta, 24);
  const coefficients = grid.byte_rows.flat().map(mod);
  assert.equal(coefficients.length, 256);
  const polynomial = coefficients.slice();
  while (polynomial.length && polynomial[0] === 0) polynomial.shift();
  assert.equal(polynomial.length, 255);
  const divisor = [15, 5, 27]; // descending coefficients of F39
  const quotient = new Array(polynomial.length - 2).fill(0);
  const remainder = polynomial.slice();
  for (let i = 0; i < quotient.length; i++) {
    const k = mod(remainder[i] * inv29(divisor[0]));
    quotient[i] = k;
    for (let j = 0; j < divisor.length; j++)
      remainder[i + j] = mod(remainder[i + j] - k * divisor[j]);
  }
  assert.ok(remainder.every(x => x === 0), "p50 polynomial must divide exactly by F39");
  let g = [0, 0];
  for (const v of quotient) {
    g = multiply(g, [0, 1]);
    g[0] = mod(g[0] + v);
  }
  assert.deepEqual(g, [19, 13]);
  assert.deepEqual(power(g, 840), [1, 0]);
  for (const prime of [2, 3, 5, 7])
    assert.notDeepEqual(power(g, 840 / prime), [1, 0]);
  const gInverse = power(g, 839);
  assert.deepEqual(multiply(g, gInverse), [1, 0]);
  return { corpus, grid, F3, F39, beta, g, gInverse, quotientLength: quotient.length };
}
function parseOriginal(corpus) {
  const transcription = fs.readFileSync(path.join(ROOT, "resources/lp2-transcription.txt"), "utf8");
  const segments = transcription.split("%").slice(0, 55);
  assert.equal(segments.length, 55);
  const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
  const xs = [], starts = [], ends = [], pageStart = [];
  let active = false, firstInPage = true, last = -1;
  for (const ch of segments.join("%")) {
    if (ch === "%") { firstInPage = true; continue; }
    if (runeMap.has(ch)) {
      xs.push(runeMap.get(ch));
      starts.push(!active);
      ends.push(false);
      pageStart.push(firstInPage);
      firstInPage = false;
      active = true;
      last = xs.length - 1;
    } else if (ch === "/" || /\s/u.test(ch)) {
      // The source transcription uses slash and whitespace for line wraps.
    } else {
      if (active && last >= 0) ends[last] = true;
      active = false;
    }
  }
  if (active && last >= 0) ends[last] = true;
  const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length > 0);
  const original = pages.flatMap(p => p.indices);
  assert.equal(original.length, 12956);
  assert.equal(xs.length, original.length);
  assert.deepEqual(xs, original);
  const train = pages.filter(p => p.page < 28).reduce((n, p) => n + p.indices.length, 0);
  assert.equal(train, 6761);
  return { pages, original, starts, ends, pageStart, train };
}
const ALPHA = 29, START = 29, END = 30, N = 31;
function encodeWord(word, translit) {
  const s = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < s.length;) {
    const pair = s.slice(i, i + 2), pairIndex = translit.indexOf(pair);
    if (pairIndex >= 0) { out.push(pairIndex); i += 2; }
    else {
      const singleIndex = translit.indexOf(s[i]);
      assert.notEqual(singleIndex, -1, "unmapped English character " + s[i]);
      out.push(singleIndex);
      i++;
    }
  }
  return out;
}
function corpusWords(text, translit) {
  return (text.match(/[A-Za-z]+/g) || []).map(w => encodeWord(w, translit));
}
function trainTrigram(words) {
  const h3 = new Float64Array(N * N * N), h2 = new Float64Array(N * N);
  const h1 = new Float64Array(N), ctx3 = new Float64Array(N * N), ctx2 = new Float64Array(N);
  for (const word of words) {
    let a = START, b = START;
    for (const c of [...word, END]) {
      h3[(a * N + b) * N + c]++;
      ctx3[a * N + b]++;
      h2[b * N + c]++;
      ctx2[b]++;
      h1[c]++;
      a = b; b = c;
    }
  }
  const total = h1.reduce((a, b) => a + b, 0);
  const p1 = Float64Array.from(h1, x => (x + 1) / (total + N));
  const p2 = new Float64Array(N * N), lm = new Float64Array(N * N * N);
  for (let b = 0; b < N; b++) for (let c = 0; c < N; c++)
    p2[b * N + c] = (h2[b * N + c] + 10 * p1[c]) / (ctx2[b] + 10);
  for (let a = 0; a < N; a++) for (let b = 0; b < N; b++) for (let c = 0; c < N; c++)
    lm[(a * N + b) * N + c] =
      Math.log((h3[(a * N + b) * N + c] + 5 * p2[b * N + c]) / (ctx3[a * N + b] + 5));
  return lm;
}
function scoreSplit(out, starts, ends, train, lm) {
  let a = START, b = START, trainScore = 0, heldoutScore = 0;
  for (let i = 0; i < out.length; i++) {
    if (starts[i]) { a = START; b = START; }
    const c = out[i], v = lm[(a * N + b) * N + c];
    if (i < train) trainScore += v; else heldoutScore += v;
    a = b; b = c;
    if (ends[i]) {
      const e = lm[(a * N + b) * N + END];
      if (i < train) trainScore += e; else heldoutScore += e;
      a = START; b = START;
    }
  }
  return {
    train: trainScore / train,
    heldout: heldoutScore / (out.length - train),
    full: (trainScore + heldoutScore) / out.length
  };
}
function makeStream(words, limit) {
  const xs = [], starts = [], ends = [];
  for (const word of words) {
    for (let j = 0; j < word.length && xs.length < limit; j++) {
      xs.push(word[j]); starts.push(j === 0); ends.push(j === word.length - 1);
    }
    if (xs.length >= limit) break;
  }
  return { xs, starts, ends };
}
function scoreControlWindow(words, offset, count, lm) {
  const stream = makeStream(words, offset + count);
  let a = START, b = START, score = 0;
  for (let i = offset; i < offset + count; i++) {
    if (stream.starts[i]) { a = START; b = START; }
    const c = stream.xs[i];
    score += lm[(a * N + b) * N + c];
    a = b; b = c;
    if (stream.ends[i]) {
      score += lm[(a * N + b) * N + END];
      a = START; b = START;
    }
  }
  return score / count;
}
function buildTables(generator, sign, feedback, beta) {
  const plain = new Uint8Array(841 * ALPHA), next = new Uint16Array(841 * ALPHA);
  for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) {
    const state = a * 29 + b, trace = mod(2 * a + 3 * b);
    for (let c = 0; c < 29; c++) {
      const ix = state * 29 + c;
      const p = mod(c - sign * trace);
      const f = feedback === "plaintext" ? p : c;
      const product = multiply(generator, [a, b]);
      plain[ix] = p;
      next[ix] = mod(product[0] + beta * f) * 29 + product[1];
    }
  }
  return { plain, next };
}
function decrypt(input, seed, clock, tables, pageStart) {
  const output = new Uint8Array(input.length);
  let state = seed;
  for (let i = 0; i < input.length; i++) {
    if (clock === "page" && pageStart[i]) state = seed;
    const ix = state * 29 + input[i];
    output[i] = tables.plain[ix];
    state = tables.next[ix];
  }
  return output;
}
function encrypt(input, seed, clock, feedback, generator, sign, beta, pageStart) {
  const output = new Uint8Array(input.length);
  let state = seed;
  for (let i = 0; i < input.length; i++) {
    if (clock === "page" && pageStart[i]) state = seed;
    const a = Math.floor(state / 29), b = state % 29;
    const c = mod(input[i] + sign * mod(2 * a + 3 * b));
    output[i] = c;
    const f = feedback === "plaintext" ? input[i] : c;
    const product = multiply(generator, [a, b]);
    state = mod(product[0] + beta * f) * 29 + product[1];
  }
  return output;
}
function ioc(values) {
  const f = new Uint32Array(29);
  for (const x of values) f[x]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (values.length * (values.length - 1));
}
function main() {
  const source = deriveSource();
  const input = parseOriginal(source.corpus);
  const shakespeare = fs.readFileSync(path.join(ROOT, "resources/control/shakespeare_first300k.txt"), "utf8");
  const gibran = fs.readFileSync(path.join(ROOT, "resources/control/gibran_prophet_58585.txt"), "utf8");
  const trainWords = corpusWords(shakespeare.slice(0, 240000), source.corpus.translit);
  const heldoutWords = corpusWords(shakespeare.slice(240000), source.corpus.translit);
  const gibranWords = corpusWords(gibran, source.corpus.translit);
  const lm = trainTrigram(trainWords);
  const controls = [];
  for (const [name, words] of [["shakespeare-heldout", heldoutWords], ["gibran", gibranWords]]) {
    const total = words.reduce((n, w) => n + w.length, 0);
    for (let offset = 0; offset + 10000 <= total; offset += 10000)
      controls.push({ name, offset, runes: 10000, score: scoreControlWindow(words, offset, 10000, lm) });
  }
  const generators = [
    { name: "g", value: source.g },
    { name: "g-inverse", value: source.gInverse }
  ];
  const modeResults = [], globalTop = [];
  let bestHeldout = null;
  for (const generator of generators) for (const sign of [1, -1])
    for (const clock of ["book", "page"])
      for (const feedback of ["plaintext", "ciphertext"]) {
        const tables = buildTables(generator.value, sign, feedback, source.beta);
        const candidates = [];
        for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) {
          const seed = a * 29 + b;
          const decoded = decrypt(input.original, seed, clock, tables, input.pageStart);
          const score = scoreSplit(decoded, input.starts, input.ends, input.train, lm);
          const row = { ...score, seed: [a, b], seedIndex: seed };
          candidates.push(row);
          if (!bestHeldout || row.heldout > bestHeldout.heldout)
            bestHeldout = { ...row, mode: { generator: generator.name, sign, clock, feedback } };
        }
        candidates.sort((x, y) => y.train - x.train);
        modeResults.push({
          generator: generator.name, sign, clock, feedback,
          bestTraining: candidates[0],
          topThree: candidates.slice(0, 3)
        });
        globalTop.push(...candidates.slice(0, 5).map(row => ({
          ...row, mode: { generator: generator.name, sign, clock, feedback }
        })));
      }
  globalTop.sort((x, y) => y.train - x.train);
  const best = globalTop[0];
  const bestGenerator = best.mode.generator === "g" ? source.g : source.gInverse;
  const bestTables = buildTables(bestGenerator, best.mode.sign, best.mode.feedback, source.beta);
  const bestPlain = decrypt(input.original, best.seedIndex, best.mode.clock, bestTables, input.pageStart);
  const reencrypted = encrypt(bestPlain, best.seedIndex, best.mode.clock, best.mode.feedback,
    bestGenerator, best.mode.sign, source.beta, input.pageStart);
  assert.deepEqual(Array.from(reencrypted), input.original);
  const plant = makeStream(gibranWords, input.original.length).xs;
  assert.equal(plant.length, input.original.length);
  const plantSeed = 13 * 29 + 23;
  const plantTables = buildTables(source.g, 1, "plaintext", source.beta);
  const plantCipher = encrypt(plant, plantSeed, "book", "plaintext", source.g, 1,
    source.beta, new Uint8Array(plant.length));
  const plantDecoded = decrypt(plantCipher, plantSeed, "book", plantTables, new Uint8Array(plant.length));
  assert.deepEqual(Array.from(plantDecoded), plant);
  const originalScore = scoreSplit(input.original, input.starts, input.ends, input.train, lm);
  console.log(JSON.stringify({
    classification: "Bounded negative for source-quotient GF(29^2) trace-feedback native-GP decoder",
    source: {
      F3: source.F3, F39: source.F39, beta: source.beta,
      quotientElement: source.g, inverse: source.gInverse,
      multiplicativeOrder: 840, quotientCoefficients: source.quotientLength,
      field: "u^2 = 3u + 8", trace: "Tr(a+bu) = 2a+3b"
    },
    original: {
      runes: input.original.length, words: input.starts.filter(Boolean).length,
      runePages: input.pages.length, trainingRunes: input.train,
      heldoutRunes: input.original.length - input.train,
      ioc: ioc(input.original), trigram: originalScore
    },
    languageModel: {
      trainingWords: trainWords.length,
      trainingRunes: trainWords.reduce((n, w) => n + w.length, 0),
      heldoutWords: heldoutWords.length, gibranWords: gibranWords.length,
      nativeControlWindows: controls
    },
    search: {
      models: 13456,
      dimensions: "2 generator directions x 2 signs x 2 clocks x 2 feedback rules x 841 seeds",
      bestTraining: best,
      bestHeldout: bestHeldout,
      topFiveTraining: globalTop.slice(0, 5),
      modeWinners: modeResults
    },
    validation: {
      bestOriginalReencryption: "12956/12956",
      positivePlant: "independent Gibran GP text, 12956/12956 exact recovery",
      positivePlantSeed: [13, 23],
      positivePlantModel: "g, positive trace, continuous book clock, plaintext feedback"
    },
    bestCandidatePrefix: Array.from(bestPlain.slice(0, 100), x => source.corpus.translit[x]).join(" ")
  }, null, 2));
}
if (require.main === module) main();
