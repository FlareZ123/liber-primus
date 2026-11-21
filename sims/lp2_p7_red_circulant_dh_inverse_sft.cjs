'use strict';

/**
 * p7 original red word products, GF29 5x5 circulant inverse, and one p8 receiver.
 *
 * This is a source-selected candidate operation, not a proof that the
 * manuscript authors intended a Hill cipher.
 *
 * Run: node sims/lp2_p7_red_circulant_dh_inverse_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {number} x @returns {number} */
function mod29(x) {
  return ((x % 29) + 29) % 29;
}

/** @param {number} x @param {number} e @param {number} modulus @returns {number} */
function power(x, e, modulus) {
  let base = ((x % modulus) + modulus) % modulus;
  let result = 1;
  for (let exponent = e; exponent > 0; exponent = Math.floor(exponent / 2)) {
    if (exponent % 2) result = (result * base) % modulus;
    base = (base * base) % modulus;
  }
  return result;
}

/**
 * @param {number[][]} matrix
 * @returns {{inverse:number[][]|null,determinant:number}}
 */
function inverseGF29(matrix) {
  const n = matrix.length;
  const rows = matrix.map((row, i) =>
    row.map(mod29).concat(Array.from({ length: n }, (_, j) => Number(i === j))));
  let determinant = 1;
  for (let col = 0; col < n; col++) {
    const pivot = rows.findIndex((row, r) => r >= col && row[col] !== 0);
    if (pivot === -1) return { inverse: null, determinant: 0 };
    if (pivot !== col) {
      [rows[pivot], rows[col]] = [rows[col], rows[pivot]];
      determinant = mod29(-determinant);
    }
    const lead = rows[col][col];
    determinant = mod29(determinant * lead);
    const scale = power(lead, 27, 29);
    for (let j = 0; j < 2 * n; j++) rows[col][j] = mod29(rows[col][j] * scale);
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = rows[r][col];
      for (let j = 0; j < 2 * n; j++) {
        rows[r][j] = mod29(rows[r][j] - factor * rows[col][j]);
      }
    }
  }
  return { inverse: rows.map((row) => row.slice(n)), determinant };
}

/**
 * @param {number[][]} matrix
 * @param {number[]} body
 * @returns {number[]}
 */
function transformBlocks(matrix, body) {
  assert.equal(body.length % matrix.length, 0, 'whole blocks required');
  const out = [];
  for (let offset = 0; offset < body.length; offset += matrix.length) {
    for (const row of matrix) {
      out.push(mod29(row.reduce((total, value, i) =>
        total + value * body[offset + i], 0)));
    }
  }
  return out;
}

