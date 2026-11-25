// Agent50 #2666: full source-ranked glibc 2.15 TYPE_3 keyskip1 gate.
// Uses the frozen decoder and exact corpus/seed snapshots. Skip counts are
// descriptive only: the L2 winning-path count is language-conditioned.
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const gate = require("./lp2_glibc215_pgp_keyskip1_sft.cjs");
const read = p => fs.readFileSync(path.resolve(__dirname, "..", p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const seeds = JSON.parse(read("im-results/agent50-2667-pgp-seeds.json")).candidates;
const gibran = read("resources/control/gibran_prophet_58585.txt");
const emerson = read("resources/control/emerson_essays_2944.txt");
const shakespeare = read("resources/control/shakespeare_first300k.txt");
const L = gate.model([
  gate.convert(gibran, corpus.translit),
  gate.convert(emerson, corpus.translit)
]);
const C = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
if (C.length !== 12956 || C.slice(1).filter((x,i) => x === C[i]).length !== 86)
  throw new Error("canonical original ciphertext invariant failed");
if (seeds.length !== 433 || new Set(seeds.map(x => x.seed >>> 0)).size !== 433)
  throw new Error("source-ranked low32 seed inventory changed");

function stats(rows, field) {
  const a = rows.map(x => x[field]).filter(Number.isFinite).sort((x,y)=>x-y);
  const n = a.length, mean = a.reduce((s,x)=>s+x,0)/n;
  const sd = Math.sqrt(a.reduce((s,x)=>s+(x-mean)**2,0)/n);
  const q = p => a[Math.min(n-1,Math.max(0,Math.ceil(p*n)-1))];
  return {n,mean,sd,min:a[0],q50:q(.5),q95:q(.95),q99:q(.99),max:a[n-1]};
}
function top(rows, field, n=12) {
  return rows.slice().sort((a,b)=>b[field]-a[field]).slice(0,n).map(x=>({
    rank:x.rank,seed:x.seed,seed32:x.seed32,score:x.score,
    prefixScore:x.prefixScore,holdScore:x.holdScore,
    skips:x.skips,prefixSkips:x.prefixSkips
  }));
}
function decodeControl(P, keySeed, coinSeed, hold) {
  const K = gate.key(keySeed, P.length*2+16);
  const enc = gate.plant(P,K,coinSeed);
  const d = gate.beam(enc.C,K,L,{width:64,trace:true,hold});
  const split = P.length-hold;
  let exact=0,prefixExact=0,holdExact=0;
  for(let i=0;i<P.length;i++) {
    if(d.P[i]===P[i]) exact++;
    if(i<split && d.P[i]===P[i]) prefixExact++;
    if(i>=split && d.P[i]===P[i]) holdExact++;
  }
  return {
    n:P.length,hold,split,keySeed,coinSeed,trueSkips:enc.sk,
    decodedSkips:d.skips,exact,prefixExact,holdExact,
    score:d.score,prefixScore:d.prefixScore,holdScore:d.holdScore
  };
}
function nativeControlSet() {
  const p56=corpus.pages.find(p=>p.page===56).indices;
  const p57=corpus.pages.find(p=>p.page===57).indices;
  const seeds=[0x10203040,0x23456789,0x34567890,0x45678901,
               0x56789012,0x67890123,0x78901234,0x089abcde];
  const short=[];
  for(let i=0;i<seeds.length;i++) {
    short.push({page:56,...decodeControl(p56,seeds[i],(0x31415926+i*7919)>>>0,20)});
    short.push({page:57,...decodeControl(p57,seeds[i],(0x27182818+i*104729)>>>0,20)});
  }
  const base=p56.concat(p57);
  const repeated=Array.from({length:12956},(_,i)=>base[i%base.length]);
  const long=decodeControl(repeated,0x13579bdf,0x2468ace0,512);
  return {
    p56Length:p56.length,p57Length:p57.length,
    shortPasses:short.filter(x=>x.exact===x.n).length,
    shortTotal:short.length,short,
    repeatedNativeLong:long,
    repeatedSource:"p56||p57 repeated to 12,956 runes; synthetic calibration only"
  };
}
const native = nativeControlSet();
const Psh = gate.convert(shakespeare,corpus.translit).slice(0,12956);
const Ksh = gate.key(0x12345678,12956*2+16);
const Esh = gate.plant(Psh,Ksh,0x31415926);
const Dsh = gate.beam(Esh.C,Ksh,L,{width:64,trace:true,hold:512});
const shakespeareControl = {
  n:Psh.length,trueSkips:Esh.sk,decodedSkips:Dsh.skips,
  exact:Dsh.P.reduce((s,x,i)=>s+(x===Psh[i]),0),
  holdoutExact:Dsh.P.slice(-512).reduce((s,x,i)=>s+(x===Psh[12956-512+i]),0),
  score:Dsh.score,prefixScore:Dsh.prefixScore,holdScore:Dsh.holdScore
};

// One frozen continuous offset-zero, +GP29, unbiased-reduction, max-one-skip
// decoder. The final 512 ciphertext runes are not used to select the path.
const candidates = gate.run(corpus,gibran,emerson,shakespeare,seeds,{
  group:"candidates",start:0,end:433,width:64,trace:false
});
const nulls = gate.run(corpus,gibran,emerson,shakespeare,seeds,{
  group:"nulls",start:0,end:500,width:64,trace:false
});
const cp=stats(candidates,"prefixScore"), np=stats(nulls,"prefixScore");
const ch=stats(candidates,"holdScore"), nh=stats(nulls,"holdScore");
const cs=stats(candidates,"score"), ns=stats(nulls,"score");
const threshold=np.mean+3.69*np.sd; // approximate one-sided Gaussian Bonferroni, 433 tests
const summary={
  source:{
    corpusBlob:"054f2a0f780b7d46901acbe3d9bf4f0ac1801165",
    seedSnapshotBlob:"55d8323e473e454cdedaa61fd70f08fc18d23396",
    ciphertextRunes:C.length,adjacentRepeats:86,candidateSeeds:seeds.length,
    uniqueLow32Seeds:new Set(seeds.map(x=>x.seed>>>0)).size,
    generator:"glibc 2.15 TYPE_3; degree 31, separation 3, 310 warmups",
    reducer:"reject raw outputs >= floor(2^31/29)*29; then mod 29",
    model:"continuous offset 0; positive additive sign; at most one collision skip per emitted rune",
    beamWidth:64,withheldRunes:512
  },
  glibcSelfTest:gate.selfTest(),
  controls:{native,shakespeareControl},
  candidates:{
    prefix:cp,holdout:ch,full:cs,
    approximateFamilywisePrefixThreshold:threshold,
    empiricalNullMaxPrefix:np.max,
    candidateMaxPrefix:cp.max,
    candidateMaxMinusNullMax:cp.max-np.max,
    aboveApproximateThreshold:candidates.filter(x=>x.prefixScore>threshold).length,
    aboveEmpiricalNullMax:candidates.filter(x=>x.prefixScore>np.max).length,
    topByPrefix:top(candidates,"prefixScore",20),
    topByHoldout:top(candidates,"holdScore",10),
    topByFull:top(candidates,"score",10),
    skipCountRange:[Math.min(...candidates.map(x=>x.skips)),Math.max(...candidates.map(x=>x.skips))]
  },
  wrongSeedControls:{
    prefix:np,holdout:nh,full:ns,
    topByPrefix:top(nulls,"prefixScore",10)
  },
  interpretation:"Skip counts are descriptive path outputs, not independent evidence. A positive requires a source-ranked candidate to clear the frozen prefix/null gate and independently recover coherent withheld plaintext."
};
summary.rawScores = {
  columns:["rank","seed","seed32","score","prefixScore","holdScore","skips","prefixSkips"],
  candidates:candidates.map(x=>[x.rank,x.seed,x.seed32,x.score,x.prefixScore,x.holdScore,x.skips,x.prefixSkips]),
  wrongSeeds:nulls.map(x=>[x.rank,x.seed,x.seed32,x.score,x.prefixScore,x.holdScore,x.skips,x.prefixSkips])
};
console.log(JSON.stringify(summary,null,2));
