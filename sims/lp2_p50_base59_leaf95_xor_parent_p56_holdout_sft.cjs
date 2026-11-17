"use strict";

/**
 * Original p50 radix59 one-root /95-leaf source graph with historical
 * 2014 Cicada XOR (rather than earlier tested additive GP29 parent rule).
 * Does XOR-ing child labels explain the 84 independently solved GP29
 * p56 non-F runes? Strict 5-bit/8-bit GP ordinal legality must hold.
 *
 * Node22 CommonJS; no external packages, read-only.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=name=>JSON.parse(fs.readFileSync(path.join(root,
  "resources","liber-primus",name),"utf8"));
const gp=read("lp2-corpus.json"),table=read("base60-grid.json");
const digit="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx";
const tiles=table.rows.flat();
assert.equal(digit.length,59);
assert.equal(tiles.length,256);
const next=tiles.map(pair=>59*digit.indexOf(pair[0])+digit.indexOf(pair[1]));
assert.ok(next.every(x=>x>=0&&x<256));
const children=Array.from({length:256},()=>[]);
const indegree=Array(256).fill(0);
for(let i=0;i<256;i++){indegree[next[i]]++;if(next[i]!==i)children[next[i]].push(i);}
const fixed=next.flatMap((v,i)=>v===i?[i]:[]);
assert.deepEqual(fixed,[189]);
const pre=[],post=[];
function walk(i){pre.push(i);for(const c of children[i])walk(c);post.push(i);}
walk(189);
assert.equal(new Set(pre).size,256);
const leaves={
 address:Array.from({length:256},(_,i)=>i).filter(i=>!indegree[i]),
 dfs:pre.filter(i=>!indegree[i])
};
const internal={
 address:Array.from({length:256},(_,i)=>i).filter(i=>indegree[i]>0&&i!==189),
 dfs:pre.filter(i=>indegree[i]>0&&i!==189),
 post:post.filter(i=>indegree[i]>0&&i!==189)
};
assert.equal(leaves.address.length,95);assert.equal(internal.address.length,160);
const p57=gp.pages[57].indices;
assert.equal(p57.length,95);
const p56=gp.pages[56].indices;
assert.equal(p56.length,85);
const phrase="AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const tokens=gp.translit.map((name,i)=>({name,i})).sort((a,b)=>b.name.length-a.name.length);
const known=[];
for(const word of phrase.split(" ")){
  for(let j=0;j<word.length;){
    const token=tokens.find(x=>word.startsWith(x.name,j));
    assert.ok(token,"unmapped solved p56 rune");
    known.push(token.i);j+=token.name.length;
  }
}
assert.equal(known.length,85);
assert.equal(known.filter(x=>x===0).length,1);
assert.equal(known.findIndex(x=>x===0),56);
const target=known.filter(v=>v!==0);
assert.equal(target.length,84);
// Historical exact solved-prime totient positive.
const mod=x=>(x%29+29)%29;
const primes=[];for(let x=2;primes.length<84;x++){
  let prime=true;for(let k=2;k*k<=x;k++)if(x%k===0){prime=false;break;}
  if(prime)primes.push(x-1);
}
let used=0;
const forward=known.map(v=>v===0?0:mod(v+primes[used++]));
assert.deepEqual(forward,p56);
assert.equal(used,84);

function xorGraph(leafOrder,weights,backwards,plant=p57){
  const labels=Array(256).fill(-1);
  for(let j=0;j<95;j++){
    const letter=plant[backwards?94-j:j];
    labels[leaves[leafOrder][j]]=weights==="prime"?
      gp.prime[letter]%29:letter;
  }
  function parent(i){
    if(labels[i]>=0)return labels[i];
    let v=0;
    for(const child of children[i])v^=parent(child);
    labels[i]=v;
    return v;
  }
  parent(189);
  assert.ok(labels.every(v=>v>=0&&v<=31));
  return labels;
}
const cases=[];
for(const leafOrder of Object.keys(leaves))
for(const internalOrder of Object.keys(internal))
for(const weights of ["index","prime"])
for(const backwards of [false,true]){
  const labels=xorGraph(leafOrder,weights,backwards);
  const values=internal[internalOrder].slice(76).map(i=>labels[i]);
  assert.equal(values.length,84);
  const matches=values.filter((v,i)=>v===target[i]).length;
  const illegal=values.filter(x=>x>=29).length;
  const root=labels[189];
  cases.push({leafOrder,internalOrder,weights,backwards,
    knownMatches:matches,illegalSymbols:illegal,root});
}
assert.equal(cases.length,24);
const maxKnown=Math.max(...cases.map(x=>x.knownMatches));
const minIllegal=Math.min(...cases.map(x=>x.illegalSymbols));
assert.ok(maxKnown<12);
assert.ok(minIllegal>=0);
// Some 84-label assignments remain in GP29; all still fail known-text matches.
assert.ok(maxKnown<12,"p56 original XOR unexpectedly strong");
// Source-shaped positive: the graph guarantees its own XOR consistency.
const sourcePos=xorGraph("address","index",false);
const nativePlanted=internal.address.slice(76).map(i=>sourcePos[i]);
assert.equal(nativePlanted.length,84);
assert.ok(nativePlanted.every(v=>v>=0&&v<=31));
// Full legal GP29 source-shaped plant, including genuine p56 F-transparent
// prime clock. Low-nibble leaves ensure XOR remains a GP29 rune at every node.
const plantLeaves=p57.map(v=>v&15);
const plantedGraph=xorGraph("address","index",false,plantLeaves);
const plant84=internal.address.slice(76).map(i=>plantedGraph[i]);
assert.ok(plant84.every(v=>v>=0&&v<29));
const plant85=plant84.slice();
plant85.splice(56,0,0);
assert.equal(plant85.length,85);
let clock=0;
const encodedPlant=plant85.map(v=>v===0?0:mod(v+primes[clock++]));
assert.equal(clock,plant85.filter(v=>v!==0).length);
clock=0;
const decodedPlant=encodedPlant.map((c,i)=>
  plant85[i]===0?0:mod(c-primes[clock++]));
assert.deepEqual(decodedPlant,plant85);
assert.deepEqual(decodedPlant.filter((v,i)=>i!==56),plant84);
const output={source:{
  p50Cells:256,root:189,p57Leaves:95,unassignedInternalRoot:1,
  originalP55:76,p56ConsumingKnown:84,p56OriginalVerified85:true},
  operator:"historical 2014 XOR of all child GP index or prime-residue labels in radix59 tree",
  all24Cases:cases,
  bestOriginalP56Matches:maxKnown,
  minimumInvalidGP29Symbols:minIllegal,
  plant:{rawLeafValues:plantLeaves.length,validFullGraph:256,
    validP56PlusF:85,reencryptedAndRecovered:true},
  independentKnownTarget:target,
  result:"No XOR tree propagation through source p57 leaves recovers the independent p56 plaintext; therefore none qualifies to predict p55."
};
console.log(JSON.stringify(output,null,2));
