"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");

/** @param {string} rel @returns {string} */
function read(rel){return fs.readFileSync(path.join(root,rel),"utf8").replace(/\r/g,"");}

const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const tokens=grid.pages.flatMap((page)=>page.tokens);
const alphabet60=grid.alphabet;
const alphabet59=alphabet60.replace("f","");

/** @param {string} token @param {string} alphabet @returns {number|null} */
function decodeToken(token,alphabet){
  const high=alphabet.indexOf(token[0]);
  const low=alphabet.indexOf(token[1]);
  return high<0||low<0?null:high*alphabet.length+low;
}
const tables={
  base60:tokens.map((token)=>decodeToken(token,alphabet60)),
  base59:tokens.map((token)=>decodeToken(token,alphabet59)),
};

const gpTokens=corpus.translit
  .map((symbol,value)=>({symbol,value}))
  .sort((left,right)=>right.symbol.length-left.symbol.length);

/** @param {string} word @returns {number} */
function gp0(word){
  const normalized=word.toUpperCase()
    .replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S")
    .replace(/[^A-Z]/g,"");
  let offset=0,sum=0;
  while(offset<normalized.length){
    if(normalized.startsWith("ING",offset)){sum+=21;offset+=3;continue;}
    if(normalized.startsWith("IO",offset)){sum+=27;offset+=2;continue;}
    const token=gpTokens.find((item)=>normalized.startsWith(item.symbol,offset));
    assert.ok(token,"unmapped "+word+" at "+offset);
    sum+=token.value;
    offset+=token.symbol.length;
  }
  return sum;
}

/** @param {Array<number|null>} table @param {number} start @param {number} steps @returns {number[]|null} */
function walk(table,start,steps){
  const route=[start];
  let state=start;
  for(let step=0;step<steps;step+=1){
    if(state<0||state>=256)return null;
    const next=table[state];
    if(next===null||next===undefined)return null;
    state=next;
    route.push(state);
  }
  return route;
}

const clear=signed.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert.ok(clear);
const words=(clear[1].match(/\b[A-Za-z]+\b/gu)||[])
  .map((word,index)=>({index,word:word.toUpperCase(),gp0:gp0(word)}));
assert.equal(words.length,43);
assert.deepEqual(words.slice(32,36).map((row)=>row.word),["YOU","WILL","BE","FOUND"]);
assert.deepEqual(words.slice(5,9).map((row)=>row.word),["EPIPHANY","SEEKS","THE","DEVOTED"]);

const wordsByGp0=new Map();
for(const row of words){
  if(!wordsByGp0.has(row.gp0))wordsByGp0.set(row.gp0,[]);
  wordsByGp0.get(row.gp0).push(row);
}

const chainFamily={};
for(const [radix,table] of Object.entries(tables)){
  const chains=[];
  for(const start of words){
    const first=table[start.index];
    if(first===null||first===undefined)continue;
    for(const matched of wordsByGp0.get(first)||[]){
      if(matched.gp0<0||matched.gp0>=256)continue;
      const second=table[matched.gp0];
      if(second===null||second===undefined||second<0||second>=words.length)continue;
      chains.push({
        startIndex:start.index,startWord:start.word,
        firstToken:tokens[start.index],firstValue:first,
        matchedIndex:matched.index,matchedWord:matched.word,matchedGp0:matched.gp0,
        secondToken:tokens[matched.gp0],secondValue:second,secondWord:words[second].word,
      });
    }
  }
  chainFamily[radix]=chains;
}

assert.deepEqual(chainFamily.base59,[{
  startIndex:35,startWord:"FOUND",firstToken:"0d",firstValue:39,
  matchedIndex:2,matchedWord:"PATH",matchedGp0:39,
  secondToken:"05",secondValue:5,secondWord:"EPIPHANY",
}]);
assert.deepEqual(chainFamily.base60,[
  {
    startIndex:20,startWord:"MEANING",firstToken:"1g",firstValue:102,
    matchedIndex:8,matchedWord:"DEVOTED",matchedGp0:102,
    secondToken:"0W",secondValue:32,secondWord:"YOU",
  },
  {
    startIndex:35,startWord:"FOUND",firstToken:"0d",firstValue:39,
    matchedIndex:2,matchedWord:"PATH",matchedGp0:39,
    secondToken:"05",secondValue:5,secondWord:"EPIPHANY",
  },
]);

