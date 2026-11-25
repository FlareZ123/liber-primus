"use strict";
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

/** Physical rune tape and true printed cut flags, retaining page/line carries. */
function original(raw, corpus) {
  const map = new Map(corpus.runes.map((r,i)=>[r,i]));
  const t=[], b=[], pg=[], ln=[], words=[];
  let p=0,l=0,cur=[];
  function finish(){if(cur.length){b[b.length-1]=1;words.push(cur);cur=[];}}
  for(const c of raw.split("%").slice(0,55).join("%")){
    if(map.has(c)){t.push(map.get(c));b.push(0);pg.push(p>=50?p+1:p);ln.push(l);cur.push(map.get(c));}
    else if(c==="%"){p++;l=0;}
    else if(c==="/"){l++;}
    else if(!/\s/u.test(c))finish();
  }
  finish();
  if(t.length!==12956||words.length!==2896)throw Error("source counts");
  for(const x of corpus.pages.filter(x=>x.page<56)){
    if(JSON.stringify(t.filter((_,i)=>pg[i]===x.page))!==JSON.stringify(x.indices))throw Error("page mismatch "+x.page);
  }
  return {t,b,pg,ln,words};
}

/** k symbols ending at i+offset; len is the oracle-observed current group length. */
function samples(t,b,pg,ln,k,cap=Infinity,offset=0){
  const out=[];let run=0;
  for(let i=0;i<t.length;i++){
    run++;
    const end=i+offset+1,start=Math.max(0,end-k),ctx=k?t.slice(start,Math.max(0,end)):[];
    if(i<t.length-1)out.push({
      key:Math.min(run,cap)+"|"+ctx.join(","),y:b[i],i,p:pg[i],l:ln[i],run,
      local:start===end-k&&pg[start]===pg[i]&&ln[start]===ln[i]&&pg[i]===pg[i+1]&&ln[i]===ln[i+1]
    });
    if(b[i])run=0;
  }
  return out;
}

/** Exact lower bounds on binary decision errors plus frozen train-majority holdout. */
function summarize(s,split,retain=false){
  const train=new Map,hold=new Map;
  for(const r of s){
    const m=r.i<split?train:hold;let x=m.get(r.key);
    if(!x)m.set(r.key,x={n:[0,0],first:[null,null]});
    x.n[r.y]++;x.first[r.y]??=r;
  }
  let trainN=0,trainCuts=0,trainErr=0,holdN=0,holdCuts=0,holdErrMin=0,unseen=0,unseenCut=0,seenErr=0,seenCutErr=0,seenCutN=0,allConf=0,allMinErr=0;
  const conflicts=[],allConflicts=[];
  for(const [key,x] of train){
    trainN+=x.n[0]+x.n[1];trainCuts+=x.n[1];trainErr+=Math.min(...x.n);
    if(x.n[0]&&x.n[1])conflicts.push({key,...x});
  }
  const fallback=+(trainCuts>trainN/2);
  for(const [key,x] of hold){
    const n=x.n[0]+x.n[1];holdN+=n;holdCuts+=x.n[1];holdErrMin+=Math.min(...x.n);
    const z=train.get(key);if(!z){unseen+=n;unseenCut+=x.n[1];continue;}
    const pred=+(z.n[1]>z.n[0]);seenErr+=x.n[1-pred];seenCutN+=x.n[1];if(!pred)seenCutErr+=x.n[1];
  }
  for(const key of new Set([...train.keys(),...hold.keys()])){
    const a=train.get(key),b=hold.get(key),n=[0,1].map(y=>(a?.n[y]||0)+(b?.n[y]||0));
    if(n[0]&&n[1]){allConf++;allMinErr+=Math.min(...n);if(retain)allConflicts.push({key,n,first:[0,1].map(y=>a?.first[y]||b?.first[y])});}
  }
  return {trainN,trainCuts,trainContexts:train.size,trainConf:conflicts.length,trainErr,holdN,holdCuts,holdContexts:hold.size,holdErrMin,allConf,allMinErr,unseen,unseenCut,seenErr,seenCutErr,seenCutN,holdErr:seenErr+(fallback?unseen-unseenCut:unseenCut),dictLabelBits:train.size,conflicts:retain?conflicts:undefined,allConflicts:retain?allConflicts:undefined};
}

