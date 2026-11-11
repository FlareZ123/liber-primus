'use strict';
/**
 * Source-constrained matrix readings of the 2013 Cicada OS wisdom/folly
 * binary against original LP2. Tests only exact 58^2 and 4*29^2
 * factorizations, natural row/column orders, byte reductions, and
 * reversible additive/Hill operations, plus GF(29^2) paired-byte per-page substitution readings. No key or plaintext is claimed.
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

function gf29SqMul(x, y) {
  const [a, b] = x, [c, d] = y;
  return [mod(a * c + 8 * b * d, 29), mod(a * d + b * c + 3 * b * d, 29)];
}
function gf29SqPow(x, exponent) {
  let result = [1, 0], base = x, n = exponent;
  while (n > 0) {
    if (n & 1) result = gf29SqMul(result, base);
    base = gf29SqMul(base, base);
    n = Math.floor(n / 2);
  }
  return result;
}
const gfPrimitive = [19, 13]; // p50 quotient representative 19 + 13u, u^2 = 3u + 8
const gfLogs = new Map();
let gfPower = [1, 0];
for (let exponent = 0; exponent < 840; exponent++) {
  const key = gfPower.join(',');
  assert.ok(!gfLogs.has(key));
  gfLogs.set(key, exponent);
  gfPower = gf29SqMul(gfPower, gfPrimitive);
}
assert.deepEqual(gfPower, [1, 0]);
assert.equal(gfLogs.size, 840);
const fieldProjections = {
  a: ([a]) => a,
  b: ([a, b]) => b,
  trace: ([a, b]) => mod(2 * a + 3 * b, 29),
  norm: ([a, b]) => mod(a * a + 3 * a * b + 21 * b * b, 29),
  logGMod29: pair => {
    const exponent = gfLogs.get(pair.join(','));
    return exponent === undefined ? null : exponent % 29;
  }
};
function scorePageMaps(vectors, maps) {
  return maps.map(({name, fn}) => {
    const scores = vectors.map(vector => {
      const values = vector.map((pair, j) => fn(pair, j));
      const valid = values.filter(value => value !== null && value !== undefined);
      return {unique: new Set(valid).size, complete: values.every(value => value !== null && value !== undefined)};
    });
    return {
      name,
      pagesPermutation: scores.filter(score => score.complete && score.unique === 29).length,
      maxUnique: Math.max(...scores.map(score => score.unique))
    };
  });
}
const fieldPairResults = [];
for (const offset of [0, 4]) for (const layout of ['row', 'col'])
  for (const reduction of ['mod29', 'scaled29']) for (const reversePair of [false, true]) {
    const M = matrixFromBytes(source, offset, 58, reduction, layout);
    const vectors = M.map(row => Array.from({length: 29}, (_, j) => {
      const a = row[2 * j], b = row[2 * j + 1];
      return reversePair ? [b, a] : [a, b];
    }));
    const linearMaps = Array.from({length: 29}, (_, lambda) => ({
      name: 'a+' + lambda + 'b',
      fn: ([a, b]) => mod(a + lambda * b, 29)
    })).concat([{name: 'b', fn: ([a, b]) => b}]);
    const directMaps = Object.entries(fieldProjections).map(([name, fn]) => ({name, fn}));
    const indexedMaps = Object.entries(fieldProjections).flatMap(([name, fn]) =>
      [-1, 1].map(sign => ({
        name: name + (sign > 0 ? '_j_plus' : '_j_minus'),
        fn: (pair, j) => {
          const key = fn(pair);
          return key === null ? null : mod(j + sign * key, 29);
        }
      })));

    const multiplicativeMaps = Object.entries(fieldProjections).map(([name, fn]) => ({
      name,
      fn: (pair, j) => {
        const key = fn(pair);
        return key === null ? null : mod(j * key, 29);
      }
    }));
    const exponentVectors = vectors.map(vector =>
      vector.map(([a, b]) => gf29SqPow(gfPrimitive, a + 29 * b)));
    const exponentMaps = ['a', 'b', 'trace', 'norm'].map(name => ({
      name,
      fn: fieldProjections[name]
    }));
    const exponentMultiplicativeMaps = exponentMaps.map(({name, fn}) => ({
      name,
      fn: (pair, j) => mod(j * fn(pair), 29)
    }));
    fieldPairResults.push({
      offset,
      frame: offset === 4 ? 'four-byte-prefix' : 'four-byte-trailer',
      layout,
      reduction,
      pairOrder: reversePair ? 'ba' : 'ab',
      linear: scorePageMaps(vectors, linearMaps),
      direct: scorePageMaps(vectors, directMaps),
      indexedAdditive: scorePageMaps(vectors, indexedMaps),
      indexedMultiplicative: scorePageMaps(vectors, multiplicativeMaps),
      base29Exponent: scorePageMaps(exponentVectors, exponentMaps),
      base29ExponentMultiplicative: scorePageMaps(exponentVectors, exponentMultiplicativeMaps)
    });
  }
assert.equal(fieldPairResults.length, 16);
function summarizeFieldFamily(name) {
  const maps = fieldPairResults.flatMap(result => result[name]);
  return {
    maps: maps.length,
    mapsWithAnyPagePermutation: maps.filter(result => result.pagesPermutation > 0).length,
    pagePermutationHits: maps.reduce((sum, result) => sum + result.pagesPermutation, 0),
    maxDistinctPerPage: Math.max(...maps.map(result => result.maxUnique))
  };
}
const fieldPairSbox = {
  field: {polynomial: 'u^2 = 3u + 8', primitive: '19 + 13u', primitiveOrder: gfLogs.size},
  configurations: fieldPairResults.map(result => ({
    frame: result.frame,
    layout: result.layout,
    reduction: result.reduction,
    pairOrder: result.pairOrder,
    linearMaxUnique: Math.max(...result.linear.map(x => x.maxUnique)),
    directMaxUnique: Math.max(...result.direct.map(x => x.maxUnique)),
    indexedAdditiveMaxUnique: Math.max(...result.indexedAdditive.map(x => x.maxUnique)),
    indexedMultiplicativeMaxUnique: Math.max(...result.indexedMultiplicative.map(x => x.maxUnique)),
    base29ExponentMaxUnique: Math.max(...result.base29Exponent.map(x => x.maxUnique)),
    base29ExponentMultiplicativeMaxUnique: Math.max(...result.base29ExponentMultiplicative.map(x => x.maxUnique))
  })),
  linearProjections: summarizeFieldFamily('linear'),
  directFieldProjections: summarizeFieldFamily('direct'),
  symbolIndexedAdditive: summarizeFieldFamily('indexedAdditive'),
  symbolIndexedMultiplicative: summarizeFieldFamily('indexedMultiplicative'),
  base29ExponentProjections: summarizeFieldFamily('base29Exponent'),
  base29ExponentMultiplicative: summarizeFieldFamily('base29ExponentMultiplicative'),
  positiveControl: (() => {
    const pairs = Array.from({length: 29}, (_, j) => [j, 7]);
    const direct = scorePageMaps([pairs], [{name: 'control', fn: ([a, b]) => mod(a + 7 * b, 29)}])[0];
    const indexed = scorePageMaps([pairs], [{name: 'control', fn: (pair, j) => mod(j + 7, 29)}])[0];
    const multiplicative = scorePageMaps([pairs], [{name: 'control', fn: (pair, j) => mod(j, 29)}])[0];
    assert.equal(direct.pagesPermutation, 1);
    assert.equal(indexed.pagesPermutation, 1);
    assert.equal(multiplicative.pagesPermutation, 1);
    return {directProjectionDetected: direct.pagesPermutation === 1, indexedAdditiveDetected: indexed.pagesPermutation === 1, indexedMultiplicativeDetected: multiplicative.pagesPermutation === 1};
  })()
};
for (const family of ['linearProjections', 'directFieldProjections', 'symbolIndexedAdditive', 'symbolIndexedMultiplicative', 'base29ExponentProjections', 'base29ExponentMultiplicative']) {
  assert.equal(fieldPairSbox[family].mapsWithAnyPagePermutation, 0);
  assert.equal(fieldPairSbox[family].pagePermutationHits, 0);
  assert.equal(fieldPairSbox[family].maxDistinctPerPage, 24);
}

console.log(JSON.stringify({
  source: {length: source.length, sha1GitBlob: '62b1b949a1e4e4a346e75b1c34101000d3c53220',
    sha256: crypto.createHash('sha256').update(source).digest('hex'),
    structuralIdentities: ['3368 = 4 + 58^2', '3368 = 4 + 4*(29^2)']},
  original: {pages: pages.length, runes: cipher.length, ioc: originalIoc},
  pageKey: {variants: pageKeyResults.length, best: pageKeyResults[0],
    bestLocalPageAtLeast140: pageKeyLocal[0], all: pageKeyResults},
  hill58: {invertibleVariants: hill58Valid.length, best: hill58Valid[0], all: hill58Results},
  four29HillRounds: {variants: four29Results.length, best: four29Results[0], all: four29Results},
  fieldPairSbox,
  decision: 'The tested direct page-key, linear Hill, and GF(29^2) per-page substitution readings do not decrypt original LP2. ' +
    'The paired-byte table fails to produce a 29-symbol bijection under the bounded projections tested. ' +
    'No LP2 plaintext or authentic key is recovered. Other source-selected inter-page or stateful roles for the binary remain open.'
}, null, 2));
