"use strict";
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const source = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const N = 29, mod = n => ((n % N) + N) % N;
function inv(a) { for (let x=1;x<N;x++) if (mod(a*x)===1) return x; throw Error("no inverse"); }
function primeList(count) {
  const out=[];
  for(let n=2;out.length<count;n++){
    let prime=true;
    for(let d=2;d*d<=n;d++) if(n%d===0){prime=false;break;}
    if(prime) out.push(n);
  }
  return out;
}
const primes=primeList(1000), keys=primes.map(p=>mod(p-1));
const p29=source.pages.find(p=>p.page===29).indices, G=[15,5,27];
assert.equal(p29.length,277);
const remainder=p29.slice(), quotient=Array(p29.length-2).fill(0), leadingInverse=inv(G[0]);
for(let i=0;i<quotient.length;i++){
  const coefficient=mod(remainder[i]*leadingInverse);
  quotient[i]=coefficient;
  for(let j=0;j<3;j++) remainder[i+j]=mod(remainder[i+j]-coefficient*G[j]);
}
assert.deepEqual(remainder.slice(-2),[0,0]);
assert.equal(quotient.length,275);
assert.equal(quotient.filter(x=>x===0).length,11);
function decode(cipher,startCursor){
  let states=new Map([[startCursor,[[]]]]);
  for(let offset=0;offset<cipher.length;offset++){
    const c=cipher[offset],next=new Map();
    const add=(cursor,path)=>{if(!next.has(cursor))next.set(cursor,[]);next.get(cursor).push(path);};
    for(const [cursor,paths] of states){
      const key=keys[cursor];
      for(const path of paths){
        if(c===0)add(cursor,[...path,0]);
        const p=mod(c-key);
        if(p!==0)add(cursor+1,[...path,p]);
      }
    }
    if(next.size===0)return {
      failure:{offset,ciphertext:c,priorStates:[...states.entries()].map(([cursor,paths])=>({
        cursor,pathCount:paths.length,nextPrime:primes[cursor],
        totientMod29:keys[cursor],forbiddenPlaintext:mod(c-keys[cursor])
      }))},
      paths:[]
    };
    states=next;
  }
  return {failure:null,paths:[...states.entries()].flatMap(([cursor,paths])=>paths.map(plaintext=>({cursor,plaintext})))};
}
function encrypt(plain,startCursor){
  let cursor=startCursor;const out=[];
  for(const p of plain){if(p===0)out.push(0);else{out.push(mod(p+keys[cursor]));cursor++;}}
  return out;
}
const GP=new Map(source.translit.map((label,index)=>[label,index]));GP.set("ING",21);
function encodeEnglish(english){
  return (english.toUpperCase().match(/[A-Z]+/g)||[]).map(token=>{
    const w=token.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
    const out=[];
    for(let i=0;i<w.length;){
      let found=false;
      for(const size of [3,2,1]){
        const part=w.slice(i,i+size);
        if(part.length===size&&GP.has(part)){out.push(GP.get(part));i+=size;found=true;break;}
      }
      assert.ok(found,"unknown GP phoneme at "+token+":"+i);
    }
    return out;
  }).flat();
}
const includes=(result,known)=>result.paths.some(p=>JSON.stringify(p.plaintext)===JSON.stringify(known));
const p56Cipher=source.pages.find(p=>p.page===56).indices;
const p56Plain=encodeEnglish("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE");
assert.equal(p56Cipher.length,85);assert.equal(p56Plain.length,85);
assert.deepEqual(p56Plain.flatMap((v,i)=>v===0?[i]:[]),[56]);
const p56Control=decode(p56Cipher,0);
assert.equal(p56Control.failure,null);assert.equal(p56Control.paths.length,22);assert.ok(includes(p56Control,p56Plain));
const p57=source.pages.find(p=>p.page===57).indices;
const plant=Array.from({length:275},(_,i)=>p57[i%p57.length]);
const plants=[0,2].map(startCursor=>{
  const decoded=decode(encrypt(plant,startCursor),startCursor);
  assert.equal(decoded.failure,null);assert.ok(includes(decoded,plant));
  return {startCursor,legalPaths:decoded.paths.length,knownPlaintextIncluded:true};
});
const original=[0,2].map(startCursor=>{
  const result=decode(quotient,startCursor);
  assert.ok(result.failure,"original quotient unexpectedly has a legal decode");
  return {startCursor,failure:result.failure};
});
assert.equal(original[0].failure.offset,82);assert.equal(original[0].failure.ciphertext,23);
assert.deepEqual(original[0].failure.priorStates,[{cursor:78,pathCount:4,nextPrime:401,totientMod29:23,forbiddenPlaintext:0}]);
assert.equal(original[1].failure.offset,0);assert.equal(original[1].failure.ciphertext,4);
assert.deepEqual(original[1].failure.priorStates,[{cursor:2,pathCount:1,nextPrime:5,totientMod29:4,forbiddenPlaintext:0}]);
function ioc(a){const h=Array(N).fill(0);for(const x of a)h[x]++;return h.reduce((s,v)=>s+v*(v-1),0)/(a.length*(a.length-1));}
console.log(JSON.stringify({
  model:"p56 prime-totient/F-transparent inverse on original p29 G quotient",
  divisorHighFirst:G,p29CoefficientCount:p29.length,quotientLength:quotient.length,
  quotientRemainder:remainder.slice(-2),quotientFCount:quotient.filter(x=>x===0).length,
  quotientIoC:ioc(quotient),quotientIndexSHA256:crypto.createHash("sha256").update(Buffer.from(quotient)).digest("hex"),
  authenticP56Control:{cipherRunes:p56Cipher.length,plainRunes:p56Plain.length,literalFPositions:[56],legalPaths:p56Control.paths.length,knownPlaintextIncluded:true},
  p57NativePlants:plants,originalQuotientResults:original,
  verdict:"No admissible p56 prime-totient/F-bypass decoding for K=2 interpreted as prime start 2 or prime cursor index 2."
},null,2));
