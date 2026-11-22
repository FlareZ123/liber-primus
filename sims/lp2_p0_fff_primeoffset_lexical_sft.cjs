'use strict';

/**
 * Exhaustive no-tuned-key LP2 p0 FFF-phrase crib search under the *genuine*
 * solved p56 prime-totient cipher, including all eight literal-F masks.
 *
 * The 2014 HTML(133,331) -> p0 [141,177) eight-word corridor lands at p0
 * word40, the only run of three F-initial complete words among 2,896 LP2
 * words. Their lengths are 6/6/3. A shared unknown prime offset is scanned
 * over the first 200,000 prime indices. A positive FFF English source plant
 * is encrypted at hidden index 133331, then recovered by the same search.
 *
 * Finite conditional test: no assertion of a unique authorial clock/selector.
 * Windows Node 22 CommonJS: node sims/lp2_p0_fff_primeoffset_lexical_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} name */
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const html = read('resources/historical/stage11-2014-index.html');
assert.equal(Number(html.match(/<title>(\d+)<\/title>/)[1]), 133);
assert.equal(Number(html.match(/<div id="(\d+)">/)[1]), 331);
assert.equal(grid.bytes[133], 141);
assert.equal(grid.bytes[75], 177);
const p0 = corpus.pages[0].indices;
assert.equal(p0.length, 262);
const spans = [[177,183],[183,189],[189,192]];
const ciphertext = spans.flatMap(([a,b]) => p0.slice(a,b));
assert.equal(ciphertext.length, 15);
assert.deepEqual([ciphertext[0],ciphertext[6],ciphertext[12]], [0,0,0]);
const GP = 29;
const mod = n => ((n % GP) + GP) % GP;

// The original GP-orthographic rewrite deliberately accepts its historical
// C/K, U/V, S/Z, NG/ING and IA/IO equivalences.
const indexed = new Map(corpus.translit.map((label,i) => [label,i]));
const aliases = [
  ['QU','CW'], ['K','C'], ['V','U'], ['Z','S'], ['IO','IA']
];
const two = ['ING','TH','NG','EO','OE','AE','IA','EA'];
/** @param {string} source */
function encode(source) {
  let text = source.toUpperCase();
  for (const [a,b] of aliases) text = text.replaceAll(a,b);
  const values = [];
  for (let i = 0; i < text.length;) {
    let token = two.find(t => text.startsWith(t,i)) || text[i];
    if (token === 'ING') token = 'NG';
    const index = indexed.get(token);
    if (index === undefined) return null;
    values.push(index);
    i += token === 'NG' && text.startsWith('ING',i) ? 3 : token.length;
  }
  return values;
}
/** @param {number[]} values */
function packed(values) {
  return values.reduce((v,x)=>v * GP + x,0);
}
/** @type {Map<number,{word:string,count:number}>} */
const dict6 = new Map();
/** @type {Map<number,{word:string,count:number}>} */
const dict3 = new Map();
for (const line of read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/)) {
  const match = line.match(/^([a-z]+)\s+(\d+)$/);
  if (!match) continue;
  const word = match[1], count = Number(match[2]);
  const enc = encode(word);
  if (!enc) continue;
  const target = enc.length === 6 ? dict6 : enc.length === 3 ? dict3 : null;
  if (!target) continue;
  const code = packed(enc), prev = target.get(code);
  if (!prev || count > prev.count) target.set(code,{word,count});
}
for (const w of ['follow','freely','far']) {
  const x = encode(w);
  assert(x && (x.length === 6 || x.length === 3));
  assert((x.length === 6 ? dict6 : dict3).has(packed(x)));
}
assert.deepEqual(spans.map(([a,b])=>b-a),[6,6,3]);
assert.equal(grid.bytes[189],192);
assert.equal(grid.bytes[192],0);

// Fixed, self-contained first 200,032 primes; no third-party library or key
// search algorithm. The 200,000-index range is exhaustive *within this
// finite source-shaped family*, not the entire unbounded prime stream.
const LIMIT = 3000000;
const IS_COMPOSITE = new Uint8Array(LIMIT + 1);
for (let p = 2; p*p <= LIMIT; p++) if (!IS_COMPOSITE[p])
  for (let j = p*p; j <= LIMIT; j += p) IS_COMPOSITE[j] = 1;
