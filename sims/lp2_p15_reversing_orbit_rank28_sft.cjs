'use strict';
// Repeat-triggered reversing Fibonacci-prime rank28 receiver; Agent6.
const fs=require('node:fs'),path=require('node:path');
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
const core=function(data,which="all"){
 const s=JSON.parse(data[0]),A=29,M=28,mod=(v,n)=>(v%n+n)%n,assert=(x,m)=>{if(!x)throw Error(m)};
 const source=s.pages.slice(16,56).flatMap(p=>p.indices),cut=s.pages.slice(16,40).reduce((a,p)=>a+p.indices.length,0);
 assert(source.length===9194&&cut===5878,"source geometry");
 const primes=[];for(let x=2;primes.length<3301;x++){let ok=true;for(const p of primes){if(p*p>x)break;if(x%p===0){ok=false;break}}if(ok)primes.push(x)}
 const F=[];let u=0,v=1;do{F.push(u);[u,v]=[v,(u+v)%3301]}while(u!==0||v!==1);const q=F.length;
 assert(q===1650,"orbit");
 assert([0,1,...F.slice(3,17)].map(x=>Math.abs(3301-primes[x])).join(",")==="3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516","grid");
 const K=[F.map(x=>3301-primes[x]),F.map(x=>Math.abs(3301-primes[x]))].map(a=>[-1,1].map(sign=>Int8Array.from([...a,...a],x=>mod(sign*x,M))));
 const pow=[],log=Array(A).fill(-1);for(let x=1,i=0;i<M;i++,x=x*15%A){pow.push(x);log[x]=i}assert(new Set(pow).size===28,"root");
 const tokens=s.translit.map((x,i)=>({x,i})).sort((a,b)=>b.x.length-a.x.length);
 function native(t){let a=[];for(const w of t.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").matchAll(/[A-Z]+/g)){const z=w[0].replace(/ING/g,"NG").replace(/IO/g,"IA");for(let i=0;i<z.length;){const r=tokens.find(t=>z.startsWith(t.x,i));if(r){a.push(r.i);i+=r.x.length}else i++}}return a}
 const donors=data.slice(1).map(native),train=donors[0];
 const uni=new Float64Array(A).fill(.5),bi=new Float64Array(A*A).fill(.2),tri=new Float64Array(A**3);
 for(let i=0;i<train.length;i++){uni[train[i]]++;if(i)bi[train[i-1]*A+train[i]]++;if(i>1)tri[(train[i-2]*A+train[i-1])*A+train[i]]++}
 const bL=new Float64Array(A*A),tL=new Float64Array(A**3);
 for(let a=0;a<A;a++){let z=0;for(let b=0;b<A;b++)z+=bi[a*A+b];for(let b=0;b<A;b++)bL[a*A+b]=Math.log(bi[a*A+b]/z)}
 for(let a=0;a<A;a++)for(let b=0;b<A;b++){let z=0;for(let c=0;c<A;c++)z+=tri[(a*A+b)*A+c];for(let c=0;c<A;c++)tL[(a*A+b)*A+c]=Math.log((tri[(a*A+b)*A+c]+10*Math.exp(bL[b*A+c]))/(z+10))}
 const freqOrder=Array.from({length:A},(_,i)=>i).sort((a,b)=>uni[b]-uni[a]||a-b);
 function raw(x,read){return Int8Array.from(x,(_,i)=>{if(!i)return -1;const d=mod(x[i]-x[i-1],A);return !d?-1:read===0?d-1:read===1?log[d]:x[i]-Number(x[i]>x[i-1])})}
 function offset(R,dir,hold){let t=0,d=dir;return Int16Array.from(R,(r,i)=>{if(!i)return 0;const before=mod(t,q);if(r<0)d=-d;if(r>=0||!hold)t+=d;return before})}
 function coded(x,k){const R=raw(x,k.read),T=offset(R,k.dir,k.hold),key=K[k.kind][k.sign];return Int8Array.from(R,(r,i)=>r<0?M:(r-key[T[i]+k.phase]+M)%M)}
 function dec(x,k,map){const z=coded(x,k);return [x[0],...Array.from(z.slice(1),r=>map[r])]}
 function enc(p,k,map){const inv=Array(A);map.forEach((r,i)=>inv[r]=i);const x=[p[0]],key=K[k.kind][k.sign];let t=k.phase,d=k.dir;for(let i=1;i<p.length;i++){const z=inv[p[i]],prev=x[i-1];if(z===M){x.push(prev);d=-d;if(!k.hold)t=mod(t+d,q)}else{const r=(z+key[t])%M;x.push(k.read===0?mod(prev+r+1,A):k.read===1?mod(prev+pow[r],A):r+Number(r>=prev));t=mod(t+d,q)}}return x}
 const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 function scan(x){let top=[],max2=0,max2k=null,evals=0;
 for(let read=0;read<3;read++){const R=raw(x,read);for(const hold of [false,true])for(const dir of [-1,1]){const T=offset(R,dir,hold),pos=[],val=[];let repeats=0;for(let i=1;i<cut;i++){if(R[i]<0)repeats++;else{pos.push(T[i]);val.push(R[i])}}
 for(let kind=0;kind<2;kind++)for(let sign=0;sign<2;sign++){const key=K[kind][sign],h=new Uint16Array(A);for(let phase=0;phase<q;phase++){h.fill(0);h[M]=repeats;for(let i=0;i<pos.length;i++){let z=val[i]-key[pos[i]+phase];if(z<0)z+=M;h[z]++}let first=0,second=0,coll=0;for(const f of h){coll+=f*(f-1);if(f>=first){second=first;first=f}else if(f>second)second=f}evals++;const k={read,hold,dir,kind,sign,phase};if(first+second>max2){max2=first+second;max2k=k}if(top.length<12||coll>top[top.length-1].coll){top.push({k,coll});top.sort((a,b)=>b.coll-a.coll);if(top.length>12)top.pop()}}}
 }}
 return {evals,max2,max2k,top}}
 function optimize(z){const h=new Uint32Array(A),B=new Uint32Array(A*A);for(let i=1;i<cut;i++){h[z[i]]++;if(i>1)B[z[i-1]*A+z[i]]++}const order=Array.from({length:A},(_,i)=>i).sort((a,b)=>h[b]-h[a]||a-b),map=Array(A);order.forEach((r,i)=>map[r]=freqOrder[i]);
 function delta(i,j){let d=0,mi=map[i],mj=map[j];for(let k=0;k<A;k++){if(k===i||k===j)continue;const mk=map[k];d+=B[i*A+k]*(bL[mj*A+mk]-bL[mi*A+mk])+B[j*A+k]*(bL[mi*A+mk]-bL[mj*A+mk])+B[k*A+i]*(bL[mk*A+mj]-bL[mk*A+mi])+B[k*A+j]*(bL[mk*A+mi]-bL[mk*A+mj])}d+=B[i*A+i]*(bL[mj*A+mj]-bL[mi*A+mi])+B[j*A+j]*(bL[mi*A+mi]-bL[mj*A+mj])+B[i*A+j]*(bL[mj*A+mi]-bL[mi*A+mj])+B[j*A+i]*(bL[mi*A+mj]-bL[mj*A+mi]);return d}
 for(let iter=0;iter<100;iter++){let best=1e-9,a=-1,b=-1;for(let i=0;i<A;i++)for(let j=i+1;j<A;j++){const d=delta(i,j);if(d>best){best=d;a=i;b=j}}if(a<0)break;[map[a],map[b]]=[map[b],map[a]]}
 const hist=new Map();for(let i=3;i<cut;i++){const key=(z[i-2]*A+z[i-1])*A+z[i];hist.set(key,(hist.get(key)||0)+1)}const edges=[...hist].map(([k,n])=>[Math.floor(k/(A*A)),Math.floor(k/A)%A,k%A,n]);
 function cost(){let v=0;for(const [a,b,c,n] of edges)v+=n*tL[(map[a]*A+map[b])*A+map[c]];return v}
 let best=cost();for(let iter=0;iter<30;iter++){let a=-1,b=-1,v=best;for(let i=0;i<A;i++)for(let j=i+1;j<A;j++){[map[i],map[j]]=[map[j],map[i]];const f=cost();[map[i],map[j]]=[map[j],map[i]];if(f>v+1e-7){v=f;a=i;b=j}}if(a<0)break;[map[a],map[b]]=[map[b],map[a]];best=v}
 return {map,score:best/(cut-3)}}
 function metrics(p,a,b){let score=0,counts=Array(A).fill(0);for(let i=a;i<b;i++){counts[p[i]]++;if(i>=a+2)score+=tL[(p[i-2]*A+p[i-1])*A+p[i]]}counts.sort((x,y)=>y-x);return {top2:counts[0]+counts[1],ioc:counts.reduce((t,x)=>t+x*(x-1),0)/((b-a)*(b-a-1)),score:score/(b-a-2)}}
 function run(x,truth=null){const r=scan(x),seen=new Set();let winner=null;for(const {k,coll} of r.top){const z=coded(x,k),signature=Array.from(z.slice(1,cut)).join(",");if(seen.has(signature))continue;seen.add(signature);const f=optimize(z);if(!winner||f.score>winner.fit){winner={k,map:f.map,fit:f.score,coll}}}const p=dec(x,winner.k,winner.map);assert(eq(enc(p,winner.k,winner.map),x),"original replay");return {evaluated:r.evals,maxFitTopTwo:r.max2,maxFitTopTwoKey:r.max2k,topIoC:r.top[0].coll/((cut-1)*(cut-2)),winner:{...winner,hold:metrics(p,cut,p.length),fitMetrics:metrics(p,1,cut),excerpt:p.slice(cut,cut+100).map(i=>s.translit[i]).join(""),...(truth?{keyExact:eq(winner.map,truth.map)&&Object.keys(truth.k).every(k=>truth.k[k]===winner.k[k]),heldHits:p.slice(cut).filter((v,i)=>v===truth.p[cut+i]).length,fitHits:p.slice(1,cut).filter((v,i)=>v===truth.p[1+i]).length}:{})}}}
 function floor(t,n){let h=Array(A).fill(0),min=Infinity,max=0;for(let i=0;i<t.length;i++){h[t[i]]++;if(i>=n)h[t[i-n]]--;if(i>=n-1){let a=0,b=0;for(const v of h){if(v>=a){b=a;a=v}else if(v>b)b=v}min=Math.min(min,a+b);max++}}return {min,windows:max}}
 function permutation(seed){const p=Array.from({length:A},(_,i)=>i);for(let i=A-1;i>0;i--){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;const j=(seed>>>0)%(i+1);[p[i],p[j]]=[p[j],p[i]]}return p}
 const results={n:source.length,cut,orbit:q,model:"signed/absolute Fibonacci-indexed prime differences, both signs/directions, repeat-triggered direction reversal with hold/consume, three rank transports, all phases, arbitrary common 29-symbol map including repeat marker",nativeFitFloors:donors.map(t=>floor(t,cut-1))};
 const configs=[[1,1400,{read:1,hold:true,dir:-1,kind:1,sign:1,phase:763},0x3301],[2,12400,{read:2,hold:false,dir:1,kind:0,sign:0,phase:1481},0x1542]];
 if(which==="original"||which==="all")results.original=run(source);
 for(const [j,o,k,seed] of configs){if(which!=="all"&&which!==String(j))continue;const p=donors[j].slice(o,o+source.length),map=permutation(seed),x=enc(p,k,map);assert(eq(dec(x,k,map),p),"plant inverse");results["control"+j]={offset:o,truth:k,truthMap:map,...run(x,{p,k,map})}}
 return results
};
if(require.main===module)console.log(JSON.stringify(core(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8')),process.argv[2]||'all'),null,2));
module.exports={core};
