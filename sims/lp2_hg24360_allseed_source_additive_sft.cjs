'use strict';

/**
 * Original-source finite all-IV test for the signed-H × p39-red-G order-4
 * GF(29) additive keystream. Run with Node.js 22 from any working directory:
 * node sims/lp2_hg24360_allseed_source_additive_sft.cjs
 *
 * A native solved-Cicada positive is included. The candidate LFSR opcode is
 * hypothetical, not authenticated as an instruction from Cicada.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = name => JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '..', 'resources', 'liber-primus', name), 'utf8'));
const src = read('lp2-corpus.json');
const grid = read('lp2-grid-256.json');
const P = 29;
const HG = [23, 21, 11, 17, 12];
const LENGTH = 256;
const mod = x => (x % P + P) % P;

/** @param {number} a @returns {number} */
function inverse(a) {
  for (let k = 1; k < P; k++) if (mod(a * k) === 1) return k;
  throw new Error('noninvertible coefficient');
}

/**
 * @param {number[]} coefficients Ascending polynomial coefficients.
 * @param {number[]} divisor Ascending nonzero polynomial coefficients.
 * @returns {number[]} Remainder in GF(29).
 */
function remainder(coefficients, divisor) {
  const out = coefficients.map(mod);
  const inv = inverse(divisor[divisor.length - 1]);
  for (let i = out.length - divisor.length; i >= 0; i--) {
    const t = mod(out[i + divisor.length - 1] * inv);
    for (let j = 0; j < divisor.length; j++) {
      out[i + j] = mod(out[i + j] - t * divisor[j]);
    }
  }
  return out.slice(0, divisor.length - 1);
}

/**
 * @param {number[]} seed Initial four GP29 symbols.
 * @param {number} n Desired number of positions.
 * @returns {number[]} Source-factor recurrence.
 */
function stream(seed, n) {
  const k = seed.slice();
  while (k.length < n) {
    const i = k.length;
    k.push(mod(-17 * (23 * k[i - 4] + 21 * k[i - 3] +
      11 * k[i - 2] + 17 * k[i - 1])));
  }
  return k.slice(0, n);
}

/**
 * @param {ArrayLike<number>} a
 * @returns {number} Numerator of unbiased GP29 IoC.
 */
function collisionScore(a) {
  const f = new Uint16Array(P);
  for (const x of a) f[x]++;
  let count = 0;
  for (const v of f) count += v * (v - 1);
  return count;
}

const red = src.pages.find(p => p.page === 39).indices.slice(119, 122);
assert.deepEqual(red, [27, 5, 15]);
assert.deepEqual(src.pages.filter(p => p.page <= 55)
  .reduce((n, p) => n + p.indices.length, 0), 12956);
assert.deepEqual(grid.bytes.length, 256);
assert.deepEqual(grid.bytes.slice(0, 4).map(mod), [0, 28, 22, 12]);
const H = [3, 26, 24];
assert.deepEqual(HG, [23, 21, 11, 17, 12]);
const c = grid.bytes.slice().reverse();
for (const [g, expected] of [
  [H, [0, 0]], [red, [0, 0]], [HG, [0, 0, 0, 0]]]) {
  assert.deepEqual(remainder(c, g), expected);
}
const nativeSeed = grid.bytes.slice(0, 4).map(mod);
const period = 24360;
const full = stream(nativeSeed, 2 * period);
assert.deepEqual(full.slice(0, period), full.slice(period));
for (const primeFactor of [2, 3, 5, 7, 29]) {
  const shorter = period / primeFactor;
  assert.notDeepEqual(full.slice(0, period),
    full.slice(shorter, shorter + period));
}

/** @type {Uint8Array[]} Four unit-seeded keystream basis vectors. */
const basis = Array.from({ length: 4 }, (_, j) => {
  const e = [0, 0, 0, 0];
  e[j] = 1;
  return Uint8Array.from(stream(e, LENGTH));
});
const multiply = Array.from({ length: 29 }, (_, a) =>
  Uint8Array.from({ length: 29 }, (_, b) => (a * b) % P));

