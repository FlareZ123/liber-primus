"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt","resources/liber-primus/lp2-transcription.txt"];
const mod=x=>(x+29)%29, Q=29, T=8;
const id=w=>String.fromCharCode(...w.map(x=>65+x)), nums=s=>Array.from(s,x=>x.charCodeAt(0)-65), bag=w=>id(w.slice().sort((a,b)=>a-b));
const pack4=(a,b,c,d)=>{let t;if(a>b){t=a;a=b;b=t}if(c>d){t=c;c=d;d=t}if(a>c){t=a;a=c;c=t}if(b>d){t=b;b=d;d=t}if(b>c){t=b;b=c;c=t}return (a<<15)|(b<<10)|(c<<5)|d;};
const unpack4=k=>[k>>>15,(k>>>10)&31,(k>>>5)&31,k&31];
const rawpack4=(a,b,c,d)=>(a<<15)|(b<<10)|(c<<5)|d;
function rotations(K){return Array.from({length:8},(_,i)=>K.slice(i).concat(K.slice(0,i)));}
function canonical(K){let best=Infinity,bestK;for(const R of rotations(K)){const n=R.reduce((a,b)=>a*29+b,0);if(n<best){best=n;bestK=R;}}return {n:best,K:bestK};}
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
function shuffle(a,R){a=a.slice();for(let j=a.length-1;j>0;j--){const i=R()%(j+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
function build(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function word(w,alt=true){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));if(!q)throw Error("native "+w);o.push(q.i);j+=q.t.length;}return o;}
 function body(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length);}
 const donors=raw.slice(2,5).map(t=>(body(t).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>word(w))),training=donors.map(w=>w.slice(0,Math.floor(w.length*.8)));
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))training.push((s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(t=>[...t].map(x=>ix.get(x))).filter(w=>w.every(Number.isInteger)));
 const types=new Set(Array.from({length:Q},(_,x)=>String.fromCharCode(65+x)));
 for(const a of training)for(const w of a)if(w.length&&w.length<=24)types.add(id(w));
 for(const ln of raw[5].split(/\r?\n/)){const m=ln.match(/^([a-z]+)\s+(\d+)$/i);if(!m)continue;for(const alt of [true,false]){const k=id(word(m[1],alt));if(k.length<=24)types.add(k);}}
 assert.equal(types.size,35944);
 const multisets=new Map();
 for(const s of types){const b=bag(nums(s));if(!multisets.has(b))multisets.set(b,[]);multisets.get(b).push(s);}
 const bags=[...multisets.keys()].filter(x=>x.length===8&&!x.includes("A")).map(nums);
 assert.equal(bags.length,4676);
 const table=new Map;
 for(const b of bags)for(let mask=0;mask<256;mask++){let s=[],t=[];for(let i=0;i<8;i++)(mask&(1<<i)?s:t).push(b[i]);if(s.length!==4)continue;const a=pack4(...s),z=pack4(...t);if(!table.has(a))table.set(a,new Set);table.get(a).add(z);}
 const lookup=new Array(1<<20),compSet=new Array(1<<20);
 for(const [k,s] of table){lookup[k]=[...s];compSet[k]=s;}
 const orig=[];let w=[];
 for(const x of raw[6].split("%").slice(0,55).join("%")){if(ix.has(x))w.push(ix.get(x));else if(x!=="%"&&x!=="/"&&!/\s/u.test(x)&&w.length){orig.push(w);w=[];}}
 if(w.length)orig.push(w);
 const tape=gp.pages.filter(x=>x.page<56).flatMap(x=>x.indices);assert.equal(orig.length,2896);assert.deepEqual(orig.flat(),tape);
 let off=0;const terminal=[];for(const w of orig){if(off>=12648)terminal.push({off,C:w});off+=w.length;}
 assert.equal(terminal.length,66);assert.equal(terminal.flatMap(x=>x.C).length,308);
 return {gp,donors,types,multisets,lookup,compSet,table,terminal};
}
/** All literal-F hold and consuming-nonzero inverse paths for one group. */
function domain(C,K,multisets,stop=true){
 let out=[];
 function rec(i,p,w,s){
  if(i===C.length){const b=bag(w);if(multisets.has(b)){out.push({s,t:p,b,arr:id(w),words:multisets.get(b)});return stop;}return false;}
  const c=C[i];if(c===0){w.push(0);if(rec(i+1,p,w,s))return true;w.pop();}
  const x=mod(c-K[p]);if(x){w.push(x);if(rec(i+1,(p+1)%8,w,s))return true;w.pop();}
  return false;
 }
 for(let s=0;s<8;s++)if(rec(0,s,[],s)&&stop)break;
 return out;
}
/** Fast exact zero-free full-cycle membership. */
function anchorCovered(C,K,compSet){
 for(let s=0;s<8;s++){
  const a=mod(C[0]-K[s]),b=mod(C[1]-K[(s+1)&7]),c=mod(C[2]-K[(s+2)&7]),d=mod(C[3]-K[(s+3)&7]);
  if(!a||!b||!c||!d)continue;
  const t=compSet[pack4(a,b,c,d)];if(!t)continue;
  const e=mod(C[4]-K[(s+4)&7]),f=mod(C[5]-K[(s+5)&7]),g=mod(C[6]-K[(s+6)&7]),h=mod(C[7]-K[(s+7)&7]);
  if(e&&f&&g&&h&&t.has(pack4(e,f,g,h)))return true;
 }
 return false;
}
function encode(P,K,s){let C=[];for(const x of P){if(x===0)C.push(0);else{C.push(mod(x+K[s]));s=(s+1)&7;}}return {C,s};}
function makeControl(db,seed){
 // Match original terminal group-length profile using only held-out donor words.
 // Require six known structural anchors, not a chosen favorable recovery score.
 const R=rng(seed),K=Array.from({length:8},()=>R()%29),pool=Array.from({length:25},()=>[]);
 for(const D of db.donors)for(const w of D.slice(Math.floor(D.length*.8)))if(w.length<=24&&db.types.has(id(w)))pool[w.length].push(w);
 const selected=db.terminal.filter(x=>x.C.length===8&&!x.C.includes(0)).map(x=>x.off);
 let phase=0,holds=0,consumingZero=0;const rows=[];
 for(const row of db.terminal){
  const n=row.C.length,requireAnchor=selected.includes(row.off),P0=pool[n];assert(P0.length);
  let chosen=null;
  for(let j=0;j<20000;j++){
   const P=P0[R()%P0.length],A=shuffle(P,R),s=phase,res=encode(A,K,s);
   if(requireAnchor&&(P.includes(0)||res.C.includes(0)))continue;
   chosen={off:row.off,P,A,C:res.C,s,t:res.s};break;
  }
  if(!chosen)throw Error("cannot plant anchor");
  phase=chosen.t;holds+=chosen.P.filter(x=>x===0).length;consumingZero+=chosen.C.filter((x,i)=>x===0&&chosen.A[i]!==0).length;rows.push(chosen);
 }
 return {name:"plant-"+seed,rows,K,holds,consumingZero};
}
const pairs=[[0,1],[0,2],[1,2],[3,4],[3,5],[4,5]];
/** Exhaustive pair intersection using a 4+4 multiset complement index.
 * A pair fixes anchor A's start phase at zero (global rotation is irrelevant).
 * Rotating B by j enumerates every possible relative start phase.
 */
