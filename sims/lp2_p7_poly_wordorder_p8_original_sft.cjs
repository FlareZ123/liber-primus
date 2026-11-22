'use strict';
/**
 * P7 native quartic -> p8 original 255/242 whole-word register SFT.
 * Frozen on Director issue #2304 before observing original decryptions.
 * Node.js 22, CommonJS; read-only and reproducible on Windows 11.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = path.join(__dirname, '..', 'resources', 'liber-primus');
/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(base, name), 'utf8');
}
const corpus = JSON.parse(read('lp2-corpus.json'));
const transcription = read('lp2-transcription.txt').split('%');
const ink = JSON.parse(read('lp2-ink-annotations.json'));
const lookup = new Map(corpus.runes.map((r, i) => [r, i]));
const words = [];
let word = [];
for (let page = 3; page <= 7; page++) {
  for (const chr of transcription[page]) {
    if (lookup.has(chr)) word.push(lookup.get(chr));
    else if ((chr === '-' || chr === '.') && word.length) {
      words.push(word);
      word = [];
    }
  }
}
if (word.length) words.push(word);
assert.equal(words.length, 255);
assert.deepEqual(words.flat(), corpus.pages.slice(3, 8).flatMap(p => p.indices));

const redOffsets = new Set();
let pageStart = 0;
for (let page = 3; page <= 7; page++) {
  const annotation = ink.pages.find(x => x.page === page);
  for (const span of annotation?.red_spans || []) {
    for (let i = 0; i < span.length; i++) redOffsets.add(pageStart + span.start + i);
  }
  pageStart += corpus.pages[page].indices.length;
}
let cursor = 0;
const redWordIndices = [];
const blackWords = [];
for (const [index, w] of words.entries()) {
  const allRed = w.every((_, i) => redOffsets.has(cursor + i));
  const allBlack = w.every((_, i) => !redOffsets.has(cursor + i));
  assert(allRed || allBlack, 'Source word crosses a red/black boundary');
  if (allRed) redWordIndices.push(index);
  else blackWords.push(w);
  cursor += w.length;
}
assert.deepEqual(redWordIndices, [0,1,2,22,176,177,178,179,250,251,252,253,254]);
assert.equal(blackWords.length, 242);
assert.equal(cursor, pageStart);
const original = corpus.pages[8].indices;
assert.equal(original.length, 255);
const blackTarget = original.slice(12, 254);
assert.equal(blackTarget.length, 242);

/** @param {number} x @returns {number} */
const mod = x => (x % 29 + 29) % 29;
/** Source-fixed P(x) = 11+26x+8x²+15x³+2x⁴ over GF29.
 * @param {number} x @returns {number}
 */
const P = x => mod(11 + 26*x + 8*x*x + 15*x*x*x + 2*x*x*x*x);
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const f = Array(29).fill(0);
  for (const v of a) f[v]++;
  return f.reduce((sum, n) => sum + n*(n-1), 0) / (a.length*(a.length-1));
}
/**
 * Key readout: word-final state; reset state to source seed at every full word.
 * @param {number[][]} source
 * @param {'P(s)+r'|'P(s)-r'|'P(s+r)'|'P(s-r)'} mode
 * @param {number} seed
 * @returns {number[]}
 */
function makeKey(source, mode, seed) {
  return source.map(w => {
    let s = seed;
    for (const r of w) {
      if (mode === 'P(s)+r') s = mod(P(s) + r);
      if (mode === 'P(s)-r') s = mod(P(s) - r);
      if (mode === 'P(s+r)') s = P(mod(s+r));
      if (mode === 'P(s-r)') s = P(mod(s-r));
    }
    return s;
  });
}
/**
 * @param {number[]} input
 * @param {number[]} key
 * @param {number} sign
 * @returns {number[]}
 */
function transform(input, key, sign) {
  return input.map((x, i) => mod(x + sign*key[i]));
}
const fixedModes = ['P(s)+r','P(s)-r','P(s+r)','P(s-r)'];
const fixedSeeds = [0,3,4,17,19];
const scopes = [
  {name:'all-255', words, target:original},
  {name:'black-242', words:blackWords, target:blackTarget}
];
const known = corpus.pages[57].indices;
assert.equal(known.length, 95);
assert(ioc(known) > 0.06, 'Original solved GP p57 native-language positive');
const runs = [];
for (const scope of scopes) {
  assert.equal(scope.words.length, scope.target.length);
  for (const mode of fixedModes) {
    for (const seed of fixedSeeds) {
      const key = makeKey(scope.words, mode, seed);
      const matches = key.filter((x, i) => x === scope.target[i]).length;
      const naturalPlant = Array.from({length:key.length}, (_,i) => known[i%known.length]);
      const plantCipher = transform(naturalPlant, key, +1);
      assert.deepEqual(transform(plantCipher, key, -1), naturalPlant,
        'Native-language positive control must recover exactly');
      for (const sign of [-1,+1]) {
        const decoded = transform(scope.target, key, sign);
        assert.deepEqual(transform(decoded, key, -sign), scope.target,
          'Original ciphertext must reencrypt exactly');
        runs.push({
          scope:scope.name, mode, seed, sign,
          len:decoded.length, ioc:ioc(decoded), matches,
          prefix:decoded.slice(0,25).map(x => corpus.translit[x]).join(' ')
        });
      }
    }
  }
}
assert.equal(runs.length, 80);
const grouped = scopes.map(scope => {
  const rows = runs.filter(x=>x.scope===scope.name);
  rows.sort((a,b)=>b.ioc-a.ioc);
  return {
    scope:scope.name, originalIoC:ioc(scope.target), count:rows.length,
    minIoC:Math.min(...rows.map(x=>x.ioc)),
    maxIoC:rows[0].ioc,
    maxDirectMatches:Math.max(...rows.map(x=>x.matches)),
    best:rows.slice(0,3)
  };
});
assert(grouped.every(x=>x.maxIoC<0.038));
console.log(JSON.stringify({
  verdict:'No authenticated original plaintext or key under the frozen 80 direct receivers',
  source:'255 original complete p3-p7 words (13 red); 242 black words',
  target:'255 original p8 runes or first 242 p8 black runes after 12 red glyphs',
  polynomial:[11,26,8,15,2],
  frozenModels:80,
  sourceExactForwardReplay:'PASS',
  solvedP57NativeLanguagePlants:'PASS',
  scopes:grouped
},null,2));
console.log('PASS: original order-sensitive quartic-word transfer finite gate');