/**
 * Exhaustively evaluate every 29^4 seed, with the unmodified source order,
 * one continuous clock per 256-rune window and no fitted symbol relabeling.
 * The plus sign needs no separate pass: negating all 4 seeds includes it.
 *
 * @param {number[]} cipher First 256 contiguous source GP29 symbols.
 * @returns {{score:number,seed:number[],above38:number,above40:number,above42:number}}
 */
function exhaust(cipher) {
  assert.equal(cipher.length, LENGTH);
  const freq = new Uint16Array(P);
  const partial = new Uint8Array(LENGTH);
  let best = -1;
  let seed = [];
  let above38 = 0;
  let above40 = 0;
  let above42 = 0;
  const denom = LENGTH * (LENGTH - 1);
  for (let a = 0; a < 29; a++) {
    for (let b = 0; b < 29; b++) {
      for (let cc = 0; cc < 29; cc++) {
        for (let i = 0; i < LENGTH; i++) {
          partial[i] = mod(cipher[i] - basis[0][i] * a -
            basis[1][i] * b - basis[2][i] * cc);
        }
        for (let d = 0; d < 29; d++) {
          freq.fill(0);
          for (let i = 0; i < LENGTH; i++) {
            const z = partial[i] - multiply[basis[3][i]][d];
            freq[z < 0 ? z + 29 : z]++;
          }
          let score = 0;
          for (const v of freq) score += v * (v - 1);
          if (score > best) {
            best = score;
            seed = [a, b, cc, d];
          }
          if (score / denom >= 0.038) above38++;
          if (score / denom >= 0.040) above40++;
          if (score / denom >= 0.042) above42++;
        }
      }
    }
  }
  return { score: best, seed, above38, above40, above42 };
}

/**
 * @param {number} first
 * @param {number} last
 * @returns {number[]} Original pages, no invented separators or glyphs.
 */
function span(first, last) {
  return src.pages.filter(p => p.page >= first && p.page <= last)
    .flatMap(p => p.indices);
}

// Positive original-author solved-LP1 textual control (page 6 koan),
// preserved as a separate editor-normalized source: no unknown text planted.
const lp1 = fs.readFileSync(path.resolve(__dirname, '..', 'resources',
  'liber-primus', 'lp1-plaintext-reference.txt'), 'utf8');
const koan = 'A MAN DECIDED TO GO' +
  lp1.split('### 6')[1].split('### 7')[0]
    .split('A MAN DECIDED TO GO')[1];
const canonical = koan.replace(/[^A-Z]/g, '')
  .replace(/[KVZQ]/g, x => ({ K: 'C', V: 'U', Z: 'S', Q: 'C' })[x]);
const tokens = src.translit.slice().sort((a, b) => b.length - a.length);
const ranking = new Map(src.translit.map((token, rank) => [token, rank]));
const native = [];
let pos = 0;
while (native.length < LENGTH) {
  const token = tokens.find(t => canonical.startsWith(t, pos));
  assert.ok(token, 'native positive GP29 encoding must cover source text');
  native.push(ranking.get(token));
  pos += token.length;
}
assert.equal(collisionScore(native), 4254);
const plantSeed = [11, 18, 15, 12];
const plantPad = stream(plantSeed, LENGTH);
const encrypted = native.map((x, i) => mod(x + plantPad[i]));
assert.deepEqual(encrypted.map((x, i) => mod(x - plantPad[i])), native);
assert.equal(collisionScore(encrypted), 2264);
console.log('POSITIVE', JSON.stringify({
  source: 'LP1 original solved koan, source-native GP29 transliteration',
  length: native.length, nativeIoC: collisionScore(native) / (LENGTH * 255),
  ciphertextIoC: collisionScore(encrypted) / (LENGTH * 255),
  exactRecovery: true
}));

