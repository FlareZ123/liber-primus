'use strict';
// Agent 8 — terminal direct pointer test, 2026-11-27.
const fs = require('node:fs');
const path = require('node:path');
function run(G,J){
  const assert=(test,msg)=>{if(!test)throw Error(msg)};
  const mod=x=>(x%29+29)%29;
  const cs=[55,56,57].flatMap(p=>J.pages.find(x=>x.page===p).indices);
  assert(cs.length===256&&[55,56,57].map(p=>J.pages.find(x=>x.page===p).indices.length).join(",")==="76,85,95","terminal page geometry");
  const primes=[];for(let n=2;primes.length<84;n++)if(primes.every(p=>p*p>n||n%p!==0))primes.push(n);
  let k=0;
  const p56=cs.slice(76,161).map((x,i)=>i===56?0:mod(x-primes[k++]+1));
  assert(k===84&&cs[132]===0&&p56.filter(x=>x===0).length===1,"native F-hold");
  assert(p56.map(i=>J.translit[i]).join("")==="ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE","known p56");
  k=0;assert(p56.every((p,i)=>(p===0?0:mod(p+primes[k++]-1))===cs[76+i]),"authentic replay");
  const truth=[...Array(76).fill(null),...p56,...cs.slice(161)];
  const plant=[...cs.slice(161,237),...p56,...cs.slice(161)];
  const out={geometry:[76,85,95],original:[],controls:[]};
  const opts=(cipher,key)=>{const z=mod(cipher-key);return [...(cipher===0?[0]:[]),...(z!==0?[z]:[])]};
  /** @param {number[]} v @param {number} end */
  function forest(v,end){
    const ch=Array.from({length:256},()=>[]);
    for(let i=0;i<end;i++)ch[v[i]].push(i);
    const order=[],seen=new Set();
    function visit(i){assert(!seen.has(i),"cycle or repeated node");seen.add(i);order.push(i);for(const j of ch[i])visit(j)}
    for(let i=end;i<256;i++)visit(i);
    assert(order.length===256,"unanchored unknown graph");
    return {ch,order};
  }
  /** @param {number[]} C @param {number[]} v @param {number[]} known @param {number} end @param {number} sign @param {boolean} literal @param {boolean} hold @param {boolean} constrain */
  function decode(C,v,known,end,sign,literal,hold,constrain=false){
    const {ch,order}=forest(v,end);
    const P=known.slice();let paths=1n;
    if(!hold){
      for(const i of order)if(i<end)P[i]=mod(C[i]-sign*(literal?C[v[i]]:P[v[i]]));
      assert(P.slice(0,end).every((p,i)=>mod(p+sign*(literal?C[v[i]]:P[v[i]]))===C[i]),"ordinary inverse replay");
      if(constrain&&P.slice(0,end).some((p,i)=>known[i]!==null&&known[i]!==p))paths=0n;
      return {paths,P};
    }
    const memo=new Map();
    function count(i,parent){
      const id=i*29+parent;
      if(memo.has(id))return memo.get(id);
      let total=0n;
      for(const p of opts(C[i],sign*(literal?C[v[i]]:parent))){
        if(constrain&&known[i]!==null&&p!==known[i])continue;
        let sub=1n;
        for(const j of ch[i])sub*=count(j,p);
        total+=sub;
      }
      memo.set(id,total);return total;
    }
    for(let i=end;i<256;i++)for(const j of ch[i])paths*=count(j,known[i]);
    return {paths};
  }
  function conflicts(C,v,P,literal,hold){
    const r=[];
    for(let i=76;i<161;i++){
      if((!literal&&P[v[i]]===null)||(hold&&P[i]===0))continue;
      r.push({i,parent:v[i],q:literal?C[v[i]]:P[v[i]],p:P[i],c:C[i],shift:mod(C[i]-P[i])});
    }
    const by=Array.from({length:29},()=>Array(29).fill(0));
    for(const x of r)by[x.q][x.shift]++;
    const minErrors=by.reduce((n,a)=>n+a.reduce((x,y)=>x+y,0)-Math.max(...a),0);
    const forward=[],inverse=[];
    for(let a=0;a<r.length;a++)for(let b=a+1;b<r.length;b++){
      const x=r[a],y=r[b];if(x.q!==y.q)continue;
      if(x.p===y.p&&x.c!==y.c)forward.push([x,y]);
      if(x.c===y.c&&x.p!==y.p)inverse.push([x,y]);
    }
    return {observations:r.length,minErrors,forwardConflicts:forward.length,inverseConflicts:inverse.length,witness:forward[0]||inverse[0]||null};
  }
  for(const radix of [59,60]){
    const A=radix===59?G.alphabet.replace("f",""):G.alphabet;
    const v=G.pages.flatMap(p=>p.tokens).map(t=>radix*A.indexOf(t[0])+A.indexOf(t[1]));
    assert(v.length===256&&v.every(n=>n>=0&&n<256),"byte pointers");
    for(const literal of [false,true]){
      const constraints=[false,true].map(hold=>({hold,...conflicts(cs,v,truth,literal,hold)}));
      assert(constraints.every(x=>x.forwardConflicts>0&&x.minErrors>0),"original conflict");
      for(const sign of [1,-1]){
        const ordinary=decode(cs,v,truth,161,sign,literal,false);
        const allF=decode(cs,v,truth,161,sign,literal,true);
        const knownF=decode(cs,v,truth,161,sign,literal,true,true);
        const local=decode(cs,v,truth,76,sign,literal,false);
        const localF=decode(cs,v,truth,76,sign,literal,true);
        out.original.push({radix,register:literal?"printed":"plaintext",sign,p56Matches:p56.filter((p,i)=>p===ordinary.P[76+i]).length,
          p55Ordinary:ordinary.P.slice(0,76),p55KnownAnchorOrdinary:local.P.slice(0,76),
          jointFPaths:String(allF.paths),p56ConstrainedFPaths:String(knownF.paths),p55KnownAnchorFPaths:String(localF.paths),constraints});
        for(const hold of [false,true]){
          const C=plant.slice();const {order}=forest(v,161);
          for(const i of order)if(i<161)C[i]=hold&&plant[i]===0?0:mod(plant[i]+sign*(literal?C[v[i]]:plant[v[i]]));
          const res=decode(C,v,plant,161,sign,literal,hold,true);
          assert(res.paths===1n,"native plant truth path");
          const cf=conflicts(C,v,plant,literal,hold);
          assert(cf.minErrors===0&&cf.forwardConflicts===0&&cf.inverseConflicts===0,"plant no conflicts");
          if(!hold)assert(res.P.every((p,i)=>p===plant[i]),"native ordinary recovery");
          out.controls.push({radix,literal,sign,hold,truthPaths:String(res.paths)});
        }
      }
    }
  }
  return out;
}
if(require.main===module){const read=name=>JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus',name),'utf8'));console.log(JSON.stringify(run(read('lp2-grid-256.json'),read('lp2-corpus.json')),null,2));}
module.exports={run};
