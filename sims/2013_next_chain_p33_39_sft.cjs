"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const json=f=>JSON.parse(fs.readFileSync(path.join(root,f),"utf8"));
const text=f=>fs.readFileSync(path.join(root,f),"utf8");
const corpus=json("resources/liber-primus/lp2-corpus.json");
const trans=corpus.translit, runeIndex=new Map(trans.map((t,i)=>[t,i]));
const signed=text("resources/external/2013-do-not-share-this-information-2.asc");
const match=signed.match(/^-----BEGIN PGP SIGNED MESSAGE-----\r?\nHash: SHA1\r?\n\r?\n([\s\S]*?)\r?\n-----BEGIN PGP SIGNATURE-----/);
assert(match,"signed-message body boundary");
function gpSource(s){
  const out=[];
  const normalized=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
  for(const word of normalized.match(/[A-Z]+/g)||[]){
    for(let i=0;i<word.length;){
      let found=false;
      for(const n of [3,2,1]){
        const token=word.slice(i,i+n);
        if(runeIndex.has(token)){out.push(runeIndex.get(token));i+=n;found=true;break;}
      }
      assert(found,"unmapped signed-source token "+word.slice(i));
    }
  }
  return out;
}
const rawKey=gpSource(match[1]);
const filtered=rawKey.filter(x=>x!==0); // known LP1 F-interrupt convention, applied as a hypothesis to the key source
const iv=filtered[0];
const stepSymbols=filtered.slice(1);
const directKey=stepSymbols.map(x=>x-1); // GP symbols 1..28 -> Z28
const primes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const phiPrimeKey=stepSymbols.map(x=>(primes[x]-1)%28);
const cipher=corpus.pages.filter(p=>p.page>=33&&p.page<=39).flatMap(p=>p.indices);
const mod=(x,n)=>(x%n+n)%n;
function pow(a,e,p){let r=1;while(e){if(e&1)r=r*a%p;a=a*a%p;e>>=1;}return r;}
const log2=Array(29).fill(-1);
for(let e=0;e<28;e++)log2[pow(2,e,29)]=e;
const sigmaFamilies=[
  {name:"identity",inverse:x=>x,forward:x=>x},
  {name:"DH2-power-order",inverse:x=>log2[x+1],forward:x=>pow(2,x,29)-1},
  {name:"DH2-log-order",inverse:x=>pow(2,x,29)-1,forward:x=>log2[x+1]}
];
const keyFamilies=[
  {name:"GP-index-minus-one",values:directKey,sigmas:sigmaFamilies},
  {name:"totient-of-GP-prime-mod28",values:phiPrimeKey,sigmas:[sigmaFamilies[0]]}
];
function decode(input,iv,key,sigma,sign,skipZero){
  let previous=iv,position=0,zeroSteps=0;
  const plain=[];
  for(const current of input){
    const delta=mod(current-previous,29);
    previous=current;
    if(delta===0){plain.push(28);zeroSteps++;if(!skipZero)position++;}
    else{const q=mod(delta-1+sign*key[position],28);plain.push(sigma.inverse(q));position++;}
  }
  return {plain,used:position,zeroSteps};
}
function encode(plain,iv,key,sigma,sign,skipZero){
  let previous=iv,position=0;
  const cipherOut=[];
  for(const p of plain){
    const delta=p===28?0:1+mod(sigma.forward(p)-sign*key[position],28);
    const current=mod(previous+delta,29);
    cipherOut.push(current);previous=current;
    if(p!==28||!skipZero)position++;
  }
  return cipherOut;
}
function gpEnglish(s){
  const out=[],map=new Map(trans.map((t,i)=>[t,i]));map.set("ING",21);
  const normalized=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
  for(const word of normalized.match(/[A-Z]+/g)||[]){
    for(let i=0;i<word.length;){
      let found=false;
      for(const n of [3,2,1]){
        const token=word.slice(i,i+n);
        if(map.has(token)){out.push(map.get(token));i+=n;found=true;break;}
      }
      assert(found,"unmapped control token "+word.slice(i));
    }
  }
  return out;
}
const emerson=gpEnglish(text("resources/control/emerson_essays_2944.txt")).slice(0,50000);
const gibran=gpEnglish(text("resources/control/gibran_prophet_58585.txt"));
const trigramCounts=new Uint32Array(29**3);
for(let i=2;i<emerson.length;i++)trigramCounts[emerson[i-2]*841+emerson[i-1]*29+emerson[i]]++;
const denominator=emerson.length-2+trigramCounts.length*.2;
function score(values){
  let total=0;
  for(let i=2;i<values.length;i++){
    const n=values[i-2]*841+values[i-1]*29+values[i];
    total+=Math.log((trigramCounts[n]+.2)/denominator);
  }
  return total/(values.length-2);
}
function ioc(values){
  const counts=Array(29).fill(0);for(const x of values)counts[x]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}
