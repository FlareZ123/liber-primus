"use strict";
// Exact length-conditioned secret-vector lexical bound; source and controls pinned below.
const fs=require("node:fs");
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/transcriptions/lp2-image-corrected.txt",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/english_wordfreq_textblob.txt"
];
function experiment(raw) {
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[2]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length),mod=x=>(x%29+29)%29,code=w=>String.fromCharCode(...w),decode=s=>Array.from(s,x=>x.charCodeAt(0));
 function runeWords(t,sep){const out=[];let w=[],between="";for(const c of t){if(ix.has(c)){if(w.length&&sep.test(between)){out.push(w);w=[]}w.push(ix.get(c));between=""}else between+=c}if(w.length)out.push(w);return out}
 function spell(word,alt){const w=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S"),p=[];for(let j=0;j<w.length;){const v=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!v)throw Error("unknown dictionary token "+w);p.push(v.i);j+=v.t.length;}return p;}
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>spell(w,true));}
 const donors=raw.slice(3,6).map(native), training=donors.map(w=>w.slice(0,Math.floor(w.length*.8))),holdNames=["0_welcome","jpg107-167","p56_an_end","p57_parable"];
 for(const s of gold.sections)if(!holdNames.includes(s.name))training.push(runeWords(s.source_text,/[^\u16a0-\u16ff]/u));
 const vocab=new Map();function add(w){if(w.length&&w.length<=24)vocab.set(code(w),w);}
 for(const w of training.flat())add(w);
 for(const line of raw[6].split(/\r?\n/)){const match=/^([a-z]+) (\d+)$/.exec(line);if(match)for(const alt of [false,true])add(spell(match[1],alt));}
 for(let i=0;i<29;i++)add([i]);
 const byLen=new Map();for(const w of vocab.values()){if(!byLen.has(w.length))byLen.set(w.length,[]);byLen.get(w.length).push(w);}
 const groups=runeWords(raw[1],/[-.&]/u),flat=groups.flat(),orig=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
 if(flat.slice(0,12956).join()!==orig.join())throw Error("source mismatch");
 function region(a,b){const lo=gp.pages.filter(p=>p.page<a).reduce((s,p)=>s+p.indices.length,0),hi=gp.pages.filter(p=>p.page<=b).reduce((s,p)=>s+p.indices.length,0);let k=0;const out=[];for(const w of groups){if(k>=lo&&k+w.length<=hi)out.push(w);else if(k<hi&&k+w.length>lo)throw Error("clipped chapter "+a+"-"+b);k+=w.length}return out;}
 function bound(cs,fhold=false){const by=new Map();let free=0;
 for(const c of cs){if(fhold&&c.includes(0)){free++;continue}if(!by.has(c.length))by.set(c.length,new Map());const b=by.get(c.length),id=code(c);b.set(id,(b.get(id)||0)+1);}
 const detail=[];let upper=free;const keys=new Map();
 for(const [len,cts] of [...by.entries()].sort((a,b)=>a[0]-b[0])){const n=[...cts.values()].reduce((a,b)=>a+b,0),ps=(byLen.get(len)||[]).filter(p=>!fhold||!p.includes(0)),hist=new Map();
 for(const [id,m] of cts){const c=decode(id);for(const p of ps){const k=code(c.map((x,i)=>mod(x-p[i])));hist.set(k,(hist.get(k)||0)+m);}}
 let max=0,winner=null,ties=0;for(const [k,v] of hist){if(v>max){max=v;winner=k;ties=1}else if(v===max){ties++;if(k<winner)winner=k;}}
 if(winner!==null)keys.set(len,decode(winner));upper+=max;detail.push({len,n,distinct:cts.size,lexicon:ps.length,max,ties,keys:hist.size});}
 return {n:cs.length,free,upper,missing:cs.length-upper,allowance:Math.floor(cs.length*.05),detail,keys};}
 const regions=[[0,2,158],[3,7,255],[8,14,383],[15,22,437],[23,26,224],[27,32,326],[33,39,378],[40,53,669],[54,55,66]],strip=({keys,...rest})=>rest;
 const results=regions.map(([a,b,n])=>{const c=region(a,b);if(c.length!==n)throw Error("group count "+a+" "+c.length);return{a,b,ordinary:strip(bound(c)),literalF:strip(bound(c,true))}});
 const book=region(0,55);if(book.length!==2896)throw Error("book count");
 const controls=[];
 for(const name of holdNames){const p=runeWords(gold.sections.find(x=>x.name===name).source_text,/[^\u16a0-\u16ff]/u);const ks=new Map(p.map(w=>[w.length,Array.from({length:w.length},(_,i)=>mod(7*w.length+11*i+3*i*i+name.length))]));
 for(const fhold of [false,true]){
 const enc=w=>{let j=0;return w.map(x=>fhold&&x===0?0:mod(x+ks.get(w.length)[j++]))};
 const c=p.map(enc),cut=Math.floor(p.length*.7),fit=bound(c.slice(0,cut),fhold),all=bound(c,fhold);
 let trueEligible=0,exactKeyLengths=0,seen=0,predicted=0,correct=0;
 for(let i=0;i<p.length;i++)if(vocab.has(code(p[i]))&&(!fhold||!c[i].includes(0)))trueEligible++;
 if(all.upper<trueEligible+all.free)throw Error("true key violated bound");
 for(const [l,k] of fit.keys){seen++;if(code(k)===code(ks.get(l)))exactKeyLengths++;}
 for(let i=cut;i<p.length;i++){if(fhold&&c[i].includes(0))continue;const k=fit.keys.get(p[i].length);if(!k)continue;predicted++;const dec=c[i].map((x,j)=>mod(x-k[j]));if(code(dec)===code(p[i]))correct++;if(code(dec.map((x,j)=>mod(x+k[j])))!==code(c[i]))throw Error("replay");}
 controls.push({name,fhold,groups:p.length,eligibleLexical:trueEligible,fit:strip(fit),full:strip(all),seen,exactKeyLengths,predicted,correct});
 }}
 let toyChecks=0;for(let t=0;t<32;t++){const a=3,ps=Array.from({length:27},(_,x)=>[Math.floor(x/9),Math.floor(x/3)%3,x%3]).filter((_,i)=>(i*13+t*7)%11<4),cs=Array.from({length:8},(_,i)=>[(i+t)%3,(i*i+t)%3,(i*5+t*t)%3]);const map=new Map();for(const c of cs)for(const p of ps){const key=c.map((v,i)=>(v-p[i]+a)%a).join();map.set(key,(map.get(key)||0)+1);}let exact=0;for(let x=0;x<27;x++){const k=[Math.floor(x/9),Math.floor(x/3)%3,x%3];exact=Math.max(exact,cs.filter(c=>ps.some(p=>p.every((v,i)=>(v+k[i])%a===c[i]))).length);}if(Math.max(0,...map.values())!==exact)throw Error("toy failure");toyChecks++;}
 return {vocab:vocab.size,toyChecks,book:{ordinary:strip(bound(book)),literalF:strip(bound(book,true))},regions:results,controls};
}
if(require.main===module){console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));}
module.exports={experiment};
