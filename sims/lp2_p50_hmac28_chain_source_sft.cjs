'use strict';

/**
 * #1451: one frozen whole-table HMAC-SHA256 -> GP29 28-successor cipher.
 * Run on Windows Node22: node sims/lp2_p50_hmac28_chain_source_sft.cjs
 *
 * Hypothesis, not a known Cicada mechanism:
 *   - Original p49-p51 table bytes, row-major, are a 256-byte HMAC key.
 *   - HMAC-SHA256 key expansion on four-byte BE counters starting at zero.
 *   - Consume bytes <252, mapping byte %28 to a fair digit in 0..27.
 *   - One continuous book clock, no reset at physical pages or words.
 *   - First rune C0=(P0+k0) mod29.
 *   - For i>0, P=EA(index28) gives C_i=C_(i-1).
 *     Other P in 0..27 gives C_i=C_(i-1)+1+((P_i+k_i)%28) mod29.
 * There is NO evidence the authors selected this KDF or EA exception.
 * This finite test is distinct from column AES-CTR/additive p50 routes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
function read(name) { return fs.readFileSync(path.join(root, name), 'utf8'); }
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const table = Buffer.from(grid.bytes);
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const cipher = pages.flatMap(p => p.indices);
assert.equal(table.length, 256);
assert.equal(pages.length, 55);
assert.equal(cipher.length, 12956);
assert.equal(corpus.translit.length, 29);
assert.equal(corpus.translit[28], 'EA');

/** @param {number} n @returns {number} */
function mod29(n) { return (n % 29 + 29) % 29; }

/**
 * Counter KDF is fully specified; HMAC standard was available by 2014.
 * Rejection b >=252 ensures uniform mapping to 28 possible nonzero steps.
 * @param {Buffer} source
 * @param {number} n
 * @returns {number[]}
 */
function pad(source, n) {
  const result = [];
  let counter = 0;
  while (result.length < n) {
    const input = Buffer.alloc(4);
    input.writeUInt32BE(counter++);
    const hash = crypto.createHmac('sha256', source).update(input).digest();
    for (const byte of hash) {
      if (byte < 252) result.push(byte % 28);
      if (result.length === n) break;
    }
  }
  return result;
}

/** @param {number[]} plain @param {number[]} k @returns {number[]} */
function encrypt(plain, k) {
  assert.equal(plain.length, k.length);
  if (!plain.length) return [];
  const out = [mod29(plain[0] + k[0])];
  for (let i = 1; i < plain.length; i++) {
    const step = plain[i] === 28 ? 0 : 1 + ((plain[i] + k[i]) % 28);
    out.push(mod29(out[i - 1] + step));
  }
  return out;
}

/** @param {number[]} code @param {number[]} k @returns {number[]} */
function decrypt(code, k) {
  assert.equal(code.length, k.length);
  if (!code.length) return [];
  const out = [mod29(code[0] - k[0])];
  for (let i = 1; i < code.length; i++) {
    const step = mod29(code[i] - code[i - 1]);
    out.push(step === 0 ? 28 : (step - 1 - k[i] + 56) % 28);
  }
  return out;
}

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const c = Array(29).fill(0);
  for (const v of a) { assert(v >= 0 && v < 29); c[v]++; }
  return 29 * c.reduce((s, x) => s + x * (x - 1), 0) / (a.length * (a.length - 1));
}
const gpTokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} word @returns {number[]|null} */
function gpWord(word) {
  const s = word.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const out = [];
  for (let i = 0; i < s.length;) {
    const item = gpTokens.find(t => s.startsWith(t.s, i));
    if (!item) return null;
    out.push(item.i);
    i += item.s.length;
  }
  return out;
}
/** @param {string} s @returns {number[]} */
function gpText(s) {
  return (s.match(/[A-Za-z]+/g) || []).flatMap(w => gpWord(w) || []);
}
/**
 * Frozen, independent GP-native English trigram reference: first 2/3 of
 * original Gibran text as training, remaining third as held-out benchmark.
 * The benchmark is diagnostic; it is not used to select KDF parameters.
 */
