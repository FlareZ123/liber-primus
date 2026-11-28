#!/usr/bin/env node
"use strict";

/**
 * P47 H6 -> literal49 -> p49 recursive SHED -> canonical base60 -> K=2 -> cell115.
 * Conditional navigation/state result; no unknown plaintext.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=(p)=>fs.readFileSync(path.join(ROOT,p),"utf8").replace(/\r/g,"");
const raw=read("resources/liber-primus/lp2-transcription.txt");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
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
function recursiveCore(v){
  let x=v.slice();
  while(x.length>1)x=x.slice(1,-1);
  return x.length?x[0]:null;
}
function signature(ws){
  const cores=ws.map(recursiveCore).filter((x)=>x!==null);
  return {cores,sum:cores.reduce((a,b)=>a+b,0),middle:cores.length%2?cores[(cores.length-1)/2]:null};
}
function walk(start,depth){
  let x=start;
  const route=[x];
  for(let i=0;i<depth;i+=1){x=grid.bytes[x];route.push(x);}
  return route;
}

// Cross-page complete-word parser: preserves slash/whitespace and rejects carried words.
const segments=raw.split("%").slice(0,55);
const stream=segments.join("%");
const allWords=[];let current=[];let runePage=0;
const finish=()=>{if(current.length){allWords.push(current);current=[];}};
for(const ch of stream){
  if(runeIndex.has(ch))current.push({page:runePage,value:runeIndex.get(ch)});
  else if(ch==="%")runePage+=1;
  else if(ch==="/"||/\s/u.test(ch)){}
  else finish();
}
finish();
const physicalPage=(p)=>p>=50?p+1:p;
const byPage=new Map();
for(let p=0;p<segments.length;p+=1){
  byPage.set(
    physicalPage(p),
    allWords.filter((w)=>w[0].page===p&&w[w.length-1].page===p).map((w)=>w.map((s)=>s.value))
  );
}
byPage.set(50,[]);

const state={g:5,K:2,B:19};
const p47Words=byPage.get(47);
assert.ok(p47Words);
assert.equal(p47Words.length,57);
const selected=p47Words[45];
assert.equal(selected.length,6);
assert.equal(selected.reduce((a,b)=>a+b,0),71);
assert.equal(selected.reduce((a,b)=>a+corpus.prime[b],0),256);
const h47=H(selected);
assert.deepEqual(h47,[16,19,12,8,12,22]);

// Reuse the previously established adjacent BASE29-pair -> mod256 address grammar.
const firstPairNumber=h47[0]*29+h47[1];
const p49Cell=firstPairNumber%256;
assert.equal(firstPairNumber,483);
assert.equal(p49Cell,227);
assert.equal(tokens[p49Cell],"49");
const h47PairNumbers=Array.from({length:3},(_,i)=>h47[2*i]*29+h47[2*i+1]);
const h47PairCells=h47PairNumbers.map((n)=>n%256);
const h47PairTokens=h47PairCells.map((cell)=>tokens[cell]);
assert.deepEqual(h47PairNumbers,[483,356,370]);
assert.deepEqual(h47PairCells,[227,100,114]);
assert.deepEqual(h47PairTokens,["49","1N","3H"]);
const legalPageToken=(token)=>/^(?:[0-4][0-9]|5[0-7])$/.test(token);
assert.deepEqual(
  h47PairTokens.map((token,i)=>legalPageToken(token)?{pair:i,token}:null).filter(Boolean),
  [{pair:0,token:"49"}]
);

const p49=signature(byPage.get(49));
const p55=signature(byPage.get(55));
assert.deepEqual(p49,{cores:[20,19,19,14,4],sum:76,middle:19});
assert.equal(p49.cores.length,state.g);
assert.equal(p49.middle,state.B);
assert.deepEqual(p55,{cores:[1,6,2,11,18],sum:38,middle:2});
assert.equal(p55.cores.length,state.g);
assert.equal(p55.middle,state.K);

assert.equal(tokens[p49.sum],"1s");
assert.equal(grid.bytes[p49.sum],114);
assert.deepEqual(walk(114,state.K),[114,197,115]);
assert.equal(tokens[115],"47");

assert.equal(grid.bytes[p55.sum],133);
assert.deepEqual(walk(133,state.K),[133,23,46]);

const pageRows=[];
for(let page=0;page<=55;page+=1){
  const sig=signature(byPage.get(page)||[]);
  let byte=null,route=null;
  if(sig.sum>=0&&sig.sum<256){
    byte=grid.bytes[sig.sum];
    route=walk(byte,state.K);
  }
  pageRows.push({
    page,
    wordCount:(byPage.get(page)||[]).length,
    coreCount:sig.cores.length,
    cores:sig.cores,
    sum:sig.sum,
    byte,
    terminal:route?route.at(-1):null,
  });
}
assert.deepEqual(
  pageRows.filter((r)=>r.coreCount===state.g).map((r)=>({page:r.page,cores:r.cores,sum:r.sum,byte:r.byte,terminal:r.terminal})),
  [
    {page:49,cores:[20,19,19,14,4],sum:76,byte:114,terminal:115},
    {page:55,cores:[1,6,2,11,18],sum:38,byte:133,terminal:46},
  ]
);
assert.deepEqual(pageRows.filter((r)=>r.terminal===115).map((r)=>r.page),[49]);

const stateDepths={K:2,e:3,q:4,g:5,a:6,A:8,b:15,B:19,p:23};
const p57Words=byPage.get(57).map((w,index)=>({
  index,
  prime:w.reduce((sum,value)=>sum+corpus.prime[value],0),
  text:w.map((value)=>corpus.translit[value]).join(""),
})).filter((w)=>w.prime<=255);
function depthCharge(start){
  return Object.entries(stateDepths).map(([field,depth])=>{
    const terminal=walk(start,depth).at(-1);
    return {
      field,depth,terminal,
      p57:p57Words.filter((w)=>w.prime===terminal).map((w)=>w.text),
    };
  });
}
const p49DepthCharge=depthCharge(grid.bytes[p49.sum]);
const p55DepthCharge=depthCharge(grid.bytes[p55.sum]);
assert.deepEqual(
  p49DepthCharge.filter((r)=>r.p57.length),
  [{field:"K",depth:2,terminal:115,p57:["WITHIN"]}]
);
assert.deepEqual(
  p55DepthCharge.filter((r)=>r.p57.length),
  [
    {field:"A",depth:8,terminal:115,p57:["WITHIN"]},
    {field:"B",depth:19,terminal:115,p57:["WITHIN"]},
  ]
);

const output={
  classification:"source-constrained p47/p49/cell115 navigation closure; no plaintext",
  p47:{pageLocalGroupOneBased:47,completeWordOneBased:46,h6:h47,pairNumbers:h47PairNumbers,pairCells:h47PairCells,pairTokens:h47PairTokens,firstPairNumber,p49Cell,p49Token:tokens[p49Cell]},
  p49:{...p49,base60Byte:grid.bytes[p49.sum],routeK2:walk(grid.bytes[p49.sum],state.K),terminalToken:tokens[115]},
  p55Control:{...p55,base60Byte:grid.bytes[p55.sum],routeK2:walk(grid.bytes[p55.sum],state.K)},
  controls:{
    fiveCorePages:pageRows.filter((r)=>r.coreCount===state.g).map((r)=>r.page),
    p49DepthCharge,
    p55DepthCharge,
    allPagesLanding115:pageRows.filter((r)=>r.terminal===115).map((r)=>r.page),
  },
  decision:"Under canonical base60 and the established K=2 byte-pointer walk, p49 uniquely returns to cell115/literal47. The older base59 DIRECTION reading remains conditional and is no longer required.",
};
const json=JSON.stringify(output,null,2);
console.log(json);
fs.writeFileSync(path.join(process.env.RUNNER_TEMP||process.cwd(),"source-test-output.json"),json+"\n");
