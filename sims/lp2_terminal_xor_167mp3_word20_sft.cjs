'use strict';

/**
 * Source-locked p57 prime-ordinal -> original 256-table XOR route.
 * Repeats the frozen four-unit selector, identifies its 167 output with the
 * historically archived 761.MP3 label, and checks one direct p55 consumer.
 *
 * Run on Node.js 22: node sims/lp2_terminal_xor_167mp3_word20_sft.cjs
 * The MP3 is an external source; only its documented basename and decimal
 * reversal are asserted here. No recovered unknown LP2 plaintext is claimed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const originalPages = read('resources/liber-primus/lp2-transcription.txt').split('%');
originalPages.splice(50, 0, '');
assert.equal(originalPages.length, 58);
assert.equal(corpus.pages[50].indices.length, 0);

const runeId = new Map(corpus.runes.map((rune, index) => [rune, index]));
assert.equal(runeId.size, 29);
/** @param {string} text @returns {number[]} */
const runeIndices = text => [...text].flatMap(ch => runeId.has(ch) ? [runeId.get(ch)] : []);
/** @param {number[]} runes @returns {number} */
const primeSum = runes => runes.reduce((sum, rune) => sum + corpus.prime[rune], 0);
/** @param {number} n @returns {number[]} */
function firstPrimes(n) {
  const out = [];
  for (let candidate = 2; out.length < n; candidate++) {
    let prime = true;
    for (let factor = 2; factor * factor <= candidate; factor++) {
      if (candidate % factor === 0) { prime = false; break; }
    }
    if (prime) out.push(candidate);
  }
  return out;
}
const primes = firstPrimes(300);
const primeOrdinal = new Map(primes.map((prime, index) => [prime, index + 1]));
const p57 = originalPages[57];
const units = p57.split('.').map(runeIndices).filter(x => x.length);
assert.deepEqual(units.map(primeSum), [449, 1259, 1031, 1229]);
const fourIndices = units.map(x => primeOrdinal.get(primeSum(x)));
assert.deepEqual(fourIndices, [87, 205, 173, 201]);
const words = p57.replace(/\//g, '').replace(/[.&$§]/g, '-')
  .split('-').map(runeIndices).filter(x => x.length > 0);
assert.equal(words.length, 20);
assert.equal(words.reduce((sum, word) => sum + word.length, 0), 95);

assert.equal(table.rows.length, 32);
assert.equal(table.byte_rows.length, 32);
assert.equal(table.alphabet.length, 60);
for (let row = 0; row < 32; row++) {
  assert.equal(table.rows[row].length, 8);
  assert.equal(table.byte_rows[row].length, 8);
  for (let col = 0; col < 8; col++) {
    const token = table.rows[row][col];
    const expected = table.alphabet.indexOf(token[0]) * 60 +
      table.alphabet.indexOf(token[1]);
    assert.equal(table.byte_rows[row][col], expected);
  }
}
const bytes = table.byte_rows.flat();
assert.equal(bytes.length, 256);
const selectedBytes = fourIndices.map(index => bytes[index - 1]);
assert.deepEqual(selectedBytes, [111, 194, 148, 110]);
assert.equal(selectedBytes.reduce((a, b) => a + b, 0), 563);

const xorPointer = index => index ^ bytes[index - 1];
const destinations = fourIndices.map(xorPointer);
assert.deepEqual(destinations, [56, 15, 57, 167]);
assert.equal(Number('761'.split('').reverse().join('')), destinations[3]);
// Independent stronger historical object: 2014 signed Stage10 actually links
// to /167.jpg, byte-identical to canonical first-release LP1 scan 15.jpg.
// Pinned external blob SHA and image identity are documented separately in
// im-results/2014-stage10-three-images-lp1-source-handoff.md.
const lp1P15Image = fs.readFileSync(path.join(root, 'resources/liber-primus/15.jpg'));
assert.equal(
  crypto.createHash('sha256').update(lp1P15Image).digest('hex'),
  'f163903bec1236f1c89c96343d0bd1dee610b697c3ba82514651f04c5fbee4b9',
);
assert.equal(destinations[1], 15);
assert.equal(destinations[3], 167);
const verifiedHistorical167 = {
  stage10Filename: '167.jpg',
  canonicalFirstReleaseScan: '15.jpg',
  lp1Page: 15,
  knownKey: 'FIRFUMFERENFE',
};
// The original 2013 recording is AUDIO/761.MP3 and has displayed runtime 2:47.
// The displayed 167 seconds is approximate, so no exact frame-duration claim.


// Exact p56 full 512-bit destination preimage check for the *historically
// selected* Stage10 image: four pointers include both p56 (hash instruction)
// and 167.jpg (actual old Tor-served JPEG file). The two same-stage JPEGs
// are fixed comparators; all are byte-identical to local LP1 scans 14–16.
// This is a finite unmodified-whole-file negative, not arbitrary hash mining.
const originalP56Digest =
  '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const stage10Images = [
  ['107.jpg','14.jpg','de2bebe1d06421d94f3dd2b2b5f838ee4cdb5f51b07b14e880e0108f7b79c14e'],
  ['167.jpg','15.jpg','f163903bec1236f1c89c96343d0bd1dee610b697c3ba82514651f04c5fbee4b9'],
  ['229.jpg','16.jpg','984668c680c6089b91587ef6d9eb2a1df1d2b7ee8ab3837655d3933f2adcbfbe'],
];
let p56ArchiveHitCount = 0;
const p56ArchivePreimageScreen = stage10Images.map(([stage10Filename, lp1Scan, expectedSha256]) => {
  const nativeFile = fs.readFileSync(path.join(root, 'resources/liber-primus', lp1Scan));
  const sha256 = crypto.createHash('sha256').update(nativeFile).digest('hex');
  assert.equal(sha256, expectedSha256);
  const algorithms = ['sha512','sha3-512','blake2b512'];
  const digests = algorithms.map(algorithm => {
    const digest = crypto.createHash(algorithm).update(nativeFile).digest('hex');
    if (digest === originalP56Digest) p56ArchiveHitCount++;
    return {algorithm, prefix: digest.slice(0,24), matchesOriginalP56: digest===originalP56Digest};
  });
  return {stage10Filename, lp1Scan, sourceBytes:nativeFile.length, digests};
});
assert.equal(p56ArchiveHitCount,0);
assert.equal(p56ArchivePreimageScreen.length,3);
assert.equal(p56ArchivePreimageScreen[1].digests[0].prefix,'267253a7543b04ee68ccec55');
// The original archived Tor response is a *literal HTML page* linking the
// three exact Stage10 JPEGs. This 152-byte body was retained in the frozen
// original 2014 participant Git tree (stage10/squares, blob d71303af...).
const stage10ResponseHtml = Buffer.from(
  '<html><head></head><body>\n' +
  '<p> Thank you for you submission. </p>\n' +
  '<img src="/107.jpg" /><br />\n' +
  '<img src="/167.jpg" /><br />\n' +
  '<img src="/229.jpg" /><br />\n',
  'utf8',
);
assert.equal(stage10ResponseHtml.length,152);
const gitBlob = Buffer.concat([
  Buffer.from('blob '+String(stage10ResponseHtml.length)+'\0'),stage10ResponseHtml,
]);
assert.equal(crypto.createHash('sha1').update(gitBlob).digest('hex'),
  'd71303af76016c8e88ed5dcc8a18b08e6276a437');
