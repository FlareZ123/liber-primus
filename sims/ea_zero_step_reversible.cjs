'use strict';
/**
 * Lossless F29/28-step primitive-root codec with a transparent GP-EA marker.
 *
 * The source-derived original red quotients (15,22,78) satisfy
 * 15^2=22, 22^2=78 mod29 and ord_29(15)=28. Construct the following fully
 * reversible candidate *architecture*, not a recovered Cicada cipher:
 *
 *  P[page,0] = C[page,0] - K[page,0] (mod29).
 *  For i>0, if P[i]==EA(index28): C[i]=C[i-1].
 *  Otherwise C[i]=C[i-1]+15^((P[i]+K[i]) mod28) (mod29).
 *
 * Given the key, recover all source runes exactly. Even without the key,
 * immediate equality would locate GP-EA source runes if this model were true.
 * The cipher-word boundaries might be decoys / encoded independently.
 *
 * Test original rune/word/page exactness, page-local repeated-output events,
 * whether decoupled author-native GP source matches their word role/gap
 * distribution, and whether independent uniform 28-pad plants reproduce the
 * stronger post-selected lag-5/lag-6 events. Do not claim that passing two
 * features establishes this model or any original LP2 plaintext.
 *
 * Run: node sims/ea_zero_step_reversible.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..'),MOD=29,EA=28,ROOT15=15;
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length).map(p=>p.indices);
const flat=pages.flat(),N=flat.length;
assert.equal(pages.length,55);
assert.equal(N,12956);
const rm=new Map(corpus.runes.map((r,i)=>[r,i]));
const transcript=read('resources/lp2-transcription.txt');
const words=transcript.split('%').slice(0,55).join('%')
  .split(/[-.&$§]/u)
  .map(s=>[...s].filter(c=>rm.has(c)).map(c=>rm.get(c)))
  .filter(w=>w.length);
const lengths=words.map(w=>w.length);
const expectedRunes=words.flat();
assert.deepEqual(expectedRunes,flat);
assert.equal(words.length,2896);
const roles=words.flatMap(w=>w.map((c,i)=>
  i===0?0:i===w.length-1?1:i===1?2:3));
const roleCount=[0,0,0,0];
for(const r of roles)roleCount[r]++;
const pageStarts=new Set(),pageLengths=pages.map(p=>p.length);
let pos=0;for(const p of pages){pageStarts.add(pos);pos+=p.length;}
assert.equal(pos,N);
const mod=n=>((n%MOD)+MOD)%MOD;
const powers=Array.from({length:28},(_,i)=>{
  let x=1;for(let j=0;j<i;j++)x=(x*ROOT15)%MOD;
  return x;
});
assert.equal(new Set(powers).size,28);
assert.equal((ROOT15*ROOT15)%MOD,22);
assert.equal((22*22)%MOD,20); // =78 modulo29
const logs=new Int8Array(MOD).fill(-1);
for(let i=0;i<28;i++)logs[powers[i]]=i;
assert.equal(logs[0],-1);

/** @param {number} seed @returns {() => number} */
function rng(seed){
  let s=seed>>>0;
  return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};
}

/**
 * A 29-choice initial letter and a 28-choice per-position pad.
 * @param {number[][]} plain
 * @param {number[][]} keys First key in [0,28], remaining in [0,27]
 * @returns {number[][]}
 */
function encrypt(plain,keys){
  assert.equal(plain.length,keys.length);
  return plain.map((page,j)=>{
    assert.equal(page.length,keys[j].length);
    const c=new Array(page.length);
    if(!page.length)return c;
    c[0]=mod(page[0]+keys[j][0]);
    for(let i=1;i<page.length;i++){
      const p=page[i];
      assert(Number.isInteger(p)&&p>=0&&p<29);
      assert(Number.isInteger(keys[j][i])&&keys[j][i]>=0&&keys[j][i]<28);
      c[i]=p===EA?c[i-1]:
        mod(c[i-1]+powers[(p+keys[j][i])%28]);
    }
    return c;
  });
}

