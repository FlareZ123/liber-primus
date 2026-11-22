"use strict";
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const englishText=fs.readFileSync(path.join(root,"resources/control/shakespeare_first300k.txt"),"utf8");
const keyPath=process.argv[2]||path.join(process.cwd(),"p36_dh11_power_trace_keys.bin");
const keyBytes=fs.readFileSync(keyPath);
const key=Array.from(keyBytes);
const keySha=crypto.createHash("sha256").update(keyBytes).digest("hex");
assert.equal(key.length,12718);
assert.equal(keySha,"f1ee9989af5ee270ba3730eac4aac6540cabb1b3d52a7120d35c75911f172e4d");
assert(key.every(x=>x<29));
const pages=corpus.pages.filter(p=>p.page<=55&&p.status==="unsolved"&&p.indices.length).sort((a,b)=>a.page-b.page);
const before=pages.filter(p=>p.page<36).flatMap(p=>p.indices);
const seedPage=pages.find(p=>p.page===36);
const after=pages.filter(p=>p.page>36).flatMap(p=>p.indices);
assert.equal(seedPage.indices.length,238);
assert.equal(before.length,8706);
assert.equal(after.length,4012);
const original=[...before,...after];
assert.equal(original.length,key.length);
const gpMap=new Map(corpus.translit.map((s,i)=>[s,i]));
function gpEncode(text){
  const out=[];
  for(let word of text.toUpperCase().match(/[A-Z]+/g)||[]){
    word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
    for(let i=0;i<word.length;){
      const two=word.slice(i,i+2);
      if(gpMap.has(two)){out.push(gpMap.get(two));i+=2;}
      else{if(gpMap.has(word[i]))out.push(gpMap.get(word[i]));i++;}
    }
  }
  return out;
}
const gp=gpEncode(englishText);
assert(gp.length>162956);
const tri=new Uint32Array(29**3),bi=new Uint32Array(29**2);
for(let i=2;i<100000;i++){tri[gp[i-2]*841+gp[i-1]*29+gp[i]]++;bi[gp[i-2]*29+gp[i-1]]++;}
const lm=Float64Array.from({length:29**3},(_,i)=>Math.log((tri[i]+0.25)/(bi[Math.floor(i/29)]+7.25)));
const score=a=>{let s=0;for(let i=2;i<a.length;i++)s+=lm[a[i-2]*841+a[i-1]*29+a[i]];return s/(a.length-2);};
const ioc=a=>{const c=Array(29).fill(0);for(const x of a)c[x]++;return c.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));};
const mod=n=>((n%29)+29)%29;
const minus=original.map((c,i)=>mod(c-key[i]));
const plus=original.map((c,i)=>mod(c+key[i]));
const reference=gp.slice(150000,150000+original.length);
assert.equal(reference.length,original.length);
const planted=reference.map((p,i)=>mod(p+key[i]));
const recovered=planted.map((c,i)=>mod(c-key[i]));
assert(recovered.every((v,i)=>v===reference[i]));
const metrics={raw:score(original),subtract:score(minus),add:score(plus),nativeGP:score(reference)};
assert(Math.abs(metrics.raw-(-4.146318887503244))<1e-9);
assert(Math.abs(metrics.subtract-(-4.156198370008077))<1e-9);
assert(Math.abs(metrics.add-(-4.178054224010988))<1e-9);
assert(Math.abs(metrics.nativeGP-(-2.462214954971598))<1e-9);
assert(metrics.subtract<metrics.raw&&metrics.add<metrics.raw);
const hist=Array(29).fill(0);for(const x of key)hist[x]++;
console.log(JSON.stringify({
  classification:"Negative for p36-seeded x -> x^11 state recurrence with GF(29^238)/GF(29) relative-trace additive output; no unknown plaintext or authentic key",
  source:{field:"GF(29^238)",modulus:"unique monic degree-238 factor R238 of original 32x8 table polynomial",p36SeedRunes:238,exponent:11,update:"S[n+1]=S[n]^11",output:"Tr_GF(29^238)/GF(29)(S[n])",clock:"8706 symbols backward to p36, then 4012 forward; p36 seed page excluded"},
  key:{length:key.length,sha256:keySha,histogram,ioc:ioc(key)},
  metrics:{
    raw:{trigram:metrics.raw,ioc:ioc(original)},
    subtract:{trigram:metrics.subtract,ioc:ioc(minus)},
    add:{trigram:metrics.add,ioc:ioc(plus)},
    nativeGP:{trigram:metrics.nativeGP,ioc:ioc(reference)},
    positivePlant:{exact:recovered.every((v,i)=>v===reference[i]),trigram:score(recovered)}
  },
  recoveredUnknownPlaintext:false
},null,2));
