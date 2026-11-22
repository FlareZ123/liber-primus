'use strict';

/**
 * Recover every p15–22 source-cofactor-16 candidate from the chapter's 18
 * one-rune words under fixed plaintext A/I hidden-symbol values. Rank each
 * candidate on completely untouched chapter rune positions; independently
 * run the same solver on a native-GP solved-p57 ciphertext plant.
 *
 * Tested keys are exhaustive among 18 independent anchor equations; the
 * language ranking is a finite statistical candidate screen, not a proof.
 * Node22 CommonJS; no third-party dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const cp = JSON.parse(fs.readFileSync(
  path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const grid = JSON.parse(fs.readFileSync(
  path.join(root,'resources/liber-primus/lp2-grid-256.json'),'utf8'));
const transcript = fs.readFileSync(
  path.join(root,'resources/lp2-transcription.txt'),'utf8');

const M = 29;
const mod = v => (v % M + M) % M;
const inv = Array(M).fill(0);
for (let a=1;a<M;a++)for(let b=1;b<M;b++)if(a*b%M===1)inv[a]=b;
const polynomials = [
  {name:'R16',poly:[13,20,26,12,6,2,13,26,6,26,11,7,15,11,17,25,1]},
  {name:'reverseR16',poly:[1,25,17,11,15,7,11,26,6,26,13,2,6,12,26,20,13]}
];
const inputPages = cp.pages.filter(p=>p.page>=15&&p.page<=22);
const original = inputPages.flatMap(p=>p.indices);
assert.equal(original.length,1903);
const firstOriginal = cp.pages.filter(p=>p.page<15).reduce(
  (s,p)=>s+p.indices.length,0);
assert.equal(firstOriginal,3603);
const runeIndex = new Map(cp.runes.map((ch,i)=>[ch,i]));
const printedWords=[];
let current=[],runeOffset=0;
const finish=()=>{if(current.length){printedWords.push({
  start:current[0][0],glyphs:current.map(x=>x[1])
});current=[]}};
for(const ch of transcript.split('%').slice(0,55).join('%')){
  if(runeIndex.has(ch)){current.push([runeOffset++,runeIndex.get(ch)]);}
  else if(ch==='%'||ch==='/'||/\s/u.test(ch)){}
  else finish();
}
finish();
assert.equal(runeOffset,12956);
assert.equal(printedWords.length,2896);
const chapter=printedWords.filter(w=>
  w.start>=firstOriginal&&w.start<firstOriginal+original.length)
  .map((w,i)=>({start:w.start-firstOriginal,glyphs:w.glyphs,ordinal:i}));
assert.equal(chapter.length,437);
assert.equal(chapter[0].start,0);
const clockWord=new Uint16Array(original.length);
for(const w of chapter)for(let i=0;i<w.glyphs.length;i++)
  clockWord[w.start+i]=w.ordinal;
const anchors=chapter.filter(w=>w.glyphs.length===1)
  .map(w=>({r:w.start,w:w.ordinal,c:w.glyphs[0]}));
assert.equal(anchors.length,18);

const dot=(x,y)=>{let z=0;for(let j=0;j<x.length;j++)z+=x[j]*y[j];return mod(z)};

function coefficientRows(poly,n){
  const a=poly.map(v=>mod(v*inv[poly[16]]));
  const rows=Array.from({length:16},(_,j)=>{
    const row=new Uint8Array(16);row[j]=1;return row;
  });
  for(let t=16;t<n;t++){
    const row=new Uint8Array(16);
    for(let j=0;j<16;j++){
      let sum=0;
      for(let k=0;k<16;k++)sum+=a[k]*rows[t-16+k][j];
      row[j]=mod(-sum);
    }
    rows.push(row);
  }
  return rows;
}

function matrixInverse16(input){
  const a=input.map((row,i)=>[...row,
    ...Array.from({length:16},(_,j)=>+(i===j))]);
  for(let col=0;col<16;col++){
    let p=col;while(p<16&&a[p][col]===0)p++;
    assert(p<16,'first16 chapter singleton register rows must be independent');
    [a[col],a[p]]=[a[p],a[col]];
    const scale=inv[a[col][col]];
    for(let j=0;j<32;j++)a[col][j]=mod(a[col][j]*scale);
    for(let i=0;i<16;i++){
      if(i===col)continue;
      const scale2=a[i][col];
      if(scale2)for(let j=0;j<32;j++)
        a[i][j]=mod(a[i][j]-scale2*a[col][j]);
    }
  }
  return a.map(row=>row.slice(16));
}

function sampleCollisionScore(cipher,keyAt,samples){
  const bins=new Uint16Array(29);
  for(let j=0;j<samples.length;j++)
    bins[mod(cipher[samples[j]]-keyAt(samples[j]))]++;
  let count=0;
  for(const n of bins)count+=n*(n-1);
  return count/(samples.length*(samples.length-1));
}

function fullCollisionScore(cipher,rows,wordClock,candidate,invAnchor,first16C){
  const shift=Array.from({length:16},(_,j)=>
    first16C[j]-((j===0 || ((candidate.mask>>(j-1))&1)===0)
      ?candidate.uA:candidate.uI));
  const seed=invAnchor.map(row=>dot(row,shift));
  const bins=new Uint16Array(29);
  for(let i=0;i<cipher.length;i++){
    const t=wordClock?clockWord[i]:i;
    bins[mod(cipher[i]-dot(rows[t],seed))]++;
  }
  const count=bins.reduce((sum,n)=>sum+n*(n-1),0);
  return {score:count/(cipher.length*(cipher.length-1)),
    seed,frequency:[...bins].sort((a,b)=>b-a).slice(0,6)};
}

/**
 * Enumerate ALL label patterns first singleton=A, remaining 17 unknown A/I.
 * For the first 16 independent time rows, eliminate 16 unknown seed values;
 * two terminal equations solve uA/uI with a 2x2 linear system. Singular
 * equations enumerate every valid free pair of secret values in GF29.
 */
