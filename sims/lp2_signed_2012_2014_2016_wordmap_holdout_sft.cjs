'use strict';
/**
 * Cross-round challenge to the *frozen* 2016 58-page GP-prime word map.
 * Compare an independently preexisting 2012 signed countdown, the 2014
 * LP2 unveiling's signed instruction, and the 2016 signed word-map clue.
 *
 * No address parameters are selected by the heldout messages, and no
 * plaintext is fitted. The 2014/2012 signatures are preserved as original
 * source-byte witnesses in resources/historical/; this SFT only reads their
 * authenticated cleartext, not cryptographically verifies the signatures.
 *
 * SFT: node sims/lp2_signed_2012_2014_2016_wordmap_holdout_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} p */
function read(p) { return fs.readFileSync(path.join(root, p), 'utf8'); }
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const slices = read('resources/lp2-transcription.txt').split('%');
assert.equal(slices.length, 57);
const runes = /[ᚠ-᛿]+/gu;
/** @param {string} page */
function printedWords(page) {
  return page.replaceAll('/', '').replace(/[\r\n]/g, '')
    .split(/[-.&$§,:!?]/u)
    .map(piece => (piece.match(runes) || []).join(''))
    .filter(Boolean);
}
const pages = Array.from({length:58}, (_, p) => p === 50 ? [] :
  printedWords(slices[p > 50 ? p - 1 : p]));
assert.equal(pages.reduce((n,a)=>n+a.length,0), 2973);
const alphabet = corpus.translit.map((t,i) => ({t:t.toLowerCase(),i}))
  .sort((a,b) => b.t.length-a.t.length);
/** @param {string} word */
function gpSum(word) {
  let s = word.toLowerCase().replace(/v/g, 'u').replace(/k/g, 'c')
    .replace(/z/g, 's');
  let total = 0;
  while (s.length) {
    const found = alphabet.find(x => s.startsWith(x.t));
    assert.ok(found, 'Unknown GP transliteration: ' + s);
    total += corpus.prime[found.i];
    s = s.slice(found.t.length);
  }
  return total;
}
/** @param {string|null|undefined} word */
function gpText(word) {
  return word ? [...word].map(r => corpus.translit[corpus.runes.indexOf(r)])
    .join('') : null;
}
/** @param {string} txt */
function signedCleartext(txt) {
  assert.ok(txt.includes('-----BEGIN PGP SIGNED MESSAGE-----'));
  const i = txt.indexOf('\n\n');
  const end = txt.indexOf('-----BEGIN PGP SIGNATURE-----');
  assert.ok(i >= 0 && end > i);
  return txt.slice(i + 2, end);
}
/** @param {string} txt */
function signedWords(txt) {
  return signedCleartext(txt).replace(/\b[a-z0-9]+\.onion\b/gi,'')
    .match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
}
const sourceFiles = {
  countdown2012: 'resources/historical/cicada2012-countdown-message.asc',
  stage112014: 'resources/historical/cicada2014-stage11-message.asc',
  signed2016: 'resources/historical/cicada2016-4gq25-outguess.asc'
};
const tokens = Object.fromEntries(Object.entries(sourceFiles)
  .map(([k,p]) => [k, signedWords(read(p))]));
assert.equal(tokens.signed2016.length,43);
assert.equal(tokens.stage112014.length,14);
/**
 * @param {string} word
 * @param {number} radix
 * @param {number} origin
 */
