"use strict";

/**
 * SFT: conditional post-DEATH YOU/cube/coordinate-state gate.
 *
 * This reproduces a held-out numerical prediction recorded before the current
 * source-bounded p0 bootstrap, then tests it against the original p0-p2 square.
 *
 * The result is conditional because the pre-existing predictor itself uses the
 * proposed second seven-word passage through DEATH. Within that condition:
 *
 * - 825 + 484 + 854 = 2163 = 103*7*3 -> Y O U in GP prime values.
 * - the next three-word block is locked to 10 runes and index sum 111 by the
 *   pre-existing 27=3^3 and 343=7^3 cube relation.
 * - a broad two-transition family from the DEATH endpoint yields 27 exact YOU
 *   hits; common-word + cube constraints leave one SEE/YOU geometry and a
 *   SOON/TURN tail-metric tie.
 * - endpoint coordinates plus only prior visible state runes resolve that tie:
 *   across all state-rune choices and all 6 key permutations, EA-L-R is the
 *   sole key whose shortest-H ray has the required four-rune index sum 30,
 *   and it decrypts SOON.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8").replace(/\r\n/g,"\n");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const dictionary=read("resources/control/english_wordfreq_textblob.txt");
const T=corpus.translit;
const grid=corpus.pages.filter(page=>page.page<=2).flatMap(page=>page.indices);
assert.equal(grid.length,729);

const at=point=>grid[(point[0]-1)*27+point[1]-1];
const coordKey=point=>point[0]+","+point[1];
const mod29=value=>(value%29+29)%29;

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
assert.equal(gpPrimes[26],103);
assert.equal(gpPrimes[3],7);
assert.equal(gpPrimes[1],3);

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
    const token=tokens.find(row=>word.startsWith(row.token,i));
    if(!token)return null;
    out.push(token.ordinal);i+=token.token.length;
  }
  return out;
}
function phraseMetrics(words){
  const runes=words.flatMap(word=>{
    const encoded=encodeNative(word);
    assert.ok(encoded);
    return encoded;
  });
  return {
    words:words.length,
    runes:runes.length,
    indexSum:runes.reduce((sum,value)=>sum+value,0),
    gpSum:runes.reduce((sum,value)=>sum+gpPrimes[value],0),
  };
}

const opening=["AS","I","GO","THE","WEATHER","TURNS","COLD"];
const middle=["I","MAY","CRY","NOW"];
const second=["THE","IDEA","OF","THE","END","IS","DEATH"];
const next=["SEE","YOU","SOON"];
assert.deepEqual(phraseMetrics(opening),{words:7,runes:21,indexSum:233,gpSum:825});
assert.deepEqual(phraseMetrics(middle),{words:4,runes:10,indexSum:133,gpSum:484});
assert.deepEqual(phraseMetrics(second),{words:7,runes:17,indexSum:232,gpSum:854});
assert.deepEqual(phraseMetrics(next),{words:3,runes:10,indexSum:111,gpSum:396});

const gpThroughDeath=
  phraseMetrics(opening).gpSum+
  phraseMetrics(middle).gpSum+
  phraseMetrics(second).gpSum;
assert.equal(gpThroughDeath,2163);
assert.equal(gpThroughDeath,103*7*3);
const predictedYou=[103,7,3].map(prime=>T[gpPrimes.indexOf(prime)]);
assert.deepEqual(predictedYou,["Y","O","U"]);
assert.equal(phraseMetrics(second).runes+phraseMetrics(next).runes,27);
assert.equal(phraseMetrics(second).indexSum+phraseMetrics(next).indexSum,343);

// Common source-native words used only after the numerical YOU prediction.
const common=new Map();
const byLenIndex=new Map();
for(const line of dictionary.split("\n")){
  const match=/^([a-z]+) (\d+)$/.exec(line.trim());
  if(!match||Number(match[2])<100)continue;
  const runes=encodeNative(match[1]);
  if(!runes||runes.length<2||runes.length>5)continue;
  const signature=runes.join(",");
  const old=common.get(signature);
  if(!old||Number(match[2])>old.frequency){
    common.set(signature,{
      word:match[1],
      frequency:Number(match[2]),
      runes,
    });
  }
}
for(const row of common.values()){
  const indexSum=row.runes.reduce((sum,value)=>sum+value,0);
  const key=row.runes.length+"|"+indexSum;
  if(!byLenIndex.has(key))byLenIndex.set(key,[]);
  byLenIndex.get(key).push(row);
}

const axes=[[0,1],[1,0],[1,1],[1,-1]];
const dirs8=[];
for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(dr||dc)dirs8.push([dr,dc]);

const mirrors=[];
const incident=new Map();
function pushMap(map,key,value){
  if(!map.has(key))map.set(key,[]);
  map.get(key).push(value);
}
for(let row=1;row<=27;row++){
  for(let column=1;column<=27;column++){
    for(const [dr,dc] of axes){
      for(let radius=1;radius<=13;radius++){
        const a=[row-dr*radius,column-dc*radius];
        const b=[row+dr*radius,column+dc*radius];
        if([...a,...b].some(value=>value<1||value>27))break;
        if(at(a)!==at(b))continue;
        const mirror={
          id:mirrors.length,
          a,
          center:[row,column],
          b,
          raw:[at(a),at([row,column]),at(b)],
        };
        mirrors.push(mirror);
        for(const point of [a,mirror.center,b]){
          pushMap(incident,coordKey(point),mirror);
        }
      }
    }
  }
}
assert.equal(mirrors.length,507);

function isOuter(mirror,point){
  return coordKey(mirror.a)===coordKey(point)||
    coordKey(mirror.b)===coordKey(point);
}
function deriveKey(mirror){
  const derived=[mirror.raw[0],phi(mirror.raw[1]),mirror.raw[2]];
  const rotation=((derived.reduce((sum,value)=>sum+mu(phi(value)),0)%3)+3)%3;
  return derived.slice(rotation).concat(derived.slice(0,rotation));
}
function readRay(start,direction,length,key){
  const cells=[];
  const plain=[];
  let row=start[0],column=start[1];
  for(let i=0;i<length;i++){
    if(row<1||row>27||column<1||column>27)return null;
    const cell=[row,column];
    cells.push(cell);
    plain.push(mod29(at(cell)-key[i%3]));
    row+=direction[0];
    column+=direction[1];
  }
  return {cells,plain,end:cells[cells.length-1]};
}

// Broad first transition from the recorded DEATH endpoint E(26,1).
const deathEndpoint=[26,1];
assert.equal(T[at(deathEndpoint)],"E");
const firstTransitions=[];
for(const [anchorDr,anchorDc] of dirs8){
  const anchor=[deathEndpoint[0]+anchorDr,deathEndpoint[1]+anchorDc];
  if(anchor.some(value=>value<1||value>27))continue;
  for(const mirror of incident.get(coordKey(anchor))||[]){
    if(!isOuter(mirror,anchor))continue;
    const key=deriveKey(mirror);
    const distance=phi(mirror.raw[1])+phi(phi(mirror.raw[1]));
    for(const [moveDr,moveDc] of dirs8){
      const start=[
        anchor[0]+moveDr*distance,
        anchor[1]+moveDc*distance,
      ];
      if(start.some(value=>value<1||value>27))continue;
      for(const direction of dirs8){
        for(const length of [2,3,4]){
          const ray=readRay(start,direction,length,key);
          if(!ray)continue;
          firstTransitions.push({
            anchor,mirror,key,distance,start,direction,length,...ray,
          });
        }
      }
    }
  }
}
assert.equal(firstTransitions.length,522);

// Second transition follows the same local arithmetic family used in the
// pre-existing SEE->YOU construction, while testing only the predicted YOU.
const youRunes=predictedYou.map(rune=>T.indexOf(rune));
const youHits=[];
for(const first of firstTransitions){
  const derivedCenter=phi(first.mirror.raw[1]);
  const firstDistance=phi(phi(derivedCenter));
  for(const [move1Dr,move1Dc] of dirs8){
    const anchor=[
      first.end[0]+move1Dr*firstDistance,
      first.end[1]+move1Dc*firstDistance,
    ];
    if(anchor.some(value=>value<1||value>27))continue;
    for(const mirror of incident.get(coordKey(anchor))||[]){
      if(!isOuter(mirror,anchor))continue;
      const key=deriveKey(mirror);
      const secondDistance=phi(mirror.raw[1]);
      for(const [move2Dr,move2Dc] of dirs8){
        const start=[
          anchor[0]+move2Dr*secondDistance,
          anchor[1]+move2Dc*secondDistance,
        ];
        if(start.some(value=>value<1||value>27))continue;
        for(const direction of dirs8){
          const ray=readRay(start,direction,3,key);
          if(!ray)continue;
          if(!ray.plain.every((value,i)=>value===youRunes[i]))continue;
          youHits.push({
            first,
            anchor,
            mirror,
            key,
            firstDistance,
            secondDistance,
            start,
            direction,
            ...ray,
          });
        }
      }
    }
  }
}
assert.equal(youHits.length,27);

// Use only the cube-derived 10-rune / index-111 block totals.
// GP 396 is intentionally omitted here.
const cubeSurvivors=[];
for(const hit of youHits){
  const firstWord=common.get(hit.first.plain.join(","));
  if(!firstWord)continue;
  const firstIndex=hit.first.plain.reduce((sum,value)=>sum+value,0);
  const remainingRunes=10-hit.first.length-3;
  const remainingIndex=111-firstIndex-youRunes.reduce((sum,value)=>sum+value,0);
  const tails=byLenIndex.get(remainingRunes+"|"+remainingIndex)||[];
  if(!tails.length)continue;
  cubeSurvivors.push({
    hit,
    firstWord,
    remainingRunes,
    remainingIndex,
    tails,
  });
}
assert.equal(cubeSurvivors.length,1);
const survivor=cubeSurvivors[0];
assert.equal(survivor.firstWord.word,"see");
assert.deepEqual(
  survivor.tails.map(row=>row.word).sort(),
  ["soon","turn"],
);
assert.deepEqual(survivor.hit.first.plain.map(value=>T[value]),["S","E","E"]);
assert.deepEqual(survivor.hit.first.start,[25,16]);
assert.deepEqual(survivor.hit.first.end,[27,14]);
assert.deepEqual(survivor.hit.plain.map(value=>T[value]),["Y","O","U"]);
assert.deepEqual(survivor.hit.start,[27,18]);
assert.deepEqual(survivor.hit.end,[25,16]);

// Resolve the final SOON/TURN metric tie from the selected YOU endpoint.
// Endpoint coordinates produce L=phi(25), H=phi(16), R=phi(H).
// Read to the nearest cardinal H. For the remaining key position, allow every
// distinct rune already visible in the selected SEE/YOU ciphertext and key
// state, and allow all six permutations with L and R.
const youEndpoint=survivor.hit.end;
const L=phi(youEndpoint[0]);
const H=phi(youEndpoint[1]);
const R=phi(H);
assert.deepEqual([T[L],T[H],T[R]],["L","H","R"]);

const cardinal=[
  ["up",-1,0],
  ["down",1,0],
  ["left",0,-1],
  ["right",0,1],
];
const hRays=[];
for(const [name,dr,dc] of cardinal){
  let row=youEndpoint[0]+dr;
  let column=youEndpoint[1]+dc;
  let distance=1;
  while(row>=1&&row<=27&&column>=1&&column<=27){
    if(at([row,column])===H){
      hRays.push({name,dr,dc,distance,end:[row,column]});
      break;
    }
    row+=dr;column+=dc;distance++;
  }
}
assert.deepEqual(
  hRays.map(row=>({name:row.name,distance:row.distance})),
  [{name:"up",distance:13},{name:"right",distance:3}],
);
const minDistance=Math.min(...hRays.map(row=>row.distance));
const shortest=hRays.filter(row=>row.distance===minDistance);
assert.equal(shortest.length,1);
assert.equal(shortest[0].name,"right");
assert.equal(shortest[0].distance,3);

const finalCells=[];
for(let i=0;i<=shortest[0].distance;i++){
  finalCells.push([
    youEndpoint[0]+shortest[0].dr*i,
    youEndpoint[1]+shortest[0].dc*i,
  ]);
}
assert.deepEqual(finalCells,[[25,16],[25,17],[25,18],[25,19]]);
assert.deepEqual(finalCells.map(at).map(value=>T[value]),["X","D","W","H"]);

const stateRunes=new Set();
for(const cell of survivor.hit.first.cells)stateRunes.add(at(cell));
for(const value of survivor.hit.first.key)stateRunes.add(value);
for(const cell of survivor.hit.cells)stateRunes.add(at(cell));
for(const value of survivor.hit.key)stateRunes.add(value);
assert.deepEqual(
  [...stateRunes].map(value=>T[value]).sort(),
  ["B","EA","I","P","T","TH","X"].sort(),
);

function permutations3(a,b,c){
  return [
    [a,b,c],[a,c,b],
    [b,a,c],[b,c,a],
    [c,a,b],[c,b,a],
  ];
}
const finalHits=[];
for(const carried of stateRunes){
  for(const key of permutations3(carried,L,R)){
    const plain=finalCells.map((cell,i)=>mod29(at(cell)-key[i%3]));
    const indexSum=plain.reduce((sum,value)=>sum+value,0);
    if(indexSum!==survivor.remainingIndex)continue;
    finalHits.push({
      carried,
      key,
      plain,
      word:common.get(plain.join(","))?.word||null,
    });
  }
}
assert.equal(finalHits.length,1);
assert.equal(T[finalHits[0].carried],"EA");
assert.deepEqual(finalHits[0].key.map(value=>T[value]),["EA","L","R"]);
assert.deepEqual(finalHits[0].plain.map(value=>T[value]),["S","O","O","N"]);
assert.equal(finalHits[0].word,"soon");

console.log(JSON.stringify({
  status:"conditional held-out YOU prediction plus cube and coordinate-state gates select SEE YOU SOON",
  arithmetic:{
    opening:phraseMetrics(opening),
    middle:phraseMetrics(middle),
    second:phraseMetrics(second),
    gpThroughDeath,
    factorization:[103,7,3],
    factorRunes:predictedYou,
    cubeBlock:{words:3,runes:10,indexSum:111},
  },
  broadFamily:{
    firstTransitions:firstTransitions.length,
    predictedYouHits:youHits.length,
    commonCubeSurvivors:cubeSurvivors.length,
  },
  selectedFirstTwo:{
    firstWord:survivor.firstWord.word,
    firstKey:survivor.hit.first.key.map(value=>T[value]),
    firstStart:survivor.hit.first.start,
    firstEnd:survivor.hit.first.end,
    predictedWord:"you",
    youKey:survivor.hit.key.map(value=>T[value]),
    youStart:survivor.hit.start,
    youEnd:survivor.hit.end,
    tailMetric:{runes:survivor.remainingRunes,indexSum:survivor.remainingIndex},
    tailMetricWords:survivor.tails.map(row=>row.word).sort(),
  },
  coordinateStateGate:{
    endpoint:youEndpoint,
    derived:[T[L],T[H],T[R]],
    nearestCardinalH:hRays.map(row=>({direction:row.name,distance:row.distance})),
    shortestRay:shortest[0].name,
    ciphertext:finalCells.map(at).map(value=>T[value]),
    priorStateRunes:[...stateRunes].map(value=>T[value]).sort(),
    permutationsTested:stateRunes.size*6,
    residualHits:finalHits.length,
    selectedKey:finalHits[0].key.map(value=>T[value]),
    plaintext:finalHits[0].plain.map(value=>T[value]),
    word:finalHits[0].word,
  },
  caveat:"The YOU predictor and cube totals are held out relative to the current independent bootstrap, but they were originally noticed on the external proposed route. This is strong conditional route selection, not authenticated plaintext.",
},null,2));
