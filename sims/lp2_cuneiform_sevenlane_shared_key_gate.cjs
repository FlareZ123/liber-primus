"use strict";

/**
 * Source-locked seven-lane equality obstruction for the p33–39 cuneiform body.
 *
 * The same common bijection at every column preserves equality between rows.
 * This covers an arbitrary secret column-specific substitution as well as a
 * common additive one-time pad. It does not cover separate row keys, hidden
 * coordinates, non-GP plaintext or compression.
 *
 * Run: node sims/lp2_cuneiform_sevenlane_shared_key_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} relativePath @returns {string} */
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
assert.equal(corpus.pages.length, 58);
assert.equal(corpus.runes.length, 29);

/**
 * Greedy GP transliteration: Cicada uses the two-letter graphemes as single
 * runes; source text punctuation/whitespace is discarded.
 * @param {string} text
 * @returns {number[]}
 */
function toGp(text) {
  const index = new Map(corpus.translit.map((name, i) => [name, i]));
  const upper = text.toUpperCase();
  const output = [];
  for (let i = 0; i < upper.length; i++) {
    const digraph = upper.slice(i, i + 2);
    if (index.has(digraph)) {
      output.push(index.get(digraph));
      i++;
    } else if (index.has(upper[i])) {
      output.push(index.get(upper[i]));
    }
  }
  return output;
}

/**
 * For seven same-length rows, count within-column ciphertext equalities.
 * This count is an exact invariant of any columnwise shared permutation.
 * @param {number[][]} rows
 * @returns {{matches:number, comparisons:number, perPair:number[]}}
 */
function equalities(rows) {
  assert.equal(rows.length, 7);
  const width = rows[0].length;
  for (const row of rows) assert.equal(row.length, width);
  let matches = 0;
  const perPair = [];
  for (let a = 0; a < 7; a++) {
    for (let b = a + 1; b < 7; b++) {
      let count = 0;
      for (let j = 0; j < width; j++) {
        if (rows[a][j] === rows[b][j]) count++;
      }
      matches += count;
      perPair.push(count);
    }
  }
  return { matches, comparisons: 21 * width, perPair };
}

/**
 * @param {number[]} seq
 * @param {number} width
 * @returns {number[][]}
 */
function lanes(seq, width) {
  return Array.from({ length: 7 }, (_, k) => seq.slice(k * width, (k + 1) * width));
}

/**
 * Keep the fully source-visible native same-page coordinate width, 123;
 * compare with the exact 7 × 227 continuous packing of the cuneiform body.
 * @param {number[]} seq
 * @returns {{packed:number,native:number}}
 */
function twoFormats(seq) {
  const lengths = [123, 261, 271, 238, 228, 228, 240];
  let position = 0;
  const pageRows = lengths.map((length) => {
    const row = seq.slice(position, position + 123);
    position += length;
    return row;
  });
  assert.equal(position, 1589);
  return {
    packed: equalities(lanes(seq, 227)).matches,
    native: equalities(pageRows).matches
  };
}

/**
 * A completely enumerated deterministic sliding-window reference: sample
 * source windows at regular stride. The comparison uses actual unmodified
 * contiguous GP source sequences, not a probabilistic language model.
 * @param {string} pathName
 * @returns {{name:string,gpRunes:number,windows:number,packed:{min:number,median:number,max:number,mean:number,atMostOriginal:number},native:{min:number,median:number,max:number,mean:number,atMostOriginal:number}}}
 */
function reference(pathName) {
  const source = toGp(read(pathName));
  const stride = Math.max(1, Math.floor((source.length - 1589) / 2000));
  const packed = [], native = [], sixPacked = [], sixNative = [];
  for (let off = 0; off + 1589 <= source.length; off += stride) {
    const window = source.slice(off, off + 1589);
    const r = twoFormats(window);
    const six = sourceSixRowIoC(window);
    packed.push(r.packed);
    native.push(r.native);
    sixPacked.push(six.packed);
    sixNative.push(six.native);
  }
  /** @param {number[]} values @param {number} observed */
  const stats = (values, observed) => {
    values.sort((a, b) => a - b);
    return {
      min: values[0], median: values[Math.floor(values.length / 2)],
      max: values.at(-1),
      mean: Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(6)),
      atMostOriginal: values.filter((x) => x <= observed).length
    };
  };
  return {
    name: pathName, gpRunes: source.length, windows: packed.length,
    packed: stats(packed, 159), native: stats(native, 93),
    sixOriginalLanguageIocControls: {
      packedMin: Math.min(...sixPacked),
      nativeMin: Math.min(...sixNative)
    }
  };
}


