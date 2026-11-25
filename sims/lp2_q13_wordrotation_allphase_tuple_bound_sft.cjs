"use strict";
const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt","resources/liber-primus/lp2-transcription.txt"];
function run(raw){
 const Q=29,T=13,mod=x=>(x+29)%29,id=w=>String.fromCharCode(...w.map(x=>65+x)),nums=s=>Array.from(s,x=>x.charCodeAt(0)-65);
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function word(w,alt=true){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));if(!q)throw Error("native "+w);o.push(q.i);j+=q.t.length;}return o;}
 function body(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length);}
 const donors=raw.slice(2,5).map(t=>(body(t).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>word(w))),training=donors.map(w=>w.slice(0,Math.floor(w.length*.8)));
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))training.push((s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(t=>[...t].map(x=>ix.get(x))).filter(w=>w.every(Number.isInteger)));
 const types=new Set(Array.from({length:Q},(_,x)=>String.fromCharCode(65+x)));
 for(const a of training)for(const w of a)if(w.length&&w.length<=24)types.add(id(w));
 for(const ln of raw[5].split(/\r?\n/)){const m=ln.match(/^([a-z]+)\s+(\d+)$/i);if(!m)continue;for(const alt of [true,false]){const k=id(word(m[1],alt));if(k.length<=24)types.add(k);}}
 if(types.size!==35944)throw Error("lexicon "+types.size);
 const byLen=Array.from({length:25},()=>[]);for(const s of types)byLen[s.length].push(nums(s));
 const words=[];let w=[];for(const x of raw[6].split("%").slice(0,55).join("%")){if(ix.has(x))w.push(ix.get(x));else if(x!=="%"&&x!=="/"&&!/\s/u.test(x)&&w.length){words.push(w);w=[];}}if(w.length)words.push(w);
 const tape=gp.pages.filter(x=>x.page<56).flatMap(x=>x.indices);if(words.length!==2896||id(words.flat())!==id(tape))throw Error("source");
 let off=0;const terminal=[];for(const C of words){if(off>=12648)terminal.push({off,C});off+=C.length;}
 const fit=terminal.filter(x=>x.off+x.C.length<=12880),held=terminal.slice(fit.length);
 if(terminal.length!==66||fit.length!==49||held.length!==17)throw Error("split");

 const L=7,period=13,rotate=(a,r)=>a.slice(r).concat(a.slice(0,r));
 const prefixByLen=byLen.map(a=>[...new Set(a.filter(p=>p.length>=L&&!p.includes(0)).map(p=>id(p.slice(0,L))))].map(nums));
 function domains(C){
  const result=new Set(),P=prefixByLen[C.length];
  for(let r=0;r<C.length;r++){const c=rotate(C,r);for(const p of P){let k=0;for(let i=0;i<L;i++)k=k*29+mod(c[i]-p[i]);result.add(k);}}
  return result;
 }
 function bound(anchors,nWords){
  const all=[];for(const C of anchors)for(const k of domains(C))all.push(k);
  const a=Float64Array.from(all);a.sort();const hist=new Map();let distinct=0;for(let i=0;i<a.length;){let j=i+1;while(j<a.length&&a[j]===a[i])j++;const s=j-i;hist.set(s,(hist.get(s)||0)+1);distinct++;i=j;}
  const top=[];for(const [s,n] of [...hist.entries()].sort((a,b)=>b[0]-a[0])){const count=Math.min(n,period-top.length);for(let i=0;i<count;i++)top.push(s);}
  if(top.length!==Math.min(period,distinct))throw Error("top count");
  const upper=top.reduce((a,b)=>a+b,0),budget=Math.floor(nWords*.05),need=anchors.length-budget;
  return {anchors:anchors.length,nWords,budget,need,upper,top,distinct,events:a.length,excluded:upper<need};
 }
 const bounds=[0,3,8,15,23,27,33,40,54,56].map(p=>gp.pages.filter(x=>x.page<p).reduce((s,x)=>s+x.indices.length,0));let pos=0;const records=words.map(C=>{let r={pos,C};pos+=C.length;return r});
 const chapters=bounds.slice(0,-1).map((x,i)=>{const w=records.filter(r=>r.pos>=x&&r.pos+r.C.length<=bounds[i+1]);const anchors=w.filter(r=>r.C.length>=L&&!r.C.includes(0)).map(r=>r.C);return {i,w,anchors};});
 const output={L,period,lex:types.size,original:chapters.map(c=>({chapter:c.i,...bound(c.anchors,c.w.length)})),controls:[]};
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
 const pool=Array.from({length:25},()=>[]);for(const D of donors)for(const p of D.slice(Math.floor(D.length*.8)))if(p.length>=L&&p.length<=24&&!p.includes(0)&&types.has(id(p)))pool[p.length].push(p);
 for(const seed of [48130,48131,48132]){
  const c=chapters[7],R=rng(seed),K=Array.from({length:period},()=>R()%29),enc=[];
  for(const C of c.anchors){let found=false;for(let tries=0;tries<100000;tries++){const p=pool[C.length][R()%pool[C.length].length],s=R()%period;if(!p)throw Error("no donor");const z=p.map((x,j)=>mod(x+K[(s+j)%period]));if(z.includes(0))continue;const r=R()%z.length,rot=rotate(z,r);let k=0;for(let j=0;j<L;j++)k=k*29+K[(s+j)%period];if(!domains(rot).has(k))throw Error("true edge missing");const replay=rotate(rot,(z.length-r)%z.length).map((x,j)=>mod(x-K[(s+j)%period]));if(id(replay)!==id(p))throw Error("control replay");enc.push(rot);found=true;break;}if(!found)throw Error("plant failed");}
  for(let i=enc.length-1;i>0;i--){const j=R()%(i+1);[enc[i],enc[j]]=[enc[j],enc[i]];}const r=bound(enc,c.w.length);if(r.upper<enc.length)throw Error("false bound");output.controls.push({seed,key:K,exactSupported:enc.length,...r});
 }
 return output;
}
console.log(JSON.stringify(run(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
