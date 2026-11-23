'use strict';

/**
 * Original-source candidate AES-256-CTR with p50's 8x32 key geometry and
 * p15's 4x4 authentic Fibonacci/prime spiral as the missing 16-byte IV.
 *
 * Distinct from earlier zero-IV AES-256-CTR source test. This makes one
 * complete, reversible original LP2 cipher claim across all 8 chapters.
 * Positive: exact known native GP29 p57 forward/recovery for every model.
 * Original: all unaltered rune symbols, native rank and 100+-rune outputs.
 *
 * This is NOT an authenticated Cicada cipher; success requires source-
 * original language recovery, not AES re-encryption of self-derived text.
 * Read-only CommonJS, Node.js 22, Windows 11; no third-party dependencies.
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const pages = new Map(source.pages.map(p => [p.page, p.indices]));
const groups = [
  [0,2], [3,7], [8,15], [16,22],
  [23,26], [27,32], [33,39], [40,55]
];
const section = groups.map(([first, last]) =>
  Array.from({length:last-first+1}, (_, j) => pages.get(first+j))
    .filter(Boolean).flat());
assert.equal(section.length, 8);
assert.equal(section.reduce((n,w) => n+w.length, 0), 12956);
const originals = section.flat();
assert.deepEqual(originals, source.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices));

const bytes = grid.pages.flatMap(p => p.bytes);
assert.equal(bytes.length, 256);
assert.deepEqual(bytes.slice(0,8), [203,231,167,186,97,237,126,183]);
const blob = Buffer.from(bytes);
assert.equal(crypto.createHash('sha256').update(blob).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const p15row = [
  3258,3222,3152,3038,3278,3299,3298,2838,
  3288,3294,3296,2472,4516,1206,708,1820
];
const spiral = [
  [1,1], [1,2], [2,2], [2,1], [2,0], [1,0],
  [0,0], [0,1], [0,2], [0,3], [1,3], [2,3],
  [3,3], [3,2], [3,1], [3,0]
];
const p15spiral = spiral.map(([r,c]) => p15row[4*r+c]);
assert.deepEqual(p15spiral, [
  3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516
]);
const knownPrime = [2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817];
assert.deepEqual(p15spiral, knownPrime.map(p => Math.abs(3301-p)));
const ivOptions = [
  {name:'p15-spiral-first-red-low8', iv:Buffer.from(p15spiral.map(x => x & 255))},
  {name:'p15-printed-row-low8', iv:Buffer.from(p15row.map(x => x & 255))}
];
assert(ivOptions.every(x => x.iv.length === 16));

const keyOptions = [
  {name:'p50-8-columns-of-32', keys:Array.from({length:8}, (_, column) =>
    Buffer.from(Array.from({length:32}, (_, row) => bytes[8*row+column])))},
  {name:'p50-8-consecutive-row-chunks-of-32', keys:Array.from({length:8},
    (_, segment) => blob.subarray(32*segment, 32*(segment+1)))}
];
assert(keyOptions.every(layout => layout.keys.length===8 &&
  layout.keys.every(k => k.length === 32)));

/**
 * @param {Buffer} key
 * @param {Buffer} iv
 * @param {number} length
 * @returns {number[]}
 */
function pad(key, iv, length) {
  const stream = crypto.createCipheriv('aes-256-ctr', key, iv);
  const bytes = Buffer.concat([stream.update(Buffer.alloc(length)), stream.final()]);
  assert.equal(bytes.length, length);
  return Array.from(bytes, value => value % 29);
}

/**
 * @param {number[]} text
 * @param {number[]} key
 * @param {number} sign
 * @returns {number[]}
 */
function addGP(text, key, sign) {
  assert.equal(text.length, key.length);
  return text.map((r,i) => ((r + sign * key[i]) % 29 + 29) % 29);
}

/** @param {number[]} rs @returns {number} */
function ioc(rs) {
  const freq = Array(29).fill(0);
  for (const x of rs) freq[x]++;
  return freq.reduce((s, f) => s + f*(f-1), 0)/(rs.length*(rs.length-1));
}
/** @param {number[]} xs @param {number} take @returns {string} */
function translit(xs, take=80) {
  return xs.slice(0, take).map(x => source.translit[x]).join('-');
}
/** @param {number[]} rs @returns {number} */
function englishMass(rs) {
  const hist=Array(29).fill(0);
  for(const x of rs) hist[x]++;
  return (hist[18]+hist[0]+hist[8]+hist[9]+hist[3])/rs.length;
}

// Control authentic p57; no step is skipped and the same p15 IV/key used.
const known=pages.get(57);
assert.equal(known.length,95);
assert.ok(ioc(known) > 0.06);
const results=[];
for(const {name:keyType,keys} of keyOptions)
  for(const {name:ivType,iv} of ivOptions)
    for(const sign of [-1,+1]) {
      const gpPlain=[];
      const perSection=[];
      for(let j=0;j<8;j++) {
        const key=keys[j];
        const stream=pad(key,iv,section[j].length);
        const plaintext=addGP(section[j],stream,-sign);
        assert.deepEqual(addGP(plaintext,stream,sign),section[j]);
        const plantedPad=pad(key,iv,95);
        const encryptedPlant=addGP(known,plantedPad,sign);
        assert.deepEqual(addGP(encryptedPlant,plantedPad,-sign),known);
        perSection.push({
          range:groups[j].join('-'),length:section[j].length,
          plainIoC:ioc(plaintext), englishMass:englishMass(plaintext),
          prefix:translit(plaintext,36)
        });
        gpPlain.push(...plaintext);
      }
      results.push({keyType,ivType,sign,allRuneIoC:ioc(gpPlain),
        allEnglishMass:englishMass(gpPlain),
        perSection,
        fullOriginalPrefix:translit(gpPlain)});
    }
assert.equal(results.length,8);
results.sort((a,b)=>b.allRuneIoC-a.allRuneIoC);
const nativeIoC=ioc(known);
console.log('ORIGINAL_SOURCE_AES256_CTR_IV', JSON.stringify({
  nativeSolvedP57IoC:nativeIoC,
  originalSourceIoC:ioc(originals),
  originalCipherRunes:originals.length,
  sectionLengths:section.map(w=>w.length),
  p50Sha256:crypto.createHash('sha256').update(blob).digest('hex'),
  sourceIVs:ivOptions.map(x=>({name:x.name,hex:x.iv.toString('hex')})),
  models:results,
  positiveControl:'All 64 real-p57 AES-256-CTR planted encrypt/decrypt recover 95/95 rune indices',
  conclusion:'Candidate models only; inspect exact original GP output for recovered prose'
},null,2));
if(results.some(r => r.perSection.some(s => s.plainIoC > 0.053 && s.length >=100)))
  console.log('ALERT: high-IoC original section may merit independent decoding inspection.');
else
  console.log('DECISION: no 100+-rune native-like source section under the eight fixed visible-IV candidates.');
