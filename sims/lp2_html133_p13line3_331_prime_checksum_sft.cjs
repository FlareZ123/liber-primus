'use strict';

/**
 * Source-anchored 2014 title133 -> id331 line-prime checksum and bounded
 * source-line GP29 direct-key inverse. Read-only CommonJS SFT.
 * No LP2 unknown plaintext is claimed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');

/** @param {string} relative @returns {string} */
function source(relative) {
  return fs.readFileSync(path.join(__dirname, '..', relative), 'utf8');
}

const corpus = JSON.parse(source('resources/liber-primus/lp2-corpus.json'));
const original = source('resources/liber-primus/lp2-transcription.txt');
const html = source('resources/cicada2014-onion7-index.html');
const sourcePages = original.split('%');
sourcePages.splice(50, 0, '');
assert.equal(sourcePages.length, 58);
assert.equal(corpus.pages.length, 58);

const byRune = new Map(corpus.runes.map((r, i) => [r, i]));
assert.equal(byRune.size, 29);

/** @param {string} text @returns {number[]} */
function runes(text) {
  return [...text].flatMap(ch => byRune.has(ch) ? [byRune.get(ch)] : []);
}

/** @param {number[]} numbers @returns {number} */
function primeSum(numbers) {
  return numbers.reduce((sum, n) => sum + corpus.prime[n], 0);
}

/** @param {number} page @returns {number[][]} */
function lines(page) {
  return sourcePages[page].split('/').map(runes).filter(a => a.length > 0);
}

/** @param {number[]} numbers @returns {number} */
function ioc(numbers) {
  const bins = Array(29).fill(0);
  for (const value of numbers) bins[value]++;
  const numerator = bins.reduce((sum, count) => sum + count * (count - 1), 0);
  return numerator / (numbers.length * (numbers.length - 1));
}

/** @param {number} actual @param {number} expected */
function close(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-12, `${actual} != ${expected}`);
}

assert.match(html, /<title>133<\/title>/);
assert.match(html, /<div id="331">/);
const solvedP57Sentences = sourcePages[57].split('.');
assert.equal(primeSum(runes(solvedP57Sentences[0])), 449, 'PARABLE heading');
const p57Clauses = solvedP57Sentences.slice(1, 4).map(s => primeSum(runes(s)));
assert.deepEqual(p57Clauses, [1259, 1031, 1229]);
assert.deepEqual(p57Clauses.map(n => n % 449), [361, 133, 331]);

const key = lines(13)[2];
assert.deepEqual(key, [
  16, 3, 14, 26, 19, 0, 14, 18, 3, 25, 6, 26, 20, 3, 12,
  0, 15, 25, 12, 19, 27, 22, 7,
]);
assert.equal(key.length, 23);
assert.equal(primeSum(key), 1229);
assert.equal(primeSum(key) % 449, 331);
assert.equal(primeSum(lines(13)[1]) % 449, 59);
assert.equal(primeSum(lines(13)[3]) % 449, 244);
assert.equal(primeSum(lines(33)[0]), 920);
assert.equal(primeSum(lines(2)[1]), 1018);

// Literal three-decimal-digit page:line addresses: 2-digit 2014 LP2 page,
// 1-based printed line 1..9. A trailing digit 0 has no line interpretation.
const addresses = ['133', '331', '022'];
const addressPrimeSums = addresses.map(a => {
  const page = Number(a.slice(0, 2));
  const line = Number(a.slice(2));
  assert.ok(line >= 1 && line <= 9);
  return primeSum(lines(page)[line - 1]);
});
assert.deepEqual(addressPrimeSums, [1229, 920, 1018]);
assert.deepEqual(addressPrimeSums.map(n => String(n % 449).padStart(3, '0')), [
  '331', '022', '120',
]);
assert.equal(Number('120'.slice(2)), 0, 'address 120 is invalid under the frozen grammar');

const originalPages = corpus.pages.slice(0, 56);
const originalRunes = originalPages.flatMap(p => p.indices);
assert.equal(originalRunes.length, 12956);
assert.equal(corpus.pages[50].indices.length, 0);
close(ioc(originalRunes), 0.03447839786450569);

