'use strict';
/**
 * Exact sparse known-plaintext attack on the surviving hypothetical
 * 78 base-29 -> 79 base-28 fixed-cyclic-alphabet LP2 packet encoder.
 *
 * The LAST plaintext digit of any intact 79-output packet is affine-linear
 * modulo 29 in the 29 unknown cyclic glyph labels. Fixing label(0)=0 leaves
 * 28 unknowns; 28 independent authentic terminal plaintext digits recover
 * the whole label permutation, and the remaining intact packets are exact
 * parity checks. This is conditional on the proposed packet architecture.
 *
 * Run: node sims/prime79_terminal_linear_crib.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const Q = 29;
const M = 79;
const K = 78;
const mod = n => ((n % Q) + Q) % Q;
const pow = (a, n) => {
  let x = 1;
  for (; n > 0; n = Math.floor(n / 2), a = mod(a * a))
    if (n % 2) x = mod(x * a);
  return x;
};
const inverse = a => {
  assert.notEqual(a, 0);
  return pow(a, Q - 2);
};

/** @param {number[]} ciphertext @param {number} phase */
function cleanStarts(ciphertext, phase) {
  const starts = [];
  for (let s = phase; s + M <= ciphertext.length; s += M) {
    if (s === 0) continue;
    let clean = true;
    for (let i = s; i < s + M; i++)
      if (ciphertext[i] === ciphertext[i - 1]) { clean = false; break; }
    if (clean) starts.push(s);
  }
  return starts;
}

/**
 * p[77]+1 = sum_g coefficients[g]*cyclicLabel[g] modulo29.
 * This uses 28 = -1 mod29, so no huge integers or unknown carries.
 * @param {number[]} cipher @param {number} start
 */
function terminalCoefficients(cipher, start) {
  const row = Array(Q).fill(0);
  for (let j = 0; j < M; j++) {
    const sign = j % 2 ? -1 : 1; // 28^(78-j) mod29 = (-1)^j
    row[cipher[start + j]] += sign;
    row[cipher[start + j - 1]] -= sign;
  }
  return row.map(mod);
}

/** @param {number[][]} rows */
function rank(rows) {
  if (!rows.length) return 0;
  const a = rows.map(r => r.slice());
  const cols = a[0].length;
  let r = 0;
  for (let col = 0; col < cols && r < a.length; col++) {
    let pivot = r;
    while (pivot < a.length && mod(a[pivot][col]) === 0) pivot++;
    if (pivot === a.length) continue;
    [a[r], a[pivot]] = [a[pivot], a[r]];
    const inv = inverse(mod(a[r][col]));
    for (let k = col; k < cols; k++) a[r][k] = mod(a[r][k] * inv);
    for (let i = r + 1; i < a.length; i++) {
      const f = mod(a[i][col]);
      if (f) for (let k = col; k < cols; k++)
        a[i][k] = mod(a[i][k] - f * a[r][k]);
    }
    r++;
  }
  return r;
}

/** Pick independent packet equations; 29th label is fixed by rotation. */
function independent(rows) {
  const indices = [], current = [];
  for (let i = 0; i < rows.length; i++) {
    const candidate = rows[i].slice(1);
    if (rank(current.concat([candidate])) > current.length) {
      indices.push(i);
      current.push(candidate);
    }
    if (indices.length === Q - 1) break;
  }
  return indices;
}

/**
 * Solve 28 independent equations for the original glyph->position ordering.
 * terminal[i] is the known GP index of the last of 78 plaintext digits.
 * @param {number[][]} rows @param {number[]} terminal
 * @param {number[]} chosen
 */
function recover(rows, terminal, chosen) {
  assert.equal(chosen.length, Q - 1);
  const a = chosen.map(i => rows[i].slice(1).concat([mod(terminal[i] + 1)]));
  const size = Q - 1;
  let r = 0;
  for (let col = 0; col < size; col++) {
    let pivot = r;
    while (pivot < size && a[pivot][col] === 0) pivot++;
    assert.ok(pivot < size, 'Known-terminal rows must be independent');
    [a[r], a[pivot]] = [a[pivot], a[r]];
    const inv = inverse(a[r][col]);
    for (let j = col; j <= size; j++) a[r][j] = mod(a[r][j] * inv);
    for (let i = 0; i < size; i++) {
      if (i === r) continue;
      const f = a[i][col];
      for (let j = col; j <= size; j++)
        a[i][j] = mod(a[i][j] - f * a[r][j]);
    }
    r++;
  }
  const order = [0].concat(a.map(row => row[size]));
  return order;
}

/** @param {number[]} row @param {number[]} labels */
function terminalFromRow(row, labels) {
  return mod(row.reduce((v, x, j) => v + x * labels[j], -1));
}