function pairShift(db,rows,anchors,pair,shift,budget){
 const [ia,ib]=pair,A=anchors[ia].C,B=anchors[ib].C.slice(shift).concat(anchors[ib].C.slice(0,shift)),D=B.map((x,i)=>mod(x-A[i]));
 const stamp=new Int32Array(1<<20),tails=new Array(1<<20);
 for(const [k] of db.table){
  const ar=unpack4(k),out=[],seen=new Set;
  for(let a=0;a<4;a++)for(let b=0;b<4;b++)if(b!==a)for(let c=0;c<4;c++)if(c!==a&&c!==b){
   const d=6-a-b-c,P=[ar[a],ar[b],ar[c],ar[d]],pk=rawpack4(...P);
   if(seen.has(pk))continue;seen.add(pk);
   const z=P.map((x,i)=>mod(x+D[i+4]));if(z.some(x=>!x))continue;
   out.push(pack4(...z),pk);
  }
  tails[k]=out;
 }
 const otherAnchors=anchors.filter((_,i)=>i!==ia&&i!==ib);
 const allOther=rows.filter(x=>!anchors.includes(x)).sort((a,b)=>b.C.length-a.C.length);
 const candidateSeen=new Set(),survivors=[];let tag=0,prefixes=0,checks=0,hits=0,anchorPass=0;
 for(let a=1;a<29;a++)for(let b=1;b<29;b++)for(let c=1;c<29;c++)for(let d=1;d<29;d++){
  const S=db.lookup[pack4(a,b,c,d)];if(!S)continue;
  const aa=mod(a+D[0]),bb=mod(b+D[1]),cc=mod(c+D[2]),dd=mod(d+D[3]);if(!aa||!bb||!cc||!dd)continue;
  const U=db.lookup[pack4(aa,bb,cc,dd)];if(!U)continue;
  prefixes++;tag++;for(const z of U)stamp[z]=tag;
  const head=[mod(A[0]-a),mod(A[1]-b),mod(A[2]-c),mod(A[3]-d)];
  for(const k of S){const z=tails[k];for(let j=0;j<z.length;j+=2){
   checks++;if(stamp[z[j]]!==tag)continue;hits++;
   const tail=unpack4(z[j+1]),K=head.concat(tail.map((x,i)=>mod(A[i+4]-x))),canon=canonical(K);
   if(candidateSeen.has(canon.n))continue;candidateSeen.add(canon.n);
   let missing=0;for(const x of otherAnchors){if(!anchorCovered(x.C,K,db.compSet)&&++missing>budget)break;}
   if(missing>budget)continue;anchorPass++;
   for(const x of allOther){if(!domain(x.C,K,db.multisets).length&&++missing>budget)break;}
   if(missing<=budget)survivors.push({n:canon.n,K:canon.K,missing});
  }}
 }
 return {pair,shift,prefixes,checks,hits,distinct:candidateSeen.size,anchorPass,survivors};
}
function run(raw,which,pairFrom=0,pairTo=6,shiftFrom=0,shiftTo=8){
 const db=build(raw),control=which==="original"?null:makeControl(db,Number(which)),rows=control?control.rows:db.terminal;
 const anchors=rows.filter(x=>x.C.length===8&&!x.C.includes(0)).slice(0,6);
 assert.equal(anchors.length,6);
 const budget=Math.floor(.05*rows.length);assert.equal(budget,3);
 const results=[];
 for(let p=pairFrom;p<pairTo;p++)for(let s=shiftFrom;s<shiftTo;s++){
  const r=pairShift(db,rows,anchors,pairs[p],s,budget);results.push(r);
 }
 const candidates=[...new Map(results.flatMap(r=>r.survivors).map(x=>[x.n,x])).values()];
 let plant=null;
 if(control){
  const truth=canonical(control.K),matched=candidates.some(x=>x.n===truth.n);
  const all=rows.map(x=>domain(x.C,control.K,db.multisets,false));
  const trueEdges=all.filter((D,i)=>D.some(e=>e.s===rows[i].s&&e.t===rows[i].t&&e.b===bag(rows[i].P))).length;
  const ambiguous=all.filter(D=>new Set(D.flatMap(e=>e.words)).size>1).length;
  assert.equal(trueEdges,66);
  plant={key:control.K,canon:truth,matched,trueEdges,ambiguous,holds:control.holds,consumingZero:control.consumingZero,anchorOffsets:anchors.map(x=>x.off)};
 }
 return {which,types:db.types.size,bagTypes:db.multisets.size,anchors:anchors.map(x=>x.off),budget,results,candidates,plant};
}
if(require.main===module){
 const raw=files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
 const args=process.argv.slice(2);const r=run(raw,args[0]||"original",args[1]===undefined?0:Number(args[1]),args[2]===undefined?6:Number(args[2]),args[3]===undefined?0:Number(args[3]),args[4]===undefined?8:Number(args[4]));
 console.log(JSON.stringify(r));
}
module.exports={files,build,run,domain,makeControl,pairShift};