const stage10HtmlDigests=['sha512','sha3-512','blake2b512'].map(algorithm=>{
  const digest=crypto.createHash(algorithm).update(stage10ResponseHtml).digest('hex');
  assert.notEqual(digest,originalP56Digest);
  return {algorithm,prefix:digest.slice(0,24),matchesOriginalP56:false};
});
assert.equal(stage10HtmlDigests[0].prefix,'e391f31b3060ea4ff9dbca84');


const orbit = [];
let state = fourIndices[0];
do {
  assert.ok(state >= 1 && state <= 256);
  assert.ok(!orbit.includes(state));
  orbit.push(state);
  state = xorPointer(state);
  assert.ok(orbit.length <= 256);
} while (state !== fourIndices[0]);
assert.deepEqual(orbit, [
  87, 56, 104, 166, 180, 27, 182, 158, 101, 54,
  157, 169, 89, 138, 11, 151, 14, 10, 243, 217,
]);
assert.equal(orbit.length, words.length);

/** @param {number} x @returns {number} */
const mod29 = x => ((x % 29) + 29) % 29;
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const count = Array(29).fill(0);
  for (const rune of a) count[rune]++;
  return count.reduce((sum, n) => sum + n * (n - 1), 0) /
    (a.length * (a.length - 1));
}
/**
 * The one frozen, exploratory direct GP29 additive consumer.
 * @param {number[]} input
 * @param {-1|1} sign
 * @returns {number[]}
 */
