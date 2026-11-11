'use strict';

// Original p50 32x8 grid -> final 180 known runes compatibility gate.
// Read-only standalone SFT: node sims/p50_32x8_interior_known_plaintext_gate_sft.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const mod = (x) => ((x % 29) + 29) % 29;
const page = (n) => corpus.pages.find((p) => p.page === n);
const knownP56 = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';

/** @param {string} s @returns {number[]} Greedy Gematria Primus tokenizer. */
function tokenize(s) {
  const alphabet = corpus.translit.map((token, index) => ({ token, index }))
    .sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s[i] === ' ') { i++; continue; }
    const match = alphabet.find((x) => s.startsWith(x.token, i));
    assert.ok(match, 'invalid GP text at character ' + i);
    out.push(match.index);
    i += match.token.length;
  }
  return out;
}

/** @param {number} count @returns {number[]} */
function primes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) if (n % d === 0) { prime = false; break; }
    if (prime) out.push(n);
  }
  return out;
}

assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every((r) => r.length === 8));
assert.equal(page(55).indices.length, 76);
assert.equal(page(56).indices.length, 85);
assert.equal(page(57).indices.length, 95);
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every((r) => r.length === 8));
const plain56 = tokenize(knownP56);
assert.equal(plain56.length, 85);

// Verify the independently solved p56 phi(prime) key with its single literal-F escape.
// This prevents silently treating arbitrary literary text as known plaintext.
const primeKeys = primes(85);
let clock = 0;
const decoded56 = page(56).indices.map((c, i) => i === 56 ? 0 : mod(c - (primeKeys[clock++] - 1)));
assert.deepEqual(decoded56, plain56);
assert.equal(clock, 84);

const known = plain56.concat(page(57).indices);
const printed = page(56).indices.concat(page(57).indices);
assert.equal(known.length, 180);
assert.equal(printed.length, 180);
const tokenCoordinates = [];
for (let r = 1; r <= 30; r++) for (let c = 1; c <= 6; c++) tokenCoordinates.push({r, c, token: grid.rows[r][c]});
assert.equal(tokenCoordinates.length, 180);
const repeated0s = tokenCoordinates.map((x, i) => ({ ...x, i })).filter((x) => x.token === '0s');
assert.deepEqual(repeated0s.map((x) => [x.r + 1, x.c + 1, x.i]),
  [[5, 5, 21], [15, 5, 81], [16, 4, 86], [22, 4, 122]]);
assert.deepEqual(repeated0s.map((x) => corpus.translit[known[x.i]]), ['R', 'P', 'A', 'W']);

/** @param {string} alphabet @returns {number[][]} */
function parseGrid(alphabet) {
  const radix = alphabet.length;
  const rows = grid.rows.map((row) => row.map((token) => {
    const high = alphabet.indexOf(token[0]);
    const low = alphabet.indexOf(token[1]);
    assert.ok(high >= 0 && low >= 0 && token.length === 2, token);
    return high * radix + low;
  }));
  assert.equal(rows.length, 32);
  return rows.slice(1, 31).map((r) => r.slice(1, 7));
}

/**
 * Test complete classes of direct stateless mappings on the fixed interior geometry.
 * The arbitrary byte-lookup class has one unknown rune per distinct byte.
 * The row/column additive model has unrestricted row and column shifts over GF29.
 * The affine model gives each row, or each column, arbitrary a,b over GF29.
 * @param {number[][]} B 30x6 original table cells.
 * @param {number[]} target 180 original known GP runes.
 * @returns {{distinctBytes:number,ambiguousByteClasses:number,minInconsistentPositions:number,positive2x2:number,negative2x2:number,validAffineRows:number,validAffineColumns:number}}
 */