const found59=chainFamily.base59[0];
const found60=chainFamily.base60.find((row)=>row.startWord==="FOUND");
assert.deepEqual(found59,found60);
assert.equal(found60.secondValue,5);

// Re-run the authenticated four-word navigation family reached by EPIPHANY5.
const pageCounts=new Map(corpus.pages.map((page)=>[page.page,page.indices.length]));
const dh={p:23,g:5,a:6,b:15,A:8,B:19,K:2};
const navHits=[];
let navTested=0;
for(let index=0;index<=words.length-4;index+=1){
  const [w0,w1,w2,w3]=words.slice(index,index+4);
  for(const [field,depth] of Object.entries(dh)){
    if(depth<2)continue;
    for(const [radix,table] of Object.entries(tables)){
      navTested+=1;
      const route=walk(table,w1.gp0,depth);
      if(!route)continue;
      const terminal=route[depth];
      if(route[depth-2]!==w2.gp0)continue;
      if(route[depth-1]!==w3.gp0)continue;
      if(!pageCounts.has(terminal))continue;
      if(pageCounts.get(terminal)!==w0.gp0)continue;
      navHits.push({index,words:[w0.word,w1.word,w2.word,w3.word],field,depth,radix,terminal,route});
    }
  }
}
assert.equal(navTested,560);
assert.equal(navHits.length,1);
assert.equal(navHits[0].index,found60.secondValue);
assert.deepEqual(navHits[0].words,["EPIPHANY","SEEKS","THE","DEVOTED"]);
assert.equal(words[32].word,"YOU");
assert.deepEqual(words.slice(32,36).map((row)=>row.word),["YOU","WILL","BE","FOUND"]);

// Held-out semantic convergence: every word of the uniquely selected clause
// finds state32 under the same selected base60 table, at source-motivated depths.
const clauseFindsYou=[
  {word:"EPIPHANY",depth:2},
  {word:"SEEKS",depth:23},
  {word:"THE",depth:2},
  {word:"DEVOTED",depth:1},
].map(({word,depth})=>{
  const row=words.find((item)=>item.word===word && item.index>=5 && item.index<=8);
  assert.ok(row);
  const route=walk(tables.base60,row.gp0,depth);
  assert.ok(route);
  return {word,index:row.index,gp0:row.gp0,depth,terminal:route.at(-1)};
});
assert.deepEqual(clauseFindsYou,[
  {word:"EPIPHANY",index:5,gp0:121,depth:2,terminal:32},
  {word:"SEEKS",index:6,gp0:71,depth:23,terminal:32},
  {word:"THE",index:7,gp0:20,depth:2,terminal:32},
  {word:"DEVOTED",index:8,gp0:102,depth:1,terminal:32},
]);
assert.deepEqual(
  {field:navHits[0].field,depth:navHits[0].depth,radix:navHits[0].radix,terminal:navHits[0].terminal},
  {field:"p",depth:23,radix:"base60",terminal:32}
);

console.log(JSON.stringify({
  status:"PASS",
  signedTail:words.slice(30,36),
  twoStageFamily:chainFamily,
  foundBridge:{
    source:"YOU WILL BE FOUND",
    startIndex:35,
    first:"p50[35]=0d=39=GP0(PATH)",
    second:"p50[39]=05=5=source index EPIPHANY",
    radixInvariant:true,
  },
  downstreamUniqueNavigation:{
    tested:navTested,
    hit:navHits[0],
    state32SignedWord:words[32].word,
    clauseFindsYou,
    closingSource:words.slice(32,36).map((row)=>row.word),
  },
  interpretation:"FOUND supplies a radix-invariant bridge to PATH then EPIPHANY. The uniquely selected EPIPHANY SEEKS THE DEVOTED clause has all four words converge on base60 state32 at source-motivated depths [2,23,2,1]; state32 is simultaneously physical p32 and signed word YOU. Reading YOU WILL BE FOUND reaches FOUND35, which returns through PATH to EPIPHANY, closing the source/table loop.",
},null,2));
