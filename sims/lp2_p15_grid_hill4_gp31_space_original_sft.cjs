'use strict';

/**
 * LP2 original p15 printed 4x4 Fibonacci-prime grid as a reversible GF(31)
 * Hill cipher on 29 GP29 rune symbols + two printed boundary tokens.
 * The author did not prescribe this opcode; a bounded original-cipher test.
 *
 * Windows Node.js22 SFT: node sims/lp2_p15_grid_hill4_gp31_space_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} filename @returns {string} */
const read = filename => fs.readFileSync(path.join(root,filename),'utf8')
  .replace(/\r\n/g,'\n');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt').split('%');
assert.equal(transcript.length,57);
const runeMap = new Map(gp.runes.map((ch,i)=>[ch,i]));
const N = 31;
/** @param {number} n @returns {number} */
const mod = n => (n%N+N)%N;

/** @returns {number[][]} */
function sourceMatrix() {
  const text=read('resources/transcriptions/liber_primus_master.txt');
  const rows=text.match(/^(?:\d+(?:-\d+){3}\/(?:\n|$)){4}/gm)||[];
  assert.equal(rows.length,1);
  const grid=rows[0].trim().split('\n').map(s=>
    s.replace(/\/$/,'').split('-').map(Number));
  assert.deepEqual(grid,[
    [3258,3222,3152,3038],
    [3278,3299,3298,2838],
    [3288,3294,3296,2472],
    [4516,1206,708,1820]
  ]);
  return grid.map(row=>row.map(mod));
}
/** @param {number[][]} A @returns {number[][]} */
function invert(A) {
  const m=A.map((row,i)=>row.concat(
    Array.from({length:4},(_,j)=>Number(i===j))));
  for(let column=0;column<4;column++){
    let pivot=column;
    while(pivot<4&&m[pivot][column]===0)pivot++;
    assert.ok(pivot<4,'source square must be invertible modulo31');
    [m[column],m[pivot]]=[m[pivot],m[column]];
    let inv=1;
    while(mod(m[column][column]*inv)!==1)inv++;
    assert.ok(inv<31,'nonzero GF31 element must have inverse');
    for(let j=0;j<8;j++)m[column][j]=mod(m[column][j]*inv);
    for(let i=0;i<4;i++)if(i!==column){
      const factor=m[i][column];
      for(let j=0;j<8;j++)
        m[i][j]=mod(m[i][j]-factor*m[column][j]);
    }
  }
  return m.map(row=>row.slice(4));
}
/** @param {number[][]} A @param {number[][]} B */
function product(A,B) {
  return A.map(row=>B[0].map((_,j)=>
    mod(row.reduce((s,v,k)=>s+v*B[k][j],0))));
}
/** @param {number[][]} A */
const transpose=A=>A[0].map((_,j)=>A.map(row=>row[j]));
const M=sourceMatrix(),Mi=invert(M),IDENTITY=Array.from({length:4},
  (_,i)=>Array.from({length:4},(_,j)=>Number(i===j)));
assert.deepEqual(product(M,Mi),IDENTITY);
assert.deepEqual(product(Mi,M),IDENTITY);
assert.deepEqual(Mi,[
  [8,4,22,19],
  [8,9,8,3],
  [10,18,5,2],
  [7,17,8,18]
]);

/** @param {number} first @param {number} last */
function original(first,last) {
  let raw='';
  for(let p=first;p<=last;p++)if(p!==50)
    raw+=transcript[p<50?p:p-1];
  raw=raw.replace(/[\/\n\r]/g,'');
  const tokens=[],ornaments=[];
  for(const ch of raw){
    if(runeMap.has(ch))tokens.push(runeMap.get(ch));
    else if(ch==='-')tokens.push(29);
    else if(ch==='.')tokens.push(30);
    else if('&$§'.includes(ch))ornaments.push({at:tokens.length,char:ch});
    else if(!/\s/u.test(ch))throw Error('Unexpected source token '+ch);
  }
  assert.deepEqual(tokens.filter(x=>x<29),
    gp.pages.filter(p=>p.page>=first&&p.page<=last).flatMap(p=>p.indices));
  return{first,last,raw,tokens,ornaments};
}

/** @param {number[]} source @param {number[][]} A */
function apply(source,A) {
  const output=source.slice();
  for(let start=0;start+3<source.length;start+=4){
    for(let i=0;i<4;i++){
      let value=0;
      for(let j=0;j<4;j++)value+=A[i][j]*source[start+j];
      output[start+i]=mod(value);
    }
  }
  return output;
}
/** @param {number[]} tokens @param {Array<{at:number,char:string}>} marks */
function serialize(tokens,marks) {
  const chars=gp.runes.concat(['-','.']);
  let out='',j=0;
  for(let i=0;i<=tokens.length;i++){
    while(j<marks.length&&marks[j].at===i){
      out+=marks[j].char;j++;
    }
    if(i<tokens.length)out+=chars[tokens[i]];
  }
  assert.equal(j,marks.length);
  return out;
}

