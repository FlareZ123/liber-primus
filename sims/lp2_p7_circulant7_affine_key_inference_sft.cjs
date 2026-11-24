"use strict";
/** Agent46: source-fixed seven-channel all-secret affine circulant inverse. Run with Node 22. */
function experiment(inputs, mode='scalar') {
  const [gp,trans,lex,native]=[JSON.parse(inputs[0]),inputs[1],inputs[2],JSON.parse(inputs[3])];
  const mod=x=>(x%29+29)%29, check=(x,m)=>{if(!x)throw Error(m)}, m=new Map(gp.runes.map((x,i)=>[x,i])), alpha=new Map(gp.translit.map((x,i)=>[x,i]));
  const parse=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(c=>m.get(c)));
  const orig=parse(trans.split("%").slice(8,15).join("").replace(/[\/\s]/gu,""));
  check(orig.length===383&&orig.flat().length===1729&&orig.flat().join(",")===gp.pages.slice(8,15).flatMap(p=>p.indices).join(","),"original source");
  const solved=native.sections.map(s=>parse(s.source_text));
  const dict=Array.from({length:32},()=>new Map());
  const add=w=>{if(w.length&&w.length<32)dict[w.length].set(w.join(","),w)};
  function variants(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function walk(i,w){if(i===s.length){add(w);return}for(const n of [1,2,3]){const a=s.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?alpha.get("NG"):undefined):alpha.get(a);if(v!==undefined)walk(i+n,[...w,v])}}walk(0,[])}
  for(const l of lex.split(/\r?\n/)){const z=/^([a-z]+)\s+(\d+)$/.exec(l);if(z&&z[1].length>=2)variants(z[1])}
  for(const s of solved)for(const w of s)add(w);
  for(const x of [24,10,3,16])add([x]);
  const allowed=[3,10,16,24], allowedSet=new Set(allowed);
  const dot=(a,b)=>mod(a.reduce((s,x,i)=>s+x*b[i],0));
  const inv=x=>{for(let y=1;y<29;y++)if(mod(x*y)===1)return y;throw Error("nonunit")};
  function inverse(A){const n=A.length,B=A.map((r,i)=>[...r,...Array.from({length:n},(_,j)=>+(j===i))]);for(let j=0;j<n;j++){const p=B.findIndex((r,i)=>i>=j&&r[j]);if(p<0)return null;[B[p],B[j]]=[B[j],B[p]];const s=inv(B[j][j]);B[j]=B[j].map(x=>mod(x*s));for(let i=0;i<n;i++)if(i!==j){const q=B[i][j];if(q)B[i]=B[i].map((x,k)=>mod(x-q*B[j][k]))}}return B.map(r=>r.slice(n))}
  function rankBasis(rows){const piv=[],basis=[];for(let i=0;i<rows.length;i++){let r=rows[i].slice();for(const [j,v] of piv){const q=r[j];r=r.map((x,k)=>mod(x-q*v[k]))}const j=r.findIndex(Boolean);if(j<0)continue;const s=inv(r[j]);r=r.map(x=>mod(x*s));piv.push([j,r]);basis.push(i);if(basis.length===rows[0].length)break}return basis}
  const matrix=k=>Array.from({length:7},(_,i)=>Array.from({length:7},(_,j)=>k[mod7(j-i)]));
  const mod7=x=>(x%7+7)%7;
  function geometry(n,layout){check(n%7===0,"block length");const h=n/7;return {h,index:(g,j)=>layout==="groups"?7*g+j:j*h+g,phase:i=>layout==="groups"?i%7:Math.floor(i/h),group:i=>layout==="groups"?Math.floor(i/7):i%h}}
  function rowsOf(c,layout){const g=geometry(c.length,layout);return c.map((_,i)=>Array.from({length:8},(_,j)=>j===7?1:c[g.index(g.group(i),mod7(g.phase(i)+j))]))}
  function encode(p,key,layout){const g=geometry(p.length,layout),A=inverse(matrix(key));check(A,"singular key");const c=Array(p.length);for(let i=0;i<g.h;i++){const v=Array.from({length:7},(_,j)=>mod(p[g.index(i,j)]-key[7]));for(let j=0;j<7;j++)c[g.index(i,j)]=dot(A[j],v)}return c}
  function wordRows(words){let off=0;return words.map(w=>{const o={off,len:w.length};off+=w.length;return o})}
  function fit(c,words,layout) {
    const rows=rowsOf(c,layout), wr=wordRows(words), cut=wr.findIndex(w=>w.off>=Math.floor(c.length*.65));
    const fitWords=wr.slice(0,cut), heldWords=wr.slice(cut), fitEnd=heldWords[0].off;
    const si=fitWords.filter(w=>w.len===1).map(w=>w.off), allsi=wr.filter(w=>w.len===1).map(w=>w.off);
    const keys=new Map(), anchorStats=[];
    const anchors=fitWords.filter(w=>w.len>=8&&w.len<32);
    for(const w of anchors){const rr=rows.slice(w.off,w.off+w.len), bi=rankBasis(rr);if(bi.length!==8){anchorStats.push({offset:w.off,len:w.len,rank:bi.length,forms:dict[w.len].size,candidates:null});continue}
      const B=inverse(bi.map(i=>rr[i]));check(B,"rank mismatch");const cand=new Set();let raw=0;
      for(const v of dict[w.len].values()){
        const k=B.map(row=>dot(row,bi.map(i=>v[i])));if(rr.some((r,i)=>dot(r,k)!==v[i]))continue;raw++;
        if(si.some(i=>!allowedSet.has(dot(rows[i],k))))continue;
        if(!inverse(matrix(k)))continue;const id=k.join(",");cand.add(id);if(!keys.has(id))keys.set(id,{key:k,anchors:0});}
      for(const id of cand)keys.get(id).anchors++;
      anchorStats.push({offset:w.off,len:w.len,rank:8,forms:dict[w.len].size,exactWordFits:raw,candidates:cand.size});
    }
    function evaluate(p,ws){let wordsHit=0,runesHit=0,runesTotal=0;for(const w of ws){if(w.len<3)continue;runesTotal+=w.len;if(w.len<32&&dict[w.len].has(p.slice(w.off,w.off+w.len).join(","))){wordsHit++;runesHit+=w.len}}return {wordsHit,runesHit,runesTotal}}
    const ranked=[...keys.values()].map(k=>{const p=rows.slice(0,fitEnd).map(r=>dot(r,k.key));return {...k,score:evaluate(p,fitWords)}}).sort((a,b)=>b.score.runesHit-a.score.runesHit||b.anchors-a.anchors||a.key.join(",").localeCompare(b.key.join(",")));
    const winners=ranked.length?ranked.filter(k=>k.score.runesHit===ranked[0].score.runesHit&&k.anchors===ranked[0].anchors):[];
    const predictions=winners.map(k=>{const p=rows.map(r=>dot(r,k.key));check(encode(p,k.key,layout).join(",")===c.join(","),"original replay");return {...k,holdout:evaluate(p,heldWords),heldSingletons:allsi.filter(i=>i>=fitEnd).map(i=>p[i]),p}});
    // An independent exact singleton-only count when rank is full. No dictionary or plaintext scoring.
    const sb=rankBasis(allsi.map(i=>rows[i]));let singletonOnly=null;
    if(sb.length===8){const B=inverse(sb.map(j=>rows[allsi[j]]));let linear=0,nonsingular=0;const v=Array(8);function walk(j){if(j===8){const k=B.map(r=>dot(r,v));if(allsi.some(i=>!allowedSet.has(dot(rows[i],k))))return;linear++;if(inverse(matrix(k)))nonsingular++;return}for(const x of allowed){v[j]=x;walk(j+1)}}walk(0);singletonOnly={rank:8,enumerated:4**8,linear,nonsingular}}
    else singletonOnly={rank:sb.length,enumerated:null};
    return {layout,trainRunes:fitEnd,heldRunes:c.length-fitEnd,trainSingletons:si.length,allSingletons:allsi.length,anchorStats,uniqueCandidateKeys:keys.size,maxCompatibleAnchors:Math.max(0,...[...keys.values()].map(k=>k.anchors)),singletonOnly,predictions};
  }

  /** Period-seven ordinary additive layer in either order with the circulant mixer. */
  function encodePhase(p,key,layout){
    const g=geometry(p.length,layout),A=inverse(matrix(key));check(A,"singular phase key");
    const c=Array(p.length);
    for(let i=0;i<g.h;i++){
      const v=Array.from({length:7},(_,j)=>{const q=g.index(i,j);return mod(p[q]-key[7+q%7])});
      for(let j=0;j<7;j++)c[g.index(i,j)]=dot(A[j],v);
    }return c;
  }
  function fitPhase(c,words,layout){
    const g=geometry(c.length,layout);
    check(layout==="groups"||g.h%7!==0,"lane phase degeneracy");
    const rows=rowsOf(c,layout).map(x=>x.slice(0,7)),wr=wordRows(words);
    const cut=wr.findIndex(w=>w.off>=Math.floor(c.length*.65)),fw=wr.slice(0,cut),hw=wr.slice(cut),fitEnd=hw[0].off;
    const si=fw.filter(w=>w.len===1).map(w=>w.off),keys=new Map(),anchorStats=[];
    const diff=(a,b)=>a.map((x,i)=>mod(x-b[i]));
    const val=(i,k)=>mod(dot(rows[i],k)+k[7+i%7]);
    function coverage(k,ws){let wordsHit=0,runesHit=0,runesTotal=0;for(const w of ws){if(w.len<3)continue;runesTotal+=w.len;const p=Array.from({length:w.len},(_,i)=>val(w.off+i,k));if(w.len<32&&dict[w.len].has(p.join(","))){wordsHit++;runesHit+=w.len}}return{wordsHit,runesHit,runesTotal}}
    // All complete length >=11 training words. Choose this before scoring the original.
    for(const w of fw.filter(x=>x.len>=11&&x.len<32)){
      const piv=Array(7).fill(-1),eq=[];
      for(let i=0;i<w.len;i++){const j=(w.off+i)%7;if(piv[j]<0)piv[j]=i;else eq.push({row:diff(rows[w.off+i],rows[w.off+piv[j]]),a:i,b:piv[j],singleton:false})}
      for(const i of si){const b=piv[i%7];eq.push({row:diff(rows[i],rows[w.off+b]),a:i,b,singleton:true})}
      const bi=rankBasis(eq.map(x=>x.row));
      if(bi.length!==7){anchorStats.push({offset:w.off,len:w.len,rank:bi.length,forms:dict[w.len].size,candidates:null});continue}
      const es=bi.map(i=>eq[i]),B=inverse(es.map(x=>x.row));check(B,"rank mismatch");
      const basisSet=new Set(bi),other=eq.filter((_,i)=>!basisSet.has(i));
      const rhs=Array(7).fill(0),deltas=[];
      function walk(j){if(j===7){const k=B.map(row=>dot(row,rhs));deltas.push({k,proj:other.map(e=>dot(e.row,k))});return}if(es[j].singleton){for(const x of allowed){rhs[j]=x;walk(j+1)}}else{rhs[j]=0;walk(j+1)}}walk(0);
      const cand=new Set();let visits=0,linear=0;
      for(const p of dict[w.len].values()){
        const b=es.map(e=>mod((e.singleton?0:p[e.a])-p[e.b])),k0=B.map(r=>dot(r,b));
        const bases=other.map(e=>dot(e.row,k0)),wordTargets=other.map(e=>e.singleton?null:mod(p[e.a]-p[e.b]));
        for(const d of deltas){
          visits++;let ok=true;
          for(let j=0;j<other.length;j++){
            const e=other[j],x=mod(bases[j]+d.proj[j]);
            if(e.singleton?!allowedSet.has(mod(x+p[e.b])):x!==wordTargets[j]){ok=false;break}
          }
          if(!ok)continue;
          linear++;
          const k=k0.map((x,i)=>mod(x+d.k[i]));
          if(!inverse(matrix(k)))continue;
          const full=[...k,...piv.map(x=>mod(p[x]-dot(rows[w.off+x],k)))];
          check(Array.from({length:w.len},(_,i)=>val(w.off+i,full)).join(",")===p.join(","),"anchor");
          check(si.every(i=>allowedSet.has(val(i,full))),"singleton");
          const id=full.join(",");cand.add(id);if(!keys.has(id))keys.set(id,{key:full,anchors:0});
        }
      }
      for(const id of cand)keys.get(id).anchors++;
      anchorStats.push({offset:w.off,len:w.len,rank:7,forms:dict[w.len].size,selectedSingletons:es.filter(x=>x.singleton).length,enumerated:visits,linear,candidates:cand.size});
    }
    const maxCompatibleAnchors=[...keys.values()].reduce((m,k)=>Math.max(m,k.anchors),0);
    const ranked=[...keys.values()].filter(k=>k.anchors===maxCompatibleAnchors).map(k=>({...k,score:coverage(k.key,fw)})).sort((a,b)=>b.score.runesHit-a.score.runesHit||a.key.join(",").localeCompare(b.key.join(",")));
    const winners=ranked.length?ranked.filter(k=>k.score.runesHit===ranked[0].score.runesHit):[];
    const predictions=winners.map(k=>{const p=rows.map((_,i)=>val(i,k.key));check(encodePhase(p,k.key,layout).join(",")===c.join(","),"phase replay");return{...k,holdout:coverage(k.key,hw),heldSingletons:hw.filter(w=>w.len===1).map(w=>p[w.off]),p}});
    return{layout,trainRunes:fitEnd,heldRunes:c.length-fitEnd,trainSingletons:si.length,anchorStats,uniqueCandidateKeys:keys.size,maxCompatibleAnchors,predictions};
  }

  let rng=0x46a713;const rand=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0};
  function trim(words){let n=0,last=0;for(let i=0;i<words.length;i++){n+=words[i].length;if(n%7===0)last=i+1}return words.slice(0,last)}
  const controls=[trim(solved.slice(0,4).flat()),trim(solved.slice(4).flat())], plants=[];

  if(mode.startsWith("phase")){
    const phasePlants=[],phaseResults=[],layouts=mode==="phase-groups"?["groups"]:mode==="phase-lanes"?["lanes"]:["groups","lanes"];
    for(const layout of layouts)for(const [id,words] of controls.entries()){
      let key;do{key=Array.from({length:14},()=>rand()%29)}while(!inverse(matrix(key)));
      const plain=words.flat(),c=encodePhase(plain,key,layout),result=fitPhase(c,words,layout);
      const exact=result.predictions.find(k=>k.key.join(",")===key.join(","));
      phasePlants.push({layout,id,n:plain.length,key,train:result.trainRunes,held:result.heldRunes,keys:result.uniqueCandidateKeys,winners:result.predictions.length,correct:!!exact,heldCorrect:exact?exact.p.slice(result.trainRunes).filter((x,i)=>x===plain[result.trainRunes+i]).length:0,anchorStats:result.anchorStats});
    }
    for(const layout of layouts){const x=fitPhase(orig.flat(),orig,layout);x.predictions=x.predictions.map((k,i)=>({...k,readout:i<3?wordRows(orig).map(w=>k.p.slice(w.off,w.off+w.len).map(x=>gp.translit[x]).join("")).join(" "):undefined,p:undefined}));phaseResults.push(x)}
    return {dictionary:dict.reduce((s,d)=>s+d.size,0),singletonInventory:allowed,phasePlants,phaseResults};
  }

  for(const layout of ["groups","lanes"])for(const [id,words] of controls.entries()){
    let key;do{key=Array.from({length:8},()=>rand()%29)}while(!inverse(matrix(key)));
    const plain=words.flat(),c=encode(plain,key,layout),result=fit(c,words,layout);
    const exact=result.predictions.find(k=>k.key.join(",")===key.join(","));
    plants.push({layout,id,n:plain.length,key,train:result.trainRunes,held:result.heldRunes,keys:result.uniqueCandidateKeys,winners:result.predictions.length,correct:!!exact,heldCorrect:exact?exact.p.slice(result.trainRunes).filter((x,i)=>x===plain[result.trainRunes+i]).length:0,anchors:result.anchorStats.length});
  }
  const results=["groups","lanes"].map(layout=>fit(orig.flat(),orig,layout));
  for(const x of results){x.predictions=x.predictions.map(k=>({...k,readout:wordRows(orig).map(w=>k.p.slice(w.off,w.off+w.len).map(x=>gp.translit[x]).join("")).join(" "),p:undefined}));}
  return {dictionary:dict.reduce((s,d)=>s+d.size,0),singletonInventory:allowed,plants,results};
}
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")),process.argv[2]??"scalar"),null,2));
