'use strict';

/**
 * ABAAB original-floral preceding-A self-key gate.
 * Candidate only: the 2016 participant's ABAAB color address is source-dated,
 * whereas subtraction/addition of adjacent GP29 runes is an analyst hypothesis.
 * Full original p40-p55 plus a disjoint p40-p48 opening are tested without fitted
 * phase, key or plaintext word boundaries. Node 22, CommonJS, no file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} file @returns {string} */
function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const N = 29;
const E = 18;
assert.equal(corpus.translit[E], 'E');

/** @param {number} x @returns {number} */
function mod(x) { return (x % N + N) % N; }

/**
 * Fixed physical page source and address rule.
 * An ABAAB B slot (1 or 4 mod 5) takes the immediately preceding A slot as key.
 * At physical page starts, the continuous clock may use the preceding page's
 * last original rune; the page-reset clock uses local indices only.
 * @param {number} finalPage
 * @param {boolean} pageReset
 * @returns {{original:number[],pairs:Array<{data:number,key:number}>}}
 */
function select(finalPage, pageReset) {
  const pages = corpus.pages.filter(p => p.page >= 40 && p.page <= finalPage);
  const original = [];
  const pairs = [];
  for (const page of pages) {
    for (let i = 0; i < page.indices.length; i++) {
      const pos = original.length;
      const phase = (pageReset ? i : pos) % 5;
      if (phase === 1 || phase === 4) {
        const prev = pos - 1;
        assert(prev >= 0);
        if (pageReset) assert(i > 0);
        // A slot has phase 0 or 3, so no encrypted B is ever used as a key.
        const prevPhase = (pageReset ? i - 1 : prev) % 5;
        assert(prevPhase === 0 || prevPhase === 3);
        pairs.push({data: pos, key: prev});
      }
      original.push(page.indices[i]);
    }
  }
  const expectedLength = finalPage === 48 ? 2408 : 3316;
  assert.equal(original.length, expectedLength);
  assert.equal(pairs.length,
    finalPage === 48 ? (pageReset ? 961 : 963) : (pageReset ? 1323 : 1326));
  return {original, pairs};
}

/** @param {number[]} values */
function stats(values) {
  const bins = Array(N).fill(0);
  for (const x of values) {
    assert(Number.isInteger(x) && x >= 0 && x < N);
    bins[x]++;
  }
  return {
    n: values.length,
    E: bins[E],
    F: bins[0],
    ic: bins.reduce((n, x) => n + x * (x - 1), 0) /
      (values.length * (values.length - 1)),
    first40: values.slice(0, 40).map(v => corpus.translit[v]).join(' ')
  };
}

const digraph = {TH:2, NG:21, EO:12, OE:22, AE:25, IA:27, EA:28};
const latin = {A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,
  J:11,K:5,L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,
  U:1,V:1,W:7,X:14,Y:26,Z:15};
/** @param {string} raw @returns {number[]} */
function gp(raw) {
  const input = raw.toUpperCase().replace(/[^A-Z]/g, '');
  const out = [];
  for (let i = 0; i < input.length; i++) {
    const candidate = digraph[input.slice(i, i + 2)];
    if (candidate !== undefined) { out.push(candidate); i++; }
    else out.push(latin[input[i]]);
  }
  return out;
}

/** @param {number[]} input @param {number} width */
function minE(input, width) {
  assert(input.length >= width);
  let count = 0;
  for (let j = 0; j < width; j++) count += Number(input[j] === E);
  let min = count;
  for (let j = width; j < input.length; j++) {
    count += Number(input[j] === E) - Number(input[j - width] === E);
    min = Math.min(min, count);
  }
  return min;
}
const references = [
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
  ['Gibran', 'resources/control/gibran_prophet_58585.txt']
].map(([name, file]) => ({name, indices: gp(read(file))}));

/**
 * @param {number[]} cipher
 * @param {Array<{data:number,key:number}>} pairs
 * @param {number} sign
 * @returns {number[]}
 */
function decode(cipher, pairs, sign) {
  return pairs.map(({data, key}) => mod(cipher[data] + sign * cipher[key]));
}

/**
 * @param {number[]} cipher
 * @param {Array<{data:number,key:number}>} pairs
 * @param {number[]} plain
 * @param {number} sign
 */
function encode(cipher, pairs, plain, sign) {
  assert.equal(pairs.length, plain.length);
  const output = cipher.slice();
  for (let i = 0; i < pairs.length; i++) {
    const {data, key} = pairs[i];
    output[data] = mod(plain[i] - sign * output[key]);
  }
  return output;
}

const result = {};
for (const finalPage of [48, 55]) {
  for (const pageReset of [true, false]) {
    const {original, pairs} = select(finalPage, pageReset);
    const model = {};
    for (const sign of [-1, 1]) {
      const decoded = decode(original, pairs, sign);
      const s = stats(decoded);
      assert.deepEqual(encode(original, pairs, decoded, sign), original);
      const bounds = references.map(ref =>
        ({name:ref.name, minimumE:minE(ref.indices, decoded.length)}));
      for (const {minimumE} of bounds) assert(s.E < minimumE);

      // Plant a genuine GP-native control at every B site, with all A-site
      // keys held to the original unaltered source. Exact recovery is tested
      // across every original physical page transition.
      const plant = references[0].indices.slice(0, decoded.length);
      const synthetic = encode(original, pairs, plant, sign);
      assert.deepEqual(decode(synthetic, pairs, sign), plant);
      const originalKeys = new Set(pairs.map(x => x.key));
      for (const {data} of pairs) assert(!originalKeys.has(data));
      model[sign === -1 ? 'subtract' : 'add'] = {
        original:s, sourceNativeEWindowBounds:bounds,
        plantRecovered:plant.length
      };
    }
    result['p40_' + finalPage + (pageReset ? '_page' : '_continuous')] = model;
  }
}
assert.equal(result.p40_55_page.subtract.original.E, 59);
assert.equal(result.p40_55_page.add.original.E, 48);
assert.equal(result.p40_55_continuous.subtract.original.E, 59);
assert.equal(result.p40_55_continuous.add.original.E, 41);
console.log(JSON.stringify({
  status:'PASS',
  hypothesis:'ABAAB B slots GP29 plus/minus preceding A slot',
  scopes:'p40-p48 and p40-p55; per-page and continuous clocks',
  originalSource:'resources/liber-primus/lp2-corpus.json',
  result,
  verdict:'No source-native GP29 English detected; the chosen self-key opcode is not creator-authenticated.'
}, null, 2));
