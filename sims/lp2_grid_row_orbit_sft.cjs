"use strict";
const fs = require("node:fs");
/**
 * Exact unordered common-permutation inverse, issue #2696.
 * Run from repository root: node sims/lp2_grid_row_orbit_sft.cjs
 */
function run(grid) {
  const check = (test, msg) => { if (!test) throw new Error(msg); };
  const eq = (a,b) => JSON.stringify(a) === JSON.stringify(b);
  const sorted = xs => [...xs].sort((a,b)=>a-b);
  const range = n => Array.from({length:n}, (_,i)=>i);
  const choose = (n,k) => { let v=1n; for(let i=1;i<=k;i++) v=v*BigInt(n-i+1)/BigInt(i); return v; };
  /** @param {number[][]} rows @param {number} offset @param {number} n */
  function classes(rows,offset,n) {
    const sets=rows.map(r=>new Set(r)), out=new Map();
    for(const x of range(n)) {
      const s=sets.slice(offset,offset+rows.length-1).map(a=>a.has(x)?'1':'0').join('');
      if(!out.has(s)) out.set(s,[]);
      out.get(s).push(x);
    }
    return out;
  }
  /** @param {number[][]} rows @param {number} n */
  function solve(rows,n=256) {
    const a=classes(rows,0,n), b=classes(rows,1,n);
    const differences=[...new Set([...a.keys(),...b.keys()])].sort().map(s=>({signature:s,source:(a.get(s)||[]).length,target:(b.get(s)||[]).length})).filter(x=>x.source!==x.target);
    if(differences.length) return {feasible:false,sourceClasses:a.size,targetClasses:b.size,differences};
    const forced=[], witness=Array(n), forcedNext=[], latest=new Set(rows.at(-1));
    let nextCount=1n;
    const nextConstraints=[];
    for(const [s,src] of a) {
      const dst=b.get(s);
      src.forEach((x,i)=>witness[x]=dst[i]);
      if(src.length===1) forced.push([src[0],dst[0]]);
      const k=src.filter(x=>latest.has(x)).length;
      nextCount*=choose(dst.length,k);
      if(k===dst.length) forcedNext.push(...dst);
      nextConstraints.push({k,dst});
    }
    return {feasible:true,sourceClasses:a.size,targetClasses:b.size,forced,witness,nextCount:String(nextCount),forcedNext:sorted(forcedNext),nextConstraints};
  }
  function valid(rows,f) { return rows.slice(1).every((r,i)=>eq(sorted(rows[i].map(x=>f[x])),sorted(r))); }
  let seed=0x2696a6;
  function rnd(n) { seed=(Math.imul(seed,1664525)+1013904223)>>>0; return Math.floor(seed/4294967296*n); }
  function shuffle(a) { a=[...a]; for(let i=a.length-1;i>0;i--) {const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]];} return a; }
  const plants=[];
  for(let trial=0;trial<16;trial++) {
    const f=shuffle(range(256)), rows=[shuffle(range(256)).slice(0,8)];
    for(let i=1;i<33;i++) rows.push(shuffle(rows.at(-1).map(x=>f[x])));
    const observed=rows.slice(0,32), z=solve(observed);
    check(z.feasible && valid(observed,z.witness),'planted witness');
    check(z.forced.every(([x,y])=>f[x]===y),'false forced mapping');
    // Independently swap every non-singleton class target with another member;
    // each such swap is a valid completion and changes the chosen edge.
    const a=classes(observed,0,256), b=classes(observed,1,256);
    let unforced=0;
    for(const [s,src] of a) if(src.length>1) {
      const dst=b.get(s);
      for(let j=0;j<src.length;j++) {
        const x=src[j], y=src[(j+1)%src.length], alt=[...z.witness];
        alt[x]=dst[(j+1)%src.length];alt[y]=dst[j];
        check(alt[x]!==z.witness[x] && valid(observed,alt),'false ambiguity');
        unforced++;
      }
    }
    check(z.forced.length+unforced===256,'incomplete edge classification');
    const next=new Set(rows[32]);
    check(z.nextConstraints.every(({k,dst})=>dst.filter(x=>next.has(x)).length===k),'withheld row excluded');
    plants.push({forcedEdges:z.forced.length,forcedNext:z.forcedNext.length,nextCount:z.nextCount,withheldIncluded:true});
  }
  // Tiny exact enumeration validates feasibility, forced edges and next-row counts
  // against every one of 5! independent permutations.
  function permutations(a) { if(!a.length)return [[]];return a.flatMap((x,i)=>permutations(a.filter((_,j)=>j!==i)).map(p=>[x,...p])); }
  const perms=permutations(range(5));
  const toy=[];
  for(let i=0;i<80;i++) {
    const f=shuffle(range(5)), rows=[shuffle(range(5)).slice(0,2)];
    for(let j=1;j<5;j++) rows.push(i%2?shuffle(range(5)).slice(0,2):shuffle(rows.at(-1).map(x=>f[x])));
    const expected=perms.filter(p=>valid(rows,p)),z=solve(rows,5);
    check(z.feasible===(expected.length>0),'toy feasibility');
    if(z.feasible) {
      const forced=range(5).flatMap(x=>expected.every(p=>p[x]===expected[0][x])?[[x,expected[0][x]]]:[]);
      check(eq(z.forced.sort((a,b)=>a[0]-b[0]),forced),'toy forced edges');
      const next=new Set(expected.map(p=>sorted(rows.at(-1).map(x=>p[x])).join(',')));
      check(BigInt(next.size)===BigInt(z.nextCount),'toy next count');
    }
    toy.push(expected.length>0);
  }
  const originals={};
  for(const alphabet of [grid.alphabet.replace('f',''),grid.alphabet]) {
    const rows=grid.pages.flatMap(p=>range(p.rows).map(i=>p.tokens.slice(i*8,i*8+8).map(t=>{
      const a=alphabet.indexOf(t[0]),b=alphabet.indexOf(t[1]);
      check(t.length===2&&a>=0&&b>=0,'invalid token');
      return alphabet.length*a+b;
    })));
    check(rows.length===32&&rows.every(r=>r.length===8&&new Set(r).size===8&&r.every(x=>x>=0&&x<256)),'source shape');
    if(alphabet.length===60) check(eq(rows.flat(),grid.bytes),'canonical base60 disagreement');
    const full=solve(rows);
    const first=range(31).map(i=>({rows:i+2,result:solve(rows.slice(0,i+2))})).find(x=>!x.result.feasible);
    originals[alphabet.length]={firstThreeRows:rows.slice(0,3),firstContradiction:first,fullMismatchCount:full.differences.length,sourceClasses:full.sourceClasses,targetClasses:full.targetClasses,twoRowNextCount:solve(rows.slice(0,2)).nextCount,pageFeasible:[solve(rows.slice(0,10)).feasible,solve(rows.slice(10,23)).feasible,solve(rows.slice(23)).feasible],adjacentIntersections:rows.slice(1).map((r,i)=>r.filter(x=>rows[i].includes(x)).length)};
  }
  // Same token-equivalence relation under both alphabets: common permutation
  // feasibility depends only on equality, not numeric labels.
  const tokens=grid.pages.flatMap(p=>p.tokens);
  for(const alphabet of [grid.alphabet.replace('f',''),grid.alphabet]) {
    const distinct=new Set(tokens), decoded=new Set([...distinct].map(t=>alphabet.length*alphabet.indexOf(t[0])+alphabet.indexOf(t[1])));
    check(distinct.size===decoded.size,'noninjective token reading');
  }
  return {plants,toy:{trials:toy.length,feasible:toy.filter(Boolean).length},originals};
}

console.log(JSON.stringify(run(JSON.parse(fs.readFileSync("resources/liber-primus/lp2-grid-256.json", "utf8"))), null, 2));