function assess(B, target) {
  const lookup = new Map();
  for (let i = 0; i < 180; i++) {
    const value = B[Math.floor(i / 6)][i % 6];
    if (!lookup.has(value)) lookup.set(value, new Map());
    const counts = lookup.get(value);
    counts.set(target[i], (counts.get(target[i]) || 0) + 1);
  }
  let ambiguousByteClasses = 0, minInconsistentPositions = 0;
  for (const counts of lookup.values()) if (counts.size > 1) {
    ambiguousByteClasses++;
    const frequencies = [...counts.values()];
    minInconsistentPositions += frequencies.reduce((a, b) => a + b, 0) - Math.max(...frequencies);
  }
  const rowAffineFits = [];
  for (let r = 0; r < 30; r++) {
    let exists = false;
    for (let a = 0; a < 29 && !exists; a++) for (let b = 0; b < 29 && !exists; b++) {
      if (B[r].every((x, c) => mod(a * x + b) === target[r * 6 + c])) exists = true;
    }
    rowAffineFits.push(exists);
  }
  const colAffineFits = [];
  for (let c = 0; c < 6; c++) {
    let exists = false;
    for (let a = 0; a < 29 && !exists; a++) for (let b = 0; b < 29 && !exists; b++) {
      if (B.every((row, r) => mod(a * row[c] + b) === target[r * 6 + c])) exists = true;
    }
    colAffineFits.push(exists);
  }
  const separable = {};
  for (const sign of [1, -1]) {
    const D = B.map((row, r) => row.map((x, c) => mod(target[r * 6 + c] - sign * x)));
    let matches = 0;
    for (let r = 1; r < 30; r++) for (let c = 1; c < 6; c++) {
      if (mod(D[r][c] - D[r][0] - D[0][c] + D[0][0]) === 0) matches++;
    }
    separable[sign === 1 ? 'positive2x2' : 'negative2x2'] = matches;
  }
  return {
    distinctBytes: lookup.size,
    ambiguousByteClasses,
    minInconsistentPositions,
    positive2x2: separable.positive2x2,
    negative2x2: separable.negative2x2,
    validAffineRows: rowAffineFits.filter(Boolean).length,
    validAffineColumns: colAffineFits.filter(Boolean).length
  };
}

const sixty = parseGrid(grid.alphabet);
assert.deepEqual(sixty, grid.byte_rows.slice(1, 31).map((r) => r.slice(1, 7)));
const fiftyNine = parseGrid(grid.alphabet.replace('f', ''));
assert.equal(grid.alphabet.length, 60);
assert.equal(grid.alphabet.replace('f', '').length, 59);

const r60 = assess(sixty, known);
const r59 = assess(fiftyNine, known);
const raw60 = assess(sixty, printed);
assert.deepEqual(r60, {
  distinctBytes: 127, ambiguousByteClasses: 35, minInconsistentPositions: 47,
  positive2x2: 2, negative2x2: 5, validAffineRows: 0, validAffineColumns: 0
});
assert.deepEqual(r59, {
  distinctBytes: 127, ambiguousByteClasses: 35, minInconsistentPositions: 47,
  positive2x2: 8, negative2x2: 3, validAffineRows: 0, validAffineColumns: 0
});
assert.equal(raw60.validAffineRows, 0);
assert.equal(raw60.validAffineColumns, 0);
assert.equal(raw60.positive2x2, 9);
assert.equal(raw60.negative2x2, 9);

// Positive controls demonstrate that each stated architecture can be recognized.
const plantLookup = sixty.flat().map((x) => x % 29);
const lookupFit = assess(sixty, plantLookup);
assert.equal(lookupFit.minInconsistentPositions, 0);
const rowPlant = sixty.flatMap((row, r) => row.map((x) => mod(((r % 28) + 1) * x + 3 * r + 7)));
const rowFit = assess(sixty, rowPlant);
assert.equal(rowFit.validAffineRows, 30);
const sepPlant = sixty.flatMap((row, r) => row.map((x, c) => mod(x + 7 * r + 11 * c)));
const sepFit = assess(sixty, sepPlant);
assert.equal(sepFit.positive2x2, 145);

// Complementary source-fixed 256-symbol H/G codeword test, distinct from byte lookup.
// p50 original residue polynomial is divisible by F=H*G in GF29. Test whether the
// last 256 runes share that exact parity architecture in book order or in the
// 76-border/180-interior matrix, with printed or solved p56 register.
const generator = [14, 9, 13, 28, 1];
/** @param {number[]} coefficients high-to-low GP29 coefficients @returns {number[]} */
function syndrome(coefficients) {
  let state = [0, 0, 0, 0];
  for (const x of coefficients) {
    const carry = state[3];
    state = [
      mod(x - generator[0] * carry),
      mod(state[0] - generator[1] * carry),
      mod(state[1] - generator[2] * carry),
      mod(state[2] - generator[3] * carry)
    ];
  }
  return state;
}
assert.deepEqual(syndrome(grid.byte_rows.flat().map((x) => x % 29)), [0, 0, 0, 0]);
const border = [];
for (let c = 0; c < 8; c++) border.push(c);
for (let r = 1; r < 31; r++) border.push(r * 8 + 7);
for (let c = 7; c >= 0; c--) border.push(31 * 8 + c);
for (let r = 30; r >= 1; r--) border.push(r * 8);
const inside = [];
for (let r = 1; r < 31; r++) for (let c = 1; c < 7; c++) inside.push(r * 8 + c);
assert.equal(border.length, 76);
assert.equal(new Set(border).size, 76);
assert.equal(inside.length, 180);
/** @param {number[]} innerRunes @returns {number[]} */
function geometry(innerRunes) {
  const output = Array(256);
  border.forEach((at, i) => { output[at] = page(55).indices[i]; });
  inside.forEach((at, i) => { output[at] = innerRunes[i]; });
  assert.ok(output.every((v) => Number.isInteger(v)));
  return output;
}
const terminalRegisters = {
  bookPrinted: page(55).indices.concat(printed),
  bookSolved: page(55).indices.concat(known),
  matrixPrinted: geometry(printed),
  matrixSolved: geometry(known)
};
/**
 * Rank of the exact four parity-check equations restricted to any proposed
 * 76-rune unknown placement. Coefficient column i is the 4-term remainder
 * of the corresponding unit impulse polynomial; all arithmetic is GF29.
 * @param {number[]} positions
 * @returns {number}
 */
