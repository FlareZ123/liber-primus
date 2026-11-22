'use strict';

/**
 * All 30,784 GF(31) projective coefficient rows and four possible 4-token
 * block phases on exact LP2 original rune+space+stop tape.
 * A GF(31) Hill4 inverse, with any secret nonsingular 4x4 matrix and any
 * affine row constant, can only permute the output's 31-symbol frequencies;
 * the number of items in its two most common symbol bins is determined by
 * one projective coefficient row. Exhaust all projective classes rather
 * than search any particular key.
 *
 * Windows Node.js 22 SFT: node sims/lp2_gp31_allkey_hill4_space_capacity_sft.cjs
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const segments=read('resources/liber-primus/lp2-transcription.txt').split('%');
const runeMap=new Map(gp.runes.map((g,i)=>[g,i]));
const PRIME=31;
/** @param {number} v @returns {number} */
const mod=v=>(v%PRIME+PRIME)%PRIME;

/** @param {number} first @param {number} last */
function originalTape(first,last){
  const tokens=[];
  for(let page=first;page<=last;page++)if(page!==50){
    const raw=segments[page<50?page:page-1];
    for(const c of raw){
      if(runeMap.has(c))tokens.push(runeMap.get(c));
      else if(c==='-')tokens.push(29);
      else if(c==='.')tokens.push(30);
      else if('&$§/\r\n \t'.includes(c))continue;
      else throw Error('Unknown source symbol '+c);
    }
  }
  assert.deepEqual(tokens.filter(x=>x<29),
    gp.pages.filter(p=>p.page>=first&&p.page<=last).flatMap(p=>p.indices));
  return tokens;
}

/** @param {number[]} values */
function pairCount(values){
  const counts=new Uint32Array(PRIME);
  for(const value of values)counts[value]++;
  let highest=0,second=0;
  for(const n of counts){
    if(n>highest){second=highest;highest=n;}
    else if(n>second)second=n;
  }
  return highest+second;
}
/** @param {number[]} a @param {number[]} b */
const same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);

/** @param {number[]} source @param {number} phase */
function blocks(source,phase){
  const out=[];
  for(let j=phase;j+3<source.length;j+=4)
    out.push(source.slice(j,j+4));
  return out;
}
/** @param {number[][]} input @param {number[]} row */
function rowCounts(input,row){
  const frequencies=new Uint16Array(PRIME);
  for(const v of input){
    const x=(v[0]*row[0]+v[1]*row[1]+v[2]*row[2]+v[3]*row[3])%PRIME;
    frequencies[x]++;
  }
  let highest=0,second=0;
  for(const n of frequencies){
    if(n>highest){second=highest;highest=n;}
    else if(n>second)second=n;
  }
  return highest+second;
}

/** @param {number[][]} pageBlocks */
function enumerateAllRows(pageBlocks){
  let rows=0,best=-1,bestRow=null,bestNonunit=-1;
  let nonunitRow=null,atLeastTwentyTwo=0;
  for(let first=0;first<4;first++){
    const total=PRIME**(3-first);
    for(let rank=0;rank<total;rank++){
      const row=[0,0,0,0];
      row[first]=1;
      let n=rank;
      for(let j=3;j>first;j--){
        row[j]=n%PRIME;
        n=Math.floor(n/PRIME);
      }
      const count=rowCounts(pageBlocks,row);
      rows++;
      if(count>best){best=count;bestRow=row.slice();}
      if(row.filter(v=>v!==0).length>1&&count>bestNonunit){
        bestNonunit=count;nonunitRow=row.slice();
      }
      if(count/pageBlocks.length>=0.22)atLeastTwentyTwo++;
    }
  }
  assert.equal(rows,30784);
  return{projectiveRows:rows,blocks:pageBlocks.length,
    maxTwoBinCount:best,maxTwoBinRate:best/pageBlocks.length,
    bestRow,bestMixedRow:nonunitRow,
    maxMixedTwoBinCount:bestNonunit,
    maxMixedTwoBinRate:bestNonunit/pageBlocks.length,
    candidatesWithRateAtLeast22pct:atLeastTwentyTwo};
}

