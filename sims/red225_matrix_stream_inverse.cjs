'use strict';
/**
 * An actual source-derived stream-cipher inverse from 225 physically
 * red-marked LP2 GP runes. Interpret them as a 15x15 transition over F29,
 * choose a 15-vector seed from the same source, emit 15 key runes, then
 * transition state <- M*state. Search only fixed source geometries and
 * independently declared page/section/book state resets; no key values
 * fit to original ciphertext. Matrix transition is a hypothesis, not a
 * proven Cicada operation.
 *
 * Exact encrypted/corrupted/decoded controls use held-out GP-English.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const base=require('./relative_key_english_probe.cjs');
const ROOT=path.resolve(__dirname,'..'),MOD=29,S=15;
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const glyphs=new Map(corpus.runes.map((c,i)=>[c,i]));
const red=ink.pages.flatMap(page=>(page.red_spans||[])
  .flatMap(span=>[...span.runes].map(x=>glyphs.get(x))));
assert.equal(red.length,225);
const pageRuns=corpus.pages.filter(page=>page.page<=55&&page.indices.length)
  .map(p=>p.indices);
const mod=x=>((x%MOD)+MOD)%MOD;
const rowValues=Array.from({length:S},(_,i)=>red.slice(i*S,(i+1)*S));
const serpValues=rowValues.flatMap((row,i)=>i%2?row.slice().reverse():row);
function transpose(v){return Array.from({length:S*S},(_,i)=>v[(i%S)*S+Math.floor(i/S)]);}
function multiply(M,s){
  const out=new Uint8Array(S);
  for(let i=0;i<S;i++){let sum=0;for(let j=0;j<S;j++)sum+=M[i*S+j]*s[j];
    out[i]=mod(sum);
  }
  return out;
}
const sourceMatrices=[
  ['red-index',red],
  ['red-prime',red.map(i=>corpus.prime[i]%MOD)],
  ['red-serp-index',serpValues],
  ['red-serp-prime',serpValues.map(i=>corpus.prime[i]%MOD)]
].flatMap(([name,values])=>[
  {name:name+'-column',M:values.map(mod)},
  {name:name+'-row',M:transpose(values).map(mod)}
]);
/** 
 * Preserve the actual source order in all state restart policies. 
 * @param {string} mode
 * @param {number[][]} pages
 */
function groups(mode,pages){
  if(mode==='page')return pages;
  if(mode==='global')return [pages.flat()];
  const raw=read('resources/lp2-transcription.txt').split('%').slice(0,55).join('%');
  const groups=raw.split('$').map(part=>[...part].filter(c=>glyphs.has(c))
    .map(c=>glyphs.get(c))).filter(x=>x.length);
  assert.equal(groups.length,8);
  assert.deepEqual(groups.flat(),pages.flat());
  return groups;
}
/** 15-state source-only seed families, no language-fitting of parameters. */
function seeds(M){
  return [
    {name:'first-row',values:M.slice(0,S)},
    {name:'last-row',values:M.slice(-S)},
    {name:'first-column',values:Array.from({length:S},(_,i)=>M[i*S])},
    {name:'diagonal',values:Array.from({length:S},(_,i)=>M[i*S+i])}
  ];
}
/**
 * Decode with one signed additive mask obtained from matrix dynamics.
 * @param {number[][]} segments
 * @param {number[]} matrix
 * @param {number[]} initial
 * @param {number} initialAdvance
 * @param {number} sign
 * @param {Float64Array} prior
 */
function decrypt(segments,matrix,initial,initialAdvance,sign,prior){
  let score0=0,score1=0,n0=0,n1=0,at=0,head='';
  let matches=[new Uint32Array(MOD),new Uint32Array(MOD)];
  for(const segment of segments){
    let state=Uint8Array.from(initial);
    if(initialAdvance)state=multiply(matrix,state);
    for(let j=0;j<segment.length;){
      const take=Math.min(S,segment.length-j);
      for(let k=0;k<take;k++){
        const plain=mod(segment[j+k]+sign*state[k]);
        const half=at<6480?0:1;
        if(half===0){score0+=Math.log(MOD*prior[plain]);n0++;}
        else {score1+=Math.log(MOD*prior[plain]);n1++;}
        matches[half][plain]++;
        if(head.length<135)head+=corpus.translit[plain];
        at++;
      }
      j+=take;
      state=multiply(matrix,state);
    }
  }
  const ioc=v=>{let pairs=0,total=0;
    for(const n of v){pairs+=n*(n-1);total+=n;}
    return pairs/(total*(total-1));};
  return {train:score0/n0,holdout:score1/n1,
    trainIoc:ioc(matches[0]),heldoutIoc:ioc(matches[1]),
    decodedOpening:head};
}
/**
 * Encrypt real independently held-out GP plaintext, optionally overwrite
 * raw-output repetitions with random alternative runes (q=.81).
 */
