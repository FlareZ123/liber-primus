'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/external/2013-book-of-law-III.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function experiment(raw){
 const [c0,source,n0]=raw,c=JSON.parse(c0),native=JSON.parse(n0),Q=29,q=8;
 const mod=(x,n=Q)=>(x%n+n)%n,same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]),check=(v,m)=>{if(!v)throw Error(m)};
 const verse=source.split(/\r?\n/).find(l=>l.startsWith("2. ")).slice(3);
 const position=28, word=[...verse.matchAll(/[a-z]+/gi)].find(m=>m.index<=position-1&&position-1<m.index+m[0].length);
 const A=word.index,B=A+word[0].length,Pknown=[...word[0].toUpperCase()].map(x=>c.translit.indexOf(x));
 check(word[0]==="homeward"&&A===25&&B===33&&Pknown.every(x=>x>0)&&Pknown.length===q,"source anchor");
 const C=c.pages[32].indices;check(C.length===121&&same(C.slice(A,B),[27,4,16,2,0,0,3,2])&&same(C.slice(B,B+4),[8,3,19,18]),"original source");
 const read=s=>[...s].filter(x=>c.runes.includes(x)).map(x=>c.runes.indexOf(x));
 const train=native.sections.filter(s=>!["0_welcome","0_koan_1","p56_an_end","p57_parable"].includes(s.name)).map(s=>read(s.source_text));
 const uni=new Uint32Array(Q),bi=new Uint32Array(Q**2),tri=new Uint32Array(Q**3),bc=new Uint32Array(Q),tc=new Uint32Array(Q**2);let total=0;
 for(const a of train)for(let i=0;i<a.length;i++){uni[a[i]]++;total++;if(i){bi[a[i-1]*Q+a[i]]++;bc[a[i-1]]++}if(i>=2){let j=a[i-2]*Q+a[i-1];tri[j*Q+a[i]]++;tc[j]++}}
 const UP=Array.from(uni,x=>(x+1)/(total+Q));
 const BP=Array.from(bi,(x,i)=>(x+16*UP[i%Q])/(bc[Math.floor(i/Q)]+16));
 const TP=Array.from(tri,(x,i)=>(x+12*BP[i%(Q**2)])/(tc[Math.floor(i/Q)]+12));
 const logScore=a=>a.reduce((s,x,i)=>s+Math.log(i===0?UP[x]:i===1?BP[a[i-1]*Q+x]:TP[(a[i-2]*Q+a[i-1])*Q+x]),0);
 const heldScore=a=>(logScore(a.slice(0,A))+logScore(a.slice(B)))/(a.length-q);
 const render=a=>a.map(x=>c.translit[x]).join(" ");
 function encode(P,K,hold,start){let j=start;return P.map(p=>hold&&p===0?0:mod(p+K[j++%q]));}
 function solve(C,crib,hold){
  check(crib.length===q&&crib.every(x=>x!==0),"all-consuming crib");
  const K=C.slice(A,B).map((x,i)=>mod(x-crib[i]));
  const opt=C.map((x,i)=>hold&&x===0&&(i<A||i>=B)?i:-1).filter(i=>i>=0);
  check(opt.length<=24,"exact mask cap");
  const out=[],rejected=[];
  for(let m=0;m<2**opt.length;m++){
   const H=opt.filter((_,j)=>(m&(1<<j))!==0);
   const hset=new Set(H);
   const start=mod(-A+H.filter(i=>i<A).length,q);
   let phase=start,fail=null;const P=[];
   for(let i=0;i<C.length;i++){
    if(hset.has(i)){P.push(0);continue;}
    const p=mod(C[i]-K[phase]);if(hold&&!p){fail={offset:i,C:C[i],key:K[phase],phase};break;}
    P.push(p);phase=(phase+1)%q;
   }
   if(fail){rejected.push({holds:H,firstIllegalConsumption:fail});continue;}
   check(same(P.slice(A,B),crib)&&same(encode(P,K,hold,start),C),"exact replay/crib");
   out.push({start,holds:H,heldScore:heldScore(P),P,text:render(P),prefix:render(P.slice(0,A)),continuation:render(P.slice(B))});
  }
  return {K,optionalHolds:opt,masks:2**opt.length,rejected,candidates:out.sort((a,b)=>b.heldScore-a.heldScore)};
 }
 const controls=[];
 for(const [name,K] of [["0_welcome",[3,12,8,2,5,17,1,27]],["0_koan_1",[18,4,22,8,9,7,26,10]]]){
  const D=read(native.sections.find(x=>x.name===name).source_text);
  let off=0;while(off+121<=D.length&&D.slice(off+A,off+B).includes(0))off++;
  const P=D.slice(off,off+121);check(P.length===121&&!P.slice(A,B).includes(0),"control source");
  for(const hold of [false,true]){const x=encode(P,K,hold,0),s=solve(x,P.slice(A,B),hold);check(s.candidates.some(y=>same(y.P,P)),"native plant truth");controls.push({name,offset:off,hold,paths:s.candidates.length,truthRetained:true,topMatches:s.candidates[0].P.filter((x,i)=>x===P[i]).length,heldTrueScore:heldScore(P),heldTopScore:s.candidates[0].heldScore,relativeKey:s.K})}
 }
 const original=[false,true].map(hold=>({hold,...solve(C,Pknown,hold)}));
 return {sourceAddress:"III:2:28",sourceWord:word[0],sourceCharIntervalZeroBased:[A,B],originalRuneIntervalZeroBased:[A,B],actualCrib:Pknown,originalCipher:C.slice(A,B),nextOriginalPrefix:render(C.slice(B,B+4)),trainingRunes:total,controls,original};
}
if(require.main===module)console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'))),null,2));
module.exports={experiment};
