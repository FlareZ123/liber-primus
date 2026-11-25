"use strict";
const fs=require("node:fs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt","resources/transcriptions/lp2-image-corrected.txt"];
function extension(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const assert=(v,m)=>{if(!v)throw Error(m)},mod=x=>(x+29)%29,id=w=>String.fromCharCode(...w.map(x=>65+x)),nums=s=>Array.from(s,x=>x.charCodeAt(0)-65);
 function word(w,alt=true){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));assert(q,"donor spelling");o.push(q.i);j+=q.t.length;}return o;}
 function body(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length);}
 const donors=raw.slice(2,5).map(t=>(body(t).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>word(w))),training=donors.map(w=>w.slice(0,Math.floor(w.length*.8)));
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))training.push((s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(t=>[...t].map(x=>ix.get(x))).filter(w=>w.every(Number.isInteger)));
 const types=new Set(Array.from({length:29},(_,x)=>String.fromCharCode(65+x)));
 for(const a of training)for(const w of a)if(w.length&&w.length<=24)types.add(id(w));
 for(const ln of raw[5].split(/\r?\n/)){const m=ln.match(/^([a-z]+)\s+(\d+)$/i);if(!m)continue;for(const alt of [true,false]){const k=id(word(m[1],alt));if(k.length<=24)types.add(k);}}
 assert(types.size===35944,"dict "+types.size);
 const bylen=Array.from({length:25},()=>[]);for(const t of types){const w=nums(t);if(w.filter(x=>x!==0).length>=7)bylen[w.length].push(w)}
 let gs=[],w=[],sep="";for(const c of raw[6]){if(ix.has(c)){if(w.length&&/[-.&]/u.test(sep)){gs.push(w);w=[]}w.push(ix.get(c));sep=""}else sep+=c}if(w.length)gs.push(w);
 const target=gp.pages.filter(x=>x.page<56).flatMap(x=>x.indices);assert(gs.flat().slice(0,target.length).join()===target.join(),"tape");
 let n=0,orig=[];for(const w of gs){if(n>=target.length)break;orig.push({off:n,C:w});n+=w.length}assert(n===12956&&orig.length===2896,"counts");
 const a=gp.pages.filter(p=>p.page<15).reduce((s,p)=>s+p.indices.length,0),b=gp.pages.filter(p=>p.page<23).reduce((s,p)=>s+p.indices.length,0);
 const rows=orig.filter(x=>x.off>=a&&x.off<b);assert(rows.length===437,"scope");
 function variants(C){return [C,...C.map((_,i)=>C.slice(0,i).concat(C.slice(i+1)))]}
 function cand(C){const set=new Set;for(const D of variants(C)){if(D.length>24)continue;for(const P of bylen[D.length]){let K=Array(8).fill(-1),t=0,ok=true;for(let i=0;i<D.length;i++){if(P[i]===0){if(D[i]!==0){ok=false;break}continue}const j=t++&7,v=mod(D[i]-P[i]);if(K[j]>=0&&K[j]!==v){ok=false;break}K[j]=v}if(ok&&t>=7)set.add(K.slice(0,7).reduce((s,v)=>s*29+v,0));}}return set}
 function bound(rows,budget){const anchors=rows.filter(x=>x.C.filter(v=>v!==0).length>=8);const m=new Map;for(const {C} of anchors)for(const k of cand(C))m.set(k,(m.get(k)||0)+1);const top=Array(8).fill(0);let hist={};for(const v of m.values()){hist[v]=(hist[v]||0)+1;if(v>top[7]){top[7]=v;top.sort((a,b)=>b-a)}}return {groups:rows.length,anchors:anchors.length,required:anchors.length-budget,budget,keys7:m.size,hist,top,upper:top.reduce((a,b)=>a+b,0)}}
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
 const controls=[];for(let d=0;d<3;d++){const R=rng(0x43bad00+d),pool=donors[d].slice(Math.floor(donors[d].length*.8)).filter(w=>types.has(id(w))&&w.length>=8&&w.length<=16&&w.filter(x=>x!==0).length>=8);assert(pool.length,"pool");let K=Array.from({length:8},()=>R()%29),rs=[];for(let j=0;j<60;j++){const P=pool[R()%pool.length];let p=R()%8,start=p,C=P.map(x=>{if(x===0)return 0;let y=mod(x+K[p]);p=(p+1)&7;return y});if(R()%2)C.splice(R()%(C.length+1),0,R()%29);if(C.filter(x=>x!==0).length>=8){const key7=Array.from({length:7},(_,i)=>K[(start+i)&7]).reduce((s,v)=>s*29+v,0);assert(cand(C).has(key7),"true 7tuple missing")}rs.push({C})}const res=bound(rs,3);assert(res.upper>=res.required,"plant bound false negative");controls.push(res)}
 return {controls,original:bound(rows,21)}
}
if(require.main===module)console.log(JSON.stringify(extension(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
module.exports={extension};
