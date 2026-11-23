'use strict';
/** One source-paired Salsa20/20 original inverse: p0-red13 8-byte BASE29 nonce,
 * p50 original fifth column 32-byte key (independent 331 / missing-L selector).
 * The opcode is 2014-available but NOT first-party authenticated.
 * No key search, seed search, nonce mutation, phase tuning or word resets.
 */
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const corpus=require('../resources/liber-primus/lp2-corpus.json');
const ink=require('../resources/liber-primus/lp2-ink-annotations.json');
const grid=require('../resources/liber-primus/base60-grid.json');
function u32(b,i){return b.readUInt32LE(i);}
function rot(x,n){return (x<<n)|(x>>>(32-n));}
function q(x,a,b,c,d){
 x[b]^=rot((x[a]+x[d])>>>0,7);
 x[c]^=rot((x[b]+x[a])>>>0,9);
 x[d]^=rot((x[c]+x[b])>>>0,13);
 x[a]^=rot((x[d]+x[c])>>>0,18);
}
function salsaBlock(key,nonce,counter=0n){
 assert.equal(key.length,32);assert.equal(nonce.length,8);
 const sigma=Buffer.from('expand 32-byte k','ascii');
 const x=new Uint32Array(16);
 for(const [i,offset] of [[0,0],[5,4],[10,8],[15,12]]) x[i]=u32(sigma,offset);
 for(let j=0;j<4;j++){x[j+1]=u32(key,4*j);x[11+j]=u32(key,16+4*j);}
 x[6]=u32(nonce,0); x[7]=u32(nonce,4);
 x[8]=Number(counter&0xffffffffn);x[9]=Number(counter>>32n);
 const z=Uint32Array.from(x);
 for(let r=0;r<10;r++){
  q(z,0,4,8,12);q(z,5,9,13,1);q(z,10,14,2,6);q(z,15,3,7,11);
  q(z,0,1,2,3);q(z,5,6,7,4);q(z,10,11,8,9);q(z,15,12,13,14);
 }
 const out=Buffer.alloc(64);
 for(let i=0;i<16;i++)out.writeUInt32LE((z[i]+x[i])>>>0,i*4);
 return out;
}
function salsa(key,nonce,n){
 const out=Buffer.alloc(n);
 for(let offset=0,ctr=0n;offset<n;offset+=64,ctr++){
  salsaBlock(key,nonce,ctr).copy(out,offset,0,Math.min(64,n-offset));
 }
 return out;
}
function xor(a,b){assert(a.length<=b.length);const c=Buffer.alloc(a.length);for(let i=0;i<a.length;i++)c[i]=a[i]^b[i];return c;}
function ioc(a){
 const hist=Array(29).fill(0);for(const x of a)hist[x]++;
 return hist.reduce((s,v)=>s+v*(v-1),0)/(a.length*(a.length-1));
}
function big(a){
 let n=0n;for(const v of a){assert(v>=0&&v<29);n=n*29n+BigInt(v);}return n;
}
function decode(s,key){return s.map((v,i)=>(v-key[i]+29)%29);}
function scoreBytes(b){
 let printable=0,letters=0,best=0,run=0;
 for(const x of b){const p=(x>=32&&x<=126)||x===9||x===10||x===13;
 printable+=Number(p);letters+=Number(x===32||(x>=65&&x<=90)||(x>=97&&x<=122));
 run=p?run+1:0;best=Math.max(best,run);}
 return {bytes:b.length,printable,letters,longestPrintable:best,hexPrefix:b.subarray(0,32).toString('hex')};
}
const all=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(all.length,12956);
const red=ink.pages.find(p=>p.page===0).red_spans[0];
assert.deepEqual([red.start,red.length],[0,13]);
assert.deepEqual(all.slice(0,13),[15,8,18,3,6,19,27,0,15,26,18,21,5]);
const nonceN=big(all.slice(0,13));
assert.equal(nonceN.toString(16),'4b1cde6f9c9af1e1');
const nonce=Buffer.from(nonceN.toString(16),'hex');
const key=Buffer.from(grid.rows.map(r=>grid.alphabet.indexOf(r[4][0])*60+grid.alphabet.indexOf(r[4][1])));
assert.equal(key.toString('hex'),'61f7669636e6566ac772adec530e360da9f5f63469949026b0c2463a90ee16b4');
assert.equal(key.length,32);
const known=Buffer.from('e3be8fdd8beca2e3ea8ef9475b29a6e7003951e1097a5c38d23b7a5fad9f6844','hex');
const testKey=Buffer.alloc(32);testKey[0]=0x80;
assert.deepEqual(salsa(testKey,Buffer.alloc(8),64).subarray(0,32),known);
const body=all.slice(13),stream=salsa(key,nonce,body.length*2);
assert.equal(body.length,12943);
const p0end=corpus.pages[0].indices.length-13;
const p2end=corpus.pages.slice(0,3).reduce((s,p)=>s+p.indices.length,0)-13;
const positive=corpus.pages[57].indices;assert.equal(positive.length,95);
/** Genuine solved-LP1/p56 no-advance literal-F constraint; exact reachability.
 * Ciphertext F has two possibilities: literal plaintext F (no advance), or
 * shifted non-F plaintext (advance). Non-F ciphertext cannot decode to F.
 */
