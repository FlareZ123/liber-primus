"use strict";

/**
 * Director #1778: p57 native-base60/divmod29 DH-register audit.
 *
 * Frozen typed relation:
 *   THE       -> [e,b]
 *   DIVINITY  -> [K,g]
 *   WITHIN    -> [q,b+K]
 *   AND       -> [A,p-1]
 * held out:
 *   EMERGE    -> [a,B]
 *
 * Charged convention family:
 *   radix {60,59} x token order {forward,reversed}
 *   x address origin {GP0,GP0-1} x pair order {quotient,remainder / swapped}.
 *
 * Exact tape controls:
 *   all 256 cyclic rotations;
 *   all 128*256 invertible affine address permutations mod256.
 *
 * Corpus controls:
 *   every contiguous five-word window in solved p56, p57 and signed2016;
 *   noncontiguous signed2016 pair inventory with cyclic and affine controls.
 *
 * Original contiguous-window controls:
 *   every five-word window in solved p56, solved p57,
 *   and authenticated signed-2016 cleartext; plus a noncontiguous 43-word
 *   inventory against the frozen typed-pair vocabulary with cyclic/affine controls.
 */

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=r=>fs.readFileSync(path.join(root,r),"utf8").replace(/\r/g,"");

const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const solved=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");

const ri=new Map(corpus.runes.map((r,i)=>[r,i]));
const tokens=grid.pages.flatMap(p=>p.tokens);
const alpha60=grid.alphabet;
const alpha59=alpha60.replace("f","");
assert.equal(tokens.length,256);
assert.equal(alpha60.length,60);
assert.equal(alpha59.length,59);

const state={p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3,q:4};

function parseRuneWords(text){
  const out=[]; let current=[];
  for(const ch of [...text]){
    const value=ri.get(ch);
    if(value!==undefined) current.push(value);
    else if(current.length && "•⁘⁜⁚ \n".includes(ch)){
      out.push(current); current=[];
    }
  }
  if(current.length) out.push(current);
  return out;
}

const gpTokens=corpus.translit
  .map((symbol,value)=>({symbol,value}))
  .sort((a,b)=>b.symbol.length-a.symbol.length);

function gpWord(word){
  const n=word.toUpperCase()
    .replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S")
    .replace(/[^A-Z]/g,"");
  const values=[];
  for(let offset=0;offset<n.length;){
    if(n.startsWith("ING",offset)){values.push(21);offset+=3;continue;}
    if(n.startsWith("IO",offset)){values.push(27);offset+=2;continue;}
    const token=gpTokens.find(x=>n.startsWith(x.symbol,offset));
    assert.ok(token,"unmapped GP spelling "+n.slice(offset));
    values.push(token.value); offset+=token.symbol.length;
  }
  return values;
}

const gp0=word=>word.reduce((a,b)=>a+b,0);

function decodeToken(token,alphabet,reversed){
  const t=reversed?[...token].reverse().join(""):token;
  const high=alphabet.indexOf(t[0]);
  const low=alphabet.indexOf(t[1]);
  if(high<0||low<0) return null;
  return high*alphabet.length+low;
}

function mappedPair(word,convention,tape=tokens){
  const address=gp0(word)+convention.originDelta;
  if(address<0||address>=256) return null;
  const alphabet=convention.radix===60?alpha60:alpha59;
  const value=decodeToken(tape[address],alphabet,convention.reverseToken);
  if(value===null) return null;
  const pair=[Math.floor(value/29),value%29];
  return convention.swapPair?[pair[1],pair[0]]:pair;
}

const p57=solved.sections.find(s=>s.name==="p57_parable");
assert.ok(p57);
const p57Words=parseRuneWords(p57.source_text);
assert.equal(p57Words.length,20);

const names=["THE","DIUINITY","WITHIN","AND","EMERGE"];
const indices=[15,16,17,18,19];
const selected=indices.map(i=>p57Words[i]);
const selectedNames=selected.map(word=>word.map(v=>corpus.translit[v]).join(""));
assert.deepEqual(selectedNames,names);

