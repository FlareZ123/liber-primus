"use strict";

/**
 * Exact period-31 additive-key gate for the conditional p0 cribs.
 *
 * The candidate cribs fix 22/31 key phases. The remaining phases are two
 * contiguous blocks, so the native-GP trigram optimum is solved exactly by
 * dynamic programming rather than heuristic search.
 *
 * Run from repository root:
 *   node sims/lp2_p0_candidate_crib_period31_exact_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source = read("resources/lp2-transcription.txt");

const M = 29;
const PERIOD = 31;

/**
 * @param {number} x
 * @returns {number}
 */
function mod(x) {
  return ((x % M) + M) % M;
}

const p0Source = source.split("%")[0];
const runePattern = new RegExp("[" + corpus.runes.join("") + "]+", "gu");
const glyphIndex = new Map(corpus.runes.map((glyph, index) => [glyph, index]));
const words = (p0Source.match(runePattern) || []).map((word) =>
  Array.from(word, (glyph) => glyphIndex.get(glyph)));
const cipher = words.flat();
assert.equal(words.length, 59);
assert.equal(cipher.length, 262);

const wordIdAt = new Int32Array(cipher.length);
const wordStarts = [];
let cursor = 0;
for (let w = 0; w < words.length; w += 1) {
  wordStarts[w] = cursor;
  wordIdAt.fill(w, cursor, cursor + words[w].length);
  cursor += words[w].length;
}
assert.equal(cursor, cipher.length);

const triCounts = new Uint32Array(M ** 3);
const contexts = new Uint32Array(M ** 2);
const controlFiles = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt",
];

const nativePools = new Map();
for (const file of controlFiles) {
  for (const word of read(file).match(/[A-Za-z]+/g) || []) {
    const encoded = encodeSourceNativeGP(word);
    if (!encoded.length) continue;
    if (!nativePools.has(encoded.length)) nativePools.set(encoded.length, []);
    nativePools.get(encoded.length).push(encoded);
    for (let i = 2; i < encoded.length; i += 1) {
      const ab = encoded[i - 2] * M + encoded[i - 1];
      triCounts[ab * M + encoded[i]] += 1;
      contexts[ab] += 1;
    }
  }
}

const triLog = new Float64Array(M ** 3);
for (let ab = 0; ab < contexts.length; ab += 1) {
  const denominator = contexts[ab] + 14.5;
  for (let c = 0; c < M; c += 1) {
    triLog[ab * M + c] =
      Math.log((triCounts[ab * M + c] + 0.5) / denominator);
  }
}

const triEligible = new Uint8Array(cipher.length);
for (let i = 2; i < cipher.length; i += 1) {
  triEligible[i] = Number(
    wordIdAt[i] === wordIdAt[i - 1] &&
    wordIdAt[i] === wordIdAt[i - 2]);
}

/**
 * @param {number[]} plain
 * @returns {number}
 */
function scorePlain(plain) {
  let score = 0;
  for (let i = 2; i < plain.length; i += 1) {
    if (!triEligible[i]) continue;
    score += triLog[(plain[i - 2] * M + plain[i - 1]) * M + plain[i]];
  }
  return score;
}

/**
 * Contribution from all eligible trigrams ending at one period phase.
 *
 * @param {number[]} stream
 * @param {number} phase
 * @param {number} k2
 * @param {number} k1
 * @param {number} k0
 * @returns {number}
 */
function phasePotential(stream, phase, k2, k1, k0) {
  let score = 0;
  for (let i = 2; i < stream.length; i += 1) {
    if (!triEligible[i] || i % PERIOD !== phase) continue;
    const p2 = mod(stream[i - 2] - k2);
    const p1 = mod(stream[i - 1] - k1);
    const p0 = mod(stream[i] - k0);
    score += triLog[(p2 * M + p1) * M + p0];
  }
  return score;
}

/**
 * Exact optimizer for one contiguous unknown phase block. The two phases
 * immediately before and after the block must already be fixed.
 *
 * @param {number[]} stream
 * @param {(number|null)[]} key
 * @param {number[]} block
 * @returns {{values:number[],score:number}}
 */
function solveBlock(stream, key, block) {
  assert.ok(block.length >= 2);
  const first = block[0];
  for (let j = 1; j < block.length; j += 1) {
    assert.equal(block[j], (first + j) % PERIOD);
  }

  const before2 = (first + PERIOD - 2) % PERIOD;
  const before1 = (first + PERIOD - 1) % PERIOD;
  assert.notEqual(key[before2], null);
  assert.notEqual(key[before1], null);

  const b0 = block[0];
  const b1 = block[1];
  let scores = Array.from({length: M}, () => Array(M).fill(-Infinity));
  const backs = [];

  for (let x = 0; x < M; x += 1) {
    for (let y = 0; y < M; y += 1) {
      scores[x][y] =
        phasePotential(stream, b0, key[before2], key[before1], x) +
        phasePotential(stream, b1, key[before1], x, y);
    }
  }

  for (let step = 2; step < block.length; step += 1) {
    const phase = block[step];
    const next = Array.from({length: M}, () => Array(M).fill(-Infinity));
    const back = Array.from({length: M}, () => Array(M).fill(-1));

    for (let prev = 0; prev < M; prev += 1) {
      for (let cur = 0; cur < M; cur += 1) {
        for (let value = 0; value < M; value += 1) {
          const candidate =
            scores[prev][cur] +
            phasePotential(stream, phase, prev, cur, value);
          if (candidate > next[cur][value]) {
            next[cur][value] = candidate;
            back[cur][value] = prev;
          }
        }
      }
    }

    scores = next;
    backs.push(back);
  }

  const after0 = (block[block.length - 1] + 1) % PERIOD;
  const after1 = (block[block.length - 1] + 2) % PERIOD;
  assert.notEqual(key[after0], null);
  assert.notEqual(key[after1], null);

  let best = -Infinity;
  let lastA = -1;
  let lastB = -1;
  for (let a = 0; a < M; a += 1) {
    for (let b = 0; b < M; b += 1) {
      const candidate =
        scores[a][b] +
        phasePotential(stream, after0, a, b, key[after0]) +
        phasePotential(stream, after1, b, key[after0], key[after1]);
      if (candidate > best) {
        best = candidate;
        lastA = a;
        lastB = b;
      }
    }
  }

  const values = new Array(block.length);
  values[block.length - 2] = lastA;
  values[block.length - 1] = lastB;
  for (let step = block.length - 1; step >= 2; step -= 1) {
    const back = backs[step - 2];
    const prior = back[values[step - 1]][values[step]];
    values[step - 2] = prior;
  }

  return {values, score: best};
}

