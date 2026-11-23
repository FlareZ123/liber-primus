"use strict";
/**
 * Original-cipher all-private-key gate for one shared GP30 predecessor rotor.
 * Node 22/CommonJS, Windows 11 compatible, read-only, no dependencies.
 *
 * Models P_i = (F[(C_(i-1)+a*q_i)%30][(C_i+b*q_i)%30]+c*q_i)%30,
 * with every F row an independent secret permutation of all 30 symbols.
 * q_i advances only at original large manuscript marks, by their printed
 * dot counts or by one per mark. a,b,c in {0,1}; both wheel directions.
 * Native plaintext control: SPACE plus its most frequent GP29 rune.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8")
    .replace(/\r\n/g, "\n");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const annotations = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcript = read("resources/liber-primus/lp2-transcription.txt");
const index = new Map(corpus.runes.map((r, i) => [r, i]));
const sourcePages = transcript.split("%").slice(0, 55);
const token = [], pageStarts = new Map(), runeEnds = new Map(), words = [];
let alive = false, currentWord = [], nWords = 0;
for (let physical = 0; physical < sourcePages.length; physical++) {
  const page = physical < 50 ? physical : physical + 1;
  pageStarts.set(page, token.length);
  let runeOffset = 0;
  const pageRunes = [];
  for (const ch of sourcePages[physical]) {
    if (index.has(ch)) {
      const value = index.get(ch);
      token.push(value);
      pageRunes.push(value);
      currentWord.push(value);
      runeEnds.set(page + ":" + ++runeOffset, token.length);
      alive = true;
    } else if (ch === "/" || /\s/u.test(ch)) {
      // Newlines and slash marks are physical line boundaries, not words.
    } else if (alive) {
      token.push(29);
      nWords++;
      words.push(currentWord);
      currentWord = [];
      alive = false;
    }
  }
  assert.deepEqual(pageRunes, corpus.pages.find(p => p.page === page).indices);
}
if (alive) {
  token.push(29);
  nWords++;
  words.push(currentWord);
}
assert.equal(token.length, 15852);
assert.equal(nWords, 2896);
assert.equal(words.flat().length, 12956);
assert.equal(token.filter(x => x === 29).length, 2896);
const marks = annotations.pages.filter(p => p.page <= 55).flatMap(p =>
  (p.large_punctuation || []).map(m => {
    const runeAt = m[0];
    const end = runeAt === 0 ? pageStarts.get(p.page)
      : runeEnds.get(p.page + ":" + runeAt);
    assert.notEqual(end, undefined);
    const afterGap = runeAt > 0 && token[end] === 29 ? 1 : 0;
    return {page: p.page, at: runeAt, index: end + afterGap,
      dots: m[1], color: m[2]};
  }));
assert.equal(marks.length, 31);
assert.equal(new Set(marks.map(m => m.index)).size, 29);
assert.equal(new Set(marks.map(m => m.index)
  .filter(p => p > 0 && p < token.length)).size, 28);
assert.equal(marks.filter(m => m.page === 14 || m.page === 15)
  .filter(m => m.index === pageStarts.get(15)).length, 2);

/**
 * @param {(m:{index:number,dots:number,color:string})=>number} step
 * @returns {number[]}
 */
function phases(step) {
  const increments = new Map();
  for (const m of marks)
    increments.set(m.index, (increments.get(m.index) || 0) + step(m));
  let phase = 0;
  return token.map((_, i) => {
    phase = ((phase + (increments.get(i) || 0)) % 30 + 30) % 30;
    return phase;
  });
}
/**
 * Exactly maximize sum W[row][permutation(row)] over every possible
 * 30! alphabet permutation. Shortest-augmenting-path Hungarian solver.
 * @param {number[][]} matrix
 * @returns {number}
 */
