"use strict";
/** Agent9: exact projected-lexicon two-colour lifting CSP. Read-only. */
const fs=require("node:fs"),path=require("node:path");
function experiment(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const mod=x=>(x%29+29)%29,check=(v,m)=>{if(!v)throw Error(m)},same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]),id=w=>String.fromCharCode(...w.map(x=>65+x)),nums=s=>Array.from(s,x=>x.charCodeAt(0)-65),all=(1<<29)-1;
 function word(w,alt=true){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));if(!q)throw Error("native "+w);o.push(q.i);j+=q.t.length;}return o;}
 function body(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length);}
 const donors=raw.slice(2,5).map(t=>(body(t).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>word(w))),training=donors.map(w=>w.slice(0,Math.floor(w.length*.8)));
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))training.push((s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(t=>[...t].map(x=>ix.get(x))).filter(w=>w.every(Number.isInteger)));
 const types=new Set(Array.from({length:29},(_,x)=>String.fromCharCode(65+x)));for(const a of training)for(const w of a)if(w.length&&w.length<=24)types.add(id(w));
 for(const ln of raw[5].split(/\r?\n/)){const m=ln.match(/^([a-z]+)\s+(\d+)$/i);if(!m)continue;for(const alt of [true,false]){const k=id(word(m[1],alt));if(k.length<=24)types.add(k);}}
 check(types.size===35944,"frozen register");
 const byLen=new Map();for(const w of types){if(!byLen.has(w.length))byLen.set(w.length,[]);byLen.get(w.length).push(nums(w));}
 const orig=[];let w=[];for(const x of raw[6].split("%").slice(0,55).join("%")){if(ix.has(x))w.push(ix.get(x));else if(x!=="%"&&x!=="/"&&!/\s/u.test(x)&&w.length){orig.push(w);w=[];}}if(w.length)orig.push(w);
 const full=gp.pages.filter(x=>x.page<56).flatMap(x=>x.indices);check(same(orig.flat(),full),"original transcript");
 let off=0;const rows=[];for(const w of orig){rows.push({start:off,len:w.length});off+=w.length;}
 const aRows=rows.filter(w=>w.start<729),bRows=rows.filter(w=>w.start>=12648).map(w=>({...w,start:w.start-12648}));check(aRows.length===158&&bRows.length===66,"chapter groups");
 const A=full.slice(0,729),B=full.slice(12648);
 const val=(a,i)=>i<0||i>=a.length?0:a[i],arg=(a,i)=>mod(val(a,i-1)+val(a,i+1));
 const encode=(p,{f,g})=>{const c=[...p];for(let i=1;i<c.length;i+=2)c[i]=mod(c[i]+f[arg(c,i)]);for(let i=0;i<c.length;i+=2)c[i]=mod(c[i]+g[arg(c,i)]);return c;};
 const evenDecode=(c,g)=>c.map((v,i)=>i%2?v:mod(v-g[arg(c,i)]));
 const decode=(c,{f,g})=>{const p=evenDecode(c,g);for(let i=1;i<p.length;i+=2)p[i]=mod(p[i]-f[arg(p,i)]);return p;};
 function factors(c,rows,stage,g=null){const e=g?evenDecode(c,g):null;
  return rows.map(({start,len},row)=>{
   const active=[];for(let j=0;j<len;j++){const i=start+j;if(i%2===stage)active.push({j,i,label:arg(stage?e:c,i)});}
   const vars=[...new Set(active.map(x=>x.label))].sort((a,b)=>a-b),pos=new Map(vars.map((v,i)=>[v,i])),dict=new Map();
   for(const p of byLen.get(len)||[]){if(stage&&p.some((v,j)=>(start+j)%2===0&&v!==e[start+j]))continue;
    const q=Array(vars.length).fill(-1);let ok=true;for(const x of active){const j=pos.get(x.label),v=mod(c[x.i]-p[x.j]);if(q[j]>=0&&q[j]!==v){ok=false;break;}q[j]=v;}
    if(ok){const k=id(q);if(!dict.has(k))dict.set(k,q);}
   }
   return {row,start,len,vars,tuples:[...dict.values()]};
  });
 }
 const pop=x=>{let n=0;while(x){x&=x-1;n++;}return n;};
 function solver(base,nodeCap=10000,limit=2){
  let nodes=0,rounds=0,capped=false;const solutions=[];
  const freq=Array(29).fill(0);const pairs=new Map();for(const f of base){for(const v of f.vars)freq[v]++;for(let i=0;i<f.vars.length;i++)for(let j=i+1;j<f.vars.length;j++){const k=f.vars[i]*29+f.vars[j];pairs.set(k,(pairs.get(k)||0)+1);}}
  const fs=base.map(f=>({...f,links:f.vars.flatMap((v,i)=>f.vars.slice(i+1).map((w,j)=>({i,j:i+1+j,k:v*29+w}))).filter(x=>pairs.get(x.k)>1)}));
  function propagate(D,ts){
   D=[...D];ts=[...ts];let changed=true;
   while(changed){rounds++;changed=false;
    for(let i=0;i<fs.length;i++){const f=fs[i],old=ts[i],a=old.filter(t=>t.every((v,j)=>D[f.vars[j]]&(1<<v)));if(!a.length)return null;if(a.length<old.length){ts[i]=a;changed=true;}const mask=Array(f.vars.length).fill(0);for(const t of a)for(let j=0;j<t.length;j++)mask[j]|=1<<t[j];for(let j=0;j<mask.length;j++){const v=f.vars[j],next=D[v]&mask[j];if(!next)return null;if(next!==D[v]){D[v]=next;changed=true;}}}
    const pd=new Map();
    for(let i=0;i<fs.length;i++){const f=fs[i],a=ts[i];for(const {i:x,j:y,k} of f.links){const q=new Int32Array(29);for(const t of a)q[t[x]]|=1<<t[y];const z=pd.get(k);if(z){let any=false;for(let u=0;u<29;u++){z[u]&=q[u];any||=!!z[u];}if(!any)return null;}else pd.set(k,q);}}
    for(let i=0;i<fs.length;i++){const f=fs[i],old=ts[i],a=old.filter(t=>f.links.every(({i:x,j:y,k})=>pd.get(k)[t[x]]&(1<<t[y])));if(!a.length)return null;if(a.length<old.length){ts[i]=a;changed=true;}}
   }
   return {D,ts};
  }
  function dfs(D,ts){if(nodes>=nodeCap){capped=true;return;}nodes++;const s=propagate(D,ts);if(!s)return;let v=-1,best=30;for(let j=0;j<29;j++)if(freq[j]&&pop(s.D[j])>1&&(pop(s.D[j])<best||(pop(s.D[j])===best&&freq[j]>(v<0?0:freq[v])))){v=j;best=pop(s.D[j]);}
   if(v<0){solutions.push(s.D.map((x,j)=>freq[j]?31-Math.clz32(x):null));return;}
   let m=s.D[v];while(m&&solutions.length<limit&&!capped){const b=m&-m,d=[...s.D];d[v]=b;dfs(d,s.ts);m^=b;}
  }
  dfs(Array(29).fill(all),fs.map(f=>f.tuples));
  return {solutions,nodes,rounds,capped,observed:freq.filter(x=>x).length};
 }
 function fit(c,rows){
  const gf=factors(c,rows,0),g=solver(gf);
  if(g.capped||g.solutions.length!==1||g.observed!==29)return {g,f:null,key:null,projected:{gRows:gf.length,gTuples:gf.reduce((s,f)=>s+f.tuples.length,0),gEmpty:gf.filter(f=>!f.tuples.length).map(f=>f.row)}};
  const ff=factors(c,rows,1,g.solutions[0]),f=solver(ff);
  return {g,f,key:!f.capped&&f.solutions.length===1&&f.observed===29?{g:g.solutions[0],f:f.solutions[0]}:null,projected:{gRows:gf.length,gTuples:gf.reduce((s,f)=>s+f.tuples.length,0),fTuples:ff.reduce((s,f)=>s+f.tuples.length,0),fEmpty:ff.filter(f=>!f.tuples.length).map(f=>f.row)}};
 }
 let seed=2815;function R(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
 const controls=[];
 for(let d=0;d<3;d++){
  const tail=donors[d].slice(Math.floor(donors[d].length*.8)),pool=new Map();for(const w of tail)if(types.has(id(w))){if(!pool.has(w.length))pool.set(w.length,[]);pool.get(w.length).push(w);}
  let fallbacks=0;const plant=rows=>rows.flatMap(w=>{const a=pool.get(w.len);if(a?.length)return a[R()%a.length];fallbacks++;return byLen.get(w.len)[R()%byLen.get(w.len).length];});
  const p=plant(aRows),q=plant(bRows),key={f:Array.from({length:29},()=>R()%29),g:Array.from({length:29},()=>R()%29)},c=encode(p,key),dct=encode(q,key);
  check(same(decode(c,key),p)&&same(decode(dct,key),q),"plant inverse");
  const result=fit(c,aRows),recovered=result.key,fitCorrect=recovered?decode(c,recovered).filter((v,i)=>v===p[i]).length:null,holdCorrect=recovered?decode(dct,recovered).filter((v,i)=>v===q[i]).length:null;
  controls.push({donor:d,fallbacks,truth:key,result,fitCorrect,holdCorrect,exactKey:!!recovered&&same(recovered.f,key.f)&&same(recovered.g,key.g)});
 }
 const calibration=controls.every(x=>x.exactKey&&x.fitCorrect===729&&x.holdCorrect===308);
 const original=calibration?fit(A,aRows):null;
 const originalPrediction=original?.key?{fit:decode(A,original.key),heldout:decode(B,original.key)}:null;
 return {register:types.size,controls,calibration,original,originalPrediction};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt","resources/transcriptions/lp2-image-corrected.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
