'use strict';
/**
 * SFT: node sims/lp2_p55_2012_signed_gps_dms76_sft.cjs
 *
 * Period-original signed 2012 Cicada image GPS coordinates give exactly
 * 12 latitude-longitude pairs. The standard integer-degree/minute/second
 * (DMS) register yields 12*2*3=72 numbers. Append the signed payload's
 * literal terminal marker 3301 as four decimal digits: 76 entries, the
 * length of unknown original LP2 p55 featuring the identical Cicada logo.
 *
 * The 76/76 match is retrospective and does not authenticate an authored
 * cipher. This is one frozen construction: preserve each hemisphere sign,
 * truncate sub-second DMS fractions, reduce each integer modulo 29,
 * and encrypt with historically demonstrated GP29 additive F-bypass.
 *
 * Two signs are tested; there are no offsets, alternatives, key phases,
 * language-selected masks, decimal-digit variants or free cipher operands.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(ROOT, 'im-results',
  '2012-845145127', 'coordinate-payload.asc'));
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources',
  'liber-primus', 'lp2-corpus.json'), 'utf8'));
const sha = crypto.createHash('sha1')
  .update(Buffer.from('blob ' + source.length + '\0')).update(source)
  .digest('hex');
assert.equal(sha, '7906deec84cfc26907ef417ee3ba7d727d1f5f53');
assert.equal(source.length, 1221);

const text = source.toString('utf8');
assert.ok(text.startsWith('-----BEGIN PGP SIGNED MESSAGE-----\nHash: SHA1\n\n'));
const coordBody = text.split('\n\n')[1].split('\n3301')[0];
const lines = coordBody.trim().split('\n');
assert.equal(lines.length, 12);
const mod = n => ((n % 29) + 29) % 29;

/**
 * Truncated conventional degrees, arcminutes, arcseconds.
 * All three numerical components inherit the hemisphere sign.
 * @param {number} decimalDegrees
 * @returns {number[]}
 */
function dms(decimalDegrees) {
  const sign = decimalDegrees < 0 ? -1 : 1;
  const magnitude = Math.abs(decimalDegrees);
  const degrees = Math.floor(magnitude);
  const fractionalMinutes = (magnitude - degrees) * 60;
  const minutes = Math.floor(fractionalMinutes);
  const seconds = Math.floor((fractionalMinutes - minutes) * 60 + 1e-7);
  assert.ok(degrees <= 180 && minutes >= 0 && minutes < 60 &&
    seconds >= 0 && seconds < 60);
  return [degrees, minutes, seconds].map(x => mod(x * sign));
}

const signedPairs = lines.map(line => {
  const matches = [...line.matchAll(/-?\d+(?:\.\d+)?/g)].map(x => Number(x[0]));
  assert.equal(matches.length, 2, line);
  return matches;
});
assert.equal(signedPairs.length, 12);
assert.deepEqual(signedPairs[0], [52.216802, 21.018334]);
assert.deepEqual(signedPairs[11], [-33.90281, 151.18421]);

const key = signedPairs.flatMap(([latitude, longitude]) => [
  ...dms(latitude), ...dms(longitude),
]).concat([3, 3, 0, 1]);
assert.equal(key.length, 76);
assert.deepEqual(key.slice(0, 12), [23, 13, 0, 21, 1, 6, 19, 22, 2, 2, 24, 24]);
assert.deepEqual(key.slice(-4), [3, 3, 0, 1]);

const p55 = corpus.pages.find(p => p.page === 55).indices;
const clear = corpus.pages.find(p => p.page === 57).indices.slice(0, 76);
assert.equal(p55.length, 76);
assert.equal(clear.length, 76);
assert.deepEqual(p55.slice(-3), [17, 18, 10]);
assert.deepEqual(p55.flatMap((x, i) => x === 0 ? [i] : []), [15, 25, 41]);

/**
 * Plaintext F emits zero and consumes no key component.
 * @param {number[]} plain
 * @param {number} sign
 * @returns {number[]}
 */
