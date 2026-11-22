"use strict";

/**
 * Source-frozen p56 literal SHA512 -> unsigned base29 -> p55 original 76
 * GP29 symbols, with at most one collision-triggered rejected key per rune.
 * This is a bounded historical source-to-adjacent-page hypothesis, not
 * an authenticated historical cipher.
 * Windows Node22 CommonJS:
 * node sims/lp2_p56_digest_base29_p55_collision_keyskip_sft.cjs
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {viterbi}=require("./grid_stream_collision_viterbi.cjs");
const {train}=require("./grid_keyskip_viterbi.cjs");
const root=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const sourceText=read("resources/liber-primus/lp1-plaintext-reference.txt");
const end=sourceText.split("### 56")[1].split("### 57")[0];
const digest=(end.slice(end.indexOf("HASHES TO")+9)
  .match(/^[a-f0-9\s]+/i)||[""])[0].replace(/\s/g,"");
assert.match(digest,/^[a-f0-9]{128}$/);
assert.equal(digest.slice(0,16),"36367763ab73783c");
assert.equal(digest.slice(-16),"9fb4f45132c2a8b4");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const p55=corpus.pages.find(p=>p.page===55).indices;
const p57=corpus.pages.find(p=>p.page===57).indices;
assert.equal(p55.length,76);
assert.equal(p57.length,95);
/** @param {bigint} n */
function base29(n){
  const digits=[];
  while(n>0n){digits.unshift(Number(n%29n));n/=29n;}
  return digits;
}
const key=base29(BigInt("0x"+digest));
assert.equal(key.length,105);
assert(key.every(x=>Number.isInteger(x)&&x>=0&&x<29));
const cap=34;
const pad=Array.from({length:p55.length+cap+1},(_,i)=>key[i%key.length]);
const model=train(read("resources/control/shakespeare_first300k.txt").slice(0,200000));
const mod=x=>(x%29+29)%29;
const render=values=>values.map(v=>corpus.translit[v]).join("");
const native=p57.slice(0,76);
/** @param {number} seed */
function xorshift(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
/** @param {number[]} plain @param {number[]} k @param {number} sign @param {()=>number} draw */
function encrypt(plain,k,sign,draw){
  let previous=-1,readIndex=0,skips=0;
  const out=[];
  for(const p of plain){
    let value=mod(p+sign*k[readIndex]);
    if(value===previous&&draw()/4294967296<.81){
      readIndex++;skips++;value=mod(p+sign*k[readIndex]);
    }
    out.push(value);previous=value;readIndex++;
  }
  return {out,skips};
}
const planted=encrypt(native,pad,1,xorshift(0x33015655));
const predicted=viterbi(planted.out,pad,1,model);
const matched=predicted.plaintext.filter((v,i)=>v===native[i]).length;
assert(matched>=70,"Planted solved-LP2 GP29 text not recovered");
assert.equal(predicted.skips,planted.skips);

const original=[-1,1].map(sign=>{
  const decoded=viterbi(p55,pad,sign,model);
  assert(decoded.skips<key.length-p55.length,
    "Frozen literal 105-digit key exhausted, forbids cyclic reuse");
  return {sign,score:decoded.perRune,skips:decoded.skips,
    text:render(decoded.plaintext)};
}).sort((a,b)=>b.score-a.score);

const REPLICATES=256,gen=xorshift(0x50565529);
function randomIndex(limit){
  const thresh=Math.floor(4294967296/limit)*limit;
  let draw;do{draw=gen()}while(draw>=thresh);return draw%limit;
}
const nulls=[];
for(let trial=0;trial<REPLICATES;trial++){
  const shuffled=key.slice();
  for(let i=shuffled.length-1;i>0;i--){
    const j=randomIndex(i+1);
    [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
  }
  const alternate=Array.from({length:pad.length},(_,i)=>shuffled[i%shuffled.length]);
  nulls.push(Math.max(...[-1,1].map(sign=>viterbi(p55,alternate,sign,model).perRune)));
}
nulls.sort((a,b)=>a-b);
const exceed=nulls.filter(x=>x>=original[0].score).length;
console.log(JSON.stringify({
  source:"authentic p56 SHA512 literal, unsigned big-endian base29 105-digit stream",
  originalTarget:"all 76 GP29 original p55 runes, phase0, both natural Vigenere signs",
  model:"one optional skipped key iff tentative ciphertext duplicates previous glyph; max34; penalty3.5",
  original,positiveControl:{nativePlanted:76,matched,actualSkips:planted.skips,inferredSkips:predicted.skips,score:predicted.perRune},
  random:{n:REPLICATES,seed:"0x50565529",exceed,empiricalUpperTail:(exceed+1)/(REPLICATES+1),median:nulls[Math.floor(REPLICATES/2)],max:nulls[REPLICATES-1]},
  caveat:"Source does not explicitly instruct use of the p56 digest as p55 key."
},null,2));
