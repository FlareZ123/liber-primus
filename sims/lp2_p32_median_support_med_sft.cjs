'use strict';
const fs=require('node:fs');
const path=require('node:path');
function run(j,reference){
  const p=j.pages[32].indices, native=j.pages[57].indices;
  if(p.length!==121||native.length!==95)throw Error("unexpected source dimensions");
  const check=(q)=>{if(!q)throw Error("failed assertion");};
  // For a w-wide output, permit every possible pair of unrestricted w+2 input rows.
  function majorityStates(y){
    const w=y[0].length,N=1<<(w+2),sums=Array.from({length:N},(_,a)=>Array.from({length:w},(_,k)=>((a>>k)&1)+((a>>(k+1))&1)+((a>>(k+2))&1)));
    let states=new Uint8Array(N*N).fill(1),counts=[N*N];
    for(const row of y){
      const next=new Uint8Array(N*N);
      for(let a=0;a<N;a++)for(let b=0;b<N;b++)if(states[a*N+b])for(let c=0;c<N;c++){
        let valid=true;
        for(let k=0;k<w;k++)if((sums[a][k]+sums[b][k]+sums[c][k]>=5)!==Boolean(row[k])){valid=false;break;}
        if(valid)next[b*N+c]=1;
      }
      states=next; counts.push(next.reduce((a,b)=>a+b,0));
    }
    return counts;
  }
  const sub=Array.from({length:4},(_,i)=>p.slice((6+i)*11+3,(6+i)*11+8));
  const y=sub.map(row=>row.map(x=>Number(x>=15)));
  const certificate=majorityStates(y);check(certificate.at(-1)===0);
  const controlInput=Array.from({length:6},(_,i)=>native.slice(i*7,i*7+7));
  const medOut=Array.from({length:4},(_,i)=>Array.from({length:5},(_,k)=>controlInput.slice(i,i+3).flatMap(row=>row.slice(k,k+3)).sort((a,b)=>a-b)[4]));
  const positive=Array.from({length:28},(_,i)=>majorityStates(medOut.map(row=>row.map(x=>Number(x>=i+1)))).at(-1));
  check(positive.every(x=>x>0));
  // Exact fixed MED predictor only, not the full JPEG-LS codec. Literal edges.
  function transform(input,decode){
    const out=input.slice(),mod=x=>(x+29)%29;
    for(let i=12;i<121;i++)if(i%11){
      const s=decode?out:input,a=s[i-1],b=s[i-11],c=s[i-12],m=Math.min(Math.max(a,b),Math.max(Math.min(a,b),a+b-c));
      out[i]=mod(input[i]+(decode?m:-m));
    }
    return out;
  }
  const plant=native.concat(native.slice(0,26)),encoded=transform(plant,false),restored=transform(encoded,true),plain=transform(p,true);
  check(restored.every((x,i)=>x===plant[i]));check(transform(plain,false).every((x,i)=>x===p[i]));
  // Simple smoothed GP bigram diagnostic, trained on LP1 only.
  const lex=j.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
  const train=reference.split("### 56")[0].split("\n").filter(s=>s.trim()&&!s.startsWith("#")&&!s.startsWith("[")&&!s.startsWith("(")).flatMap(s=>s.toUpperCase().replace(/K/g,"C").replace(/V/g,"U").replace(/Q/g,"CW").match(/[A-Z]+/g)||[]).flatMap(w=>{let o=[];while(w){const k=lex.find(([s])=>w.startsWith(s));if(k){o.push(k[1]);w=w.slice(k[0].length);}else w=w.slice(1);}return o;});
  const counts=Array.from({length:29},()=>Array(29).fill(0.5));for(let i=1;i<train.length;i++)counts[train[i-1]][train[i]]++;
  const tot=counts.map(row=>row.reduce((a,b)=>a+b,0));function score(a){return a.slice(1).reduce((s,x,i)=>s+Math.log(counts[a[i]][x]/tot[a[i]]),0)/(a.length-1);}
  const interior=a=>a.filter((_,i)=>i>=11&&i%11!==0);
  return {sub,y,certificate,positive,medOut,med:{controlExact:restored.length,originalReplay:p.length,trainRunes:train.length,rawScore:score(interior(p)),decodedScore:score(interior(plain)),controlScore:score(interior(plant)),candidateIndices:plain,candidateInterior:interior(plain).map(x=>j.translit[x]).join("")}};
}
const root=path.resolve(__dirname,'..');
const j=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const reference=fs.readFileSync(path.join(root,'resources/liber-primus/lp1-plaintext-reference.txt'),'utf8');
console.log(JSON.stringify(run(j,reference),null,2));
