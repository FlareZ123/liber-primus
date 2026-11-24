"use strict";
/** Agent45: all-affine shared-pad recovery gate for physically tree-linked p32/p55. Run from repo root. */
const fs=require("node:fs");
const path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function attack(corpus, transcript, lexicon) {
  const check=(b,msg)=>{if(!b) throw Error(msg)};
  const mod=x=>((x%29)+29)%29;
  const inv=Array.from({length:29},(_,x)=>Array.from({length:29},(_,y)=>y).find(y=>x*y%29===1)||0);
  const runeIndex=new Map(corpus.runes.map((x,i)=>[x,i]));
  const tokens=corpus.translit.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);
  const dict=new Map();
  for(const line of lexicon.match(/^[a-z]+\s+\d+$/gm)||[]){
    const w=line.split(/\s+/)[0].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
    let a=[];for(let i=0;i<w.length;){const t=tokens.find(t=>w.startsWith(t[0],i));if(!t){a=null;break;}a.push(t[1]);i+=t[0].length}
    if(a){if(!dict.has(a.length))dict.set(a.length,[]);dict.get(a.length).push(a)}
  }
  check([...dict.values()].reduce((n,x)=>n+x.length,0)===29154,"dictionary");
  function page(p,s){
    const words=transcript.split("%")[s].replace(/\/\s*/gu,"").match(/[\u16A0-\u16FF]+/gu).map(w=>[...w].map(x=>runeIndex.get(x)));
    const C=words.flat();check(C.join()===corpus.pages[p].indices.join(),"source mismatch");
    let start=0;const spans=words.map(w=>{const o={start,len:w.length};start+=w.length;return o});
    return {C,spans,where:words.flatMap((w,i)=>w.map(()=>i)),F:C.flatMap((x,i)=>x===0?[i]:[])};
  }
  const A=page(32,32), B=page(55,54);
  check(A.C.length===121&&B.C.length===76&&A.F.join()==="29,30,42,114"&&B.F.join()==="15,25,41","page constants");
  const optionsCache=new Map();
  function options(len, pattern) {
    const k=len+":"+pattern;if(optionsCache.has(k))return optionsCache.get(k);
    const w=(dict.get(len)||[]).filter(w=>pattern==="*"||w.every((v,i)=>(v===0)===(pattern[i]==="1")));
    const obj={key:k,words:w};optionsCache.set(k,obj);return obj;
  }
  function variants(P,transparent){
    const out=[];
    for(let mask=0;mask<(transparent?1<<P.F.length:1);mask++){
      const literal=new Set(P.F.filter((_,j)=>mask&(1<<j)));
      const opts=P.spans.map(s=>options(s.len,transparent?Array.from({length:s.len},(_,i)=>literal.has(s.start+i)?"1":"0").join(""):"*"));
      if(opts.some((o,i)=>o.words.length===0&&!(P===B&&i===0)))continue;
      const sites=P.C.flatMap((_,i)=>literal.has(i)?[]:[i]);
      out.push({mask,opts,sites});
    }
    return out;
  }
  function packed(v){let h=0;for(const x of v)h=h*29+x;return h}
  const indexCache=new Map();
  function indexRight(opt, pos){
    const key=opt.key+"/"+pos.join(",");
    if(indexCache.has(key))return indexCache.get(key);
    const groups=new Map();
    for(const w of opt.words){
      const first=w[pos[0]],v=pos.slice(1).map(i=>mod(w[i]-first));
      const scale=v.find(x=>x!==0)||0;
      const code=scale?packed(v.map(x=>mod(x*inv[scale]))):0;
      if(!groups.has(code))groups.set(code,new Set());
      groups.get(code).add(scale*29+first);
    }
    indexCache.set(key,groups);return groups;
  }
  const FULL=(1<<29)-1;
  const cache=new Map();
  function allowed(g, oa, ob, incoming) {
    const posA=g.map(x=>x.ai), posB=g.map(x=>x.bi), D=g.map(x=>x.d);
    const cacheKey=oa.key+"/"+ob.key+"/"+posA.join()+"/"+posB.join()+"/"+D.join();
    const cached=cache.get(cacheKey);
    if(cached)return cached;
    const right=indexRight(ob,posB), result=new Uint32Array(28*28);
    const d=D.slice(1).map(x=>mod(x-D[0]));
    for(const w of oa.words){
      const first=w[posA[0]],u=posA.slice(1).map(i=>mod(w[i]-first));
      for(let a=1;a<=28;a++){
        const v=u.map((x,j)=>mod(a*x-d[j])),scale=v.find(x=>x!==0)||0;
        const code=scale?packed(v.map(x=>mod(x*inv[scale]))):0;
        const matches=right.get(code);if(!matches)continue;
        for(const z of matches){
          const bs=Math.floor(z/29),bf=z%29;
          if(scale===0){for(let b=1;b<=28;b++){const s=mod(D[0]-a*first+b*bf);result[(a-1)*28+b-1]|=1<<s}}
          else {const b=mod(scale*inv[bs]);const s=mod(D[0]-a*first+b*bf);result[(a-1)*28+b-1]|=1<<s}
        }
      }
    }
    cache.set(cacheKey,result);return result;
  }
  function gate(CA,CB,va,vb,drop,offset) {
    const sites=vb.sites.filter(i=>i>=drop);
    const groups=new Map();
    for(let k=0;k<sites.length;k++){
      const i=va.sites[offset+k],j=sites[k],wa=A.where[i],wb=B.where[j],key=wa+":"+wb;
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key).push({wa,wb,ai:i-A.spans[wa].start,bi:j-B.spans[wb].start,d:mod(CA[i]-CB[j])});
    }
    let alive=new Uint32Array(784);alive.fill(FULL);
    let first=0, checked=0;
    const gs=[...groups.values()].filter(g=>g.length>=3).sort((a,b)=>b.length-a.length);
    for(const g of gs){
      const t=allowed(g,va.opts[g[0].wa],vb.opts[g[0].wb],alive);
      let n=0;for(let i=0;i<784;i++){alive[i]&=t[i];if(alive[i])n++;}
      checked++;if(!n){first=g.length;break;}
    }
    let survivors=[];
    for(let i=0;i<784;i++)if(alive[i])for(let s=0;s<29;s++)if(alive[i]&(1<<s))survivors.push([Math.floor(i/28)+1,i%28+1,s]);
    return {survivors,first,checked};
  }

  /** Exact full-overlap inverse on the forest of two interval partitions. */
  function solveFull(CA,CB,va,vb,drop,offset,state) {
    const [a,b,s]=state, sites=vb.sites.filter(i=>i>=drop);
    const domains=new Map(),edges=new Map(),adj=new Map();
    function domain(page,variant,wi,prefix) {
      const key=prefix+wi;
      if(!domains.has(key)){
        const opt=variant.opts[wi];
        // The incoming single-rune fragments are not independent words.
        const w=wi===0&&page.spans[0].len===1
          ?Array.from({length:29},(_,j)=>[j]).filter(x=>opt.key.endsWith("*")||((x[0]===0)===opt.key.endsWith("1")))
          :opt.words;
        domains.set(key,w);adj.set(key,[]);
      }
      return key;
    }
    for(let k=0;k<sites.length;k++){
      const i=va.sites[offset+k],j=sites[k],wa=A.where[i],wb=B.where[j];
      const l=domain(A,va,wa,"A"),r=domain(B,vb,wb,"B"),key=l+":"+r;
      if(!edges.has(key)){const edge={l,r,g:[]};edges.set(key,edge);adj.get(l).push(edge);adj.get(r).push(edge);}
      edges.get(key).g.push({ai:i-A.spans[wa].start,bi:j-B.spans[wb].start,d:mod(CA[i]-CB[j])});
    }
    // D=a*PA-b*PB+s, hence b*PB=a*PA+s-D.
    const signature=(w,e,isA)=>e.g.map(x=>isA?mod(a*w[x.ai]+s-x.d):mod(b*w[x.bi])).join(",");
    const seen=new Set();
    function acyclic(k,parent) {
      check(!seen.has(k),"overlap cycle");seen.add(k);
      for(const e of adj.get(k)){const other=e.l===k?e.r:e.l;if(other!==parent)acyclic(other,k);}
    }
    for(const k of domains.keys())if(!seen.has(k))acyclic(k,null);
    function reduce(k,parent) {
      for(const e of adj.get(k)){
        const other=e.l===k?e.r:e.l;if(other===parent)continue;
        if(!reduce(other,k))return false;
        const support=new Set(domains.get(other).map(w=>signature(w,e,other===e.l)));
        const next=domains.get(k).filter(w=>support.has(signature(w,e,k===e.l)));
        domains.set(k,next);if(!next.length)return false;
      }
      return domains.get(k).length>0;
    }
    const chosen=new Map();
    function select(k,parent,required,edge) {
      const w=domains.get(k).find(w=>!edge||signature(w,edge,k===edge.l)===required);
      check(w!==undefined,"constructive forest failure");chosen.set(k,w);
      for(const e of adj.get(k)){
        const other=e.l===k?e.r:e.l;if(other===parent)continue;
        select(other,k,signature(w,e,k===e.l),e);
      }
    }
    for(const k of domains.keys())if(!chosen.has(k)){
      if(!reduce(k,null))return null;
      select(k,null,"",null);
    }
    const pA=A.spans.map((_,i)=>chosen.get("A"+i)||null),pB=B.spans.map((_,i)=>chosen.get("B"+i)||null);
    const render=p=>p.map(w=>w?w.map(x=>corpus.translit[x]).join(""):"?").join(" ");
    const recoveredPad=[];
    for(let k=0;k<sites.length;k++){
      const i=va.sites[offset+k],j=sites[k],wa=A.where[i],wb=B.where[j];
      const pa=pA[wa][i-A.spans[wa].start],pb=pB[wb][j-B.spans[wb].start];
      const K=mod(CA[i]-a*pa-s);
      check(mod(b*pb+K)===CB[j],"full candidate forward replay");
      recoveredPad.push(K);
    }
    return {plaintextA:render(pA),plaintextB:render(pB),recoveredPad};
  }

  const summaries=[];
  for(const mode of [false,true]){
    const aa=variants(A,mode),bb=variants(B,mode);
    let placements=0,pass=0,triples=0,fullPass=0,fullStates=0;const hist={},examples=[],fullExamples=[];
    for(const va of aa)for(const vb of bb)for(const drop of [0,1]){
      const n=vb.sites.filter(i=>i>=drop).length;
      for(let offset=0;offset<=va.sites.length-n;offset++){
        const result=gate(A.C,B.C,va,vb,drop,offset);
        placements++;
        if(result.survivors.length){pass++;triples+=result.survivors.length;let complete=false;for(const state of result.survivors){const solved=solveFull(A.C,B.C,va,vb,drop,offset,state);if(solved){fullStates++;complete=true;if(fullExamples.length<10)fullExamples.push({maskA:va.mask,maskB:vb.mask,drop,offset,state,...solved});}}if(complete)fullPass++;if(examples.length<10)examples.push({maskA:va.mask,maskB:vb.mask,drop,offset,triples:result.survivors.slice(0,15)})}
        else hist[result.first]=(hist[result.first]||0)+1;
      }
    }
    summaries.push({transparent:mode,masks:[aa.length,bb.length],placements,pass,triples,fullPass,fullStates,hist,examples,fullExamples});
  }
  // Independent planted original word-slot pair with both non-unit coefficients.
  const positive=[];
  for(const mode of [false,true]){
    const aa=variants(A,mode),bb=variants(B,mode);
    for(let t=0;t<4;t++){
      const va=aa[t%aa.length],vb=bb[(t*3)%bb.length],drop=t%2,offset=7+t*9;
      const ca=new Array(A.C.length).fill(0),cb=new Array(B.C.length).fill(0);
      const pa=va.opts.flatMap((o,i)=>o.words[(i*31+t*47)%o.words.length]);
      const pb=vb.opts.flatMap((o,i)=>o.words[(i*13+t*17)%o.words.length]);
      const a=3+t*5,b=4+t*6,sA=9+t,sB=21-t;
      const K=va.sites.map((_,i)=>mod(i*i*7+i*11+13+t));
      va.sites.forEach((j,i)=>ca[j]=mod(a*pa[j]+K[i]+sA));
      vb.sites.filter(i=>i>=drop).forEach((j,i)=>cb[j]=mod(b*pb[j]+K[i+offset]+sB));
      if(drop)cb[0]=mod(b*pb[0]+19);
      va.sites.forEach((j,i)=>check(mod((ca[j]-K[i]-sA)*inv[a])===pa[j],"plant A replay"));
      vb.sites.filter(i=>i>=drop).forEach((j,i)=>check(mod((cb[j]-K[i+offset]-sB)*inv[b])===pb[j],"plant B replay"));
      const res=gate(ca,cb,va,vb,drop,offset),truth=[a,b,mod(sA-sB)];
      check(res.survivors.some(x=>x.join()===truth.join()),"planted affine state lost");
      check(solveFull(ca,cb,va,vb,drop,offset,truth)!==null,"full planted CSP lost");
      positive.push({mode,maskA:va.mask,maskB:vb.mask,drop,offset,truth,remaining:res.survivors.length});
    }
  }
  return {summaries,positive,cacheEntries:cache.size};
}
const result=attack(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt"),read("resources/control/english_wordfreq_textblob.txt"));
console.log(JSON.stringify(result,null,2));
