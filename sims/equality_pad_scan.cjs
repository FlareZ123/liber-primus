'use strict';
/**
 * Equality-only GP key sieve. A fixed unknown 29-rune ciphertext permutation
 * does not affect whether two observed symbols are equal. Under
 * C = sigma((P + sign*K) mod29), equal C values require
 * P[i]-P[i-lag] = -sign*(K[i]-K[i-lag]) mod29.
 *
 * The score is a composite Bernoulli log-likelihood of equality indicators,
 * trained on held-out-safe GP Shakespeare source text. Lagged events overlap;
 * report permutation-calibrated selection tests, not naive analytic p-values.
 *
 * No external packages. Node.js 22; execute via the opt-in workflow.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {keyList,stream,tableBytes}=require('./base60_seeded_stream.cjs');
const {keys:wholeKeys,keyPads}=require('./base60_fullkey_stream.cjs');
const {corpusWords}=require('./relative_key_english_probe.cjs');
const ROOT=path.resolve(__dirname,'..'), M=29, NOISE=0.08;
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length);
assert.equal(pages.length,55);
assert.equal(pages.reduce((n,p)=>n+p.indices.length,0),12956);
const real=pages.map(p=>p.indices);
const grid=Buffer.from(JSON.parse(fs.readFileSync(
  path.join(ROOT,'resources/liber-primus/base60-grid.json'),'utf8'
)).byte_rows.flat());
assert.equal(grid.length,256);
const text=fs.readFileSync(path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8');
const training=corpusWords(text.slice(0,240000)).flat();
const heldout=corpusWords(text.slice(240000)).flat();
const LAGS=Array.from({length:15},(_,i)=>i+2);
const mod=x=>(x%29+29)%29;
const yes=[],no=[];
for(const lag of LAGS){
  const h=new Float64Array(29);
  for(let i=lag;i<training.length;i++)h[mod(training[i]-training[i-lag])]++;
  const p=Float64Array.from(h,n=>(1-NOISE)*n/(training.length-lag)+NOISE/29);
  yes.push(Float64Array.from(p,Math.log));
  no.push(Float64Array.from(p,v=>Math.log1p(-v)));
}
/**
 * @param {ArrayLike<ArrayLike<number>>} cipher
 * @param {ArrayLike<ArrayLike<number>>} pad
 * @param {-1|1} sign
 * @returns {number}
 */
function score(cipher,pad,sign){
  let ll=0;
  for(let j=0;j<cipher.length;j++){
    const c=cipher[j],k=pad[j];
    assert.ok(k.length>=c.length);
    for(let z=0;z<LAGS.length;z++){
      const lag=LAGS[z],match=yes[z],other=no[z];
      for(let i=lag;i<c.length;i++){
        const delta=mod(-sign*(k[i]-k[i-lag]));
        ll+=c[i]===c[i-lag]?match[delta]:other[delta];
      }
    }
  }
  return ll;
}
/** @param {ArrayLike<ArrayLike<number>>} cipher */
function aggregate(cipher){
  const hits=LAGS.map(()=>new Uint16Array(256));
  const trials=LAGS.map(()=>new Uint16Array(256));
  for(const page of cipher)for(let z=0;z<LAGS.length;z++){
    const d=LAGS[z],h=hits[z],n=trials[z];
    for(let i=d;i<page.length;i++){
      const phase=i&255;n[phase]++;
      if(page[i]===page[i-d])h[phase]++;
    }
  }
  return {hits,trials};
}
/**
 * Scan all 1024 direct page-reset key placements with an arbitrary outer
 * bijection. A phase histogram makes each candidate O(15*256), independent
 * of the full manuscript length.
 * @param {Buffer} bytes
 * @param {ArrayLike<ArrayLike<number>>} cipher
 * @returns {{score:number,reverse:number,offset:number,sign:number}}
 */
