"use strict";
/**
 * Source-locked 13-dot/red-event walk with skip-aware GP29 decoding.
 *
 * Original source: 225 red runes + 31 13-dot marks, chronological order,
 * updated state=(state+event-13) mod256. Every event gives the pre/post
 * table lookup index for the original 32x8 256-byte table. All 256 source
 * events close the walk at zero, so these keys have period 256.
 *
 * The cipher model is deliberately finite and falsifiable: additive
 * GP29 with a hidden same-plaintext repeated-output rejection, as
 * implemented independently by Agent 20's pgp_modulus_skip_hmm.cjs.
 * The native-GP plant is never part of the decoder's LM training.
 *
 * Run: node sims/red_13x256_skip_hmm.cjs (Node.js 22)
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {decode,encryptSoft}=require("./pgp_modulus_skip_hmm.cjs");
const root=path.join(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const ink=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-ink-annotations.json"),"utf8"));
const grid=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-grid-256.json"),"utf8"));
const gp=new Map(corpus.runes.map((r,i)=>[r,i]));
const bytes=grid.pages.flatMap(p=>p.bytes);
assert.equal(bytes.length,256);
const events=[];
for(const p of ink.pages){
  for(const s of p.red_spans||[]){
    for(let j=0;j<s.length;j++){
      const rune=Array.from(s.runes)[j];
      const value=gp.get(rune);
      assert.notEqual(value,undefined);
      events.push({page:p.page,offset:s.start+j,mark:false,value:value+1});
    }
  }
  for(const [offset,dots] of p.large_punctuation||[]){
    if(dots===13)events.push({page:p.page,offset,mark:true,value:0});
  }
}
events.sort((a,b)=>a.page-b.page||a.offset-b.offset||Number(b.mark)-Number(a.mark));
assert.equal(events.filter(e=>e.mark).length,31);
assert.equal(events.length,256);
let state=0;
const pre=[],post=[];
for(const e of events){
  pre.push(state);
  state=(state+e.value-13+256)%256;
  post.push(state);
}
assert.equal(state,0);
assert.equal(new Set(pre).size,97);
const SIZE=2048, WIDTH=384;
const cipher=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices).slice(0,SIZE);
assert.equal(cipher.length,SIZE);
// Independent native GP plant uses the exact encoding convention of the
// reference skip decoder; its trigram model trains after native offset22000.
const txt=fs.readFileSync(path.join(root,"resources/control/shakespeare_first300k.txt"),"utf8");
const alphabet=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
const native=[];
for(let word of (txt.toUpperCase().match(/[A-Z]+/g)||[])){
  word=word.replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");
  const vals=[];
  for(let j=0;j<word.length;){
    const tok=alphabet.find(t=>word.startsWith(t.s,j));
    if(!tok){vals.length=0;break;}
    vals.push(tok.i);j+=tok.s.length;
  }
  native.push(...vals);
}
const clear=native.slice(3000,3000+SIZE);
assert.equal(clear.length,SIZE);
const mod=x=>(x%29+29)%29;
/** @param {number[]} states @param {number} offset */
function pad(states,offset=0){
  return Array.from({length:SIZE+1024},(_,i)=>mod(bytes[states[(i+offset)%256]]));
}
const outcomes=[];
for(const [name,states] of [["pre",pre],["post",post]]){
  const sourcePad=pad(states);
  for(const sign of [1,-1]){
    const original=decode(cipher,sourcePad,sign,WIDTH);
    outcomes.push({name,sign,score:original.meanScore,
      inferredSkips:original.skips,clock:original.finalClock,
      first72:original.prefix});
  }
}
const sourcePad=pad(pre);
const positive=encryptSoft(clear,sourcePad,1);
const recovered=decode(positive.ciphertext,sourcePad,1,WIDTH);
const wrongGridPad=Array.from({length:SIZE+1024},(_,i)=>
  mod(bytes[255-pre[i%256]]));
const wrong=decode(positive.ciphertext,wrongGridPad,1,WIDTH);
const correct=recovered.decoded.filter((x,i)=>x===clear[i]).length;
const wrongCorrect=wrong.decoded.filter((x,i)=>x===clear[i]).length;
assert.ok(correct>0.9*SIZE,"True-source planted decoder failed calibration");
const result={sourceEvents:events.length,sourceRedRunes:events.filter(e=>!e.mark).length,
  sourceMarks:31,visitedStates:new Set(pre).size,terminalState:state,
  padPeriod:256,padByteReducer:"base60 byte mod 29",
  model:"GP29 additive, same-plaintext soft repeated-output rejection",
  originalWindow:[0,SIZE],beamWidth:WIDTH,
  sourceNativeControl:{length:SIZE,actualRejected:positive.rejected,
    actualClock:positive.drawn,inferredSkipped:recovered.skips,
    matchedGP:correct,wrongGridMatchedGP:wrongCorrect,
    trueScore:recovered.meanScore,wrongGridScore:wrong.meanScore},
  original:outcomes};
console.log(JSON.stringify(result,null,2));
