'use strict';
const fs=require('node:fs'),path=require('node:path');
function attack(gp,raw,original=false){
 const A=41,N=160,S=80,q=29,mod=x=>((x%29)+29)%29,check=(v,m)=>{if(!v)throw Error(m)},eq=(a,b)=>a[0]===b[0]&&a[1]===b[1],sub=(a,b)=>[mod(a[0]-b[0]),mod(a[1]-b[1])],det=(a,b)=>mod(a[0]*b[1]-a[1]*b[0]),inv=x=>{for(let i=1;i<29;i++)if(mod(x*i)===1)return i;throw Error("inverse")};
 const idx=new Map(gp.translit.map((s,i)=>[s,i])),names=["Shakespeare","Emerson","Gibran"];
 const norm=w=>w.toUpperCase().replace(/['’]/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
 function body(s,start){const a=s.indexOf(start),b=s.search(/\*\*\*\s*END OF (?:THIS|THE) PROJECT GUTENBERG/i);check(a>=0&&b>a,"body");return s.slice(a,b)}
 function chunks(s){let out=[],words=[],prev=0;for(const m of s.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)){if(/[.!?]/.test(s.slice(prev,m.index))&&words.length){out.push(words.join(" "));words=[]}words.push(norm(m[0]));prev=m.index+m[0].length}if(words.length)out.push(words.join(" "));return out}
 function graph(s){const L=s.length,f=Array.from({length:L+1},()=>[]),b=Array.from({length:L+1},()=>[]),rem=Array(L+1).fill(0);for(let i=0;i<L;i++){let p=i;while(s[p]===" ")p++;for(let d=1;d<=2&&p+d<=L;d++){const v=idx.get(s.slice(p,p+d));if(v!==undefined)f[i].push([v,p+d])}}for(let i=1;i<=L;i++){let p=i;while(s[p-1]===" ")p--;for(let d=1;d<=2&&p-d>=0;d++){const v=idx.get(s.slice(p-d,p));if(v!==undefined)b[i].push([v,p-d])}}for(let i=L-1;i>=0;i--)rem[i]=rem[i+1]+(s[i]!==" ");return {L,f,b,rem}}
 const texts=[raw[0],body(raw[1],"There is no great and no small"),body(raw[2],"Almustafa,")],pairs=[];
 for(let j=0;j<3;j++){const c=chunks(texts[j]);for(let i=0;i+1<c.length;i++){if(c[i].replace(/ /g,"").length>=A&&c[i+1].replace(/ /g,"").length>=N-A)pairs.push({source:names[j],stop:i+1,left:graph(c[i]),right:graph(c[i+1])})}}
 check(pairs.length===1161,"frozen pair count");


 const Z=()=>Array(29).fill(0),unit=Array.from({length:29},(_,i)=>1n<<BigInt(8*i)),decode=v=>Array.from({length:29},(_,i)=>Number((v>>BigInt(8*i))&255n)),hist=a=>a.reduce((v,x)=>v+unit[x],0n),sig=a=>a.slice().sort((x,y)=>x-y).join(),sigV=v=>sig(decode(v)),pairSig=(a,b)=>a.map((x,i)=>161*x+b[i]).sort((x,y)=>x-y).join();
 const zero=()=>({lo:Z(),hi:Z()});
 function combine(a,b){return {lo:a.lo.map((x,i)=>x+b.lo[i]),hi:a.hi.map((x,i)=>x+b.hi[i])}}
 function union(a,b){if(!a)return {lo:b.lo.slice(),hi:b.hi.slice()};for(let j=0;j<29;j++){a.lo[j]=Math.min(a.lo[j],b.lo[j]);a.hi[j]=Math.max(a.hi[j],b.hi[j])}return a}
 function advance(e,v){const x={lo:e.lo.slice(),hi:e.hi.slice()};x.lo[v]++;x.hi[v]++;return x}
 function envelope(edges,pos,n,memo){if(!n)return zero();const k=pos+":"+n;if(memo.has(k))return memo.get(k);let e=null;for(const [v,np] of edges[pos]){const tail=envelope(edges,np,n-1,memo);if(tail)e=union(e,advance(tail,v))}memo.set(k,e);return e}
 function prefixEnvelope(edges,start,n){let m=new Map([[start,zero()]]);for(let i=0;i<n;i++){const next=new Map();for(const [p,e] of m)for(const [v,np] of edges[p])next.set(np,union(next.get(np),advance(e,v)));m=next}return m}
 function may(e,sorted){if(!e)return false;const intervals=e.lo.map((lo,i)=>[lo,e.hi[i]]).sort((a,b)=>a[1]-b[1]),left=sorted.slice();for(const [lo,hi] of intervals){const i=left.findIndex(v=>v>=lo);if(i<0||left[i]>hi)return false;left.splice(i,1)}return true}
 // Count-vector dynamic programming, merging all spelling paths reaching
 // the same rune count, source cursor and 29-label multiplicity vector.
 function vectors(edges,start,n){let layer=new Map([[start,new Set([0n])]]);for(let i=0;i<n;i++){const next=new Map();for(const [p,vs] of layer)for(const [v,np] of edges[p]){if(!next.has(np))next.set(np,new Set());const dest=next.get(np);for(const x of vs)dest.add(x+unit[v])}layer=next}return layer}
 function flat(m){const out=new Set();for(const vs of m.values())for(const v of vs)out.add(v);return out}
 function combined(a,b){const out=new Set();for(const x of a)for(const y of b)out.add(x+y);return out}
 function factorial(n){let v=1n;for(let i=2;i<=n;i++)v*=BigInt(i);return v}
 function tieClass(P,Q){const groups=new Map();for(let i=0;i<29;i++){const v=P[i];if(!groups.has(v))groups.set(v,{value:v,plaintext:[],ciphertext:[]});groups.get(v).plaintext.push(i)}for(let i=0;i<29;i++){check(groups.has(Q[i]),"signature");groups.get(Q[i]).ciphertext.push(i)}let count=1n;for(const g of groups.values()){check(g.plaintext.length===g.ciphertext.length,"group");count*=factorial(g.plaintext.length)}return {count:String(count),groups:[...groups.values()]}}
 function run(cases){
  const output=cases.map(c=>{const a=decode(hist(c.C.slice(0,S))),b=decode(hist(c.C.slice(S))),j=a.map((x,i)=>x+b[i]);return {id:c.id,truth:c.truth??null,target:{first:a,last:b,joint:j},sorted:[a,b,j].map(v=>v.slice().sort((x,y)=>x-y)),sigs:[sig(a),sig(b),sig(j),pairSig(a,b)],first:[],last:[],joint:[],shared:[],envelopeCounts:[0,0,0]}});
  let validPairs=0;
  for(const pair of pairs){
   const L=envelope(pair.left.b,pair.left.L,A,new Map());if(!L)continue;
   const pre=prefixEnvelope(pair.right.f,0,S-A),tm=new Map(),cursors=[];let E1=null,E2=null,EJ=null;
   for(const [pos,e] of pre){const tail=envelope(pair.right.f,pos,N-S,tm);if(!tail)continue;const first=combine(L,e),joint=combine(first,tail);E1=union(E1,first);E2=union(E2,tail);EJ=union(EJ,joint);cursors.push({pos,first,tail,joint})}
   if(!cursors.length)continue;validPairs++;
   const candidates=output.map(o=>[may(E1,o.sorted[0]),may(E2,o.sorted[1]),may(EJ,o.sorted[2])]);
   if(!candidates.some(x=>x.some(Boolean)))continue;
   let left=null,prefix=null,fullRight=null;const firstCache=new Map(),tailCache=new Map();
   const getLeft=()=>left??=flat(vectors(pair.left.b,pair.left.L,A));
   const getPrefix=()=>prefix??=vectors(pair.right.f,0,S-A);
   const getFirst=pos=>{if(!firstCache.has(pos))firstCache.set(pos,combined(getLeft(),getPrefix().get(pos)));return firstCache.get(pos)};
   const getTail=pos=>{if(!tailCache.has(pos))tailCache.set(pos,flat(vectors(pair.right.f,pos,N-S)));return tailCache.get(pos)};
   const getFull=()=>fullRight??=flat(vectors(pair.right.f,0,N-A));
   for(let ci=0;ci<output.length;ci++){
    const o=output[ci],flags=candidates[ci],id={source:pair.source,stop:pair.stop};
    flags.forEach((v,i)=>o.envelopeCounts[i]+=+v);
    let firstPass=false,lastPass=false;const shared=[];
    for(const {pos,first,tail} of cursors){
     let F=[],T=[];
     if(flags[0]&&may(first,o.sorted[0]))for(const v of getFirst(pos))if(sigV(v)===o.sigs[0])F.push(v);
     if(flags[1]&&may(tail,o.sorted[1]))for(const v of getTail(pos))if(sigV(v)===o.sigs[1])T.push(v);
     firstPass||=F.length>0;lastPass||=T.length>0;
     for(const f of F)for(const t of T){const a=decode(f),b=decode(t);if(pairSig(a,b)===o.sigs[3])shared.push({pos,first:a,last:b,maps:tieClass(a.map((x,i)=>161*x+b[i]),o.target.first.map((x,i)=>161*x+o.target.last[i]))})}
    }
    if(firstPass)o.first.push(id);if(lastPass)o.last.push(id);
    if(shared.length)o.shared.push({...id,classes:shared});
    if(flags[2]){
     // Full-window transposition can cross the half boundary; retain all
     // distinct compatible full multiplicity vectors, even when shared-half
     // compatibility has already established at least one.
     const matches=new Set();for(const l of getLeft())for(const t of getFull()){const v=l+t;if(sigV(v)===o.sigs[2])matches.add(v)}
     if(matches.size)o.joint.push({...id,classes:[...matches].map(v=>{const a=decode(v);return {counts:a,maps:tieClass(a,o.target.joint)}})});
    }
   }
  }
  return {validPairs,cases:output.map(({sorted,sigs,...o})=>o)}
 }
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
 function spelling(g,r){let o=[],p=0;while(g.rem[p]){let t=g.f[p];if(!t.length)return [];const [v,n]=t[Math.floor(r()*t.length)];o.push(v);p=n}return o}
 function shuffle(a,r){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
 const controls=[];
 for(let j=0;j<3;j++)for(let n=0;n<2;n++){
  const random=rng((0x270518^Math.imul(j*2+n+1,0x9e3779b9))>>>0),pool=pairs.filter(p=>p.source===names[j]),half=Math.floor(pool.length/2),subpool=n?pool.slice(half):pool.slice(0,half);
  let pair,L,R;do{pair=subpool[Math.floor(random()*subpool.length)];L=spelling(pair.left,random);R=spelling(pair.right,random)}while(L.length<A||R.length<N-A);
  const plain=L.slice(-A).concat(R.slice(0,N-A)),map=shuffle(Array.from({length:29},(_,i)=>i),random),mapped=plain.map(p=>map[p]),truth={source:pair.source,stop:pair.stop,plain,map};
  controls.push({id:"halves-"+j+"-"+n,truth,C:shuffle(mapped.slice(0,S),random).concat(shuffle(mapped.slice(S),random))});
  controls.push({id:"null-"+j+"-"+n,C:Array.from({length:N},()=>Math.floor(random()*29))});
  if(n===0)controls.push({id:"joint-"+j,truth,C:shuffle(mapped,random)});
 }
 const checkRun=run(controls);
 const gate=checkRun.cases.filter(c=>c.truth).every(c=>{const t=c.truth;return c.joint.some(o=>o.source===t.source&&o.stop===t.stop&&o.classes.some(k=>k.counts.join()===decode(hist(t.plain)).join()))&&(!c.id.startsWith("halves")||c.shared.some(o=>o.source===t.source&&o.stop===t.stop&&o.classes.some(k=>k.first.join()===decode(hist(t.plain.slice(0,S))).join()&&k.last.join()===decode(hist(t.plain.slice(S))).join())))});
 let result=null;if(original&&gate){const U=gp.pages.filter(p=>p.page<=55).sort((a,b)=>a.page-b.page).flatMap(p=>p.indices);check(U.length===12956,"corpus");result=run([{id:"original",C:U.slice(10279,10439)}])}
 return {pairs:pairs.length,gate,controls:checkRun,original:result};

}

module.exports=attack;
if(require.main===module){const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];const data=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));console.log(JSON.stringify(attack(JSON.parse(data[0]),data.slice(1),process.argv.includes('--original')),null,2));}
