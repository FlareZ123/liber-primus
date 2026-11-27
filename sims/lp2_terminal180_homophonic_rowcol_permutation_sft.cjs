'use strict';
const fs = require('node:fs');
const path = require('node:path');
function perms(a){return a.length?a.flatMap((x,i)=>perms(a.filter((_,j)=>j!==i)).map(p=>[x,...p])):[[]];}

function pop(x){let n=0;while(x){x&=x-1;n++}return n;}

function solve(S,T,p,cap=5000){
 const N=30, ALL=(1<<N)-1, at=v=>31-Math.clz32(v&-v);
 const positions=new Map(); for(let r=0;r<N;r++)for(let j=0;j<6;j++){let a=positions.get(S[r][j]);if(!a)positions.set(S[r][j],a=[]);a.push([r,j]);}
 const edges=Array.from({length:N},()=>new Map()),init=Array(N).fill(ALL);
 const masks=Array.from({length:6},(_,j)=>{let m=Array(29).fill(0);for(let r=0;r<N;r++)m[T[r][p[j]]]|=1<<r;return m;});
 for(const a of positions.values())for(let i=0;i<a.length;i++)for(let k=i+1;k<a.length;k++){const [r,j]=a[i],[s,l]=a[k];if(r===s){let mask=0;for(let t=0;t<N;t++)if(T[t][p[j]]===T[t][p[l]])mask|=1<<t;init[r]&=mask;continue;}for(const [x,y,u,v] of [[r,s,j,l],[s,r,l,j]]){let m=edges[x].get(y);if(!m)edges[x].set(y,m=Array.from({length:N},(_,t)=>ALL^(1<<t)));for(let t=0;t<N;t++)m[t]&=masks[v][T[t][p[u]]];}}
 let nodes=0,capped=false;
 function prop(d){let change=true;while(change){change=false;let used=0;for(let i=0;i<N;i++){if(!d[i])return false;if((d[i]&(d[i]-1))===0){if(used&d[i])return false;used|=d[i];}}for(let i=0;i<N;i++)if(d[i]&(d[i]-1)){let n=d[i]&~used;if(!n)return false;if(n!==d[i]){d[i]=n;change=true;}}for(let i=0;i<N;i++)for(const [k,m] of edges[i]){let keep=0;for(let x=d[i];x;x&=x-1){let t=at(x);if(m[t]&d[k])keep|=1<<t;}if(!keep)return false;if(keep!==d[i]){d[i]=keep;change=true;}}}return true;}
 function dfs(d){if(++nodes>cap){capped=true;return null;}if(!prop(d))return null;let best=-1,bn=31,deg=-1;for(let i=0;i<N;i++){let n=pop(d[i]);if(n>1&&(n<bn||(n===bn&&edges[i].size>deg))){best=i;bn=n;deg=edges[i].size;}}if(best<0)return d.map(at);for(let x=d[best];x;x&=x-1){let e=d.slice();e[best]=x&-x;let a=dfs(e);if(a)return a;if(capped)return null;}return null;}
 const row=dfs(init);if(row){const map={};for(let r=0;r<N;r++)for(let j=0;j<6;j++){let t=S[r][j],y=T[row[r]][p[j]];if(t in map&&map[t]!==y)throw Error("bad witness");map[t]=y;}if(new Set(row).size!==N)throw Error("nonpermutation");return {status:"SAT",row,map,nodes};}return {status:capped?"CAP":"UNSAT",nodes};
}

function run(inner,T){let stats={SAT:0,UNSAT:0,CAP:0,nodes:0,max:0};const witnesses=[];for(const p of perms([0,1,2,3,4,5])){let a=solve(inner,T,p);stats[a.status]++;stats.nodes+=a.nodes;stats.max=Math.max(stats.max,a.nodes);if(a.status==="SAT")witnesses.push({p,...a});}return {stats,witnesses};}

function capacityPrefilter(S,T,p){
 const f=new Map();for(const row of S)for(let j=0;j<6;j++){const x=row[j];if(!f.has(x))f.set(x,Array(6).fill(0));f.get(x)[j]++;}
 const tc=Array.from({length:6},(_,j)=>{const a=Array(29).fill(0);for(const row of T)a[row[p[j]]]++;return a;});
 const allowed=new Map();for(const [x,cs] of f){let mask=0;for(let y=0;y<29;y++)if(cs.every((n,j)=>n<=tc[j][y]))mask|=1<<y;allowed.set(x,mask);}
 return S.map(row=>{let m=0;for(let t=0;t<30;t++)if(row.every((x,j)=>allowed.get(x)&(1<<T[t][p[j]])))m|=1<<t;return m;});
}

