'use strict';
// Agent12: arbitrary phase permutations after fixed p50 MTF; exact zero-image and IoC envelope.
const fs=require('node:fs'),path=require('node:path');
function experiment(corpus,table,raw,gold){
const check=(x,m)=>{if(!x)throw Error(m)},alphabet=Array.from({length:29},(_,i)=>i),Q=8,ALL=(1<<29)-1;
const glyph=new Map(corpus.runes.map((x,i)=>[x,i]));let tape=[],wp=[],w=0;
for(const ch of raw.split("%").slice(0,55).join("%")){if(glyph.has(ch)){tape.push(glyph.get(ch));wp.push(w++)}else if(ch!=="%"&&ch!=="/"&&!/\s/u.test(ch))w=0}
const original=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
check(tape.length===12956&&tape.every((v,i)=>v===original[i])&&table.bytes.length===256,"original source");
function rotor(x,wp,key,encode){const S=key.slice(),out=[];for(let i=0;i<x.length;i++){const prior=encode?out:x,f=prior[i-(!(table.bytes[(i+255)&255]&1)&&wp[i]>=5?5:1)]??0,a=S.filter(v=>v!==f),c=encode?(x[i]?a[x[i]-1]:f):x[i];out.push(encode?c:c===f?0:a.indexOf(c)+1);S.splice(S.indexOf(c),1);S.unshift(c)}return out}
function propagate(C,states=[{j:0,d:Array(Q).fill(ALL)}]){let max=states.length;for(const c of C){const next=new Map();for(const s of states){if(c===0)next.set(s.j+":"+s.d.join(),s);const m=s.d[s.j]&~(1<<c);if(m){const d=s.d.slice();d[s.j]=m;const j=(s.j+1)%Q;next.set(j+":"+d.join(),{j,d})}}states=[...next.values()];max=Math.max(max,states.length);check(max<=200000,"state cap")}return {states,max}}
const ioc=x=>{let f=Array(29).fill(0);x.forEach(v=>f[v]++);return f.reduce((n,v)=>n+v*(v-1),0)/(x.length*(x.length-1))};
function envelope(x){const f=Array.from({length:Q},()=>Array(28).fill(0));let j=0,z=0;for(const v of x){if(!v){z++;continue}f[j++%Q][v-1]++}
const sorted=f.map(a=>a.slice().sort((a,b)=>b-a)),sum=Array.from({length:28},(_,i)=>sorted.reduce((s,a)=>s+a[i],0));const bound=(z*(z-1)+sum.reduce((s,v)=>s+v*(v-1),0))/(x.length*(x.length-1));return {n:x.length,z,phaseDistinct:f.map(a=>a.filter(Boolean).length),bound,sum,actual:ioc(x)}}
const R=rotor(tape,wp,alphabet,false),R2=rotor(tape,wp,alphabet.slice().reverse(),false);
check(R.slice(163).every((v,i)=>v===R2[i+163]),"washout");check(rotor(R,wp,alphabet,true).every((v,i)=>v===tape[i]),"outer replay");
const train=propagate(R.slice(729,1874)),held=propagate(R.slice(1874,3603),train.states);
check(held.states.length===1&&held.states[0].d.every(v=>v===1),"zero image theorem");
const native=gold.sections.flatMap(s=>[...s.source_text].filter(x=>glyph.has(x)).map(x=>glyph.get(x)));check(native.length===2979,"native input");
const originalEnvelope=envelope(R.slice(729,3603)),nativeWindows=Array.from({length:native.length-2874+1},(_,i)=>ioc(native.slice(i,i+2874)));
let seed=33012014;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=rng()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const controls=[];for(const off of [0,50,105]){const P=native.slice(off,off+2874);const maps=Array.from({length:8},()=>[0,...shuffle(alphabet.slice(1))]);let j=0;const x=P.map(p=>p?maps[j++%8][p]:0);const e=envelope(x);check(e.bound+1e-14>=ioc(P),"positive envelope");
let q=0;const decoded=x.map(c=>c?maps[q++%8].indexOf(c):0);check(decoded.every((v,i)=>v===P[i]),"positive inverse");
const maps2=Array.from({length:8},()=>shuffle(alphabet));j=0;const x2=P.slice(0,100).map(p=>p?maps2[j++%8][p]:0);const offsets=maps2.map(a=>a[0]),possible=propagate(x2);check(possible.states.some(s=>s.j===j%8&&s.d.every((m,i)=>m&(1<<offsets[i]))),"arbitrary-zero-image positive");
controls.push({off,n:P.length,actual:ioc(P),envelope:e.bound,exactInverse:true,arbitraryZeroImages:offsets,arbitraryOffsetControlLength:x2.length,offsetPathSurvives:true,states:possible.states.length,maximumStates:possible.max})}
return {train:{states:train.states,max:train.max},held:{states:held.states,max:held.max},original:originalEnvelope,nativeWindowCount:nativeWindows.length,nativeMin:Math.min(...nativeWindows),nativeMax:Math.max(...nativeWindows),controls};
}
const inputs=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-grid-256.json","resources/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json"];
if(require.main===module){const d=inputs.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'));console.log(JSON.stringify(experiment(JSON.parse(d[0]),JSON.parse(d[1]),d[2],JSON.parse(d[3])),null,2))}
module.exports={experiment};
