'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const json = p => JSON.parse(read(p));
const P = 29;
const mod = x => (x % P + P) % P;
const mod56 = x => (x % 56 + 56) % 56;

const add = (x, y) => [mod(x[0] + y[0]), mod(x[1] + y[1])];
const sub = (x, y) => [mod(x[0] - y[0]), mod(x[1] - y[1])];
const mul = (x, y) => {
  const [a, b] = x, [c, d] = y;
  return [mod(a * c + 8 * b * d), mod(a * d + b * c + 3 * b * d)];
};
const pow = (x, n) => {
  let z = [1, 0];
  while (n) {
    if (n % 2) z = mul(z, x);
    x = mul(x, x);
    n = Math.floor(n / 2);
  }
  return z;
};
const inv = x => pow(x, 839);
const trace = x => mod(2 * x[0] + 3 * x[1]);
const norm = x => mod(x[0] * x[0] + 3 * x[0] * x[1] + 21 * x[1] * x[1]);
const powMod = (a, n, m) => {
  let z = 1;
  while (n) {
    if (n % 2) z = (z * a) % m;
    a = (a * a) % m;
    n = Math.floor(n / 2);
  }
  return z;
};

const corpus = json('resources/liber-primus/lp2-corpus.json');
const ink = json('resources/liber-primus/lp2-ink-annotations.json');
const grid = json('resources/liber-primus/base60-grid.json');
const pages = corpus.pages.filter(p => p.page <= 55).sort((a, b) => a.page - b.page);
const cipher = pages.flatMap(p => p.indices);
assert.equal(pages.length, 56);
assert.equal(pages.filter(p => p.indices.length).length, 55);
assert.equal(cipher.length, 12956);
assert.equal(pages.find(p => p.page === 54).indices[0], 24);

const redTriad = page => ink.pages.find(p => p.page === page).red_spans
  .filter(s => s.length === 3)
  .map(s => Array.from(s.runes, r => corpus.runes.indexOf(r)));
assert.deepEqual(redTriad(3), [[13, 23, 2]]);
assert.deepEqual(redTriad(39), [[27, 5, 15]]);

// p3: 13 + 23u + 2u^2 = 0, hence u^2 = 8 + 3u.
const u = [0, 1];
assert.deepEqual(pow(u, 2), [8, 3]);
assert.deepEqual([mod(13 + 2 * 8), mod(23 + 2 * 3)], [0, 0]);
assert.deepEqual(pow(u, 840), [1, 0]);
for (const d of [420, 280, 168, 120]) assert.notDeepEqual(pow(u, d), [1, 0]);

// p39: 27 + 5X + 15X^2 = 15(X - 24)^2 over F_29.
assert.deepEqual([mod(15 * 24 * 24), mod(-2 * 15 * 24), 15], [27, 5, 15]);

// The authenticated 2013 DH example uses p=23, g=5, server exponent 6,
// server public share 8, client exponent 15, client share 19, shared secret 2.
assert.equal(powMod(5, 6, 23), 8);
assert.equal(powMod(5, 15, 23), 19);
assert.equal(powMod(19, 6, 23), 2);
assert.equal(powMod(8, 15, 23), 2);

// Extrapolate the DH client exponent 15 to the p3 field generator.
// g=u^15 has exact order 56; p54's first rune fixes S_54=24.
const g56 = pow(u, 15);
assert.deepEqual(g56, [9, 23]);
assert.deepEqual(pow(g56, 56), [1, 0]);
assert.deepEqual(pow(g56, 28), [28, 0]);
assert.notDeepEqual(pow(g56, 8), [1, 0]);
const states = Array.from({ length: 56 }, (_, page) =>
  mul([24, 0], pow(g56, mod56(page - 54))));
assert.deepEqual(states[54], [24, 0]);

// Original-source 51 x 127 pair framing: retain the first two runes,
// then pair the remaining 12,954 globally. A crossing pair uses the
// physical page of its first rune as its page-key selector.
const pairs = [];
let pending = null, globalRune = 0;
for (const page of pages) {
  for (const value of page.indices) {
    if (globalRune < 2) {
      globalRune++;
      continue;
    }
    if (pending === null) pending = { value, page: page.page };
    else {
      pairs.push({ value: [pending.value, value], page: pending.page,
        secondPage: page.page });
      pending = null;
    }
    globalRune++;
  }
}
assert.equal(globalRune, 12956);
assert.equal(pending, null);
assert.equal(pairs.length, 6477);
const crossPagePairs = pairs.filter(p => p.page !== p.secondPage).length;
assert.equal(crossPagePairs, 54);

