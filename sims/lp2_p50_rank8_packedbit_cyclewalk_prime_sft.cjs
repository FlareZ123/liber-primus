'use strict';
const fs=require('node:fs'),path=require('node:path');
const read=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'));
function experiment(a,g,s){
 const mod=x=>(x%29+29)%29,assert=(x,m)=>{if(!x)throw Error(m)},same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
 const rank=values=>Array.from({length:32},(_,i)=>Array.from({length:8},(_,j)=>j).sort((j,k)=>values[8*i+j]-values[8*i+k]));
 const perm=rank(g.bytes),inv=perm.map(p=>p.map((_,i)=>p.indexOf(i)));
 const abc=g.alphabet.replace("f",""),v59=g.pages.flatMap(p=>p.tokens).map(t=>abc.indexOf(t[0])*59+abc.indexOf(t[1]));
 assert(g.bytes.length===256&&perm.every((p,i)=>new Set(g.bytes.slice(8*i,8*i+8)).size===8),"distinct source rows");
 assert(JSON.stringify(perm)===JSON.stringify(rank(v59)),"rank must be radix invariant");
 // Source physical row per packed byte, MSB-first 5-bit GP indices, 8-rune blocks = 40 bits.
 function step(x,block,ps){
  const bits=x.flatMap(v=>Array.from({length:5},(_,j)=>(v>>(4-j))&1));
  const out=Array.from({length:40},(_,i)=>bits[(i&~7)+ps[(5*block+(i>>3))%32][i%8]]);
  return Array.from({length:8},(_,i)=>out.slice(5*i,5*i+5).reduce((v,b)=>2*v+b,0));
 }
 function cw(x,block,ps){
  let n=0;
  do{x=step(x,block,ps);n++;if(n>840)throw Error("cycle-walk order invariant");}while(x.some(v=>v>=29));
  return {x,n};
 }
 function transform(x,ps){
  assert(x.length%8===0,"complete 40-bit frames");
  const y=[],steps=[];for(let i=0;i<x.length;i+=8){const r=cw(x.slice(i,i+8),i/8,ps);y.push(...r.x);steps.push(r.n)}
  return {y,steps};
 }
 const k=[];for(let n=2;k.length<4000;n++){let p=true;for(let i=2;i*i<=n;i++)if(n%i===0){p=false;break}if(p)k.push((n-1)%29)}
 const native=x=>[...x.source_text].map(v=>a.runes.indexOf(v)).filter(v=>v>=0);
 function enc(p,o){let j=o;return p.map(v=>v===0?0:mod(v+k[j++]))}
 const p56=native(s.sections.find(x=>x.name==="p56_an_end"));assert(same(enc(p56,0),a.pages[56].indices),"authentic p56 prime/F replay");
 function reach(c,o){
  let row=new Uint8Array(c.length+2);row[0]=1;let z=0;
  for(let i=0;i<c.length;i++){let any=0,v=c[i];
   if(v===0){for(let h=z+1;h>=0;h--){row[h]=+(!!((h<=z&&row[h]&&k[o+i-h]!==0)||(h>0&&row[h-1])));any|=row[h]}z++}
   else{for(let h=0;h<=z;h++){if(row[h]&&k[o+i-h]===v)row[h]=0;any|=row[h]}}
   if(!any)return i;
  }return c.length;
 }
 function sweep(c){const prefix=[],full=[],best=[];let max=0;for(let o=0;o<=3301;o++){const n=reach(c,o);if(n>=256)prefix.push(o);if(n===512)full.push(o);if(n>max){max=n;best.length=0;best.push(o)}else if(n===max)best.push(o)}return {prefix,full,max,best}}
 function model(exclude){
  const counts=Array.from({length:30},()=>new Float64Array(29).fill(.5));
  for(const sec of s.sections.filter(x=>x.name!==exclude)){let prev=29;for(const v of native(sec)){counts[prev][v]++;prev=v}}
  return counts.map(row=>{const total=row.reduce((u,v)=>u+v,0);return Array.from(row,v=>Math.log(v/total))});
 }
 function decode(c,origin,prev,lm){
  let states=new Map([[origin*30+prev,{j:origin,last:prev,score:0,back:null}]]);
  for(const v of c){const next=new Map();for(const st of states.values()){
   const put=(p,j)=>{const id=j*30+p,score=st.score+lm[st.last][p],old=next.get(id);if(!old||score>old.score)next.set(id,{j,last:p,score,back:st})};
   if(v===0)put(0,st.j);const p=mod(v-k[st.j]);if(p!==0)put(p,st.j+1);
  }states=next;if(!states.size)return null}
  let best=[...states.values()].reduce((a,b)=>a.score>=b.score?a:b),end=best.j,last=best.last,score=best.score,p=[];
  while(best.back){p.push(best.last);best=best.back}p.reverse();assert(same(enc(p,origin),c),"inner replay");return {p,end,last,score};
 }
 function fit(c,origins,lm){
  let best=null;for(const o of origins){const d=decode(c.slice(0,256),o,29,lm);if(d&&(!best||d.score>best.score))best={o,...d}}
  const hold=best?decode(c.slice(256),best.end,best.last,lm):null;return {best,hold};
 }
 const repeats=p=>p.filter((v,i)=>i>0&&v===p[i-1]).length;
 const raw=a.pages.slice(51,54).flatMap(p=>p.indices).slice(0,512),{y,steps}=transform(raw,inv);
 assert(same(transform(y,perm).y,raw),"original outer replay");
 const modelDirect=model(null),origSweep=sweep(y),origFit=fit(y,origSweep.prefix,modelDirect),directScore=y.reduce((sum,v,i)=>sum+modelDirect[i?y[i-1]:29][v],0);
 const plants=[["0_welcome",133],["0_koan_1",1033],["0_loss_of_divinity",3301]].map(([name,origin])=>{
  const p=native(s.sections.find(x=>x.name===name)).slice(0,512),inner=enc(p,origin),outer=transform(inner,perm),d=transform(outer.y,inv);assert(same(d.y,inner),"plant outer replay");const sw=sweep(d.y),f=fit(d.y,sw.prefix,model(name)),correct=(x,y)=>x?x.filter((v,i)=>v===y[i]).length:0;
  if(f.hold)assert(same(transform(enc(f.best.p.concat(f.hold.p),f.best.o),perm).y,outer.y),"full plant replay");
  return {name,origin,selected:f.best?.o??null,fitCorrect:correct(f.best?.p,p.slice(0,256)),holdCorrect:correct(f.hold?.p,p.slice(256)),fitScore:f.best?.score/256,holdScore:f.hold?.score/256,innerRepeats:repeats(inner),outerRepeats:repeats(outer.y),stepsMax:Math.max(...outer.steps),replay:!!f.hold,fullOrigins:sw.full};
 });
 return {p56Replay:p56.length,rawLength:raw.length,rawRepeats:repeats(raw),inverseRepeats:repeats(y),steps,origin0:reach(y,0),sweep:origSweep,fit:origFit.best&&{origin:origFit.best.o,end:origFit.best.end,score:origFit.best.score/256,hold:origFit.hold&&origFit.hold.score/256,preview:origFit.best.p.slice(0,64).map(v=>a.translit[v]).join(" ")},directScore:directScore/512,plants};
}
console.log(JSON.stringify(experiment(read("resources/liber-primus/lp2-corpus.json"),read("resources/liber-primus/lp2-grid-256.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
