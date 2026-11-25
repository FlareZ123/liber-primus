'use strict';
const fs=require('node:fs');
function rankPilot(c,n,gs,es,ss){
const check=(x,m)=>{if(!x)throw Error(m)},mod=(x,m)=>(x%m+m)%m;
const C=c.pages.slice(0,56).flatMap(p=>p.indices),N=C.length,cut=9717;
const prime=[];for(let x=2;prime.length<=N;x++){let ok=true;for(const p of prime){if(p*p>x)break;if(x%p===0){ok=false;break}}if(ok)prime.push(x)}
const log=Array(29).fill(-1),pow=[];let a=1;for(let i=0;i<28;i++){log[a]=i;pow.push(a);a=a*15%29}check(new Set(pow).size===28,"primitive root");
const map=Object.fromEntries(c.translit.map((x,i)=>[x,i]));Object.assign(map,{ING:21,IO:27,V:1,K:5,Q:5,Z:15});const keys=Object.keys(map).sort((a,b)=>b.length-a.length);
function encode(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)){w=w.replace(/QU/g,"CW");while(w){let k=keys.find(x=>w.startsWith(x));check(k,"token "+w);out.push(map[k]);w=w.slice(k.length)}}return out}
const donor=[encode(gs.slice(gs.indexOf("|Almustafa"),gs.indexOf("*** END OF"))),encode(es.slice(es.indexOf("THERE is one mind"),es.indexOf("*** END OF")))];
let rng=0x30310123;const rnd=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0},perm=n=>{let p=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const j=rnd()%(i+1);[p[i],p[j]]=[p[j],p[i]]}return p};
function trace(A,q,hold){let t=0,last=0;const O=[];for(let i=0;i<A.length;i++){let d=mod(A[i]-last,29),k=mod(prime[t]-1,28);last=A[i];O.push(d?{v:(t%q)*28+log[d],k}:null);if(d||!hold)t++}return O}
const zero=trace(C,8,false).map(x=>!x);
function plant(P,q,hold){const A=perm(29),pos=Array(29);A.forEach((p,i)=>pos[p]=i);const K=Array.from({length:q},()=>perm(28)),fwd=K.map(r=>{const inv=Array(28);r.forEach((x,i)=>inv[x]=i);return inv});let t=0,last=0;const cipher=[],ranks=[];for(let i=0;i<P.length;i++){const p=pos[P[i]],k=mod(prime[t]-1,28);if(zero[i]){cipher.push(last);ranks.push(-1);if(!hold)t++;continue}let e=rnd()%28;if(e>=p)e++;const r=p-Number(p>e),s=mod(r+k,28),z=fwd[t%q][s];last=mod(last+pow[z],29);cipher.push(last);ranks.push(r);t++}return {A,K,P,cipher,ranks}}
function assign(W){const n=W.length,u=Array(n+1).fill(0),v=u.slice(),p=u.slice(),way=u.slice();for(let i=1;i<=n;i++){p[0]=i;let j0=0;const min=Array(n+1).fill(Infinity),used=Array(n+1).fill(false);do{used[j0]=true;const i0=p[j0];let d=Infinity,j1=0;for(let j=1;j<=n;j++)if(!used[j]){const cur=-W[i0-1][j-1]-u[i0]-v[j];if(cur<min[j]){min[j]=cur;way[j]=j0}if(min[j]<d){d=min[j];j1=j}}for(let j=0;j<=n;j++){if(used[j]){u[p[j]]+=d;v[j]-=d}else min[j]-=d}j0=j1}while(p[j0]!==0);do{const j1=way[j0];p[j0]=p[j1];j0=j1}while(j0)}const ans=Array(n);for(let j=1;j<=n;j++)ans[p[j]-1]=j-1;return ans}
function run(A,q,hold,truth){const O=trace(A,q,hold),rows=Array.from({length:q*28},()=>Array(28).fill(0));for(let i=0;i<cut;i++)if(O[i])rows[O[i].v][O[i].k]++;
const trainN=O.slice(0,cut).filter(Boolean).length,testN=O.slice(cut).filter(Boolean).length;
const freq=counts=>{const total=counts.reduce((s,x)=>s+x,0);return counts.map(x=>(x+1)/(total+28))};
function evaluate(K,f,lo,hi){const lk=f.map(Math.log);let s=0,n=0;for(let i=lo;i<hi;i++){const o=O[i];if(o){s+=lk[mod(K[Math.floor(o.v/28)][o.v%28]-o.k,28)];n++}}return {score:s/n,gain:s/n+Math.log(28),n}}
let best=null;const starts=[];
for(let run=0;run<16;run++){let f=freq(Array.from({length:28},()=>1+rnd()%1000)),prev=-Infinity,K;let it=0;for(;it<35;it++){
const lf=f.map(Math.log);K=[];for(let ph=0;ph<q;ph++){let W=Array.from({length:28},(_,z)=>Array.from({length:28},(_,s)=>{let w=0;for(let k=0;k<28;k++)w+=rows[ph*28+z][k]*lf[mod(s-k,28)];return w}));K.push(assign(W))}
let count=Array(28).fill(0);for(let v=0;v<rows.length;v++){const s=K[Math.floor(v/28)][v%28];for(let k=0;k<28;k++)count[mod(s-k,28)]+=rows[v][k]}f=freq(count);let score=evaluate(K,f,0,cut).score;if(score-prev<1e-12)break;prev=score;
}
const train=evaluate(K,f,0,cut),test=evaluate(K,f,cut,N);const obj={run,it,train,test,f,K};starts.push({run,it,train:train.gain,test:test.gain});if(!best||train.score>best.train.score)best=obj;
}
let oracle=null;if(truth){const count=Array(28).fill(0);for(let i=0;i<cut;i++)if(truth.ranks[i]>=0)count[truth.ranks[i]]++;let f=freq(count);oracle={train:evaluate(truth.K,f,0,cut),test:evaluate(truth.K,f,cut,N),f};let accuracy=0;for(let paritySwap of [0,1])for(let a=0;a<14;a++)for(let b=0;b<14;b++){let score=0;for(let ph=0;ph<q;ph++)for(let z=0;z<28;z++){const x=truth.K[ph][z],y=mod(x+2*(x%2?b:a)+paritySwap,28);if(best.K[ph][z]===y)score++}accuracy=Math.max(accuracy,score)}oracle.keyAccuracyGauge=accuracy/(q*28)}
return {q,hold,trainN,testN,best,starts,oracle}}
const results=[];for(const [q,hold] of [[8,false],[13,true]]){const p=plant(donor[q===8?0:1].slice(q===8?1000:3000,(q===8?1000:3000)+N),q,hold);let start=Date.now();const fit=run(p.cipher,q,hold,p);results.push({kind:"plant",...fit,ms:Date.now()-start,hidden:p});start=Date.now();results.push({kind:"original",...run(C,q,hold,null),ms:Date.now()-start})}
return {N,cut,results};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
console.log(JSON.stringify(rankPilot(JSON.parse(fs.readFileSync(paths[0],'utf8')),JSON.parse(fs.readFileSync(paths[1],'utf8')),...paths.slice(2).map(p=>fs.readFileSync(p,'utf8'))),null,2));
