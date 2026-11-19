"use strict";

/**
 * Director #1720: source-only gate for p28 exponents (3,27).
 *
 * No English scoring or downstream p0 facts are used. The selector is built
 * from the fixed DH23 tuple, canonical GP29 arithmetic, the six-state cube
 * exponent orbit, and visible one-layer / three-layer source geometry.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8").replace(/\r/g,"");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription=read("resources/liber-primus/lp2-transcription.txt");
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const runeSet=new Set(corpus.runes);
const parts=transcription.split(/^\s*%\s*$/m);

/** @param {number} page @returns {string} */
function physicalPart(page){assert.notEqual(page,50);return parts[page<=49?page:page-1];}
/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function modPow(base,exponent,modulus){let out=1,x=base%modulus,e=exponent;while(e>0){if(e&1)out=(out*x)%modulus;x=(x*x)%modulus;e=Math.floor(e/2);}return out;}

/** @param {string} text @returns {{runes:number[],words:Array<{word:number,start:number,end:number,len:number,values:number[]}>}} */
function parsePage(text){
  const runes=[],words=[];let current=[];let start=0;let offset=0;
  const flush=()=>{if(!current.length)return;words.push({word:words.length+1,start,end:offset-1,len:current.length,values:current.slice()});current=[];};
  for(const char of [...text]){
    if(runeSet.has(char)){const v=runeIndex.get(char);runes.push(v);if(!current.length)start=offset;current.push(v);offset+=1;}
    else if(char==="-"||char===".")flush();
  }
  flush();return{runes,words};
}

const dh={p:23,g:5,a:6,b:15,A:8,B:19,K:2};
assert.equal(modPow(dh.g,dh.a,dh.p),dh.A);
assert.equal(modPow(dh.g,dh.b,dh.p),dh.B);
assert.equal(modPow(dh.B,dh.a,dh.p),dh.K);

const orbit=[1,3,9,27,25,19];
for(let i=1;i<orbit.length;i+=1)assert.equal(orbit[i],modPow(3,i,28));
assert.equal(modPow(3,6,28),1);

// Source-only base-exponent discriminator: only e=3 carries the full
// independently reconstructed DH state K -> A -> B -> b in GP29.
const bridge=[];
for(const exponent of orbit){
  bridge.push({
    exponent,
    KtoA:modPow(dh.K,exponent,29)===dh.A,
    AtoB:modPow(dh.A,exponent,29)===dh.B,
    Btob:modPow(dh.B,exponent,29)===dh.b,
  });
}
assert.deepEqual(bridge.filter((row)=>row.KtoA&&row.AtoB&&row.Btob),[{
  exponent:3,KtoA:true,AtoB:true,Btob:true
}]);
const baseExponent=3;

// Charge low-description DH arithmetic separately so expression multiplicity
// cannot be mistaken for uniqueness. All orbit elements have at least one
// short source expression, while3 has the densest raw/no-wrap support.
const fields=Object.entries(dh);
const expressionSupport=new Map(orbit.map((value)=>[value,new Set()]));
for(const [name,value] of fields){
  if(expressionSupport.has(value))expressionSupport.get(value).add(name);
}
for(let i=0;i<fields.length;i+=1){
  for(let j=0;j<fields.length;j+=1){
    if(i===j)continue;
    const [leftName,left]=fields[i],[rightName,right]=fields[j];
    const candidates=[
      [leftName+"+"+rightName,left+right],
      [leftName+"-"+rightName,left-right],
      [leftName+"*"+rightName,left*right],
    ];
    if(right!==0&&left%right===0)candidates.push([leftName+"/"+rightName,left/right]);
    for(const [label,raw] of candidates){
      if(raw>=1&&raw<=27&&expressionSupport.has(raw))expressionSupport.get(raw).add(label);
    }
  }
}
const rawSupports=Object.fromEntries([...expressionSupport.entries()].map(([value,labels])=>[value,[...labels].sort()]));
assert.ok(rawSupports[3].includes("g-K"));
assert.ok(rawSupports[3].includes("a/K"));
assert.ok(rawSupports[27].includes("A+B"));
assert.ok(rawSupports[1].includes("a-g"));
assert.ok(rawSupports[9].includes("b-a"));
for(const value of orbit)assert.ok(rawSupports[value].length>=1);

