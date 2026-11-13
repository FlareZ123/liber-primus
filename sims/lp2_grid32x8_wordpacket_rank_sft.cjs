"use strict";

/**
 * Original pp49–51 table as a packetwise whole-word sorting key.
 *
 * Reproducer: node sims/lp2_grid32x8_wordpacket_rank_sft.cjs
 *
 * The historical 32x8 table supplies either 32 consecutive independent
 * eight-word sorting orders (one order per printed row), or eight independent
 * 32-word sorting orders (one per printed column). The two unambiguous
 * source-origin forward inverses are tested against frozen original words.
 * Variants are explicitly postselected diagnostics, calibrated under the
 * same complete 32/8-phase, ascending/descending and inverse search.
 *
 * No plaintext identities are assumed and original text is never modified.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const {stats, nativeLengths, rankMatch} =
  require("./lp2_wordlength_order_grammar_sft.cjs");

const ROOT = path.join(__dirname, "..");
const grid = require("../resources/liber-primus/lp2-grid-256.json").bytes;
const WORDS = 2896;
const NULL_SAMPLES = 250;
const CHI_SEED = 0x3301a8ff;
const LANGUAGE_SEED = 0x3301a8fe;

/**
 * @typedef {{axis:"row"|"column",shift:number,reverse:boolean,
 *   descending:boolean,map:Uint16Array}} Variant
 */

/** @param {"row"|"column"} axis @returns {number[][]} */
function tableOrders(axis) {
  const groups = axis === "row" ? 32 : 8;
  const width = axis === "row" ? 8 : 32;
  return Array.from({length:groups}, (_, group) =>
    Array.from({length:width}, (_, i) => i).sort((a,b) => {
      const ai = axis === "row" ? group * 8 + a : a * 8 + group;
      const bi = axis === "row" ? group * 8 + b : b * 8 + group;
      return grid[ai] - grid[bi] || a - b;
    }));
}

/** @param {"row"|"column"} axis @returns {Variant[]} */
function variants(axis) {
  const groups = axis === "row" ? 32 : 8;
  const size = axis === "row" ? 8 : 32;
  const orders = tableOrders(axis);
  const all = [];
  for (let shift = 0; shift < groups; shift++) {
    for (const reverse of [false,true]) {
      for (const descending of [false,true]) {
        const map = new Uint16Array(WORDS);
        for (let block = 0; block < Math.floor(WORDS / size); block++) {
          const order = orders[(block + shift) % groups];
          for (let j = 0; j < size; j++) {
            const k = descending ? order[size - 1 - j] : order[j];
            if (reverse) map[block * size + k] = block * size + j;
            else map[block * size + j] = block * size + k;
          }
        }
        for (let i = Math.floor(WORDS / size) * size; i < WORDS; i++)
          map[i] = i;
        all.push({axis, shift, reverse, descending, map});
      }
    }
  }
  return all;
}

/** @param {number[]} input @param {Variant} variant @returns {number[]} */
function apply(input, variant) {
  return Array.from(variant.map, source => input[source]);
}

/** @param {Variant} variant @returns {Uint16Array} */
function inverseMap(variant) {
  const map = new Uint16Array(WORDS);
  for (let i = 0; i < WORDS; i++) map[variant.map[i]] = i;
  return map;
}

/** @param {number[]} input @param {Uint16Array} map @returns {number[]} */
function permute(input,map) {
  return Array.from(map, index => input[index]);
}

/** @param {number[]} a @param {Uint16Array} index @returns {number} */
function chiScore(a,index) {
  const joint=new Int32Array(81), rows=new Int32Array(9), cols=new Int32Array(9);
  let last=Math.min(9,a[index[0]])-1;
  for(let i=1;i<WORDS;i++){
    const now=Math.min(9,a[index[i]])-1;
    joint[last*9+now]++;rows[last]++;cols[now]++;last=now;
  }
  let score=0;
  for(let i=0;i<9;i++)for(let j=0;j<9;j++){
    const expected=rows[i]*cols[j]/(WORDS-1);
    if(expected)score+=(joint[i*9+j]-expected)**2/expected;
  }
  return score;
}

/** @param {number[]} a @param {Uint16Array} map @param {Float64Array} w */
function languageScore(a,map,w){
  let score=0,last=Math.min(9,a[map[0]])-1;
  for(let i=1;i<WORDS;i++){
    const current=Math.min(9,a[map[i]])-1;
    score+=w[last*9+current];last=current;
  }
  return score;
}

/** @param {number[]} targetSorted @returns {{w:Float64Array,windows:number,example:number[]}} */
function trainLanguage(targetSorted) {
  const source=fs.readFileSync(
    path.join(ROOT,"resources","control","shakespeare_first300k.txt"),"utf8");
  const native=nativeLengths(source);
  const pairs=new Float64Array(81),row=new Float64Array(9),col=new Float64Array(9);
  let count=0,windows=0;
  let example=[];
  for(let offset=0;offset+WORDS<=native.length;offset+=WORDS){
    const sample=rankMatch(native.slice(offset,offset+WORDS),targetSorted);
    if(!windows)example=sample;
    const a=sample.map(value=>Math.min(value,9)-1);
    for(let i=1;i<WORDS;i++){
      pairs[a[i-1]*9+a[i]]++;row[a[i-1]]++;col[a[i]]++;count++;
    }
    windows++;
  }
  const w=new Float64Array(81),alpha=.5,denom=count+81*alpha;
  for(let i=0;i<9;i++)for(let j=0;j<9;j++){
    const pa=(pairs[i*9+j]+alpha)/denom;
    const pb=(row[i]+9*alpha)/denom;
    const pc=(col[j]+9*alpha)/denom;
    w[i*9+j]=Math.log(pa/(pb*pc));
  }
  return {w,windows,example};
}

