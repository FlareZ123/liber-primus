"use strict";
/**
 * LP2 source-selected terminal pair as a two-word LP1 crib:
 * 29 distinct original LP1 phrase candidates occupying GP 3+3 runes.
 *
 * At the exact p27:28/p55:70 six-rune collision, each phrase fixes six
 * otherwise secret additive 7-key values. A seventh value is fixed solely
 * by p56:0 cipher AE and its established plaintext A, with the key
 * continuing across the p55->p56 boundary (phase 6).
 * Then score the 228+70 never-fitted GP29 positions of original p27/p55,
 * preserving their physical page-local key clock. Both signs are tested.
 *
 * SFT: node sims/lp2_p27_p55_lp1_7phase_crib_sft.cjs
 * Node 22 CommonJS, no new dependencies, no file writes.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {encodeSourceNativeGP}=require("./lp2_native_gp_source_orthography_sft.cjs");
const {buildSourceNativeTrigramModel}=require("./lp1_source_native_trigram_model.cjs");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lp1=read("resources/liber-primus/lp1-plaintext-reference.txt");
const native=buildSourceNativeTrigramModel({corpus:gp,referenceText:lp1});
const p27=gp.pages[27].indices,p55=gp.pages[55].indices,p56=gp.pages[56].indices;
const C=[23,11,1,17,18,10];
assert.deepEqual(p27.slice(28,34),C);
assert.deepEqual(p55.slice(70,76),C);
assert.equal(p56[0],25);
assert.equal(p55.length,76);
assert.equal(70%7,0);
assert.equal(28%7,0);
assert.equal(76%7,6);
const mod=x=>(x%29+29)%29;
/** @param {number[]} values */
function ioc(values){const n=Array(29).fill(0);for(const v of values)n[v]++;return n.reduce((x,k)=>x+k*(k-1),0)/(values.length*(values.length-1));}
const tokens=(lp1.replace(/^#.*$/gm,"").match(/[A-Z]+/g)||[]);
const candidates=new Map();
for(let i=0;i<tokens.length-1;i++){
 const u=encodeSourceNativeGP(tokens[i]),v=encodeSourceNativeGP(tokens[i+1]);
 if(u.length!==3||v.length!==3)continue;
 const name=tokens[i]+" "+tokens[i+1];
 const old=candidates.get(name);
 if(old)old.occurrences++;
 else candidates.set(name,{phrase:name,plain:u.concat(v),occurrences:1});
}
assert.equal(candidates.size,29);
assert.equal(candidates.get("YOU ARE").occurrences,11);
const cases=[];
for(const record of candidates.values())for(const sign of [-1,1]){
 // C=sign*P+K; the original p56:0 separately solves C=25, P=A=24.
 // k[6] is the seventh value in the unbroken p55->p56 clock.
 const key=record.plain.map((p,i)=>mod(C[i]-sign*p));
 key.push(mod(p56[0]-sign*24));
 const decode=(cipher,i)=>mod(sign*(cipher-key[i%7]));
 const full27=p27.map(decode),full55=p55.map(decode);
 assert.deepEqual(full27.slice(28,34),record.plain);
 assert.deepEqual(full55.slice(70,76),record.plain);
 assert.equal(decode(p56[0],76),24);
 const test27=[...full27.slice(0,28),...full27.slice(34)];
 const test55=full55.slice(0,70);
 const s27=native.scoreStream(test27).mean,s55=native.scoreStream(test55).mean;
 cases.push({phrase:record.phrase,attestedInLP1:record.occurrences,
   operator:sign===1?"C=P+K":"C=K-P",key,score27:s27,score55:s55,
   weightedMean:(s27*226+s55*68)/294,
   heldoutRunes:test27.length+test55.length,
   heldoutIoC:[ioc(test27),ioc(test55)],
   p27OriginalPrefix:native.spell(full27.slice(0,24)),
   p55OriginalPrefix:native.spell(full55.slice(0,24))});
}
assert.equal(cases.length,58);
cases.sort((a,b)=>b.weightedMean-a.weightedMean);
const best=cases[0];
assert.equal(best.phrase,"AND YOU");
assert.equal(best.operator,"C=K-P");
assert.ok(best.weightedMean < -3.35 && best.weightedMean > -3.40);
assert(native.p57Score > -2.5);
assert(cases.every(c=>c.heldoutRunes===298));
// Blind planted control, select an LP1-attested phrase and use its frozen
// 7-key to encrypt 234+76 source-native English runes from training.
// Deriving the six-symbol pad + known p56 A recovers both passages exactly.
const chosen=candidates.get("YOU ARE"),sign=1,key=chosen.plain.map((v,i)=>mod(C[i]-v));
key.push(1);
const sample=native.training.slice(100,100+310);
assert.equal(sample.length,310);
const encrypted27=sample.slice(0,234).map((v,i)=>mod(v+key[i%7]));
const encrypted55=sample.slice(234).map((v,i)=>mod(v+key[i%7]));
const recovered27=encrypted27.map((v,i)=>mod(v-key[i%7]));
const recovered55=encrypted55.map((v,i)=>mod(v-key[i%7]));
assert.deepEqual(recovered27,sample.slice(0,234));
assert.deepEqual(recovered55,sample.slice(234));
assert(native.scoreStream(recovered27).mean > -3.15);
console.log(JSON.stringify({
 corpus:{unknownRunes:12956,candidateGP3plus3:29,cases:58,
   sourceText:"solved LP1",exactRunicPairs:[{page:27,start:28},{page:55,start:70}],
   seventhKeySource:"p56 first ciphertext AE decrypts as A"},
 calibration:{knownLP1Score:native.trainingScore,knownP57Score:native.p57Score,
   rawP27:native.scoreStream(p27).mean,rawP55:native.scoreStream(p55).mean},
 best,topTen:cases.slice(0,10),
 mostCommonSourcePhrase:cases.filter(c=>c.phrase==="YOU ARE"),
 positivePlant:{exactRecovery:true,nativePlaintext:true,runes:310},
 decision:"None of 58 direct stationary 7-phase GP29 additive signed models decodes the 298 held-out original p27/p55 runes as LP1-register English. The solved p56 first symbol does not authenticate a shared-period key."
},null,2));
