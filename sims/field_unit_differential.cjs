'use strict';
/**
 * Differential multiplicative-field-unit LP2 attack.
 * Intended runnable file: node sims/field_unit_differential.cjs
 * D_i = (P_i + 1) * K_i (mod 29), where D_i = C_i-C_(i-1).
 * K_i is nonzero; original D_i=0 therefore implies P_i=28 (EA).
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid=JSON.parse(read('resources/liber-primus/lp2-grid-256.json')).bytes;
const sources=['resources/control/shakespeare_first300k.txt',
 'resources/control/gibran_prophet_58585.txt',
 'resources/control/emerson_essays_2944.txt'];
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length).map(p=>p.indices);
const dictionary=new Map(corpus.translit.map((s,i)=>[s,i]));
const glyphs=new Map(corpus.runes.map((s,i)=>[s,i]));
const inv=Array.from({length:29},(_,k)=>k===0?0:
 Array.from({length:29},(_,i)=>i).find(i=>k*i%29===1));
const mod=x=>(x%29+29)%29;
assert.equal(grid.length,256);
assert.equal(pages.length,55);
assert.equal(pages.flat().length,12956);

/** Encode separated English words into the source GP alphabet. */
function encodeWords(text){
 return (text.toUpperCase().match(/[A-Z]+/g)||[]).map(word=>{
  const s=word.replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S'),out=[];
  for(let i=0;i<s.length;){
   const pair=s.slice(i,i+2),x=dictionary.get(pair);
   if(x!==undefined){out.push(x);i+=2;}
   else{const v=dictionary.get(s[i]);if(v!==undefined)out.push(v);i++;}
  }
  return out;
 });
}

/** Recover every original ciphertext doublet's location in its whole rune word. */
function events(){
 const text=read('resources/lp2-transcription.txt').split('%').slice(0,55).join('%');
 const words=text.split(/[-.&$§]/u).map(s=>[...s].filter(c=>glyphs.has(c)).map(c=>glyphs.get(c))).filter(w=>w.length);
 assert.equal(words.length,2896);
 assert.equal(words.flat().length,12956);
 const positions=[];let last=-1;
 for(const w of words)for(let j=0;j<w.length;j++){
  if(w[j]===last)positions.push([w.length,j]);
  last=w[j];
 }
 assert.equal(positions.length,86);
 assert.equal(positions.filter(e=>e[1]===0).length,23);
 return positions;
}

/** Exact Poisson-binomial tail, no normal approximation. */
function tail(probabilities,atLeast){
 const dist=new Float64Array(probabilities.length+1);dist[0]=1;
 for(let i=0;i<probabilities.length;i++)for(let j=i+1;j>=0;j--)
  dist[j]=(j<=i?dist[j]*(1-probabilities[i]):0)+(j>0?dist[j-1]*probabilities[i]:0);
 return dist.slice(atLeast).reduce((a,b)=>a+b,0);
}

/** Test source positional distribution for the predetermined GP EA marker. */
function marker(reference,locations){
 const byLength=new Map();let count=0,first=0;
 for(const w of reference)for(let i=0;i<w.length;i++)if(w[i]===28){
  const bin=byLength.get(w.length)||{count:0,first:0};
  bin.count++;count++;
  if(i===0){bin.first++;first++;}
  byLength.set(w.length,bin);
 }
 const pooled=(first+.5)/(count+1);
 const p=locations.map(([len])=>{
  const b=byLength.get(len);
  return b?(b.first+.5)/(b.count+1):pooled;
 });
 const observed=locations.filter(e=>e[1]===0).length;
 return {referenceGP:reference.reduce((a,b)=>a+b.length,0),referenceEA:count,
  referenceEAWordFirst:first,observed,expected:p.reduce((a,b)=>a+b,0),
  oneSidedTail:tail(p,observed)};
}

