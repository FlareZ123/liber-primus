'use strict';
/**
 * LP2 77 GP -> 78 rank digits, after exactly 86 repeated-rune erasures:
 * arbitrary independent fixed 29-rune ORDER PER SECTION, global packet phase.
 *
 * Key-blind source-original theorem:
 * any unknown sorted predecessor-excluded alphabet permits at most 16
 * distinct source glyphs among packet-leading emitted glyphs (digit<=14).
 * The last of eight original text sections exceeds that count at every one
 * of 78 phases x both digit directions, independent of the other seven keys.
 *
 * Cyclic orders are a separate family: reuse the exact published blind SAT
 * gate. A SAT witness means only necessary leading-rank feasibility.
 * Report full numeric-capacity invalid packets for one arbitrary witness;
 * never equate that with actual historical plaintext/key.
 *
 * A source-native planted eight-order control exactly encodes/decodes all
 * 12,705 GP Shakespeare runes while preserving 86 original repeat sites.
 *
 * Run: node sims/repeat_erased_section_secret_order_gate.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gate,observe}=require('./repeat_erased_78packet_gate.cjs');
const {toGematria}=require('./previous_cipher_sbox_invariant.cjs');

const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length);
const C=pages.flatMap(p=>p.indices);
const SECTION_BOUNDS=[[0,2],[3,7],[8,14],[15,22],
  [23,26],[27,32],[33,39],[40,55]];
const Q=29,INPUT=77,OUTPUT=78;
const mod=x=>((x%Q)+Q)%Q;
assert.equal(C.length,12956);
assert.equal(pages.length,55);
assert.equal(SECTION_BOUNDS.length,8);
assert.equal(Number((29n**77n-1n)/(28n**77n)),14);
const limit=29n**77n;

const sections=[];
for(const p of pages){
  const k=SECTION_BOUNDS.findIndex(([a,b])=>p.page>=a&&p.page<=b);
  assert(k>=0);
  sections.push(...Array(p.indices.length).fill(k));
}
assert.equal(sections.length,C.length);
const repeats=[];
const observed=[];
for(let i=0;i<C.length;i++){
  if(i&&C[i]===C[i-1]){
    repeats.push(i);
    continue;
  }
  observed.push({site:i,prev:i?C[i-1]:null,curr:C[i],
    section:sections[i]});
}
const source=observe(C);
assert.deepEqual(source.obs.map(x=>[x.prev,x.curr]),
  observed.map(x=>[x.prev,x.curr]));
assert.equal(repeats.length,86);
assert.equal(observed.length,12870);
assert.equal(observed.length/OUTPUT,165);

/** @param {number} phase @param {boolean} reverse */
function packetLeaders(phase,reverse){
  const groups=Array.from({length:8},()=>[]);
  for(let s=phase;s+OUTPUT<=observed.length;s+=OUTPUT){
    const row=observed[s+(reverse?OUTPUT-1:0)];
    if(row.prev!==null)groups[row.section].push([row.prev,row.curr]);
  }
  return groups;
}
const all=[];
const numericCases=[];
let fullNumericFirst=null;
let maxVisited=0,unknown=0,sat=0,unsat=0;
let section7Minimum=29;
for(let phase=0;phase<OUTPUT;phase++)for(const reverse of [false,true]){
  const groups=packetLeaders(phase,reverse);
  const leaders=groups.map(g=>new Set(g.map(p=>p[1])).size);
  const impossible=leaders.map((v,j)=>v>16?j:null).filter(v=>v!==null);
  assert(impossible.includes(7));
  section7Minimum=Math.min(section7Minimum,leaders[7]);
  const candidates=groups.map(g=>{
    let result=gate(g,100000);
    if(result.status==='UNKNOWN')result=gate(g,1000000);
    maxVisited=Math.max(maxVisited,result.nodes);
    if(result.status==='SAT')sat++;
    if(result.status==='UNSAT')unsat++;
    if(result.status==='UNKNOWN')unknown++;
    return result;
  });
  const cyclic=candidates.map(x=>x.status);
  if(candidates.every(x=>x.status==='SAT')){
    const pi=candidates.map(x=>x.witness);
    const trial=trialInverse(pi,phase,reverse,false);
    numericCases.push({phase,reverse,complete:trial.complete,
      invalid:trial.invalid,valid:trial.valid});
    if(trial.invalid===0&&fullNumericFirst===null)
      fullNumericFirst={phase,reverse,complete:trial.complete,keys:pi};
  }
  all.push({phase,reverse,leaders,sortedImpossibleSections:impossible,
    cyclic});
}
assert.equal(all.length,156);
assert.equal(sat+unknown+unsat,1248);
assert.equal(all.filter(x=>x.sortedImpossibleSections.length===0).length,0);
const at0=all.filter(x=>x.phase===0);
assert(at0.every(x=>x.cyclic.every(s=>s==='SAT')));

