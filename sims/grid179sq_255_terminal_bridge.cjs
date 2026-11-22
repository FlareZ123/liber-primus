'use strict';
/**
 * Source-derived 255-byte key candidate from the LP2 printed 256-byte table.
 *
 * Canonical 32x8 grid integer N is divisible by 179^2. N/(179^2) occupies
 * exactly 255 bytes, equal to the combined rune count of terminal illustrated
 * physical pages 53 and 55 (179+76). Independently selected from original
 * source arithmetic and page lengths; no original plaintext/key is claimed.
 *
 * Tests a narrow direct GP29 additive pad and the existing lossless
 * primitive-root-15 F29 feedback candidate against source-original runes.
 * Includes a known-solved-p56 native-GP ciphertext plant and exact replay.
 *
 * Pure read-only CommonJS. Requires Node.js 22.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} relative @returns {any} */
const read = relative => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const grid = read('resources/liber-primus/base60-grid.json');
const ink = read('resources/liber-primus/lp2-ink-annotations.json');
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
const page53 = pages.find(p => p.page === 53);
const page55 = pages.find(p => p.page === 55);
assert.equal(pages.length, 55);
assert.equal(pages.flatMap(p => p.indices).length, 12956);
assert.equal(page53.indices.length, 179);
assert.equal(page55.indices.length, 76);
const red53 = ink.pages.find(p => p.page === 53).red_spans[0];
assert.equal(red53.start, 128);
assert.equal(red53.length, 51);
const pairs = [];
for(let i = 0; i < pages.length; i++)
  for(let j = i+1; j < pages.length; j++)
    if(pages[i].indices.length + pages[j].indices.length === 255)
      pairs.push([pages[i].page, pages[j].page]);
assert.deepEqual(pairs, [[53, 55]]);