function apply(input, sign) {
  return input.map((c, i) => mod29(c + sign * (orbit[i % orbit.length] % 29)));
}
const p55 = corpus.pages[55].indices;
assert.equal(p55.length, 76);
const direct = [-1, 1].map(sign => {
  const decoded = apply(p55, sign);
  assert.deepEqual(apply(decoded, /** @type {-1|1} */ (-sign)), p55);
  // Positive control from source-authentic already-clear p57 with same key.
  const native = corpus.pages[57].indices;
  assert.deepEqual(apply(apply(native, /** @type {-1|1} */ (-sign)), sign), native);
  return { sign, ioc: ioc(decoded), gp: decoded.map(n => corpus.translit[n]).join(' ') };
});
assert.ok(Math.abs(direct[0].ioc - 0.03754385964912281) < 1e-12);
assert.ok(Math.abs(direct[1].ioc - 0.028771929824561403) < 1e-12);

// Independent authentic solved-p56 totient control with true F skip at 56.
const expectedWords = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const orderedTokens = corpus.translit.map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);
const expectedP56 = [];
for (const word of expectedWords.split(' ')) {
  for (let i = 0; i < word.length;) {
    const item = orderedTokens.find(({ token }) => word.startsWith(token, i));
    assert.ok(item);
    expectedP56.push(item.index);
    i += item.token.length;
  }
}
let keyIndex = 0;
const decodedP56 = corpus.pages[56].indices.map((c, i) =>
  i === 56 ? 0 : mod29(c - (primes[keyIndex++] - 1)));
assert.equal(keyIndex, 84);
assert.deepEqual(decodedP56, expectedP56);
assert.equal(primeSum(decodedP56.slice(0, 5)), 311);
assert.equal(primeOrdinal.get(311), 64);

// Conditional adjacent-source length composition: the original LP2 p15 4x4
// solved numerical spiral has 16 entries, and external 2014 "167.jpg" LP1 p15
// used a historical 13-GP-rune second-koan key. Concatenation is NOT an
// authenticated cipher instruction, but gives one finite 29-phase family.
// The all-secret phase-collision statistic excludes arbitrary stationary
// per-phase bijections within this fixed model, without fitting a key.
/** @param {string} original @returns {number[]} */
function encodeNativeGP(original) {
  const clean = original.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const result = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING', i)) { result.push(21); i += 3; }
      else if (word.startsWith('IO', i)) { result.push(27); i += 2; }
      else {
        const token = orderedTokens.find(({ token }) => word.startsWith(token, i));
        assert.ok(token);
        result.push(token.index);
        i += token.token.length;
      }
    }
  }
  return result;
}
const nativeP57Words = read('resources/liber-primus/lp1-plaintext-reference.txt')
  .split('### 57\n')[1].trim();
assert.deepEqual(encodeNativeGP(nativeP57Words), corpus.pages[57].indices);

/** @param {number[]} stream @returns {{hits:number,pairs:number,rate:number}} */
function phase29Collisions(stream) {
  const histogram = Array.from({length:29}, () => new Uint32Array(29));
  stream.forEach((symbol, index) => histogram[index % 29][symbol]++);
  let hits = 0, pairs = 0;
  for (const row of histogram) {
    const population = row.reduce((a, b) => a + b, 0);
    pairs += population * (population - 1) / 2;
    for (const count of row) hits += count * (count - 1) / 2;
  }
  return {hits, pairs, rate: hits / pairs};
}
/** @param {number[]} stream @returns {{hits:number,pairs:number,rate:number}} */
function reset29Collisions(stream) {
  const lengths = corpus.pages.filter(page => page.page >= 16 && page.page <= 22)
    .map(page => page.indices.length);
  let hits = 0, pairs = 0, offset = 0;
  for(const length of lengths) {
    const byPhase = Array.from({length:29},()=>new Uint32Array(29));
    for(let i=0;i<length;i++) byPhase[i%29][stream[offset+i]]++;
    offset += length;
    for(const count of byPhase) {
      const n=count.reduce((a,b)=>a+b,0);
      pairs += n*(n-1)/2;
      for(const t of count) hits += t*(t-1)/2;
    }
  }
  assert.equal(offset,stream.length);
  return {hits,pairs,rate:hits/pairs};
}
const fibonacciPrintedSpiral = [
  3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516,
];
const authenticKoan13Key = [0,10,4,0,1,19,0,18,4,18,9,0,18];
assert.equal(authenticKoan13Key.length, 13);
const historical29Key = fibonacciPrintedSpiral.map(n => n % 29).concat(authenticKoan13Key);
assert.equal(historical29Key.length, 29);
const originalChapter = corpus.pages
  .filter(page => page.page >= 16 && page.page <= 22)
  .flatMap(page => page.indices);