for (const w of [
  { label: 'p16-21:first256', start: 16, end: 21,
    expectedScore: 2694, expectedSeed: [11, 18, 15, 12] },
  { label: 'p40-55:first256', start: 40, end: 55,
    expectedScore: 2736, expectedSeed: [26, 0, 28, 28] },
  { label: 'p51-55:first256', start: 51, end: 55,
    expectedScore: 2736, expectedSeed: [24, 1, 6, 24] }
]) {
  const observed = exhaust(span(w.start, w.end).slice(0, LENGTH));
  assert.equal(observed.score, w.expectedScore, w.label);
  assert.deepEqual(observed.seed, w.expectedSeed, w.label);
  assert.equal(observed.above42, 0, w.label);
  console.log('ALL_IV', JSON.stringify({
    ...observed, label: w.label, originalRunes: LENGTH, testedKeys: 29 ** 4,
    maxIoC: observed.score / (LENGTH * 255)
  }));
}

/** @param {number[]} v @returns {number[]} Multiplication by x mod HG. */
function companionPlus(v) {
  return [mod(-391 * v[3]), mod(v[0] - 357 * v[3]),
    mod(v[1] - 187 * v[3]), mod(v[2] - 289 * v[3])];
}
/** @param {number[]} v @returns {number[]} Inverse multiplication by x mod HG. */
function companionMinus(v) {
  const last = mod(2 * v[0]);
  return [mod(v[1] + 9 * last), mod(v[2] + 13 * last),
    mod(v[3] + 28 * last), last];
}
for (let j = 0; j < 4; j++) {
  const unit = Array.from({length: 4}, (_, i) => i === j ? 1 : 0);
  assert.deepEqual(companionMinus(companionPlus(unit)), unit);
  let v = unit.slice();
  for (let t = 0; t < period; t++) v = companionPlus(v);
  assert.deepEqual(v, unit);
}

/**
 * Original 4-rune block matrix clock, a distinct reversible hypothetical
 * receiver induced by the same source HG. The phase scans exhaust its full
 * 24,360 rotations in both x^block and x^-block orientations.
 * @param {number[]} cipher Contiguous original GP29 ciphertext; length multiple of 4.
 * @param {1|-1} sign
 * @returns {{score:number,phase:number,above42:number}}
 */
function companionPhaseScan(cipher, sign) {
  assert.equal(cipher.length % 4, 0);
  const op = sign === 1 ? companionPlus : companionMinus;
  const regs = [];
  for (let j = 0; j < cipher.length / 4; j++) {
    let v = cipher.slice(4 * j, 4 * j + 4);
    for (let k = 0; k < j; k++) v = op(v);
    regs.push(v);
  }
  const freq = new Uint16Array(29);
  const denom = cipher.length * (cipher.length - 1);
  let scoreMax = -1;
  let phase = -1;
  let above42 = 0;
  for (let t = 0; t < period; t++) {
    freq.fill(0);
    for (let i = 0; i < regs.length; i++) {
      const v = regs[i];
      freq[v[0]]++;
      freq[v[1]]++;
      freq[v[2]]++;
      freq[v[3]]++;
      regs[i] = op(v);
    }
    let score = 0;
    for (const n of freq) score += n * (n - 1);
    if (score > scoreMax) {
      scoreMax = score;
      phase = t;
    }
    if (score / denom >= 0.042) above42++;
  }
  return {score: scoreMax, phase, above42};
}

/**
 * @param {number[]} tape Four-rune aligned GP29 tape.
 * @param {(v:number[])=>number[]} op Per-block source-matrix operator.
 * @returns {number[]}
 */
function companionClock(tape, op) {
  assert.equal(tape.length % 4, 0);
  const out = [];
  for (let j = 0; j < tape.length / 4; j++) {
    let v = tape.slice(4 * j, 4 * j + 4);
    for (let k = 0; k < j; k++) v = op(v);
    out.push(...v);
  }
  return out;
}

