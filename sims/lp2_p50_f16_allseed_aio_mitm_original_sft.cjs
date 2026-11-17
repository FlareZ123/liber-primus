'use strict';

/**
 * Exact all-secret GP29 F16 recurrence test, three possible singleton words
 * A/I/O, both additive and differential outputs, using a four-holdout
 * meet-in-the-middle gate. One original-input Node22 SFT, no file writes.
 * This is conditional on native plaintext segmentation; no key is inferred.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { factor16, singlesFromOriginal } = require('./lp2_p50_f16_allseed_singleton_original_sft.cjs');

const ROOT = path.resolve(__dirname, '..');
const mod = (x) => (x % 29 + 29) % 29;
const SIZE = 12956;
const STAGES = 16;
const WORDS = [24, 10, 3]; // Authentic GP29 A/I/O
const POW = [1, 29, 841, 24389];
const FIRST = [176, 244, 350, 530, 644, 792, 967, 1025,
  1062, 1250, 1316, 1545, 1814, 2148, 2375, 2428];

/** @param {number[]} characteristic @returns {number[][]} */
function stateRows(characteristic) {
  const out = [];
  for (let t = 0; t < SIZE; t++) {
    const row = Array(STAGES).fill(0);
    if (t < STAGES) row[t] = 1;
    else for (let lag = 1; lag <= STAGES; lag++) {
      const a = mod(-characteristic[lag]);
      for (let j = 0; j < STAGES; j++) row[j] = mod(row[j] + a * out[t - lag][j]);
    }
    out.push(row);
  }
  return out;
}

/** @param {number[][]} data @returns {number[][]} */
function inverse16(data) {
  const m = data.map((row, i) => [
    ...row, ...Array.from({ length: STAGES }, (_, j) => i === j ? 1 : 0)
  ]);
  assert.equal(m.length, STAGES);
  for (let j = 0; j < STAGES; j++) {
    let r = j;
    while (r < STAGES && m[r][j] === 0) r++;
    assert.ok(r < STAGES, 'Original first sixteen singleton states lack rank 16');
    [m[j], m[r]] = [m[r], m[j]];
    const inv = Array.from({ length: 28 }, (_, i) => i + 1)
      .find((k) => mod(k * m[j][j]) === 1);
    assert.ok(inv !== undefined);
    for (let k = 0; k < 32; k++) m[j][k] = mod(m[j][k] * inv);
    for (let i = 0; i < STAGES; i++) {
      if (i === j) continue;
      const coef = m[i][j];
      for (let k = 0; k < 32; k++) m[i][k] = mod(m[i][k] - coef * m[j][k]);
    }
  }
  return m.map((row) => row.slice(STAGES));
}

/** @param {number[]} a @param {number[]} b @returns {number} */
function dot(a, b) {
  let n = 0;
  for (let i = 0; i < STAGES; i++) n += a[i] * b[i];
  return n % 29;
}

/** @param {number[]} x @returns {number} */
function pack4(x) {
  return x[0] + POW[1] * x[1] + POW[2] * x[2] + POW[3] * x[3];
}

/**
 * Each 3^8 anchor half contributes four GF29 residue values.
 * The first four of 67 untouched singleton constraints are a fixed gate.
 * @param {number[][]} choices
 * @param {number[][]} weights
 * @param {number} start
 * @returns {{digits:number[], values:number[], residue:number[]}[]}
 */
function allHalf(choices, weights, start) {
  const combos = [];
  for (let encoded = 0; encoded < 6561; encoded++) {
    let code = encoded;
    const digits = [];
    const values = [];
    for (let i = 0; i < 8; i++) {
      const d = code % 3;
      digits.push(d);
      values.push(choices[start + i][d]);
      code = Math.floor(code / 3);
    }
    const residue = [];
    for (let k = 0; k < 4; k++) {
      let s = 0;
      for (let i = 0; i < 8; i++) s += weights[k][start + i] * values[i];
      residue.push(s % 29);
    }
    combos.push({ digits, values, residue });
  }
  return combos;
}

/**
 * Exhausts all 3^16 = 43,046,721 anchor states without brute forcing all of
 * them: 3^8 + 3^8 half sums, 4 original heldout equations, exact join, then
 * the untouched remaining 63 constraints.
 * @param {number[]} observed Original actual rune or delta at 83 singleton offsets
 * @param {number[][]} weights 67 source-locked heldout coefficient rows
 * @param {number[][]} inverse Anchor 16x16 GF29 inverse
 * @returns {{anchorsCovered:number,firstFourPass:number,fullSolutions:number,solutions:number[][],longestMatchedPrefix:number}}
 */
function recover(observed, weights, inverse) {
  assert.equal(observed.length, 83);
  const options = observed.map((c) => WORDS.map((p) => mod(c - p)));
  const left = new Map();
  for (const combo of allHalf(options, weights, 0)) {
    const code = pack4(combo.residue);
    if (!left.has(code)) left.set(code, []);
    left.get(code).push(combo);
  }
  const targets = [];
  for (let code = 0; code < 81; code++) {
    let n = code;
    const t = [];
    for (let j = 0; j < 4; j++) {
      t.push(options[STAGES + j][n % 3]);
      n = Math.floor(n / 3);
    }
    targets.push(t);
  }

  let firstFourPass = 0;
  let longest = STAGES;
  const solutions = [];
  for (const right of allHalf(options, weights, 8)) {
    for (const target of targets) {
      const need = target.map((x, j) => mod(x - right.residue[j]));
      const candidates = left.get(pack4(need));
      if (!candidates) continue;
      for (const l of candidates) {
        firstFourPass++;
        const candidate = l.values.concat(right.values);
        let valid = true;
        let matched = STAGES + 4;
        for (let j = 4; j < weights.length; j++) {
          const k = dot(weights[j], candidate);
          if (!options[STAGES + j].includes(k)) { valid = false; break; }
          matched++;
        }
        if (matched > longest) longest = matched;
        if (valid) solutions.push(inverse.map((row) => dot(row, candidate)));
      }
    }
  }
  return {
    anchorsCovered: 43046721,
    firstFourPass,
    longestMatchedPrefix: longest,
    fullSolutions: solutions.length,
    solutions
  };
}

