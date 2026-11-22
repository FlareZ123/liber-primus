'use strict';

/**
 * Image-preselected LP1 p05 → LP2 p53/p55 seven-word length null.
 * Windows Node.js 22: node sims/lp2_moth_pair_length_selective_null_sft.cjs
 *
 * All three original pages are selected by reused Cicada moth artwork,
 * independently of ciphertext and word-length matches. This is a structural
 * test, not a plaintext recovery or a key/decoder for the unknown pages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const transcription = fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8'
);
const parts = transcription.trim().split(/\n%\n/);
assert.equal(parts.length, 57); // Physical LP2 p50 is a numeral-only table.

/** @param {number} physicalPage */
function unknownWordLengths(physicalPage) {
  const partIndex = physicalPage < 50 ? physicalPage : physicalPage - 1;
  const text = parts[partIndex]
    .replace(/\/\r?\n/g, '')
    .replace(/[\r\n&$§]/g, '');
  return text.split(/[-.]+/).filter(Boolean).map(word => Array.from(word).length);
}

// Original solved GP runes in LP1 p05, from SOME WISDOM through KNOW THIS.
// The ensuing original five-by-five numerical square begins '272-138-'.
const lp1=fs.readFileSync(path.join(__dirname,'..','resources','transcriptions',
  'lp1_wulfic_canonical.txt'),'utf8')
  .replace(/\/\r?\n/g,'').replace(/[\r\n]/g,'');
const sourceStart=lp1.indexOf('ᛋᚩᛗᛖ-ᚹᛁᛋᛞᚩᛗ.');
assert.ok(sourceStart>=0);
const sourceEnd=lp1.indexOf('272-138-',sourceStart);
assert.ok(sourceEnd>sourceStart);
const originalWisdomWords=lp1.slice(sourceStart,sourceEnd)
  .replace(/[&$§]/g,'').split(/[-.]/).filter(Boolean);
const wisdom=originalWisdomWords.map(word=>Array.from(word).length);
assert.deepEqual(wisdom,[4,6,2,6,3,6,2,7,7,2,6,3,3,6,2,9,4,3]);
const page53 = unknownWordLengths(53);
const page55WithCarry = unknownWordLengths(55);
const page55 = page55WithCarry.slice(1); // First rune completes p54 word.
const sum = values => values.reduce((x,y) => x+y,0);
assert.equal(sum(wisdom),81);
assert.deepEqual([page53.length,sum(page53)], [40,179]);
assert.deepEqual([page55WithCarry[0],page55.length,sum(page55)], [1,16,75]);
const patterns = wisdom.slice(0,-6).map((_,index) => wisdom.slice(index,index+7));

/** @param {number[]} a @param {number[]} b */
function longest(a,b) {
  let best=0,places=[];
  for (let i=0;i<a.length;i++) for (let j=0;j<b.length;j++) {
    let k=0;
    while(i+k<a.length && j+k<b.length && a[i+k]===b[j+k])k++;
    if (k>best) {best=k;places=[[i,j]];}
    else if (k===best) places.push([i,j]);
  }
  return {length:best,places};
}
assert.deepEqual(longest(wisdom,page53).length,2);
assert.deepEqual(longest(wisdom,page55),{length:7,places:[[6,9]]});

