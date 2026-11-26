"use strict";
// GP29 word-local page-row circulant image constraints.
// Run from repository root: node sims/agent31_lp2_page_row_word_circulant_sft.cjs
const fs=require("node:fs");
function experiment(corpus,raw,native){
  const q=29,mod=x=>(x%q+q)%q,inv=x=>{for(let i=1;i<q;i++)if(mod(i*x)===1)return i;throw Error("zero");},check=(x,m)=>{if(!x)throw Error(m);};
  const map=new Map(corpus.runes.map((r,i)=>[r,i]));const words=[];let page=0,w=[],start=0,last=0;
  const flush=()=>{if(w.length){words.push({page:start,end:last,seq:w});w=[];}};
  for(const ch of raw.split("%").slice(0,55).join("%")){if(map.has(ch)){if(!w.length)start=page>=50?page+1:page;last=page>=50?page+1:page;w.push(map.get(ch));}else if(ch==="%"){page++;}else if(ch!=="/"&&!/\s/u.test(ch))flush();}flush();
  check(words.length===2896,"word count");check(words.flatMap(x=>x.seq).join(",")===corpus.pages.slice(0,56).flatMap(x=>x.indices).join(","),"rune tape");
  const opening=corpus.pages.slice(0,3).flatMap(p=>p.indices);check(opening.length===729&&opening[13]===2,"opening");
  const keys=Array.from({length:55},(_,i)=>opening.slice(14+13*i,27+13*i));
  check(keys.every((k,i)=>(mod(k.reduce((a,b)=>a+b,0))===0)===(i===49)),"unique zero sum");
  /** @param {number[][]} a @param {number} cols */
  function rref(a,cols){let x=a.map(v=>v.map(mod)),piv=[];let row=0;for(let j=0;j<cols&&row<x.length;j++){let k=x.findIndex((v,i)=>i>=row&&v[j]);if(k<0)continue;[x[row],x[k]]=[x[k],x[row]];const v=inv(x[row][j]);x[row]=x[row].map(z=>mod(z*v));for(let i=0;i<x.length;i++)if(i!==row&&x[i][j]){const z=x[i][j];x[i]=x[i].map((a,k)=>mod(a-z*x[row][k]));}piv.push(j);row++;}return {a:x.slice(0,row),piv};}
  /** @param {number[][]} a @param {number} cols */
  function nullspace(a,cols){const {a:b,piv}=rref(a,cols),free=Array.from({length:cols},(_,i)=>i).filter(i=>!piv.includes(i));return free.map(j=>{let v=Array(cols).fill(0);v[j]=1;for(let i=0;i<piv.length;i++)v[piv[i]]=mod(-b[i][j]);return v;});}
  const dot=(a,b)=>mod(a.reduce((s,x,i)=>s+x*b[i],0));
  const matrix=(p,L,orient)=>Array.from({length:L},(_,i)=>{const row=Array(L).fill(0);keys[p-1].forEach((x,j)=>{const k=((i+orient*j)%L+L)%L;row[k]=mod(row[k]+x);});return row;});
  const transpose=m=>m[0].map((_,i)=>m.map(v=>v[i]));
  const basisCache=new Map();
  function left(p,L,o){const id=[p,L,o].join(",");if(!basisCache.has(id)){const mt=o===0?[...transpose(matrix(p,L,-1)),...transpose(matrix(p,L,1))]:transpose(matrix(p,L,o));basisCache.set(id,nullspace(mt,L));}return basisCache.get(id);}
  function summarize(rows){const B=rref(rows,29),ns=nullspace(rows,29),forced=[];for(let i=0;i<29;i++)for(let j=i+1;j<29;j++)if(ns.every(v=>v[i]===v[j]))forced.push([i,j]);return {equations:rows.length,rank:B.piv.length,nullity:ns.length,forcedEqualPairCount:forced.length,firstForcedPairs:forced.slice(0,6),basis:B.a};}
  const recs=words.map((w,i)=>({...w,i})).filter(w=>w.page>=3&&w.page===w.end);
  const nativeWords=native.sections.flatMap(s=>(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(r=>native.runes.indexOf(r))));
  check(nativeWords.every(w=>w.every(x=>x>=0&&x<29)),"native alphabet");
  const nativeBy=Array.from({length:100},(_,i)=>nativeWords.filter(w=>w.length===i));
  function eqFor(z,seq){const eq=Array(29).fill(0);seq.forEach((v,i)=>eq[v]=mod(eq[v]+z[i]));check(mod(eq.reduce((a,b)=>a+b,0))===0,"row sum");return eq;}
  let results=[];
  for(const orient of [-1,1,0]){
    const eqFit=[],eqHeld=[],bad=[],singular=[];let maxNull=0,planted=0,plantEq=[],plantEqFit=[],plantEqHeld=[];
    let state=(3301+orient)>>>0;const perm=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){state=(Math.imul(state,1664525)+1013904223)>>>0;const j=state%(i+1);[perm[i],perm[j]]=[perm[j],perm[i]];}const piInv=Array.from({length:29},(_,i)=>perm.indexOf(i));
    for(const w of recs){const L=w.seq.length,ns=left(w.page,L,orient);if(!ns.length)continue;maxNull=Math.max(maxNull,ns.length);singular.push({ordinal:w.i,page:w.page,L,nullity:ns.length});const m=matrix(w.page,L,orient||((w.i%2)?1:-1));
      for(const z of ns){check(dot(z,Array(L).fill(1))===0,"constant image");const eq=eqFor(z,w.seq);(w.page<=39?eqFit:eqHeld).push(eq);const res=dot(z,w.seq);if(res)bad.push({ordinal:w.i,page:w.page,L,z,res,seq:w.seq});}
      const pool=nativeBy[L];if(pool&&pool.length){const plain=pool[w.i%pool.length];const shift=w.i%L,bias=mod(w.i*3+7);const enc=m.map(v=>mod(dot(v,plain)+bias));const enc2=enc.map((_,i)=>enc[(i+shift)%L]);const cipher=enc2.map(x=>piInv[x]);for(const z of ns){check(dot(z,enc2)===0,"plant image");const eq=eqFor(z,cipher);check(dot(eq,perm)===0,"plant mapped image");plantEq.push(eq);(w.page<=39?plantEqFit:plantEqHeld).push(eq);}planted++;}
    }
    const fit=summarize(eqFit),held=summarize(eqHeld),all=summarize([...eqFit,...eqHeld]),plant=summarize(plantEq),plantFit=summarize(plantEqFit);
    // The affine gauge is the only ambiguity when rank=27: use two known
    // normalization coordinates for the purpose of measuring plant recovery.
    const solutionSpace=nullspace(plantEqFit,29);
    let plantGaugeRecovered=false;
    if(solutionSpace.length===2){let v=solutionSpace.find(x=>new Set(x).size>1);const den=mod(v[1]-v[0]);if(den){const normalized=v.map(x=>mod((x-v[0])*inv(den)));const truth=perm.map(x=>mod((x-perm[0])*inv(mod(perm[1]-perm[0]))));plantGaugeRecovered=normalized.join(",")===truth.join(",")&&plantEqHeld.every(eq=>dot(eq,normalized)===0);check(plantGaugeRecovered,"plant normalized alphabet");}}
    results.push({orient,groups:recs.length,sourceRunes:recs.reduce((s,w)=>s+w.seq.length,0),singularGroups:singular.length,maxNullity:maxNull,byPage:singular.reduce((o,v)=>(o[v.page]=(o[v.page]||0)+1,o),{}),badEquations:bad.length,badGroups:new Set(bad.map(x=>x.ordinal)).size,firstBad:bad.slice(0,4),fit,held,all,planted,plant,plantFit,plantGaugeRecovered});
  }
  return {results};
}
const read=p=>fs.readFileSync(p,"utf8");
console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"))),null,2));