function encrypt(plain, sign) {
  let j = 0;
  return plain.map(x => x === 0 ? 0 : mod(x + sign * key[j++]));
}

/**
 * Exact all-plaintext-F-mask inverse. A nonzero ciphertext must decode
 * to nonzero plaintext, but printed C=F can be ordinary encrypted non-F.
 * @param {number[]} cipher
 * @param {number} sign
 * @returns {{plain: number[],ptr: number,bypass: number[]}[]}
 */
function inverse(cipher, sign) {
  /** @type {{plain: number[],ptr: number,bypass: number[]}[]} */
  let states = [{ plain: [], ptr: 0, bypass: [] }];
  for (let i = 0; i < cipher.length; i++) {
    /** @type {typeof states} */
    const next = [];
    for (const s of states) {
      const decoded = mod(cipher[i] - sign * key[s.ptr]);
      if (decoded !== 0) next.push({
        plain: [...s.plain, decoded],
        ptr: s.ptr + 1,
        bypass: s.bypass,
      });
      if (cipher[i] === 0) next.push({
        plain: [...s.plain, 0],
        ptr: s.ptr,
        bypass: [...s.bypass, i],
      });
    }
    states = next;
  }
  return states;
}

/**
 * First source rune at which no historically admissible F-clock survives.
 * @param {number[]} cipher
 * @param {number} sign
 * @returns {number|null}
 */
function firstImpossible(cipher, sign) {
  let clocks = new Set([0]);
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    for (const j of clocks) {
      if (mod(cipher[i] - sign * key[j]) !== 0) next.add(j + 1);
      if (cipher[i] === 0) next.add(j);
    }
    if (next.size === 0) return i;
    clocks = next;
  }
  return null;
}

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const c = Array(29).fill(0);
  for (const n of a) c[n]++;
  return c.reduce((s, n) => s + n * (n - 1), 0) /
    (a.length * (a.length - 1));
}

const results = [];
for (const sign of [1, -1]) {
  const paths = inverse(p55, sign);
  const impossible = firstImpossible(p55, sign);
  assert.equal(paths.length, sign === 1 ? 0 : 1);
  assert.equal(impossible, sign === 1 ? 62 : null);
  for (const p of paths) assert.deepEqual(encrypt(p.plain, sign), p55);

  // The same source key must correctly recover real clear Cicada GP29,
  // including any literal plaintext F, from a full-length planted cipher.
  const planted = encrypt(clear, sign);
  const positive = inverse(planted, sign);
  assert.ok(positive.some(p =>
    p.plain.length === clear.length &&
    p.plain.every((v, i) => v === clear[i])));
  assert.deepEqual(encrypt(clear, sign), planted);

  const outputPaths = paths.map(p => ({
    literalFBypass: p.bypass,
    consumedKeyComponents: p.ptr,
    decodedGp29IoC: ioc(p.plain),
    firstCompletePrintedWord: p.plain.slice(1, 5)
      .map(x => corpus.translit[x]).join('-'),
    first24Gp: p.plain.slice(0, 24)
      .map(x => corpus.translit[x]).join('-'),
  }));
  if (sign === -1) {
    assert.deepEqual(outputPaths[0].literalFBypass, [25, 41]);
    assert.equal(outputPaths[0].consumedKeyComponents, 74);
    assert.ok(Math.abs(outputPaths[0].decodedGp29IoC -
      0.034035087719298245) < 1e-12);
  }
  results.push({
    sign,
    firstImpossibleOriginalRune: impossible,
    validFullPagePaths: paths.length,
    nativeSolvedP57Positive: true,
    paths: outputPaths,
  });
}
console.log(JSON.stringify({
  sourceGitBlobSha1: sha,
  signedGpsCoordinatePairs: signedPairs.length,
  DMSComponentCount: 72,
  signedTerminalMarkerDigits: [3, 3, 0, 1],
  sourceKeyLength: key.length,
  p55CipherRunes: p55.length,
  originalP55CipherIoC: ioc(p55),
  originalNativeP57First76IoC: ioc(clear),
  results,
  recoveredOriginalUnknownPlaintext: false,
}, null, 2));
