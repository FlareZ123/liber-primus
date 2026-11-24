'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=process.argv[2]||path.join(__dirname,'..');
const files=["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
const experiment=function experiment(inputs,selection=null){
 const mod=x=>((x%29)+29)%29;
 const gp=JSON.parse(inputs[0]), native=JSON.parse(inputs[3]), sym=new Map(gp.runes.map((c,i)=>[c,i]));
 function parse(s){let words=[],w=[];for(const c of s){if(sym.has(c))w.push(sym.get(c));else if(c!=="/"&&c!=="%"&&!/\s/u.test(c)&&w.length){words.push(w);w=[]}}if(w.length)words.push(w);return words}
 const lex=Array.from({length:15},()=>new Map()),spell=gp.translit.map((x,i)=>[x,i]);spell.push(["ING",21],["IO",27]);
 const add=a=>{if(a.length&&a.length<=14)lex[a.length].set(a.join(","),a)};
 for(const l of inputs[2].split("\n")){const m=l.match(/^([a-z]+)\s+\d+\s*$/);if(!m)continue;const s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");function walk(i,a){if(i===s.length){add(a);return}if(a.length===14)return;for(const [t,n]of spell)if(s.startsWith(t,i))walk(i+t.length,[...a,n])}walk(0,[])}
 const donors=native.sections.map(s=>parse(s.source_text.replace(/[^\u16A0-\u16FF]+/gu," " ).trim().split(" ").join(".")));
 for(const ws of donors)for(const a of ws)add(a);
 const base=lex.reduce((n,m)=>n+m.size,0);
 for(const m of lex)for(const a of [...m.values()])if(a.length>=5)for(let i=1;i<a.length-2;i++)if(a[i]&&a[i+1]&&a[i]!==a[i+1]){let b=a.slice();[b[i],b[i+1]]=[b[i+1],b[i]];add(b)}
 const D=lex.map(m=>[...m.values()]);
 const words=parse(inputs[1].split("%").slice(53,55).join("%"));
 const full=words.flat();
 if(full.length!==308||full.some((x,i)=>x!==[...gp.pages[54].indices,...gp.pages[55].indices][i]))throw Error("source");
 const train=[];let count=0;for(const w of words){if(count+w.length>232)break;train.push(w);count+=w.length}
 if(count!==222||train.length!==49)throw Error("cut "+count);
 function schedule(ws,inner,outer,mask){let a=0,b=0,z=0;return ws.map(w=>w.map(c=>{const t=c===0?Math.floor(mask/3**(z++))%3:2;const e=t===0?{c,t}:t===1?{c,t,u:a,v:inner+outer}:{c,t,u:a,v:inner+b};if(t!==0)a=(a+1)%inner;if(t===2)b=(b+1)%outer;return e}))}
 function cycles(es,n){const adj=Array.from({length:n},()=>[]),out=[];for(let i=0;i<es.length;i++){const {u,v,t}=es[i];if(!t)continue;const seen=new Set([u]);function dfs(x){if(x===v)return [];for(const [y,j,sg]of adj[x])if(!seen.has(y)){seen.add(y);const p=dfs(y);if(p)return [[j,sg],...p]}return null}const p=dfs(u);if(p)out.push([[i,1],...p.map(([j,s])=>[j,-s])]);else{adj[u].push([v,i,1]);adj[v].push([u,i,-1])}}return out}
 function candidates(es){return (D[es.length]||[]).filter(w=>w.every((p,i)=>(p===0)===(es[i].t===0)))}
 function signature(cy,es,word,start,end,sign){let s="";for(const cyc of cy){let v=0;for(const [i,k] of cyc)if(i>=start&&i<end){const e=es[i],p=word[i-start];v+=k*((e.t===2?e.c:0)-p)}s+=String.fromCharCode(65+mod(v*sign))}return s}
 function pairInfo(sch){let pairs=[];for(let i=0;i<sch.length;i++)if(sch[i].length>=4)for(let j=i+1;j<sch.length;j++)if(sch[j].length>=4){let es=[...sch[i],...sch[j]],cy=cycles(es,22);if(cy.length>=3)pairs.push({i,j,es,cy})}return pairs.sort((a,b)=>b.cy.length-a.cy.length||b.es.length-a.es.length)}
 function testPair(pair,ca,cb,limit=1000){const {es,cy,i,j}=pair,l=ca[0]?.length??0,m=new Map();for(const w of ca){const k=signature(cy,es,w,0,l,1);let x=m.get(k);if(!x)m.set(k,x=[]);x.push(w)}let n=0,hits=[];for(const w of cb){const k=signature(cy,es,w,l,es.length,-1),a=m.get(k);if(a){n+=a.length;if(hits.length<limit)for(const v of a){if(hits.length>=limit)break;hits.push([v,w])}}}return {n,hits,i,j,cycles:cy.length}}
 function gate(ws,inner,outer,mask,maxPairs=8){const sch=schedule(ws,inner,outer,mask),cand=sch.map(candidates);if(cand.some(c=>!c.length))return {mask,empty:cand.findIndex(c=>!c.length),pairs:[]};let out=[];for(const p of pairInfo(sch).slice(0,maxPairs)){const h=testPair(p,cand[p.i],cand[p.j],0);out.push({i:h.i,j:h.j,cycles:h.cycles,n:h.n});if(!h.n)return {mask,zero:true,pairs:out}}return {mask,zero:false,pairs:out}}
 function encrypt(ws,keys){let a=0,b=0,mask=0,z=0;const [k,h]=keys;return {ws:ws.map(w=>w.map(p=>{let c,t;if(!p){c=0;t=0}else{const m=mod(p+k[a]);a=(a+1)%k.length;if(!m){c=0;t=1}else{c=mod(m+h[b]);b=(b+1)%h.length;t=2}}if(!c)mask+=t*3**(z++);return c})),get mask(){return mask},get z(){return z}}}

 function rhs(e,p){return e.t===2?mod(e.c-p):e.t===1?mod(-p):0}
 function recoverKnownMask(ws,inner,outer,mask){
  const sch=schedule(ws,inner,outer,mask),cand=sch.map(candidates),pair=pairInfo(sch)[0];
  const j=testPair(pair,cand[pair.i],cand[pair.j],10001);
  if(j.n>10000)return {status:"cap",step:"pair",n:j.n};
  let used=[pair.i,pair.j],es=pair.es,states=j.hits.map(([a,b])=>[...a,...b]),trace=[{words:used.slice(),states:states.length}];
  while(states.length&&used.length<sch.length){
   let best=null;
   for(let i=0;i<sch.length;i++)if(!used.includes(i)){
    const ee=es.concat(sch[i]),cy=cycles(ee,22).filter(c=>c.some(([k])=>k>=es.length));
    const score=cy.length-Math.log(Math.max(1,cand[i].length))/Math.log(29);
    if(!best||score>best.score)best={i,ee,cy,score};
   }
   const {i,ee,cy}=best,m=new Map();
   for(const w of cand[i]){const k=signature(cy,ee,w,es.length,ee.length,-1);let a=m.get(k);if(!a)m.set(k,a=[]);a.push(w)}
   const ns=[];for(const st of states){const k=signature(cy,ee,st,0,es.length,1);for(const w of m.get(k)||[]){ns.push(st.concat(w));if(ns.length>10000)return {status:"cap",step:i,n:ns.length,trace}}}
   used.push(i);es=ee;states=ns;trace.push({word:i,cycles:cy.length,states:states.length});
  }
  if(!states.length)return {status:"none",trace};
  const out=[];
  for(const st of states){
   const adj=Array.from({length:22},()=>[]);
   for(let i=0;i<es.length;i++)if(es[i].t){const {u,v}=es[i],d=rhs(es[i],st[i]);adj[u].push([v,-d]);adj[v].push([u,d])}
   const val=Array(22).fill(null),comp=[];
   for(const root of [21,...Array.from({length:21},(_,i)=>i)])if(val[root]===null){
    const ids=[root];val[root]=0;
    for(let q=0;q<ids.length;q++)for(const [v,d]of adj[ids[q]]){let t=mod(val[ids[q]]+d);if(val[v]===null){val[v]=t;ids.push(v)}else if(val[v]!==t)throw Error("inconsistent")}
    comp.push(ids)
   }
   let free=comp.filter(ids=>!ids.includes(21));if(free.length>2)return {status:"gauge cap",trace,free:free.length};
   function gauges(i){
    if(i===free.length){
     const key=[val.slice(0,inner),val.slice(inner,inner+outer).map(v=>mod(-v))];
     let off=0,plain=[];for(const wi of used){plain[wi]=st.slice(off,off+sch[wi].length);off+=sch[wi].length}
     const e=encrypt(plain,key);
     if(e.mask===mask&&e.ws.flat().join(",")===ws.flat().join(","))out.push({key,plain});
     return
    }
    const ids=free[i];for(let g=0;g<29;g++){gauges(i+1);for(const v of ids)val[v]=mod(val[v]+1)}
   }gauges(0)
  }
  return {status:"solved",trace,solutions:out};
 }
 function disjointGate(ws,inner,outer,mask){
  const sch=schedule(ws,inner,outer,mask),cand=sch.map(candidates),used=new Set(),conflicts=[];
  for(let i=0;i<cand.length;i++)if(!cand[i].length){used.add(i);conflicts.push({i,empty:true})}
  for(const p of pairInfo(sch)){
   if(used.has(p.i)||used.has(p.j)||p.cy.length<4)continue;
   const h=testPair(p,cand[p.i],cand[p.j],0);
   if(!h.n){used.add(p.i);used.add(p.j);conflicts.push({i:p.i,j:p.j,cycles:p.cy.length})}
  }
  return {mask,lowerBound:conflicts.length,conflicts};
 }


 function relationExists(pair,ca,cb){
  if(!ca.length||!cb.length)return false;
  const {es,cy}=pair,l=ca[0].length;
  const key=l+";"+cy.map(c=>c.map(([i,k])=>i+":"+k).join(",")).join("|")+";"+es.map(e=>e.c+":"+e.t).join(",");
  if(relationCache.has(key))return relationCache.get(key);
  const a=new Set();for(const w of ca)a.add(signature(cy,es,w,0,l,1));
  let exists=false;for(const w of cb)if(a.has(signature(cy,es,w,l,es.length,-1))){exists=true;break}
  relationCache.set(key,exists);return exists
 }
 const relationCache=new Map();
 function coverGate(ws,inner,outer,mask,budget){
  const sch=schedule(ws,inner,outer,mask),cand=sch.map(candidates),pairs=pairInfo(sch),edges=[];
  for(let i=0;i<cand.length;i++)if(!cand[i].length)edges.push([i]);
  for(const p of pairs)if(p.cy.length>=4&&!relationExists(p,cand[p.i],cand[p.j]))edges.push([p.i,p.j]);
  // Enumerate all minimal covers up to budget by branching on any uncovered edge.
  const covers=new Map(),seen=new Set();let nodes=0;
  function rec(removed){
   const k=[...removed].sort((a,b)=>a-b).join(",");if(seen.has(k))return;seen.add(k);nodes++;
   const e=edges.find(e=>e.every(i=>!removed.has(i)));
   if(!e){covers.set(k,[...removed].sort((a,b)=>a-b));return}
   if(removed.size===budget)return;
   for(const i of e)rec(new Set([...removed,i]))
  }
  rec(new Set());
  return {mask,edges,covers:[...covers.values()],nodes,minCover:covers.size?Math.min(...[...covers.values()].map(x=>x.length)):budget+1}
 }
 function heldout(cipher,keys,phase){
  const [k,h]=keys,seen=new Map();let states=[{a:phase[0],b:phase[1],plain:[]}],peak=1;
  for(const word of cipher){
   const next=[];
   for(const st of states){
    function walk(i,a,b,p){
     if(i===word.length){if(lex[p.length]?.has(p.join(",")))next.push({a,b,plain:[...st.plain,p]});return}
     const c=word[i];if(c===0){walk(i+1,a,b,[...p,0]);const pp=mod(-k[a]);if(pp)walk(i+1,(a+1)%k.length,b,[...p,pp])}
     const m=mod(c-h[b]),pp=mod(m-k[a]);if(m&&pp)walk(i+1,(a+1)%k.length,(b+1)%h.length,[...p,pp])
    }walk(0,st.a,st.b,[])
   }
   states=next;peak=Math.max(peak,states.length);if(peak>10000)return {status:"cap",peak};if(!states.length)return {status:"none",peak}
  }
  return {status:"ok",peak,states}
 }


 function solveRelaxed(sch,cand,pairs,removed){
  const active=sch.map((_,i)=>i).filter(i=>!removed.has(i));
  for(const i of active)if(!cand[i].length)return {status:"unsat",core:[i]};
  const pair=pairs.find(p=>!removed.has(p.i)&&!removed.has(p.j));
  if(!pair)return {status:"cap",reason:"no strong pair"};
  const j=testPair(pair,cand[pair.i],cand[pair.j],10001);
  if(!j.n)return {status:"unsat",core:[pair.i,pair.j]};
  if(j.n>10000)return {status:"cap",reason:"pair",states:j.n};
  let used=[pair.i,pair.j],es=pair.es,states=j.hits.map(([a,b])=>a.concat(b)),peak=states.length;
  while(used.length<active.length){
   let best=null;
   for(const i of active)if(!used.includes(i)){
    const ee=es.concat(sch[i]),cy=cycles(ee,22).filter(c=>c.some(([k])=>k>=es.length));
    const score=cy.length-Math.log(Math.max(1,cand[i].length))/Math.log(29);
    if(!best||score>best.score)best={i,ee,cy,score}
   }
   const {i,ee,cy}=best,m=new Map();
   for(const w of cand[i]){const k=signature(cy,ee,w,es.length,ee.length,-1);let a=m.get(k);if(!a)m.set(k,a=[]);a.push(w)}
   const ns=[];
   for(const st of states){const k=signature(cy,ee,st,0,es.length,1);for(const w of m.get(k)||[]){ns.push(st.concat(w));if(ns.length>10000)return {status:"cap",reason:"join",states:ns.length,core:used.concat(i)}}}
   used.push(i);es=ee;states=ns;peak=Math.max(peak,states.length);
   if(!states.length)return {status:"unsat",core:used,peak};
  }
  return {status:"relaxed survivors",states,es,used,peak}
 }

 function arcPrune(sch,cand,pairs,removed){
  const active=sch.map((_,i)=>i).filter(i=>!removed.has(i)),d=cand.slice(),p=pairs.filter(x=>!removed.has(x.i)&&!removed.has(x.j));
  let passes=0,changed=true,removedRows=0;
  while(changed&&passes<20){
   changed=false;passes++;
   for(const {i,j,es,cy} of p){
    const a=d[i],b=d[j],l=sch[i].length;
    const sa=a.map(w=>signature(cy,es,w,0,l,1)),sb=b.map(w=>signature(cy,es,w,l,es.length,-1));
    const as=new Set(sa),bs=new Set(sb);
    const aa=a.filter((_,k)=>bs.has(sa[k])),bb=b.filter((_,k)=>as.has(sb[k]));
    if(!aa.length||!bb.length)return {status:"unsat",core:active,passes,removedRows};
    if(aa.length!==a.length){d[i]=aa;changed=true;removedRows+=a.length-aa.length}
    if(bb.length!==b.length){d[j]=bb;changed=true;removedRows+=b.length-bb.length}
   }
  }
  return {status:"ok",cand:d,passes,removedRows}
 }

 function robustGate(ws,inner,outer,mask,budget,prior){
  const sch=schedule(ws,inner,outer,mask),cand=sch.map(candidates),pairs=pairInfo(sch);
  const cores=prior.edges.slice(),seen=new Set(),unresolved=[],stats={nodes:0,solves:0,learned:0,pruned:0,caps:0,survivors:0,peak:0};
  const addCore=c=>{c=[...new Set(c)].sort((a,b)=>a-b);if(!cores.some(x=>x.every(i=>c.includes(i)))){cores.push(c);stats.learned++}};
  function rec(removed){
   const k=[...removed].sort((a,b)=>a-b).join(",");if(seen.has(k))return;seen.add(k);stats.nodes++;
   if(stats.nodes>2500){if(unresolved.length<10)unresolved.push({removed:[...removed],reason:"node cap"});stats.caps++;return}
   const unmet=cores.filter(c=>c.every(i=>!removed.has(i))).sort((a,b)=>a.length-b.length);
   if(unmet.length){if(removed.size===budget){stats.pruned++;return}
    let used=new Set(),lb=0;for(const c of unmet)if(c.every(i=>!used.has(i))){lb++;for(const i of c)used.add(i)}
    if(removed.size+lb>budget){stats.pruned++;return}
    const edge=unmet[0],ordered=edge.slice().sort((a,b)=>unmet.filter(c=>c.includes(b)).length-unmet.filter(c=>c.includes(a)).length);
    for(const i of ordered)rec(new Set([...removed,i]));return
   }
   stats.solves++;
   let r=solveRelaxed(sch,cand,pairs,removed);if(r.status==="cap"){stats.arcCalls=(stats.arcCalls||0)+1;const a=arcPrune(sch,cand,pairs,removed);stats.arcRows=(stats.arcRows||0)+a.removedRows;r=a.status==="unsat"?a:solveRelaxed(sch,a.cand,pairs,removed)}stats.peak=Math.max(stats.peak,r.peak||0);
   if(r.status==="unsat"){
    addCore(r.core);
    if(removed.size===budget){stats.pruned++;return}
    const c=r.core.slice().sort((a,b)=>cores.filter(x=>x.includes(b)).length-cores.filter(x=>x.includes(a)).length);
    for(const i of c)rec(new Set([...removed,i]));
   }else if(r.status==="cap"){
    stats.caps++;if(unresolved.length<10)unresolved.push({removed:[...removed],reason:r.reason,states:r.states});
   }else{
    stats.survivors++;if(unresolved.length<10)unresolved.push({removed:[...removed],reason:r.status,states:r.states.length});
   }
  }
  rec(new Set());return {mask,budget,certified:!stats.caps&&!stats.survivors,stats,cores,unresolved}
 }

 const checks=[];
 for(const [di,inner,outer] of (selection?[]:[[1,8,13],[4,13,8]])){let ws=[],n=0;for(const w of donors[di]){if(n+w.length>222)break;ws.push(w);n+=w.length}if(!ws.length)throw Error("donor");let keys=[Array.from({length:inner},(_,i)=>mod(7*i*i+3*i+4)),Array.from({length:outer},(_,i)=>mod(11*i*i+5*i+3))];let e=encrypt(ws,keys),sch=schedule(e.ws,inner,outer,e.mask),p=pairInfo(sch)[0];if(!p)throw Error("no pair");let ca=candidates(sch[p.i]),cb=candidates(sch[p.j]),j=testPair(p,ca,cb,2000),trueA=signature(p.cy,p.es,ws[p.i],0,ws[p.i].length,1),trueB=signature(p.cy,p.es,ws[p.j],ws[p.i].length,p.es.length,-1);if(trueA!==trueB||!j.n)throw Error("positive");const recovery=recoverKnownMask(e.ws,inner,outer,e.mask);const found=recovery.solutions?.some(x=>JSON.stringify(x.key)===JSON.stringify(keys)&&JSON.stringify(x.plain)===JSON.stringify(ws))||false;let hold=[],hn=0;for(const w of donors[di].slice(ws.length)){if(hn+w.length>86)break;hold.push(w);hn+=w.length}const both=encrypt(ws.concat(hold),keys);let aa=0,bb=0;for(const e of sch.flat()){if(e.t)aa=(aa+1)%inner;if(e.t===2)bb=(bb+1)%outer}const pred=recovery.solutions?.length===1?heldout(both.ws.slice(ws.length),recovery.solutions[0].key,[aa,bb]):null;checks.push({donor:di,length:n,words:ws.length,inner,outer,zeros:e.z,mask:e.mask,pair:[p.i,p.j],cycles:p.cy.length,matches:j.n,trueSignature:true,recovery:{status:recovery.status,solutionCount:recovery.solutions?.length,found,trace:recovery.trace},withheld:{runes:hn,words:hold.length,status:pred?.status,solutionCount:pred?.states?.length,exact:pred?.states?.some(s=>JSON.stringify(s.plain)===JSON.stringify(hold)),peak:pred?.peak}})}
 const result=[];for(const [i,o]of [[8,13],[13,8]]){if(selection&&selection.inner!==i)continue;const ms=selection?selection.masks:Array.from({length:27},(_,m)=>m);let masks=[];for(const m of ms)masks.push(gate(train,i,o,m));const bounds=ms.map(m=>disjointGate(train,i,o,m));const covers=ms.map(m=>coverGate(train,i,o,m,5));const robust=ms.map((m,k)=>robustGate(train,i,o,m,selection?.budget??3,covers[k]));result.push({inner:i,outer:o,rejected:masks.filter(m=>m.zero||m.empty!==undefined).length,masks,bounds,minimumOOV:Math.min(...bounds.map(b=>b.lowerBound)),covers,minimumCover:Math.min(...covers.map(b=>b.minCover)),robust})}
 return {base,expanded:D.reduce((n,a)=>n+a.length,0),sizes:D.map(a=>a.length),checks,original:result};
};
console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.join(root,p),'utf8')),process.argv[3]?JSON.parse(process.argv[3]):null),null,2));
