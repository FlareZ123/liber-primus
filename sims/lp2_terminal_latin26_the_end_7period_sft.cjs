'use strict';

/**
 * Original-input source-locked terminal THE END A crib gate.
 * The published plaintext uses 29 GP runes, but the *hypothesis* here
 * is seven ordinary Latin letters T,H,E,E,N,D,A written as individual
 * GP rune-class equivalents without the authentic TH contraction.
 * Only the two signed GP29 additive orientations and one seven-rune
 * page-local clock anchored by an exact repeated original ciphertext
 * block are admitted. This code reads and does not write the sources.
 */
const assert = require('node:assert/strict');
const source = require('../resources/liber-primus/lp2-corpus.json');

const mod29 = (n) => ((n % 29) + 29) % 29;
const page = (n) => source.pages.find((p) => p.page === n).indices;
const translated = (a) => a.map((x) => source.translit[x]).join(' ');
const ioc = (a) => {
  const count = Array(29).fill(0);
  for (const x of a) count[x] += 1;
  return count.reduce((acc, n) => acc + n * (n - 1), 0) / (a.length * (a.length - 1));
};

const p27 = page(27);
const p55 = page(55);
const p56 = page(56);
const p57 = page(57);
const c27 = p27.slice(28, 35);
const cEnd = [...p55.slice(70), p56[0]];
assert.equal(p27.length, 234);
assert.equal(p55.length, 76);
assert.deepEqual(c27, cEnd);
assert.deepEqual(cEnd, [23, 11, 1, 17, 18, 10, 25]);

// "THE END A" is a hypothetical raw-Latin-letter register.
// Source-native contracted Gematria Primus would have only six runes.
const crib = [16, 8, 18, 18, 9, 23, 24];
assert.equal(translated(crib), 'T H E E N D A');
assert.equal(p56[0], 25); // Independently solved as A: GP(A)=24 plus phi(2)=1.

const records = [];
for (const sign of [1, -1]) {
  // sign +1: C=P+K; sign -1: C=K-P.
  const key = cEnd.map((c, i) => mod29(c - sign * crib[i]));
  const encrypt = (p, k) => mod29(sign === 1 ? p + k : k - p);
  const decrypt = (c, k) => mod29(sign === 1 ? c - k : k - c);
  const decode = (cipher, anchor) => cipher.map((c, i) =>
    decrypt(c, key[((i - anchor) % 7 + 7) % 7])
  );
  const sourcePages = [
    { pageNo: 27, cipher: p27, anchor: 28 },
    { pageNo: 55, cipher: p55, anchor: 70 },
  ];
  for (const entry of sourcePages) {
    const out = decode(entry.cipher, entry.anchor);
    for (let j = 0; j < out.length; j += 1) {
      const phase = ((j - entry.anchor) % 7 + 7) % 7;
      assert.equal(encrypt(out[j], key[phase]), entry.cipher[j]);
    }
    const required = entry.pageNo === 27 ? 7 : 6;
    assert.deepEqual(
      out.slice(entry.anchor, entry.anchor + required),
      crib.slice(0, required)
    );
    const record = {
      sign,
      key,
      page: entry.pageNo,
      ioc: ioc(out),
      start: translated(out.slice(0, 20)),
      last: translated(out.slice(-13)),
    };
    records.push(record);
  }
  // Source-native solved p57 is a positive demonstration of full exact
  // encrypt/decrypt behavior, independently of any guessed p55 plaintext.
  const plant = p57.map((p, i) => encrypt(p, key[i % 7]));
  assert.deepEqual(plant.map((c, i) => decrypt(c, key[i % 7])), p57);
}
const expected = [
  [1, 27, 0.03312424342467261],
  [1, 55, 0.03368421052631579],
  [-1, 27, 0.03481163567000477],
  [-1, 55, 0.03859649122807018],
];
for (let i = 0; i < records.length; i += 1) {
  assert.equal(records[i].sign, expected[i][0]);
  assert.equal(records[i].page, expected[i][1]);
  assert.ok(Math.abs(records[i].ioc - expected[i][2]) < 1e-12);
}
console.log(JSON.stringify({
  kind: 'original LP2 terminal seven-period fixed-crib trial',
  sevenRuneSource: cEnd,
  sourceOriginalP27: 'page27 offsets28..34',
  sourceOriginalTerminal: 'page55 offsets70..75 + page56 offset0',
  candidatePlaintext: translated(crib),
  p57KnownNativeControlIoC: ioc(p57),
  records,
  conclusion: 'Both frozen seven-period alternatives decode p27 and p55 to nonlinguistic GP29 streams. No original unknown plaintext is authenticated.',
}, null, 2));
