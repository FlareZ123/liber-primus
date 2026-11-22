"use strict";
/**
 * Original-cipher period-60 all-secret gate for LP2 physical pages 33–39.
 *
 * A source-motivated but unconfirmed interpretation of the Babylonian
 * sexagesimal numerals places all 1,680 chapter runes in 28 rows of 60.
 * Even a completely secret GP29 substitution independently chosen for
 * every column preserves within-column symbol multiplicities. For a
 * stronger test, also allow unrestricted reordering inside every column.
 *
 * Reproduce: node sims/lp2_cuneiform60_allsecret_source_gate.cjs
 * Node 22, no packages, source files read-only.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=relative=>fs.readFileSync(path.join(root,relative),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source=corpus.pages.filter(p=>p.page>=33&&p.page<=39);
const pageLengths=source.map(p=>p.indices.length);
assert.deepEqual(pageLengths,[214,261,271,238,228,228,240]);
const cipher=source.flatMap(p=>p.indices);
const LENGTH=1680,COLUMNS=60,ROWS=28,MOD=29;
assert.equal(cipher.length,LENGTH);
assert.equal(ROWS*COLUMNS,LENGTH);
const glyphMap=new Map(corpus.translit.map((name,index)=>[name,index]));

/**
 * Existing corpus normalization for English-language controls.
 * @param {string} sourceText
 * @returns {number[]}
 */
function toGp(sourceText){
  const txt=sourceText.toUpperCase()
    .replace(/QU/g,"CW").replace(/K/g,"C")
    .replace(/Q/g,"C").replace(/V/g,"U").replace(/Z/g,"S");
  const indices=[];
  for(const word of txt.match(/[A-Z]+/g)||[]){
    for(let i=0;i<word.length;){
      const digraph=word.slice(i,i+2);
      if(glyphMap.has(digraph)){indices.push(glyphMap.get(digraph));i+=2;}
      else{
        const c=glyphMap.get(word[i]);
        if(c!==undefined)indices.push(c);
        i++;
      }
    }
  }
  return indices;
}

/**
 * @param {number[]} runes
 * @param {number} start
 * @returns {Uint16Array[]}
 */
function phaseHistograms(runes,start=0){
  assert.ok(start>=0&&start+LENGTH<=runes.length);
  const hist=Array.from({length:COLUMNS},()=>new Uint16Array(MOD));
  for(let i=0;i<LENGTH;i++)hist[i%COLUMNS][runes[start+i]]++;
  return hist;
}

/** @param {Uint16Array[]} hist @returns {number} */
function equalPairs(hist){
  let count=0;
  for(const row of hist)for(const value of row)count+=value*(value-1)/2;
  return count;
}

/**
 * Exact minimum symbol replacements to reconcile column histograms after
 * any secret per-column 29-symbol bijection AND arbitrary reordering
 * within columns. Sorted count matching is optimal by rearrangement.
 * Every equal-total column contributes half its count-vector L1 distance.
 * @param {Uint16Array[]} first
 * @param {Uint16Array[]} second
 * @returns {number}
 */
function minimumEdits(first,second){
  let edits=0;
  for(let j=0;j<COLUMNS;j++){
    const a=Array.from(first[j]).sort((x,y)=>y-x);
    const b=Array.from(second[j]).sort((x,y)=>y-x);
    for(let k=0;k<MOD;k++)edits+=Math.max(0,a[k]-b[k]);
  }
  return edits;
}

/** @param {number} seed */
function seeded(seed){
  let state=seed|0;
  return ()=>{
    state^=state<<13;state^=state>>>17;state^=state<<5;
    return state>>>0;
  };
}

/**
 * Positive control: a source-English window transformed by 60 secret
 * alphabets and 60 independent positional permutations. Exact recoverability
 * is asserted using the planted secret; the histogram-bound sees zero edits.
 * @param {number[]} native
 */