const holdout=[];
for(let i=0;i+1680<=gibran.length;i+=29)holdout.push(score(gibran.slice(i,i+1680)));
holdout.sort((a,b)=>a-b);
assert.equal(rawKey.length,1710);
assert.equal(rawKey.filter(x=>x===0).length,29);
assert.equal(filtered.length,1681);
assert.equal(iv,23);
assert.equal(stepSymbols.length,1680);
assert(stepSymbols.every(x=>x>=1&&x<=28));
assert.equal(cipher.length,1680);
assert.equal(cipher[0],iv); // first key rune D equals first p33 ciphertext rune D
assert.equal(cipher.slice(1).reduce((n,x,i)=>n+(mod(x-cipher[i],29)===0),0),12);
assert.equal(holdout.length,2105);
const models=[];
for(const keyFamily of keyFamilies){
  for(const sigma of keyFamily.sigmas){
    for(const sign of [-1,1]){
      for(const skipZero of [false,true]){
        const result=decode(cipher,iv,keyFamily.values,sigma,sign,skipZero);
        assert.deepEqual(encode(result.plain,iv,keyFamily.values,sigma,sign,skipZero),cipher);
        const plant=gibran.slice(1024,2704);
        assert.equal(plant.length,1680);
        const plantCipher=encode(plant,iv,keyFamily.values,sigma,sign,skipZero);
        assert.deepEqual(decode(plantCipher,iv,keyFamily.values,sigma,sign,skipZero).plain,plant);
        models.push({
          keyMap:keyFamily.name,sigma:sigma.name,sign,skipZero,
          zeroSteps:result.zeroSteps,keysUsed:result.used,
          distinctKeyValues:new Set(keyFamily.values).size,
          ioc:ioc(result.plain),trigram:score(result.plain),
          preview:result.plain.slice(0,48).map(x=>trans[x]).join(" ")
        });
      }
    }
  }
}
models.sort((a,b)=>b.trigram-a.trigram);
assert.equal(models.length,16);
assert(models.every(m=>m.trigram<holdout[0]));
assert(Math.abs(models[0].trigram-(-11.742672405599778))<1e-9);
console.log(JSON.stringify({
  classification:"bounded negative; no p33-39 plaintext or authentic key",
  source:{
    artifact:"resources/external/2013-do-not-share-this-information-2.asc",
    sourceSHA256:"062886c6063b5c9c3049cf67dd9837df75bdd54d8fa73cb1b5fe25d52d227e87",
    canonicalGPTokenCount:rawKey.length,FInterrupts:29,afterFInterrupts:filtered.length,
    IV:iv,IVRune:trans[iv],stepKeyLength:directKey.length,stepKeyRange:[Math.min(...directKey),Math.max(...directKey)],
    stepKeyEACount:stepSymbols.filter(x=>x===28).length
  },
  target:{
    pages:"33-39",runes:cipher.length,firstCipherRune:trans[cipher[0]],
    IVMatchesFirstCipherRune:true,internalZeroSteps:12
  },
  model:{
    hypothesis:"C_i=C_(i-1)+d_i mod29; d_i=0 => EA; otherwise d_i=1+((sigma(P_i)+K_i) mod28)",
    keyAlignment:"first non-F NEXT rune is IV; remaining 1680 non-F runes are per-rune step keys",
    keyMaps:["GP index minus one","totient(GP prime) modulo 28"],
    symbolOrders:["identity","DH shared-key-2 power order","inverse DH shared-key-2 order"],
    signs:[-1,1],zeroStepKeyConsumption:[true,false],models:models.length
  },
  raw:{ioc:ioc(cipher),trigram:score(cipher)},
  bestCandidates:models.slice(0,6),
  nativeGibranHoldout:{windows:holdout.length,length:1680,stride:29,worst:holdout[0],q10:holdout[Math.floor(holdout.length*.1)],median:holdout[Math.floor(holdout.length/2)],q90:holdout[Math.floor(holdout.length*.9)]},
  candidatesEnteringNativeRange:models.filter(m=>m.trigram>=holdout[0]).length,
  positiveControl:"All 16 variants re-encrypt the original exactly and recover a 1680-rune native-GP plant exactly.",
  conclusion:"The exact F-interrupted NEXT 1+1680 alignment and DH2/totient variants do not decrypt p33-39. Do not extend this family without a new source selector."
},null,2));
