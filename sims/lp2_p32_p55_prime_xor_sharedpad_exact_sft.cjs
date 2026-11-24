"use strict";
/** Agent6: exact GP-prime-coded XOR shared pad. */
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function attack(corpus, transcript, lexicon, nativeReference, augmentNative=false) {
  const code=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
  const decode=new Map(code.map((x,i)=>[x,i]));const FULL=(1n<<128n)-1n;
  const assert=(x,m)=>{if(!x)throw Error(m)};
  const runeIndex=new Map(corpus.runes.map((x,i)=>[x,i]));
  const tokens=corpus.translit.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);
  const dict=new Map(),freq=new Map();
  function encode(word) {
    const w=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
    const a=[];for(let i=0;i<w.length;){const t=tokens.find(t=>w.startsWith(t[0],i));if(!t)return null;a.push(t[1]);i+=t[0].length}return a;
  }
  const pack=a=>String.fromCharCode(...a);
  let forms=0;
  for(const line of lexicon.match(/^[a-z]+\s+\d+$/gm)||[]){
    const [w,f]=line.split(/\s+/),a=encode(w);if(!a)continue;forms++;
    if(!dict.has(a.length))dict.set(a.length,new Map());
    dict.get(a.length).set(pack(a),a);freq.set(pack(a),(freq.get(pack(a))||0)+Number(f));
  }
  assert(forms===29154,"lexicon count");
  const nativeAdded=[];
  if(augmentNative)for(const w of readPage(57).words){if(!dict.has(w.length))dict.set(w.length,new Map());if(!dict.get(w.length).has(pack(w))){dict.get(w.length).set(pack(w),w);nativeAdded.push(w.map(x=>corpus.translit[x]).join(""));}}
  const dictionary=new Map([...dict].map(([n,m])=>[n,[...m.values()]]));
  function shape(words,C=words.flat(),carry=false) {
    let p=0;const spans=words.map(w=>{const s={start:p,len:w.length};p+=w.length;return s});
    return {C,spans,where:words.flatMap((w,i)=>w.map(()=>i)),F:C.flatMap((x,i)=>x===0?[i]:[]),carry};
  }
  function readPage(p) {
    const words=transcript.split("%")[p<50?p:p-1].replace(/\/\s*/gu,"").match(/[\u16A0-\u16FF]+/gu).map(w=>[...w].map(x=>runeIndex.get(x)));
    const a=shape(words,words.flat(),p===32||p===55);
    assert(a.C.join()===corpus.pages[p].indices.join(),"source p"+p);
    return {words,...a};
  }
  const A=readPage(32),B=readPage(55);
  assert(A.C.length===121&&B.C.length===76&&A.F.join()==="29,30,42,114"&&B.F.join()==="15,25,41","source constants");
  const options=new Map();
  function option(len,pat,frag=false) {
    const key=[len,pat,frag].join(":");if(options.has(key))return options.get(key);
    const words=(frag?Array.from({length:29},(_,i)=>[i]):dictionary.get(len)||[]).filter(w=>pat==="*"||w.every((v,i)=>(v===0)===(pat[i]==="1")));
    const max=Math.max(1,...words.map(w=>freq.get(pack(w))||1));
    const out={key,words,cost:words.map(w=>frag?0:Math.log(max/(freq.get(pack(w))||1))),frag};options.set(key,out);return out;
  }
  function makeVariant(P,mode,mask) {
    const literal=new Set(P.F.filter((_,i)=>(mask>>i)&1));
    const opts=P.spans.map((s,i)=>option(s.len,mode?Array.from({length:s.len},(_,j)=>literal.has(s.start+j)?"1":"0").join(""):"*",P.carry&&i===0&&s.len===1));
    if(opts.some(o=>!o.words.length))return null;
    return {mask,literal,opts,sites:P.C.flatMap((_,i)=>literal.has(i)?[]:[i])};
  }
  const variants=(P,mode)=>Array.from({length:mode?2**P.F.length:1},(_,m)=>makeVariant(P,mode,m)).filter(Boolean);
  function groups(A,B,va,vb,drop,offset) {
    const sites=vb.sites.filter(i=>i>=drop),gs=new Map();
    for(let k=0;k<sites.length;k++){
      const i=va.sites[offset+k],j=sites[k],a=A.where[i],b=B.where[j],key=a+":"+b;
      if(!gs.has(key))gs.set(key,{a,b,pa:[],pb:[],d:[],sites:[]});
      const g=gs.get(key);g.pa.push(i-A.spans[a].start);g.pb.push(j-B.spans[b].start);g.d.push(code[A.C[i]]^code[B.C[j]]);g.sites.push([i,j]);
    }
    return [...gs.values()];
  }
  const projectionCache=new Map(),allowedCache=new Map();
  function indexRelative(opt,ps) {
    const key=opt.key+"/"+ps.join();if(projectionCache.has(key))return projectionCache.get(key);
    const m=new Map();for(const w of opt.words){
      const f=code[w[ps[0]]],k=pack(ps.slice(1).map(i=>code[w[i]]^f));m.set(k,(m.get(k)||0)|(1<<w[ps[0]]));
    }
    projectionCache.set(key,m);return m;
  }
  function allowed(g,oa,ob) {
    const key=[oa.key,ob.key,g.pa.join(),g.pb.join(),g.d.join()].join("/");
    if(allowedCache.has(key))return allowedCache.get(key);
    const ix=indexRelative(ob,g.pb),delta=g.d.map(x=>x^g.d[0]);
    let result=0n;
    for(const w of oa.words){
      const first=code[w[g.pa[0]]],k=pack(g.pa.slice(1).map((i,j)=>code[w[i]]^first^delta[j+1]));
      let bits=(ix.get(k)||0)>>>0;
      while(bits){const b=31-Math.clz32(bits&-bits);result|=1n<<BigInt(first^g.d[0]^code[b]);bits=(bits&(bits-1))>>>0;}
      if(result===FULL)break;
    }
    allowedCache.set(key,result);return result;
  }
  function prefilter(gs,va,vb) {
    let alive=FULL;
    for(const g of [...gs].filter(g=>g.d.length>=1).sort((a,b)=>b.d.length-a.d.length)){
      alive&=allowed(g,va.opts[g.a],vb.opts[g.b]);if(!alive)break;
    }
    return alive;
  }
  function graph(gs,va,vb) {
    const nodes=new Map();
    function node(k,opt){if(!nodes.has(k))nodes.set(k,{k,opt,edges:[],words:opt.words});return nodes.get(k)}
    for(const g of gs){const l=node("A"+g.a,va.opts[g.a]),r=node("B"+g.b,vb.opts[g.b]);const e={g,l,r};l.edges.push(e);r.edges.push(e)}
    return nodes;
  }
  function signature(w,e,n,s){
    const left=e.l===n;return pack((left?e.g.pa:e.g.pb).map((p,i)=>code[w[p]]^(left?e.g.d[i]^s:0)));
  }
  function full(A,B,va,vb,gs,s,truth=null) {
    const nodes=graph(gs,va,vb),seen=new Set(),roots=[];
    const other=(e,n)=>e.l===n?e.r:e.l;
    function prune(n,child,e) {
      const support=new Set(child.words.map(w=>signature(w,e,child,s)));
      n.words=n.words.filter(w=>support.has(signature(w,e,n,s)));return n.words.length>0;
    }
    function bottom(n,parent) {
      assert(!seen.has(n.k),"non-forest");seen.add(n.k);
      for(const e of n.edges){const child=other(e,n);if(child===parent)continue;if(!bottom(child,n)||!prune(n,child,e))return false}return n.words.length>0;
    }
    for(const n of nodes.values())if(!seen.has(n.k)){roots.push(n);if(!bottom(n,null))return null}
    function top(n,parent) {for(const e of n.edges){const child=other(e,n);if(child===parent)continue;assert(prune(child,n,e),"top support");top(child,n)}}
    for(const root of roots)top(root,null);
    const chosen=new Map();
    function select(n,parent,required,edge) {
      const w=n.words.find(w=>!edge||signature(w,edge,n,s)===required);assert(w,"selection");
      chosen.set(n.k,w);for(const e of n.edges){const child=other(e,n);if(child!==parent)select(child,n,signature(w,e,n,s),e)}
    }
    for(const root of roots)select(root,null,null,null);
    const pA=A.spans.map((_,i)=>chosen.get("A"+i)||null),pB=B.spans.map((_,i)=>chosen.get("B"+i)||null);
    const render=p=>p.map(w=>w?w.map(x=>corpus.translit[x]).join(""):"?").join(" ");
    const pad=[];let forcedA=0,forcedB=0,matchedA=0,matchedB=0;
    for(const g of gs)for(let k=0;k<g.d.length;k++){
      const [i,j]=g.sites[k],pa=pA[g.a][g.pa[k]],pb=pB[g.b][g.pb[k]],K=code[A.C[i]]^code[pa];
      assert(pa<29&&pb<29&&(code[pb]^K^s)===code[B.C[j]],"exact XOR replay");pad.push(K);
      if(nodes.get("A"+g.a).words.every(w=>w[g.pa[k]]===pa))forcedA++;
      if(nodes.get("B"+g.b).words.every(w=>w[g.pb[k]]===pb))forcedB++;
      if(truth){matchedA+=+(pa===truth[0][i]);matchedB+=+(pb===truth[1][j])}
    }
    return {A:render(pA),B:render(pB),pad,forcedA,forcedB,matchedA,matchedB,overlap:pad.length};
  }
  const summaries=[],softResults=[];
  for(const mode of [false,true]){
    const aa=variants(A,mode),bb=variants(B,mode),out={mode,masks:[aa.length,bb.length],placements:0,directLocal:0,relativeLocal:0,directFull:0,relativeFull:0,examples:[]};
    for(const va of aa)for(const vb of bb)for(const drop of [0,1]){
      const count=vb.sites.filter(i=>i>=drop).length;
      for(let off=0;off<=va.sites.length-count;off++){
        out.placements++;const gs=groups(A,B,va,vb,drop,off),alive=prefilter(gs,va,vb);
        
        if(alive&1n)out.directLocal++;
        for(let s=0;s<128;s++){if(!(alive&(1n<<BigInt(s))))continue;out.relativeLocal++;
          const r=full(A,B,va,vb,gs,s);if(!r)continue;
          out.relativeFull++;if(!s)out.directFull++;
          if(out.examples.length<10)out.examples.push({offset:off,drop,maskA:va.mask,maskB:vb.mask,relativeXor:s,...r});
        }
      }
    }
    summaries.push(out);
  }
  assert(summaries[0].placements===93,"ordinary alignment count");
  let seed=0x6c696265;
  function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}
  function makePlant(wa,wb,mode,relative,offset,carryA=false,carryB=false){
    const pa=wa.flat(),pb=wb.flat(),active=x=>x.flatMap((v,i)=>mode&&v===0?[]:[i]),sa=active(pa),sb=active(pb);
    assert(offset+sb.length<=sa.length,"plant alignment");
    const ca=Array(pa.length).fill(0),cb=Array(pb.length).fill(0),key=[];
    for(let i=0;i<sa.length;i++){
      const a=pa[sa[i]],b=i>=offset&&i<offset+sb.length?pb[sb[i-offset]]:null;
      const ks=Array.from({length:128},(_,k)=>k).filter(k=>decode.has(code[a]^k)&&(b===null||decode.has(code[b]^k^relative)));assert(ks.length,'plant key support');
      const k=ks[rand(ks.length)];key.push(k);ca[sa[i]]=decode.get(code[a]^k);if(b!==null)cb[sb[i-offset]]=decode.get(code[b]^k^relative);
    }
    const x=shape(wa,ca,carryA),y=shape(wb,cb,carryB);
    const mA=x.F.reduce((m,i,j)=>m|(mode&&pa[i]===0?1<<j:0),0),mB=y.F.reduce((m,i,j)=>m|(mode&&pb[i]===0?1<<j:0),0);
    const va=makeVariant(x,mode,mA),vb=makeVariant(y,mode,mB);assert(va&&vb,"planted dictionary support");
    const gs=groups(x,y,va,vb,0,offset),alive=prefilter(gs,va,vb);assert(alive&(1n<<BigInt(relative)),"planted key filter");
    const result=full(x,y,va,vb,gs,relative,[pa,pb]);assert(result,"plant exact inverse lost");
    return {mode,relative,offset,actualHolds:[pa.filter(v=>v===0).length,pb.filter(v=>v===0).length],overlap:result.overlap,forcedA:result.forcedA,forcedB:result.forcedB,matchedA:result.matchedA,matchedB:result.matchedB,padMatches:result.pad.filter((k,i)=>k===key[i+offset]).length};
  }
  const positives=[];
  for(const mode of [false,true]){
    const aa=variants(A,mode),bb=variants(B,mode);
    for(let t=0;t<3;t++){
      const va=aa[(t*3)%aa.length],vb=bb[(t*5)%bb.length];
      const wa=va.opts.map(o=>o.words[rand(o.words.length)]),wb=vb.opts.map(o=>o.words[rand(o.words.length)]);
      positives.push({type:"source-shaped dictionary",...makePlant(wa,wb,mode,mode?14*t:0,5+t*8,true,true)});
    }
  }
  const parable=readPage(57).words;
  const warningText=nativeReference.split("### 1\n")[1].split("### 3")[0];
  const warning=warningText.match(/[A-Z]+/g).map(encode);
  const nativeMissing=[...warning,...parable].filter(w=>!dict.get(w.length)?.has(pack(w))).map(w=>w.map(x=>corpus.translit[x]).join(""));
  if(!nativeMissing.length)for(const mode of [false,true])positives.push({type:"WARNING reference + exact p57",...makePlant(warning,parable,mode,0,10)});
  softResults.sort((a,b)=>a.oov-b.oov||a.frequencyCost-b.frequencyCost);
  const softHistogram={};for(const r of softResults)softHistogram[r.oov]=(softHistogram[r.oov]||0)+1;
  return {code,nativeAdded,dictionaryForms:forms,uniqueForms:[...dictionary.values()].reduce((n,v)=>n+v.length,0),summaries,positives,nativeMissing,cache:{projection:projectionCache.size,allowed:allowedCache.size}};
}
console.log(JSON.stringify(attack(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt"),read("resources/control/english_wordfreq_textblob.txt"),read("resources/liber-primus/lp1-plaintext-reference.txt"),true),null,2));