function directGrid(bytes,cipher){
  const {hits,trials}=aggregate(cipher);
  let best={score:-Infinity,reverse:0,offset:0,sign:1};
  for(let reverse=0;reverse<2;reverse++){
    const a=reverse?Buffer.from(bytes).reverse():bytes;
    for(let offset=0;offset<256;offset++)for(const sign of [-1,1]){
      let v=0;
      for(let z=0;z<LAGS.length;z++){
        const d=LAGS[z],h=hits[z],n=trials[z],y=yes[z],noMatch=no[z];
        for(let i=0;i<256;i++){
          const delta=mod(-sign*(a[(i+offset)&255]-a[(i+offset-d)&255]));
          v+=h[i]*y[delta]+(n[i]-h[i])*noMatch[delta];
        }
      }
      if(v>best.score)best={score:v,reverse,offset,sign};
    }
  }
  return best;
}
/** @param {Buffer} source @param {number} offset @param {boolean} reverse */
function literalPads(source,offset,reverse){
  const a=reverse?Buffer.from(source).reverse():source;
  return pages.map(p=>Uint8Array.from({length:p.indices.length},(_,i)=>a[(i+offset)&255]%29));
}
/** @param {number} seed @returns {()=>number} */
function rng(seed){let s=seed|0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};}
const random=rng(0x341104);
/** @param {number[]} raw */
function shuffled(raw){
  const a=raw.slice();
  for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
/** @param {number} trial */
function makePlant(trial){
  const reverse=trial&1,sign=trial%4<2?1:-1,offset=(trial*31+17)&255;
  const pad=literalPads(grid,offset,Boolean(reverse));
  const sigma=shuffled(Array.from({length:29},(_,i)=>i));
  let cursor=Math.floor(random()*(heldout.length-12956)),rewrites=0;
  const cipher=pages.map((page,j)=>{
    const out=[];
    for(let i=0;i<page.indices.length;i++){
      let c=sigma[mod(heldout[cursor++]+sign*pad[j][i])];
      if(i>0&&c===out[i-1]&&random()<0.81){
        c=mod(c+1+Math.floor(28*random()));rewrites++;
      }
      out.push(c);
    }
    return out;
  });
  const best=directGrid(grid,cipher);
  return {correct:best.reverse===reverse&&best.sign===sign&&best.offset===offset,rewrites};
}
/** Named 32-byte row and column subkeys with page-reset AES/ChaCha/RC4. */
function standardStreamScan(){
  const nmax=Math.max(...pages.map(x=>x.indices.length)),out=[];
  for(const source of keyList(tableBytes()))
    for(const cipher of ['aes-256-ctr','chacha20','rc4'])
      for(const iv of cipher==='rc4'?['zero']:['zero','last-le','last-be','first-le'])
        for(const drop of cipher==='rc4'?[0,256,3072]:[0,256]){
          const cache=new Map();
          for(const page of pages){
            const id=iv==='zero'?0:page.page;
            if(!cache.has(id))cache.set(id,stream(cipher,source.key,iv,page.page,nmax,drop));
          }
          for(const mapping of ['mod','scale']){
            const pad=pages.map(page=>Uint8Array.from(
              cache.get(iv==='zero'?0:page.page).subarray(0,page.indices.length),
              b=>mapping==='mod'?b%29:Math.floor(b*29/256)));
            for(const sign of [-1,1])
              out.push({score:score(real,pad,sign),key:source.name,cipher,iv,drop,mapping,sign});
          }
        }
  out.sort((a,b)=>b.score-a.score);
  return {tested:out.length,top:out.slice(0,8)};
}
/** 256-byte table / SHA-derived / 32-byte keys, page-reset or global. */
function wholeStreamScan(){
  const out=[];
  for(const source of wholeKeys())
    for(const cipher of ['rc4','aes-256-ctr','chacha20']){
      if(source.rc4Only&&cipher!=='rc4')continue;
      for(const align of ['page','global'])
        for(const iv of align==='global'||cipher==='rc4'?['zero']:['zero','last-le','last-be','first-le'])
          for(const drop of cipher==='rc4'?[0,256,3072]:[0,256])
            for(const mapping of ['mod','scale','reject']){
              const pad=keyPads(cipher,source.key,iv,align,drop,mapping);
              for(const sign of [-1,1])
                out.push({score:score(real,pad,sign),key:source.name,cipher,align,iv,drop,mapping,sign});
            }
    }
  out.sort((a,b)=>b.score-a.score);
  return {tested:out.length,top:out.slice(0,8)};
}
function main(){
  const literal=directGrid(grid,real);
  const nulls=[];
  for(let i=0;i<100;i++)nulls.push(directGrid(Buffer.from(shuffled([...grid])),real).score);
  nulls.sort((a,b)=>a-b);
  const plants=Array.from({length:40},(_,i)=>makePlant(i));
  const first=standardStreamScan(),whole=wholeStreamScan();
  const result={
    hypothesis:'Known additive pad with arbitrary outer 29-symbol permutation',
    source:{pages:pages.length,runes:12956,trainingRunes:training.length,heldoutRunes:heldout.length},
    compositeModel:{lags:[2,16],uniformNoiseMixture:NOISE},
    literalGrid:{best:literal,nulls:100,exceedances:nulls.filter(x=>x>=literal.score).length,
      familyWiseP:(nulls.filter(x=>x>=literal.score).length+1)/101,
      nullMedian:nulls[50],nullMaximum:nulls[99],
      plants:plants.length,exactRecovered:plants.filter(p=>p.correct).length,
      medianRewrites:plants.map(p=>p.rewrites).sort((a,b)=>a-b)[20]},
    derivedGridStreams:{standard:first,whole,top:[...first.top.map(x=>({...x,family:'standard'})),
      ...whole.top.map(x=>({...x,family:'whole-grid'}))].sort((a,b)=>b.score-a.score).slice(0,8)},
    interpretation:'The equality score is a correlated-event pseudo-likelihood. Positive candidate scores require independent matched maximum-null calibration, decoded plaintext, and key prediction before acceptance.'
  };
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  return result;
}
if(require.main===module)main();
module.exports={score,directGrid,standardStreamScan,wholeStreamScan,makePlant,main};
