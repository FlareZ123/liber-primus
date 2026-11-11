'use strict';
/**
 * Source-constrained matrix readings of the 2013 Cicada OS wisdom/folly
 * binary against original LP2. Tests only exact 58^2 and 4*29^2
 * factorizations, natural row/column orders, byte reductions, and
 * reversible additive/Hill operations. No key or plaintext is claimed.
 * Run: node sims/cicada2013_wisdom_folly_matrix_gate.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const source = Buffer.from(read('resources/historical/cicada2013-wisdom-folly.b64').replace(/\s/g, ''), 'base64');
assert.equal(source.length, 3368);
assert.equal(crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob ' + source.length + '\0'), source])).digest('hex'), '62b1b949a1e4e4a346e75b1c34101000d3c53220');
assert.equal(crypto.createHash('sha256').update(source).digest('hex'), '7e5ec097728197f5c0dba0729980565658fba486965809ffa25e3910a31c385a');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.filter(p => p.status === 'unsolved');
const cipher = pages.flatMap(p => p.indices);
assert.equal(pages.length, 55);
assert.equal(cipher.length, 12956);
assert.equal(cipher.length % 58, 22);
assert.equal(cipher.length % 29, 22);
const mod = (x, n) => ((x % n) + n) % n;
const reduceByte = (b, kind) => kind === 'mod29' ? b % 29 : Math.floor(b * 29 / 256);
function ioc(xs) {
  const counts = Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}
function matrixFromBytes(bytes, offset, n, reduction, layout) {
  return Array.from({length: n}, (_, i) => Array.from({length: n}, (_, j) =>
    reduceByte(layout === 'row' ? bytes[offset + i * n + j] : bytes[offset + j * n + i], reduction)));
}
function scalarInverse(a) {
  for (let x = 1; x < 29; x++) if ((a * x) % 29 === 1) return x;
  throw new Error('non-invertible GF(29) scalar');
}
function invertMatrix(A) {
  const n = A.length;
  const M = A.map((row, i) => row.concat(Array.from({length: n}, (_, j) => i === j ? 1 : 0)));
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && M[pivot][col] === 0) pivot++;
    if (pivot === n) return null;
    [M[col], M[pivot]] = [M[pivot], M[col]];
    const scale = scalarInverse(M[col][col]);
    for (let j = 0; j < 2 * n; j++) M[col][j] = mod(M[col][j] * scale, 29);
    for (let i = 0; i < n; i++) if (i !== col) {
      const factor = M[i][col];
      if (factor) for (let j = 0; j < 2 * n; j++) M[i][j] = mod(M[i][j] - factor * M[col][j], 29);
    }
  }
  return M.map(row => row.slice(n));
}
function multiplyMatrices(A, B) {
  const n = A.length, C = Array.from({length: n}, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) for (let k = 0; k < n; k++) if (A[i][k])
    for (let j = 0; j < n; j++) C[i][j] = (C[i][j] + A[i][k] * B[k][j]) % 29;
  return C;
}
function applyMatrix(M, block) {
  assert.equal(block.length, M.length);
  return M.map(row => mod(row.reduce((s, x, j) => s + x * block[j], 0), 29));
}
function applyCompleteBlocks(M, xs) {
  const n = M.length, out = [];
  for (let p = 0; p + n <= xs.length; p += n) out.push(...applyMatrix(M, xs.slice(p, p + n)));
  return out;
}
function addPageKey(inputPages, offset, layout, reduction, sign) {
  const matrix = source.subarray(offset, offset + 58 * 58);
  return inputPages.map(page => page.indices.map((x, i) => {
    const pos = i % 58;
    const b = layout === 'row' ? matrix[page.page * 58 + pos] : matrix[pos * 58 + page.page];
    return mod(x + sign * reduceByte(b, reduction), 29);
  }));
}
const originalIoc = ioc(cipher);
const pageKeyResults = [], pageKeyLocal = [];
for (const offset of [0, 4]) for (const layout of ['row', 'col'])
  for (const reduction of ['mod29', 'scaled29']) for (const sign of [-1, 1]) {
    const decoded = addPageKey(pages, offset, layout, reduction, sign);
    const recovered = decoded.map((indices, i) => ({page: pages[i].page, indices}))
      .map(page => addPageKey([page], offset, layout, reduction, -sign)[0]);
    assert.deepEqual(recovered, pages.map(p => p.indices));
    const flat = decoded.flat();
    const eligible = decoded.map((xs, i) => ({page: pages[i].page, length: xs.length, ioc: ioc(xs)}))
      .filter(x => x.length >= 140);
    pageKeyLocal.push(...eligible.map(x => ({...x, offset, layout, reduction, sign})));
    pageKeyResults.push({offset, layout, reduction, sign, ioc: ioc(flat),
      bestPage: eligible.slice().sort((a, b) => b.ioc - a.ioc)[0]});
  }
assert.equal(pageKeyResults.length, 16);
pageKeyResults.sort((a, b) => b.ioc - a.ioc);
pageKeyLocal.sort((a, b) => b.ioc - a.ioc);
assert.ok(pageKeyResults[0].ioc < 0.038);
assert.ok(pageKeyLocal[0].ioc < 0.045);
const hill58Results = [];
for (const offset of [0, 4]) for (const reduction of ['mod29', 'scaled29'])
  for (const layout of ['row', 'col']) {
    const M = matrixFromBytes(source, offset, 58, reduction, layout), inverse = invertMatrix(M);
    if (!inverse) { hill58Results.push({offset, reduction, layout, invertible: false}); continue; }
    for (const direction of ['direct', 'inverse']) {
      const decoder = direction === 'direct' ? M : inverse;
      const encoder = direction === 'direct' ? inverse : M;
      const decoded = applyCompleteBlocks(decoder, cipher);
      assert.deepEqual(applyCompleteBlocks(encoder, decoded), cipher.slice(0, decoded.length));
      hill58Results.push({offset, reduction, layout, direction, invertible: true, decoded: decoded.length, ioc: ioc(decoded)});
    }
  }
const hill58Valid = hill58Results.filter(x => x.invertible);
assert.equal(hill58Valid.length, 12);
hill58Valid.sort((a, b) => b.ioc - a.ioc);
assert.ok(hill58Valid[0].ioc < 0.038);
const four29Results = [], payload = source.subarray(4, 3368);
assert.equal(payload.length, 4 * 29 * 29);
for (const reduction of ['mod29', 'scaled29']) for (const layout of ['row', 'col']) {
  const matrices = Array.from({length: 4}, (_, k) => matrixFromBytes(payload, k * 29 * 29, 29, reduction, layout));
  for (const order of ['forward', 'reverse']) {
    const ordered = order === 'forward' ? matrices : matrices.slice().reverse();
    let product = ordered[0];
    for (let i = 1; i < ordered.length; i++) product = multiplyMatrices(ordered[i], product);
    const inverse = invertMatrix(product);
    assert.ok(inverse);
    for (const direction of ['direct', 'inverse']) {
      const decoder = direction === 'direct' ? product : inverse;
      const encoder = direction === 'direct' ? inverse : product;
      const decoded = applyCompleteBlocks(decoder, cipher);
      assert.deepEqual(applyCompleteBlocks(encoder, decoded), cipher.slice(0, decoded.length));
      four29Results.push({reduction, layout, order, direction, invertible: true, decoded: decoded.length, ioc: ioc(decoded)});
    }
  }
}
assert.equal(four29Results.length, 16);
four29Results.sort((a, b) => b.ioc - a.ioc);
assert.ok(four29Results[0].ioc < 0.038);
console.log(JSON.stringify({
  source: {length: source.length, sha1GitBlob: '62b1b949a1e4e4a346e75b1c34101000d3c53220',
    sha256: crypto.createHash('sha256').update(source).digest('hex'),
    structuralIdentities: ['3368 = 4 + 58^2', '3368 = 4 + 4*(29^2)']},
  original: {pages: pages.length, runes: cipher.length, ioc: originalIoc},
  pageKey: {variants: pageKeyResults.length, best: pageKeyResults[0],
    bestLocalPageAtLeast140: pageKeyLocal[0], all: pageKeyResults},
  hill58: {invertibleVariants: hill58Valid.length, best: hill58Valid[0], all: hill58Results},
  four29HillRounds: {variants: four29Results.length, best: four29Results[0], all: four29Results},
  decision: 'The tested direct page-key and linear Hill readings remain ciphertext-like. ' +
    'No LP2 plaintext or authentic key is recovered. Other source-selected roles for the binary remain open.'
}, null, 2));
