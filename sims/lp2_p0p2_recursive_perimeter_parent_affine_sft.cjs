'use strict';
// Agent41, #2483. Read-only, Node 22 CommonJS; no external dependencies.
const fs = require('node:fs');
function run(corpus,native){
  const N=27, Q=29, M=N*N;
  const mod=x=>((x%Q)+Q)%Q;
  const idx=new Map(native.runes.map((c,i)=>[c,i]));
  const ds=native.sections.map(s=>({name:s.name, p:[...s.source_text].filter(c=>idx.has(c)).map(c=>idx.get(c))}));
  const donors=ds.filter(x=>x.p.length>=M);
  const train=ds.filter(x=>x.p.length<M);
  const uni=Array(Q).fill(.5), bi=Array.from({length:Q},()=>Array(Q).fill(.5));
  for(const {p} of train)for(let i=0;i<p.length;i++){uni[p[i]]++; if(i)bi[p[i-1]][p[i]]++}
  const norm=v=>{const s=v.reduce((a,b)=>a+b,0);return v.map(x=>Math.log(x/s))};
  const u=norm(uni), b=bi.map(norm);
  const rings=Array.from({length:14},()=>[]), depth=[], parent=[];
  for(let i=0;i<M;i++){
    const y=Math.floor(i/N),x=i%N,d=Math.min(x,y,N-1-x,N-1-y);
    depth[i]=d;rings[d].push(i);
    if(d){
      const px=x===d?x-1:x===N-1-d?x+1:x;
      const py=y===d?y-1:y===N-1-d?y+1:y;
      parent[i]=py*N+px;
      if(depth[parent[i]]!==undefined && depth[parent[i]]!==d-1)throw Error("bad parent");
    }
  }
  for(let i=0;i<M;i++)if(depth[i]&&depth[parent[i]]!==depth[i]-1)throw Error("bad parent");
  // Printed row-major indices retained. Each ring is decrypted completely before its children.
  const enc=(p,k,a,h)=>{
    const c=Array(M);
    for(let i=0;i<M;i++)c[i]=mod(p[i]+(depth[i]===0?k:a*p[parent[i]]+h));
    return c;
  };
  const dec=(c,k,a,h,limit=13)=>{
    const p=Array(M).fill(-1);
    for(let d=0;d<=limit;d++)for(const i of rings[d])p[i]=mod(c[i]-(d===0?k:a*p[parent[i]]+h));
    return p;
  };
  // Log likelihood of contiguous printed-order segments; never create ngrams across unknown cells.
  const score=(p,maxDepth,minDepth=0)=>{
    let s=0,n=0;
    for(let i=0;i<M;i++)if(depth[i]>=minDepth&&depth[i]<=maxDepth){
      const z=p[i];if(z<0)throw Error("unresolved cell");
      s+=i&&p[i-1]>=0?b[p[i-1]][z]:u[z];n++;
    }
    return s/n;
  };
  const outer=rings[0], inner=rings[1];
  function fit(c){
    let ks=[];
    for(let k=0;k<Q;k++){
      const p=dec(c,k,1,0,0);ks.push({k,s:score(p,0)});
    }
    ks.sort((a,b)=>b.s-a.s||a.k-b.k);
    const k=ks[0].k,p0=dec(c,k,1,0,0);
    let candidates=[];
    for(let a=1;a<Q;a++)for(let h=0;h<Q;h++){
      const p=p0.slice();
      for(const i of inner)p[i]=mod(c[i]-a*p[parent[i]]-h);
      candidates.push({k,a,h,s:score(p,1)});
    }
    candidates.sort((a,b)=>b.s-a.s||a.a-b.a||a.h-b.h);
    const w=candidates[0],p=dec(c,w.k,w.a,w.h);
    const exact=enc(p,w.k,w.a,w.h).every((x,i)=>x===c[i]);
    return {key:[w.k,w.a,w.h],outer:ks[0].s,outerGap:ks[0].s-ks[1].s,fit:w.s,fitGap:w.s-candidates[1].s,held:score(p,13,2),exact,p};
  }
  let seed=0x248341;
  function rng(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n}
  const records=[];
  for(const d of donors)for(let trial=0;trial<12;trial++){
    const off=rng(d.p.length-M+1), plain=d.p.slice(off,off+M),key=[rng(Q),1+rng(28),rng(Q)], c=enc(plain,...key),f=fit(c);
    records.push({donor:d.name,trial,off,key,recovered:f.key,keyOK:key.every((x,i)=>x===f.key[i]),plaintextOK:plain.every((x,i)=>x===f.p[i]),exact:f.exact,outer:f.outer,fit:f.fit,held:f.held});
  }
  const c=corpus.pages.filter(x=>x.page>=0&&x.page<=2).flatMap(x=>x.indices);
  if(c.length!==M)throw Error("wrong original frame");
  const f=fit(c), nulls=[];
  for(let t=0;t<24;t++){const z=Array.from({length:M},()=>rng(Q)),v=fit(z);nulls.push({outer:v.outer,fit:v.fit,held:v.held})}
  function range(a,k){return [Math.min(...a.map(x=>x[k])),Math.max(...a.map(x=>x[k]))]}
  const ioc=p=>{const h=Array(Q).fill(0);for(const x of p)h[x]++;return h.reduce((s,x)=>s+x*(x-1),0)/(p.length*(p.length-1))};
  const nativeP=records.filter(x=>x.plaintextOK).length;
  return {ringSizes:rings.map(x=>x.length),training:train.map(x=>[x.name,x.p.length]),donors:donors.map(x=>[x.name,x.p.length]),trials:records.length,keyRecovery:records.filter(x=>x.keyOK).length,plaintextRecovery:nativeP,allPlantReplay:records.every(x=>x.exact),controlRanges:Object.fromEntries(["outer","fit","held"].map(k=>[k,range(records,k)])),nullRanges:Object.fromEntries(["outer","fit","held"].map(k=>[k,range(nulls,k)])),original:{key:f.key,outer:f.outer,outerGap:f.outerGap,fit:f.fit,fitGap:f.fitGap,held:f.held,exact:f.exact,ioc:ioc(f.p),printedPrefix:f.p.slice(0,80).map(x=>corpus.translit[x]).join(" "),allIndices:f.p},records,nulls};
}
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
console.log(JSON.stringify(run(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')), null, 2));
