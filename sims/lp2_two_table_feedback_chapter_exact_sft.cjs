"use strict";
/** Original-source chapter-specific two-table search. Node22 on Windows.
 * Run all nine frozen contradiction witnesses, or partition the opening
 * search via ROOT_START/ROOT_END. No statistical or beam pruning.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {parseSharedCorpus,physicalLP2Page}=require("./lp2_word_pages.cjs");
const {prepare,solve}=require("./gp29_two_table_constraint_search.cjs");
const read=f=>fs.readFileSync(path.join(__dirname,"..",f),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const glyph=new Map(gp.runes.map((r,i)=>[r,i]));
const layout=parseSharedCorpus();
const seq=layout.words.map((w,index)=>({C:[...w.runes].map(r=>glyph.get(r)),
  index,start:physicalLP2Page(w.startPage),end:physicalLP2Page(w.endPage)}));
assert.equal(seq.length,2896);
assert.deepEqual(seq.flatMap(w=>w.C),gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices));
const trans=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
const dict=new Map();
for(const f of ["shakespeare_first300k.txt","emerson_essays_2944.txt","gibran_prophet_58585.txt"]){
  for(const original of read("resources/control/"+f).toUpperCase().match(/[A-Z]+/g)||[]){
    let w=original.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
    const p=[];
    while(w.length){const t=trans.find(t=>w.startsWith(t.t));assert(t);p.push(t.i);w=w.slice(t.t.length)}
    if(!dict.has(p.join(",")))dict.set(p.join(","),{p,original});
  }
}
assert.equal(dict.size,12231);
const by=Array.from({length:30},()=>[]);
for(const w of dict.values())if(w.p.length<30)by[w.p.length].push(w);
const witnesses=[
  [[0,2],[13,5,155,90,131,147,157]],
  [[3,7],[167,406,376,189]],
  [[8,14],[754,631,637]],
  [[15,22],[833,874,871,1220]],
  [[23,26],[1353,1341,1409,1337,1254]],
  [[27,32],[1476,1458,1498,1554]],
  [[33,39],[1891,2089,1916,1997]],
  [[40,53],[2341,2752,2534]],
  [[54,55],[2886,2879,2877,2844,2831,2848]]
];
const partition=process.env.ROOT_START!==undefined||process.env.ROOT_END!==undefined;
const result=[];
for(const [range,indices] of (partition?witnesses.slice(0,1):witnesses)){
  const rows=indices.map(i=>seq[i]);
  assert(rows.every(w=>w.start>=range[0]&&w.end<=range[1]));
  const prepared=prepare(rows,by);
  assert.deepEqual(prepared.map(r=>r.index),indices);
  const search=solve(prepared,partition?{start:Number(process.env.ROOT_START??0),
    end:Number(process.env.ROOT_END??prepared[0].cands.length)}:{});
  assert.equal(search.solutions.length,0);
  assert.equal(search.completed,search.end);
  assert.equal(search.timedOut,false);
  result.push({range,...search});
}
console.log(JSON.stringify(result,null,2));
