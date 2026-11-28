"use strict";
/**
 * SFT for the p50 literal-zero / adjacent-equality state association.
 *
 * Tests only source-visible choices:
 * - the printed 32x8 row-major p49-p51 table,
 * - literal character "0" in each two-character cell,
 * - the continuous p0-p55 rune clock,
 * - adjacent equal ciphertext runes.
 *
 * It also tests the literal table bytes as direct periodic keys in the two
 * already-calibrated Round48 hidden-output receivers. This is a bounded
 * receiver test, not a claim that either channel is authentic.
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/base60-grid.json"));
const toks=grid.rows.flat();
const bytes=grid.byte_rows.flat();
assert.equal(toks.length,256);
assert.equal(bytes.length,256);

const pages=corpus.pages.filter(p=>p.status==="unsolved"&&p.page<=55&&p.runic_count);
const tape=pages.flatMap(p=>p.indices);
assert.equal(tape.length,12956);
const seams=new Set();
let offset=0;
for(const p of pages){
  offset+=p.indices.length;
  if(offset<tape.length)seams.add(offset-1);
}
const events=[];
const opportunities=[];
for(let i=0;i<tape.length-1;i++){
  if(seams.has(i))continue;
  opportunities.push(i);
  if(tape[i]===tape[i+1])events.push(i);
}
assert.equal(opportunities.length,12901);
assert.equal(events.length,86);

/** @param {string} t */
const zeroCount=t=>Number(t[0]==="0")+Number(t[1]==="0");

/**
 * @param {(i:number,phase:number)=>number} map
 */
function phaseStats(map){
  const rows=[];
  for(let phase=0;phase<256;phase++){
    let first0=0,score=0;
    for(const i of events){
      const t=toks[map(i,phase)];
      first0+=Number(t[0]==="0");
      score+=zeroCount(t);
    }
    rows.push({phase,first0,score});
  }
  const source=rows[0];
  return {
    source,
    first0RankGE:rows.filter(x=>x.first0>=source.first0).length,
    first0Max:Math.max(...rows.map(x=>x.first0)),
    scoreRankGE:rows.filter(x=>x.score>=source.score).length,
    scoreMax:Math.max(...rows.map(x=>x.score))
  };
}

const leftForward=phaseStats((i,p)=>(i+p)&255);
const rightForward=phaseStats((i,p)=>(i+1+p)&255);
const fullReverse=phaseStats((i,p)=>255-((i+p)&255));
const horizontalReflection=phaseStats((i,p)=>{
  const j=(i+p)&255;
  return Math.floor(j/8)*8+(7-j%8);
});
assert.deepEqual(leftForward.source,{phase:0,first0:33,score:39});
assert.equal(leftForward.first0RankGE,1);
assert.equal(leftForward.scoreRankGE,1);
assert.equal(rightForward.source.first0,15);
assert.equal(rightForward.first0RankGE,229);
assert.equal(fullReverse.source.first0,24);
assert.equal(horizontalReflection.source.first0,24);

/** @param {number[]} lengths */
function resetSites(lengths){
  const out=[];
  let global=0;
  for(const L of lengths){
    for(let local=0;local<L-1;local++){
      if(tape[global+local]===tape[global+local+1])out.push(local);
    }
    global+=L;
  }
  assert.equal(global,tape.length);
  assert.equal(out.length,86);
  return out;
}
/** @param {number[]} sites */
function resetPhaseStats(sites){
  const rows=[];
  for(let phase=0;phase<256;phase++){
    let first0=0,score=0;
    for(const i of sites){
      const t=toks[(i+phase)&255];
      first0+=Number(t[0]==="0");
      score+=zeroCount(t);
    }
    rows.push({phase,first0,score});
  }
  const source=rows[0];
  return {
    source,
    first0RankGE:rows.filter(x=>x.first0>=source.first0).length,
    scoreRankGE:rows.filter(x=>x.score>=source.score).length
  };
}
const pageReset=resetPhaseStats(resetSites(pages.map(p=>p.indices.length)));
const sectionLengths=[729,1145,1738,1894,1021,1433,1680,3316];
const sectionReset=resetPhaseStats(resetSites(sectionLengths));
assert.equal(pageReset.source.first0,19);
assert.equal(pageReset.first0RankGE,168);
assert.equal(sectionReset.source.first0,19);
assert.equal(sectionReset.first0RankGE,166);