function address(word, radix=58, origin=0) {
  const sum = gpSum(word);
  const page = sum % radix;
  const index = Math.floor(sum / radix) + origin;
  const destination = pages[page]?.[index] || null;
  return {word, sum, page, index, destination:gpText(destination)};
}
/** @param {string[]} source @param {number} radix @param {number} origin */
function map(source, radix=58, origin=0) {
  return source.map(w => address(w,radix,origin));
}
const anchors = [
  {page:14,index:1,name:'FOLD'},    // original unknown ciphertext, literal GP
  {page:21,index:4,name:'MY'},      // original unknown ciphertext, literal GP
  {page:56,index:1,name:'END'}      // independently solved p56 original text
];
/** @param {ReturnType<typeof address>[]} rows */
function select(rows) {
  return rows.filter(r => anchors.some(a => a.page===r.page&&a.index===r.index))
    .map(r => ({word:r.word,primeSum:r.sum,page:r.page,
      wordIndex:r.index,selectedOriginalGP:r.destination}));
}
const baseline = Object.fromEntries(Object.entries(tokens).map(([k,v])=>
  [k, {wordCount:v.length,anchorHits:select(map(v)),
       missing:map(v).filter(x=>x.destination===null).map(x=>x.word)}]));
const alternatives = [];
for (const modulus of [57,58,59]) {
  for (const origin of [-1,0,1]) {
    alternatives.push({modulus,origin,
      signed2016Anchors:select(map(tokens.signed2016,modulus,origin))
        .map(r=>r.word),
      stage112014Anchors:select(map(tokens.stage112014,modulus,origin))
        .map(r=>r.word),
      countdown2012Anchors:select(map(tokens.countdown2012,modulus,origin))
        .map(r=>r.word)});
  }
}
// Source-derived, source-independent check on the pre-2016 signed note.
// "hearing" and the later signed "seeks" independently have GP sum 253.
// Their common destination p21:w4 is a *conditional* repeat of one address,
// not a fresh independently selected address rule.
const historicalHearing=address('hearing'), laterSeeks=address('seeks');
assert.equal(historicalHearing.sum,253);
assert.equal(laterSeeks.sum,253);
assert.deepEqual([historicalHearing.page,historicalHearing.index],
  [laterSeeks.page,laterSeeks.index]);
assert.equal(historicalHearing.destination,'MY');
assert.equal(select(map(tokens.stage112014)).length,1);
assert.equal(select(map(tokens.signed2016)).length,9);
assert.deepEqual(select(map(tokens.stage112014)).map(x=>x.word),['hearing']);
assert.deepEqual(select(map(tokens.signed2016)).map(x=>x.word)
  .filter(x=>x.toLowerCase()==='seeks'), ['seeks']);
// Independent source-count alternative: "Liber Primus" names the *whole*
// original printed book (17 LP1 + 58 LP2 = 75 scans), rather than only LP2.
// The published 2016 pronoun "Its" does not explicitly authorize discarding
// the first 17 pages. Preserve original printed LP2 word boundaries.
const wholeMaster = read('resources/transcriptions/liber_primus_master.txt')
  .split('%');
assert.equal(wholeMaster.length,75);
const fullBookPages = Array.from({length:75}, (_, p) =>
  p<17 ? printedWords(wholeMaster[p]) : pages[p-17]);
/** @param {string} word */
function wholeBookAddress(word) {
  const sum = gpSum(word), globalPage = sum%75;
  const wordIndex = Math.floor(sum/75);
  const destination = fullBookPages[globalPage]?.[wordIndex] || null;
  return {word,sum,globalPage,wordIndex,destination:gpText(destination)};
}
const wholeBookAlternatives = ['the','their','seeks','lies']
  .map(wholeBookAddress);
assert.deepEqual(wholeBookAlternatives.map(x=>x.destination),
  ['NG','IG','THNIEA','THE']);

console.log(JSON.stringify({
  test:'Frozen GP-prime / 58-page signed-message map, 2012/2014 holdouts',
  sourceFiles, originalPages:58,printedWordCount:2973,
  anchors, baseline, alternatives,
  independentSameSum:{historicalHearing,laterSeeks},
  wholeBook75Alternative:{count:fullBookPages.length,examples:wholeBookAlternatives},
  conclusion:'One same-sum historical MY pointer, no authenticated 58-page quotient/remainder/zero-origin instruction or original plaintext.'
},null,2));