/**
 * @param {number[]} stream
 * @param {(number|null)[]} initialKey
 * @returns {{key:number[],plain:number[],score:number,blocks:Object[]}}
 */
function solvePeriod31(stream, initialKey) {
  const key = initialKey.slice();
  const blocks = [
    [13, 14, 15, 16, 17],
    [27, 28, 29, 30],
  ];
  const solved = [];

  for (const block of blocks) {
    const row = solveBlock(stream, key, block);
    for (let i = 0; i < block.length; i += 1) key[block[i]] = row.values[i];
    solved.push({block, ...row});
  }

  assert.ok(key.every(Number.isInteger));
  const plain = stream.map((value, i) => mod(value - key[i % PERIOD]));
  return {key, plain, score: scorePlain(plain), blocks: solved};
}

/**
 * @param {number[]} values
 * @returns {string}
 */
function render(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

const key = Array(PERIOD).fill(null);
const cribs = [
  {word: 0, text: "EPIPHANY"},
  {word: 1, text: "SEEKS"},
  {word: 52, text: "THE"},
  {word: 53, text: "DEVOTED"},
];

for (const crib of cribs) {
  const plain = encodeSourceNativeGP(crib.text);
  assert.equal(plain.length, words[crib.word].length);
  const start = wordStarts[crib.word];
  for (let j = 0; j < plain.length; j += 1) {
    const phase = (start + j) % PERIOD;
    const value = mod(words[crib.word][j] - plain[j]);
    if (key[phase] !== null) assert.equal(key[phase], value);
    key[phase] = value;
  }
}

assert.deepEqual(
  key.map((value, phase) => value === null ? phase : -1).filter((phase) => phase >= 0),
  [13, 14, 15, 16, 17, 27, 28, 29, 30],
);

const solved = solvePeriod31(cipher, key);
assert.deepEqual(
  cribs.map((crib) => render(
    solved.plain.slice(wordStarts[crib.word], wordStarts[crib.word] + words[crib.word].length))),
  ["EPIPHANY", "SEEKS", "THE", "DEVOTED"],
);

/*
 * Native length-shape controls. These are independent draws with exactly the
 * original 59 p0 word lengths.
 */
let rng = 0x31007120;
/**
 * @returns {number}
 */
function randomU32() {
  rng ^= rng << 13;
  rng ^= rng >>> 17;
  rng ^= rng << 5;
  rng >>>= 0;
  return rng;
}

const controlScores = [];
for (let sample = 0; sample < 1000; sample += 1) {
  const plain = [];
  for (const word of words) {
    const pool = nativePools.get(word.length);
    assert.ok(pool?.length, `native pool for length ${word.length}`);
    plain.push(...pool[randomU32() % pool.length]);
  }
  controlScores.push(scorePlain(plain));
}
controlScores.sort((a, b) => a - b);

const dictionaryByLength = new Map();
for (const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/)) {
  const match = line.match(/^([A-Za-z]+)/);
  if (!match) continue;
  const encoded = encodeSourceNativeGP(match[1]);
  if (!dictionaryByLength.has(encoded.length)) {
    dictionaryByLength.set(encoded.length, new Set());
  }
  dictionaryByLength.get(encoded.length).add(encoded.join(","));
}

let offset = 0;
const decodedWords = words.map((word) => {
  const values = solved.plain.slice(offset, offset + word.length);
  offset += word.length;
  const hit = dictionaryByLength.get(values.length)?.has(values.join(",")) || false;
  return {length: values.length, hit, text: render(values)};
});
assert.equal(offset, solved.plain.length);

const longHits = decodedWords.filter((row) => row.length >= 5 && row.hit).length;
const totalHits = decodedWords.filter((row) => row.hit).length;

console.log(JSON.stringify({
  candidateCribs: cribs,
  fixedKeyPhases: 22,
  optimizedPhases: [13,14,15,16,17,27,28,29,30],
  exactKey: solved.key,
  score: solved.score,
  rawCipherScore: scorePlain(cipher),
  nativeShapeControls: {
    samples: controlScores.length,
    min: controlScores[0],
    median: controlScores[Math.floor(controlScores.length / 2)],
    max: controlScores[controlScores.length - 1],
    candidateAboveMin: solved.score >= controlScores[0],
  },
  dictionary: {totalHits, longHits, words: decodedWords},
  rendered: render(solved.plain),
}, null, 2));
