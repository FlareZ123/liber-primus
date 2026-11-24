'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
function verify(corpus,native){
 const mod=x=>(x%29+29)%29,inv=Array.from({length:29},(_,a)=>a?Array.from({length:28},(_,j)=>j+1).find(b=>a*b%29===1):0),ALL=(1<<29)-2;
 function runs(t){const groups=[];let s=[],start=0;for(let i=0;i<=t.length;i++){if(i<t.length&&t[i]){if(!s.length)start=i;s.push(t[i])}else if(s.length){groups.push({start,run:s});s=[]}}return groups}
 function mask(run,a,b,d){let A=1,B=0,m=ALL;for(let i=1;i<run.length;i++){A=mod(-a*A);B=mod(run[i]-b*run[i-1]-d-a*B);if(!A){if(!B)return 0;}else{m&=~(1<<mod(-B*inv[A]));if(!m)return 0;}}return m}
 function feasible(seq,q,a,b,d,excludeStatic=false){
  const cs=seq.slice(0,q);if(cs.length!==q||cs.some(c=>!c))throw Error("anchor must consume");
  let rects=excludeStatic?Array.from({length:q},(_,j)=>[...cs,...cs.map((c,k)=>k<j?1<<c:k===j?ALL&~(1<<c):ALL)]):[[...cs,...Array(q).fill(ALL)]],peak=rects.length;
  const amap=Array.from({length:29},(_,shift)=>Array.from({length:29},(_,x)=>mod(shift-a*x)));
  const transform=(m,shift)=>{let res=0;while(m){const bit=m&-m;m^=bit;const v=amap[shift][31-Math.clz32(bit)];if(v)res|=1<<v;}return res};
  for(let i=q;i<seq.length;i++){const c=seq[i],next=[];function add(z){outer:for(let j=0;j<next.length;j++){const w=next[j];for(let k=0;k<q;k++)if(w[k]!==z[k])continue outer;let wz=true,zw=true;for(let k=q;k<2*q;k++){const x=w[k]&z[k];if(x!==w[k])zw=false;if(x!==z[k])wz=false;}if(wz)return;if(zw){next.splice(j,1);j--}}next.push(z)}for(const z of rects){if(!c)add(z);const m=transform(z[q],mod(c-b*z[0]-d));if(m)add([...z.slice(1,q),c,...z.slice(q+1),m])}if(!next.length)return {ok:false,end:i,peak};rects=next;peak=Math.max(peak,rects.length);if(peak>2000)return {ok:null,end:i,peak};}return {ok:true,end:seq.length,peak}
 }
 const sections=native.sections.map(s=>[...s.source_text].map(x=>native.runes.indexOf(x)).filter(x=>x>=0));
 function plant(q,ids,key){const [u,a,b,d]=key,p=ids.flatMap(i=>sections[i]),xs=Array.from({length:q},(_,i)=>i+5),cs=Array.from({length:q},(_,i)=>i+17);const t=p.map(v=>{if(!v)return 0;const x=mod(v*u),c=mod(x+a*xs.shift()+b*cs.shift()+d);xs.push(x);cs.push(c);return c});const anchor=runs(t).reduce((a,b)=>a.run.length>b.run.length?a:b);const lanes=runs(t).flatMap(({run})=>Array.from({length:q},(_,j)=>run.filter((_,i)=>i%q===j))).filter(l=>l.length);return {q,key,n:p.length,anchor:anchor.start,run:anchor.run.length,passesGate:lanes.every(l=>mask(l,a,b,d)!==0),exact:feasible(t.slice(anchor.start),q,a,b,d)}}
 const plants=[plant(2,[1,3],[7,9,13,4]),plant(3,[4,5,6],[11,17,3,18])];
 const t=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices),groups=runs(t),anchor=groups.reduce((a,b)=>a.run.length>b.run.length?a:b);
 const results=[2,3].map(q=>{const lanes=groups.flatMap(({run})=>Array.from({length:q},(_,j)=>run.filter((_,i)=>i%q===j))).filter(l=>l.length).sort((a,b)=>b.length-a.length);const cand=[];for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let d=0;d<29;d++)if(lanes.every(l=>mask(l,a,b,d)))cand.push([a,b,d]);let rejected=0,maxEnd=0,maxPeak=0,worst=null,out=[];for(const k of cand){const cancel=mod(k[0]+k[1])===0&&k[2]===0;if(cancel&&!k[0])continue;const z=feasible(t.slice(anchor.start),q,...k,cancel);maxPeak=Math.max(maxPeak,z.peak);if(z.ok===false){rejected++;if(z.end>maxEnd){maxEnd=z.end;worst=k}}else out.push({k,...z});}return {q,candidates:cand.length,rejected,maxEnd,maxPeak,worst,out}});
 return {n:t.length,anchor:{start:anchor.start,length:anchor.run.length},plants,results}
}
const result=verify(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8')),JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8')));
assert.deepEqual(result,{
  "n": 12956,
  "anchor": {
    "start": 1691,
    "length": 217
  },
  "plants": [
    {
      "q": 2,
      "key": [
        7,
        9,
        13,
        4
      ],
      "n": 1295,
      "anchor": 1007,
      "run": 78,
      "passesGate": true,
      "exact": {
        "ok": true,
        "end": 288,
        "peak": 230
      }
    },
    {
      "q": 3,
      "key": [
        11,
        17,
        3,
        18
      ],
      "n": 1163,
      "anchor": 587,
      "run": 109,
      "passesGate": true,
      "exact": {
        "ok": true,
        "end": 576,
        "peak": 300
      }
    }
  ],
  "results": [
    {
      "q": 2,
      "candidates": 4367,
      "rejected": 4366,
      "maxEnd": 926,
      "maxPeak": 53,
      "worst": [
        6,
        24,
        11
      ],
      "out": []
    },
    {
      "q": 3,
      "candidates": 19172,
      "rejected": 19171,
      "maxEnd": 1975,
      "maxPeak": 228,
      "worst": [
        3,
        22,
        3
      ],
      "out": []
    }
  ]
});
console.log(JSON.stringify(result,null,2));
