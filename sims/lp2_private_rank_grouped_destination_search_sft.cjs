'use strict';
const fs=require('node:fs');
/** Blind destination-map search: coordinate, group relocation/exchange and list transpositions. */
function run(g,donors){
const N=29,am=new Map(g.translit.map((x,i)=>[x,i]));am.set("ING",21);am.set("IO",27);
function norm(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");while(w.length){let ok=false;for(const n of [3,2,1])if(w.length>=n&&am.has(w.slice(0,n))){out.push(am.get(w.slice(0,n)));w=w.slice(n);ok=true;break}if(!ok)throw Error(w)}}return out}
let streams=donors.map(norm),freq=new Int32Array(N);for(let p of streams[2])freq[p]++;let logs=[...freq].sort((a,b)=>b-a).map(x=>Math.log((x+1)/(streams[2].length+N)));
let seed=318307;function rnd(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}function perm(){let a=Array.from({length:N},(_,i)=>i);for(let i=N-1;i;i--){let j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const A=new Uint8Array(N),pos=new Uint8Array(N),hist=new Int32Array(N),big=new Int32Array(N*N),nl=Array.from({length:20001},(_,i)=>i?i*Math.log(i):0);
function tape(C,R,init,start,end,collect=false){for(let j=0;j<N;j++){A[j]=init[j];pos[init[j]]=j}hist.fill(0);big.fill(0);let out=collect?[]:null,last=-1;for(let i=0;i<end;i++){let c=C[i],r=pos[c],t=R[c];if(i>=start){hist[r]++;if(last>=0)big[N*last+r]++;last=r;if(collect)out.push(r)}if(r<t){for(let j=r;j<t;j++){let v=A[j+1];A[j]=v;pos[v]=j}}else for(let j=r;j>t;j--){let v=A[j-1];A[j]=v;pos[v]=j}A[t]=c;pos[c]=t}let s=[...hist].sort((a,b)=>b-a),uni=s.reduce((v,x,i)=>v+x*logs[i],0)/(end-start),cond=(big.reduce((v,x)=>v+nl[x],0)-hist.reduce((v,x,i)=>v+nl[x-(i===last)],0))/(end-start-1);return{score:0.5*uni+cond,uni,cond,out,final:[...A]}}
function encode(P,S,R,init){let A=init.slice(),out=[];for(let p of P){let r=S[p],c=A[r];out.push(c);A.splice(r,1);A.splice(R[c],0,c)}return out}
function optimize(C,end,startMap,startList,restarts,passes,grouped){let best=null,records=[],tests=0;for(let tr=0;tr<restarts;tr++){let R=tr===0&&startMap?startMap.slice():Array.from({length:N},()=>rnd(N)),L=tr===0&&startList?startList.slice():perm();let score=tape(C,R,L,0,end).score,initial=score,history=[];for(let k=0;k<passes;k++){let ch=0;for(let c of perm()){let old=R[c],v=old,bs=score;for(let t=0;t<N;t++){if(t===old)continue;R[c]=t;let s=tape(C,R,L,0,end).score;tests++;if(s>bs+1e-12){bs=s;v=t}}R[c]=v;score=bs;ch+=v!==old}
let groupCh=0;if(grouped){for(let rep=0;rep<3;rep++){let bs=score,bestR=null,used=[...new Set(R)];for(let a of used){for(let b=0;b<N;b++){if(a===b)continue;
// Move all members of one target; additionally exchange two occupied targets.
let move=R.map(x=>x===a?b:x),s=tape(C,move,L,0,end).score;tests++;if(s>bs+1e-12){bs=s;bestR=move}
if(used.includes(b)&&b>a){let swap=R.map(x=>x===a?b:x===b?a:x);s=tape(C,swap,L,0,end).score;tests++;if(s>bs+1e-12){bs=s;bestR=swap}}}}
if(!bestR)break;R=bestR;score=bs;groupCh++}}
let chA=0;for(let a=0;a<5;a++){let bs=score,bi=-1,bj=-1;for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){[L[i],L[j]]=[L[j],L[i]];let s=tape(C,R,L,0,end).score;tests++;[L[i],L[j]]=[L[j],L[i]];if(s>bs+1e-12){bs=s;bi=i;bj=j}}if(bi<0)break;[L[bi],L[bj]]=[L[bj],L[bi]];score=bs;chA++}history.push({score,ch,groupCh,chA});if(!ch&&!chA&&!groupCh)break}
let rec={R,L,score,initial,history};records.push(rec);if(!best||score>best.score)best=rec}return{best,records,tests}}
function oracleMatch(pred,P){let count=Array.from({length:N},()=>new Int32Array(N));for(let i=0;i<P.length;i++)count[pred[i]][P[i]]++;let u=Array(N+1).fill(0),v=Array(N+1).fill(0),p=Array(N+1).fill(0),way=Array(N+1).fill(0);for(let i=1;i<=N;i++){p[0]=i;let j0=0,minv=Array(N+1).fill(Infinity),used=Array(N+1).fill(false);do{used[j0]=true;let i0=p[j0],delta=Infinity,j1=0;for(let j=1;j<=N;j++)if(!used[j]){let cur=-count[i0-1][j-1]-u[i0]-v[j];if(cur<minv[j]){minv[j]=cur;way[j]=j0}if(minv[j]<delta){delta=minv[j];j1=j}}for(let j=0;j<=N;j++){if(used[j]){u[p[j]]+=delta;v[j]-=delta}else minv[j]-=delta}j0=j1}while(p[j0]!==0);do{let j1=way[j0];p[j0]=p[j1];j0=j1}while(j0)}let match=0;for(let j=1;j<=N;j++)match+=count[p[j]-1][j-1];return match}
let controls=[];
for(let z=0;z<2;z++){let P=streams[z].slice(30000,36000),S=perm(),init=perm(),cnt=new Int32Array(N);for(let p of P)cnt[p]++;let rare=Array.from({length:N},(_,i)=>i).sort((a,b)=>cnt[a]-cnt[b]).slice(0,8).map(p=>S[p]),R=Array.from({length:N},()=>rare[rnd(rare.length)]),C=encode(P,S,R,init),fit=3000;
let tr=tape(C,R,init,0,fit),th=tape(C,R,init,fit,6000,true);let blind=optimize(C,fit,null,null,2,5,false);let grouped=optimize(C,fit,blind.best.R,blind.best.L,1,8,true);let perturb=R.slice();for(let c of perm().slice(0,3))perturb[c]=rnd(N);let near=optimize(C,fit,perturb,init,1,5,false);
function evaluate(r){let h=tape(C,r.best.R,r.best.L,fit,6000,true);let tp=0,fp=0,fn=0;for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){let a=R[i]===R[j],b=r.best.R[i]===r.best.R[j];if(a&&b)tp++;if(a&&!b)fn++;if(!a&&b)fp++}
return{best:r.best,otherScores:r.records.map(x=>x.score),tests:r.tests,held:{score:h.score,uni:h.uni,cond:h.cond,oracleMatch:oracleMatch(h.out,P.slice(fit)),direct:h.out.reduce((s,x,i)=>s+(x===S[P[fit+i]]),0)},mapMatches:Math.max(R.reduce((s,x,i)=>s+(x===r.best.R[i]),0),R.reduce((s,x,i)=>s+(28-x===r.best.R[i]),0)),partition:{tp,fp,fn}}}
controls.push({z,R,S,init,repeat:C.slice(1).filter((x,i)=>x===C[i]).length,truthFit:tr,truthHold:{score:th.score,uni:th.uni,cond:th.cond},blind:evaluate(blind),grouped:evaluate(grouped),near:evaluate(near)})
}
return{seed:318307,controls}
}
const files=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
const x=files.map(p=>fs.readFileSync(p,'utf8'));
console.log(JSON.stringify(run(JSON.parse(x[0]),x.slice(1)),null,2));
