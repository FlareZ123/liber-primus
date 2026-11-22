'use strict';
/**
 * SFT: original opening729=3*243 versus p8's original 243 black runes.
 * Finite literal operations only, no hidden keys/offset fits:
 * (a) three repeats of the p8 243-rune original key, direct +/- GP29;
 * (b) one Shamir x=0 output from contiguous opening lanes at x=1,2,3.
 *
 * Windows 11 / Node 22:
 * node sims/lp2_opening729_p8black243_direct_receiver_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const opening = gp.pages.slice(0, 3).flatMap(p => p.indices);
const key = gp.pages[8].indices.slice(12);
assert.equal(opening.length, 729);
assert.equal(key.length, 243);
const mod = n => (n % 29 + 29) % 29;
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts = new Uint16Array(29);
  a.forEach(x => counts[x]++);
  return counts.reduce((sum, n) => sum + n*(n-1), 0)
    / (a.length * (a.length - 1));
}
/** @param {number[]} ciphertext @param {number} direction @returns {number[]} */
function decodePad(ciphertext, direction) {
  return ciphertext.map((x, i) => mod(x + direction * key[i % 243]));
}
/** @param {number[]} tape @returns {number[]} */
function decodeShares(tape) {
  return Array.from({length: 243}, (_, i) =>
    mod(3*tape[i] - 3*tape[i + 243] + tape[i + 486]));
}
const directSubtract = decodePad(opening, -1);
const directAdd = decodePad(opening, 1);
const secret = decodeShares(opening);
const knownSimilarity = secret.filter((v, i) => v === key[i]).length;

// Authentic directly printed known-LP1 GP29 plaintext, positive source plant.
const lp1 = read('resources/transcriptions/lp1_wulfic_canonical.txt');
const begin = lp1.indexOf('ᚦᛖ-ᛚᚩᛋᛋ');
const end = lp1.indexOf('\n$\n%\n', begin);
assert(begin >= 0 && end > begin);
const native = [...lp1.slice(begin, end)].filter(ch => gp.runes.includes(ch))
  .map(ch => gp.runes.indexOf(ch));
assert.equal(native.length, 755);
const sourcePlain729 = native.slice(0, 729);
const sourcePlain243 = native.slice(0, 243);
const plantedCipher = sourcePlain729.map((x, i) => mod(x + key[i % 243]));
assert.deepEqual(decodePad(plantedCipher, -1), sourcePlain729);
const a = Array.from({length: 243}, (_,i) => (7*i+5)%29);
const b = Array.from({length: 243}, (_,i) => (13*i+9)%29);
const samples = [1,2,3].map(x => sourcePlain243.map((p,i) =>
  mod(p + a[i]*x + b[i]*x*x)));
assert.deepEqual(decodeShares(samples.flat()), sourcePlain243);

console.log(JSON.stringify({
  original: {openingRunes: 729, p8BlackKeyRunes: 243,
    originalOpeningIoC: ioc(opening), keyIoC: ioc(key)},
  literalKey: {
    subtractIoC: ioc(directSubtract), addIoC: ioc(directAdd),
    subtractFirst64: directSubtract.slice(0,64).map(x=>gp.translit[x]).join(' ')
  },
  literalThreeShares: {
    outputRunes: secret.length, clearIoC: ioc(secret),
    exactMatchesToP8Black: knownSimilarity,
    clearFirst64: secret.slice(0,64).map(x=>gp.translit[x]).join(' ')
  },
  authenticLP1PlaintextPlants: {keyedRunes: 729, shamirRunes: 243,
    sourceIoC729: ioc(sourcePlain729), sourceIoC243: ioc(sourcePlain243)}
}, null, 2));
assert(ioc(directSubtract) < 0.05);
assert(ioc(directAdd) < 0.05);
assert(ioc(secret) < 0.05);
console.log('PASS: two original-key pad inverses, one 3-share original inverse, solved-GP29 plants');
