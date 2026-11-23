'use strict';

/**
 * One frozen P2PKH-convention key-transfer hypothesis into native GP29.
 *
 * Original LP2 p49–51 high-band missing-L source selects its 32-byte fifth
 * column under the conventional base60 table reading. Apply each successive
 * standard compressed Bitcoin P2PKH byte intermediate as one continuous,
 * phase-zero, repeating GP29 add/subtract key to *all* original unknown runes.
 *
 * No key phase, page reset, word-score tuning or chosen English segment.
 * Run: node sims/lp2_p50_bitcoin_stage_gp29_runningkey_sft.cjs
 * Built-in Node.js 22 only; read-only, Windows compatible.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createECDH, createHash, createHmac, pbkdf2Sync} = require('node:crypto');
const root = path.resolve(__dirname, '..');
const readJSON = file => JSON.parse(
  fs.readFileSync(path.join(root, file), 'utf8')
);
const grid = readJSON('resources/liber-primus/base60-grid.json');
const lp2 = readJSON('resources/liber-primus/lp2-corpus.json');
const mod = x => (x % 29 + 29) % 29;
const sha256 = bytes => createHash('sha256').update(bytes).digest();
const ripemd160 = bytes => createHash('ripemd160').update(bytes).digest();

/** @param {Buffer} bytes @returns {string} */
function base58(bytes) {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let n = BigInt('0x' + bytes.toString('hex'));
  let str = '';
  while (n > 0n) {
    str = alphabet[Number(n % 58n)] + str;
    n /= 58n;
  }
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++;
  return '1'.repeat(zeros) + str;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0)
    / (values.length * (values.length - 1));
}
const bytes = Buffer.from(grid.byte_rows.map(row => row[4]));
assert.equal(bytes.length, 32);
assert.equal(bytes.toString('hex'),
  '61f7669636e6566ac772adec530e360da9f5f63469949026b0c2463a90ee16b4');
const secp = createECDH('secp256k1');
secp.setPrivateKey(bytes);
const publicKey = secp.getPublicKey(undefined, 'compressed');
assert.equal(publicKey.toString('hex'),
  '03ac234dba2f6b2891c4c6032e1378f2e29ed22ce18e34737fa94e34c8f1963a64');
const pubSha = sha256(publicKey);
const pubHash160 = ripemd160(pubSha);
const addressPayload = Buffer.concat([Buffer.from([0]), pubHash160]);
const addressBytes = Buffer.concat([
  addressPayload, sha256(sha256(addressPayload)).subarray(0, 4)
]);
assert.equal(base58(addressBytes), '1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK');
// A second source-visible consumer is the original p56 printed SHA-512.
// Compare direct canonical Bitcoin stages and both exact address spellings
// with the original digest. No salt, nonce, prefix or chosen-subset search.
const p56PrintedSHA512 =
  '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const directSHA512Receivers = {
  scalar32: bytes,
  compressedPubkey33: publicKey,
  sha256Pubkey32: pubSha,
  hash160Pubkey20: pubHash160,
  p2pkhAddress25: addressBytes,
  p2pkhText: Buffer.from(base58(addressBytes), 'ascii'),
  meanpngText: Buffer.from('Meanpng', 'ascii')
};
for (const [name, input] of Object.entries(directSHA512Receivers)) {
  const digest = createHash('sha512').update(input).digest('hex');
  assert.notEqual(digest, p56PrintedSHA512,
    'Direct Bitcoin-stage source receiver unexpectedly matches original p56 hash');
  console.log('P50_BITCOIN_P56_DIRECT_SHA512', JSON.stringify({
    name, bytes:input.length, digest, matchesOriginal:false
  }));
}
assert.equal(Object.keys(directSHA512Receivers).length, 7);

// Historical BIP39/BIP32 (2013/2012) gives three further exactly
// specified 64-byte objects without tunable nonce, iteration or salt.
// The official BIP39 2048-word English list gives this exact checksum-
// valid 24-word mnemonic from the original 256-bit fifth-column source.
// Source reference: https://github.com/bitcoin/bips/blob/master/bip-0039/english.txt
const mnemonic =
  'giggle robot pitch horse grace cube build fiber unable observe mirror ' +
  'brave palm wild spider crater mother culture correct midnight poverty ' +
  'jacket food name';
assert.equal(mnemonic.split(' ').length, 24);
assert.equal(sha256(bytes)[0], 0x96); // 8-bit BIP39 entropy checksum
const bip39Seed = pbkdf2Sync(mnemonic, 'mnemonic', 2048, 64, 'sha512');
const bip32FromOriginal32 = createHmac('sha512', 'Bitcoin seed')
  .update(bytes).digest();
const bip32FromBip39 = createHmac('sha512', 'Bitcoin seed')
  .update(bip39Seed).digest();
