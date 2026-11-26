"use strict";
// Conditional ciphertext-only difference-key estimation, q=8 strict one-redraw.
// All randomized searches are seeded. Language enters only after D is frozen.
function run(co,native,gibran,shakespeare) {
const Q=8,A=29,Z=[0,0,0,1,0,0,0,1],m=x=>((x%29)+29)%29;
const j1=Array.from({length:Q},(_,j)=>(j+1)%Q),j2=Array.from({length:Q},(_,j)=>(j+2)%Q),free=Z.flatMap((v,i)=>v?[]:[i]);
let seed=0x3f910aaa;
function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return ((seed>>>0)+.5)/4294967296}
function rand(n){return Math.floor(rng()*n)}
function canon(D){return Array.from({length:Q},(_,j)=>D.slice(j).concat(D.slice(0,j)).join(",")).sort()[0]}
function gp(s){const g=new Map(co.runes.map((x,i)=>[x,i]));return [...s].filter(x=>g.has(x)).map(x=>g.get(x))}
function eng(s){let a=s.toUpperCase().replace(/[^A-Z]+/g," ").replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");let out=[];for(let i=0;i<a.length;){if(a[i]===" "){i++;continue}let v=co.translit.indexOf(a.slice(i,i+2));if(v>=0){out.push(v);i+=2}else{v=co.translit.indexOf(a[i++]);if(v>=0)out.push(v)}}return out}
function keyOf(D){let k=[0];for(let j=0;j<Q-1;j++)k.push(m(k[j]+D[j]));if(m(k[7]+D[7])!==0)throw Error("bad closure");return k}
function randomD(){let D;do{D=Z.map(z=>z?0:1+rand(28));D[free.at(-1)]=m(-D.reduce((a,b)=>a+b,0)+D[free.at(-1)])}while(D[free.at(-1)]===0);return D}
function emit(p,D){let k=keyOf(D).map(x=>m(x+11)),j=rand(Q),prev=-1,c=[];let skips=0;for(let x of p){let y=m(x+k[j]);j=j1[j];if(y===prev){y=m(x+k[j]);j=j1[j];skips++}c.push(y);prev=y}return {c,skips}}
function diff(c){return c.slice(1).map((x,i)=>m(x-c[i]))}
function hardScore(d,D,initial){let a=initial?Float64Array.from(initial):new Float64Array(Q).fill(1/Q),b=new Float64Array(Q),ls=0;for(let i=0;i<d.length;i++){let x=d[i];b.fill(0);if(x!==0){for(let j=0;j<Q;j++)b[j1[j]]+=a[j]}for(let j=0;j<Q;j++)if(x===D[j])b[j2[j]]+=a[j];if(x===0||i===d.length-1||(i&127)===127){let z=0;for(let j=0;j<Q;j++)z+=b[j];if(z===0)return {ll:-Infinity,phase:null};ls+=Math.log(z);for(let j=0;j<Q;j++)b[j]/=z}[a,b]=[b,a]}return {ll:ls,phase:Array.from(a)}}
// Soft surrogate: the one-redraw edge D_j is independently sampled from W_j per event.
function emStep(d,W,alpha){let n=d.length,f=new Float64Array((n+1)*Q),sc=new Float64Array(n);f.fill(1/Q,0,Q);for(let t=0;t<n;t++){let x=d[t],o=t*Q,k=o+Q,z=0;for(let j=0;j<Q;j++){if(x)f[k+j1[j]]+=f[o+j];f[k+j2[j]]+=f[o+j]*W[j*A+x]}for(let j=0;j<Q;j++)z+=f[k+j];if(z<=0)throw Error("unreachable soft state");sc[t]=z;for(let j=0;j<Q;j++)f[k+j]/=z}
let cnt=new Float64Array(Q*A),b=new Float64Array(Q).fill(1),a=new Float64Array(Q);
for(let t=n-1;t>=0;t--){let x=d[t],o=t*Q;for(let j=0;j<Q;j++){let v=W[j*A+x]*b[j2[j]];cnt[j*A+x]+=f[o+j]*v/sc[t];a[j]=((x?b[j1[j]]:0)+v)/sc[t]}[a,b]=[b,a]}
for(let j of free){let sum=0;for(let x=1;x<A;x++)sum+=cnt[j*A+x]+alpha;for(let x=1;x<A;x++)W[j*A+x]=(cnt[j*A+x]+alpha)/sum}
return sc.reduce((a,b)=>a+Math.log(b),0)}
function init(){let W=new Float64Array(Q*A);for(let j=0;j<Q;j++){if(Z[j])W[j*A]=1;else{let sum=0;for(let x=1;x<A;x++){let y=Math.exp(3*(rng()-.5));W[j*A+x]=y;sum+=y}for(let x=1;x<A;x++)W[j*A+x]/=sum}}return W}
// DP over residue sum selects a hard, closed D using the product of soft weights.
function round(W){let s=new Float64Array(A).fill(-Infinity),back=[];s[0]=0;for(let j=0;j<Q;j++){let next=new Float64Array(A).fill(-Infinity),p=new Int8Array(A).fill(-1);for(let u=0;u<A;u++)if(Number.isFinite(s[u]))for(let x=Z[j]?0:1;x<(Z[j]?1:A);x++){let v=m(u+x),val=s[u]+Math.log(W[j*A+x]);if(val>next[v]){next[v]=val;p[v]=x}}s=next;back.push(p)}
let D=Array(Q),u=0;for(let j=Q-1;j>=0;j--){D[j]=back[j][u];if(D[j]<0)throw Error("round failure");u=m(u-D[j])}return D}
function estimate(d,restarts=32,iters=48){let pool=new Map();function add(D,tag){let id=canon(D);if(pool.has(id))return;let s=hardScore(d,D).ll;pool.set(id,{D:D.slice(),ll:s,tag})}
for(let r=0;r<restarts;r++){let W=init();for(let i=0;i<iters;i++){emStep(d,W,.03);if(i===11||i===23||i===35||i===iters-1)add(round(W),"soft-"+r+"-"+(i+1))}}
let top=[...pool.values()].sort((a,b)=>b.ll-a.ll);if(!top.length)throw Error("empty pool");
let out=[];for(let candidate of top.slice(0,3)){let D=candidate.D.slice(),ll=candidate.ll,steps=0,rounds=0;for(let sweep=0;sweep<3;sweep++){let improve=false;for(let a=0;a<free.length;a++)for(let b=a+1;b<free.length;b++){let j=free[a],k=free[b],sum=m(D[j]+D[k]),oldj=D[j],oldk=D[k],bestj=oldj,bestk=oldk,best=ll;for(let x=1;x<A;x++){let y=m(sum-x);if(y===0||x===oldj)continue;D[j]=x;D[k]=y;let s=hardScore(d,D).ll;if(s>best+1e-9){best=s;bestj=x;bestk=y}}D[j]=bestj;D[k]=bestk;if(best>ll+1e-9){steps++;improve=true;ll=best}}
rounds++;if(!improve)break}out.push({D,ll,steps,rounds,initialLL:candidate.ll})}out.sort((a,b)=>b.ll-a.ll);return {best:out[0],distinctRounded:pool.size,topRounded:top.slice(0,5),refined:out}}
const nP=native.sections.flatMap(s=>gp(s.source_text)),counts=Array.from({length:A},()=>new Float64Array(A).fill(.3));for(let s of native.sections){let p=gp(s.source_text);for(let i=1;i<p.length;i++)counts[p[i-1]][p[i]]++}
const lm=counts.map(row=>{let s=row.reduce((a,b)=>a+b,0);return Array.from(row,x=>Math.log(A*x/s))});
function decode(c,K,previous=null,startPhase=null){let n=c.length,prev=c[0],a=new Float64Array(Q).fill(-Infinity),back=new Int8Array(n*Q).fill(-1);if(previous===null){for(let j=0;j<Q;j++)a[j1[j]]=0;back.fill(-2,0,Q)}else{a[startPhase]=0;prev=previous.c}
let first=previous===null?1:0;
for(let i=first;i<n;i++){let b=new Float64Array(Q).fill(-Infinity),x=c[i];for(let j=0;j<Q;j++){if(!Number.isFinite(a[j]))continue;let p0=i===0?previous.p:m(prev-K[(j+Q-1)%Q]);if(x!==prev){let p=m(x-K[j]),k=j1[j],s=a[j]+lm[p0][p];if(s>b[k]){b[k]=s;back[i*Q+k]=j}}let p=m(prev-K[j]);if(m(p+K[j1[j]])===x){let k=j2[j],s=a[j]+lm[p0][p];if(s>b[k]){b[k]=s;back[i*Q+k]=j}}}a=b;prev=x}
let end=0;for(let j=1;j<Q;j++)if(a[j]>a[end])end=j;if(!Number.isFinite(a[end]))return {score:-Infinity,p:[],end:null};let p=Array(n),j=end;for(let i=n-1;i>=first;i--){p[i]=m(c[i]-K[(j+Q-1)%Q]);j=back[i*Q+j];if(j<0)throw Error("bad backpointer")}if(previous===null)p[0]=m(c[0]-K[(j+Q-1)%Q]);let initial=previous===null?(j+Q-1)%Q:j;let ph=initial,prior=previous===null?-1:previous.c;for(let i=0;i<n;i++){let y=m(p[i]+K[ph]);ph=j1[ph];if(y===prior){y=m(p[i]+K[ph]);ph=j1[ph]}if(y!==c[i])throw Error('replay mismatch');prior=y}if(ph!==end)throw Error('phase replay mismatch');return {score:a[end],p,end,initial}}
function fitDecode(c,D,cut){let k=keyOf(D),best=null;for(let s=0;s<A;s++){let K=k.map(x=>m(x+s)),p=decode(c.slice(0,cut),K);if(best===null||p.score>best.fit.score)best={K,fit:p}}if(!Number.isFinite(best.fit.score))return {K:best.K,fitScore:null,heldScore:null,fitP:[],heldP:[]};let h=decode(c.slice(cut),best.K,{c:c[cut-1],p:best.fit.p.at(-1)},best.fit.end);return {K:best.K,fitScore:best.fit.score/(cut-1),heldScore:h.score/(c.length-cut),fitP:best.fit.p,heldP:h.p}}
function test(name,c,cut,truth,p,skips){let d=diff(c),tr=d.slice(0,cut-1),ho=d.slice(cut-1),fit=estimate(tr),s=hardScore(tr,fit.best.D),h=s.phase?hardScore(ho,fit.best.D,s.phase):{ll:-Infinity},de=fitDecode(c,fit.best.D,cut),trueLL=truth?hardScore(tr,truth).ll:null;
let preview=de.heldP.slice(0,120).map(x=>co.translit[x]).join(" ");
return {name,n:c.length,cut,skips,repeats:d.filter(x=>x===0).length,truth,correctD:truth?canon(truth)===canon(fit.best.D):null,trueLL,fit,heldLL:h.ll,decoded:{K:de.K,fitScore:de.fitScore,heldScore:de.heldScore,fitCorrect:p?de.fitP.filter((x,i)=>x===p[i]).length:null,heldCorrect:p?de.heldP.filter((x,i)=>x===p[cut+i]).length:null,preview}}}
const out=[],len=12956,cut=9640;
let donors=[["uniform",Array.from({length:len},()=>rand(A))],["gibran",eng(gibran).slice(19000,19000+len)],["shakespeare",eng(shakespeare).slice(16000,16000+len)]];
for(let [name,p] of donors){if(p.length!==len)throw Error("short donor");let D=randomD(),{c,skips}=emit(p,D);out.push(test(name,c,cut,D,p,skips))}
let c=co.pages.slice(0,56).flatMap(p=>p.indices);if(c.length!==len)throw Error("bad corpus");out.push(test("original",c,cut,null,null,null));
return {Z,seed:"0x3f910aaa",restarts:32,iterations:48,controls:out,nativeRunes:nP.length}
}
if(typeof module!=="undefined"){module.exports=run;if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/control/gibran_prophet_58585.txt"),read("resources/control/shakespeare_first300k.txt")),null,2))}}