/** @param {number[][]} cipher @param {number[][]} keys */
function decrypt(cipher,keys){
  assert.equal(cipher.length,keys.length);
  return cipher.map((page,j)=>{
    assert.equal(page.length,keys[j].length);
    const p=new Array(page.length);
    if(!p.length)return p;
    p[0]=mod(page[0]-keys[j][0]);
    for(let i=1;i<p.length;i++){
      const delta=mod(page[i]-page[i-1]);
      p[i]=delta===0?EA:(logs[delta]-keys[j][i]+56)%28;
    }
    return p;
  });
}

/** @param {number[][]} input */
function markerIndices(input){
  const markers=[],letters=[];
  let global=0;
  for(let j=0;j<input.length;j++){
    const p=input[j];
    for(let i=1;i<p.length;i++)if(p[i]===p[i-1]){
      markers.push(global+i);
      letters.push({page:corpus.pages.filter(x=>x.page<56&&x.indices.length)[j].page,
        offset:i,global:global+i,repeatedCipherRune:p[i]});
    }
    global+=p.length;
  }
  return {positions:markers,details:letters};
}
const originalMarkers=markerIndices(pages);
assert.equal(originalMarkers.positions.length,86);
const hist4=positions=>{
  const hist=[0,0,0,0];
  for(const x of positions)hist[roles[x]]++;
  return hist;
};
const originalRoles=hist4(originalMarkers.positions);
assert.deepEqual(originalRoles,[23,19,11,33]);
const chi=(hist,total)=>hist.reduce((acc,v,i)=>{
  const expected=roleCount[i]*total/N;
  return acc+(v-expected)**2/expected;
},0);
const originalChi=chi(originalRoles,86);
/**
 * Preserve each exact ciphertext marker interval. Shift the marker positions
 * by every global cyclic phase relative to the real cipher-word layout.
 */
function rotationNull(){
  let larger=0,smaller=0,sum=0;
  for(let offset=0;offset<N;offset++){
    const shifted=hist4(originalMarkers.positions.map(x=>(x+offset)%N));
    const score=chi(shifted,86);
    larger+=Number(score>=originalChi);
    smaller+=Number(score<=originalChi);
    sum+=score;
  }
  return {rotations:N,meanChi:sum/N,atLeastOriginal:larger,
    tailFraction:larger/N,belowOriginal:smaller/N};
}

/** Exactly the existing author-native normalized GP words used in source tests. */
function nativeWords(){
  const lines=read('resources/liber-primus/lp1-plaintext-reference.txt')
    .split(/\r?\n/u).filter(line=>{
      const s=line.trim();
      return !s.startsWith('#')&&!s.startsWith('[')
        && !/^[0-9a-f]{25,}$/iu.test(s);
    });
  const source=lines.join(' ');
  const token=new Map(corpus.translit.map((s,i)=>[s,i]));
  /** @param {string} raw */
  function encode(raw){
    const s=raw.toUpperCase().replace(/QU/g,'CW')
      .replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S');
    const values=[];
    for(let i=0;i<s.length;){
      const dg=token.get(s.slice(i,i+2));
      if(dg!==undefined){values.push(dg);i+=2;}
      else{
        const x=token.get(s[i]);
        assert.notEqual(x,undefined);
        values.push(x);i++;
      }
    }
    return values;
  }
  return (source.match(/[A-Za-z]+/gu)||[]).map(encode)
    .filter(w=>w.length);
}
const sources=nativeWords();
const pools=new Map();
for(const w of sources){
  if(!pools.has(w.length))pools.set(w.length,[]);
  pools.get(w.length).push(w);
}
for(const n of lengths)assert.ok(pools.has(n),'Missing source word length '+n);
assert.equal(sources.length,796);
const originalEA=sources.flat().filter(x=>x===EA).length;
assert.equal(originalEA,21);

/**
 * Candidate identification under the highly specific model: one fixed
 * transparent GP symbol emits every zero-step, source words are drawn from
 * the finite solved author's vocabulary matching original word lengths.
 * Mean and variance propagate exact independent source-word draws.
 * Sorting 29 candidates is exploratory. The observed 86 is postselected.
 */
