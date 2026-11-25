'use strict';
// Agent25: spacing-free soft-redraw q8 key recovery with F-bearing anchors.
// Node22 CommonJS. Exact all-position anchor nomination, exact fixed-key DP.
const fs=require("node:fs"),path=require("node:path");
function experiment(d){
 const co=JSON.parse(d[0]),native=JSON.parse(d[1]),q=8,L=11,redrawProb=0.8,mod=x=>x<0?x+29:x>=29?x-29:x,assert=(x,m)=>{if(!x)throw Error(m)},gp=new Map(co.runes.map((x,i)=>[x,i])),tok=co.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const encode=(w,cal=false)=>{w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let out=[];for(let i=0;i<w.length;){if(cal&&w.startsWith("ING",i)){out.push(21);i+=3;continue}if(cal&&w.startsWith("IO",i)){out.push(27);i+=2;continue}let t=tok.find(t=>w.startsWith(t.s,i));assert(t,"token");out.push(t.i);i+=t.s.length}return out};
 const words=s=>(s.match(/[A-Za-z]+/g)||[]).map(w=>encode(w)),chars=s=>String.fromCharCode(...s.map(x=>65+x)),arr=s=>[...s].map(x=>x.charCodeAt(0)-65);
 function canon(K){let a=chars(K),b=a;for(let i=1;i<q;i++){let c=a.slice(i)+a.slice(0,i);if(c<b)b=c}return b}
 const D=new Map();
 function fragments(p){let A=[];for(let i=0;i<p.length;i++){if(!p[i])continue;let n=0;for(let j=i;j<p.length;j++)if(p[j]&&++n===L){A.push({offset:i,a:p.slice(i,j+1)});break}}return A}
 function add(p){for(const {a} of fragments(p))D.set(chars(a),a)}
 for(const s of d.slice(2,5))for(const w of s.match(/[A-Za-z]+/g)||[])for(const cal of [false,true])add(encode(w,cal));
 for(const sec of native.sections)for(const w of sec.source_text.match(/[\u16a0-\u16ff]+/gu)||[])add([...w].map(x=>gp.get(x)));
 const dict=[...D.values()],groups=new Map();for(const w of dict){const mask=w.map(x=>x?1:0).join("");let g=groups.get(mask);if(!g)groups.set(mask,g={active:w.map((x,i)=>x?i:-1).filter(i=>i>=0),holds:w.map((x,i)=>x?-1:i).filter(i=>i>=0),width:w.length,dict:[]});g.dict.push(w)}
 const uni=new Float64Array(29),bi=new Float64Array(30*29),tri=new Float64Array(900*29),bs=new Float64Array(30),ts=new Float64Array(900);
 for(const raw of d.slice(3,5)){let a=29,b=29;for(const p of words(raw).flat()){uni[p]++;bi[b*29+p]++;bs[b]++;tri[(a*30+b)*29+p]++;ts[a*30+b]++;a=b;b=p}}
 const U=uni.reduce((a,b)=>a+b,0),lm=new Float64Array(900*29);for(let a=0;a<30;a++)for(let b=0;b<30;b++)for(let p=0;p<29;p++){let u=(uni[p]+1)/(U+29),v=(bi[b*29+p]+20*u)/(bs[b]+20);lm[(a*30+b)*29+p]=Math.log((tri[(a*30+b)*29+p]+12*v)/(ts[a*30+b]+12))+Math.log(29)}
 let rng=0x25330811;const rand=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0};
 function forward(P,K,phase=0,prev=-1,cons=null){let C=[],skips=0,holds=0,counts=[];for(let i=0;i<P.length;i++){let p=P[i];if(!p){if(cons)assert(cons[i]===0,"F count");C.push(0);prev=0;holds++;counts.push(0);continue}let c=mod(p+K[phase]);phase=(phase+1)%q;let retry=cons?cons[i]===2:c===prev&&rand()/4294967296<redrawProb;if(retry){assert(c===prev,"redraw trigger");c=mod(p+K[phase]);phase=(phase+1)%q;skips++}else if(cons)assert(cons[i]===1,"normal count");C.push(c);prev=c;counts.push(retry?2:1)}return {C,phase,skips,holds,counts}}
 // Soft optional one-redraw, literal F. Exact weighted DP over phase and last 2 P.
 const N=q*900,idx=(j,a,b)=>j*900+a*30+b;
 function decode(C,K,begin=0,end=C.length,initial=null,trace=false){
  let s=new Float64Array(N).fill(-Infinity),t=new Float64Array(N).fill(-Infinity),active=[],next=[];
  if(initial===null){for(let j=0;j<q;j++){let k=idx(j,29,29);s[k]=0;active.push(k)}}else{s[initial]=0;active.push(initial)}
  const hist=trace?[]:null;
  for(let i=begin;i<end;i++){const c=C[i],prev=i?C[i-1]:-1,back=trace?new Map():null;next=[];
   function add(to,sc,from,p,cons){if(t[to]===-Infinity)next.push(to);if(sc>t[to]){t[to]=sc;if(trace)back.set(to,[from,p,cons])}}
   for(const z of active){let j=Math.floor(z/900),a=Math.floor(z%900/30),b=z%30,v=s[z],h=(a*30+b)*29,j1=(j+1)%q,j2=(j+2)%q;
    if(c===0)add(idx(j,b,0),v+lm[h],z,0,0);
    let p=mod(c-K[j]);if(p!==0)add(idx(j1,b,p),v+lm[h+p]+(c===prev?Math.log1p(-redrawProb):0),z,p,1);
    if(prev>=0){p=mod(prev-K[j]);if(p!==0&&mod(p+K[j1])===c)add(idx(j2,b,p),v+lm[h+p]+Math.log(redrawProb),z,p,2)}
   }
   if(!next.length)return null;
   if(trace)hist.push(back);for(const z of active)s[z]=-Infinity;[s,t]=[t,s];active=next;
  }
  let best=active.reduce((a,b)=>s[b]>s[a]?b:a),out={score:s[best],end:best};
  if(trace){let z=best,P=[],cons=[];for(let i=hist.length-1;i>=0;i--){let [from,p,k]=hist[i].get(z);P.push(p);cons.push(k);z=from}P.reverse();cons.reverse();const enc=forward(P,K,Math.floor(z/900),begin?C[begin-1]:-1,cons);assert(enc.C.every((v,i)=>v===C[begin+i])&&enc.phase===Math.floor(best/900),"replay");out={...out,P,cons,start:z,skips:enc.skips,holds:enc.holds}}
  return out;
 }
 // For each redraw mask, expanded observations have source ciphertext
 // offsets i (emit) and i-1 (rejected draw), and matching plaintext index i.
 // Periodicity gives equality of every expanded key digit j and j+q.
 // Index up to six linearly independent ciphertext differences; verify ALL
 // other equalities on each hit. This is exhaustive within the anchor family.
 function pattern(mask,g){
  let O=[],P=[];for(let j=0;j<L;j++){let i=g.active[j];if(mask&(1<<j)){O.push(i-1);P.push(i)}O.push(i);P.push(i)}
  let par=Array.from({length:g.width+1},(_,i)=>i),root=x=>{while(par[x]!==x)x=par[x];return x},sel=[];
  for(let j=q;j<O.length;j++){let a=root(O[j]+1),b=root(O[j-q]+1);if(a!==b){par[a]=b;sel.push(j);if(sel.length===6)break}}
  return {O,P,sel};
 }
 const tapes=[],em=d[5],start=em.indexOf("There is no great and no small"),end=em.search(/\*\*\*\s*END OF (?:THIS|THE) PROJECT GUTENBERG/i);
 const ew=words(em.slice(start<0?0:start,end<0?em.length:end)),ep=ew.flat(),eligible=[];let off=0;for(const w of ew){for(const {offset,a} of fragments(w))if(D.has(chars(a)))eligible.push({start:off+offset,width:a.length});off+=w.length}
 for(let base=0,ct=0;base+900<=ep.length&&ct<4;base+=900){let anchors=eligible.filter(x=>x.start>=base+1&&x.start+x.width<=base+600);if(anchors.length<2)continue;let K=Array.from({length:q},()=>rand()%29);if(ct%2===0)K[3]=K[2];let P=ep.slice(base,base+900),f=forward(P,K,rand()%q);tapes.push({name:"Emerson-"+ct,kind:"control",C:f.C,cut:600,P,K,expected:anchors.map(x=>x.start-base),skips:f.skips,holds:f.holds});ct++}
 assert(tapes.length===4,"four donor controls");
 const C=co.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),cuts=[0,729,1874,3612,5506,6527,7960,9640,12648,12956];assert(C.length===12956,"canonical");
 for(let k=0;k<9;k++){let A=C.slice(cuts[k],cuts[k+1]),cut=Math.floor(A.length*2/3);tapes.push({name:"chapter-"+k,kind:"original",C:A,cut,offset:cuts[k]})}
 for(const t of tapes)t.hits=new Map;
 let signatures=0,tests=0,full=0,collisions=0,patternGroups=0;
 for(const g of groups.values()){
  const scans=tapes.map(t=>{const starts=[];for(let s=0;s+g.width<=t.cut;s++)if(g.holds.every(i=>t.C[s+i]===0))starts.push(s);return {t,starts}});if(scans.every(a=>!a.starts.length))continue;patternGroups++;
  for(let mask=0;mask<1<<L;mask++){
   const {O,P,sel}=pattern(mask,g),index=new Map();
   for(let h=0;h<g.dict.length;h++){const w=g.dict[h];let sig=0;for(const j of sel)sig=sig*29+mod(w[P[j]]-w[P[j-q]]);let z=index.get(sig);if(z)z.push(h);else index.set(sig,[h])}
   signatures+=index.size;
   for(const {t,starts} of scans){const C=t.C;for(const s of starts){if(s===0&&(mask&1))continue;let sig=0;for(const j of sel)sig=sig*29+mod(C[s+O[j]]-C[s+O[j-q]]);tests++;const z=index.get(sig);if(!z)continue;
    for(const h of z){collisions++;let w=g.dict[h],K=[];for(let j=0;j<q;j++)K.push(mod(C[s+O[j]]-w[P[j]]));let ok=true;for(let j=q;j<O.length;j++)if(mod(C[s+O[j]]-w[P[j]])!==K[j%q]){ok=false;break}if(!ok)continue;
     const cons=w.map(x=>x?1:0);for(let j=0;j<L;j++)if(mask&(1<<j))cons[g.active[j]]=2;
     const f=forward(w,K,0,s?C[s-1]:-1,cons);assert(f.C.every((x,i)=>x===C[s+i]),"anchor replay");full++;const key=canon(K);let v=t.hits.get(key);if(!v)t.hits.set(key,v={starts:new Map(),example:{s,w:chars(w),mask,width:g.width}});v.starts.set(s,Math.min(v.starts.get(s)??Infinity,g.width));
    }
   }}
  }
 }
 function nonoverlap(starts){let n=0,last=0;for(const [s,w] of [...starts].sort((a,b)=>(a[0]+a[1])-(b[0]+b[1])))if(s>=last){n++;last=s+w}return n}
 function select(t){
  const candidates=[...t.hits].map(([key,v])=>({key,support:nonoverlap(v.starts),starts:v.starts.size,example:v.example}));let best=null,legal=0;
  for(const x of candidates){const K=arr(x.key),p=decode(t.C,K,0,t.cut);if(!p)continue;legal++;if(!best||p.score>best.score)best={...x,score:p.score,end:p.end}}
  let out={name:t.name,kind:t.kind,n:t.C.length,cut:t.cut,keys:candidates.length,support2:candidates.filter(x=>x.support>=2).length,maxSupport:Math.max(0,...candidates.map(x=>x.support)),legal,truth:t.K?canon(t.K):null,trueAnchor:t.K?t.hits.has(canon(t.K)):null,expected:t.expected??null};
  if(best){const K=arr(best.key),p=decode(t.C,K,0,t.cut,null,true),h=decode(t.C,K,t.cut,t.C.length,p.end,true);out={...out,key:K,support:best.support,anchor:best.example,fit:p.score/t.cut,hold:h?h.score/(t.C.length-t.cut):null,preview:h?h.P.slice(0,180).map(v=>co.translit[v]).join(""):null,matchedKey:t.K?best.key===canon(t.K):null,trainCorrect:t.P?p.P.filter((x,i)=>x===t.P[i]).length:null,holdCorrect:t.P&&h?h.P.filter((x,i)=>x===t.P[t.cut+i]).length:null,holds:p.holds+(h?.holds??0),skips:p.skips+(h?.skips??0),allHoldRunes:h?h.P.length:0}}
  return out
 }
 const controls=tapes.filter(t=>t.kind==="control").map(select),original=tapes.filter(t=>t.kind==="original").map(select);
 const common=new Map();for(const t of tapes.filter(t=>t.kind==="original"))for(const [key,v] of t.hits){let a=common.get(key)||[];a.push(t.name);common.set(key,a)}
 const cross=[...common].filter(x=>x[1].length>=2).sort((a,b)=>b[1].length-a[1].length).slice(0,100);
 return {config:{q,L,masks:1<<L,dict:dict.length,sourceLM:U,model:"optional one redraw with probability .8 on collision, mandatory plaintext F hold; all word fragments spanning exactly 11 non-F runes, all positions in first 2/3 of each visual chapter, no printed spacing",redrawProb,patternGroups,anchorSignatures:signatures,indexTests:tests,signatureHits:collisions,verifiedAnchorPaths:full},controls,original,crossChapterKeys:cross};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
module.exports={experiment,paths};