const targets=[
  [state.e,state.b],
  [state.K,state.g],
  [state.q,state.b+state.K],
  [state.A,state.p-1],
  [state.a,state.B],
];
assert.deepEqual(targets,[[3,15],[2,5],[4,17],[8,22],[6,19]]);

const conventions=[];
for(const radix of [60,59]){
  for(const reverseToken of [false,true]){
    for(const originDelta of [0,-1]){
      for(const swapPair of [false,true]){
        const convention={radix,reverseToken,originDelta,swapPair};
        const pairs=selected.map(word=>mappedPair(word,convention));
        const trainingMatches=pairs.slice(0,4).reduce(
          (n,pair,index)=>n+(
            pair &&
            pair[0]===targets[index][0] &&
            pair[1]===targets[index][1] ? 1 : 0
          ),0
        );
        const heldout=Boolean(
          pairs[4] &&
          pairs[4][0]===targets[4][0] &&
          pairs[4][1]===targets[4][1]
        );
        conventions.push({...convention,pairs,trainingMatches,heldout});
      }
    }
  }
}
assert.equal(conventions.length,16);
const fullConventionHits=conventions.filter(row=>
  row.trainingMatches===4 && row.heldout
);
assert.deepEqual(fullConventionHits,[{
  radix:60,
  reverseToken:false,
  originDelta:0,
  swapPair:false,
  pairs:targets,
  trainingMatches:4,
  heldout:true,
}]);

const canonical={
  radix:60,reverseToken:false,originDelta:0,swapPair:false,
};

// Exact cyclic token-tape controls.
const cyclicHits=[];
const cyclicTrainingHits=[];
for(let shift=0;shift<256;shift++){
  const tape=Array.from({length:256},(_,address)=>
    tokens[(address+shift)%256]
  );
  const pairs=selected.map(word=>mappedPair(word,canonical,tape));
  const training=pairs.slice(0,4).every((pair,index)=>
    pair[0]===targets[index][0] && pair[1]===targets[index][1]
  );
  const heldout=pairs[4][0]===targets[4][0] && pairs[4][1]===targets[4][1];
  if(training) cyclicTrainingHits.push(shift);
  if(training&&heldout) cyclicHits.push(shift);
}
assert.deepEqual(cyclicTrainingHits,[0]);
assert.deepEqual(cyclicHits,[0]);

// Exhaustive invertible affine address permutations x -> m*x+b mod256.
// Every odd m is invertible mod256, giving 32768 exact tape permutations.
const affineHits=[];
const affineTrainingHits=[];
for(let multiplier=1;multiplier<256;multiplier+=2){
  for(let add=0;add<256;add++){
    const tape=Array.from({length:256},(_,address)=>
      tokens[(multiplier*address+add)%256]
    );
    const pairs=selected.map(word=>mappedPair(word,canonical,tape));
    const training=pairs.slice(0,4).every((pair,index)=>
      pair[0]===targets[index][0] && pair[1]===targets[index][1]
    );
    const heldout=pairs[4][0]===targets[4][0] && pairs[4][1]===targets[4][1];
    if(training) affineTrainingHits.push({multiplier,add});
    if(training&&heldout) affineHits.push({multiplier,add});
  }
}
assert.deepEqual(affineTrainingHits,[{multiplier:1,add:0}]);
assert.deepEqual(affineHits,[{multiplier:1,add:0}]);

// Leave-section-out corpus controls: every contiguous five-word window.
const p56=solved.sections.find(s=>s.name==="p56_an_end");
assert.ok(p56);
const clear=signed.match(
  /Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u
);
assert.ok(clear);
const signedWordText=(clear[1].match(/\b[A-Za-z]+\b/gu)||[]).map(word=>word.toUpperCase());
const signedWords=signedWordText.map(gpWord);

const sections=[
  {name:"p56_an_end",words:parseRuneWords(p56.source_text)},
  {name:"p57_parable",words:p57Words},
  {name:"signed2016",words:signedWords},
];

