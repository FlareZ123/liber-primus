"use strict";
// Rigorous all-path symbol occupancy upper bounds, on each full-compatible q8 ring.
function run(co,groups,opposite,zsel="all"){
const q=8,A=29,C=Uint8Array.from(co.pages.slice(0,56).flatMap(p=>p.indices)),n=C.length,m=x=>((x%29)+29)%29;
const d=Uint8Array.from(C,(x,i)=>i?m(x-C[i-1]):0);
const R1=Uint8Array.from({length:256},(_,x)=>((x<<1)|(x>>7))&255),R2=Uint8Array.from({length:256},(_,x)=>((x<<2)|(x>>6))&255),B1=Uint8Array.from({length:256},(_,x)=>(x>>1)|((x&1)<<7)),B2=Uint8Array.from({length:256},(_,x)=>(x>>2)|((x&3)<<6));
const rot29=(x,c)=>((x<<c)|(x>>>(29-c)))&0x1fffffff;
const f=new Uint8Array(n),b=new Uint8Array(n),M=new Uint8Array(A),K=new Uint8Array(q),kmask=new Uint32Array(256),pmask=new Uint32Array(n),count=new Uint32Array(A),pair=new Uint32Array(A*A);
function prepare(D){
 M.fill(0);K[0]=0;for(let j=0;j<q;j++){M[D[j]]|=1<<j;if(j<q-1)K[j+1]=m(K[j]+D[j])}if(m(K[q-1]+D[q-1]))throw Error("nonclosed ring");
 f[0]=255;for(let i=1;i<n;i++){let x=d[i],s=f[i-1];f[i]=(x?R1[s]:0)|R2[s&M[x]]}
 if(!f[n-1])throw Error("nonreachable input ring");
 b[n-1]=255;for(let i=n-2;i>=0;i--){let x=d[i+1],s=b[i+1];b[i]=(x?B1[s]:0)|(B2[s]&M[x])}
 kmask[0]=0;for(let z=1;z<256;z++){let j=31-Math.clz32(z&-z);kmask[z]=kmask[z&(z-1)]|(1<<m(-K[(j+7)%8]))}
 count.fill(0);for(let i=0;i<n;i++){let v=f[i]&b[i];if(!v)throw Error("empty connected state");let a=rot29(kmask[v],C[i]);pmask[i]=a;while(a){let x=31-Math.clz32(a&-a);count[x]++;a&=a-1}}
}
function topTwo(a){let u=0,v=0,x=-1,y=-1;for(let j=0;j<a.length;j++){let z=a[j];if(z>u){v=u;y=x;u=z;x=j}else if(z>v){v=z;y=j}}return {count:u+v,pair:[x,y]}}
function unionBound(){pair.fill(0);for(let a of pmask){for(let z=a;z;z&=z-1){let x=31-Math.clz32(z&-z);for(let w=z&(z-1);w;w&=w-1){let y=31-Math.clz32(w&-w);pair[x*A+y]++}}}
 let best=0,bp=null;for(let x=0;x<A;x++)for(let y=x+1;y<A;y++){let v=count[x]+count[y]-pair[x*A+y];if(v>best){best=v;bp=[x,y]}}return {count:best,pair:bp}}
function maxCount(x,y=-1){
 let a=new Int32Array(q),z=new Int32Array(q);
 for(let j=0;j<q;j++){let p=m(C[0]-K[(j+7)%8]);a[j]=(b[0]&(1<<j))?+(p===x||p===y):-1000000000}
 for(let i=1;i<n;i++){let dd=d[i],v=f[i]&b[i];for(let j=0;j<q;j++){if(!(v&(1<<j))){z[j]=-1000000000;continue}let best=dd?a[(j+7)%8]:-1000000000;if(Dphase(j,dd))best=Math.max(best,a[(j+6)%8]);let p=m(C[i]-K[(j+7)%8]);z[j]=best+ +(p===x||p===y)}[a,z]=[z,a]}
 return Math.max(...a)
}
function Dphase(j,dd){return !!(M[dd]&(1<<((j+6)%8)))}
const threshold=Math.ceil(28*n/157);
function bound(D){
 prepare(D);let e=topTwo(count),u=e.count,p=e.pair,stage="sumEnvelope";
 if(u>=threshold){let a=unionBound();u=a.count;p=a.pair;stage="unionEnvelope"}
 if(u>=threshold){
   let singles=new Uint32Array(A);for(let x=0;x<A;x++)singles[x]=count[x]+Math.max(...Array.from(count).filter((_,y)=>y!==x))>=threshold?maxCount(x):count[x];
   let a=topTwo(singles);u=Math.min(u,a.count);p=a.pair;stage="singleMaxPlus";
   if(u>=threshold){let best=threshold-1,bp=null;for(let x=0;x<A;x++)for(let y=x+1;y<A;y++){let ub=Math.min(singles[x]+singles[y],count[x]+count[y]-pair[x*A+y]);if(ub<=best)continue;let v=maxCount(x,y);if(v>best){best=v;bp=[x,y]}}u=best;p=bp;stage="pairMaxPlusThreshold"}
 }
 return {upper:u,rate:u/n,pair:p,stage,initial:e.count};
}
let data=groups.flatMap(o=>o.results.map(r=>({Z:r.Z,z:r.z,keys:r.keys??(r.keysPacked?r.keysPacked.split("\n").map(s=>[...s].map(x=>parseInt(x,29))):[]),expected:r.full})));
let d0=opposite.ranked.filter(x=>x.heldLL!==null);if(d0.length!==1)throw Error("bad opposite file");data.push({Z:136,z:2,keys:[d0[0].D],expected:1});
const results=[];
for(let r of data){if(zsel!=="all"&&r.z!==Number(zsel))continue;if(r.keys.length!==r.expected)throw Error("key list mismatch");
 let max=null,stageCounts={},over=[],initialMax=0;for(let D of r.keys){let h=bound(D);initialMax=Math.max(initialMax,h.initial);stageCounts[h.stage]=(stageCounts[h.stage]||0)+1;if(!max||h.upper>max.upper)max={D,...h};if(h.upper>=threshold)over.push({D,...h})}
 results.push({Z:r.Z,z:r.z,count:r.keys.length,initialMax,max,stageCounts,over});
}
return {n,threshold,reference:"28/157",selector:zsel,results,allCount:results.reduce((s,r)=>s+r.count,0),anyOver:results.reduce((s,r)=>s+r.over.length,0),global:results.map(x=>x.max).filter(Boolean).sort((a,b)=>b.upper-a.upper)[0]??null}
}
if(typeof module!=="undefined"){module.exports=run;if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,".."),json=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));let groups=[1,2,3,4,5,6,8].map(z=>json("im-results/lp2-redraw-all-zero-patterns-original-z"+z+".json"));console.log(JSON.stringify(run(json("resources/liber-primus/lp2-corpus.json"),groups,json("im-results/lp2-redraw-opposite-zero-exact-original.json"),process.argv[2]||"all"),null,2))}}
