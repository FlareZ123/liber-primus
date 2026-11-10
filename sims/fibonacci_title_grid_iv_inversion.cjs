"use strict";
/**
 * Agent11: Fibonacci state seeded by first TWO authentic visible red-title
 * runes, evaluated against eight 256-bit grid columns and exact LP2 bodies.
 *
 * The red-p15/p40/p53 source triangle selects field F79, and p15's
 * 11-rune second title gives 53^11=30, a Fibonacci characteristic root.
 * For each original source-red section heading, take GP prime weights of
 * its first two runes mod79, iterate (a,b)->(b,a+b mod79), and serialize
 * sixteen consecutive a values as an AES/ChaCha nonce.
 *
 * One 16-byte nonce per heading, one unknown original grid key per section;
 * search all 8! key assignments, 16 cipher variants and hidden collision
 * key skips. Positive on authentic-register GP English, null shuffled keys.
 * No ciphertext fitting in the derivation. Node22 CommonJS, no file writes.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {redTitles,search,plant,nulls}=require("./red_title_nonce_grid_viterbi.cjs");
const {originalKeys,originalBodies}=require("./grid_stream_collision_viterbi.cjs");
const {train}=require("./grid_keyskip_viterbi.cjs");
const {fibonacciCycle}=require("./fibonacci_red_field79_inversion.cjs");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const index=new Map(corpus.runes.map((r,i)=>[r,i]));
/** @returns {{ivs:Buffer[],seedPairs:number[][],heads:string[]}} */
function derive(){
  assert.equal(fibonacciCycle().length,78);
  const heads=redTitles();
  assert.equal(heads.length,8);
  const seedPairs=heads.map(heading=>{
    const runes=[...heading];
    assert.ok(runes.length>=2);
    return [corpus.prime[index.get(runes[0])] %79,
      corpus.prime[index.get(runes[1])]%79];
  });
  const ivs=seedPairs.map(([startA,startB])=>{
    let a=startA,b=startB;
    const bytes=[];
    for(let j=0;j<16;j++){
      bytes.push(a);
      [a,b]=[b,(a+b)%79];
    }
    return Buffer.from(bytes);
  });
  return {ivs,seedPairs,heads};
}
function run(){
  const {ivs,seedPairs,heads}=derive();
  const keys=originalKeys(), bodies=originalBodies();
  const lm=train(read("resources/control/shakespeare_first300k.txt").slice(0,200000));
  assert.deepEqual(bodies.map(c=>c.length),Array(8).fill(300));
  const actual=search(keys,bodies,ivs,lm);
  const planted=plant(keys,ivs,lm);
  assert.ok(planted.correct>=2000);
  const wrongGrid=nulls(keys,bodies,ivs,lm,actual,30);
  const result={
    construction:"LP2 red heading first two GP-prime weights mod79 -> F79 Fibonacci 16 bytes -> one AES/ChaCha CTR IV per eight bodies",
    seedPairs, firstTwoRunes:heads.map(s=>[...s].slice(0,2).join("")),
    ivHex:ivs.map(b=>b.toString("hex")),
    actual,planted,wrongGrid,
    status:"Exact inversion test, no authentic plaintext accepted without coherent heldout decoded GP text and full forward replay"
  };
  process.stdout.write(JSON.stringify(result,null,2)+"\n");
  return result;
}
if(require.main===module)run();
module.exports={derive,run};
