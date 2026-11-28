'use strict';
/**
 * Pretarget freeze, Agent7 2026-11-28.
 *
 * Source path:
 * p7 printed red products -> printed-order right-circulant inverse row ->
 * chapter first-black SUM addresses -> five original chapter words ->
 * 27-rune key -> immediately following p8 black243 = 9*27 receiver.
 *
 * Frozen inverse: ordinary GP29 additive subtraction, zero phase, continuous
 * over black p8 runes only. No sign sweep, phase, reset, F bypass or scoring.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),Q=29,mod=x=>((x%Q)+Q)%Q;
const product=v=>v.reduce((a,b)=>mod(a*b),1),sum=v=>mod(v.reduce((a,b)=>a+b,0));
const inv=x=>{for(let y=1;y<Q;y++)if(mod(x*y)===1)return y;throw Error('inverse');};
function inverseGF29(matrix){
  const n=matrix.length,rows=matrix.map((r,i)=>r.map(mod).concat(Array.from({length:n},(_,j)=>Number(i===j))));
  for(let c=0;c<n;c++){
    let pivot=-1;for(let r=c;r<n;r++)if(rows[r][c]){pivot=r;break;}assert(pivot>=0);
    if(pivot!==c)[rows[pivot],rows[c]]=[rows[c],rows[pivot]];
    const scale=inv(rows[c][c]);rows[c]=rows[c].map(x=>mod(x*scale));
    for(let r=0;r<n;r++)if(r!==c){const f=rows[r][c];rows[r]=rows[r].map((x,j)=>mod(x-f*rows[c][j]));}
  }
  return rows.map(r=>r.slice(n));
}
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));
const transcription=fs.readFileSync(path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8').replace(/\r/g,'');
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const parts=transcription.split(/^\s*%\s*$/m).slice(0,55);

function wordsAt(page){
  const source=corpus.pages.find(x=>x.page===page).indices;
  const segment=parts[page>=51?page-1:page],words=[];
  let cur=[],start=0,offset=0;
  const flush=()=>{if(cur.length){words.push({start,values:cur.slice()});cur=[];}};
  for(const ch of segment){
    const value=runeIndex.get(ch);
    if(value!==undefined){if(!cur.length)start=offset;assert.equal(source[offset],value);cur.push(value);offset++;}
    else if(ch==='/'||/\s/u.test(ch))continue;
    else flush();
  }
  flush();return words;
}
function firstBlackWord(page){
  const ann=ink.pages.find(x=>x.page===page);assert.ok(ann&&ann.red_spans&&ann.red_spans.length);
  const spans=ann.red_spans.slice().sort((a,b)=>a.start-b.start);assert.equal(spans[0].start,0);
  let redEnd=spans[0].length;
  for(let i=1;i<spans.length&&spans[i].start===redEnd;i++)redEnd+=spans[i].length;
  const word=wordsAt(page).find(w=>w.start===redEnd);assert.ok(word);
  return word;
}

// P7 red words and printed-order circulant inverse.
const p7Red=[[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]];
const p7Products=p7Red.map(product);assert.deepEqual(p7Products,[11,26,8,15,2]);
const circulant=Array.from({length:5},(_,i)=>Array.from({length:5},(_,k)=>p7Products[(k-i+5)%5]));
const inverseRow=inverseGF29(circulant)[0];assert.deepEqual(inverseRow,[23,2,5,2,19]);

// Chapter SUM register addresses the five key words.
const chapterStarts=[0,3,8,15,23,27,33,40,54];
const chapterWords=chapterStarts.map(page=>({page,word:firstBlackWord(page)}));
const bySum=new Map(chapterWords.map(x=>[sum(x.word.values),x]));
assert.equal(bySum.size,chapterStarts.length);
const itinerary=inverseRow.map(value=>{const x=bySum.get(value);assert.ok(x);return x;});
assert.deepEqual(itinerary.map(x=>x.page),[8,27,33,27,54]);
const key=itinerary.flatMap(x=>x.word.values);
assert.deepEqual(itinerary.map(x=>x.word.values.length),[3,7,2,7,8]);
assert.equal(key.length,27);

// Immediately following p8 black receiver.
const p8=corpus.pages.find(x=>x.page===8),p8Ann=ink.pages.find(x=>x.page===8);
const red=Array(p8.indices.length).fill(false);
for(const sp of p8Ann.red_spans)for(let i=sp.start;i<sp.start+sp.length;i++)red[i]=true;
const black=p8.indices.filter((_,i)=>!red[i]);
assert.equal(p8.indices.length,255);
assert.equal(black.length,243);
assert.equal(black.length/key.length,9);

// Frozen p56-style additive inverse.
const decoded=black.map((x,i)=>mod(x-key[i%key.length]));
assert.deepEqual(decoded.map((x,i)=>mod(x+key[i%key.length])),black);
console.log(JSON.stringify({
 schema:1,classification:'PRETARGET FROZEN source-selected additive receiver',
 p7Products,inverseRow,itinerary:itinerary.map(x=>({page:x.page,start:x.word.start,length:x.word.values.length,values:x.word.values})),
 key,keyLength:key.length,
 receiver:{page:8,blackRunes:black.length,cycles:black.length/key.length},
 operation:'P_i=C_i-key[i mod27] mod29; black p8 only; phase0; continuous; no F bypass',
 decodedIndices:decoded,
 decodedTranslit:decoded.map(i=>corpus.translit[i]).join('')
},null,2));
