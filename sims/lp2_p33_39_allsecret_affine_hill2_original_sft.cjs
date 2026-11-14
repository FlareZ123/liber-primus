'use strict';

/**
 * Exact original-input necessary bound for every stationary invertible
 * affine 2x2 GF(29) block cipher on LP2 physical pp33..39.
 * The natural 1,680-rune chapter supplies 840 complete consecutive pairs.
 * JSDoc + CommonJS; Node 22; no network or third-party dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const originalPages = corpus.pages.slice(33, 40);
assert.deepEqual(originalPages.map(p => p.indices.length), [214, 261, 271, 238, 228, 228, 240]);
const original = originalPages.flatMap(p => p.indices);
assert.equal(original.length, 1680);
const modulo = n => ((n % 29) + 29) % 29;

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const f = Array(29).fill(0);
  for (const v of symbols) f[v]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (symbols.length * (symbols.length - 1));
}

/**
 * For any affine Hill2 output, its first rune is a nonzero GF29 linear
 * projection of each input pair plus a constant, and so is its second rune.
 * Individual projection-histogram squared norms are invariant under shifts.
 *
 * By Cauchy-Schwarz, the squared norm of their combined 29-bin histogram
 * is at most 4 * max(normSquared(any nonzero projection)).
 *
 * The resulting IoC upper bound covers ALL invertible 2x2 matrices
 * (more than 680,000) and ALL 29x29 additive offsets without enumerating
 * their keys. It even covers singular matrices with both nonzero rows.
 *
 * @param {number[]} symbols even-length GP29 stream
 * @returns {{maxQ:number,minQ:number,maxRow:[number,number],maxColumnOccupancy:number,bound:number,rows:number}}
 */
function allSecretHill2UpperBound(symbols) {
  assert.equal(symbols.length % 2, 0);
  let maxQ = -1;
  let minQ = Infinity;
  let maxRow = null;
  let maxColumnOccupancy = 0;
  let rows = 0;
  for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) {
    if (a === 0 && b === 0) continue;
    const freq = new Int32Array(29);
    for (let i = 0; i < symbols.length; i += 2) {
      freq[(a * symbols[i] + b * symbols[i + 1]) % 29]++;
    }
    const q = freq.reduce((s, n) => s + n * n, 0);
    if (q > maxQ) {
      maxQ = q;
      maxRow = [a, b];
      maxColumnOccupancy = Math.max(...freq);
    }
    minQ = Math.min(minQ, q);
    rows++;
  }
  assert.equal(rows, 840);
  return {
    maxQ, minQ, maxRow, maxColumnOccupancy, rows,
    bound: (4 * maxQ - symbols.length) / (symbols.length * (symbols.length - 1))
  };
}

/**
 * p3 red-polynomial field representation: u^2=3u+8 over GF29.
 * The 840 nonzero field coefficients are a proper subgroup of general
 * invertible Hill2 matrices. Search exactly all 840 multipliers and
 * all 29 inequivalent relative output shifts (translations have
 * a redundant global shift for IoC).
 *
 * @param {number[]} symbols
 * @returns {{numerator:number,a:number,b:number,delta:number,ioc:number}}
 */
function bestFieldAffine(symbols) {
  const n = symbols.length;
  let best = {numerator: -1, a: -1, b: -1, delta: -1, ioc: -1};
  for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) {
    if (a === 0 && b === 0) continue;
    const even = new Int32Array(29), odd = new Int32Array(29);
    for (let i = 0; i < n; i += 2) {
      const x = symbols[i], y = symbols[i + 1];
      even[modulo(a * x + 8 * b * y)]++;
      odd[modulo(b * x + (a + 3 * b) * y)]++;
    }
    let self = 0;
    for (let i = 0; i < 29; i++) {
      self += even[i] * (even[i] - 1) + odd[i] * (odd[i] - 1);
    }
    for (let delta = 0; delta < 29; delta++) {
      let numerator = self;
      for (let i = 0; i < 29; i++) numerator += 2 * even[i] * odd[(i + delta) % 29];
      if (numerator > best.numerator) {
        best = {numerator, a, b, delta, ioc: numerator / (n * (n - 1))};
      }
    }
  }
  return best;
}

const gpTokens = corpus.translit.map((s, i) => ({s, i})).sort((x, y) => y.s.length - x.s.length);

/** @param {string} originalText @returns {number[]} */
function sourceNativeGP(originalText) {
  const input = originalText.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const result = [];
  for (const word of input.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING', i)) {
        result.push(21);
        i += 3;
      } else if (word.startsWith('IO', i)) {
        result.push(27);
        i += 2;
      } else {
        const token = gpTokens.find(t => word.startsWith(t.s, i));
        assert(token, 'unmapped source-native word ' + word);
        result.push(token.i);
        i += token.s.length;
      }
    }
  }
  return result;
}

