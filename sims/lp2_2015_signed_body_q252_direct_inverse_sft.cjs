'use strict';

/**
 * Source-selected 2015 signed body against the source-derived H*G GP29 quotient
 * and the three complete table/terminal receivers. All writes disabled.
 *
 * Run from repository root: node sims/lp2_2015_signed_body_q252_direct_inverse_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8').replace(/\r\n/g, '\n');
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const signed = read('resources/historical/cicada2015-planned-parenthood-denial.asc');
const mod = x => ((x % 29) + 29) % 29;
const alphabet = corpus.translit;
const index = Object.fromEntries(alphabet.map((s, i) => [s, i]));
const has = Object.prototype.hasOwnProperty;

/** Encode Roman text into source-native GP29 tokens with the archive's orthography. */
function encodeGP(text) {
  const letters = text.toUpperCase().replace(/QU/g, 'CW').replace(/[KQ]/g, 'C')
    .replace(/V/g, 'U').replace(/Z/g, 'S').replace(/[^A-Z]/g, '');
  const output = [];
  for (let i = 0; i < letters.length;) {
    const pair = letters.slice(i, i + 2);
    if (has.call(index, pair)) {
      output.push(index[pair]);
      i += 2;
    } else {
      assert(has.call(index, letters[i]), 'Unknown GP character');
      output.push(index[letters[i]]);
      i++;
    }
  }
  return output;
}
assert(signed.startsWith('-----BEGIN PGP SIGNED MESSAGE-----\nHash: SHA1'));
const split = signed.indexOf('\n\n\n');
const end = signed.indexOf('\n\n\n-----BEGIN PGP SIGNATURE-----');
assert(split !== -1 && end > split);
const signedBody = signed.slice(split + 3, end);
assert(signedBody.startsWith('Some news organisations have recently claimed'));
assert(signedBody.endsWith('\n\n3301'));
const key = encodeGP(signedBody);
assert.equal(key.length, 247);

/** Polynomial long division in descending powers of x, preserving H*G scaling. */
function sourceQuotient() {
  const divisor = [12, 17, 11, 21, 23]; // descending H(x)*G(x)
  const residual = grid.bytes.map(x => x % 29);
  const quotient = [];
  assert.equal(residual.length, 256);
  for (let i = 0; i < 252; i++) {
    const q = mod(residual[i] * 17); // 12^(-1) mod 29
    quotient.push(q);
    for (let j = 0; j < divisor.length; j++) {
      residual[i + j] = mod(residual[i + j] - q * divisor[j]);
    }
  }
  assert.deepEqual(residual.slice(-4), [0, 0, 0, 0]);
  assert.deepEqual(quotient.slice(0, 20), [
    0, 12, 9, 28, 2, 25, 23, 21, 18, 28,
    21, 17, 17, 8, 15, 21, 7, 21, 18, 7
  ]);
  return quotient;
}
const quotient = sourceQuotient();
const page = n => corpus.pages.find(p => p.page === n).indices;
assert.equal(page(55).length, 76);
assert.equal(page(56).length, 85);
assert.equal(page(57).length, 95);
const targets = [
  ['H*G quotient252', quotient],
  ['LP2 p55 complete76', page(55)],
  ['before-table sentence138', [...page(48).slice(-72), ...page(49)]],
  ['after-table sentence170', [...page(51), ...page(52).slice(0, 78)]]
];
assert.deepEqual(targets.map(t => t[1].length), [252, 76, 138, 170]);

function ioc(symbols) {
  const freq = Array(29).fill(0);
  for (const s of symbols) freq[s]++;
  return freq.reduce((v, count) => v + count * (count - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

/**
 * Enumerate the *complete* p56 literal-F transparency rule with a fixed key.
 * A nonliteral F ciphertext may be emitted from non-F plaintext and does
 * consume a key position; a literal plaintext F is emitted unchanged and
 * consumes no key. This covers both interpretations of every ciphertext F.
 *
 * @param {number[]} cipher Original GP29 ciphertext
 * @param {number} direction -1 or +1 in plaintext P = C + direction*K
 * @param {boolean} bypass Whether to use authentic p56 F transparency
 * @returns {{paths:{text:number[], clock:number}[], failure:number|null}}
 */
function inverse(cipher, direction, bypass) {
  let paths = [{text: [], clock: 0}];
  for (let i = 0; i < cipher.length; i++) {
    const next = [];
    for (const candidate of paths) {
      const letter = mod(cipher[i] + direction * key[candidate.clock % key.length]);
      if (!bypass || letter !== 0) {
        next.push({text: [...candidate.text, letter], clock: candidate.clock + 1});
      }
      if (bypass && cipher[i] === 0) {
        next.push({text: [...candidate.text, 0], clock: candidate.clock});
      }
    }
    if (!next.length) return {paths: [], failure: i};
    paths = next;
  }
  return {paths, failure: null};
}

/** Forward encryption under the same source-fixed operation. */
function forward(plain, direction, bypass) {
  let clock = 0;
  return plain.map(p => {
    if (bypass && p === 0) return 0;
    const out = mod(p - direction * key[clock % key.length]);
    clock++;
    return out;
  });
}
const summary = [];
for (const [name, ciphertext] of targets) {
  for (const direction of [-1, +1]) {
    for (const bypass of [false, true]) {
      const result = inverse(ciphertext, direction, bypass);
      const completed = result.paths.map(candidate => {
        assert.deepEqual(forward(candidate.text, direction, bypass), ciphertext);
        return candidate;
      });
      const candidate = completed.slice().sort((a, b) => ioc(b.text) - ioc(a.text))[0];
      const row = {
        target: name, direction, bypass, paths: completed.length,
        failure: result.failure,
        ioc: candidate ? ioc(candidate.text) : null,
        opening: candidate ? candidate.text.slice(0, 30).map(n => alphabet[n]).join(' ') : null
      };
      summary.push(row);
    }
  }
}

// Every test has an authentic source-native positive that must survive every
// ciphertext-F ambiguity. Recover all 252 planted GP29 symbols exactly.
const sourcePlant = Array.from({length: 252}, (_, i) => page(57)[i % 95]);
for (const direction of [-1, +1]) for (const bypass of [false, true]) {
  const planted = forward(sourcePlant, direction, bypass);
  const output = inverse(planted, direction, bypass);
  assert.equal(output.failure, null);
  assert(output.paths.some(p => p.text.every((s, i) => s === sourcePlant[i])));
}
// Assert the four source-fixed original outcomes (no fitting or language search).
for (const [target, direction, failure] of [
  ['H*G quotient252', -1, 21], ['H*G quotient252', 1, 100],
  ['LP2 p55 complete76', -1, 2], ['LP2 p55 complete76', 1, 7],
  ['after-table sentence170', -1, 55], ['after-table sentence170', 1, 13]
]) {
  const row = summary.find(x => x.target === target && x.direction === direction && x.bypass);
  assert.equal(row.failure, failure);
  assert.equal(row.paths, 0);
}
assert.equal(summary.find(x => x.target === 'before-table sentence138' && x.direction === -1 && x.bypass).paths, 4);
assert.equal(summary.find(x => x.target === 'before-table sentence138' && x.direction === 1 && x.bypass).paths, 0);
console.log(JSON.stringify({signedBodyGP29: key.length, quotientGP29: quotient.length,
  solvedP57PlaintextIoC: ioc(page(57)), summary, plantedPositives: '4/4'}, null, 2));
