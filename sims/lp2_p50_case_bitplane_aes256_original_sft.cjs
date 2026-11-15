'use strict';
/**
 * Source-visible 32x8 table case/parity bitplanes as 256-bit AES keys.
 * Test fixed zero-IV AES-256-CTR and unmodified GP29 ciphertext.
 * Hypothetical historical transfer: no author-selected AES/key rule asserted.
 * Windows Node22: node sims/lp2_p50_case_bitplane_aes256_original_sft.cjs
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} file */
const read=(file)=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const grid=read('resources/liber-primus/base60-grid.json');
const corpus=read('resources/liber-primus/lp2-corpus.json');
const bytes=Buffer.from(grid.byte_rows.flat());
assert.equal(grid.rows.length,32);
assert(grid.rows.every(row=>row.length===8));
assert.equal(bytes.length,256);
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
 '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length);
const original=pages.flatMap(p=>p.indices);
assert.equal(pages.length,55);
assert.equal(original.length,12956);
assert(original.every(v=>Number.isInteger(v)&&v>=0&&v<29));
const chapters=[
 [0,2],[3,7],[8,14],[15,22],[23,26],
 [27,32],[33,39],[40,53],[54,55]
].map(([a,b])=>pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices));
assert.deepEqual(chapters.map(s=>s.length),
 [729,1145,1729,1903,1021,1433,1680,3008,308]);
assert.deepEqual(chapters.flat(),original);
const classifications={
 lowercase:(token)=>/[a-z]/u.test(token[1]),
 uppercase:(token)=>/[A-Z]/u.test(token[1]),
 digit:(token)=>/[0-9]/u.test(token[1]),
 firstDigitOdd:(token)=>Number(token[0])%2===1
};
/** @param {(token:string)=>boolean} predicate @param {boolean} reverse */
function keyFromRows(predicate,reverse){
 const key=Buffer.alloc(32);
 for(let row=0;row<32;row++){
  let v=0;
  for(let col=0;col<8;col++){
   v=(v<<1)|Number(predicate(grid.rows[row][reverse?7-col:col]));
  }
  key[row]=v;
 }
 return key;
}
const frozen={
 lowercase:'6c300aa0d80c3649039a4a5a84110cd249261498c854b64a2f80c05e43c924f4',
 uppercase:'8081755b26f3c9a47c65b4a57b2ae22da6916264362b4935506d0fa12824db01',
 digit:'134e8004010000128000010000c411001048890301800080801230009412000a',
 firstDigitOdd:'dd9349c4e4df095c1d6933ecad55a161a2206190f846811416fc1940a2e8139b'
};
for(const [name,predicate] of Object.entries(classifications)){
 assert.equal(keyFromRows(predicate,false).toString('hex'),frozen[name]);
}
/** @param {Buffer} key @param {number} n */
function aesBytes(key,n){
 const cipher=crypto.createCipheriv('aes-256-ctr',key,Buffer.alloc(16));
 return Buffer.concat([cipher.update(Buffer.alloc(n)),cipher.final()]);
}
assert.equal(aesBytes(Buffer.alloc(32),16).toString('hex'),
 'dc95c078a2408989ad48a21492842087');
/** @param {Buffer} key @param {number} n @param {'mod29'|'scaled29'|'rejection29'} projection */
function pad29(key,n,projection){
 const stream=aesBytes(key,projection==='rejection29'?2*n:n);
 const values=[];
 for(const b of stream){
  if(projection==='rejection29'&&b>=232)continue;
  values.push(projection==='scaled29'?Math.floor(29*b/256):b%29);
  if(values.length===n)return values;
 }
 assert.fail('Insufficient 2n AES rejection bytes');
}
/** @param {number[][]} segments @param {Buffer} key @param {string} projection @param {number} sign */
function run(segments,key,projection,sign){
 return segments.flatMap(s=>{
  const pad=pad29(key,s.length,projection);
  return s.map((v,i)=>(v+29+sign*pad[i])%29);
 });
}
/** @param {number[]} xs */
function ioc(xs){
 const counts=Array(29).fill(0);
 for(const x of xs)counts[x]++;
 return counts.reduce((s,n)=>s+n*(n-1),0)/(xs.length*(xs.length-1));
}
/** @param {Buffer} key */
function decryptTable(key){
 const output={};
 for(const [mode,cipherName] of Object.entries({
  ECB:'aes-256-ecb',CBC:'aes-256-cbc',CTR:'aes-256-ctr'
 })){
  const cipher=crypto.createDecipheriv(cipherName,key,
   mode==='ECB'?null:Buffer.alloc(16));
  if(mode!=='CTR')cipher.setAutoPadding(false);
  const plain=Buffer.concat([cipher.update(bytes),cipher.final()]);
  assert.equal(plain.length,256);
  output[mode]={
   first16:plain.subarray(0,16).toString('hex'),
   printable:[...plain].filter(b=>(b>=32&&b<=126)||[9,10,13].includes(b)).length,
   literalGpIndex:[...plain].filter(b=>b<29).length
  };
 }
 return output;
}
const keys=[];
for(const [name,predicate] of Object.entries(classifications)){
 for(const reverse of [false,true]){
  const key=keyFromRows(predicate,reverse);
  keys.push({
   name:name+(reverse?':reversedRowBits':':printedRowBits'),
   key, selfDecrypt:decryptTable(key)
  });
 }
}
const scopes={book:[original],page:pages.map(p=>p.indices),chapter:chapters};
const p27Start=chapters.slice(0,5).reduce((sum,c)=>sum+c.length,0);
const p55Start=original.length-76;
const solved=corpus.pages.find(p=>p.page===57).indices;
assert.equal(solved.length,95);
const results=[];
for(const {name,key} of keys){
 for(const projection of ['mod29','scaled29','rejection29']){
  const positivePad=pad29(key,solved.length,projection);
  const plant=solved.map((x,i)=>(x+positivePad[i])%29);
  assert.deepEqual(plant.map((x,i)=>(x+29-positivePad[i])%29),solved);
  for(const [scope,segments] of Object.entries(scopes)){
   for(const sign of [-1,1]){
    const decoded=run(segments,key,projection,sign);
    assert.equal(decoded.length,original.length);
    results.push({
     name,projection,scope,sign,
     wholeBookIoc:ioc(decoded),
     p27ChapterIoc:ioc(decoded.slice(p27Start,p27Start+1433)),
     p55Ioc:ioc(decoded.slice(p55Start))
    });
   }
  }
 }
}
assert.equal(results.length,144);
results.sort((a,b)=>b.wholeBookIoc-a.wholeBookIoc);
console.log(JSON.stringify({
 hypothesis:'Printed 32x8 source token letter-case/parity bits supply 256-bit AES key',
 original:{runes:original.length,pages:pages.length,originalIoc:ioc(original),
  p27ChapterIoc:ioc(chapters[5]),solvedControlIoc:ioc(solved)},
 candidateCount:results.length,
 sourceKeys:keys.map(({name,key,selfDecrypt})=>({
  name,keyHex:key.toString('hex'),selfDecrypt
 })),
 top12:results.slice(0,12),
 maximumOriginalIoc:results[0].wholeBookIoc,
 notice:'No IV, phase, word-key fit, altered runes or plaintext optimization; interpretation of case bits as key and AES-256 are hypotheses.'
},null,2));
