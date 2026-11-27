// Agent11: source-selected p22 physical horizontal mirror, authentic q13 key.
const fs=require("node:fs");
const path=require("node:path");
function experiment(c,t,n){
const assert=(x,msg)=>{if(!x)throw Error(msg)};
const map=new Map(c.runes.map((r,i)=>[r,i])),mod=x=>(x%29+29)%29,K=[0,10,4,0,1,19,0,18,4,18,9,0,18];
const idx=s=>Array.from(s).filter(x=>map.has(x)).map(x=>map.get(x));
const pages=t.split("%"),lines=p=>pages[p].split("/").map(idx).filter(x=>x.length);
const native=n.sections.map(s=>({name:s.name,x:idx(s.source_text)}));
const counts=Array.from({length:29},()=>Array(29).fill(.5));
for(const s of native.slice(2))for(let i=1;i<s.x.length;i++)counts[s.x[i-1]][s.x[i]]++;
const lm=counts.map(row=>{let total=row.reduce((a,b)=>a+b,0);return row.map(x=>Math.log(x/total))});
const score=p=>p.slice(1).reduce((s,x,i)=>s+lm[p[i]][x],0)/(p.length-1);
function perm(lengths,mirror){let a=[],off=0;for(const l of lengths){for(let i=0;i<l;i++)a.push(off+(mirror?l-1-i:i));off+=l}return a}
function reorder(a,order){return order.map(i=>a[i])}
function enc(p,phase,sign,hold){let k=phase;return p.map(x=>{if(hold&&x===0)return 0;const y=mod(x+sign*K[k]);k=(k+1)%13;return y})}
function invert(y,phase,sign,hold){
let states=new Map([[`${phase},-1`,{k:phase,last:-1,num:1n,s:0,p:[]}]]);
let peak=1;
for(let i=0;i<y.length;i++){
const next=new Map();for(const q of states.values()){
function add(p,k){const id=`${k},${p}`,s=q.s+(q.last<0?0:lm[q.last][p]),old=next.get(id),num=(old?.num??0n)+q.num;if(!old||s>old.s)next.set(id,{k,last:p,num,s,p:[...q.p,p]});else old.num=num}
if(hold&&y[i]===0)add(0,q.k);
const x=mod(y[i]-sign*K[q.k]);if(!hold||x!==0)add(x,(q.k+1)%13);
}
states=next;peak=Math.max(peak,states.size);if(!states.size)return {paths:"0",prefix:i,peak};
}
const best=[...states.values()].sort((a,b)=>b.s-a.s)[0];return {paths:[...states.values()].reduce((s,q)=>s+q.num,0n).toString(),prefix:y.length,peak,p:best.p,score:score(best.p)}
}
function receiver(raw,lengths,phase,sign,hold,mode){const m=perm(lengths,true),y=mode==="cipher-mirror"?reorder(raw,m):raw;const z=invert(y,phase,sign,hold);if(!z.p)return z;const p=mode==="plain-mirror"?reorder(z.p,m):z.p;const replay=mode==="cipher-mirror"?reorder(enc(p,phase,sign,hold),m):enc(mode==="plain-mirror"?reorder(p,m):p,phase,sign,hold);assert(replay.join()===raw.join(),"replay");return {...z,p,score:score(p),text:p.map(x=>c.translit[x]).join(" ")}}
const original=[];for(const pg of [22,23]){const ls=lines(pg),raw=ls.flat();assert(raw.join()===c.pages[pg].indices.join(),"line/corpus mismatch");const lengths=ls.map(a=>a.length);for(const mode of ["cipher-mirror","plain-mirror"])for(const hold of [true,false])for(const sign of [1,-1])for(let phase=0;phase<13;phase++){const z=receiver(raw,lengths,phase,sign,hold,mode);original.push({pg,lengths,mode,hold,sign,phase,...z})}}
const controls=[];const lengths=lines(22).map(a=>a.length),m=perm(lengths,true),L=m.length;
for(const s of native.slice(0,2)){assert(s.x.length>=L,"short plant");const p=s.x.slice(0,L);for(const mode of ["cipher-mirror","plain-mirror"])for(const hold of [true,false])for(const sign of [1,-1])for(let phase=0;phase<13;phase++){const raw=mode==="cipher-mirror"?reorder(enc(p,phase,sign,hold),m):enc(reorder(p,m),phase,sign,hold);const z=receiver(raw,lengths,phase,sign,hold,mode);assert(z.p,"lost true plant");controls.push({name:s.name,mode,hold,sign,phase,exact:z.p.join()===p.join(),correct:z.p.filter((x,i)=>x===p[i]).length,score:z.score,truthScore:score(p),paths:z.paths})}}
return {sourceLengths:lines(22).map(x=>x.length),K,original,controls,summary:[22,23].flatMap(pg=>["cipher-mirror","plain-mirror"].flatMap(mode=>[true,false].map(hold=>{const a=original.filter(z=>z.pg===pg&&z.mode===mode&&z.hold===hold);const b=a.filter(z=>z.p).sort((x,y)=>y.score-x.score);return {pg,mode,hold,complete:b.length,maxPrefix:Math.max(...a.map(z=>z.prefix)),best:b[0]?{phase:b[0].phase,sign:b[0].sign,score:b[0].score,text:b[0].text}:null}}))),controlSummary:["cipher-mirror","plain-mirror"].flatMap(mode=>[true,false].map(hold=>{const a=controls.filter(z=>z.mode===mode&&z.hold===hold);return {mode,hold,n:a.length,exact:a.filter(z=>z.exact).length,correct:a.reduce((s,z)=>s+z.correct,0),total:a.length*L,minTruth:Math.min(...a.map(z=>z.truthScore)),minScore:Math.min(...a.map(z=>z.score))}}))}
}
const root=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"))),null,2));
