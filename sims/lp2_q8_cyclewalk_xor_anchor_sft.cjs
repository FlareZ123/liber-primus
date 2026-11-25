"use strict";
// Exact q8 cycle-walk XOR receiver, #2726.
function experiment(raw){
const alphabet=[..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"],ix=new Map(alphabet.map((v,i)=>[v,i]));
const tokens="F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split(" ").map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
const id=w=>String.fromCharCode(...w.map(x=>65+x));const num=s=>[...s].map(x=>x.charCodeAt(0)-65);
const assert=(v,m)=>{if(!v)throw Error(m)};
function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]).map(w=>{const p=[];for(let j=0;j<w.length;){const v=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));assert(v,"unmapped "+w);p.push(v.i);j+=v.t.length}return p})}
function words(t){return (t.match(/\p{Script=Runic}+/gu)||[]).map(w=>[...w].map(x=>ix.get(x)))}
const donors=raw.slice(2).map(native),dict=new Set();
for(const d of donors)for(const w of d.slice(0,Math.floor(d.length*.8)))if(w.length<=24)dict.add(id(w));
for(const s of JSON.parse(raw[1]).sections)if(!["0_welcome","jpg107-167"].includes(s.name))for(const w of words(s.source_text))dict.add(id(w));
assert(dict.size===10842,"dict "+dict.size);
const byLength=new Map();for(const w of dict){if(!byLength.has(w.length))byLength.set(w.length,[]);byLength.get(w.length).push(num(w))}
const T=Array.from({length:32},(_,m)=>Array.from({length:29},(_,p)=>(p^m)<29?p^m:p));
const D=Array.from({length:29},(_,p)=>Array.from({length:29},(_,c)=>T.reduce((b,t,m)=>t[p]===c?b|(1<<m):b,0)));
for(let m=0;m<32;m++)for(let p=0;p<29;p++)assert(T[m][T[m][p]]===p,"not involution");
assert(new Set(T.map(t=>t.slice(1).join(","))).size===32,"duplicate effective mask");
function code(K){let best=Infinity;for(let i=0;i<8;i++){let z=0;for(let j=0;j<8;j++)z=z*32+K[(i+j)%8];if(z<best)best=z}return best}
function decode(z){const K=Array(8);for(let j=7;j>=0;j--){K[j]=z%32;z=Math.floor(z/32)}return K}
function encode(P,K,s){const C=[];for(const p of P){C.push(p===0?0:T[K[s]][p]);if(p!==0)s=(s+1)%8}return {C,s}}
function anchor(c){
const out=new Set(),K=Array(8);
for(const p of byLength.get(c.length)||[]){
  const m=Array(8).fill(-1);let s=0,ok=true;
  for(let j=0;j<p.length;j++){if(p[j]===0){if(c[j]!==0){ok=false;break}}else{m[s]&=D[p[j]][c[j]];if(!m[s]){ok=false;break}s=(s+1)%8}}
  if(!ok)continue;
  function visit(j){if(j===8){out.add(code(K));return}let bits=m[j]>>>0;while(bits){const low=bits&-bits;K[j]=31-Math.clz32(low);visit(j+1);bits=(bits^low)>>>0}}
  visit(0);
}
return out}
function options(C,K,first=false){const out=new Set();let found=false;for(let s=0;s<8&&! (first&&found);s++){function visit(i,phase,word){if(first&&found)return;if(i===C.length){if(dict.has(word)){out.add(word);found=true}return}const c=C[i];if(c===0)visit(i+1,phase,word+"A");const p=T[K[phase]][c];if(p!==0)visit(i+1,(phase+1)%8,word+String.fromCharCode(65+p))}visit(0,s,"")}return out}
function infer(groups,budget){const eligible=groups.map((c,i)=>({i,c,n:c.filter(x=>x!==0).length})).filter(x=>x.n>=8).sort((a,b)=>b.n-a.n||a.i-b.i);if(eligible.length<=budget)return {status:"insufficient anchors",eligible:eligible.length};const anchors=eligible.slice(0,budget+1),keys=new Set(),counts=[];for(const x of anchors){const k=anchor(x.c);counts.push([x.i,k.size]);for(const z of k)keys.add(z)}
const order=[...eligible.map(x=>x.i),...groups.map((_,i)=>i).filter(i=>!eligible.some(x=>x.i===i))];const accepted=[];let evaluated=0,largestPartial=0;
for(const z of keys){const K=decode(z);let miss=0,hit=0;for(const i of order){if(options(groups[i],K,true).size)hit++;else if(++miss>budget)break}largestPartial=Math.max(largestPartial,hit);evaluated++;if(miss<=budget)accepted.push({K,covered:hit})}
return {status:"complete",eligible:eligible.length,anchors:counts,candidates:keys.size,evaluated,largestPartial,accepted}}
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
function shuffle(x,R){x=x.slice();for(let i=x.length-1;i>0;i--){const j=R()%(i+1);[x[i],x[j]]=[x[j],x[i]]}return x}
const controls=[];
for(let d=0;d<donors.length;d++){
 const donor=donors[d],R=rng(0x33012726+d),K=Array.from({length:8},()=>R()%32);let selected=null;
 for(let start=Math.floor(donor.length*.8);start+66<=donor.length;start++){
  const p=donor.slice(start,start+66),fit=p.slice(0,49),held=p.slice(49);
  if(fit.filter(w=>!dict.has(id(w))).length>3||held.filter(w=>!dict.has(id(w))).length>2)continue;
  let s=0;const pairs=p.map(P=>{const e=encode(P,K,s);s=e.s;return {P,C:e.C}});
  if(pairs.slice(0,49).filter(x=>x.C.filter(c=>c!==0).length>=8).length<4)continue;
  selected={start,fit:shuffle(pairs.slice(0,49),R),held:shuffle(pairs.slice(49),R)};break;
 }
 assert(selected,"no plant "+d);const fit=selected.fit,held=selected.held;
 const res=infer(fit.map(x=>x.C),3);const trueKey=res.accepted.find(x=>code(x.K)===code(K));assert(trueKey,"true key missing "+d);
 const hold=held.map(x=>options(x.C,trueKey.K));const exact=held.filter((x,i)=>hold[i].size===1&&hold[i].has(id(x.P))).length;
 const retained=held.filter((x,i)=>hold[i].has(id(x.P))).length;
 const inReg=held.filter(x=>dict.has(id(x.P))).length;
 assert(retained===inReg,"true word missing");
 let nullRes, nullDraws=0; do {const unrelated=fit.map(x=>encode(x.P,Array.from({length:8},()=>R()%32),R()%8).C);nullRes=infer(unrelated,3);nullDraws++;} while(nullRes.status==='insufficient anchors'&&nullDraws<64);
 controls.push({d,start:selected.start,K,fitOOV:fit.filter(x=>!dict.has(id(x.P))).length,heldOOV:held.length-inReg,heldRunes:held.reduce((s,x)=>s+x.P.length,0),heldUniqueRunes:held.reduce((s,x,i)=>s+(hold[i].size===1&&hold[i].has(id(x.P))?x.P.length:0),0),heldRetained:retained,heldUnique:exact,fit:res,null:nullRes,nullDraws});
}
const calibrated=controls.every(x=>x.fit.accepted.length===1&&x.heldUnique>=12&&x.null.status==="complete"&&!x.null.accepted.length);
if(!calibrated)return {dictionary:dict.size,controls,calibrated};
const pages=raw[0].split("%"),g=words(pages.slice(53,55).join("").replace(/[/\s]/g,"")),prefix=words(pages[53].replace(/[/\s]/g,"")).slice(0,-1);
assert(g.length===66&&g.flat().length===308&&prefix.length===49,"original groups "+g.length+"/"+prefix.length);
assert(prefix.every((w,i)=>id(w)===id(g[i])),"prefix mismatch");
const fit=infer(prefix,3);const hold=fit.accepted.map(x=>({K:x.K,words:g.slice(prefix.length).map(c=>[...options(c,x.K)])}));
return {dictionary:dict.size,controls,calibrated,original:{fitGroups:prefix.length,heldGroups:g.length-prefix.length,fit,hold}};
}
const fs=require("node:fs");
const paths=["resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
