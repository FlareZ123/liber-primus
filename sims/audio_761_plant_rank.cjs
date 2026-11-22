'use strict';
/**
 * Measure whether original 761.MP3 key-offset screen can actually recover a
 * planted source-true key in a 4,009,867-offset search, rather than only
 * decrypting successfully after being told the correct key position.
 * Reproduce using immutable 2013 source and node sims/audio_761_plant_rank.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { train, encode } = require('./grid_keyskip_viterbi.cjs');
const { encrypt } = require('./mirror_jpeg_pad.cjs');
const { headScore } = require('./mirror_jpeg_offsets.cjs');
const { audioData, candidates } = require('./audio_761_pad_scan.cjs');
const ROOT = path.resolve(__dirname,'..');
const data = fs.readFileSync(process.env.LP761_MP3 || '/tmp/761.MP3');
const source = candidates(audioData(data).audio)[0];
const english = fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp1-plaintext-reference.txt'),'utf8');
const plain = encode(english.split('### 3')[1].split('### 4')[0]).slice(0,220);
assert.equal(plain.length,220);
const cipher=encrypt(plain,source.key,3301,1,0x7613301).cipher;
const model=train(fs.readFileSync(path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8'));
const HEAD=24, WIN=220, trueScore=headScore(cipher.slice(0,HEAD),source.key,3301,1,model);
let ahead=0,best=-Infinity,bestOffset=-1,search=0;
for(let offset=0;offset<=source.key.length-3*WIN;offset++){
  if(offset===3301)continue;
  const score=headScore(cipher.slice(0,HEAD),source.key,offset,1,model);
  search++;
  if(score>trueScore)ahead++;
  if(score>best){best=score;bestOffset=offset;}
}
console.log('RANK',JSON.stringify({
  source:'2013 Cicada original MP3 761 compressed bytes modulo29',
  trueOffset:3301,sign:1,plantedSkipSeed:'0x7613301',
  trueHeadScore:trueScore,incorrectOffsetsTested:search,rank:ahead+1,
  bestWrongHeadScore:best,bestWrongOffset:bestOffset,
  canSurvive400:(ahead+1)<=400
}));
assert.ok(ahead+1<=400,'The true source offset did not survive top400 one-variant head shortlist');