/**
 * Interpret original source rank digits under any independently feasible
 * section-wise cyclic alphabet witnesses. This is NOT independent key recovery:
 * the gate constrains only packet-leading digits and permits very many maps.
 *
 * @param {number[][]} orders Maps glyph -> secret cyclic coordinate per section.
 * @param {number} phase
 * @returns {{complete:number,invalid:number,valid:number,firstPlain:number[]}}
 */
function trialInverse(orders,phase,reverse=false,withPlain=true){
  let valid=0,invalid=0,complete=0;
  const firstPlain=[];
  for(let s=phase;s+OUTPUT<=observed.length;s+=OUTPUT){
    if(s===0)continue; // Unknown cipher predecessor.
    let integer=0n;
    for(let j=0;j<OUTPUT;j++){
      const k=s+(reverse?OUTPUT-1-j:j),r=observed[k],
        pi=orders[r.section];
      assert(r.prev!==null);
      integer=integer*28n+BigInt(mod(pi[r.curr]-pi[r.prev]-1));
    }
    complete++;
    if(integer>=limit){invalid++;continue;}
    valid++;
    if(withPlain){
      const digits=Array(INPUT);
      for(let j=INPUT-1;j>=0;j--){
        digits[j]=Number(integer%29n);integer/=29n;
      }
      assert.equal(integer,0n);
      firstPlain.push(digits[0]);
    }
  }
  return {complete,invalid,valid,...(withPlain?{firstPlain}:{})};
}
const phase0Groups=packetLeaders(0,false);
const phase0Keys=phase0Groups.map(g=>{
  const x=gate(g,100000);
  assert.equal(x.status,'SAT');
  assert.equal(new Set(x.witness).size,29);
  return x.witness;
});
const conditional=trialInverse(phase0Keys,0);

/** @param {number} seed @returns {() => number} */
function rng(seed){let n=seed>>>0;return()=>{
  n^=n<<13;n^=n>>>17;n^=n<<5;return n>>>0;
};}

/** Demonstrate that a real byte-exact section-key radix encoder is detectable. */
function planted(){
  const input=toGematria(read('resources/control/shakespeare_first300k.txt'));
  const total=165*INPUT;
  assert(input.length>=total);
  const plain=input.slice(0,total);
  const random=rng(0x78330129);
  const pi=Array.from({length:8},()=>{
    const shuffled=Array.from({length:29},(_,i)=>i);
    for(let k=28;k>0;k--){
      const j=random()%(k+1);
      [shuffled[j],shuffled[k]]=[shuffled[k],shuffled[j]];
    }
    const rank=Array(Q);
    for(let k=0;k<Q;k++)rank[shuffled[k]]=k;
    return rank;
  });
  const inverse=pi.map(rank=>{
    const unrank=Array(Q);
    rank.forEach((v,g)=>{unrank[v]=g;});
    return unrank;
  });
  const digits=[];
  for(let k=0;k<165;k++){
    let value=0n;
    for(let j=0;j<INPUT;j++)
      value=value*29n+BigInt(plain[k*INPUT+j]);
    const d=Array(OUTPUT);
    for(let j=OUTPUT-1;j>=0;j--){
      d[j]=Number(value%28n);value/=28n;
    }
    assert.equal(value,0n);
    digits.push(...d);
  }
  assert.equal(digits.length,12870);
  const clean=[];
  let previous=17;
  for(let j=0;j<digits.length;j++){
    const sec=observed[j].section;
    previous=inverse[sec][(pi[sec][previous]+digits[j]+1)%Q];
    clean.push(previous);
  }
  const markerSet=new Set(repeats);
  const cipher=[];
  let n=0;
  for(let i=0;i<C.length;i++){
    if(markerSet.has(i)){assert(cipher.length);cipher.push(cipher.at(-1));}
    else cipher.push(clean[n++]);
  }
  assert.equal(n,clean.length);
  assert.equal(cipher.length,C.length);
  assert.deepEqual(observe(cipher).repeat,repeats);
  const repaired=observe(cipher).obs.map(x=>x.curr);
  assert.deepEqual(repaired,clean);
  previous=17;
  const decoded=[];
  for(let i=0;i<repaired.length;i+=OUTPUT){
    let value=0n;
    for(let j=0;j<OUTPUT;j++){
      const idx=i+j,sec=observed[idx].section,now=repaired[idx],
        digit=mod(pi[sec][now]-pi[sec][previous]-1);
      value=value*28n+BigInt(digit);
      previous=now;
    }
    assert.ok(value<limit);
    const one=Array(INPUT);
    for(let j=INPUT-1;j>=0;j--){
      one[j]=Number(value%29n);value/=29n;
    }
    assert.equal(value,0n);
    decoded.push(...one);
  }
  assert.deepEqual(decoded,plain);
  return {cipherRunes:cipher.length,sourceMatchedRepeatedSites:repeats.length,
    decodedGPShakespeareRunes:decoded.length,independentSectionAlphabets:pi.length,
    exactSourceNativeRoundTrip:true};
}
const positive=planted();

