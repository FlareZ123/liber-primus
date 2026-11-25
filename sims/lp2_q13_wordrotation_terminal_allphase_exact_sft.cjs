"use strict";
const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt","resources/liber-primus/lp2-transcription.txt"];
function run(raw, mode='original'){
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

 const T=13,budget=3,rotate=(a,r)=>a.slice(r).concat(a.slice(0,r)),pad=s=>s+"?".repeat(T-s.length);
 const canon=k=>Array.from({length:T},(_,i)=>k.slice(i)+k.slice(0,i)).sort()[0];
 function local(C){const out=new Set();for(let r=0;r<C.length;r++){const c=rotate(C,r);for(const p of byLen[C.length]){if(p.includes(0))continue;out.add(id(c.map((v,i)=>mod(v-p[i]))));}}return out;}
 function seeds(C){const out=new Set();for(let r=0;r<C.length;r++){const c=rotate(C,r);for(const p of byLen[C.length]){let k=[],ok=true;for(let i=0;i<p.length;i++){if(p[i]===0){if(c[i]!==0){ok=false;break;}}else k.push(mod(c[i]-p[i]));}if(ok&&k.length<=T)out.add(pad(id(k)));}}return [...out];}
 function phaseInfo(k,n,s){const locations=[],known=[],unknown=[];for(let i=0;i<n;i++){const j=(s+i)%T;locations.push(j);(k[j]==="?"?unknown:known).push(i);}return {locations,known,unknown};}
 function projection(s,indices){let a="";for(const i of indices)a+=s[i];return a;}
 function index(a,known){const mask=known.reduce((x,i)=>x|(1<<i),0);if(a.cache.has(mask))return a.cache.get(mask);const M=new Map();for(const d of a.d){const p=projection(d,known),v=M.get(p);if(v===undefined)M.set(p,d);else if(typeof v==="string")M.set(p,[v,d]);else v.push(d);}a.cache.set(mask,M);return M;}
 function options(a,k,collect=false){
  const kk=k+k,n=a.n;let count=0,merges=collect?new Set():null;
  for(let s=0;s<T;s++){const p=kk.slice(s,s+n);if(!p.includes("?")&&a.d.has(p))return {status:2,count:0,merges:null};}
  for(let s=0;s<T;s++){const p=kk.slice(s,s+n);if(!p.includes("?"))continue;const info=phaseInfo(k,n,s),v=index(a,info.known).get(projection(p,info.known));if(v===undefined)continue;if(!collect)return {status:1,count:1};const arr=typeof v==="string"?[v]:v;count+=arr.length;for(const d of arr){const z=k.split("");for(const i of info.unknown)z[info.locations[i]]=d[i];merges.add(z.join(""));}}
  return {status:count?1:0,count,merges};
 }
 function groupDomain(C,K,all=false){
  const out=new Set();for(let s=0;s<T;s++)for(let r=0;r<C.length;r++){const c=rotate(C,r);
   function rec(j,t,p){if(j===c.length){const word=id(p);if(!types.has(word))return false;out.add(word);return !all;}
    if(c[j]===0){p.push(0);if(rec(j+1,t,p))return true;p.pop();}
    const x=mod(c[j]-K[t]);if(x){p.push(x);if(rec(j+1,(t+1)%T,p))return true;p.pop();}return false;}
   if(rec(0,s,[]))return out;
  }return out;
 }
 function solve(rows){
  const anchors=rows.filter(r=>r.C.length>=7&&!r.C.includes(0)).map(r=>({off:r.off,n:r.C.length,d:local(r.C),cache:new Map()})).sort((a,b)=>b.n-a.n);
  const long=rows.filter(r=>r.C.length>=10).sort((a,b)=>b.C.length-a.C.length);
  if(long.length!==4||anchors.length!==11)throw Error("shape");
  const need=anchors.length-budget,seen=new Set(),keys=new Map(),fullAnchor=new Set(),stats={states:0,fullStates:0,anchorPass:0,joined:0,completionDigits:0,seedCounts:[],cacheIndexes:0};
  const rowsSorted=rows.slice().sort((a,b)=>b.C.length-a.C.length);
  function full(k){stats.fullStates++;const c=canon(k);if(fullAnchor.has(c))return;let supported=0,left=anchors.length;for(const a of anchors){left--;let yes=false;const kk=k+k;for(let s=0;s<T;s++){if(a.d.has(kk.slice(s,s+a.n))){yes=true;break;}}if(yes)supported++;if(supported+left<need)return;}
   stats.anchorPass++;fullAnchor.add(c);const K=nums(c);let oov=0;for(const row of rowsSorted){if(!groupDomain(row.C,K).size&&++oov>budget)return;}keys.set(c,{oov});
  }
  function expand(k){const at=k.indexOf("?");if(at===-1){full(k);return;}for(let x=0;x<Q;x++){stats.completionDigits++;expand(k.slice(0,at)+String.fromCharCode(65+x)+k.slice(at+1));}}
  function rec(k){
   if(seen.has(k))return;seen.add(k);stats.states++;if(stats.states>5000000)throw Error("state cap");
   if(!k.includes("?")){full(k);return;}
   let guaranteed=0,possible=[];for(let i=0;i<anchors.length;i++){const a=anchors[i],z=options(a,k);if(z.status===2)guaranteed++;else if(z.status===1)possible.push(i);if(guaranteed+possible.length+(anchors.length-i-1)<need)return;}
   if(guaranteed>=need){expand(k);return;}
   const choose=possible.length-(need-guaranteed)+1;
   // Any satisfactory completion must cover at least one of these chosen groups.
   // The longest-first order is fixed; every compatible extension is retained.
   for(const i of possible.slice(0,choose)){const z=options(anchors[i],k,true);if(z.status!==1)throw Error("status");for(const next of z.merges){if(next===k)throw Error("nonadvance");stats.joined++;rec(next);}}
  }
  for(const row of long){const D=seeds(row.C);const before=stats.states,at=keys.size;for(const k of D)rec(k);stats.seedCounts.push({off:row.off,n:row.C.length,prefixes:D.length,states:stats.states-before,newKeys:keys.size-at});}
  stats.cacheIndexes=anchors.reduce((s,a)=>s+a.cache.size,0);return {keys:[...keys].map(([k,v])=>({K:nums(k),...v})),stats,anchors:anchors.map(a=>[a.off,a.n,a.d.size])};
 }
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
 function plant(seed){const R=rng(seed),K=Array.from({length:T},()=>R()%Q),pool=Array.from({length:25},()=>[]);for(const D of donors)for(const p of D.slice(Math.floor(D.length*.8)))if(p.length<=24&&types.has(id(p)))pool[p.length].push(p);
  const rows=[];for(const row of terminal){const n=row.C.length,z=row.C.filter(x=>x===0).length;let found;for(let a=0;a<100000;a++){const p=pool[n][R()%pool[n].length],s=R()%T;let t=s;const c=p.map(x=>{if(x===0)return 0;const y=mod(x+K[t]);t=(t+1)%T;return y;});if(c.filter(x=>x===0).length!==z)continue;found={off:row.off,C:rotate(c,R()%n),P:p,s};break;}if(!found)throw Error("plant");rows.push(found);}
  for(let i=rows.length-1;i>0;i--){const j=R()%(i+1);[rows[i],rows[j]]=[rows[j],rows[i]];}return {rows,K};
 }
 if(mode==="original")return {mode,lex:types.size,...solve(terminal)};
 const seed=Number(mode),p=plant(seed),out=solve(p.rows),trueKey=nums(canon(id(p.K))),recover=out.keys.some(x=>id(x.K)===id(trueKey));let supported=0,unique=0;
 for(const row of p.rows){const d=groupDomain(row.C,trueKey,true);if(d.has(id(row.P)))supported+=row.P.length;if(d.size===1&&d.has(id(row.P)))unique+=row.P.length;}
 if(!recover||supported!==308)throw Error("control failed");return {mode,lex:types.size,trueKey,recover,supported,unique,...out};
}
console.log(JSON.stringify(run(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")),process.argv[2]||"original"),null,2));
