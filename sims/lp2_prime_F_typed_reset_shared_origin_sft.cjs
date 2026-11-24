"use strict";
// Exact historical p56 F-hold cipher; one bounded shared prime origin and five source-defined reset bits.
// Fit only the first 60 authentic p56 cipher symbols; its last 25 are held out.
// Original: p40–53, training prefix 1500, remaining 1508 withheld. No key scoring on impossible paths.
// Read-only, standalone CommonJS; no dependency or network access.
const fs=require("node:fs"),path=require("node:path");
const run=function run(gp,pu,ink,sol){
const mod=x=>(x%29+29)%29;
const check=(b,s)=>{if(!b)throw Error(s)};
const N=464,ps=[];
for(let n=2;ps.length<3500;n++){let yes=true;for(const p of ps){if(p*p>n)break;if(n%p===0){yes=false;break}}if(yes)ps.push(n);}
const K=ps.map(p=>(p-1)%29);
const ix=new Map(gp.runes.map((x,i)=>[x,i]));const gptext=s=>Array.from(s).filter(x=>ix.has(x)).map(x=>ix.get(x));
const src=sol.sections.filter(s=>!s.name.startsWith("p56")&&!s.name.startsWith("p57")).map(s=>gptext(s.source_text));
const uni=new Float64Array(29).fill(1),bi=Array.from({length:29},()=>new Float64Array(29)),tri=Array.from({length:841},()=>new Float64Array(29));
for(const a of src)for(let i=0;i<a.length;i++){uni[a[i]]++;if(i)bi[a[i-1]][a[i]]++;if(i>1)tri[a[i-2]*29+a[i-1]][a[i]]++}
const sum=a=>a.reduce((s,x)=>s+x,0), ut=sum(uni),up=Array.from(uni,x=>x/ut);
const bp=bi.map(row=>{const z=sum(row)+10;return Array.from(row,(x,j)=>(x+10*up[j])/z)});
const tl=tri.map((row,i)=>{const z=sum(row)+10;return Array.from(row,(x,j)=>Math.log((x+10*bp[i%29][j])/z))});
const bl=bp.map(r=>r.map(Math.log)),ul=up.map(Math.log);
const score=(a,b,p)=>b===29?ul[p]:a===29?bl[b][p]:tl[a*29+b][p];
const originPage=40,endPage=53;
const start=gp.pages.filter(p=>p.page<originPage).reduce((n,p)=>n+p.indices.length,0);
const target=gp.pages.filter(p=>p.page>=originPage&&p.page<=endPage).flatMap(p=>p.indices);
check(start===9640&&target.length===3008,"source");
const targetMark=new Uint8Array(target.length),mark=(i,b)=>{if(i>0&&i<targetMark.length)targetMark[i]|=b};
for(const e of pu.events){const i=e.rune_offset-start;if(e.index>=57&&e.index<=60||e.index===91||e.index===125)continue;const b=e.symbol==="⁜"?(e.large_mark.dot_count===13?4:8):e.symbol==="⁚"||e.index===127?2:1;mark(i,b)}
let at=0;for(const p of gp.pages.filter(p=>p.page>=originPage&&p.page<=endPage)){if(p.indices.length)mark(at,16);at+=p.indices.length;}
const C=gp.pages.find(p=>p.page===56).indices,P=gptext(sol.sections.find(s=>s.name==="p56_an_end").source_text);
check(P.length===85&&C.length===85,"positive source");
const marks=new Uint8Array(C.length);marks[5]=4;marks[19]=2;marks[45]=8;
check(JSON.stringify(ink.pages.find(p=>p.page===56).large_punctuation)===JSON.stringify([[5,13,"red"],[45,10,"red"],[85,13,"red"]]),"marks");
function encode(p,m,s,mask){let j=s;return p.map((v,i)=>{if(m[i]&mask)j=s;return v===0?0:mod(v+K[j++])})}
check(encode(P,marks,0,0).every((v,i)=>v===C[i]),"authentic replay");
function viterbi(c,m,s,mask,lo,hi,initial={j:s,a:29,b:29,l:0,seq:""}){
let states=[initial];for(let i=lo;i<hi;i++){
const next=new Map(),reset=m[i]&mask;
function add(v,j,p){const l=v.l+score(v.a,v.b,p),key=(j*30+v.b)*30+p;const old=next.get(key);if(!old||l>old.l)next.set(key,{j,a:v.b,b:p,l,seq:v.seq+String.fromCharCode(65+p)})}
for(const v of states){const j=reset?s:v.j,p=mod(c[i]-K[j]);if(c[i]===0)add(v,j,0);if(p!==0)add(v,j+1,p)}
states=Array.from(next.values());if(!states.length)return null;
}
states.sort((a,b)=>b.l-a.l);return states[0]
}
const decode=s=>Array.from(s,x=>x.charCodeAt(0)-65);
const prefix=60, fits=[];
for(let s=0;s<N;s++)for(let mask=0;mask<16;mask+=2){const v=viterbi(C,marks,s,mask,0,prefix);if(v)fits.push({s,mask,v})}
fits.sort((a,b)=>b.v.l-a.v.l);const best=fits[0],follow=viterbi(C,marks,best.s,best.mask,prefix,C.length,best.v);
const got=follow&&decode(follow.seq);const actual=got?got.filter((x,i)=>x===P[i]).length:0;
const control={origin:best.s,mask:best.mask,trainingScore:best.v.l,rankTrue:fits.findIndex(v=>v.s===0&&v.mask===0)+1,prefixCorrect:decode(best.v.seq).filter((x,i)=>x===P[i]).length,heldoutCorrect:got?got.slice(prefix).filter((x,i)=>x===P[prefix+i]).length:0,actual,top:fits.slice(0,5).map(v=>[v.s,v.mask,v.v.l]),replay:got?encode(got,marks,best.s,best.mask).every((x,i)=>x===C[i]):false};
function reach(c,m,s,mask,lo=0,hi=c.length,initial=[s]){
let cur=initial,next=new Set();for(let i=lo;i<hi;i++){
if(m[i]&mask)cur=[s];next.clear();
for(const j of cur){if(c[i]===0)next.add(j);if(mod(c[i]-K[j])!==0)next.add(j+1)}
if(!next.size)return {dead:i,states:[]};cur=Array.from(next)
}
return {dead:hi,states:cur}
}
const results=[];let candidates=[];
for(let mask=0;mask<32;mask++){let max=0,train=0,full=0,bestOrigins=[];
for(let s=0;s<N;s++){const x=reach(target,targetMark,s,mask);if(x.dead>max){max=x.dead;bestOrigins=[s]}else if(x.dead===max)bestOrigins.push(s);if(x.dead>=1500){train++;candidates.push({s,mask,full:x.dead===target.length})}if(x.dead===target.length)full++}
results.push({mask,max,train,full,bestOrigins:bestOrigins.slice(0,10),resets:Array.from(targetMark).filter(v=>v&mask).length})}
const fitOriginal=[];for(const {s,mask,full} of candidates){const v=viterbi(target,targetMark,s,mask,0,1500);if(v)fitOriginal.push({s,mask,full,v})}
fitOriginal.sort((a,b)=>b.v.l-a.v.l);
let orig=null;
if(fitOriginal.length){const b=fitOriginal[0],v=viterbi(target,targetMark,b.s,b.mask,1500,target.length,b.v);orig={s:b.s,mask:b.mask,trainScore:b.v.l/1500,fullLegal:!!v,holdoutScore:v?(v.l-b.v.l)/(target.length-1500):null,first100:decode(b.v.seq.slice(0,100)),holdoutFirst100:v?decode(v.seq.slice(1500,1600)):null,replay:v?encode(decode(v.seq),targetMark,b.s,b.mask).every((x,i)=>x===target[i]):false}}
const targetClasses=Array.from({length:5},(_,i)=>Array.from(targetMark).filter(v=>v&(1<<i)).length);
check(control.actual===85&&control.replay&&control.origin===0&&control.mask===0,"blind positive");
check(results.length===32&&results.every(v=>v.train===0&&v.full===0)&&Math.max(...results.map(v=>v.max))===628,"original exact rejection");
return {control,targetClasses,results,orig}
};
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-punctuation-identity.json","resources/liber-primus/lp2-ink-annotations.json","resources/external/relikd-solved-gp29-native-v1.json"];
const data=files.map(p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8")));
console.log(JSON.stringify(run(...data),null,2));
