'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const ink = readJson('resources/liber-primus/lp2-ink-annotations.json');
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const text = fs.readFileSync(path.join(root, 'resources/control/shakespeare_first300k.txt'), 'utf8');
const mod = (x, m = 29) => ((x % m) + m) % m;
const gp = new Map(corpus.runes.map((r, i) => [r, i]));

const blocks = [];
for (const page of ink.pages) {
  const items = [];
  (page.large_punctuation || []).forEach((mark, order) => {
    if (mark[1] === 13) items.push({ page: page.page, offset: mark[0], kind: 0, order, e: 0, color: mark[2] });
  });
  for (const span of (page.red_spans || [])) {
    Array.from(span.runes).forEach((rune, j) => {
      const g = gp.get(rune);
      assert.notEqual(g, undefined);
      items.push({ page: page.page, offset: span.start + j, kind: 1, order: j, e: mod(g + 1 - 13), gp: g });
    });
  }
  items.sort((a, b) => a.offset - b.offset || a.kind - b.kind || a.order - b.order);
  if (items.length) blocks.push({ page: page.page, items, events: items.map((x) => x.e) });
}
blocks.sort((a, b) => a.page - b.page);
const events = blocks.flatMap((b) => b.items)
  .sort((a, b) => a.page - b.page || a.offset - b.offset || a.kind - b.kind || a.order - b.order);
assert.equal(events.filter((e) => e.kind === 1).length, 225);
assert.equal(events.filter((e) => e.kind === 0).length, 31);
assert.equal(events.length, 256);
const p7 = events.filter((e) => e.page === 7 && e.offset === 194);
assert.deepEqual(p7.map((e) => e.color || 'rune'), ['black', 'red', 'rune']);

const mul = ([a, b], [c, d]) => [
  mod(a * c + 8 * b * d),
  mod(a * d + b * c + 3 * b * d),
];
const z = [23, 27], seed = [4, 24];
const fold = (items, multiplier = z, initial = seed) => {
  let s = initial.slice();
  for (const e of items) {
    s = mul(multiplier, s);
    s[0] = mod(s[0] + e.e);
  }
  return s;
};
const full = fold(events);
const through55 = fold(events.filter((e) => e.page < 56));
const through56 = fold(events.filter((e) => e.page <= 56));
const reverse = fold(events.slice().reverse());
const noBlack = fold(events.filter((e) => !(e.page === 7 && e.offset === 194 && e.kind === 0 && e.order === 0)));
const zeroBased = fold(events.map((e) => ({ ...e, e: e.kind === 0 ? 0 : mod(e.e - 1) })));
const marker13 = fold(events.map((e) => ({ ...e, e: e.kind === 0 ? 13 : e.e })));
assert.deepEqual(full, [0, 21]);

let rng = 0x38f1e1d3;
const rand = () => { rng ^= rng << 13; rng ^= rng >>> 17; rng ^= rng << 5; return rng >>> 0; };
const shuffle = (a) => {
  const out = a.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = rand() % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};
const N = 50000;
let eventHits = 0, pageHits = 0;
for (let i = 0; i < N; i++) if (fold(shuffle(events).map((e) => ({ e: e.e }))).join(',') === '0,21') eventHits++;
for (let i = 0; i < N; i++) {
  const shuffledPages = shuffle(blocks);
  if (fold(shuffledPages.flatMap((b) => b.items)).join(',') === '0,21') pageHits++;
}

const M = [[0, 23], [21, 5]];
const Minv = [[15, 18], [24, 0]];
const det = mod(M[0][0] * M[1][1] - M[0][1] * M[1][0]);
assert.equal(det, 10);
const product = [
  mod(M[0][0] * Minv[0][0] + M[0][1] * Minv[1][0]),
  mod(M[0][0] * Minv[0][1] + M[0][1] * Minv[1][1]),
  mod(M[1][0] * Minv[0][0] + M[1][1] * Minv[1][0]),
  mod(M[1][0] * Minv[0][1] + M[1][1] * Minv[1][1]),
];
assert.deepEqual(product, [1, 0, 0, 1]);

