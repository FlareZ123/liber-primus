'use strict';
/**
 * Original LP2 affine F29 inverse with literal source-derived 79-red-rune key.
 * Test P = a^-1 (X-b) and P = a (X-b) mod29, where a is nonzero and b is
 * mapped deterministically from two source interpretations of marked runes.
 * Input X is raw ciphertext or ciphertext difference at each rune.
 * Fitting is limited to selecting from finite source-fixed settings using
 * the first 41 original rune-bearing pages, with untouched last14 holdout.
 * Node.js 22, CommonJS, no third party dependencies.
 */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const {encode}=require('./word_partition_invariant.cjs');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const corp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const pages=corp.pages.filter(p=>p.page<56&&p.indices.length);
assert.equal(pages.length,55);
const N=pages.reduce((n,p)=>n+p.indices.length,0);
assert.equal(N,12956);
const key=[15,40,53].flatMap(p=>ink.pages.find(x=>x.page===p).red_spans.flatMap(s=>
  corp.pages[p].indices.slice(s.start,s.start+s.length)));
assert.equal(key.length,79);
const options={rune:key,prime:key.map(r=>corp.prime[r])};
const cutoff=pages.slice(0,41).reduce((n,p)=>n+p.indices.length,0);
assert.equal(cutoff,9871);
const m=x=>(x%29+29)%29;
const inverse=Array(29).fill(-1);
for(let a=1;a<29;a++)for(let b=1;b<29;b++)if((a*b)%29===1)inverse[a]=b;
assert.ok(inverse.slice(1).every(x=>x>0));
const source=read('resources/control/shakespeare_first300k.txt')
  .toUpperCase().match(/[A-Z]+/g).flatMap(encode);
const counts=Array(29).fill(.5);
for(const x of source)counts[x]++;
const total=counts.reduce((a,b)=>a+b,0),LM=counts.map(x=>Math.log(x/total));

/** @param {{a:'rune'|'prime',b:'rune'|'prime',channel:'raw'|'difference',inverse:boolean,reverse:boolean,reset:string,phase:number}} opt
 * @param {number[][]} data
 */
function decode(opt,data=pages.map(p=>p.indices)){
  const out=[],ka=options[opt.a],kb=options[opt.b];
  let pos=0;
  for(const p of data){
    const row=[];
    for(let i=0;i<p.length;i++){
      if(i===0&&opt.channel==='difference'){row.push(-1);pos++;continue;}
      const t=opt.reset==='page'?i:pos;
      const k=(t+opt.phase)%79,j=opt.reverse?78-k:k;
      const a=1+ka[j]%28,b=kb[j]%29;
      const symbol=opt.channel==='raw'?p[i]:m(p[i]-p[i-1]);
      row.push(opt.inverse?m(a*m(symbol-b)):m(inverse[a]*m(symbol-b)));
      pos++;
    }
    out.push(row);
  }
  return out;
}

/** @param {number[][]} arr */
function score(arr){
  let index=0;
  const sums=[0,0],size=[0,0],freq=Array.from({length:2},()=>new Int32Array(29));
  for(const p of arr)for(const x of p){
    const half=index++<cutoff?0:1;
    if(x<0)continue;
    sums[half]+=LM[x];size[half]++;freq[half][x]++;
  }
  const ioc=(f,n)=>f.reduce((s,k)=>s+k*(k-1),0)/(n*(n-1));
  return {train:sums[0]/size[0],heldout:sums[1]/size[1],
    trainIoc:ioc(freq[0],size[0]),heldoutIoc:ioc(freq[1],size[1])};
}
function positive(){
  const plantSource=source.slice(500,500+N);
  const opt={a:'prime',b:'rune',channel:'difference',
    inverse:false,reverse:true,reset:'page',phase:17};
  const encrypted=[];let offset=0;
  for(const p of pages){
    const row=[],kA=options[opt.a],kB=options[opt.b];
    let previous=17;
    for(let i=0;i<p.indices.length;i++){
      const t=i,j=78-(t+opt.phase)%79;
      const a=1+kA[j]%28,b=kB[j]%29;
      if(i)previous=m(previous+m(a*plantSource[offset]+b));
      row.push(previous);
      offset++;
    }
    encrypted.push(row);
  }
  const result=decode(opt,encrypted).flat();
  let exact=0,valid=0;
  for(let i=0;i<N;i++)if(result[i]>=0){valid++;exact+=result[i]===plantSource[i];}
  assert.equal(valid,N-pages.length);
  assert.equal(exact,valid);
  return {config:opt,exact,valid};
}
function main(){
  const candidates=[];
  for(const a of ['rune','prime'])for(const b of ['rune','prime'])
  for(const channel of ['raw','difference'])for(const invert of [true,false])
  for(const reverse of [true,false])for(const reset of ['continuous','page'])
  for(let phase=0;phase<79;phase++){
    const opt={a,b,channel,inverse:invert,reverse,reset,phase};
    candidates.push({...opt,...score(decode(opt))});
  }
  assert.equal(candidates.length,5056);
  candidates.sort((a,b)=>b.train-a.train);
  const pos=positive();
  const reference=score([source.slice(0,cutoff),source.slice(cutoff,N)]);
  const report={sourceRedLength:key.length,runicOriginalLength:N,cutoff,
    finiteSourceDerivedSettings:candidates.length,
    bestTrain:candidates.slice(0,8),positive:pos,
    reference,
    note:'No independently recovered original LP2 plaintext or source key cipher'};
  console.log(JSON.stringify(report,null,2));
  return report;
}
if(require.main===module)main();
module.exports={decode,score,positive,main};
