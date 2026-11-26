'use strict';
// Exact rational BASE29 state receiver. Read-only; run from any cwd.
const fs=require('node:fs'),path=require('node:path');
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
function run(data,nativeData){
const M=3301,B=29,mod=x=>((x%B)+B)%B,assert=(x,m)=>{if(!x)throw Error(m)};
const digit=Array.from({length:M},(_,r)=>Math.floor(B*r/M)),next=Array.from({length:M},(_,r)=>B*r%M);
const seen=new Set(),cycles=[];for(let r=1;r<M;r++)if(!seen.has(r)){let x=r,n=0;do{assert(!seen.has(x),"bad orbit");seen.add(x);n++;x=next[x]}while(x!==r);cycles.push({representative:r,length:n})}
assert(seen.size===3300&&cycles.length===6&&cycles.every(c=>c.length===550),"cycle census");
const map=new Map(data.runes.map((x,i)=>[x,i]));
const src=nativeData.sections.map(s=>({name:s.name,p:[...s.source_text].filter(c=>map.has(c)).map(c=>map.get(c))}));
const names=["0_koan_1","0_welcome","0_loss_of_divinity"];
const count=Array.from({length:30},()=>Array(29).fill(.5));for(const {p} of src.filter(s=>!names.includes(s.name)))for(let i=0;i<p.length;i++)count[i?p[i-1]:29][p[i]]++;
const logs=count.map(a=>{const s=a.reduce((a,b)=>a+b,0);return a.map(x=>Math.log(x/s))});
const allowed=x=>x!==12&&x!==22;
const encode=(p,r,sign)=>{let a=[];for(const x of p){if(x===0)a.push(0);else{a.push(mod(x+sign*digit[r]));r=next[r]}}return a};
function gate(C,r,sign,gp27=false){let st=[r],peak=1;for(let i=0;i<C.length;i++){const c=C[i],nx=new Set();for(const s of st){if(c===0)nx.add(s);const x=mod(c-sign*digit[s]);if(x!==0&&(!gp27||allowed(x)))nx.add(next[s])}if(!nx.size)return {ok:false,offset:i,peak};st=[...nx];peak=Math.max(peak,st.length)}return {ok:true,offset:C.length,peak,ends:st}}
function census(C,sign,gp27=false){const survivors=[];let best=-1,bestSeeds=[],peak=0;for(let r=1;r<M;r++){const g=gate(C,r,sign,gp27);peak=Math.max(peak,g.peak);if(g.ok)survivors.push(r);else if(g.offset>best){best=g.offset;bestSeeds=[r]}else if(g.offset===best)bestSeeds.push(r)}return {survivors,longestFailedPrefix:best,bestSeeds,peak}}
function vit(C,r,sign,last=29){let st=new Map([[r*30+last,{r,last,score:0,p:[]}]]);for(const c of C){const nx=new Map();for(const v of st.values()){const add=(x,r)=>{const id=r*30+x,score=v.score+logs[v.last][x],old=nx.get(id);if(!old||score>old.score)nx.set(id,{r,last:x,score,p:[...v.p,x]})};if(c===0)add(0,v.r);const x=mod(c-sign*digit[v.r]);if(x!==0)add(x,next[v.r])}if(!nx.size)return null;st=nx}return [...st.values()].sort((a,b)=>b.score-a.score)[0]}
const render=p=>p.map(x=>data.translit[x]).join(" ");
const select=(C,sign,seeds)=>seeds.map(r=>({seed:r,sign,...vit(C,r,sign)})).sort((a,b)=>b.score-a.score);
const p56=src.find(s=>s.name==="p56_an_end").p,primes=[];for(let x=2;primes.length<85;x++)if(primes.every(p=>x%p!==0))primes.push(x);
let k=0;const expected=p56.map(x=>x===0?0:mod(x+primes[k++]-1));
assert(expected.join()===data.pages[56].indices.join(),"authentic p56 F-hold source replay");
const controls=[];
for(const [name,seed,sign] of [[names[0],3299,1],[names[1],463,-1],[names[2],1033,1]]){const p=src.find(s=>s.name===name).p,C=encode(p,seed,sign),cut=Math.floor(C.length*.67),g=[1,-1].map(s=>({sign:s,...census(C.slice(0,cut),s)})),fit=g.flatMap(s=>select(C.slice(0,cut),s.sign,s.survivors)).sort((a,b)=>b.score-a.score),v=fit[0],w=vit(C.slice(cut),v.r,v.sign,v.last);assert(w,"control holdout died");const pred=[...v.p,...w.p];assert(encode(pred,v.seed,v.sign).join()===C.join(),"control replay");assert(v.seed===seed&&v.sign===sign,"blind control state");assert(gate(C,seed,sign,true).ok,"GP27 true control retention");controls.push({name,seed,sign,fitLength:cut,fitSeeds:g.map(s=>({sign:s.sign,count:s.survivors.length})),recoveredSeed:v.seed,recoveredSign:v.sign,fitCorrect:v.p.filter((x,i)=>x===p[i]).length,holdoutLength:C.length-cut,holdoutCorrect:w.p.filter((x,i)=>x===p[i+cut]).length,fitScore:v.score/cut,holdoutScore:w.score/(C.length-cut)})}
const ranges=[[0,2,13],[3,7,0],[8,14,0],[15,22,20],[23,26,0],[27,32,0],[33,39,0],[40,53,0],[54,55,9]];
const orig=[];
for(const [a,b,offset] of ranges){const C=data.pages.slice(a,b+1).flatMap(p=>p.indices).slice(offset);for(const sign of [1,-1]){const g=census(C,sign);const record={pages:[a,b],offset,length:C.length,sign,...g};if(g.survivors.length){const fit=select(C,sign,g.survivors);record.candidates=fit.map(v=>({seed:v.seed,score:v.score/C.length,indices:v.p,text:render(v.p),replays:encode(v.p,v.seed,sign).join()===C.join()}));assert(record.candidates.every(v=>v.replays),"original replay");record.gp27=census(C,sign,true)}orig.push(record)}}
const C=data.pages.slice(54,56).flatMap(p=>p.indices).slice(9),cut=data.pages[54].indices.length-9;
const terminal=[];
for(const sign of [1,-1]){const g=census(C.slice(0,cut),sign),fit=select(C.slice(0,cut),sign,g.survivors),best=fit[0];let pred=null;if(best){const w=vit(C.slice(cut),best.r,sign,best.last);pred={seed:best.seed,fitScore:best.score/cut,fitText:render(best.p),holdout:w?{text:render(w.p),score:w.score/(C.length-cut),replay:encode([...best.p,...w.p],best.seed,sign).join()===C.join()}:null}}
terminal.push({sign,fitLength:cut,holdoutLength:C.length-cut,fitSeeds:g.survivors,prediction:pred})}
return {cycles,authenticP56:{runes:p56.length,consuming:k},nativeRareCounts:src.map(s=>({name:s.name,EO_OE:s.p.filter(x=>!allowed(x)).length})),firstDigits:Array.from({length:20},(_,i)=>{let r=1;for(let j=0;j<i;j++)r=next[r];return digit[r]}),controls,orig,terminal}
}
console.log(JSON.stringify(run(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