/**
 * @param {{offset:number,c:number}[]} singles
 * @param {number[]} ciphertext Entire original 12,956 GP29 rune tape
 * @param {number[]} nativeP57 Authentic p57 cleartext controls (95 runes)
 * @returns {object}
 */
function run(singles, ciphertext, nativeP57, characteristic = factor16(), expected = [4934, 5025]) {
  assert.equal(singles.length, 83);
  assert.equal(ciphertext.length, SIZE);
  assert.equal(nativeP57.length, 95);
  assert.deepEqual(singles.slice(0, STAGES).map((w) => w.offset), FIRST);
  const rows = stateRows(characteristic);
  const matrix = singles.map((s) => rows[s.offset]);
  const inverse = inverse16(matrix.slice(0, STAGES));
  const weights = matrix.slice(STAGES).map((row) =>
    Array.from({ length: STAGES }, (_, j) =>
      mod(row.reduce((s, v, i) => s + v * inverse[i][j], 0))));

  const direct = recover(singles.map((w) => w.c), weights, inverse);
  const delta = recover(singles.map((w) => mod(ciphertext[w.offset] - ciphertext[w.offset - 1])), weights, inverse);
  assert.equal(direct.firstFourPass, expected[0]);
  assert.equal(direct.fullSolutions, 0);
  assert.equal(delta.firstFourPass, expected[1]);
  assert.equal(delta.fullSolutions, 0);

  const trueSeed = [3258, 3222, 3152, 3038, 3278, 3299, 3298, 2838,
    3288, 3294, 3296, 2472, 4516, 1206, 708, 1820].map(mod);
  const native = Array.from({ length: SIZE }, (_, i) => nativeP57[i % 95]);
  singles.forEach((w, i) => { native[w.offset] = (i & 1) ? 10 : 24; });
  const increments = native.map((v, i) => mod(v + dot(rows[i], trueSeed)));
  const chained = [];
  for (let i = 0; i < SIZE; i++) chained.push(mod(increments[i] + (chained[i - 1] || 0)));
  const directPlant = recover(singles.map((w) => increments[w.offset]), weights, inverse);
  const deltaPlant = recover(singles.map((w) => mod(chained[w.offset] - chained[w.offset - 1])), weights, inverse);
  for (const result of [directPlant, deltaPlant]) {
    assert.equal(result.fullSolutions, 1);
    assert.deepEqual(result.solutions[0], trueSeed);
    assert.equal(result.longestMatchedPrefix, 83);
  }
  const recoveredDirect = increments.map((c, i) => mod(c - dot(rows[i], trueSeed)));
  const recoveredChain = chained.map((c, i) => mod(c - (chained[i - 1] || 0) - dot(rows[i], trueSeed)));
  assert.deepEqual(recoveredDirect, native);
  assert.deepEqual(recoveredChain, native);
  assert.deepEqual(recoveredDirect.map((p, i) => mod(p + dot(rows[i], trueSeed))), increments);
  let acc = 0;
  const fullReencrypted = recoveredChain.map((p, i) => { acc = mod(acc + p + dot(rows[i], trueSeed)); return acc; });
  assert.deepEqual(fullReencrypted, chained);

  return {
    originalCiphertextRunes: SIZE,
    printedWords: 2896,
    originalSingletonWords: 83,
    nativeOneRunePlaintextAlphabet: 'A I O',
    exactSecretAnchorChoices: 43046721,
    heldoutConstraints: 67,
    direct,
    differential: delta,
    directPositive: { solutions: directPlant.fullSolutions, recoveredSeed: directPlant.solutions[0] },
    differentialPositive: { solutions: deltaPlant.fullSolutions, recoveredSeed: deltaPlant.solutions[0] },
    syntheticFullTapeRoundTrip: recoveredDirect.length,
    recoveredUnknownPlaintext: false
  };
}

function main() {
  const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
  const txt = fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');
  const grid = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
  const bytes = grid.byte_rows.flat();
  assert.equal(bytes.length, 256);
  assert.equal(createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
    '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
  const f = factor16();
  const rem = bytes.map(mod);
  for (let i = 0; i < 240; i++) {
    const q = rem[i];
    for (let j = 0; j < f.length; j++) rem[i + j] = mod(rem[i + j] - q * f[j]);
  }
  assert.ok(rem.every((x) => x === 0));
  const tape = corpus.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
  const singles = singlesFromOriginal(txt, corpus.runes);
  assert.ok(singles.every((w) => w.c === tape[w.offset]));
  const p57 = corpus.pages.find((p) => p.page === 57).indices;
  const reversed = f.slice().reverse().map((v) => mod(v * 9));
  assert.equal(reversed[0], 1);
  const forward = run(singles, tape, p57);
  const backward = run(singles, tape, p57, reversed, [4862, 4953]);
  console.log(JSON.stringify({ status: 'PASS: source-original A/I/O 43m exact MITM both recurrence orientations', ...forward, reversedCharacteristic: reversed, reversedSource: backward }, null, 2));
}

if (require.main === module) main();
module.exports = { run, recover };