/**
 * Fully secret invertible positive-control transport.
 * @param {number[]} plain
 * @returns {number[]}
 */
function encryptNative(plain) {
  assert.equal(plain.length % 2, 0);
  const result = [];
  for (let i = 0; i < plain.length; i += 2) {
    const x = plain[i], y = plain[i + 1];
    result.push(modulo(7 * x + 9 * y + 17), modulo(11 * x + 13 * y + 24));
  }
  return result;
}

/** @param {number[]} encrypted @returns {number[]} */
function decryptNative(encrypted) {
  const result = [];
  for (let i = 0; i < encrypted.length; i += 2) {
    const x = modulo(encrypted[i] - 17), y = modulo(encrypted[i + 1] - 24);
    // det([7,9;11,13])=-8 mod29=21, inverse(det)=18 mod29
    result.push(modulo(18 * (13 * x - 9 * y)), modulo(18 * (-11 * x + 7 * y)));
  }
  return result;
}

assert.equal(modulo(21 * 18), 1);
const phase0 = allSecretHill2UpperBound(original);
const phase1 = allSecretHill2UpperBound([...original.slice(1), original[0]]);
const exactField = bestFieldAffine(original);

assert.deepEqual([phase0.maxQ, phase0.minQ, ...phase0.maxRow], [25732, 24852, 1, 28]);
assert.equal(phase1.maxQ, 25860);
assert.equal(exactField.numerator, 98842);
assert.deepEqual([exactField.a, exactField.b, exactField.delta], [1, 18, 16]);
assert(exactField.ioc <= phase0.bound);

const nativeControls = [
  ['Shakespeare', sourceNativeGP(read('resources/control/shakespeare_first300k.txt')).slice(0, 1680)],
  ['Gibran', sourceNativeGP(read('resources/control/gibran_prophet_58585.txt')).slice(0, 1680)]
];
for (const [name, originalPlain] of nativeControls) {
  assert.equal(originalPlain.length, original.length);
  const encoded = encryptNative(originalPlain);
  const recovered = decryptNative(encoded);
  assert.deepEqual(recovered, originalPlain, 'planted all-secret Hill2 original-language recovery');
  const controlBound = allSecretHill2UpperBound(encoded);
  assert(controlBound.bound >= ioc(originalPlain) - 1e-12,
    'all-secret Hill2 upper bound must admit the actual unknown-key plaintext');
  console.log(JSON.stringify({
    kind: 'source-native-planted-control', name,
    nativeIoC: ioc(originalPlain), encryptedIoC: ioc(encoded),
    exactRecovered: recovered.length,
    allSecretUpperBound: controlBound.bound
  }));
}

console.log(JSON.stringify({
  kind: 'original-LP2-p33-to-p39',
  pageLengths: originalPages.map(p => p.indices.length),
  runeCount: original.length, pairCount: original.length / 2,
  originalIoC: ioc(original),
  exactGF841AffineBest: exactField,
  allSecretHill2Original: phase0,
  cycleShiftOneRneSensitivity: phase1,
  conclusion: 'No stationary affine Hill2 decoder can yield a GP29 IoC above the stated 0.03589438 necessary upper bound on original p33-39.'
}));


/**
 * Source-conditioned nonlinear extension:
 * Test ALL 192 reversible field power exponents on the 840 native GP29
 * rune pairs, followed by EVERY completely unknown stationary affine Hill2
 * decoder. The 840-projection norm theorem bounds the entire affine layer.
 *
 * Field choices are exactly the previously established p3 original red
 * quadratic (u²=3u+8) and 2013 signed BASE29 monic field (u²=11u+18).
 * This is a full inversion architecture negative, not a historical cipher.
 */
function gcd(a, b) {
  return b ? gcd(b, a % b) : a;
}

/**
 * @param {string} name
 * @param {number} constant u² = constant + linear*u
 * @param {number} linear
 * @param {[number,number]} generator source-attested primitive field element
 * @returns {{name:string, table:[number,number][], logarithm:Int16Array}}
 */
function makePrimitiveField(name, constant, linear, generator) {
  /** @param {[number,number]} x @param {[number,number]} y */
  const multiply = (x, y) => [
    modulo(x[0] * y[0] + constant * x[1] * y[1]),
    modulo(x[0] * y[1] + x[1] * y[0] + linear * x[1] * y[1])
  ];
  const logarithm = new Int16Array(841).fill(-1);
  /** @type {[number,number][]} */
  const table = [];
  /** @type {[number,number]} */
  let state = [1, 0];
  for (let k = 0; k < 840; k++) {
    const addr = state[0] + 29 * state[1];
    assert.equal(logarithm[addr], -1, name + ' generator repeats early');
    logarithm[addr] = k;
    table.push(state);
    state = multiply(state, generator);
  }
  assert.deepEqual(state, [1, 0], name + ' primitive element has wrong order');
  assert.equal(logarithm[0], -1);
  assert.equal(table.length, 840);
  return {name, table, logarithm};
}