/** @param {number} seed @returns {()=>number} */
function random(seed){
  let state=seed>>>0;
  return()=>{
    state^=state<<13;state^=state>>>17;state^=state<<5;
    return state>>>0;
  };
}

/** @param {number[]} a @param {()=>number} rand */
function shuffle(a,rand){
  for(let j=a.length-1;j>0;j--){
    const k=rand()%(j+1);
    [a[j],a[k]]=[a[k],a[j]];
  }
}

/** @param {number[]} original @param {Variant[]} all @param {Float64Array} weights */
function evaluate(original,all,weights){
  let bestChi={score:-Infinity,variant:null};
  let bestLanguage={score:-Infinity,variant:null};
  for(const variant of all){
    const chi=chiScore(original,variant.map);
    const language=languageScore(original,variant.map,weights);
    if(chi>bestChi.score)bestChi={score:chi,variant};
    if(language>bestLanguage.score)
      bestLanguage={score:language,variant};
  }
  return {bestChi,bestLanguage};
}

/** @param {Variant} v */
function detail(v){
  return {axis:v.axis,shift:v.shift,reverse:v.reverse,
    descending:v.descending};
}

function main(){
  const corpus=parseSharedCorpus();
  assert.equal(corpus.runeCount,12956);
  assert.equal(corpus.words.length,WORDS);
  assert.equal(grid.length,256);
  assert.equal(grid[0],203);
  const original=corpus.words.map(word=>word.length);
  const sorted=original.slice().sort((a,b)=>a-b);
  const {w,windows,example}=trainLanguage(sorted);
  assert.equal(windows,19);
  const baseline=stats(original).chi;
  assert.ok(Math.abs(baseline-68.27318638192133)<1e-8);
  const row=variants("row"),column=variants("column");
  assert.equal(row.length,128);
  assert.equal(column.length,32);
  const rowNatural=row[0],columnNatural=column[0];
  const r0=chiScore(original,rowNatural.map);
  const c0=chiScore(original,columnNatural.map);
  assert.ok(Math.abs(r0-68.24924068901514)<1e-8);
  assert.ok(Math.abs(c0-79.33323760142865)<1e-8);
  const rowResults=evaluate(original,row,w);
  const columnResults=evaluate(original,column,w);
  assert.ok(Math.abs(rowResults.bestChi.score-105.98936450756203)<1e-7);
  assert.ok(Math.abs(columnResults.bestChi.score-88.56961763399067)<1e-7);

  // Positive model: an authentic native-control word order encrypted under
  // each source-order packet cipher returns byte-for-byte as word lengths.
  for(const v of [rowNatural,columnNatural]){
    const plant=permute(example,inverseMap(v));
    const recovered=apply(plant,v);
    assert.deepEqual(recovered,example);
    const wrong=(v.axis==="row"?row:column)[4];
    assert.notDeepEqual(apply(plant,wrong),example);
  }

  const chiRng=random(CHI_SEED),languageRng=random(LANGUAGE_SEED);
  let chiExceed=0,languageExceed=0;
  let chiNullSum=0,languageNullSum=0;
  for(let sample=0;sample<NULL_SAMPLES;sample++){
    const a=original.slice(),b=original.slice();
    shuffle(a,chiRng);shuffle(b,languageRng);
    let chiMax=-Infinity,languageMax=-Infinity;
    for(const v of row){
      chiMax=Math.max(chiMax,chiScore(a,v.map));
      languageMax=Math.max(languageMax,languageScore(b,v.map,w));
    }
    chiExceed+=chiMax>=rowResults.bestChi.score;
    languageExceed+=languageMax>=rowResults.bestLanguage.score;
    chiNullSum+=chiMax;
    languageNullSum+=languageMax;
  }
  assert.equal(chiExceed,25);
  assert.equal(languageExceed,48);
  console.log(JSON.stringify({
    original:{runes:corpus.runeCount,words:original.length,baselineChi:baseline},
    sourceForward:{
      eightWords:{chi:r0,grammar:languageScore(original,rowNatural.map,w)},
      thirtyTwoWords:{chi:c0,grammar:languageScore(original,columnNatural.map,w)}
    },
    searched:{
      eightWords:{
        maxChi:rowResults.bestChi.score,
        maxChiKey:detail(rowResults.bestChi.variant),
        maxGrammar:rowResults.bestLanguage.score,
        maxGrammarKey:detail(rowResults.bestLanguage.variant)
      },
      thirtyTwoWords:{
        maxChi:columnResults.bestChi.score,
        maxChiKey:detail(columnResults.bestChi.variant),
        maxGrammar:columnResults.bestLanguage.score,
        maxGrammarKey:detail(columnResults.bestLanguage.variant)
      }
    },
    sourceNativeTraining:{shakespeareWindows:windows},
    allVariantHistogramNull:{draws:NULL_SAMPLES,seed:CHI_SEED,
      meanMaximum:chiNullSum/NULL_SAMPLES,exceed:chiExceed,
      upperTail:(chiExceed+1)/(NULL_SAMPLES+1)},
    allVariantLanguageNull:{draws:NULL_SAMPLES,seed:LANGUAGE_SEED,
      meanMaximum:languageNullSum/NULL_SAMPLES,exceed:languageExceed,
      upperTail:(languageExceed+1)/(NULL_SAMPLES+1)},
    positivePlant:{nativeWords:example.length,allExact:true}
  },null,2));
}
if(require.main===module)main();
module.exports={tableOrders,variants,chiScore,languageScore};
