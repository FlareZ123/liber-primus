"use strict";
const fs=require("node:fs"),path=require("node:path");
function experiment(inputs){
 const g=JSON.parse(inputs[0]),N=29,ALL=(1<<29)-1;
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const pop=x=>{x-=((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return (((x+(x>>>4))&0x0f0f0f0f)*0x01010101)>>>24};
 const src=g.pages.slice(0,56).flatMap(p=>p.indices);assert(src.length===12956,"source");
 const alpha=new Map(g.translit.map((s,i)=>[s,i]));
 function native(s){const text=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const out=[];for(const word of text.match(/[A-Z]+/g)||[]){for(let i=0;i<word.length;){let found=false;for(const n of [3,2,1]){const a=word.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?21:undefined):a==="IO"?27:alpha.get(a);if(v!==undefined){out.push(v);i+=n;found=true;break}}if(!found)i++}}return out}
 function orderBefore(a){const nz=[];for(let i=0;i<a.length;i++){const c=a[i];if(c===0)continue;const j=nz.indexOf(c);if(j>=0)nz.splice(j,1);nz.unshift(c);if(nz.length===28)return {burn:i+1,nz}}throw Error("all nonzero not seen")}
 function masksOf(r){const masks=[];function walk(i,k,m){if(k===0){masks.push(m);return}for(let j=i;j<=N-k;j++)walk(j+1,k-1,m|(1<<j))}walk(0,r,0);return masks}
 /** Exact maximum occupancy of each consuming rank, with independent rank maxima and relaxed F exclusion. */
 function gate(a,r){
  const {burn,nz}=orderBefore(a),masks=masksOf(r),mIndex=new Map(masks.map((m,i)=>[m,i]));
  const M=masks.length,states=M*N,width=states*N,NEG=-32768;
  let dp=new Int16Array(width),next=new Int16Array(width);dp.fill(NEG);
  let active=[],nextActive=[],stamp=new Int32Array(states),epoch=1;
  for(let m=0;m<M;m++)for(let z=0;z<N;z++){const center=z===0?0:nz[0];if(masks[m]&(1<<center))continue;const s=m*N+z;dp.fill(0,s*N,s*N+N);active.push(s)}
  let transitions=0,maxActive=active.length,sumActive=0;
  const ranks=new Int8Array(N),prefix=new Int32Array(N);
  function add(s,t,q){const sb=s*N,tb=t*N;if(stamp[t]!==epoch){stamp[t]=epoch;nextActive.push(t);for(let k=0;k<N;k++)next[tb+k]=dp[sb+k]+(k===q?1:0)}else{for(let k=0;k<N;k++){const v=dp[sb+k]+(k===q?1:0);if(v>next[tb+k])next[tb+k]=v}}transitions++}
  for(let i=burn;i<a.length;i++){
   const c=a[i],bit=1<<c;prefix[0]=0;for(let j=0;j<28;j++){ranks[nz[j]]=j;prefix[j+1]=prefix[j]|(1<<nz[j])}
   const j=c===0?-1:ranks[c];nextActive=[];epoch++;sumActive+=active.length;
   for(const s of active){const mi=(s/N)|0,z=s%N,m=masks[mi],center=z===0?0:nz[0],cb=1<<center;
    const newer=c===0?prefix[z]:prefix[j]|(z<=j?1:0);
    let q,nmi=mi;
    if(c===center)q=r;
    else if(m&bit){q=r-1-pop(newer&m);nmi=mIndex.get(m^bit^cb)}
    else q=r+1+pop(newer&(~m)&(~cb)&ALL);
    if(q<0||q>=N||nmi===undefined)throw Error("rank state");
    const nz2=c===0?0:z+(j>=z?1:0);add(s,nmi*N+nz2,q);
    if(c===0)add(s,s,-1);
   }
   const tmp=dp;dp=next;next=tmp;active=nextActive;maxActive=Math.max(maxActive,active.length);
   if(c!==0){nz.splice(j,1);nz.unshift(c)}
  }
  const maxima=Array(N).fill(0);for(const s of active)for(let q=0;q<N;q++)maxima[q]=Math.max(maxima[q],dp[s*N+q]);
  const holds=a.slice(burn).filter(x=>x===0).length;
  return {r,burn,n:a.length-burn,states,maxActive,meanActive:sumActive/(a.length-burn),transitions,maxima,holds,max:Math.max(holds,...maxima)};
 }
 function rng(seed){return n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}}
 function plant(p,r,seed){
  const rnd=rng(seed),a=Array.from({length:N},(_,i)=>i),map=a.slice();for(const b of [a,map])for(let i=N-1;i>0;i--){const j=rnd(i+1);[b[i],b[j]]=[b[j],b[i]]}
  const f=r+5,k=map.indexOf(0);[map[f],map[k]]=[map[k],map[f]];
  const c=[],rr=[],initial=a.slice(),truth=[];let latent=0,holds=0;
  function emit(x){truth.push(x);if(x===0){c.push(0);rr.push(-1);holds++;return}const q=map.indexOf(x),v=a[q];c.push(v);rr.push(q);if(v===0)latent++;a.splice(q,1);a.splice(r,0,v)}
  // Deterministic alphabet-coverage prelude; no native suffix is used to choose it.
  for(let v=0;v<N;v++){if(a.indexOf(v)===f)emit(map[f+1]);emit(map[a.indexOf(v)])}
  const prelude=c.length;for(const x of p)emit(x);
  const burn=orderBefore(c).burn,stat=gate(c,r),actual=Array(N).fill(0);
  for(const q of rr.slice(burn))if(q>=0)actual[q]++;
  assert(actual.every((n,q)=>n<=stat.maxima[q]),"plant bound");
  let A=initial.slice(),nz=[],z=-1,checked=0;const decoded=[];
  for(let i=0;i<c.length;i++){const v=c[i],q=rr[i];if(q<0){assert(v===0,"hold");decoded.push(0);continue}
   if(i>=burn){const side=new Set(A.slice(0,r)),center=A[r],recent=Array.from(nz);recent.splice(z<0?recent.length:z,0,0);
    const newer=recent.slice(0,recent.indexOf(v));const rq=v===center?r:side.has(v)?r-1-newer.filter(x=>side.has(x)).length:r+1+newer.filter(x=>x!==center&&!side.has(x)).length;
    assert(rq===q&&A[q]===v,"recency identity");checked++;
   }
   assert(A[q]===v,"replay");decoded.push(map[q]);A.splice(q,1);A.splice(r,0,v);
   if(v===0)z=0;else{const j=nz.indexOf(v);if(z>=0&&(j<0||j>=z))z++;if(j>=0)nz.splice(j,1);nz.unshift(v)}
  }
  assert(String(decoded)===String(truth),"native inverse");
  return {r,seed,n:p.length,prelude,latent,holds,checked,actual,stat};
 }
 const donors=[native(inputs.slice(1,4).join("\n")),native(inputs[4].slice(inputs[4].indexOf("THE ARGUMENT"),inputs[4].indexOf("*** END OF THIS PROJECT GUTENBERG EBOOK"))),native(inputs[5]),native(inputs[6])];
 function minMax(a,n){assert(a.length>=n,"donor size");const h=Array(N).fill(0);for(let i=0;i<n;i++)h[a[i]]++;let min=Math.max(...h),start=0;for(let i=n;i<a.length;i++){h[a[i-n]]--;h[a[i]]++;const v=Math.max(...h);if(v<min){min=v;start=i-n+1}}return {n:a.length,windows:a.length-n+1,min,start}}
 const tests=[plant(donors[0].slice(1000,2800),1,3301),plant(donors[2].slice(1000,2800),2,1033)];
 const original=[gate(src,1),gate(src,2)];
 const benchmarks=donors.map(a=>minMax(a,original[0].n));
 return {source:src.length,tests,original,benchmarks};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/external/2013-book-of-law-I.txt","resources/external/2013-book-of-law-II.txt","resources/external/2013-book-of-law-III.txt","resources/external/cicada2012-blake-marriage-gutenberg45315.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt"];
console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,"..",f),"utf8"))),null,2));
