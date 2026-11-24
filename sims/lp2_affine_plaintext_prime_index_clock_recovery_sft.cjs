'use strict';
const fs=require('node:fs'),path=require('node:path');
function run(gp,sol){
 const N=464,max=N+29*3008+10,sieve=new Uint8Array(1500000),ks=[];
 for(let i=2;i<sieve.length&&ks.length<max;i++)if(!sieve[i]){ks.push((i-1)%29);if(i*i<sieve.length)for(let j=i*i;j<sieve.length;j+=i)sieve[j]=1}
 if(ks.length<max)throw Error("sieve");
 const maps=[];for(let a=0;a<29;a++)for(let b=0;b<29;b++){maps.push({kind:"ordinal",a,b,step:Uint8Array.from({length:29},(_,p)=>1+(a*p+b)%29)});if(a)maps.push({kind:"prime",a,b,step:Uint8Array.from(gp.prime,p=>1+(a*p+b)%29)})}
 const ix=new Map(gp.runes.map((x,i)=>[x,i])),gptext=s=>Array.from(s).filter(x=>ix.has(x)).map(x=>ix.get(x)),src=sol.sections.filter(s=>!["0_koan_1","0_loss_of_divinity","p56_an_end","p57_parable"].includes(s.name)).map(s=>gptext(s.source_text));
 const uni=new Float64Array(29).fill(1),bi=Array.from({length:29},()=>new Float64Array(29)),tri=Array.from({length:841},()=>new Float64Array(29));for(const a of src)for(let i=0;i<a.length;i++){uni[a[i]]++;if(i)bi[a[i-1]][a[i]]++;if(i>1)tri[a[i-2]*29+a[i-1]][a[i]]++}
 const sum=a=>a.reduce((s,x)=>s+x,0),ut=sum(uni),up=Array.from(uni,x=>x/ut),bp=bi.map(row=>{const z=sum(row)+10;return Array.from(row,(x,j)=>(x+10*up[j])/z)}),tl=tri.map((row,i)=>{const z=sum(row)+10;return Array.from(row,(x,j)=>Math.log((x+10*bp[i%29][j])/z))}),bl=bp.map(r=>r.map(Math.log)),ul=up.map(Math.log),score=(a,b,p)=>b===29?ul[p]:a===29?bl[b][p]:tl[a*29+b][p];
 const initial=()=>Array.from({length:N},(_,s)=>({j:s,s,a:29,b:29,l:0,seq:""}));
 function reach(c,step){let states=new Set(Array.from({length:N},(_,s)=>s));for(let i=0;i<c.length;i++){const next=new Set;for(const j of states){const p=(c[i]-ks[j]+29)%29;if(c[i]===0)next.add(j);if(p!==0)next.add(j+step[p])}if(!next.size)return i;states=next}return c.length}
 function encode(p,s,step){return p.map(v=>{if(v===0)return 0;const c=(v+ks[s])%29;s+=step[v];return c})}
 function decode(c,step,lo,hi,states=initial()){for(let i=lo;i<hi;i++){const next=new Map;for(const v of states){const p=(c[i]-ks[v.j]+29)%29;function add(p,j){const l=v.l+score(v.a,v.b,p),key=(j*30+v.b)*30+p,old=next.get(key);if(!old||l>old.l)next.set(key,{j,s:v.s,a:v.b,b:p,l,seq:v.seq+String.fromCharCode(65+p)})}if(c[i]===0)add(0,v.j);if(p!==0)add(p,v.j+step[p])}states=Array.from(next.values());if(!states.length)return{best:null,extinct:i}}return{best:states.reduce((a,b)=>a.l>b.l?a:b)}}
 const read=v=>Array.from(v.seq,x=>x.charCodeAt(0)-65),meta=m=>({kind:m.kind,a:m.a,b:m.b});
 function sweep(c,prefix){let max=0,full=0,best=null,legal=0,maxmap=null,fullBest=null,byKind={ordinal:0,prime:0};for(const m of maps){const d=reach(c,m.step);if(d>max){max=d;maxmap=meta(m)}if(d===c.length){full++;byKind[m.kind]++;const v=decode(c,m.step,0,c.length).best;if(!fullBest||v.l>fullBest.v.l)fullBest={m,v}}if(d<prefix)continue;legal++;const v=decode(c,m.step,0,prefix).best;if(!best||v.l>best.v.l)best={m,v}}
 const retrospective=fullBest?{key:{...meta(fullBest.m),seed:fullBest.v.s},score:fullBest.v.l/c.length,preview:read(fullBest.v).slice(0,100).map(i=>gp.translit[i]).join(""),replay:encode(read(fullBest.v),fullBest.v.s,fullBest.m.step).every((x,i)=>x===c[i])}:null;
 if(!best)return{max,maxmap,full,legal,byKind,retrospective};const h=decode(c,best.m.step,prefix,c.length,[best.v]);return{max,maxmap,full,legal,byKind,key:{...meta(best.m),seed:best.v.s},train:best.v.l/prefix,heldoutScore:h.best?(h.best.l-best.v.l)/(c.length-prefix):null,extinct:h.extinct,replay:!!h.best&&encode(read(h.best),best.v.s,best.m.step).every((x,i)=>x===c[i]),prefixPlain:read(best.v),heldoutPlain:h.best?read(h.best).slice(prefix):null,retrospective}}
 const controls=[];for(const [kind,a,b,s,name] of [["ordinal",11,7,173,"0_koan_1"],["prime",7,19,83,"0_loss_of_divinity"]]){const p=gptext(sol.sections.find(x=>x.name===name).source_text),m=maps.find(x=>x.kind===kind&&x.a===a&&x.b===b),prefix=240;const z=sweep(encode(p,s,m.step),prefix);const {prefixPlain,heldoutPlain,...summary}=z;controls.push({name,len:p.length,trueKey:{kind,a,b,seed:s},...summary,prefixCorrect:prefixPlain?.filter((v,i)=>v===p[i]).length,heldoutCorrect:heldoutPlain?.filter((v,i)=>v===p[i+prefix]).length})}
 const original=[];for(const [a,b] of [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]]){const c=gp.pages.slice(a,b+1).flatMap(p=>p.indices),prefix=Math.floor(c.length/2);const {prefixPlain,heldoutPlain,...summary}=sweep(c,prefix);original.push({a,b,len:c.length,prefix,...summary})}
 return{maps:maps.length,controls,original};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(run(...files.map(p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8')))),null,2));
