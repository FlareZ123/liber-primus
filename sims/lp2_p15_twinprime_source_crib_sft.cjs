"use strict";
/** Finite original-source p15 known-plaintext clue test. Node22/CJS Windows SFT. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const base=path.join(__dirname,"..","resources","liber-primus");
const c=JSON.parse(fs.readFileSync(path.join(base,"lp2-corpus.json"),"utf8"));
const ink=JSON.parse(fs.readFileSync(path.join(base,"lp2-ink-annotations.json"),"utf8"));
const title=c.pages[15].indices.slice(0,9);
assert.deepEqual(title,[0,1,20,19,24,28,26,22,24]);
assert.deepEqual(ink.pages.find(p=>p.page===15).red_spans.map(s=>[s.start,s.length]),[[0,9],[9,11]]);
const phi=x=>((x%29)+29)%29;
const fib=[0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987];
const primes=[2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817];
const printed=primes.map(v=>Math.abs(3301-v));
const grid=[[3258,3222,3152,3038],[3278,3299,3298,2838],[3288,3294,3296,2472],[4516,1206,708,1820]];
const route=[[1,1],[1,2],[2,2],[2,1],[2,0],[1,0],[0,0],[0,1],[0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0]];
assert.deepEqual(route.map(([r,s])=>grid[r][s]),printed);
const tokens=c.translit.map((g,i)=>[g,i]).sort((a,b)=>b[0].length-a[0].length);
function runes(w){
 const t=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
 const out=[];
 for(let j=0;j<t.length;){
  const found=tokens.find(([g])=>t.startsWith(g,j));
  assert.ok(found,"Unencodable word "+w);
  out.push(found[1]); j+=found[0].length;
 }
 return out;
}
function scan(target,values){
 let best=0,exact=0;
 for(let reverse=0;reverse<2;reverse++){
  const sequence=reverse?[...values].reverse():values;
  for(let start=0;start<=sequence.length-target.length;start++){
   for(const sign of [-1,1])for(let shift=0;shift<29;shift++){
    const match=target.filter((k,i)=>phi(sign*sequence[start+i]+shift)===k).length;
    best=Math.max(best,match);
    if(match===target.length)exact++;
   }
  }
 }
 return {best_matching_positions:best,exact_nine_matches:exact};
}
const sources=[["Fibonacci",fib],["one-based prime ranks",fib.map(n=>n+1)],
 ["selected primes",primes],["prime totients",primes.map(n=>n-1)],
 ["source-printed absolute complements",printed]];
for(const [name,source] of sources){
 const plant=source.slice(4,13).map(n=>phi(-n+17));
 assert.equal(scan(plant,source).exact_nine_matches>0,true,name+" positive plant");
}
const phrases=["TWIN PRIME","NEXT PRIME","LIES EMPTY","THEIR MEANING"];
const results=phrases.map(phrase=>{
 const plaintext=phrase.split(" ").flatMap(runes);
 assert.equal(plaintext.length,9);
 const key=title.map((x,i)=>phi(x-plaintext[i]));
 const tested=sources.map(([source,values])=>({source,...scan(key,values)}));
 return {phrase,plaintext_gp29:plaintext,required_key_gp29:key,
   required_key_sum_mod29:phi(key.reduce((a,b)=>a+b,0)),tested};
});
assert.deepEqual(results[0].required_key_gp29,[13,23,10,10,11,24,16,3,6]);
assert.equal(results[0].required_key_sum_mod29,0);
assert.equal(fib.slice(0,9).reduce((a,b)=>a+b,0),87);
assert.ok(results.every(a=>a.tested.every(b=>b.exact_nine_matches===0)));
console.log(JSON.stringify({status:"Boun\-ded negative; no unknown LP2 plaintext or true key",
 original_p15_title:title,red_span_lengths:[9,11],source_grid:grid,
 candidate:"TWIN PRIME (red 3299 is 3301's twin prime), unproven plaintext",
 compared_2016_source_candidates:["LIES EMPTY","THEIR MEANING"],
 tested_windows_per_source_per_candidate:928,planted_sources_passed:5,
 results},null,2));