/**
 * Encode a historic English word into the solved-Cicada GP29 orthography.
 * Explicitly includes ING -> NG (one rune), IO -> IA (one rune), and
 * K/Q/V/Z normalizations. Longest GP tokens consume first.
 * @param {string} word @param {Array<{sym:string,i:number}>} glyphs
 * @returns {number[]}
 */
function encode(word,glyphs){
  const str=word.toUpperCase().replace(/QU/g,'CW')
    .replace(/V/g,'U').replace(/[KQ]/g,'C')
    .replace(/Z/g,'S').replace(/ING/g,'NG').replace(/IO/g,'IA');
  const out=[];
  for(let i=0;i<str.length;){
    const found=glyphs.find(x=>str.startsWith(x.sym,i));
    assert(found,'Cannot encode GP spelling '+str.slice(i));
    out.push(found.i);
    i+=found.sym.length;
  }
  return out;
}
const glyphs=gp.translit.map((sym,i)=>({sym,i}))
  .sort((a,b)=>b.sym.length-a.sym.length);
const donors=read('resources/control/gibran_prophet_58585.txt')+' '+
  read('resources/control/shakespeare_first300k.txt');
const wordBins=new Map();
for(const raw of donors.match(/[a-zA-Z]+/g)||[]){
  const val=encode(raw,glyphs);
  if(!wordBins.has(val.length))wordBins.set(val.length,[]);
  wordBins.get(val.length).push(val);
}
assert.ok((wordBins.get(14)||[]).length>0);

/** @param {number} seed @returns {()=>number} */
function random(seed){
  let x=seed>>>0;
  return ()=>{
    x^=x<<13;x^=x>>>17;x^=x<<5;
    return x>>>0;
  };
}

/**
 * Keep every source word's exact original GP rune length and its printed
 * hyphen/full-stop positions. Choose words independently from two pinned
 * native-English text donors, conditional ONLY on length. No cipher
 * fitting, no plaintext decoder, no source-content-conditioned rerolls.
 * @param {number[]} layout @param {number} seed
 */
function nativeWordsAtSourceLengths(layout,seed){
  const rand=random(seed),result=[];
  let length=0;
  /** @returns {void} */
  function flush(){
    if(!length)return;
    const candidates=wordBins.get(length);
    assert(candidates&&candidates.length,'Missing donor length '+length);
    const picked=candidates[rand()%candidates.length];
    result.push(...picked);
    length=0;
  }
  for(const item of layout){
    if(item<29)length++;
    else{
      flush();
      result.push(item);
    }
  }
  flush();
  assert.equal(result.length,layout.length);
  assert.deepEqual(result.map(x=>x>=29?x:-1).filter(x=>x>=29),
    layout.filter(x=>x>=29));
  return result;
}
/** @param {number[]} t @param {number} phase */
function perColumnTwoBins(t,phase){
  const out=Array.from({length:4},()=>[]);
  for(let j=phase;j+3<t.length;j+=4)
    for(let k=0;k<4;k++)out[k].push(t[j+k]);
  return out.map(p=>({n:p.length,top2:pairCount(p),
    top2rate:pairCount(p)/p.length}));
}
/** @param {number[][]} A @param {number[][]} B */
function product(A,B){
  return A.map(row=>B[0].map((_,j)=>mod(
    row.reduce((s,v,k)=>s+v*B[k][j],0))));
}
/** @param {number[]} source @param {number[][]} M */
function hill(source,M){
  const output=source.slice();
  for(let i=0;i+3<source.length;i+=4)
    for(let row=0;row<4;row++)output[i+row]=mod(
      M[row].reduce((s,v,k)=>s+v*source[i+k],0));
  return output;
}
const M=[[3,29,21,0],[23,13,12,17],[2,8,10,23],[21,28,26,22]],
      Minv=[[8,4,22,19],[8,9,8,3],[10,18,5,2],[7,17,8,18]];
