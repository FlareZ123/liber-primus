'use strict';
/**
 * LP2 final section as four consecutive 829-rune blocks, each keyed by one
 * row/column/spiral quartet of the printed p15 4x4 Fibonacci-prime square.
 *
 * This is a finite SOURCE-FROZEN hypothesis. The equality 3316=4*829
 * selects the geometry; no original ciphertext runes enter the key derivation.
 * With each 4-number source quartet serialized as four unsigned 16-bit words,
 * SHA256 supplies a 32-byte AES/ChaCha key. A single shared stream mode is
 * fitted using only block zero, then frozen for blocks one through three.
 *
 * Node.js 22, CommonJS, built-in modules. No file writes.
 * @module fibonacci829_fourrow_source_inverse
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {readSquare, clockwiseSpiral} = require('./fibonacci_prime_spiral.cjs');
const {encode} = require('./grid_keyskip_viterbi.cjs');

const ROOT = path.resolve(__dirname, '..');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const pages = corpus.pages.filter(p => p.page >= 40 && p.page <= 55);
const cipherText = pages.flatMap(p => p.indices);
const LENGTH = 829;
assert.equal(cipherText.length, 4 * LENGTH, 'Physical LP2 pages 40–55 must contain exactly four 829-rune blocks');
assert.equal(corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices).length, 12956);

const square = readSquare();
const spiral = clockwiseSpiral().map(([row, col]) => square[row][col]);
assert.equal(spiral[11], 2472);
assert.equal(3301 - spiral[11], 829, 'p15 Fibonacci-indexed prime at rank 145');
const groupings = {
  'printed-rows': square.map(row => row.slice()),
  'printed-columns': [0,1,2,3].map(column => square.map(row => row[column])),
  'clockwise-spiral-quartets': [0,1,2,3].map(j => spiral.slice(j*4,j*4+4))
};
for (const groups of Object.values(groupings)) {
  assert.equal(groups.length, 4);
  assert.deepEqual(groups.flat().slice().sort((a,b)=>a-b), square.flat().slice().sort((a,b)=>a-b));
}
const mod = value => (value % 29 + 29) % 29;
/** @param {number[]} values */
function ioc(values) {
  const hist = new Uint32Array(29);
  for (const value of values) hist[value]++;
  return hist.reduce((sum, count)=>sum + count*(count-1), 0) / (values.length*(values.length-1));
}
/** @param {number[]} numbers @param {'BE'|'LE'} endian */
function makeKey(numbers, endian) {
  assert.equal(numbers.length,4);
  const raw = Buffer.alloc(8);
  numbers.forEach((number, j) => raw['writeUInt16' + endian](number, 2*j));
  return crypto.createHash('sha256').update(raw).digest();
}
/** @param {Buffer} key @param {'aes-256-ctr'|'chacha20'} algorithm */
function pad(key, algorithm) {
  const encrypted = crypto.createCipheriv(algorithm, key, Buffer.alloc(16));
  return Buffer.concat([encrypted.update(Buffer.alloc(LENGTH)), encrypted.final()]);
}
const models = [];
for (const [geometry,quartets] of Object.entries(groupings))
  for (const endian of ['BE','LE'])
    for (const algorithm of ['aes-256-ctr','chacha20'])
      for (const byteRule of ['mod','scaled'])
        for (const sign of [-1,1]) {
          const masks = quartets.map(q => pad(makeKey(q,endian),algorithm));
          const shifts = masks.map(mask => Array.from(mask, byte =>
            byteRule==='mod' ? byte%29 : Math.floor(byte*29/256)));
          models.push({geometry,endian,algorithm,byteRule,sign,shifts});
        }