const counts = new Uint32Array(26 ** 4);
let quadgramTotal = 0;
for (const line of read('resources/control/duko_round27_english_quadgrams.txt').trim().split(/\r?\n/)) {
  const m = line.trim().match(/^([A-Z]{4})\s+(\d+)$/);
  if (!m) continue;
  const q = m[1], n = Number(m[2]);
  const ix = (((q.charCodeAt(0) - 65) * 26 + q.charCodeAt(1) - 65) * 26
    + q.charCodeAt(2) - 65) * 26 + q.charCodeAt(3) - 65;
  counts[ix] = n;
  quadgramTotal += n;
}
assert.equal(quadgramTotal, 7266795);
assert.equal(counts.reduce((n, x) => n + (x > 0 ? 1 : 0), 0), 79495);
const logs = new Float64Array(26 ** 4);
const present = new Uint8Array(26 ** 4);
logs.fill(Math.log(0.01 / quadgramTotal));
for (let i = 0; i < counts.length; i++) {
  if (counts[i]) {
    logs[i] = Math.log(counts[i] / quadgramTotal);
    present[i] = 1;
  }
}
const letters = corpus.translit.map(s => Array.from(s, ch => ch.charCodeAt(0) - 65));
function score(ids) {
  let sum = 0, missing = 0, n = 0, a = 0, b = 0, c = 0, filled = 0;
  for (const rune of ids) {
    for (const ch of letters[rune]) {
      n++;
      if (filled === 0) { a = ch; filled++; continue; }
      if (filled === 1) { b = ch; filled++; continue; }
      if (filled === 2) { c = ch; filled++; continue; }
      const ix = (((a * 26 + b) * 26 + c) * 26) + ch;
      sum += logs[ix];
      if (!present[ix]) missing++;
      a = b; b = c; c = ch;
    }
  }
  return { scorePerLetter: sum / Math.max(1, n - 3), missingQuadgrams: missing, letters: n };
}
function ioc(ids) {
  const h = new Uint32Array(29);
  for (const x of ids) h[x]++;
  return h.reduce((s, n) => s + n * (n - 1), 0) / (ids.length * (ids.length - 1));
}
const preview = ids => ids.slice(0, 120).map(i => corpus.translit[i]).join('').slice(0, 180);

function decodePageScalar(projection, operation, sign) {
  const out = [];
  for (const page of pages) {
    const k = projection === 'trace' ? trace(states[page.page]) : norm(states[page.page]);
    for (const x of page.indices) {
      if (operation === 'add') out.push(mod(x + sign * k));
      else if (operation === 'divide') out.push(mod(x * inv([k, 0])[0]));
      else if (operation === 'multiply') out.push(mod(x * k));
    }
  }
  return out;
}
function decodePairs(operation, sign) {
  const out = cipher.slice(0, 2);
  for (const pair of pairs) {
    const s = states[pair.page];
    let p;
    if (operation === 'add') p = sign < 0 ? sub(pair.value, s) : add(pair.value, s);
    else if (operation === 'divide') p = mul(pair.value, inv(s));
    else if (operation === 'multiply') p = mul(pair.value, s);
    out.push(...p);
  }
  return out;
}

const rawScore = score(cipher);
const dhResults = [];
for (const projection of ['trace', 'norm']) {
  for (const sign of [-1, 1]) {
    const out = decodePageScalar(projection, 'add', sign);
    dhResults.push({ family: 'page-scalar-add', projection, sign,
      ...score(out), ioc: ioc(out), preview: preview(out) });
  }
}
for (const operation of ['divide', 'multiply']) {
  const out = decodePageScalar('norm', operation, 0);
  dhResults.push({ family: 'page-scalar-norm', operation,
    ...score(out), ioc: ioc(out), preview: preview(out) });
}
for (const sign of [-1, 1]) {
  const out = decodePairs('add', sign);
  dhResults.push({ family: 'pair-field-add', sign,
    ...score(out), ioc: ioc(out), preview: preview(out) });
}
for (const operation of ['divide', 'multiply']) {
  const out = decodePairs(operation, 0);
  dhResults.push({ family: 'pair-field-multiplication', operation,
    ...score(out), ioc: ioc(out), preview: preview(out) });
}

