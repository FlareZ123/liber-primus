'use strict';
/**
 * Original LP2 source p50 AEAD after predecessor-exclusion GP28 binary packing.
 * Tests printed source sections and printed red-chapter boundaries, source
 * 32-byte table columns, AES-256-GCM and ChaCha20-Poly1305 with standard tags.
 * Source-native encrypt+GP28+decrypt controls are checked for both algorithms.
 * Read-only Windows Node.js 22 single-file test.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const pages=corpus.pages.filter(p=>p.page<=55);
assert.equal(pages.length,56);
const canonical=pages.flatMap(p=>p.indices);
assert.equal(canonical.length,12956);
const byPage=new Map(pages.map(p=>[p.page,p.indices]));
const assemble=(starts)=>starts.map((start,i)=>{
  const end=starts[i+1]??56;
  return {label:start+'-'+(end-1),indices:Array.from({length:end-start},
    (_,j)=>byPage.get(start+j)).flat()};
});
const visual=assemble([0,3,8,15,23,27,33,40,54]);
assert.deepEqual(visual.map(s=>s.indices.length),
  [729,1145,1729,1903,1021,1433,1680,3008,308]);
const runeIndex=new Map(corpus.runes.map((c,i)=>[c,i]));
const transcription=read('resources/lp2-transcription.txt');
const groups=transcription.split('%').filter(x=>x.trim()).slice(0,-2).join('%')
  .split('$').filter(x=>/[\u16A0-\u16FF]/u.test(x))
  .map((s,i)=>({label:'dollar'+i,indices:
    [...s.matchAll(/[\u16A0-\u16FF]/gu)].map(m=>runeIndex.get(m[0]))}));
assert.deepEqual(groups.map(s=>s.indices.length),
  [729,1145,1738,1894,1021,1433,1680,3316]);
assert.deepEqual(groups.flatMap(s=>s.indices),canonical);
assert.deepEqual(visual.flatMap(s=>s.indices),canonical);
const units=[...visual,...groups];
assert.equal(units.length,17);
const nums=grid.pages.flatMap(p=>p.tokens);
assert.equal(nums.length,256);
const digits60='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
assert.equal(digits60.length,60);
const chars59=digits60.replace('f','');
assert.equal(chars59.length,59);
const keysByRadix={};
for(const radix of [60,59]){
  const abc=radix===60?digits60:chars59;
  const gridBytes=nums.map(n=>abc.indexOf(n[0])*radix+abc.indexOf(n[1]));
  assert(gridBytes.every(x=>Number.isInteger(x)&&x>=0&&x<256));
  if(radix===60)assert.deepEqual(gridBytes,grid.pages.flatMap(p=>p.bytes));
  keysByRadix[radix]=Array.from({length:8},(_,column)=>
    Buffer.from(Array.from({length:32},(_,row)=>gridBytes[8*row+column])));
}
function rank(previous,current,mode){
  if(previous===current)return null;
  return mode==='cyclic'?(current-previous+28)%29:
    current-Number(current>previous);
}
function unrank(previous,digit,mode){
  return mode==='cyclic'?(previous+digit+1)%29:
    digit+Number(digit>=previous);
}
function extract(glyphs,mode){
  let value=0n,count=0;const repeats=[];
  for(let i=1;i<glyphs.length;i++){
    const r=rank(glyphs[i-1],glyphs[i],mode);
    if(r===null){repeats.push(i);continue;}
    value=value*28n+BigInt(r);count++;
  }
  return {value,count,first:glyphs[0],length:glyphs.length,repeats};
}
function restore(t,mode){
  let v=t.value;const ranks=Array(t.count);
  for(let i=t.count-1;i>=0;i--){ranks[i]=Number(v%28n);v/=28n;}
  assert.equal(v,0n);
  const escaped=new Set(t.repeats),out=[t.first];let j=0;
  for(let i=1;i<t.length;i++)
    out.push(escaped.has(i)?out.at(-1):unrank(out.at(-1),ranks[j++],mode));
  assert.equal(j,t.count);
  return out;
}
function bytes(t,fixed){
  let hex=t.value.toString(16);
  if(hex.length%2)hex='0'+hex;
  if(fixed)hex=hex.padStart(2*Math.ceil(t.count*Math.log2(28)/8),'0');
  return Buffer.from(hex,'hex');
}
function makeIv(n){const iv=Buffer.alloc(12);iv.writeUInt32BE(n,8);return iv;}
const IV={zero:makeIv(0),cicada3301:makeIv(3301)};
const kinds=['aes-256-gcm','chacha20-poly1305'];
const options=kind=>kind==='chacha20-poly1305'?{authTagLength:16}:undefined;
function encrypt(plain,key,iv,kind){
  const c=crypto.createCipheriv(kind,key,iv,options(kind));
  const body=Buffer.concat([c.update(plain),c.final()]);
  return Buffer.concat([body,c.getAuthTag()]);
}
function decrypt(envelope,key,iv,kind){
  if(envelope.length<16)return null;
  const d=crypto.createDecipheriv(kind,key,iv,options(kind));
  d.setAuthTag(envelope.subarray(envelope.length-16));
  try{
    return Buffer.concat([d.update(envelope.subarray(0,-16)),d.final()]);
  }catch(e){
    // The overwhelmingly expected path for a wrong candidate is tag failure.
    if(e.code==='ERR_OSSL_BAD_DECRYPT'||e.message.includes('authenticate')||
      e.message.includes('bad decrypt'))return null;
    throw e;
  }
}
function inspect(blob,model,key,kind){
  if(model==='nonce-prefix'){
    if(blob.length<28)return null;
    return decrypt(blob.subarray(12),key,blob.subarray(0,12),kind);
  }
  return decrypt(blob,key,IV[model],kind);
}
// Genuine source GP plaintext -> AEAD ciphertext plus tag -> base28 / GP29
// transport -> exact source byte recovery -> authentication -> original text.
const english=Buffer.from('FIND THE DIVINITY WITHIN AND EMERGE. THE KEY IS ALL AROUND YOU.');
let positive=0;
for(const kind of kinds)for(const order of ['cyclic','sorted']){
  const authenticated=encrypt(english,keysByRadix[60][0],IV.zero,kind);
  assert(authenticated[0]!==0);
  let x=BigInt('0x'+authenticated.toString('hex'));const ranks=[];
  while(x){ranks.unshift(Number(x%28n));x/=28n;}
  const cipherRunes=[14];
  for(const r of ranks)cipherRunes.push(unrank(cipherRunes.at(-1),r,order));
  cipherRunes.splice(9,0,cipherRunes[8]);
  const recovered=extract(cipherRunes,order);
  assert.deepEqual(restore(recovered,order),cipherRunes);
  assert.deepEqual(bytes(recovered,false),authenticated);
  assert.deepEqual(decrypt(bytes(recovered,false),keysByRadix[60][0],
    IV.zero,kind),english);
  positive++;
}
assert.equal(positive,4);
const matches=[];
let originalAttempts=0,originalRuneReplays=0;
let minBytes=Infinity,maxBytes=0;
for(const unit of units)for(const order of ['sorted','cyclic']){
  const tr=extract(unit.indices,order);
  assert.deepEqual(restore(tr,order),unit.indices);
  originalRuneReplays++;
  for(const width of ['minimal','fixed']){
    const data=bytes(tr,width==='fixed');
    minBytes=Math.min(minBytes,data.length);maxBytes=Math.max(maxBytes,data.length);
    for(const radix of [60,59])for(let column=0;column<8;column++)
    for(const kind of kinds)for(const framing of ['zero','cicada3301','nonce-prefix']){
      originalAttempts++;
      const plain=inspect(data,framing,keysByRadix[radix][column],kind);
      if(plain!==null){
        matches.push({unit:unit.label,order,width,radix,column,kind,framing,
          originalPackedBytes:data.length,plaintextBytes:plain.length,
          plaintextHex:plain.toString('hex'),text:plain.toString('utf8')});
      }
    }
  }
}
assert.equal(originalAttempts,3264);
console.log(JSON.stringify({
  premise:'Source-p50 eight 32-byte keys as authenticated binary-first GP28 chapter receiver',
  exactOriginalRunes:canonical.length,chapterLengths:visual.map(x=>x.indices.length),
  dollarSectionLengths:groups.map(x=>x.indices.length),
  originalSourceUnits:units.length,originalAttempts,originalRuneReplays,
  authenticatedNativeEnglishPlants:positive,minBytes,maxBytes,matches,
  interpretation:'Only standard 16-byte terminal authentication tag; source 32-byte columns, AES-256-GCM or ChaCha20-Poly1305, nonce=zero/3301/prepended, both literal radix and GP28 order/width. No guessing. Source authorship not authenticated.'
},null,2));