/**
 * Exact reversible field exponent map, with zero fixed as zero.
 * @param {number[]} input
 * @param {number} exponent
 * @param {{name:string,table:[number,number][],logarithm:Int16Array}} field
 * @returns {number[]}
 */
function applyPower(input, exponent, field) {
  assert.equal(input.length % 2, 0);
  const transformed = [];
  for (let i = 0; i < input.length; i += 2) {
    const addr = input[i] + 29 * input[i + 1];
    const k = field.logarithm[addr];
    if (addr === 0) {
      transformed.push(0, 0);
    } else {
      assert(k >= 0 && k < 840, field.name + ' logarithm missing source element');
      transformed.push(...field.table[(exponent * k) % 840]);
    }
  }
  return transformed;
}

/** @param {number} target @returns {number} */
function inverseExponent(target) {
  for (let e = 1; e < 840; e++) if ((e * target) % 840 === 1) return e;
  throw new Error('nonunit power exponent ' + target);
}

/**
 * For every invertible power map x->x^e, maximize the all-secret affine
 * output upper bound over all 840 nonzero GF29 coefficient rows.
 * @param {number[]} input
 * @param {{name:string,table:[number,number][],logarithm:Int16Array}} field
 */
function completePowerThenAllAffineBound(input, field) {
  let count = 0;
  let minimum = Infinity;
  let maximum = -Infinity;
  let winner = null;
  let maxRawIoC = -Infinity;
  for (let exponent = 1; exponent < 840; exponent++) {
    if (gcd(exponent, 840) !== 1) continue;
    const powered = applyPower(input, exponent, field);
    const candidate = allSecretHill2UpperBound(powered);
    const raw = ioc(powered);
    count++;
    maxRawIoC = Math.max(maxRawIoC, raw);
    minimum = Math.min(minimum, candidate.bound);
    if (candidate.bound > maximum) {
      maximum = candidate.bound;
      winner = {exponent, maxQ: candidate.maxQ,
        maxRow: candidate.maxRow, poweredIoC: raw};
    }
  }
  assert.equal(count, 192);
  return {source: field.name, exponentCount: count, minimumBound: minimum,
    maximumBound: maximum, winner, maximumPowerOnlyIoC: maxRawIoC};
}

const sourceFields = [
  makePrimitiveField('p3-red-quadratic u²=3u+8', 8, 3, [19, 13]),
  makePrimitiveField('2013-signed-BASE29 u²=11u+18', 18, 11, [0, 1])
];
const expected = [
  {maxQ: 26474, exponent: 109, bound: 0.036946595195552906},
  {maxQ: 26410, exponent: 193, bound: 0.03685583822570124}
];
for (let i = 0; i < sourceFields.length; i++) {
  const field = sourceFields[i];
  const test = completePowerThenAllAffineBound(original, field);
  assert.equal(test.winner.maxQ, expected[i].maxQ);
  assert.equal(test.winner.exponent, expected[i].exponent);
  assert(Math.abs(test.maximumBound - expected[i].bound) < 1e-15);
  assert(test.maximumBound < 0.05);

  const decipherExponent = test.winner.exponent;
  const encipherExponent = inverseExponent(decipherExponent);
  for (const [name, nativeEnglish] of nativeControls) {
    // Plant the source-native plaintext under a fully secret, deliberately
    // nonlinear power map followed by a fully secret invertible Hill2 map.
    const affinePreimage = decryptNative(nativeEnglish);
    const plantedCipher = applyPower(affinePreimage, encipherExponent, field);
    const recoveredPlain = encryptNative(applyPower(plantedCipher,
      decipherExponent, field));
    assert.deepEqual(recoveredPlain, nativeEnglish,
      'nonlinear field-power plus affine key must recover every native rune');
    const plantedUpperBound = allSecretHill2UpperBound(
      applyPower(plantedCipher, decipherExponent, field)).bound;
    assert(plantedUpperBound + 1e-12 >= ioc(nativeEnglish));
    console.log(JSON.stringify({
      kind: 'secret-power-and-affine-planted-control',
      field: field.name, name, decipherExponent,
      nativeIoC: ioc(nativeEnglish), encryptedIoC: ioc(plantedCipher),
      allSecretPostPowerBound: plantedUpperBound,
      recoveredCount: recoveredPlain.length
    }));
  }
  console.log(JSON.stringify({
    kind: 'all-192-reversible-exponents-plus-any-secret-Hill2',
    ...test,
    conclusion: 'No member of this complete source-field power and affine class yields ordinary native-GP unigram concentration on original pp33-39.'
  }));
}


