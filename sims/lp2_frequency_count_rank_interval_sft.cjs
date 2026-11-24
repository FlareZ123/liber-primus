'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const data=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const gp=data.runes,mp=new Map([...gp].map((v,i)=>[v,i]));
const parse=s=>[...s].filter(c=>mp.has(c)).map(c=>mp.get(c));
const re=new RegExp('['+gp.join('')+']+','gu');
const words=s=>(s.replace(/[\/%\r\n'’]/g,'').match(re)??[]).map(parse);
const ws=words(read('resources/liber-primus/lp2-transcription.txt').split('%').slice(0,55).join(''));
const C=ws.flat();
assert.equal(C.length,12956);assert.equal(ws.length,2896);
assert.deepEqual(C,data.pages.filter(p=>p.page<56).flatMap(p=>p.indices));
const native=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json')).sections;
const cuts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956];
const freq=x=>{let f=Array(29).fill(0);for(const v of x)f[v]++;return f};
const ioc=f=>{const n=f.reduce((a,b)=>a+b,0);return f.reduce((a,b)=>a+b*(b-1),0)/(n*(n-1))};
const stat=x=>({n:x.length,ioc:ioc(freq(x)),adj:x.slice(1).filter((v,i)=>v===x[i]).length,head:freq(x).sort((a,b)=>b-a).slice(0,5)});
const singleton=w=>{let p=0,out=[];for(const v of w){if(v.length===1)out.push(p);p+=v.length}return out};
const si=singleton(ws);assert.equal(si.length,83);
/** @param {number[]} x @param {boolean} asc @param {'rank'|'emitter'} dir @param {boolean} encode @param {number[]} [tie] */
function transform(x,asc,dir,encode,tie=Array.from({length:29},(_,i)=>i)){
 const f=Array(29).fill(0),o=[];
 for(const v of x){const L=Array.from({length:29},(_,i)=>i).sort((a,b)=>(asc?1:-1)*(f[a]-f[b])||tie[a]-tie[b]);
  const asRank=dir==='rank'?encode:!encode, y=asRank?L.indexOf(v):L[v];
  f[asRank?v:y]++;o.push(y);
 }return o;
}
/** Exact occupancy and possible/forced same-symbol adjacent transitions in rank-input interpretation. */
function rankOcc(C,asc){
 const f=Array(29).fill(0);let repPossible=0,repForced=0,lo=-1,hi=-1;
 for(let x of C){if(asc)x=28-x;if(x>=lo&&x<=hi){repPossible++;if(lo===hi)repForced++}
  const count=f[x]+1;f[x]=count;f.sort((a,b)=>b-a);lo=f.indexOf(count);hi=f.lastIndexOf(count);
 }return {h:f,ioc:ioc(f),repPossible,repForced};
}
/** For arbitrary per-event tie handling, return all allowable ascending ranks of each observed symbol. */
function intervals(C){
 const f=Array(29).fill(0);return C.map(x=>{const lo=f.filter(v=>v<f[x]).length,hi=f.filter(v=>v<=f[x]).length-1;f[x]++;return [lo,hi]});
}
/** Minimum interval transversal, with disjoint witness (zero-based absolute indices). */
function hit(I,idx,offset=0){
 const a=idx.map(i=>({i:i+offset,lo:I[i][0],hi:I[i][1]})).sort((x,y)=>x.hi-y.hi||x.lo-y.lo);
 const out=[];let k=-1;for(const x of a){if(k<x.lo){out.push(x);k=x.hi}}
 assert(a.every(x=>out.some(y=>y.hi>=x.lo&&y.hi<=x.hi)));
 assert(out.every((x,i)=>!i||out[i-1].hi<x.lo));
 return out;
}
const I=intervals(C),H=hit(I,si);
assert.equal(H.length,24);
const byChapter=[];
for(let i=0;i<cuts.length-1;i++){const a=cuts[i],b=cuts[i+1],c=C.slice(a,b),s=si.filter(p=>p>=a&&p<b).map(p=>p-a);byChapter.push(hit(intervals(c),s,a).length)}
assert.deepEqual(byChapter,[4,5,9,7,2,6,6,10,1]);
console.log({allSingletons:si.length,minimumRanks:H.length,witness:H,chapterMinima:byChapter});
for(const asc of [false,true]){
 const occ=rankOcc(C,asc);
 assert.deepEqual(freq(transform(C,asc,'rank',false)).sort((a,b)=>b-a),occ.h);
 // An independent reversed tie order yields different symbol labels but identical count multiset.
 assert.deepEqual(freq(transform(C,asc,'rank',false,Array.from({length:29},(_,i)=>28-i))).sort((a,b)=>b-a),occ.h);
 assert(occ.ioc<.035);
 for(const dir of ['rank','emitter']){
  const out=transform(C,asc,dir,false);assert.deepEqual(transform(out,asc,dir,true),C);
  const chapters=cuts.slice(0,-1).map((a,i)=>{const c=C.slice(a,cuts[i+1]),p=transform(c,asc,dir,false);assert.deepEqual(transform(p,asc,dir,true),c);return stat(p)});
  console.log({asc,dir,all:stat(out),occ:dir==='rank'?occ:null,chapters,prefix:out.slice(0,150).map(i=>data.translit[i]).join('')});
  for(const s of native){
   const p=parse(s.source_text),w=words(s.source_text),sp=singleton(w);assert.deepEqual(w.flat(),p);
   const c=transform(p,asc,dir,true);assert.deepEqual(transform(c,asc,dir,false),p);
   if(dir==='rank')assert.deepEqual(rankOcc(c,asc).h,freq(p).sort((a,b)=>b-a));
   else{
    const intervalsC=intervals(c);
    assert(p.every((v,i)=>{const r=asc?v:28-v;return r>=intervalsC[i][0]&&r<=intervalsC[i][1]}));
    assert(hit(intervalsC,sp).length<=2);
   }
   console.log({control:s.name,asc,dir,plain:stat(p),cipher:stat(c)});
  }
 }
}
