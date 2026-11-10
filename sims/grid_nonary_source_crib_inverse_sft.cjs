"use strict";
/**
 * Original-source GF29 degree-nine feedback: dictionary-led all-crib state
 * inversion with unchanged p0/p1 holdout and hidden native-GP positive.
 * Node 22: node sims/grid_nonary_source_crib_inverse_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} p @returns {any} */
function read(p){return JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));}
const corpus=read("resources/liber-primus/lp2-corpus.json");
const grid=read("resources/liber-primus/lp2-grid-256.json").bytes;
const p0=corpus.pages.find(p=>p.page===0).indices;
const p1=corpus.pages.find(p=>p.page===1).indices;
assert.equal(p0.length,262);assert.equal(p1.length,266);
const text=fs.readFileSync(path.join(root,"resources/control/shakespeare_first300k.txt"),"utf8");
/** GP normalizer matching previous_cipher_sbox_invariant.cjs.
 * @param {string} input @returns {number[]} */
function gematria(input){
  const map=new Map(corpus.translit.map((v,i)=>[v,i])),out=[];
  for(let word of input.toUpperCase().match(/[A-Z]+/g)||[]){
    word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
    for(let i=0;i<word.length;){
      const pair=word.slice(i,i+2);
      if(map.has(pair)){out.push(map.get(pair));i+=2;}
      else {if(map.has(word[i]))out.push(map.get(word[i]));i++;}
    }
  }
  return out;
}
const gp=gematria(text);
assert(gp.length>200000);
const trigram=new Uint32Array(29**3),bigram=new Uint32Array(29**2);
for(let i=2;i<100000;i++){
  trigram[gp[i-2]*841+gp[i-1]*29+gp[i]]++;
  bigram[gp[i-2]*29+gp[i-1]]++;
}
const lm=new Float64Array(29**3);
for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++){
  const j=a*841+b*29+c;
  lm[j]=Math.log((trigram[j]+.25)/(bigram[a*29+b]+7.25));
}
/** @param {number} x @returns {number} */
function mod(x){return ((x%29)+29)%29;}
const coeff=[11,15,0,9,1,5,10,20,12];
const rr=grid.slice().reverse().map(mod);
for(let i=rr.length-1;i>=9;i--){
  const v=rr[i];
  for(let j=0;j<10;j++)rr[i-9+j]=mod(rr[i-9+j]-v*(coeff[j]??1));
}
assert(rr.slice(0,9).every(v=>v===0));
/** Monic source factor f9. @param {number[]} seed @param {number} len @returns {number[]} */
function pad(seed,len){
  const out=seed.slice();
  for(let i=9;i<len;i++){
    let s=0;for(let j=0;j<9;j++)s+=coeff[j]*out[i-9+j];
    out.push(mod(-s));
  }
  return out;
}
/** @param {number[]} cipher @param {number} offset @param {number[]} seed @param {number} len @returns {number[]} */
function decode(cipher,offset,seed,len){
  const stream=pad(seed,len);
  return Array.from({length:len},(_,i)=>mod(cipher[offset+i]-stream[i]));
}
/** @param {number[]} values @returns {number} */
function score(values){
  let s=0;for(let i=2;i<values.length;i++)s+=lm[values[i-2]*841+values[i-1]*29+values[i]];
  return s/(values.length-2);
}
const unique=new Map();
for(let i=100000;i+9<200000;i++){
  let n=0;for(let j=0;j<9;j++)n=n*29+gp[i+j];
  if(!unique.has(n))unique.set(n,gp.slice(i,i+9));
}
assert.equal(unique.size,91366);
/** Source-list nine-gram guesses, search first70 then rerank top400 on remaining original page.
 * @param {number[]} cipher @param {number} offset @returns {{ninegrams:number,top:{prefix:number,full:number,seed:number[],crib:number[]}[]}} */
function search(cipher,offset){
  const best=[];
  for(const crib of unique.values()){
    const seed=crib.map((x,i)=>mod(cipher[offset+i]-x));
    const s70=score(decode(cipher,offset,seed,70));
    if(best.length<400){best.push({prefix:s70,seed,crib});if(best.length===400)best.sort((a,b)=>a.prefix-b.prefix);}
    else if(s70>best[0].prefix){best[0]={prefix:s70,seed,crib};best.sort((a,b)=>a.prefix-b.prefix);}
  }
  const ranked=best.map(c=>({...c,full:score(decode(cipher,offset,c.seed,cipher.length-offset))}));
  ranked.sort((a,b)=>b.full-a.full);
  return {ninegrams:unique.size,top:ranked.slice(0,5)};
}
const original0=search(p0,0),original13=search(p0,13);
assert(Math.abs(original0.top[0].full-(-3.8509307398251527))<1e-12);
assert(Math.abs(original13.top[0].full-(-3.845308985565502))<1e-12);
const winningPad=pad(original0.top[0].seed,p0.length+p1.length);
const p1Plain=p1.map((x,i)=>mod(x-winningPad[p0.length+i]));
const originalP1Score=score(p1Plain);
assert(Math.abs(originalP1Score-(-4.277154558626318))<1e-12);
const native=gp.slice(150000,150000+p0.length+p1.length);
const trueSeed=[5,8,13,21,4,9,2,18,27],truePad=pad(trueSeed,native.length);
const planted=native.map((v,i)=>mod(v+truePad[i]));
const plantFit=search(planted.slice(0,p0.length),0);
assert.deepEqual(plantFit.top[0].seed,trueSeed);
assert(Math.abs(plantFit.top[0].full-score(native.slice(0,p0.length)))<1e-12);
assert.deepEqual(planted.map((v,i)=>mod(v-truePad[i])),native);
console.log(JSON.stringify({
  candidate_ninegrams:unique.size,
  original_p0_initial:original0.top[0],
  original_p0_after_red13:original13.top[0],
  original_p1_continuation_score:originalP1Score,
  planted_native_p0_score:score(native.slice(0,p0.length)),
  planted_native_p1_score:score(native.slice(p0.length)),
  planted_exact_state_rank:1,planted_exact_reencryption:true,
  scope:"GP29 additive, source f9 feedback, first nine plaintext symbols in independent 91366-gram Shakespeare inventory, 70-rune shortlist",
  authenticated_plaintext:false
},null,2));
