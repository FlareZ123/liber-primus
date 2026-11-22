'use strict';

// Bounded, source-locked two-sided GF(29²) Möbius/continued-fraction test.
// p39 supplies the exact divisor; p3 supplies u²=3u+8; p54 Ac=24 is
// the boundary state between p53's 51 highlighted runes and p55's 76 runes.
// This tests one canonical reversible update, not every possible GF(29²) cipher.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const G = readJson('resources/liber-primus/lp2-grid-256.json');
const C = readJson('resources/liber-primus/lp2-corpus.json');
const A = readJson('resources/liber-primus/lp2-ink-annotations.json');
const lp1 = fs.readFileSync(path.join(root, 'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8');
const mod = (x) => ((x % 29) + 29) % 29;
const inv29 = (x) => {
  for (let k = 1; k < 29; k++) if (mod(x * k) === 1) return k;
  throw new Error('non-invertible F29 element: ' + x);
};

// Polynomial coefficients are in descending source-table order.
// p39: 27 + 5X + 15X², hence descending divisor [15,5,27].
function divideDescending(a, b) {
  const q = Array(a.length - b.length + 1).fill(0);
  const r = a.slice();
  for (let i = 0; i < q.length; i++) {
    const f = mod(r[i] * inv29(b[0]));
    q[i] = f;
    for (let j = 0; j < b.length; j++) r[i + j] = mod(r[i + j] - f * b[j]);
  }
  return { q, remainder: r.slice(q.length) };
}
const division = divideDescending(G.bytes.map((x) => x % 29), [15, 5, 27]);
// Normalize the leading factor 15, exactly as the source factor gate does.
const quotient = division.q.map((x) => mod(x * inv29(15)));
const pairs = Array.from({ length: 127 }, (_, i) => [quotient[2 * i], quotient[2 * i + 1]]);
assert.equal(quotient.length, 254);
assert.deepEqual(division.remainder, [0, 0]);
assert.equal(pairs.length, 127);

// Source-defined 127-rune target: p53 highlighted red span (51) + p55 (76).
const p53 = C.pages.find((p) => p.page === 53);
const p55 = C.pages.find((p) => p.page === 55);
const p53Span = A.pages.find((p) => p.page === 53).red_spans
  .find((s) => s.length === 51);
assert(p53Span, 'missing p53 51-rune red span');
const target = [
  ...p53.indices.slice(p53Span.start, p53Span.start + p53Span.length),
  ...p55.indices,
];
assert.equal(p53Span.length, 51);
assert.equal(p55.indices.length, 76);
assert.equal(target.length, 127);

// Field F29[u]/(u²-3u-8), with elements a+b*u.
function add(x, y) { return [mod(x[0] + y[0]), mod(x[1] + y[1])]; }
function sub(x, y) { return [mod(x[0] - y[0]), mod(x[1] - y[1])]; }
function norm(x) { return mod(x[0] * x[0] + 3 * x[0] * x[1] - 8 * x[1] * x[1]); }
function trace(x) { return mod(2 * x[0] + 3 * x[1]); }
function inverse(x) {
  const n = norm(x);
  if (n === 0) throw new Error('zero field norm');
  const k = inv29(n);
  return [mod((x[0] + 3 * x[1]) * k), mod(-x[1] * k)];
}
const ZERO = [0, 0];
const SEED = [24, 0]; // Ac at p54.
const isZero = (x) => x !== null && x[0] === 0 && x[1] === 0;

// Forward Möbius step s' = q + 1/s; null is projective infinity.
function forward(s, q) {
  if (s === null) return q.slice();
  if (isZero(s)) return null;
  return add(q, inverse(s));
}
// Exact inverse s = 1/(s' - q).
function backward(next, q) {
  if (next === null) return ZERO.slice();
  const d = sub(next, q);
  if (isZero(d)) return null;
  return inverse(d);
}

// Boundary state s_51=Ac24. p53 is traversed backwards (i=50..0),
// p55 forwards (i=51..126). For each q_i, record both s_i and s_(i+1).
const pre = Array(127);
const post = Array(127);
let state = SEED.slice();
for (let i = 50; i >= 0; i--) {
  post[i] = state === null ? null : state.slice();
  state = backward(state, pairs[i]);
  pre[i] = state === null ? null : state.slice();
}
state = SEED.slice();
for (let i = 51; i < 127; i++) {
  pre[i] = state === null ? null : state.slice();
  state = forward(state, pairs[i]);
  post[i] = state === null ? null : state.slice();
}
assert.equal(pre.length, 127);
assert.equal(post.length, 127);

// Verify the transition is actually reversible on every original step.
for (let i = 0; i < 51; i++) {
  const s = pre[i];
  const next = post[i];
  const recovered = backward(next, pairs[i]);
  assert.deepEqual(recovered, s);
}
for (let i = 51; i < 127; i++) {
  const s = pre[i];
  const next = post[i];
  const recovered = backward(next, pairs[i]);
  assert.deepEqual(recovered, s);
}

const projections = {
  trace: (s) => s === null ? null : trace(s),
  norm: (s) => s === null ? null : norm(s),
  a: (s) => s === null ? null : s[0],
  b: (s) => s === null ? null : s[1],
};
const vocabulary = new Set((lp1.match(/[A-Za-z]+/gu) || []).map((w) =>
  w.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S')
));
function wordBreakScore(symbols) {
  const text = symbols.map((x) => C.translit[x]).join('').toUpperCase();
  const dp = Array(text.length + 1).fill(null);
  dp[0] = { covered: 0, parts: [] };
  for (let i = 0; i < text.length; i++) {
    if (!dp[i]) continue;
    for (let j = i + 1; j <= text.length; j++) {
      const word = text.slice(i, j);
      if (!vocabulary.has(word)) continue;
      const candidate = {
        covered: dp[i].covered + word.length,
        parts: [...dp[i].parts, word],
      };
      if (!dp[j] || candidate.covered > dp[j].covered) dp[j] = candidate;
    }
  }
  const best = dp.reduce((a, b) => !b ? a : !a || b.covered > a.covered ? b : a, null);
  return { text, covered: best ? best.covered : 0, words: best ? best.parts : [] };
}
const variants = [];
for (const [time, states] of [['pre', pre], ['post', post]]) {
  for (const [name, project] of Object.entries(projections)) {
    for (const sign of [-1, 1]) {
      const key = states.map(project);
      const decoded = target.map((c, i) => key[i] === null ? c : mod(c + sign * key[i]));
      const score = wordBreakScore(decoded);
      variants.push({
        time,
        projection: name,
        sign,
        invalidStates: key.filter((x) => x === null).length,
        coveredEnglishCharacters: score.covered,
        wordBreak: score.words,
        decoded: score.text,
      });
    }
  }
}
const bestCoverage = Math.max(...variants.map((v) => v.coveredEnglishCharacters));
assert(bestCoverage <= 5, 'source result changed: unexpectedly strong dictionary coverage');
console.log(JSON.stringify({
  quotient: {
    fixedWidthCoefficients: quotient.length,
    remainder: division.remainder,
    pairs: pairs.length,
    firstPairs: pairs.slice(0, 6),
    lastPairs: pairs.slice(-6),
  },
  target: {
    p53Span: { start: p53Span.start, length: p53Span.length },
    p55Length: p55.indices.length,
    total: target.length,
  },
  state: {
    fieldRelation: 'u²=3u+8',
    update: 's_(i+1)=q_i+1/s_i',
    inverse: 's_i=1/(s_(i+1)-q_i)',
    boundary: 's_51=Ac24',
    invalidPre: pre.filter((x) => x === null).length,
    invalidPost: post.filter((x) => x === null).length,
  },
  bestEnglishDictionaryCoverage: bestCoverage,
  variants,
}, null, 2));
