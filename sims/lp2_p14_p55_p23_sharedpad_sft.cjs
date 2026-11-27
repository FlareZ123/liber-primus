'use strict';
const fs=require('node:fs');
const path=require('node:path');
function run(corpus, english) {
 const R=29, R2=841, mod=v=>(v%R+R)%R;
 const map=new Map(corpus.translit.map((t,i)=>[t,i]));
 const normalized=english.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
 const en=[];
 for(let i=0;i<normalized.length;i++){if(!/[A-Z]/.test(normalized[i]))continue;const pair=normalized.slice(i,i+2);if(map.has(pair)){en.push(map.get(pair));i++;}else if(map.has(normalized[i]))en.push(map.get(normalized[i]));}
 const end=Math.floor(.67*en.length), n1=new Int32Array(R),n2=new Int32Array(R2),n3=new Int32Array(R2*R);
 for(let i=0;i<end;i++){const d=en[i];n1[d]++;if(i>0)n2[en[i-1]*R+d]++;if(i>1)n3[(en[i-2]*R+en[i-1])*R+d]++;}
 const p1=Array.from(n1,n=>(n+.005)/(end+R*.005)),p2=Array.from(n2,(n,j)=>(n+.7*p1[j%R])/(n1[Math.floor(j/R)]+.7));
 const l1=p1.map(Math.log),l2=p2.map(Math.log),l3=Array.from(n3,(n,j)=>Math.log((n+2.5*p2[j%R2])/(n2[Math.floor(j/R)]+2.5)));
 const p=n=>corpus.pages.find(p=>p.page===n).indices, render=x=>x.map(v=>corpus.translit[v]).join(" ");
 function solve(ca,cb,split,sign){
  const n=ca.length,D=ca.map((v,i)=>mod(v-sign*cb[i])), b=(i,a)=>mod(sign*(a-D[i]));
  let scores=new Float64Array(R2),next=new Float64Array(R2);const back=new Uint8Array(n*R2);
  for(let a=0;a<R;a++)for(let d=0;d<R;d++)scores[a*R+d]=l1[a]+l1[b(0,a)]+l2[a*R+d]+l2[b(0,a)*R+b(1,d)];
  for(let i=2;i<n;i++){
   next.fill(-Infinity);
   for(let a=0;a<R;a++)for(let z=0;z<R;z++){
    const prev=a*R+z,bb=b(i-2,a),bz=b(i-1,z);
    for(let d=0;d<R;d++){
     const bd=b(i,d),state=z*R+d;
     const s=scores[prev]+l3[prev*R+d]+(i===split?l1[bd]:i===split+1?l2[bz*R+bd]:l3[(bb*R+bz)*R+bd]);
     if(s>next[state]){next[state]=s;back[i*R2+state]=a;}
    }
   }
   [scores,next]=[next,scores];
  }
  let state=0;for(let i=1;i<R2;i++)if(scores[i]>scores[state])state=i;
  const score=scores[state],A=Array(n);
  for(let i=n-1;i>=2;i--){A[i]=state%R;state=back[i*R2+state]*R+Math.floor(state/R);}
  A[0]=Math.floor(state/R);A[1]=state%R;const B=A.map((v,i)=>b(i,v)),K=A.map((v,i)=>mod(ca[i]-v));
  if(!A.every((v,i)=>mod(v+K[i])===ca[i]&&mod(B[i]+sign*K[i])===cb[i]))throw Error("replay");
  return {score,scorePerRune:score/(2*n),A,B,K};
 }
 let seed=123045;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%R;}
 const ca=p(23),results=[];
 for(const pair of [[14,55],[32,51]])for(const sign of [1,-1]){
  const cb=[...p(pair[0]),...p(pair[1])],split=p(pair[0]).length;
  if(ca.length!==cb.length)throw Error("length");
  const x=solve(ca,cb,split,sign),controls=[];
  for(let j=0;j<6;j++){
   const a=en.slice(end+100+j*241,end+313+j*241),b1=en.slice(end+5000+j*251,end+5000+j*251+split),b2=en.slice(end+10000+j*263,end+10000+j*263+213-split),b=[...b1,...b2],key=a.map(rand),key2=a.map(rand),c1=a.map((v,i)=>mod(v+key[i])),c2=b.map((v,i)=>mod(v+sign*key[i])),wrong=b.map((v,i)=>mod(v+sign*key2[i]));
   const y=solve(c1,c2,split,sign),z=solve(c1,wrong,split,sign);
   controls.push({correct:y.scorePerRune,wrong:z.scorePerRune,recovered:y.A.filter((v,i)=>v===a[i]).length+y.B.filter((v,i)=>v===b[i]).length});
  }
  results.push({pair,split,sign,score:x.scorePerRune,plainA:render(x.A),plainB1:render(x.B.slice(0,split)),plainB2:render(x.B.slice(split)),key:x.K,controls});
 }
 return {trainingRunes:end,holdoutRunes:en.length-end,results};
}
const root=path.join(__dirname,'..');
console.log(JSON.stringify(run(JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8')),fs.readFileSync(path.join(root,'resources/control/shakespeare_first300k.txt'),'utf8')),null,2));