function maximumAssignment(matrix) {
  const n = matrix.length;
  const u = Array(n + 1).fill(0), v = Array(n + 1).fill(0);
  const p = Array(n + 1).fill(0), way = Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = Array(n + 1).fill(Infinity);
    const used = Array(n + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity, j1 = 0;
      for (let j = 1; j <= n; j++) {
        if (used[j]) continue;
        const cur = -matrix[i0 - 1][j - 1] - u[i0] - v[j];
        if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
        if (minv[j] < delta) { delta = minv[j]; j1 = j; }
      }
      for (let j = 0; j <= n; j++) {
        if (used[j]) { u[p[j]] += delta; v[j] -= delta; }
        else minv[j] -= delta;
      }
      j0 = j1;
    } while (p[j0] !== 0);
    do {
      const j1 = way[j0]; p[j0] = p[j1]; j0 = j1;
    } while (j0 !== 0);
  }
  const permutation = new Array(n);
  for (let j = 1; j <= n; j++) permutation[p[j] - 1] = j - 1;
  const direct = permutation.reduce((sum, col, row) =>
    sum + matrix[row][col], 0);
  assert.equal(direct, v[0]);
  return direct;
}
assert.equal(maximumAssignment([[10, 1], [2, 8]]), 18);
assert.equal(maximumAssignment([[1, 12], [8, 2]]), 20);

/**
 * Maximize the ORIGINAL count of {plaintext SPACE, any one fixed rune}
 * over every secret private row permutation F and every target rune.
 * For c=0 this is the sum of the largest two transformed source cell
 * counts per row. For c=1, every row is a maximum-weight 30x30 matching.
 * The first ciphertext token is granted a free hit, even under an unknown
 * initial predecessor state. This makes the upper bound conservative.
 *
 * @param {number[]} phase
 * @param {number} a
 * @param {number} b
 * @param {number} c
 */
function originalAllKeyUpper(phase, a, b, c) {
  const hist = Array.from({length: 30}, () =>
    Array.from({length: 30}, () => Array(30).fill(0)));
  for (let i = 1; i < token.length; i++) {
    const q = phase[i];
    const state = (token[i - 1] + a * q) % 30;
    const input = (token[i] + b * q) % 30;
    hist[state][input][q]++;
  }
  if (!c) {
    let total = 1;
    for (let s = 0; s < 30; s++) {
      const counts = hist[s].map(row =>
        row.reduce((sum, value) => sum + value, 0)).sort((x, y) => y - x);
      total += counts[0] + counts[1];
    }
    return total;
  }
  let best = -Infinity;
  for (let selectedRune = 0; selectedRune < 29; selectedRune++) {
    let total = 1;
    for (let state = 0; state < 30; state++) {
      const weights = Array.from({length: 30}, (_, input) =>
        Array.from({length: 30}, (_, mapped) => {
          let count = 0;
          for (let q = 0; q < 30; q++) {
            const plain = (mapped + c * q) % 30;
            if (plain === 29 || plain === selectedRune)
              count += hist[state][input][q];
          }
          return count;
        }));
      total += maximumAssignment(weights);
    }
    best = Math.max(best, total);
  }
  return best;
}
const zeroPhase = Array(token.length).fill(0);
assert.equal(originalAllKeyUpper(zeroPhase, 0, 0, 0), 3707);
const variants = [];
for (const [clock, step] of [
  ["dots-all", m => m.dots],
  ["dots-red", m => m.color === "red" ? m.dots : 0],
  ["unit-all", () => 1],
  ["unit-red", m => m.color === "red" ? 1 : 0]
]) {
  for (const direction of [1, -1]) {
    const q = phases(m => direction * step(m));
    for (const a of [0, 1])
      for (const b of [0, 1])
        for (const c of [0, 1]) {
          if (a + b + c === 0) continue;
          const maximum = originalAllKeyUpper(q, a, b, c);
          variants.push({clock, direction, a, b, c, maximum});
        }
  }
}
/** Verify lossless original-source forward/inverse with genuinely moved gaps. */
const q = phases(m => m.dots);
const modulo = value => ((value % 30) + 30) % 30;
const plaintext = [];
let previous = 29;
for (let i = 0; i < token.length; i++) {
  const state = (previous + q[i]) % 30;
  const input = (token[i] + q[i]) % 30;
  plaintext.push((input + 3 * state + 7 + q[i]) % 30);
  previous = token[i];
}
const recovered = [];
previous = 29;
for (let i = 0; i < token.length; i++) {
  const state = (previous + q[i]) % 30;
  const originalToken = modulo(plaintext[i] - q[i] - 3 * state - 7 - q[i]);
  recovered.push(originalToken);
  previous = originalToken;
}
assert.deepEqual(recovered, token);
const movingGaps = token.filter((value, i) =>
  (value === 29) !== (plaintext[i] === 29)).length;
