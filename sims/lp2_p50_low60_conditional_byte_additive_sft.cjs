'use strict';

/**
 * Director #1514: frozen p50 low60 conditional byte-additive inverse.
 *
 * P_i = C_i - (B[i mod 256] mod 29) mod29 when raw base60 B<60;
 * P_i = C_i otherwise. Global phase0 clock, no resets or variants.
 *
 * Windows Node.js 22, CommonJS, standard library only.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=(name)=>fs.readFileSync(path.join(root,name),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
const bytes=grid.bytes;
const mod=x=>((x%29)+29)%29;
assert.equal(bytes.length,256);
assert.equal(bytes.filter(x=>x<60).length,60);
assert.equal(pages.reduce((s,p)=>s+p.indices.length,0),12956);

/**
 * @param {{page:number,indices:number[]}[]} input
 * @param {1|-1} direction
 */
function apply(input,direction){
  let global=0;
  return input.map(page=>{
    const indices=page.indices.map((value,local)=>{
      const byte=bytes[(global+local)&255];
      return byte<60?mod(value+direction*(byte%29)):value;
    });
    global+=page.indices.length;
    return {page:page.page,indices};
  });
}
const decoded=apply(pages,-1);
assert.deepEqual(apply(decoded,1).map((page)=>({page:page.page,indices:page.indices})),
  pages.map((page)=>({page:page.page,indices:page.indices})));
const original=pages.flatMap(p=>p.indices);
const plain=decoded.flatMap(p=>p.indices);
assert.equal(plain.reduce((s,v,i)=>s+Number(v!==original[i]),0),2835);

/* Canonical complete-word parsing: physical line/page wraps are layout only. */
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const source=read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0,55).join('%');
const words=[];
let fragment=0,start=0,runeOffset=0;
function finish(){
  if(!fragment)return;
  words.push({start,length:fragment});
  fragment=0;
}
for(const ch of source){
  if(runeIndex.has(ch)){
    if(!fragment)start=runeOffset;
    fragment++;
    runeOffset++;
  }else if(ch==='%'||ch==='/'||/\s/u.test(ch)){
    // layout only
  }else{
    finish();
  }
}
finish();
assert.deepEqual([runeOffset,words.length],[12956,2896]);

const tokens=corpus.translit.map((symbol,index)=>({symbol,index}))
  .sort((a,b)=>b.symbol.length-a.symbol.length);
/** @param {string} raw */
function encodeWord(raw){
  const s=raw.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out=[];
  for(let i=0;i<s.length;){
    if(s.startsWith('ING',i)){out.push(21);i+=3;continue;}
    if(s.startsWith('IO',i)){out.push(27);i+=2;continue;}
    const token=tokens.find(x=>s.startsWith(x.symbol,i));
    if(!token)return [];
    out.push(token.index);
    i+=token.symbol.length;
  }
  return out;
}
const dictionary=new Map();
for(const line of read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/)){
  const match=line.match(/^([A-Za-z]+)/);
  if(!match)continue;
  const encoded=encodeWord(match[1]);
  if(!encoded.length)continue;
  if(!dictionary.has(encoded.length))dictionary.set(encoded.length,new Set());
  dictionary.get(encoded.length).add(encoded.join(','));
}
/** @param {number} begin @param {number} end */
function lexical(begin,end){
  let total=0,hits=0,longHits=0,run=0,maxRunRunes=0;
  for(const word of words){
    if(word.start<begin||word.start+word.length>end)continue;
    total++;
    const value=plain.slice(word.start,word.start+word.length).join(',');
    const hit=dictionary.get(word.length)?.has(value)||false;
    if(hit){
      hits++;
      if(word.length>=5)longHits++;
      run+=word.length;
      maxRunRunes=Math.max(maxRunRunes,run);
    }else run=0;
  }
  return {words:total,hits,longHits,maxRunRunes};
}
function ioc(values){
  const counts=new Uint32Array(29);
  for(const value of values)counts[value]++;
  return Array.from(counts).reduce((s,n)=>s+n*(n-1),0)/
    (values.length*(values.length-1));
}
assert.ok(Math.abs(ioc(plain)-0.03446577907781335)<1e-15);
assert.deepEqual(lexical(0,12956),
  {words:2896,hits:189,longHits:0,maxRunRunes:5});

const starts=new Map();
let offset=0;
for(const page of pages){starts.set(page.page,offset);offset+=page.indices.length;}
const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const chapters=ranges.map(([first,last])=>{
  const begin=starts.get(first);
  const page=pages.find(p=>p.page===last);
  const end=starts.get(last)+page.indices.length;
  return {pages:[first,last],runes:end-begin,...lexical(begin,end)};
});
assert.deepEqual(chapters.map(x=>x.longHits),Array(9).fill(0));
assert.deepEqual(chapters.map(x=>x.hits),[11,14,27,29,14,32,22,34,6]);

/* Source-shaped exact positive: repeated independently solved p57 clear GP. */
const p57=corpus.pages.find(p=>p.page===57).indices;
const plantFlat=Array.from({length:12956},(_,i)=>p57[i%p57.length]);
let plantOffset=0;
const plant=pages.map(page=>{
  const indices=plantFlat.slice(plantOffset,plantOffset+page.indices.length);
  plantOffset+=page.indices.length;
  return {page:page.page,indices};
});
assert.deepEqual(apply(apply(plant,1),-1),plant);

console.log(JSON.stringify({
  rule:'phase0 B<60 => P=C-(B mod29); B>=60 => identity',
  original:{runes:12956,changed:2835},
  decoded:{ioc:ioc(plain),...lexical(0,12956),chapters},
  positive:{source:'repeated solved p57 native GP',runes:12956,exactRoundtrip:true},
  decision:'FAIL: all nine chapters have zero exact dictionary words of GP length >=5; no >=150-rune coherent plaintext or blind continuation exists.'
},null,2));
