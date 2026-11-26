"use strict";
const fs=require("node:fs");
function run(corpus,sources){
const map={"α":[24],"β":[17],"γ":[6],"δ":[23],"ε":[18],"ζ":[15],"η":[18],"θ":[2],"ι":[10],"κ":[5],"λ":[20],"μ":[19],"ν":[9],"ξ":[14],"ο":[3],"π":[13],"ρ":[4],"σ":[15],"ς":[15],"τ":[16],"υ":[1],"φ":[0],"χ":[5,8],"ψ":[13,15],"ω":[3]};
const m=x=>(x%29+29)%29,A=new Set(Object.values(map).flat()),allowed=x=>A.has(x);
const books=sources.map(({p,sha,content})=>{let words=[];for(let l of content.split(/\r?\n/)){if(!/^\d+:\d+\s/.test(l))continue;let w=l.replace(/^\d+:\d+\s+/,"").replace(/\[\d+:\d+\]/g," ").trim().split(/\s+/);for(let x of w){let y=x.normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().replace(/[·.,;:!?()[\]'’\-]/g,"");if(!y)continue;if([...y].some(c=>!map[c]))throw Error("Unmapped: "+y);words.push([...y].flatMap(c=>map[c]));}}return {p,sha,words}});
const all=books.flatMap(b=>b.words), length=all.map(w=>w.length),flat=all.flat(),summary={words:all.length,runes:flat.length,two:length.filter(n=>n===2).length,alphabet:[...A].sort((a,b)=>a-b),counts:Array.from({length:29},(_,i)=>flat.filter(x=>x===i).length)};
let v=length.slice(0,2896).filter(x=>x===2).length,min=v,max=v;for(let i=2896;i<length.length;i++){v+=(length[i]===2)-(length[i-2896]===2);min=Math.min(min,v);max=Math.max(max,v)}summary.windowTwo={n:length.length-2896+1,min,max};
const prime=[];for(let x=2;prime.length<7000;x++){let ok=true;for(let d=2;d*d<=x;d++)if(x%d===0){ok=false;break}if(ok)prime.push((x-1)%29)}
const keys=[["WELCOME",[23,10,1,10,9,10,16,26]],["KOAN",[0,10,4,0,1,19,0,18,4,18,9,0,18]]];
function invert(C,K,mode,sign){
 if(mode==="Fhold"){let states=new Map([[0,null]]),peak=1;for(let i=0;i<C.length;i++){const c=C[i],next=new Map();for(const [j,t] of states){if(c===0&&!next.has(j))next.set(j,{p:0,t});const p=m(c-sign*K(j));if(p!==0&&allowed(p)&&!next.has(j+1))next.set(j+1,{p,t})}if(!next.size)return {pass:false,prefix:i,peak};states=next;peak=Math.max(peak,states.size)}let t=states.values().next().value,P=[];while(t){P.push(t.p);t=t.t}return {pass:true,prefix:C.length,P:P.reverse(),peak}}
 const nodes=new Array(C.length+1);nodes[0]={t:null};let longest=0;for(let i=0;i<C.length;i++){if(!nodes[i])continue;longest=i;let p=m(C[i]-sign*K(i));if(allowed(p)&&!nodes[i+1])nodes[i+1]={p,t:nodes[i],start:i,end:i+1};if(mode==="VNULL"&&i&&C[i]!==C[i-1]){p=m(C[i-1]-sign*K(i));if(!allowed(p))continue;for(let j=i+1;j<C.length;j++){let x=m(p+sign*K(j));if(x===C[j]){if(!nodes[j+1])nodes[j+1]={p,t:nodes[i],start:i,end:j+1};break}if(x!==C[j-1]||C[j]===C[j-1])break;}}}if(!nodes[C.length])return {pass:false,prefix:longest};let t=nodes.at(-1),P=[];while(t.t){P.push(t.p);t=t.t}return {pass:true,prefix:C.length,P:P.reverse()};
}
const rows=[];const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
for(const [a,b] of ranges){const C=corpus.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices??[]);for(let mode of ["ordinary","Fhold","VNULL"]){let counts={},best={},survivors=[];for(let sign of [1,-1])for(let [name,arr] of [...keys,["prime-1",prime]]){const n=name==="prime-1"?3302:arr.length;let tag=name+":"+sign;counts[tag]=0;best[tag]=0;for(let o=0;o<n;o++){const K=i=>name==="prime-1"?arr[i+o]:arr[(i+o)%arr.length];const z=invert(C,K,mode,sign);counts[tag]+=z.pass?1:0;best[tag]=Math.max(best[tag],z.prefix);if(z.pass)survivors.push({name,o,sign,P:z.P})}}rows.push({a,b,n:C.length,mode,counts,best,survivors})}}
let seed=0x49fe2a;function ri(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return Math.floor((seed>>>0)/4294967296*n)}
const donor=books[2].words.flat(),controls=[];for(let mode of ["ordinary","Fhold","VNULL"]){let tested=0,passed=0,nulls=0;for(let j=0;j<80;j++){let at=ri(donor.length-240),P=donor.slice(at,at+240),o=ri(3302),sign=ri(2)?1:-1,K=i=>prime[o+i],C=[],k=0;for(let p of P){if(mode==="Fhold"&&p===0){C.push(0);continue}for(;;){let c=m(p+sign*K(k++));if(mode==="VNULL"&&C.length&&c===C.at(-1)&&ri(5)!==0){let z=ri(28);if(z>=c)z++;C.push(z);nulls++;continue}C.push(c);break}}let d=invert(C,K,mode,sign);tested++;passed+=d.pass?1:0}controls.push({mode,tested,passed,nulls})}
return {summary,books:books.map(b=>({p:b.p,sha:b.sha,n:b.words.length,runes:b.words.reduce((s,w)=>s+w.length,0)})),controls,rows};
}
const base="resources/control/greek-stephens";
const files=[{"p":"textonly/unicode/JOH.txt","sha":"507a5a1a9e76e940d4b1365434dc343e68863bc5"},{"p":"textonly/unicode/AC.txt","sha":"0f0622229f8f8dd94515ec66cd8333ffe6787f13"},{"p":"textonly/unicode/RO.txt","sha":"59149159304ec3dff7d1c9fb8ddcfdbbb2c27120"}];
const sources=files.map(({p,sha})=>({p,sha,content:fs.readFileSync(base+"/"+p.split("/").pop(),"utf8")}));
console.log(JSON.stringify(run(JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8")),sources),null,2));
