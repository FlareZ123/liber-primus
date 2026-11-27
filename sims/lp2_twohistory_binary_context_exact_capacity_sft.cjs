'use strict';
const fs=require('node:fs');
const files=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"
];
function run(corpus,native,donors){
  const Q=29,E=18,O=3;
  const check=(x,m)=>{if(!x)throw Error(m)};
  const pages=corpus.pages.slice(0,56).map(p=>p.indices);
  const tok=corpus.translit.map((x,i)=>[i===21?"ING":i===27?"IO":x,i]);tok.push(["NG",21],["IA",27]);tok.sort((a,b)=>b[0].length-a[0].length);
  function encode(s){const a=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){const q=tok.find(([x])=>w.startsWith(x,i));check(q,"unknown spelling");a.push(q[1]);i+=q[0].length}}return a}
  function histogram(a){const h=Array(Q).fill(0);for(const x of a)h[x]++;return h}
  function mins(a,n){check(a.length>=n,"short donor");const h=histogram(a.slice(0,n));let e=Infinity,two=Infinity,one=Infinity,eAt=0,twoAt=0;for(let i=0;i<=a.length-n;i++){const top=h.slice(1).sort((a,b)=>b-a);if(h[E]<e){e=h[E];eAt=i}one=Math.min(one,top[0]);if(top[0]+top[1]<two){two=top[0]+top[1];twoAt=i}if(i<a.length-n){h[a[i]]--;h[a[i+n]]++}}return {windows:a.length-n+1,minE:e,minTop1NonF:one,minTop2NonF:two,eAt,twoAt}}
  function capacity(pp,construct=false){
    const H=Array.from({length:Q},()=>Array.from({length:Q},()=>new Int32Array(Q)));
    let N=0,free=0;for(const x of pp){N+=x.length;free+=Math.min(2,x.length);for(let i=2;i<x.length;i++)H[x[i-1]][x[i]][x[i-2]]++}
    const top1=[0,0,0,0];let top2=0;const loose=[0,0],arg=[];
    for(const row of H){
      const m=[0,0,0,0];const sets=[],scores=[];let best2=-1,bestPair=[0,0];
      for(let a=0;a<Q;a++){let sum=0;for(let x=0;x<Q;x++)sum+=row[a][x];m[0]=Math.max(m[0],sum);
        for(let b=a+1;b<Q;b++){let val=0;const p=new Int32Array(Q);for(let x=0;x<Q;x++){val+=Math.max(row[a][x],row[b][x]);p[x]=row[a][x]+row[b][x]}m[1]=Math.max(m[1],val);sets.push([a,b]);scores.push(p);
          for(let d=b+1;d<Q;d++){let v=0;for(let x=0;x<Q;x++)v+=Math.max(row[a][x],row[b][x],row[d][x]);m[2]=Math.max(m[2],v);
            for(let e=d+1;e<Q;e++){let v=0;for(let x=0;x<Q;x++)v+=Math.max(row[a][x],row[b][x],row[d][x],row[e][x]);m[3]=Math.max(m[3],v)}}}}
      for(let a=0;a<scores.length;a++)for(let b=a;b<scores.length;b++){let v=0;for(let x=0;x<Q;x++)v+=Math.max(scores[a][x],scores[b][x]);if(v>best2){best2=v;bestPair=[a,b]}}
      for(let j=0;j<4;j++)top1[j]+=m[j];top2+=best2;
      const counts=row.map(r=>r.reduce((s,x)=>s+x,0)).sort((a,b)=>b-a);loose[0]+=counts[0]+counts[1];loose[1]+=counts.slice(0,4).reduce((s,x)=>s+x,0);
      arg.push({sets:bestPair.map(i=>sets[i]),h:Array.from({length:Q},(_,x)=>Number(scores[bestPair[1]][x]>scores[bestPair[0]][x]))})
    }
    const out={N,free,top1:top1.map(v=>v+free),top2Binary:top2+free,arbitraryHistoryBinary:loose.map(v=>v+free)};
    if(construct){
      // A concrete inverse attaining the exact selected-pair bound. Each state row is a bijection.
      const inverse=arg.map(({sets})=>sets.map(([u,v])=>{const t=Array(Q).fill(-1);t[u]=E;t[v]=O;const rem=Array.from({length:Q},(_,i)=>i).filter(i=>i!==E&&i!==O);let j=0;for(let x=0;x<Q;x++)if(t[x]<0)t[x]=rem[j++];return t}));
      const plain=[];let replay=0,selected=0;
      for(const x of pp){for(let i=0;i<x.length;i++){const p=i<2?E:inverse[x[i-1]][arg[x[i-1]].h[x[i-2]]][x[i]];plain.push(p);selected+=Number(p===E||p===O);if(i>=2){check(inverse[x[i-1]][arg[x[i-1]].h[x[i-2]]].indexOf(p)===x[i],"witness replay");replay++}}}
      check(selected===out.top2Binary,"sharp witness");out.witness={selected,replayedInterior:replay,first80:plain.slice(0,80),h:arg.map(a=>a.h),inverse};
    }
    return out;
  }
  let seed=0x3301cafe;const rand=n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n};
  function perm(){const a=Array.from({length:Q},(_,i)=>i);for(let i=Q-1;i>0;i--){let j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
  function plant(a){const H=Array.from({length:Q},()=>Array.from({length:Q},()=>rand(2))),S=Array.from({length:Q},()=>[perm(),perm()]);let off=0,recovered=0;
    const cc=pages.map(x=>{const p=a.slice(off,off+x.length);off+=x.length;const c=p.slice(0,2);for(let i=2;i<p.length;i++){const row=S[c[i-1]][H[c[i-1]][c[i-2]]];c.push(row[p[i]]);check(row.indexOf(c[i])===p[i],"plant replay");recovered++}return c});
    const b=capacity(cc);const h=histogram(a),top=h.slice().sort((x,y)=>y-x);check(top[0]<=b.top1[1]&&top[0]+top[1]<=b.top2Binary,"plant capacity");return {trueTop1:top[0],trueTop2:top[0]+top[1],boundTop1:b.top1[1],boundTop2:b.top2Binary,recoveredInterior:recovered}}
  const N=pages.reduce((s,p)=>s+p.length,0);check(N===12956,"canonical runes");
  const whole=capacity(pages,true);check(whole.free===110&&whole.top1.join(",")==="823,1216,1455,1622"&&whole.top2Binary===2068,"pinned exact bounds");
  const ends=[0,3,8,15,23,27,33,40,54,56];
  const ch=ends.slice(0,-1).map((p,i)=>({start:p,end:ends[i+1]-1,...capacity(pages.slice(p,ends[i+1]))}));
  const nr=native.sections.flatMap(s=>[...s.source_text].map(x=>corpus.runes.indexOf(x)).filter(i=>i>=0));check(nr.length===2979,"native rune count");
  const control=donors.map(({name,text})=>{const a=encode(text),m=mins(a,N);check(m.minE>whole.top1[1]&&m.minTop2NonF>whole.top2Binary,"frozen corpus exclusion");return{name,length:a.length,...m,plant:plant(a.slice(0,N))}});
  return {whole,chapters:ch,native:{n:nr.length,E:histogram(nr)[E],top2NonF:histogram(nr).slice(1).sort((a,b)=>b-a).slice(0,2).reduce((a,b)=>a+b,0)},controls:control};
}
const r=files.map(p=>fs.readFileSync(p,'utf8'));
const out=run(JSON.parse(r[0]),JSON.parse(r[1]),r.slice(2).map((text,i)=>({name:files[i+2],text})));
console.log(JSON.stringify(out,null,2));
