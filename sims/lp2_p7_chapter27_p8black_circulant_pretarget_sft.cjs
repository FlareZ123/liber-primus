'use strict';
/**
 * PRETARGET freeze, Agent7 2026-11-28.
 *
 * Source path:
 *   p7 original red five-word products
 *   -> printed-order right-circulant GF29 inverse first row [23,2,5,2,19]
 *   -> chapter first-post-rubric SUM addresses
 *   -> five original chapter words, concatenated in that exact order
 *   -> 27-rune first row
 *   -> immediately following p8 BLACK243 = 9*27 receiver
 *
 * Frozen operation:
 *   build the exact same right-circulant convention at dimension 27;
 *   if invertible in GF29, inverse-transform each of the nine contiguous
 *   27-rune black blocks as column vectors.
 *
 * No determinant, invertibility, plaintext, score, transpose, reversal, phase,
 * alternate block origin, sign, F bypass, or key-coordinate tuning is consulted
 * in selecting this construction.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),Q=29;
const mod=x=>((x%Q)+Q)%Q;
const product=v=>v.reduce((a,b)=>mod(a*b),1);
const sum=v=>mod(v.reduce((a,b)=>a+b,0));
const inv=x=>{for(let y=1;y<Q;y++)if(mod(x*y)===1)return y;throw new Error('noninvertible scalar');};

function inverseGF29(matrix){
  const n=matrix.length;
  const rows=matrix.map((row,i)=>row.map(mod).concat(Array.from({length:n},(_,j)=>Number(i===j))));
  let determinant=1;
  for(let col=0;col<n;col++){
    let pivot=-1;
    for(let row=col;row<n;row++)if(rows[row][col]!==0){pivot=row;break;}
    if(pivot<0)return {inverse:null,determinant:0,rank:col};
    if(pivot!==col){
      [rows[pivot],rows[col]]=[rows[col],rows[pivot]];
      determinant=mod(-determinant);
    }
    const lead=rows[col][col];
    determinant=mod(determinant*lead);
    const scale=inv(lead);
    rows[col]=rows[col].map(x=>mod(x*scale));
    for(let row=0;row<n;row++){
      if(row===col||rows[row][col]===0)continue;
      const factor=rows[row][col];
      rows[row]=rows[row].map((x,j)=>mod(x-factor*rows[col][j]));
    }
  }
  return {inverse:rows.map(row=>row.slice(n)),determinant,rank:n};
}
function transformBlocks(matrix,body){
  const n=matrix.length;
  assert.equal(body.length%n,0);
  const out=[];
  for(let offset=0;offset<body.length;offset+=n){
    for(const row of matrix){
      out.push(mod(row.reduce((acc,value,j)=>acc+value*body[offset+j],0)));
    }
  }
  return out;
}

const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));
const transcription=fs.readFileSync(path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8').replace(/\r/g,'');
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const parts=transcription.split(/^\s*%\s*$/m).slice(0,55);

function wordsAt(page){
  const source=corpus.pages.find(x=>x.page===page).indices;
  const segment=parts[page>=51?page-1:page];
  const words=[];
  let current=[],start=0,offset=0;
  const flush=()=>{if(current.length){words.push({start,values:current.slice()});current=[];}};
  for(const char of segment){
    const value=runeIndex.get(char);
    if(value!==undefined){
      if(!current.length)start=offset;
      assert.equal(source[offset],value);
      current.push(value);offset++;
    }else if(char==='/'||/\s/u.test(char)) continue;
    else flush();
  }
  flush();
  return words;
}
function firstBlackWord(page){
  const ann=ink.pages.find(x=>x.page===page);
  assert.ok(ann&&ann.red_spans&&ann.red_spans.length);
  const spans=ann.red_spans.slice().sort((a,b)=>a.start-b.start);
  assert.equal(spans[0].start,0);
  let redEnd=spans[0].length;
  for(let i=1;i<spans.length&&spans[i].start===redEnd;i++)redEnd+=spans[i].length;
  const word=wordsAt(page).find(w=>w.start===redEnd);
  assert.ok(word,'missing first-black word p'+page);
  return word;
}

// P7 original red-product circulant, same convention used upstream.
const p7Red=[[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]];
const p7Products=p7Red.map(product);
assert.deepEqual(p7Products,[11,26,8,15,2]);
const p7Circulant=Array.from({length:5},(_,i)=>
  Array.from({length:5},(_,k)=>p7Products[(k-i+5)%5]));
const p7Inverse=inverseGF29(p7Circulant);
assert.ok(p7Inverse.inverse);
const inverseRow=p7Inverse.inverse[0];
assert.deepEqual(inverseRow,[23,2,5,2,19]);

// Chapter SUM register turns inverse-row values into exact original words.
const chapterStarts=[0,3,8,15,23,27,33,40,54];
const chapterWords=chapterStarts.map(page=>({page,word:firstBlackWord(page)}));
const bySum=new Map(chapterWords.map(x=>[sum(x.word.values),x]));
assert.equal(bySum.size,chapterStarts.length);
const itinerary=inverseRow.map(value=>{const hit=bySum.get(value);assert.ok(hit);return hit;});
assert.deepEqual(itinerary.map(x=>x.page),[8,27,33,27,54]);

const key=itinerary.flatMap(x=>x.word.values);
assert.deepEqual(itinerary.map(x=>x.word.values.length),[3,7,2,7,8]);
assert.equal(key.length,27);
assert.deepEqual(key,[
  27,9,16,
  9,8,6,1,27,8,1,
  12,22,
  9,8,6,1,27,8,1,
  27,23,13,21,1,7,24,19
]);

// Source-typed receiver: immediately following p8, black runes only.
const p8=corpus.pages.find(x=>x.page===8);
const p8Ann=ink.pages.find(x=>x.page===8);
const isRed=Array(p8.indices.length).fill(false);
for(const span of p8Ann.red_spans)
  for(let i=span.start;i<span.start+span.length;i++)isRed[i]=true;
const black=p8.indices.filter((_,i)=>!isRed[i]);
assert.equal(p8.indices.length,255);
assert.equal(black.length,243);
assert.equal(black.length/key.length,9);

// Freeze the exact recursive right-circulant before inspecting its algebra.
const matrix=Array.from({length:key.length},(_,i)=>
  Array.from({length:key.length},(_,k)=>key[(k-i+key.length)%key.length]));
const analysis=inverseGF29(matrix);
let decoded=null,replay=null;
if(analysis.inverse){
  decoded=transformBlocks(analysis.inverse,black);
  replay=transformBlocks(matrix,decoded);
  assert.deepEqual(replay,black);
}
console.log(JSON.stringify({
  schema:1,
  classification:'PRETARGET FROZEN recursive right-circulant receiver',
  p7Products,
  p7InverseRow:inverseRow,
  itinerary:itinerary.map(x=>({page:x.page,start:x.word.start,length:x.word.values.length,values:x.word.values})),
  key,
  keyLength:key.length,
  receiver:{page:8,kind:'black-only',runes:black.length,blocks:black.length/key.length},
  matrix:{dimension:key.length,convention:'right-circulant row_i[k]=key[(k-i+27)%27]',determinant:analysis.determinant,rank:analysis.rank,invertible:Boolean(analysis.inverse)},
  operation:'if invertible: P_block=M^-1*C_block over GF29, nine consecutive 27-rune black blocks, source origin0',
  decodedIndices:decoded,
  decodedTranslit:decoded?decoded.map(i=>corpus.translit[i]).join(''):null,
  forwardReplay:replay?true:null
},null,2));
