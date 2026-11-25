"use strict";
const fs=require("node:fs");
function attack(grid,ink,corpus,transcription,...texts){
 const q=29,mod=x=>((x%q)+q)%q,inv=x=>{for(let i=1;i<q;i++)if(mod(x*i)===1)return i;throw Error("singular")},check=(x,m)=>{if(!x)throw Error(m)};
 const tokens=grid.pages.flatMap(p=>p.tokens);
 const ev=ink.pages.flatMap(p=>[...(p.red_spans??[]).flatMap(s=>Array.from(s.runes,(r,j)=>({page:p.page,pos:s.start+j,c:corpus.runes.indexOf(r),marker:false}))),...(p.large_punctuation??[]).filter(x=>x[1]===13).map(x=>({page:p.page,pos:x[0],marker:true}))].sort((a,b)=>a.pos-b.pos||(a.marker?-1:1)));
 check(tokens.length===256&&ev.length===256,"source length");
 for(const e of ev)if(!e.marker)check(e.c===corpus.pages.find(p=>p.page===e.page).indices[e.pos],"source identity");
 const anchors=new Map(ev.flatMap((e,i)=>!e.marker&&e.page>=56?[[i,e.page===56?[24,9,18,9,23][e.pos]:e.c]]:[]));
 const marks=ev.flatMap((e,i)=>e.marker?[i]:[]);
 const native=corpus.pages.find(p=>p.page===57).indices;
 const key=w=>w.map(i=>String.fromCharCode(65+i)).join("");
 const render=w=>w.map(i=>corpus.translit[i]).join("");
 const chart=new Map(corpus.translit.map((s,i)=>[s.toUpperCase(),i]));
 for(const [s,t] of [["C","K"],["K","C"],["V","U"],["Z","S"],["Q","C"],["ING","NG"],["IO","IA"]])if(chart.has(t)&&!chart.has(s))chart.set(s,chart.get(t));
 const spell=w=>{w=w.toUpperCase();const out=[];for(let i=0;i<w.length;){let found=false;for(let n=Math.min(3,w.length-i);n>=1;n--){const t=w.slice(i,i+n);if(chart.has(t)){out.push(chart.get(t));i+=n;found=true;break}}if(!found)return null}return out};
 const lex=new Set();for(const txt of texts)for(const w of txt.match(/[A-Za-z]+/g)??[]){const p=spell(w);if(p)lex.add(key(p))}
 const slices=transcription.split("%"), runePages=corpus.pages.filter(p=>p.runic_count>0);
 check(slices.length===runePages.length,"page count");
 const at=new Map(ev.flatMap((e,i)=>!e.marker?[[`${e.page}:${e.pos}`,i]]:[]));
 const words=[];
 for(let j=0;j<slices.length;j++){
  const page=runePages[j].page;let pos=0;
  const raw=slices[j].replace(/[\/\s]/g,"");
  for(const m of raw.matchAll(new RegExp(`[${corpus.runes.join("")}]+`,"g"))){
   const rune=Array.from(m[0]);const old=pos;pos+=rune.length;
   if(page>=56||j>0&&m.index===0||m.index+m[0].length===raw.length)continue;
   const ids=rune.map((_,i)=>at.get(`${page}:${old+i}`));
   if(ids.every(x=>x!==undefined))words.push({page,start:old,ids});
  }
  check(pos===runePages[j].runic_count,`page length ${page}: ${pos} != ${runePages[j].runic_count}`);
 }
 check(words[0].page===0&&words[0].ids.length===8&&words[1].page===0&&words[1].ids.length===5,"p0 8+5");

 const bylen=new Map();for(const w of lex){if(!bylen.has(w.length))bylen.set(w.length,[]);bylen.get(w.length).push(Array.from(w,c=>c.charCodeAt(0)-65))}
 function model(radix){
  const abc=radix===60?grid.alphabet:grid.alphabet.replace("f",""),f=tokens.map(t=>radix*abc.indexOf(t[0])+abc.indexOf(t[1]));
  const group=i=>ev[i].marker?256:anchors.has(i)?257+anchors.get(i):i;
  const targets=words.map(w=>w.ids.map(i=>group(f[i])));
  const occ=new Map();targets.forEach((t,j)=>new Set(t).forEach(k=>{if(!occ.has(k))occ.set(k,[]);occ.get(k).push(j)}));
  const pairs=[];for(let j=0;j<words.length;j++)for(let l=0;l<j;l++){const ks=[...new Set(targets[j])].filter(k=>targets[l].includes(k));if(ks.length>1)pairs.push([j,l,ks])}
  function solve(C,a,truth=null){
    const initial=words.map((w,j)=>{const t=targets[j],rows=[];for(const p of bylen.get(t.length)||[]){const m=new Map();let ok=true;for(let z=0;z<t.length;z++){const k=t[z],v=mod(C[w.ids[z]]-a*p[z]);if(m.has(k)&&m.get(k)!==v){ok=false;break}m.set(k,v)}if(ok)rows.push({p,m})}return rows});
    const cache=new Map();let calls=0;
    function propagate(mask){if(cache.has(mask))return cache.get(mask);calls++;const has=j=>!(mask&(1n<<BigInt(j))),domains=initial.slice();let passes=0;
      while(true){passes++;let changed=false;
       for(let j=0;j<words.length;j++)if(has(j)&&!domains[j].length){const res={bad:true,word:j,passes};cache.set(mask,res);return res}
       for(const [k,all] of occ){const js=all.filter(has);if(js.length<2)continue;let bits=(1<<29)-1;for(const j of js){let v=0;for(const row of domains[j])v|=1<<row.m.get(k);bits&=v}if(!bits){const res={bad:true,word:js[0],passes};cache.set(mask,res);return res}for(const j of js){const d=domains[j];domains[j]=d.filter(row=>(bits&(1<<row.m.get(k)))!==0);if(d.length!==domains[j].length)changed=true}}
       for(const [j,l,ks] of pairs){if(!has(j)||!has(l))continue;const sig=r=>ks.map(k=>r.m.get(k)).join(",");const A=new Set(domains[j].map(sig)),B=new Set(domains[l].map(sig));let d=domains[j];domains[j]=d.filter(row=>B.has(sig(row)));if(d.length!==domains[j].length)changed=true;d=domains[l];domains[l]=d.filter(row=>A.has(sig(row)));if(d.length!==domains[l].length)changed=true}
       if(!changed){const res={bad:false,sizes:domains.map((d,j)=>has(j)?d.length:null),retained:truth?words.every((w,j)=>!has(j)||domains[j].some(row=>row.p.every((p,z)=>p===truth[w.ids[z]]))):null,passes};cache.set(mask,res);return res}
      }
    }
    const bit=j=>1n<<BigInt(j);
    const result=propagate(0n);
    function core(mask){let m=mask;for(let j=0;j<words.length;j++)if(!(m&bit(j))&&propagate(m|bit(j)).bad)m|=bit(j);return Array.from({length:words.length},(_,j)=>j).filter(j=>!(m&bit(j)))}
    let skip=0n;const cores=[];while(propagate(skip).bad){const c=core(skip);check(c.length,"empty core");cores.push(c);for(const j of c)skip|=bit(j)}
    return {a,bad:result.bad,cores,lowerBound:cores.length,initialEmpty:initial.flatMap((d,j)=>d.length?[]:[j]),calls,retained:result.retained};
  }
  const original=Array.from({length:28},(_,i)=>solve(ev.map(e=>e.c),i+1)),controls=[];
  for(const a of [7,19]){const P=ev.map((e,i)=>e.marker?5:(i*7+3)%29);for(const [i,p] of anchors)P[i]=p;for(const w of words){const cand=bylen.get(w.ids.length),p=cand[Math.floor(cand.length/3)];w.ids.forEach((i,z)=>P[i]=p[z])}const h=Array.from({length:29},(_,i)=>mod(3*i*i+17*i+8));const synth=ev.map((e,i)=>e.marker?null:mod(a*P[i]+h[P[f[i]]]));const out=solve(synth,a,P);check(!out.bad&&out.retained,"control lost");controls.push(out)}
  return {radix,groups:occ.size,shared:[...occ.values()].filter(x=>x.length>1).length,original,controls};
 }
 return {lexicon:lex.size,words:words.map(w=>({page:w.page,start:w.start,length:w.ids.length})),models:[model(59),model(60)]};
}
const p=["resources/liber-primus/lp2-grid-256.json","resources/liber-primus/lp2-ink-annotations.json","resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/liber-primus/lp1-plaintext-reference.txt","resources/control/english_wordfreq_textblob.txt"];
const x=p.map(f=>fs.readFileSync(f,"utf8"));
console.log(JSON.stringify(attack(...x.slice(0,3).map(JSON.parse),...x.slice(3)),null,2));
