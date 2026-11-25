'use strict';
const fs = require('node:fs');
const paths = ["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp1-plaintext-reference.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
function research(corpus,lp1,gibran,emerson,shakespeare){
 const M=3301,A=29,N=841,Q=16,K=32,fit=1340;
 const assert=(b,m)=>{if(!b)throw Error(m)};
 const grid=[3258,3222,3152,3038,3278,3299,3298,2838,3288,3294,3296,2472,4516,1206,708,1820],route=[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12],fib=[0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987],primes=[];
 for(let x=2;primes.length<988;x++)if(primes.every(p=>p*p>x||x%p!==0))primes.push(x);
 const sourceKey=route.map(i=>grid[i]);assert(sourceKey.every((v,i)=>v===Math.abs(M-primes[fib[i]])),"grid");
 function inv(a){let t=0,u=1,r=M,s=a%M;while(s){let q=Math.floor(r/s);[t,u]=[u,t-q*u];[r,s]=[s,r-q*s]}assert(r===1,"unit");return(t+M)%M}
 const maps=Array(M),inverse=Array(M);for(let a=1;a<M;a++)inverse[a]=inv(a);
 let checked=0;for(let a=1;a<M;a++){let f=new Uint16Array(N);for(let x=0;x<N;x++){let y=x;do{y=y*a%M}while(y>=N);f[x]=y}maps[a]=f}
 for(let a=1;a<M;a++)for(let x=0;x<N;x++){assert(maps[inverse[a]][maps[a][x]]===x,"inverse table");checked++}
 const native=s=>{const map=corpus.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length),out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/K/g,"C").replace(/V/g,"U").replace(/Q/g,"C").replace(/Z/g,"S");while(w.length){let m=map.find(([v])=>w.startsWith(v));if(!m)throw Error("letter "+w);out.push(m[1]);w=w.slice(m[0].length)}}return out};
 const l1=native(lp1.split(/^### 56/m)[0].split(/\r?\n/).filter(x=>!/^#|^\[|^\(continued/.test(x)).join("\n")),train=l1.concat(native(gibran));
 const pc=new Float64Array(N).fill(.5),tc=new Float64Array(N*A).fill(.5),ts=new Float64Array(N).fill(A*.5);
 for(let i=1;i<train.length;i++){pc[train[i-1]*A+train[i]]++;if(i>=2){const h=train[i-2]*A+train[i-1];tc[h*A+train[i]]++;ts[h]++}}
 const pairLog=Float64Array.from(pc,v=>Math.log(v/(train.length-1+N*.5))),triLog=Float64Array.from(tc,(v,i)=>Math.log(v/ts[Math.floor(i/A)]));
 const text=t=>t.map(x=>corpus.translit[x]).join(""),eq=(x,y)=>x.length===y.length&&x.every((v,i)=>v===y[i]);
 function metrics(t){let score=0,adj=0;const n=Array(A).fill(0);for(let i=0;i<t.length;i++){n[t[i]]++;if(i&&t[i]===t[i-1])adj++;if(i>=2)score+=triLog[(t[i-2]*A+t[i-1])*A+t[i]]}return{runes:t.length,ioc:n.reduce((s,x)=>s+x*(x-1),0)/(t.length*(t.length-1)),adjacentEquals:adj,trigramMean:score/(t.length-2),prefix:text(t.slice(0,96))}}
 function pairs(t){assert(t.length%2===0,"even");return Array.from({length:t.length/2},(_,i)=>t[2*i]*A+t[2*i+1])}
 function transform(t,key,decrypt){return pairs(t).flatMap((x,i)=>{let a=key[i%Q]%M;if(decrypt)a=inverse[a];let v=maps[a][x];return[Math.floor(v/A),v%A]})}
 function learn(cipher,truthKey=null){
  const cp=pairs(cipher.slice(0,fit)),obs=Array.from({length:Q},()=>[]);cp.forEach((v,i)=>obs[i%Q].push(v));
  const domains=obs.map(o=>{const scored=[];for(let a=1;a<M;a++){const tab=maps[inverse[a]];let score=0;for(const v of o)score+=pairLog[tab[v]];scored.push({a,score})}scored.sort((x,y)=>y.score-x.score||x.a-y.a);return scored});
  const ranks=truthKey?domains.map((d,r)=>d.findIndex(x=>x.a===truthKey[r]%M)+1):null;
  const cand=domains.map(d=>d.slice(0,K).map(x=>x.a)),decoded=cand.map((d,r)=>d.map(a=>obs[r].map(v=>maps[inverse[a]][v])));
  const W=Array.from({length:Q},()=>new Float64Array(K*K));for(let r=0;r<Q;r++){const s=(r+1)%Q;for(let i=0;i<K;i++)for(let j=0;j<K;j++){let z=0;for(let k=r;k+1<cp.length;k+=Q){const x=decoded[r][i][Math.floor(k/Q)],y=decoded[s][j][Math.floor((k+1)/Q)];z+=triLog[x*A+Math.floor(y/A)]+triLog[((x%A)*A+Math.floor(y/A))*A+y%A]}W[r][i*K+j]=z}}
  let best=-Infinity,keyIndices=null;for(let start=0;start<K;start++){let dp=new Float64Array(K).fill(-Infinity);dp[start]=0;const back=[];for(let r=0;r<Q-1;r++){const next=new Float64Array(K).fill(-Infinity),bk=new Int16Array(K);for(let j=0;j<K;j++)for(let i=0;i<K;i++){const z=dp[i]+W[r][i*K+j];if(z>next[j]){next[j]=z;bk[j]=i}}dp=next;back.push(bk)}for(let end=0;end<K;end++){const z=dp[end]+W[Q-1][end*K+start]+pairLog[decoded[0][start][0]];if(z>best){best=z;keyIndices=Array(Q);keyIndices[Q-1]=end;for(let r=Q-2;r>=0;r--)keyIndices[r]=back[r][keyIndices[r+1]]}}}
  const key=keyIndices.map((j,r)=>cand[r][j]),decodedAll=transform(cipher,key,true);assert(eq(transform(decodedAll,key,false),cipher),"learn replay");return{key,ranks,fit:metrics(decodedAll.slice(0,fit)),held:metrics(decodedAll.slice(fit)),decodedAll,score:best}
 }
 let p56=[],j=0;for(const [i,c] of corpus.pages[56].indices.entries()){if(i===56){assert(c===0,"F");p56.push(0)}else p56.push((c-(primes[j++]-1)%A+A)%A)}assert(j===84&&text(p56).startsWith("ANENDWITHIN"),"native");
 const known=p56.concat(corpus.pages[57].indices),plant=transform(known,sourceKey,false),recovered=transform(plant,sourceKey,true);assert(eq(known,recovered),"native");
 const original=corpus.pages.slice(16,23).flatMap(p=>p.indices);assert(original.length===1744,"source scope");
 const fixed=transform(original,sourceKey,true);assert(eq(transform(fixed,sourceKey,false),original),"fixed replay");
 let seed=0x29163301;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 const em=native(emerson),sh=native(shakespeare);const controls=[];
 for(const [name,t,offset] of [["Emerson",em,10000],["Shakespeare",sh,20000],["Emerson2",em,40000]]){const truth=t.slice(offset,offset+original.length);assert(truth.length===original.length,"control size");const key=Array.from({length:Q},()=>1+rng()%(M-1));const ct=transform(truth,key,false),got=learn(ct,key);const correct=got.decodedAll.slice(fit).filter((x,i)=>x===truth[fit+i]).length;controls.push({name,offset,trueKey:key,foundKey:got.key,trueRanks:got.ranks,exactKey:key.filter((v,i)=>v===got.key[i]).length,heldCorrect:correct,heldLength:truth.length-fit,truth:metrics(truth.slice(fit)),fit:got.fit,held:got.held})}
 // Freeze the decision: a bounded blind receiver must recover >=95% withheld in every plant.
 const passes=controls.every(x=>x.heldCorrect>=.95*x.heldLength);
 const blind=passes?learn(original):null;
 return {sourceKey,checkedPairs:checked,trainingRunes:train.length,fitRunes:fit,heldRunes:original.length-fit,K,native:{exact:eq(known,recovered),plain:metrics(known),encrypted:metrics(plant)},original:metrics(original),fixed:{fit:metrics(fixed.slice(0,fit)),held:metrics(fixed.slice(fit)),whole:metrics(fixed),indices:fixed},controls,blindGate:passes,blind:blind&&{key:blind.key,fit:blind.fit,held:blind.held,indices:blind.decodedAll}}
}
const args = paths.map((p, i) => i === 0 ? JSON.parse(fs.readFileSync(p, 'utf8')) : fs.readFileSync(p, 'utf8'));
console.log(JSON.stringify(research(...args), null, 2));
