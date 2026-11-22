'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/**
 * Fixed-source 2016-image/LP2-table knight-tour candidate.
 * No plaintext is fitted, and this is a bounded negative, not an LP2 cipher.
 *
 * The source 563 x 569 JPEG yields 563 % 256 = 51 and 569 % 256 = 57.
 * On a 32 x 8 grid the step 51 -> 57 is (+1 row, -2 columns).
 * Eight clockwise tie priorities are kept separate because the images
 * do not specify a particular one. Warnsdorff min-onward-degree is a
 * historical chess heuristic, here a conjectural traversal rule.
 *
 * Inputs: canonical original physical LP2 rune pages and 32 x 8 grid.
 * Node.js 22; offline, deterministic, read-only.
 */

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const gridSource = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/base60-grid.json'), 'utf8'));
const pageData = corpus.pages.filter((p) => p.page <= 55 && p.indices.length > 0);
const allR = pageData.flatMap((p) => p.indices);
const bytes = gridSource.byte_rows.flat();
assert.equal(pageData.length, 55);
assert.equal(allR.length, 12956);
assert.equal(bytes.length, 256);
assert.equal(gridSource.rows.length, 32);
assert.equal(gridSource.rows.every((row) => row.length === 8), true);
assert.equal(563 % 256, 51);
assert.equal(569 % 256, 57);
assert.equal(bytes[51], 59);
assert.equal(bytes[57], 118);

/** @param {number} n @param {number} m @returns {number} */
function mod(n, m) { return (n % m + m) % m; }

/** Clockwise knight displacements, starting at the northwest-most direction. */
const dirs = [
  [-2, -1], [-2, 1], [-1, 2], [1, 2],
  [2, 1], [2, -1], [1, -2], [-1, -2]
];

/**
 * @param {number} rotation
 * @returns {number[]} Full source-fixed 256-cell traversal.
 */
function knightTour(rotation) {
  const out = [51, 57];
  const seen = new Set(out);
  while (out.length < 256) {
    const at = out[out.length - 1];
    const r = Math.floor(at / 8);
    const c = at % 8;
    const choices = [];
    for (let d = 0; d < 8; d++) {
      const [dr, dc] = dirs[d];
      const nr = r + dr;
      const nc = c + dc;
      const index = nr * 8 + nc;
      if (nr < 0 || nr >= 32 || nc < 0 || nc >= 8 || seen.has(index)) continue;
      let degree = 0;
      for (const [dr2, dc2] of dirs) {
        const rr = nr + dr2;
        const cc = nc + dc2;
        if (rr >= 0 && rr < 32 && cc >= 0 && cc < 8 && !seen.has(rr * 8 + cc)) degree++;
      }
      choices.push({ degree, priority: mod(d - rotation, 8), index });
    }
    assert.ok(choices.length > 0, 'Warnsdorff route terminated before visiting 256 cells');
    choices.sort((a, b) => a.degree - b.degree || a.priority - b.priority);
    const next = choices[0].index;
    out.push(next);
    seen.add(next);
  }
  assert.equal(seen.size, 256);
  assert.deepEqual(out.slice(0, 2), [51, 57]);
  return out;
}

/**
 * @param {number[]} data
 * @returns {number}
 */
function ioc(data) {
  const hist = Array(29).fill(0);
  for (const x of data) hist[x]++;
  return hist.reduce((sum, n) => sum + n * (n - 1), 0) / (data.length * (data.length - 1));
}

/**
 * @param {number[]} keyBytes
 * @param {'gp29'|'gp28sorted'|'gp28cyclic'} family
 * @param {'global'|'page'} reset
 * @param {number} sign
 * @returns {number[]}
 */
function decryptOriginal(keyBytes, family, reset, sign) {
  const out = [];
  let global = 0;
  for (const p of pageData) {
    let previous = -1;
    for (let i = 0; i < p.indices.length; i++) {
      const c = p.indices[i];
      const k = keyBytes[(reset === 'global' ? global : i) % 256];
      let plain;
      if (family === 'gp29') {
        plain = mod(c + sign * k, 29);
      } else if (i === 0) {
        plain = c;
      } else if (c === previous) {
        plain = 28;
      } else {
        const rank = family === 'gp28sorted'
          ? c - (c > previous ? 1 : 0)
          : mod(c - previous - 1, 29);
        plain = mod(rank + sign * k, 28);
      }
      out.push(plain);
      previous = c;
      global++;
    }
  }
  return out;
}

/**
 * @param {string} text
 * @returns {number[]} Native GP rune indices, including multi-character runes.
 */
function gpEncode(text) {
  const normal = text.toUpperCase()
    .replace(/QU/g, 'CW').replace(/K/g, 'C')
    .replace(/V/g, 'U').replace(/Z/g, 'S')
    .replace(/Q/g, 'C').replace(/[^A-Z]/g, '');
  const symbols = corpus.translit.map((label, index) => ({ label, index }))
    .sort((a, b) => b.label.length - a.label.length);
  const out = [];
  for (let i = 0; i < normal.length;) {
    const symbol = symbols.find((item) => normal.startsWith(item.label, i));
    assert.ok(symbol, 'Source-native GP encoding failed');
    out.push(symbol.index);
    i += symbol.label.length;
  }
  return out;
}

