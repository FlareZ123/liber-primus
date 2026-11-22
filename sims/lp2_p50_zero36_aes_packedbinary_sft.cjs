'use strict';
/**
 * Source-delimited p50 32+4 bytes as AES-256-CTR key/nonce on a literal 5-bit
 * packed ciphertext file, instead of a rune-by-rune modulo29 additive cipher.
 * Standalone read-only Windows Node22 test:
 * node sims/lp2_p50_zero36_aes_packedbinary_sft.cjs
 */
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {resolve}=require('node:path');
const {createHash,createCipheriv}=require('node:crypto');
const {TextDecoder}=require('node:util');
const {parseSharedCorpus}=require('./lp2_word_pages.cjs');
const root=resolve(__dirname,'..');
/** @param {string} name @returns {unknown} */
const read=name=>JSON.parse(readFileSync(resolve(root,name),'utf8'));
const corpus=read('resources/liber-primus/lp2-corpus.json');
const grid=read('resources/liber-primus/base60-grid.json').byte_rows.flat();
assert.equal(grid.length,256);
assert.deepEqual(grid.flatMap((x,i)=>x===0?[i]:[]),[192,229]);
const tape=Buffer.from(grid.slice(193,229));
assert.equal(tape.length,36);
assert.equal(createHash('sha256').update(tape).digest('hex'),
  '9205dc9d0d6071448dd91876e1211becd2b4ef224445030e11b08b63acbdd86b');
const key=tape.subarray(0,32);
const nonce=tape.subarray(32);
assert.equal(nonce.toString('hex'),'3449f990');
const source=corpus.pages.filter(p=>p.status==='unsolved')
  .flatMap(p=>p.indices);
assert.equal(source.length,12956);
const runeTo=new Map(corpus.runes.map((r,i)=>[r,i]));
const words=parseSharedCorpus().words;
assert.equal(words.length,2896);
const withBreaks=[];
for(let wi=0;wi<words.length;wi++){
 if(wi)withBreaks.push(29);
 for(const ch of words[wi].runes){
  const index=runeTo.get(ch);
  assert.notEqual(index,undefined);
  withBreaks.push(index);
 }
}
assert.equal(withBreaks.length,15851);
assert.deepEqual(withBreaks.filter(x=>x<29),source);
/**
 * @param {number[]} symbols Literal MSB-first 5-bit GP values (0..29)
 * @returns {Buffer}
 */
function pack5(symbols){
 const out=[];let acc=0,count=0;
 for(const value of symbols){
  assert(Number.isInteger(value)&&value>=0&&value<32);
  acc=(acc<<5)|value;
  count+=5;
  while(count>=8){count-=8;out.push((acc>>>count)&255);acc&=(1<<count)-1;}
 }
 if(count)out.push(acc<<(8-count));
 return Buffer.from(out);
}
/** @param {Buffer} input @param {Buffer} iv @returns {Buffer} */
function crypt(input,iv){
 const cipher=createCipheriv('aes-256-ctr',key,iv);
 return Buffer.concat([cipher.update(input),cipher.final()]);
}
const fixture=[
 {name:'literal runes',data:source,n:8098,
  sha:'18cff7fcdd3b33c8f8c33156e18de8784a8ef7cfce1e74963a1a3e08b59b3591'},
 {name:'literal runes plus printed-word code29',data:withBreaks,n:9907,
  sha:'42382165b2a4bdd94c62f90a564354e9c80046aa124c70ecb2ac0c75ff2736e1'}
];
const types={
 JPEG:['ffd8ff'],PNG:['89504e470d0a1a0a'],ZIP:['504b0304','504b0506'],
 GZIP:['1f8b'],PDF:['255044462d'],PGP:['c6','c4'],GIT:['44495243'],
 RIFF:['52494646'],ELF:['7f454c46'],SQLite:['53514c69746520666f726d6174203300'],
 Zstd:['28b52ffd'],Bzip2:['425a68'],GIF:['47494638'],Ogg:['4f676753']
};
const rows=[];
for(const variant of fixture){
 const bytes=pack5(variant.data);
 assert.equal(bytes.length,variant.n);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),variant.sha);
 for(const layout of ['nonce-leading','nonce-trailing']){
  const iv=layout==='nonce-leading'
   ?Buffer.concat([nonce,Buffer.alloc(12)])
   :Buffer.concat([Buffer.alloc(12),nonce]);
  const decrypted=crypt(bytes,iv);
  assert.deepEqual(crypt(decrypted,iv),bytes);
  const first=decrypted.subarray(0,16).toString('hex');
  const signature=Object.entries(types).flatMap(([name,codes])=>
    codes.some(code=>first.startsWith(code))?[name]:[]);
  let printable=0,run=0,maxRun=0,nul=0;
  const hist=new Uint32Array(256);
  for(const b of decrypted){
   hist[b]++;
   if(b===0)nul++;
   if(b>=32&&b<=126){printable++;run++;maxRun=Math.max(maxRun,run);}
   else run=0;
  }
  const entropy=[...hist].reduce((sum,x)=>{
   if(x===0)return sum;
   const q=x/decrypted.length;
   return sum-q*Math.log2(q);
  },0);
  let validUtf8=true;
  try{new TextDecoder('utf-8',{fatal:true}).decode(decrypted);}
  catch(e){validUtf8=false;}
  rows.push({input:variant.name,layout,bytes:decrypted.length,
   first16Hex:first,sha256:createHash('sha256').update(decrypted).digest('hex'),
   validUtf8,printableFraction:printable/decrypted.length,
   longestPrintableRun:maxRun,zeroBytes:nul,byteEntropy:entropy,
   recognizedHeader:signature});
 }
}
// Independent native solved p57 source-byte plant under the same untouched key.
const originalP57=corpus.pages.find(p=>p.page===57).indices;
const clearFixture=pack5(originalP57);
for(const layout of ['nonce-leading','nonce-trailing']){
 const iv=layout==='nonce-leading'
  ?Buffer.concat([nonce,Buffer.alloc(12)])
  :Buffer.concat([Buffer.alloc(12),nonce]);
 const encrypted=crypt(clearFixture,iv);
 assert.deepEqual(crypt(encrypted,iv),clearFixture);
}
assert.equal(rows.length,4);
assert(rows.every(x=>x.validUtf8===false&&x.recognizedHeader.length===0));
console.log(JSON.stringify({
 claim:'Four exact original packed-binary AES-256-CTR inverses; no native UTF-8 or recognized file header',
 source:{runes:source.length,words:words.length,zeros:[192,229],
  bracketBytes:tape.length,sourcePackedBytes:fixture.map(x=>x.n)},
 implementation:{keySource:'first 32 source bytes',nonceSource:'final four source bytes',
  noncePlacements:2,sourceSerializations:2,originalRoundtrip:true,
  solvedP57PositiveRoundtrip:true},
 originalResults:rows
},null,2));
