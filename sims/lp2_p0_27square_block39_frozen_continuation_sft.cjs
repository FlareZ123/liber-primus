"use strict";

/**
 * Original LP2 p0–2, prospective 27x27-map block 39 after the external
 * proposed block 38. Independently implements its reports 00–15.
 * Node.js 22 CommonJS, read-only standalone test.
 * No output here is authenticated Liber Primus plaintext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const tape = corpus.pages.slice(0, 3).flatMap(page => page.indices);
assert.deepEqual(corpus.pages.slice(0, 3).map(page => page.indices.length),
  [262, 266, 201]);
assert.equal(tape.length, 729);
const n0 = ([r, c]) => 27 * (r - 1) + c;
const n90 = ([r, c]) => 27 * (c - 1) + 28 - r;
const n180 = x => 730 - n0(x);
const n270 = x => 730 - n90(x);
const mod = (a, m) => (a % m + m) % m;
const gcd = (a, b) => b ? gcd(b, a % b) : a;
function phi(n) {
  assert.ok(n >= 1);
  let result = n, remaining = n;
  for (let p = 2; p * p <= remaining; p++) {
    if (remaining % p !== 0) continue;
    result -= result / p;
    while (remaining % p === 0) remaining /= p;
  }
  if (remaining > 1) result -= result / remaining;
  return result;
}
function mu(n) {
  assert.ok(n >= 1);
  let sign = 1;
  for (let p = 2; p * p <= n; p++) {
    if (n % p !== 0) continue;
    n /= p; sign = -sign;
    if (n % p === 0) return 0;
  }
  return n > 1 ? -sign : sign;
}
const at = cell => tape[n0(cell) - 1];
const leftmost = cells => cells.reduce((a, b) =>
  b[1] < a[1] || (b[1] === a[1] && b[0] > a[0]) ? b : a);
const ray = (a, b) => {
  const dr = Math.abs(a[0] - b[0]), dc = Math.abs(a[1] - b[1]);
  return Math.min(dr, dc, Math.abs(dr - dc));
};
// Exact proposed predecessor. Its authenticity is the hypothesis under test.
const previous = {
  node: [[11, 13], [12, 13], [13, 13]],
  cipher: [[5, 17], [6, 17], [7, 17], [8, 17]],
  phase: 0, outer: 0, S: 32,
};
assert.deepEqual(previous.node.map(at), [16, 19, 28]);
assert.deepEqual(previous.cipher.map(at), [26, 14, 14, 21]);
assert.deepEqual(previous.cipher.map((x, i) =>
  mod(at(x) - [16, 19, 28][i % 3], 29)), [10, 24, 15, 5]);

function predict() {
  const {node, cipher, phase, outer, S} = previous;
  const B = cipher[0], E = cipher.at(-1), L = leftmost(cipher);
  const M = node[1], Z = node.reduce((a, b) =>
    b[0] > a[0] || (b[0] === a[0] && b[1] > a[1]) ? b : a);
  const mode = Math.floor(S / 7) % 4;
  const reflected = mode === 1 || mode === 2;
  const nextPhase = mod((mode === 0 || mode === 2 ? 1 : 0) +
    cipher.reduce((s, x) => s + mu(reflected ? n180(x) : n0(x)), 0), 3);
  assert.ok(!(nextPhase === 2 && S % 7 === 6));
  const nextOuter = mod(outer + mu(n90(L)), 2);
  const signatures = [
    [[0, 0, 0], [1, 1, 1]],
    [[0, 1, 0], [1, -1, 1]],
    [[0, -1, 0], [1, 0, 1]],
  ];
  const score = mu(n180(B) + n0(M)) + mu(gcd(n90(E), n180(E)));
  const axis = score === 0 ? "horizontal" : score > 0 ? "vertical" : "diagonal";
  const centerRow = mod(1 + B[1] + E[0] + M[0] + mu(n180(B)), 2);
  const centerCol = mod(1 + B[0] + E[0] + M[0], 2);
  const endpointRow = mod(1 + phase + mu(n180(M)), 2);
  const leftmostRow = mod(centerRow + 1 + phase + mu(M[0]), 2);
  const leftmostCol = mod(B[0] +
    cipher.reduce((s, x) => s + mu(n90(x)), 0) +
    Number(at(node[0]) === at(node[2])) + mu(n180(M)), 2);
  const q = Number(mu(n0(E)) === 0 && mu(n270(E)) === 0);
  const z = Number(mu(n0(B)) === 0 && mu(n90(B)) === 0);
  const mirror = Number(Math.max(Math.abs(Z[0] - L[0]),
    Math.abs(Z[1] - L[1])) % 3 !== 2);
  const group = Number((mu(n90(M) + n180(Z)) < 0) ===
    (mu(n90(L) + n180(Z)) < 0));
  const gp = node.reduce((s, x) => s + corpus.prime[at(x)], 0);
  const diag = Number(mu(gcd(n90(M), n270(Z))) < 0) ^
    Number(mu(gp) > 0) ^ Number(mu(n0(M) + n270(Z)) !== 0);
  const radiusParity = mod(M[0] + M[1] + B[0] + B[1], 2) ^
    Number(mu(gcd(n180(Z), n180(L))) < 0) ^
    Number(mu(n90(B) + n90(E)) > 0);
  return {
    sig: signatures[nextPhase][nextOuter], nextPhase, nextOuter,
    reflected, axis, tau: mod(mu(n270(E)) + phi(at(M)), 2),
    centerRow, centerCol, endpointRow, leftmostRow, leftmostCol,
    offset: q * (1 - z), mirror, keyAxis: 2 * group + diag,
    radiusParity, L,
  };
}
const forecast = predict();
assert.deepEqual(forecast, {
  sig: [0, 1, 0], nextPhase: 1, nextOuter: 0,
  reflected: false, axis: "diagonal", tau: 1,
  centerRow: 0, centerCol: 0, endpointRow: 1,
  leftmostRow: 1, leftmostCol: 0, offset: 0,
  mirror: 0, keyAxis: 0, radiusParity: 0, L: [8, 17],
});

function enumerateKeys() {
  const keys = [];
  for (let r = 2; r <= 26; r += 2) {
    for (let c = 2; c <= 26; c += 2) {
      for (let radius = 2; radius <= 12; radius += 2) {
        if (c - radius < 1 || c + radius > 27) continue;
        const l = at([r, c - radius]), h = at([r, c]),
          rr = at([r, c + radius]);
        if (!l || !h || !rr || l === rr) continue;
        for (const transformed of [true, false]) {
          for (const reverse of [false, true]) {
            const raw = reverse ? [rr, h, l] : [l, h, rr];
            const key = [raw[0], transformed ? phi(raw[1]) : raw[1], raw[2]];
            if (key.some(x => !x) || key.map(x => mu(phi(x)))
              .some((v, i) => v !== forecast.sig[i])) continue;
            const aligned = key.slice(forecast.nextPhase)
              .concat(key.slice(0, forecast.nextPhase));
            keys.push({center: [r, c], radius, transformed,
              reverse, raw, aligned});
          }
        }
      }
    }
  }
  return keys;
}
function enumerateSegments() {
  const segments = [];
  for (let r = 1; r <= 27; r += 2) {
    for (let c = 2; c <= 27; c += 2) {
      const B = [r, c];
      if (ray(forecast.L, B) !== forecast.offset) continue;
      if (![0, 1].includes(mu(n90(B)))) continue;
      for (const slope of [-1, 1]) {
        for (let len = 3; len <= 27; len += 2) {
          const E = [r + slope * (len - 1), c + len - 1];
          if (E.some(v => v < 1 || v > 27)) break;
          if (E[0] % 2 !== forecast.endpointRow) continue;
          segments.push({B, E, len,
            C: Array.from({length: len}, (_, i) => at([r + slope * i, c + i]))});
        }
      }
    }
  }
  return segments;
}
function validGcd(center, segment) {
  const {B, E} = segment;
  return [
    gcd(n0(center), n0(B)), gcd(n0(center), n0(B)),
    gcd(n90(center), n270(E)), gcd(n0(center), n180(E)),
  ].every(x => mu(x) !== 0);
}
const keys = enumerateKeys(), segments = enumerateSegments();
assert.equal(keys.length, 172);
assert.equal(segments.length, 132);
const candidates = [];
for (const key of keys) {
  for (const seg of segments) {
    if (!validGcd(key.center, seg)) continue;
    const plain = seg.C.map((x, i) => mod(x - key.aligned[i % 3], 29));
    candidates.push({...key, ...seg, plain});
  }
}
assert.equal(candidates.length, 21818);
const encoded = a => a.map(v => String.fromCharCode(v + 65)).join("");
assert.equal(new Set(candidates.map(x => encoded(x.plain))).size, 18578);

// External reference dictionary is independent of the original cipher.
const tokens = corpus.translit.slice().sort((a, b) => b.length - a.length);
const tokenIndex = new Map(corpus.translit.map((word, i) => [word, i]));
function nativeWord(word) {
  const text = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < text.length;) {
    const tok = tokens.find(x => text.startsWith(x, i));
    if (!tok) return null;
    result.push(tokenIndex.get(tok)); i += tok.length;
  }
  return result;
}
const dict = new Map();
for (const word of [
  read("resources/control/shakespeare_first300k.txt"),
  read("resources/control/gibran_prophet_58585.txt"),
].flatMap(text => text.match(/[A-Za-z]+/g) || [])) {
  const runes = nativeWord(word);
  if (!runes) continue;
  const key = encoded(runes), old = dict.get(key);
  dict.set(key, {word: old?.word || word.toUpperCase(),
    freq: (old?.freq || 0) + 1, len: runes.length});
}
assert.equal(dict.size, 6834);
const lexicon = new Map([...dict].filter(([k, w]) =>
  w.freq >= 5 && (w.len >= 2 || k === encoded([24]) || k === encoded([10]))));
assert.equal(lexicon.size, 1465);
const byFirst = new Map();
for (const [key, value] of lexicon) {
  if (!byFirst.has(key[0])) byFirst.set(key[0], []);
  byFirst.get(key[0]).push({key, ...value});
}
function completeWords(plain) {
  const text = encoded(plain), dp = Array(text.length + 1).fill(null);
  dp[text.length] = {score: 0, words: []};
  for (let i = text.length - 1; i >= 0; i--) {
    for (const w of byFirst.get(text[i]) || []) {
      const j = i + w.key.length;
      if (j > text.length || text.slice(i, j) !== w.key || !dp[j]) continue;
      const score = Math.log(w.freq + 1) - 2 + dp[j].score;
      if (!dp[i] || dp[i].score < score)
        dp[i] = {score, words: [w.word, ...dp[j].words]};
    }
  }
  return dp[0]?.words || null;
}
const longSingleWords = [], language = [], lengths = new Map();
for (const candidate of candidates) {
  const len = candidate.plain.length;
  lengths.set(len, (lengths.get(len) || 0) + 1);
  const single = dict.get(encoded(candidate.plain));
  if (single && len >= 5) longSingleWords.push(single.word);
  const phrase = completeWords(candidate.plain);
  if (phrase) language.push({length: len, phrase: phrase.join(" ")});
}
assert.deepEqual(Object.fromEntries(lengths), {
  3: 4614, 5: 3922, 7: 3422, 9: 2960,
  11: 2188, 13: 1672, 15: 1170, 17: 838,
  19: 516, 21: 344, 23: 172,
});
assert.deepEqual(longSingleWords, ["MAKING"]);
assert.equal(language.length, 95);
assert.equal(new Set(language.map(x => x.phrase)).size, 74);
assert.deepEqual(language.filter(x => x.length >= 7),
  [{length: 7, phrase: "ME TIS NO"}]);
console.log(JSON.stringify({
  status: "candidate-only, no authenticated original plaintext",
  forecast, keys: keys.length, segments: segments.length,
  assignments: candidates.length,
  distinctNativeRuneStrings: new Set(candidates.map(x => encoded(x.plain))).size,
  referenceVocabulary: dict.size, frequentVocabulary: lexicon.size,
  singleWordsAtLeast5Runes: longSingleWords,
  fullBlockReferencePhraseAssignments: language.length,
  uniqueFullBlockPhrases: new Set(language.map(x => x.phrase)).size,
  phraseCountByLength: Object.fromEntries([...new Set(language.map(x => x.length))]
    .sort((a, b) => a - b).map(len => [len, language.filter(x => x.length === len).length])),
  longestAcceptedPhrase: language.find(x => x.length >= 7),
}, null, 2));
