'use strict';
/**
 * PRETARGET freeze, Agent7 2026-11-28.
 *
 * Reuses the already source-selected 27-rune itinerary key:
 * p7 printed red-product right-circulant inverse row
 * -> chapter first-post-rubric SUM addresses
 * -> exact original chapter words (27 nonzero GP29 runes)
 * -> immediately following p8 BLACK243 = 9*27 receiver.
 *
 * Since the upstream p7 register is multiplicative in GF29, freeze the direct
 * periodic field inverse P_i=C_i/K_i mod29, zero phase, continuous across p8
 * black runes. No additive mixing, exponentiation, phase, reset, F bypass,
 * sign/orientation, or plaintext score is consulted here.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),Q=29;
const mod=x=>((x%Q)+Q)%Q;
const product=v=>v.reduce((a,b)=>mod(a*b),1);
const sum=v=>mod(v.reduce((a,b)=>a+b,0));
const inv=x=>{for(let y=1;y<Q;y++)if(mod(x*y)===1)return y;throw new Error('noninvertible key rune '+x);};

function inverseGF29(matrix){
  const n=matrix.length;
  const rows=matrix.map((row,i)=>row.map(mod).concat(Array.from({length:n},(_,j)=>Number(i===j))));
  for(let col=0;col<n;col++){
    let pivot=-1;for(let row=col;row<n;row++)if(rows[row][col]){pivot=row;break;}
    assert(pivot>=0);
    if(pivot!==col)[rows[pivot],rows[col]]=[rows[col],rows[pivot]];
    const scale=inv(rows[col][col]);
    rows[col]=rows[col].map(x=>mod(x*scale));
    for(let row=0;row<n;row++)if(row!==col&&rows[row][col]){
      const f=rows[row][col];
      rows[row]=rows[row].map((x,j)=>mod(x-f*rows[col][j]));
    }
  }
  return rows.map(row=>row.slice(n));
}

const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));
const transcription=fs.readFileSync(path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8').replace(/\r/g,'');
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const parts=transcription.split(/^\s*%\s*$/m).slice(0,55);

function wordsAt(page){
  const source=corpus.pages.find(x=>x.page===page).indices;
  const segment=parts[page>=51?page-1:page];
  const words=[];let cur=[],start=0,offset=0;
  const flush=()=>{if(cur.length){words.push({start,values:cur.slice()});cur=[];}};
  for(const ch of segment){
    const value=runeIndex.get(ch);
    if(value!==undefined){
      if(!cur.length)start=offset;
      assert.equal(source[offset],value);
      cur.push(value);offset++;
    }else if(ch==='/'||/\s/u.test(ch)) continue;
    else flush();
  }
  flush();return words;
}
function firstBlackWord(page){
  const ann=ink.pages.find(x=>x.page===page);
  assert.ok(ann&&ann.red_spans&&ann.red_spans.length);
  const spans=ann.red_spans.slice().sort((a,b)=>a.start-b.start);
  assert.equal(spans[0].start,0);
  let redEnd=spans[0].length;
  for(let i=1;i<spans.length&&spans[i].start===redEnd;i++)redEnd+=spans[i].length;
  const word=wordsAt(page).find(w=>w.start===redEnd);
  assert.ok(word);
  return word;
}

const p7Red=[[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]];
const products=p7Red.map(product);
assert.deepEqual(products,[11,26,8,15,2]);
const circulant=Array.from({length:5},(_,i)=>
  Array.from({length:5},(_,k)=>products[(k-i+5)%5]));
const inverseRow=inverseGF29(circulant)[0];
assert.deepEqual(inverseRow,[23,2,5,2,19]);

const chapterStarts=[0,3,8,15,23,27,33,40,54];
const chapterWords=chapterStarts.map(page=>({page,word:firstBlackWord(page)}));
const bySum=new Map(chapterWords.map(x=>[sum(x.word.values),x]));
assert.equal(bySum.size,chapterStarts.length);
const itinerary=inverseRow.map(value=>{const hit=bySum.get(value);assert.ok(hit);return hit;});
assert.deepEqual(itinerary.map(x=>x.page),[8,27,33,27,54]);
const key=itinerary.flatMap(x=>x.word.values);
assert.equal(key.length,27);
assert.ok(key.every(x=>x!==0));
assert.deepEqual(key,[
  27,9,16,9,8,6,1,27,8,1,12,22,9,8,6,1,27,8,1,27,23,13,21,1,7,24,19
]);

const p8=corpus.pages.find(x=>x.page===8),p8Ann=ink.pages.find(x=>x.page===8);
const isRed=Array(p8.indices.length).fill(false);
for(const span of p8Ann.red_spans)
  for(let i=span.start;i<span.start+span.length;i++)isRed[i]=true;
const black=p8.indices.filter((_,i)=>!isRed[i]);
assert.equal(black.length,243);
assert.equal(black.length/key.length,9);

const decoded=black.map((x,i)=>mod(x*inv(key[i%key.length])));
const replay=decoded.map((x,i)=>mod(x*key[i%key.length]));
assert.deepEqual(replay,black);
console.log(JSON.stringify({
  schema:1,
  classification:'PRETARGET FROZEN periodic GF29 multiplicative receiver',
  p7Products:products,
  p7InverseRow:inverseRow,
  itinerary:itinerary.map(x=>({page:x.page,start:x.word.start,length:x.word.values.length,values:x.word.values})),
  key,keyLength:key.length,
  receiver:{page:8,kind:'black-only',runes:black.length,cycles:black.length/key.length},
  operation:'P_i=C_i*inverse(key[i mod27]) mod29; black p8 only; phase0; continuous',
  decodedIndices:decoded,
  decodedTranslit:decoded.map(i=>corpus.translit[i]).join(''),
  forwardReplay:true
},null,2));