// Exact automaton/D.P. enumerates all DISTINCT p55 16-word permutations,
// keeping each original word length's multiplicity. "Good" means at least
// one of all twelve length-seven windows of p05 occurs anywhere in p55.
/** @param {number[]} input @param {number[][]} phrases */
function exactSevenProbability(input,phrases) {
  const alphabet=[...new Set(input)].sort((a,b)=>a-b);
  const nodes=[{next:new Map(),fail:0,terminal:false}];
  for(const phrase of phrases) {
    let s=0;
    for(const token of phrase) {
      if(!nodes[s].next.has(token)) {
        nodes[s].next.set(token,nodes.length);
        nodes.push({next:new Map(),fail:0,terminal:false});
      }
      s=nodes[s].next.get(token);
    }
    nodes[s].terminal=true;
  }
  const queue=[...nodes[0].next.values()];
  for(let pos=0;pos<queue.length;pos++) {
    const s=queue[pos];
    for(const [token,child] of nodes[s].next) {
      queue.push(child);
      let k=nodes[s].fail;
      while(k && !nodes[k].next.has(token))k=nodes[k].fail;
      nodes[child].fail=nodes[k].next.get(token) ?? 0;
      nodes[child].terminal ||= nodes[nodes[child].fail].terminal;
    }
  }
  const transitions=nodes.map((_,s)=>alphabet.map(token=>{
    let k=s;
    while(k && !nodes[k].next.has(token))k=nodes[k].fail;
    return nodes[k].next.get(token) ?? 0;
  }));
  const counts=alphabet.map(token=>input.filter(x=>x===token).length);
  const memo=new Map();
  /** @param {number[]} remaining @param {number} state @returns {bigint} */
  function noMatch(remaining,state) {
    if(remaining.every(x=>x===0)) return 1n;
    const key=remaining.join(',')+':'+state;
    if(memo.has(key))return memo.get(key);
    let n=0n;
    for(let i=0;i<remaining.length;i++) {
      if(!remaining[i])continue;
      const next=transitions[state][i];
      if(nodes[next].terminal)continue;
      remaining[i]--;
      n+=noMatch(remaining,next);
      remaining[i]++;
    }
    memo.set(key,n);
    return n;
  }
  let total=1n;
  for(let n=2;n<=input.length;n++)total*=BigInt(n);
  for(const count of counts) for(let n=2;n<=count;n++)total/=BigInt(n);
  const negatives=noMatch(counts,0);
  return {total,negatives,positives:total-negatives,states:memo.size,
    probability:Number(total-negatives)/Number(total)};
}
const exact=exactSevenProbability(page55,patterns);
assert.equal(exact.total,908107200n);
assert.equal(exact.negatives,906885000n);
assert.equal(exact.positives,1222200n);

