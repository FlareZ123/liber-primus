'use strict';
/**
 * Original-input skip-aware SFT for source-locked p15-square AES-256 key and
 * 16 per-page IVs from the p49-51 table across physical LP2 p40-55.
 * 
 * Each ciphertext rune consumes one AES byte modulo29. If encoding a GP rune
 * under that byte would immediately repeat the previous ciphertext rune,
 * the encoder may discard up to two AES draws; the decoder infers these
 * collision-constrained skips by exact language-aware Viterbi. Both signs
 * are fixed alternatives; no AES key, IV, phase, or page is fitted.
 *
 * Reproduce: node sims/lp2_p15_key_grid16_iv_skip_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createCipheriv} = require('node:crypto');
const {candidates} = require('./fibonacci_spiral_key_derivation.cjs');
const {tableBytes} = require('./base60_seeded_stream.cjs');
const {train, encode} = require('./grid_keyskip_viterbi.cjs');
const {decode, encrypt} = require('./mirror_jpeg_pad.cjs');

const ROOT = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const pages = corpus.pages.slice(40, 56);
const original = pages.map(page => page.indices);
const key = candidates().find(row => row.name === 'absolute-spiral:BE')?.key;
const grid = tableBytes();
assert.ok(key && key.length === 32);
assert.equal(grid.length, 256);
assert.equal(original.flat().length, 3316);

/** @param {Buffer} iv @param {number} n @param {Buffer} master */
function stream(iv, n, master = key) {
  const enc = createCipheriv('aes-256-ctr', master, iv);
  return Buffer.concat([enc.update(Buffer.alloc(n)), enc.final()]);
}

/** @param {Buffer} ivData */
function padPerPage(ivData = grid) {
  return original.map((page,i) => Uint8Array.from(
    stream(ivData.subarray(16*i,16*i+16), 3*page.length+3),
    byte => byte%29));
}

/** @param {number[]} numbers */
function spell(numbers) {return numbers.slice(0,40).map(x=>corpus.translit[x]).join(' ');}

/** @param {number[][]} groups @param {Uint8Array[]} pads @param {1|-1} sign @param {ReturnType<typeof train>} lm */
function inverse(groups,pads,sign,lm) {
  return groups.map((page,i) => page.length ? 
    {...decode(page,pads[i],0,sign,lm),page:i+40,length:page.length} :
    {page:i+40,length:0,score:0,perRune:null,plain:[],skips:0});
}

/** @param {any[]} entries */
function brief(entries) {
  return entries.filter(r=>r.length).map(r=>({
    page:r.page,length:r.length,perRune:Number(r.perRune.toFixed(6)),
    skips:r.skips,first40:spell(r.plain)
  }));
}

/** @param {any[]} entries */
function mean(entries) {
  const length=entries.reduce((n,x)=>n+x.length,0);
  return entries.reduce((n,x)=>n+x.score,0)/length;
}

function main(){
  const text=fs.readFileSync(path.join(ROOT, 
    'resources/control/shakespeare_first300k.txt'), 'utf8');
  const lm=train(text.slice(0,80000));
  const holdout=encode(text.slice(120000));
  assert.ok(holdout.length>=3316);

  const pads=padPerPage();
  const originalMinus=inverse(original,pads,1,lm);
  const originalPlus=inverse(original,pads,-1,lm);

  let at=0;
  const native=original.map(page => {
    const piece=holdout.slice(at,at+page.length);at+=page.length;return piece;
  });
  const plants=native.map((page,i)=>page.length? 
    encrypt(page,pads[i],0,1,0x33011403+i):{cipher:[],skips:0});
  const recovered=inverse(plants.map(p=>p.cipher),pads,1,lm);
  const positives=recovered.map((r,i)=>({
    page:r.page,sourceLength:native[i].length,
    plantedSkips:plants[i].skips,decodedSkips:r.skips,
    exact:r.plain.filter((v,j)=>v===native[i][j]).length,
    score:r.perRune
  }));
  const exact=positives.reduce((sum,r)=>sum+r.exact,0);
  assert.ok(exact>=0.85*3316,'Correct AES key and collision rule must decode GP-native positive plant');
  const wrongPads=padPerPage(Buffer.from(grid).reverse());
  const wrongMinus=inverse(original,wrongPads,1,lm);

  console.log(JSON.stringify({
    hypothesis:'p15 32-byte clockwise/BE AES-256 key; pp49-51 16 consecutive 16-byte IVs for physical pp40-55; GP29 mask with collision-constrained key discards',
    original:{minusMean:mean(originalMinus),plusMean:mean(originalPlus),
      bestMean:Math.max(mean(originalMinus),mean(originalPlus)),
      wrongReversedGridMean:mean(wrongMinus),
      minusPages:brief(originalMinus),plusPages:brief(originalPlus)},
    control:{sourceLength:3316,exactRecovered:exact,
      recoveryRate:exact/3316,recoveredMean:mean(recovered),
      perPage:positives},
    note:'The source materials do not prescribe AES or this key-skip grammar.'
  },null,2));
}
if(require.main===module) main();
module.exports={stream,padPerPage,inverse,main};