/** @param {number[]} tokens */
function metrics(tokens){
  const count=Array(31).fill(0);
  let run=0,words=0,empties=0,adjacent=0,maxWord=0,shortWords=0;
  for(let i=0;i<tokens.length;i++){
    const v=tokens[i];
    assert.ok(Number.isInteger(v)&&v>=0&&v<31);
    count[v]++;
    if(v<29){run++;continue;}
    if(!run)empties++;
    else{
      words++;
      if(run<=2)shortWords++;
      maxWord=Math.max(maxWord,run);
    }
    if(i&&tokens[i-1]>=29)adjacent++;
    run=0;
  }
  if(run){words++;if(run<=2)shortWords++;
    maxWord=Math.max(maxWord,run);}
  const freq=count.slice(0,29),
    n=freq.reduce((s,v)=>s+v,0),
    topFive=[...freq].sort((a,b)=>b-a).slice(0,5)
      .reduce((s,v)=>s+v,0)/n,
    ioc=freq.reduce((s,v)=>s+v*(v-1),0)/(n*(n-1));
  return{tokens:tokens.length,runes:n,
    spaces:count[29],stops:count[30],
    words,emptyWordSlots:empties,adjacentDelimiters:adjacent,
    maximumWord:maxWord,shortWords,topFive,ioc};
}

function main(){
  const chapters=[
    {region:original(16,22),runes:1744,spaces:381,stops:19,words:400},
    {region:original(40,53),runes:3008,spaces:626,stops:43,words:669}
  ];
  const variants=[
    ['sourceGridColumn',M,Mi],
    ['sourceGridRow',transpose(M),transpose(Mi)],
    ['inverseGridColumn',Mi,M],
    ['inverseGridRow',transpose(Mi),transpose(M)]
  ];
  const report={source:'Original LP2 p15 Fibonacci-prime 4x4 image square',
    modulus:31,
    printedAlphabet:'29 GP runes, literal hyphen and full stop',
    grid:M,inverse:Mi,expected:{
      source:'2014 visible numeric grid and GP29 alphabet plus source delimiters',
      hypothesis:'literal lossless GP31 Hill4 on 4-token blocks',
      authorSelectedOpcode:false},regions:[]};
  for(const {region,runes,spaces,stops,words} of chapters){
    const ref=metrics(region.tokens);
    assert.equal(ref.runes,runes);assert.equal(ref.spaces,spaces);
    assert.equal(ref.stops,stops);assert.equal(ref.words,words);
    assert.equal(ref.emptyWordSlots,0);
    assert.equal(serialize(region.tokens,region.ornaments),region.raw);
    const decoded={};
    for(const [name,key,inverse] of variants){
      const out=apply(region.tokens,key);
      const recovered=apply(out,inverse);
      assert.deepEqual(recovered,region.tokens);
      assert.equal(serialize(recovered,region.ornaments),region.raw);
      decoded[name]={metrics:metrics(out),
        opening:out.slice(0,48).map(v=>v===29?'_':v===30?'.':gp.translit[v]).join(' ')};
    }
    report.regions.push({pages:[region.first,region.last],original:ref,decoded});
  }

  // An authentic source-native positive: encrypt the entire actually solved p57
  // PARABLE rune-and-punctuation tape; recover each rune and every boundary.
  const solved=original(57,57),native=metrics(solved.tokens);
  assert.equal(native.runes,95);assert.equal(native.spaces,16);
  assert.equal(native.stops,4);assert.equal(native.words,20);
  for(const [name,key,inverse] of variants){
    const encoded=apply(solved.tokens,inverse);
    assert.deepEqual(apply(encoded,key),solved.tokens);
    assert.equal(serialize(apply(encoded,key),solved.ornaments),solved.raw);
    const wrong=apply(encoded,IDENTITY);
    assert.notDeepEqual(wrong,solved.tokens);
  }
  const p16=report.regions[0],p40=report.regions[1];
  for(const variant of variants.map(x=>x[0])){
    const first=p16.decoded[variant].metrics;
    const other=p40.decoded[variant].metrics;
    assert.ok(first.topFive<0.25&&other.topFive<0.25);
    assert.ok(first.spaces+first.stops<200);
    assert.ok(other.spaces+other.stops<400);
    assert.ok(first.maximumWord>=70&&other.maximumWord>=70);
  }
  report.positive={solvedNativeRuneCount:95,
    solvedNativePrintedWordCount:20,
    sourceReconstruction:true,independentKeyWrongDecode:true};
  report.decision='All four source-grid GF31 Hill4 directions fail to recover native GP29 English with original source punctuation; no unknown plaintext.';
  console.log(JSON.stringify(report,null,2));
}
main();