function nativeSymbolRanking(){
  const lengthCounts=new Map();
  for(const n of lengths)lengthCounts.set(n,(lengthCounts.get(n)||0)+1);
  const result=[];
  for(let symbol=0;symbol<29;symbol++){
    let expected=0,variance=0;
    for(const [n,c] of lengthCounts){
      const wordPool=pools.get(n);
      const sampleCount=wordPool.map(w=>w.filter(x=>x===symbol).length);
      const m=sampleCount.reduce((a,b)=>a+b,0)/sampleCount.length;
      const v=sampleCount.reduce((a,b)=>a+(b-m)**2,0)/
        sampleCount.length;
      expected+=c*m;
      variance+=c*v;
    }
    const sd=Math.sqrt(variance);
    result.push({symbolIndex:symbol,gpRune:corpus.translit[symbol],
      sourceExpected:expected,sourceSd:sd,
      observedDeviationSd:(86-expected)/sd});
  }
  result.sort((a,b)=>
    Math.abs(a.observedDeviationSd)-Math.abs(b.observedDeviationSd));
  assert.equal(result[0].symbolIndex,28);
  assert.equal(result.filter(x=>Math.abs(x.observedDeviationSd)<=3)
    .length,1);
  return result;
}

/**
 * Sample authentic Cicada plaintext words matched to actual cipher word
 * lengths, then ROTATE all source runes relative to cipher word boundaries.
 * @param {() => number} random
 */
function samplePlain(random){
  const source=[];
  for(const n of lengths){
    const bucket=pools.get(n),w=bucket[random()%bucket.length];
    source.push(...w);
  }
  assert.equal(source.length,N);
  const offset=random()%N;
  const rotated=source.slice(offset).concat(source.slice(0,offset));
  let pos=0;
  return pages.map(p=>rotated.slice(pos,pos+=p.length));
}
/** @param {number[]} positions */
function pairsWithinSix(positions){
  let near=0;for(let i=1;i<positions.length;i++)
    near+=Number(positions[i]-positions[i-1]<=6);
  return near;
}
const originalNear=pairsWithinSix(originalMarkers.positions);

/**
 * Post-selected rune-word motifs, used only as required counterchecks.
 * @param {number[][]} input
 */
function motifs(input){
  const stream=input.flat();
  let at=0,aff=0,affEligible=0,s5=0,s5Eligible=0,paired5=0;
  for(const n of lengths){
    for(let j=0;j<n;j++){
      if(j>=6){
        affEligible++;
        aff+=Number(stream[at+j]===mod(24-2*stream[at+j-6]));
      }
      if(j>=5){
        s5Eligible++;
        s5+=Number(stream[at+j]===15&&stream[at+j-5]===15);
      }
      if(j>=5&&j+1<n)
        paired5+=Number(stream[at+j]===stream[at+j-5]&&
          stream[at+j+1]===stream[at+j-4]);
    }
    at+=n;
  }
  return {lag6Affine:aff,lag6Eligible:affEligible,
    lag5S: s5,lag5Eligible:s5Eligible,adjacentLag5Pairs:paired5};
}
const origMotifs=motifs(pages);
assert.deepEqual(origMotifs,{lag6Affine:80,lag6Eligible:1290,
  lag5S:11,lag5Eligible:2105,adjacentLag5Pairs:9});

/**
 * Fixed-seed author-native word bootstrap, with independent cipher-word
 * boundaries and page-initial contexts. A true complete inverse plant and
 * a 28-uniform one-time-pad are evaluated on exactly the original 55 page
 * lengths. Source text + learned key reconstruct each symbol exactly.
 */
