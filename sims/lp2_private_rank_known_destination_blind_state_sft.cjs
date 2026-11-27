'use strict';
const fs=require('node:fs');
/** Ciphertext-only rank-state and alphabet recovery given the fixed C-driven destination map. */
function run(g,donors){
const N=29, am=new Map(g.translit.map((x,i)=>[x,i]));am.set("ING",21);am.set("IO",27);
function norm(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");while(w.length){let ok=false;for(const n of [3,2,1])if(w.length>=n&&am.has(w.slice(0,n))){out.push(am.get(w.slice(0,n)));w=w.slice(n);ok=true;break}if(!ok)throw Error(w)}}return out}
let streams=donors.map(norm),freq=new Int32Array(N),bi=new Int32Array(N*N),tri=new Int32Array(N*N*N);for(let i=0;i<streams[2].length;i++){let p=streams[2][i];freq[p]++;if(i>0)bi[N*streams[2][i-1]+p]++;if(i>1)tri[N*N*streams[2][i-2]+N*streams[2][i-1]+p]++}
let logs=[...freq].sort((a,b)=>b-a).map(x=>Math.log((x+1)/(streams[2].length+N)));
let log3=new Float64Array(tri.length);for(let a=0;a<N;a++)for(let b=0;b<N;b++)for(let c=0;c<N;c++){let ab=N*a+b,bc=N*b+c;let base=(bi[bc]+0.1)/(freq[b]+0.1*N);log3[N*ab+c]=Math.log((tri[N*ab+c]+5*base)/(bi[ab]+5))}
let seed=318309;function random(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296}function rnd(n){return Math.floor(random()*n)}function perm(){let a=Array.from({length:N},(_,i)=>i);for(let i=N-1;i;i--){let j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const A=new Uint8Array(N),pos=new Uint8Array(N),hist=new Int32Array(N);
function tape(C,R,init,start,end,collect=false){for(let j=0;j<N;j++){A[j]=init[j];pos[init[j]]=j}hist.fill(0);let out=collect?[]:null;for(let i=0;i<end;i++){let c=C[i],r=pos[c],t=R[c];if(i>=start){hist[r]++;if(collect)out.push(r)}if(r<t){for(let j=r;j<t;j++){let v=A[j+1];A[j]=v;pos[v]=j}}else for(let j=r;j>t;j--){let v=A[j-1];A[j]=v;pos[v]=j}A[t]=c;pos[c]=t}let s=[...hist].sort((a,b)=>b-a);return{score:s.reduce((v,x,i)=>v+x*logs[i],0)/(end-start),out,final:[...A]}}
function encode(P,S,R,init){let A=init.slice(),out=[];for(let p of P){let r=S[p],c=A[r];out.push(c);A.splice(r,1);A.splice(R[c],0,c)}return out}
function optimizeA(C,R,end){let best=null,starts=[];for(let t=0;t<6;t++){let A=perm(),score=tape(C,R,A,0,end).score,initial=score,history=[];for(let k=0;k<15;k++){let bs=score,bi=-1,bj=-1;for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){[A[i],A[j]]=[A[j],A[i]];let s=tape(C,R,A,0,end).score;[A[i],A[j]]=[A[j],A[i]];if(s>bs+1e-12){bs=s;bi=i;bj=j}}if(bi<0)break;[A[bi],A[bj]]=[A[bj],A[bi]];score=bs;history.push(score)}let rec={A,score,initial,history};starts.push(rec);if(!best||score>best.score)best=rec}return{best,starts}}
function solveSubstitution(seq){
const counts=new Int32Array(N*N*N),u=new Int32Array(N);for(let i=0;i<seq.length;i++){u[seq[i]]++;if(i>1)counts[N*N*seq[i-2]+N*seq[i-1]+seq[i]]++}
let entries=[];for(let a=0;a<N;a++)for(let b=0;b<N;b++)for(let c=0;c<N;c++){let n=counts[N*N*a+N*b+c];if(n)entries.push([a,b,c,n])}
let affected=Array.from({length:N*N},()=>[]);for(let i=0;i<N;i++)for(let j=i+1;j<N;j++)affected[N*i+j]=entries.filter(e=>e[0]===i||e[1]===i||e[2]===i||e[0]===j||e[1]===j||e[2]===j);
function score(K,list=entries){let s=0;for(let [a,b,c,n] of list)s+=n*log3[N*N*K[a]+N*K[b]+K[c]];return s}
let uf=Array.from({length:N},(_,i)=>i).sort((a,b)=>u[b]-u[a]),pf=Array.from({length:N},(_,i)=>i).sort((a,b)=>freq[b]-freq[a]),frequency=Array(N);uf.forEach((r,i)=>frequency[r]=pf[i]);
let best=null;for(let tr=0;tr<16;tr++){let K=tr===0?frequency.slice():tr<8?frequency.slice():perm();if(tr>0&&tr<8)for(let j=0;j<tr*2;j++){let a=rnd(N),b=rnd(N);[K[a],K[b]]=[K[b],K[a]]}let s=score(K),top=s,topK=K.slice();
for(let step=0;step<10000;step++){let i=rnd(N),j=rnd(N);if(i===j)continue;if(i>j)[i,j]=[j,i];let e=affected[N*i+j],old=score(K,e);[K[i],K[j]]=[K[j],K[i]];let d=score(K,e)-old,temp=18*Math.pow(0.015,step/10000);if(d>=0||random()<Math.exp(d/temp)){s+=d;if(s>top){top=s;topK=K.slice()}}else[K[i],K[j]]=[K[j],K[i]]}
let v=score(topK);if(!best||v>best.score)best={K:topK,score:v};}
return best
}
function ngramScore(P){let z=0;for(let i=2;i<P.length;i++)z+=log3[N*N*P[i-2]+N*P[i-1]+P[i]];return z/(P.length-2)}
const controls=[];
for(let z=0;z<2;z++){
let P=streams[z].slice(38000,44000),S=perm(),init=perm(),cnt=new Int32Array(N);for(let p of P)cnt[p]++;let rare=Array.from({length:N},(_,i)=>i).sort((a,b)=>cnt[a]-cnt[b]).slice(0,8).map(p=>S[p]),R=Array.from({length:N},()=>rare[rnd(rare.length)]),C=encode(P,S,R,init),fit=3000;
let learned=optimizeA(C,R,fit),fitRank=tape(C,R,learned.best.A,0,fit,true),heldRank=tape(C,R,learned.best.A,fit,6000,true),key=solveSubstitution(fitRank.out),fitP=fitRank.out.map(r=>key.K[r]),heldP=heldRank.out.map(r=>key.K[r]),full=fitP.concat(heldP),rankAccuracy=heldRank.out.reduce((s,r,i)=>s+(r===S[P[fit+i]]),0),acc=heldP.reduce((s,p,i)=>s+(p===P[fit+i]),0),inv=Array(N);key.K.forEach((p,r)=>inv[p]=r);
if(String(encode(full,inv,R,learned.best.A))!==String(C))throw Error("replay");
controls.push({z,R,S,init,repeat:C.slice(1).filter((x,i)=>x===C[i]).length,observed:new Set(C).size,learned,key,rankAccuracy,fitAccuracy:fitP.reduce((s,p,i)=>s+(p===P[i]),0),heldAccuracy:acc,heldN:heldP.length,heldScore:ngramScore(heldP),nativeScore:ngramScore(P.slice(fit)),replay:true,heldPrefix:heldP.slice(0,120).map(p=>g.translit[p]).join(""),truePrefix:P.slice(fit,fit+120).map(p=>g.translit[p]).join("")})
}
return{seed:318309,controls}
}
const files=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
const x=files.map(p=>fs.readFileSync(p,'utf8'));
console.log(JSON.stringify(run(JSON.parse(x[0]),x.slice(1)),null,2));