function maximumMatching(ds){
 const M=Array(30).fill(-1);const at=v=>31-Math.clz32(v&-v);
 function aug(i,seen){for(let x=ds[i]&~seen[0];x;x&=x-1){const b=x&-x;if(seen[0]&b)continue;seen[0]|=b;const j=at(b);if(M[j]<0||aug(M[j],seen)){M[j]=i;return true;}}return false;}
 let count=0;for(let i=0;i<30;i++)if(aug(i,[0]))count++;
 let left=0,right=0;const matched=new Set(M.filter(x=>x>=0));for(let i=0;i<30;i++)if(!matched.has(i))left|=1<<i;
 let old=-1;while(old!==left){old=left;for(let i=0;i<30;i++)if(left&(1<<i))right|=ds[i];for(let j=0;j<30;j++)if((right&(1<<j))&&M[j]>=0)left|=1<<M[j];}
 const unpack=m=>Array.from({length:30},(_,i)=>i).filter(i=>m&(1<<i));
 const L=unpack(left),R=unpack(right);if(count<30&&(L.length-R.length!==30-count))throw Error("Hall witness failed");
 return {count,L,R};
}

function capacityScan(inner,T){const histogram={};let max=-1,best=null;for(const p of perms([0,1,2,3,4,5])){const a=maximumMatching(capacityPrefilter(inner,T,p));histogram[a.count]=(histogram[a.count]??0)+1;if(a.count>max){max=a.count;best={p,...a};}}return {histogram,max,best};}

function experiment(grid,pages,translit){
 const primes=[];for(let n=2;primes.length<85;n++)if(primes.every(p=>n%p))primes.push(n);
 let j=0;const p56=pages[56].indices.map((x,i)=>i===56?x:(x-primes[j++]+1+29000)%29);
 const P=[...p56,...pages[57].indices],C=[...pages[56].indices,...pages[57].indices];
 const known=p56.map(x=>translit[x]).join("");if(j!==84||known!=="ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE"||P.length!==180)throw Error("control");
 const inner=Array.from({length:30},(_,r)=>grid.slice((r+1)*8+1,(r+1)*8+7));
 const perimeter=grid.filter((_,i)=>i<8||i>=248||i%8===0||i%8===7);
 const seen=new Set(inner.flat());const knownPerimeter=perimeter.filter(x=>seen.has(x)).length;
 let seed=0x6732d9a1;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
 const shuf=n=>{let a=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){let j=rng()%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
 const capacityControls=[];const controls=[];for(let i=0;i<3;i++){let F=Array.from({length:256},()=>rng()%29),pr=shuf(30),pc=shuf(6);let T=Array.from({length:30},()=>Array(6));for(let r=0;r<30;r++)for(let k=0;k<6;k++)T[pr[r]][pc[k]]=F[inner[r][k]];const matching=maximumMatching(capacityPrefilter(inner,T,pc));if(matching.count!==30)throw Error('planted Hall false reject');capacityControls.push(matching.count);let a=run(inner,T);let w=a.witnesses.find(v=>v.p.every((x,i)=>x===pc[i])&&v.row.every((x,i)=>x===pr[i]));if(!w)throw Error("hidden plant not recovered");let hits=perimeter.filter(x=>seen.has(x)&&w.map[x]===F[x]).length;if(hits!==knownPerimeter)throw Error("perimeter plant");controls.push({stats:a.stats,exactRow:true,exactColumn:true,perimeterHits:hits,perimeterAvailable:knownPerimeter});}
 const original=[];const capacity=[];for(const [name,y] of [["plain",P],["printed",C],["pad",C.map((x,i)=>(x-P[i]+29)%29)]])for(const layout of ["row","column"]){const T=Array.from({length:30},(_,r)=>Array.from({length:6},(_,k)=>y[layout==="row"?r*6+k:k*30+r]));const gate=capacityScan(inner,T);capacity.push({name,layout,...gate});if(gate.max<30){original.push({name,layout,SAT:0,UNSAT:720,CAP:0,nodes:0,max:0,witnesses:[],method:'Hall'});}else{let a=run(inner,T);original.push({name,layout,...a.stats,witnesses:a.witnesses,method:'equality'});}}
 return {p56:known,primesConsumed:j,innerDistinct:seen.size,perimeterLength:perimeter.length,knownPerimeter,unseenPerimeter:76-knownPerimeter,controls,original,capacity,capacityControls};
}
const root=path.resolve(__dirname,'..');
const grid=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-grid-256.json'),'utf8'));
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
console.log(JSON.stringify(experiment(grid.bytes,corpus.pages,corpus.translit),null,2));
