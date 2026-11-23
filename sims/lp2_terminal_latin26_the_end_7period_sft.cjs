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

/**
 * A stronger complete printed-context alternative on p27 is:
 *   "AT THE END OF A" (2/3/3/2/1 source token lengths).
 * It predicts O, not A, at p27:34. Thus it cannot share a
 * ciphertext-history-only state with the solved p56 first A.
 *
 * The p27 wing has fourteen visible membrane faces in the source art.
 * Under a conjectured page-local period14 additive key the eleven
 * anchored raw-Latin crib letters fix eleven key phases without guesses.
 * The other three phases are deliberately left unconstrained. The
 * 185 p27 rune positions already fixed by the crib fail an English-like
 * frequency profile independently of all 29^3 unchosen key triples.
 */
const rawP27Phrase = [24, 16, 16, 8, 18, 18, 9, 23, 3, 0, 24];
const originalP27Phrase = [17, 0, 23, 11, 1, 17, 18, 10, 25, 0, 13];
assert.deepEqual(p27.slice(26, 37), originalP27Phrase);
assert.equal(translated(rawP27Phrase), 'A T T H E E N D O F A');
assert.equal(rawP27Phrase[8], 3);
assert.equal(crib[6], 24); // identical AE ciphertext, incompatible guessed plain.
const p27FourteenPhase = [];
for (const sign of [1, -1]) {
  const key = Array(14).fill(null);
  for (let i = 0; i < rawP27Phrase.length; i += 1) {
    const phase = (26 + i) % 14;
    key[phase] = mod29(originalP27Phrase[i] - sign * rawP27Phrase[i]);
  }
  assert.deepEqual(
    key,
    sign === 1
      ? [7, 3, 12, 28, 9, 16, 22, 0, 18, null, null, null, 22, 13]
      : [10, 19, 19, 6, 27, 4, 28, 0, 8, null, null, null, 12, 16]
  );
  const available = (array) => array.map((c, i) => {
    const k = key[i % 14];
    if (k === null) return null;
    const decoded = mod29(sign === 1 ? c - k : k - c);
    assert.equal(mod29(sign === 1 ? decoded + k : k - decoded), c);
    return decoded;
  }).filter((x) => x !== null);
  const plain27 = available(p27);
  const plain55 = available(p55);
  assert.equal(plain27.length, 185);
  assert.equal(plain55.length, 61);
  const expected27 = sign === 1 ? 0.03513513513513514 : 0.03372502937720329;
  const expected55 = sign === 1 ? 0.03442622950819672 : 0.040437158469945354;
  assert.ok(Math.abs(ioc(plain27) - expected27) < 1e-12);
  assert.ok(Math.abs(ioc(plain55) - expected55) < 1e-12);
  p27FourteenPhase.push({
    sign,
    key,
    fixedP27: plain27.length,
    fixedP27IoC: ioc(plain27),
    fixedP55: plain55.length,
    fixedP55IoC: ioc(plain55),
  });
}


// Global printed-word clock, a separate independent bookend register:
// exactly 2,896 original words; the repeated ordered 3+3 word bigram
// begins at global word indices 1,462 and 2,894, both even. This
// naturally permits two alternated word keys of THREE positions each,
// resetting within every printed word. It respects all printed spaces,
// unlike the continuous seven-phase or 14-phase candidates above.
const fs = require('node:fs');
const path = require('node:path');
const runicSource = fs.readFileSync(
  path.join(__dirname, '../resources/liber-primus/lp2-transcription.txt'),
  'utf8'
);
// Source / line and % physical-page wraps are explicitly *not*
// lexical dividers. Original punctuation, hyphens and section symbols
// remain dividers. Include the first 2,896 complete unknown-page words.
const originalWords = (runicSource.replaceAll('/', '').replaceAll('\r', '').replaceAll('\n', '').replaceAll('%', '').match(/[\u16a0-\u16ff]+/gu) || [])
  .slice(0, 2896)
  .map((word) => [...word].map((rune) => source.runes.indexOf(rune)));
assert.equal(originalWords.length, 2896);
const bookCipher = source.pages.filter((entry) => entry.page < 56).flatMap((entry) => entry.indices);
assert.deepEqual(originalWords.flat(), bookCipher);
assert.deepEqual(originalWords[1462], [23, 11, 1]);
assert.deepEqual(originalWords[1463], [17, 18, 10]);
assert.deepEqual(originalWords[2894], [23, 11, 1]);
assert.deepEqual(originalWords[2895], [17, 18, 10]);
assert.equal((2894 - 1462) % 2, 0);

const twoWordReset = [];
for (const sign of [1, -1]) {
  const firstTwoWordCrib = [[16, 8, 18], [18, 9, 23]];
  const firstTwoWordCipher = [[23, 11, 1], [17, 18, 10]];
  const keys = firstTwoWordCipher.map((w, i) =>
    w.map((c, j) => mod29(c - sign * firstTwoWordCrib[i][j]))
  );
  const plainWords = originalWords.map((word, i) =>
    word.map((c, j) => {
      const k = keys[i % 2][j % 3];
      const plain = mod29(sign === 1 ? c - k : k - c);
      assert.equal(mod29(sign === 1 ? plain + k : k - plain), c);
      return plain;
    })
  );
  assert.deepEqual(plainWords[1462], firstTwoWordCrib[0]);
  assert.deepEqual(plainWords[1463], firstTwoWordCrib[1]);
  assert.deepEqual(plainWords[2894], firstTwoWordCrib[0]);
  assert.deepEqual(plainWords[2895], firstTwoWordCrib[1]);
  const plainBook = plainWords.flat();
  assert.equal(plainBook.length, 12956);
  const splitPages = [];
  let offset = 0;
  for (const physical of source.pages.filter((entry) => entry.page < 56 && entry.indices.length)) {
    const a = plainBook.slice(offset, offset + physical.indices.length);
    offset += physical.indices.length;
    splitPages.push({ page: physical.page, ioc: ioc(a), prefix: translated(a.slice(0, 15)) });
  }
  const p27Record = splitPages.find((p) => p.page === 27);
  const p55Record = splitPages.find((p) => p.page === 55);
  twoWordReset.push({
    sign, keys, fullIoC: ioc(plainBook), p27: p27Record, p55: p55Record,
    start: plainWords.slice(0, 13).map((w) => translated(w)).join(' / '),
  });
}
assert.ok(Math.abs(twoWordReset[0].fullIoC - 0.034490623431216116) < 1e-12);
assert.ok(Math.abs(twoWordReset[1].fullIoC - 0.0344612868374139) < 1e-12);

console.log(JSON.stringify({
  kind: 'original LP2 terminal seven-period fixed-crib trial',
  sevenRuneSource: cEnd,
  sourceOriginalP27: 'page27 offsets28..34',
  sourceOriginalTerminal: 'page55 offsets70..75 + page56 offset0',
  candidatePlaintext: translated(crib),
  p57KnownNativeControlIoC: ioc(p57),
  records,
  p27FourteenPhase,
  twoWordReset,
  conclusion: 'Both frozen seven-period alternatives decode p27 and p55 to nonlinguistic GP29 streams. No original unknown plaintext is authenticated.',
}, null, 2));
