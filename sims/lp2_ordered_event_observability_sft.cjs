"use strict";
// Agent17: ordered event-only additive-overlay identifiability, #2961.
// Node 22: node sims/lp2_ordered_event_observability_sft.cjs
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname,"..");
const read = p => fs.readFileSync(path.join(root,p),"utf8");
function run(C,A,rain){
 const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
 const equal=(a,b,msg)=>assert(JSON.stringify(a)===JSON.stringify(b),msg);
 const mod=(v,q)=>((v%q)+q)%q;
 const gp=new Set(C.runes);
 const sections=[...rain.matchAll(/^%(\d+)\s*\n([\s\S]*?)(?=^%\d+\s*$|$(?![\s\S]))/gm)];
 assert(sections.length===58,"Rain page sections");
 // Source-audited pixel centers from lp2_original_color_dots_census_sft.py.
 const xy=[[1424,730],[1645,2236],[1578,730],[1375,1671],[953,2158],[762,1294],[1350,1782],[1707,2271],[742,2515],[1652,2515],[1016,1859],[936,730],[1459,730],[1299,1792],[1650,1742],[1552,1217],[1654,2801],[1702,974],[948,1671],[1287,730],[1466,1482],[1160,1970],[993,1482],[620,2571],[856,1671],[963,1914],[1559,2856],[1710,1106],[842,2307],[1212,974],[1053,1294],[983,730],[1073,1106],[1577,2134],[1159,974],[1678,1782]];
 const events=[],states=[],prefix=[0,0,0,0];
 let global=0;
 for(const p of C.pages){
  const ann=A.pages.find(q=>q.page===p.page);
  const red=new Set((ann?.red_spans??[]).flatMap(s=>Array.from({length:s.length},(_,i)=>s.start+i)));
  const body=sections.find(s=>Number(s[1])===p.page)[2],derived=[];
  let nr=0;
  for(let j=0;j<body.length;j++){
   const ch=body[j];if(gp.has(ch)){nr++;continue;}
   if(ch==="᛭"||ch==="⁕"){
    const token=body.startsWith("᛭⁕",j)?"᛭⁕":ch;
    const line=body.slice(0,j).split("\n").length;
    const before=body.slice(0,j).split("\n").at(-1).replace(/[\[\]]/g,"");
    const after=body.slice(j+token.length).split("\n")[0].replace(/[\[\]]/g,"");
    derived.push({offset:nr,dots:token==="᛭⁕"?23:token==="᛭"?10:13,line,preceding:before.at(-1)??null,following:after[0]??null});j+=token.length-1;
   }
  }
  assert(nr===p.runic_count,"rune count "+p.page);
  const marks=ann?.large_punctuation??[];
  equal(derived.map(m=>[m.offset,m.dots]),marks.map(m=>m.slice(0,2)),"marker mismatch "+p.page);
  let m=0;
  for(let i=0;i<=p.runic_count;i++){
   while(m<marks.length&&marks[m][0]===i){
    const [off,dots,color]=marks[m];prefix[0]++;prefix[dots===13?1:dots===10?2:3]++;
    events.push({event:events.length+1,page:p.page,archive:p.page+17,offset:off,global:global+off,dots,color,xy:xy[events.length],runeBefore:i===0?"page-edge":red.has(i-1)?"red":"black",runeAfter:i===p.runic_count?"page-edge":red.has(i)?"red":"black",derivedLine:derived[m].line,precedingOnLine:derived[m].preceding,followingOnLine:derived[m].following,countsAfter:[...prefix]});m++;
   }
   if(i<p.runic_count)states.push({page:p.page,local:i,g:global+i,index:p.indices[i],counts:[...prefix]});
  }global+=p.runic_count;
 }
 equal(prefix,[36,31,4,1],"event totals");assert(states.length===13136,"rune total");
 const tokens=C.translit.map((glyph,i)=>({glyph,i})).sort((a,b)=>b.glyph.length-a.glyph.length);
 function encode(s){const a=[];for(const word of s.split(" ")){let j=0;while(j<word.length){const t=tokens.find(t=>word.startsWith(t.glyph,j));assert(t,"GP word "+word);a.push(t.i);j+=t.glyph.length;}}return a;}
 const known56=encode("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
 const known57=encode("PARABLE LICE THE INSTAR TUNNELNG TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIUINITY WITHIN AND EMERGE");
 const primes=[];for(let n=2;primes.length<84;n++){let ok=true;for(let d=2;d*d<=n;d++)if(n%d===0){ok=false;break;}if(ok)primes.push(n);}
 let j=0;const obs=[];
 for(const s of states.filter(s=>s.page>=56)){
  if(s.page===56&&s.local===56){assert(s.index===0&&known56[s.local]===0,"literal F");continue;}
  const base=s.page===56?mod(s.index-(primes[j++]-1),29):s.index;
  const expected=(s.page===56?known56:known57)[s.local];assert(base===expected,`solved mismatch ${s.page}:${s.local} ${base} vs ${expected}`);obs.push({...s,residual:mod(expected-base,29)});
 }
 assert(j===84&&obs.length===179&&known56.length===85&&known57.length===95,"known lengths");
 const knownCounts=[...new Map(obs.map(s=>[s.counts.join(","),s.counts])).values()];
 equal(knownCounts,[[31,28,3,0],[32,29,3,0],[33,29,4,0],[34,30,4,0],[35,31,4,0]],"solved states");
 const unknown=states.filter(s=>s.page<56),rows=[];
 for(const [name,k,max] of [["all",0,8],["13-only",1,7],["10-only",2,5]])for(let q=1;q<=max;q++){
  const fixed=[...new Set(obs.map(s=>s.counts[k]%q))].sort((a,b)=>a-b);
  const support=unknown.filter(s=>!fixed.includes(s.counts[k]%q)),intervals=[];
  for(const s of support){const last=intervals.at(-1);if(last&&last.end===s.g)last.end++;else intervals.push({start:s.g,end:s.g+1});}
  const free=[...new Set(support.map(s=>s.counts[k]%q))].sort((a,b)=>a-b);
  if(free.length){const f=v=>v%q===free[0]?1:0;assert(obs.every(s=>f(s.counts[k])===0),"witness changes solved");assert(unknown.some(s=>f(s.counts[k])===1),"witness no effect");assert(unknown.every(s=>mod(mod(s.index+f(s.counts[k]),29)-f(s.counts[k]),29)===s.index),"replay");}
  rows.push({counter:name,q,fixed,free,unknownRunesUnconstrained:support.length,intervals});
 }
 equal(rows.filter(x=>x.counter==="all"&&x.q<=5).map(x=>x.unknownRunesUnconstrained),[0,0,0,0,0],"all count");
 equal(rows.filter(x=>x.counter==="13-only"&&x.q<=4).map(x=>x.unknownRunesUnconstrained),[0,0,0,0],"13 count");
 equal(rows.filter(x=>x.counter==="10-only"&&x.q<=2).map(x=>x.unknownRunesUnconstrained),[0,0],"10 count");
 return {events,knownCounts,knownConsumingRunes:obs.length,rows};
}
const result=run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json")),read("resources/external/Liber Primus 57.txt"));
console.log(JSON.stringify(result,null,2));