function solve(cipher,rows,wordClock,label){
  const lookup=t=>rows[t],targets=anchors.map(a=>({
    t:wordClock?a.w:a.r,c:cipher[a.r]
  }));
  const invAnchor=matrixInverse16(
    targets.slice(0,16).map(a=>lookup(a.t)));
  const first16C=targets.slice(0,16).map(a=>a.c);
  const interpolate=t=>Array.from({length:16},(_,j)=>{
    let z=0;for(let i=0;i<16;i++)z+=lookup(t)[i]*invAnchor[i][j];
    return mod(z);
  });
  const last1=interpolate(targets[16].t);
  const last2=interpolate(targets[17].t);
  const h1=mod(targets[16].c-dot(last1,first16C));
  const h2=mod(targets[17].c-dot(last2,first16C));
  const total1=last1.reduce((a,b)=>a+b,0)%M;
  const total2=last2.reduce((a,b)=>a+b,0)%M;
  const sample=Array.from({length:cipher.length},(_,i)=>i)
    .filter(i=>i%7===2 && !anchors.some(a=>a.r===i));
  assert(sample.length>=265);
  const interpolated=sample.map(i=>
    interpolate(wordClock?clockWord[i]:i));
  const base=interpolated.map(row=>dot(row,first16C));
  const total=interpolated.map(row=>
    row.reduce((a,b)=>a+b,0)%M);
  const sumI=new Uint8Array(sample.length);
  let oldGray=0;
  const candidates=[];
  const stats={label,clock:wordClock?'word':'rune',
    labelPatterns:0,independent:0,singular:0,consistentSingular:0,
    secretCandidates:0,sampledRunes:sample.length};
  function consider(mask,uA,uI){
    if(uA===uI)return;
    const bins=new Uint16Array(29);
    for(let j=0;j<sample.length;j++){
      const k=base[j]-total[j]*uA-sumI[j]*(uI-uA);
      bins[mod(cipher[sample[j]]-k)]++;
    }
    let collisions=0;for(const n of bins)collisions+=n*(n-1);
    candidates.push({mask,uA,uI,
      sampleScore:collisions/(sample.length*(sample.length-1))});
    stats.secretCandidates++;
  }
  function singular(a,b,c,d,mask){
    // First equation a*uA + b*uI = h1; second c*uA+d*uI=h2.
    stats.singular++;
    let feasible=false;
    if(b!==0 || d!==0){
      for(let uA=0;uA<M;uA++){
        const rhs1=mod(h1-a*uA),rhs2=mod(h2-c*uA);
        const uI=b!==0?mod(rhs1*inv[b]):mod(rhs2*inv[d]);
        if(mod(a*uA+b*uI)===h1&&mod(c*uA+d*uI)===h2){
          feasible=true;consider(mask,uA,uI);
        }
      }
    }else if(a!==0||c!==0){
      const uA=a!==0?mod(h1*inv[a]):mod(h2*inv[c]);
      if(mod(a*uA)===h1&&mod(c*uA)===h2){
        feasible=true;
        for(let uI=0;uI<M;uI++)consider(mask,uA,uI);
      }
    }else if(h1===0&&h2===0){
      feasible=true;
      for(let uA=0;uA<M;uA++)
        for(let uI=0;uI<M;uI++)consider(mask,uA,uI);
    }
    if(feasible)stats.consistentSingular++;
  }
  let sumI1=0,sumI2=0;
  for(let g=0;g<(1<<15);g++){
    const gray=g^(g>>>1);
    if(g){
      const changed=gray^oldGray;
      const bit=31-Math.clz32(changed);
      const delta=(gray&changed)?1:-1;
      sumI1=mod(sumI1+delta*last1[bit+1]);
      sumI2=mod(sumI2+delta*last2[bit+1]);
      for(let j=0;j<sample.length;j++)
        sumI[j]=mod(sumI[j]+delta*interpolated[j][bit+1]);
    }
    oldGray=gray;
    for(let end=0;end<4;end++){
      stats.labelPatterns++;
      const e1=end&1,e2=(end>>>1)&1;
      const a=mod((e1?0:1)-total1+sumI1);
      const b=mod(e1-sumI1);
      const c=mod((e2?0:1)-total2+sumI2);
      const d=mod(e2-sumI2);
      const det=mod(a*d-b*c);
      if(det){
        stats.independent++;
        const uA=mod((h1*d-b*h2)*inv[det]);
        const uI=mod((a*h2-h1*c)*inv[det]);
        consider(gray,uA,uI);
      }else singular(a,b,c,d,gray);
    }
  }
  candidates.sort((a,b)=>b.sampleScore-a.sampleScore);
  const top=candidates.slice(0,1500)
    .map(c=>({...c,...fullCollisionScore(
      cipher,rows,wordClock,c,invAnchor,first16C)}));
  top.sort((a,b)=>b.score-a.score);
  const answer={stats,topSample:candidates.slice(0,3),
    topFull:top.slice(0,5),bestFullScore:top[0]?.score,
    minTopFullScore:top.at(-1)?.score};
  if(label==='native-positive'){
    // The actual planted key must be among the top full candidates for the
    // test to have recovery power; one known full keystream reencrypts.
    const target=[...Array(16)].map((_,j)=>(j*7+3)%M);
    const native=top.find(c=>c.seed.every((v,j)=>v===target[j]));
    answer.nativeFound=Boolean(native);
    answer.nativeRank=native?top.indexOf(native)+1:-1;
    if(native)answer.nativeScore=native.score;
  }
  return answer;
}