/** Candidate scopes preserve the original exact physical page, section, rune order. */
function scopes(input){
 const continuous=input.flat();
 const source=read('resources/lp2-transcription.txt').split('%').slice(0,55).join('%');
 const lengths=source.split('$').map(s=>[...s].filter(c=>glyphs.has(c)).length).filter(Boolean);
 let start=0;
 const section=lengths.map(n=>{const x=continuous.slice(start,start+n);start+=n;return x;});
 assert.equal(start,continuous.length);
 return {global:[continuous],page:input,section};
}
/** Source-derived, nonzero, exactly 256-unit grid candidate. */
function candidates(){
 const arr=[];
 for(const mapping of ['mod','scaled']){
  const base=grid.map(b=>mapping==='mod'?1+b%28:1+Math.floor(28*b/256));
  for(const reversed of [false,true])for(const inverse of [false,true]){
   const k=reversed?base.toReversed():base;
   arr.push({mapping,reversed,inverse,key:Uint8Array.from(k,v=>inverse?inv[v]:v)});
  }
 }
 return arr;
}
/**
 * All 6144 direct grid-key inversions, no free per-page fitted parameters.
 * Score GP-unigram log probability from independent source text.
 */
function scan(input,logp){
 const results=[];
 for(const [scope,parts] of Object.entries(scopes(input))){
  const dd=parts.map(a=>{
   const d=new Uint8Array(a.length);
   for(let i=1;i<a.length;i++)d[i]=mod(a[i]-a[i-1]);
   return d;
  });
  const hits=dd.reduce((n,a)=>n+a.slice(1).filter(x=>x===0).length,0);
  const count=dd.reduce((n,a)=>n+a.length-1,0);
  const meanOther=Array.from(logp.slice(0,28)).reduce((a,b)=>a+b,0)/28;
  const uniformBaseline=(hits*logp[28]+(count-hits)*meanOther)/count;
  for(const spec of candidates())for(let phase=0;phase<256;phase++){
   let sum=0,tr=0,te=0,ntr=0,nte=0;
   for(const d of dd){
    const split=d.length>>1;
    for(let i=1;i<d.length;i++){
     const x=mod(d[i]*spec.key[(phase+i)&255]-1),v=logp[x];
     sum+=v;
     if(i<split){tr+=v;ntr++;}else{te+=v;nte++;}
    }
   }
   results.push({scope,mapping:spec.mapping,reversed:spec.reversed,
    inverse:spec.inverse,phase,full:sum/count,
    training:tr/ntr,holdout:te/nte,
    uniformBaseline,count});
  }
 }
 assert.equal(results.length,6144);
 const best=(field)=>results.toSorted((a,b)=>b[field]-a[field]).slice(0,3);
 return {candidates:results.length,bestFull:best('full'),
   bestTraining:best('training'),bestHoldout:best('holdout')};
}
/** Planted original-length pages using the actual grid phase and real English. */
function plant(english){
 let start=30000;
 const key=grid.map(x=>1+x%28),out=[];
 for(let page=0;page<pages.length;page++){
  const n=pages[page].length,p=english.slice(start,start+n);
  start+=n;
  const a=[(page*17+3)%29];
  for(let i=1;i<n;i++)a.push(mod(a[i-1]+(p[i]+1)*key[(37+i)&255]));
  out.push(a);
 }
 return out;
}
function main(){
 const englishSources=sources.map(name=>encodeWords(read(name)));
 const flat=englishSources[0].flat();
 assert.equal(flat.length,218800);
 const freq=new Float64Array(29).fill(.5);for(const x of flat)freq[x]++;
 const logp=Float64Array.from(freq,x=>Math.log(x/(flat.length+14.5)));
 const locations=events();
 const markers=sources.map((file,i)=>({source:file,...marker(englishSources[i],locations)}));
 const actual=scan(pages,logp),positive=scan(plant(flat),logp);
 const top=positive.bestFull[0];
 assert.equal(top.scope,'page');
 assert.equal(top.mapping,'mod');
 assert.equal(top.reversed,false);
 assert.equal(top.inverse,true);
 assert.equal(top.phase,37);
 assert.ok(top.full>-3.2);
 assert.ok(actual.bestFull[0].full<-4.1);
 const result={marker:'EA (GP index28), uniquely forced by zero field difference',
  pages:55,runes:12956,withinPageDoublets:86,wordFirstDoublets:23,markers,
  gridSource:'resources/liber-primus/lp2-grid-256.json',
  testedModelFamily:'mod/scaled 1..28 units x forward/reverse x inverse/direct x phases 0..255 x global/page/section',
  original:actual,
  positive:{source:'genuine GP-English; grid page reset; mod units, forward, inverse phase37',
   best:top,count:positive.candidates}};
 console.log(JSON.stringify(result,null,2));
 return result;
}
if(require.main===module)main();
module.exports={main,encodeWords,events,tail,marker,candidates,scan,plant};
