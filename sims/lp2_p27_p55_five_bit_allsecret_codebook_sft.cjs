"use strict";
/**
 * All-secret stationary five-bit/codebook obstruction for the 215 p27 black
 * runes and 43 p55 strict word-interior symbols. Tests both source-natural
 * packings. A union-find certificate requires neither 2^29 enumeration nor
 * any hypothetical alphabet mapping. Node 22 / CommonJS.
 *
 * Run: node sims/lp2_p27_p55_five_bit_allsecret_codebook_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,"..",
  "resources","liber-primus","lp2-corpus.json"),"utf8"));
const parsed=parseSharedCorpus();
const p27=corpus.pages.find(p=>p.page===27).indices;
const originalSource=p27.slice(19);
const originalWords=parsed.byStartPage[54];
const target=originalWords.flatMap(w=>[...w.runes].slice(1,-1)
  .map(ch=>corpus.runes.indexOf(ch)));
assert.deepEqual([p27.length,originalSource.length,originalWords.length,
  target.length,new Set(target).size],[234,215,16,43,21]);
assert.equal(originalWords.reduce((s,w)=>s+w.length,0),75);
assert.equal(parsed.crossPageWords,32);
assert.equal(parsed.runeCount,12956);

/**
 * Returns all 43 source quintets in one of the two natural layouts.
 * The source image prints neither grouping as five 43-character rows.
 * @param {"rows"|"tuples"} layout
 * @returns {number[][]}
 */
function columns(layout) {
  return Array.from({length:43},(_,j)=>Array.from({length:5},(_,k)=>
    originalSource[layout==="rows"?k*43+j:j*5+k]));
}

/**
 * Retain 22 canonical repeated-output requirements: later occurrence
 * must decode identically to the first occurrence of its printed rune.
 * @param {number[]} output
 * @returns {number[][]}
 */
function equalOutputEvents(output) {
  const first=new Map(),out=[];
  for(let j=0;j<output.length;j++){
    const t=output[j];
    if(first.has(t))out.push([first.get(t),j]);
    else first.set(t,j);
  }
  return out;
}

/**
 * If an injective decoder maps each five-bit code to one GP29 rune,
 * two equal output runes require identical five-bit tuples.
 * A stationary unknown binary color for every original GP rune
 * therefore obeys one equality of source-rune colors for each bit
 * of each repeated-output pair. Grant the solver an *arbitrary*
 * source-rune coloring and an arbitrary injective secret output
 * codebook. Union-find computes every color equality implied by
 * those repetitions. If distinct output runes acquire the same
 * five equivalence classes, even those secret choices cannot work.
 *
 * @param {number[][]} cols 43 source quintets
 * @param {number[]} output 43 desired GP labels, or plant labels
 * @param {number[][]} events Repeat-event index pairs
 */
function forcedCollisions(cols,output,events) {
  const parent=Array.from({length:29},(_,i)=>i);
  function find(x){while(parent[x]!==x)x=parent[x]=parent[parent[x]];return x;}
  function union(a,b){parent[find(a)]=find(b);}
  for(const [i,j] of events)
    for(let k=0;k<5;k++)union(cols[i][k],cols[j][k]);
  const signature=cols.map(c=>c.map(find).join(","));
  const collisions=[];
  for(let i=0;i<43;i++)for(let j=i+1;j<43;j++)
    if(output[i]!==output[j]&&signature[i]===signature[j])
      collisions.push([i,j]);
  return {sourceSymbolClasses:new Set(parent.map((_,i)=>find(i))).size,
    collisions};
}

/** A native 29-color/bit plus injective five-bit-codebook positive control. */
function plant(cols) {
  let state=0x33012755;
  const bits=Array.from({length:29},()=>{
    state^=state<<13;state^=state>>>17;state^=state<<5;
    return (state>>>0)&1;
  });
  const codes=cols.map(row=>row.reduce((x,i)=>2*x+bits[i],0));
  const distinct=[...new Set(codes)].sort((a,b)=>a-b);
  assert(distinct.length>=10&&distinct.length<=29);
  const dictionary=new Map(distinct.map((c,i)=>[c,i]));
  const output=codes.map(c=>dictionary.get(c));
  const check=forcedCollisions(cols,output,equalOutputEvents(output));
  assert.equal(check.collisions.length,0);
  // Map all 32 binary codewords to GP29 via c % 29. This is a fully
  // surjective 32-to-29 decoder with exactly three binary-code aliases.
  const aliasPositive=aliasGate(cols,codes.map(c=>c%29));
  assert(aliasPositive.feasibleExceptionSets>0);
  return {uniqueCodewords:distinct.length,outputReruns:43-distinct.length,
    sourceBitOnes:bits.filter(Boolean).length,classes:check.sourceSymbolClasses,
    surjectiveAliasedDecoderPlantAccepted:true,
    positiveAliasExceptionSets:aliasPositive.feasibleExceptionSets};
}