const p57=cp.pages.find(p=>p.page===57).indices;
assert.equal(p57.length,95);
const plantedPlain=Array.from({length:original.length},
  (_,i)=>p57[i%p57.length]);
anchors.forEach((a,i)=>{
  plantedPlain[a.r]=i%2?10:24; // authentic GP A/I literals
});
const results=[];
for(const {name,poly} of polynomials){
  for(const wordClock of [false,true]){
    const rows=coefficientRows(poly,wordClock?chapter.length:original.length);
    const candidate=solve(original,rows,wordClock,'original');
    const secret=Array.from({length:16},(_,j)=>(j*7+3)%M);
    const positive=plantedPlain.map((plain,i)=>mod(
      2-plain+dot(rows[wordClock?clockWord[i]:i],secret)));
    const positiveResult=solve(positive,rows,wordClock,'native-positive');
    results.push({
      direction:name,
      clock:wordClock?'word':'rune',
      original:candidate,
      nativePositive:{
        recoveredSourceSeed:positiveResult.nativeFound,
        rank:positiveResult.nativeRank,
        originalPlantIoC:positiveResult.nativeScore,
        bestFullScore:positiveResult.bestFullScore,
        candidates:positiveResult.stats.secretCandidates
      }
    });
  }
}
console.log(JSON.stringify({status:'source chapter key search complete',
  p15p22Runes:original.length,printedWords:chapter.length,
  chapterSingletonAnchors:anchors.length,
  models:'every 16-register seed satisfying 18 singleton anchors, including all singular label systems; arbitrary fixed output alphabet',
  results},null,2));
