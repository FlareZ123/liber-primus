"use strict";
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
const root=path.resolve(__dirname,"..");
const inputs=files.map(p=>{const b=fs.readFileSync(path.join(root,p));return {path:p,sha:crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex"),source:b.toString("utf8")}});
function experiment(inputs){
 const gp=JSON.parse(inputs[0].source),native=JSON.parse(inputs[1].source),q=gp.prime,mod=x=>(x%29+29)%29,assert=(x,m)=>{if(!x)throw Error(m)};
 const idx=new Map(gp.runes.map((x,i)=>[x,i])),sections=native.sections.map(s=>({name:s.name,p:[...s.source_text].filter(c=>/[\u16a0-\u16ff]/u.test(c)).map(c=>{assert(idx.has(c),"rune");return idx.get(c)})}));
 const shadow=[15,8,24,23,3,7,15].reduce((a,p)=>a+q[p],0);assert(shadow===341,"Wisdom SHADOWS sum");
 function encode(p,initial,hold=true){let s=initial;const c=[],states=[s];for(const x of p){if(hold&&x===0)c.push(0);else{c.push(mod(x+s));s=mod(s+q[x]);}states.push(s)}return {c,states}}
 function edges(c,s){const e=[];if(c===0)e.push([0,s]);const p=mod(c-s);if(p!==0)e.push([p,mod(s+q[p])]);return e}
 function reach(c,initials,truth=null){let S=initials.reduce((a,s)=>a|(1<<s),0),masks=[S],dead=null;
 for(let i=0;i<c.length;i++){let T=0;for(let s=0;s<29;s++)if(S&(1<<s))for(const [,next] of edges(c[i],s))T|=1<<next;S=T;masks.push(S);if(truth)assert(S&(1<<truth.states[i+1]),"true state lost at "+i);if(!S){dead=i;break}}
 return {dead,masks,terminal:S}}
 function members(mask){return Array.from({length:29},(_,s)=>s).filter(s=>mask&(1<<s))}
 function exactCount(c,initial){let S=Array(29).fill(0n);S[initial]=1n;for(const x of c){const T=Array(29).fill(0n);for(let s=0;s<29;s++)if(S[s])for(const [,n] of edges(x,s))T[n]+=S[s];S=T;}return S.reduce((a,b)=>a+b,0n)}
 function witness(c,initial){const r=reach(c,[initial]);if(r.dead!==null)return null;let state=members(r.terminal)[0],p=[];for(let i=c.length-1;i>=0;i--){let chosen=null;for(const s of members(r.masks[i])){for(const [x,n] of edges(c[i],s))if(n===state){chosen=[s,x];break}if(chosen)break}assert(chosen,"missing predecessor");[state]=chosen;p.push(chosen[1]);}p.reverse();assert(state===initial&&encode(p,initial).c.every((x,i)=>x===c[i]),"replay");return p}
 // Native F hold versus the earlier all-consuming sender: explicit counterexample.
 const branch=edges(0,1);assert(branch.length===2&&branch[0][0]===0&&branch[1][0]===28,"F collision");
 assert(edges(1,1).length===0,"nonzero C equal to state is impossible");
 assert(encode([0],1,true).c[0]===0&&encode([0],1,false).c[0]===1,"distinct F semantics");
 // All-path dynamic count and Boolean reachability against complete 4-symbol sender enumeration.
 let exhaustive=0;for(const s of [0,1,7]){const m=new Map();for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let d=0;d<29;d++){const c=encode([a,b,d],s).c.join(",");m.set(c,(m.get(c)??0)+1)}for(const [k,n] of m){const c=k.split(",").map(Number);assert(exactCount(c,s)===BigInt(n),"count regression");exhaustive++}}
 const positives=[],alternatives=[];
 for(const sec of sections)for(const s of [0,7,19]){
  const truth=encode(sec.p,s),r=reach(truth.c,[s],truth);assert(r.dead===null,"native truth invalid");const w=witness(truth.c,s);assert(w,"missing witness");
  const ivs=Array.from({length:29},(_,iv)=>iv).filter(iv=>reach(truth.c,[iv]).dead===null);
  positives.push({section:sec.name,n:sec.p.length,initial:s,holds:sec.p.filter(x=>x===0).length,consumingZero:truth.c.filter((x,i)=>x===0&&sec.p[i]!==0).length,legalIVs:ivs,pathCountAtTrueIV:exactCount(truth.c,s).toString(),witnessCorrect:w.filter((x,i)=>x===sec.p[i]).length,truthPreserved:sec.p.length});
  const wrong=encode(sec.p,s,false).c,alt=reach(wrong,Array.from({length:29},(_,i)=>i));alternatives.push({section:sec.name,initial:s,n:wrong.length,dead:alt.dead,legal:alt.dead===null});
 }
 // Authenticate literal F hold separately by replaying the actual p56 prime-clock cipher.
 const p56=sections.find(s=>s.name==="p56_an_end").p,pr=[];for(let x=2;pr.length<p56.length;x++)if(!pr.some(p=>p*p<=x&&x%p===0))pr.push(x);
 let j=0;const c56=p56.map(p=>p===0?0:mod(p+pr[j++]-1));assert(c56.every((x,i)=>x===gp.pages[56].indices[i]),"p56 actual replay");
 const wrongP56=reach(c56,Array.from({length:29},(_,i)=>i));
 const c=gp.pages.slice(40,54).flatMap(p=>p.indices);assert(c.length===3008,"original p40-53");
 const original=Array.from({length:29},(_,s)=>{const r=reach(c,[s]);return {s,dead:r.dead,terminal:members(r.terminal),maxReachable:Math.max(...r.masks.map(x=>members(x).length))}});
 const union=reach(c,Array.from({length:29},(_,i)=>i));assert(original.every(x=>x.dead!==null)&&union.dead===102,"original exact obstruction");
 const cert=union.masks.map((m,i)=>({consumed:i,states:members(m),nextCipher:i<c.length?c[i]:null}));
 const before=cert.at(-2),after=cert.at(-1);assert(before.states.length===1&&before.states[0]===c[102]&&c[102]!==0&&after.states.length===0,"last transition witness");
 return {inputs:inputs.map(({path,sha})=>({path,sha})),wisdomShadowsSum:shadow,fCollision:branch,exhaustivePositiveCipherCases:exhaustive,positives,alternatives,actualP56:{n:p56.length,consumed:j,replayed:p56.length,underWrongRecurrenceDead:wrongP56.dead},original:{n:c.length,allIVs:original,unionDead:union.dead,certificate:cert,first103Cipher:c.slice(0,103)}};
}
console.log(JSON.stringify(experiment(inputs),null,2));