/** @param {number} value @returns {number} */
const mod29 = (value) => ((value % 29) + 29) % 29;
/** @param {number[][]} matrix @returns {number[][]} */
const transpose = (matrix) => matrix[0].map((_, j) => matrix.map((row) => row[j]));
/** @param {number[][]} matrix @returns {number[][]} */
function inverse(matrix) {
  const width = 7;
  const rows = matrix.map((row, i) =>
    row.map(mod29).concat(Array.from({ length: width }, (_, j) => Number(i === j))));
  for (let col = 0; col < width; col++) {
    const pivot = rows.findIndex((row, i) => i >= col && row[col] !== 0);
    assert.ok(pivot >= col);
    [rows[col], rows[pivot]] = [rows[pivot], rows[col]];
    const reciprocal = Array.from({ length: 29 }, (_, i) => i)
      .find((i) => mod29(i * rows[col][col]) === 1);
    assert.ok(reciprocal > 0);
    for (let j = 0; j < 14; j++) rows[col][j] = mod29(rows[col][j] * reciprocal);
    for (let i = 0; i < width; i++) {
      if (i === col) continue;
      const factor = rows[i][col];
      for (let j = 0; j < 14; j++) {
        rows[i][j] = mod29(rows[i][j] - factor * rows[col][j]);
      }
    }
  }
  return rows.map((row) => row.slice(width));
}
/**
 * Apply an invertible 7 × 7 Hill transformation along one source column.
 * @param {number[][]} matrix
 * @param {number[][]} rows
 * @returns {number[][]}
 */
function hill(matrix, rows) {
  return matrix.map((matrixRow) => Array.from({ length: rows[0].length },
    (_, j) => mod29(matrixRow.reduce((sum, x, i) => sum + x * rows[i][j], 0))));
}


/**
 * Finite-field 7-point DFT. Ac / GP index24 has exact order seven in F29.
 * Inverse uses 7^-1 = 25 mod29.
 * @param {number[][]} rows
 * @param {boolean} inverseMode
 * @returns {number[][]}
 */
