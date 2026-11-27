'use strict';
function repeatStudy(g,c){
const N=29,seq=n=>Array.from({length:n},(_,i)=>i),rot=(a,k)=>a.slice(k).concat(a.slice(0,k)),move=(a,from,to)=>{let b=a.slice();let v=b.splice(from,1)[0];b.splice(to,0,v);return b},reps=a=>a.slice(1).filter((x,i)=>x===a[i]).length;
let seed=0x3124e001;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){let j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function outputRepeats(p,R){let n=0;for(let i=0;i<p.length;i++){let k=R.indexOf(p[i]);if(i&&k===0)n++;R=move(rot(R,(k+1)%N),2,14)}return n}
function full(p,L,R){let z=[];for(let x of p){let k=R.indexOf(x);z.push(L[k]);L=move(rot(L,k),1,14);R=move(rot(R,(k+1)%N),2,14)}return z;}
const native=g.sections.map(x=>({name:x.name,p:[...x.source_text].filter(c=>g.runes.includes(c)).map(c=>g.runes.indexOf(c))})),all=native.flatMap(x=>x.p),a=c.pages.slice(0,56).flatMap(p=>p.indices);
const terminal=c.pages[54].indices.slice(9).concat(c.pages[55].indices);
if(all.length!==2979||a.length!==12956||terminal.length!==299)throw Error("geometry");
for(let i=0;i<30;i++){let p=native[i%native.length].p,L=shuffle(seq(N)),R=shuffle(seq(N));if(reps(full(p,L,R))!==outputRepeats(p,R))throw Error("right-only invariant");}
function summarize(v){v=v.slice().sort((a,b)=>a-b);return {n:v.length,min:v[0],q025:v[Math.floor(v.length*.025)],median:v[Math.floor(v.length*.5)],q975:v[Math.floor(v.length*.975)],max:v.at(-1),mean:v.reduce((a,b)=>a+b,0)/v.length}}
const originalWindows=seq(Math.floor(a.length/all.length)).map(i=>{let v=a.slice(i*all.length,(i+1)*all.length);return {offset:i*all.length,n:v.length,repeats:reps(v)}});
const rr=Array.from({length:2000},()=>outputRepeats(all,shuffle(seq(N))));
const allResult={runes:all.length,nativeRepeats:reps(all),exactMean:(all.length-1-reps(all))/28,draws:summarize(rr),originalWindows:originalWindows.map(w=>({...w,le:rr.filter(x=>x<=w.repeats).length}))};
const terminalResult={runes:terminal.length,repeats:reps(terminal),trainRepeats:reps(terminal.slice(0,223)),heldRepeats:reps(terminal.slice(223)),carryRepeat: +(terminal[222]===terminal[223]),controls:[]};
for(let i=0;i+299<=all.length;i+=299){let p=all.slice(i,i+299),x=Array.from({length:1000},()=>outputRepeats(p,shuffle(seq(N))));terminalResult.controls.push({nativeOffset:i,ptRepeats:reps(p),exactMean:(p.length-1-reps(p))/28,draws:summarize(x),le:x.filter(v=>v<=terminalResult.repeats).length})}
return {runes:a.length,originalRepeats:reps(a),expectedEqualityFractionUnderUniformRightKeyIfAllNativeNonrepeat:1/28,plainEqualityFractionRequiredForMeanObserved:1-28*reps(a)/(a.length-1),allResult,terminalResult};
}
const fs=require('node:fs');const path=require('node:path');const get=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'../resources',p),'utf8'));console.log(JSON.stringify(repeatStudy(get('external/relikd-solved-gp29-native-v1.json'),get('liber-primus/lp2-corpus.json')),null,2));
