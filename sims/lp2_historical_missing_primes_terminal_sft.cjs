'use strict';

/**
 * Historically source-motivated prime omissions, one fixed original-input gate.
 *
 * 2013 participant-preserved telnet 'primes' output jumps 71 -> 1229,
 * omitting indices 21..200 (exactly 180 successive primes). This exact
 * length also equals the LP2 p56+p57 known plaintext and 32x8 grid interior.
 *
 * 2014 source-stage11 cleartext has trailing blank prime-length groups
 * 2,3,7,11,13,17,23,29,31,37 and leading+trailing 5,7 around the onion;
 * 19 is absent. Direct GP19=W literal-skip/phi(prime) test is frozen.
 *
 * Runs with no external network and never changes input files.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} filename @returns {string} */
const read = filename => fs.readFileSync(path.join(root, filename), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const signed2014 = read('resources/historical/cicada2014-stage11-message.asc');
const quadgramData = read('resources/control/duko_round27_english_quadgrams.txt');

/** @param {number} n @returns {number[]} */
function firstPrimes(n) {
  const primes = [];
  for (let x = 2; primes.length < n; x++) {
    let ok = true;
    for (let k = 2; k * k <= x; k++) if (x % k === 0) { ok = false; break; }
    if (ok) primes.push(x);
  }
  return primes;
}
const primes = firstPrimes(2000);
assert.deepEqual(primes.slice(0, 20), [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47,
  53, 59, 61, 67, 71,
]);
const missing2013 = primes.slice(20, 200);
assert.equal(missing2013.length, 180);
assert.equal(missing2013[0], 73);
assert.equal(missing2013[179], 1223);
assert.equal(primes[200], 1229);
// The original unsigned historical transcript gives these two endpoints;
// the source omits 180 complete intervening primes. It does not establish
// that 180, rather than prime #201, is the author's selected number.

const page = n => corpus.pages.find(item => item.page === n);
const p56 = page(56).indices, p57 = page(57).indices;
/** @param {number[]} input @param {number|null} skippedSourceIndex @param {number|null} literalLocalPosition @returns {number[]} */
function phiDecode(input, skippedSourceIndex = null, literalLocalPosition = null) {
  let clock = 0;
  return input.map((rune, i) => {
    if ((literalLocalPosition !== null && i === literalLocalPosition)
      || (skippedSourceIndex !== null && rune === skippedSourceIndex)) return rune;
    return ((rune - (primes[clock++] - 1)) % 29 + 29) % 29;
  });
}
/** @param {number[]} input @param {number|null} skippedSourceIndex @param {number|null} literalLocalPosition @returns {number[]} */
function phiEncode(input, skippedSourceIndex = null, literalLocalPosition = null) {
  let clock = 0;
  return input.map((rune, i) => {
    if ((literalLocalPosition !== null && i === literalLocalPosition)
      || (skippedSourceIndex !== null && rune === skippedSourceIndex)) return rune;
    return (rune + primes[clock++] - 1) % 29;
  });
}
assert.equal(p56.length, 85);
assert.equal(p57.length, 95);
const p56Plain = phiDecode(p56, null, 56);
const exactP56Words = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const gp = corpus.translit;
const tok = gp.map((symbol, i) => ({ symbol, i })).sort((a, b) => b.symbol.length - a.symbol.length);
/** @param {string} text @returns {number[]} */
function encodeWords(text) {
  const out = [];
  for (const word of text.split(' ')) for (let j = 0; j < word.length;) {
    const item = tok.find(t => word.startsWith(t.symbol, j));
    assert.ok(item);
    out.push(item.i);
    j += item.symbol.length;
  }
  return out;
}
assert.deepEqual(p56Plain, encodeWords(exactP56Words));
assert.deepEqual(phiEncode(p56Plain, null, 56), p56);
const knownPlain = p56Plain.concat(p57);
assert.equal(knownPlain.length, 180);
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every(row => row.length === 8));
const interior = grid.byte_rows.slice(1, 31).flatMap(row => row.slice(1, 7));
assert.equal(interior.length, 180);
const expected = 180 / 29;
const decoded = {
  rawTableMod29: interior.map(byte => byte % 29),
  missingPrimeMod29: missing2013.map(prime => prime % 29),
  missingPrimeTotientMod29: missing2013.map(prime => (prime - 1) % 29),
  tableMinusPrimeTotientMod29: interior.map((byte, i) =>
    ((byte - (missing2013[i] - 1)) % 29 + 29) % 29),
  tablePlusPrimeTotientMod29: interior.map((byte, i) =>
    (byte + missing2013[i] - 1) % 29),
};
const matched = {};
for (const [key, values] of Object.entries(decoded)) {
  matched[key] = values.filter((value, i) => value === knownPlain[i]).length;
}
assert.deepEqual(matched, {
  rawTableMod29: 6,
  missingPrimeMod29: 7,
  missingPrimeTotientMod29: 5,
  tableMinusPrimeTotientMod29: 4,
  tablePlusPrimeTotientMod29: 8,
});
const positiveTable = knownPlain.map((symbol, i) =>
  (symbol + (missing2013[i] - 1)) % 29);
