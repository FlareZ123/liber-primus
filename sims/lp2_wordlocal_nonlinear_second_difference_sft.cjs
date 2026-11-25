'use strict';
/** Nonlinear word-local second-difference permutation; exact finite-register CSP. */
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
const data=files.map(f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8'));
function experiment(gp,transcript,donors,frequency,solved){
  const mod=x=>(x%29+29)%29;
  const glyph=new Map(gp.runes.map((x,i)=>[x,i]));
  const symbols=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
  function native(s,alt=false){let w=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");if(alt)w=w.replace(/ING/g,"NG").replace(/IO/g,"IA");const p=[];while(w.length){const a=symbols.find(x=>w.startsWith(x.t));if(!a)throw Error(w);p.push(a.i);w=w.slice(a.t.length)}return p}
  const dict=new Map(),byLen=Array.from({length:30},()=>[]);
  function store(p){if(p.length&&p.length<30)dict.set(p.join(","),p)}
  const pools=donors.map(raw=>{const ps=(raw.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>native(w,true));return Array.from({length:30},(_,l)=>ps.filter(p=>p.length===l))});
  for(const raw of donors)for(const w of raw.toUpperCase().match(/[A-Z]+/g)||[]){store(native(w));store(native(w,true))}
  for(const line of frequency.split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(line);if(m){store(native(m[1]));store(native(m[1],true))}}
  const rx=new RegExp("["+gp.runes.join("")+"]+","gu");
  const nativeWords=solved.sections.flatMap(s=>(s.source_text.match(rx)||[]).map(w=>[...w].map(x=>glyph.get(x))));
  if(nativeWords.length!==740||nativeWords.flat().length!==2979)throw Error("native register");
  nativeWords.forEach(store);
  for(let i=0;i<29;i++)store([i]);
  for(const p of dict.values())byLen[p.length].push(p);
  let page=0,start=0,end=0,w=[];const words=[];
  function finish(){if(w.length){words.push({C:w,index:words.length,start:start>=50?start+1:start,end:end>=50?end+1:end});w=[]}}
  for(const ch of transcript.split("%").slice(0,55).join("%")){if(glyph.has(ch)){if(!w.length)start=page;w.push(glyph.get(ch));end=page}else if(ch==="%")page++;else if(ch!=="/"&&!/\s/u.test(ch))finish()}finish();
  if(words.length!==2896||words.filter(w=>w.start!==w.end).length!==32||words.flatMap(w=>w.C).join(",")!==gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices).join(","))throw Error("original mismatch");
  function delta(p){return p.slice(2).map((x,i)=>mod(x-2*p[i+1]+p[i]))}
  function pattern(a){const ids=new Map();return a.map(x=>{if(!ids.has(x))ids.set(x,ids.size);return ids.get(x)}).join(",")}
  const index=new Map();
  for(const p of dict.values()){const v=delta(p),k=p.length+"|"+pattern(v);let m=index.get(k);if(!m)index.set(k,m=new Map());let a=m.get(v.join(","));if(!a)m.set(v.join(","),a={v,ps:[]});a.ps.push(p)}
  function tasks(rows){return rows.map(row=>{const v=delta(row.C),m=index.get(row.C.length+"|"+pattern(v));const cands=m?[...m.values()].map(({v:u,ps})=>{const edges=[];const seen=new Set();v.forEach((c,i)=>{if(!seen.has(c)){seen.add(c);edges.push([c,u[i]])}});return {edges,ps}}):[];return {...row,v,cands}})}
  const empty=()=>Array(29).fill(-1);
  function ok(c,f,g){return c.edges.every(([a,b])=>(f[a]<0||f[a]===b)&&(g[b]<0||g[b]===a))}
  function extend(c,f,g){const a=f.slice(),b=g.slice();for(const [x,y] of c.edges){a[x]=y;b[y]=x}return [a,b]}
  function solve(train,anchorMin,budget,cap=1000000){
    const all=tasks(train),anchors=all.filter(t=>t.C.length>=anchorMin);
    let nodes=0,leaves=0,truncated=false,best=Infinity,maxDepth=0;
    const states=new Map();
    function dfs(f,g,remaining,miss,depth){
      if(truncated)return;
      if(++nodes>cap){truncated=true;return}
      maxDepth=Math.max(maxDepth,depth);
      let forced=0,sel=null,dom=null;const active=[];
      for(const t of remaining){const cs=t.cands.filter(c=>ok(c,f,g));if(!cs.length){forced++;continue}
        active.push(t);if(!dom||cs.length<dom.length||cs.length===dom.length&&t.C.length>sel.C.length){sel=t;dom=cs}}
      if(miss+forced>budget)return;
      miss+=forced;
      if(!sel){
        leaves++;const oov=all.filter(t=>!t.cands.some(c=>ok(c,f,g))).length;
        best=Math.min(best,oov);
        if(oov<=budget){const key=f.join(",");if(!states.has(key))states.set(key,{f,g,oov,assigned:f.filter(x=>x>=0).length});if(states.size>2000)truncated=true}
        return
      }
      const next=active.filter(t=>t!==sel);
      for(const c of dom){const [a,b]=extend(c,f,g);dfs(a,b,next,miss,depth+1);if(truncated)return}
      if(miss<budget)dfs(f,g,next,miss+1,depth+1)
    }
    dfs(empty(),empty(),anchors,0,0);
    const sorted=[...states.values()].sort((a,b)=>a.oov-b.oov||b.assigned-a.assigned||a.f.join(",").localeCompare(b.f.join(",")));
    return {nodes,leaves,truncated,maxDepth,best:Number.isFinite(best)?best:null,anchorDomains:anchors.map(t=>[t.index,t.C.length,t.cands.length]),states:sorted,individualOOV:all.filter(t=>!t.cands.length).map(t=>t.index)}
  }

  // Complete an anchor state using fit groups only. A full table may still
  // be nonidentifiable because the initial two plaintext runes are free.
  function complete(train,states,budget,truth,cap=250000){
    const ts=tasks(train),seen=new Set();let nodes=0,truncated=false,truthRetained=false,first=null,bestOov=Infinity,count=0;
    const agreement=Array(29).fill(-2),order=Array.from({length:29},(_,i)=>i);
    const weights=order.map(i=>ts.reduce((n,t)=>n+t.v.includes(i),0));
    function visit(f,g){
      if(truncated)return;
      if(++nodes>cap){truncated=true;return}
      if(ts.filter(t=>!t.cands.some(c=>ok(c,f,g))).length>budget)return;
      let k=-1;for(const i of order)if(f[i]<0&&(k<0||weights[i]>weights[k]))k=i;
      if(k<0){const id=f.join(",");if(seen.has(id))return;seen.add(id);const oov=ts.filter(t=>!t.cands.some(c=>ok(c,f,g))).length;count++;
        if(oov<bestOov||oov===bestOov&&id<first.f.join(",")){bestOov=oov;first={f:f.slice(),g:g.slice(),oov,assigned:29}}
        if(truth&&f.every((v,i)=>v===truth[i]))truthRetained=true;
        for(const i of order)agreement[i]=agreement[i]===-2?f[i]:agreement[i]===f[i]?f[i]:-1;
        return
      }
      for(const p of order)if(g[p]<0){f[k]=p;g[p]=k;visit(f,g);f[k]=-1;g[p]=-1;if(truncated)return}
    }
    for(const s of states){visit(s.f.slice(),s.g.slice());if(truncated)break}
    return {nodes,truncated,count,truthRetained,forcedEntries:agreement.filter(v=>v>=0).length,first,bestOov:Number.isFinite(bestOov)?bestOov:null}
  }
  function evaluate(rows,s){const ts=tasks(rows);let compatible=0,unique=0,truthPresent=0,uniqueTruth=0,runes=0;const outputs=[];
    for(const t of ts){const ps=t.cands.filter(c=>ok(c,s.f,s.g)).flatMap(c=>c.ps);
      compatible+=ps.length>0;unique+=ps.length===1;if(s.assigned===29)for(const P of ps){const C=t.C.slice(0,2),ds=delta(P);for(let i=2;i<P.length;i++)C.push(mod(2*C[i-1]-C[i-2]+s.g[ds[i-2]]));if(C.join(",")!==t.C.join(","))throw Error("candidate replay");}
      const truth=t.P&&ps.some(p=>p.join(",")===t.P.join(","));truthPresent+=!!truth;if(truth&&ps.length===1){uniqueTruth++;runes+=t.P.length}
      outputs.push({index:t.index,length:t.C.length,options:ps.length,examples:ps.slice(0,3).map(p=>p.map(i=>gp.translit[i]).join(""))})
    }
    return {groups:rows.length,compatible,unique,truthPresent,uniqueTruth,runes,outputs}
  }
  const terminal=words.filter(w=>w.start>=54),train=terminal.filter(w=>w.end===54),held=terminal.filter(w=>w.end===55);
  const open=words.filter(w=>w.end<=2);
  const budget=Math.floor(train.length*.05);
  const summary=s=>({...s,states:s.states.slice(0,10),stateCount:s.states.length});
  function rng(seed){let x=seed>>>0;return n=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)%n}}
  function makeControl(seed,pool,corrupt=0){const rand=rng(seed),key=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){const j=rand(i+1);[key[i],key[j]]=[key[j],key[i]]}
    const inverse=empty();key.forEach((v,i)=>inverse[v]=i);
    const bad=new Set(train.filter(t=>t.C.length>=7).sort((a,b)=>b.C.length-a.C.length||a.index-b.index).slice(0,corrupt).map(t=>t.index));
    function make(t){const ps=pool[t.C.length].length?pool[t.C.length]:byLen[t.C.length];let P=ps[rand(ps.length)];if(bad.has(t.index)){do{P=Array.from({length:t.C.length},()=>rand(29))}while(dict.has(P.join(',')))}const C=[rand(29)];if(P.length>1)C.push(rand(29));const q=delta(P);for(let j=2;j<P.length;j++)C.push(mod(2*C[j-1]-C[j-2]+key[q[j-2]]));
      const R=P.slice(0,2);for(let j=2;j<P.length;j++)R.push(mod(2*R[j-1]-R[j-2]+inverse[delta(C)[j-2]]));if(R.join(",")!==P.join(","))throw Error("roundtrip");
      return {...t,C,P}}
    const a=train.map(make),b=held.map(make),s=solve(a,7,corrupt);
    const compatible=s.states.filter(x=>x.f.every((v,i)=>v<0||v===inverse[i]));
    const best=compatible[0],frozen=s.states[0];
    const full=complete(a,s.states,corrupt,inverse);return {seed,corrupt,corruptedGroups:[...bad],truthInverse:inverse,train:summary(s),trueCompatible:compatible.length,bestTrue:best?evaluate(b,best):null,firstFrozen:frozen?evaluate(b,frozen):null,firstFrozenCorrect:frozen?frozen.f.every((v,i)=>v<0||v===inverse[i]):false,full,fullFrozen:full.first?evaluate(b,full.first):null,fullFrozenCorrect:full.first?full.first.f.every((v,i)=>v===inverse[i]):false}
  }
  const plants=[makeControl(3301,pools[0]),makeControl(1033,pools[1]),makeControl(729,pools[2]),makeControl(20261125,pools[0],2)];
  const original=solve(train,7,budget);
  const opening=solve(open,8,Math.floor(open.length*.05),250000);
  return {dictSize:dict.size,sourceWords:words.length,sourceRunes:words.flatMap(w=>w.C).length,train:{words:train.length,runes:train.flatMap(w=>w.C).length,budget},hold:{words:held.length,runes:held.flatMap(w=>w.C).length},plants,original:summary(original),originalHold:original.states.length?evaluate(held,original.states[0]):null,opening:{words:open.length,runes:open.flatMap(w=>w.C).length,budget:Math.floor(open.length*.05),...summary(opening)}}
}
console.log(JSON.stringify(experiment(JSON.parse(data[0]),data[1],data.slice(2,5),data[5],JSON.parse(data[6])),null,2));
