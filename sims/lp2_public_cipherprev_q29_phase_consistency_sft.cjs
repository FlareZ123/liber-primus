"use strict";
const INPUTS=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function run(raw,{directions=[1,-1],clocks=["continuous","page","consume"],iterations=4,control=true}={}){
 const gp=JSON.parse(raw[0]),A=29,q=29,range=n=>Array.from({length:n},(_,i)=>i),sum=a=>a.reduce((x,y)=>x+y,0),assert=(v,m)=>{if(!v)throw Error(m)},tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);let p=[];for(const w0 of t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]){const w=w0.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let j=0;j<w.length;){const v=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));assert(v,w);p.push(v.i);j+=v.t.length;}}return p}
 const donors=raw.slice(1).map(native),pages=gp.pages.slice(0,56).filter(p=>p.indices.length).map(p=>p.indices),N=sum(pages.map(p=>p.length));
 // Hungarian minimum integer cost; dual feasibility and zero primal/dual gap checked.
 function assign(w){const n=w.length,u=new Float64Array(n+1),v=new Float64Array(n+1),p=new Int32Array(n+1),way=new Int32Array(n+1);for(let i=1;i<=n;i++){p[0]=i;let j0=0;const min=new Float64Array(n+1).fill(Infinity),used=new Uint8Array(n+1);do{used[j0]=1;const i0=p[j0];let delta=Infinity,j1=0;for(let j=1;j<=n;j++)if(!used[j]){const cur=w[i0-1][j-1]-u[i0]-v[j];if(cur<min[j]){min[j]=cur;way[j]=j0}if(min[j]<delta){delta=min[j];j1=j}}for(let j=0;j<=n;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta}else min[j]-=delta;j0=j1}while(p[j0]);do{const j1=way[j0];p[j0]=p[j1];j0=j1}while(j0)}
 const value=sum(u.slice(1))+sum(v.slice(1)),primal=sum(range(n).map(j=>w[p[j+1]-1][j]));assert(Number.isSafeInteger(value)&&value===primal,"assignment gap");const slack=w.map((row,i)=>Float64Array.from(row,(x,j)=>{const s=x-u[i+1]-v[j+1];assert(Number.isSafeInteger(s)&&s>=0,"invalid dual");return s}));return {value,slack}}
 function setPair(S,a,b,s){S[a][b]=s;S[b][a]=range(A).map(j=>Float64Array.from({length:A},(_,i)=>s[i][j]))}
 function build(pages,clock){const h=range(q).map(()=>range(A).map(()=>new Int32Array(A))),events=[];let k=0,pos=0;for(const t of pages){if(clock==="page")k=0;for(let j=0;j<t.length;j++,pos++){if(j){const phase=k%q,row=t[j-1],c=t[j];h[phase][row][c]++;events.push({pos,phase,row,c})}if(j||clock!=="consume")k++}}return {h,events}}
 function upper(h,iterations){let base=0;for(const H of h)for(const row of H)for(const n of row)base+=n*(n-1)/2;
 let S=range(q).map(()=>Array(q));for(let a=0;a<q;a++)for(let b=a+1;b<q;b++){const w=range(A).map(()=>new Float64Array(A));for(let r=0;r<A;r++)for(let x=0;x<A;x++)if(h[a][r][x])for(let y=0;y<A;y++)w[x][y]-=h[a][r][x]*h[b][r][y];const res=assign(w);setPair(S,a,b,res.slack);base-=res.value}
 // For any globally aligned phase columns, sum of min-plus two-edge paths
 // over unordered endpoint pairs is <= 2(q-2) times total edge slack.
 // Subtract independent assignment minima (exact dual reparameterization),
 // then apply the same relaxation to the residual nonnegative costs.
 let scale=1,acc=0;const D=2*(q-2),trace=[];
 for(let iter=1;iter<=iterations;iter++){const T=range(q).map(()=>Array(q));let s=0;for(let a=0;a<q;a++)for(let b=a+1;b<q;b++){const w=range(A).map(()=>new Float64Array(A));for(let c=0;c<q;c++)if(c!==a&&c!==b){const ac=S[a][c],bc=S[b][c];for(let i=0;i<A;i++)for(let j=0;j<A;j++){let z=Infinity;for(let k=0;k<A;k++){const v=ac[i][k]+bc[j][k];if(v<z)z=v}w[i][j]+=z}}const res=assign(w);s+=res.value;setPair(T,a,b,res.slack)}
 scale*=D;acc=acc*D+s;assert(Number.isSafeInteger(acc)&&Number.isSafeInteger(scale),"integer overflow");S=T;trace.push({iter,s,scale,acc,upper:base-Math.ceil(acc/scale)})}
 return {base,trace,upper:trace.length?trace.at(-1).upper:base}}
 // Ordered exact donor gate: within a (phase, public predecessor) stratum,
 // an arbitrary bijection preserves equality; F bypass must occur at C=F.
 // Check first repeated C pair as early filter, then complete two-way maps.
 function aligned(events){const seen=new Map(),pairs=[];for(const e of events){const key=(e.phase*A+e.row)*A+e.c;if(seen.has(key))pairs.push([seen.get(key),e.pos]);else seen.set(key,e.pos)}
 const nonzero=events.filter(e=>e.c!==0).map(e=>e.pos);
 function test(p,start,held){if(held){for(const i of nonzero)if(p[start+i]===0)return false}else for(const [a,b] of pairs)if(p[start+a]!==p[start+b])return false;
 const forward=new Int8Array(q*A*A).fill(-1),reverse=forward.slice();for(const e of events){const x=p[start+e.pos];if(held&&x===0)continue;const base=(e.phase*A+e.row)*A,fi=base+x,ri=base+e.c;if((forward[fi]>=0&&forward[fi]!==e.c)||(reverse[ri]>=0&&reverse[ri]!==x))return false;forward[fi]=e.c;reverse[ri]=x}return true}
 return donors.map(p=>{let ordinary=0,held=0;for(let i=0;i+N<=p.length;i++){ordinary+=test(p,i,false);held+=test(p,i,true)}return {windows:p.length-N+1,ordinary,held}})
 }
 const originals=[];for(const dir of directions){const input=dir===1?pages:pages.slice().reverse().map(p=>p.slice().reverse());for(const clock of clocks){const {h,events}=build(input,clock);originals.push({dir,clock,...upper(h,iterations),aligned:aligned(events)})}}
 let plant=null;if(control){let seed=0x29c04123;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}function perm(){let a=range(A);for(let i=A-1;i>0;i--){const j=rng()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}const R=range(A).map(perm),S=range(q).map(perm),P=donors[0].slice(1000,1000+N),rows=range(A).map(()=>new Int32Array(A));let k=0,pos=0,n=0;const c=[];for(const pg of pages){const C=[pg[0]];k++;pos++;for(let j=1;j<pg.length;j++,k++,pos++){const a=C[j-1],x=P[pos],y=S[k%q][R[a][x]];C.push(y);assert(R[a].indexOf(S[k%q].indexOf(y))===x,"native inverse");rows[a][x]++;n++}c.push(C)}const actual=sum(rows.map(row=>sum(Array.from(row,x=>x*(x-1)/2))));const {h}=build(c,"continuous");const b=upper(h,iterations);assert(actual<=b.upper,"plant exceeds certified bound");plant={n,actual,...b}}
 return {schema:"lp2-public-cipherprev-q29-phase-consistency-v1",N,iterations,originals,plant};
}
if(require.main===module){const fs=require("node:fs");console.log(JSON.stringify(run(INPUTS.map(p=>fs.readFileSync(p,"utf8"))),null,2))}
module.exports={run,INPUTS};