/** @param {number[]} symbols @returns {number} */
function indexOfCoincidence(symbols) {
  const counts = new Int32Array(29);
  for (const x of symbols) counts[x]++;
  return counts.reduce((total, x) => total + x * (x - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

/** @returns {void} */
function main() {
  const root = path.join(__dirname, '..', 'resources', 'liber-primus');
  const source = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
  const pageText = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8')
    .split(/\n%\s*\n/);
  const index = new Map(source.runes.map((rune, i) => [rune, i]));
  const page7 = pageText[7];
  /** @type {{start:number,runic:number[]}[]} */
  const words = [];
  let runic = [];
  let offset = 0;
  let start = 0;
  for (const glyph of page7) {
    if (index.has(glyph)) {
      if (runic.length === 0) start = offset;
      runic.push(index.get(glyph));
      offset++;
    } else if (glyph === '-' || glyph === '.' || glyph === ' ') {
      if (runic.length) words.push({ start, runic });
      runic = [];
    }
  }
  if (runic.length) words.push({ start, runic });
  assert.equal(offset, 208);

  const red = words.filter((w) => w.start >= 194 && w.start < 208);
  assert.deepEqual(red.map((w) => w.runic), [
    [23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19]
  ]);
  const products = red.map((w) => w.runic.reduce((product, rune) =>
    mod29(product * rune), 1));
  assert.deepEqual(products, [11, 26, 8, 15, 2]);

  // The five red words, in printed order, are the first row of this
  // right-rotating GF29 circulant (one natural, source-selected convention).
  const circulant = Array.from({ length: 5 }, (_, i) =>
    Array.from({ length: 5 }, (_, k) => products[(k - i + 5) % 5]));
  const { inverse, determinant } = inverseGF29(circulant);
  assert.equal(determinant, 19);
  assert.ok(inverse, 'actual source matrix must be nonsingular');
  assert.deepEqual(inverse[0], [23, 2, 5, 2, 19]);
  for (let i = 0; i < 5; i++) {
    for (let k = 0; k < 5; k++) {
      let cell = 0;
      for (let h = 0; h < 5; h++) cell += circulant[i][h] * inverse[h][k];
      assert.equal(mod29(cell), Number(i === k));
    }
  }

  // The cross-round DH teaching tuple, independent of this inverse.
  const dh = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 };
  assert.equal(power(dh.g, dh.a, dh.p), dh.A);
  assert.equal(power(dh.g, dh.b, dh.p), dh.B);
  assert.equal(power(dh.B, dh.a, dh.p), dh.K);
  assert.deepEqual(inverse[0], [dh.p, dh.K, dh.g, dh.K, dh.B]);

  // Conditional specificity, NOT a historical-probability calculation.
  // Hold the signed DH teaching field p=23 and base g=5 fixed, enumerate
  // all 22*22 nonzero private-exponent pairs, and construct the same five
  // reciprocal DH-state operands without seeing manuscript ciphertext.
  let invertibleDhTuples = 0;
  /** @type {number[][]} */
  const inverseIdentityMatches = [];
  for (let a = 1; a <= 22; a++) {
    for (let b = 1; b <= 22; b++) {
      const A = power(dh.g, a, dh.p);
      const B = power(dh.g, b, dh.p);
      const K = power(B, a, dh.p);
      const state = [
        power(A, 27, 29), power(B, 27, 29), A,
        power(K, 27, 29), K
      ];
      const key = Array.from({ length: 5 }, (_, i) =>
        Array.from({ length: 5 }, (_, k) => state[(k - i + 5) % 5]));
      const trial = inverseGF29(key);
      if (!trial.inverse) continue;
      invertibleDhTuples++;
      if (trial.inverse[0].every((value, i) =>
        value === [dh.p, K, dh.g, K, B][i])) {
        inverseIdentityMatches.push([a, b]);
      }
    }
  }
  assert.equal(invertibleDhTuples, 456);
  assert.deepEqual(inverseIdentityMatches, [[6, 15]]);


  // Cross-page reconstruction using ORIGINAL INSCRIPTION ONLY. The
  // historical state declaration 'dh' is an assertion/semantic control,
  // and is never used to generate any candidate p0 key byte.

  // Prefer the simpler source-first reconstruction: ordinary original-red
  // rune indices, red-word products, a single GP29 reciprocal and the five
  // product checksum. The circulant is now an independent equality check,
  // not a prerequisite for computing p0's numeric input.
  const p7State = {
    p: red[0].runic[0],
    e: red[0].runic[1],
    g: red[2].runic[0],
    a: red[4].runic[0],
    b: products[3],
    A: products[2],
    B: power(products[1], 27, 29),
    K: products[4],
    q: mod29(products.reduce((sum, product) => sum + product, 0)),
  };
  // These two exponentiation equations and the inverse matrix are
  // independent source-cipher readouts of the same numbered register.
  assert.equal(power(p7State.g, p7State.a, p7State.p), p7State.A);
  assert.equal(power(p7State.g, p7State.b, p7State.p), p7State.B);
  assert.equal(power(p7State.B, p7State.a, p7State.p), p7State.K);
  assert.deepEqual(inverse[0],
    [p7State.p, p7State.K, p7State.g, p7State.K, p7State.B]);
  assert.deepEqual(p7State, {
    p: 23, e: 3, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, q: 4
  });
  const recoveredState = p7State;


  // Entire original-book conditional family for a source-only DH exponent
  // equation, without consulting the 2013 authenticated worked example.
  // Freeze the p7 literal five-red-word shape: third and fifth words are
  // both three rune signs, and the sum of word3 is the original p7 p=23.
  // Interpret first rune of word3 as g; first/last word5 as a/B;
  // the third/fourth/fifth GP29 products as A/b/K. Charge every contiguous
  // five-word window on the 56 unknown original pages.
  const originalPages = fs.readFileSync(
    path.join(__dirname, '..', 'resources', 'lp2-transcription.txt'),
    'utf8').split('%');
  /** @param {number} page @returns {{start:number,runes:number[]}[]} */
  function wordsAt(page) {
    const out = [];
    let runes = [];
    let offset = 0;
    /** @returns {void} */
    function flush() {
      if (runes.length) {
        out.push({ start: offset - runes.length, runes });
        runes = [];
      }
    }
    for (const ch of originalPages[page]) {
      const rune = index.get(ch);
      if (rune !== undefined) {
        runes.push(rune);
        offset++;
      } else if ('-.$&§'.includes(ch)) {
        flush();
      }
    }
    flush();
    return out;
  }
  const sourceProduct = (runes) => runes.reduce((v, x) => mod29(v * x), 1);
  const family = {
    windows: 0, doubleTriple: 0, p23: 0, firstEquation: 0,
    secondEquation: 0, thirdEquation: 0, matches: []
  };
  for (let page = 0; page <= 55; page++) {
    const list = wordsAt(page);
    for (let start = 0; start + 5 <= list.length; start++) {
      family.windows++;
      const word3 = list[start + 2].runes;
      const word4 = list[start + 3].runes;
      const word5 = list[start + 4].runes;
      if (word3.length !== 3 || word5.length !== 3) continue;
      family.doubleTriple++;
      const prime = word3.reduce((sum, v) => sum + v, 0);
      if (prime !== 23) continue;
      family.p23++;
      const g = word3[0];
      const a = word5[0];
      const A = sourceProduct(word3);
      const b = sourceProduct(word4);
      const B = word5[2];
      const K = sourceProduct(word5);
      const first = power(g, a, prime) === A;
      const second = power(B, a, prime) === K;
      const third = power(g, b, prime) === B;
      if (first) family.firstEquation++;
      if (second) family.secondEquation++;
      if (third) family.thirdEquation++;
      if (first && second && third) {
        family.matches.push({ page, offset: list[start].start,
          prime, g, a, b, A, B, K });
      }
    }
  }
  assert.equal(family.windows, 2729);
  assert.equal(family.doubleTriple, 151);
  assert.equal(family.p23, 4);
  assert.equal(family.firstEquation, 1);
  assert.equal(family.secondEquation, 1);
  assert.equal(family.thirdEquation, 1);
  assert.deepEqual(family.matches, [{
    page: 7, offset: 194, prime: 23,
    g: 5, a: 6, b: 15, A: 8, B: 19, K: 2
  }]);

  // The already published, explicitly retrospective p0 vertical RISE
  // grammar receives the reconstructed p7 state, p0 4|5|4 marker geometry
  // and the p0 13-dot count. Neither a plaintext word nor an external
  // source register supplies any key component.
  const ink = JSON.parse(fs.readFileSync(
    path.join(root, 'lp2-p0-physical-ink-override.json'), 'utf8'));
  const p0Marker = ink.physical_zero_based.large_punctuation[0].dots;
  assert.equal(p0Marker, 13);
  assert.deepEqual([recoveredState.q, recoveredState.g, recoveredState.q],
    [4, 5, 4]);
  const u = mod29(recoveredState.q - recoveredState.e);
  const t = mod29(recoveredState.g + recoveredState.K);
  const w = mod29(recoveredState.A + recoveredState.g);
  assert.equal(w, p0Marker);
  /** @param {number} seed @param {number[]} rises @returns {number[]} */
  function cumulative(seed, rises) {
    let value = mod29(seed);
    const result = [value];
    for (const rise of rises) {
      value = mod29(value + rise);
      result.push(value);
    }
    return result;
  }
  /** @param {number[]} values @returns {number[]} */
  function outsideInH(values) {
    const output = [];
    for (let i = 0, j = values.length - 1; i < j; i++, j--) {
      output.push(mod29(values[i] - values[j]));
      output.push(mod29(values[i] + values[j]));
    }
    if (values.length % 2) output.push(values[(values.length - 1) / 2]);
    return output;
  }
  const left = cumulative(-recoveredState.q, [recoveredState.q - u, w - u, w + u]);
  const center = cumulative(recoveredState.q,
    Array.from({ length: 4 }, (_, i) => recoveredState.q + i * t));
  const right = cumulative(t, [t - u, t, t + u]);
  const p0Key = outsideInH([...left, ...center, ...right]);
  const p0Source = ink.physical_zero_based.red_words.flatMap((word) => word.gp_indices);
  assert.equal(p0Source.length, p0Marker);
  const p0Recovered = p0Source.map((c, i) => mod29(c - p0Key[i]));
  assert.deepEqual(p0Recovered.map((p, i) => mod29(p + p0Key[i])), p0Source);
  const p0Reading = p0Recovered.map((p) => source.translit[p]).join('');
  assert.deepEqual(p0Key, [26, 24, 8, 19, 27, 24, 18, 3, 0, 8, 0, 16, 19]);
  assert.equal(p0Reading, 'EPIPHANYSEECS');

  // The immediately following p8 is exactly 255 = 51*5 source runes.
  // Test the unmodified complete original page with no fitting.
  const original = source.pages[8].indices;
  assert.equal(original.length, 255);
  const decoded = transformBlocks(inverse, original);
  assert.deepEqual(transformBlocks(circulant, decoded), original);

  // Native p57's clear runes are 95 = 19*5. This is a positive
  // forward/reverse control for native-GP plaintext and exactly the same key.
  const known = source.pages[57].indices;
  assert.equal(known.length, 95);
  const planted = transformBlocks(circulant, known);
  assert.deepEqual(transformBlocks(inverse, planted), known);

  // The reverse circulant convention is a single source-natural orientation
  // alternative. Neither is a readable ordinary-GP p8 cipher inverse.
  const transpose = inverse.map((row, i) => row.map((_, k) => inverse[k][i]));
  const reversed = transformBlocks(transpose, original);
  const flat = (values) => values.map((i) => source.translit[i]).join('-');

  console.log('p7 five-word GF29 circulant source packet: PASS');
  console.log('Original p7 red products: ' + products.join(','));
  console.log('Circulant determinant mod29: ' + determinant);
  console.log('Inverted first row: ' + inverse[0].join(','));
  console.log('Authenticated DH23 pattern: [p,K,g,K,B] = ' +
    [dh.p, dh.K, dh.g, dh.K, dh.B].join(','));
  console.log('DH23 exponent-pair conditional census: ' +
    invertibleDhTuples + '/484 nonsingular; inverse identity only at a=6,b=15.');
  console.log('p7 original red indices/products-only state (circulant NOT used as key input): ' +
    JSON.stringify(recoveredState));
  console.log('Global source-only DH field-equation gate: 2729 five-word windows; ' +
    family.doubleTriple + ' with two 3-rune operand words, ' +
    family.p23 + ' with word3 sum23, unique three-equation match p7 offset194.');
  console.log('p7 state + previously documented p0 RISE/H serializer: key=' +
    p0Key.join(','));
  console.log('Untouched p0 title GP source-only local recovery: ' + p0Reading +
    ' (human reading EPIPHANY SEEKS), exact 13/13 reencryption.');
  console.log('p8 original 255-runic IoC: ' + indexOfCoincidence(original).toFixed(8));
  console.log('p8 standard-circulant inverse IoC: ' +
    indexOfCoincidence(decoded).toFixed(8));
  console.log('p8 transposed-circulant inverse IoC: ' +
    indexOfCoincidence(reversed).toFixed(8));
  console.log('p57 native-GP positive control IoC: ' +
    indexOfCoincidence(known).toFixed(8));
  console.log('p8 standard inverse first 30 rune values: ' +
    flat(decoded.slice(0, 30)));
  console.log('p8 transposed inverse first 30 rune values: ' +
    flat(reversed.slice(0, 30)));
  console.log('Exact p8 forward replay: 255/255; p57 plant replay: 95/95.');
  console.log('Conclusion: exact DH-circulant identity, but no p8 plaintext recovery.');
}

main();