/** @param {number} sign @param {'book'|'page'|'chapter'} clock @returns {number[]} */
function invert(sign, clock) {
  const visualChapterStarts = new Set([0, 3, 8, 15, 23, 27, 33, 40, 54]);
  let offset = 0;
  const output = [];
  for (const page of originalPages) {
    if (clock === 'page' || (clock === 'chapter' && visualChapterStarts.has(page.page))) {
      offset = 0;
    }
    for (const c of page.indices) {
      output.push((c + 29 + sign * key[offset % key.length]) % 29);
      offset++;
    }
  }
  return output;
}

// A reversible direct GP29 key trial: no source-selected key stream beyond the
// 23 original rune values. Both signs and three visible reset conventions.
const outcomes = [];
for (const clock of ['book', 'page', 'chapter']) {
  for (const sign of [-1, 1]) {
    const candidate = invert(sign, clock);
    const value = ioc(candidate);
    outcomes.push({ clock, sign, ioc: value });
    assert.ok(value > 0.0344 && value < 0.0346, 'candidate should remain ciphertext-like');
  }
}
close(outcomes[0].ioc, 0.03447554999857607);
close(outcomes[1].ioc, 0.03445375607897239);
close(outcomes[2].ioc, 0.034500727993175606);
close(outcomes[3].ioc, 0.03451944764746613);
close(outcomes[4].ioc, 0.03448271136854972);
close(outcomes[5].ioc, 0.03444709517079391);

const p55 = corpus.pages[55].indices;
assert.equal(p55.length, 76);
const p55Only = [-1, 1].map(sign => ({
  sign,
  ioc: ioc(p55.map((c, i) => (c + 29 + sign * key[i % 23]) % 29)),
}));
close(p55Only[0].ioc, 0.037192982456140354);
close(p55Only[1].ioc, 0.028421052631578948);

// Source-constrained 23-to-23 consumer, using the p55 twice-peeled 23-rune
// word core independently selected by the p57 23-dot red stencil.
const p55Words = sourcePages[55].split('/').join('').split(/[-.&$]/)
  .map(runes).filter(word => word.length > 0);
assert.deepEqual(p55Words.map(word => word.length), [
  1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3,
]);
assert.deepEqual(p55Words.flat(), p55);
const p55Core23 = p55Words.slice(1).flatMap(word => word.slice(2, word.length - 2));
assert.deepEqual(p55Core23.map(n => corpus.translit[n]), [
  'G', 'D', 'A', 'B', 'F', 'X', 'I', 'M', 'U', 'C', 'P', 'H', 'NG',
  'D', 'IA', 'I', 'G', 'X', 'EO', 'TH', 'TH', 'I', 'M',
]);
assert.equal(p55Core23.length, key.length);

// The parable's first source residue is 361, yielding physical page36 line1.
// That independently addressed line has the same 23-rune GP-prime sum as the
// independently documented p55 twice-peeled core.
const p36Line1 = lines(36)[0];
assert.deepEqual(p36Line1, [
  26, 9, 1, 7, 21, 8, 6, 26, 4, 3, 10, 20, 9, 14, 9, 3,
  13, 0, 28, 25, 25, 3, 14,
]);
assert.equal(p36Line1.length, 23);
assert.equal(primeSum(p36Line1), 1020);
assert.equal(primeSum(p55Core23), 1020);

const source361DirectCore = [-1, 1].map(sign => {
  const plain = p55Core23.map((c, i) => (c + 29 + sign * p36Line1[i]) % 29);
  assert.deepEqual(
    plain.map((p, i) => (p + 29 - sign * p36Line1[i]) % 29),
    p55Core23,
  );
  return { sign, gp: plain.map(n => corpus.translit[n]).join('-') };
});
assert.equal(source361DirectCore[0].gp, 'N-X-D-I-H-G-R-OE-Y-TH-O-B-EO-N-E-W-OE-X-P-G-G-W-C');
assert.equal(source361DirectCore[1].gp, 'O-O-AE-A-NG-OE-T-T-C-H-D-EA-U-H-W-P-M-X-J-IA-IA-P-R');
const core23Candidates = [-1, 1].map(sign => {
  const plain = p55Core23.map((c, i) => (c + 29 + sign * key[i]) % 29);
  assert.deepEqual(
    plain.map((p, i) => (p + 29 - sign * key[i]) % 29),
    p55Core23,
  );
  return { sign, gp: plain.map(n => corpus.translit[n]).join('-') };
});
assert.equal(core23Candidates[0].gp, 'M-L-I-L-I-X-AE-U-IA-N-W-J-U-L-S-I-L-E-F-EO-R-B-EO');
assert.equal(core23Candidates[1].gp, 'OE-Y-N-X-M-X-A-H-R-U-M-C-EO-Y-I-I-NG-I-A-NG-F-O-Y');

