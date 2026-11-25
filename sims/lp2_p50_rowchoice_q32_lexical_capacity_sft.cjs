'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-grid-256.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt","resources/liber-primus/lp2-transcription.txt"];
function experiment(raw){
 const gp=JSON.parse(raw[0]),grid=JSON.parse(raw[1]),gold=JSON.parse(raw[2]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const mod=x=>(x+29)%29, id=w=>String.fromCharCode(...w.map(x=>65+x)), nums=s=>Array.from(s,x=>x.charCodeAt(0)-65);
 function word(w,alt=true){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));if(!q)throw Error("native "+w);o.push(q.i);j+=q.t.length;}return o;}
 function body(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length);}
 const donors=raw.slice(3,6).map(t=>(body(t).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>word(w))),training=donors.map(w=>w.slice(0,Math.floor(w.length*.8)));
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))training.push((s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(t=>[...t].map(x=>ix.get(x))).filter(w=>w.every(Number.isInteger)));
 const types=new Set(Array.from({length:29},(_,x)=>String.fromCharCode(65+x)));
 for(const a of training)for(const w of a)if(w.length&&w.length<=24)types.add(id(w));
 for(const ln of raw[6].split(/\r?\n/)){const m=ln.match(/^([a-z]+)\s+(\d+)$/i);if(!m)continue;for(const alt of [true,false]){const k=id(word(m[1],alt));if(k.length<=24)types.add(k);}}
 if(types.size!==35944)throw Error("lexicon size "+types.size);
 const dict=Array.from({length:25},()=>[]);for(const s of types)dict[s.length].push(nums(s));
 const orig=[];let w=[];for(const x of raw[7].split("%").slice(0,55).join("%")){if(ix.has(x))w.push(ix.get(x));else if(x!=="%"&&x!=="/"&&!/\s/u.test(x)&&w.length){orig.push(w);w=[];}}if(w.length)orig.push(w);
 const tape=gp.pages.filter(x=>x.page<56).flatMap(x=>x.indices);if(orig.length!==2896||orig.flat().join()!==tape.join())throw Error("source mismatch");
 let off=0;const groups=orig.map(C=>{const r={off,C};off+=C.length;return r;});const fit=groups.filter(x=>x.off>=12648&&x.off+x.C.length<=12880);const tail=groups.filter(x=>x.off>=12648);
 const gt=grid.pages.flatMap(p=>p.tokens);const masks=base=>{const a=base===59?grid.alphabet.replace("f",""):grid.alphabet;const v=gt.map(t=>a.indexOf(t[0])*base+a.indexOf(t[1]));return Array.from({length:32},(_,r)=>v.slice(r*8,r*8+8).reduce((b,x)=>b|(1<<(x%29)),0));};
 // Per-group relation, union over all dictionary spellings. For F-hold, the plaintext
 // F is literally zero and doesn't consume. No phase repeats within words <=24.
 function relation(C,M,hold){
  const out=new Uint32Array(32);
  for(let s=0;s<32;s++)for(const P of (dict[C.length]||[])){
   let p=s,ok=true;for(let i=0;i<C.length;i++){const x=P[i],c=C[i];if(hold&&x===0){if(c!==0){ok=false;break;}}else{if(!(M[p]&(1<<mod(c-x)))){ok=false;break;}p=(p+1)&31;}}
   if(ok)out[s]|=1<<p;
  }return out;
 }
 function run(rows,M,hold){
  let dp=new Int16Array(32),cur=0,forced=0,trace=[]; // grant every initial phase
  for(const {off,C} of rows){const L=relation(C,M,hold),zero=hold?C.filter(x=>x===0).length:0;
   if(!L.some(x=>x!==0))forced++;
   const nd=new Int16Array(32).fill(30000);
   for(let s=0;s<32;s++){for(let h=0;h<=zero;h++){const t=(s+C.length-h)&31;nd[t]=Math.min(nd[t],dp[s]+1);}for(let t=0;t<32;t++)if(L[s]&(1<<t))nd[t]=Math.min(nd[t],dp[s]);}
   dp=nd;cur=Math.min(...dp);trace.push({off,length:C.length,minimum:cur,anyWord:L.some(x=>x!==0)});
  }return {groups:rows.length,allowance:Math.floor(.05*rows.length),forced,minimum:cur,trace};
 }
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
 const pool=Array.from({length:25},()=>[]);for(const D of donors)for(const P of D.slice(Math.floor(D.length*.8)))if(P.length<=24&&types.has(id(P)))pool[P.length].push(P);
 function plant(rows,M,hold,seed){const R=rng(seed),K=M.map(m=>{const a=Array.from({length:29},(_,i)=>i).filter(i=>m&(1<<i));return a[R()%a.length];});let s=R()%32,start=s;const res=rows.map(({off,C})=>{const P=pool[C.length][R()%pool[C.length].length];if(!P)throw Error("missing pool");const out=P.map(x=>{if(hold&&x===0)return 0;const v=mod(x+K[s]);s=(s+1)&31;return v;});return {off,C:out,P};});const d=run(res,M,hold);if(d.minimum!==0)throw Error("plant failed");return {seed,key:K,start,minimum:d.minimum,groups:d.groups};}
 const results=[];for(const base of [59,60])for(const hold of [false,true]){const M=masks(base),r=run(fit,M,hold),r2=run(tail,M,hold);results.push({base,hold,domainSizes:M.map(m=>Array.from({length:29},(_,i)=>i).filter(i=>m&(1<<i)).length),fit:r,terminal:r2,plants:[plant(fit,M,hold,3301+base),plant(fit,M,hold,761+base)]});}
 return {types:types.size,sourceGroups:groups.length,fitRunes:fit.flatMap(x=>x.C).length,terminalRunes:tail.flatMap(x=>x.C).length,results};
}
console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
