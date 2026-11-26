"use strict";
// Issue #2965. Pilot gate failed; fresh cutoff 2.5 nats/rune frozen before fresh runs.
const files=["resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
function experiment(raw,mode="fresh"){
 const R="ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ",T="F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split(" "),Q=29,pr=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109],mod=x=>((x%Q)+Q)%Q,id=w=>String.fromCharCode(...w.map(x=>65+x)),variants=[[-1,false],[-1,true],[1,false],[1,true]],sum=a=>a.reduce((s,x)=>s+x,0),limit=2.5;
 const token=T.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function word(w,alt){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let a=[];for(let j=0;j<w.length;){let t=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:token.find(x=>w.startsWith(x.t,j));if(!t)throw Error(w);a.push(t.i);j+=t.t.length}return a}
 const f=new Map(),tot=new Map();for(let ln of raw[1].split(/\r?\n/)){const m=ln.match(/^([a-z]+)\s+(\d+)$/i);if(!m)continue;if(m[1].length===1&&!/^[aio]$/i.test(m[1]))continue;const keys=[...new Set([id(word(m[1],true)),id(word(m[1],false))])];for(const k of keys){const n=+m[2]/keys.length;f.set(k,(f.get(k)||0)+n);tot.set(k.length,(tot.get(k.length)||0)+n)}}
 const lex=new Map([...f].map(([k,n])=>[k,-Math.log(.98*n/tot.get(k.length))]));
 function cost(w){return lex.get(id(w))??(12+Math.log(Q)*w.length)}
 function parse(t){let C=[],S=[],ws=[],l=0,pages=[0];function close(){if(l){ws.push(l);l=0}}function sent(){close();if(ws.length){S.push({end:C.length,lengths:ws});ws=[]}}for(const c of t){const i=R.indexOf(c);if(i>=0){C.push(i);l++}else if("-.&$§".includes(c)||/\d/.test(c)){close();if(".&$§".includes(c))sent()}else if(c==="%")pages.push(C.length)}sent();return {C,S,pages:[...new Set(pages)]}}
 const original=parse(raw[0]);if(original.C.length!==13136||original.pages[3]!==729)throw Error("source mapping");
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}}
 function shuffle(a,r){a=a.slice();for(let i=a.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
 function sender(W,pages,v,wrong=false){let C=[],k=0,pg=0,r=rng(8837+W.length);for(const w of W){let p=0;while(p+1<pages.length&&pages[p+1]<=C.length)p++;if(p!==pg){k=0;pg=p}const randomShift=wrong==="word"?Math.floor(r()*Q):k;for(const x of w){let y=wrong===true?Math.floor(r()*Q):mod(x-v[0]*randomShift);C.push(v[1]?28-y:y)}k=mod(k+sum(C.slice(C.length-w.length).map(x=>pr[x])))}return C}
 function cutSentences(sents,min=236,max=472,start=0){let W=[],s=[],n=0;for(let i=start;i<sents.length;i++){let w=sents[i];let l=sum(w.map(x=>x.length));if(!l)continue;if(n+l>max){if(n>=min)break;W=[];s=[];n=0;continue}W.push(...w);n+=l;s.push(w.map(x=>x.length));if(n>=min)break}return n>=min?{W,s,n}:null}
 const gold=JSON.parse(raw[2]).sections.map(x=>({name:x.name,sents:x.source_text.split(/[⁘⁜]/u).map(s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(c=>R.indexOf(c))).filter(w=>w.every(x=>x>=0)))}));
 const liter=raw.slice(3).map(t=>{let a=t.search(/\*{3}\s*START OF/i),b=t.search(/\*{3}\s*END OF/i);if(a>=0)t=t.slice(t.indexOf("\n",a)+1,b>=0?b:undefined);return t.split(/[.!?]+/).map(s=>(s.match(/[A-Za-z]+/g)||[]).map(w=>word(w,true)))});
 const controls=[];
 if(mode==="pilot"){for(const x of gold){const p=cutSentences(x.sents,120,472);if(p)controls.push({...p,name:x.name})}for(let d=0;d<2;d++)for(let i=0;i<4;i++){const p=cutSentences(liter[d],236,472,Math.floor(liter[d].length*(.35+i*.13)));if(p)controls.push({...p,name:`literary-${d}-${i}`})}}
 else {const tail=gold.filter(x=>["jpg229","p56_an_end","p57_parable"].includes(x.name)).flatMap(x=>x.sents);const p=cutSentences(tail,236,472);if(p)controls.push({...p,name:"native-instruction-end-parable"});for(let d=0;d<3;d++){const offsets=d===2?[.13,.36,.59,.82]:[.08,.20];for(const offset of offsets){let p=cutSentences(liter[d],236,472,Math.floor(liter[d].length*offset));if(p)controls.push({...p,name:`fresh-literary-${d}-${offset}`})}}}
 function prepare(C,S,pages,v){
  const N=C.length,ps=new Int16Array(N+1),pg=new Int16Array(N+1),sid=new Int16Array(N+1),meta=[];let p=0;for(let i=0;i<N;i++){while(p+1<pages.length&&pages[p+1]<=i)p++;pg[i]=p;ps[i+1]=mod(ps[i]+pr[C[i]])}pg[N]=p;
  let start=0;for(let s=0;s<S.length;s++){let h=new Map();for(const l of S[s].lengths)h.set(l,(h.get(l)||0)+1);let L=[...h.keys()].sort((a,b)=>a-b),m=[],base=1;for(const l of L){m.push(base);base*=h.get(l)+1;if(!Number.isSafeInteger(base))throw Error("inventory overflow")}for(let i=start;i<S[s].end;i++)sid[i]=s;meta.push({L,m,rad:L.map(l=>h.get(l)+1),all:base-1,end:S[s].end});start=S[s].end}
  if(start!==N)throw Error("sentence cut");const em=new Map(),hm=new Map();
  function edge(i,o,l){if(pg[i]!==pg[o])o=i;const key=`${i},${o},${l}`;if(em.has(key))return em.get(key);const k=mod(ps[i]-ps[o]),w=C.slice(i,i+l).map(c=>mod((v[1]?28-c:c)+v[0]*k)),e={o,w,c:cost(w),oov:lex.has(id(w))?0:1};em.set(key,e);return e}
  function relaxed(i,o){if(i===N)return 0;if(pg[i]!==pg[o])o=i;const k=i*(N+1)+o;if(hm.has(k))return hm.get(k);let s=meta[sid[i]],best=Infinity;for(let l of s.L)if(i+l<=s.end){let e=edge(i,o,l);best=Math.min(best,e.c+relaxed(i+l,e.o))}hm.set(k,best);return best}
  const baseLower=relaxed(0,0);
  // Lagrangian relaxation: charge lambda per use of each length, then subtract the
  // exact outstanding inventory charge. Every fixed multiplier vector gives an
  // admissible consistent lower bound; no cipher, score, cutoff or path is changed.
  const duals=[];
  if(mode!=="pilot"&&baseLower<=limit*N){
   let weights=meta.map(m=>m.L.map(()=>0));
   for(let iter=0;iter<48;iter++){
    const lam=weights.map(x=>x.slice()),future=new Float64Array(meta.length+1);
    for(let s=meta.length-1;s>=0;s--)future[s]=future[s+1]+sum(lam[s].map((v,j)=>v*(meta[s].rad[j]-1)));
    const memo=new Map(),choice=new Map();
    function dual(i,o){if(i===N)return 0;if(pg[i]!==pg[o])o=i;const tag=i*(N+1)+o;if(memo.has(tag))return memo.get(tag);let s=sid[i],m=meta[s],best=Infinity,bj=-1;for(let j=0;j<m.L.length;j++){let l=m.L[j];if(i+l>m.end)continue;let e=edge(i,o,l),v=e.c+lam[s][j]+dual(i+l,e.o);if(v<best){best=v;bj=j}}memo.set(tag,best);choice.set(tag,bj);return best}
    const root=dual(0,0)-future[0];
    if(duals.length<8||root>duals[duals.length-1].root){
     duals.push({root,memo,lam,future});duals.sort((a,b)=>b.root-a.root);if(duals.length>8)duals.pop();
    }
    if(root>limit*N+1e-8)break;
    const use=meta.map(m=>m.L.map(()=>0));let i=0,o=0;
    while(i<N){if(pg[i]!==pg[o])o=i;const s=sid[i],j=choice.get(i*(N+1)+o);if(j===undefined||j<0)throw Error("dual trace");use[s][j]++;i+=meta[s].L[j]}
    let norm2=0;const g=use.map((x,s)=>x.map((v,j)=>{let d=v-(meta[s].rad[j]-1);norm2+=d*d;return d}));if(!norm2)break;
    const step=5/Math.sqrt(1+iter/10)/Math.sqrt(norm2);weights=weights.map((x,s)=>x.map((v,j)=>v+step*g[s][j]));
   }
  }
  const lower=Math.max(baseLower,...duals.map(x=>x.root));
  function lowerAt(i,o,b){if(i===N)return 0;if(pg[i]!==pg[o])o=i;let best=relaxed(i,o),s=sid[i],m=meta[s],tag=i*(N+1)+o;for(const d of duals){let v=d.memo.get(tag);if(v===undefined)continue;let rem=d.future[s+1];for(let j=0;j<m.L.length;j++)rem+=d.lam[s][j]*(Math.floor(b/m.m[j])%m.rad[j]);best=Math.max(best,v-rem)}return best}

  function exact(cap,cutoff=Infinity){
   const heap=[],seen=new Map();let expanded=0;
   function push(x){let i=heap.length;heap.push(x);while(i){let p=(i-1)>>1;if(heap[p].f<=x.f)break;heap[i]=heap[p];i=p}heap[i]=x}
   function pop(){let x=heap[0],y=heap.pop();if(heap.length){let i=0;while(2*i+1<heap.length){let j=2*i+1;if(j+1<heap.length&&heap[j+1].f<heap[j].f)j++;if(heap[j].f>=y.f)break;heap[i]=heap[j];i=j}heap[i]=y}return x}
   function add(i,o,b,g,prev,w,oov){if(i<N&&pg[i]!==pg[o])o=i;const key=`${i},${o},${b}`,old=seen.get(key);if(old!==undefined&&old<=g+1e-10)return;let h=lowerAt(i,o,b);if(g+h>cutoff+1e-8)return;seen.set(key,g);push({i,o,b,g,f:g+h,key,prev,w,oov})}
   add(0,0,meta[0].all,0,null,null,0);
   while(heap.length){let x=pop();if(x.g>seen.get(x.key)+1e-10)continue;if(x.i===N){let W=[],oov=0;for(let z=x;z.prev;z=z.prev){W.push(z.w);oov+=z.oov}W.reverse();if(sender(W,pages,v).join()!==C.join())throw Error("forward replay");return {status:"exact",cost:x.g,W,oov,expanded,seen:seen.size}}
    if(++expanded>cap)return {status:"cap",expanded,lowerBound:x.f,seen:seen.size};
    const m=meta[sid[x.i]];for(let j=0;j<m.L.length;j++){if(Math.floor(x.b/m.m[j])%m.rad[j]===0)continue;let l=m.L[j],i=x.i+l;if(i>m.end)throw Error("inventory position");let e=edge(x.i,x.o,l),b=x.b-m.m[j];if(i===m.end){if(b!==0)throw Error("inventory mismatch");b=i===N?0:meta[sid[i]].all}add(i,e.o,b,x.g+e.c,x,e.w,e.oov)}
   }return {status:"excluded-above-cutoff",expanded,seen:seen.size}
  }
  return {lower,exact}
 }
 function attack(C,S,pages,cap=100000,cut=Infinity,only=null){const all=(only===null?variants.map((v,i)=>i):[only]).map(i=>({i,...prepare(C,S,pages,variants[i])})).sort((a,b)=>a.lower-b.lower);let best=null,rows=[];for(let x of all){const cutoff=Math.min(cut,best?.cost??Infinity);if(x.lower>cutoff+1e-8){rows.push({variant:x.i,lower:x.lower,status:"relaxed-exclusion"});continue}const y=x.exact(cap,cutoff);rows.push({variant:x.i,lower:x.lower,...y,W:undefined});if(y.status==="exact"&&(!best||y.cost<best.cost))best={...y,variant:x.i}}
  let proven=best!==null&&rows.every(r=>r.status!=="cap"||r.lowerBound>best.cost+1e-8);return {best,rows,proven,lower:Math.min(...all.map(x=>x.lower)),excluded:!best&&rows.every(r=>r.status!=="cap")}
 }
 function make(x,j,kind){const v=j%4,pages=[0,Math.floor(x.n*.43),Math.floor(x.n*.78)],r=rng((mode==="pilot"?296500:296599)+j*97),S=[];let n=0;for(let a of x.s){n+=sum(a);let l=shuffle(a,r);if(kind==="wrong-length"&&l.length>1){let z=Array(l.length).fill(1);for(let i=l.length;i<sum(l);i++)z[Math.floor(r()*z.length)]++;l=z}S.push({end:n,lengths:l})}return {C:sender(x.W,pages,variants[v],kind==="wrong-rule"?(mode==="pilot"?true:"word"):false),S,pages,v,P:x.W.flat()}}
 const rows=[];for(let j=0;j<controls.length;j++){const x=controls[j];for(let kind of ["plant","wrong-rule","wrong-length"]){let a=make(x,j,kind),z=attack(a.C,a.S,a.pages,mode==="pilot"?60000:200000,mode==="pilot"?Infinity:limit*a.C.length);let P=z.best?.W.flat()||[];rows.push({name:x.name,mode:kind,n:x.n,variant:a.v,recoveredVariant:z.best?.variant??null,exact:z.proven,excluded:z.excluded,accuracy:P.length?sum(P.map((k,i)=>+(k===a.P[i])))/x.n:0,cost:z.best?z.best.cost/x.n:null,lower:z.lower/x.n,oov:z.best?.oov??null,expansions:sum(z.rows.map(x=>x.expanded||0)),states:z.rows.map(x=>[x.variant,x.status,x.lowerBound??null])})}}
 const plants=rows.filter(x=>x.mode==="plant"),neg=rows.filter(x=>x.mode!=="plant"),good=plants.filter(x=>x.exact&&x.accuracy>=.90&&x.variant===x.recoveredVariant),maxGood=Math.max(...good.map(x=>x.cost)),minNeg=Math.min(...neg.map(x=>x.lower));let gate=good.length/plants.length>=.8&&(mode==="pilot"?minNeg>maxGood:neg.every(x=>x.excluded));
 function subset(lo,hi){const S=original.S.filter(x=>x.end>lo&&x.end<=hi).map(x=>({end:x.end-lo,lengths:x.lengths}));return {C:original.C.slice(lo,hi),S,pages:[0,...original.pages.filter(x=>x>lo&&x<hi).map(x=>x-lo)]}}
 const os=[];let chosen=null;
 if(gate){for(const [lo,hi] of [[0,729],[729,1428]]){const a=subset(lo,hi),z=attack(a.C,a.S,a.pages,200000,(mode==="pilot"?maxGood:limit)*a.C.length,chosen);const b=z.best;os.push({lo,hi,lower:z.lower/a.C.length,rows:z.rows.map(x=>({...x,lower:x.lower/a.C.length})),best:b?{variant:b.variant,cost:b.cost/a.C.length,oov:b.oov,text:b.W.map(w=>w.map(i=>T[i]).join("")).join(" ")}:null,proven:z.proven,excluded:z.excluded});if(lo===0&&b)chosen=b.variant}}
 return {mode,lexicon:lex.size,variants,rows,summary:{plants:plants.length,good:good.length,maxGood,minNeg,negatives:neg.length,negativesExcluded:neg.filter(x=>x.excluded).length,gate,cutoff:mode==="pilot"?null:limit},original:os};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path");console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")),process.argv[2]||"fresh"),null,2));}
module.exports={experiment};
