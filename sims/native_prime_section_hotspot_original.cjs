"use strict";
/**
 * Source-original GP-prime clause enrichment by the nine $-delimited LP2
 * ciphertext sections, without assuming a cipher or recovering plaintext.
 *
 * Two independently seeded, source-constrained controls:
 *  1. shuffle GP runes only inside their actual physical page;
 *  2. rotate each page's complete rune stream, retaining exact circular
 *     adjacency and all original glyph counts.
 *
 * Both keep every printed punctuation clause's exact rune length. Select
 * the most anomalous of nine sections in the null as in the original, to
 * control this *finite nine-section selection*; this is NOT a discovery-wide
 * p-value over other historical tests. No files written.
 *
 * Reproduce: node sims/native_prime_section_hotspot_original.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source=read("resources/transcriptions/liber_primus_master.txt");
const runeIndex=new Map(corpus.runes.map((s,i)=>[s,i]));
const originalPages=corpus.pages.filter(p=>p.page<56);
const original=originalPages.flatMap(p=>p.indices);
const body=source.split("%").slice(16,72).join("%");
const fromSource=[...body].filter(x=>runeIndex.has(x)).map(x=>runeIndex.get(x));
assert.deepEqual(fromSource,original);
assert.equal(original.length,12956);
const sections=body.split("$").map(s=>s.split(".").map(t=>
  [...t].filter(x=>runeIndex.has(x)).map(x=>runeIndex.get(x))
).filter(a=>a.length)).filter(s=>s.length);
assert.equal(sections.length,9);
const ends=[],sectionID=[];
let pos=0;
for(let j=0;j<sections.length;j++)for(const clause of sections[j]){
  pos+=clause.length;
  ends.push(pos);
  sectionID.push(j);
}
assert.equal(ends.length,168);
assert.equal(pos,original.length);
const pageRanges=[];
pos=0;
for(const page of originalPages){
  pageRanges.push([pos,page.indices.length]);
  pos+=page.indices.length;
}
const maxSum=Math.max(...sections.flatMap(s=>s.map(clause=>clause.length)))*109;
const prime=new Uint8Array(maxSum+1).fill(1);
prime[0]=prime[1]=0;
for(let i=2;i*i<prime.length;i++)if(prime[i])
  for(let j=i*i;j<prime.length;j+=i)prime[j]=0;

/** @param {number[]} stream @returns {number[]} */
function score(stream){
  const counts=Array(sections.length).fill(0);
  let sum=0,k=0;
  for(let i=0;i<stream.length;i++){
    sum+=corpus.prime[stream[i]];
    if(i+1===ends[k]){
      counts[sectionID[k]]+=prime[sum];
      sum=0;k++;
    }
  }
  assert.equal(k,ends.length);
  return counts;
}
const actual=score(original);
assert.deepEqual(actual,[0,4,6,0,2,0,9,4,6]);
const target=6;
assert.equal(sections[target].length,25);
assert.equal(sections[target].reduce((n,a)=>n+a.length,0),1524);

/** @param {number} seed @returns {()=>number} */
function rng(seed){
  let state=seed>>>0;
  return ()=>{
    state^=state<<13;
    state^=state>>>17;
    state^=state<<5;
    return state>>>0;
  };
}

/** @param {"shuffle"|"rotate"} mode @param {number} seed
 *  @param {number} repetitions */
function simulate(mode,seed,repetitions){
  const random=rng(seed);
  const candidate=original.slice(),samples=[];
  const sums=Array(sections.length).fill(0);
  const squares=Array(sections.length).fill(0);
  let totalTail=0,sectionTail=0;
  const totalActual=actual.reduce((a,b)=>a+b,0);
  for(let t=0;t<repetitions;t++){
    for(const [lo,len] of pageRanges){
      if(mode==="shuffle"){
        for(let i=lo+len-1;i>lo;i--){
          const j=lo+random()%(i-lo+1);
          [candidate[i],candidate[j]]=[candidate[j],candidate[i]];
        }
      }else{
        const shift=len?random()%len:0;
        for(let j=0;j<len;j++)
          candidate[lo+j]=original[lo+(j+shift)%len];
      }
    }
    const v=score(candidate);
    samples.push(v);
    sectionTail+=Number(v[target]>=actual[target]);
    totalTail+=Number(v.reduce((a,b)=>a+b,0)>=totalActual);
    for(let j=0;j<v.length;j++){
      sums[j]+=v[j];squares[j]+=v[j]*v[j];
    }
  }
  const mean=sums.map(v=>v/repetitions);
  const sd=mean.map((v,j)=>Math.sqrt(squares[j]/repetitions-v*v));
  const z=actual.map((v,j)=>(v-mean[j])/sd[j]);
  const maxZ=Math.max(...z),maxSection=z.indexOf(maxZ);
  const familyTail=samples.filter(row=>row.some((v,j)=>
    (v-mean[j])/sd[j]>=maxZ)).length;
  return {
    mode,seed:"0x"+seed.toString(16),repetitions,
    means:mean,standardDeviations:sd,
    originalStandardizedExcess:z,
    bestSection:maxSection,bestZ:maxZ,
    selectedSectionAtLeastOriginal:sectionTail,
    selectedSectionAddOneP:(sectionTail+1)/(repetitions+1),
    nineSectionMaxTail:familyTail,
    nineSectionMaxAddOneP:(familyTail+1)/(repetitions+1),
    wholeBookAtLeastOriginal:totalTail,
    wholeBookAddOneP:(totalTail+1)/(repetitions+1)
  };
}

const shuffle=simulate("shuffle",0x46b17420,20000);
const rotate=simulate("rotate",0x46b17717,20000);
assert.equal(shuffle.bestSection,6);
assert.equal(shuffle.selectedSectionAtLeastOriginal,39);
assert.equal(shuffle.nineSectionMaxTail,256);
assert.equal(rotate.bestSection,6);
assert.equal(rotate.selectedSectionAtLeastOriginal,51);
assert.equal(rotate.nineSectionMaxTail,312);
const primeSums=sections[target].map(clause=>
  clause.reduce((total,rune)=>total+corpus.prime[rune],0)
).filter(v=>prime[v]);
assert.deepEqual(primeSums,[1109,9227,587,1637,2203,2029,3571,379,4339]);
console.log(JSON.stringify({
  status:"exploratory original-ciphertext source pattern; no plaintext or key",
  originalRunes:original.length,sectionCount:sections.length,
  originalSectionClauseCounts:sections.map(s=>s.length),
  originalPrimeClauses:actual,
  selectedSection:{
    index:target,globalRuneOffsetsHalfOpen:[6527,8051],
    physicalPages:[27,28,29,30,31,32,33],
    primeClauses:actual[target],totalClauses:sections[target].length,
    sourcePrimeSums:primeSums
  },
  shuffle,rotate,
  limitations:"Both statistics were selected after source examination; nine-section corrections exclude the wider clue search. Printed punctuation may not mark true plaintext clauses."
},null,2));