/** Numerically decode only a terminal GP digit for the given full ordering. */
function directTerminal(cipher, start, labels) {
  let last = 0;
  for (let j = 0; j < M; j++) {
    const digit = mod(labels[cipher[start + j]] - labels[cipher[start + j - 1]] - 1);
    assert.ok(digit < Q - 1);
    last = mod(28 * last + digit);
  }
  return last;
}

/** Source-independent planted 78->79 encoder with a hidden order. */
function plantedControl() {
  let seed = 0x33011553;
  const rand = () => {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    return seed >>> 0;
  };
  const labels = Array.from({length: Q}, (_, i) => i);
  for (let i = Q - 1; i > 0; i--) {
    const j = rand() % (i + 1);
    [labels[i], labels[j]] = [labels[j], labels[i]];
  }
  const rotation = labels[0];
  for (let i = 0; i < Q; i++) labels[i] = mod(labels[i] - rotation);
  const glyph = Array(Q);
  for (let i = 0; i < Q; i++) glyph[labels[i]] = i;
  const cipher = [17], lastValues = [];
  let previous = 17;
  const blockCount = 40;
  for (let b = 0; b < blockCount; b++) {
    const plaintext = Array.from({length: K}, () => rand() % Q);
    let integer = 0n;
    for (const x of plaintext) integer = integer * 29n + BigInt(x);
    const digits = Array(M).fill(0);
    for (let j = M - 1; j >= 0; j--) {
      digits[j] = Number(integer % 28n);
      integer /= 28n;
    }
    assert.equal(integer, 0n);
    for (const digit of digits) {
      previous = glyph[mod(labels[previous] + digit + 1)];
      cipher.push(previous);
    }
    lastValues.push(plaintext[K - 1]);
  }
  const starts = cleanStarts(cipher, 1);
  assert.equal(starts.length, blockCount);
  const rows = starts.map(s => terminalCoefficients(cipher, s));
  const selected = independent(rows);
  assert.equal(selected.length, Q - 1);
  for (let i = 0; i < starts.length; i++)
    assert.equal(directTerminal(cipher, starts[i], labels), lastValues[i]);
  const recovered = recover(rows, lastValues, selected);
  assert.deepEqual(recovered, labels);
  assert.deepEqual(lastValues, rows.map(r => terminalFromRow(r, recovered)));
  return {packets:blockCount, chosenTerminals:selected.length,
    hiddenPermutationRecovered:true, allTerminalsReproduced:blockCount};
}

function run() {
  const root = path.resolve(__dirname, '..');
  const corpus = JSON.parse(fs.readFileSync(path.join(root,
    'resources/liber-primus/lp2-corpus.json'), 'utf8'));
  const cipher = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
  assert.equal(cipher.length, 12956);
  const starts = cleanStarts(cipher, 35);
  assert.equal(starts.length, 95);
  const rows = starts.map(s => terminalCoefficients(cipher, s));
  assert.ok(rows.every(r => mod(r.reduce((a,b)=>a+b,0)) === 0));
  const chosen = independent(rows);
  assert.equal(chosen.length, Q - 1);
  const witness = [0,24,11,21,7,28,10,16,25,3,15,9,22,27,2,
    20,26,19,1,18,5,17,14,13,6,12,23,8,4];
  const hypothetical = starts.map((s,i)=>{
    const p = directTerminal(cipher, s, witness);
    assert.equal(p, terminalFromRow(rows[i], witness));
    return p;
  });
  const recovered = recover(rows, hypothetical, chosen);
  assert.deepEqual(recovered, witness);
  // A wrong supplied known-plaintext rune produces failures on heldout packets.
  const corrupted = hypothetical.slice();
  corrupted[chosen[0]] = mod(corrupted[chosen[0]] + 1);
  const wrong = recover(rows, corrupted, chosen);
  const heldout = rows.map((_,i)=>i).filter(i=>!chosen.includes(i));
  const heldoutErrors = heldout.filter(i =>
    terminalFromRow(rows[i], wrong) !== hypothetical[i]).length;
  assert.ok(heldoutErrors > 0);
  const output = {
    hypothesis:'Fixed global 78->79 radix transport with cyclic 29-glyph order',
    input:'Original unsolved LP2 12956 GP ciphertext indices',
    packetPhase:35, intactPackets:starts.length,
    firstSourceStarts:starts.slice(0,8),
    freeGlyphLabels:28, originalSourceRank:chosen.length,
    independentTerminalCribsNeeded:28,
    heldoutParityChecks:heldout.length,
    candidateWitnessChecks:starts.length, witnessErrors:0,
    corruptedOneKnownRuneHeldoutErrors:heldoutErrors,
    originalUnknownPlaintextRecovered:false,
    independentSyntheticControl:plantedControl(),
    interpretation:'Conditional known-plaintext key-recovery theorem, not an LP2 decryption.'
  };
  console.log(JSON.stringify(output, null, 2));
  return output;
}
if (require.main === module) run();
module.exports = {cleanStarts, terminalCoefficients, rank, independent, recover,
  terminalFromRow, directTerminal, plantedControl, run};
