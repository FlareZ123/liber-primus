"use strict";
const fs=require("node:fs");
const read=p=>fs.readFileSync(p,"utf8");
function experiment(corpus,gold,raw){
const A=corpus.runes, idx=new Map(A.map((x,i)=>[x,i])), extract=s=>[...s].filter(x=>idx.has(x)).map(x=>idx.get(x)), mod=x=>(x%29+29)%29;
const sources=gold.sections, cipher=raw.split("$").map(extract); cipher[7]=corpus.pages[56].indices;
const donor=Array.from(new Set(sources[4].source_text.split(/[^\u16a0-\u16ff]+/u).map(extract).filter(a=>a.length).map(a=>a.join(",")))).map(s=>s.split(",").map(Number));
const prime=[]; for(let x=2;prime.length<600;x++)if(prime.every(p=>p*p>x||x%p))prime.push(x);
const primeKey=prime.map(p=>mod(p-1));
const mapC=a=>a.map(x=>x===5?0:x);
const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
function replay(p,prog){
let j=0;return p.map(x=>{if(prog.kind==="identity")return x;if(prog.kind==="atbash")return 28-x;if(x===0)return 0;const k=prog.key[prog.kind==="prime"?j++:j++%prog.key.length];return mod(x+k);});
}
function inferMap(target){
return [1,5].filter(t=>t!==target).some(t=>{
const p=extract(sources[t].source_text);const c=cipher[t];return donor.some(w=>!eq(w,mapC(w))&&eq(replay(p,{kind:"word",key:mapC(w)}),c)&&!eq(replay(p,{kind:"word",key:w}),c));
});
}
function language(target){
const u=Array(29).fill(.1),b=Array.from({length:29},()=>Array(29).fill(.1)),t=Array.from({length:841},()=>Array(29).fill(.1));
for(let i=0;i<sources.length;i++)if(i!==target){let a=extract(sources[i].source_text);for(let j=0;j<a.length;j++){u[a[j]]++;if(j)b[a[j-1]][a[j]]++;if(j>1)t[a[j-2]*29+a[j-1]][a[j]]++;}}
const norm=a=>{const sum=a.reduce((s,x)=>s+x,0);return a.map(x=>Math.log(x/sum));};return {u:norm(u),b:b.map(norm),t:t.map(norm)};
}
function decode(c,prog,lm){
let states=new Map([["0,-1,-1",{j:0,a:-1,b:-1,s:0,parent:null,p:-1}]]);
for(const x of c){
const next=new Map();
for(const v of states.values()){
const put=(p,j)=>{let s=v.s+(v.b<0?lm.u[p]:v.a<0?lm.b[v.b][p]:lm.t[v.a*29+v.b][p]);const k=j+","+v.b+","+p;if(!next.has(k)||s>next.get(k).s)next.set(k,{j,a:v.b,b:p,s,parent:v,p});};
if(prog.kind==="identity")put(x,0);
else if(prog.kind==="atbash")put(28-x,0);
else {if(x===0)put(0,v.j);const p=mod(x-prog.key[v.j]);if(p!==0)put(p,prog.kind==="prime"?v.j+1:(v.j+1)%prog.key.length);}
}
states=next;if(!states.size)return null;
}
let best=null;for(const v of states.values())if(!best||v.s>best.s)best=v;
let p=[];for(let v=best;v.parent;v=v.parent)p.push(v.p);return {p:p.reverse(),score:best.s};
}
const results=[];
for(const target of [1,5,7]){
const mapped=inferMap(target),lm=language(target),c=cipher[target];
const programs=[{kind:"identity",name:"identity",bits:2},{kind:"atbash",name:"atbash",bits:2},{kind:"prime",name:"prime-1",key:primeKey,bits:2}];
const bits=2+Math.log2(donor.length)+(mapped?1:0);
for(const w of donor){programs.push({kind:"word",name:w.map(x=>A[x]).join(""),key:w,bits});if(mapped)programs.push({kind:"word",name:w.map(x=>A[x]).join("")+"|C→F",key:mapC(w),bits});}
const ranks=[];
for(const prog of programs){const d=decode(c,prog,lm);if(d){if(!eq(replay(d.p,prog),c))throw Error("replay");ranks.push({prog,...d,cost:-d.score+prog.bits*Math.LN2});}}
ranks.sort((a,b)=>a.cost-b.cost);
// Open target native comparator only after ranking and complete predictions.
const native=extract(sources[target].source_text);
const exact=programs.filter(p=>eq(replay(native,p),c));
const unique=new Set(programs.map(p=>p.kind==="word"?"word:"+p.key.join(","):p.kind));
const summarize=x=>({program:x.prog.name,key:x.prog.kind==="word"?x.prog.key:undefined,nats:x.cost,languageNats:-x.score,bits:x.prog.bits,exact:x.p.filter((p,i)=>p===native[i]).length,tail:x.p.slice(0,45).map(x=>A[x]).join("")});
results.push({target,name:sources[target].name,length:c.length,mapped,donorTypes:donor.length,programs:programs.length,distinctPrograms:unique.size,feasible:ranks.length,exactForwardPrograms:exact.map(p=>p.name),firstExactRank:ranks.findIndex(x=>eq(replay(native,x.prog),c))+1,top:ranks.slice(0,3).map(summarize)});
}
return results;
}
console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/transcriptions/lp1_wulfic_canonical.txt")),null,2));