assert.equal(originalChapter.length, 1744);
const origin29 = phase29Collisions(originalChapter);
assert.deepEqual([origin29.hits,origin29.pairs],[1780,51570]);
const resetOrigin29 = reset29Collisions(originalChapter);
assert.deepEqual([resetOrigin29.hits,resetOrigin29.pairs],[219,6922]);
const composed29 = [-1,1].map(sign => {
  const decoded = originalChapter.map((c,i) => mod29(c + sign * historical29Key[i%29]));
  assert.deepEqual(
    decoded.map((c,i) => mod29(c - sign * historical29Key[i%29])),
    originalChapter,
  );
  assert.deepEqual(phase29Collisions(decoded), origin29);
  return {sign,ioc:ioc(decoded)};
});
assert.ok(Math.abs(composed29[0].ioc - 0.03419115518430208) < 1e-12);
assert.ok(Math.abs(composed29[1].ioc - 0.034526704458726125) < 1e-12);

const threeNativeControls = [
  ['Shakespeare','resources/control/shakespeare_first300k.txt'],
  ['Gibran','resources/control/gibran_prophet_58585.txt'],
  ['Emerson','resources/control/emerson_essays_2944.txt'],
].map(([name,file]) => {
  const source = encodeNativeGP(read(file));
  let atOrBelow=0,windows=0,minimum=1,median=[];
  let resetAtOrBelow=0,resetMinimum=1;
  for(let start=0;start + originalChapter.length<=source.length;start+=127){
    const window=source.slice(start,start+originalChapter.length);
    const rate=phase29Collisions(window).rate;
    const rateReset=reset29Collisions(window).rate;
    if(rateReset<=resetOrigin29.rate)resetAtOrBelow++;
    resetMinimum=Math.min(resetMinimum,rateReset);
    if(rate<=origin29.rate) atOrBelow++;
    minimum=Math.min(minimum,rate);
    median.push(rate);
    windows++;
  }
  median.sort((a,b)=>a-b);
  return {name,windows,atOrBelow,minimum,median:median[Math.floor(windows/2)],resetAtOrBelow,resetMinimum};
});
assert.deepEqual(threeNativeControls.map(x=>x.windows),[1696,479,2517]);
assert(threeNativeControls.every(x=>x.atOrBelow===0));
assert(threeNativeControls.every(x=>x.resetAtOrBelow===0));
// Page-local distinct secret affine bijections: correct model for fixed period29
// with resets at each *original* physical page and an unknown alphabet per page.
const plantInput=encodeNativeGP(read('resources/control/shakespeare_first300k.txt'))
  .slice(0, originalChapter.length);
let plantOffset=0;
const resetPlant=[];
for(const [pageIndex,page] of corpus.pages
  .filter(page=>page.page>=16&&page.page<=22).entries()){
  for(let i=0;i<page.indices.length;i++){
    const phase=i%29;
    const multiplier=1+((phase*7+pageIndex*5)%28);
    const translation=(phase*11+pageIndex*3)%29;
    resetPlant.push(mod29(multiplier*plantInput[plantOffset+i]+translation));
  }
  plantOffset+=page.indices.length;
}
assert.equal(plantOffset, originalChapter.length);
assert.deepEqual(reset29Collisions(resetPlant),reset29Collisions(plantInput));
const positiveNative = encodeNativeGP(read('resources/control/shakespeare_first300k.txt'))
  .slice(0,originalChapter.length);
const positiveCipher=positiveNative.map((x,i)=>
  mod29((1+((i%29)*7)%28)*x+((i%29)*11+3)%29));
assert.deepEqual(
  phase29Collisions(positiveCipher),
  phase29Collisions(positiveNative),
  'all-secret phase-wise affine plant must preserve collision counts',
);

console.log(JSON.stringify({
  source: 'original p57, p56, pp49-51 table and 2013 761.MP3 label',
  fourIndices, selectedBytes, destinations,
  audio761Reverse: 167,
  independentHistorical2014Image: verifiedHistorical167,
  originalP56Stage10WholeJPEGPreimageScreen: p56ArchivePreimageScreen,
  originalP56ArchivedStage10HtmlBodyPreimageScreen: stage10HtmlDigests,
  p57PrintedWords: words.length,
  xorOrbitLength: orbit.length,
  xorOrbit: orbit,
  p55RawIoc: ioc(p55),
  p55DirectConsumers: direct,
  sourceComposite29Period: {
    originalChapterRunes: originalChapter.length, sourcePeriod: historical29Key.length,
    originalCollisions:origin29, pageResetOriginalCollisions:resetOrigin29,
    directInverseIocs:composed29,
    independentNativeEnglishControls: threeNativeControls,
  },
  solvedP56RunesRecovered: decodedP56.length,
  recoveredUnknownPlaintext: false,
}, null, 2));