assert(movingGaps > 0);

/**
 * Creator-authentic native-GP controls: 256 bootstraps retaining every
 * printed original word length exactly, with solved LP1 sections split
 * into independent groups. Rare long word lengths receive uniform fillers,
 * which biases controls AGAINST our exclusion.
 */
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
assert.deepEqual(solved.runes, corpus.runes);
function runeWords(input) {
  const result = [];
  let word = [];
  for (const ch of input) {
    if (index.has(ch)) word.push(index.get(ch));
    else if (word.length) { result.push(word); word = []; }
  }
  if (word.length) result.push(word);
  return result;
}
const nativePools = [solved.sections.slice(0, 5), solved.sections.slice(5)]
  .map(sections => {
    const pool = new Map();
    for (const word of sections.flatMap(section => runeWords(section.source_text))) {
      if (!pool.has(word.length)) pool.set(word.length, []);
      pool.get(word.length).push(word);
    }
    return pool;
  });
let seed = 0x3301a211;
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}
const controls = [];
for (const pool of nativePools) {
  for (let replicate = 0; replicate < 128; replicate++) {
    const tally = Array(29).fill(0);
    for (const originalWord of words) {
      const samples = pool.get(originalWord.length);
      const word = samples ?
        samples[Math.floor(random() * samples.length)] :
        Array.from({length: originalWord.length}, () =>
          Math.floor(random() * 29));
      for (const symbol of word) tally[symbol]++;
    }
    controls.push(nWords + Math.max(...tally));
  }
}
assert.equal(controls.length, 256);
assert.equal(Math.min(...controls.slice(0, 128)), 4383);
assert.equal(Math.min(...controls.slice(128)), 4471);
const nativeMinimum = Math.min(...controls);
const maxModel = Math.max(...variants.map(v => v.maximum));
assert(maxModel < nativeMinimum);
assert(variants.every(v => controls.every(x => x > v.maximum)));
const byClock = {};
for (const clock of ["dots-all", "dots-red", "unit-all", "unit-red"]) {
  byClock[clock] = {
    forward: variants.filter(x => x.clock === clock && x.direction === 1)
      .map(({a, b, c, maximum}) => ({a, b, c, maximum})),
    maxAnyDirection: Math.max(...variants.filter(x => x.clock === clock)
      .map(x => x.maximum))
  };
}
console.log(JSON.stringify({
  input:{runes:12956,originalWords:nWords,gp30Tokens:token.length,
    manuscriptLargeMarks:marks.length,distinctCuts:29,internalCuts:28},
  exactTheory:"all 30! private row permutations via max-weight assignment",
  controls:{authenticSolvedCicadaBootstraps:256,
    minimumJointFrequency:nativeMinimum,trainingMinimum:4383,
    heldoutMinimum:4471},
  output:{modelCount:variants.length,byClock,maxAnyModel:maxModel,
    maximumBelowNative: nativeMinimum - maxModel,
    everyModelNativeControlExcluded: true},
  reversiblePositive:{originalTokens:recovered.length,
    exactReencryption: true,changedSpaceStatusPositions:movingGaps},
  interpretation:"conditional native-GP exclusion of four fixed public mark clocks and seven shared-table rotor wiring choices, both directions; no unknown LP2 plaintext or authentic key"
},null,2));