/**
 * Complete, exact original numeric inverse for the first original-input
 * full-capacity candidate. A brute-feasible witness is NOT evidence of the
 * authorial key: the 8 independent secret alphabets remain unidentified.
 */
function originalNumericCandidate(candidate){
  if(candidate===null)return null;
  const {phase,reverse,keys}=candidate;
  const decoded=[];
  let recipher=0;
  for(let s=phase;s+OUTPUT<=observed.length;s+=OUTPUT){
    let value=0n;
    for(let j=0;j<OUTPUT;j++){
      const i=s+(reverse?OUTPUT-1-j:j),row=observed[i],
        rank=keys[row.section],digit=mod(rank[row.curr]-rank[row.prev]-1);
      value=value*28n+BigInt(digit);
    }
    assert(value<limit);
    const digits=Array(INPUT);
    for(let j=INPUT-1;j>=0;j--){
      digits[j]=Number(value%29n);value/=29n;
    }
    assert.equal(value,0n);
    for(const symbol of digits)assert(symbol>=0&&symbol<29);
    decoded.push(...digits);
    recipher+=OUTPUT;
  }
  const n=decoded.length,counts=Array(Q).fill(0);
  for(const x of decoded)counts[x]++;
  const ioC=counts.reduce((sum,m)=>sum+m*(m-1),0)/(n*(n-1));
  const nativeFrequent=[1,3,4,9,15,16,18,24];
  const frequent=decoded.filter(x=>nativeFrequent.includes(x)).length/n;
  return {phase,reverse,decodedGPIndices:n,
    exactlyRecipheredOriginalObservedRanks:recipher,
    originalUnrecoveredRankPositions:observed.length-recipher,
    numericValidPackets:recipher/OUTPUT,
    candidateGPIndexOfCoincidence:ioC,
    candidateFrequentSourceRunes:frequent,
    nativeGPEnglishFrequencyReference:0.590328,
    exampleTransliteration:decoded.slice(0,100).map(v=>corpus.translit[v]).join(''),
    identification:'Numerically valid under an original-fitted arbitrary 8-permutation witness; this is NOT historical plaintext recovery or a decrypted passage'};
}
const candidateOriginal=originalNumericCandidate(fullNumericFirst);

const report={
  classification:'bounded original-source no-go for all 8-section secret sorted orders; cyclic original-leading SAT is NOT a manuscript decryption',
  originalRunes:C.length,repeatMarkerSites:repeats.length,
  observedRankDigits:observed.length,packets:165,
  transport:'77 GP base29 digits -> 78 predecessor-excluded base28 ranks',
  allPhases:78,orientations:2,sections:8,
  globalSortedSectionOrderCases:all.length,
  sortedImpossibleAcrossAllCases:true,
  lastSectionMinDistinctLeadingLabels:section7Minimum,
  thresholdDistinctLeadingLabels:16,
  totalCyclicSectionCspTests:sat+unsat+unknown,
  cyclicResults:{sat,unsat,unknown,maxVisited},
  phase0Forward:at0[0],phase0Reversed:at0[1],
  arbitraryPhase0CyclicWitnessNumericCapacity:{
    complete:conditional.complete,valid:conditional.valid,
    invalid:conditional.invalid,
    firstRuneIoC:conditional.firstPlain.length
      ?conditional.firstPlain.reduce((total,symbol)=>total+
        (conditional.firstPlain.filter(x=>x===symbol).length-1),0)/
          (conditional.firstPlain.length*(conditional.firstPlain.length-1))
      :null
  },
  globalCyclicOriginalNumericWitnesses:{
    evaluated:numericCases.length,completeNumberCompatible:numericCases.filter(x=>x.invalid===0).length,
    minimumOverflowPackets:Math.min(...numericCases.map(x=>x.invalid)),
    bestCases:numericCases.slice().sort((a,b)=>a.invalid-b.invalid).slice(0,7),
    firstFullNumericWitness:fullNumericFirst
  },
  syntheticGPPlaintextRoundTrip:positive,
  completeOriginalSourceNumericInverseUnderFittedKey:candidateOriginal,
  caution:'Cyclic SAT is a first-digit necessity only; arbitrary witness is key-underdetermined and its numerically valid decoded strings are not authenticated plaintext. Packet erasure and section labels are source-selected assumptions.'
};
console.log(JSON.stringify(report,null,2));