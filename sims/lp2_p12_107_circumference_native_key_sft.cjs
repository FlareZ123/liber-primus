"use strict";
/**
 * Original p12 CIRC -> 256-cell table[24] -> f-shed 107.jpg -> solved
 * LP1 page14 CIRCUMFERENCE koan. One fixed test of source-retrieved
 * whole-page/quoted-sentence repeating GP29 Vigenere on original p12,
 * and independent p13 with the identical per-page reset. Node22, CJS.
 * Numeric navigation itself is an unproven retrospective hypothesis.
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {encode,train}=require("./grid_keyskip_viterbi.cjs");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const db=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source=read("resources/liber-primus/lp1-plaintext-reference.txt");
const p14=source.split("### 14")[1].split("### 15")[0];
assert(p14.includes('"THE I IS THE VOICE OF THE CIRCUMFERENCE,"'));
const keys=[
 {name:"full LP1 107.jpg p14",indices:encode(p14)},
 {name:"107.jpg original quoted CIRCUMFERENCE koan line",
  indices:encode("THE I IS THE VOICE OF THE CIRCUMFERENCE")}
];
assert(keys[0].indices.length>200);
assert(keys[1].indices.length>20);
const grid=JSON.parse(read("resources/liber-primus/base60-grid.json"));
const alpha=[...grid.alphabet].filter(x=>x!=="f");
const token=grid.rows.flat()[24];
const byte=alpha.indexOf(token[0])*59+alpha.indexOf(token[1]);
assert.equal(byte,107);
assert.equal(db.pages.find(p=>p.page===12).indices.slice(0,4).reduce((a,b)=>a+b,0),24);
const historical=read("resources/external/2014-stage10-post-square-response.html");
assert(historical.includes('src="/107.jpg"'));
const model=train(read("resources/control/shakespeare_first300k.txt"));
const mod=x=>(x%29+29)%29;
const ioc=a=>{
 const n=Array(29).fill(0);for(const x of a)n[x]++;
 return n.reduce((s,v)=>s+v*(v-1),0)/(a.length*(a.length-1));
};
const score=a=>{
 let q=0;for(let i=2;i<a.length;i++)q+=model.trigram[(a[i-2]*29+a[i-1])*29+a[i]];
 return q/(a.length-2);
};
const inverse=(cipher,key,sign)=>cipher.map((c,i)=>mod(c+sign*key[i%key.length]));
const forward=(plain,key,sign)=>plain.map((p,i)=>mod(p-sign*key[i%key.length]));
const targetPages=[12,13];
const outputs=[];
for(const {name,indices:key} of keys){
 for(const sign of [-1,1])for(const pageNum of targetPages){
  const cipher=db.pages.find(p=>p.page===pageNum).indices;
  assert(cipher.length>75);
  const plaintext=inverse(cipher,key,sign);
  assert.deepEqual(forward(plaintext,key,sign),cipher);
  const plant=encode(p14.repeat(5)).slice(0,cipher.length);
  assert.equal(plant.length,cipher.length);
  assert.deepEqual(inverse(forward(plant,key,sign),key,sign),plant);
  outputs.push({source:name,sign,page:pageNum,length:cipher.length,
   originalIOC:ioc(cipher),decodedIOC:ioc(plaintext),
   decodedEnglishTrigram:score(plaintext),
   first70:plaintext.slice(0,70).map(i=>db.translit[i]).join("")});
 }
}
console.log(JSON.stringify({
 source:"original p12 text, stage10 107.jpg list, already-solved original LP1 p14",
 fixedReceiver:"p12 and untouched p13 with page-local repeating-key reset",
 tested:"2 independently written source-registers x 2 Vigenere signs; all exact forward replays and native positive plants",
 keys:keys.map(k=>({name:k.name,length:k.indices.length})),
 outputs,
 status:"Interpret directly; require readable original plaintext and holdout before any route is accepted."
},null,2));