function encrypt(segments,M,seed,advance,sign){
  let stateRaw=3301,previous=-1,repairs=0;
  const random=()=>{stateRaw=(Math.imul(stateRaw,1664525)+1013904223)>>>0;
    return stateRaw/4294967296;};
  const out=[];
  for(const source of segments){
    const dest=[];let state=Uint8Array.from(seed);
    if(advance)state=multiply(M,state);
    for(let i=0;i<source.length;){
      const take=Math.min(S,source.length-i);
      for(let k=0;k<take;k++){
        const raw=mod(source[i+k]-sign*state[k]);
        let cipher=raw;
        if(raw===previous&&random()<.81){
          cipher=mod(raw+1+Math.floor(28*random()));repairs++;
        }
        dest.push(cipher);previous=cipher;
      }
      i+=take;state=multiply(M,state);
    }
    out.push(dest);
  }
  return {segments:out,repairs};
}
function run(){
  const fixture=read('resources/control/shakespeare_first300k.txt');
  const GP=base.corpusWords(fixture.slice(0,240000)).flat();
  const heldout=base.corpusWords(fixture.slice(240000)).flat();
  assert.ok(heldout.length>12956);
  const freq=new Float64Array(MOD).fill(1);
  for(const p of GP)freq[p]++;
  const total=freq.reduce((x,y)=>x+y,0);
  const prior=Float64Array.from(freq,x=>x/total);
  const original=[];
  for(const {name,M} of sourceMatrices)for(const sourceSeed of seeds(M))
    for(const reset of ['page','section','global'])
      for(const advance of [0,1])for(const sign of [-1,1]){
        const stat=decrypt(groups(reset,pageRuns),M,sourceSeed.values,
          advance,sign,prior);
        original.push({matrix:name,seed:sourceSeed.name,reset,advance,sign,
          train:stat.train,holdout:stat.holdout,
          trainIoc:stat.trainIoc,heldoutIoc:stat.heldoutIoc,
          decodedOpening:stat.decodedOpening});
      }
  original.sort((a,b)=>b.train-a.train);
  const chosen=original[0];
  const H=sourceMatrices[0];
  const seed=seeds(H.M)[0];
  let start=0;
  const positiveSource=pageRuns.map(page=>{
    const p=heldout.slice(start,start+page.length);start+=page.length;return p;
  });
  const control=encrypt(positiveSource,H.M,seed.values,0,1);
  const trueStats=decrypt(control.segments,H.M,seed.values,0,1,prior);
  const wrong=sourceMatrices.at(-1);
  const wrongStats=decrypt(control.segments,wrong.M,seeds(wrong.M)[0].values,0,1,prior);
  assert.ok(trueStats.holdout>wrongStats.holdout+.25,
    'Blind true source-key plant must beat wrong matrix');
  assert.equal(control.segments.flat().length,12956);
  return {
    source:'225 red GP runes as fixed, source-defined, 15x15 F29 transition matrix',
    mechanism:'K-block is current 15-state; transition state=M*state mod29; C=P+sign K; q=.81 adjacent-equal output correction only on plant',
    sourceMatrices:sourceMatrices.length,sourceSeedTypes:4,
    configurations:original.length,
    selection:'Original first 6,480 rune positions; no key coefficients fitted',
    originalWinner:chosen,retrospectiveBestHeldout:original.slice()
      .sort((a,b)=>b.holdout-a.holdout).slice(0,3),
    positive:{realRepairs:control.repairs,truth:trueStats,wrongSourceKey:wrongStats},
    caveat:'No claimed genuine plaintext unless the locked original decoder yields legible heldout text. Does not cover nonlinear state transitions, hidden seed derivations, unknown output alphabets, changing key clocks or ciphertext-specific repair inversion.'
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={multiply,groups,seeds,decrypt,encrypt,run};
