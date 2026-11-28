"use strict";
// Exact finite-lexicon word-boundary inverse and all-word OOV relaxation.
function experiment(raw) {
  const gp=JSON.parse(raw.gp),g=JSON.parse(raw.groups),gold=JSON.parse(raw.gold);
  const alphabet="0123456789abcdefghijklmnopqrs";
  const toWord=a=>a.map(v=>alphabet[v]).join("");
  const fromWord=w=>[...w].map(c=>alphabet.indexOf(c));
  const labels=gp.translit;
  const tokens=labels.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  function words(text) {
    return (text.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>{
      w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
      const a=[];for(let i=0;i<w.length;){
        const t=w.startsWith("ING",i)?{s:"ING",i:21}:w.startsWith("IO",i)?{s:"IO",i:27}:tokens.find(x=>w.startsWith(x.s,i));
        if(!t)throw Error("unmapped "+w);a.push(t.i);i+=t.s.length;
      }return toWord(a);
    });
  }
  const donor=[raw.shakespeare,raw.gibran,raw.emerson].map(words);
  const clear=gold.sections.find(s=>s.name==="p57_parable").source_text.split(/[•⁜⁘\s]+/).filter(Boolean).map(w=>toWord([...w].map(x=>gp.runes.indexOf(x))));
  if(clear.join("").length!==95||clear.some(x=>[...x].some(c=>!alphabet.includes(c))))throw Error("clear control drift");
  const freq=new Map(),lex=new Set(clear);
  for(const ws of donor)for(let i=0;i<ws.length;i++){const w=ws[i];lex.add(w);if(i<Math.floor(ws.length*.57))freq.set(w,(freq.get(w)||0)+1)}
  const root={next:new Map(),w:null};
  for(const w of lex){let n=root;for(const p of fromWord(w)){if(!n.next.has(p))n.next.set(p,{next:new Map(),w:null});n=n.next.get(p)}n.w=w}
  const body=g.p54.body_groups.slice(),tail=g.p55.groups.slice();body[body.length-1]+=tail.shift();body.push(...tail);
  const original=body.join("");
  if(body.length!==64||original.length!==299||original!==toWord([...gp.pages.find(x=>x.page===54).indices.slice(9),...gp.pages.find(x=>x.page===55).indices]))throw Error("original carry/source drift");
  const keys=[{name:"red8",K:g.red8_key.gp29_indices},{name:"red9",K:[24,...g.red8_key.gp29_indices]},{name:"DIUINITY",K:[..."DIUINITY"].map(x=>labels.indexOf(x))},{name:"FIRFUMFERENFE",K:[..."FIRFUMFERENFE"].map(x=>labels.indexOf(x))}];
  function machine(K) {
    const m=36,q=K.length,N=q*37,id=(phase,last)=>phase*37+last;
    if(K.some(x=>x<0)||new Set(K).size<2)throw Error("bad key");
    const E=Array.from({length:N},(_,s)=>Array.from({length:29},(_,p)=>{
      let j=Math.floor(s/37),last=s%37,c=(p+K[j])%36,k=0;
      while(c===last){j=(j+1)%q;c=(p+K[j])%36;if(++k>=q)throw Error("constant retry")}
      return {c,t:id((j+1)%q,c)};
    }));
    function encode(W,phase=0) {
      let s=id(phase,36);const C=[],states=[s];
      for(const w of W){let out="";for(const p of fromWord(w)){const e=E[s][p];s=e.t;if(e.c<29)out+=alphabet[e.c]}C.push(out);states.push(s)}return {C,states};
    }
    const cache=new Map(),wildCache=new Map();
    function transitions(s,obs) {
      const key=s+"|"+obs;if(cache.has(key))return cache.get(key);
      const C=fromWord(obs),out=[];
      function visit(n,t,i){
        if(n.w!==null&&i===C.length)out.push({t,w:n.w});
        for(const [p,node] of n.next){const e=E[t][p];if(e.c>=29)visit(node,e.t,i);else if(i<C.length&&C[i]===e.c)visit(node,e.t,i+1)}
      }
      visit(root,s,0);cache.set(key,out);return out;
    }
    // All arbitrary nonempty GP29 words, with unlimited silent emissions.
    function wildcard(s,obs) {
      const key=s+"|"+obs;if(wildCache.has(key))return wildCache.get(key);
      const C=fromWord(obs),seen=new Set(),queue=[],out=new Set();
      function push(t,i){const z=i*N+t;if(!seen.has(z)){seen.add(z);queue.push(z)}}
      // A word contains at least one plaintext rune.
      for(const e of E[s]){if(e.c>=29)push(e.t,0);else if(C.length&&e.c===C[0])push(e.t,1)}
      for(let j=0;j<queue.length;j++){const z=queue[j],i=Math.floor(z/N),t=z%N;if(i===C.length)out.add(t);
        for(const e of E[t]){if(e.c>=29)push(e.t,i);else if(i<C.length&&e.c===C[i])push(e.t,i+1)}
      }const ans=[...out];wildCache.set(key,ans);return ans;
    }
    function decode(C,phases=[0],allowOov=true) {
      let exact=new Map(),min=new Map(),best=new Map(),prefix=0,firstExactFailure=null;
      for(const j of phases){const s=id(j,36);exact.set(s,1n);min.set(s,0);best.set(s,{cost:0,path:[]})}
      const perGroup=[];
      for(let i=0;i<C.length;i++){
        const obs=C[i],nx=new Map(),nm=new Map(),nb=new Map();
        const put=(s,v)=>{if(!nm.has(s)||v<nm.get(s))nm.set(s,v)};
        for(const [s,c] of min){for(const e of transitions(s,obs))put(e.t,c);if(allowOov)for(const t of wildcard(s,obs))put(t,c+1)}
        for(const [s,count] of exact){for(const e of transitions(s,obs)){nx.set(e.t,(nx.get(e.t)||0n)+count);const b=best.get(s),cost=b.cost-Math.log((freq.get(e.w)||0)+.1);if(!nb.has(e.t)||cost<nb.get(e.t).cost)nb.set(e.t,{cost,path:[...b.path,e.w]})}}
        exact=nx;min=nm;best=nb;prefix=i+1;const count=[...exact.values()].reduce((a,b)=>a+b,0n);if(!count&&firstExactFailure===null)firstExactFailure=i;
        perGroup.push({i,states:min.size,exactStates:exact.size,exactCount:String(count),minOov:min.size?Math.min(...min.values()):null});
        if(!min.size)break;
      }
      const count=[...exact.values()].reduce((a,b)=>a+b,0n),b=[...best.values()].sort((x,y)=>x.cost-y.cost)[0];
      return {prefix,firstExactFailure,minOov:min.size?Math.min(...min.values()):null,exactCount:String(count),best:b?.path??null,perGroup};
    }
    return {encode,decode,transitions,wildcard};
  }
  function render(W){return W?.map(w=>fromWord(w).map(i=>labels[i]).join("")).join(" ")??null}
  const out=[];
  const plants=[{name:"authentic p57",W:clear},{name:"held Gibran",W:donor[1].slice(Math.floor(donor[1].length*.57)+100,Math.floor(donor[1].length*.57)+164)},{name:"held Emerson",W:donor[2].slice(Math.floor(donor[2].length*.57)+100,Math.floor(donor[2].length*.57)+164)}];
  for(const {name,K} of keys){
    const M=machine(K),controls=[];
    for(const {name:source,W} of plants){
      const e=M.encode(W),d=M.decode(e.C,[0],false);
      const truth=W.every((w,i)=>M.transitions(e.states[i],e.C[i]).some(x=>x.w===w&&x.t===e.states[i+1]));
      if(!truth||d.prefix!==W.length||d.minOov!==0||d.exactCount==="0")throw Error("control truth failed");
      if(JSON.stringify(M.encode(d.best).C)!==JSON.stringify(e.C))throw Error("best replay failed");
      controls.push({source,words:W.length,printed:e.C.join("").length,emptyGroups:e.C.filter(x=>!x.length).length,exactCount:d.exactCount,bestCorrect:d.best.filter((w,i)=>w===W[i]).length,truthRetained:truth});
    }
    const fixed=M.decode(body,[0]),any=M.decode(body,Array.from({length:K.length},(_,i)=>i));
    if(fixed.best&&JSON.stringify(M.encode(fixed.best).C)!==JSON.stringify(body))throw Error("original fixed replay failed");
    out.push({name,K,controls,fixed:{...fixed,bestText:render(fixed.best)},allInitialPhases:{...any,bestText:render(any.best)}});
  }
  return {definition:"mod36 strict repeat retry; P in GP29; visible 0..28, silent 29..35; printed separators copy genuine word boundaries, no space token/key advance; continuous cipher state",lexicon:lex.size,trainingForms:freq.size,originalGroups:body.length,originalRunes:original.length,out};
}
module.exports={experiment};
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,".."),paths={"gp":"resources/liber-primus/lp2-corpus.json","groups":"resources/liber-primus/lp2-page-groups-54-55-derived.json","gold":"resources/external/relikd-solved-gp29-native-v1.json","shakespeare":"resources/control/shakespeare_first300k.txt","gibran":"resources/control/gibran_prophet_58585.txt","emerson":"resources/control/emerson_essays_2944.txt"};const raw=Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,fs.readFileSync(path.join(root,p),"utf8")]));console.log(JSON.stringify(experiment(raw),null,2));}
