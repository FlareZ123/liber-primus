'use strict';
const fs=require('node:fs');
function main(g,trans,native){
const glyph=new Map(g.runes.map((x,i)=>[x,i]));
const parse=t=>(t.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>Array.from(w,x=>glyph.get(x)));
const ws=parse(trans.replace(/[\s/%]/g,"")).slice(0,2896),C=ws.flat();
if(C.length!==12956||String(C)!==String(g.pages.slice(0,56).flatMap(p=>p.indices)))throw Error("source mismatch");
function marks(ws){let m=new Set(),at=0;for(let w of ws){if(w.length===1)m.add(at);at+=w.length}return m}
const markers=marks(ws);
const pc=x=>{let n=0;while(x){x&=x-1;n++}return n};
function trace(C,markers,start,end,oracle){
while(start<end&&!C[start])start++;
if(start===end)return{start,end,burn:-1,rows:[],checked:0,markerChecked:0};
let center=C[start],tok=Array(29).fill(-1),last=Array(27).fill(-1),k=0;
for(let x=1;x<29;x++)if(x!==center)tok[x]=k++;
let S=0,ins=-1,checked=0,markerChecked=0;
if(oracle){let A=oracle.states[start].after.filter(x=>x!==0);ins=A.indexOf(center);for(let i=0;i<ins;i++)S|=1<<tok[A[i]];}
let rows=[],seen=0,burn=-1;
for(let i=start+1;i<end;i++){
let c=C[i];if(!c)continue;let t=tok[c],m=0;
if(seen===27){if(t>=0)for(let u=0;u<27;u++)if(last[u]>last[t])m|=1<<u;
if(markers.has(i))rows.push([i,t,m]);
if(oracle){let q=t<0?ins:(S&(1<<t)?ins-1-pc(S&m):ins+1+pc(~S&m));
let {before,rank}=oracle.states[i],z=before.indexOf(0),side=z<oracle.d,truth=before.filter(x=>x!==0).indexOf(c);
if(q!==truth)throw Error("projected rank mismatch");
if(side!==oracle.left)throw Error("side mismatch");
let allowed=side?(q<ins?[q,q+1]:[q+1]):(q>ins?[q,q+1]:[q]);
if(!allowed.includes(rank))throw Error("lost true full rank");
if(markers.has(i)){markerChecked++;if(rank!==oracle.S[10]&&rank!==oracle.S[24])throw Error("bad native singleton");}
checked++;
}}
if(c!==center){if(last[t]<0&&++seen===27)burn=i+1;last[t]=i;tok[center]=t;tok[c]=-1;center=c}
}
return{start,end,burn,rows,checked,markerChecked}
}
const traces=[trace(C,markers,0,6478),trace(C,markers,6478,C.length)];
let fixture=traces.map(t=>[t.start,t.end,t.burn,t.rows.length].join(" ")+"\n"+t.rows.map(r=>r.join(" ")).join("\n")+"\n").join("");
let fnv=2166136261;for(let ch of fixture)fnv=Math.imul(fnv^ch.charCodeAt(0),16777619)>>>0;
if(fnv!==0xda625de8)throw Error("fixture differs from executed local input");
const nw=native.sections.flatMap(s=>parse(s.source_text.replace(/['’]/g,"")));
if(String([...new Set(nw.filter(w=>w.length===1).flat())].sort((a,b)=>a-b))!=="10,24")throw Error("unexpected native singleton labels");
let seed=330127;function rnd(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n}
function perm(){let a=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){let j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
let controls=[];
for(let [d,df] of [[0,28],[28,0],[1,28],[27,0],[7,2],[7,23],[14,0],[14,28],[21,8],[21,26],[3,6],[6,3]]){
let S=perm(),A=perm(),ct=[],states=[];
for(let p of nw.flat()){let before=A.slice(),rank=p===0?-1:S[p],c=p===0?0:A[rank];if(p!==0){A.splice(rank,1);A.splice(c===0?df:d,0,c)}ct.push(c);states.push({before,after:A.slice(),rank})}
let segments=[],start=0,switches=0,prev=null;
for(let i=0;i<ct.length;i++){let z=states[i].after.indexOf(0),side=z===d?null:z<d;if(side===null){start=i+1;prev=null;continue}if(prev!==null&&side!==prev){segments.push([start,i,prev]);start=i;switches++;}prev=side}
if(prev!==null)segments.push([start,ct.length,prev]);
if(switches>1)throw Error("side switched more than once");
let check=0,anchors=0;for(let [a,b,left] of segments){let t=trace(ct,marks(nw),a,b,{states,d,S,left});check+=t.checked;anchors+=t.markerChecked}
controls.push({d,df,switches,checked:check,markerChecks:anchors})
}
if(controls.reduce((a,b)=>a+b.markerChecks,0)<100)throw Error("insufficient native anchor checks");
return {fixture,fnv:fnv.toString(16),traces:traces.map(({start,end,burn,rows})=>({start,end,burn,anchors:rows.length})),controls};
}
const out=main(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8')),fs.readFileSync('resources/transcriptions/lp2-image-corrected.txt','utf8'),JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8')));
process.stdout.write(out.fixture);delete out.fixture;console.error(JSON.stringify(out));
