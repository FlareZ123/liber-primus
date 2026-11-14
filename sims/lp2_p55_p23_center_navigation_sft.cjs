'use strict';
/**
 * Source-exact LP2 p55 23-dot center -> p23–26 -> p27 echo check.
 * Node.js 22, CommonJS, no external packages or writes.
 * SFT: node sims/lp2_p55_p23_center_navigation_sft.cjs
 * Conditional hypotheses are not a recovered cipher.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
/** @param {number} n @returns {number[]} */
const page = n => gp.pages[n].indices;
const mod = n => (n % 29 + 29) % 29;
const native = new Map(gp.runes.map((r, i) => [r, i]));
/** @param {string} text @returns {number[]} */
const parseRunes = text => [...text].filter(r => native.has(r)).map(r => native.get(r));
/** @param {number[]} values @returns {number} */
const ioc = values => {
  const counts = Array(29).fill(0);
  for (const v of values) counts[v]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
};
const segments = read('resources/lp2-transcription.txt').split('%');
assert.equal(segments.length, 57);
const tokens = segments[54].replace(/\/\s*\n/g, '')
  .split(/[-.\s&$]+/).map(parseRunes).filter(a => a.length);
const bodyLengths = [4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.equal(tokens.length, 17);
assert.deepEqual(tokens[0], [21]); // p54->p55 NG word carry
const words = tokens.slice(1);
assert.deepEqual(words.map(w => w.length), bodyLengths);
assert.deepEqual(tokens.flat(), page(55));
assert.equal(page(55).length, 76);
/** @param {number[][]} source @param {number} n @returns {number[]} */
const peel = (source, n) => source.flatMap(w => w.slice(n, w.length - n));
const core = peel(words, 2);
assert.equal(core.length, 23);
assert.deepEqual([0,1,2,3,4,5,6].map(n => peel(words, n).length),
  [75,43,23,9,5,3,1]);
assert.deepEqual(core.map(x => gp.translit[x]),
  ['G','D','A','B','F','X','I','M','U','C','P','H',
   'NG','D','IA','I','G','X','EO','TH','TH','I','M']);
assert.deepEqual(peel(words, 6), [1]);
const dots = [];
for (let row = 0; row < 9; row++)
  for (let col = 0; col < 5; col++)
    if ((row % 2 === 0 && col >= 1 && col <= 3) ||
        (row % 2 === 1 && (col === 0 || col === 4))) dots.push([row,col]);
assert.equal(dots.length, 23);
assert.deepEqual(dots[11], [4,2]);
const centerRune = core[11];
const deepRune = peel(words, 6)[0];
assert.equal(centerRune, 8); // H
assert.equal(gp.prime[centerRune], 23);
assert.equal(deepRune, 1); // U
assert.equal(gp.prime[deepRune], 3);
/** @param {number[]} values @returns {number} */
const weight = values => values.reduce((sum, n) => sum + gp.prime[n], 0);
const projected = dots.flatMap(([_r,col],i) =>
  [0,2,4].includes(col) ? [i] : []);
assert.deepEqual(projected, [1,3,4,6,8,9,11,13,14,16,18,19,21]);
assert.equal(weight(core), 1020);
assert.equal(weight(projected.map(i => core[i])), 512);
assert.equal(weight(core) - weight(projected.map(i => core[i])), 508);
const section = [23,24,25,26].flatMap(page);
assert.deepEqual([23,24,25,26].map(n => page(n).length), [213,270,273,265]);
assert.equal(section.length, 1021);
assert.equal(section.length + gp.prime[deepRune], 1024);
assert.equal(page(23)[0], deepRune);
assert.equal(gp.prime[centerRune] + gp.prime[deepRune], 26);
const echo = page(55).slice(-6);
assert.deepEqual(page(27).slice(28,34), echo);
assert.deepEqual(echo.map(x => gp.translit[x]), ['D','J','U','B','E','I']);
assert.equal(weight(page(27).slice(34,36)), 103);
assert.equal(grid.rows.length, 32);
assert.equal(grid.rows[12][6], '0W');
assert.equal(grid.byte_rows[12][6], 32);

// The p23 five-dot emblem is a 180-degree copy of solved p56's emblem.
// Candidate transfer: p56's φ(prime) cipher with center-H's prime23,
// or with the 23rd prime, under complete original literal-F clock branching.
const primeList = [];
for (let n = 2; primeList.length < 1100; n++) {
  let prime = true;
  for (const p of primeList) {
    if (p * p > n) break;
    if (n % p === 0) {prime = false; break;}
  }
  if (prime) primeList.push(n);
}
assert.equal(primeList[8], 23);
assert.equal(primeList[22], 83);
/**
 * @param {number[]} cipherRunes
 * @param {number} firstPrimeIndex
 * @returns {{valid:boolean,deadAt:number,states:number}}
 */
function skipAwareTotient(cipherRunes,firstPrimeIndex) {
  let states = new Set([0]);
  for (const [i,c] of cipherRunes.entries()) {
    const next = new Set();
    for (const consumed of states) {
      const k = mod(primeList[firstPrimeIndex+consumed]-1);
      const candidate = mod(c-k);
      if (candidate !== 0) next.add(consumed+1);
      if (c === 0) next.add(consumed);
    }
    states=next;
    if (!states.size) return {valid:false,deadAt:i,states:0};
  }
  return {valid:true,deadAt:-1,states:states.size};
}
assert.equal(skipAwareTotient(page(56),0).valid,true);
const totientGates = {
  printedPrime23: skipAwareTotient(section,8),
  reversedPrime23: skipAwareTotient([...section].reverse(),8),
  printedPrimeOrdinal23: skipAwareTotient(section,22),
  reversedPrimeOrdinal23: skipAwareTotient([...section].reverse(),22)
};
assert.deepEqual(Object.fromEntries(Object.entries(totientGates)
  .map(([name,result])=>[name,result.deadAt])),{
  printedPrime23:11,reversedPrime23:22,
  printedPrimeOrdinal23:8,reversedPrimeOrdinal23:88
});

const cipher = page(55).slice(1);
const subtract = cipher.map((c,i) => mod(c - section[i]));
const add = cipher.map((c,i) => mod(c + section[i]));
assert.equal(cipher.length, 75);
assert(Math.abs(ioc(subtract) - 0.0363963963963964) < 1e-12);
assert(Math.abs(ioc(add) - 0.03027027027027027) < 1e-12);
const plantPlain = page(57).slice(0,75);
const plantCipher = plantPlain.map((v,i) => mod(v + section[i]));
assert.deepEqual(plantCipher.map((v,i) => mod(v - section[i])), plantPlain);
/**
 * GP29 index parity, plus U-prime=3 as 011. This byte encoding is hypothetical.
 * @param {boolean} invert @returns {Buffer}
 */
function parityPacket(invert) {
  const bits = section.map(v => ((v & 1) ^ Number(invert)) ? '1' : '0')
    .join('') + '011';
  assert.equal(bits.length, 1024);
  const bytes = Buffer.alloc(128);
  for (let i = 0; i < bytes.length; i++)
    bytes[i] = Number.parseInt(bits.slice(i*8,i*8+8), 2);
  return bytes;
}
const targetHash = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const digests = [];
for (const invert of [false,true]) {
  const packet = parityPacket(invert);
  for (const algorithm of ['sha512','sha3-512','blake2b512']) {
    const digest = crypto.createHash(algorithm).update(packet).digest('hex');
    assert.notEqual(digest, targetHash);
    digests.push({invert,algorithm,digest});
  }
}
assert.equal(digests[0].digest.slice(0,16), 'ef17451f080d69b4');
assert.equal(digests[3].digest.slice(0,16), 'd33b6b3e983892db');

// Word-internal permutation null. Its p-value is conditional and postselected.
let state = 0x235557;
/** @param {number} max @returns {number} */
function rand(max) {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return Math.floor((state >>> 0) / 4294967296 * max);
}
/** @param {number[]} input @returns {number[]} */
function shuffle(input) {
  const out = input.slice();
  for (let j = out.length - 1; j > 0; j--) {
    const k = rand(j+1);
    [out[j],out[k]] = [out[k],out[j]];
  }
  return out;
}
const trials = 200000;
const hits = {center23:0,deepU:0,projection512:0,centerAndDeep:0,allThree:0};
for (let trial = 0; trial < trials; trial++) {
  const sample = words.map(shuffle);
  const v = peel(sample,2);
  const a = v[11] === 8;
  const b = sample[6][6] === 1;
  const c = weight(projected.map(i => v[i])) === 512;
  if (a) hits.center23++;
  if (b) hits.deepU++;
  if (c) hits.projection512++;
  if (a && b) hits.centerAndDeep++;
  if (a && b && c) hits.allThree++;
}
/** @param {number[]} values @returns {string} */
const label = values => values.map(v => gp.translit[v]).join(' ');
console.log(JSON.stringify({
  status:'SOURCE-EXACT; no new plaintext, cipher key or authenticated navigation',
  sourceCore:label(core), center:'H: prime23', deepest:'U: prime3',
  selectedChapter:'p23–p26',chapterRunes:1021,plusUPrime:1024,
  p27Echo:label(echo),p27EchoStart:28,nextWordPrimeSum:103,
  tableCell103:grid.rows[12][6],tableValue:32,
  originalRunningKey:{minusIoc:ioc(subtract),plusIoc:ioc(add),
    minusPrefix:label(subtract.slice(0,20)),
    plusPrefix:label(add.slice(0,20)),solvedP57Plant:'75/75'},
  bitPacketDigests:digests,totientGates,sourceWordNull:{trials,seed:'0x235557',hits},
  conclusion:'exact source navigation equalities, two nonlinguistic direct inverses, six mismatched hashes'
},null,2));