const native = gpText(read('resources/control/gibran_prophet_58585.txt'));
assert(native.length > 20000);
const split = Math.floor(native.length * 2 / 3);
const train = native.slice(0, split);
const held = native.slice(split);
const counts = new Map();
for (let i = 2; i < train.length; i++) {
  const key = train[i - 2] * 841 + train[i - 1] * 29 + train[i];
  counts.set(key, (counts.get(key) || 0) + 1);
}
const denom = train.length - 2 + 0.25 * 29 ** 3;
/** @param {number[]} values @returns {number} */
function score(values) {
  let s = 0;
  for (let i = 2; i < values.length; i++) {
    const key = values[i - 2] * 841 + values[i - 1] * 29 + values[i];
    s += Math.log(((counts.get(key) || 0) + 0.25) / denom);
  }
  return s / (values.length - 2);
}
/** @param {number[]} a @returns {string} */
function preview(a) { return a.slice(0, 150).map(i => corpus.translit[i]).join(''); }
/** @param {number[]} values @param {number} n @returns {number[]} */
function referenceScores(values, n) {
  const out = [];
  for (let off = 0; off + n <= values.length; off += n) out.push(score(values.slice(off, off + n)));
  return out;
}
/** @param {number[]} values @returns {number} */
function median(values) {
  const copy = [...values].sort((a, b) => a - b);
  return copy[Math.floor(copy.length / 2)];
}

/** Fixed table-permutation control, not a second candidate key. */
function permutedTable() {
  const result = Buffer.from(table);
  for (let i = result.length - 1; i > 0; i--) {
    const selector = crypto.createHash('sha256')
      .update('LP2 #1451 matched permutation control')
      .update(Buffer.from([i])).digest();
    const j = selector.readUInt32BE(0) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  assert.deepEqual([...result].sort((a, b) => a - b), [...table].sort((a, b) => a - b));
  return result;
}

const ks = pad(table, cipher.length);
const originalPlain = decrypt(cipher, ks);
assert.deepEqual(encrypt(originalPlain, ks), cipher);
const altK = pad(permutedTable(), cipher.length);
const alteredPlain = decrypt(cipher, altK);
assert.deepEqual(encrypt(alteredPlain, altK), cipher);
assert.notDeepEqual(alteredPlain.slice(0, 150), originalPlain.slice(0, 150));

const p57 = corpus.pages.find(p => p.page === 57).indices;
const lp1 = gpText(read('resources/liber-primus/lp1-plaintext-reference.txt')
  .split(/\r?\n/)
  .filter(line => /^[A-Z ,.;!?\'\":-]+$/.test(line.trim()) && line.trim())
  .join(' '));
const planted = lp1.slice(0, 500);
assert(planted.length === 500);
for (const known of [p57, planted]) {
  const k = pad(table, known.length);
  const c = encrypt(known, k);
  assert.deepEqual(decrypt(c, k), known);
  assert.notDeepEqual(decrypt(c, pad(permutedTable(), known.length)), known);
}
const p54offset = pages.filter(p => p.page < 54).reduce((s, p) => s + p.indices.length, 0);
const p54len = pages.filter(p => p.page >= 54).reduce((s, p) => s + p.indices.length, 0);
assert.equal(p54len, 308);
const targets = [
  {name:'p0-original', indices:originalPlain.slice(0, 262)},
  {name:'p54-p55-original-holdout', indices:originalPlain.slice(p54offset)},
  {name:'p0-shuffled-table', indices:alteredPlain.slice(0, 262)},
  {name:'p54-p55-shuffled-table', indices:alteredPlain.slice(p54offset)},
  {name:'lp1-source-control', indices:planted.slice(0, 262)},
  {name:'p57-source-control', indices:p57}
].map(row => {
  const ref = referenceScores(held, row.indices.length);
  return {
    name:row.name, length:row.indices.length,
    ioc29:Number(ioc(row.indices).toFixed(6)),
    trigramLog:Number(score(row.indices).toFixed(6)),
    nativeMedian:Number(median(ref).toFixed(6)),
    nativeMinimum:Number(Math.min(...ref).toFixed(6)),
    nativeMax:Number(Math.max(...ref).toFixed(6)),
    nativeWindows:ref.length,
    nativeWindowsAtOrBelow:ref.filter(s => s <= score(row.indices)).length,
    first150Latin:preview(row.indices)
  };
});
const full = {ioc29:Number(ioc(originalPlain).toFixed(6)),symbolEA:originalPlain.filter(x => x === 28).length};
const matches = cipher.slice(1).filter((x, i) => x === cipher[i]).length;
assert.equal(full.symbolEA, matches);
console.log(JSON.stringify({
  hypothesis:'one unselected HMAC-SHA256 row-major table KDF + EA-repeat GP28 chain',
  keySha256:crypto.createHash('sha256').update(table).digest('hex'),
  clock:'book-global from first p0 rune, HMAC counter0 big endian, b<252',
  totalCipherRunes:cipher.length, globalAdjacentEquals:matches,
  exactForwardReencryption:true,
  nativePlantTests:['p57 clear 95 runes','LP1 known translation first 500 GP runes'],
  full, targets
}, null, 2));
