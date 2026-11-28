'use strict';
const fs=require('node:fs'),path=require('node:path');
function study(raw) {
 const [corpus,...sources]=raw,c=JSON.parse(corpus),Q=29,id=Array.from({length:Q},(_,i)=>i),mod=x=>(x%Q+Q)%Q;
 const starts=[0,3,8,15,23,27,33,40,54,56],lens=[13,16,12,20,16,19,10,8,9];
 const scopes=lens.map((n,i)=>{const t=c.pages.slice(starts[i],starts[i+1]).flatMap(p=>p.indices);return {k:t.slice(0,n),C:t.slice(n)}});
 const assert=(b,msg)=>{if(!b)throw Error(msg)};
 assert(scopes.map(x=>x.C.length).join()==="716,1129,1717,1883,1005,1414,1670,3000,299","source shape");
 const tokens=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function word(w){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const out=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3}else if(w.startsWith("IO",i)){out.push(27);i+=2}else{const t=tokens.find(x=>w.startsWith(x.s,i));if(!t)return [];out.push(t.i);i+=t.s.length}}return out}
 const donors=sources.map(s=>(s.toUpperCase().match(/[A-Z]+/g)||[]).flatMap(word));
 function assignment(cost){const u=new Float64Array(Q+1),v=new Float64Array(Q+1),p=new Int32Array(Q+1),way=new Int32Array(Q+1);for(let i=1;i<=Q;i++){p[0]=i;let j0=0;const min=new Float64Array(Q+1).fill(Infinity),used=new Uint8Array(Q+1);do{used[j0]=1;const i0=p[j0];let delta=Infinity,j1=0;for(let j=1;j<=Q;j++)if(!used[j]){const z=cost[(i0-1)*Q+j-1]-u[i0]-v[j];if(z<min[j]){min[j]=z;way[j]=j0}if(min[j]<delta){delta=min[j];j1=j}}for(let j=0;j<=Q;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta}else min[j]-=delta;j0=j1}while(p[j0]!==0);do{const j1=way[j0];p[j0]=p[j1];j0=j1}while(j0!==0)}const out=new Int8Array(Q);for(let j=1;j<=Q;j++)out[p[j]-1]=j-1;return out}
 function top2counts(a){let x=0,y=0;for(const n of a){if(n>x){y=x;x=n}else if(n>y)y=n}return x+y}
 function top2(P){const a=new Int32Array(Q);for(const p of P)a[p]++;return top2counts(a)}
 function windowMin(P,n){assert(P.length>=n,"donor length");const a=new Int32Array(Q);for(let i=0;i<n;i++)a[P[i]]++;let best=top2counts(a);for(let i=n;i<P.length;i++){a[P[i-n]]--;a[P[i]]++;best=Math.min(best,top2counts(a))}return {min:best,windows:P.length-n+1}}
 function cap(rows){const H=new Int32Array(Q*Q);let N=0;for(const {C,k} of rows){for(let i=0;i<C.length;i++)H[C[i]*Q+k[i%k.length]]++;N+=C.length}let top1=0,best={n:0};for(let d=0;d<=14;d++){const cost=Float64Array.from(id.flatMap(c=>id.map(v=>-H[c*Q+v]-(d?H[c*Q+mod(v-d)]:0))));const B=assignment(cost);const n=-B.reduce((z,v,c)=>z+cost[c*Q+v],0);if(!d)top1=n;else if(n>best.n)best={n,d,B:Array.from(B)}}const recovered=rows.flatMap(({C,k})=>C.map((v,i)=>mod(best.B[v]-k[i%k.length])));assert(top2(recovered)===best.n,"attainment");return {N,top1,top2:best.n,d:best.d,B:best.B}}
 const rows=[scopes,scopes.slice(0,7),scopes.slice(7),...scopes.map(x=>[x])];
 const ordinary=rows.map(x=>{const a=cap(x);return {...a,donorMinimums:donors.map(P=>windowMin(P,a.N))}});
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
 function perm(rand,fix0=false){const a=id.slice(),lo=fix0?1:0;for(let i=Q-1;i>lo;i--){const j=lo+Math.floor(rand()*(i-lo+1));[a[i],a[j]]=[a[j],a[i]]}return a}
 function inv(a){const b=new Int8Array(Q);for(let i=0;i<Q;i++)b[a[i]]=i;return b}
 function enc(P,k,A,B,hold=false){const I=inv(B);let j=0;return P.map(p=>{if(hold&&p===0)return 0;const q=I[mod(A[p]+k[j])];j=(j+1)%k.length;return q})}
 const plants=[];for(let t=0;t<2;t++){const rand=rng(0x281010+t),A=perm(rand),B=perm(rand);let pos=512+t*1024;const rows=scopes.map(x=>{const P=donors[t+1].slice(pos,pos+x.C.length);pos+=P.length;return {k:x.k,C:enc(P,x.k,A,B),P}});const P=rows.flatMap(x=>x.P),a=cap(rows);assert(a.top2>=top2(P),"cap plant");plants.push({N:P.length,actualTop2:top2(P),maximum:a.top2})}
 // Per-edge exact necessary projection for a literal F hold.
 const all=(1<<Q)-1;
 function matching(D){const a=Array(Q).fill(-1);function visit(c,seen){for(let v=0;v<Q;v++)if((D[c]>>v&1)&&!seen[v]){seen[v]=true;if(a[v]<0||visit(a[v],seen)){a[v]=c;return true}}return false}for(let c=0;c<Q;c++)if(!visit(c,Array(Q).fill(false)))return null;const b=Array(Q);a.forEach((c,v)=>b[c]=v);return b}
 function unary({k,C},c,v){let state=1,mask=(1<<k.length)-1,forbid=0;for(let j=0;j<k.length;j++)if(k[j]===v)forbid|=1<<j;for(const x of C){let a=state;if(x===c)a&=~forbid;const b=((a<<1)|(a>>(k.length-1)))&mask;state=b|(x===0?state:0);if(!state)return false}return true}
 function support(rows){const D=Array(Q).fill(all);for(const {k,C} of rows)for(let i=0;i<C.length&&C[i]!==0;i++)D[C[i]]&=~(1<<k[i%k.length]);const count=()=>D.reduce((s,x)=>s+id.filter(v=>x>>v&1).length,0),prefixEdges=count(),prefixMatching=matching(D)!==null;
   for(let c=0;c<Q;c++)for(let v=0;v<Q;v++)if((D[c]>>v&1)&&!rows.every(x=>unary(x,c,v)))D[c]&=~(1<<v);
   return {prefixEdges,prefixMatching,unaryEdges:count(),unaryMatching:matching(D)!==null,domains:D}}
 const fhold=support(scopes),holdPlants=[];
 for(let t=0;t<2;t++){const rand=rng(0x281110+t),A=perm(rand,true),B=perm(rand);let pos=512+t*1024;const rows=scopes.map(x=>{const P=donors[t+1].slice(pos,pos+x.C.length);pos+=P.length;return {k:x.k,C:enc(P,x.k,A,B,true)}});const z=support(rows);assert(B.every((v,c)=>z.domains[c]>>v&1),"true edge removed");holdPlants.push({prefixEdges:z.prefixEdges,unaryEdges:z.unaryEdges})}
 return {ordinary,plants,fhold,holdPlants,donorLengths:donors.map(x=>x.length)};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt"];
if(require.main===module)console.log(JSON.stringify(study(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
module.exports={study,paths};
