'use strict';

/**
 * Original p29/p50 shared G repeated-root, exact 21-erasure model gate.
 *
 * Motivation: p29 (277 runes) and p50 (256 base60-decoded bytes) are
 * both divisible, modulo 29, by the *original* p39 red quadratic G;
 * their raw lengths, and the exact G-quotient lengths (275 vs 254),
 * differ by exactly 21 = three 7-cycles of root24.
 *
 * A human could therefore ask if one sequence is the other plus 21
 * extra symbols after a globally unknown GP29 alphabet relabeling.
 *
 * This gate proves impossibility for EVERY 21-position deletion,
 * arbitrary global reordering, and EVERY secret 29! symbol permutation.
 * It also eliminates all deterministic many-to-one global symbol maps
 * because BOTH observed registers use all 29 GP29 types, forcing any
 * map that covers every target type to be a permutation.
 *
 * Does not rule out additive/position-dependent keys, changed symbols,
 * source-selected different framing, or a real plaintext mechanism.
 *
 * Windows Node.js 22 SFT:
 *   node sims/lp2_p29_p50_sharedG_21deletion_allsecret_original_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
/** @param {string} p */
function json(p){return JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));}
const corpus=json('resources/liber-primus/lp2-corpus.json');
const grid=json('resources/liber-primus/lp2-grid-256.json');
const sourceA=corpus.pages[29].indices;
const sourceB=grid.bytes.map(v=>v%29);
assert.deepEqual([sourceA.length,sourceB.length],[277,256]);
assert.equal(
 crypto.createHash('sha256').update(Buffer.from(grid.bytes)).digest('hex'),
 '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const mod=x=>(x%29+29)%29;
/**
 * Original printed GP red triad p39 at positions119..121 equals
 * [27,5,15], or G(x)=15 x^2 + 5 x + 27, high-coefficient-first.
 * @param {number[]} array
 */
function divideG(array){
 const a=array.map(mod),q=[];
 for(let i=0;i+2<a.length;i++){
  const amount=mod(2*a[i]); // 15^(-1)=2 in F29
  q.push(amount);
  for(let k=0;k<3;k++)a[i+k]=mod(a[i+k]-amount*[15,5,27][k]);
 }
 assert.deepEqual(a.slice(-2),[0,0]);
 return q;
}
assert.deepEqual(corpus.pages[39].indices.slice(119,122),[27,5,15]);
const quotientA=divideG(sourceA),quotientB=divideG(sourceB);
assert.deepEqual([quotientA.length,quotientB.length],[275,254]);

/** @param {number[]} a @returns {number[]} */
function histogram(a){
 const counts=Array(29).fill(0);
 for(const x of a){
  assert(Number.isInteger(x)&&x>=0&&x<29);
  counts[x]++;
 }
 return counts;
}
/**
 * A length-N register transformed by an arbitrary fixed bijective
 * 29-way symbol map, any permutation of its positions, and deletion of
 * exactly N-M symbols to form length-M target must have a histogram
 * admitting one-to-one count domination. Sorting both histograms is the
 * *optimal* permutation for minimizing unmatched target counts.
 *
 * The positive part of sum(target_i-source_i) lower-bounds required
 * rune substitutions for ANY relabeling; if >0, deletions alone fail.
 *
 * @param {number[]} longer
 * @param {number[]} shorter
 */
function capacity(longer,shorter){
 const left=histogram(longer),right=histogram(shorter);
 assert.equal(left.length,29);
 assert.equal(right.length,29);
 const a=left.slice().sort((x,y)=>x-y);
 const b=right.slice().sort((x,y)=>x-y);
 const mismatch=b.reduce((sum,n,i)=>sum+Math.max(0,n-a[i]),0);
 const violated=b.flatMap((n,i)=>n>a[i]?
  [{sortedIndex:i,available:a[i],needed:n,deficit:n-a[i]}]:[]);
 return {longerRunes:longer.length,shorterRunes:shorter.length,
  extraPositions:longer.length-shorter.length,
  longerDistinct:left.filter(Boolean).length,
  shorterDistinct:right.filter(Boolean).length,
  shorterMinimumTypeCount:Math.min(...right),
  longerMinimumTypeCount:Math.min(...left),
  minimumSubstitutionCountUnderAllSecretAlphabets:mismatch,
  deletionOnlyPossible:mismatch===0,violatedHistogramRanks:violated};
}
const raw=capacity(sourceA,sourceB);
const g=capacity(quotientA,quotientB);
assert.equal(raw.deletionOnlyPossible,false);
assert.equal(g.deletionOnlyPossible,false);
assert.equal(raw.minimumSubstitutionCountUnderAllSecretAlphabets,7);
assert.equal(g.minimumSubstitutionCountUnderAllSecretAlphabets,5);
assert.deepEqual([raw.longerDistinct,raw.shorterDistinct,g.longerDistinct,g.shorterDistinct],
 [29,29,29,29]);
assert.equal(g.longerMinimumTypeCount,1);
assert.equal(g.shorterMinimumTypeCount,5);

/**
 * Stronger source-seven-phase consumer: the shared G root24 has exact order
 * SEVEN, so grant SEVEN independent unknown bijections and a 21-symbol
 * (three full root periods) contiguous extra block anywhere.
 *
 * This tests EVERY deletion start, both independent source orientations,
 * and every secret seven-key alphabet implicitly via exact equality
 * partitions, without enumerating (29!)^7 unknown alphabets.
 *
 * @param {number[]} source Source original GP29 register.
 * @param {number[]} target Target original GP29 register.
 */
function allSevenPhaseContiguousDeletion(source,target){
 assert.equal(source.length-target.length,21);
 const output={cases:0,compatibleSevenPhaseKeys:0,
  maximumFirstContradictionPosition:-1,minimumGreedyConflicts:Infinity,
  best:{},earliestCounterexample:null};
 for(const reverseSource of [false,true]){
  for(const reverseTarget of [false,true]){
   const longer=reverseSource?source.slice().reverse():source;
   const shorter=reverseTarget?target.slice().reverse():target;
   for(let start=0;start+21<=longer.length;start++){
    const aligned=longer.slice(0,start).concat(longer.slice(start+21));
    const maps=Array.from({length:7},()=>new Map());
    const inverses=Array.from({length:7},()=>new Map());
    let first=-1,conflicts=0;
    for(let i=0;i<shorter.length;i++){
      const state=i%7,one=aligned[i],two=shorter[i];
      if((maps[state].has(one)&&maps[state].get(one)!==two)||
         (inverses[state].has(two)&&inverses[state].get(two)!==one)){
        if(first<0)first=i;
        conflicts++;
      }else{
        maps[state].set(one,two);
        inverses[state].set(two,one);
      }
    }
    output.cases++;
    if(conflicts===0)output.compatibleSevenPhaseKeys++;
    if(first>output.maximumFirstContradictionPosition)
      output.maximumFirstContradictionPosition=first;
    if(conflicts<output.minimumGreedyConflicts){
      output.minimumGreedyConflicts=conflicts;
      output.best={reverseSource,reverseTarget,start,first,conflicts};
    }
    if(output.earliestCounterexample===null&&first>=0)
      output.earliestCounterexample={reverseSource,reverseTarget,start,position:first};
   }
  }
 }
 return output;
}
const sevenPhaseRaw=allSevenPhaseContiguousDeletion(sourceA,sourceB);
const sevenPhaseG=allSevenPhaseContiguousDeletion(quotientA,quotientB);
assert.deepEqual([sevenPhaseRaw.cases,sevenPhaseRaw.compatibleSevenPhaseKeys],
 [1028,0]);
assert.deepEqual([sevenPhaseG.cases,sevenPhaseG.compatibleSevenPhaseKeys],
 [1020,0]);
assert.equal(sevenPhaseRaw.minimumGreedyConflicts,126);
assert.equal(sevenPhaseG.minimumGreedyConflicts,127);
assert.equal(sevenPhaseG.maximumFirstContradictionPosition,43);

/* Authentic target / synthetic full seven-key positive. */
const phases=Array.from({length:7},(_,phase)=>Array.from({length:29},
 (_,symbol)=>((phase+2)*symbol+phase*11)%29));
const unphase=phases.map(permutation=>{
 assert.equal(new Set(permutation).size,29);
 const inverse=Array(29);
 permutation.forEach((value,index)=>inverse[value]=index);
 return inverse;
});
const phasePlantOriginal=quotientB.map((value,i)=>phases[i%7][value]);
const phasePlant=phasePlantOriginal.slice(0,57)
 .concat(Array.from({length:21},(_,i)=>(17*i+4)%29))
 .concat(phasePlantOriginal.slice(57));
assert.equal(phasePlant.length,quotientA.length);
const phasePlantTest=allSevenPhaseContiguousDeletion(phasePlant,quotientB);
assert.equal(phasePlantTest.compatibleSevenPhaseKeys>0,true);
const recoveredPhase=phasePlant.slice(0,57).concat(phasePlant.slice(78))
 .map((value,i)=>unphase[i%7][value]);
assert.deepEqual(recoveredPhase,quotientB);

/* Exact positive: globally secret GP29 bijection and 21 arbitrary added
 * positions; rejector must accept a true plant. The original p50
 * quotient's 254 runes are used solely as the known target register,
 * not a fabricated English ciphertext.
 */
const alphabet=Array.from({length:29},(_,i)=>(7*i+3)%29);
assert.equal(new Set(alphabet).size,29);
const inverse=Array(29);
alphabet.forEach((value,i)=>{inverse[value]=i;});
const sourcePlant=quotientB.map(v=>alphabet[v]);
const extra=Array.from({length:21},(_,i)=>alphabet[(i*11+5)%29]);
const positions=[];
for(let i=0;i<extra.length;i++){
 const at= (i*13+7)%(sourcePlant.length+1);
 sourcePlant.splice(at,0,extra[i]);
 positions.push(at);
}
const plantedCapacity=capacity(sourcePlant,quotientB);
assert.equal(plantedCapacity.deletionOnlyPossible,true);
assert.equal(plantedCapacity.extraPositions,21);
let recovered=sourcePlant.slice();
for(let i=positions.length-1;i>=0;i--)
 recovered.splice(positions[i],1);
assert.deepEqual(recovered.map(v=>inverse[v]),quotientB);

/* Stronger algebraic statement: global noninjective symbol functions
 * cannot escape the original contradiction. A function of a 29-type
 * domain that reaches all 29 types is necessarily a bijection. */
assert.equal(g.longerDistinct,29);
assert.equal(g.shorterDistinct,29);
console.log(JSON.stringify({
 status:'EXACT original-source exclusion, NOT recovered plaintext',
 source:'LP2 original p29 ciphertext and p50 conventional base60 table, GF29',
 sourceFactor:'p39 marked [27,5,15], G=15(X-24)^2',
 originalRaw:raw,originalSharedGQuotient:g,
 sevenPhaseContiguous21:{raw:sevenPhaseRaw,gQuotient:sevenPhaseG,positiveCompatibleCases:phasePlantTest.compatibleSevenPhaseKeys,positiveExactRecovered:recoveredPhase.length},
 syntheticPositive:{
  actualAuthenticP50TargetRunes:quotientB.length,
  secretGP29AlphabetCount:29,arbitraryAddedPositions:21,
  positiveAccepted:plantedCapacity.deletionOnlyPossible,
  allRecoveredTargetRunes:recovered.length
 },
 conclusion:'No choice of 21 positions, source orientation, fixed global GP29 substitution, or arbitrary source ordering can turn p29 into p50 in this whole-scope deletion-only family; the more permissive deterministic many-to-one fixed mapping collapses to a bijection because target uses all 29 symbols.',
 scopeLimit:'Does not exclude position-varying keys, deletion plus substitution, different source-supplied framing, or non-GF29 encodings.'
},null,2));
