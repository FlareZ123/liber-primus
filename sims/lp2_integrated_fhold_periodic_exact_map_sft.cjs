"use strict";
// Exact trigram MAP over each visible-zero mask and a cyclic key.
function experiment(gp,ink,gold,lp1){
 const A=29,mod=x=>(x+29)%29,assert=(x,m)=>{if(!x)throw Error(m)},idx=new Map(gp.runes.map((s,i)=>[s,i])),extract=s=>Array.from(s).filter(x=>idx.has(x)).map(x=>idx.get(x)),sections=gold.sections.map(s=>({name:s.name,p:extract(s.source_text)}));
 const nativeKeys=[[1,[23,10,1,10,9,10,16,26]],[5,[0,10,4,0,1,19,0,18,4,18,9,0,18]]];
 for(const [s,k] of nativeKeys){let t=0;const p=sections[s].p,c=p.map(x=>x===0?0:mod(x+k[t++%k.length]));assert(c.join()===extract(lp1.split("$")[s]).join(),"authentic LP1 control")}
 function model(exclude){const u=new Float64Array(A).fill(.1),b=new Float64Array(A*A).fill(.1),t=new Float64Array(A*A*A).fill(.1);for(const {name,p} of sections)if(name!==exclude){for(let i=0;i<p.length;i++){u[p[i]]++;if(i>0)b[p[i-1]*A+p[i]]++;if(i>1)t[(p[i-2]*A+p[i-1])*A+p[i]]++}}
  function norm(a){for(let i=0;i<a.length;i+=A){let n=0;for(let j=0;j<A;j++)n+=a[i+j];for(let j=0;j<A;j++)a[i+j]=Math.log(a[i+j]/n)}}norm(u);norm(b);norm(t);return {u,b,t}}
 function score(p,M){let s=0;for(let i=0;i<p.length;i++)s+=i===0?M.u[p[i]]:i===1?M.b[p[i-1]*A+p[i]]:M.t[(p[i-2]*A+p[i-1])*A+p[i]];return s}
 function enc(p,k){let phase=0,prev=0;return p.map(x=>{prev=x===0?0:(prev+x+k[phase++%k.length])%A;return prev})}
 function frame(c,q,mask,prev=0,start=0){const domains=Array.from({length:q},()=>Array(A).fill(true)),v=[],d=[];let phase=start,z=0;
  for(const x of c){const delta=mod(x-prev);prev=x;const held=x===0&&((mask>>z)&1);if(x===0)z++;if(held){v.push(-1);d.push(0)}else{v.push(phase);d.push(delta);domains[phase][delta]=false;phase=(phase+1)%q}}
  return {v,d,domains:domains.map(a=>a.flatMap((x,i)=>x?[i]:[])),end:phase}}
 function decode(f,k){const p=f.v.map((j,i)=>j<0?0:mod(f.d[i]-k[j]));return p.some((x,i)=>x===0&&f.v[i]>=0)?null:p}
 // Each trigram spans at most three consecutive consuming key phases.
 // Assign each potential to the latest consuming phase in its own context.
 function factors(f,M){const D=f.domains,q=D.length,V=f.v,N=V.length,groups=Array.from({length:q},()=>[]);let constant=0;
  for(let i=0;i<N;i++){const from=Math.max(0,i-2),a=V.slice(from,i+1),vs=a.filter(x=>x>=0);if(!vs.length){constant+=i===0?M.u[0]:i===1?M.b[0]:M.t[0];continue}
   const j=vs.at(-1);groups[j].push({i,from,a})}
  const F=groups.map((g,j)=>{const a=D[(j+q-2)%q],b=D[(j+q-1)%q],c=D[j],out=new Float64Array(a.length*b.length*c.length);let h=0;
   for(const x of a)for(const y of b)for(const z of c){let val=0;for(const {i,from,a:vv} of g){let id=0;for(let k=0;k<vv.length;k++){const v=vv[k],key=v===j?z:v===(j+q-1)%q?y:x;id=id*A+(v<0?0:mod(f.d[from+k]-key))}val+=i===0?M.u[id]:i===1?M.b[id]:M.t[id]}out[h++]=val}return out});
  return {F,constant}
 }
 // Exact cycle MAP: fix the first two key variables, eliminate the others
 // by max-plus DP over the most recent pair. Then add the wrap factors.
 function optimize(f,M){const D=f.domains,q=D.length,L=D.map(x=>x.length);if(L.includes(0))return null;const {F,constant}=factors(f,M);let best=-Infinity,bestKey=null;
  const prevs=Array.from({length:q},(_,j)=>new Int16Array(L[(j+q-1)%q]*L[j]));let arr=new Float64Array(A*A),next=new Float64Array(A*A);
  for(let a=0;a<L[0];a++)for(let b=0;b<L[1];b++){
   arr.fill(-Infinity);arr[a*L[1]+b]=0;
   for(let j=2;j<q;j++){const la=L[j-2],lb=L[j-1],lc=L[j],g=F[j],pa=prevs[j];next.fill(-Infinity);
    for(let x=0;x<la;x++)for(let y=0;y<lb;y++){const old=arr[x*lb+y];if(old===-Infinity)continue;const off=(x*lb+y)*lc;for(let z=0;z<lc;z++){const v=old+g[off+z],ix=y*lc+z;if(v>next[ix]){next[ix]=v;pa[ix]=x}}}
    [arr,next]=[next,arr]
   }
   for(let y=0;y<L[q-2];y++)for(let z=0;z<L[q-1];z++){const v=arr[y*L[q-1]+z]+F[0][(y*L[q-1]+z)*L[0]+a]+F[1][(z*L[0]+a)*L[1]+b]+constant;if(v>best){best=v;const key=Array(q);key[q-2]=y;key[q-1]=z;for(let j=q-1;j>=2;j--)key[j-2]=prevs[j][key[j-1]*L[j]+key[j]];assert(key[0]===a&&key[1]===b,"DP trace");bestKey=key.map((x,j)=>D[j][x])}}
  }
  const p=decode(f,bestKey);assert(p&&Math.abs(score(p,M)-best)<1e-7,"factor score exact");return {key:bestKey,p,score:best,end:f.end}
 }
 function countZero(c){return c.filter(x=>x===0).length}
 function fit(prefix,hold,q,M){const rows=[];const masks=2**countZero(prefix);assert(masks<=8,"fixed profile");for(let m=0;m<masks;m++){const f=frame(prefix,q,m);const a=optimize(f,M);if(a)rows.push({...a,mask:m,domains:f.domains.map(x=>x.length)})}rows.sort((a,b)=>b.score-a.score||a.mask-b.mask);assert(rows.length>0,"no training path");
  const byKey=new Map();for(const a of rows){const id=a.key.join();if(!byKey.has(id))byKey.set(id,{...a,paths:[]})}
  for(const a of byKey.values())for(let m=0;m<masks;m++){const f=frame(prefix,q,m),p=decode(f,a.key);if(!p)continue;for(let h=0;h<2**countZero(hold);h++){const g=frame(hold,q,h,prefix.at(-1),f.end),s=decode(g,a.key);if(!s)continue;assert(enc(p.concat(s),a.key).join()===prefix.concat(hold).join(),"whole replay");const pre=score(p,M),full=score(p.concat(s),M);a.paths.push({prefixMask:m,holdMask:h,prefixScore:pre,holdScore:full-pre,plainPrefix:p,plainHold:s})}}
  for(const a of byKey.values())a.paths.sort((a,b)=>b.prefixScore-a.prefixScore||b.holdScore-a.holdScore);
  return {q,rows,keys:[...byKey.values()]}
 }
 // Verify cycle optimizer against full exhaustive key enumeration for narrow
 // domains on genuine frames, including transparent F and wrap factors.
 let seed=0x253074;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 const M0=model(null);let toy=0;for(let i=0;i<12;i++){const q=3+i%3,k=Array.from({length:q},()=>rng()%A),p=Array.from({length:18},()=>rng()%A),c=enc(p,k);let mask=0,z=0;for(let j=0;j<c.length;j++)if(!c[j]){if(!p[j])mask|=1<<z;z++}const f=frame(c,q,mask);f.domains=f.domains.map((d,j)=>[k[j],...d.filter(x=>x!==k[j]).slice(0,2)]);const a=optimize(f,M0);let b=-Infinity;function rec(j,v){if(j===q){const p=decode(f,v);if(p)b=Math.max(b,score(p,M0));return}for(const x of f.domains[j])rec(j+1,v.concat(x))}rec(0,[]);assert(Math.abs(a.score-b)<1e-7,"toy exact MAP");toy++}
 const start=ink.pages.find(p=>p.page===54).red_spans[0].length;assert(start===9,"black body");const pre=gp.pages[54].indices.slice(start),hold=gp.pages[55].indices;assert(pre.length===223&&hold.length===76&&countZero(pre)===3&&countZero(hold)===3,"original profile");
 const controls=[];for(const [q,s] of [[8,1],[8,3],[13,4],[13,5]]){const native=sections[s],eligible=[];for(let i=0;i<=native.p.length-299;i++){const p=native.p.slice(i,i+299);if(countZero(p.slice(0,223))<=3&&countZero(p.slice(223))<=3&&countZero(p)>0)eligible.push({i,p})}assert(eligible.length,"native windows");let plant=null;for(let t=0;t<50000;t++){const {i,p}=eligible[rng()%eligible.length],key=Array.from({length:q},()=>rng()%A),c=enc(p,key);if(countZero(c.slice(0,223))===3&&countZero(c.slice(223))===3&&countZero(p)<6){plant={i,p,key,c,attempt:t+1};break}}assert(plant,"matched profile plant");
  const M=model(native.name),f=fit(plant.c.slice(0,223),plant.c.slice(223),q,M),top=f.keys[0],p=top.paths[0],trueKeyRank=f.keys.findIndex(a=>a.key.join()===plant.key.join())+1;controls.push({q,name:native.name,offset:plant.i,attempt:plant.attempt,key:plant.key,actualF:countZero(plant.p),topKey:top.key,trueKeyRank,topPrefixCorrect:top.p.reduce((s,x,i)=>s+(x===plant.p[i]),0),continuationPaths:top.paths.length,topHoldCorrect:p?p.plainHold.reduce((s,x,i)=>s+(x===plant.p[223+i]),0):0,topHoldMean:p?p.holdScore/76:null,trueHoldMean:(score(plant.p,M)-score(plant.p.slice(0,223),M))/76,prefixMean:top.score/223,allKeys:f.keys.length})
 }
 const original=[8,13].map(q=>fit(pre,hold,q,M0));return {start,n:pre.length,holdN:hold.length,toy,authentic:nativeKeys.map(([s,key])=>({section:sections[s].name,n:sections[s].p.length,key})),controls,original};
}
const fs=require("node:fs"),path=require("node:path");
const a=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-ink-annotations.json","resources/external/relikd-solved-gp29-native-v1.json","resources/transcriptions/lp1_wulfic_canonical.txt"].map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(experiment(JSON.parse(a[0]),JSON.parse(a[1]),JSON.parse(a[2]),a[3]),null,2));