function controls(draws=3000){
  const random=rng(0x1500eace);
  const count=[],near=[],roleChi=[],motifData=[];
  let exactlyOriginalCount=0,exactInverse=0;
  const plantedExamples=[];
  for(let k=0;k<draws;k++){
    const plain=samplePlain(random);
    const keys=plain.map(p=>p.map((_,i)=>
      i===0?random()%29:random()%28));
    const encrypted=encrypt(plain,keys);
    const recovered=decrypt(encrypted,keys);
    assert.deepEqual(recovered,plain);
    exactInverse+=recovered.flat().length;
    const mark=markerIndices(encrypted).positions;
    const sourceEA=plain.reduce((sum,p)=>sum+
      p.slice(1).filter(x=>x===EA).length,0);
    assert.equal(mark.length,sourceEA);
    const h=hist4(mark);
    count.push(mark.length);
    near.push(pairsWithinSix(mark));
    roleChi.push(chi(h,mark.length));
    exactlyOriginalCount+=Number(mark.length===86);
    if(k<1000)motifData.push(motifs(encrypted));
    if(k===0)plantedExamples.push({plainEA:sourceEA,
      originalRunesRecovered: recovered.flat().length,
      firstCipherPage: encrypted[0].slice(0,14),
      firstRecoveredPage: recovered[0].slice(0,14)});
  }
  count.sort((a,b)=>a-b);
  near.sort((a,b)=>a-b);
  roleChi.sort((a,b)=>a-b);
  /** @param {number[]} arr */
  const avg=arr=>arr.reduce((a,b)=>a+b,0)/arr.length;
  const keys=['lag6Affine','lag5S','adjacentLag5Pairs'];
  const motifSummary={};
  for(const feature of keys){
    const v=motifData.map(m=>m[feature]).sort((a,b)=>a-b);
    motifSummary[feature]={
      observed:origMotifs[feature],mean:avg(v),p95:v[949],
      max:v[999],controlsAtLeastOriginal:v.filter(
        x=>x>=origMotifs[feature]).length,draws:v.length
    };
  }
  return {seed:'0x1500eace',sourceWords:sources.length,
    sourceEA:originalEA,draws,eachSourceRunes:N,
    cipherPages:pages.length,plantedExactInversions:exactInverse,
    simulatedMarkerCountMean:avg(count),
    countCentral95:[count[75],count[2924]],
    simulationsWithExactly86:exactlyOriginalCount,
    withinSixPairMean:avg(near),withinSixPairs95:[near[75],near[2924]],
    withinSixPairAtLeastOriginal:near.filter(x=>x>=originalNear).length,
    roleChiAtLeastOriginal:roleChi.filter(x=>x>=originalChi).length,
    plantedExamples,motifs:motifSummary};
}

/**
 * Exhaustive offset equality after every observed zero step. If a reusable
 * additive 28-phase pad RESTARTS at every transparent EA, then same-distance
 * log15 ciphertext steps have equal values iff underlying non-EA GP source
 * runes do, without needing to know any pad digits. The first 28 offsets
 * provide 85 source intervals after 86 original within-page doublets.
 *
 * @param {number[][]} cipher
 * @param {number} window
 */
function markerResetStatistic(cipher,window=28){
  const bins=Array.from({length:window},()=>new Uint16Array(28));
  let intervals=0;
  for(const page of cipher){
    let after=false,offset=0,active=false;
    for(let i=1;i<page.length;i++){
      const difference=mod(page[i]-page[i-1]);
      if(difference===0){
        if(active)intervals++;
        active=false;after=true;offset=0;
      }else if(after){
        active=true;
        if(offset<window)bins[offset][logs[difference]]++;
        offset++;
      }
    }
    if(active)intervals++;
  }
  let pairs=0,hits=0;
  for(const h of bins){
    let n=0;
    for(const count of h){
      n+=count;
      hits+=count*(count-1)/2;
    }
    pairs+=n*(n-1)/2;
  }
  return {intervals,window,hits,pairs,equalityRate:hits/pairs};
}

/**
 * Test the precise new synchronized-after-EA key class against exact genuine
 * solved-Cicada GP source plaintext, with independently rotating source-word
 * boundaries, independently chosen secret 256-value pads each experiment,
 * and a pad phase *reset at each source EA within each physical page*.
 * Plants decode perfectly even though the equality test never sees the key.
 */