/**
 * Stronger, key-independent necessary condition:
 * An ARBITRARY secret fixed 841-state substitution of GP29 rune pairs
 * preserves exactly every pair equality and the full collision count,
 * even when the map is nonlinear and has no affine or power structure.
 *
 * This covers all 841! possible secret pair permutations on one unchanged
 * chapter-wide pair alignment, rather than a subset of cipher keys.
 * Native Shakespeare/Gibran/Emerson GP benchmarks are sampled with an
 * independently fixed stride and word-preserving source orthography.
 *
 * @param {number[]} stream
 * @returns {{unique:number,collisions:number,repeatedTypes:number,maxFrequency:number}}
 */
function fullPairCollisionCount(stream) {
  assert.equal(stream.length % 2, 0);
  const f = new Uint16Array(841);
  for (let i = 0; i < stream.length; i += 2) f[stream[i] + 29 * stream[i + 1]]++;
  let unique = 0, collisions = 0, repeatedTypes = 0, maxFrequency = 0;
  for (const n of f) {
    unique += n > 0 ? 1 : 0;
    repeatedTypes += n >= 2 ? 1 : 0;
    collisions += n * (n - 1) / 2;
    maxFrequency = Math.max(maxFrequency, n);
  }
  return {unique, collisions, repeatedTypes, maxFrequency};
}

const originalPairs = fullPairCollisionCount(original);
const rotatedPairs = fullPairCollisionCount([...original.slice(1), original[0]]);
assert.deepEqual(originalPairs, {
  unique: 518, collisions: 461, repeatedTypes: 218, maxFrequency: 6
});
assert.deepEqual(rotatedPairs, {
  unique: 530, collisions: 417, repeatedTypes: 222, maxFrequency: 5
});

const languageSources = [
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt', 1021, 1687],
  ['Gibran', 'resources/control/gibran_prophet_58585.txt', 289, 2025],
  ['Emerson', 'resources/control/emerson_essays_2944.txt', 1515, 1784]
];
const pairPermutationA = 137, pairPermutationB = 251;
let inversePermutationA = -1;
for (let i = 1; i < 841; i++) {
  if (pairPermutationA * i % 841 === 1) { inversePermutationA = i; break; }
}
assert(inversePermutationA > 0);

/** @param {number[]} source @param {boolean} invert @returns {number[]} */
function permuteAll841States(source, invert) {
  const out = [];
  for (let i = 0; i < source.length; i += 2) {
    const n = source[i] + 29 * source[i + 1];
    const y = invert ? ((n - pairPermutationB + 841) * inversePermutationA) % 841 :
      (pairPermutationA * n + pairPermutationB) % 841;
    out.push(y % 29, Math.floor(y / 29));
  }
  return out;
}

for (const [name, file, expectedWindows, expectedMinimum] of languageSources) {
  const plain = sourceNativeGP(read(file));
  let windows = 0, minimum = Infinity, maximum = -Infinity;
  for (let start = 0; start + original.length <= plain.length; start += 211) {
    const window = plain.slice(start, start + original.length);
    const score = fullPairCollisionCount(window).collisions;
    windows++;
    minimum = Math.min(minimum, score);
    maximum = Math.max(maximum, score);
  }
  assert.equal(windows, expectedWindows, name + ' window count');
  assert.equal(minimum, expectedMinimum, name + ' minimum pair-repeat count');
  assert(minimum > originalPairs.collisions && minimum > rotatedPairs.collisions);
  const planted = plain.slice(0, original.length);
  const encrypted = permuteAll841States(planted, false);
  const recovered = permuteAll841States(encrypted, true);
  assert.deepEqual(recovered, planted, name + ' arbitrary secret pair substitution positive control');
  assert.deepEqual(fullPairCollisionCount(encrypted), fullPairCollisionCount(planted),
    '841-state bijection preserves every pair repeat');
  console.log(JSON.stringify({
    kind: 'fixed-841-secret-bijection-native-control',
    name, windows, nativeSourceRunes: plain.length,
    minPairCollisions: minimum, maxPairCollisions: maximum,
    plantedPairCollisions: fullPairCollisionCount(planted).collisions,
    plantedRecovered: recovered.length
  }));
}

console.log(JSON.stringify({
  kind: 'all-stationary-pair-permutation-collision',
  chapter: 'physical pp33-39', runeCount: original.length,
  pairCount: original.length / 2, phaseZero: originalPairs,
  rotatedOneRne: rotatedPairs,
  mathematicalScope: 'Any static bijection of 841 complete GP29 pair states with one shared substitution table',
  result: 'Original paired-symbol equality pattern is unlike all source-native English reference windows; every static 841-state substitution preserves it exactly.'
}));
