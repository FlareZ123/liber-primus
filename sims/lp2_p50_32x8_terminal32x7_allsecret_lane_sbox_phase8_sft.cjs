#!/usr/bin/env node
'use strict';
/*
 * 28 Nov 2026 — p50 numeric 32x8 -> p54/p55 physical 32x7 all-secret
 * stationary nonlinear per-column codebook + cyclic 8-row secret shifts.
 * Original-source-only, every one of eight excluded single-column lanes.
 * Exact GF29 consistency rank; no fitted English and no key enumeration.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const p=n=>corpus.pages.find(x=>x.page===n).indices;
const p54=p(54),p55=p(55),target=p54.slice(9).concat(p55[0]);
const red8=p54.slice(1,9);
const tokens=grid.pages.flatMap(x=>x.tokens);
assert.deepEqual([p54.length,p55.length,target.length,tokens.length,red8.length],
 [232,76,224,256,8]);
const mod=x=>(x%29+29)%29;
const resultRows=Array.from({length:32},(_,r)=>target.slice(7*r,7*r+7));
const tokenRows=Array.from({length:32},(_,r)=>tokens.slice(8*r,8*r+8));
function rank(matrix){
 if(!matrix.length)return 0;
 const a=matrix.map(row=>row.map(mod));
 let pivots=0;
 for(let col=0;col<a[0].length&&pivots<a.length;col++){
  let row=pivots;
  while(row<a.length&&!a[row][col])row++;
  if(row===a.length)continue;
  [a[pivots],a[row]]=[a[row],a[pivots]];
  const inv=Array.from({length:28},(_,k)=>k+1)
   .find(k=>mod(k*a[pivots][col])===1);
  a[pivots]=a[pivots].map(x=>mod(x*inv));
  for(let k=pivots+1;k<a.length;k++){
   const scale=a[k][col];
   a[k]=a[k].map((x,i)=>mod(x-scale*a[pivots][i]));
  }
  pivots++;
 }
 return pivots;
}
function constraints(drop,output,phasePeriod){
 const equations=[],lanes=[],example=[];
 for(let lane=0;lane<7;lane++){
  const oldCol=lane>=drop?lane+1:lane;
  const seen=new Map(),count=new Map();
  for(let r=0;r<32;r++){
   const token=tokenRows[r][oldCol],plain=output[r][lane];
   if(!count.has(token))count.set(token,new Map());
   const hist=count.get(token);
   hist.set(plain,(hist.get(plain)||0)+1);
   const prior=seen.get(token);
   if(prior){
    const row=Array(phasePeriod+1).fill(0);
    row[r%phasePeriod]=mod(row[r%phasePeriod]+1);
    row[prior.r%phasePeriod]=mod(row[prior.r%phasePeriod]-1);
    row[phasePeriod]=mod(plain-prior.plain);
    equations.push(row);
    example.push({lane,oldCol,token,firstRow:prior.r,secondRow:r,
     firstPhase:prior.r%phasePeriod,secondPhase:r%phasePeriod,
     firstTargetRune:prior.plain,secondTargetRune:plain,delta:row[phasePeriod]});
   }else seen.set(token,{r,plain});
  }
  let best=0;
  for(const freq of count.values())best+=Math.max(...freq.values());
  lanes.push({oldCol,distinctTokens:seen.size,free_stationary_lookup_best:best});
 }
 const regRank=rank(equations.map(eq=>eq.slice(0,-1))),augRank=rank(equations);
 return {drop,phasePeriod,conditionCount:equations.length,rankWithoutRight:regRank,
  rankWithRight:augRank,feasible:regRank===augRank,lanes,
  bestStationaryScore:lanes.reduce((n,l)=>n+l.free_stationary_lookup_best,0),
  repeatedTokenConstraints:example};
}
const results=[];
for(let drop=0;drop<8;drop++){
 const period8=constraints(drop,resultRows,8);
 const period32=constraints(drop,resultRows,32);
 assert(!period8.feasible,'source map/secret eight-phase family must fail on originals');
 assert(period8.bestStationaryScore<=215);
 results.push({drop,period8:{constraints:period8.conditionCount,rankCoefficients:period8.rankWithoutRight,
   rankAugmented:period8.rankWithRight,feasible:period8.feasible},
  arbitraryRow32:{feasible:period32.feasible,rankCoefficients:period32.rankWithoutRight,
   rankAugmented:period32.rankWithRight},
  bestAllSecretStationaryLookupOf224:period8.bestStationaryScore,
  forcedStationaryMismatches:224-period8.bestStationaryScore});
}
assert.deepEqual(results.map(x=>x.bestAllSecretStationaryLookupOf224),
 [215,213,214,214,214,213,213,214]);
assert.deepEqual(results.map(x=>x.arbitraryRow32.feasible),
 [false,false,true,false,true,true,true,true]);
// Exhaustively check one minimal source-original two-equation witness for the
// omission of printed p50 column3 (p40 source-selected cell43 sits there).
// For source token 3H and 0s at original rows4/14 and columns2/4, both
// row corrections h14-h4 must have distinct GP values (16 and19).
const d3=constraints(3,resultRows,8);
const repeat3H=d3.repeatedTokenConstraints.find(x=>x.token==='3H'&&x.firstRow===4&&x.secondRow===14);
const repeat0s=d3.repeatedTokenConstraints.find(x=>x.token==='0s'&&x.firstRow===4&&x.secondRow===14);
assert(repeat3H&&repeat0s);
assert.equal(repeat3H.delta,16);
assert.equal(repeat0s.delta,19);
assert.equal(mod(repeat0s.delta-repeat3H.delta),3);
// Positive source-shaped plant: arbitrary secret 7 independent token maps plus
// source red8 key as cyclic row offsets. All eight omissions must fit exactly.
const plants=[];
for(let drop=0;drop<8;drop++){
 const planted=Array.from({length:32},(_,r)=>Array.from({length:7},(_,lane)=>{
  const c=lane>=drop?lane+1:lane,t=tokenRows[r][c];
  const hidden=mod((lane+3)*t.charCodeAt(0)+(lane+7)*t.charCodeAt(1));
  return mod(hidden+red8[r%8]);
 }));
 const gate=constraints(drop,planted,8);
 assert(gate.feasible);
 assert.equal(gate.bestStationaryScore>=199,true);
 plants.push({drop,consistent:true,rank:gate.rankWithoutRight});
}
const output={
 question:'Can original p50 8 token lanes produce p54 black223+p55 carry1 7-rune lanes by an arbitrary secret independent per-lane lookup plus any secret repeated eight-row additive shift?',
 original_source:{p50Rows:32,p50Cols:8,p54HeadingRed:9,p54Black:223,p55Carry:1,
  target32x7:224,sourceRedClock8:red8},
 model:'For any omitted original table column k, y[r,j]=secret_f_j(original_token[r,retained_column(j,k)])+secret_h[r mod 8] (mod29). All f_j completely arbitrary, all 8 phases arbitrary. 8 key-independent GF29 exact consistency checks.',
 originalResults:results,
 originalTwoTokenContradiction:{
  omittedColumn:3,rows:[4,14],tokens:['3H','0s'],
  sourceColumns:[2,4],sourceTargetRungap:[16,19],
  unavoidableDifferenceMod29:3,
  note:'Already contradictory with a distinct secret shift for EVERY original row, not merely 8 shared phases'
 },
 positivePlantedAllDrops:plants,
 conclusion:'All 8 omitted-lane original families impossible even with seven independent fully secret nonlinear codebooks and eight arbitrary additive phase offsets. Arbitrary 32-row shifts remain feasible for five omissions, so this is not a universal row-key exclusion.',
 scopeExclusions:['no original plaintext claimed','not a source-selected operation',
  'does not exclude source-dependent row-varying permutations/nonlinear counters']
};
console.log(JSON.stringify(output,null,2));
if(process.env.RUNNER_TEMP)fs.writeFileSync(
 path.join(process.env.RUNNER_TEMP,'source-test-output.json'),
 JSON.stringify(output,null,2)+'\n');