function markerResetControl(draws=60){
  const random=rng(0x15ea3301),original=markerResetStatistic(pages);
  assert.equal(original.intervals,85);
  assert.equal(original.hits,2748);
  assert.equal(original.pairs,76880);
  const planted=[];
  let exactRecovered=0,belowOrEqualOriginal=0;
  for(let rep=0;rep<draws;rep++){
    const plain=samplePlain(random);
    const sharedPad=Array.from({length:256},()=>random()%28);
    const keyed=plain.map(page=>{
      let phase=0;
      return page.map((v,i)=>{
        if(i===0)return random()%29;
        if(v===EA){phase=0;return 0;}
        return sharedPad[(phase++)%sharedPad.length];
      });
    });
    const cipher=encrypt(plain,keyed);
    const decoded=decrypt(cipher,keyed);
    assert.deepEqual(decoded,plain);
    exactRecovered+=N;
    const score=markerResetStatistic(cipher);
    assert.ok(score.equalityRate>.05,
      'source-native true reset key must be detectable blind');
    planted.push(score.equalityRate);
    belowOrEqualOriginal+=Number(
      score.equalityRate<=original.equalityRate);
  }
  planted.sort((a,b)=>a-b);
  return {assumption:'same arbitrary 256-value F28 additive pad restarts '+
    'at every EA/zero-step; original 55 page boundaries preserved',
    uniformReference:1/28,original,positive:{draws,
      exactPlaintextSymbolsRecovered:exactRecovered,
      equalityRateMin:planted[0],
      equalityRateMedian:planted[Math.floor(draws/2)],
      equalityRateMax:planted[draws-1],
      controlsAtOrBelowOriginal:belowOrEqualOriginal},
    limitation:'Bounded keyless rejection of a single shared post-EA '+
      'phase reset; independent per-interval pad, state evolution, '+
      'or unknown intermediate language remain open.'};
}

function main(){
  const originalLogStep=new Uint16Array(28);
  for(const p of pages)for(let j=1;j<p.length;j++){
    const diff=mod(p[j]-p[j-1]);
    if(diff)originalLogStep[logs[diff]]++;
  }
  const logN=originalLogStep.reduce((a,b)=>a+b,0);
  assert.equal(logN,12901-86);
  const expected=logN/28;
  const chi28=Array.from(originalLogStep)
    .reduce((a,n)=>a+(n-expected)**2/expected,0);
  const result={
    classification:'constructive reversible original-cipher-compatible '+
      'marker model, not an original LP2 key or plaintext',
    sourceArithmetic:{root:15,field:29,rootOrder:28,
      squarings:[15,22,20],nonzeroSteps:powers},
    source:{runes:N,physicalRunePages:pages.length,
      completeCipherWords:words.length,sourceSolvedWords:sources.length},
    original:{
      knownCipherDoubletPositions:originalMarkers.details,
      repeatedSteps:86,roleCounts:originalRoles,roleExpected:
        roleCount.map(c=>c*86/N),roleChi:originalChi,
      nearEventsWithinSix:originalNear,
      nonzeroLogStepHistogram:Array.from(originalLogStep),
      nonzeroLogStepPearsonChi28:chi28,
      motifs:origMotifs
    },
    fixedMarkerNull:rotationNull(),
    finiteSolvedSourceTransparentRuneRanking:nativeSymbolRanking(),
    postEAResetPhaseInvariant:markerResetControl(),
    nativeLosslessPositive:controls(),
    conditionalConsequence:'If the actual cipher is exactly this 29-rune '+
      'zero-step-EA transducer, 86 source GP EA rune identities and '+
      'positions are directly exposed by original ciphertext doublets. '+
      'This is a conditional anchor; no authentic key was found.',
    missingMechanism:'An independent uniform 28-step pad model does not '+
      'reproduce the selected original lag-5 and lag-6 echoes. Any '+
      'source-selected successful inverse must additionally account for '+
      'those events and original word/layout structure.'
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)main();
module.exports={powers,logs,encrypt,decrypt,markerIndices,rotationNull,
  samplePlain,controls,motifs,markerResetStatistic,markerResetControl,main};
