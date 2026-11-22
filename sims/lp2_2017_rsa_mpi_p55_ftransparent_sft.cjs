'use strict';

/**
 * 2017 signed-warning RSA-signature bytes as a source-selected candidate
 * GP29 pad for unchanged original physical p55.
 *
 * One-file Windows 11 / Node.js 22 source regression:
 * node sims/lp2_2017_rsa_mpi_p55_ftransparent_sft.cjs
 *
 * This candidate is explicitly speculative: the signed 2017 message
 * orders verifying its signature, not treating its RSA signature as an LP2 key.
 * The script fixes its first byte, phase, page, arithmetic sign and two direct
 * byte-to-GP29 codecs before reading original ciphertext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const load = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const corpus = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const armored = load('resources/historical/cicada2017-yEiTHhvF.asc');
const source55 = corpus.pages.find(page => page.page === 55).indices;
const clear57 = corpus.pages.find(page => page.page === 57).indices;
assert.equal(source55.length, 76);
assert.equal(clear57.length, 95);
const mod29 = value => ((value % 29) + 29) % 29;

/** Read the one original OpenPGP v4 RSA/SHA512 signature packet. */
function rsaMpi(armor) {
  const found = armor.match(
    /-----BEGIN PGP SIGNATURE-----([\s\S]*?)-----END PGP SIGNATURE-----/u
  );
  assert.ok(found);
  const body = found[1].trim().split(/\r?\n/u)
    .map(line => line.trim())
    .filter(line => /^[A-Za-z0-9+/]+={0,2}$/u.test(line)).join('');
  const packet = Buffer.from(body, 'base64');
  assert.equal(packet.length, 543);
  assert.equal(packet[0], 0x89); // Old-format, two-byte-length signature packet.
  assert.equal(packet.readUInt16BE(1) + 3, packet.length);
  assert.deepEqual([...packet.subarray(3, 7)], [4, 1, 1, 10]);
  const mpi = [...packet.subarray(-512)];
  assert.equal(mpi.length, 512);
  return {
    mpi,
    packetSha256: crypto.createHash('sha256').update(packet).digest('hex'),
    mpiSha256: crypto.createHash('sha256').update(Buffer.from(mpi)).digest('hex')
  };
}

/** Standard GP29 index-of-coincidence diagnostic. */
function ioc(runes) {
  const counts = Array(29).fill(0);
  for (const value of runes) {
    assert.ok(Number.isInteger(value) && value >= 0 && value < 29);
    counts[value]++;
  }
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (runes.length * (runes.length - 1));
}

/**
 * Decode with exactly known original plaintext-F-transparent semantics.
 * Printed C=F may be either literal plaintext F (nonconsuming), or
 * encryption of a different plaintext rune (consuming). All masks of the
 * original three printed F symbols are enumerated, rather than optimizing
 * a favourable mask or silently allowing encrypted plaintext F.
 */
function decode(ciphertext, key, sign, literalPositions) {
  const out = [];
  let clock = 0;
  for (let i = 0; i < ciphertext.length; i++) {
    const c = ciphertext[i];
    if (literalPositions.has(i)) {
      assert.equal(c, 0);
      out.push(0);
      continue;
    }
    const p = mod29(c - sign * key[clock++]);
    if (p === 0) return null;
    out.push(p);
  }
  return {plain: out, consumed: clock};
}

/** Positive source-native original solved-rune encoder. */
function encode(plain, key, sign) {
  const ciphertext = [], literalPositions = new Set();
  let clock = 0;
  for (let i = 0; i < plain.length; i++) {
    if (plain[i] === 0) {
      literalPositions.add(i);
      ciphertext.push(0);
    } else ciphertext.push(mod29(plain[i] + sign * key[clock++]));
  }
  return {ciphertext, literalPositions, consumed: clock};
}

const rsa = rsaMpi(armored);
const keys = [
  ['raw-byte-remainder-29', rsa.mpi.map(byte => byte % 29)],
  ['raw-byte-quotient-remainder-29',
    rsa.mpi.flatMap(byte => [Math.floor(byte / 29), byte % 29])]
];
const originalF = source55.flatMap((rune, i) => rune === 0 ? [i] : []);
assert.deepEqual(originalF, [15, 25, 41]);

const trials = [];
for (const [keyCodec, key] of keys) {
  for (const sign of [-1, 1]) {
    const recovered = [], allSurvivors = [];
    for (let mask = 0; mask < 2 ** originalF.length; mask++) {
      const skips = new Set(originalF.filter((_, i) => (mask & (1 << i)) !== 0));
      const decoded = decode(source55, key, sign, skips);
      if (!decoded) continue;
      const {ciphertext: reencryption} = encode(decoded.plain, key, sign);
      assert.deepEqual(reencryption, source55);
      recovered.push({mask, skips: [...skips], consumed: decoded.consumed,
        ioc: ioc(decoded.plain), all76: decoded.plain.map(x => corpus.translit[x]).join('')});
      allSurvivors.push(mask);
    }
    // Actual source-native input, 76 original clear-p57 runes, with F bypass.
    const knownPlain = clear57.slice(0, source55.length);
    const plant = encode(knownPlain, key, sign);
    const positive = decode(plant.ciphertext, key, sign, plant.literalPositions);
    assert.ok(positive);
    assert.deepEqual(positive.plain, knownPlain);
    assert.equal(plant.consumed, positive.consumed);

    recovered.sort((a, b) => b.ioc - a.ioc);
    trials.push({keyCodec, sign, nativeFValidMasks: allSurvivors.length,
      bestIoc: recovered.length ? recovered[0].ioc : null,
      originalCandidates: recovered});
  }
}
assert.deepEqual(trials.map(t => t.nativeFValidMasks), [2, 0, 7, 2]);
assert.deepEqual(trials.map(t => t.bestIoc).map(x => x === null ? x : +x.toFixed(9)),
  [0.037192982, null, 0.040701754, 0.034385965]);

console.log(JSON.stringify({
  original2017SignedFile: 'resources/historical/cicada2017-yEiTHhvF.asc',
  originalCicadaSignedText: 'Beware false paths. Always verify PGP signature from 7A35090F. 3301',
  originalPacketSha256: rsa.packetSha256, rsaMpiSha256: rsa.mpiSha256,
  rsaMpiBytes: rsa.mpi.length, p55UnchangedRunes: source55.length,
  printedFCiphertextOffsets: originalF, rawP55Ioc: ioc(source55),
  clearP57Ioc: ioc(clear57),
  tests: trials, recoveredUnknownPlaintext: false,
  caveat: '2017 message authenticates signature verification, not using RSA signature bytes as a Liber Primus key'
}, null, 2));
console.log('PASS: all eight F-branch patterns, four fixed source pads, exact original forward reconstruction and four solved-source positive plants.');
