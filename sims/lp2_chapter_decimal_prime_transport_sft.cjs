'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const chart=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const native=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const src=read('resources/transcriptions/lp2-image-corrected.txt');
const A=chart.runes,gp=new Map(A.map((x,i)=>[x,i])),P=chart.prime.map(String);
const digits=t=>[...t].filter(c=>gp.has(c)).map(c=>gp.get(c));
const val=a=>a.reduce((n,x)=>29n*n+BigInt(x),0n);
const enc=n=>{const a=[];do{a.push(Number(n%29n));n/=29n}while(n);return a.reverse()};
function parse(s){
  const n=s.length,ways=Array(n+1).fill(0n),min=Array(n+1).fill(Infinity),max=Array(n+1).fill(-Infinity),prev=Array(n+1).fill(null);
  ways[0]=1n;min[0]=max[0]=0;let far=0;
  for(let i=0;i<n;i++){if(!ways[i])continue;for(let j=0;j<P.length;j++){
    const p=P[j];if(!s.startsWith(p,i))continue;const z=i+p.length;
    ways[z]+=ways[i];min[z]=Math.min(min[z],min[i]+1);max[z]=Math.max(max[z],max[i]+1);
    if(!prev[z])prev[z]=[i,j];far=Math.max(far,z);
  }}
  const complete=ways[n]>0n,example=[];
  if(complete){let x=n;while(x){const [i,j]=prev[x];example.push(j);x=i}example.reverse();assert.equal(example.map(i=>P[i]).join(''),s)}
  return {digits:n,count:String(ways[n]),farthest:far,prefix:s.slice(0,Math.min(n,far+12)),min:complete?min[n]:null,max:complete?max[n]:null,example:example.slice(0,20)};
}
const C=chart.pages.slice(0,56).flatMap(p=>p.indices),starts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956];
assert.equal(C.length,12956);assert.deepEqual(digits(src).slice(0,C.length),C);
const chapters=starts.slice(0,-1).map((start,i)=>{
  const a=C.slice(start,starts[i+1]),n=val(a),canonical=enc(n),leading=a.length-canonical.length;
  assert.deepEqual(canonical,a.slice(leading));
  return {i,start,end:starts[i+1],runes:a.length,leading,first:a.slice(0,6),...parse(String(n))};
});
const controls=native.sections.map(s=>{
  const a=digits(s.source_text),decimal=a.map(i=>P[i]).join(''),n=BigInt(decimal),b=enc(n);
  assert.equal(String(val(b)),decimal);
  const r=parse(decimal);assert(BigInt(r.count)>0n&&a.length>=r.min&&a.length<=r.max);
  return {name:s.name,sourceRunes:a.length,encodedRunes:b.length,...r,prefix:decimal.slice(0,24)};
});
assert.deepEqual(chapters.map(r=>r.count),Array(9).fill('0'));
assert.deepEqual(chapters.map(r=>r.farthest),[0,2,0,2,0,3,1,0,5]);
assert.deepEqual(chapters.map(r=>r.leading),[0,0,0,1,0,0,0,1,0]);
assert.equal(controls.find(x=>x.name==='p57_parable').count,'147456');
assert.equal(P[0]+P[1],P[8]);
console.log(JSON.stringify({starts,chapters,controls,collision:{a:[0,1],b:[8],decimal:'23',base29:enc(23n)}},null,2));
