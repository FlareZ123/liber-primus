// Agent7 #3204: predictive-equivalence row-spectrum blind gate, ordinary GP29.
"use strict";
function run(corpus,txt,solved){
 const A=29,R=n=>Array.from({length:n},(_,i)=>i),mod=x=>(x%29+29)%29,sum=a=>a.reduce((x,y)=>x+y,0),assert=(x,m)=>{if(!x)throw Error(m)};
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const gp=(txt.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]).flatMap(w=>{let a=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3;}else if(w.startsWith("IO",i)){a.push(27);i+=2;}else{let t=tokens.find(t=>w.startsWith(t.s,i));assert(t,w);a.push(t.i);i+=t.s.length;}}return a;});
 const ref=gp.slice(0,18000),cnt=R(A).map(()=>R(A).map(()=>1)),un=R(A).map(()=>1);
 for(let i=0;i<ref.length;i++){un[ref[i]]++;if(i)cnt[ref[i-1]][ref[i]]++;}
 const T=cnt.map(r=>r.map(x=>x/sum(r))),L=T.map(r=>r.map(Math.log)),S=T.map(r=>r.slice().sort((a,b)=>b-a)),SL=S.map(r=>r.map(Math.log)),rare=R(A).sort((a,b)=>un[a]-un[b]);
 assert(new Set(S.map(r=>r.join(","))).size===29,"distinct row spectra");
 function rng(seed){return ()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};}
 function makeKey(q,seed){const rnd=rng(seed);return R(q).map(s=>{let r=R(A);for(let j=A-1;j>0;j--){let k=Math.floor(rnd()*(j+1));[r[j],r[k]]=[r[k],r[j]];}let k=r.indexOf(rare[s]);[r[0],r[k]]=[r[k],r[0]];return r;});}
 function tape(p,k,rival=0,seed=1){let s=0,prev=0,q=k.length,rnd=rng(seed);const enc=k.map(r=>{let a=R(A);r.forEach((x,d)=>a[x]=d);return a;});const c=new Uint8Array(p.length);for(let i=0;i<p.length;i++){let d=enc[s][p[i]];if(rival===1)d=Math.floor(rnd()*A);if(rival===2&&d!==0)d=1+Math.floor(rnd()*28);c[i]=mod(prev+d);prev=c[i];if(prev<q)s=prev;}return c;}
 function parse(c,q){let s=0,prev=0;const z=new Uint16Array(c.length);for(let i=0;i<c.length;i++){z[i]=s*A+mod(c[i]-prev);prev=c[i];if(prev<q)s=prev;}return z;}
 function assign(cost){let n=cost.length,u=Array(n+1).fill(0),v=u.slice(),p=u.slice(),way=u.slice();for(let i=1;i<=n;i++){p[0]=i;let j0=0,minv=Array(n+1).fill(Infinity),used=Array(n+1).fill(false);do{used[j0]=true;let i0=p[j0],delta=Infinity,j1=0;for(let j=1;j<=n;j++)if(!used[j]){let cur=cost[i0-1][j-1]-u[i0]-v[j];if(cur<minv[j]){minv[j]=cur;way[j]=j0;}if(minv[j]<delta){delta=minv[j];j1=j;}}for(let j=0;j<=n;j++){if(used[j]){u[p[j]]+=delta;v[j]-=delta;}else minv[j]-=delta;}j0=j1;}while(p[j0]);do{let j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0);}let a=R(n);for(let j=1;j<=n;j++)a[p[j]-1]=j-1;return a;}
 function learn(z,q,fit,refine,seed){const M=q*A,H=R(M).map(()=>new Uint32Array(M)),freq=new Uint32Array(M);for(let i=0;i<fit;i++){freq[z[i]]++;if(i)H[z[i-1]][z[i]]++;}
 const hist=H.map(r=>R(q).map(t=>Array.from(r.slice(t*A,(t+1)*A)).sort((a,b)=>b-a)));let occ=hist.flat().map(sum).sort((a,b)=>a-b);
 const spec=R(q).flatMap(s=>assign(R(A).map(d=>SL.map(l=>-sum(hist[s*A+d].map(r=>sum(r.map((x,j)=>x*l[j]))))))));
 const uni=R(q).flatMap(s=>{let ds=R(A).sort((a,b)=>freq[s*A+b]-freq[s*A+a]),ps=R(A).sort((a,b)=>un[b]-un[a]),k=R(A);ds.forEach((d,i)=>k[d]=ps[i]);return k;});
 const value=k=>sum(H.map((r,i)=>sum(Array.from(r,(n,j)=>n*L[k[i]][k[j]]))));
 function delta(k,a,b){let x=k[a],y=k[b],d=0;for(let j=0;j<M;j++)if(j!==a&&j!==b){let z=k[j];d+=H[a][j]*(L[y][z]-L[x][z])+H[b][j]*(L[x][z]-L[y][z])+H[j][a]*(L[z][y]-L[z][x])+H[j][b]*(L[z][x]-L[z][y]);}return d+H[a][a]*(L[y][y]-L[x][x])+H[b][b]*(L[x][x]-L[y][y])+H[a][b]*(L[y][x]-L[x][y])+H[b][a]*(L[x][y]-L[y][x]);}
 const swap=(k,a,b)=>{[k[a],k[b]]=[k[b],k[a]];};
 let best=spec.slice(),bestV=value(best),rnd=rng(seed);
 if(refine){for(let restart=0;restart<8;restart++){let k=(restart%2?uni:spec).slice();if(restart>=2)for(let j=0;j<q*4;j++){let s=Math.floor(rnd()*q)*A;swap(k,s+Math.floor(rnd()*A),s+Math.floor(rnd()*A));}
 // Temperature schedule and step count fixed before all tests. Only the fit transition counts are used.
 let curr=value(k);for(let step=0;step<18000;step++){let s=Math.floor(rnd()*q)*A,a=s+Math.floor(rnd()*A),b=s+Math.floor(rnd()*A);if(a===b)continue;let d=delta(k,a,b),temp=6*Math.pow(.015,step/18000);if(d>0||rnd()<Math.exp(d/temp)){swap(k,a,b);curr+=d;if(curr>bestV){best=k.slice();bestV=curr;}}}
 // Exact best transposition descent; check incremental score against full objective.
 assert(Math.abs(curr-value(k))<1e-5,"delta mismatch");for(let it=0;it<40;it++){let bestD=1e-9,a0=-1,b0=-1;for(let s=0;s<q;s++)for(let a=0;a<A;a++)for(let b=a+1;b<A;b++){let d=delta(k,s*A+a,s*A+b);if(d>bestD){bestD=d;a0=s*A+a;b0=s*A+b;}}if(a0<0)break;swap(k,a0,b0);}let v=value(k);if(v>bestV){best=k.slice();bestV=v;}}}
 return {spec,uni,best,context:{nonempty:occ.filter(n=>n>0).length,total:occ.length,median:occ[Math.floor(occ.length/2)]},fitObjectives:[value(spec),value(uni),value(best)]};}
 // Reachable augmented states (latch, previous cipher, previous plaintext). Positive source transition law gives full ciphertext support.
 function quotient(k){const q=k.length,abs=new Set(),reach=new Set(),queue=[];const add=(s,c,p)=>{let id=(s*A+c)*A+p;if(!reach.has(id)){reach.add(id);queue.push(id);}};for(let c=0;c<A;c++)add(c<q?c:0,c,k[0][c]);for(let i=0;i<queue.length;i++){let id=queue[i],p=id%A,z=Math.floor(id/A),prev=z%A,s=Math.floor(z/A);abs.add(`${p}|${R(A).map(c=>k[s][mod(c-prev)]).join(",")}`);for(let c=0;c<A;c++)add(c<q?c:s,c,k[s][mod(c-prev)]);}
 // Distinct (previous-P, absolute output row) signatures are distinguishable in at most two symbols because source spectra are unique.
 // If every reachable state's signature is distinct, exact minimization cannot merge any.
 return {reachable:reach.size,distinctTwoStepSignatures:abs.size,uniformSourcePredictiveClasses:1};}
 function score(z,k,p,fit){let train=0,held=0,l=0;for(let i=0;i<p.length;i++){let x=k[z[i]];if(x===p[i]){if(i<fit)train++;else held++;}if(i>=fit&&i)l+=L[k[z[i-1]]][x];}return {fitHit:train,heldHit:held,held:p.length-fit,heldLogP:l/(p.length-fit)};}
 function plant(p,q,seed,fit,rival=0,refine=true){let k=makeKey(q,seed),flat=k.flat(),c=tape(p,k,rival,seed+10991),z=parse(c,q),h=learn(z,q,fit,refine,seed+2);assert(rival||z.every((v,i)=>flat[v]===p[i]),"inverse");const dec=Array.from(z,x=>h.best[x]);assert(tape(dec,R(q).map(s=>h.best.slice(s*A,(s+1)*A))).every((v,i)=>v===c[i]),"replay");let match=a=>sum(a.map((x,i)=>+(x===flat[i])));return {q,seed,n:p.length,fit,rival,repeats:sum(Array.from(c,(x,i)=>+(i>0&&x===c[i-1]))),spec:score(z,h.spec,p,fit),uni:score(z,h.uni,p,fit),refined:score(z,h.best,p,fit),keyMatches:[match(h.spec),match(h.uni),match(h.best)],keySize:q*A,context:h.context,fitObjectives:h.fitObjectives,quotient:quotient(k)};}
 function markov(n,seed){const rnd=rng(seed),p=new Uint8Array(n);p[0]=Math.floor(rnd()*A);for(let i=1;i<n;i++){let v=rnd(),j=0;for(;j<A-1;j++){v-=T[p[i-1]][j];if(v<0)break;}p[i]=j;}return p;}
 const results=[];for(let q of [2,4]){for(let i=0;i<2;i++){let p=gp.slice(18000+i*12956,18000+(i+1)*12956),seed=7123+100*q+i;for(let rival of [0,2])results.push({type:rival?"repeat-matched-rival":"native",...plant(p,q,seed,8000,rival)});}results.push({type:"markov-book-length",...plant(markov(12956,611+q),q,913+q,8000)});results.push({type:"markov-long",...plant(markov(1000000,611+q),q,913+q,800000,0,false)});}
 const native=solved.sections.map(s=>[...s.source_text].map(c=>corpus.runes.indexOf(c)).filter(x=>x>=0));const longest=native.slice().sort((a,b)=>b.length-a.length)[0];results.push({type:"solved-native-longest",...plant(longest,4,1717,Math.floor(longest.length*.65))});
 const C=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),obs=R(A).map(()=>0);for(let i=1;i<C.length;i++)obs[mod(C[i]-C[i-1])]++;
 const desc=obs.slice().sort((a,b)=>b-a);let freq=R(A).map(()=>0),n=C.length-1,min1=Infinity,min2=Infinity;for(let i=0;i<gp.length;i++){freq[gp[i]]++;if(i>=n)freq[gp[i-n]]--;if(i>=n-1){const f=freq.slice().sort((a,b)=>b-a);min1=Math.min(min1,f[0]);min2=Math.min(min2,f[0]+f[1]);}}
 return {N:C.length,source:{train:ref.length,donor:gp.length,uniqueRowSpectra:29,rare:rare.slice(0,4),solvedLengths:native.map(x=>x.length)},originalNoDecode:{repeats:obs[0],arbitraryStateTop1Caps:[1,2,3,4].map(q=>sum(desc.slice(0,q))),arbitraryStateTop2Caps:[1,2,3,4].map(q=>sum(desc.slice(0,q*2))),gibranWindowSize:n,gibranMinTop1:min1,gibranMinTop2:min2},results};
}
module.exports={run};
if(require.main===module){const fs=require("node:fs");const read=p=>fs.readFileSync(p,"utf8");console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/control/gibran_prophet_58585.txt"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"))),null,2));}
