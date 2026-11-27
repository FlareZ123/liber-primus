"use strict";
const fs = require("node:fs");
/**
 * Global rank-sort receiver, with arbitrary ties and shared GP29 substitution.
 * @param {{pages:{indices:number[]}[],translit:string[]}} corpus
 * @param {{alphabet:string,pages:{tokens:string[]}[]}} grid
 */
function analyze(corpus,grid) {
 const range=n=>Array.from({length:n},(_,i)=>i);
 const assert=(x,m)=>{if(!x)throw new Error(m)};
 const ring=[...range(8),...range(31).map(i=>(i+1)*8+7),...range(7).map(i=>31*8+6-i),...range(30).map(i=>(30-i)*8)];
 const inner=range(30).flatMap(r=>range(6).map(c=>(r+1)*8+c+1));
 const frame=[...ring,...inner],inv=Array(256);
 frame.forEach((v,i)=>inv[v]=i);
 const put=t=>{const a=Array(256);frame.forEach((v,i)=>a[v]=t[i]);return a;};
 const tape=corpus.pages.slice(55,58).flatMap(p=>p.indices);
 assert(tape.length===256&&ring.length===76&&new Set(frame).size===256,"source geometry");
 const mod=x=>(x%29+29)%29,pr=[];
 for(let n=2;pr.length<85;n++)if(!pr.some(p=>p*p<=n&&n%p===0))pr.push(n);
 let j=0;const p56=corpus.pages[56].indices.map((v,i)=>i===56?v:mod(v-pr[j++]+1));
 let k=0;assert(j===84&&p56.every((v,i)=>(v===0?0:mod(v+pr[k++]-1))===corpus.pages[56].indices[i])&&k===84,"p56 control");
 const raw=put(tape),native=put([...tape.slice(0,76),...p56,...tape.slice(161)]);
 const tokens=grid.pages.flatMap(p=>p.tokens);
 assert(tokens.length===256,"grid");
 const values=b=>{const a=b===59?grid.alphabet.replace("f",""):grid.alphabet;return tokens.map(t=>a.indexOf(t[0])*b+a.indexOf(t[1]));};
 const A=values(59),B=values(60),S=tokens;
 assert(A.every(x=>x>=0&&x<256)&&B.every(x=>x>=0&&x<256),"byte range");
 let comparisons=0;
 for(let i=0;i<256;i++)for(let j=i+1;j<256;j++){
  assert(Math.sign(A[i]-A[j])===Math.sign(B[i]-B[j])&&Math.sign(A[i]-A[j])===(S[i]===S[j]?0:S[i]<S[j]?-1:1),"comparator mismatch");comparisons++;
 }
 const refl=i=>Math.floor(i/8)*8+7-(i%8);
 /**
  * Every equal token class is a complete bipartite routing block between
  * physical addresses and their contiguous global rank positions.
  */
 function blocks(reverse,reflect,scatter){
  const vals=range(256).map(i=>B[reflect?refl(i):i]);
  const sorted=range(256).sort((i,j)=>(reverse?-1:1)*(vals[i]-vals[j])||i-j);
  const bs=[];for(let l=0;l<256;){let h=l+1;while(h<256&&vals[sorted[h]]===vals[sorted[l]])h++;
   const a=sorted.slice(l,h),b=range(h-l).map(i=>i+l);
   bs.push({value:vals[a[0]],src:scatter?b:a,dst:scatter?a:b});l=h;
  }return bs;
 }
 /**
  * Exact equality-count conditions for arbitrary shared alphabet:
  * target label y in block b needs n_b(y) copies of source label x.
  * This iff condition yields a bipartite graph between all 29 labels.
  * @param {{src:number[],dst:number[],value:number}[]} bs
  * @param {number[]} input
  * @param {number[]} target
  * @param {boolean[]} known
  */
 function solve(bs,input,target,known){
  const domains=range(29).map(()=>range(29)),details=[];
  for(const b of bs){
   const count=Array(29).fill(0),need=Array(29).fill(0);
   for(const i of b.src)count[input[i]]++;
   for(const i of b.dst)if(known[i])need[target[i]]++;
   for(let y=0;y<29;y++)if(need[y])domains[y]=domains[y].filter(x=>count[x]>=need[y]);
   details.push({value:b.value,src:b.src,dst:b.dst,count,need});
  }
  // Maximum matching. map[y] is the source symbol mapped to target y.
  const owner=Array(29).fill(-1),map=Array(29).fill(-1);
  function augment(y,seen){
   for(const x of domains[y])if(!seen[x]){
    seen[x]=true;if(owner[x]===-1||augment(owner[x],seen)){owner[x]=y;map[y]=x;return true;}
   }return false;
  }
  let matched=0;for(const y of range(29).sort((a,b)=>domains[a].length-domains[b].length))if(augment(y,Array(29).fill(false)))matched++;
  const empty=range(29).filter(y=>domains[y].length===0);
  let witness=null;
  if(matched<29){
   // Alternating reachability from unmatched target vertices gives a Hall deficiency.
   const ys=new Set(range(29).filter(y=>map[y]<0)),xs=new Set();
   for(const y of ys)for(const x of domains[y])if(!xs.has(x)){xs.add(x);if(owner[x]>=0)ys.add(owner[x]);}
   assert(xs.size<ys.size,"Hall witness");
   witness={targets:[...ys].sort((a,b)=>a-b),sources:[...xs].sort((a,b)=>a-b),deficiency:ys.size-xs.size};
  }
  let recovered=null;
  if(matched===29){
   const perm=Array(256).fill(-1),out=Array(256).fill(-1);
   for(const b of bs){
    const available=b.src.slice();
    for(const i of b.dst.filter(i=>known[i])){
     const k=available.findIndex(v=>input[v]===map[target[i]]);
     assert(k>=0,"matching sufficiency");perm[i]=available.splice(k,1)[0];
    }
    for(const i of b.dst.filter(i=>!known[i]))perm[i]=available.shift();
   }
   assert(new Set(perm).size===256,"routing bijection");
   const forward=Array(29);map.forEach((x,y)=>forward[x]=y);
   const back=Array(256);
   for(let i=0;i<256;i++){out[i]=forward[input[perm[i]]];back[perm[i]]=map[out[i]];}
   assert(known.every((v,i)=>!v||out[i]===target[i])&&back.every((v,i)=>v===input[i]),"exact replay");
   recovered={map,perm,unknown:ring.map(i=>out[i])};
  }
  return {matched,empty,witness,domainSizes:domains.map(d=>d.length),recovered,
   firstEmptyWitness:empty.length?{target:empty[0],constraints:details.filter(d=>d.need[empty[0]]).map(d=>({value:d.value,need:d.need[empty[0]],eligible:range(29).filter(x=>d.count[x]>=d.need[empty[0]])}))}:null};
 }
 /**
  * Exact maximum number of matched known destination glyphs over all alphabets
  * and all equal-token permutations, by a maximum-weight perfect matching.
  * @param {{src:number[],dst:number[],value:number}[]} bs
  * @param {number[]} input @param {number[]} target @param {boolean[]} known
  */
 function maxAgreement(bs,input,target,known){
  const W=range(29).map(()=>Array(29).fill(0));
  for(const b of bs){
   const a=Array(29).fill(0),z=Array(29).fill(0);
   b.src.forEach(i=>a[input[i]]++);
   b.dst.forEach(i=>{if(known[i])z[target[i]]++;});
   for(let x=0;x<29;x++)for(let y=0;y<29;y++)W[y][x]+=Math.min(a[x],z[y]);
  }
  // Hungarian shortest augmenting path, costs -W. Index zero is sentinel.
  const n=29,u=Array(n+1).fill(0),v=u.slice(),p=u.slice(),way=u.slice();
  for(let i=1;i<=n;i++){
   p[0]=i;let j0=0;const minv=Array(n+1).fill(Infinity),used=Array(n+1).fill(false);
   do{
    used[j0]=true;const i0=p[j0];let delta=Infinity,j1=0;
    for(let j=1;j<=n;j++)if(!used[j]){
     const cur=-W[i0-1][j-1]-u[i0]-v[j];
     if(cur<minv[j]){minv[j]=cur;way[j]=j0;}
     if(minv[j]<delta){delta=minv[j];j1=j;}
    }
    for(let j=0;j<=n;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta;}else minv[j]-=delta;
    j0=j1;
   }while(p[j0]!==0);
   do{const j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0!==0);
  }
  const map=Array(n);for(let j=1;j<=n;j++)map[p[j]-1]=j-1;
  const score=map.reduce((s,x,y)=>s+W[y][x],0),forward=Array(n);map.forEach((x,y)=>forward[x]=y);
  // A matching permutation is constructible independently in every tie class.
  const perm=Array(256),decoded=Array(256);
  for(const b of bs){
   const remain=b.src.slice(),pending=b.dst.slice();
   for(const i of b.dst.filter(i=>known[i])){
    const k=remain.findIndex(v=>input[v]===map[target[i]]);
    if(k>=0){perm[i]=remain.splice(k,1)[0];pending.splice(pending.indexOf(i),1);}
   }
   pending.forEach((i,k)=>perm[i]=remain[k]);
  }
  const back=Array(256);for(let i=0;i<256;i++){decoded[i]=forward[input[perm[i]]];back[perm[i]]=map[decoded[i]];}
  assert(new Set(perm).size===256&&back.every((v,i)=>v===input[i]),"weighted inverse");
  assert(decoded.filter((v,i)=>known[i]&&v===target[i]).length===score,"attainability");
  // Verify dual optimality independently of construction.
  for(let y=0;y<n;y++)for(let x=0;x<n;x++)assert(u[y+1]+v[x+1]<=-W[y][x],"dual infeasible");
  assert(u.slice(1).reduce((a,b)=>a+b,0)+v.slice(1).reduce((a,b)=>a+b,0)===-score,"dual gap");
  return {score,map};
 }
 /**
  * Relax unknown source p55 cells to independent unrestricted values.
  * Each target-label constraint is necessary, even with unshared use of wildcards.
  */
 function knownOnly(bs,input,target,known){
  const domains=range(29).map(()=>range(29));
  const certs=range(29).map(()=>[]);
  for(const b of bs){
   const a=Array(29).fill(0),z=Array(29).fill(0);let free=0;
   b.src.forEach(i=>{if(known[i])a[input[i]]++;else free++;});
   b.dst.forEach(i=>{if(known[i])z[target[i]]++;});
   for(let y=0;y<29;y++)if(z[y]>free){
    const possible=range(29).filter(x=>a[x]+free>=z[y]);
    domains[y]=domains[y].filter(x=>possible.includes(x));
    certs[y].push({value:b.value,src:b.src,dst:b.dst,free,need:z[y],possible});
   }
  }
  const empty=range(29).filter(y=>domains[y].length===0);
  let minimal=null;
  if(empty.length){
   const y=empty[0],cs=certs[y].slice();
   const impossible=a=>range(29).every(x=>a.some(c=>!c.possible.includes(x)));
   for(let i=0;i<cs.length;){const trial=cs.filter((_,j)=>i!==j);if(impossible(trial))cs.splice(i,1);else i++;}
   assert(impossible(cs),"wildcard certificate");
   minimal={target:y,blocks:cs};
  }
  return {empty,domainSizes:domains.map(x=>x.length),minimal};
 }
 const known=range(256).map(i=>inv[i]>=76),out=[],controls=[];
 let state=0x54afc9c1;const rng=n=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)%n;};
 function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=rng(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
 for(const reverse of [false,true])for(const reflect of [false,true])for(const scatter of [false,true]){
  const bs=blocks(reverse,reflect,scatter);
  // Blindly plant arbitrary ties and shared alphabet on source-shaped blocks.
  // Only the known interior is given to solve; withheld p55 is not a fit target.
  const pi=shuffle(range(29)),plant=Array(256);
  for(const b of bs){const s=shuffle(b.src);b.dst.forEach((v,i)=>plant[v]=pi[raw[s[i]]]);}
  const check=solve(bs,raw,plant,known),weight=maxAgreement(bs,raw,plant,known),wild=knownOnly(bs,raw,plant,known);
  assert(check.matched===29&&weight.score===180&&!wild.empty.length,"plant failed");
  controls.push({reverse,reflect,scatter,match:check.matched,known:known.filter(Boolean).length,heldMatches:ring.filter(i=>check.recovered.unknown[ring.indexOf(i)]===plant[i]).length});
  for(const [name,input,target] of [["raw/raw",raw,raw],["native/native",native,native],["raw/native",raw,native]]){
   const result=solve(bs,input,target,known);
   out.push({reverse,reflect,scatter,name,...result,maxAgreement:maxAgreement(bs,input,target,known),knownOnly:knownOnly(bs,input,target,known)});
  }
 }
 const hist={};for(const b of blocks(false,false,false))hist[b.src.length]=(hist[b.src.length]||0)+1;
 return {comparisons,classes:blocks(false,false,false).length,tieHistogram:hist,controls,original:out};
}
if(typeof require!=="undefined"&&require.main===module){
 const c=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
 const g=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-grid-256.json","utf8"));
 console.log(JSON.stringify(analyze(c,g),null,2));
}
