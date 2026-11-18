"use strict";

/**
 * SFT: uniform post-IDEA mirror/full-checksum parser.
 *
 * Starting state is the independently reached IDEA endpoint on the p0-p2
 * 27x27 square. At every one of five next word blocks, use one uniform rule:
 *
 * 1. Candidate key mirrors are mirrors incident on the previous endpoint,
 *    mirrors sharing the center of an incident mirror, or an already-used
 *    key whose center lies one endpoint-mirror radius away on the
 *    perpendicular axis.
 * 2. Derive the repeating key by center totient and the established
 *    sum(mu(phi(k))) cyclic rotation.
 * 3. Candidate ciphertext starts are reachable from any key-mirror cell in
 *    at most two local operations. An operation is either crossing within an
 *    actual equal-outer mirror or taking one orthogonal grid step; at most one
 *    orthogonal step is allowed.
 * 4. Read a straight 8-ray block of two or three runes. Retain only exact
 *    source-native TextBlob words with source frequency >= 100.
 * 5. Across exactly five words, enforce the pre-existing held-out residual
 *    checksum after THE IDEA: 12 runes, index sum 151, GP sum 553,
 *    ciphertext sum 169, key sum 163, and five modular wraps.
 *
 * The uniform key rule is intentionally broader than the published route.
 * This script reports whether the checksum+word constraints select a unique
 * plaintext under that broadened geometry.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8").replace(/\r\n/g,"\n");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const dictionary=read("resources/control/english_wordfreq_textblob.txt");
const grid=corpus.pages.filter(page=>page.page<=2).flatMap(page=>page.indices);
const T=corpus.translit;
assert.equal(grid.length,729);

const target={words:5,runes:12,indexSum:151,gpSum:553,cipherSum:169,keySum:163,wraps:5};
assert.equal(target.cipherSum-target.keySum+29*target.wraps,target.indexSum);
const startEndpoint=[17,18];
const mod29=value=>(value%29+29)%29;
const coordKey=point=>point[0]+","+point[1];
const at=point=>grid[(point[0]-1)*27+point[1]-1];

/** @param {number} n */
function phi(n){
  let result=n,rest=n;
  for(let p=2;p*p<=rest;p++){
    if(rest%p!==0)continue;
    while(rest%p===0)rest/=p;
    result-=result/p;
  }
  if(rest>1)result-=result/rest;
  return result;
}

/** @param {number} n */
function mu(n){
  let rest=n,sign=1;
  for(let p=2;p*p<=rest;p++){
    if(rest%p!==0)continue;
    rest/=p;sign=-sign;
    if(rest%p===0)return 0;
    while(rest%p===0)rest/=p;
  }
  return rest>1?-sign:sign;
}

/** @param {number} n */
function isPrime(n){
  if(n<2)return false;
  for(let d=2;d*d<=n;d++)if(n%d===0)return false;
  return true;
}
const gpPrimes=[];
for(let n=2;gpPrimes.length<29;n++)if(isPrime(n))gpPrimes.push(n);

const axes=[[0,1],[1,0],[1,1],[1,-1]];
const dirs8=[];
for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(dr||dc)dirs8.push([dr,dc]);

const mirrors=[];
for(let row=1;row<=27;row++){
  for(let column=1;column<=27;column++){
    for(const [dr,dc] of axes){
      for(let radius=1;radius<=13;radius++){
        const a=[row-dr*radius,column-dc*radius];
        const b=[row+dr*radius,column+dc*radius];
        if([...a,...b].some(value=>value<1||value>27))break;
        if(at(a)!==at(b))continue;
        mirrors.push({
          id:mirrors.length,
          a,
          center:[row,column],
          b,
          axis:[dr,dc],
          radius,
          raw:[at(a),at([row,column]),at(b)],
        });
      }
    }
  }
}
assert.equal(mirrors.length,507);

