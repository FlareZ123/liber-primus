'use strict';
const fs=require('node:fs');
const experiment=function(corpus,native,gibran,shakespeare,emerson){
const n=29,range=()=>Array.from({length:n},(_,i)=>i),all=(1<<n)-1,R=corpus.prime.map(x=>(x-1)%n);
let seed=0xb47abdf1;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32},perm=()=>{let a=range();for(let i=n-1;i;i--){let j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const gm=new Map(corpus.translit.map((s,i)=>[s,i])),rm=new Map(corpus.runes.map((s,i)=>[s,i])),norm=lit=>{let D=[];for(let w of lit.toUpperCase().match(/[A-Z]+/g)){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");for(let i=0;i<w.length;){let q=w.slice(i,i+2);if(gm.has(q)){D.push(gm.get(q));i+=2}else D.push(gm.get(w[i++]));}}return D};
gibran=gibran.toUpperCase();let a=gibran.indexOf("ALMUSTAFA, THE CHOSEN");if(a>=0)gibran=gibran.slice(a);let b=gibran.indexOf("END OF THE PROJECT GUTENBERG");if(b>=0)gibran=gibran.slice(0,b);
const D=norm(gibran),train=[norm(shakespeare),norm(emerson),...native.sections.map(s=>[...s.source_text].filter(x=>rm.has(x)).map(x=>rm.get(x)))];
if(D.length!==48084||train.some(s=>s.some(x=>!Number.isInteger(x))))throw Error("source");
const model=reverse=>{let u=new Float64Array(n).fill(1),b=new Float64Array(n*n),t=new Float64Array(n*n*n);for(let seq of train){let a=reverse?seq.slice().reverse():seq;for(let i=0;i<a.length;i++){u[a[i]]++;if(i)b[n*a[i-1]+a[i]]++;if(i>1)t[n*n*a[i-2]+n*a[i-1]+a[i]]++;}}let sum=u.reduce((x,y)=>x+y);for(let i=0;i<n;i++)u[i]/=sum;
for(let i=0;i<n;i++){let s=0;for(let j=0;j<n;j++)s+=b[n*i+j];for(let j=0;j<n;j++)b[n*i+j]=(b[n*i+j]+10*u[j])/(s+10)}
for(let i=0;i<n*n;i++){let s=0;for(let j=0;j<n;j++)s+=t[n*i+j];for(let j=0;j<n;j++)t[n*i+j]=Math.log((t[n*i+j]+10*b[n*(i%n)+j])/(s+10))}
return {u:Array.from(u,Math.log),b:Array.from(b,Math.log),t}};
const models=[model(false),model(true)],encode=(P,S,A,hold)=>{A=A.slice();let C=[];for(let p of P){if(hold&&p===0){C.push(0);continue}let j=S[p],c=A[j];C.push(c);A.splice(j,1);A.splice(R[p],0,c)}return {C,A}};
const chars=P=>String.fromCharCode(...P.map(x=>65+x)),unchars=s=>Array.from(s,x=>x.charCodeAt(0)-65),render=P=>P.map(x=>corpus.translit[x]).join("");
function search(C0,{rev=false,hold=false,width=256,chart=null,crib=[],limit=3008,truth=null}={}){
let C=rev?C0.slice().reverse():C0.slice();C=C.slice(0,limit);let Ptruth=truth?(rev?truth.slice().reverse():truth).slice(0,C.length):null,truthString=Ptruth?chars(Ptruth):null;
let inv=Array(n).fill(-1);if(chart)chart.forEach((j,p)=>inv[j]=p);
let pool=[{A:Array(n).fill(-1),S:chart?chart.slice():Array(n).fill(-1),I:inv,used:chart?all:0,s:0,out:"",prev:-1,last:-1}];
let firstLost=null,expanded=0,deep=0,trace=[],M=models[+rev],rP=range().map(r=>range().filter(p=>R[p]===r));
for(let i=0;i<C.length;i++){
 const c=C[i],forced=i<crib.length?crib[i]:-1,heap=[];
 const push=(x)=>{let h=heap;if(h.length===width&&x.s<=h[0].s)return;if(h.length<width){let k=h.length;h.push(x);while(k){let j=(k-1)>>1;if(h[j].s<=x.s)break;h[k]=h[j];k=j}h[k]=x}else{let k=0;while(2*k+1<h.length){let j=2*k+1;if(j+1<h.length&&h[j+1].s<h[j].s)j++;if(h[j].s>=x.s)break;h[k]=h[j];k=j}h[k]=x}};
 for(const q of pool){
  const emit=(p,from,to)=>{if(forced>=0&&p!==forced)return;expanded++;const v=q.s+(q.prev<0?(q.last<0?M.u[p]:M.b[n*q.last+p]):M.t[n*n*q.prev+n*q.last+p]);push({q,p,from,to,s:v})};
  if(hold&&c===0)emit(0,-1,-1);
  if(hold&&forced===0)continue;
  let seen=q.A.indexOf(c),rs=seen>=0?[seen]:range().filter(j=>q.A[j]<0);
  if(!rev){for(let j of rs){let p=q.I[j];if(p>=0){if(!hold||p!==0)emit(p,j,R[p]);}else{for(let p=hold?1:0;p<n;p++)if(!(q.used&(1<<p)))emit(p,j,R[p]);}}}
  else{for(let r of rs)for(let p of rP[r]){if(hold&&p===0)continue;let j=q.S[p];if(j>=0)emit(p,r,j);else for(let j=0;j<n;j++)if(q.I[j]<0)emit(p,r,j);}}
 }
 if(!heap.length)break;
 let next=[];for(let e of heap){let {q,p,from,to,s}=e,A=q.A.slice(),S=q.S,I=q.I,used=q.used;if(from>=0){let j=rev?to:from;if(S[p]<0){S=S.slice();I=I.slice();S[p]=j;I[j]=p;used|=1<<p}A.splice(from,1);A.splice(to,0,c);}next.push({A,S,I,used,s,out:q.out+String.fromCharCode(65+p),prev:q.last,last:p});}
 pool=next;deep=i+1;
 if(Ptruth&&firstLost===null&&!pool.some(q=>q.out===truthString.slice(0,deep)))firstLost=deep;
 if(deep===32||deep===64||deep===128||deep===256||deep===512||deep===1024||deep===C.length)trace.push({deep,states:pool.length,best:Math.max(...pool.map(q=>q.s))/deep});
}
pool.sort((a,b)=>b.s-a.s);let best=pool[0],P=unchars(best.out);let accuracy=Ptruth?P.reduce((a,p,i)=>a+(p===Ptruth[i]),0):null;
let matchedKey=Ptruth?pool.some(q=>q.out===truthString):null;
return {rev,hold,width,knownChart:!!chart,crib:crib.length,deep,expanded,firstLost,accuracy,exactTruthInFinal:matchedKey,score:best.s/deep,preview:render(rev?P.slice(0,120).reverse():P.slice(0,120)),assigned:best.S.filter(x=>x>=0).length,trace};
}
let controls=[];for(let k=0;k<2;k++){let P=D.slice(8000+k*9000,8000+k*9000+512),S=perm(),A=perm(),hold=!!k,{C}=encode(P,S,A,hold);
for(let rev of [false,true]){let ordered=rev?P.slice().reverse():P;controls.push({plant:k,...search(C,{rev,hold,width:512,chart:S,truth:P})});controls.push({plant:k,...search(C,{rev,hold,width:512,truth:P})});controls.push({plant:k,...search(C,{rev,hold,width:512,truth:P,crib:ordered.slice(0,32)})});}}
return {source:{donor:D.length,train:train.map(x=>x.length),R},controls};
};
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
console.log(JSON.stringify(experiment(...paths.map((p,i)=>i<2?JSON.parse(fs.readFileSync(p,'utf8')):fs.readFileSync(p,'utf8'))),null,2));