function checksumRank(positions) {
  const matrix = Array.from({ length: 4 }, () => []);
  for (const at of positions) {
    const impulse = Array(256).fill(0);
    impulse[at] = 1;
    const col = syndrome(impulse);
    for (let i = 0; i < 4; i++) matrix[i].push(col[i]);
  }
  let rank = 0;
  for (let col = 0; col < positions.length && rank < 4; col++) {
    let pivot = rank;
    while (pivot < 4 && matrix[pivot][col] === 0) pivot++;
    if (pivot === 4) continue;
    [matrix[pivot], matrix[rank]] = [matrix[rank], matrix[pivot]];
    let inverse = 1;
    while (mod(matrix[rank][col] * inverse) !== 1) inverse++;
    for (let k = col; k < positions.length; k++) {
      matrix[rank][k] = mod(matrix[rank][k] * inverse);
    }
    for (let row = 0; row < 4; row++) {
      if (row === rank) continue;
      const factor = matrix[row][col];
      for (let k = col; k < positions.length; k++) {
        matrix[row][k] = mod(matrix[row][k] - factor * matrix[rank][k]);
      }
    }
    rank++;
  }
  return rank;
}
const directBookUnknownPositions = Array.from({ length: 76 }, (_, i) => i);
const parityRank = {
  clockwiseBorder: checksumRank(border),
  bookFirst76: checksumRank(directBookUnknownPositions)
};
assert.deepEqual(parityRank, { clockwiseBorder: 4, bookFirst76: 4 });
// Even if either proposed final 256-rune codeword had ZERO syndrome, the known
// 180 inner runes and four independent parity equations leave 76-4=72 freely
// choosable GP29 symbols. The source H/G checks alone cannot recover page55.
assert.equal(border.length - parityRank.clockwiseBorder, 72);
assert.equal(directBookUnknownPositions.length - parityRank.bookFirst76, 72);

const constantRemainder = syndrome(Array(256).fill(1));
assert.deepEqual(constantRemainder, [14, 3, 19, 3]);
const parityResults = {};
for (const [name, runes] of Object.entries(terminalRegisters)) {
  assert.equal(runes.length, 256);
  const residue = syndrome(runes);
  let allowedAffineKeys = 0;
  // An unrestricted global affine GP29 recoding is a*C+b, a in GF29^*.
  // R(a*C+b) = a*R(C)+b*R(ones) by linearity; all 812 keys checked.
  for (let a = 1; a < 29; a++) for (let b = 0; b < 29; b++) {
    if (residue.every((x, i) => mod(a * x + b * constantRemainder[i]) === 0)) allowedAffineKeys++;
  }
  parityResults[name] = {residue, allowedAffineKeys};
  assert.equal(allowedAffineKeys, 0);
}
assert.deepEqual(parityResults, {
  bookPrinted: {residue:[2,16,22,3],allowedAffineKeys:0},
  bookSolved: {residue:[17,12,10,6],allowedAffineKeys:0},
  matrixPrinted: {residue:[28,15,15,10],allowedAffineKeys:0},
  matrixSolved: {residue:[4,16,17,15],allowedAffineKeys:0}
});
assert.deepEqual(syndrome(grid.byte_rows.flat().map((x) => mod(5 * x))), [0, 0, 0, 0]);

console.log(JSON.stringify({
  source: 'Original p50 32x8 printed table and p55/p56/p57 geometry',
  originalCounts: {p55:76,p56:85,p57:95,outer:76,interior:180},
  sameTokenWitness: repeated0s.map((x) => ({
    tableRowOneBased:x.r+1, tableColOneBased:x.c+1, interiorIndexZeroBased:x.i,
    token:x.token, recoveredPlaintextRune:corpus.translit[known[x.i]]
  })),
  base60Solved: r60, base59Solved:r59, base60Printed:raw60,
  hGeneratorParity: parityResults,
  terminalUnknownParityRank: parityRank, terminalUnknownNullity: 72,
  positiveControls: {lookup:lookupFit.minInconsistentPositions,
    rowAffine:rowFit.validAffineRows, separable2x2:sepFit.positive2x2},
  decision: 'No stationary byte-token lookup, no any-key per-row/per-column affine map, no separable row+column additive pad under this fixed 30x6 alignment',
  status: 'PASS'
},null,2));
