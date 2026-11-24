"use strict";
const fs=require("node:fs");
const L=13,T=21;
function mod(x){return (x+29)%29}
function scan(A,B,L,T){
 const d=new Int8Array(L),m=new Int32Array(L),all=(1<<29)-1;
 let max=0,best=null,hits=0,hitStarts=0,calls=0;
 for(let a=0;a<A.length;a++)for(let b=0;b<B.length;b++){
  if(Math.min(A.length-a,B.length-b)<L+1)continue;
  d.fill(-1);m.fill(0);let hit=false;
  function walk(t,n,holds){
   calls++;
   if(n>max){max=n;best={a,b,length:t,active:n,holds,difference:Array.from(d)};}
   if(n===T&&!hit){hit=true;hits++;}
   if(a+t>=A.length||b+t>=B.length)return;
   const x=A[a+t],y=B[b+t],p=n%L,v=mod(x-y),old=d[p],mask=m[p],nm=mask|(1<<x);
   if((old<0||old===v)&&nm!==all){d[p]=v;m[p]=nm;walk(t+1,n+1,holds);d[p]=old;m[p]=mask;}
   if(x===0&&y===0)walk(t+1,n,holds+1);
  }
  walk(0,0,0);if(hit)hitStarts++;
 }
 return {max,best,hits,hitStarts,calls,starts:A.length*B.length};
}
function encrypt(P,K,phase){
 return P.map(p=>{if(p===0)return 0;const c=mod(p+K[phase]);phase=(phase+1)%K.length;return c;});
}
function rng(seed){let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};}
function shuffle(xs,r){let a=xs.slice();for(let i=a.length-1;i>0;i--){let j=r()%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
function repeat(P){
 let best={n:0};
 for(let a=0;a<P.length;a++)for(let b=a+1;b<P.length;b++){
  let n=0;while(b+n<P.length&&n<b-a&&P[a+n]===P[b+n])n++;
  if(n>best.n)best={a,b,n};
 }return best;
}

function fBranchControl(corpus,gold){
 const P=Array.from(gold.sections.find(s=>s.name==="0_welcome").source_text).filter(x=>corpus.runes.includes(x)).map(x=>corpus.runes.indexOf(x)).slice(30,95);
 const K=Array.from({length:L},(_,j)=>(j*7+3)%29),J=Array.from({length:L},(_,j)=>(j*11+5)%29);
 // Force simultaneous generated ciphertext F at the first non-F rune, with phases 3 and 8.
 const first=P.find(x=>x!==0);K[3]=J[8]=mod(-first);
 const A=encrypt(P,K,3),B=encrypt(P,J,8),D=Array.from({length:L},(_,j)=>mod(K[(j+3)%L]-J[(j+8)%L]));
 let n=0,hold=0,ordinaryZero=0;
 for(let t=0;t<P.length;t++){
  if(P[t]===0){if(A[t]!==0||B[t]!==0)throw Error("hold");hold++;continue;}
  if(mod(A[t]-B[t])!==D[n%L])throw Error("difference");
  if(A[t]===0&&B[t]===0)ordinaryZero++;
  n++;
 }
 const result=scan(A,B,L,T);
 if(result.max<n||hold===0||ordinaryZero===0)throw Error("latent F control");
 return {length:P.length,active:n,hold,ordinaryZero,result,expectedDifference:D};
}

function run(corpus,gold){
 const R=rng(0x2545a006),extract=s=>Array.from(s).filter(c=>corpus.runes.includes(c)).map(c=>corpus.runes.indexOf(c));
 const controls=gold.sections.map(s=>{let P=extract(s.source_text);return {name:s.name,P,...repeat(P)};}).sort((a,b)=>b.n-a.n);
 const src=controls[0],plants=[];
 for(let i=0;i<6;i++){
 const K=Array.from({length:L},()=>R()%29),J=Array.from({length:L},()=>R()%29),u=R()%L,v=R()%L;
 // Independent intervals centered on actual repeated native passage, retain 30-rune flanks.
 const a=Math.max(0,src.a-30),b=Math.max(0,src.b-30);
 const P=src.P.slice(a,src.a+src.n+30),Q=src.P.slice(b,src.b+src.n+30);
 const C=encrypt(P,K,u),D=encrypt(Q,J,v),z=scan(C,D,L,T);
 const aa=src.a-a,bb=src.b-b,active=src.P.slice(src.a,src.a+src.n).filter(x=>x!==0).length;
 const recovered=scan(C.slice(aa,aa+src.n),D.slice(bb,bb+src.n),L,T);
 plants.push({i,active,expectedStart:[aa,bb],result:z,atKnownRepeat:recovered,correctDifference:Array.from({length:L},(_,p)=>mod(K[(u+P.slice(0,aa).filter(x=>x!==0).length+p)%L]-J[(v+Q.slice(0,bb).filter(x=>x!==0).length+p)%L]))});
 }
 const A=corpus.pages.filter(p=>p.page>=23&&p.page<=26).flatMap(p=>p.indices),B=corpus.pages.filter(p=>p.page>=54&&p.page<=55).flatMap(p=>p.indices);
 const original=scan(A,B,L,T),nulls=[];
 for(let i=0;i<12;i++)nulls.push(scan(shuffle(A,R),shuffle(B,R),L,T).max);
 return {period:L,threshold:T,fBranchControl:fBranchControl(corpus,gold),controls:controls.map(({name,a,b,n})=>({name,a,b,n})),plant:plants,scopes:[A.length,B.length],original,nulls};
}
console.log(JSON.stringify(run(JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8")),JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8"))),null,2));