const strataOpp=[0,0,0],strataHit=[0,0,0];
for(const i of opportunities)strataOpp[zeroCount(toks[i&255])]++;
for(const i of events)strataHit[zeroCount(toks[i&255])]++;
assert.deepEqual(strataOpp,[9725,3076,100]);
assert.deepEqual(strataHit,[52,29,5]);

// Exact random-60-cell comparator: choose any 60 of the 256 table cells,
// preserving only mask cardinality, and count repeat events on chosen residues.
const residueHits=Array(256).fill(0);
for(const i of events)residueHits[i&255]++;
const K=60,MAX=events.length;
let dp=Array.from({length:K+1},()=>Array(MAX+1).fill(0n));
dp[0][0]=1n;
let used=0;
for(const e of residueHits){
  used++;
  for(let k=Math.min(K,used);k>=1;k--){
    for(let s=MAX;s>=e;s--)dp[k][s]+=dp[k-1][s-e];
  }
}
let numerator=0n,denominator=0n;
for(let s=0;s<=MAX;s++){
  denominator+=dp[K][s];
  if(s>=33)numerator+=dp[K][s];
}
const random60Tail=Number(numerator)/Number(denominator);
assert(Math.abs(random60Tail-0.004441863493238786)<1e-15);

const raw={
  gp:read("resources/liber-primus/lp2-corpus.json"),
  shakespeare:read("resources/control/shakespeare_first300k.txt"),
  gibran:read("resources/control/gibran_prophet_58585.txt"),
  emerson:read("resources/control/emerson_essays_2944.txt")
};
const C=tape.slice(0,1200);
const reflected=grid.byte_rows.flatMap(row=>[...row].reverse());
const repeatKey=(base,modulus)=>Array.from({length:C.length*3},(_,i)=>base[i%256]%modulus);
const silent=require("./lp2_alt36_silent_exact_latent_viterbi_sft.cjs").experiment;
const deletion=require("./lp2_alt29_delete_exact_latent_viterbi_sft.cjs").experiment;

const silentRow=silent(raw,{beam:140,maxHidden:3,
  decodeInput:{cipher:C,key:repeatKey(bytes,36)}});
const silentReflect=silent(raw,{beam:140,maxHidden:3,
  decodeInput:{cipher:C,key:repeatKey(reflected,36)}});
const deleteRow=deletion(raw,{beam:140,maxDeleted:3,
  decodeInput:{cipher:C,key:repeatKey(bytes,29)}});
const deleteReflect=deletion(raw,{beam:140,maxDeleted:3,
  decodeInput:{cipher:C,key:repeatKey(reflected,29)}});

assert(silentRow.score<-4.8);
assert(silentReflect.score<-4.8);
assert(deleteRow.score<-3.9);
assert(deleteReflect.score<-3.9);

console.log(JSON.stringify({
  events:events.length,
  sourceClock:{
    leftForward,
    rightForward,
    fullReverse,
    horizontalReflection,
    pageReset,
    sectionReset
  },
  literalZeroDose:{
    opportunities:strataOpp,
    repeatHits:strataHit,
    rates:strataHit.map((x,i)=>x/strataOpp[i])
  },
  exactRandom60CellTailGE33:random60Tail,
  directPeriodicKeyReceivers:{
    silent36:{rowMajor:silentRow.score,horizontalReflection:silentReflect.score},
    delete29:{rowMajor:deleteRow.score,horizontalReflection:deleteReflect.score}
  },
  decision:"p50 zero-state association selects a forward continuous left-endpoint clock; literal p50 bytes are not the direct periodic key for either calibrated hidden-output receiver"
},null,2));