const incident=new Map();
const centered=new Map();
const mirrorEdges=new Map();
function pushMap(map,key,value){
  if(!map.has(key))map.set(key,[]);
  map.get(key).push(value);
}
function addEdge(from,to){
  const key=coordKey(from);
  if(!mirrorEdges.has(key))mirrorEdges.set(key,new Map());
  mirrorEdges.get(key).set(coordKey(to),to);
}
for(const mirror of mirrors){
  const points=[mirror.a,mirror.center,mirror.b];
  for(const point of points)pushMap(incident,coordKey(point),mirror.id);
  pushMap(centered,coordKey(mirror.center),mirror.id);
  for(const from of points)for(const to of points){
    if(coordKey(from)!==coordKey(to))addEdge(from,to);
  }
}

function deriveKey(mirror){
  const derived=[mirror.raw[0],phi(mirror.raw[1]),mirror.raw[2]];
  const rotation=((derived.reduce((sum,value)=>sum+mu(phi(value)),0)%3)+3)%3;
  return derived.slice(rotation).concat(derived.slice(0,rotation));
}

const tokens=T.map((token,ordinal)=>({token,ordinal}))
  .sort((a,b)=>b.token.length-a.token.length);
function encodeNative(original){
  let word=original.toUpperCase()
    .replace(/QU/g,"CW")
    .replace(/V/g,"U")
    .replace(/[KQ]/g,"C")
    .replace(/Z/g,"S");
  const out=[];
  for(let i=0;i<word.length;){
    if(word.startsWith("ING",i)){out.push(21);i+=3;continue;}
    if(word.startsWith("IO",i)){out.push(27);i+=2;continue;}
    const found=tokens.find(row=>word.startsWith(row.token,i));
    if(!found)return null;
    out.push(found.ordinal);i+=found.token.length;
  }
  return out;
}

const common=new Map();
for(const line of dictionary.split("\n")){
  const match=/^([a-z]+) (\d+)$/.exec(line.trim());
  if(!match||Number(match[2])<100)continue;
  const runes=encodeNative(match[1]);
  if(!runes||runes.length<2||runes.length>3)continue;
  const signature=runes.join(",");
  const old=common.get(signature);
  if(!old||Number(match[2])>old.frequency){
    common.set(signature,{word:match[1],frequency:Number(match[2]),runes});
  }
}
assert.equal(common.size,167);

const metricTypes=[...common.values()].map(row=>({
  runes:row.runes.length,
  indexSum:row.runes.reduce((sum,value)=>sum+value,0),
  gpSum:row.runes.reduce((sum,value)=>sum+gpPrimes[value],0),
}));
const uniqueMetricTypes=[...new Map(metricTypes.map(row=>[
  row.runes+"|"+row.indexSum+"|"+row.gpSum,row,
])).values()];

const reachable=[new Set(["0|0|0"])];
for(let words=1;words<=target.words;words++){
  const next=new Set();
  for(const packed of reachable[words-1]){
    const [runes,indexSum,gpSum]=packed.split("|").map(Number);
    for(const metric of uniqueMetricTypes){
      const nr=runes+metric.runes;
      const ni=indexSum+metric.indexSum;
      const ng=gpSum+metric.gpSum;
      if(nr<=target.runes&&ni<=target.indexSum&&ng<=target.gpSum){
        next.add(nr+"|"+ni+"|"+ng);
      }
    }
  }
  reachable.push(next);
}
assert(reachable[5].has("12|151|553"));

const closureCache=new Map();
function closure(mirrorId){
  if(closureCache.has(mirrorId))return closureCache.get(mirrorId);
  const mirror=mirrors[mirrorId];
  const queue=[];
  const seenState=new Set();
  const points=new Map();
  for(const point of [mirror.a,mirror.center,mirror.b]){
    queue.push({point,mirrorSteps:0,orthSteps:0,steps:0});
    seenState.add(coordKey(point)+"|0|0");
    points.set(coordKey(point),point);
  }
  for(let q=0;q<queue.length;q++){
    const state=queue[q];
    points.set(coordKey(state.point),state.point);
    if(state.steps===2)continue;
    const edges=mirrorEdges.get(coordKey(state.point));
    if(edges){
      for(const point of edges.values()){
        const key=coordKey(point)+"|"+(state.mirrorSteps+1)+"|"+state.orthSteps;
        if(seenState.has(key))continue;
        seenState.add(key);
        queue.push({
          point,
          mirrorSteps:state.mirrorSteps+1,
          orthSteps:state.orthSteps,
          steps:state.steps+1,
        });
      }
    }
    if(state.orthSteps===0){
      for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){
        const point=[state.point[0]+dr,state.point[1]+dc];
        if(point.some(value=>value<1||value>27))continue;
        const key=coordKey(point)+"|"+state.mirrorSteps+"|1";
        if(seenState.has(key))continue;
        seenState.add(key);
        queue.push({
          point,
          mirrorSteps:state.mirrorSteps,
          orthSteps:1,
          steps:state.steps+1,
        });
      }
    }
  }
  const result=[...points.values()];
  closureCache.set(mirrorId,result);
  return result;
}

