'use strict';
/**
 * Test the original 2013 Cicada OS audio/761.mp3 compressed audio payload
 * as an unknown-offset LP2 additive running pad. Its ID3 tag contains
 * the later LP2 PARABLE, making it a genuinely linked prior puzzle artifact.
 * Search every safe byte offset, modulo-29/scaled-29 reducers and both signs.
 *
 * The test does not claim an OTP key unless full plaintext appears, nor
 * investigate unrelated English books. Input is pinned to original repo.
 * Run after fetching original file: node sims/audio_761_pad_scan.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { train, encode } = require('./grid_keyskip_viterbi.cjs');
const { decode, encrypt } = require('./mirror_jpeg_pad.cjs');
const { headScore, exhaustive } = require('./mirror_jpeg_offsets.cjs');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = process.env.LP761_MP3 || '/tmp/761.MP3';
const WINDOW = 220, HEAD = 24, KEEP = 400;

/** @param {Buffer} mp3 */
function audioData(mp3) {
  assert.equal(mp3.subarray(0,3).toString('ascii'),'ID3');
  assert.ok(mp3.subarray(0,210).includes(Buffer.from('Parable 1,595,277,641')));
  const len = ((mp3[6]&127)<<21)|((mp3[7]&127)<<14)|((mp3[8]&127)<<7)|(mp3[9]&127);
  const skip=10+len;
  assert.ok(skip>=180 && skip<400);
  assert.ok(mp3.length>3900000 && mp3.length<4100000);
  return { skip, audio: mp3.subarray(skip) };
}

/** @param {Buffer} audio */
function candidates(audio) {
  return [
    { name: 'mp3-payload-mod29', key: Uint8Array.from(audio, b => b%29) },
    { name: 'mp3-payload-scaled29', key: Uint8Array.from(audio, b => Math.floor(29*b/256)) }
  ];
}

function main(){
  const mp3=fs.readFileSync(SOURCE);
  const meta=audioData(mp3);
  const keys=candidates(meta.audio);
  const lang=train(fs.readFileSync(path.join(ROOT,
    'resources/control/shakespeare_first300k.txt'),'utf8'));
  const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,
    'resources/liber-primus/lp2-corpus.json'),'utf8'));
  const get=n=>corpus.pages.find(p=>p.page===n).indices.slice(0,WINDOW);
  const solved=fs.readFileSync(path.join(ROOT,
    'resources/liber-primus/lp1-plaintext-reference.txt'),'utf8');
  const plaintext=encode(solved.split('### 3')[1].split('### 4')[0]).slice(0,WINDOW);
  assert.equal(plaintext.length,WINDOW);
  const trueKey=keys[0], offset=3301, sign=1;
  const planted=encrypt(plaintext,trueKey.key,offset,sign,0x7613301);
  const replay=decode(planted.cipher,trueKey.key,offset,sign,lang);
  const exact=replay.plain.filter((p,i)=>p===plaintext[i]).length;
  assert.ok(exact>=198);
  console.log('SOURCE',JSON.stringify({
    url:'https://raw.githubusercontent.com/rtkd/iddqd/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/2013/02/761.MP3',
    size:mp3.length,sha256:crypto.createHash('sha256').update(mp3).digest('hex'),
    id3Size:meta.skip,compressedAudioBytes:meta.audio.length,
    keyCandidates:keys.map(k=>k.name)
  }));
  console.log('CONTROL',JSON.stringify({correct:exact,total:WINDOW,
    offset,sign,plantSkips:planted.skips,decodedSkips:replay.skips,
    fullScore:replay.perRune,
    trueHead:headScore(planted.cipher.slice(0,HEAD),trueKey.key,offset,sign,lang)
  }));

  const first=get(0);
  assert.equal(first.length,WINDOW);
  const best=exhaustive(first.slice(0,HEAD),keys,lang,KEEP);
  const finalists=best.best.map(c=>{
    const key=keys.find(x=>x.name===c.name).key;
    const dec=decode(first,key,c.offset,c.sign,lang);
    return { ...c, fullScore:dec.perRune, skippedKeys:dec.skips,
      first40:dec.plain.slice(0,40) };
  }).sort((a,b)=>b.fullScore-a.fullScore);
  const top=finalists.slice(0,20);
  const holdout=top.slice(0,6).map(candidate=>{
    const key=keys.find(x=>x.name===candidate.name).key;
    return {
      candidate:{name:candidate.name,offset:candidate.offset,sign:candidate.sign},
      page1:decode(get(1),key,candidate.offset,candidate.sign,lang).perRune,
      page5:decode(get(5),key,candidate.offset,candidate.sign,lang).perRune
    };
  });
  console.log('REAL',JSON.stringify({page:0,head:HEAD,full:WINDOW,
    candidates:best.checked,retained:best.best.length,
    top,holdout,headWinner:best.best.reduce((a,b)=>a.score>b.score?a:b)}));
}
if(require.main===module)main();
module.exports={audioData,candidates};
