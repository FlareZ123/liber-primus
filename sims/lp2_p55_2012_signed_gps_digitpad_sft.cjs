'use strict';
/**
 * SFT: node sims/lp2_p55_2012_signed_gps_digitpad_sft.cjs
 *
 * One source-locked original LP2 inverse: the 2012 Cicada emblem's
 * signed OutGuess coordinates provide decimal digits; the *same* emblem
 * is printed on original LP2 p55. Try consecutive coordinate magnitude
 * digits as a literal base-29 additive running key in both historically
 * used GP29 Vigenere signs, retaining the authentic plaintext-F bypass.
 *
 * The coordinate sign, decimal punctuation and final "3301" closing marker
 * are not decimal-digit key material. No starting offsets, phases, phrase
 * dictionaries, key derivation, plaintext fitting or masks are searched.
 *
 * This is an exploratory clue-to-decoder bridge, not an authored 2014
 * key instruction. A negative is conditional on this exact encoding.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const SOURCE = path.join(ROOT, 'im-results', '2012-845145127',
  'coordinate-payload.asc');
const CORPUS = path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json');
const original = fs.readFileSync(SOURCE);
const blobHeader = Buffer.from('blob ' + original.length + '\0', 'ascii');
const gitBlobSha1 = crypto.createHash('sha1')
  .update(blobHeader).update(original).digest('hex');
assert.equal(original.length, 1221);
assert.equal(gitBlobSha1, '7906deec84cfc26907ef417ee3ba7d727d1f5f53');

const text = original.toString('utf8');
assert.ok(text.startsWith('-----BEGIN PGP SIGNED MESSAGE-----\nHash: SHA1\n\n'));
const body = text.split('\n\n')[1].split('-----BEGIN PGP SIGNATURE-----')[0];
assert.ok(body.endsWith('\n3301\n'));
const lines = body.slice(0, -'\n3301\n'.length).trim().split('\n');
assert.equal(lines.length, 12);
const key = Array.from(lines.join('\n').replace(/\D/g, ''), Number);
assert.equal(key.length, 250);
assert.deepEqual(key.slice(0, 6), [5, 2, 2, 1, 6, 8]);

const corpus = JSON.parse(fs.readFileSync(CORPUS, 'utf8'));
const getPage = n => corpus.pages.find(p => p.page === n).indices;
const cipher = getPage(55);
const clear = getPage(57).slice(0, 76);
assert.equal(cipher.length, 76);
assert.equal(clear.length, 76);
assert.deepEqual(cipher.slice(-3), [17, 18, 10]);
assert.deepEqual(cipher.flatMap((v, i) => v === 0 ? [i] : []), [15, 25, 41]);

const mod = n => ((n % 29) + 29) % 29;

/**
 * A GP literal plaintext F=0 emits C=0 and consumes no key.
 * Every other plaintext symbol consumes one digit (including when C=0).
 * @param {number[]} plain
 * @param {1|-1} sign
 * @returns {number[]}
 */
function encrypt(plain, sign) {
  let j = 0;
  return plain.map(x => x === 0 ? 0 : mod(x + sign * key[j++]));
}

/**
 * Exact inverse that branches on source ciphertext F=0 and retains all
 * legal full-length paths, with no fitted F-bypass mask.
 * @param {number[]} c
 * @param {1|-1} sign
 * @returns {{plain: number[], clock: number, bypass: number[]}[]}
 */
function decodeAll(c, sign) {
  /** @type {{plain: number[], clock: number, bypass: number[]}[]} */
  let paths = [{ plain: [], clock: 0, bypass: [] }];
  for (let i = 0; i < c.length; i++) {
    /** @type {typeof paths} */
    const next = [];
    for (const state of paths) {
      const recovered = mod(c[i] - sign * key[state.clock]);
      if (recovered !== 0) {
        next.push({
          plain: [...state.plain, recovered],
          clock: state.clock + 1,
          bypass: state.bypass,
        });
      }
      if (c[i] === 0) {
        next.push({
          plain: [...state.plain, 0],
          clock: state.clock,
          bypass: [...state.bypass, i],
        });
      }
    }
    paths = next;
  }
  return paths;
}

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const count = Array(29).fill(0);
  for (const x of a) count[x]++;
  return count.reduce((sum, n) => sum + n * (n - 1), 0) /
    (a.length * (a.length - 1));
}

/** @param {number[]} a @returns {string} */
function roman(a) {
  return a.map(x => corpus.translit[x]).join('-');
}

const result = {
  source2012GitBlobSha1: gitBlobSha1,
  sourceSignedCoordinates: 12,
  orderedDecimalDigits: key.length,
  originalP55Runes: cipher.length,
  originalP55CipherIoC: ioc(cipher),
  nativeSolvedP57First76IoC: ioc(clear),
  candidateModels: [],
};

for (const sign of [1, -1]) {
  const candidates = decodeAll(cipher, sign);
  assert.equal(candidates.length, sign === 1 ? 2 : 3);
  const expectedBypasses = sign === 1 ?
    ['15', '15,25,41'] : ['41', '15,25', '15,25,41'];
  assert.deepEqual(candidates.map(p => p.bypass.join(',')), expectedBypasses);

  // Each admissible inverse must re-encode precisely the unchanged source.
  for (const p of candidates) {
    assert.deepEqual(encrypt(p.plain, sign), cipher);
    assert.equal(p.plain.length, 76);
  }

  // Independent native Cicada-language genuine solved-page positive:
  // encrypt full p57 first76 under the same source digit key then blindly
  // recover the actual 76-runic GP plaintext among all exact inverse paths.
  const planted = encrypt(clear, sign);
  const recoveredPlant = decodeAll(planted, sign);
  assert.ok(recoveredPlant.some(p =>
    p.plain.length === clear.length &&
    p.plain.every((v, i) => v === clear[i])));
  assert.deepEqual(encrypt(clear, sign), planted);

  const rows = candidates.map(p => ({
    literalFBypassAtP55Indices: p.bypass,
    consumedSourceDigits: p.clock,
    gp29IoC: ioc(p.plain),
    firstCompletePrintedWord: roman(p.plain.slice(1, 5)),
    opening18GP: roman(p.plain.slice(0, 18)),
  }));
  assert.ok(rows.every(p => p.gp29IoC < 0.034));
  result.candidateModels.push({
    additiveEncryptionSign: sign,
    validSourceOriginalPaths: candidates.length,
    sourceExactReencryption: true,
    nativeP57FullLengthPlant: true,
    paths: rows,
  });
}

console.log(JSON.stringify(result, null, 2));