const pathCache=new Map();
function commonPaths(mirrorId){
  if(pathCache.has(mirrorId))return pathCache.get(mirrorId);
  const key=deriveKey(mirrors[mirrorId]);
  const bySignature=new Map();
  for(const start of closure(mirrorId)){
    for(const [dr,dc] of dirs8){
      for(const length of [2,3]){
        const cells=[];
        let row=start[0],column=start[1],ok=true;
        for(let i=0;i<length;i++){
          if(row<1||row>27||column<1||column>27){ok=false;break;}
          cells.push([row,column]);row+=dr;column+=dc;
        }
        if(!ok)continue;
        const plain=cells.map((cell,i)=>mod29(at(cell)-key[i%3]));
        const word=common.get(plain.join(","));
        if(!word)continue;
        const routeKey=
          coordKey(start)+"|"+coordKey(cells[cells.length-1])+"|"+
          dr+","+dc+"|"+plain.join(",");
        if(bySignature.has(routeKey))continue;
        bySignature.set(routeKey,{
          start,
          end:cells[cells.length-1],
          direction:[dr,dc],
          cells,
          plain,
          word:word.word,
          frequency:word.frequency,
          runes:length,
          indexSum:plain.reduce((sum,value)=>sum+value,0),
          gpSum:plain.reduce((sum,value)=>sum+gpPrimes[value],0),
          cipherSum:cells.reduce((sum,cell)=>sum+at(cell),0),
          keySum:cells.reduce((sum,cell,i)=>sum+key[i%3],0),
          wraps:cells.reduce((sum,cell,i)=>sum+(at(cell)<key[i%3]?1:0),0),
        });
      }
    }
  }
  const result=[...bySignature.values()];
  pathCache.set(mirrorId,result);
  return result;
}

function candidateKeys(endpoint,usedIds){
  const ids=new Set();
  for(const bridgeId of incident.get(coordKey(endpoint))||[]){
    ids.add(bridgeId);
    const bridge=mirrors[bridgeId];
    for(const mirrorId of centered.get(coordKey(bridge.center))||[])ids.add(mirrorId);
  }
  for(const mirrorId of centered.get(coordKey(endpoint))||[]){
    const bridge=mirrors[mirrorId];
    const [dr,dc]=bridge.axis;
    const perpendicular=[-dc,dr];
    for(const sign of [-1,1]){
      const targetCenter=[
        endpoint[0]+sign*bridge.radius*perpendicular[0],
        endpoint[1]+sign*bridge.radius*perpendicular[1],
      ];
      for(const usedId of usedIds){
        if(coordKey(mirrors[usedId].center)===coordKey(targetCenter))ids.add(usedId);
      }
    }
  }
  return [...ids].sort((a,b)=>a-b);
}

const initialKeys=candidateKeys(startEndpoint,[]);
assert.equal(initialKeys.length,1);
assert.deepEqual(mirrors[initialKeys[0]].raw.map(value=>T[value]),["J","D","J"]);

const memo=new Map();
let calls=0;
let memoHits=0;
const ROUTE_CAP=Number.MAX_SAFE_INTEGER;

