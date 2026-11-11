'use strict';

/**
 * Historical Cicada 2014 seven-column transposition followed by authentic
 * Cicada LP2 solved-page prime-totient cipher. Clue-constrained original test.
 * SFT: node sims/historical_period7_totient_p33_39_sft.cjs
 *
 * Native English reference: independently archived Shakespeare sample.
 * No key recovery, unmotivated phase search, or ciphertext fitting.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const reference = fs.readFileSync(path.join(root, 'resources/control/shakespeare_first300k.txt'), 'utf8');
const pages = corpus.pages.filter(p => p.page >= 33 && p.page <= 39).map(p => p.indices);
assert.equal(pages.length, 7);
const illustratedPages = [pages[0].slice(91), ...pages.slice(1)];
const allPages = pages.flat();
const illustrated = illustratedPages.flat();
assert.equal(allPages.length, 1680);
assert.equal(illustrated.length, 1589);
const order = [0, 6, 2, 5, 1, 4, 3];
const inverseOrder = order.map((_, i) => order.indexOf(i));

/** @param {number[]} input @param {number[]} columnOrder @returns {number[]} */
function columnRead(input, columnOrder) {
  const c = Array.from({length: 7}, () => []);
  input.forEach((v, i) => c[i % 7].push(v));
  return columnOrder.flatMap(k => c[k]);
}

/** @param {number[]} input @param {number[]} columnOrder @returns {number[]} */
function columnInverse(input, columnOrder) {
  const c = new Array(7);
  let ptr = 0;
  for (const k of columnOrder) {
    const n = Math.floor(input.length / 7) + Number(k < input.length % 7);
    c[k] = input.slice(ptr, ptr + n);
    ptr += n;
  }
  assert.equal(ptr, input.length);
  const result = [];
  for (let i = 0; i < Math.ceil(input.length / 7); i++)
    for (let j = 0; j < 7; j++)
      if (i < c[j].length) result.push(c[j][i]);
  return result;
}

/** @param {number} n @returns {number[]} */
function primes(n) {
  const p = [];
  for (let x = 2; p.length < n; x++) {
    let valid = true;
    for (let y = 2; y * y <= x; y++) {
      if (x % y === 0) { valid = false; break; }
    }
    if (valid) p.push(x);
  }
  return p;
}
const primeList = primes(2000);

/**
 * A literal unencrypted F survives as F and does not advance prime clock.
 * @param {number[]} input
 * @param {-1|1} sign
 * @param {boolean} literalF
 * @returns {number[]}
 */
function shift(input, sign, literalF) {
  let clock = 0;
  return input.map(c => {
    if (literalF && c === 0) return 0;
    const k = primeList[clock++] - 1;
    return ((c + sign * k) % 29 + 29) % 29;
  });
}

/** @param {string} source @returns {number[]} */
function transliterate(source) {
  const entries = corpus.translit.map((label, symbol) => ({label, symbol}))
    .sort((a, b) => b.label.length - a.label.length);
  const words = source.toUpperCase().replace(/V/g, 'U').replace(/K/g, 'C')
    .replace(/Q/g, 'CW').replace(/Z/g, 'S').match(/[A-Z]+/g) || [];
  const output = [];
  for (const word of words) {
    for (let i = 0; i < word.length;) {
      const found = entries.find(x => word.startsWith(x.label, i));
      if (found) {output.push(found.symbol); i += found.label.length;}
      else i++;
    }
  }
  return output;
}
const native = transliterate(reference);
assert.ok(native.length >= 100000);
const pivot = Math.floor(native.length * .7);
const train = native.slice(0, pivot);
const heldout = native.slice(pivot);
const counts = new Float64Array(29 * 29).fill(1);
for (let i = 1; i < train.length; i++) counts[train[i-1] * 29 + train[i]]++;
const totals = Array.from({length:29}, (_, i) =>
  counts.subarray(i * 29, (i + 1) * 29).reduce((a, b) => a + b, 0));
/** @param {number[]} a @returns {{ioc:number,bigramLL:number,repeats:number}} */
function measure(a) {
  const histogram = new Array(29).fill(0);
  let ll = 0, repeats = 0;
  a.forEach((c, i) => {
    histogram[c]++;
    if (i > 0) {
      repeats += Number(c === a[i-1]);
      ll += Math.log(counts[a[i-1] * 29 + c] / totals[a[i-1]]);
    }
  });
  const n = a.length;
  return {ioc:histogram.reduce((s, c) => s + c * (c - 1), 0) / (n * (n - 1)),
    bigramLL:ll / (n - 1), repeats};
}

const report = [];
for (const [scope, pieces] of [['illustrated', illustratedPages], ['whole_seven_pages', pages]]) {
  const aggregate = pieces.flat();
  const layouts = [['continuous', [aggregate]], ['page_local', pieces]];
  for (const [reset, blocks] of layouts)
  for (const [orderName, key] of [['historical_1736254', order], ['inverse_key_convention', inverseOrder], ['no_transposition', null]])
  for (const placement of ['trans_then_phi', 'phi_then_trans'])
  for (const sign of /** @type {const} */([-1, 1]))
  for (const literalF of [false, true]) {
    const plaintext = blocks.map(block => {
      if (!key) return shift(block, sign, literalF);
      return placement === 'trans_then_phi'
        ? shift(columnInverse(block, key), sign, literalF)
        : columnInverse(shift(block, sign, literalF), key);
    }).flat();
    report.push({scope,reset,order:orderName,placement,sign,literalF,...measure(plaintext)});
  }
}
const seedPlain = heldout.slice(0, 1589);
const seedCipher = columnRead(shift(seedPlain, 1, false), order);
assert.deepEqual(shift(columnInverse(seedCipher, order), -1, false), seedPlain);
assert.ok(report.every(x => x.ioc < .036), 'A native-like ioc requires inspection');
assert.ok(report.every(x => x.bigramLL < -4.5), 'A native-like language score requires inspection');
const bestIoc = [...report].sort((a,b) => b.ioc - a.ioc).slice(0,4);
const bestLanguage = [...report].sort((a,b) => b.bigramLL - a.bigramLL).slice(0,4);
console.log(JSON.stringify({
  source:'original LP2 pp33-39; archival Cicada 2014 period-seven key and authentic LP2 p56 phi-prime cipher',
  native:measure(heldout),
  original:measure(illustrated),
  configurations:report.length,
  bestIoc,bestLanguage,
  originalScopeIocCeiling:Math.max(...report.map(x=>x.ioc)),
  originalScopeLLCeiling:Math.max(...report.map(x=>x.bigramLL)),
  positivePlant:{length:seedPlain.length,exactlyRecovered:true},
  interpretation:'no original GP-English-like plaintext',
},null,2));