// The OTHER LP2 page using the identical moth artwork is p53. It has a
// different 40-word inventory; use a deterministic 2m-permutation null.
// The source GP word tape and page boundaries stay fixed throughout.
const MATCHES=new Set(patterns.map(p=>p.reduce((s,x)=>s*16+x,0)));
// Exact competing null: preserve not only word-length multiplicities, but
// EVERY observed adjacent word-length pair on the original p55 passage.
// Enumerate unlabeled directed Euler trails of the empirical bigram
// multigraph, starting at the original first word length. Duplicated
// directed edges are indistinguishable; do not overcount their labelings.
const edgeCounts=new Map();
for(let i=0;i<page55.length-1;i++) {
  const pair=page55[i]+','+page55[i+1];
  edgeCounts.set(pair,(edgeCounts.get(pair)??0)+1);
}
const directedEdges=[...edgeCounts].map(([pair,count])=>{
  const [from,to]=pair.split(',').map(Number);
  return {from,to,count};
});
let bigramTrails=0,bigramMatchingTrails=0,bigramFixedTerminalMatches=0;
const trail=[page55[0]];
function visitEulerTrails(remaining) {
  if(remaining===0) {
    bigramTrails++;
    let found=false;
    for(let i=0;i<=trail.length-7;i++) {
      let code=0;
      for(let j=0;j<7;j++) code=code*16+trail[i+j];
      if(MATCHES.has(code)){found=true;break;}
    }
    if(found)bigramMatchingTrails++;
    if(trail.slice(-7).every((x,j)=>x===wisdom[6+j]))
      bigramFixedTerminalMatches++;
    return;
  }
  const from=trail[trail.length-1];
  for(const edge of directedEdges) {
    if(edge.from!==from || edge.count===0)continue;
    edge.count--;
    trail.push(edge.to);
    visitEulerTrails(remaining-1);
    trail.pop();
    edge.count++;
  }
}
visitEulerTrails(page55.length-1);
assert.equal(bigramTrails,216);
assert.equal(bigramMatchingTrails,24);
assert.equal(bigramFixedTerminalMatches,24);
let seed=20261115;
function randomUint32() {
  seed|=0;
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return seed>>>0;
}
const trials=2000000,shuffled=page53.slice();
let hits=0;
for(let repeat=0;repeat<trials;repeat++) {
  for(let i=shuffled.length-1;i>0;i--) {
    const j=randomUint32()%(i+1);
    [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
  }
  for(let i=0;i<=shuffled.length-7;i++) {
    let value=0;
    for(let j=0;j<7;j++)value=value*16+shuffled[i+j];
    if(MATCHES.has(value)){hits++;break;}
  }
}
assert.equal(hits,164);

// Cross-family source-art selection control: the other independently
// registered art reuses are LP1 p9/p13/p16 → LP2 p2 (insect), and LP1
// p14/p15/p16 → LP2 p22 (reclining figure). Preserve original lengths and
// grant every seven-word source position on each original illustrated page.
const lp1Pages=fs.readFileSync(path.join(__dirname,'..','resources','transcriptions',
  'lp1_wulfic_canonical.txt'),'utf8').trim().split(/\n%\n/);
assert.equal(lp1Pages.length,15); // Physical LP1 p2–p16 inclusive.
/** @param {number} physicalPage */
function solvedWordLengths(physicalPage) {
  const page=lp1Pages[physicalPage-2].replace(/\/\r?\n/g,'')
    .replace(/[\r\n]/g,'').replace(/[&$§]/g,'.');
  return page.split(/[-.]+/).filter(word=>/^[ᚠ-ᛪ]+$/.test(word))
    .map(word=>Array.from(word).length);
}
const otherArtFamilies=[
  {label:'LP1 p9/p13/p16 insect → LP2 p2',source:[9,13,16],
    target:2,seed:3301202,hits:559},
  {label:'LP1 p14/p15/p16 reclining figure → LP2 p22',source:[14,15,16],
    target:22,seed:3301222,hits:2703}
];
const otherFamilyStats=[];
for(const family of otherArtFamilies) {
  const originalTarget=unknownWordLengths(family.target);
  assert.equal(originalTarget.length,family.target===2 ? 38 : 28);
  const sourcePatternCodes=new Set(family.source.flatMap(page=>{
    const widths=solvedWordLengths(page);
    return widths.slice(0,-6).map((_,i)=>
      widths.slice(i,i+7).reduce((n,x)=>n*16+x,0));
  }));
  let randomSeed=family.seed;
  function nextRandom() {
    randomSeed|=0;randomSeed^=randomSeed<<13;
    randomSeed^=randomSeed>>>17;randomSeed^=randomSeed<<5;
    return randomSeed>>>0;
  }
  const samples=1000000,perm=originalTarget.slice();
  let successes=0;
  for(let r=0;r<samples;r++) {
    for(let j=perm.length-1;j>0;j--) {
      const k=nextRandom()%(j+1);
      [perm[j],perm[k]]=[perm[k],perm[j]];
    }
    for(let i=0;i<=perm.length-7;i++) {
      let signature=0;
      for(let k=0;k<7;k++)signature=signature*16+perm[i+k];
      if(sourcePatternCodes.has(signature)){successes++;break;}
    }
  }
  assert.equal(successes,family.hits);
  otherFamilyStats.push({label:family.label,
    targetWords:originalTarget.length,sourceSevenPatterns:sourcePatternCodes.size,
    trials:samples,seed:family.seed,hits:successes,
    empiricalAddOne:(successes+1)/(samples+1)});
}
const pOther=hits/trials;
const pairwise=1-(1-exact.probability)*(1-pOther);
const acrossArtFamilies=1-(1-pairwise)*otherFamilyStats.reduce((p,stat)=>p*(1-stat.hits/stat.trials),1);
console.log(JSON.stringify({
  motifSource:"LP1 p05 exact 18-word/81-rune Wisdom passage",
  searchedTargets:["LP2 p53 (40 words)","LP2 p55 (16 body words after carry)"],
  originalObserved:{p53:longest(wisdom,page53),p55:longest(wisdom,page55)},
  p55ExactAdjacentLengthPairNull:{distinctEulerTrails:bigramTrails,
    trailsWithAnySevenWordMatch:bigramMatchingTrails,
    trailsWithExactTerminalSourcePhraseLengths:bigramFixedTerminalMatches,
    probability:bigramMatchingTrails/bigramTrails},
  p55Exact:{positivePermutations:exact.positives.toString(),
    distinctPermutations:exact.total.toString(),probability:exact.probability,
    memoStates:exact.states},
  p53PermutationEstimate:{seed:20261115,trials,hits,
    empiricalAddOne:(hits+1)/(trials+1)},
  familyMotifConditionedEstimate:pairwise,
  otherIndependentArtworkFamilyControls:otherFamilyStats,
  acrossThreeKnownArtworkFamilies:acrossArtFamilies,
  caveat:"A separately authored operation, F policy, key and original unknown plaintext remain absent."
},null,2));
