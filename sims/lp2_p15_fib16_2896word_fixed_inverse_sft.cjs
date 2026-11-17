"use strict";

/**
 * Frozen source-visible p15 4x4 Fibonacci-prime grid as an original LP2
 * 16-column / 16-word-row permutation selector. The exactly 2,896 printed
 * words form 16 x 181 without filler. This script tests a causal word-order
 * hypothesis without estimating a key or rearranging original rune values.
 *
 * Evidence class: finite historical-source-word-order receiver, not plaintext.
 * Source images: original 32.jpg, LP2 p15. Test: Node.js 22 on Windows 11.
 *
 * @typedef {{name:string,order:number[]}} Key
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname,"..");
const read = p => fs.readFileSync(path.join(ROOT,p),"utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const controlText = [
  read("resources/control/gibran_prophet_58585.txt"),
  read("resources/control/shakespeare_first300k.txt")
];
const WIDTH = 16, ROWS = 181, COUNT = WIDTH * ROWS, BINS = 12;
const CHAPTERS = [158,255,383,437,224,326,378,669,66];
const GRID = [
  3258,3222,3152,3038,
  3278,3299,3298,2838,
  3288,3294,3296,2472,
  4516,1206,708,1820
];
const SPIRAL = [5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12];
const PRIMES = [2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817];
for(let i=0;i<WIDTH;i++)
  assert.equal(GRID[SPIRAL[i]],Math.abs(3301-PRIMES[i]));
assert.equal(CHAPTERS.reduce((a,b)=>a+b,0),COUNT);
const ASC = Array.from({length:WIDTH},(_,i)=>i).sort((a,b)=>GRID[a]-GRID[b]);
/** @type {Key[]} */
const KEYS = [
  {name:"spiral",order:SPIRAL},
  {name:"reverse_spiral",order:SPIRAL.slice().reverse()},
  {name:"numeric_ascending",order:ASC},
  {name:"numeric_descending",order:ASC.slice().reverse()}
];
for(const key of KEYS){
  assert.equal(new Set(key.order).size,WIDTH);
  assert.deepEqual(key.order.slice().sort((a,b)=>a-b),
    Array.from({length:WIDTH},(_,i)=>i));
}
const runeSet = new Set(gp.runes);
const tokens = gp.translit.slice().sort((a,b)=>b.length-a.length);

/** Source printed words; '-' '.' '&' delimit, page/line wraps do not. */
function originalLengths(){
  const out=[];
  let runeCount=0,word=0;
  for(const ch of transcription){
    if(runeSet.has(ch)){
      runeCount++;word++;
      if(runeCount===12956){out.push(word);break;}
    } else if("-.&".includes(ch)&&word) {
      out.push(word);word=0;
    }
  }
  assert.equal(runeCount,12956);
  assert.equal(out.length,COUNT);
  return out;
}
/** @param {string} sourceWord */
function toGPLength(sourceWord){
  const text=sourceWord.toUpperCase().replace(/QU/g,"CW")
    .replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  let n=0;
  for(let i=0;i<text.length;){
    const count=text.startsWith("ING",i)?3:text.startsWith("IO",i)?2:
      (tokens.find(x=>text.startsWith(x,i))||"").length;
    assert.ok(count>0,sourceWord);
    i+=count;n++;
  }
  return n;
}
const sources=controlText.map(text=>(text.match(/[A-Za-z]+/g)||[]).map(toGPLength));
const MODEL_ENDS=[8500,40000], HELDOUT_STARTS=[10000,45000];
assert.deepEqual(sources.map(s=>s.length),[15733,55407]);

const bin=n=>Math.min(BINS-1,n-1);
const pairs=Array.from({length:BINS},()=>new Float64Array(BINS));
const row=new Float64Array(BINS),column=new Float64Array(BINS);
let total=0;
for(let group=0;group<sources.length;group++)for(let i=1;i<MODEL_ENDS[group];i++){
  const source=sources[group];
  const a=bin(source[i-1]),b=bin(source[i]);
  pairs[a][b]++;row[a]++;column[b]++;total++;
}
const lr=pairs.map((a,i)=>Array.from(a,(v,j)=>
  Math.log((v+2)/(row[i]+2*BINS))
    -Math.log((column[j]+2)/(total+2*BINS))));