// Source-order 361,133,331 selects exactly 23+23+18=64 printed rune cells.
// Treat this as one frozen GP-prime-byte candidate for the next p56 AN END
// 512-bit digest, without fitting a byte alphabet or a position offset.
const addressKey64 = [...p36Line1, ...key, ...lines(33)[0]];
assert.deepEqual(
  [p36Line1.length, key.length, lines(33)[0].length],
  [23, 23, 18],
);
assert.equal(addressKey64.length, 64);
const targetHex = JSON.parse(source('resources/cicada2014-archive-hash-manifest.json')).targetHex;
assert.equal(targetHex.length, 128);
const digestCandidates = [];
for (const encoding of ['gpIndex', 'gpPrime']) {
  const bytes = Buffer.from(encoding === 'gpIndex'
    ? addressKey64
    : addressKey64.map(i => corpus.prime[i]));
  assert.equal(bytes.length, 64);
  for (const algorithm of ['sha512', 'blake2b512']) {
    const digest = crypto.createHash(algorithm).update(bytes).digest('hex');
    assert.notEqual(digest, targetHex, 'source64 unexpectedly matched p56 target');
    digestCandidates.push({ encoding, algorithm, prefix: digest.slice(0, 16), matchesTarget: digest === targetHex });
  }
}
const p55Register64 = [-1, 1].map(sign => {
  const plain = p55.map((c, i) => (c + 29 + sign * addressKey64[i % 64]) % 29);
  assert.deepEqual(plain.map((p, i) => (p + 29 - sign * addressKey64[i % 64]) % 29), p55);
  return { sign, ioc: ioc(plain), initialGP: plain.slice(0, 30).map(x => corpus.translit[x]).join('-') };
});
close(p55Register64[0].ioc, 0.037192982456140354);
close(p55Register64[1].ioc, 0.032280701754385965);

// Fully solved authentic GP-rune p57 is the independent positive control.
const known = corpus.pages[57].indices;
assert.equal(known.length, 95);
for (const sign of [-1, 1]) {
  const cipher = known.map((p, i) => (p + 29 - sign * key[i % 23]) % 29);
  const recovered = cipher.map((c, i) => (c + 29 + sign * key[i % 23]) % 29);
  assert.deepEqual(recovered, known);
}

console.log(JSON.stringify({
  title: 133, divId: 331, headingPrimeSum: 449,
  solvedP57ClauseSums: p57Clauses, clauseResidues: p57Clauses.map(n => n % 449),
  p13Line3: { gpRunes: key.length, sum: primeSum(key), residue: primeSum(key) % 449 },
  literalAddressWalk: { addresses, sums: addressPrimeSums, stopAt: '120 (invalid line 0)' },
  originalRunes: originalRunes.length, rawIoc: ioc(originalRunes),
  fullBookCandidates: outcomes, p55Candidates: p55Only,
  p55TwicePeeledCoreCandidates: core23Candidates,
  firstClauseAddress361: { page: 36, printedLine: 1, sum: primeSum(p36Line1), gpRunes: p36Line1.length },
  p55CorePrimeSum: primeSum(p55Core23), p55CoreSource361DirectCandidates: source361DirectCore,
  sourceAddressKey64: { counts: [23,23,18], length: addressKey64.length },
  p56DigestCandidates: digestCandidates, p55SourceRegister64Candidates: p55Register64,
  solvedP57PositiveControl: '95/95 for both signs',
}, null, 2));
