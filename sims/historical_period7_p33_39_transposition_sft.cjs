'use strict';

/**
 * Source-constrained historical Cicada 3301 seven-column transposition gate.
 *
 * Historical key 1736254: scream314/cicada3301 2014.md line 439,
 * original LP1 image08 OutGuess cipher. Two key conventions are retained
 * because the archive states the numeric key without defining which
 * column-direction convention should transfer to LP2.
 *
 * Run from any directory with Node.js 22:
 *   node sims/historical_period7_p33_39_transposition_sft.cjs
 *
 * Read-only SFT. No external modules or network.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8',
));
const pages = corpus.pages.filter((p) => p.page >= 33 && p.page <= 39)
  .map((p) => p.indices);
assert.equal(pages.length, 7);

const historicOrder = [0, 6, 2, 5, 1, 4, 3];
const rankOrder = historicOrder.map((_, i) => historicOrder.indexOf(i));
const full = pages.flat();
const illustratedPages = [pages[0].slice(91), ...pages.slice(1)];
const illustrated = illustratedPages.flat();
assert.equal(full.length, 1680);
assert.equal(illustrated.length, 1589);
assert.equal(pages[0].length - illustratedPages[0].length, 91);

/**
 * @param {number[]} clear
 * @param {number[]} order
 * @returns {number[]}
 */
function encipher(clear, order) {
  const cols = Array.from({ length: 7 }, () => []);
  clear.forEach((v, i) => cols[i % 7].push(v));
  return order.flatMap((i) => cols[i]);
}

/**
 * @param {number[]} crypt
 * @param {number[]} order
 * @returns {number[]}
 */
function decipher(crypt, order) {
  const cols = new Array(7);
  let offset = 0;
  for (const i of order) {
    const length = Math.floor(crypt.length / 7) + Number(i < crypt.length % 7);
    cols[i] = crypt.slice(offset, offset + length);
    offset += length;
  }
  assert.equal(offset, crypt.length);
  const clear = [];
  for (let r = 0; r < Math.ceil(crypt.length / 7); r++) {
    for (let c = 0; c < 7; c++) {
      if (r < cols[c].length) clear.push(cols[c][r]);
    }
  }
  return clear;
}

/**
 * @param {number[][]} ragged
 * @param {number[]} order
 * @returns {number[]}
 */
function interleave(ragged, order) {
  const out = [];
  const longest = Math.max(...ragged.map((r) => r.length));
  for (let r = 0; r < longest; r++) {
    for (const c of order) {
      if (r < ragged[c].length) out.push(ragged[c][r]);
    }
  }
  return out;
}

/**
 * @param {number[]} symbols
 * @returns {{runes:number,adjacentEqual:number,lagSixAffineMatches:number,ioc:number}}
 */
function measure(symbols) {
  const hist = new Array(29).fill(0);
  let repeat = 0;
  let lagSix = 0;
  for (let i = 0; i < symbols.length; i++) {
    const v = symbols[i];
    hist[v]++;
    if (i > 0 && v === symbols[i - 1]) repeat++;
    if (i >= 6 && v === (24 - 2 * symbols[i - 6] + 58) % 29) lagSix++;
  }
  const n = symbols.length;
  return {
    runes: n,
    adjacentEqual: repeat,
    lagSixAffineMatches: lagSix,
    ioc: hist.reduce((s, count) => s + count * (count - 1), 0) / (n * (n - 1)),
  };
}

/** @returns {number} */
function nextSeed() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
let seed = 0x33012014;
/** @param {number} length @returns {number[]} */
function nonrepeatingPlant(length) {
  const out = [nextSeed() % 29];
  for (let i = 1; i < length; i++) {
    const d = nextSeed() % 28;
    out.push(d + Number(d >= out[i - 1]));
  }
  return out;
}

const planted = nonrepeatingPlant(illustrated.length);
const encoded = encipher(planted, historicOrder);
assert.deepEqual(decipher(encoded, historicOrder), planted);
assert.equal(measure(planted).adjacentEqual, 0);
const modes = {};
for (const [name, original, pieces] of [
  ['whole_1680', full, [full]],
  ['illustrated_1589', illustrated, [illustrated]],
  ['per_physical_page', full, pages],
]) {
  modes[name] = {
    original: name === 'per_physical_page' ? {
      runes: full.length,
      adjacentEqual: pieces.reduce((s, p) => s + measure(p).adjacentEqual, 0),
      lagSixAffineMatches: pieces.reduce((s, p) => s + measure(p).lagSixAffineMatches, 0),
      ioc: measure(full).ioc,
    } : measure(original),
    historic_key: {},
  };
  for (const [keyName, key] of [['column_order', historicOrder], ['rank_order', rankOrder]]) {
    const parts = pieces.map((p) => decipher(p, key));
    const merged = parts.flat();
    const m = measure(merged);
    if (pieces.length > 1) {
      m.adjacentEqual = parts.reduce((s, p) => s + measure(p).adjacentEqual, 0);
      m.lagSixAffineMatches = parts.reduce((s, p) => s + measure(p).lagSixAffineMatches, 0);
    }
    modes[name].historic_key[keyName] = m;
  }
}
modes.illustrated_page_interleave = {
  column_order: measure(interleave(illustratedPages, historicOrder)),
  rank_order: measure(interleave(illustratedPages, rankOrder)),
};
modes.planted_positive_control = {
  source: measure(planted),
  column_transposed: measure(encoded),
  recovered: measure(decipher(encoded, historicOrder)),
  exactRecovery: true,
};
assert.equal(modes.whole_1680.original.adjacentEqual, 12);
assert.equal(modes.illustrated_1589.original.adjacentEqual, 12);
assert.equal(modes.illustrated_1589.historic_key.column_order.adjacentEqual, 53);
assert.equal(modes.illustrated_1589.historic_key.rank_order.adjacentEqual, 52);
assert.equal(modes.whole_1680.historic_key.column_order.adjacentEqual, 69);
assert.equal(modes.whole_1680.historic_key.rank_order.adjacentEqual, 71);
assert.equal(modes.per_physical_page.historic_key.column_order.adjacentEqual, 59);
assert.equal(modes.per_physical_page.historic_key.rank_order.adjacentEqual, 61);
console.log(JSON.stringify({
  source: 'LP2 original p33-p39 runes, physical-page zero-based',
  historicalKey: '1736254',
  modes,
}, null, 2));
