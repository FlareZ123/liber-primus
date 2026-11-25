'use strict';
const fs=require('node:fs');
const path=require('node:path');
function experiment(C,reference) {
 const assert=(x,m)=>{if(!x)throw Error(m)}, mod=x=>((x%29)+29)%29;
 const pg=n=>C.pages.find(p=>p.page===n).indices, original=pg(55), p57=pg(57);assert(original.length===76&&p57.length===95,"source lengths");
 const pow=(a,e)=>{let y=1;for(let i=0;i<e;i++)y=y*a%59;return y};
 const H=Array.from({length:29},(_,i)=>pow(5,i)),logs=[Array.from({length:29},(_,i)=>i),Array.from({length:29},(_,i)=>H.indexOf((i+1)**2%59))];
 assert(new Set(H).size===29&&logs.every(L=>new Set(L).size===29&&L.every(x=>x>=0)),"transport");
 const train=reference.split("### 56")[0].split("\n").filter(s=>s&&/^[A-Z0-9 ,"';.\-?!]+$/.test(s)).join("").replace(/[^A-Z]/g,"");
 assert(train.length>2000,"LP1 model only");
 const counts=Array(26**3).fill(0),den=Array(26**2).fill(0);
 for(let i=2;i<train.length;i++){const a=train.charCodeAt(i-2)-65,b=train.charCodeAt(i-1)-65,d=train.charCodeAt(i)-65;counts[(a*26+b)*26+d]++;den[a*26+b]++}
 const lm=counts.map((n,i)=>Math.log((n+0.3)/(den[Math.floor(i/26)]+7.8)));
 function render(P){return P.map(x=>C.translit[x]).join("")}
 function score(P){const str=render(P);let sum=0;for(let i=2;i<str.length;i++)sum+=lm[((str.charCodeAt(i-2)-65)*26+str.charCodeAt(i-1)-65)*26+str.charCodeAt(i)-65];return sum/(str.length-2)}
 const modes=[];for(const packing of ["interleaved","halves"])for(const swapped of [false,true])for(const transport of [0,1])modes.push({packing,swapped,transport});
 function slots(m,j){const x=m.packing==="interleaved"?2*j:j,y=m.packing==="interleaved"?2*j+1:38+j;return m.swapped?[y,x]:[x,y]}
 function decode(tape,m,a,check=false){const L=logs[m.transport],P=[];for(let j=0;j<38;j++){const [x,y]=slots(m,j);const q=L[tape[x]],r=L[tape[y]],p=L.indexOf(mod(r-a*q));P.push(p);if(check)assert(L.indexOf(mod(L[p]+a*q))===tape[y],"original replay")}return P}
 function search(tape,m,check=false){return Array.from({length:29},(_,a)=>{const P=decode(tape,m,a,check);return {a,P,score:score(P)}}).sort((a,b)=>b.score-a.score)}
 let state=0x59b17a01;function rnd(n){state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)%n}
 const controls=[];for(const m of modes)for(const [a,start] of [[6,0],[17,57]]){
  const P=p57.slice(start,start+38),L=logs[m.transport],tape=Array(76);
  for(let j=0;j<38;j++){const [x,y]=slots(m,j);tape[x]=rnd(29);tape[y]=L.indexOf(mod(L[P[j]]+a*L[tape[x]]))}
  const ranked=search(tape,m,true),rank=ranked.findIndex(x=>x.a===a)+1;
  assert(ranked[rank-1].P.every((x,i)=>x===P[i]),"positive inverse");
  controls.push({...m,a,rank,truthScore:ranked[rank-1].score,topScore:ranked[0].score});
 }
 const candidates=modes.flatMap(m=>search(original,m,true).map(x=>({...m,a:x.a,score:x.score,text:render(x.P),runes:x.P}))).sort((a,b)=>b.score-a.score);
 // Matched alphabet-multiset shuffle, maximize over exactly the same receiver family.
 const nullMax=[];for(let i=0;i<256;i++){const copy=original.slice();for(let j=copy.length-1;j>0;j--){const k=rnd(j+1);[copy[j],copy[k]]=[copy[k],copy[j]]}nullMax.push(Math.max(...modes.map(m=>search(copy,m)[0].score)))}
 return {sourceFamilies:candidates.length,trainLetters:train.length,controls,truthKeyRank1:controls.filter(x=>x.rank===1).length,truthScoreRange:[Math.min(...controls.map(x=>x.truthScore)),Math.max(...controls.map(x=>x.truthScore))],best:candidates.slice(0,10),direct:candidates.filter(x=>x.a===6),nullAtLeastOriginal:nullMax.filter(x=>x>=candidates[0].score).length,nullCount:nullMax.length,nullMax,candidates};
}
const root=path.join(__dirname,'..','resources','liber-primus');
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync(path.join(root,'lp2-corpus.json'),'utf8')),fs.readFileSync(path.join(root,'lp1-plaintext-reference.txt'),'utf8')),null,2));
