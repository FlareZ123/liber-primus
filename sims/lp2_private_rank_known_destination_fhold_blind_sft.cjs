'use strict';
const fs=require('node:fs');
/** Ciphertext-only rank-state and alphabet recovery given the fixed C-driven destination map. */
function run(g,donors,which=0){
const N=29, am=new Map(g.translit.map((x,i)=>[x,i]));am.set("ING",21);am.set("IO",27);
function norm(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");while(w.length){let ok=false;for(const n of [3,2,1])if(w.length>=n&&am.has(w.slice(0,n))){out.push(am.get(w.slice(0,n)));w=w.slice(n);ok=true;break}if(!ok)throw Error(w)}}return out}
let streams=donors.map(norm),freq=new Int32Array(N),bi=new Int32Array(N*N),tri=new Int32Array(N*N*N);for(let i=0;i<streams[2].length;i++){let p=streams[2][i];freq[p]++;if(i>0)bi[N*streams[2][i-1]+p]++;if(i>1)tri[N*N*streams[2][i-2]+N*streams[2][i-1]+p]++}
let logs=[...freq].sort((a,b)=>b-a).map(x=>Math.log((x+1)/(streams[2].length+N)));
let log3=new Float64Array(tri.length);for(let a=0;a<N;a++)for(let b=0;b<N;b++)for(let c=0;c<N;c++){let ab=N*a+b,bc=N*b+c;let base=(bi[bc]+0.1)/(freq[b]+0.1*N);log3[N*ab+c]=Math.log((tri[N*ab+c]+5*base)/(bi[ab]+5))}
let seed=318309;function random(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296}function rnd(n){return Math.floor(random()*n)}function perm(){let a=Array.from({length:N},(_,i)=>i);for(let i=N-1;i;i--){let j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const A=new Uint8Array(N),pos=new Uint8Array(N),hist=new Int32Array(N);
const pf=[...freq].map((v,i)=>[v,i]).filter(x=>x[1]!==0).sort((a,b)=>b[0]-a[0]),den=streams[2].length+N,nonFLogs=pf.map(x=>Math.log((x[0]+1)/den)),fLog=Math.log((freq[0]+1)/den);
function tape(C,R,init,H,end,collect=false){for(let j=0;j<N;j++){A[j]=init[j];pos[init[j]]=j}hist.fill(0);let out=collect?[]:null,held=0;for(let i=0;i<end;i++){let c=C[i];if(c===0&&H[i]){held++;if(out)out.push(N);continue}let r=pos[c],t=R[c];hist[r]++;if(out)out.push(r);if(r<t){for(let j=r;j<t;j++){let v=A[j+1];A[j]=v;pos[v]=j}}else for(let j=r;j>t;j--){let v=A[j-1];A[j]=v;pos[v]=j}A[t]=c;pos[c]=t}
let ix=Array.from({length:N},(_,i)=>i).sort((a,b)=>hist[b]-hist[a]),f=ix[N-1],bad=hist[f],score=held*fLog-20*bad;for(let j=0;j<N-1;j++)score+=hist[ix[j]]*nonFLogs[j];return{score,f,bad,held,out,final:collect?[...A]:null}}
function encode(P,S,R,init){let A=init.slice(),out=[],H=[];for(let p of P){if(p===0){out.push(0);H.push(1);continue}let r=S[p],c=A[r];out.push(c);H.push(0);A.splice(r,1);A.splice(R[c],0,c)}return{C:out,H}}
function optimize(C,R,end,truth,oracle=false){let best=null,starts=[],zeros=C.slice(0,end).map((c,i)=>c===0?i:-1).filter(i=>i>=0);
for(let t=0;t<4;t++){let A=perm(),H=new Uint8Array(end);for(let i of zeros)H[i]=oracle?truth[i]:t===0?1:t===1?0:+(random()<0.65);let cur=tape(C,R,A,H,end),initial=cur.score,history=[];
for(let k=0;k<8;k++){let bs=cur.score,bi=-1,bj=-1;for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){[A[i],A[j]]=[A[j],A[i]];let z=tape(C,R,A,H,end).score;[A[i],A[j]]=[A[j],A[i]];if(z>bs+1e-9){bs=z;bi=i;bj=j}}if(bi>=0)[A[bi],A[bj]]=[A[bj],A[bi]];cur=tape(C,R,A,H,end);let n=0;if(!oracle){let ix=zeros.slice();for(let j=ix.length-1;j>0;j--){let k=rnd(j+1);[ix[j],ix[k]]=[ix[k],ix[j]]}for(let i of ix){H[i]^=1;let z=tape(C,R,A,H,end);if(z.score>cur.score+1e-9){cur=z;n++}else H[i]^=1}}
history.push({score:cur.score,bad:cur.bad,holds:cur.held,changes:n});if(bi<0&&!n)break}
let rec={A,H:[...H],score:cur.score,bad:cur.bad,f:cur.f,initial,history};starts.push({score:rec.score,bad:rec.bad,f:rec.f,initial,history});if(!best||cur.score>best.score)best=rec}
return{best,starts}}
function solveSubstitution(seq,f){
const counts=new Int32Array(N*N*N),u=new Int32Array(N);for(let i=0;i<seq.length;i++){u[seq[i]]++;if(i>1)counts[N*N*seq[i-2]+N*seq[i-1]+seq[i]]++}
let entries=[];for(let a=0;a<N;a++)for(let b=0;b<N;b++)for(let c=0;c<N;c++){let n=counts[N*N*a+N*b+c];if(n)entries.push([a,b,c,n])}
let affected=Array.from({length:N*N},()=>[]);for(let i=0;i<N;i++)for(let j=i+1;j<N;j++)affected[N*i+j]=entries.filter(e=>e[0]===i||e[1]===i||e[2]===i||e[0]===j||e[1]===j||e[2]===j);
function score(K,list=entries){let s=0;for(let [a,b,c,n] of list)s+=n*log3[N*N*K[a]+N*K[b]+K[c]];return s}
let uf=Array.from({length:N},(_,i)=>i).sort((a,b)=>u[b]-u[a]),pf=Array.from({length:N},(_,i)=>i).sort((a,b)=>freq[b]-freq[a]),frequency=Array(N);uf.forEach((r,i)=>frequency[r]=pf[i]);
let j0=frequency.indexOf(0);[frequency[j0],frequency[f]]=[frequency[f],frequency[j0]];let best=null;for(let tr=0;tr<12;tr++){let K=tr===0?frequency.slice():tr<8?frequency.slice():perm();let z0=K.indexOf(0);[K[z0],K[f]]=[K[f],K[z0]];if(tr>0&&tr<8)for(let j=0;j<tr*2;j++){let a=rnd(N),b=rnd(N);if(a!==f&&b!==f)[K[a],K[b]]=[K[b],K[a]]}let s=score(K),top=s,topK=K.slice();
for(let step=0;step<10000;step++){let i=rnd(N),j=rnd(N);if(i===j||i===f||j===f)continue;if(i>j)[i,j]=[j,i];let e=affected[N*i+j],old=score(K,e);[K[i],K[j]]=[K[j],K[i]];let d=score(K,e)-old,temp=18*Math.pow(0.015,step/10000);if(d>=0||random()<Math.exp(d/temp)){s+=d;if(s>top){top=s;topK=K.slice()}}else[K[i],K[j]]=[K[j],K[i]]}
let v=score(topK);if(!best||v>best.score)best={K:topK,score:v};}
return best
}
function ngramScore(P){let z=0;for(let i=2;i<P.length;i++)z+=log3[N*N*P[i-2]+N*P[i-1]+P[i]];return z/(P.length-2)}
function beam(C,R,A0,K,fitP,width=128){let states=[{A:A0,tail:fitP.slice(-2),score:0,P:[]}],peak=1;for(let i=0;i<C.length;i++){let c=C[i],next=new Map();for(let x of states){function add(A,p){let [a,b]=x.tail,score=x.score+log3[N*N*a+N*b+p],tail=[b,p],id=A.join(",")+"|"+tail.join(",");let old=next.get(id);if(!old||score>old.score)next.set(id,{A,tail,score,P:x.P.concat(p)})}if(c===0)add(x.A,0);let r=x.A.indexOf(c),p=K[r];if(p!==0){let A=x.A.slice();A.splice(r,1);A.splice(R[c],0,c);add(A,p)}}if(!next.size)return{dead:i,peak};states=[...next.values()].sort((a,b)=>b.score-a.score).slice(0,width);peak=Math.max(peak,next.size)}return{dead:null,peak,...states[0]}}
let z=which,P=streams[z].slice(23000,29000),S=perm(),init=perm(),cnt=new Int32Array(N);for(let p of P)cnt[p]++;let rare=Array.from({length:N},(_,i)=>i).sort((a,b)=>cnt[a]-cnt[b]).slice(0,8).map(p=>S[p]),R=Array.from({length:N},()=>rare[rnd(rare.length)]),{C,H}=encode(P,S,R,init),fit=3000,results=[];
for(let oracle of [true,false]){let learned=optimize(C,R,fit,H,oracle),best=learned.best,fitRank=tape(C,R,best.A,best.H,fit,true),f=fitRank.f,rankAccuracy=fitRank.out.reduce((s,r,i)=>s+((r===N?f:r)===S[P[i]]),0),holdAccuracy=best.H.reduce((s,v,i)=>s+(v===H[i]),0);
let result={oracle,learned:{A:best.A,score:best.score,bad:best.bad,f,starts:learned.starts},rankAccuracy,holdAccuracy,holdCorrectOnZeros:C.slice(0,fit).reduce((s,c,i)=>s+(c===0&&best.H[i]===H[i]),0),trueHolds:H.slice(0,fit).reduce((s,x)=>s+x,0),zeroFit:C.slice(0,fit).filter(x=>x===0).length};
if(best.bad===0){let key=solveSubstitution(fitRank.out.map(r=>r===N?f:r),f),fitP=fitRank.out.map(r=>r===N?0:key.K[r]),held=beam(C.slice(fit),R,fitRank.final,key.K,fitP),inv=Array(N);key.K.forEach((p,r)=>inv[p]=r);result.key=key;result.fitAccuracy=fitP.reduce((s,p,i)=>s+(p===P[i]),0);result.held={dead:held.dead,peak:held.peak};if(held.dead===null){result.held.accuracy=held.P.reduce((s,p,i)=>s+(p===P[fit+i]),0);result.held.score=ngramScore(held.P);result.held.nativeScore=ngramScore(P.slice(fit));result.held.replay=String(encode(fitP.concat(held.P),inv,R,best.A).C)===String(C);result.held.prefix=held.P.slice(0,120).map(p=>g.translit[p]).join("");}}results.push(result)}
return{seed:318309,z,R,S,init,repeat:C.slice(1).filter((x,i)=>x===C[i]).length,results}
}
const files=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
const x=files.map(p=>fs.readFileSync(p,'utf8'));
console.log(JSON.stringify(run(JSON.parse(x[0]),x.slice(1),Number(process.argv[2]||0)),null,2));