// Same genuine solved LP1 koan extended to 512 consecutive GP runes.
const native512 = native.slice();
while (native512.length < 512) {
  const token = tokens.find(t => canonical.startsWith(t, pos));
  assert.ok(token);
  native512.push(ranking.get(token));
  pos += token.length;
}
const nativeCipher512 = companionClock(native512, companionMinus);
assert.deepEqual(companionClock(nativeCipher512, companionPlus), native512);
assert.ok(collisionScore(native512) / (512 * 511) > 0.060);
console.log('COMPANION_NATIVE_POSITIVE', JSON.stringify({
  source: 'genuine solved LP1 KOAN',
  length: 512, nativeIoC: collisionScore(native512) / (512 * 511),
  ciphertextIoC: collisionScore(nativeCipher512) / (512 * 511),
  recovered: 512
}));

for (const check of [
  {span:'p16-21:first1024',a:16,b:21,sign:1,score:37894,phase:11},
  {span:'p16-21:first1024',a:16,b:21,sign:-1,score:37610,phase:1774},
  {span:'p40-53:first1024',a:40,b:53,sign:1,score:37624,phase:1674},
  {span:'p40-53:first1024',a:40,b:53,sign:-1,score:37594,phase:16294}
]) {
  const input = span(check.a,check.b).slice(0, 1024);
  assert.equal(input.length, 1024);
  const result = companionPhaseScan(input, check.sign);
  assert.equal(result.score, check.score, check.span);
  assert.equal(result.phase, check.phase, check.span);
  assert.equal(result.above42, 0, check.span);
  console.log('COMPANION_ALL_PHASE', JSON.stringify({
    span: check.span, orientation: check.sign, originalRunes: 1024,
    testedPhases: period, maxIoC: result.score / (1024 * 1023), ...result
  }));
}


/**
 * @param {number[]} a Four ascending GF29 polynomial coefficients.
 * @param {number[]} b Four ascending GF29 polynomial coefficients.
 * @returns {number[]} Product modulo the authentic degree-four HG.
 */
function ringMultiply(a, b) {
  const z = Array(7).fill(0);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) z[i + j] = mod(z[i + j] + a[i] * b[j]);
  }
  for (let i = 6; i >= 4; i--) {
    const factor = mod(17 * z[i]);
    for (let j = 0; j < 5; j++) {
      z[i - 4 + j] = mod(z[i - 4 + j] - factor * HG[j]);
    }
  }
  return z.slice(0, 4);
}

/**
 * @param {number[]} u Four-coordinate ring element.
 * @returns {number[]|null} Multiplicative inverse or null if zero divisor.
 */
function ringInverse(u) {
  const rows = Array.from({length: 4}, (_, i) =>
    Array.from({length: 5}, (_, j) => j === 4
      ? Number(i === 0)
      : ringMultiply(u, Array.from({length: 4}, (_, k) =>
        Number(k === j)))[i]));
  for (let col = 0; col < 4; col++) {
    const pivot = rows.findIndex((row, i) => i >= col && row[col] !== 0);
    if (pivot < 0) return null;
    [rows[col], rows[pivot]] = [rows[pivot], rows[col]];
    const factor = inverse(rows[col][col]);
    for (let j = col; j < 5; j++) rows[col][j] = mod(rows[col][j] * factor);
    for (let i = 0; i < 4; i++) {
      if (i === col) continue;
      const t = rows[i][col];
      for (let j = col; j < 5; j++) {
        rows[i][j] = mod(rows[i][j] - t * rows[col][j]);
      }
    }
  }
  return rows.map(row => row[4]);
}

/**
 * @param {number[]} v Four GP29 runes.
 * @param {(v:number[])=>number[]} op Fixed quartic multiplier.
 * @param {number} times
 * @returns {number[]}
 */
function applyPower(v, op, times) {
  let output = v.slice();
  for (let i = 0; i < times; i++) output = op(output);
  return output;
}
const terminal = [55, 56, 57].map(page =>
  src.pages.find(p => p.page === page));
assert.deepEqual(terminal.map(p => p.indices.length), [76, 85, 95]);
const terminalKnown = terminal[2].indices;
// 76+85=161; complete p57 rune blocks begin at table offset164,
// a genuine original non-tuned alignment containing 23 whole four-rune blocks.
const firstKnownBlock = 41;
assert.equal(firstKnownBlock * 4 - (76 + 85), 3);

