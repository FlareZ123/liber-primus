'use strict';

/**
 * Source-bounded AES-256 consumer for the only two red16 headings,
 * p3 and p23, both directly followed by original red13 punctuation.
 * Run: node sims/lp2_p3_p23_red32_aes256_grid_original_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const p3 = corpus.pages[3].indices.slice(0,16);
const p23 = corpus.pages[23].indices.slice(0,16);
assert.deepEqual(p3,[20,11,12,8,21,5,2,16,25,11,16,14,8,16,1,22]);
assert.deepEqual(p23,[1,24,7,21,6,14,23,6,10,17,10,12,16,17,10,26]);
for (const page of [3,23]) {
  const obj=ink.pages.find(p=>p.page===page);
  assert.deepEqual([obj.red_spans[0].start,obj.red_spans[0].length],[0,16]);
  assert(obj.large_punctuation.some(x=>x[0]===16&&x[1]===13&&x[2]==='red'));
}
const source=Buffer.from(grid.byte_rows.flat());
assert.equal(source.length,256);
const hash=crypto.createHash('sha256').update(source).digest('hex');
assert.equal(hash,'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const keys=[];
for (const [order,pair] of [['p3+p23',[p3,p23]],['p23+p3',[p23,p3]]]) {
  const xs=pair.flat();
  keys.push({order,type:'indices',bytes:Buffer.from(xs)});
  keys.push({order,type:'primes',bytes:Buffer.from(xs.map(i=>corpus.prime[i]))});
}
/** @param {Buffer} input @param {Buffer} key
 * @param {string} mode @param {boolean} encrypt */
function aes(input,key,mode,encrypt){
  const algorithm=mode==='ecb'?'aes-256-ecb':'aes-256-cbc';
  const iv=mode==='ecb'?null:mode==='cbc-zero'?Buffer.alloc(16):source.subarray(0,16);
  const cipher=encrypt?crypto.createCipheriv(algorithm,key,iv):
    crypto.createDecipheriv(algorithm,key,iv);
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(input),cipher.final()]);
}
/** @param {Buffer} b */
function classify(b){
  const a=[...b];
  let run=0,longest=0;
  for(const x of a){run=x>=32&&x<=126?run+1:0;longest=Math.max(longest,run);}
  return {size:b.length,printable:a.filter(v=>v>=32&&v<=126).length,
    gp29Bytes:a.filter(v=>v<29).length,longestASCII:longest,
    first16:b.subarray(0,16).toString('hex')};
}
const original=[];
const plant=Buffer.from('LIBER PRIMUS '.repeat(20).slice(0,256),'ascii');
assert.equal(plant.length,256);
for(const key of keys)for(const mode of ['ecb','cbc-zero','cbc-first16']){
  const cipher=mode==='cbc-first16'?source.subarray(16):source;
  const clear=aes(cipher,key.bytes,mode,false);
  assert.deepEqual(aes(clear,key.bytes,mode,true),cipher);
  if(mode!=='cbc-first16'){
    const encryptedPlant=aes(plant,key.bytes,mode,true);
    assert.deepEqual(aes(encryptedPlant,key.bytes,mode,false),plant);
  }
  original.push({order:key.order,keyType:key.type,mode,...classify(clear)});
}
assert.equal(original.length,12);
assert(original.every(x=>x.printable<130&&x.gp29Bytes<65&&x.longestASCII<20));
console.log(JSON.stringify({
  source:'two unique original red16 headings + one source base60 256-byte panel',
  sourceSHA256:hash,tested:12,original,exactReencrypt:true,plantedASCII:true,
  verdict:'No direct ASCII/native-GP29 readable result in the 12 fixed AES-256 source-key cases'
},null,2));
