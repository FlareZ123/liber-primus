'use strict';
// Director #2842: exact whole-chapter stable prime-residue order, fixed native prime inverse.
const fs=require('node:fs');
const path=require('node:path');
const INPUTS=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/external/relikd-solved-gp29-native-v1.json"
];
function experiment(raw){
  const corpus=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(corpus.runes.map((x,i)=>[x,i]));
  const mod=x=>(x%29+29)%29, same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]),check=(v,m)=>{if(!v)throw Error(m)};
  const primes=[];for(let p=2;primes.length<2000;p++){let yes=true;for(const q of primes){if(q*q>p)break;if(p%q===0){yes=false;break}}if(yes)primes.push(p)}
  const shift=primes.map(p=>(p-1)%29);
  function perm(N){return Array.from({length:N},(_,j)=>j).sort((a,b)=>shift[a]-shift[b]||a-b)}
  function apply(a,order){return order.map(j=>a[j])}
  function undo(a,order){const r=new Array(a.length);for(let t=0;t<a.length;t++)r[order[t]]=a[t];return r}
  function native(p){let k=0;const e=p.map(x=>x===0?0:mod(x+shift[k++]));return {e,consumed:k}}
  function plaintext(name){return [...gold.sections.find(s=>s.name===name).source_text].filter(c=>ix.has(c)).map(c=>ix.get(c))}
  function solve(e){
    let counts=new Map([[0,1n]]);const layers=[counts],links=[];let reached=0;
    for(let i=0;i<e.length;i++){
      const next=new Map(),edges=new Map();
      for(const [k,n] of counts){
        const v=mod(e[i]-shift[k]),a=[];
        if(e[i]===0)a.push({p:0,k});
        if(v!==0)a.push({p:v,k:k+1});
        edges.set(k,a);
        for(const z of a)next.set(z.k,(next.get(z.k)||0n)+n);
      }
      links.push(edges);if(!next.size)break;
      counts=next;layers.push(next);reached++;
    }
    const complete=reached===e.length, count=complete?[...counts.values()].reduce((a,b)=>a+b,0n):0n;
    // Store the exact reachable DAG compactly, even if candidate count is huge.
    const live=Array.from({length:reached+1},()=>new Set());
    for(const k of layers[reached].keys())live[reached].add(k);
    for(let i=reached-1;i>=0;i--)for(const [k,es] of links[i])if(es.some(z=>live[i+1].has(z.k)))live[i].add(k);
    const dag=Array.from({length:reached},(_,i)=>[...live[i]].sort((a,b)=>a-b).map(k=>[k,links[i].get(k).filter(z=>live[i+1].has(z.k)).map(z=>[z.p,z.k])]));
    const paths=[];
    if(complete&&count<=10000n){
      function visit(i,k,p){if(i===reached){paths.push(p.slice());return}for(const z of links[i].get(k)||[])if(live[i+1].has(z.k)){p.push(z.p);visit(i+1,z.k,p);p.pop()}}
      visit(0,0,[]);
      check(BigInt(paths.length)===count,"enumeration mismatch");
      for(const p of paths)check(same(native(p).e,e),"path replay");
    }
    let representative=[],k=0;
    for(let i=0;i<reached;i++){const z=links[i].get(k).find(z=>live[i+1].has(z.k));representative.push(z.p);k=z.k;}
    check(same(native(representative).e,e.slice(0,reached)),"prefix replay");
    return {complete,reached,pathCount:count.toString(),finalCursors:complete?[...counts.keys()]:[],maxFrontier:Math.max(...layers.map(x=>x.size)),deadCipher:complete?null:e[reached],deadIncoming:complete?[]:[...counts.keys()].map(k=>[k,shift[k]]),representative,paths:complete&&count<=10000n?paths:null,dag};
  }
  const plain56=plaintext("p56_an_end"),en56=native(plain56);
  check(plain56.length===85&&en56.consumed===84&&same(en56.e,corpus.pages[56].indices),"actual p56 mismatch");
  const chapters=[{name:"p54–55",pages:[54,55]},{name:"p0–2",pages:[0,1,2]}];
  const output=[];
  for(const ch of chapters){
    const c=ch.pages.flatMap(p=>corpus.pages[p].indices),order=perm(c.length);
    check(new Set(order).size===c.length&&same(apply(undo(c,order),order),c),"permutation inverse");
    const e=undo(c,order),rank=undo(Array.from({length:c.length},(_,i)=>i),order);
    const s=solve(e),d=solve(c);
    const replay=s.complete?same(apply(native(s.representative).e,order),c):same(s.representative.length?same(native(s.representative).e,e.slice(0,s.reached))?[1]:[0]:[1],[1]);
    check(replay,"original replay");
    output.push({name:ch.name,n:c.length,bucketCounts:Array.from({length:29},(_,i)=>shift.slice(0,c.length).filter(x=>x===i).length),order,stable:{...s,firstDeadSourceIndex:s.complete?null:rank[s.reached],representativeText:s.representative.map(x=>corpus.translit[x]).join("")},direct:{...d,representativeText:d.representative.map(x=>corpus.translit[x]).join("")}});
  }
  const controls=[];
  for(const [name,N] of [["0_welcome",308],["0_koan_1",729],["p57_parable",95]]){
    const p=plaintext(name).slice(0,N);check(p.length===N,"native source length");
    const en=native(p),order=perm(N),c=apply(en.e,order),s=solve(undo(c,order)),rival=solve(c),direct=solve(en.e);
    let k=0,valid=true;
    for(let i=0;i<N;i++){const x=p[i],z=x===0?k:k+1;const row=s.dag[i].find(a=>a[0]===k);if(!row||!row[1].some(a=>a[0]===x&&a[1]===z))valid=false;k=z}
    check(s.complete&&direct.complete&&valid&&k===en.consumed&&same(apply(native(p).e,order),c),"native control retention");
    controls.push({name,N,consumed:en.consumed,stableComplete:s.complete,stablePaths:s.pathCount,stableTruthRetained:valid,stableUnique:s.pathCount==="1",stableRepresentativeExact:same(s.representative,p),directOnPlant:rival.complete,directOnPlantPaths:rival.pathCount,directUnpermuted:direct.complete});
  }
  return {p56:{runes:plain56.length,consumed:en56.consumed},controls,output};
}
if(require.main===module){const root=path.resolve(__dirname,'..');console.log(JSON.stringify(experiment(INPUTS.map(p=>fs.readFileSync(path.join(root,p),'utf8'))),null,2));}
module.exports={experiment,INPUTS};