const standard64 = {
  bip39PbkdHmacSha512: bip39Seed,
  bip32DirectScalarSeed: bip32FromOriginal32,
  bip32FromBip39Seed: bip32FromBip39
};
const expectedPrefixes = {
  bip39PbkdHmacSha512: '5e29b067285c555a',
  bip32DirectScalarSeed: '76355b5428b04cc8',
  bip32FromBip39Seed: '2de4a70778dfe21f'
};
for (const [name, out] of Object.entries(standard64)) {
  assert.equal(out.length, 64);
  assert.equal(out.toString('hex').slice(0, 16), expectedPrefixes[name]);
  assert.notEqual(out.toString('hex'), p56PrintedSHA512);
  console.log('P50_BITCOIN_2013_BIP39_BIP32_P56', JSON.stringify({
    name, digestHex:out.toString('hex'), matchesOriginalP56:false
  }));
}


const stages = {
  scalar32: bytes,
  compressedPubkey33: publicKey,
  sha256pubkey32: pubSha,
  hash160pubkey20: pubHash160,
  address25: addressBytes
};
assert.deepEqual(Object.values(stages).map(b => b.length), [32, 33, 32, 20, 25]);
const pages = lp2.pages.filter(p => p.page <= 55);
assert.equal(pages.length, 56);
assert.equal(lp2.pages[50].indices.length, 0);
const starts = new Map();
let n = 0;
for (const page of pages) {
  starts.set(page.page, n);
  n += page.indices.length;
}
assert.equal(n, 12956);
assert.equal(starts.get(16), 3762);
assert.equal(starts.get(40), 9640);
assert.equal(starts.get(55), 12880);
const ciphertext = pages.flatMap(p => p.indices);
const solved57 = lp2.pages[57].indices;
assert.equal(solved57.length, 95);
const output = [];
for (const [name, data] of Object.entries(stages)) {
  const key = Array.from(data).map(x => mod(x));
  for (const sign of [-1, +1]) {
    /** @param {number[]} seq @returns {number[]} */
    const inverse = seq => seq.map((c, i) => mod(c + sign * key[i % key.length]));
    const original = inverse(ciphertext);
    assert.deepEqual(original.map((p, i) =>
      mod(p - sign * key[i % key.length])), ciphertext);
    const synthetic = solved57.map((p, i) => mod(p - sign * key[i % key.length]));
    assert.deepEqual(inverse(synthetic), solved57);
    const train = original.slice(starts.get(16), starts.get(22));
    const holdout = original.slice(starts.get(40), starts.get(54));
    const p55 = original.slice(starts.get(55));
    assert.deepEqual([train.length, holdout.length, p55.length], [1613, 3008, 76]);
    const measures = [ioc(original), ioc(train), ioc(holdout), ioc(p55)];
    assert.ok(measures[0] < 0.036 && measures[1] < 0.036 && measures[2] < 0.036,
      'Each direct original receiver is far below the native p57 IOC');
    const row = {name, sign, keyHex:data.toString('hex'), allIoC:measures[0],
      trainIoC:measures[1], holdoutIoC:measures[2], p55IoC:measures[3],
      opening:original.slice(0, 38).map(v => lp2.translit[v]).join(' '),
      solved57PlantRecovered:solved57.length};
    output.push(row);
    console.log('P50_BITCOIN_STAGE_RUNNINGKEY', JSON.stringify(row));
  }
}
assert.equal(output.length, 10);
const raw57IoC = ioc(solved57);
assert.ok(raw57IoC > 0.06);
assert.ok(output.every(x => x.allIoC < 0.036 && x.holdoutIoC < 0.036));
// The signed 2013 Cicada BASE29 source gives one distinct, literal integer
// serialization of the same source-selected Bitcoin private scalar.
// Convert the *whole* 256-bit big-endian scalar to its minimal base29 digits,
// and consume the digits as a page-continuous, phase-zero GP29 key.
let integer = BigInt('0x' + bytes.toString('hex'));
const base29 = [];
while (integer > 0n) {
  base29.unshift(Number(integer % 29n));
  integer /= 29n;
}
assert.equal(base29.length, 53);
assert.deepEqual(base29.slice(0, 8), [3, 28, 27, 4, 4, 14, 24, 6]);
for (const sign of [-1, +1]) {
  const decoded = ciphertext.map((c, i) => mod(c + sign * base29[i % base29.length]));
  assert.deepEqual(decoded.map((p, i) =>
    mod(p - sign * base29[i % base29.length])), ciphertext);
  const planted = solved57.map((p, i) =>
    mod(p - sign * base29[i % base29.length]));
  assert.deepEqual(planted.map((c, i) => mod(c + sign * base29[i % base29.length])),
    solved57);
  const train = ioc(decoded.slice(starts.get(16), starts.get(22)));
  const holdout = ioc(decoded.slice(starts.get(40), starts.get(54)));
  const whole = ioc(decoded);
  assert.ok(whole < .036 && train < .036 && holdout < .036);
  console.log('P50_SOURCE_SIGNED_BASE29_SCALAR', JSON.stringify({
    sign, keyLength:base29.length, wholeIoC:whole, trainIoC:train,
    holdoutIoC:holdout, p55IoC:ioc(decoded.slice(starts.get(55))),
    first38:decoded.slice(0, 38).map(v => lp2.translit[v]).join(' '),
    solved57PlantRecovered:solved57.length
  }));
}

console.log('PASS: twelve exact source Bitcoin-stage GP29 inverses; none recovers native prose; raw p57 IOC='+raw57IoC);
