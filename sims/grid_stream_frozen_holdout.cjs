"use strict";
/**
 * True holdout for original LP2 red-title grid-key collision-skip Viterbi.
 * Fit all 16 modes and 8! column assignments on 8x300 original runes,
 * freeze mode, columns and decoded key-clock offsets; decode the *next*
 * 8x300 original runes with no refitting, using known-source GP trigram LM.
 *
 * Independent true-key English plant verifies the training and tail inverse.
 */
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const assert=require("node:assert/strict");
const {encode,train}=require("./grid_keyskip_viterbi.cjs");
const {originalKeys,streamKey,viterbi,solveOriginal}=require("./grid_stream_collision_viterbi.cjs");
const root=path.resolve(__dirname,".."),read=x=>fs.readFileSync(path.join(root,x),"utf8");
const ALPHABET=[..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
const NUMBER=new Map(ALPHABET.map((x,i)=>[x,i]));
const TITLE=[13,16,12,11,16,19,8,8];
const mod=x=>(x%29+29)%29;

/** @returns {number[][]} */
function completeBodies(){
  const raw=read("resources/transcriptions/liber_primus_master.txt");
  const first=raw.indexOf("ᛋᚻᛖᚩᚷ");
  const book=raw.slice(first).split("%").slice(0,56).join("%");
  const sections=book.split("$").map(t=>[...t].filter(c=>NUMBER.has(c))).filter(a=>a.length);
  assert.deepEqual(sections.map(s=>s.length),[729,1145,1729,9,1894,1021,1524,1589,3316]);
  return [0,1,2,4,5,6,7,8].map((v,i)=>sections[v].slice(TITLE[i]).map(x=>NUMBER.get(x)));
}

/** Frozen selected key clock and algorithm from the first 300 original runes. */
function frozenDecode(keys,bodies,lm){
  const first=bodies.map(x=>x.slice(0,300));
  const second=bodies.map(x=>x.slice(300,600));
  assert.ok(second.every(a=>a.length===300));
  const fitted=solveOriginal(keys,first,lm).best;
  const tail=second.map((cipher,i)=>{
    const column=fitted.columns[i];
    const pad=streamKey(keys[column],fitted,680);
    const offset=300+fitted.details[i].skipped;
    const decoded=viterbi(cipher,pad.slice(offset),fitted.sign,lm);
    return {body:i,key:column,
      prefixSkips:fitted.details[i].skipped,
      score:decoded.perRune,
      tailSkips:decoded.skips,
      prefixRune:ALPHABET[decoded.plaintext[0]],
      text:decoded.plaintext.slice(0,45).map(v=>ALPHABET[v]).join("")};
  });
  return {trainingMode:{algo:fitted.algo,reverseKey:fitted.reverseKey,
    reducer:fitted.reducer,sign:fitted.sign},
    keyAssignment:fitted.columns,trainingGPPerRune:fitted.meanLogPerRune,
    tailGPPerRune:tail.reduce((s,x)=>s+x.score,0)/tail.length,tail};
}

/** Independent planted English first 600 source runes per section. */
function planted(keys,lm){
  const source=encode(read("resources/control/shakespeare_first300k.txt").slice(205000));
  const truth=Array.from({length:8},(_,i)=>source.slice(i*600,(i+1)*600));
  const mode={algo:"aes-256-ctr",reverseKey:false,reducer:"mod29",sign:1};
  const assignment=[6,2,4,0,1,7,5,3];
  let seed=0x37aa50;
  const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296};
  const cipher=truth.map((text,i)=>{
    const pad=streamKey(keys[assignment[i]],mode,680);
    let pos=0,previous=-1;
    return text.map(p=>{
      let c=mod(p+pad[pos]);
      if(c===previous&&rnd()<.81){pos++;c=mod(p+pad[pos]);}
      pos++;previous=c;return c;
    });
  });
  const recovered=frozenDecode(keys,cipher,lm);
  let correct=0;
  for(let i=0;i<8;i++){
    const pad=streamKey(keys[assignment[i]],mode,680);
    const first=viterbi(cipher[i].slice(0,300),pad,mode.sign,lm);
    const tail=viterbi(cipher[i].slice(300,600),pad.slice(300+first.skips),mode.sign,lm);
    correct+=tail.plaintext.filter((v,j)=>v===truth[i][j+300]).length;
  }
  return {modeRecovered:recovered.trainingMode.algo===mode.algo&&
      recovered.trainingMode.reverseKey===mode.reverseKey&&
      recovered.trainingMode.reducer===mode.reducer&&
      recovered.trainingMode.sign===mode.sign,
    columnsRecovered:recovered.keyAssignment.every((v,i)=>v===assignment[i]),
    correctHeldout:correct,heldoutRunes:2400,heldoutFraction:correct/2400,
    selectionOnlyTailGP:recovered.tailGPPerRune,
    prefixGP:recovered.trainingGPPerRune};
}
function main(){
  const bodies=completeBodies(),keys=originalKeys();
  const lm=train(read("resources/control/shakespeare_first300k.txt").slice(0,200000));
  const positive=planted(keys,lm);
  assert.ok(positive.correctHeldout>=.85*2400);
  const original=frozenDecode(keys,bodies,lm);
  process.stdout.write(JSON.stringify({experiment:"Frozen 8x300 selected grid-key Viterbi generator on subsequent 8x300 original LP2 runes",
    correction:"Both original source sections and red titles, including p15 nine-rune bridge, faithfully excluded",
    heldoutOriginal:original,sourceTruePositive:positive},null,2)+"\n");
}
if(require.main===module)main();
module.exports={completeBodies,frozenDecode,planted};
