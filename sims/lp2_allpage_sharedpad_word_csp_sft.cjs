"use strict";
/**
 * Original LP2 all-page shared-key reuse gate, Node.js 22 CommonJS.
 *
 * For each of 1,485 original page pairs, test arbitrary identical GP29
 * position-dependent pad, arbitrary relative page constants, both signs.
 * Stage1 requires exact compatible 4+ rune lexical overlaps. Stage2
 * propagates same-word identity across ALL overlaps for a diagnostic
 * 29-page-offset survivor, using complete original printed word domains.
 *
 * All source data/positive tests use the independently validated sibling
 * GP29 wordgate. Bridge exclusions are necessary tests; converged AC3
 * is sufficient for full dictionary-word assignment on acyclic graphs.
 */
const assert=require("node:assert/strict");
const {source,dictionary,completeInteriorWords,overlapWords,plantedPlaintext,mod29}
  =require("./lp2_page29_equalwidth_twotimepad_wordbridge_sft.cjs");
const MASK=(1<<29)-1,cache=new Map();
function signatures(n,skip,width){
  const id=[n,skip,width].join(":");
  if(cache.has(id))return cache.get(id);
  const out=(dictionary.get(n)||[]).map(word=>{
    const delta=[];
    for(let i=skip+1;i<skip+width;i++)delta.push(mod29(word[i]-word[i-1]));
    return {first:word[skip],delta};
  });
  cache.set(id,out);
  return out;
}
function bridgeMask(a,b,t,sign){
  const A=signatures(t.aLen,t.aSkip,t.width);
  const B=signatures(t.bLen,t.bSkip,t.width);
  const bSig=new Map();
  for(const w of B){
    const k=w.delta.join(",");
    bSig.set(k,(bSig.get(k)||0)|(1<<w.first));
  }
  const d=Array.from({length:t.width},(_,i)=>mod29(a[t.start+i]-b[t.start+i]));
  const dd=[];
  for(let i=1;i<d.length;i++)dd.push(mod29(d[i]-d[i-1]));
  let mask=0;
  for(const w of A){
    const expected=w.delta.map((v,i)=>mod29(v-sign*dd[i])).join(",");
    const initials=bSig.get(expected)||0;
    for(let b0=0;b0<29;b0++)
      if(initials&(1<<b0))mask|=1<<mod29(b0-w.first+sign*d[0]);
    if(mask===MASK)break;
  }
  return mask;
}
function masks(a,b,spans){
  let plus=MASK,minus=MASK,n=0;
  for(const t of spans){
    if(plus)plus&=bridgeMask(a,b,t,1);
    if(minus)minus&=bridgeMask(a,b,t,-1);
    n++;if(!plus&&!minus)break;
  }
  return {plus,minus,n};
}
function shifts(mask){
  return Array.from({length:29},(_,i)=>i).filter(i=>mask&(1<<i));
}
/**
 * AC-3-like exact support consistency on every >=1 rune original word-pair
 * overlap. A single empty complete original-word domain is an impossibility
 * witness. The original word-overlap graph is a forest, so a nonempty
 * converged fixed point guarantees a global dictionary-word assignment.
 * This is not authenticated plaintext.
 */
function arc(pa,pb,a,b,sign,shift){
  const wa=completeInteriorWords(pa),wb=completeInteriorWords(pb);
  const dom=wa.concat(wb).map(w=>dictionary.get(w.length)||[]);
  const links=[];
  for(let i=0;i<wa.length;i++)for(let j=0;j<wb.length;j++){
    const x=wa[i],y=wb[j],at=Math.max(x.start,y.start);
    const hi=Math.min(x.start+x.length,y.start+y.length),n=hi-at;
    if(n<1)continue;
    links.push({i,j:wa.length+j,n,
      ai:at-x.start,bi:at-y.start,
      d:Array.from({length:n},(_,k)=>
        mod29(sign*(a[at+k]-b[at+k])-shift))});
  }
  links.sort((x,y)=>y.n-x.n);
  let checked=0;
  for(let pass=0;pass<16;pass++){
    let changed=false;
    for(const t of links){
      const oldA=dom[t.i],oldB=dom[t.j];
      const bSet=new Set(oldB.map(w=>w.slice(t.bi,t.bi+t.n).join(",")));
      const aa=oldA.filter(w=>bSet.has(w.slice(t.ai,t.ai+t.n)
        .map((v,k)=>mod29(v-t.d[k])).join(",")));
      checked++;
      if(!aa.length)return {status:"UNSAT",pass,checked,
        emptyDomain:"A",originalOverlapWidth:t.n,wordIndex:t.i};
      if(aa.length<oldA.length){dom[t.i]=aa;changed=true;}
      const aSet=new Set(dom[t.i].map(w=>w.slice(t.ai,t.ai+t.n).join(",")));
      const bb=oldB.filter(w=>aSet.has(w.slice(t.bi,t.bi+t.n)
        .map((v,k)=>mod29(v+t.d[k])).join(",")));
      checked++;
      if(!bb.length)return {status:"UNSAT",pass,checked,
        emptyDomain:"B",originalOverlapWidth:t.n,
        wordIndex:t.j-wa.length};
      if(bb.length<oldB.length){dom[t.j]=bb;changed=true;}
    }
    if(!changed)return {status:"POSSIBLE",pass,checked};
  }
  return {status:"UNRESOLVED_ITERATION_LIMIT",checked};
}
/** On every original page pair, complete-word overlap graph is a forest.
 * Consequence: arc consistency is sufficient for a full lexicon assignment. */
