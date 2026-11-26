"use strict";
// Agent33: reproducible q13 three-phase shared-clock relaxation witness.
// Usage: node sims/lp2_q13_three_phase_rare_witness.cjs [repository-root]
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=process.argv[2]||path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const prior=JSON.parse(read("im-results/lp2-outer-fhold-reference-output.json")).bounds;
const C=corpus.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
const q=13,h=0,n=C.length,phases=[0,1,2];
let hash=2166136261;for(const c of C)hash=Math.imul(hash^c,16777619)>>>0;
assert.equal(n,3008);assert.equal(hash,1862123327);
const sets=[[0,6,8,9,10],[0,4,5,12,20],[0,5,7,12,14]];
const mask="01101001001111111111011001011110101111001010111011111111010011111110101101111011111000001111111110010011100100110111000111101";
const rows=Array.from({length:q},()=>Array(29).fill(0));let s=3,j=0;
for(const c of C){if(c===h&&mask[j++]==="1")continue;rows[s][c]++;s=(s+1)%q}
assert.equal(j,mask.length);const costs=sets.map((S,p)=>S.reduce((v,x)=>v+rows[p][x],0));
assert.deepEqual(costs,[2,4,0]);
const selected=Array.from({length:q},(_,p)=>new Set(sets[p]||[]));
// Exact fixed-set, all-start, all-hold-history dynamic program.
let dp=Array(q).fill(0);
for(const c of C){const next=Array(q).fill(Infinity);for(let p=0;p<q;p++){
 if(c===h)next[p]=Math.min(next[p],dp[p]);
 next[(p+1)%q]=Math.min(next[(p+1)%q],dp[p]+Number(selected[p].has(c)));
}dp=next}
assert.equal(Math.min(...dp),6);
function encode(t){
 const dict=corpus.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length),out=[];
 for(let w of t.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
 while(w.length){const a=dict.find(x=>w.startsWith(x[0]));assert(a,w);out.push(a[1]);w=w.slice(a[0].length)}}
 return out;
}
function body(s,a,b){const i=s.indexOf(a),j=s.indexOf(b);assert(i>=0&&j>i);return s.slice(i,j)}
const sources=[["Gibran",body(read("resources/control/gibran_prophet_58585.txt"),"Almustafa, the{7} chosen","End of the Project Gutenberg EBook of The Prophet")],["Shakespeare",read("resources/control/shakespeare_first300k.txt")],["Emerson",body(read("resources/control/emerson_essays_2944.txt"),"THERE is one mind","*** END OF THIS PROJECT GUTENBERG EBOOK")]];
const donors=sources.map(([name,t])=>{const v=encode(t),H=Array(29).fill(0);for(let i=0;i<n;i++)H[v[i]]++;let eligible=0,maxRare=-1,minRare=Infinity;
 for(let i=0;i<=v.length-n;i++){
  if(prior.some(b=>H[0]<=b[0]&&H[18]<=b[2])){eligible++;const R=H.slice(1).sort((a,b)=>a-b).slice(0,4).reduce((a,b)=>a+b,0);maxRare=Math.max(maxRare,R);minRare=Math.min(minRare,R)}
  if(i<v.length-n){H[v[i]]--;H[v[i+n]]++}
 }return {name,windows:v.length-n+1,eligible,minRare,maxRare}});
assert.deepEqual(donors.map(x=>[x.eligible,x.maxRare]),[[13335,7],[55210,8],[14140,12]]);
console.log(JSON.stringify({q,h,phases,n,hash,sets,start:3,mask,holds:mask.split("1").length-1,costs,fixedSetMinimum:Math.min(...dp),donors},null,2));