// Positive controls: each source-fixed transformation must invert a planted
// message under the exact same state, page clock, pair alignment and key.
const plant = Uint8Array.from({ length: cipher.length }, (_, i) => mod(37 * i + 11));
for (const projection of ['trace', 'norm']) {
  const key = states.map(s => projection === 'trace' ? trace(s) : norm(s));
  const enc = new Array(cipher.length);
  let pos = 0;
  for (const page of pages) {
    for (let j = 0; j < page.indices.length; j++) {
      const k = key[page.page];
      enc[pos] = mod(plant[pos] + k);
      pos++;
    }
  }
  const dec = [];
  pos = 0;
  for (const page of pages) {
    for (let j = 0; j < page.indices.length; j++) {
      dec.push(mod(enc[pos++] - key[page.page]));
    }
  }
  assert.deepEqual(dec, Array.from(plant));
}
const normKeys = states.map(norm);
assert.ok(normKeys.every(k => k !== 0));
for (const operation of ['divide', 'multiply']) {
  const enc = [], dec = [];
  let pos = 0;
  for (const page of pages) for (let j = 0; j < page.indices.length; j++) {
    const k = normKeys[page.page];
    enc.push(operation === 'divide' ? mod(plant[pos] * inv([k, 0])[0]) : mod(plant[pos] * k));
    pos++;
  }
  pos = 0;
  for (const page of pages) for (let j = 0; j < page.indices.length; j++) {
    const k = normKeys[page.page];
    dec.push(operation === 'divide' ? mod(enc[pos++] * k) : mod(enc[pos++] * inv([k, 0])[0]));
  }
  assert.deepEqual(dec, Array.from(plant));
}
for (const operation of ['add', 'divide', 'multiply']) {
  const enc = cipher.slice(0, 2), dec = cipher.slice(0, 2);
  for (let i = 0; i < pairs.length; i++) {
    const pair = [plant[2 + 2 * i], plant[3 + 2 * i]];
    const s = states[pairs[i].page];
    const c = operation === 'add' ? add(pair, s)
      : operation === 'divide' ? mul(pair, inv(s)) : mul(pair, s);
    const p = operation === 'add' ? sub(c, s)
      : operation === 'divide' ? mul(c, s) : mul(c, inv(s));
    enc.push(...c); dec.push(...p);
  }
  assert.deepEqual(dec.slice(2), Array.from(plant.slice(2)));
  assert.equal(enc.length, cipher.length);
}

// The p50 32 x 8 base-60 table is a source-fixed 256-byte stream.
// Test two direct compositions with the solved p56 prime-minus-one clock.
const alphabet = grid.alphabet;
const bytes = grid.rows.flat().map(t => 60 * alphabet.indexOf(t[0]) + alphabet.indexOf(t[1]));
assert.equal(bytes.length, 256);
assert.ok(bytes.every(b => b >= 0 && b <= 255));
function firstPrimes(n) {
  const ps = [];
  for (let x = 2; ps.length < n; x++) {
    let prime = true;
    for (const p of ps) {
      if (p * p > x) break;
      if (x % p === 0) { prime = false; break; }
    }
    if (prime) ps.push(x);
  }
  return ps;
}
const maxPrimeIndex = Math.max(...bytes.map((b, j) => Math.max(b, j + b)));
const primes = firstPrimes(maxPrimeIndex + 1);
const p50Keys = {
  fixedIndex: bytes.map(b => mod(primes[b] - 1)),
  positionOffset: bytes.map((b, j) => mod(primes[j + b] - 1))
};
const p50Results = [];
for (const [name, key] of Object.entries(p50Keys)) {
  for (const sign of [-1, 1]) {
    const out = cipher.map((x, i) => mod(x + sign * key[i % 256]));
    p50Results.push({ family: 'p50-prime-index', schedule: name, sign,
      ...score(out), ioc: ioc(out), preview: preview(out) });
    const planted = Uint8Array.from({ length: cipher.length }, (_, i) => mod(19 * i + 7));
    const encoded = planted.map((x, i) => mod(x - sign * key[i % 256]));
    const recovered = encoded.map((x, i) => mod(x + sign * key[i % 256]));
    assert.deepEqual(Array.from(recovered), Array.from(planted));
  }
}

console.log(JSON.stringify({
  source: {
    pages: pages.length,
    runeBearingPages: pages.filter(p => p.indices.length).length,
    runes: cipher.length,
    p54FirstRune: pages.find(p => p.page === 54).indices[0],
    p3RedTriad: redTriad(3)[0],
    p39RedTriad: redTriad(39)[0],
    dh2013: { p: 23, g: 5, serverExponent: 6, serverShare: 8,
      clientExponent: 15, clientShare: 19, sharedSecret: 2 },
    u: [0, 1],
    uSquared: pow(u, 2),
    uOrder: 840,
    u15: g56,
    u15Order: 56,
    stateAtP54: states[54],
    pairCount: pairs.length,
    crossPagePairs,
    p50Bytes: bytes.length,
    p50ByteMin: Math.min(...bytes),
    p50ByteMax: Math.max(...bytes)
  },
  control: { quadgramEntries: present.reduce((n, x) => n + x, 0), quadgramTotal },
  raw: { ...rawScore, ioc: ioc(cipher) },
  dh15Order56: dhResults,
  p50PrimeIndex: p50Results
}, null, 2));
