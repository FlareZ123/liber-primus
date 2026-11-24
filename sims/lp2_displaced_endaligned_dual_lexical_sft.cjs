"use strict";
// Exact paired GP29 lexical trellis, independently end-aligned marker intervals, issue #2451.

function experiment(raw,gp,lexText,lp1,ink=null) {
 const mod=x=>(x+29)%29;
 const ids=new Map(gp.runes.map((r,i)=>[r,i]));
 const spell=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const encode=w=>{const s=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let o=[];for(let i=0;i<s.length;){if(s.startsWith("ING",i)){o.push(21);i+=3;}else if(s.startsWith("IO",i)){o.push(27);i+=2;}else{const t=spell.find(x=>s.startsWith(x.s,i));if(!t)throw Error(s);o.push(t.i);i+=t.s.length;}}return o;};
 const source=raw.split("%").slice(0,55).join("%");
 const chunks=source.split("&").map((s,id)=>({id,words:(s.replace(/[%/\s]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,r=>ids.get(r)))})).filter(x=>x.words.length);
 const flat=chunks.flatMap(c=>c.words.flat()),expected=gp.pages.slice(0,56).flatMap(p=>p.indices);if(flat.length!==12956||flat.some((v,i)=>v!==expected[i]))throw Error("source mismatch");
 const dict=new Map();
 for(const l of lexText.split(/\r?\n/)){const m=l.match(/^([A-Za-z]+)\s+(\d+)$/);if(!m)continue;const w=encode(m[1]);const k=w.join(",");dict.set(k,(dict.get(k)||0)+Number(m[2]));}
 const roots=new Map(),nodes=[],totals=new Map();
 for(const [key,n] of dict){const l=key.split(",").length;totals.set(l,(totals.get(l)||0)+n);}
 const node=()=>{nodes.push({next:new Map(),score:0});return nodes.length-1;};
 for(const [key,n] of dict){const w=key.split(",").map(Number).reverse();let r=roots.get(w.length);if(r===undefined){r=node();roots.set(w.length,r);}for(const x of w){let t=nodes[r].next.get(x);if(t===undefined){t=node();nodes[r].next.set(x,t);}r=t;}nodes[r].score=Math.log(n/totals.get(w.length));}
 function layout(words){const rev=words.slice().reverse().map(w=>w.slice().reverse());const v=[],start=[],end=[],length=[];for(const w of rev)for(let j=0;j<w.length;j++){v.push(w[j]);start.push(j===0);end.push(j===w.length-1);length.push(w.length);}return {v,start,end,length};}
 function block(a,b,d,lo,hi){
  let states=new Map([["-1,-1",{u:-1,v:-1,s:0,p:""}]]);
  for(let i=lo;i<hi;i++){
   const next=new Map();
   for(const z of states.values()){
    const u=a.start[i]?roots.get(a.length[i]):z.u,v=b.start[i]?roots.get(b.length[i]):z.v;
    if(u===undefined||v===undefined)continue;
    for(const [x,un] of nodes[u].next){const y=mod(x-d[i]),vn=nodes[v].next.get(y);if(vn===undefined)continue;
     const uu=a.end[i]?-1:un,vv=b.end[i]?-1:vn,score=z.s+(a.end[i]?nodes[un].score:0)+(b.end[i]?nodes[vn].score:0),key=uu+","+vv;
     const prev=next.get(key);if(!prev||score>prev.s)next.set(key,{u:uu,v:vv,s:score,p:z.p+String.fromCharCode(65+x)});
    }
   }
   if(!next.size)return null;states=next;
  }
  let best=null;for(const v of states.values())if(!best||v.s>best.s)best=v;
  const p=Array.from(best.p,c=>c.charCodeAt(0)-65);return {p,q:p.map((x,j)=>mod(x-d[lo+j])),score:best.s};
 }
 function compare(a,b,d,cap=180){
  const n=Math.min(a.v.length,b.v.length,cap);let lo=0,good=0,score=0,matched=0,blocks=0,validBlocks=0,firstFail=null,firstFailureRange=null;const p=[],q=[];
  for(let hi=1;hi<=n;hi++){if(hi!==n&&!(a.end[hi-1]&&b.end[hi-1]))continue;blocks++;const r=block(a,b,d,lo,hi);
   if(r){good+=hi-lo;score+=r.score;validBlocks++;for(let j=0;j<r.p.length;j++){p.push(r.p[j]);q.push(r.q[j]);matched+=(r.p[j]===a.v[lo+j])+(r.q[j]===b.v[lo+j]);}}
   else{if(firstFail===null){firstFail=lo;firstFailureRange=[lo,hi];}for(let j=lo;j<hi;j++){p.push(-1);q.push(-1);}}
   lo=hi;
  }
  return {n,good,score,blocks,validBlocks,firstFail,firstFailureRange,matched,p,q};
 }
 let seed=123456789;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*29);}
 const difference=(a,b)=>a.v.slice(0,Math.min(a.v.length,b.v.length)).map((x,i)=>mod(x-b.v[i]));
 const trim=r=>Object.fromEntries(Object.entries(r).filter(([k])=>!["p","q"].includes(k)));
 const textWords=s=>(s.match(/[A-Za-z]+/g)||[]).map(encode);
 const part=n=>lp1.split("### "+n+"\n")[1].split(/\n### /)[0].trim();
 const controls=[
 {id:"LP1-3-welcome",words:textWords(part(3).split("WISDOM")[0])},
 {id:"LP1-6-koan",words:textWords(part(6))},
 {id:"LP1-10-consumption",words:textWords(part(10))},
 {id:"LP1-14-koan",words:textWords(part(14))}];
 const p57=raw.split("%")[56]; // community rune-bearing page index 56 = physical p57
 const w57=(p57.replace(/[/\s]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,r=>ids.get(r)));
 if(w57.flat().length!==95||w57.flat().some((x,i)=>x!==gp.pages[57].indices[i]))throw Error("p57 control mismatch");
 controls.push({id:"LP2-57-native",words:w57});
 const controlResults=[];
 for(let i=0;i<controls.length;i++)for(let j=i+1;j<controls.length;j++){
  const a=layout(controls[i].words),b=layout(controls[j].words);const d=difference(a,b),n=Math.min(a.v.length,b.v.length);
  // Plant an actual common random end-aligned additive key in unequal-length passages.
  const k=Array.from({length:Math.max(a.v.length,b.v.length)},rand);
  const ca=a.v.map((x,t)=>mod(x+k[t])),cb=b.v.map((x,t)=>mod(x+k[t]));
  if(d.some((x,t)=>x!==mod(ca[t]-cb[t])))throw Error("plant invariant");
  const pos=compare(a,b,d),neg=[];
  for(let t=0;t<12;t++)neg.push(compare(a,b,Array.from({length:n},rand)).good);
  controlResults.push({a:controls[i].id,b:controls[j].id,offset:a.v.length-b.v.length,positive:trim(pos),negativeMax:Math.max(...neg),negativeMean:neg.reduce((x,y)=>x+y,0)/neg.length,dictMissingA:controls[i].words.filter(w=>!dict.has(w.join(","))).length,dictMissingB:controls[j].words.filter(w=>!dict.has(w.join(","))).length});
 }
 let cumulative=0;
 const editorial=chunks.map(c=>{const v=layout(c.words);cumulative+=v.v.length;return {id:c.id,endpoint:cumulative,...v};}).filter(c=>c.v.length>=91);
 let layouts=editorial;
 const signatures=new Set();
 for(let i=0;i<editorial.length;i++)for(let j=i+1;j<editorial.length;j++){
  const a=editorial[i],b=editorial[j];signatures.add([a.endpoint,b.endpoint,Math.min(180,a.v.length,b.v.length)].join(","));
 }
 if(ink){
  let off=0;const marks=[0];for(const p of gp.pages.slice(0,56)){
   const rec=ink.pages.find(x=>x.page===p.page);
   for(const m of rec?.large_punctuation??[])if(m[1]===13)marks.push(off+m[0]);
   off+=p.indices.length;
  }
  const bounds=[...new Set([...marks,off])].sort((a,b)=>a-b);
  const whole=chunks.flatMap(c=>c.words),positions=new Map([[0,0]]);let pos=0;
  for(let j=0;j<whole.length;j++){pos+=whole[j].length;positions.set(pos,j+1);}
  if(bounds.some(x=>!positions.has(x)))throw Error("physical mark not at a word boundary");
  layouts=bounds.slice(1).map((end,id)=>({id,endpoint:end,...layout(whole.slice(positions.get(bounds[id]),positions.get(end)))})).filter(c=>c.v.length>=91);
 }
 const original=[];
 for(let i=0;i<layouts.length;i++)for(let j=i+1;j<layouts.length;j++){
  const a=layouts[i],b=layouts[j];if(a.v.length===b.v.length)continue;
  if(ink&&signatures.has([a.endpoint,b.endpoint,Math.min(180,a.v.length,b.v.length)].join(",")))continue;
  const d=difference(a,b),r=compare(a,b,d),neg=compare(a,b,Array.from({length:r.n},rand));
  original.push({a:a.id,b:b.id,endA:a.endpoint,endB:b.endpoint,offset:a.v.length-b.v.length,...trim(r),fraction:r.good/r.n,negativeFraction:neg.good/neg.n});
 }
 original.sort((a,b)=>b.fraction-a.fraction||b.good-a.good);
 return {lexicon:dict.size,chunkLengths:layouts.map(c=>[c.id,c.v.length,c.endpoint]),controlResults,original};
}

const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
console.log(JSON.stringify(experiment(read("resources/liber-primus/lp2-transcription.txt"),JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/control/english_wordfreq_textblob.txt"),read("resources/liber-primus/lp1-plaintext-reference.txt"),process.argv.includes("--physical13")?JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json")):null),null,2));
