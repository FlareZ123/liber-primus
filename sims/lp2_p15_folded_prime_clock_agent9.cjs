// Exact source-indexed folded-prime transfer. No external dependencies.
// Run from repository root: node sims/lp2_p15_folded_prime_clock_agent9.cjs
const fs = require("node:fs");
function experiment(d){
const mod=x=>((x%29)+29)%29;
const primes=[];for(let p=2;primes.length<4000;p++){if(primes.every(q=>q*q>p||p%q!==0))primes.push(p)}
const origins=[0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987];
const nums=[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516];
if(origins.some((x,i)=>Math.abs(3301-primes[x])!==nums[i]))throw Error("spiral check");
const enc=s=>s.split(" ").flatMap(w=>{const a=[];while(w){const t=d.translit.map((x,i)=>[x,i]).sort((x,y)=>y[0].length-x[0].length).find(([x])=>w.startsWith(x));if(!t)throw Error(w);a.push(t[1]);w=w.slice(t[0].length)}return a});
const P=enc("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
const native=d.pages[57].indices;
const counts=Array.from({length:30},()=>Array(29).fill(.25));let prev=29;for(const x of native){counts[prev][x]++;prev=x}
const logs=counts.map(row=>{const t=row.reduce((a,b)=>a+b,0);return row.map(x=>Math.log(x/t))});
const score=p=>p.reduce((a,x,i)=>a+logs[i?p[i-1]:29][x],0)/p.length;
function forward(p,key,hold){let j=0;return p.map(x=>hold&&x===0?0:mod(x+key[j++]))}
function reach(c,key){let states=new Set([0]);for(let i=0;i<c.length;i++){const next=new Set();for(const j of states){if(c[i]===0)next.add(j);if(mod(c[i]-key[j])!==0)next.add(j+1)}if(!next.size)return {length:i,terminalStates:0};states=next}return {length:c.length,terminalStates:states.size}}
function bestInverse(c,key){let states=new Map([["0,29",{j:0,last:29,s:0,p:""}]]);for(const y of c){const next=new Map();for(const st of states.values()){const add=(j,x)=>{const k=j+","+x,s=st.s+logs[st.last][x],old=next.get(k);if(!old||s>old.s)next.set(k,{j,last:x,s,p:st.p+String.fromCharCode(65+x)})};if(y===0)add(st.j,0);const x=mod(y-key[st.j]);if(x!==0)add(st.j+1,x)}if(!next.size)return null;states=next}const st=[...states.values()].sort((a,b)=>b.s-a.s)[0];return [...st.p].map(x=>x.charCodeAt(0)-65)}
const control=forward(P,primes.map(p=>mod(p-1)),true);if(P.length!==85||control.some((x,i)=>x!==d.pages[56].indices[i]))throw Error("native p56 control mismatch");
const start=d.pages.slice(16,23).flatMap(p=>p.indices);
const frames={p16:start,p15black:d.pages[15].indices.slice(20).concat(start)};
const rows=[];
for(const [frame,c] of Object.entries(frames))for(const origin of origins)for(const delta of [0,1])for(const sign of [1,-1]){
 const key=primes.slice(origin).map(p=>mod(sign*(Math.abs(3301-p)-delta)));
 const donor=Array.from({length:c.length},(_,i)=>P[i%P.length]);
 const plant=forward(donor,key,true),pr=reach(plant,key),got=reach(c,key);
 const ordinary=c.map((x,i)=>mod(x-key[i]));if(!forward(ordinary,key,false).every((x,i)=>x===c[i]))throw Error("ordinary replay");
 if(pr.length!==c.length)throw Error("true control rejected");
 const p=got.terminalStates?bestInverse(c,key):null;
 if(p&&!forward(p,key,true).every((x,i)=>x===c[i]))throw Error("held replay");
 rows.push({frame,length:c.length,origin,delta,sign,Fhold:got,plantTerminalStates:pr.terminalStates,ordinaryScore:score(ordinary),ordinarySample:ordinary.slice(0,80).map(x=>d.translit[x]).join(" "),FholdScore:p?score(p):null,FholdSample:p?p.slice(0,80).map(x=>d.translit[x]).join(" "):null,controlScore:score(donor)})
}
const summary={nativeReplay:85,gridCells:16,foldPrimeIndex:primes.indexOf(3301),origins,rows:rows.length,originalFholdComplete:rows.filter(x=>x.Fhold.terminalStates).length,plantComplete:rows.length,maxPrefix:Math.max(...rows.map(x=>x.Fhold.length)),perFrame:Object.fromEntries(Object.keys(frames).map(f=>{const x=rows.filter(r=>r.frame===f);return [f,{length:frames[f].length,maxPrefix:Math.max(...x.map(r=>r.Fhold.length)),ordinaryBest:Math.max(...x.map(r=>r.ordinaryScore)),ordinaryWorst:Math.min(...x.map(r=>r.ordinaryScore)),controlScore:x[0].controlScore}]})),longest:rows.sort((a,b)=>b.Fhold.length-a.Fhold.length).slice(0,4),bestOrdinary:rows.slice().sort((a,b)=>b.ordinaryScore-a.ordinaryScore).slice(0,2)};
return {summary,rows};
}
const d=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
console.log(JSON.stringify(experiment(d),null,2));