const sectionControls=sections.map(section=>{
  const trainingStarts=[];
  const fullStarts=[];
  for(let start=0;start+5<=section.words.length;start++){
    const pairs=section.words.slice(start,start+5)
      .map(word=>mappedPair(word,canonical));
    if(pairs.some(pair=>pair===null)) continue;
    const training=pairs.slice(0,4).every((pair,index)=>
      pair[0]===targets[index][0] && pair[1]===targets[index][1]
    );
    const heldout=pairs[4][0]===targets[4][0] && pairs[4][1]===targets[4][1];
    if(training) trainingStarts.push(start);
    if(training&&heldout) fullStarts.push(start);
  }
  return {
    name:section.name,
    wordCount:section.words.length,
    trainingStarts,
    fullStarts,
  };
});
assert.deepEqual(sectionControls,[
  {name:"p56_an_end",wordCount:25,trainingStarts:[],fullStarts:[]},
  {name:"p57_parable",wordCount:20,trainingStarts:[15],fullStarts:[15]},
  {name:"signed2016",wordCount:43,trainingStarts:[],fullStarts:[]},
]);

// Held-out, noncontiguous source control: apply the already frozen five
// p57 DH-pair labels to every word of the authenticated 2016 signed message.
// This is not a search for new DH expressions.
const typedPairLabels = new Map([
  ["3,15", "e,b"],
  ["2,5", "K,g"],
  ["4,17", "q,b+K"],
  ["8,22", "A,p-1"],
  ["6,19", "a,B"],
]);
const inventoryForTape = tape => signedWords.map((word,index) => {
  const pair = mappedPair(word, canonical, tape);
  const label = pair ? typedPairLabels.get(pair.join(",")) : undefined;
  return label ? { index, word: signedWordText[index], pair, label, GP0: gp0(word) } : null;
}).filter(Boolean);
const signed2016Hits = inventoryForTape(tokens);
const expectedHits = [
  [1,"THE",[3,15],"e,b"], [7,"THE",[3,15],"e,b"],
  [12,"THE",[3,15],"e,b"], [17,"THE",[3,15],"e,b"],
  [18,"MAP",[8,22],"A,p-1"], [22,"THE",[3,15],"e,b"],
  [24,"AND",[8,22],"A,p-1"], [26,"NUMBERS",[6,19],"a,B"],
  [28,"THE",[3,15],"e,b"], [30,"SEEK",[8,22],"A,p-1"],
  [31,"AND",[8,22],"A,p-1"], [37,"LUCK",[4,17],"q,b+K"],
];
assert.deepEqual(signed2016Hits.map(x=>[x.index,x.word,x.pair,x.label]),expectedHits);
assert.equal(signed2016Hits.length,12);
assert.deepEqual([...new Set(signed2016Hits.map(x=>x.word))],["THE","MAP","AND","NUMBERS","SEEK","LUCK"]);

// Cyclic table-order control on the entire 43-word inventory.
const signedCyclic=[];
for(let shift=0;shift<256;shift++){
  const tape=Array.from({length:256},(_,address)=>tokens[(address+shift)%256]);
  signedCyclic.push({shift,hits:inventoryForTape(tape).length});
}
const signedCyclicMax=Math.max(...signedCyclic.map(x=>x.hits));
const signedCyclicMaxShifts=signedCyclic.filter(x=>x.hits===signedCyclicMax).map(x=>x.shift);
const signedCyclicNext=signedCyclic.slice().sort((a,b)=>b.hits-a.hits)[1];
assert.equal(signedCyclic[0].hits,12);
assert.equal(signedCyclicMax,12);
assert.deepEqual(signedCyclicMaxShifts,[0]);
assert.equal(signedCyclicNext.hits,8);

