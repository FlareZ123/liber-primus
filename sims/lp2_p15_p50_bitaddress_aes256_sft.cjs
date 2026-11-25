'use strict';
// Agent 28: fixed p15 -> table bit-address -> AES256 CTR GP29 receiver.
const fs=require('node:fs'),crypto=require('node:crypto');
function experiment(input,makePad){
 const [c,g,n]=input.map(JSON.parse), mod=x=>((x%29)+29)%29, A=x=>x.map(v=>c.translit[v]).join(" "),hex=x=>Array.from(x,v=>v.toString(16).padStart(2,"0")).join("");
 const row=[3258,3222,3152,3038,3278,3299,3298,2838,3288,3294,3296,2472,4516,1206,708,1820], spiral=[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516];
 const tokens=g.pages.flatMap(p=>p.tokens), maps=[60,59].map(radix=>({radix,a:tokens.map(t=>{let alph=radix===60?g.alphabet:g.alphabet.replace("f","");return radix*alph.indexOf(t[0])+alph.indexOf(t[1]);})}));
 if(maps.some(({a})=>a.length!==256||a.some(x=>x<0||x>255)||Array.from({length:32},(_,i)=>new Set(a.slice(i*8,i*8+8)).size).some(v=>v!==8)))throw Error("address geometry");
 const keys=new Map(), reverse=[];
 for(const [order,values] of [["row",row],["spiral",spiral]])for(const endian of ["BE","LE"]){
  const b=values.flatMap(v=>endian==="BE"?[v>>8,v&255]:[v&255,v>>8]);
  for(const {radix,a} of maps)for(const inMSB of [true,false])for(const outMSB of [true,false]){
   const bits=a.map(i=>(b[i>>3]>>(inMSB?7-(i&7):(i&7)))&1);
   const k=Array.from({length:32},(_,i)=>bits.slice(i*8,i*8+8).reduce((s,v,j)=>s+(v<<(outMSB?7-j:j)),0));
   const label={order,endian,radix,inMSB,outMSB}, h=hex(k); if(!keys.has(h))keys.set(h,{k,labels:[]});keys.get(h).labels.push(label);
   const wanted=Array.from({length:256},(_,i)=>(b[i>>3]>>(outMSB?7-(i&7):(i&7)))&1);
   const seen=new Map();let conflicts=0;for(let i=0;i<256;i++){let v=seen.get(a[i]);if(v!==undefined&&v!==wanted[i])conflicts++;else if(v===undefined)seen.set(a[i],wanted[i]);}
   reverse.push({...label,conflicts,uniqueAddresses:seen.size});
  }
 }
 const docs=n.sections.map(s=>Array.from(s.source_text).map(x=>c.runes.indexOf(x)).filter(x=>x>=0));
 const train=docs.filter((_,i)=>i!==3&&i!==4), counts=new Float64Array(29**3).fill(0.25), ctx=new Float64Array(29**2).fill(7.25), uni=new Float64Array(29).fill(.25);let U=7.25;
 for(const d of train){for(const x of d){uni[x]++;U++}for(let i=2;i<d.length;i++){let j=29*d[i-2]+d[i-1];counts[29*j+d[i]]++;ctx[j]++;}}
 const un=Array.from(uni,x=>Math.log(29*x/U)), lm=Array.from(counts,(x,i)=>Math.log(29*x/ctx[Math.floor(i/29)]));
 function add(a,b,p){return a<0||b<0?un[p]:lm[29*(29*a+b)+p]}
 function score(p){let s=0;for(let i=0;i<p.length;i++)s+=add(i>=2?p[i-2]:-1,i?p[i-1]:-1,p[i]);return s/p.length}
 function forward(p,pad,sign,hold){let j=0;return p.map(x=>hold&&x===0?0:mod(x+sign*pad[j++]));}
 function inverse(y,pad,sign,hold,split){
  if(!hold){const p=y.map((x,i)=>mod(x-sign*pad[i]));return {fit:score(p.slice(0,split)),holdout:score(p.slice(split)),p,reach:y.length};}
  let states=new Map([["0,-1,-1",{j:0,a:-1,b:-1,s:0,p:[]}]]), fit=null;
  for(let i=0;i<y.length;i++){const next=new Map();for(const q of states.values()){
   function put(p,j){const z={j,a:q.b,b:p,s:q.s+add(q.a,q.b,p),p:q.p.concat(p)},id=[j,z.a,z.b].join(",");if(!next.has(id)||next.get(id).s<z.s)next.set(id,z);}
   if(y[i]===0)put(0,q.j);const p=mod(y[i]-sign*pad[q.j]);if(p!==0)put(p,q.j+1);
  }states=next;if(!states.size)return {reach:i,fit,holdout:null,p:null};
  if(i+1===split){let best=[...states.values()].sort((a,b)=>b.s-a.s)[0];fit=best.s/split;states=new Map([[[best.j,best.a,best.b].join(","),best]]);}
  }
  const best=[...states.values()].sort((a,b)=>b.s-a.s)[0];return {reach:y.length,fit,holdout:(best.s-fit*split)/(y.length-split),p:best.p};
 }
 const spans=[{name:"whole",y:c.pages.slice(0,56).flatMap(p=>p.indices),split:c.pages.slice(0,40).flatMap(p=>p.indices).length},{name:"p15body",y:c.pages.slice(15,23).flatMap(p=>p.indices).slice(20),split:c.pages.slice(15,22).flatMap(p=>p.indices).length-20},{name:"p54",y:c.pages.slice(54,56).flatMap(p=>p.indices),split:c.pages[54].indices.length}];
 const results=[],controls=[];
 for(const [h,{k,labels}] of keys){const pad=Array.from(makePad(k,12956),x=>x%29);
  for(const span of spans)for(const sign of [1,-1])for(const hold of [false,true]){
   const r=inverse(span.y,pad,sign,hold,span.split);
   if(r.p&&forward(r.p,pad,sign,hold).some((x,i)=>x!==span.y[i]))throw Error("replay");
   results.push({h,span:span.name,sign,hold,reach:r.reach,fit:r.fit,holdout:r.holdout,preview:r.p?A(r.p.slice(span.split,span.split+24)):null});
  }
  if(controls.length<4){const p=docs[3+controls.length%2],sign=controls.length%2?1:-1,hold=controls.length>=2, y=forward(p,pad,sign,hold),r=inverse(y,pad,sign,hold,Math.floor(p.length*.7));controls.push({h,hold,n:p.length,recovered:r.p?r.p.filter((x,i)=>x===p[i]).length:0,reach:r.reach,fit:r.fit,holdout:r.holdout});}
 }
 const rank=(x,y)=>y.fit-x.fit;const summary=spans.map(s=>({span:s.name,n:s.y.length,split:s.split,ordinary:results.filter(r=>r.span===s.name&&!r.hold).sort(rank).slice(0,3),Flegal:results.filter(r=>r.span===s.name&&r.hold&&r.reach===s.y.length).length,Fmax:Math.max(...results.filter(r=>r.span===s.name&&r.hold).map(r=>r.reach))}));
 return {keys:[...keys].map(([h,x])=>({h,labels:x.labels})),reverse,controls,summary,results};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-grid-256.json","resources/external/relikd-solved-gp29-native-v1.json"];
if(require.main===module){const makePad=(key,n)=>{const c=crypto.createCipheriv('aes-256-ctr',Buffer.from(key),Buffer.alloc(16));return Buffer.concat([c.update(Buffer.alloc(n)),c.final()]);};console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(p,'utf8')),makePad),null,2));}
module.exports=experiment;