function plantAndRecover(native){
  const random=seeded(0x20143301);
  const original=native.slice(64,64+LENGTH);
  const encrypted=Array(LENGTH),recovered=Array(LENGTH);
  for(let column=0;column<COLUMNS;column++){
    const alphabet=Array.from({length:MOD},(_,i)=>i);
    const order=Array.from({length:ROWS},(_,i)=>i);
    for(const a of [alphabet,order]){
      for(let i=a.length-1;i>0;i--){
        const j=random()%(i+1);
        [a[i],a[j]]=[a[j],a[i]];
      }
    }
    const inverse=Array(MOD);
    for(let x=0;x<MOD;x++)inverse[alphabet[x]]=x;
    for(let row=0;row<ROWS;row++){
      const oldPos=row*COLUMNS+column;
      const newPos=order[row]*COLUMNS+column;
      encrypted[newPos]=alphabet[original[oldPos]];
      recovered[oldPos]=inverse[encrypted[newPos]];
    }
  }
  assert.deepEqual(recovered,original);
  assert.equal(minimumEdits(phaseHistograms(original),
    phaseHistograms(encrypted)),0);
  assert.equal(equalPairs(phaseHistograms(original)),
    equalPairs(phaseHistograms(encrypted)));
  return {symbolsRecovered:recovered.length,secretAlphabetCount:COLUMNS,
    secretPositionPermutationCount:COLUMNS,minimumEdits:0};
}

/** @param {number[]} values @param {number} target */
function distribution(values,target){
  values.sort((a,b)=>a-b);
  return {
    windows:values.length,
    min:values[0],
    median:values[Math.floor(values.length/2)],
    max:values.at(-1),
    atMostOriginal:values.filter(v=>v<=target).length
  };
}

function main(){
  const observed=phaseHistograms(cipher);
  assert.equal(equalPairs(observed),797);
  assert.equal(minimumEdits(observed,observed),0);
  const controls=[
    {name:"Gibran",file:"resources/control/gibran_prophet_58585.txt",size:63114,
      windows:2119,minPairs:1253,minEdits:227},
    {name:"Emerson",file:"resources/control/emerson_essays_2944.txt",size:324630,
      windows:11137,minPairs:1265,minEdits:223},
    {name:"Shakespeare",file:"resources/control/shakespeare_first300k.txt",size:218800,
      windows:7487,minPairs:1214,minEdits:212}
  ];
  const matches=[];
  let planted;
  for(const source of controls){
    const plain=toGp(read(source.file));
    assert.equal(plain.length,source.size);
    if(source.name==="Gibran")planted=plantAndRecover(plain);
    const pairCounts=[],editBounds=[];
    for(let off=0;off+LENGTH<=plain.length;off+=29){
      const current=phaseHistograms(plain,off);
      pairCounts.push(equalPairs(current));
      editBounds.push(minimumEdits(observed,current));
    }
    const pair=distribution(pairCounts,797);
    const edits=distribution(editBounds,0);
    assert.equal(pair.windows,source.windows);
    assert.equal(pair.min,source.minPairs);
    assert.equal(edits.min,source.minEdits);
    assert.equal(pair.atMostOriginal,0);
    matches.push({source:source.name,nativeGpRunes:plain.length,
      stride:29,equalPairs:pair,minimumRequiredChanges:edits});
  }
  console.log(JSON.stringify({
    classification:"finite-register exclusion, no authentic decipherment",
    originalPages:source.map(p=>p.page),
    originalPageLengths:pageLengths,
    originalRunes:LENGTH,
    potentialLayout:{rows:ROWS,columns:COLUMNS,
      rationale:"1680=28*60; source shows sexagesimal numerals after 91 runes on p33",
      sourceDoesNotSelectThisLayout:true},
    originalEqualPairsWithin60Phases:equalPairs(observed),
    model:"arbitrary 29-symbol bijection and arbitrary positional permutation independently per each of 60 columns",
    nativeControls:matches,
    positiveControl:planted,
    boundary:"Cannot exclude varying alphabets within a 60-column phase, changing segmentation or a non-native GP plaintext register.",
    conclusion:"This 60-phase native-GP reversible-substitution/transposition family fails for every source window tested. No plaintext or real key follows."
  },null,2));
}
if(require.main===module)main();
module.exports={main,phaseHistograms,equalPairs,minimumEdits,toGp,plantAndRecover};