const alphabet = corpus.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
const native = [];
for (let word of (text.toUpperCase().match(/[A-Z]+/g) || [])) {
  word = word.replace(/QU/g, 'CW').replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S').replace(/ING/g, 'NG');
  const vals = [];
  for (let j = 0; j < word.length;) {
    const token = alphabet.find((x) => word.startsWith(x.s, j));
    if (!token) { vals.length = 0; break; }
    vals.push(token.i);
    j += token.s.length;
  }
  native.push(...vals);
}
const training = native.slice(22000);
const one = Array(29).fill(0), two = Array(29 * 29).fill(0), three = Array(29 * 29 * 29).fill(0);
for (let i = 0; i < training.length; i++) {
  one[training[i]]++;
  if (i >= 1) two[training[i - 1] * 29 + training[i]]++;
  if (i >= 2) three[(training[i - 2] * 29 + training[i - 1]) * 29 + training[i]]++;
}
const smooth = 0.2;
const log1 = one.map((v) => Math.log((v + smooth) / (training.length + 29 * smooth)));
const log2 = two.map((v, i) => Math.log((v + smooth) / (one[Math.floor(i / 29)] + 29 * smooth)));
const log3 = three.map((v, i) => Math.log((v + smooth) / (two[Math.floor(i / 29)] + 29 * smooth)));
const trigram = (a) => {
  let score = 0;
  for (let i = 0; i < a.length; i++) {
    if (i === 0) score += log1[a[i]];
    else if (i === 1) score += log2[a[i - 1] * 29 + a[i]];
    else score += log3[(a[i - 2] * 29 + a[i - 1]) * 29 + a[i]];
  }
  return score / a.length;
};
const ioc = (a) => {
  const c = Array(29).fill(0);
  for (const x of a) c[x]++;
  return c.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
};
const entropy = (a) => {
  const c = Array(29).fill(0);
  for (const x of a) c[x]++;
  return -c.reduce((s, n) => n ? s + (n / a.length) * Math.log2(n / a.length) : s, 0);
};
const transform = (a, m, offset) => {
  const out = a.slice();
  for (let i = offset; i + 1 < a.length; i += 2) {
    const x = a[i], y = a[i + 1];
    out[i] = mod(m[0][0] * x + m[0][1] * y);
    out[i + 1] = mod(m[1][0] * x + m[1][1] * y);
  }
  return out;
};
const cipher = corpus.pages.filter((p) => p.page < 56).flatMap((p) => p.indices);
assert.equal(cipher.length, 12956);
const candidates = [];
for (const [name, matrix] of [['multiply-21u', M], ['inverse-21u', Minv]]) {
  for (const alignment of [0, 1]) {
    const decoded = transform(cipher, matrix, alignment);
    candidates.push({
      map: name, alignment, ioc: ioc(decoded), entropy: entropy(decoded),
      trigram: trigram(decoded),
      prefix: decoded.slice(0, 72).map((x) => corpus.translit[x]).join(' '),
    });
  }
}
const plant = native.slice(3000, 3000 + cipher.length);
assert.equal(plant.length, cipher.length);
const encryptedPlant = transform(plant, Minv, 0);
const recoveredPlant = transform(encryptedPlant, M, 0);
assert.deepEqual(recoveredPlant, plant);

console.log(JSON.stringify({
  events: { total: events.length, red: 225, thirteenDot: 31, p7_194: p7.map((e) => e.color || 'rune') },
  finalState: full, normU: mod(-8),
  checkpoints: { through55, through56, full },
  variants: { reverse, omitBlackP7: noBlack, zeroBasedRed: zeroBased, markerInput13: marker13 },
  permutationNull: {
    seed: '0x38f1e1d3', samplesPerNull: N,
    allEventOrderTargetHits: eventHits, allEventRate: eventHits / N,
    pageBlockOrderTargetHits: pageHits, pageBlockRate: pageHits / N,
    uniformFieldTargetRate: 1 / 841,
  },
  hill: {
    matrix: M, inverse: Minv, determinant: det,
    raw: { ioc: ioc(cipher), entropy: entropy(cipher), trigram: trigram(cipher) },
    candidates,
    positiveControl: { exactRecovered: recoveredPlant.length, total: plant.length },
  },
}, null, 2));