/** Frozen compact positive-control family: forced maximum or modular pair-sum cut. */
function decision(t,i,len,r){return +(len>=r.max||(len>=r.min&&(t[i]+(t[i-1]??0))%r.mod===r.res));}
function encode(t,r){let len=0;return t.map((_,i)=>{const b=decision(t,i,++len,r);if(b)len=0;return b;});}
function learn(t,b,split){
  const pool=[];
  for(let min=1;min<=4;min++)for(let max=5;max<=10;max++)for(let mod=2;mod<=7;mod++)for(let res=0;res<mod;res++){
    const r={min,max,mod,res};let len=0,ok=true;
    for(let i=0;i<split;i++){const v=decision(t,i,++len,r);if(v!==b[i]){ok=false;break;}if(v)len=0;}
    if(ok)pool.push(r);
  }
  return pool;
}

function experiment(raw,corpus,native){
  const {t,b,pg,ln,words}=original(raw,corpus);
  const split=pg.findIndex(p=>p>=40);let run=0,cap=0;
  for(let i=0;i<split;i++){cap=Math.max(cap,++run);if(b[i])run=0;}
  const main=[0,1,2,3].map(k=>({k,...summarize(samples(t,b,pg,ln,k,cap),split,k===3)}));
  const uncapped=samples(t,b,pg,ln,3);
  const variants=[
    {kind:"exact length",...summarize(uncapped,split)},
    {kind:"same physical line only",...summarize(uncapped.filter(r=>r.local),split)},
    {kind:"three previous excluding current",...summarize(samples(t,b,pg,ln,3,Infinity,-1),split)},
    {kind:"four ending current (stronger relaxation)",...summarize(samples(t,b,pg,ln,4),split,true)}
  ];
  const w=new Map;
  for(const x of uncapped.filter(r=>r.local&&r.i<split)){
    const key=x.p+"|"+x.l+"|"+x.key;let a=w.get(key);if(!a)w.set(key,a=[null,null]);a[x.y]??=x;
  }
  const sameLine=[...w.entries()].filter(([,a])=>a.every(Boolean));
  let seed=2716;function rnd(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*n);}
  function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){let j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
  const map=new Map(corpus.runes.map((r,i)=>[r,i]));
  const nw=native.sections.flatMap(s=>s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(r=>map.get(r)));
  const flags=ws=>ws.flatMap(w=>w.map((_,i)=>+(i===w.length-1)));
  const nt=nw.flat();
  const zeros=n=>Array(n).fill(0);
  const evalCtl=(name,t,b,sp)=>({name,...summarize(samples(t,b,zeros(t.length),zeros(t.length),3),sp)});
  const hidden={min:2,max:8,mod:5,res:0},plant=encode(t,hidden),learned=learn(t,plant,split);
  const prediction=learned.map(r=>({r,holdErrors:encode(t,r).slice(split,-1).filter((x,i)=>x!==plant[split+i]).length}));
  if(learned.length!==1||JSON.stringify(learned[0])!==JSON.stringify(hidden)||prediction[0].holdErrors!==0)throw Error("plant failure");
  const decoy=flags(shuffle(words)),shuffled=[];let n=0;
  while(n<t.length){for(const w of shuffle(nw)){if(n+w.length>t.length)break;shuffled.push(w);n+=w.length;}if(t.length-n<Math.min(...nw.map(w=>w.length)))break;}
  const st=shuffled.flat().map((x,i)=>(x+[3,11,9,7,5,12,6,10][i%8])%29);
  const controls=[
    evalCtl("native solved",nt,flags(nw),Math.floor(nt.length*.75)),
    evalCtl("deterministic plant",t,plant,split),
    evalCtl("independent decoy lengths",t,decoy,split),
    evalCtl("shuffled native words + q8",st,flags(shuffled),Math.min(split,st.length-1))
  ];
  return {source:{runes:t.length,groups:words.length,split,cap},main,variants,sameLine,controls,compactPositiveControl:{hidden,learned,prediction}};
}
module.exports={experiment};
if(require.main===module){
  const root=path.resolve(__dirname,"..");
  const read=p=>fs.readFileSync(path.join(root,p),"utf8");
  const result=experiment(read("resources/transcriptions/lp2-image-corrected.txt"),JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")));
  assert.equal(result.source.cap,14);
  assert.equal(result.main[3].trainConf,76);
  assert.equal(result.main[3].allMinErr,141);
  console.log(JSON.stringify(result,null,2));
}