// Exact p28 source geometry.
const p28=parsePage(physicalPart(28));
assert.equal(p28.runes.length,269);
const center=(p28.runes.length-1)/2;
assert.equal(center,134);
const pageWord=p28.words[27];
assert.deepEqual(pageWord,{word:28,start:135,end:139,len:5,values:[28,24,10,1,20]});
assert.equal(pageWord.start,center+1);

const centerActionLayers=1;
const wordActionLayers=Math.ceil(pageWord.len/2);
assert.equal(wordActionLayers,3);
const actionPair=[
  modPow(baseExponent,centerActionLayers,28),
  modPow(baseExponent,wordActionLayers,28),
];
assert.deepEqual(actionPair,[3,27]);

// Charge the natural zero-indexed interpretation explicitly.
const zeroIndexedPair=[
  modPow(baseExponent,centerActionLayers-1,28),
  modPow(baseExponent,wordActionLayers-1,28),
];
assert.deepEqual(zeroIndexedPair,[1,9]);
assert.notDeepEqual(zeroIndexedPair,actionPair);

// The chosen action-count pair has direct independent DH identities.
assert.equal(dh.g-dh.K,actionPair[0]);
assert.equal(dh.a/dh.K,actionPair[0]);
assert.equal(dh.A+dh.B,actionPair[1]);
// The zero-index rival also has simple identities, so direct-expression
// availability alone cannot select the convention.
assert.equal(dh.a-dh.g,zeroIndexedPair[0]);
assert.equal(dh.b-dh.a,zeroIndexedPair[1]);

// Strict geometry family: a page-numbered word that begins immediately after
// an exact page center. This is the source object actually described.
const strictObjects=[];
const relaxedFiveRuneObjects=[];
for(let page=1;page<=55;page+=1){
  if(page===50)continue;
  const parsed=parsePage(physicalPart(page));
  const word=parsed.words[page-1];
  if(!word)continue;
  const odd=parsed.runes.length%2===1;
  if(!odd)continue;
  const pageCenter=(parsed.runes.length-1)/2;
  if(word.start===pageCenter+1){
    strictObjects.push({page,center:pageCenter,word:word.word,start:word.start,len:word.len,layers:Math.ceil(word.len/2)});
  }
  if(word.len===5){
    const source=[parsed.runes[pageCenter],...word.values];
    const output=[
      modPow(source[0],actionPair[0],29),
      ...source.slice(1).map((value)=>modPow(value,actionPair[1],29)),
    ];
    relaxedFiveRuneObjects.push({
      page,center:pageCenter,word:word.word,start:word.start,
      adjacent:word.start===pageCenter+1,
      source,
      output,
    });
  }
}
assert.deepEqual(strictObjects,[{page:28,center:134,word:28,start:135,len:5,layers:3}]);
assert.equal(relaxedFiveRuneObjects.length,6);
assert.deepEqual(relaxedFiveRuneObjects.map((row)=>row.page),[17,19,28,41,48,52]);
assert.equal(relaxedFiveRuneObjects.filter((row)=>row.adjacent).length,1);

// Output values are retained for reproducibility without dictionary/language
// evaluation, per the Director gate.
const p28Result=relaxedFiveRuneObjects.find((row)=>row.page===28);
assert.ok(p28Result);
assert.deepEqual(p28Result.source,[9,28,24,10,1,20]);
assert.deepEqual(p28Result.output,[4,28,23,3,1,16]);

console.log(JSON.stringify({
  status:"PASS",
  dh,
  orbit,
  bridge,
  rawSupports,
  layerConventions:{actionCount:actionPair,zeroIndexed:zeroIndexedPair},
  strictObjects,
  relaxedFiveRuneObjects,
  decision:{
    baseExponent:"e=3 is uniquely selected by the full K->A->B->b GP29 bridge inside the cube orbit",
    pair:"(3,27) follows uniquely from e=3 under literal one-operation-per-visible-layer semantics",
    caveat:"zero-index layer numbering gives the explicit rival (1,9); short DH expressions exist for both pairs, so expression coincidence alone is insufficient",
  }
},null,2));