/** Mean heldout-source-trained adjacent GP wordlength likelihood ratio. */
function score(data){
  let sum=0;
  for(let i=1;i<data.length;i++)
    sum+=lr[bin(data[i-1])][bin(data[i])];
  return sum/(data.length-1);
}
/** @param {number[]} data @param {number[]} key */
function columnDecrypt(data,key){
  assert.equal(data.length,COUNT);
  const columns=Array.from({length:WIDTH},(_,i)=>
    data.slice(i*ROWS,(i+1)*ROWS));
  const keyPosition=Array.from({length:WIDTH},(_,i)=>key.indexOf(i));
  const out=[];
  for(let r=0;r<ROWS;r++)for(let col=0;col<WIDTH;col++)
    out.push(columns[keyPosition[col]][r]);
  return out;
}
/** @param {number[]} data @param {number[]} key */
function columnEncrypt(data,key){
  assert.equal(data.length,COUNT);
  const columns=Array.from({length:WIDTH},()=>[]);
  for(let i=0;i<data.length;i++)columns[i%WIDTH].push(data[i]);
  return key.flatMap(j=>columns[j]);
}
/**
 * A 16-word local permutation with optional chapter clock reset.
 * The inverse also handles genuine incomplete final chapter rows.
 *
 * @param {number[]} data
 * @param {number[]} key
 * @param {boolean} chapter
 * @param {boolean} decrypt
 */
function localRows(data,key,chapter,decrypt){
  const chunks=[];
  if(chapter){
    let at=0;
    for(const size of CHAPTERS){chunks.push(data.slice(at,at+size));at+=size;}
  } else chunks.push(data);
  const out=[];
  for(const chunk of chunks)for(let at=0;at<chunk.length;at+=WIDTH){
    const source=chunk.slice(at,at+WIDTH),order=key.filter(x=>x<source.length);
    const dest=Array(source.length);
    if(decrypt){
      for(let i=0;i<order.length;i++)dest[order[i]]=source[i];
    }else{
      for(let i=0;i<order.length;i++)dest[i]=source[order[i]];
    }
    out.push(...dest);
  }
  assert.equal(out.length,COUNT);
  return out;
}
const original=originalLengths();
const baseScore=score(original);
const candidates=[];
for(const key of KEYS){
  const col=columnDecrypt(original,key.order);
  candidates.push({key:key.name,operation:"full_book_columns",
    gpLengthLR:score(col)});
  for(const chapter of [false,true])
    for(const decrypt of [true,false])
      candidates.push({key:key.name,operation:chapter?"chapter_local_rows":"book_local_rows",
        direction:decrypt?"decode":"encode",
        gpLengthLR:score(localRows(original,key.order,chapter,decrypt))});
}
candidates.sort((a,b)=>b.gpLengthLR-a.gpLengthLR);
const grid=KEYS[2].order;
const plants=[];
for(let source=0;source<sources.length;source++){
  const start=HELDOUT_STARTS[source];
  const plain=sources[source].slice(start,start+COUNT);
  assert.equal(plain.length,COUNT);
  const cipherColumns=columnEncrypt(plain,grid);
  const recoveredColumns=columnDecrypt(cipherColumns,grid);
  const cipherRows=localRows(plain,grid,false,false);
  const recoveredRows=localRows(cipherRows,grid,false,true);
  const cipherChapters=localRows(plain,grid,true,false);
  const recoveredChapters=localRows(cipherChapters,grid,true,true);
  assert.deepEqual(recoveredColumns,plain);
  assert.deepEqual(recoveredRows,plain);
  assert.deepEqual(recoveredChapters,plain);
  plants.push({source:source?"Shakespeare":"Gibran",
    nativeGPScore:score(plain),
    columnScrambledScore:score(cipherColumns),
    columnRecoveredScore:score(recoveredColumns),
    wordrowScrambledScore:score(cipherRows),
    wordrowRecoveredScore:score(recoveredRows),
    chapterScrambledScore:score(cipherChapters),
    chapterRecoveredScore:score(recoveredChapters),
    recoveredWords:COUNT});
}
assert.ok(plants.every(x=>x.nativeGPScore>0));
assert.ok(candidates.every(x=>x.gpLengthLR<0),
  "Original source yields a source-GP word-order signal, review blind before changing the model");
console.log(JSON.stringify({
  question:"Does original p15 16-cell grid directly choose LP2 16x181 whole-word order?",
  originalCipherRunes:12956,printedWords:COUNT,
  fullSourceRows:ROWS,fullSourceCols:WIDTH,chapters:CHAPTERS,
  sourceGrid:GRID,sourceSpiral:SPIRAL,
  originalGPWordLR:baseScore,
  strongestFixedOriginal:candidates.slice(0,10),
  weakestFixedOriginal:candidates.slice(-2),
  numberFixedReceivers:candidates.length,
  controls:plants,
  conclusion:"No original authentic plaintext/key or native-GP word-order signal under these exact fixed p15 orders"
},null,2));
