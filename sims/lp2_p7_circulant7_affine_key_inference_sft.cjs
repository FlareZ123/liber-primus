"use strict";
/** Agent46: source-fixed seven-channel all-secret affine circulant inverse. Run with Node 22. */
function experiment(inputs) {
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
  let rng=0x46a713;const rand=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0};
  function trim(words){let n=0,last=0;for(let i=0;i<words.length;i++){n+=words[i].length;if(n%7===0)last=i+1}return words.slice(0,last)}
  const controls=[trim(solved.slice(0,4).flat()),trim(solved.slice(4).flat())], plants=[];
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
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
