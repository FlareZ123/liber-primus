'use strict';

/**
 * Fixed p57 PARABLE 5x5-ring AES128 key with collision-rejecting key advances.
 * Reuses the original-positive, two-skip Viterbi decoder with no key/phase fit.
 * SFT: node sims/lp2_parable_5x5_aes128_skipaware_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {decode, encrypt} = require('./mirror_jpeg_pad.cjs');
const {train, encode} = require('./grid_keyskip_viterbi.cjs');

const ROOT = path.join(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const originalBytes = Buffer.from(grid.pages.flatMap((p) => p.tokens).map((s) =>
  60 * grid.alphabet.indexOf(s[0]) + grid.alphabet.indexOf(s[1])));
assert.equal(crypto.createHash('sha256').update(originalBytes).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const outer = [169,170,171,172,173,181,189,197,205,204,203,202,201,193,185,177];
const inner = [178,179,180,188,196,195,194,186];
const selectedKey = Buffer.from(outer.map((i) => originalBytes[i]));
const selectedNonce = Buffer.from(inner.map((i) => originalBytes[i]));
assert.equal(selectedKey.toString('hex'), 'e4fe36947528c0734cc244d14a9b9c83');
assert.equal(selectedNonce.toString('hex'), 'a6af9026b0599f13');
const iv = Buffer.concat([selectedNonce, Buffer.alloc(8)]);
const pages = [55,32];
const nativeText = fs.readFileSync(path.join(ROOT,
  'resources/control/shakespeare_first300k.txt'), 'utf8');
const language = train(nativeText.slice(0,80000));
const heldout = encode(nativeText.slice(120000));

/** @param {Buffer} key @param {number} length */
function pad(key, length) {
  const cipher = crypto.createCipheriv('aes-128-ctr', key, iv);
  const bytes = Buffer.concat([cipher.update(Buffer.alloc(3*length+5)),cipher.final()]);
  return Uint8Array.from(bytes, (v) => v % 29);
}
/** @param {number[]} symbols */
function translit(symbols) {
  return symbols.slice(0,45).map((n) => corpus.translit[n]).join('');
}
/** @param {number[]} data */
function indexCoincidence(data) {
  const freqs = Array(29).fill(0);
  for (const v of data) freqs[v]++;
  return freqs.reduce((n,c) => n+c*(c-1), 0)/(data.length*(data.length-1));
}
/** @param {number} seed */
function makeRng(seed) {
  let x=seed>>>0;
  return () => {x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};
}
/** @param {Buffer} key @param {number} seed */
function shuffledKey(key,seed) {
  const out=Buffer.from(key), random=makeRng(seed);
  for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}
  return out;
}

const results=[];
for(const page of pages) {
  const source=corpus.pages.find((p) => p.page===page).indices;
  const stream=pad(selectedKey,source.length);
  const observed=[];
  for (const sign of [-1,1]) {
    const decoder=decode(source,stream,0,sign,language);
    const wrongScores=[];
    for(let i=0;i<16;i++) {
      const wrong=pad(shuffledKey(selectedKey,0x20261515+i*97),source.length);
      wrongScores.push(decode(source,wrong,0,sign,language).perRune);
    }
    observed.push({sign,score:decoder.perRune,skips:decoder.skips,
      ic:indexCoincidence(decoder.plain),prefix:translit(decoder.plain),
      wrongScoreMax:Math.max(...wrongScores),
      wrongScoreMean:wrongScores.reduce((s,x)=>s+x,0)/wrongScores.length,
      rankAmong17:1+wrongScores.filter((x)=>x>=decoder.perRune).length});
  }
  const native=heldout.slice(page===55?0:400,page===55?source.length:400+source.length);
  assert.equal(native.length,source.length);
  const positiveSource=encrypt(native,stream,0,1,0x33011403+page);
  const positive=decode(positiveSource.cipher,stream,0,1,language);
  const exact=positive.plain.filter((v,i)=>v===native[i]).length;
  assert.ok(exact >= Math.ceil(0.83*source.length),
    'known pad native positive must be recovered in original-sized window');
  results.push({page,originalLength:source.length,originalIc:indexCoincidence(source),
    observed,positive:{plantSkips:positiveSource.skips,decodedSkips:positive.skips,
    exact,rate:exact/native.length,score:positive.perRune}});
}
assert.equal(results[0].originalLength,76);
assert.equal(results[1].originalLength,121);
console.log(JSON.stringify({hypothesis:'source tile outer16 AES128 key / inner8 nonce CTR, repeat-reject key skips 0-2',
  sourceKeyHex:selectedKey.toString('hex'),sourceNonceHex:selectedNonce.toString('hex'),
  rules:'original p55 and p32, original rune order, signs ±, no ciphertext-fitting phase',
  results},null,2));
console.log('PASS source-key skip-aware original ciphertext and positive plants');
