"use strict";
const fs = require("node:fs");
const path = require("node:path");
function run(corpus,master) {
 const gp=JSON.parse(corpus),chunks=master.split("%"),ix=new Map(gp.runes.map((v,i)=>[v,i]));
 const assert=(v,msg)=>{if(!v)throw Error(msg)};
 function analyze(pages,heading) {
  let offset=0,tokenOffset=0;
  const rows=pages.flatMap(p=>{
   const rr=chunks[p+16].split("/").map(s=>s.replace(/\s/g,"").replace(/^[&$§]+|[&$§]+$/g,"")).map(s=>({s,c:Array.from(s).filter(x=>ix.has(x)).map(x=>ix.get(x))})).filter(x=>x.c.length);
   assert(rr.flatMap(r=>r.c).join()===gp.pages[p].indices.join(),"source mismatch p"+p);
   return rr.map((r,j)=>{const ids=r.c.map(()=>offset++),tokens=Array.from(r.s).map(ch=>({ch,id:tokenOffset++}));return {p,l:j+1,...r,ids,tokens}});
  });
  const n=offset,flat=rows.flatMap(r=>r.c),originalTokens=rows.flatMap(r=>r.tokens),carry=[];
  for(let j=0;j<rows.length-1;j++){
   const a=rows[j],b=rows[j+1];
   if(ix.has(a.s.at(-1))&&ix.has(b.s[0]))carry.push({from:[a.p,a.l,a.ids.at(-1)],to:[b.p,b.l,b.ids[0]],page:a.p!==b.p});
  }
  const rowCounts=pages.map(p=>rows.filter(r=>r.p===p).length);
  assert(rows.every(r=>r.ids.length>1),"degenerate row");
  const equal=a=>a.slice(1).filter((v,i)=>v===a[i]).length;
  const routes=[false,true].map(reverseFirst=>{
   const reversed=j=>Boolean(j%2)!==reverseFirst;
   const arr=rows.flatMap((r,j)=>reversed(j)?r.ids.slice().reverse():r.ids);
   const tok=rows.flatMap((r,j)=>reversed(j)?r.tokens.slice().reverse():r.tokens);
   const pos=Array(n);arr.forEach((v,i)=>pos[v]=i);
   assert(new Set(arr).size===n&&arr.every((v,i)=>arr[pos[i]]===i),"rune coordinate bijection");
   assert(tok.length===originalTokens.length&&tok.slice().sort((a,b)=>a.id-b.id).every((v,i)=>v.ch===originalTokens[i].ch),"token coordinate inverse");
   const reset=rows.flatMap(r=>((Boolean((r.l-1)%2)!==reverseFirst)?r.ids.slice().reverse():r.ids));
   return {reverseFirst,first:arr[0],last:arr.at(-1),headingPositions:pos.slice(0,heading),headingFirst:pos.slice(0,heading).every((v,i)=>v===i),lastRuneLast:pos[n-1]===n-1,lastMarkLast:tok.at(-1).id===originalTokens.at(-1).id&&originalTokens.at(-1).ch===".",carryDirected:carry.filter(({from,to})=>pos[to[2]]===pos[from[2]]+1).length,carryUndirected:carry.filter(({from,to})=>Math.abs(pos[to[2]]-pos[from[2]])===1).length,bodyFirst:arr.find(x=>x>=heading),bodyLast:arr.filter(x=>x>=heading).at(-1),intraEqual:rows.reduce((s,r)=>s+equal(r.c),0),routeEqual:equal(arr.map(i=>flat[i])),pageResetIdentical:reset.join()===arr.join(),tokenCount:tok.length};
  });
  return {pages,lines:rows.length,rowCounts,runes:n,originalEqual:equal(flat),carryCount:carry.length,pageCarries:carry.filter(c=>c.page),carry,routes};
 }
 const out=[analyze([23,24,25,26],16),analyze([56],5),analyze([57],7)];
 const [target,...control]=out;
 assert(target.lines===46&&target.runes===1021&&target.rowCounts.join()==="10,12,12,12","target dimensions");
 assert(target.carryCount===36&&target.pageCarries.length===3,"target carry count");
 assert(target.routes.every(r=>r.carryDirected===0&&r.carryUndirected===0&&r.pageResetIdentical),"target carries and parity");
 assert(target.routes[0].headingFirst&&!target.routes[0].lastMarkLast&&!target.routes[1].headingFirst&&target.routes[1].lastMarkLast,"target frame conflict");
 assert(control.every(c=>c.carryCount===3&&c.routes.every(r=>r.carryUndirected===0)&&c.routes[0].headingFirst&&c.routes[0].lastMarkLast),"native structural controls");
 return out;
}
const root=path.resolve(__dirname,"..");
console.log(JSON.stringify(run(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"),fs.readFileSync(path.join(root,"resources/transcriptions/liber_primus_master.txt"),"utf8")),null,2));
