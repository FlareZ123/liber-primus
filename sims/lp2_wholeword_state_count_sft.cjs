"use strict";
const paths=[
  "resources/transcriptions/lp2-image-corrected.txt",
  "resources/liber-primus/lp2-corpus.json",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/external/blake-marriage-1906-gutenberg45315.txt"
];
function main(inputs){
 const R="ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ";
 const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
 const runs=s=>s.match(new RegExp("["+R+"]+","gu"))||[];
 let physical=0,offset=0,tape="",positions=[],pageTape={};
 for(const ch of inputs[0]){if(ch==="%"){physical++;continue}if(ch==="/"||/\s/u.test(ch))continue;tape+=ch;const page=physical+(physical>=50?1:0);positions.push({page,offset});if(R.includes(ch)){(pageTape[page]??=[]).push(R.indexOf(ch));offset++}}
 for(const p of JSON.parse(inputs[1]).pages)assert(JSON.stringify(pageTape[p.page]||[])===JSON.stringify(p.indices),"page "+p.page);
 const groups=[...tape.matchAll(new RegExp("["+R+"]+","gu"))].map(m=>({w:m[0],...positions[m.index],endPage:positions[m.index+m[0].length-1].page})).filter(g=>g.page<56);
 assert(groups.length===2896&&groups.reduce((a,g)=>a+g.w.length,0)===12956&&groups.filter(g=>g.page!==g.endPage).length===32,"source counts");
 const cuts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956],expected=[158,255,383,437,224,326,378,669,66];
 const scopes=[{name:"all",words:groups.map(g=>g.w)},...expected.map((n,i)=>({name:"chapter"+i,words:groups.filter(g=>g.offset>=cuts[i]&&g.offset<cuts[i+1]).map(g=>g.w)}))];
 assert(scopes.slice(1).every((s,i)=>s.words.length===expected[i]),"chapter counts");
 const dict=new Map(["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"].map((x,i)=>[x,R[i]]));
 function gp(w){return [...w.toUpperCase().replace(/['’]/g,"").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").matchAll(/ING|TH|EO|NG|OE|AE|IA|EA|[A-Z]/g)].map(m=>dict.get(m[0]==="ING"?"NG":m[0])).join("")}
 function english(s){const start=s.search(/\*\*\* START OF/i);if(start>=0)s=s.slice(s.indexOf("\n",start)+1);const end=s.search(/\*\*\* END OF/i);if(end>=0)s=s.slice(0,end);return (s.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)||[]).map(gp)}
 function counts(words){const c=new Map();for(const w of words)c.set(w,(c.get(w)||0)+1);return c}
 function target(words){const c=counts(words),a=[...c.values()].sort((a,b)=>b-a),needed=new Int32Array(words.length+1);let j=0,n=0;
  for(const f of a){j++;for(let k=0;k<f;k++)needed[++n]=j}
  return {c,N:words.length,D:c.size,E:words.length-c.size,P:a.reduce((s,f)=>s+f*(f-1)/2,0),needed}
 }
 // Lower bounds valid even for noninjective state-specific maps and arbitrary token reordering.
 function bounds(h,maxf,t){
  let q=maxf,e=0,active=0;while(q>1){active+=h[q];if(e+active>t.E)break;e+=active;q--}
  const deficit=q;
  // The minimum within-plaintext collision count for q variants, by balanced splitting.
  function pairs(q){let s=0;for(let f=q+1;f<=maxf;f++)if(h[f]){const a=Math.floor(f/q),b=f%q;s+=h[f]*(q*a*(a-1)/2+a*b);if(s>t.P)return s}return s}
  let lo=q,hi=maxf;while(lo<hi){let m=(lo+hi)>>1;if(pairs(m)<=t.P)hi=m;else lo=m+1}
  const pair=lo;q=pair;
  let n=0,j=0,done=false;
  for(let f=maxf;f>=1&&!done;f--)for(let k=0;k<h[f];k++){j++;n+=f;q=Math.max(q,Math.ceil(t.needed[n]/j));if(q*j>=t.D){done=true;break}}
  return {q,deficit,pair}
 }
 // Construct a relaxed exact witness: each ciphertext type decodes globally to one
 // plaintext type; states choose among its distinct codes; ordering is unconstrained.
 function witness(P,C){
  const plain=[...counts(P)].map(([w,f])=>({w,f,remain:f,variants:f,assigned:[]}));
  const cipher=[...counts(C)].sort((a,b)=>b[1]-a[1]);const map=new Map();
  let singles=[];
  for(const [w,f] of cipher){
   if(f===1){singles.push(w);continue}
   let best=null;
   for(const x of plain)if(x.remain>=f&&(!best||x.variants>best.variants||x.variants===best.variants&&x.remain>best.remain))best=x;
   if(!best)return null;
   best.remain-=f;best.variants-=f-1;best.assigned.push(w);map.set(w,best.w)
  }
  let n=0;
  for(const x of plain)while(x.remain>0){const w=singles[n++];assert(w!==undefined,"singleton supply");x.assigned.push(w);map.set(w,x.w);x.remain--}
  assert(n===singles.length&&map.size===cipher.length,"witness inventory");
  const dec=C.map(w=>map.get(w)),want=counts(P),have=counts(dec);assert(want.size===have.size&&[...want].every(([w,f])=>have.get(w)===f),"witness decoded count");
  const q=Math.max(...plain.map(x=>x.assigned.length));assert(plain.every(x=>x.variants===x.assigned.length),"variant arithmetic");
  // Each state table is injective on its used domain because code sets are disjoint.
  const stateMaps=Array.from({length:q},()=>new Map());
  for(const x of plain)for(let j=0;j<x.assigned.length;j++)stateMaps[j].set(x.w,x.assigned[j]);
  const stateOf=new Map();for(let j=0;j<q;j++)for(const [p,c] of stateMaps[j]){assert(!stateOf.has(c),"code collision");stateOf.set(c,j)}
  assert(C.every((c,i)=>stateMaps[stateOf.get(c)].get(dec[i])===c),"witness forward replay");
  return {q,decodedDistinct:have.size,codeTypes:map.size,exactReplay:C.length,largestCodeSet:Math.max(...plain.map(x=>x.assigned.length)),sampleMapping:[...map].slice(0,5)}
 }
 function scan(words,scope,t){
  const n=t.N;if(words.length<n)return {windows:0};
  const c=new Map(),h=new Int32Array(n+1);let maxf=0;
  function update(w,d){const a=c.get(w)||0,b=a+d;assert(b>=0,"count underflow");if(a)h[a]--;if(b){h[b]++;c.set(w,b);maxf=Math.max(maxf,b)}else c.delete(w);while(maxf>0&&!h[maxf])maxf--}
  for(let i=0;i<n;i++)update(words[i],1);
  let min=Infinity,max=0,first=-1,mins=0,defMin=Infinity,pairMin=Infinity,at8=0,at13=0,at29=0;
  const hist={},states=new Uint16Array(words.length-n+1);
  for(let i=0;i+n<=words.length;i++){
   if(i){update(words[i-1],-1);update(words[i+n-1],1)}
   const b=bounds(h,maxf,t);states[i]=b.q;if(b.q<min){min=b.q;first=i;mins=0}if(b.q===min)mins++;max=Math.max(max,b.q);defMin=Math.min(defMin,b.deficit);pairMin=Math.min(pairMin,b.pair);
   at8+=+(b.q<=8);at13+=+(b.q<=13);at29+=+(b.q<=29);hist[b.q]=(hist[b.q]||0)+1
  }
  const w=witness(words.slice(first,first+n),scope.words);assert(!w||w.q>=min,"bound contradicts witness");
  return {windows:words.length-n+1,min,max,minCount:mins,firstMinStart:first,deficitMin:defMin,pairMin,at8,at13,at29,hist,witness:w,states}
 }
 // Verify against known arbitrary state codebooks, independent of phase/order.
 let seed=0x2203cafe;const rng=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*n)};
 let controls=0,exact=0;
 for(let s=0;s<1000;s++){const n=40+rng(161),k=1+rng(20),q=1+rng(12),P=Array.from({length:n},()=>String(rng(k))),maps=Array.from({length:q},()=>Array.from({length:k},()=>String(rng(2*k+1)))),C=P.map(w=>maps[rng(q)][Number(w)]);
  const t=target(C),h=new Int32Array(n+1),f=[...counts(P).values()];for(const a of f)h[a]++;
  assert(bounds(h,Math.max(...f),t).q<=q,"true state count lost");controls++;
  if(s<100){const W=witness(P,C);if(W){assert(W.q>=bounds(h,Math.max(...f),t).q,"witness contradiction");exact++}}
 }
 const native=JSON.parse(inputs[2]).sections.map(s=>({name:s.name,words:runs(s.source_text)}));
 const donors=[...native,{name:"solved-concatenated-descriptive",words:native.flatMap(s=>s.words)},...["Emerson","Gibran","Shakespeare","Blake"].map((name,i)=>({name,words:english(inputs[i+3])}))];
 const rows=scopes.map(s=>{const t=target(s.words);return {name:s.name,n:t.N,distinct:t.D,reuse:t.E,pairs:t.P,donors:donors.map(d=>({name:d.name,...scan(d.words,s,t)}))}});
 const joint=[];
 for(let d=0;d<donors.length;d++){
  const donor=donors[d],n=donor.words.length-2896+1;if(n<=0)continue;
  let min=Infinity,max=0,first=-1,minCount=0,at8=0,at13=0,at29=0;
  for(let i=0;i<n;i++){
   let off=i,q=1;
   for(let j=1;j<rows.length;j++){q=Math.max(q,rows[j].donors[d].states[off]);off+=rows[j].n}
   if(q<min){min=q;first=i;minCount=0}if(q===min)minCount++;max=Math.max(max,q);at8+=+(q<=8);at13+=+(q<=13);at29+=+(q<=29)
  }
  let off=first,exactQ=0,ws=[];
  for(let j=1;j<scopes.length;j++){const w=witness(donor.words.slice(off,off+scopes[j].words.length),scopes[j].words);ws.push(w);if(w)exactQ=Math.max(exactQ,w.q);off+=scopes[j].words.length}
  joint.push({name:donor.name,windows:n,min,max,firstMinStart:first,minCount,at8,at13,at29,witnessQ:ws.every(Boolean)?exactQ:null,witnesses:ws})
 }
 for(const s of rows)for(const d of s.donors)delete d.states;
 return {source:{groups:2896,runes:12956,carries:32},controls,relaxedWitnessControls:exact,scopes:rows,jointChapterPrivateContiguousSource:joint}
}
module.exports={main,paths};
if(require.main===module){const fs=require("node:fs"),path=require("node:path");console.log(JSON.stringify(main(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));}
