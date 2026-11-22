"use strict";
/**
 * Exhaustive 29^3 GF29 cubic factor state search under repeat-transparent
 * primitive-root-15 / GP28 nonzero-successor emission.
 * Original physical p0 chooses key, unchanged original p1 is held out.
 * Node 22: node sims/grid_cubic_allseed_ea_original_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
/** @param {string} p @returns {any} */
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const corpus=read("resources/liber-primus/lp2-corpus.json");
const p0=corpus.pages.find(p=>p.page===0).indices;
const p1=corpus.pages.find(p=>p.page===1).indices;
assert.equal(p0.length,262);assert.equal(p1.length,266);
const src=fs.readFileSync(path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8");
/** Exact existing source GP normalization. @param {string} text @returns {number[]} */
function toGP(text){
  const map=new Map(corpus.translit.map((v,i)=>[v,i])),out=[];
  for(let word of text.toUpperCase().match(/[A-Z]+/g)||[]){
    word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
    for(let i=0;i<word.length;){
      const pair=word.slice(i,i+2);
      if(map.has(pair)){out.push(map.get(pair));i+=2;}
      else {if(map.has(word[i]))out.push(map.get(word[i]));i++;}
    }
  }
  return out;
}
const gp=toGP(src);
assert(gp.length>200000);
const tri=new Uint32Array(29**3),bi=new Uint32Array(29**2);
for(let i=2;i<100000;i++){
  tri[gp[i-2]*841+gp[i-1]*29+gp[i]]++;
  bi[gp[i-2]*29+gp[i-1]]++;
}
const lm=new Float64Array(29**3);
for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let x=0;x<29;x++){
  const at=a*841+b*29+x;
  lm[at]=Math.log((tri[at]+.25)/(bi[a*29+b]+7.25));
}
/** @param {number} v @returns {number} */
const mod29=v=>((v%29)+29)%29;
/** @param {number} v @returns {number} */
const mod28=v=>((v%28)+28)%28;
const pow15=Array.from({length:28},(_,i)=>{
  let x=1;for(let j=0;j<i;j++)x=x*15%29;return x;
});
assert.equal(new Set(pow15).size,28);
const log15=Array(29).fill(-1);
pow15.forEach((x,i)=>log15[x]=i);
/** @param {number[]} seed @returns {Uint8Array} */
function pad(seed){
  const a=new Uint8Array(p0.length+p1.length);
  a.set(seed);
  for(let i=3;i<a.length;i++)
    a[i]=mod29(-24*a[i-3]-16*a[i-2]-14*a[i-1]);
  return a;
}
/** @param {number[]} cipher @param {Uint8Array} key @param {number} sign @param {number} at @returns {number[]} */
function decode(cipher,key,sign,at){
  const plain=Array(cipher.length);
  plain[0]=mod29(cipher[0]+sign*key[at]);
  for(let i=1;i<plain.length;i++){
    const delta=mod29(cipher[i]-cipher[i-1]);
    plain[i]=delta===0?28:mod28(log15[delta]+sign*(key[at+i]%28));
  }
  return plain;
}
/** @param {number[]} plain @param {Uint8Array} key @param {number} sign @param {number} at @returns {number[]} */
function encode(plain,key,sign,at){
  const cipher=Array(plain.length);
  cipher[0]=mod29(plain[0]-sign*key[at]);
  for(let i=1;i<cipher.length;i++){
    cipher[i]=plain[i]===28?cipher[i-1]:
      mod29(cipher[i-1]+pow15[mod28(plain[i]-sign*(key[at+i]%28))]);
  }
  return cipher;
}
/** @param {number[]} input @returns {number} */
function score(input){
  let s=0;
  for(let i=2;i<input.length;i++)
    s+=lm[input[i-2]*841+input[i-1]*29+input[i]];
  return s/(input.length-2);
}
const candidates=[];
for(const sign of [-1,1])for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++){
  const key=pad([a,b,c]);
  candidates.push({sign,seed:[a,b,c],train:score(decode(p0,key,sign,0))});
}
assert.equal(candidates.length,48778);
candidates.sort((a,b)=>b.train-a.train);
const winner=candidates[0],key=pad(winner.seed);
assert.deepEqual(winner.seed,[4,22,9]);
assert.equal(winner.sign,-1);
assert(Math.abs(winner.train-(-3.848353029480622))<1e-12);
const withheldContinue=score(decode(p1,key,winner.sign,p0.length));
const withheldReset=score(decode(p1,key,winner.sign,0));
assert(Math.abs(withheldContinue-(-4.159985401154008))<1e-12);
assert(Math.abs(withheldReset-(-4.235243445817406))<1e-12);
const decrypted=decode(p0,key,winner.sign,0);
assert.deepEqual(encode(decrypted,key,winner.sign,0),p0);
// Match the exact original repeated-cipher positions: GP28 transparent EA.
const plant0=gp.slice(150000,150000+p0.length),plant1=gp.slice(150000+p0.length,150000+p0.length+p1.length);
for(const [plain,cipher] of [[plant0,p0],[plant1,p1]]){
  for(let i=1;i<plain.length;i++){
    if(cipher[i]===cipher[i-1])plain[i]=28;
    else if(plain[i]===28)plain[i]=18;
  }
}
const hiddenSeed=[5,8,13],hiddenKey=pad(hiddenSeed);
const cipher0=encode(plant0,hiddenKey,1,0);
const cipher1=encode(plant1,hiddenKey,1,p0.length);
assert.deepEqual(decode(cipher0,hiddenKey,1,0),plant0);
assert.deepEqual(decode(cipher1,hiddenKey,1,p0.length),plant1);
for(const [cipher,plant] of [[cipher0,p0],[cipher1,p1]]){
  assert.deepEqual(cipher.slice(1).map((v,i)=>v===cipher[i]),
    plant.slice(1).map((v,i)=>v===plant[i]));
}
const nativeScore=score(plant0);
let betterNative=0;
for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++){
  if(score(decode(cipher0,pad([a,b,c]),1,0))>nativeScore+1e-12)betterNative++;
}
assert.equal(betterNative,0);
console.log(JSON.stringify({
  source_factor:[24,16,14,1],model:"repeat-transparent GP28 successor log15",
  all_seed_sign_candidates:candidates.length,original_train_p0:p0.length,original_holdout_p1:p1.length,
  original_best:{...winner,p1_continued:withheldContinue,p1_reset:withheldReset},
  native_true_key:{seed:hiddenSeed,score_train:nativeScore,score_holdout:score(plant1),
    higher_scoring_initial_states:betterNative,exact_roundtrip:true,exact_repeat_positions:true},
  original_roundtrip:true,known_plaintext_recovered:false
},null,2));
