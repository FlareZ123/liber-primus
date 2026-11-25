"use strict";
const fs=require("node:fs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt","resources/transcriptions/lp2-image-corrected.txt"];
function experiment(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const assert=(v,m)=>{if(!v)throw Error(m)}, mod=x=>(x+29)%29,id=w=>String.fromCharCode(...w.map(x=>65+x)), nums=s=>Array.from(s,x=>x.charCodeAt(0)-65);
 const canon=K=>{let b=Infinity;for(let s=0;s<8;s++){let k=0;for(let j=0;j<8;j++)k=k*29+K[(s+j)&7];if(k<b)b=k}return b};
 const unkey=k=>{let a=Array(8);for(let i=7;i>=0;i--){a[i]=k%29;k=Math.floor(k/29)}return a};
 function word(w,alt=true){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));assert(q,"donor spelling");o.push(q.i);j+=q.t.length;}return o;}
 function body(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length);}
 const donors=raw.slice(2,5).map(t=>(body(t).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>word(w))),training=donors.map(w=>w.slice(0,Math.floor(w.length*.8)));
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))training.push((s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(t=>[...t].map(x=>ix.get(x))).filter(w=>w.every(Number.isInteger)));
 const types=new Set(Array.from({length:29},(_,x)=>String.fromCharCode(65+x)));
 for(const a of training)for(const w of a)if(w.length&&w.length<=24)types.add(id(w));
 for(const ln of raw[5].split(/\r?\n/)){const m=ln.match(/^([a-z]+)\s+(\d+)$/i);if(!m)continue;for(const alt of [true,false]){const k=id(word(m[1],alt));if(k.length<=24)types.add(k);}}
 assert(types.size===35944,"dict "+types.size);
 const bylen=Array.from({length:25},()=>[]);
 for(const t of types){const w=nums(t);if(w.filter(x=>x!==0).length>=8)bylen[w.length].push(w)}
 let gs=[],w=[],sep="";
 for(const c of raw[6]){if(ix.has(c)){if(w.length&&/[-.&]/u.test(sep)){gs.push(w);w=[]}w.push(ix.get(c));sep=""}else sep+=c}if(w.length)gs.push(w);
 const target=gp.pages.filter(x=>x.page<56).flatMap(x=>x.indices);
 assert(gs.flat().slice(0,target.length).join()===target.join(),"tape");
 let n=0,orig=[];for(const w of gs){if(n>=target.length)break;orig.push({off:n,C:w});n+=w.length}assert(n===12956&&orig.length===2896,"counts");
 const scopes=[[0,3],[3,8],[8,15],[15,23],[23,27],[27,33],[33,40],[40,54],[54,56]];
 const blocks=scopes.map(([lo,hi])=>{const s=gp.pages.filter(p=>p.page<lo).reduce((a,p)=>a+p.indices.length,0),e=gp.pages.filter(p=>p.page<hi).reduce((a,p)=>a+p.indices.length,0);return {lo,hi:hi-1,rows:orig.filter(x=>x.off>=s&&x.off<e)}});
 function variants(C){return [{D:C,cut:-1},...C.map((_,i)=>({D:C.slice(0,i).concat(C.slice(i+1)),cut:i}))]}
 function candidates(C){const keys=new Set();for(const {D} of variants(C)){if(D.length>24)continue;for(const P of bylen[D.length]){let K=Array(8).fill(-1),t=0,ok=true;for(let i=0;i<D.length;i++){if(P[i]===0){if(D[i]!==0){ok=false;break}continue}const j=t++&7,v=mod(D[i]-P[i]);if(K[j]>=0&&K[j]!==v){ok=false;break}K[j]=v}if(ok&&t>=8)keys.add(canon(K));}}return keys}
 function decode(C,K,all=false){const out=[];for(const {D,cut} of variants(C)){if(!D.length)continue;for(let s=0;s<8;s++){function walk(i,p,w){if(i===D.length){if(types.has(w)){out.push({word:w,s,p,cut});return !all}return false}const c=D[i];if(c===0&&walk(i+1,p,w+"A"))return true;const x=mod(c-K[p]);return x!==0&&walk(i+1,(p+1)&7,w+String.fromCharCode(65+x));}if(walk(0,s,"")&&!all)return out;}}return out}
 function search(rows,budget){const anchors=rows.filter(x=>x.C.filter(v=>v!==0).length>=9);const need=anchors.length-budget;if(need<1)return {groups:rows.length,anchors:anchors.length,budget,need,decision:"anchor census insufficient"};const map=new Map(),sizes=[];for(const {C} of anchors){let a=candidates(C);sizes.push(a.size);for(const k of a)map.set(k,(map.get(k)||0)+1)}let max=0,passing=[];for(const [k,v] of map){max=Math.max(max,v);if(v>=need)passing.push(k)}const complete=[];let best=0,fullEvaluated=0;for(const key of passing){const K=unkey(key);let covered=0,miss=0;for(const row of rows){if(decode(row.C,K).length)covered++;else if(++miss>budget)break;}fullEvaluated++;best=Math.max(best,covered);if(miss<=budget)complete.push({key,K,covered});}return {groups:rows.length,anchors:anchors.length,budget,need,anchorCandidateSizes:sizes,keys:map.size,maxAnchorSupport:max,anchorPass:passing.length,fullEvaluated,bestPartialCoverage:best,complete}}
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;}}
 function encode(P,K,s){const C=[];for(const p of P){if(p===0)C.push(0);else{C.push(mod(p+K[s]));s=(s+1)&7}}return C}
 const p56=gold.sections.find(s=>s.name==="p56_an_end").source_text;let prime=[],j=0;for(let p=2;prime.length<100;p++){let ok=true;for(let d=2;d*d<=p;d++)if(p%d===0){ok=false;break}if(ok)prime.push((p-1)%29)}const native=[...p56].filter(c=>ix.has(c)).map(c=>ix.get(c));assert(native.map(x=>x===0?0:mod(x+prime[j++])).join()===gp.pages[56].indices.join(),"native p56 clock");
 // Four independent exact inverse controls. Each uses a held-out donor pool;
 // anchor lengths and no-Fehu eligibility are imposed independently of recovered key.
 const controls=[];for(let t=0;t<3;t++){let R=rng(0x120c0000+t),K=Array.from({length:8},()=>R()%29),pool=donors[t].slice(Math.floor(donors[t].length*.8)).filter(w=>types.has(id(w))&&w.length>=1&&w.length<=18),long=pool.filter(w=>w.length>=9&&w.filter(x=>x!==0).length>=9),rows=[];assert(long.length>0,"long donors");for(let i=0;i<80;i++){let P=(i<16?long:pool)[R()%(i<16?long.length:pool.length)],s=R()%8,C=encode(P,K,s),cut=-1;if(R()%100<45){cut=R()%(C.length+1);C.splice(cut,0,R()%29)}rows.push({P,C,s,cut})}for(let i=rows.length-1;i>0;i--){let j=R()%(i+1);[rows[i],rows[j]]=[rows[j],rows[i]]}
 let res=search(rows,4),ck=canon(K),recovered=res.complete?.find(x=>x.key===ck);assert(recovered,"control key missing");let exact=0,unique=0,phaseAndCut=0,replays=0;for(const x of rows){let a=decode(x.C,recovered.K,true),truth=a.find(y=>y.word===id(x.P)&&y.cut===x.cut&&encode(x.P,recovered.K,y.s).join()===variants(x.C).find(v=>v.cut===x.cut).D.join());if(truth){exact++;phaseAndCut++;let c=encode(x.P,recovered.K,truth.s);if(truth.cut>=0)c.splice(truth.cut,0,x.C[truth.cut]);if(c.join()===x.C.join())replays++}if(new Set(a.map(y=>y.word)).size===1)unique++}assert(exact===rows.length&&replays===rows.length,"control replay");controls.push({seed:t,actualKey:ck,anchors:res.anchors,keyCandidates:res.keys,passing:res.complete.length,exact,unique,phaseAndCut,replays})}
 const original=blocks.map(b=>({lo:b.lo,hi:b.hi,...search(b.rows,Math.floor(b.rows.length*.05))}));
 return {lexicon:types.size,nativeP56:native.length,controls,original};
}
if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
module.exports={experiment};
