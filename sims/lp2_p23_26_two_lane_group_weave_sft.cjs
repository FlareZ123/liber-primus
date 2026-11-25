"use strict";
// #2720: fixed two-lane complete-group inverse, length-only gate.
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function experiment(raw){
const gp=JSON.parse(raw[0]),ix=new Map(gp.runes.map((x,i)=>[x,i])),groups=[];let w=[],between="";for(const c of raw[1]){if(ix.has(c)){if(w.length&&/[-.&]/u.test(between)){groups.push(w);w=[]}w.push(ix.get(c));between=""}else between+=c}if(w.length)groups.push(w);const target=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);if(groups.flat().slice(0,target.length).join()!=target.join())throw Error("source mismatch");
const lo=gp.pages.filter(p=>p.page<23).reduce((s,p)=>s+p.indices.length,0),hi=lo+gp.pages.filter(p=>p.page>=23&&p.page<=26).reduce((s,p)=>s+p.indices.length,0);let k=0;const g=[];for(const w of groups){if(k>=lo&&k+w.length<=hi)g.push(w);else if(k<hi&&k+w.length>lo)throw Error("clipped");k+=w.length}if(g.length!==224||hi-lo!==1021)throw Error("count");
const n=224,m=n/2,B=16,tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);const out=[];for(const w of t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){let len=0;for(let j=0;j<w.length;){const v=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!v)throw Error("token");j+=v.t.length;len++}out.push(len)}return out}
function bin(x){return Math.min(B,x)-1}
const donors=raw.slice(2).map(native),train=donors.map(w=>w.slice(0,Math.floor(w.length/2)));
const C=Array.from({length:B},()=>new Float64Array(B)),marg=new Float64Array(B),row=new Float64Array(B);let total=0;for(const t of train){for(const x of t){marg[bin(x)]++;total++}for(let i=1;i<t.length;i++){const a=bin(t[i-1]),b=bin(t[i]);C[a][b]++;row[a]++}}
const p=Array.from(marg,x=>(x+1)/(total+B));const W=C.map((r,a)=>Array.from(r,(x,b)=>Math.log((x+20*p[b])/(row[a]+20)/p[b])));
function sum(t){let s=0;for(let i=1;i<t.length;i++)s+=W[bin(t[i-1])][bin(t[i])];return s}
function weave(t){const a=[];for(let i=0;i<m;i++)a.push(t[i],t[i+m]);return a}
function deweave(t){return [t.filter((_,i)=>i%2===0),t.filter((_,i)=>i%2===1)]}
function stats(t){const lanes=deweave(t),s=lanes.map(sum),base=sum(t.slice(0,m))+sum(t.slice(m)),recover=s[0]+s[1];return {lanes:s,base,recover,delta:recover-base}}
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
function shuffle(a,R){const t=a.slice();for(let j=t.length-1;j>0;j--){const i=R()%(j+1);[t[i],t[j]]=[t[j],t[i]]}return t}
function gate(t,R,draws){const s=stats(t);let sr=0,sd=0;for(let j=0;j<draws;j++){const q=stats(shuffle(t,R));if(q.recover>=s.recover)sr++;if(q.delta>=s.delta)sd++}const pRecover=(1+sr)/(draws+1),pDelta=(1+sd)/(draws+1);return {...s,pRecover,pDelta,pass:pRecover<=.05&&pDelta<=.05}}
const control=[];for(let d=0;d<donors.length;d++){const t=donors[d],first=Math.floor(t.length/2);for(let k=first,kid=0;k+n<=t.length&&kid<40;k+=n,kid++){const native=t.slice(k,k+n);const objects=native.map((length,i)=>({length,i})),v=weave(objects),z=deweave(v).flat();if(z.some((x,i)=>x!==objects[i]))throw Error("object inverse");control.push({d,k,kid,label:"woven",t:weave(native)},{d,k,kid,label:"unwoven",t:native})}}
const mixed=shuffle(control,rng(0x33012720));const evals=mixed.map((v,i)=>({...v,t:undefined,...gate(v.t,rng((0x72a00000+i)>>>0),199)}));
const perDonor=donors.map((_,d)=>Object.fromEntries(["woven","unwoven"].map(l=>{const a=evals.filter(x=>x.d===d&&x.label===l);return [l,{n:a.length,pass:a.filter(x=>x.pass).length,meanRecover:a.reduce((s,x)=>s+x.recover,0)/a.length,meanDelta:a.reduce((s,x)=>s+x.delta,0)/a.length}]})));
const original=gate(g.map(w=>w.length),rng(0x33012721),9999);
const perm=deweave(g).flat();if(weave(perm).some((x,i)=>x!==g[i]))throw Error("original replay");return {model:{B,alpha:20,trainGroups:train.map(x=>x.length),donorGroups:donors.map(x=>x.length)},controls:perDonor,original,originalGroups:g.length,originalRunes:hi-lo,originalMax:Math.max(...g.map(x=>x.length)),total:{wovenPass:evals.filter(x=>x.label==="woven"&&x.pass).length,unwovenPass:evals.filter(x=>x.label==="unwoven"&&x.pass).length,perLabel:evals.length/2},controlDetails:evals}}
if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
module.exports={experiment};
