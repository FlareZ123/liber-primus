'use strict';
// Original-input dynamic recency rank cipher: exact private-initial-list and phase-label bound.
// Run from any directory with Node 22: node sims/lp2_recency_rank_allsecret_phase_sft.cjs
const fs = require('node:fs');
const path = require('node:path');
function study(data) {
  const check=(x,m)=>{if(!x)throw Error(m)};
  const corpus=JSON.parse(data[0]),pages=corpus.pages.slice(0,56),c=pages.flatMap(p=>p.indices),N=c.length;
  check(N===12956,"source rune count");
  const tokens=corpus.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
  function gp(raw){const s=raw.toUpperCase().replaceAll("V","U").replaceAll("K","C");let out=[];for(let i=0;i<s.length;){const x=tokens.find(t=>s.startsWith(t.t,i));if(x){out.push(x.i);i+=x.t.length}else i++}return out}
  const cw=gp(data.slice(1,4).join("\n")),raw=data[4],bk=gp(raw.slice(raw.indexOf("THE ARGUMENT"),raw.indexOf("*** END OF THIS PROJECT GUTENBERG EBOOK")));
  check(cw.length===21611&&bk.length===18631,"donor lengths");
  const donors=[cw.slice(0,N),cw.slice(4327,4327+N),cw.slice(8655,8655+N),bk.slice(0,N),bk.slice(5675,5675+N)];
  const ends=[0];for(const p of pages)ends.push(ends.at(-1)+p.indices.length);
  const chap=[0,3,8,15,23,28,33,40,54,56].map(i=>ends[i]);
  const spans=x=>x.slice(1).map((b,i)=>[x[i],b]);
  const mk=[0];for(const p of JSON.parse(data[6]).pages.filter(p=>p.page<=55))for(const mark of p.large_punctuation||[])if(mark[1]===13)mk.push(ends[p.page]+mark[0]);mk.push(N);mk.sort((a,b)=>a-b);check(mk.length===30,"mark count");
  const first=pages[0].indices.slice(0,8).map(i=>corpus.runes[i]).join("");
  const master=data[5],anchor=master.lastIndexOf("%",master.indexOf(first)),originalPages=master.slice(anchor+1).split("%").slice(0,58),lookup=new Map(corpus.runes.map((v,i)=>[v,i]));
  const lineSpans=[];let pointer=0;
  for(let j=0;j<58;j++){const all=Array.from(originalPages[j]).filter(v=>lookup.has(v)).map(v=>lookup.get(v));check(all.length===corpus.pages[j].indices.length&&all.every((v,i)=>v===corpus.pages[j].indices[i]),"printed page "+j);
    if(j<56)for(const line of originalPages[j].split("/")){const n=Array.from(line).filter(v=>lookup.has(v)).length;if(n){lineSpans.push([pointer,pointer+n]);pointer+=n}}}
  check(pointer===N&&lineSpans.length===594,"line spans");
  // Repeated plaintext accesses have rank equal to the count of distinct
  // other symbols seen since their previous access. First accesses omitted.
  function fixedRanks(d,ss){const out=new Int16Array(N);out.fill(-1);for(const [a,b] of ss){const seen=[];for(let i=a;i<b;i++){const p=d[i],rank=seen.indexOf(p);out[i]=rank;if(rank>=0)seen.splice(rank,1);seen.unshift(p)}}return out}
  function perm(seed){const a=Array.from({length:29},(_,i)=>i);let s=seed>>>0;for(let i=28;i>0;i--){s^=s<<13;s^=s>>>17;s^=s<<5;const j=(s>>>0)%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
  function transform(xs,ss,q,back,inverse,secret){const out=new Int16Array(N);
    for(let si=0;si<ss.length;si++){const [a,b]=ss[si],list=secret?perm(0x92c5b7+si*777):Array.from({length:29},(_,i)=>i),labels=Array.from({length:q},(_,j)=>secret?perm(0xa82d31+si*31337+j*173):Array.from({length:29},(_,i)=>i));
      for(let i=a;i<b;i++){const m=labels[(i-a)%q],rank=inverse?m.indexOf(xs[i]):list.indexOf(xs[i]);const p=list.splice(rank,1)[0];if(back)list.push(p);else list.unshift(p);out[i]=inverse?p:m[rank]}}
    return out}
  function run(regime,ss,max){const ds=donors.map(d=>fixedRanks(d,ss)),h=new Uint16Array(29*max);
    function pairs(x,q){let count=0;for(const [a,b] of ss){h.fill(0,0,29*q);for(let i=a,phase=0;i<b;i++,phase++){if(phase===q)phase=0;const v=x[i];if(v>=0){const k=phase*29+v;count+=h[k]++}}}return count}
    let pass=0,minGap=Infinity,qMin=0,fail=[],checks=[];
    for(let q=1;q<=max;q++){const x=pairs(c,q),y=ds.map(d=>pairs(d,q)),gap=Math.min(...y)-x;if(gap>0)pass++;else fail.push({q,gap,excluded:y.filter(v=>v>x).length});if(gap<minGap){minGap=gap;qMin=q}if([1,13,22,29,31,130,403,840,1033,3301].includes(q))checks.push({q,x,y,gap})}
    const plantQ=Math.min(max,31);
    for(const back of [false,true]){const plant=transform(donors[0],ss,plantQ,back,false,true),decoded=transform(plant,ss,plantQ,back,true,true);check(decoded.every((v,i)=>v===donors[0][i]),"private state/key roundtrip");check(pairs(plant,plantQ)>=pairs(ds[0],plantQ),"initial-independent pair lower bound")}
    return {regime,max,pass,minGap,qMin,fail,checks,positive:"both orientations, private initial lists and phase permutations, exact recovery and lower bound PASS"}}
  function ioc(xs){const h=Array(29).fill(0);for(const v of xs)h[v]++;return h.reduce((s,v)=>s+v*(v-1),0)/(xs.length*(xs.length-1))}
  const direct=[false,true].map(back=>{const p=transform(c,[[0,N]],1,back,true,false);check(transform(p,[[0,N]],1,back,false,false).every((v,i)=>v===c[i]),"original exact replay");return {back,ioc:ioc(p),train:ioc(p.slice(0,9640)),holdout:ioc(p.slice(9640,12648)),prefix:Array.from(p.slice(0,90),v=>corpus.translit[v]).join("")}});
  const rows=[run("global",[[0,N]],3301),run("chapter",spans(chap),1033),run("13-dot",spans(mk),1033),run("page",spans(ends),130),run("line",lineSpans,22)];
  return {N,donors:["Crowley-0","Crowley-4327","Crowley-8655","Blake-0","Blake-5675"],direct,rows};
}
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/external/2013-book-of-law-I.txt",
  "resources/external/2013-book-of-law-II.txt",
  "resources/external/2013-book-of-law-III.txt",
  "resources/external/cicada2012-blake-marriage-gutenberg45315.txt",
  "resources/transcriptions/liber_primus_master.txt",
  "resources/liber-primus/lp2-ink-annotations.json"
];
const data=paths.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(study(data),null,2));