function strictFReach(cipher,ks){
 let live=new Uint8Array(cipher.length+1);live[0]=1;
 let lo=0,hi=0,peak=1,lastCount=1;
 for(let i=0;i<cipher.length;i++){
  const next=new Uint8Array(cipher.length+1);
  let nlo=cipher.length+1,nhi=-1,count=0;
  for(let j=lo;j<=hi;j++)if(live[j]){
   if(cipher[i]===0)next[j]=1;
   if(j<ks.length&&((cipher[i]-ks[j]+29)%29)!==0)next[j+1]=1;
  }
  for(let j=Math.max(0,lo);j<=Math.min(cipher.length,hi+1);j++)if(next[j]){
   nlo=Math.min(nlo,j);nhi=Math.max(nhi,j);count++;
  }
  peak=Math.max(peak,count);
  if(count===0)return {feasible:false,firstImpossibleAt:i,symbolsChecked:i+1,peakStates:peak};
  live=next;lo=nlo;hi=nhi;lastCount=count;
 }
 return {feasible:true,symbolsChecked:cipher.length,endingStates:lastCount,lowConsumed:lo,highConsumed:hi,peakStates:peak,endingOffsets:[...live.entries()].filter(([j,yes])=>yes).map(([j])=>j)};
}
const methods=[];
for(const [name,ks] of [
 ['streamBytesMod29',[...stream.subarray(0,body.length)].map(x=>x%29)],
 ['streamBytesRejection29',[...stream].filter(x=>x<232).slice(0,body.length).map(x=>x%29)]
]){
 assert.equal(ks.length,body.length);
 const p=decode(body,ks);
 assert.deepEqual(p.map((v,i)=>(v+ks[i])%29),body);
 const plant=positive.map((v,i)=>(v+ks[i])%29);
 assert.deepEqual(decode(plant,ks),positive);

 let cursor=0;
 const plantedStrictF=positive.map(v=>v===0?0:(v+ks[cursor++])%29);
 const plantedGate=strictFReach(plantedStrictF,ks);
 assert(plantedGate.feasible);
 assert(plantedGate.endingOffsets.includes(cursor));
 const strictFOriginal=strictFReach(body,ks);
 methods.push({
  strictFOriginal:Object.fromEntries(Object.entries(strictFOriginal).filter(([k])=>k!=='endingOffsets')),
  strictFNativePlant:{runes:positive.length,consumedKeySymbols:cursor,feasible:plantedGate.feasible},
  name,p0BlackIoC:ioc(p.slice(0,p0end)),holdoutP1P2IoC:ioc(p.slice(p0end,p2end)),fullIoC:ioc(p),first100:p.slice(0,100).map(x=>corpus.translit[x]).join(''),plantRunes:95});
}
let value=big(body),h=value.toString(16);if(h.length%2)h='0'+h;
const raw=Buffer.from(h,'hex');
assert.equal(raw.length,7860);
let val=0n;for(const x of raw)val=val*256n+BigInt(x);assert.equal(val,value);
const out=xor(raw,salsa(key,nonce,raw.length));
assert.deepEqual(xor(out,salsa(key,nonce,out.length)),raw);
console.log(JSON.stringify({source:'unaltered p0 red13 BASE29 nonce + p50 column5 base60 key',algorithm:'Salsa20/20 (256-bit key, 64-bit nonce, initial counter=0)',opcodeAuthentication:'none; exact motivated one-shot',nonce:nonce.toString('hex'),key:key.toString('hex'),runedBody:body.length,methods,wholeBookBinary:scoreBytes(out)},null,2));
console.log('PASS source-exact Salsa20/20 and known E3BE vector; no inferred plaintext.');
