"use strict";
/**
 * Source-constrained OutGuess ARC4 candidate keystream under the existing
 * exact one-key-collision-rejection Viterbi cipher inverse.
 *
 * The 2016 PRNG reading is conditional. This script tests one reversible
 * candidate, not a solved LP2 key or an historically proven encryption rule.
 * Run: node sims/lp2_2016_outguess_keyskip_viterbi_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {createHash}=require("node:crypto");
const {originalBodies,viterbi}=require("./grid_stream_collision_viterbi.cjs");
const {train,encode}=require("./grid_keyskip_viterbi.cjs");

const root=path.join(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
assert.match(signed,
  /Its words are the map,\s*their\s+meaning is the road,\s*and their numbers are the direction\./i);
// The sixteen source-derived letters and thirteen-token decimal encoding
// are reconstructed independently in 2016_prng_linechar_source_gate.cjs.
const literals=["LCBPNGPARRTHBPC","7144649572585460758"];
const modes=[];
for(const role of ["Encryption","Seeding"])
  for(const password of literals)
    for(const reducer of ["mod29","scaled29"])
      for(const sign of [-1,1])
        modes.push({role,password,reducer,sign});
assert.equal(modes.length,16);

/**
 * Authentic OutGuess ARC4 cipher arc4_initkey followed by arc4_getbyte.
 * The role is included as MD5(role || password) in the original program.
 * @param {string} password
 * @param {string} role
 * @returns {()=>number}
 */
function outguessArc4(password,role) {
  const digest=createHash("md5").update(role+password,"ascii").digest();
  const s=Uint8Array.from({length:256},(_,i)=>i);
  let i=255,j=0;
  for(let k=0;k<256;k++) {
    i=(i+1)&255;
    const si=s[i];
    j=(j+si+digest[k%16])&255;
    [s[i],s[j]]=[s[j],s[i]];
  }
  return ()=>{
    i=(i+1)&255;
    const si=s[i];
    j=(j+si)&255;
    const sj=s[j];
    s[i]=sj;s[j]=si;
    return s[(si+sj)&255];
  };
}
/** @param {{role:string,password:string,reducer:string}} mode @param {number} n */
function pad(mode,n) {
  const draw=outguessArc4(mode.password,mode.role);
  const arr=[];
  for(let i=0;i<n;i++) {
    const b=draw();
    arr.push(mode.reducer==="mod29"?b%29:Math.floor(b*29/256));
  }
  return arr;
}

/** @param {number} seed */
function xorshift32(seed) {
  let x=seed>>>0;
  return ()=>{
    x^=x<<13; x^=x>>>17; x^=x<<5;
    return (x>>>0)/4294967296;
  };
}
const mod=x=>(x%29+29)%29;
/**
 * Plant an independent GP-English source through the same direct key
 * rule and a conditional single rejected draw at a previous-rune match.
 * @param {number[]} plain
 * @param {number[]} key
 * @param {number} sign
 * @param {()=>number} random
 */
function encrypt(plain,key,sign,random) {
  let prev=-1,j=0,skipped=0;
  const cipher=[];
  for(const p of plain) {
    let c=mod(p+sign*key[j]);
    if(c===prev&&random()<.81) {
      j++;
      c=mod(p+sign*key[j]);
      skipped++;
    }
    cipher.push(c);prev=c;j++;
  }
  return {cipher,skipped};
}
const text=originalBodies();
assert.deepEqual(text.map(p=>p.length),Array(8).fill(300));
const shakespeare=read("resources/control/shakespeare_first300k.txt");
const lm=train(shakespeare.slice(0,200000));
const padLen=300+34+8;
const original=[];
for(const mode of modes) {
  const key=pad(mode,padLen);
  const tests=text.map(cipher=>viterbi(cipher,key,mode.sign,lm));
  original.push({...mode,
    training:tests.filter((_,i)=>i%2===0).reduce((s,x)=>s+x.perRune,0)/4,
    heldout:tests.filter((_,i)=>i%2===1).reduce((s,x)=>s+x.perRune,0)/4,
    skips:tests.map(x=>x.skips),
    previews:tests.slice(0,2).map(x=>x.plaintext.slice(0,45).join(","))});
}
original.sort((a,b)=>b.training-a.training);
const selected=original[0];
// A genuine source-key plant uses heldout GP Shakespeare symbols.
const plain=encode(shakespeare.slice(205000));
assert.ok(plain.length>=2400);
const trueMode=modes[0]; // 'Encryption', literal GP, raw modulo29, sign -1
const truePad=pad(trueMode,padLen);
const random=xorshift32(0x3301c1ca);
const plants=[], plantRecovered=[];
for(let section=0;section<8;section++) {
  const target=plain.slice(section*300,(section+1)*300);
  const encrypted=encrypt(target,truePad,trueMode.sign,random);
  const recovered=viterbi(encrypted.cipher,truePad,trueMode.sign,lm);
  const correct=recovered.plaintext.filter((r,i)=>r===target[i]).length;
  plants.push({section,actualSkips:encrypted.skipped,
    recoveredSkips:recovered.skips,correct,total:300,
    perRune:recovered.perRune});
  plantRecovered.push(correct);
}
const plantCorrect=plantRecovered.reduce((a,b)=>a+b,0);
const plantMean=plants.reduce((a,b)=>a+b.perRune,0)/plants.length;
assert.ok(plantCorrect>=2200, "Rejection-model positive control not recovered");
assert.ok(plantMean>selected.heldout+0.6,
  "Original input unexpectedly competes with source-correct GP-English plant");

console.log(JSON.stringify({
  source:"Conditional 2016 line:character PRNG and authentic OutGuess ARC4",
  modeCount:modes.length,originalSegments:8,originalWindow:300,
  latentCollisionModel:"One optional draw rejected only if prior cipher glyph repeats; max34, skip penalty3.5",
  originalBestTraining:selected,
  originalTop5:original.slice(0,5).map(({role,password,reducer,sign,
    training,heldout,skips})=>({role,password,reducer,sign,training,heldout,skips})),
  planted:{trueMode,actualAndRecovered:plants,correct:plantCorrect,
    total:2400,meanLogPerRune:plantMean},
  verdict:"No authentic GP-English plaintext under these sixteen source-defined ARC4 collision-skip inverses."
},null,2));
