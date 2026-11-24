'use strict';
const fs=require('node:fs'),path=require('node:path');
const run=(gp,sol)=>{
 const modes={unit:p=>1,ordinal:p=>p+1,prime:p=>gp.prime[p],totient:p=>gp.prime[p]-1};
 const N=464,max=N+109*3008+10,sieve=new Uint8Array(6000000),ks=[];
 for(let i=2;i<sieve.length&&ks.length<max;i++)if(!sieve[i]){ks.push((i-1)%29);if(i*i<sieve.length)for(let j=i*i;j<sieve.length;j+=i)sieve[j]=1}
 if(ks.length<max)throw Error("sieve");
 const ix=new Map(gp.runes.map((x,i)=>[x,i])),gptext=s=>Array.from(s).filter(x=>ix.has(x)).map(x=>ix.get(x)),src=sol.sections.filter(s=>!s.name.startsWith("p56")&&!s.name.startsWith("p57")).map(s=>gptext(s.source_text));
 const uni=new Float64Array(29).fill(1),bi=Array.from({length:29},()=>new Float64Array(29)),tri=Array.from({length:841},()=>new Float64Array(29));
 for(const a of src)for(let i=0;i<a.length;i++){uni[a[i]]++;if(i)bi[a[i-1]][a[i]]++;if(i>1)tri[a[i-2]*29+a[i-1]][a[i]]++}
 const sum=a=>a.reduce((s,x)=>s+x,0),ut=sum(uni),up=Array.from(uni,x=>x/ut),bp=bi.map(row=>{const z=sum(row)+10;return Array.from(row,(x,j)=>(x+10*up[j])/z)}),tl=tri.map((row,i)=>{const z=sum(row)+10;return Array.from(row,(x,j)=>Math.log((x+10*bp[i%29][j])/z))}),bl=bp.map(r=>r.map(Math.log)),ul=up.map(Math.log),score=(a,b,p)=>b===29?ul[p]:a===29?bl[b][p]:tl[a*29+b][p];
 const initial=()=>Array.from({length:N},(_,s)=>({j:s,s,a:29,b:29,l:0,seq:""}));
 function reach(c,step){let states=new Set(Array.from({length:N},(_,s)=>s)),peak=states.size;for(let i=0;i<c.length;i++){const next=new Set;for(const j of states){const p=(c[i]-ks[j]+29)%29;if(c[i]===0)next.add(j);if(p!==0)next.add(j+step(p))}if(!next.size)return{max:i,peak,terminal:0};states=next;peak=Math.max(peak,states.size)}return{max:c.length,peak,terminal:states.size}}
 function encode(p,s,step){return p.map(v=>{if(v===0)return 0;const c=(v+ks[s])%29;s+=step(v);return c})}
 function decode(c,step,lo,hi,states=initial()){let peak=states.length;for(let i=lo;i<hi;i++){const next=new Map;for(const v of states){const p=(c[i]-ks[v.j]+29)%29;function add(p,j){const l=v.l+score(v.a,v.b,p),key=(j*30+v.b)*30+p,old=next.get(key);if(!old||l>old.l)next.set(key,{j,s:v.s,a:v.b,b:p,l,seq:v.seq+String.fromCharCode(65+p)})}if(c[i]===0)add(0,v.j);if(p!==0)add(p,v.j+step(p))}states=Array.from(next.values());if(!states.length)return{best:null,peak,extinct:i};peak=Math.max(peak,states.length)}return{best:states.reduce((a,b)=>a.l>b.l?a:b),peak}}
 const read=v=>Array.from(v.seq,x=>x.charCodeAt(0)-65);
 function fit(c,step,prefix){const f=decode(c,step,0,prefix);if(!f.best)return f;const h=decode(c,step,prefix,c.length,[f.best]);return{seed:f.best.s,train:f.best.l/prefix,prefix:read(f.best),prefixPeak:f.peak,heldout:h.best?read(h.best).slice(prefix):null,heldoutScore:h.best?(h.best.l-f.best.l)/(c.length-prefix):null,holdoutPeak:h.peak,extinct:h.extinct,replay:!!h.best&&encode(read(h.best),f.best.s,step).every((x,i)=>x===c[i])}}
 function ctl(p,c,step,prefix,s){const f=fit(c,step,prefix);return{seed:f.seed,trueSeed:s,prefixCorrect:f.prefix?.filter((x,i)=>x===p[i]).length,heldoutCorrect:f.heldout?.filter((x,i)=>x===p[i+prefix]).length,prefix,holdout:p.length-prefix,train:f.train,heldoutScore:f.heldoutScore,replay:f.replay}}
 function terminalAudit(c,step){let states=new Map(Array.from({length:N},(_,s)=>[s,{n:1n,mask:1n<<BigInt(s)}]));for(const x of c){const next=new Map;for(const [j,o] of states){const p=(x-ks[j]+29)%29;const add=k=>{const old=next.get(k);if(old){old.n+=o.n;old.mask|=o.mask}else next.set(k,{...o})};if(x===0)add(j);if(p!==0)add(j+step(p))}states=next}let count=0n,mask=0n;for(const q of states.values()){count+=q.n;mask|=q.mask}const origins=Array.from({length:N},(_,i)=>i).filter(i=>(mask>>BigInt(i))&1n);const best=decode(c,step,0,c.length).best;return{terminal:[...states.keys()],paths:count.toString(),origins,bestSeed:best.s,bestScore:best.l/c.length,plain:read(best).map(i=>gp.translit[i]).join(""),replay:encode(read(best),best.s,step).every((x,i)=>x===c[i])}}
 const p56=gptext(sol.sections.find(s=>s.name==="p56_an_end").source_text),c56=gp.pages[56].indices,p57=gp.pages[57].indices;
 if(!encode(p56,0,modes.unit).every((v,i)=>v===c56[i]))throw Error("authentic replay");
 const controls={authentic:ctl(p56,c56,modes.unit,60,0)};
 for(const [name,step] of Object.entries(modes)){if(name==="unit")continue;controls[name]=ctl(p57,encode(p57,73,step),step,70,73)}
 const targets=[[0,2,365],[40,53,1500],[54,55,154]],original=[];
 for(const [a,b,prefix] of targets){const c=gp.pages.slice(a,b+1).flatMap(p=>p.indices);for(const [mode,step] of Object.entries(modes)){const reachResult=reach(c,step);let f=null;if(reachResult.max>=prefix){const x=fit(c,step,prefix);f={seed:x.seed,train:x.train,heldoutScore:x.heldoutScore,extinct:x.extinct,replay:x.replay,preview:x.heldout?.slice(0,100).map(i=>gp.translit[i]).join("")??null,prefixPeak:x.prefixPeak}}original.push({a,b,len:c.length,prefix,mode,...reachResult,fit:f})}}
 const terminal=gp.pages.slice(54,56).flatMap(p=>p.indices);
 return{controls,original,terminal:{unit:terminalAudit(terminal,modes.unit),prime:terminalAudit(terminal,modes.prime)}};
};
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(run(...files.map(p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8')))),null,2));