const prime = [];
for (let i = 2; i <= LIMIT && prime.length < 200032; i++)
  if (!IS_COMPOSITE[i]) prime.push(i);
assert.equal(prime.length,200032);
const shifts = Uint8Array.from(prime.map(p => (p-1) % GP));
assert.deepEqual(prime.slice(0,6),[2,3,5,7,11,13]);

/**
 * Exact plaintext-F transparence. F in the *ciphertext* may be encrypted
 * non-F; three source F slots produce 2^3 genuine possible masks.
 *
 * @param {number[]} tape
 * @param {number} offset
 * @param {number} mask
 * @returns {number[]|null}
 */
function decode(tape,offset,mask) {
  let ptr = offset;
  const out = [];
  for (let i = 0; i < tape.length; i++) {
    const f = i === 0 ? 1 : i === 6 ? 2 : i === 12 ? 4 : 0;
    const literal = Boolean(f && (mask & f));
    const value = literal ? 0 : mod(tape[i] - shifts[ptr++]);
    if (!literal && value === 0) return null;
    out.push(value);
  }
  return out;
}
/**
 * Actual GP29 p56 forward function with its true plaintext-F skip.
 * @param {number[]} plain
 * @param {number} offset
 */
function encrypt(plain,offset) {
  let ptr = offset;
  return plain.map(p => p === 0 ? 0 : mod(p + shifts[ptr++]));
}
/** @param {number[]} v */
const readable = v => v.map(n => corpus.translit[n]).join('');
/**
 * @param {number[]} tape
 * @param {number} maxExamples
 */
function search(tape,maxExamples) {
  let first = 0, firstTwo = 0, allThree = 0;
  const candidates = [], early = [];
  for (let offset = 0; offset < 200000; offset++) {
    for (let mask = 0; mask < 8; mask++) {
      const out = decode(tape,offset,mask);
      if (!out) continue;
      const w1 = dict6.get(packed(out.slice(0,6)));
      if (!w1) continue;
      first++;
      const w2 = dict6.get(packed(out.slice(6,12)));
      if (!w2) {
        if (early.length < maxExamples)
          early.push({offset,mask,firstWord:w1.word,render:readable(out)});
        continue;
      }
      firstTwo++;
      const w3 = dict3.get(packed(out.slice(12,15)));
      if (!w3) continue;
      allThree++;
      const row = {offset,mask,words:[w1.word,w2.word,w3.word],
        lexicalCountProduct:w1.count*w2.count*w3.count,
        translit:readable(out)};
      if (candidates.length < maxExamples) candidates.push(row);
    }
  }
  return {first,firstTwo,allThree,candidates,early};
}
const original = search(ciphertext,12);
const plantPlain = [...encode('FOLLOW'),...encode('FREELY'),...encode('FAR')];
assert.equal(plantPlain.length,15);
assert.deepEqual([plantPlain[0],plantPlain[6],plantPlain[12]], [0,0,0]);
const plantedOffset = 133331;
const plantCipher = encrypt(plantPlain,plantedOffset);
assert.deepEqual(decode(plantCipher,plantedOffset,7),plantPlain);
const positive = search(plantCipher,12);
const recovered = positive.candidates.some(row =>
  row.offset === plantedOffset && row.mask === 7 &&
  row.words.join(' ') === 'follow freely far');
assert(recovered,
  'The preselected authentic-GP English plant must be found by the blind search');
console.log(JSON.stringify({
  source:'2014 HTML 133/331 -> p0 word40; original unique FFF printed-word run',
  targetCiphertext:spans.map(([a,b])=>readable(p0.slice(a,b))),
  literalFMasks:8,
  originalRangedPrimeOffsets:200000,
  originalExaminedCases:1600000,
  dictionary:{sixRuneKeys:dict6.size,threeRuneKeys:dict3.size},
  original,
  heldoutPlant:{name:'follow freely far',clockOffset:plantedOffset,
    validExactDecrypt:true,blindRecovered:recovered,search:positive},
  conclusion:original.allThree>0
    ? 'Original triple has lexicon-compatible candidates; requires independent full-page authentication.'
    : 'No three-word GP-English dictionary reading in the tested authentic p56 phi/F family.'
},null,2));