/** @param {number} seed @returns {() => number} */
function xorshift32(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

/**
 * A true source-key plant. The original manuscript's first rune on each page
 * is an IV in the GP28 architecture. The GP29 plant applies the separate
 * source-shaped 81% suppression of equal neighboring ciphertext at issue.
 * The receiver is NOT told the artificial ciphertext rewrite positions.
 *
 * @param {number[]} keyBytes
 * @param {number[]} sourcePlain
 * @returns {{gp29: object, gp28: object}}
 */
function positiveControls(keyBytes, sourcePlain) {
  const rnd = xorshift32(0x49ab3301);
  const decoded29 = [];
  const decoded28 = [];
  let correct29 = 0;
  let correct28 = 0;
  let rewrites29 = 0;
  let global = 0;
  for (const p of pageData) {
    let prev29 = -1;
    let prev28 = -1;
    for (let i = 0; i < p.indices.length; i++) {
      const plain = sourcePlain[global];
      const k = keyBytes[global % 256];
      let c29 = mod(plain - k, 29);
      if (i > 0 && c29 === prev29 && rnd() < 0.81) {
        c29 = mod(c29 + 1, 29);
        rewrites29++;
      }
      const p29 = mod(c29 + k, 29);
      decoded29.push(p29);
      if (p29 === plain) correct29++;
      prev29 = c29;

      let c28, p28;
      if (i === 0) {
        c28 = plain;
        p28 = c28;
      } else if (plain === 28) {
        c28 = prev28;
        p28 = 28;
      } else {
        const rank = mod(plain - k, 28);
        c28 = rank >= prev28 ? rank + 1 : rank;
        const observedRank = c28 - (c28 > prev28 ? 1 : 0);
        p28 = mod(observedRank + k, 28);
      }
      decoded28.push(p28);
      if (p28 === plain) correct28++;
      prev28 = c28;
      global++;
    }
  }
  assert.equal(correct28, allR.length);
  assert.equal(correct29, allR.length - rewrites29);
  assert.equal(rewrites29, 388);
  assert.ok(ioc(decoded29) > 0.055);
  assert.ok(ioc(decoded28) > 0.055);
  return {
    gp29: { rewrittenGlyphs: rewrites29, correctlyDecoded: correct29, ioc: ioc(decoded29) },
    gp28: { correctlyDecoded: correct28, ioc: ioc(decoded28) }
  };
}

const rows = [];
const routes = [];
for (let rotation = 0; rotation < 8; rotation++) {
  const route = knightTour(rotation);
  routes.push(route);
  const key = route.map((i) => bytes[i]);
  for (const family of ['gp29', 'gp28sorted', 'gp28cyclic']) {
    for (const reset of ['global', 'page']) {
      for (const sign of [-1, 1]) {
        const p = decryptOriginal(key, family, reset, sign);
        rows.push({
          rotation, family, reset, sign,
          train: ioc(p.slice(0, 6478)),
          hold: ioc(p.slice(6478)),
          all: ioc(p)
        });
      }
    }
  }
}
assert.equal(rows.length, 96);
const selected = [...rows].sort((a, b) => b.train - a.train)[0];
assert.deepEqual(
  [selected.rotation, selected.family, selected.reset, selected.sign],
  [6, 'gp28cyclic', 'global', 1]
);
assert.ok(Math.abs(selected.train - 0.03542208369005906) < 1e-12);
assert.ok(Math.abs(selected.hold - 0.03526850155843917) < 1e-12);
const maxHold = Math.max(...rows.map((row) => row.hold));
assert.ok(Math.abs(maxHold - 0.03534858162706779) < 1e-12);
assert.ok(Math.abs(ioc(allR) - 0.03447839786450569) < 1e-12);

const source = fs.readFileSync(path.join(root, 'resources/control/shakespeare_first300k.txt'), 'utf8');
const plantPlain = gpEncode(source).slice(0, allR.length);
assert.equal(plantPlain.length, allR.length);
const controls = positiveControls(routes[0].map((i) => bytes[i]), plantPlain);

const sixApart = Array.from({ length: 250 }, (_, i) => i)
  .filter((i) => {
    const rowDiff = Math.floor((i + 6) / 8) - Math.floor(i / 8);
    const colDiff = ((i + 6) % 8) - (i % 8);
    return dirs.some(([dr, dc]) => dr === rowDiff && dc === colDiff);
  }).length;
assert.equal(sixApart, 186); // 74.4% of all such six-step pairs are knight moves.

console.log(JSON.stringify({
  pageCount: pageData.length,
  originalRuneCount: allR.length,
  tableLength: bytes.length,
  startCells: [51, 57],
  startValues: [bytes[51], bytes[57]],
  knightWalks: routes.map((r) => r.length),
  sixApartKnightPairs: sixApart,
  sixApartTotalPairs: 250,
  originalIoC: ioc(allR),
  testedModels: rows.length,
  trainingSelected: selected,
  bestHoldInAll96Postselected: maxHold,
  syntheticOriginalLengthControls: controls
}, null, 2));