assert.equal(models.length, 48);
/** @param {number[]} ciphertext @param {typeof models[number]} mode */
function decode(ciphertext,mode) {
  assert.equal(ciphertext.length,4*LENGTH);
  return ciphertext.map((value,i) => mod(value + mode.sign * mode.shifts[Math.floor(i/LENGTH)][i%LENGTH]));
}
/** @param {number[]} plaintext @param {typeof models[number]} mode */
function encrypt(plaintext,mode) {
  assert.equal(plaintext.length,4*LENGTH);
  return plaintext.map((value,i) => mod(value - mode.sign * mode.shifts[Math.floor(i/LENGTH)][i%LENGTH]));
}
const input = fs.readFileSync(path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8');
const trainSource = encode(input.slice(0,180000));
const independentSource = encode(input.slice(240000));
assert.ok(independentSource.length >= 4*LENGTH);
const freqs = new Float64Array(29).fill(0.5);
for (const rune of trainSource) freqs[rune]++;
const total = trainSource.length + 29*0.5;
const logp = Array.from(freqs, n=>Math.log(n/total));
/** @param {number[]} runeIndices */
function meanLogp(runeIndices) {
  return runeIndices.reduce((sum,v)=>sum+logp[v],0)/runeIndices.length;
}
/** @param {number[]} inputCipher */
function choose(inputCipher) {
  const evaluated = models.map(mode => {
    const decoded = decode(inputCipher,mode);
    return {mode,trainLL:meanLogp(decoded.slice(0,LENGTH)),
      heldLL:meanLogp(decoded.slice(LENGTH)),trainIoC:ioc(decoded.slice(0,LENGTH)),
      heldIoC:ioc(decoded.slice(LENGTH)),fullIoC:ioc(decoded),
      byBlock: [0,1,2,3].map(j=>ioc(decoded.slice(j*LENGTH,(j+1)*LENGTH)))};
  });
  evaluated.sort((a,b)=>b.trainLL-a.trainLL);
  return evaluated;
}
function shorthand(item) {
  const {geometry,endian,algorithm,byteRule,sign}=item.mode;
  return {geometry,endian,algorithm,byteRule,sign,trainLL:item.trainLL,
    heldLL:item.heldLL,trainIoC:item.trainIoC,heldIoC:item.heldIoC,
    fullIoC:item.fullIoC,byBlock:item.byBlock};
}
function run() {
  assert.equal(crypto.createHash('sha256').update('abc').digest('hex'),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  const original=choose(cipherText);
  const plantedMode=models.find(x=>x.geometry==='printed-rows' && x.endian==='BE' &&
    x.algorithm==='aes-256-ctr' && x.byteRule==='mod' && x.sign===-1);
  assert.ok(plantedMode);
  const sourcePlain=independentSource.slice(0,4*LENGTH);
  const plantedCipher=encrypt(sourcePlain,plantedMode);
  assert.deepEqual(decode(plantedCipher,plantedMode),sourcePlain);
  const positive=choose(plantedCipher);
  assert.equal(positive[0].mode,plantedMode,'Source-locked true key must rank first on unseen English');
  assert.ok(positive[0].heldIoC > 0.048,'True-key unselected English should preserve lexical skew');
  const result={
    classification:'finite original-source key inversion; no authenticated LP2 decryption unless original heldout is naturally legible',
    source:'original LP2 p15 4x4 square and page40..55 source section length 3316=4*829',
    sourceEqualities:{fibonacciRank145Prime:829,sectionRunes:cipherText.length,
      keySegments:4,segmentLength:LENGTH,independentlySelectedRows:4},
    family:{geometries:Object.keys(groupings),key: 'SHA256 of 4 original unsigned 16-bit values',
      serializers:['BE','LE'],algorithms:['aes-256-ctr','chacha20'],
      byteRules:['mod29','scaled29'],signs:[-1,1],models:models.length,
      selection:'only first 829 original runes',holdout:'remaining original 2487 runes'},
    original:{rawIoC:ioc(cipherText),bestFirstBlock:shorthand(original[0]),
      topFive:original.slice(0,5).map(shorthand)},
    planted:{trueMode:shorthand(positive[0]),exactDecoded:sourcePlain.length,
      sourceIoC:ioc(sourcePlain),sourceHeldIoC:ioc(sourcePlain.slice(LENGTH)),
      sameKeyRank:positive.findIndex(x=>x.mode===plantedMode)+1},
    caveat:'The source equality and grouping are retrospective. Fixed original section boundaries, printed GP alphabet, direct additive stream and zero-IV cipher are all model assumptions; no original text is claimed without a predictive heldout language signal.'
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)run();
module.exports={run,makeKey,decode,encrypt,choose};
