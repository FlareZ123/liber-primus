'use strict';
const fs=require('node:fs');
function experiment(corpus,trans,solved,lex,injective=true,options={}){
 const gp=JSON.parse(corpus),mod=x=>(x+29)%29,assert=(x,m)=>{if(!x)throw Error(m)};
 const rune=new Map(gp.runes.map((x,i)=>[x,i])),alpha=new Map(gp.translit.map((x,i)=>[x,i]));
 const parse=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>Array.from(w,c=>rune.get(c)));
 const original=parse(trans.replace(/[\s/%]/g,"")).slice(0,2896);
 assert(String(original.flat())===String(gp.pages.slice(0,56).flatMap(x=>x.indices)),"original alignment");
 const source=JSON.parse(solved).sections.map(s=>({name:s.name,w:parse(s.source_text)}));
 const dict=Array.from({length:40},()=>new Set());
 function add(w){if(w.length&&w.length<40)dict[w.length].add(String.fromCharCode(...w))}
 function variants(w){
  const s=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  function go(i,p){if(i===s.length){add(p);return}for(const len of [1,2,3]){const a=s.slice(i,i+len);if(a.length!==len)continue;const v=len===3?(a==="ING"?21:undefined):alpha.get(a);if(v!==undefined)go(i+len,p.concat(v));}}
  go(0,[]);
 }
 for(const line of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(line);if(m&&m[1].length>=2)variants(m[1]);}
 for(const w of ["A","I","O"])variants(w);for(const s of source)for(const w of s.w)add(w);
 const tries=rev=>dict.map(d=>{const root=new Map();for(const str of d){const p=Array.from(str,x=>x.charCodeAt(0));if(rev)p.reverse();let t=root;for(const x of p){if(!t.has(x))t.set(x,new Map());t=t.get(x)}}return root});
 const forward=tries(false),back=tries(true);
 function encrypt(words,primer,f){let s=primer;return words.map(w=>w.map(p=>{if(!p)return 0;const c=mod(p+s);s=mod(s+f[p]);return c}))}
 function perm(seed){const p=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[p[i],p[j]]=[p[j],p[i]]}return p}
 function attack(words,fitN,cap=30000000){
 const cutAt=(ws,n)=>{let i=0,k=0;while(i<ws.length&&k<n)k+=ws[i++].length;return i};
 const cut=cutAt(words,fitN),fit=words.slice(0,cut),fitRunes=fit.flat().length;
 const f=Array(29).fill(-1),selected=Array(cut).fill(null),train=[],held=[];
 const stats={fitRunes,heldRunes:words.flat().length-fitRunes,checks:0,nodes:0,maxWords:0,trainPaths:0,heldPaths:0,knownRows:[],predictedPrefix:0};
 function domain(w){
  const out=[];
  for(const str of dict[w.length]){
   const pt=Array.from(str,x=>x.charCodeAt(0)),edges=[],map=Array(29).fill(-1);let first=-1,last=-1,lastShift=-1,ok=true;
   for(let i=0;i<w.length;i++){
    const p=pt[i],c=w[i];
    if(p===0){if(c!==0){ok=false;break}continue}
    const s=mod(c-p);
    if(first<0)first=s;
    if(last>=0){const d=mod(s-lastShift);if(map[last]>=0&&map[last]!==d){ok=false;break}if(map[last]<0){map[last]=d;edges.push([last,d])}}
    last=p;lastShift=s;
   }
   if(ok){assert(first>=0,"all-F dictionary group requires explicit spanning");out.push({pt,first,last,lastShift,edges})}
  }
  return out;
 }
 const initial=fit.map(domain);
 stats.initialDomains=initial.map(d=>d.length);
 function edgesFor(i,c){
  const e=c.edges.slice();
  if(i>0&&selected[i-1])e.push([selected[i-1].last,mod(c.first-selected[i-1].lastShift)]);
  if(i+1<cut&&selected[i+1])e.push([c.last,mod(selected[i+1].first-c.lastShift)]);
  return e;
 }
 function bind(e,added){
  for(const [k,v] of e){if(f[k]===v)continue;if(f[k]>=0)return false;f[k]=v;added.push(k)}
  return true;
 }
 function undo(added){for(const k of added)f[k]=-1}
 const ALL=(1<<29)-1;
 function propagate(domains){
  let current=domains;
  for(;;){
   const masks=Array(29).fill(ALL),next=current.slice();let changed=false;
   for(let i=0;i<cut;i++)if(!selected[i]){
    const kept=[],any=Array(29).fill(0),count=Array(29).fill(0);
    for(const c of current[i]){
     if(++stats.checks>cap)throw Error("cap");
     const e=edgesFor(i,c),a=[];
     if(bind(e,a)){
      kept.push(c);
      let seen=0;for(const [k,v] of e)if(!(seen&(1<<k))){seen|=1<<k;any[k]|=1<<v;count[k]++}
     }
     undo(a);
    }
    if(!kept.length)return null;
    if(kept.length!==current[i].length)changed=true;
    next[i]=kept;
    for(let k=0;k<29;k++)if(count[k]===kept.length)masks[k]&=any[k];
   }
   for(let k=0;k<29;k++){if(f[k]>=0)masks[k]&=1<<f[k];if(!masks[k])return null}
   for(let i=0;i<cut;i++)if(!selected[i]){
    const kept=next[i].filter(c=>edgesFor(i,c).every(([k,v])=>(masks[k]&(1<<v))!==0));
    if(!kept.length)return null;
    if(kept.length!==next[i].length)changed=true;
    next[i]=kept;
   }
   current=next;if(!changed)return current;
  }
 }
 function search(domains,depth){
  stats.nodes++;stats.maxWords=Math.max(depth,stats.maxWords);
  if(depth===cut){
   const pt=selected.flatMap(c=>c.pt),primer=selected[0].first,map=f.slice();
   assert(String(encrypt(selected.map(c=>c.pt),primer,map.map(v=>v<0?0:v)).flat())===String(fit.flat()),"fit replay");
   train.push({primer,last:selected.at(-1).last,lastShift:selected.at(-1).lastShift,map,pt});stats.trainPaths++;stats.knownRows.push(map.filter(v=>v>=0).length);
   if(train.length>=1000)throw Error("solution cap");return;
  }
  domains=propagate(domains);if(!domains)return;
  let best=-1,score=Infinity;
  for(let i=0;i<cut;i++)if(!selected[i]){
   const d=domains[i];let avg=0;
   for(const c of d)avg+=edgesFor(i,c).filter(([k])=>f[k]<0).length;
   avg/=d.length;
   const v=d.length===1?-100:Math.log(d.length)/(1+avg)**1.5+(avg===0?.8:0);
   if(v<score){score=v;best=i}
  }
  for(const c of domains[best]){
   const a=[];
   if(bind(edgesFor(best,c),a)){selected[best]=c;search(domains,depth+1);selected[best]=null}
   undo(a);
  }
 }
 let status="complete";
 try{search(initial,0)}catch(e){if(!["cap","solution cap"].includes(e.message))throw e;status=e.message}
 if(status==="complete"){
  const withheld=words.slice(cut).map(domain);
  for(const t of train){
   function predict(i,last,lastShift,pt){
    if(pt.length>stats.predictedPrefix)stats.predictedPrefix=pt.length;
    if(pt.length>(t.best?.length||0))t.best=pt.slice();
    if(i===withheld.length){
     const all=t.pt.concat(pt);let pos=0;const ws=words.map(w=>{const a=all.slice(pos,pos+w.length);pos+=w.length;return a});
     assert(String(encrypt(ws,t.primer,t.map.map(v=>v<0?0:v)).flat())===String(words.flat()),"held replay");
     held.push({...t,all});stats.heldPaths++;return
    }
    if(t.map[last]<0)return;
    for(const c of withheld[i])if(c.first===mod(lastShift+t.map[last])&&c.edges.every(([k,v])=>t.map[k]===v))predict(i+1,c.last,c.lastShift,pt.concat(c.pt))
   }
   predict(0,t.last,t.lastShift,[]);
  }
 }
 return {status,stats,train,held};
}
 const summarize=r=>({status:r.status,...r.stats,examples:r.held.slice(0,2).map(t=>t.all.map(i=>gp.translit[i]).join(""))});
 if(options.pages){
  const offsets=[0];for(const w of original)offsets.push(offsets.at(-1)+w.length);
  const po=[0];for(const p of gp.pages.slice(0,56))po.push(po.at(-1)+p.indices.length);
  const results=[];
  for(const page of options.pages){
   if(page===50)continue;
   const a=offsets.findIndex(o=>o>=po[page]),b=offsets.findLastIndex(o=>o<=po[page+1]);
   const w=original.slice(a,b),n=offsets[b]-offsets[a];
   const r=attack(w,Math.floor(n*.8),options.cap||5000000);
   const {initialDomains,...stats}=r.stats;
   results.push({page,range:[offsets[a],offsets[b]],runes:n,status:r.status,...stats,candidates:r.held.slice(0,4).map(t=>({primer:t.primer,map:t.map,plaintext:t.all.map(x=>gp.translit[x]).join("")}))});
  }
  return {lexicon:dict.reduce((a,d)=>a+d.size,0),results};
 }
 const controls=[];
 for(const [name,seed] of [["jpg107-167",23],["0_loss_of_divinity",11],["0_welcome",2]]){
  const s=source.find(x=>x.name===name),f=injective?perm(seed):perm(seed).map(x=>x%17),p=seed%29,ct=encrypt(s.w,p,f),r=attack(ct,Math.floor(ct.flat().length*.78)),truth=s.w.flat();
  const key=t=>t.primer===p&&t.map.every((v,i)=>v<0||v===f[i]);
  controls.push({name,...summarize(r),trueTrain:r.train.filter(t=>key(t)&&String(t.pt)===String(truth.slice(0,r.stats.fitRunes))).length,trueHeld:r.held.filter(t=>key(t)&&String(t.all)===String(truth)).length,truePrefix:r.train.filter(t=>key(t)&&String(t.pt)===String(truth.slice(0,r.stats.fitRunes))).map(t=>({predicted:t.best?.length||0,exact:(t.best||[]).filter((v,i)=>v===truth[r.stats.fitRunes+i]).length}))});
 }
 let i=original.length,n=0;while(n<308)n+=original[--i].length;assert(n===308,"terminal groups");
 const offsets=[0];for(const w of original)offsets.push(offsets.at(-1)+w.length);
 const p55=original.flat().length-gp.pages[55].indices.length;
 const start55=offsets.findIndex(o=>o>=p55);
 assert(offsets[2]===13,"red heading");
 const targets=[
 {name:"p54-p55",w:original.slice(i),fit:205},
 {name:"p0-p2",w:original.slice(0,158),fit:200},
 {name:"p0 black-body reset",w:original.slice(2,158),fit:200},
 {name:"p55 complete groups, reset after carry",w:original.slice(start55),fit:Math.floor((offsets.at(-1)-offsets[start55])*.75)}
 ];
 const results=targets.map(t=>({name:t.name,...summarize(attack(t.w,t.fit))}));
 return {injective,lexicon:dict.reduce((a,d)=>a+d.size,0),controls,results};
}
const args=["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"].map(p=>fs.readFileSync(p,'utf8'));
const pages=process.argv.slice(2).map(Number);
console.log(JSON.stringify(experiment(...args,false,pages.length?{pages}:{}),null,2));