/**
 * Exactly at most three aliases are available in a total surjective
 * 32-code to 29-rune decoder (including a partial injective decoder as
 * the zero-alias case). Only at most three target rune TYPES may receive
 * two codes. Grant those rune types unlimited aliases and omit ALL their
 * equal-code implications, a strict overapproximation of the actual
 * decoder freedom. If even this relaxation always fails, every full
 * GP29 codebook fails without a search over secret coloring.
 *
 * @param {number[][]} cols @param {number[]} output
 */
function aliasGate(cols,output) {
  const labels=[...new Set(output)].sort((a,b)=>a-b);
  const events=equalOutputEvents(output);
  let checks=0,feasible=0;
  let firstFeasible=null;
  function visit(start,remaining,exempt){
    if(remaining===0){
      checks++;
      const exceptionSet=new Set(exempt);
      const forced=forcedCollisions(cols,output,
        events.filter(([i])=>!exceptionSet.has(output[i])));
      if(forced.collisions.length===0){
        feasible++;
        if(firstFeasible===null)firstFeasible=exempt.slice();
      }
      return;
    }
    for(let i=start;i<=labels.length-remaining;i++){
      exempt.push(labels[i]);
      visit(i+1,remaining-1,exempt);
      exempt.pop();
    }
  }
  for(let aliases=0;aliases<=3;aliases++)visit(0,aliases,[]);
  return {exceptionSetsChecked:checks,feasibleExceptionSets:feasible,
    firstFeasible};
}

function main(){
  const allEvents=equalOutputEvents(target);
  assert.equal(allEvents.length,22);
  const expectations={
    rows:{repeat:[[1,13],[18,25]],collision:[30,41]},
    tuples:{repeat:[[9,16],[27,36]],collision:[21,27]}
  };
  const cases=[];
  for(const layout of ["rows","tuples"]){
    const col=columns(layout);
    assert.equal(col.length,43);
    const source=forcedCollisions(col,target,allEvents);
    assert.deepEqual([source.sourceSymbolClasses,source.collisions.length],
      [1,872]); // 43 choose 2 minus 31 equal-symbol pairs = 872
    assert.equal(forcedCollisions(col,target,[]).collisions.length,0);
    for(const ev of allEvents)
      assert.equal(forcedCollisions(col,target,[ev]).collisions.length,0);
    const witness=expectations[layout];
    for(const ev of witness.repeat)
      assert(allEvents.some(x=>x[0]===ev[0]&&x[1]===ev[1]));
    const partial=forcedCollisions(col,target,witness.repeat);
    assert(partial.collisions.some(([i,j])=>i===witness.collision[0]
      &&j===witness.collision[1]));
    assert.notEqual(target[witness.collision[0]],
      target[witness.collision[1]]);
    const aliasOriginal=aliasGate(col,target);
    assert.deepEqual([aliasOriginal.exceptionSetsChecked,
      aliasOriginal.feasibleExceptionSets],[1562,0]);
    const positive=plant(col);
    cases.push({layout,aliasSurjective29Codebook:aliasOriginal,
      sourceSymbols:29,sourceQuintets:col.length,
      outputTypes:new Set(target).size,repeatedOutputRequirements:allEvents.length,
      allRepetitionForcedSourceClasses:source.sourceSymbolClasses,
      allRepetitionDistinctOutputCollisions:source.collisions.length,
      noZeroOrSingleRepeatWitness:true,
      twoRepeatWitness:witness.repeat.map(([i,j])=>({
        positions:[i,j],sameTargetRune:corpus.translit[target[i]]
      })),
      forcedDifferentOutputPositions:witness.collision,
      forcedDifferentOutputRunes:witness.collision.map(j=>corpus.translit[target[j]]),
      plant:positive});
  }
  console.log(JSON.stringify({original:{p27Black:215,p55Body:75,
    p55Interior:43,p55UniqueInteriorRunes:21},cases,
    decision:"Both natural packings exclude every stationary source-rune-to-bit map plus any surjective five-bit-to-GP29 codebook with at most three aliases as an exact direct p27 to p55 interior decoder. The codebook, bit order and alphabet mappings are entirely unknown. Neither packing is printed; this is a conditional gate, not plaintext."},null,2));
}
if(require.main===module)main();
module.exports={columns,equalOutputEvents,forcedCollisions,plant};