function root7Fourier(rows, inverseMode) {
  const powers = [1, 24, 25, 20, 16, 7, 23];
  let z = 1;
  for (let i = 0; i < 7; i++) z = mod29(z * 24);
  assert.equal(z, 1);
  const factor = inverseMode ? 25 : 1;
  return Array.from({ length: 7 }, (_, r) =>
    Array.from({ length: rows[0].length }, (_, j) => {
      let sum = 0;
      for (let k = 0; k < 7; k++) {
        const exponent = (((inverseMode ? -r * k : r * k) % 7) + 7) % 7;
        sum += rows[k][j] * powers[exponent];
      }
      return mod29(factor * sum);
    }));
}
/** @param {number[]} values @returns {number} */
function indexOfCoincidence(values) {
  const counts = Array(29).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
/** @param {number[]} seq @returns {{packed:number,native:number}} */
function sourceSixRowIoC(seq) {
  const lens = [123, 261, 271, 238, 228, 228, 240];
  let start = 0;
  const pageRows = lens.map((size) => {
    const row = seq.slice(start, start + 123);
    start += size;
    return row;
  });
  return {
    packed: indexOfCoincidence(lanes(seq, 227).slice(1).flat()),
    native: indexOfCoincidence(pageRows.slice(1).flat())
  };
}


/**
 * Source-marked ten-dot passage p36–38, 553 = 7×79 GP runes, can be
 * packed by contiguous 79-rune rows or by seven adjacent-rune columns.
 * @param {number[]} text
 * @returns {{rows:number[][],columns:number[][]}}
 */
function sevenBy79(text) {
  assert.equal(text.length, 553);
  return {
    rows: lanes(text, 79),
    columns: Array.from({ length: 7 }, (_, r) =>
      Array.from({ length: 79 }, (_, j) => text[7 * j + r]))
  };
}
/** @param {string} sourceName */
function controlSeven79(sourceName) {
  const source = toGp(read(sourceName));
  const stride = Math.max(1, Math.floor((source.length - 553) / 2000));
  let windows = 0, minIoc = 1;
  for (let off = 0; off + 553 <= source.length; off += stride) {
    const six = source.slice(off + 79, off + 553);
    const score = indexOfCoincidence(six);
    if (score < minIoc) minIoc = score;
    windows++;
  }
  return { source: sourceName, windows, minimumIoc: minIoc };
}

function main() {
  const pageStreams = corpus.pages.slice(33, 40)
    .map((page) => page.indices.slice(page.page === 33 ? 91 : 0));
  assert.deepEqual(pageStreams.map((p) => p.length), [123, 261, 271, 238, 228, 228, 240]);
  const original = pageStreams.flat();
  assert.equal(original.length, 1589);

  const packed = lanes(original, 227);
  const native = pageStreams.map((p) => p.slice(0, 123));
  const measured = { packed: equalities(packed), native: equalities(native) };
  assert.equal(measured.packed.matches, 159);
  assert.equal(measured.native.matches, 93);

  // The historical OpenPuff 7×7/1033 magic square is linked to the seven
  // cuneiform pages by the identical displayed sexagesimal 1033 numeral.
  // Its row *and column* sums equal 1033 == 18 (mod29); consequently any
  // arbitrary common GP29 column pad remains common after a Hill inverse.
  const historicalSquares = read("resources/cicada2014-openpuff-magic-squares.txt")
    .trim().split(/\r?\n\s*\r?\n/u)
    .map((square) => square.trim().split(/\r?\n/u)
      .map((line) => line.trim().split(/\s+/u).map(Number)));
  const square = historicalSquares[1];
  assert.deepEqual(square.map((row) => row.reduce((a, b) => a + b)), Array(7).fill(1033));
  assert.deepEqual(transpose(square).map((row) => row.reduce((a, b) => a + b)),
    Array(7).fill(1033));
  const sourceMatrices = [
    { name: "M", matrix: square },
    { name: "M_transposed", matrix: transpose(square) },
    { name: "M_inverse", matrix: inverse(square) },
    { name: "M_inverse_transposed", matrix: inverse(transpose(square)) }
  ];
  const hillColumnInvariants = sourceMatrices.map(({ name, matrix }) => ({
    name, packed: equalities(hill(matrix, packed)).matches,
    native: equalities(hill(matrix, native)).matches
  }));
  assert.deepEqual(hillColumnInvariants.map((r) => [r.packed, r.native]),
    [[185, 84], [152, 107], [176, 73], [163, 82]]);

  // Hypothesis: the source-marked Ac24 root (order seven) supplies a 7-point
  // DFT, with a completely arbitrary common secret pad added to every
  // ciphertext row. The Fourier inverse isolates that pad to row zero;
  // six plaintext GP rows must appear exactly without knowing any key.
  const FourierRows = [
    { name: "packed", rows: packed },
    { name: "native", rows: native }
  ];
  const root7NoKeySixRowIoC = FourierRows.map(({ name, rows }) => {
    assert.deepEqual(root7Fourier(root7Fourier(rows, false), true), rows);
    assert.deepEqual(root7Fourier(root7Fourier(rows, true), false), rows);
    const candidate = root7Fourier(rows, true);
    const dual = root7Fourier(rows, false);
    const a = indexOfCoincidence(candidate.slice(1).flat());
    const b = indexOfCoincidence(dual.slice(1).flat());
    assert.ok(Math.abs(a - b) < 1e-12);
    return { name, ioc: a, preview: candidate[1].slice(0, 35)
      .map((x) => corpus.translit[x]).join("") };
  });
  assert.ok(Math.abs(root7NoKeySixRowIoC[0].ioc - 0.034330591762772686) < 1e-12);
  assert.ok(Math.abs(root7NoKeySixRowIoC[1].ioc - 0.03407574102878071) < 1e-12);

  // Independent literal 10-dot enclosure on pp36–38: 553 original runes
  // exactly equals 7×79. The neighboring p39 highlighted Ac supplies
  // the same independently fixed seventh root of unity in F29.
  const unsolved = corpus.pages.filter((page) => page.page < 56)
    .flatMap((page) => page.indices);
  assert.equal(unsolved.length, 12956);
  const tenDotBody = unsolved.slice(8805, 9358);
  assert.equal(tenDotBody.length, 553);
  const enclosedRows = sevenBy79(tenDotBody);
  const tenDotRoot7Original = Object.entries(enclosedRows).map(([name, rows]) => {
    assert.deepEqual(root7Fourier(root7Fourier(rows, false), true), rows);
    const six = root7Fourier(rows, true).slice(1).flat();
    return { layout: name, sixRecoveredRunes: six.length,
      pooledIoC: indexOfCoincidence(six),
      preview: six.slice(0, 40).map((x) => corpus.translit[x]).join("") };
  });
  assert.ok(Math.abs(tenDotRoot7Original[0].pooledIoC -
    0.03548585650440228) < 1e-12);
  assert.ok(Math.abs(tenDotRoot7Original[1].pooledIoC -
    0.03440647273440915) < 1e-12);

  // Source-native plant under 227 independent column-specific GP29 bijections.
  // Each column has an invertible affine permutation x -> 7*x + 11*j (mod29).
  const shakespeare = toGp(read("resources/control/shakespeare_first300k.txt"));
  const english = lanes(shakespeare.slice(5000, 5000 + 1589), 227);
  const planted = english.map((row) => row.map((x, j) => (7 * x + 11 * j) % 29));
  const decoded = planted.map((row) => row.map((x, j) =>
    (25 * ((x - 11 * j) % 29 + 29)) % 29)); // 7^-1 mod29 = 25
  assert.deepEqual(decoded, english);
  assert.deepEqual(equalities(planted), equalities(english));

  // Source-native Hill + completely arbitrary common 227-step pad plant.
  // The invertible magic square's equal row sums make the pad removable
  // after inverse Hill by subtracting its common image; all runes recover.
  const pad = Array.from({ length: 227 }, (_, j) => (11 * j + 3) % 29);
  for (const { matrix } of sourceMatrices) {
    const ciphertext = hill(matrix, english).map((row) =>
      row.map((x, j) => mod29(x + pad[j])));
    const inv = inverse(matrix);
    const normalized = hill(inv, ciphertext);
    assert.deepEqual(equalities(normalized), equalities(english));
    const padScale = mod29(inv[0].reduce((a, b) => a + b, 0));
    assert.ok(inv.every((row) =>
      mod29(row.reduce((a, b) => a + b, 0)) === padScale));
    const decoded = normalized.map((row) =>
      row.map((x, j) => mod29(x - padScale * pad[j])));
    assert.deepEqual(decoded, english);
    assert.deepEqual(hill(matrix, decoded).map((row) =>
      row.map((x, j) => mod29(x + pad[j]))), ciphertext);
  }

  // Exact native-GP positive for both Fourier orientations and any key:
  // six of seven rows recover with no key, and the seventh after subtracting
  // the single source-invariant DC term. Verify complete re-encryption.
  for (const invertEncoding of [false, true]) {
    const encrypted = root7Fourier(english, invertEncoding).map((row) =>
      row.map((x, j) => mod29(x + pad[j])));
    const decoded = root7Fourier(encrypted, !invertEncoding);
    assert.deepEqual(decoded.slice(1), english.slice(1));
    const dcScale = invertEncoding ? 7 : 1;
    const complete = decoded.map((row, i) => row.map((x, j) =>
      i === 0 ? mod29(x - dcScale * pad[j]) : x));
    assert.deepEqual(complete, english);
    assert.deepEqual(root7Fourier(complete, invertEncoding).map((row) =>
      row.map((x, j) => mod29(x + pad[j]))), encrypted);
  }

  // A source-native 553-rune GP-English plant demonstrates complete
  // forward encoding, six-row keyless recovery and seventh-row DC repair.
  const native79 = lanes(shakespeare.slice(25000, 25000 + 553), 79);
  const secret79 = Array.from({ length: 79 }, (_, j) => (7 * j + 19) % 29);
  for (const inverted of [false, true]) {
    const ciphertext = root7Fourier(native79, inverted).map((row) =>
      row.map((x, j) => mod29(x + secret79[j])));
    const candidate = root7Fourier(ciphertext, !inverted);
    assert.deepEqual(candidate.slice(1), native79.slice(1));
    const repaired = candidate.map((row, i) => row.map((x, j) =>
      i === 0 ? mod29(x - (inverted ? 7 : 1) * secret79[j]) : x));
    assert.deepEqual(repaired, native79);
    assert.deepEqual(root7Fourier(repaired, inverted).map((row) =>
      row.map((x, j) => mod29(x + secret79[j]))), ciphertext);
  }

  const references = [
    reference("resources/control/shakespeare_first300k.txt"),
    reference("resources/control/emerson_essays_2944.txt")
  ];
  const tenDotControls = [
    controlSeven79("resources/control/shakespeare_first300k.txt"),
    controlSeven79("resources/control/emerson_essays_2944.txt")
  ];
  for (const r of references) {
    assert.equal(r.packed.atMostOriginal, 0);
    assert.equal(r.native.atMostOriginal, 0);
    for (const row of hillColumnInvariants) {
      assert.ok(row.packed < r.packed.min);
      assert.ok(row.native < r.native.min);
    }
    assert.ok(root7NoKeySixRowIoC[0].ioc < r.sixOriginalLanguageIocControls.packedMin);
    assert.ok(root7NoKeySixRowIoC[1].ioc < r.sixOriginalLanguageIocControls.nativeMin);
  }
  for (const result of tenDotRoot7Original) {
    for (const ctrl of tenDotControls) {
      assert.ok(result.pooledIoC < ctrl.minimumIoc);
    }
  }
  console.log(JSON.stringify({
    status: "SOURCE-BOUND MODEL EXCLUDED; NO ORIGINAL PLAINTEXT",
    sourcePages: "p33 local91 through p39, inclusive",
    sourceRunes: 1589,
    model: "one shared arbitrary GP29 bijection per column across seven lanes",
    original: measured,
    magicSquareHillPlusUnknownSharedPad: hillColumnInvariants,
    root7FourierKeyfreeSixRows: root7NoKeySixRowIoC,
    tenDot553FourierKeyfreeSixRows: tenDotRoot7Original,
    tenDotControls,
    references,
    sourceNativePlant: "exact 1589-rune recovery and forward encryption"
  }, null, 2));
}
main();
