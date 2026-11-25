"use strict";
const fs=require("node:fs"),path=require("node:path");
function run(A,L){
 const mod=x=>(x%29+29)%29, rows=L.slice(L.indexOf("272-138-")).split(/\r?\n/).slice(0,5).map(l=>l.replace(/\/$/,"").split("-"));
 if(rows.length!==5||rows.some(r=>r.length!==5))throw Error("square");
 const seq=r=>r.flat().filter(x=>!/^\d+$/.test(x)).join("").split("").map(x=>A.runes.indexOf(x));
 const tapes=[["row",seq(rows)],["column",seq(rows[0].map((_,i)=>rows.map(r=>r[i])))]];
 if(tapes.some(([,x])=>x.length!==76||x.some(v=>v<0)))throw Error("tape");
 function fit(P,C,q,add,cut){let m=Array.from({length:q},()=>new Map()),rev=Array.from({length:q},()=>new Map());for(let i=0;i<cut;i++){let j=i%q,k=add?0:P[i],v=add?mod(C[i]-P[i]):C[i];if(m[j].has(k)&&m[j].get(k).v!==v)return {conflict:[m[j].get(k).i,i,"function"]};if(!add&&rev[j].has(v)&&rev[j].get(v).p!==P[i])return {conflict:[rev[j].get(v).i,i,"injectivity"]};m[j].set(k,{v,i});rev[j].set(v,{p:P[i],i})}
 let known=0,correct=0,wrong=0,unknown=0;for(let i=cut;i<P.length;i++){let j=i%q,k=add?0:P[i];if(!m[j].has(k)){unknown++;continue}let v=add?mod(P[i]+m[j].get(k).v):m[j].get(k).v;known++;if(v===C[i])correct++;else wrong++}
 let logFreedom=0;if(!add)for(const a of m)for(let n=2;n<=29-a.size;n++)logFreedom+=Math.log10(n);return {known,correct,wrong,unknown,log10Freedom:logFreedom}}
 const page=n=>A.pages.find(p=>p.page===n).indices, targets=[["p55",page(55)],["p53-first",page(53).slice(0,76)],["p53-last",page(53).slice(-76)]];
 const data=tapes.flatMap(([order,P])=>targets.map(([target,C])=>{let rows=[];for(let q=1;q<=32;q++)for(let add of [false,true]){let prefix=fit(P,C,q,add,50),full=fit(P,C,q,add,76);rows.push({q,add,prefix,full})}return {order,target,rows}}));
 const controls=[];for(const [name,P] of [...tapes,["p57",page(57).slice(0,76)]])for(let q of [8,13,25,32])for(let add of [false,true]){let C=P.map((p,i)=>mod(p*(add?1:1+(i%q*5+1)%28)+(7*(i%q)**2+11*(i%q)+3)%29));let x=fit(P,C,q,add,50);if(x.conflict||x.wrong)throw Error("control");controls.push({name,q,add,...x})}
 return {data,controls}
}
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/transcriptions/lp1_wulfic_canonical.txt")),null,2));
