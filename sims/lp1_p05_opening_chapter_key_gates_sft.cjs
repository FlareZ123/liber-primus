'use strict';

/**
 * LP1 p05 -> LP2 opening: two source-frozen direct additive key transfers.
 * Node.js 22 CommonJS. No phase, page reset, F mask, KDF, or key search.
 * Run from repository root: node sims/lp1_p05_opening_chapter_key_gates_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file));
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const mod = x => ((x % 29) + 29) % 29;

const source = JSON.parse(read('resources/liber-primus/lp2-corpus.json').toString('utf8'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json').toString('utf8'));
const image = read('resources/liber-primus/05.jpg');
const shakespeare = read('resources/control/shakespeare_first300k.txt')
  .toString('utf8').replace(/\r\n/g, '\n');

assert.equal(image.length, 673066);
assert.equal(sha256(image),
  '2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7');

// Recover the exact 179-byte Onion 3 OOB block from the original LP1 p05 JPEG.
const firstEoi = image.indexOf(Buffer.from([0xff, 0xd9]));
assert.equal(firstEoi, 336351);
const firstJpegEnd = firstEoi + 2;
const central = image.subarray(firstJpegEnd, firstJpegEnd + 360);
assert.equal(central.length, 360);
assert.deepEqual([...central.subarray(0, 2)], [10, 10]);
const centralHex = central.subarray(2).toString('ascii');
assert.equal(centralHex.length, 358);
assert.match(centralHex, /^[0-9a-fA-F]+$/);
const payload = Buffer.from(centralHex, 'hex');
assert.equal(payload.length, 179);
assert.equal(sha256(payload),
  '82c135148b6cf85e9b550afdbc6204be075ff67717356a8ae18b76f9cc3af5fa');
assert.deepEqual(
  image.subarray(firstJpegEnd + 360),
  Buffer.from(image.subarray(0, firstJpegEnd)).reverse()
);

// Freeze the LP2 opening target at the original p0 red-heading boundary.
const page = n => source.pages.find(p => p.page === n);
const p0 = page(0), p1 = page(1), p2 = page(2);
assert.deepEqual([p0.indices.length, p1.indices.length, p2.indices.length], [262, 266, 201]);
const red13 = ink.pages.find(p => p.page === 0).red_spans
  .find(span => span.start === 0 && span.length === 13);
assert.ok(red13);
assert.equal(p0.indices.slice(0, 13).map(i => source.runes[i]).join(''), red13.runes);
assert.deepEqual(p0.indices.slice(0, 13),
  [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);
const body = [
  ...p0.indices.slice(13),
  ...p1.indices,
  ...p2.indices
];
assert.equal(body.length, 716);
assert.equal(body.length, 4 * payload.length);

// Convert the thirteen original LP1 p05 verbal cells to GP29 and derive
// the prime-sum and Euler-totient key readings.
const pairs = {TH:2, NG:21, EO:12, OE:22, AE:25, IA:27, EA:28};
const letters = {
  A:24, B:17, C:5, D:23, E:18, F:0, G:6, H:8, I:10, J:11,
  L:20, M:19, N:9, O:3, P:13, R:4, S:15, T:16, U:1, W:7, X:14, Y:26
};
const aliases = {K:'C', Q:'C', V:'U', Z:'S'};
function gpText(text) {
  const s = text.toUpperCase().replace(/[^A-Z]/g, '')
    .replace(/[KQVZ]/g, ch => aliases[ch]);
  const out = [];
  for (let i = 0; i < s.length;) {
    const pair = s.slice(i, i + 2);
    if (Object.prototype.hasOwnProperty.call(pairs, pair)) {
      out.push(pairs[pair]);
      i += 2;
    } else {
      assert.ok(Object.prototype.hasOwnProperty.call(letters, s[i]), 'unmapped letter ' + s[i]);
      out.push(letters[s[i]]);
      i++;
    }
  }
  return out;
}
const p05Words = [
  'SHADOWS', 'AETHEREAL', 'BUFFERS', 'UOID', 'CARNAL', 'OBSCURA', 'FORM',
  'MOBIUS', 'ANALOG', 'UOID', 'MOURNFUL', 'AETHEREAL', 'CABAL'
];
const p05Lengths = p05Words.map(w => gpText(w).length);
const primeSums = p05Words.map(w =>
  gpText(w).reduce((sum, rune) => sum + source.prime[rune], 0)
);
assert.deepEqual(p05Lengths, [7, 6, 7, 4, 6, 7, 4, 6, 6, 4, 8, 6, 5]);
assert.equal(p05Lengths.reduce((a, b) => a + b, 0), 76);
assert.deepEqual(primeSums,
  [341, 366, 199, 130, 320, 245, 91, 226, 320, 130, 199, 366, 341]);
const phi = n => {
  let result = n;
  for (let p = 2; p * p <= n; p++) {
    if (n % p === 0) {
      while (n % p === 0) n /= p;
      result -= result / p;
    }
  }
  if (n > 1) result -= result / n;
  return Math.round(result);
};
const primeSumKey = primeSums.map(mod);
const totientKey = primeSums.map(n => mod(phi(n)));
assert.deepEqual(primeSumKey, [22, 18, 25, 14, 1, 13, 4, 23, 1, 14, 25, 18, 22]);
assert.deepEqual(totientKey, [10, 4, 24, 19, 12, 23, 14, 25, 12, 19, 24, 4, 10]);

// The 179-byte key is tested under the four fixed byte->GP29 maps already
// used for the same historical payload against the moth-selected p53 passage.
const nibbleSwap = b => ((b >>> 4) | ((b & 15) << 4));
const swapped = Array.from(payload, nibbleSwap);
const byteKeys = [
  {name:'179 raw byte mod29', key:Array.from(payload, b => b % 29)},
  {name:'179 nibble-swapped byte mod29', key:swapped.map(b => b % 29)},
  {name:'179 raw byte scaled to29', key:Array.from(payload, b => Math.floor(29 * b / 256))},
  {name:'179 nibble-swapped byte scaled to29',
    key:swapped.map(b => Math.floor(29 * b / 256))}
];
for (const item of byteKeys) assert.equal(item.key.length, 179);

// Independent GP29 trigram model: first 200k Shakespeare characters train;
// final 100k are held out, using the established repository encoding.
assert.equal(shakespeare.length, 300000);
const train = gpText(shakespeare.slice(0, 200000));
const heldout = gpText(shakespeare.slice(200000));
const U = new Uint32Array(29), B = new Uint32Array(841), T = new Uint32Array(24389);
for (let i = 0; i < train.length; i++) {
  U[train[i]]++;
  if (i) B[train[i - 1] * 29 + train[i]]++;
  if (i > 1) T[(train[i - 2] * 29 + train[i - 1]) * 29 + train[i]]++;
}
const u = Array.from(U, x => Math.log((x + 1) / (train.length + 29)));
const b = new Float64Array(841), t = new Float64Array(24389);
for (let a = 0; a < 29; a++) for (let c = 0; c < 29; c++) {
  b[a * 29 + c] = Math.log((B[a * 29 + c] + 12 * Math.exp(u[c])) / (U[a] + 12));
  for (let d = 0; d < 29; d++) {
    const pos = (a * 29 + c) * 29 + d;
    t[pos] = Math.log((T[pos] + 9 * Math.exp(b[c * 29 + d])) / (B[a * 29 + c] + 9));
  }
}
function score(seq) {
  assert.ok(seq.length >= 2);
  let value = u[seq[0]] + b[seq[0] * 29 + seq[1]];
  for (let i = 2; i < seq.length; i++)
    value += t[(seq[i - 2] * 29 + seq[i - 1]) * 29 + seq[i]];
  return value / seq.length;
}
function ioc(seq) {
  const counts = new Uint32Array(29);
  for (const x of seq) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (seq.length * (seq.length - 1));
}
const decrypt = (cipher, key, sign) =>
  cipher.map((c, i) => mod(c + sign * key[i % key.length]));
const encrypt = (plain, key, sign) =>
  plain.map((p, i) => mod(p - sign * key[i % key.length]));
const native = heldout.slice(0, body.length);
const candidates = [];
function testKey(name, key) {
  for (const sign of [-1, 1]) {
    const output = decrypt(body, key, sign);
    assert.deepEqual(encrypt(output, key, sign), body);
    assert.deepEqual(decrypt(encrypt(native, key, sign), key, sign), native);
    candidates.push({
      key:name,
      operation:sign === -1 ? 'C-K' : 'C+K',
      keyLength:key.length,
      repeatedKeyCycles:body.length / key.length,
      ioc:ioc(output),
      trigram:score(output),
      first48:output.slice(0, 48).map(x => source.translit[x]).join(' ')
    });
  }
}
testKey('13 p05 word prime-sum residues', primeSumKey);
testKey('13 p05 word phi(prime-sum) residues', totientKey);
for (const item of byteKeys) testKey(item.name, item.key);
assert.equal(candidates.length, 12);

const nativeWindows = [];
const windowCount = 2000;
const windowStep = Math.floor((heldout.length - body.length) / (windowCount - 1));
for (let i = 0; i < windowCount; i++)
  nativeWindows.push(score(heldout.slice(i * windowStep, i * windowStep + body.length)));
nativeWindows.sort((a, b) => a - b);
const results = {
  target:'LP2 physical p0-p2 black body after the original 13-rune red heading',
  sourcePages:[p0.indices.length, p1.indices.length, p2.indices.length],
  originalTargetRunes:body.length,
  originalTargetIoC:ioc(body),
  originalTargetTrigram:score(body),
  p05WordCells:p05Words.map((word, i) => ({
    word, runeLength:p05Lengths[i], gpPrimeSum:primeSums[i],
    primeSumMod29:primeSumKey[i], phiPrimeSumMod29:totientKey[i]
  })),
  p05HiddenPayloadBytes:payload.length,
  p05HiddenPayloadSha256:sha256(payload),
  p05PayloadToTargetRatio:body.length / payload.length,
  nativeHeldout716:{ioc:ioc(native),trigram:score(native)},
  nativeWindowCount:windowCount,
  nativeWindowStride:windowStep,
  nativeWindowTrigram:{
    min:nativeWindows[0],
    p5:nativeWindows[Math.floor(0.05 * (windowCount - 1))],
    median:nativeWindows[Math.floor(0.5 * (windowCount - 1))],
    max:nativeWindows[windowCount - 1]
  },
  candidates,
  decision:'All twelve frozen direct additive key transfers remain nonlinguistic and far below native-GP windows. This rejects only these source-derived key representations, signs and zero-phase continuous registers; it does not establish an alternative cipher or exclude a different author-selected operation.'
};
assert.ok(Math.abs(results.originalTargetTrigram - (-3.9520420758686763)) < 1e-9);
assert.ok(Math.abs(results.nativeHeldout716.trigram - (-2.147060284157247)) < 1e-9);
assert.ok(Math.min(...candidates.map(x => x.trigram)) < -3.70);
assert.ok(Math.max(...candidates.map(x => x.trigram)) < nativeWindows[0]);
console.log(JSON.stringify(results, null, 2));
