#!/usr/bin/env node
"use strict";
/*
  p50 byte-support equivalence: radix60 vs drop-f radix59.
  Proves that byte-randomness / row-without-replacement arguments cannot
  select between the two canonical raw-token interpretations.
*/
const fs=require("node:fs"),path=require("node:path");
const src=path.resolve(__dirname,"../resources/liber-primus/base60-grid.json");
const d=JSON.parse(fs.readFileSync(src,"utf8")),A=d.alphabet,B=A.replace("f","");
if(A.length!==60||B.length!==59||A.indexOf("f")!==41)throw Error("alphabet regression");
function support(alpha,base){
  const s=new Set();
  for(let v=0;v<256;v++)s.add(alpha[Math.floor(v/base)]+alpha[v%base]);
  return s;
}
function dec(t,alpha,base){
  const a=alpha.indexOf(t[0]),b=alpha.indexOf(t[1]);
  if(a<0||b<0)throw Error("digit outside alphabet: "+t);
  return a*base+b;
}
function hist(a){
  const m=new Map();for(const x of a)m.set(x,(m.get(x)||0)+1);
  const multiplicities={};for(const n of m.values())multiplicities[n]=(multiplicities[n]||0)+1;
  return {distinct:m.size,multiplicities,min:Math.min(...m.keys()),max:Math.max(...m.keys())};
}
const S60=support(A,60),S59=support(B,59);
const intersection=[...S60].filter(x=>S59.has(x)).sort();
const only60=[...S60].filter(x=>!S59.has(x)).sort();
const only59=[...S59].filter(x=>!S60.has(x)).sort();
const raw=d.rows.flat(),v60=raw.map(t=>dec(t,A,60)),v59=raw.map(t=>dec(t,B,59));
const rows60=d.rows.map(r=>r.map(t=>dec(t,A,60))),rows59=d.rows.map(r=>r.map(t=>dec(t,B,59)));
const rowDistinct=rows=>rows.every(r=>new Set(r).size===8);
const outside=raw.filter(t=>!S60.has(t)||!S59.has(t));
const counts=t=>raw.filter(x=>x===t).length;
const iidLogLike=raw.length*Math.log(1/256);
const rowSampleLogLike=32*Array.from({length:8},(_,i)=>Math.log(1/(256-i))).reduce((a,b)=>a+b,0);
const result={
  schema:1,
  source:"resources/liber-primus/base60-grid.json",
  hypotheses:{
    radix60:{base:60,alphabet:A,byte_support_size:S60.size},
    drop_f_radix59:{base:59,alphabet:B,byte_support_size:S59.size}
  },
  support:{
    intersection_size:intersection.length,
    radix60_only:only60,
    radix59_only:only59,
    observed_outside_intersection:outside,
    exclusive_token_counts:Object.fromEntries([...only60,...only59].map(t=>[t,counts(t)]))
  },
  observed:{
    tokens:raw.length,
    row_distinct_radix60:rowDistinct(rows60),
    row_distinct_radix59:rowDistinct(rows59),
    radix60_histogram:hist(v60),
    radix59_histogram:hist(v59)
  },
  likelihood:{
    iid_uniform_bytes:{log_likelihood_radix60:iidLogLike,log_likelihood_radix59:iidLogLike,log_bayes_factor_60_over_59:0},
    uniform_row_sample_without_replacement:{log_likelihood_radix60:rowSampleLogLike,log_likelihood_radix59:rowSampleLogLike,log_bayes_factor_60_over_59:0}
  },
  conclusion:"All 256 observed raw tokens lie in the 252-token support intersection. Uniform-byte, uniform row-sample, and label-symmetric histogram evidence cannot select radix60 over drop-f radix59. A selector must use independently justified numeric semantics or an external serialization rule."
};
if(intersection.length!==252||JSON.stringify(only60)!==JSON.stringify(["0f","1f","2f","3f"])||JSON.stringify(only59)!==JSON.stringify(["4G","4H","4I","4J"]))throw Error("support regression");
if(outside.length||!rowDistinct(rows60)||!rowDistinct(rows59))throw Error("observation regression");
if(hist(v60).distinct!==161||hist(v59).distinct!==161)throw Error("histogram regression");
process.stdout.write(JSON.stringify(result,null,2)+"\n");
