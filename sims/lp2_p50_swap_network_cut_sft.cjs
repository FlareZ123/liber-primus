"use strict";
// Agent49: original p50 swap-network receiver and order-independent cut certificate.
const fs = require("node:fs");
/** @param {{pages:{indices:number[]}[],translit:string[]}} corpus @param {{alphabet:string,pages:{tokens:string[]}[]}} grid */
function analyze(corpus,grid) {
  const assert=(x,m)=>{if(!x)throw Error(m)};
  const mod=x=>(x%29+29)%29;
  const range=n=>Array.from({length:n},(_,i)=>i);
  const ring=[...range(8),...range(31).map(i=>(i+1)*8+7),...range(7).map(i=>31*8+6-i),...range(30).map(i=>(30-i)*8)];
  const inner=range(30).flatMap(r=>range(6).map(c=>(r+1)*8+c+1));
  const path=[...ring,...inner],pos=Array(256);path.forEach((v,i)=>pos[v]=i);
  const c=corpus.pages.slice(55,58).flatMap(p=>p.indices);
  assert(ring.length===76&&new Set(path).size===256&&c.length===256,"terminal frame");
  const frame=tape=>{const raw=Array(256);path.forEach((v,i)=>raw[v]=tape[i]);return raw};
  const raw=frame(c);
  const primes=[];for(let n=2;primes.length<85;n++)if(!primes.some(q=>q*q<=n&&n%q===0))primes.push(n);
  let j=0;const p56=corpus.pages[56].indices.map((x,i)=>i===56?x:mod(x-(primes[j++]-1)));
  let k=0;const re=p56.map(x=>x===0?0:mod(x+primes[k++]-1));
  assert(j===84&&k===84&&re.every((x,i)=>x===corpus.pages[56].indices[i]),"p56 native replay");
  const render=t=>t.map(x=>corpus.translit[x]).join(" ");
  const native=frame([...c.slice(0,76),...p56,...corpus.pages[57].indices]);
  // For the isolated two-vertex branch, exhaust the two orders and all GP29 external labels.
  let toy=0;
  for(let a=0;a<29;a++)for(let b=0;b<29;b++)if(a!==b)for(let z=0;z<29;z++)for(const order of [0,1]){
    const v=[a,b,z];const e=order===0?[[0,1],[0,2]]:[[0,2],[0,1]];
    for(const [i,j] of e)[v[i],v[j]]=[v[j],v[i]];
    assert(v[0]!==a||v[1]!==b,"pendant theorem control");toy++;
  }
  const result=[];
  for(const radix of [59,60]){
    const abc=radix===59?grid.alphabet.replace("f",""):grid.alphabet;
    const f=grid.pages.flatMap(p=>p.tokens).map(t=>abc.indexOf(t[0])*radix+abc.indexOf(t[1]));
    assert(f.length===256&&f.every(x=>Number.isInteger(x)&&x>=0&&x<256),"grid addresses");
    const adj=range(256).map(()=>[]);
    for(let i=0;i<256;i++)if(i!==f[i]){adj[i].push([f[i],i]);adj[f[i]].push([i,i]);}
    const certs=[];
    for(let i=0;i<256;i++){
      if(i===f[i])continue;
      for(const start of [i,f[i]]){
        const q=[start],seen=new Set(q);
        for(let z=0;z<q.length;z++)for(const [v,e] of adj[q[z]])if(e!==i&&!seen.has(v)){seen.add(v);q.push(v);}
        if(seen.has(start===i?f[i]:i)||q.some(v=>pos[v]<76))continue;
        const edges=f.flatMap((v,u)=>seen.has(u)&&seen.has(v)&&u!==v?[u]:[]);
        if(edges.length!==q.length-1)continue;
        const distinctRaw=new Set(q.map(v=>raw[v])).size,distinctNative=new Set(q.map(v=>native[v])).size;
        if(distinctRaw<2&&distinctNative<2)continue;
        certs.push({cut:[i,f[i]],internalEdges:edges.map(u=>[u,f[u]]),cells:q,positions:q.map(v=>pos[v]),raw:q.map(v=>raw[v]),native:q.map(v=>native[v]),distinctRaw,distinctNative,p56Only:q.every(v=>pos[v]>=76&&pos[v]<161)});
      }
    }
    const gates={raw:certs.filter(x=>x.distinctRaw>1).length,native:certs.filter(x=>x.distinctNative>1).length,bothP56Two:certs.filter(x=>x.p56Only&&x.cells.length===2&&x.distinctRaw>1&&x.distinctNative>1)};
    assert(gates.bothP56Two.length>0,"no all-order p56 certificate");
    const ordered=[];
    for(const direction of [1,-1]){
      const deck=range(256),order=direction===1?range(256):range(256).reverse();
      for(const i of order)[deck[i],deck[f[i]]]=[deck[f[i]],deck[i]];
      const trans=deck.map(i=>raw[i]),restored=Array(256);deck.forEach((v,i)=>restored[v]=trans[i]);
      assert(restored.every((x,i)=>x===raw[i]),"swap inverse");
      const out=path.map(i=>trans[i]),key=path.map(i=>deck[i]%29);
      const keyMatch=key.slice(76,161).filter((x,i)=>x===mod(c[i+76]-p56[i])).length;
      const p55=[1,-1].map(sign=>{const d=c.slice(0,76).map((x,i)=>mod(x+sign*key[i]));return{sign,text:render(d),ioc:d.reduce((z,x)=>z+d.filter(y=>y===x).length-1,0)/(76*75)};});
      ordered.push({direction,p56Matches:out.slice(76,161).filter((x,i)=>x===c[i+76]).length,p57Matches:out.slice(161).filter((x,i)=>x===c[i+161]).length,p56DeckKeyMatches:keyMatch,p55Swap:render(out.slice(0,76)),p55Deck:p55});
    }
    result.push({radix,gates,ordered});
  }
  return {toy,p56Plain:render(p56),result};
}
/** @param {{pages:{indices:number[]}[]}} corpus @param {{alphabet:string,pages:{tokens:string[]}[]}} grid */
function alphabetGate(corpus,grid){
 const range=n=>Array.from({length:n},(_,i)=>i);
 const ring=[...range(8),...range(31).map(i=>(i+1)*8+7),...range(7).map(i=>31*8+6-i),...range(30).map(i=>(30-i)*8)];
 const path=[...ring,...range(30).flatMap(r=>range(6).map(i=>(r+1)*8+i+1))],pos=Array(256);path.forEach((v,i)=>pos[v]=i);
 const tape=corpus.pages.slice(55,58).flatMap(x=>x.indices),primes=[];
 for(let n=2;primes.length<85;n++)if(!primes.some(p=>p*p<=n&&n%p===0))primes.push(n);
 let k=0;const p56=corpus.pages[56].indices.map((v,i)=>i===56?v:((v-primes[k++]+1)%29+29)%29);
 const native=[...tape.slice(0,76),...p56,...tape.slice(161)];
 const fresh=()=>Array(29).fill(-1);
 function localDomains(b,input,target){
  const vals=b.cells.map(v=>input[pos[v]]),want=b.cells.map(v=>target[pos[v]]),domains=new Map(),x=[...vals,-1];
  function gen(mask){
   if(mask===((1<<b.edges.length)-1)){
    const M=new Map(),N=new Map();
    for(let i=0;i<want.length;i++){
     if(x[i]<0)continue;
     if((M.has(x[i])&&M.get(x[i])!==want[i])||(N.has(want[i])&&N.get(want[i])!==x[i]))return;
     M.set(x[i],want[i]);N.set(want[i],x[i]);
    }
    const p=[...M.entries()].sort((a,b)=>a[0]-b[0]);domains.set(JSON.stringify(p),p);return;
   }
   for(let i=0;i<b.edges.length;i++)if(!(mask&(1<<i))){const[a,z]=b.edges[i];[x[a],x[z]]=[x[z],x[a]];gen(mask|(1<<i));[x[a],x[z]]=[x[z],x[a]];}
  }
  gen(0);return{...b,vals,want,domains:[...domains.values()]};
 }
 function solve(C,M=fresh(),N=fresh()){
  if(!C.length)return M;
  let best=-1,D=null;
  for(let i=0;i<C.length;i++){
   const d=C[i].domains.filter(d=>d.every(([a,b])=>(M[a]<0||M[a]===b)&&(N[b]<0||N[b]===a)));
   if(!d.length)return null;
   if(D===null||d.length<D.length){best=i;D=d;}
  }
  const rest=C.filter((_,i)=>i!==best);
  for(const d of D){const a=M.slice(),b=N.slice();for(const[x,y]of d){a[x]=y;b[y]=x;}const q=solve(rest,a,b);if(q)return q;}
  return null;
 }
 const out=[];
 for(const base of [59,60]){
  const alpha=base===59?grid.alphabet.replace("f",""):grid.alphabet;
  const f=grid.pages.flatMap(p=>p.tokens).map(t=>alpha.indexOf(t[0])*base+alpha.indexOf(t[1]));
  const adj=range(256).map(()=>[]);f.forEach((v,u)=>{if(u!==v){adj[u].push([v,u]);adj[v].push([u,u]);}});
  const branches=[];
  for(let i=0;i<256;i++){if(i===f[i])continue;for(const start of [i,f[i]]){
   const q=[start],s=new Set(q);for(let j=0;j<q.length;j++)for(const [v,e]of adj[q[j]])if(e!==i&&!s.has(v)){s.add(v);q.push(v);}
   if(s.has(start===i?f[i]:i)||q.length<2||q.length>8||q.some(v=>pos[v]<76))continue;
   const edges=f.flatMap((v,u)=>s.has(u)&&s.has(v)&&u!==v?[[q.indexOf(u),q.indexOf(v)]]:[]);
   if(edges.length!==q.length-1)continue;
   edges.push([q.indexOf(start),q.length]);branches.push({cells:q,cut:[i,f[i]],edges});
  }}
  let plants=0;
  for(const input of [tape,native])for(const direction of [1,-1]){
   const raw=Array(256);path.forEach((v,i)=>raw[v]=input[i]);
   for(const i of direction===1?range(256):range(256).reverse())[raw[i],raw[f[i]]]=[raw[f[i]],raw[i]];
   const hidden=range(29).map(x=>(7*x+11)%29),target=path.map(v=>hidden[raw[v]]);
   const C=branches.map(b=>localDomains(b,input,target));
   if(!C.every(b=>b.domains.some(d=>d.every(([x,y])=>hidden[x]===y)))||!solve(C))throw Error("planted alphabet/order compatibility lost");
   plants++;
  }
  for(const [label,t] of [["raw",tape],["native",native]]){
   const C=branches.map(b=>localDomains(b,t,t)),m=solve(C);
   let core=[];if(!m){core=C.slice();for(let i=0;i<core.length;){if(!solve(core.filter((_,j)=>i!==j)))core.splice(i,1);else i++;}}
   out.push({base,label,branchCount:C.length,domainSizes:C.map(x=>[x.cells.length,x.domains.length]),feasible:!!m,core:core.map(x=>({cells:x.cells,cut:x.cut,edges:x.edges,vals:x.vals,domains:x.domains})),plants});
  }
 }
 return out;
}
const corpus=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
const grid=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-grid-256.json","utf8"));
console.log(JSON.stringify({direct:analyze(corpus,grid),alphabetGate:alphabetGate(corpus,grid)},null,2));
