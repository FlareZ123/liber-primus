'use strict';
const fs=require('node:fs'),crypto=require('node:crypto');
const inputs=[
  {
    "path": "resources/liber-primus/lp2-corpus.json",
    "sha": "054f2a0f780b7d46901acbe3d9bf4f0ac1801165"
  },
  {
    "path": "resources/liber-primus/lp2-transcription.txt",
    "sha": "43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7"
  },
  {
    "path": "resources/external/relikd-solved-gp29-native-v1.json",
    "sha": "1b064ef6d85819b7d96adaff31a82d1ec551598f"
  },
  {
    "path": "resources/control/english_wordfreq_textblob.txt",
    "sha": "140e1d22b5f8c45deddd2e8b25549d9d6307d938"
  }
];
function experiment(corpus,trans,solved,lex,opts={}){
 const gp=JSON.parse(corpus),mod=x=>((x%29)+29)%29,A=(1<<29)-1,assert=(x,m)=>{if(!x)throw Error(m)};
 const rune=new Map(gp.runes.map((x,i)=>[x,i])),alpha=new Map(gp.translit.map((x,i)=>[x,i]));
 const parse=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>Array.from(w,c=>rune.get(c)));
 const all=parse(trans.replace(/[\s/%]/g,"")).slice(0,2896);
 assert(all.length===2896&&String(all.flat())===String(gp.pages.slice(0,56).flatMap(x=>x.indices)),"original alignment");
 const native=JSON.parse(solved).sections.map(s=>({name:s.name,words:parse(s.source_text)}));
 const dict=Array.from({length:40},()=>new Set());
 function add(w){if(w.length&&w.length<40)dict[w.length].add(String.fromCharCode(...w))}
 function variants(w){const s=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  function go(i,p){if(i===s.length){add(p);return}for(const len of [1,2,3]){const a=s.slice(i,i+len);if(a.length!==len)continue;const v=len===3?(a==="ING"?21:undefined):alpha.get(a);if(v!==undefined)go(i+len,p.concat(v));}}
  go(0,[]);
 }
 for(const line of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(line);if(m)variants(m[1])}
 for(const s of native)for(const w of s.words)add(w);
 const forms=dict.map(d=>Array.from(d,str=>Array.from(str,x=>x.charCodeAt(0))));
 const cache=new Map();
 function domain(w,hold){
  const key=Number(hold)+":"+String(w);if(cache.has(key))return cache.get(key);
  const out=[];
  for(const pt of forms[w.length]||[]){
   const f=new Int8Array(29).fill(-1),e=[];let first=-1,last=-1,pLast=-1,ok=true;
   for(let i=0;i<w.length;i++){
    const p=pt[i],c=w[i];if(hold&&!p){if(c){ok=false;break}continue}
    const s=mod(c-p);if(first<0)first=s;
    if(last>=0){const v=mod(s-pLast);if(f[last]>=0&&f[last]!==v){ok=false;break}if(f[last]<0){f[last]=v;e.push([last,v])}}
    last=s;pLast=p;
   }
   if(ok)out.push({pt,first,last,pLast,e,f});
  }
  cache.set(key,out);return out;
 }
 function encrypt(words,primer,f,hold){
  let s=primer;return words.map(w=>w.map(p=>{if(hold&&!p)return 0;const c=mod(p+s);s=mod(f[s]+p);return c}))
 }
 function attack(words,fitWords,hold,cap=10000000){
  const fit=words.slice(0,fitWords),ds=fit.map(w=>domain(w,hold)),f=new Int8Array(29).fill(-1),selected=Array(fitWords).fill(null),solutions=[],held=[];
  const stats={fitWords,fitRunes:fit.flat().length,heldRunes:words.slice(fitWords).flat().length,initialDomains:ds.map(d=>d.length),checks:0,nodes:0,maxAssigned:0,trainPaths:0,heldPaths:0,bestHeld:0};
  if(ds.some(d=>d.some(c=>c.first<0)))return {status:"all-hold word needs spanning",stats,solutions,held};
  function edgesFor(i,c){const e=c.e.slice();if(i>0&&selected[i-1]){const d=selected[i-1];e.push([d.last,mod(c.first-d.pLast)])}if(i+1<fitWords&&selected[i+1]){e.push([c.last,mod(selected[i+1].first-c.pLast)])}return e}
  function bind(e,added){for(const [k,v] of e){if(f[k]===v)continue;if(f[k]>=0)return false;f[k]=v;added.push(k)}return true}
  function undo(added){for(const k of added)f[k]=-1}
  function propagate(domains){
   let cur=domains;
   for(;;){
    const masks=new Int32Array(29).fill(A),next=cur.slice();let change=false;
    for(let i=0;i<fitWords;i++)if(!selected[i]){
     const kept=[],any=new Int32Array(29),count=new Int32Array(29);
     for(const c of cur[i]){
      if(++stats.checks>cap)throw Error("cap");
      const e=edgesFor(i,c),added=[];
      if(bind(e,added)){
       kept.push(c);let seen=0;for(const [k,v] of e)if(!(seen&(1<<k))){seen|=1<<k;any[k]|=1<<v;count[k]++}
      }undo(added)
     }
     if(!kept.length)return null;
     if(kept.length!==cur[i].length)change=true;next[i]=kept;
     for(let k=0;k<29;k++)if(count[k]===kept.length)masks[k]&=any[k];
    }
    for(let k=0;k<29;k++){if(f[k]>=0)masks[k]&=1<<f[k];if(!masks[k])return null}
    const firstMasks=next.map((d,i)=>selected[i]?1<<selected[i].first:d.reduce((m,c)=>m|(1<<c.first),0));
    const lastMasks=next.map((d,i)=>(selected[i]?[selected[i]]:d).reduce((m,c)=>{const v=c.f[c.last];let z=v>=0?(1<<v):masks[c.last];for(let k=0;k<29;k++)if(z&(1<<k))m|=1<<mod(k+c.pLast);return m},0));
    for(let i=0;i<fitWords;i++)if(!selected[i]){
     const kept=next[i].filter(c=>{
      if(!edgesFor(i,c).every(([k,v])=>(masks[k]&(1<<v))!==0))return false;
      if(i>0&&!(lastMasks[i-1]&(1<<c.first)))return false;
      if(i+1<fitWords){const v=c.f[c.last];let z=v>=0?(1<<v):masks[c.last],m=0;for(let k=0;k<29;k++)if(z&(1<<k))m|=1<<mod(k+c.pLast);if(!(m&firstMasks[i+1]))return false}
      return true;
     });
     if(!kept.length)return null;if(kept.length!==next[i].length)change=true;next[i]=kept
    }
    cur=next;if(!change)return cur;
   }
  }
  function search(domains,depth){
   stats.nodes++;stats.maxAssigned=Math.max(stats.maxAssigned,depth);
   if(depth===fitWords){
    const pt=selected.map(c=>c.pt),primer=selected[0].first,map=Array.from(f);
    assert(String(encrypt(pt,primer,map.map(x=>x<0?0:x),hold).flat())===String(fit.flat()),"fit replay");
    solutions.push({pt,primer,map,last:selected.at(-1).last,pLast:selected.at(-1).pLast});stats.trainPaths++;
    if(solutions.length>=100)throw Error("solution cap");return;
   }
   domains=propagate(domains);if(!domains)return;
   let best=-1,score=Infinity;
   for(let i=0;i<fitWords;i++)if(!selected[i]){
    const d=domains[i];let avg=0;for(const c of d)avg+=edgesFor(i,c).filter(([k])=>f[k]<0).length;avg/=d.length;
    const v=d.length===1?-100:Math.log(d.length)/(1+avg)**1.5+(avg===0?.8:0);if(v<score){score=v;best=i}
   }
   for(const c of domains[best]){
    const added=[];if(bind(edgesFor(best,c),added)){selected[best]=c;search(domains,depth+1);selected[best]=null}undo(added)
   }
  }
  let status="complete";try{search(ds,0)}catch(e){if(!["cap","solution cap"].includes(e.message))throw e;status=e.message}
  const rest=words.slice(fitWords).map(w=>domain(w,hold));
  for(const sol of solutions){
   let best=[];const predict=(i,last,pLast,pt)=>{
    if(pt.flat().length>best.flat().length)best=pt.slice();
    if(i===rest.length){const full=sol.pt.concat(pt);assert(String(encrypt(full,sol.primer,sol.map.map(x=>x<0?0:x),hold).flat())===String(words.flat()),"held replay");held.push({...sol,full});stats.heldPaths++;return}
    if(sol.map[last]<0)return;
    const s=mod(sol.map[last]+pLast);
    for(const c of rest[i])if(c.first===s&&c.e.every(([k,v])=>sol.map[k]===v))predict(i+1,c.last,c.pLast,pt.concat([c.pt]))
   };predict(0,sol.last,sol.pLast,[]);stats.bestHeld=Math.max(stats.bestHeld,best.flat().length);
  }
  return {status,stats,solutions,held};
 }
 function pairBound(words,hold,minLength=8){
  const ds=words.map((w,i)=>({i,w,d:w.length>=minLength?domain(w,hold):null})).filter(x=>x.d);
  const empties=ds.filter(x=>!x.d.length).map(x=>x.i),edges=[],used=new Set(),matching=[];let checks=0;
  for(let i=0;i<ds.length;i++)for(let j=i+1;j<ds.length;j++){
   const a=ds[i],b=ds[j];if(!a.d.length||!b.d.length)continue;
   let compatible=false;outer:for(const x of a.d)for(const y of b.d){checks++;if(x.e.every(([k,v])=>y.f[k]<0||y.f[k]===v)){compatible=true;break outer}}
   if(!compatible){edges.push([a.i,b.i]);if(!used.has(a.i)&&!used.has(b.i)){matching.push([a.i,b.i]);used.add(a.i);used.add(b.i)}}
  }
  return {longWords:ds.length,empties,conflicts:edges.length,matching,forcedOOV:empties.length+matching.length,checks,domains:ds.map(x=>[x.i,x.w.length,x.d.length])};
 }
 function perm(seed){const a=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 const summarize=r=>({status:r.status,...r.stats,examples:r.held.slice(0,1).map(t=>t.full.map(w=>w.map(x=>gp.translit[x]).join("")).join(" "))});
 const controls=[];
 for(const [name,seed,hold] of [["jpg107-167",23,true],["0_welcome",2,true],["0_loss_of_divinity",11,false]]){
  const words=native.find(s=>s.name===name).words,f=perm(seed).map(x=>x%19),primer=seed%29,ct=encrypt(words,primer,f,hold),fit=Math.floor(words.length*.78),r=attack(ct,fit,hold,opts.controlCap??10000000),truth=String(words.flat());
  controls.push({name,hold,primer,...summarize(r),trueTraining:r.solutions.some(x=>String(x.pt.flat())===String(words.slice(0,fit).flat())&&x.primer===primer&&x.map.every((v,i)=>v<0||v===f[i])),trueHeld:r.held.some(x=>String(x.full.flat())===truth),knownRows:r.solutions.map(x=>x.map.filter(v=>v>=0).length)});
 }
 const terminal=all.slice(2830,2896);assert(terminal.flat().length===308&&String(terminal.flat())===String(gp.pages.slice(54,56).flatMap(x=>x.indices)),"terminal alignment");
 const orig=[];
 for(const hold of [true,false])for(const [name,words,fit] of [["p54-55",terminal,44],["p0-2",all.slice(0,158),42]]){
  const r=attack(words,fit,hold,opts.origCap??15000000);
  orig.push({name,hold,...summarize(r),pair:pairBound(words,hold)});
 }
 return {dict:dict.reduce((a,d)=>a+d.size,0),controls,orig};
}
const data=inputs.map(({path,sha})=>{const b=fs.readFileSync(path);if(crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex')!==sha)throw Error('input changed: '+path);return b.toString('utf8')});
console.log(JSON.stringify({inputs,...experiment(...data)},null,2));