/**
 * Recover the only secret ring multiplier U from the first complete
 * original p57 four-rune known-plaintext block, then predict all other
 * complete p57 blocks. Any global phase M^t absorbs into U, so the
 * test exhausts every fixed phase and every fixed 4-coordinate secret U
 * for the exact terminal-page alignment, whenever the source block is
 * invertible (which it is for each authentic tested orientation).
 *
 * @param {number[]} tape 256 GF29 source table residues.
 * @param {1|-1} direction Source-block moving clock.
 * @returns {{u:number[],runes:number,wholeBlocks:number}}
 */
function terminalKnownReceiver(tape, direction) {
  assert.equal(tape.length, 256);
  const op = direction === 1 ? companionPlus : companionMinus;
  const firstCipher = applyPower(tape.slice(164, 168), op, firstKnownBlock);
  const firstInv = ringInverse(firstCipher);
  assert.ok(firstInv, 'first original p57 input block must be invertible');
  const u = ringMultiply(terminalKnown.slice(3, 7), firstInv);
  const results = {u, runes: 0, wholeBlocks: 0};
  for (let block = firstKnownBlock; block < 64; block++) {
    const cipher = tape.slice(4 * block, 4 * block + 4);
    const decoded = ringMultiply(u, applyPower(cipher, op, block));
    const gold = terminalKnown.slice(4 * block - 161, 4 * block + 4 - 161);
    if (decoded.every((v, i) => v === gold[i])) results.wholeBlocks++;
    for (let i = 0; i < 4; i++) if (decoded[i] === gold[i]) results.runes++;
  }
  return results;
}

// Solved-native positive: generate an independently encrypted terminal
// 23-block native p57 ciphertext under a full-rank source-table-derived U.
const knownUnit = grid.bytes.slice(0, 4).map(mod);
const knownUnitInverse = ringInverse(knownUnit);
assert.ok(knownUnitInverse);
assert.deepEqual(ringMultiply(knownUnit, knownUnitInverse), [1, 0, 0, 0]);
const syntheticTerminal = Array(256).fill(0);
for (let block = firstKnownBlock; block < 64; block++) {
  const plaintext = terminalKnown.slice(4 * block - 161, 4 * block + 4 - 161);
  const cipher = applyPower(ringMultiply(knownUnitInverse, plaintext),
    companionMinus, block);
  syntheticTerminal.splice(4 * block, 4, ...cipher);
}
const posTest = terminalKnownReceiver(syntheticTerminal, 1);
assert.deepEqual(posTest, {u: knownUnit, runes: 92, wholeBlocks: 23});
console.log('TERMINAL_KNOWN_POSITIVE', JSON.stringify({
  originalNativeSource: 'LP2 p57 92 complete GP29 runes',
  knownKey: knownUnit, recoveredKey: posTest.u,
  recovered: posTest.runes, blocks: posTest.wholeBlocks
}));

for (const check of [
  {order: 'printed', direction: 1, runes: 8,
    u: [18, 26, 13, 12]},
  {order: 'printed', direction: -1, runes: 7,
    u: [0, 0, 4, 10]},
  {order: 'reverse', direction: 1, runes: 10,
    u: [5, 3, 26, 12]},
  {order: 'reverse', direction: -1, runes: 7,
    u: [14, 3, 15, 8]}
]) {
  const printed = check.order === 'printed'
    ? grid.bytes : grid.bytes.slice().reverse();
  const sourceTape = printed.map(mod);
  const result = terminalKnownReceiver(sourceTape, check.direction);
  assert.deepEqual(result.u, check.u, check.order);
  assert.equal(result.runes, check.runes, check.order);
  assert.equal(result.wholeBlocks, 1, check.order);
  console.log('TERMINAL_KNOWN_ORIGINAL', JSON.stringify({
    order: check.order, direction: check.direction,
    knownSourceRunes: 92, calibratedSourceRunes: 4,
    heldOutRunes: 88, heldOutRecovered: result.runes - 4,
    ...result
  }));
}
console.log('PASS: source HG all-IV scalar, all-phase companion, and terminal p57 known-plaintext receiver fail to decrypt unknown LP2');


