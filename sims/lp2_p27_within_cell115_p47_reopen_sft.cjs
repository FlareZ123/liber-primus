#!/usr/bin/env node
"use strict";

/**
 * Reproduce the cross-route cell115 -> literal47 -> p47 closure.
 *
 * This is a conditional navigation result, not plaintext recovery.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=(p)=>fs.readFileSync(path.join(ROOT,p),"utf8").replace(/\r/g,"");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed2016=read("resources/historical/cicada2016-4gq25-outguess.asc");
const transcript=read("resources/liber-primus/lp2-transcription.txt").split("%");
const runeId=new Map(corpus.runes.map((g,i)=>[g,i]));
const tokens=grid.pages.flatMap((p)=>p.tokens);
assert.equal(tokens.length,256);

const mod29=(n)=>((n%29)+29)%29;
function H(v){
  const m=Math.floor(v.length/2),o=[];
  for(let i=0;i<m;i+=1)o.push(mod29(v[i]-v[v.length-1-i]));
  if(v.length%2)o.push(v[m]);
  for(let i=m-1;i>=0;i-=1)o.push(mod29(v[i]+v[v.length-1-i]));
  return o;
}
function walk(start,steps){
  const route=[start];let x=start;
  for(let i=0;i<steps;i+=1){x=grid.bytes[x];route.push(x);}
  return route;
}

// Reproduce the already-established signed-source p32 route numerically.
const clear=signed2016.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert.ok(clear);
const gpTokens=corpus.translit.map((symbol,value)=>({symbol,value}))
  .sort((a,b)=>b.symbol.length-a.symbol.length);
function gp0(word){
  const normalized=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");
  let i=0,sum=0;
  while(i<normalized.length){
    if(normalized.startsWith("ING",i)){sum+=21;i+=3;continue;}
    if(normalized.startsWith("IO",i)){sum+=27;i+=2;continue;}
    const t=gpTokens.find((x)=>normalized.startsWith(x.symbol,i));
    assert.ok(t,`unmapped ${word}`);
    sum+=t.value;i+=t.symbol.length;
  }
  return sum;
}
const signedWords=(clear[1].match(/\b[A-Za-z]+\b/gu)||[]).map((w)=>w.toUpperCase());
assert.deepEqual(signedWords.slice(5,9),["EPIPHANY","SEEKS","THE","DEVOTED"]);
assert.deepEqual(signedWords.slice(5,9).map(gp0),[121,71,20,102]);
const seeksRoute=walk(71,23);
assert.deepEqual(seeksRoute.slice(-4),[125,20,102,32]);
assert.equal(corpus.pages.find((p)=>p.page===32).runic_count,121);
assert.equal(grid.bytes[32],115);

// Reproduce the p27 H8 route to the same selected cell.
function pageWords(p){
  if(p===50)return [];
  const raw=transcript[p>=51?p-1:p]||"";
  const pg=corpus.pages.find((x)=>x.page===p);
  const out=[];let cur=[];let off=0,start=0;
  const flush=()=>{if(cur.length){out.push({start,indices:cur});cur=[];}};
  for(const ch of raw){
    if(runeId.has(ch)){
      if(!cur.length)start=off;
      assert.equal(pg.indices[off],runeId.get(ch));
      cur.push(pg.indices[off]);off+=1;
    }else if("-.&$§".includes(ch))flush();
  }
  flush();assert.equal(off,pg.indices.length);return out;
}
const p27w=pageWords(27)[19];
assert.equal(p27w.indices.length,12);
const core=p27w.indices.slice(2,-2);
const h=H(core);
assert.deepEqual(h,[12,26,8,27,8,27,4,6]);
const starts=Array.from({length:4},(_,i)=>(h[2*i]*29+h[2*i+1])%256);
assert.deepEqual(starts,[118,3,3,122]);

function distanceMap(start){
  const m=new Map([[start,0]]);let x=start;
  for(let d=1;d<=512;d+=1){x=grid.bytes[x];if(m.has(x))break;m.set(x,d);}
  return m;
}
const dms=Array.from({length:256},(_,i)=>distanceMap(i));
function convergence(addresses){
  let best=null;
  for(let node=0;node<256;node+=1){
    const ds=addresses.map((s)=>dms[s].get(node));
    if(ds.some((d)=>d===undefined))continue;
    const rank=[Math.max(...ds),ds.reduce((a,b)=>a+b,0),node];
    if(!best||rank[0]<best.rank[0]||
      (rank[0]===best.rank[0]&&(rank[1]<best.rank[1]||
      (rank[1]===best.rank[1]&&rank[2]<best.rank[2]))))best={node,distances:ds,rank};
  }
  return best;
}
assert.deepEqual(convergence(starts),{node:115,distances:[6,6,6,3],rank:[6,21,115]});

// The selected cell's literal page token.
assert.equal(tokens[115],"47");
assert.deepEqual(tokens.map((t,i)=>t==="47"?i:null).filter((x)=>x!==null),[12,115]);

// Reproduce the ROAD/FOUND low-digit page selector.
const low=grid.bytes.map((v)=>v%60);
function terminalCycle(start){
  if(start<0||start>=256)return null;
  const path=[],seen=new Map();let x=start;
  while(!seen.has(x)){seen.set(x,path.length);path.push(x);x=low[x];}
  return path.slice(seen.get(x)).sort((a,b)=>a-b).join(",");
}
const roadCycle="36,54";
function mapWords(p){
  if(p===50)return [];
  const raw=(transcript[p<=49?p:p-1]||"")
    .replaceAll("/","").replaceAll("&","").replaceAll("$","")
    .replaceAll(".","-").replace(/\s+/g,"");
  return raw.split("-").filter(Boolean)
    .map((tok)=>[...tok].filter((ch)=>runeId.has(ch)).map((ch)=>runeId.get(ch)))
    .filter((w)=>w.length);
}
function summary(p){
  const selected=mapWords(p).filter((w)=>terminalCycle(w.reduce((a,b)=>a+b,0))===roadCycle);
  return {
    page:p,
    selectedCount:selected.length,
    selectedRuneLength:selected.reduce((s,w)=>s+w.length,0),
    gp0:selected.reduce((s,w)=>s+w.reduce((a,b)=>a+b,0),0),
    prime:selected.reduce((s,w)=>s+w.reduce((a,b)=>a+corpus.prime[b],0),0),
  };
}
assert.deepEqual(summary(32),{page:32,selectedCount:6,selectedRuneLength:42,gp0:611,prime:2209});
assert.deepEqual(summary(47),{page:47,selectedCount:8,selectedRuneLength:32,gp0:534,prime:2013});
assert.equal(611,13*47);
assert.equal(2209,47*47);

// Full dual-square census remains p32 -> m47 only.
const dual=[];
const len32=[];
for(let p=0;p<=55;p+=1){
  const s=summary(p);
  if(s.selectedRuneLength===32)len32.push(p);
  const root=Math.floor(Math.sqrt(s.prime));
  if(root<=55&&root*root===s.prime&&s.gp0===13*root)dual.push({page:p,m:root});
}
assert.deepEqual(dual,[{page:32,m:47}]);
assert.deepEqual(len32,[7,39,47]);

// Literal decimal page rivals on the canonical 11-cycle.
const cycle=[0,203,68,199,47,76,114,197,115,247,192];
const legal=(t)=>/^(?:[0-4][0-9]|5[0-7])$/.test(t);
const cyclePageTokens=cycle.filter((i)=>legal(tokens[i]))
  .map((i)=>({cell:i,token:tokens[i],page:Number(tokens[i]),returnLength:summary(Number(tokens[i])).selectedRuneLength}));
assert.deepEqual(cyclePageTokens,[
  {cell:203,token:"18",page:18,returnLength:29},
  {cell:115,token:"47",page:47,returnLength:32},
  {cell:192,token:"00",page:0,returnLength:33},
]);

// Whole-table rival inventory.
const decimal=tokens.map((t,i)=>({cell:i,token:t,page:legal(t)?Number(t):null})).filter((x)=>x.page!==null);
assert.equal(decimal.length,42);
const returning=decimal.filter((x)=>summary(x.page).selectedRuneLength===32);
assert.deepEqual(returning,[
  {cell:12,token:"47",page:47},
  {cell:115,token:"47",page:47},
  {cell:151,token:"39",page:39},
  {cell:254,token:"39",page:39},
]);

// Held-out p47 page-local group47 metrics and canonical H6 packet.
const p47Groups=pageWords(47);
assert.equal(p47Groups.length,59);
const p47LocalGroup47=p47Groups[46];
const p47LocalGroup48=p47Groups[47];
const metrics=(w)=>({
  length:w.indices.length,
  gp0:w.indices.reduce((a,b)=>a+b,0),
  prime:w.indices.reduce((a,b)=>a+corpus.prime[b],0),
});
assert.deepEqual(metrics(p47LocalGroup47),{length:6,gp0:71,prime:256});
assert.deepEqual(metrics(p47LocalGroup48),{length:6,gp0:89,prime:326});
assert.equal(p47LocalGroup47.start,206);
assert.equal(tokens[206],"27");
assert.deepEqual(tokens.map((t,i)=>t==="27"?i:null).filter((x)=>x!==null),[206]);

const h47=H(p47LocalGroup47.indices);
const h47Zero=H(p47LocalGroup48.indices);
assert.deepEqual(h47,[16,19,12,8,12,22]);
assert.deepEqual(h47Zero,[11,20,13,8,4,19]);

let allPageLocalGroups=0;
let sixRuneGroups=0;
const metricTripleHits=[];
const h47Hits=[];
const prime256Words=[];
const start206Words=[];
for(let p=0;p<=55;p+=1){
  for(let i=0;i<pageWords(p).length;i+=1){
    const w=pageWords(p)[i];
    allPageLocalGroups+=1;
    const m=metrics(w);
    if(m.prime===256)prime256Words.push({page:p,index0:i,index1:i+1,start:w.start,...m});
    if(w.start===206)start206Words.push({page:p,index0:i,index1:i+1,...m});
    if(m.length===6&&m.gp0===71&&m.prime===256){
      metricTripleHits.push({page:p,index0:i,index1:i+1,start:w.start});
    }
    if(m.length===6){
      sixRuneGroups+=1;
      if(H(w.indices).join(",")===h47.join(",")){
        h47Hits.push({page:p,index0:i,index1:i+1,start:w.start});
      }
    }
  }
}
assert.equal(allPageLocalGroups,2928);
assert.equal(sixRuneGroups,252);
assert.deepEqual(metricTripleHits,[{page:47,index0:46,index1:47,start:206}]);
assert.deepEqual(h47Hits,[{page:47,index0:46,index1:47,start:206}]);
assert.equal(prime256Words.length,6);
assert.deepEqual(prime256Words.map((w)=>w.gp0),[69,70,68,66,71,69]);
assert.equal(start206Words.length,12);

const h47PairNumbers=Array.from({length:3},(_,i)=>h47[2*i]*29+h47[2*i+1]);
const h47Addresses=h47PairNumbers.map((n)=>n%256);
assert.deepEqual(h47PairNumbers,[483,356,370]);
assert.deepEqual(h47Addresses,[227,100,114]);
assert.equal(tokens[h47Addresses[0]],"49");

// Immediate selected neighbor: bounded direct-additive negative and fixed H-difference.
const p47Word48=p47Groups[47];
assert.equal(p47Word48.indices.length,6);
const add47=p47Word48.indices.map((x,i)=>mod29(x+h47[i]));
const sub47=p47Word48.indices.map((x,i)=>mod29(x-h47[i]));
assert.deepEqual(add47,[2,2,8,20,4,26]);
assert.deepEqual(sub47,[28,22,13,4,9,11]);

const h48=H(p47Word48.indices);
const adjacentHDifference=h47.map((x,i)=>mod29(x-h48[i]));
assert.deepEqual(h48,[11,20,13,8,4,19]);
assert.deepEqual(adjacentHDifference,[5,28,28,0,8,3]);

let adjacentSixPairs=0;
const adjacentHDifferenceHits=[];
for(let p=0;p<=55;p+=1){
  const ws=pageWords(p);
  for(let i=0;i+1<ws.length;i+=1){
    if(ws[i].indices.length!==6||ws[i+1].indices.length!==6)continue;
    adjacentSixPairs+=1;
    const a=H(ws[i].indices);
    const b=H(ws[i+1].indices);
    const d=a.map((x,j)=>mod29(x-b[j]));
    if(d.join(",")===adjacentHDifference.join(",")){
      adjacentHDifferenceHits.push({page:p,index0:i,index1:i+1,start0:ws[i].start,start1:ws[i+1].start});
    }
  }
}
assert.equal(adjacentSixPairs,19);
assert.deepEqual(adjacentHDifferenceHits,[{page:47,index0:46,index1:47,start0:206,start1:212}]);

const output={
  classification:"conditional p32-p47 navigation loop reopened; no plaintext",
  signedP32:{routeTail:seeksRoute.slice(-4),nextCell:grid.bytes[32]},
  p27H8:{starts,convergence:convergence(starts)},
  selectedCell:{cell:115,token:tokens[115]},
  lowDigit:{p32:summary(32),p47:summary(47),dualSquare:dual,len32Pages:len32},
  cyclePageTokens,
  wholeTableReturningDecimalTokens:returning,
  selectedP47Word47:{start:p47LocalGroup47.start,metrics:metrics(p47LocalGroup47),h6:h47,startToken:tokens[p47LocalGroup47.start],h6PairNumbers:h47PairNumbers,h6Addresses:h47Addresses,firstH6Token:tokens[h47Addresses[0]]},
  selectedP47Controls:{allPageLocalGroups,sixRuneGroups,metricTripleHits,h47Hits,prime256Words,start206WordCount:start206Words.length},
  p47ImmediateNeighbor:{word48:p47Word48.indices,h48,add47,sub47,adjacentHDifference,adjacentSixPairs,adjacentHDifferenceHits},
  decision:"Cell115 literal47 selects p47 page-local group47. Its local-group metrics and H6 are unique in the page-local census; a separate cross-page reproducer verifies the selected group is complete and that its visible 1|5 line wrap reconstructs the DH state. No plaintext is recovered.",
};
const json=JSON.stringify(output,null,2);
console.log(json);
fs.writeFileSync(path.join(process.env.RUNNER_TEMP||process.cwd(),"source-test-output.json"),json+"\n");
