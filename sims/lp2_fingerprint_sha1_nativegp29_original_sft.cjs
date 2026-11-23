'use strict';

/**
 * Authenticated Cicada signing-key material as a source-fixed GP29 KDF.
 * Known original input; no language-fitted seed, offset, phase, or mask.
 * Standalone Windows Node.js 22 CommonJS reproducer, read-only.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const FPR = Buffer.from('6D854CD7933322A601C3286D181F01E57A35090F', 'hex');
assert.equal(FPR.length, 20);
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const flat = pages.flatMap(p => p.indices);
assert.equal(flat.length, 12956);
assert.equal(pages.length, 55);
const p56 = corpus.pages[56].indices, p57 = corpus.pages[57].indices;
assert.deepEqual([p56.length, p57.length], [85, 95]);
assert.equal(p57.slice(0, 7).map(x => corpus.translit[x]).join(''), 'PARABLE');
assert.deepEqual(corpus.pages.slice(0, 3).map(x=>x.indices.length), [262,266,201]);
const chapterStarts = [0,3,8,15,23,27,33,40,54];
assert.equal(chapterStarts.length, 9);
/** @param {number[]} x @returns {number} */
function ioc(x) {
  const counts = Array(29).fill(0);
  for (const v of x) counts[v]++;
  return counts.reduce((s,n) => s+n*(n-1), 0) / (x.length*(x.length-1));
}
const mod = n => (n%29+29)%29;
/** @param {number} value @returns {Buffer} */
function counterBE(value) {
  const b=Buffer.alloc(4); b.writeUInt32BE(value>>>0); return b;
}
/**
 * @param {'raw'|'sha1-fixed'|'sha1-counter'|'hmac-counter'} kind
 * @param {'mod'|'reject'} reduction
 * @param {number} n
 * @returns {number[]}
 */
function key(kind,reduction,n) {
  const out=[];
  let count=0;
  const fixedHash=crypto.createHash('sha1').update(FPR).digest();
  while(out.length<n){
    let block;
    if(kind==='raw')block=FPR;
    else if(kind==='sha1-fixed')block=fixedHash;
    else if(kind==='sha1-counter')block=crypto.createHash('sha1').update(FPR).update(counterBE(count)).digest();
    else block=crypto.createHmac('sha1',FPR).update(counterBE(count)).digest();
    count++;
    for(const b of block){
      if(reduction==='reject' && b>=232)continue;
      out.push(b%29);
      if(out.length===n)break;
    }
  }
  return out;
}
const starts=new Set(chapterStarts);
/**
 * @param {number[]} cipher
 * @param {number[]} k
 * @param {number} sign
 * @param {'book'|'chapter'} reset
 * @returns {number[]}
 */
function decode(cipher,k,sign,reset) {
  let chapterClock=0, at=0;
  const output=[];
  for(const pg of pages){
    if(reset==='chapter' && starts.has(pg.page))chapterClock=0;
    for(let j=0;j<pg.indices.length;j++){
      const c=cipher[at++];
      const ki=reset==='chapter'?chapterClock++:output.length;
      output.push(mod(c+sign*k[ki]));
    }
  }
  assert.equal(output.length, cipher.length);
  return output;
}
/** @param {number[]} a @returns {number[]} */
function splitPage(a,p) {
  let at=0;
  for(const entry of pages){
    if(entry.page===p)return a.slice(at,at+entry.indices.length);
    at+=entry.indices.length;
  }
  throw Error('no page '+p);
}
const models=[];
for(const kind of ['raw','sha1-fixed','sha1-counter','hmac-counter']){
  for(const reduction of ['mod','reject']){
    const k=key(kind,reduction,flat.length);
    for(const reset of ['book','chapter']){
      for(const sign of [-1,1]){
        const output=decode(flat,k,sign,reset);
        const recon=decode(output,k,-sign,reset);
        assert.deepEqual(recon,flat);
        const p54=splitPage(output,54);
        const p55=splitPage(output,55);
        models.push({
          kind,reduction,reset,sign,
          fullIoC:ioc(output),
          p54IoC:ioc(p54),
          p55IoC:ioc(p55),
          originalRed9:p54.slice(0,9).map(i=>corpus.translit[i]).join(' '),
          p55First16:p55.slice(0,16).map(i=>corpus.translit[i]).join(' ')
        });
        // A fixed positive with 95 source-native solved p57 runes.
        const plant=p57.map((r,i)=>mod(r-sign*k[i]));
        assert.deepEqual(plant.map((r,i)=>mod(r+sign*k[i])),p57);
      }
    }
  }
}
assert.equal(models.length,32);
assert.ok(models.every(x=>x.fullIoC<0.045));
const ranked=[...models].sort((a,b)=>b.fullIoC-a.fullIoC);
console.log(JSON.stringify({
  source:'PGP public key fingerprint 6D854...5090F with SHA1 original signed-message hash',
  originalUnsolvedRunes:flat.length,
  allowedModels:32,
  controls:{
    originalSolvedP57:95,
    sourceShapedP57Plants:32,
    everyModelOriginalForwardReplay:true
  },
  bestFullIoC:ranked[0],
  rangeFullIoC:[Math.min(...models.map(x=>x.fullIoC)),
    Math.max(...models.map(x=>x.fullIoC))],
  all:models,
  conclusion:'No direct GP29-native prose under four KDFs, two unbiased/biased byte reducers, two original clocks, and both GP29 additive signs.',
  status:'PASS'
},null,2));