const input = grid.byte_rows.flat();
assert.equal(input.length, 256);
assert.equal(createHash('sha256').update(Buffer.from(input)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const N = input.reduce((s, b) => s * 256n + BigInt(b), 0n);
const factor = 179n * 179n;
assert.equal(N % factor, 0n);
assert.notEqual(N % (factor * 179n), 0n);
let q = N / factor;
const key = [];
while(q) {
  key.unshift(Number(q % 256n));
  q /= 256n;
}
assert.equal(key.length, 255);

const sourceRed = Array.from(red53.runes, r => corpus.runes.indexOf(r));
assert.deepEqual(sourceRed, page53.indices.slice(128));
const R = sourceRed.reduce((s, v) => s * 29n + BigInt(v), 0n);
assert.equal(R % 179n, 0n);
const to29 = (b, rule) => rule === 'mod' ? b % 29 : Math.floor(29 * b / 256);
const to28 = (b, rule) => rule === 'mod' ? b % 28 : Math.floor(28 * b / 256);
/** @param {number} v @param {number} n */
const mod = (v, n) => (v % n + n) % n;
/** @param {number[]} xs */
function ioc(xs) {
  const f = Array(29).fill(0);
  for(const x of xs) f[x]++;
  return f.reduce((sum, n) => sum + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}
function peek(xs) {
  return xs.slice(0, 75).map(i => corpus.translit[i]).join('');
}
/**
 * @param {number[][]} seq
 * @param {'mod'|'scale'} rule
 * @param {-1|1} sign
 * @param {boolean} reversed
 * @returns {number[][]}
 */
function gpDecrypt(seq, rule, sign, reversed = false) {
  const bytes = reversed ? key.slice().reverse() : key;
  let global = 0;
  return seq.map(page => page.map(c => {
    const k = to29(bytes[(global++) % 255], rule);
    return mod(c + sign * k, 29);
  }));
}
function gpEncrypt(seq, rule, sign, reversed = false) {
  return gpDecrypt(seq, rule, -sign, reversed);
}
const power = [];
let v = 1;
for(let i = 0; i < 28; i++) {
  power.push(v);
  v = v * 15 % 29;
}
assert.equal(new Set(power).size, 28);
const log = Array(29).fill(-1);
power.forEach((x, i) => { log[x] = i; });
/**
 * Page-initial rune is transparent. Immediate repeat becomes GP-EA(28).
 * @param {number[][]} seq
 * @param {'mod'|'scale'} rule
 * @param {'continuous'|'reset'} clock
 */
function eaDecrypt(seq, rule, clock) {
  let global = 0;
  return seq.map(page => {
    const out = [page[0]];
    for(let i = 1; i < page.length; i++) {
      const k = to28(key[((clock === 'reset' ? 0 : global) + i) % 255], rule);
      const delta = mod(page[i] - page[i-1], 29);
      out.push(delta === 0 ? 28 : mod(log[delta] - k, 28));
    }
    global += page.length;
    return out;
  });
}
function eaEncrypt(seq, rule, clock) {
  let global = 0;
  return seq.map(page => {
    const out = [page[0]];
    for(let i = 1; i < page.length; i++) {
      const k = to28(key[((clock === 'reset' ? 0 : global) + i) % 255], rule);
      out.push(page[i] === 28 ? out[i-1] :
        mod(out[i-1] + power[(page[i] + k) % 28], 29));
    }
    global += page.length;
    return out;
  });
}
/** Exact authentic solved-p56 phi(prime) control, with literal-F at rune 56. */
function nativeSolved85() {
  const c = corpus.pages.find(p => p.page === 56).indices;
  assert.equal(c.length, 85);
  const primes = [];
  for(let n=2; primes.length < 84; n++)
    if(primes.every(p => n % p !== 0)) primes.push(n);
  let j = 0;
  const plaintext = c.map((value, i) =>
    i === 56 ? value : mod(value - (primes[j++] - 1), 29));
  assert.equal(j, 84);
  assert.equal(plaintext.slice(0,5).map(v => corpus.translit[v]).join(''), 'ANEND');
  return plaintext;
}
const known = nativeSolved85();
const native = [...known, ...known, ...known];
assert.equal(native.length, 255);
const plant = [native.slice(0,179), native.slice(179)];
const terminal = [page53.indices, page55.indices];
const all = pages.map(p => p.indices);
const candidates = [];
for(const rule of ['mod', 'scale'])
  for(const sign of [-1, 1])
    for(const reversed of [false, true]) {
      const decoded = gpDecrypt(terminal, rule, sign, reversed);
      assert.deepEqual(gpEncrypt(decoded, rule, sign, reversed), terminal);
      const synthetic = gpEncrypt(plant, rule, sign, reversed);
      assert.deepEqual(gpDecrypt(synthetic, rule, sign, reversed), plant);
      const d = decoded.flat();
      candidates.push({register:'GP29-additive', rule, sign, reversed,
        terminalIoC:ioc(d), first75:peek(d)});
    }
for(const rule of ['mod', 'scale'])
  for(const clock of ['continuous', 'reset']) {
    const decoded = eaDecrypt(terminal, rule, clock);
    assert.deepEqual(eaEncrypt(decoded, rule, clock), terminal);
    const synthetic = eaEncrypt(plant, rule, clock);
    assert.deepEqual(eaDecrypt(synthetic, rule, clock), plant);
    const allDecoded = eaDecrypt(all, rule, clock);
    assert.deepEqual(eaEncrypt(allDecoded, rule, clock), all);
    const repeated = allDecoded.flat().filter(v => v === 28).length;
    assert.ok(repeated >= 86, 'Source doublets missing');
    candidates.push({register:'F29-feedback-EA28', rule, clock,
      terminalIoC:ioc(decoded.flat()), fullIoC:ioc(allDecoded.flat()),
      repeatedEA:repeated, first75:peek(decoded.flat()),
      fullFirst75:peek(allDecoded.flat())});
  }
const max = Math.max(...candidates.map(c => c.terminalIoC));
assert.ok(max < 0.04, 'Unexpected nonuniform recovered terminal signal');
console.log(JSON.stringify({
  experiment:'source-locked N/(179*179) byte pad, terminal p53/p55',
  originalGridBytes:input.length, gridQuotientBytes:key.length,
  highlightedTerminalRunes:[page53.indices.length,page55.indices.length],
  red53Runes:red53.length, redNumeralDivisibleBy179:true,
  trueSolvedReference:known.length, nativePlantLength:native.length,
  originalTerminalIoC:ioc(terminal.flat()),
  nativePlantIoC:ioc(native), candidates
}, null, 2));