// Deduplicate repeated source spellings to show the result is not solely repeated THE.
const uniqueSourceIndices=[];
const seenSourceWords=new Set();
for(let i=0;i<signedWordText.length;i++){
  if(!seenSourceWords.has(signedWordText[i])){
    seenSourceWords.add(signedWordText[i]);
    uniqueSourceIndices.push(i);
  }
}
const uniqueEntries=uniqueSourceIndices.map(index=>({index,word:signedWords[index],text:signedWordText[index]}));
const uniqueInventoryForTape=tape=>uniqueEntries.map(x=>{
  const pair=mappedPair(x.word,canonical,tape);
  const label=pair?typedPairLabels.get(pair.join(",")):undefined;
  return label?{...x,pair,label}:null;
}).filter(Boolean);
const uniqueCyclic=[];
for(let shift=0;shift<256;shift++){
  const tape=Array.from({length:256},(_,address)=>tokens[(address+shift)%256]);
  uniqueCyclic.push({shift,hits:uniqueInventoryForTape(tape).length});
}
const uniqueCyclicMax=Math.max(...uniqueCyclic.map(x=>x.hits));
const uniqueCyclicMaxShifts=uniqueCyclic.filter(x=>x.hits===uniqueCyclicMax).map(x=>x.shift);
assert.equal(uniqueCyclic[0].hits,6);
assert.equal(uniqueCyclicMax,6);
assert.deepEqual(uniqueCyclicMaxShifts,[0]);

// Broader address-order control. All odd multipliers are invertible mod256.
let affineMax=0,affineMaxCount=0,affineAtLeastCanonical=0,affineCanonical=0;
for(let multiplier=1;multiplier<256;multiplier+=2){
  for(let add=0;add<256;add++){
    const tape=Array.from({length:256},(_,address)=>tokens[(multiplier*address+add)%256]);
    const hits=inventoryForTape(tape).length;
    if(multiplier===1&&add===0) affineCanonical=hits;
    if(hits>affineMax){affineMax=hits;affineMaxCount=1;}
    else if(hits===affineMax) affineMaxCount++;
    if(hits>=12) affineAtLeastCanonical++;
  }
}
assert.equal(affineCanonical,12);
assert.equal(affineMax,14);
assert.equal(affineMaxCount,5);
assert.equal(affineAtLeastCanonical,12);

console.log(JSON.stringify({
  status:"PASS",
  classification:
    "conditional authentication of the canonical p57 native-base60/divmod29 register",
  frozenRelation:{
    training:[
      ["THE",[state.e,state.b]],
      ["DIUINITY",[state.K,state.g]],
      ["WITHIN",[state.q,state.b+state.K]],
      ["AND",[state.A,state.p-1]],
    ],
    heldout:["EMERGE",[state.a,state.B]],
  },
  conventionFamily:{
    charged:conventions.length,
    fullHits:fullConventionHits,
    rows:conventions,
  },
  tokenTapeControls:{
    cyclic:{charged:256,trainingHits:cyclicTrainingHits,fullHits:cyclicHits},
    affine:{
      charged:128*256,
      trainingHits:affineTrainingHits,
      fullHits:affineHits,
    },
  },
  sectionControls,
  signed2016PairInventory: {
    sourceWordCount: signedWordText.length,
    hits: signed2016Hits,
    cyclicRotations: {
      charged: 256,
      canonicalHits: signedCyclic[0].hits,
      maximumHits: signedCyclicMax,
      maximumShifts: signedCyclicMaxShifts,
      nextBest: signedCyclicNext,
    },
    uniqueWordTypes: {
      sourceCount: uniqueEntries.length,
      canonicalHits: uniqueCyclic[0].hits,
      maximumHits: uniqueCyclicMax,
      maximumShifts: uniqueCyclicMaxShifts,
    },
    affineAddressPermutations: {
      charged: 128*256,
      canonicalHits: affineCanonical,
      maximumHits: affineMax,
      maximumCount: affineMaxCount,
      permutationsWithAtLeast12Hits: affineAtLeastCanonical,
    },
  },
  chronology:
    "The typed field labels were recognized after inspecting p57 historically; the holdout is formal/reproducible, not a blind historical prediction.",
  decision:
    "Prefer canonical base60, zero-based GP0 address, forward token order and quotient-first divmod29 as the p57 state serialization, but use it as conditional support rather than independent proof for unknown-page routes.",
},null,2));