function assertForest(pa,pb){
  const a=completeInteriorWords(pa),b=completeInteriorWords(pb);
  const parent=Array.from({length:a.length+b.length},(_,i)=>i);
  function root(x){while(parent[x]!==x){parent[x]=parent[parent[x]];x=parent[x];}return x;}
  for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++){
    const x=a[i],y=b[j];
    if(Math.min(x.start+x.length,y.start+y.length)<=Math.max(x.start,y.start))continue;
    const u=root(i),v=root(a.length+j);
    assert.notEqual(u,v,"cycle in source word-overlap graph");
    parent[v]=u;
  }
}

function main(){
  const pages=source.pages.filter(p=>p.page<=55&&p.indices.length);
  assert.equal(pages.length,55);
  let excluded=0,tested=0;
  const candidates=[];
  for(let i=0;i<pages.length;i++)for(let j=i+1;j<pages.length;j++){
    const a=pages[i],b=pages[j],sp=overlapWords(a.page,b.page);
    assertForest(a.page,b.page);
    assert(sp.length);
    const out=masks(a.indices,b.indices,sp);
    tested+=out.n;
    if(!out.plus&&!out.minus){excluded++;continue;}
    candidates.push({pair:[a.page,b.page],
      lengths:[a.indices.length,b.indices.length],bridges:sp.length,
      plus:shifts(out.plus),minus:shifts(out.minus)});
  }
  assert.equal(candidates.length+excluded,1485);
  assert.equal(excluded,1402);
  assert.equal(candidates.length,83);
  const p231=candidates.find(x=>x.pair[0]===2&&x.pair[1]===31);
  assert(p231&&p231.plus.includes(17));
  const rejected=arc(2,31,source.pages[2].indices,
    source.pages[31].indices,1,17);
  assert.equal(rejected.status,"UNSAT");
  // Authentic original physical word boundaries, completely varying shared
  // pad and independently secret second-page additive constant. Both signs.
  for(const sign of [1,-1]){
    const A=plantedPlaintext(13,91),B=plantedPlaintext(42,173);
    const pad=Array.from({length:A.length},(_,i)=>mod29(i*i+7*i+3));
    const a=A.map((v,i)=>mod29(pad[i]+sign*v));
    const b=B.map((v,i)=>mod29(pad[i]+sign*v+5));
    const m=masks(a,b,overlapWords(13,42));
    const shift=mod29(-5*sign);
    assert((sign===1?m.plus:m.minus)&(1<<shift));
    assert.equal(arc(13,42,a,b,sign,shift).status,"POSSIBLE");
  }
  // Source-length and original-bridge coverage gate: candidate pairs with
  // at least eight independent 4+ overlaps and 130 runes on each side.
  // Expand every remaining relative offset and both signs, then enforce
  // single-word identities across all short and long page-word overlaps.
  // Apply the exact same complete-word constraint procedure to EVERY
  // preliminary survivor, including the 55 short and sparse alignments.
  // Surviving forest assignments are feasible dictionary text, but
  // their historical authenticity is explicitly undecided.
  const qualified=candidates;
  let arcTrials=0,arcContradictions=0,arcChecks=0;
  const qualifiedSurvivors=[];
  for(const item of qualified){
    const [pa,pb]=item.pair;
    const a=source.pages[pa].indices,b=source.pages[pb].indices;
    for(const [sign,shifts] of [[1,item.plus],[-1,item.minus]])
      for(const shift of shifts){
        const result=arc(pa,pb,a,b,sign,shift);
        arcTrials++;
        arcChecks+=result.checked;
        if(result.status==="UNSAT")arcContradictions++;
        else qualifiedSurvivors.push({pair:item.pair,sign,shift,
          status:result.status});
      }
  }
  console.log(JSON.stringify({sourcePages:55,pairs:1485,
    excludedAtIndependentWordOverlaps:excluded,
    preliminarySurvivors:candidates.length,
    totalPreliminarySurvivorsChecked:qualified.length,arcTrials,arcContradictions,
    arcChecks,qualifiedSurvivors,
    longBridgeChecks:tested,
    p2p31OneShift17:rejected,
    otherSurvivors:candidates.filter(x=>
      Math.min(...x.lengths)>=130&&x.bridges>=8),
    shortOrSparseSurvivors:candidates.filter(x=>
      Math.min(...x.lengths)<130||x.bridges<8).map(x=>x.pair),
    positive:"PASS genuine same-key English pages, both signs, full-word domains"
  },null,2));
  console.log("No original unknown plaintext, key or location recovered.");
}
main();