function mergeResult(targetResult,word,child,keyId,pathRow){
  if(child.kind===0)return;
  targetResult.routeCount=Math.min(ROUTE_CAP,targetResult.routeCount+child.routeCount);
  const candidateText=word+(child.kind===1&&child.text?" "+child.text:"");
  if(child.kind===2){
    targetResult.kind=2;
    targetResult.text=null;
  }else if(targetResult.kind===0){
    targetResult.kind=1;
    targetResult.text=candidateText;
  }else if(targetResult.kind===1&&targetResult.text!==candidateText){
    targetResult.kind=2;
    targetResult.text=null;
  }
  if(!targetResult.example&&child.example){
    targetResult.example=[{
      keyId,
      keyRunes:mirrors[keyId].raw.map(value=>T[value]),
      keyCenter:mirrors[keyId].center,
      word,
      plaintextRunes:pathRow.plain.map(value=>T[value]),
      start:pathRow.start,
      end:pathRow.end,
      direction:pathRow.direction,
    },...child.example];
  }else if(!targetResult.example&&child.kind>0){
    targetResult.example=[{
      keyId,
      keyRunes:mirrors[keyId].raw.map(value=>T[value]),
      keyCenter:mirrors[keyId].center,
      word,
      plaintextRunes:pathRow.plain.map(value=>T[value]),
      start:pathRow.start,
      end:pathRow.end,
      direction:pathRow.direction,
    }];
  }
}

function solve(stage,endpoint,usedIds,runes,indexSum,gpSum,cipherSum,keySum,wraps){
  calls++;
  const remaining=target.words-stage;
  const residual=
    (target.runes-runes)+"|"+
    (target.indexSum-indexSum)+"|"+
    (target.gpSum-gpSum);
  if(!reachable[remaining].has(residual))return {kind:0,text:null,routeCount:0,example:null};
  if(cipherSum>target.cipherSum||keySum>target.keySum||wraps>target.wraps)return {kind:0,text:null,routeCount:0,example:null};
  if(stage===target.words){
    return runes===target.runes&&indexSum===target.indexSum&&gpSum===target.gpSum&&cipherSum===target.cipherSum&&keySum===target.keySum&&wraps===target.wraps
      ? {kind:1,text:"",routeCount:1,example:[]}
      : {kind:0,text:null,routeCount:0,example:null};
  }

  const used=[...new Set(usedIds)].sort((a,b)=>a-b);
  const memoKey=[
    stage,coordKey(endpoint),used.join(","),
    runes,indexSum,gpSum,cipherSum,keySum,wraps,
  ].join("|");
  if(memo.has(memoKey)){memoHits++;return memo.get(memoKey);}

  const result={kind:0,text:null,routeCount:0,example:null};
  for(const keyId of candidateKeys(endpoint,used)){
    const nextUsed=[...new Set(used.concat(keyId))].sort((a,b)=>a-b);
    for(const candidate of commonPaths(keyId)){
      const nr=runes+candidate.runes;
      const ni=indexSum+candidate.indexSum;
      const ng=gpSum+candidate.gpSum;
      const nc=cipherSum+candidate.cipherSum;
      const nk=keySum+candidate.keySum;
      const nw=wraps+candidate.wraps;
      if(nr>target.runes||ni>target.indexSum||ng>target.gpSum||nc>target.cipherSum||nk>target.keySum||nw>target.wraps)continue;
      const remWords=target.words-(stage+1);
      const remKey=
        (target.runes-nr)+"|"+
        (target.indexSum-ni)+"|"+
        (target.gpSum-ng);
      if(!reachable[remWords].has(remKey))continue;
      const child=solve(
        stage+1,
        candidate.end,
        nextUsed,
        nr,
        ni,
        ng,
        nc,
        nk,
        nw,
      );
      mergeResult(result,candidate.word,child,keyId,candidate);
    }
  }
  memo.set(memoKey,result);
  return result;
}

const result=solve(0,startEndpoint,[],0,0,0,0,0,0);
assert.ok(result.kind>0);
console.log(JSON.stringify({
  status:result.kind===1
    ?"unique common-word plaintext under uniform widened post-IDEA grammar"
    :"multiple common-word plaintexts survive uniform widened post-IDEA grammar",
  target,
  startEndpoint,
  mirrors:mirrors.length,
  commonSignatures:common.size,
  uniqueMetricTypes:uniqueMetricTypes.length,
  reachableMetricStates:reachable.map(set=>set.size),
  calls,
  memoStates:memo.size,
  memoHits,
  routeCount:result.routeCount,
  uniquePlaintext:result.kind===1?result.text:null,
  example:result.example,
},null,2));