const checkPlain = positiveTable.map((byte, i) =>
  ((byte - (missing2013[i] - 1)) % 29 + 29) % 29);
assert.deepEqual(checkPlain, knownPlain);
const plantedReencrypt = checkPlain.map((symbol, i) =>
  (symbol + missing2013[i] - 1) % 29);
assert.deepEqual(plantedReencrypt, positiveTable);

// 2014 signed redirect whitespace is source-preserved but signed text
// canonicalization ignores every trailing space and tab (RFC 4880 7).
// Preserve byte-local actual whitespace in the archived text; the signed
// bytes authenticate the internal five-space indentation of onion line.
const clearPart = signed2014.split('-----BEGIN PGP SIGNATURE-----')[0];
const whitespaceCounts = clearPart.split(/\r?\n/).slice(3)
  .map(line => ({ line, leading: (line.match(/^ */) || [''])[0].length,
    trailing: (line.match(/ *$/) || [''])[0].length }));
const nonzeroTails = whitespaceCounts.filter(v => v.trailing)
  .map(v => v.trailing);
assert.deepEqual(nonzeroTails, [2, 3, 7, 11, 13, 17, 23, 29, 31, 37]);
assert.ok(whitespaceCounts.some(v => v.leading === 5 && v.trailing === 7
  && v.line.includes('.onion')));
assert.ok(!nonzeroTails.includes(19));
const visualGroups = [2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37];
assert.equal(visualGroups.includes(19), false);
assert.equal(primes[7], 19);
assert.equal(gp[7], 'W');

const quad = new Map();
let quadTotal = 0;
for (const line of quadgramData.trim().split(/\r?\n/)) {
  const [a, b] = line.trim().split(/\s+/);
  const number = Number(b);
  if (a && Number.isFinite(number)) { quad.set(a, number); quadTotal += number; }
}
/** @param {number[]} indices @returns {number} */
function score(indices) {
  const text = indices.map(v => gp[v]).join('');
  let s = 0;
  for (let i = 0; i <= text.length - 4; i++) {
    s += Math.log10((quad.get(text.slice(i, i + 4)) || 0.01) / quadTotal);
  }
  return s / (text.length - 3);
}
assert.ok(Math.abs(score(p56Plain) - (-4.461648582243903)) < 1e-10);
const chapters = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]];
const chapterResults = chapters.map(([start, end]) => {
  const input = corpus.pages.filter(x => x.page >= start && x.page <= end)
    .flatMap(x => x.indices);
  const deciphered = phiDecode(input, 7);
  assert.deepEqual(phiEncode(deciphered, 7), input);
  return {
    sourcePages: start + '-' + end,
    runes: input.length,
    WOccurrences: input.filter(x => x === 7).length,
    originalScore: score(input),
    literalWPrimeTotientScore: score(deciphered),
  };
});
assert.equal(chapterResults.reduce((s, v) => s + v.runes, 0), 12956);
const p56AllW = phiDecode(p56, 7);
assert.ok(score(p56AllW) < -7);

console.log(JSON.stringify({
  source2013: {
    kind: 'unsigned participant-preserved telnet primes output; 71 to 1229 gap',
    missingPrimeOrdinalsOneBased: [21, 200],
    missingPrimeCount: missing2013.length,
    terminalKnownPlainRunes: knownPlain.length,
    tableInnerCells: interior.length,
    chanceExpectedMatches: expected,
    originalSourceFixedMatches: matched,
    plantedKnownPlainExact: checkPlain.length,
  },
  source2014: {
    kind: 'PGP clearsigned 2014 Stage11 text with unsigned trailing blank counts',
    visualGroupWidths: visualGroups,
    missingGpPrime: 19,
    missingRune: 'W',
    chapterResults,
    authenticP56PositiveScore: score(p56Plain),
    falseP56AllWScore: score(p56AllW),
  },
  conclusion: 'Neither historical omission selects a working original-LP2 inverse under the fixed direct prime/totient readings. The exact count-180 alignment remains a conditional clue, not plaintext or an authenticated key.',
}, null, 2));
