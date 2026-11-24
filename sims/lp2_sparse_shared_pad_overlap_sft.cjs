"use strict";
const fs=require("node:fs"),path=require("node:path");
function run(corpus,raw,native,donorTexts,stage="all"){
  const assert=(x,m)=>{if(!x)throw Error(m)};
  const mod=x=>(x+29)%29;
  const runeMap=new Map(corpus.runes.map((x,i)=>[x,i]));
  const ids=s=>[...s].map(x=>runeMap.get(x)).filter(x=>x!==undefined);
  const cfg={L:64,plantL:80,screenEdges:4,nullReplicates:99,minimumLLR:Math.log(1e6),seed:258011,chapterPairs:[[15,22],[40,53]],startAtEitherBoundary:true};
  let seed=cfg.seed>>>0;
  const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
  const random=n=>rng()%n;
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=random(i+1),v=a[i];a[i]=a[j];a[j]=v}return a}
  const all=[];let p=0,sp=0,word=[];
  const finish=()=>{if(word.length)all.push({p:sp>=50?sp+1:sp,w:word});word=[]};
  for(const ch of raw.split("%").slice(0,55).join("%")){
    if(runeMap.has(ch)){if(!word.length)sp=p;word.push(runeMap.get(ch))}
    else if(ch==="%")p++;
    else if(ch!=="/"&&!/\s/.test(ch))finish();
  }
  finish();assert(all.length===2896&&String(all.flatMap(x=>x.w))===String(corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices)),"source reconstruction");
  const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  function latin(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");const a=[];while(w.length){const t=tokens.find(t=>w.startsWith(t.s));if(!t)throw Error(w);a.push(t.i);w=w.slice(t.s.length)}out.push(a)}return out}
  const donors=donorTexts.flatMap(latin),solved=native.sections.map(s=>({name:s.name,words:(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(ids)}));
  const encode=a=>String.fromCharCode(...a.map(x=>65+x));
  const decode=s=>[...s].map(x=>x.charCodeAt(0)-65);
  /** Length-conditioned word model, with target sections removed completely. */
  function makeModel(exclude){
    const by=new Map(),fcache=new Map(),pcache=new Map();
    for(const w of [...donors,...solved.filter(x=>!exclude.includes(x.name)).flatMap(x=>x.words)]){
      let m=by.get(w.length);if(!m)by.set(w.length,m=new Map());const s=encode(w);m.set(s,(m.get(s)||0)+1);
    }
    const frag=(n,off,m)=>{
      const key=`${n}/${off}/${m}`;if(fcache.has(key))return fcache.get(key);
      const out=new Map();let tot=0;
      for(const [w,v] of by.get(n)||[]){const t=w.slice(off,off+m);if(t.includes("A"))continue;out.set(t,(out.get(t)||0)+v);tot+=v}
      const s=[...out.keys()],weights=Float64Array.from(s,x=>out.get(x)/tot),q={s,weights};fcache.set(key,q);return q;
    };
    const pow=[1,64,4096,262144,16777216];
    const three=Array.from({length:6},(_,n)=>pow.slice(0,n).reduce((a,v)=>a+3*v,0));
    const top=Array.from({length:6},(_,n)=>pow.slice(0,n).reduce((a,v)=>a+32*v,0));
    const pack=s=>{let a=0;for(let k=0;k<s.length;k++)a+=(s.charCodeAt(k)-65)*pow[k];return a};
    const project=(n,off,m)=>{
      const key=`${n}/${off}/${m}`;if(pcache.has(key))return pcache.get(key);
      const a=Uint32Array.from(frag(n,off,m).s,pack),q={a,set:new Set(a)};pcache.set(key,q);return q;
    };
    // Five parallel base-64 lanes, each holding one residue mod 29.
    // sum+3 raises bit5 exactly when lane >=29; subtract 29 in those lanes.
    const add=(a,b,m)=>{const s=a+b;return s-(((s+three[m])&top[m])>>>5)*29};
    for(let a=0;a<29;a++)for(let b=0;b<29;b++)assert(add(a,b,1)===(a+b)%29,"packed arithmetic");
    return {by,frag,project,add,pow,types:[...by.values()].reduce((a,m)=>a+m.size,0)};
  }
  function tape(words){const c=Uint8Array.from(words.flat()),start=new Int32Array(c.length),end=new Int32Array(c.length);let i=0;for(const w of words){start.fill(i,i,i+w.length);end.fill(i+w.length,i,i+w.length);i+=w.length}assert(i===c.length&&[...c].every((_,k)=>start[k]<=k&&end[k]>k),"word geometry");return {c,start,end,words}}
  function prefixZero(c){const z=new Uint32Array(c.length+1);for(let i=0;i<c.length;i++)z[i+1]=z[i]+Number(c[i]===0);return z}
  function view(t,i,L,model){
    const g=[];for(let x=i;x<i+L;){const n=t.end[x]-t.start[x],off=x-t.start[x],hi=Math.min(i+L,t.end[x]);g.push({lo:x-i,hi:hi-i,n,off,frag:model.frag(n,off,hi-x)});x=hi}
    return {i,g};
  }
  /** Each maximal intersection is an edge of the interval-overlap forest. */
  function edgeList(A,B,model){
    let i=0,j=0;const edges=[];
    while(i<A.g.length&&j<B.g.length){
      const a=A.g[i],b=B.g[j],lo=Math.max(a.lo,b.lo),hi=Math.min(a.hi,b.hi),m=Math.min(5,hi-lo);
      const pa=model.project(a.n,a.off+lo-a.lo,m),pb=model.project(b.n,b.off+lo-b.lo,m);
      const rev=pa.a.length>pb.a.length;
      edges.push({lo,m,from:rev?pb.a:pa.a,to:rev?pa.set:pb.set,rev,priority:Math.log(pa.a.length)+Math.log(pb.a.length)-m*Math.log(29)});
      if(a.hi===hi)i++;if(b.hi===hi)j++;
    }
    return edges.sort((a,b)=>a.priority-b.priority).slice(0,cfg.screenEdges);
  }
  function screen(edges,c1,c2,i,j,model){
    for(const e of edges){let d=0;for(let k=0;k<e.m;k++){const a=c1[i+e.lo+k],b=c2[j+e.lo+k];d+=mod(e.rev?a-b:b-a)*model.pow[k]}let hit=false;for(const x of e.from)if(e.to.has(model.add(x,d,e.m))){hit=true;break}if(!hit)return false}
    return true;
  }
  /** Exact sum-product and optional max-product/count pass on an overlap forest.
      Priors are conditional on printed length and no plaintext F in the observed slice. */
  function score(A,B,c1,c2,decodePath=false){
    const L=cfg.L,d=Uint8Array.from({length:L},(_,k)=>mod(c1[A.i+k]-c2[B.i+k]));
    const pa=new Int16Array(L).fill(-1),pb=new Int16Array(L).fill(-1);
    const state=(g,side)=>({g,side,w:g.frag.weights.slice(),...(decodePath?{best:Float64Array.from(g.frag.weights,Math.log),count:Float64Array.from(g.frag.weights,()=>1),children:[]}: {})});
    const cap=1e15;
    let total=0,logMAP=0,count=1;
    function trace(s,k){const out=s.side===0?pa:pb;out.set(decode(s.g.frag.s[k]),s.g.lo);for(const child of s.children)trace(child.s,child.arg[k])}
    function message(a,b,lo,hi){
      const m=hi-lo,offsetA=lo-a.g.lo,offsetB=lo-b.g.lo,table=new Map(),shift=Uint8Array.from({length:m},(_,k)=>a.side===0?mod(-d[lo+k]):d[lo+k]);
      // Sending lexical word determines the receiving word's exact overlapping slice.
      for(let k=0;k<a.w.length;k++){
        if(!a.w[k]&&(!decodePath||!a.count[k]))continue;
        const s=a.g.frag.s[k];let key="",valid=true;
        for(let z=0;z<m;z++){const v=(s.charCodeAt(offsetA+z)-65+shift[z])%29;if(v===0){valid=false;break}key+=String.fromCharCode(65+v)}
        if(!valid)continue;
        let e=table.get(key);if(!e){e={sum:0,best:-Infinity,arg:-1,count:0};table.set(key,e)}
        e.sum+=a.w[k];if(decodePath){e.count=Math.min(cap,e.count+a.count[k]);if(a.best[k]>e.best){e.best=a.best[k];e.arg=k}}
      }
      let s=0;const arg=decodePath?new Int32Array(b.w.length).fill(-1):null;
      for(let k=0;k<b.w.length;k++){
        const key=b.g.frag.s[k].slice(offsetB,offsetB+m),e=table.get(key);
        b.w[k]*=e?.sum||0;s+=b.w[k];
        if(decodePath){b.best[k]+=e?.best??-Infinity;b.count[k]=Math.min(cap,b.count[k]*(e?.count||0));if(e)arg[k]=e.arg}
      }
      if(!s)return false;
      for(let k=0;k<b.w.length;k++)b.w[k]/=s;
      total+=Math.log(s);if(decodePath)b.children.push({s:a,arg});
      return true;
    }
    function complete(b){if(!decodePath)return;let k=-1,best=-Infinity,n=0;for(let z=0;z<b.w.length;z++){n=Math.min(cap,n+b.count[z]);if(b.best[z]>best){best=b.best[z];k=z}}assert(k>=0,"map trace");trace(b,k);logMAP+=best;count=Math.min(cap,count*n)}
    let i=0,j=0,a=state(A.g[0],0),b=state(B.g[0],1);
    while(i<A.g.length&&j<B.g.length){
      const lo=Math.max(a.g.lo,b.g.lo),hi=Math.min(a.g.hi,b.g.hi);
      if(a.g.hi<=b.g.hi){
        if(!message(a,b,lo,hi))return null;
        if(a.g.hi===b.g.hi){complete(b);j++;if(j<B.g.length)b=state(B.g[j],1)}
        i++;if(i<A.g.length)a=state(A.g[i],0);
      }else{
        if(!message(b,a,lo,hi))return null;
        j++;if(j<B.g.length)b=state(B.g[j],1);
      }
    }
    const llr=total+L*Math.log(29);
    if(!decodePath)return {llr};
    assert([...pa,...pb].every(x=>x>=1),"decoded nonzero");
    const key=Array.from(pa,(x,k)=>mod(c1[A.i+k]-x));
    for(let k=0;k<L;k++)assert((pb[k]+key[k])%29===c2[B.i+k]&&(pa[k]+key[k])%29===c1[A.i+k],"replay");
    return {llr,logMAP,logPosterior:logMAP-total,count,countCapped:count===cap,pa:[...pa],pb:[...pb],key};
  }
  /** Precompute all eligible windows and geometry, independent of nonzero values. */
  function prepare(t1,t2,model){
    const L=cfg.L;
    function views(t){const z=prefixZero(t.c),v=[];for(let i=0;i+L<=t.c.length;i++)if(z[i+L]===z[i])v.push(view(t,i,L,model));return v}
    const v1=views(t1),v2=views(t2),pairs=[];
    for(const A of v1)for(const B of v2){if(cfg.startAtEitherBoundary&&t1.start[A.i]!==A.i&&t2.start[B.i]!==B.i)continue;if(A.g.some(x=>!x.frag.s.length)||B.g.some(x=>!x.frag.s.length))continue;pairs.push({A,B,edges:edgeList(A,B,model)})}
    return {v1:v1.length,v2:v2.length,pairs};
  }
  function scan(prep,c1,c2,model){
    let screened=0,feasible=0,best=null;
    for(const x of prep.pairs){if(!screen(x.edges,c1,c2,x.A.i,x.B.i,model))continue;screened++;const s=score(x.A,x.B,c1,c2);if(!s)continue;feasible++;if(!best||s.llr>best.llr)best={i:x.A.i,j:x.B.i,llr:s.llr}}
    return {windows:prep.pairs.length,screened,feasible,best};
  }
  function pick(t,model,L){
    const z=prefixZero(t.c),candidates=[];
    for(let i=0;i+L<=t.c.length;i++){
      if(z[i+L]!==z[i])continue;
      let ok=true;
      for(let x=i;x<i+L;){const l=t.start[x],h=t.end[x],w=encode([...t.c.slice(l,h)]);if(!model.by.get(h-l)?.has(w)){ok=false;break}x=h}
      if(ok)candidates.push(i);
    }
    return candidates;
  }
  function crypt(t1,t2,i,j,shared){
    const L=cfg.plantL,k1=new Uint8Array(t1.c.length),k2=new Uint8Array(t2.c.length);
    // Uniform independent consuming pads outside the nominated region.
    // F is transparent; these arrays store the per-physical-rune pad used.
    // Any such array is realized by dropping pad entries at plaintext-F holds.
    for(let x=0;x<k1.length;x++)k1[x]=random(29);for(let x=0;x<k2.length;x++)k2[x]=random(29);
    for(let x=0;x<L;x++){
      let k;do{k=random(29)}while((t1.c[i+x]+k)%29===0||(shared&&(t2.c[j+x]+k)%29===0));k1[i+x]=k;
      if(shared)k2[j+x]=k;else{do{k=random(29)}while((t2.c[j+x]+k)%29===0);k2[j+x]=k}
    }
    const enc=(t,k)=>({...t,c:Uint8Array.from(t.c,(x,z)=>x===0?0:(x+k[z])%29)});
    return {a:enc(t1,k1),b:enc(t2,k2),k1,k2};
  }
  const controlPairs=[["0_koan_1","0_welcome"],["0_loss_of_divinity","jpg107-167"],["jpg107-167","0_welcome"]];
  const controls=[];
  for(const names of controlPairs){
    const model=makeModel(names),t1=tape(solved.find(x=>x.name===names[0]).words),t2=tape(solved.find(x=>x.name===names[1]).words),a=pick(t1,model,cfg.plantL),b=pick(t2,model,cfg.plantL);
    if(!a.length||!b.length){controls.push({names,eligible:[a.length,b.length],status:"lexical eligibility failed"});continue}
    const i=a[random(a.length)],j=b[random(b.length)],plant=crypt(t1,t2,i,j,true),prep=prepare(plant.a,plant.b,model),s=scan(prep,plant.a.c,plant.b.c,model);
    let result=null;
    if(s.best){const {i:x,j:y}=s.best,dec=score(view(plant.a,x,cfg.L,model),view(plant.b,y,cfg.L,model),plant.a.c,plant.b.c,true);
      result={aligned:x-i===y-j&&x>=i&&x+cfg.L<=i+cfg.plantL,matchA:dec.pa.filter((v,k)=>v===t1.c[x+k]).length,matchB:dec.pb.filter((v,k)=>v===t2.c[y+k]).length,keyMatch:dec.key.filter((v,k)=>v===plant.k1[x+k]&&v===plant.k2[y+k]).length,count:dec.count,logPosterior:dec.logPosterior};
    }
    const independent=crypt(t1,t2,i,j,false),ip=prepare(independent.a,independent.b,model),ins=scan(ip,independent.a.c,independent.b.c,model);
    controls.push({names,eligible:[a.length,b.length],plant:{i,j,...s,...result},independent:ins});
  }
  // Acceptance is frozen before any original values are scored: all three
  // target-excluded plants must find the planted diagonal and exact key/text,
  // and all independent controls must stay below the fixed LLR threshold.
  const pass=controls.length===3&&controls.every(x=>x.plant?.aligned&&x.plant.matchA===cfg.L&&x.plant.matchB===cfg.L&&x.plant.keyMatch===cfg.L&&x.plant.best.llr>=cfg.minimumLLR&&(!x.independent.best||x.independent.best.llr<cfg.minimumLLR));
  const result={cfg,controls,pass};
  if(stage==="calibrate"||!pass)return result;
  const model=makeModel([]),[t1,t2]=cfg.chapterPairs.map(([a,b])=>tape(all.filter(x=>x.p>=a&&x.p<=b).map(x=>x.w))),prep=prepare(t1,t2,model);
  // Randomize nonzero symbols within each original chapter, retaining the
  // exact zero masks, printed geometry, lengths, and all symbol counts.
  const permute=c=>{const a=shuffle([...c].filter(x=>x!==0));let j=0;return Uint8Array.from(c,x=>x===0?0:a[j++])};
  const nulls=[];
  for(let q=0;q<cfg.nullReplicates;q++){const s=scan(prep,permute(t1.c),permute(t2.c),model);nulls.push({feasible:s.feasible,max:s.best?.llr??null})}
  const s=scan(prep,t1.c,t2.c,model),mx=Math.max(-Infinity,...nulls.map(x=>x.max??-Infinity));
  result.original={lengths:[t1.c.length,t2.c.length],types:model.types,zeroFreeWindows:[prep.v1,prep.v2],...s,nulls,maxNull:Number.isFinite(mx)?mx:null,p:(1+nulls.filter(x=>(x.max??-Infinity)>=(s.best?.llr??-Infinity)).length)/(1+nulls.length),nominated:!!s.best&&s.best.llr>=cfg.minimumLLR&&s.best.llr>mx};
  if(result.original.nominated){const {i,j}=s.best;result.original.candidate=score(view(t1,i,cfg.L,model),view(t2,j,cfg.L,model),t1.c,t2.c,true)}
  return result;
}
module.exports={run};
if(require.main===module){const root=path.resolve(__dirname,".."),paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];const [cj,raw,nj,...donors]=paths.map(p=>fs.readFileSync(path.join(root,p),"utf8"));console.log(JSON.stringify(run(JSON.parse(cj),raw,JSON.parse(nj),donors,process.argv[2]||"all"),null,2))}
