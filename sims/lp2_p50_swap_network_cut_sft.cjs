"use strict";
// Agent49: original p50 swap-network receiver and order-independent cut certificate.
const fs = require("node:fs");
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
const corpus=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
const grid=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-grid-256.json","utf8"));
console.log(JSON.stringify(analyze(corpus,grid),null,2));
