'use strict';
/**
 * Whole-terminal first-party 308 symbol known-text pad check.
 * 85 solved p56 + 95 clear p57 + 128 printed digest hex symbols = 308.
 * Compare source-visible p54+p55 232+76 ciphertext runes.
 *
 * Run: node sims/lp2_terminal308_knownhash_gp29_pad_gate_sft.cjs
 * Windows Node22 CJS SFT; no external dependencies or runtime writes.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
/** @param {string} p */
const data=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const gp=data('resources/liber-primus/lp2-corpus.json');
const hash='36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
assert.match(hash,/^[0-9a-f]{128}$/);
const hex=Array.from(hash,ch=>parseInt(ch,16));
assert.equal(hex.length,128);
assert.deepEqual(gp.pages.slice(54,58).map(p=>p.indices.length),[232,76,85,95]);
const unknown=gp.pages[54].indices.concat(gp.pages[55].indices);
const ciphertext56=gp.pages[56].indices;
const clear57=gp.pages[57].indices;
/** @param {number} n @returns {number[]} */
function primes(n){
 const found=[];for(let v=2;found.length<n;v++){
  let prime=true;
  for(let d=2;d*d<=v;d++)if(v%d===0){prime=false;break;}
  if(prime)found.push(v);
 }
 return found;
}
const ps=primes(85);let clock=0;
const plain56=ciphertext56.map((v,i)=>
 i===56?0:(v-(ps[clock++]-1)+29000)%29);
assert.equal(clock,84);
assert.deepEqual(plain56.slice(0,5),[24,9,18,9,23]);
const prefix='AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO';
const index=new Map(gp.translit.map((r,i)=>[r,i]));
const tokens=[...index.keys()].sort((a,b)=>b.length-a.length);
/** @param {string} p @returns {number[]} */
function toGp(p){
 const result=[];
 for(const word of p.split(/\s+/))for(let off=0;off<word.length;){
  const term=tokens.find(t=>word.startsWith(t,off));
  assert(term,'Unknown GP rune name at '+word.slice(off));
  result.push(index.get(term));off+=term.length;
 }
 return result;
}
const beforeHash=toGp(prefix);
assert.equal(beforeHash.length,45);
assert.deepEqual(plain56.slice(0,45),beforeHash);
assert.equal(plain56.length-beforeHash.length,40);
assert.equal(unknown.length,308);
const mod=x=>(x%29+29)%29;
/** @param {number[]} a @returns {number} */
const ioc=a=>{
 const hist=Array(29).fill(0);
 for(const x of a)hist[x]++;
 return hist.reduce((s,v)=>s+v*(v-1),0)/(a.length*(a.length-1));
};
const native=plain56.concat(clear57);
const nativeIoc=ioc(native),rawIoc=ioc(unknown);
assert(Math.abs(nativeIoc-0.0675356921166977)<1e-13);
assert(Math.abs(rawIoc-0.03382122763230255)<1e-13);
const checks=[];
for(const [register,p56] of [
 ['authentic p56 plain',plain56],['as-printed p56 cipher',ciphertext56]
]){
 for(const [placement,key] of [
  ['digest between p56 halves',p56.slice(0,45).concat(hex,p56.slice(45),clear57)],
  ['digest after p57',p56.concat(clear57,hex)],
  ['digest before p56',hex.concat(p56,clear57)]
 ]){
  assert.equal(key.length,308);
  for(const sign of [-1,1]){
   const output=unknown.map((x,i)=>mod(x+sign*key[i]));
   const back=output.map((x,i)=>mod(x-sign*key[i]));
   assert.deepEqual(back,unknown);
   // Whole-output language gate. For any pure alphabet permutation IoC
   // is unchanged; no GP29 single secret substitution can raise it.
   const score=ioc(output);
   checks.push({register,placement,sign,
    ioc:score,adjacentEqual:output.filter((x,i)=>i>0&&x===output[i-1]).length,
    first48:output.slice(0,48).map(x=>gp.translit[x]).join('')});
  }
 }
}
assert.equal(checks.length,12);
const best=Math.max(...checks.map(x=>x.ioc));
const worst=Math.min(...checks.map(x=>x.ioc));
assert(Math.abs(best-0.03638055755319599)<1e-13);
assert(Math.abs(worst-0.033461652354160494)<1e-13);

assert(checks.every(x=>x.ioc<0.04));
// Cicada's historically attested binary XOR operand family has a hard
// five-bit GP29 necessary condition. A direct XOR cannot emit 29,30 or 31
// as a native GP rune. No arbitrary conversion of these values is admitted.
const xorChecks=[];
for(const [register,p56] of [
 ['authentic p56 plain',plain56],['as-printed p56 cipher',ciphertext56]
])for(const [placement,key] of [
 ['digest between p56 halves',p56.slice(0,45).concat(hex,p56.slice(45),clear57)],
 ['digest after p57',p56.concat(clear57,hex)],
 ['digest before p56',hex.concat(p56,clear57)]
]){
 const output=unknown.map((v,i)=>v^key[i]);
 assert.deepEqual(output.map((v,i)=>v^key[i]),unknown);
 xorChecks.push({register,placement,illegalNativeGp:
   output.filter(v=>v>=29).length,firstIllegal:output.findIndex(v=>v>=29)});
}
assert.deepEqual(xorChecks.map(v=>v.illegalNativeGp),[21,23,24,26,23,28]);


// Positive: a native source-derived GP text fully reconstructs from the same
// fixed key material when an actual additive-pad model is applied.
const planted=Array.from({length:308},(_,i)=>native[i%native.length]);
const sourceKey=plain56.slice(0,45).concat(hex,plain56.slice(45),clear57);
const encrypted=planted.map((v,i)=>mod(v+sourceKey[i]));
assert.deepEqual(encrypted.map((v,i)=>mod(v-sourceKey[i])),planted);
const pin=crypto.createHash('sha256')
 .update(Buffer.from(gp.pages[54].indices.concat(gp.pages[55].indices))).digest('hex');
console.log(JSON.stringify({
 source:{target:'p54+p55',unknownRunes:308,
  p56KnownRunes:85,p57ClearRunes:95,printedHashChars:128,
  exactHashPrintedAfterNativeP56Rune:45,originalTargetSHA256:pin,
  nativeKnown180Ioc:nativeIoc,originalEncrypted308Ioc:rawIoc},
 variants:checks,bestIoc:best,worstIoc:worst,xorChecks,
 additiveModelPlantRecovered:'308/308',
 status:'All 12 source-order/sign/register additive outputs are near-uniform; all 6 literal five-bit XOR consumers produce forbidden 29-31 output values. No unknown GP prose.'
},null,2));
console.log('PASS: original p56 authentic key, digest and 308 source-shaped additive gate');