assert.deepEqual(product(M,Minv),
  [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]);
assert.deepEqual(product(Minv,M),
  [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]);

function main(){
  const regions=[
    {first:16,last:22,runes:1744,tokens:2144},
    {first:40,last:53,runes:3008,tokens:3677}
  ];
  const report={hypothesis:'Any secret affine 4x4 GP31 Hill inverse on 29 GP runes, literal hyphen and full stop',
    keyClass:'All 30784 projective row vectors across four block phases',
    input:'Unaltered p0–p55 GP29 source indices, original printed punctuation',
    note:'Exact projective row saturation; native-control comparison is conditional on the pinned solved-GP spelling and historic English donors',
    original:[],nativeControls:[]};
  let earlyMax=0,holdMax=0,heldoutLowestNative=1;
  for(const region of regions){
    const source=originalTape(region.first,region.last);
    assert.equal(source.length,region.tokens);
    assert.equal(source.filter(x=>x<29).length,region.runes);
    const phaseRecords=[];
    let originalMax=0;
    for(let phase=0;phase<4;phase++){
      const result=enumerateAllRows(blocks(source,phase));
      phaseRecords.push({phase,...result});
      originalMax=Math.max(originalMax,result.maxTwoBinRate);
      assert.ok(result.maxMixedTwoBinRate<0.14,
        'mixed row should not mimic a frequent native plaintext symbol pair');
    }
    if(region.first===16)earlyMax=originalMax;
    else holdMax=originalMax;
    report.original.push({pages:[region.first,region.last],
      tokens:source.length,originalMax,phases:phaseRecords});
    const nativeSamples=[];
    let nControlsAbove=0,minNativeAcrossAll=1;
    for(let trial=0;trial<128;trial++){
      const native=nativeWordsAtSourceLengths(source,
        (0x3301c1ca+Math.imul(trial,0x9e3779b9))>>>0);
      let minPhase=1;
      for(let phase=0;phase<4;phase++){
        const columns=perColumnTwoBins(native,phase);
        minPhase=Math.min(minPhase,...columns.map(x=>x.top2rate));
      }
      if(minPhase>originalMax)nControlsAbove++;
      minNativeAcrossAll=Math.min(minNativeAcrossAll,minPhase);
      if(trial===0){
        // Positive plant: native control with real original word lengths and
        // every literal boundary, encrypted under p15's authentic numeric
        // matrix. The known true rows of Minv recover all native symbols.
        const encrypted=hill(native,M);
        const recovered=hill(encrypted,Minv);
        assert.deepEqual(recovered,native);
        const recoveredRows=Minv.map(row=>rowCounts(blocks(encrypted,0),row));
        assert.deepEqual(recoveredRows,
          perColumnTwoBins(native,0).map(x=>x.top2));
        nativeSamples.push({seed:(0x3301c1ca>>>0),
          fourPhaseZeroColumns:perColumnTwoBins(native,0),
          minimumAllPhases:minPhase,
          exactKnownKeyPositive:true});
      }
    }
    report.nativeControls.push({pages:[region.first,region.last],
      samples:128,
      eachControlUsesSourcePrintedBoundaryAndWordLength:true,
      controlsWithEveryNativePhaseStrongerThanOriginalMaximum:nControlsAbove,
      lowestAcrossAllControls:minNativeAcrossAll,
      firstControl:nativeSamples[0]});
    if(region.first===40)heldoutLowestNative=minNativeAcrossAll;
  }
  assert.ok(holdMax<0.22,'Held-out all-key upper bound must hold');
  assert.ok(heldoutLowestNative>holdMax,
    'Every length-matched native control should exceed the all-key original upper bound');
  report.decision='No original p40–53 GF31 affine Hill4 coefficient row at any of four phases matches the two-mode concentration of even the weakest 128 pinned GP-native reference plants. All-secret original negative; not a universal language impossibility theorem.';
  report.originalOpeningBest=earlyMax;
  report.originalHeldoutBest=holdMax;
  console.log(JSON.stringify(report,null,2));
}
main();
