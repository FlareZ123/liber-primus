"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const {files,build,makeControl,domain}=require("./lp2_unknown_q8_group_anagram_exact_sft.cjs");
const raw=files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")),db=build(raw);
const results=JSON.parse(fs.readFileSync(path.join(__dirname,"../im-results/lp2-unknown-q8-group-anagram-exact.json"),"utf8"));
for(const r of results.filter(x=>x.plant)){
 assert.equal(r.candidates.length,1);
 const seed=Number(r.which),K=r.candidates[0].K,plant=makeControl(db,seed),rows=plant.rows,D=rows.map(x=>domain(x.C,K,db.multisets,false)),n=D.length,forward=[new Set([0,1,2,3,4,5,6,7])];
 for(const d of D)forward.push(new Set(d.filter(e=>forward.at(-1).has(e.s)).map(e=>e.t)));
 const backward=Array(n+1);backward[n]=forward[n];
 for(let i=n-1;i>=0;i--)backward[i]=new Set(D[i].filter(e=>forward[i].has(e.s)&&backward[i+1].has(e.t)).map(e=>e.s));
 let phase=[...backward[0]][0],holds=0,matching=0,unique=0,holdMatching=0,holdUnique=0,holdN=0;
 const viable=D.map((d,i)=>d.filter(e=>forward[i].has(e.s)&&backward[i+1].has(e.t)));
 for(let i=0;i<n;i++){
  const e=viable[i].find(x=>x.s===phase);assert(e);
  let C=[],s=phase;
  for(const p of e.arr){const v=p.charCodeAt(0)-65;if(!v){C.push(0);holds++;}else{C.push((v+K[s])%29);s=(s+1)&7;}}
  assert.deepEqual(C,rows[i].C);assert.equal(s,e.t);phase=s;
  const match=e.b===String.fromCharCode(...rows[i].P.slice().sort((a,b)=>a-b).map(x=>65+x));matching+=+match;
  const u=new Set(viable[i].flatMap(e=>e.words)).size===1;unique+=+u;
  if(rows[i].off+rows[i].C.length>12880){holdN++;holdMatching+=+match;holdUnique+=+u;}
 }
 console.log(JSON.stringify({seed,groups:n,exactReplay:rows.flatMap(x=>x.C).length,matchingBags:matching,uniqueWords:unique,holdN,holdMatching,holdUnique,holds}));
}
