"use strict";
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
const inputs=files.map(p=>{const b=fs.readFileSync(path.resolve(__dirname,"..",p));return {path:p,sha:crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex"),source:b.toString("utf8")}});
function experiment(inputs){
const gp=JSON.parse(inputs[0].source),native=JSON.parse(inputs[1].source),q=gp.prime,mod=x=>(x%29+29)%29;
const assert=(x,m)=>{if(!x)throw Error(m)};
const idx=new Map(gp.runes.map((x,i)=>[x,i]));
const sections=native.sections.map(s=>({name:s.name,p:[...s.source_text].filter(c=>/[\u16a0-\u16ff]/u.test(c)).map(c=>{assert(idx.has(c),"unknown rune");return idx.get(c)})}));
const c=gp.pages.slice(40,54).flatMap(p=>p.indices);assert(c.length===3008,"original framing");
const limit=1+Math.max(...q)*Math.max(c.length,...sections.map(s=>s.p.length));
const phi=Uint32Array.from({length:limit+1},(_,i)=>i);
for(let j=2;j<=limit;j++)if(phi[j]===j)for(let k=j;k<=limit;k+=j)phi[k]-=phi[k]/j;
function encode(p,hold=true){let s=1;const c=[],states=[s];for(const x of p){if(hold&&x===0)c.push(0);else{c.push(mod(x+phi[s]));s+=q[x]}states.push(s)}return {c,states}}
function edges(x,s){const e=[];if(x===0)e.push([0,s]);const p=mod(x-phi[s]);if(p)e.push([p,s+q[p]]);return e}
function reach(c,truth=null,store=false){let S=new Map([[1,1n]]),dead=null,peak=1,cert=[],history=store?[S]:null;for(let i=0;i<c.length;i++){const T=new Map();for(const [s,n] of S)for(const [,t] of edges(c[i],s))T.set(t,(T.get(t)??0n)+n);if(truth)assert(T.has(truth.states[i+1]),"lost true state at "+i);peak=Math.max(peak,T.size);const before=S;S=T;if(store)history.push(S);cert.push({consumed:i+1,states:S.size,paths:[...S.values()].reduce((a,b)=>a+b,0n).toString()});if(!S.size){dead=i;return {dead,peak,cert,predecessors:[...before].map(([s,n])=>({s,phi:phi[s],shift:phi[s]%29,paths:n.toString()})),terminal:[],pathCount:"0",history}}}
return {dead,peak,cert,terminal:[...S.keys()].sort((a,b)=>a-b),pathCount:[...S.values()].reduce((a,b)=>a+b,0n).toString(),history}}
function witness(c,r){let s=r.terminal[0];const p=[];for(let i=c.length-1;i>=0;i--){let chosen;for(const st of r.history[i].keys()){for(const [x,t] of edges(c[i],st))if(t===s){chosen=[x,st];break}if(chosen)break}assert(chosen,"missing predecessor");p.push(chosen[0]);s=chosen[1]}p.reverse();assert(s===1&&encode(p).c.every((x,i)=>x===c[i]),"replay failed");return p}
const brute=new Map();for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let d=0;d<29;d++){const k=encode([a,b,d]).c.join(",");brute.set(k,(brute.get(k)??0)+1)}
for(const [k,n] of brute)assert(reach(k.split(",").map(Number)).pathCount===String(n),"three-symbol count mismatch");
const positives=[],wrongLaw=[];
for(const sec of sections){const t=encode(sec.p),rr=reach(t.c,t,true),w=witness(t.c,rr);positives.push({section:sec.name,n:sec.p.length,truthPreserved:sec.p.length,holds:sec.p.filter(x=>x===0).length,consumingZero:t.c.filter((x,i)=>x===0&&sec.p[i]!==0).length,peak:rr.peak,paths:rr.pathCount,selectedCorrect:w.filter((x,i)=>x===sec.p[i]).length});const w0=reach(encode(sec.p,false).c);wrongLaw.push({section:sec.name,dead:w0.dead,paths:w0.pathCount})}
const p56=sections.find(s=>s.name==="p56_an_end").p,pr=[];for(let x=2;pr.length<p56.length;x++)if(!pr.some(p=>p*p<=x&&x%p===0))pr.push(x);let j=0;const c56=p56.map(p=>p===0?0:mod(p+pr[j++]-1));assert(c56.every((x,i)=>x===gp.pages[56].indices[i]),"authentic p56 replay");
const orig=reach(c);const {history,...original}=orig;
const shadow=[15,8,24,23,3,7,15].reduce((a,p)=>a+q[p],0);assert(shadow===341,"Wisdom sum");
assert(orig.dead===83&&orig.predecessors.length===1&&orig.predecessors[0].s===4420&&phi[4420]===1536&&c[83]===28,"exact contradiction");
return {inputs:inputs.map(({path,sha})=>({path,sha})),limit,exhaustivePositiveCipherCases:brute.size,positiveSenderSequences:29**3,wisdomShadowsSum:shadow,positives,wrongLaw,actualP56:{n:p56.length,consumed:j,wrongReceiverDead:reach(c56).dead},original:{n:c.length,...original,nextCipher:c[orig.dead],prefix:c.slice(0,orig.dead+1)}};
}
console.log(JSON.stringify(experiment(inputs),null,2));
