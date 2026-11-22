'use strict';
/**
 * Original LP2 candidate T6-orbit predecessor rank inverse, with real
 * repeat erasures and native-control whole-page round-trips. Node 22 CJS.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
/** @param {string} p */
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const data=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages=data.pages.filter(p=>p.page<=55&&p.indices.length);
assert.equal(pages.length,55);
const T=x=>(24-2*x+58)%29;
assert.equal(T(8),8);
const options=Array.from({length:29},(_,p)=>{
 let x=p===8?0:T(p),arr=[];
 for(let k=0;k<(p===8?28:27);k++){arr.push(x);x=T(x);}
 if(p!==8)arr.push(8);
 assert.equal(arr.length,28);assert.equal(new Set(arr).size,28);
 assert(!arr.includes(p));
 return arr;
});
const inverse=options.map(values=>{const a=new Int8Array(29).fill(-1);
 values.forEach((x,i)=>{a[x]=i;});return a;});
const masks=[],original=[];let n=0,erased=0;
for(const page of pages){
 const C=page.indices,r=[],mask=[];
 for(let j=1;j<C.length;j++){
  const prev=C[j-1],cur=C[j];
  if(prev===cur){mask.push(true);erased++;}
  else{const v=inverse[prev][cur];assert(v>=0&&v<28);r.push(v);mask.push(false);n++;}
 }
 masks.push(mask);original.push(r);
}
assert.equal(n,12815);assert.equal(erased,86);
/** @param {number[][]} sequences */
function ioc(sequences){
 let num=0,den=0;
 for(const s of sequences){
  const f=new Uint32Array(28);for(const v of s)f[v]++;
  for(const c of f)num+=c*(c-1);
  den+=s.length*(s.length-1);
 }
 return num/den;
}
const observed=[ioc([original.flat()]),ioc(original)];
assert(Math.abs(observed[0]-0.035769122255268376)<1e-13);
assert(Math.abs(observed[1]-0.03605405232725298)<1e-13);
const alphabet=new Map(data.translit.map((v,i)=>[v,i]));
const pairs=new Set(['TH','NG','EO','OE','AE','IA','EA']);
/** @param {string} source */
function gp28(source){
 const s=source.toUpperCase().replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
 const out=[];
 for(let i=0;i<s.length;){
  if(!/[A-Z]/.test(s[i])){i++;continue;}
  let token;
  if(s.slice(i,i+3)==='ING'){token='NG';i+=3;}
  else{token=pairs.has(s.slice(i,i+2))?s.slice(i,i+2):s[i];i+=token.length;}
  const v=alphabet.get(token);if(v!==undefined&&v<28)out.push(v);
 }
 return out;
}
/** @param {string} file */
function challenge(file){
 const message=gp28(read(file));assert(message.length>=n);
 let at=0;const decoded=[];
 for(let p=0;p<pages.length;p++){
  let C=[pages[p].indices[0]],r=[];
  for(const isRepeat of masks[p]){
   const prev=C[C.length-1];
   const next=isRepeat?prev:options[prev][message[at++]];
   if(!isRepeat){assert.equal(inverse[prev][next],message[at-1]);r.push(inverse[prev][next]);}
   C.push(next);
  }
  assert.equal(C.length,pages[p].indices.length);decoded.push(r);
 }
 assert.equal(at,n);
 const ans=[ioc([decoded.flat()]),ioc(decoded)];
 assert(ans[0]>.06&&ans[1]>.06);
 return {sourceSymbols:message.length,pooled:ans[0],perPage:ans[1],recovered:n};
}
const controls={
 Shakespeare:challenge('resources/control/shakespeare_first300k.txt'),
 Gibran:challenge('resources/control/gibran_prophet_58585.txt'),
 Emerson:challenge('resources/control/emerson_essays_2944.txt')
};

/**
 * One independently printed-key consumer, no search: p40's first eight red
 * runes precede exactly 3,000 runes in the same visual section; its
 * 32-by-8 table provides 256 source bytes. Subtract byte[i mod256] mod28
 * from each T-orbit predecessor rank on the 3,000-rune body.
 */
const rawGrid=JSON.parse(read('resources/liber-primus/base60-grid.json'));
const key=rawGrid.rows.flat().map(v=>
 rawGrid.alphabet.indexOf(v[0])*60+rawGrid.alphabet.indexOf(v[1]));
assert.equal(key.length,256);
assert(key.every(x=>x>=0&&x<=255));
const allChapter=pages.filter(p=>p.page>=40&&p.page<=53)
 .flatMap(p=>p.indices);
assert.equal(allChapter.length,3008);
assert.deepEqual(allChapter.slice(0,8),[0,9,19,26,6,23,25,8]);
const chapter=allChapter.slice(8);
let prev=allChapter[7],normal=[],erasedChapter=0;
const erasedIndices=new Set();
for(let i=0;i<chapter.length;i++){
 const symbol=chapter[i],rank=inverse[prev][symbol];
 if(rank<0){erasedChapter++;erasedIndices.add(i);}
 else{normal.push((rank-(key[i%256]%28)+28)%28);}
 prev=symbol;
}
assert.equal(erasedChapter,18);
const observedGridIoc=ioc([normal]);
assert(Math.abs(observedGridIoc-0.03583594826253732)<1e-13);
// Independent genuine-language positive, encoded with precisely the same
// originally observed 18 erasure sites, key clock and first body predecessor.
const source=gp28(read('resources/control/shakespeare_first300k.txt'));
let at=0,previous=allChapter[7],decoded=[];
for(let i=0;i<chapter.length;i++){
 const isRepeat=erasedIndices.has(i);
 const encoded=isRepeat?previous:options[previous][(source[at]+key[i%256]%28)%28];
 if(!isRepeat){
  const rank=inverse[previous][encoded];
  const recovered=(rank-(key[i%256]%28)+28)%28;
  assert.equal(recovered,source[at++]);
  decoded.push(recovered);
 }else assert.equal(encoded,previous);
 previous=encoded;
}
assert.equal(at,2982);
const nativeGridIoc=ioc([decoded]);
assert(Math.abs(nativeGridIoc-0.06392531640699615)<1e-13);


/**
 * A strictly stronger all-secret source-language test: each complete printed
 * rune word may have its own unrelated 28-symbol secret permutation. Only
 * within-word rank equality pairs survive that freedom. Original word/page
 * wraps are respected; exact within-word doublet erasures are retained.
 */
const {parseLP2Words}=require('./lp2_word_pages.cjs');
const wordTape=parseLP2Words(read('resources/liber-primus/lp2-transcription.txt'));
assert.equal(wordTape.words.length,2896);
assert.equal(wordTape.runeCount,12956);
assert.equal(wordTape.crossPageWords,32);
const runeIndex=new Map(data.runes.map((glyph,i)=>[glyph,i]));
const wordInputs=wordTape.words.map(w=>Array.from(w.runes,ch=>runeIndex.get(ch)));
let recoveredOriginal=0,wordErased=0;
const wordMasks=[],originalWordRanks=[];
for(const w of wordInputs){
 const r=[],mask=[];
 for(let i=1;i<w.length;i++){
  const value=inverse[w[i-1]][w[i]];
  if(value<0){mask.push(true);wordErased++;}
  else{r.push(value);mask.push(false);recoveredOriginal++;}
 }
 originalWordRanks.push(r);wordMasks.push(mask);
}
assert.equal(recoveredOriginal,9997);
assert.equal(wordErased,63);
/** @param {number[][]} records */
function wordPairCollision(records){
 let numerator=0,denominator=0;
 for(const w of records){
  const c=new Uint16Array(28);
  for(const v of w)c[v]++;
  for(const n of c)numerator+=n*(n-1);
  denominator+=w.length*(w.length-1);
 }
 return {numerator,denominator,rate:numerator/denominator};
}
const observedWord=wordPairCollision(originalWordRanks);
assert.equal(observedWord.numerator,1400);
assert.equal(observedWord.denominator,39930);
assert(Math.abs(observedWord.rate-0.035061357375406964)<1e-14);
/** @param {string} raw */
function gp28OneWord(raw){
 const s=raw.toUpperCase().replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
 const out=[];
 for(let i=0;i<s.length;){
  let t;
  if(s.slice(i,i+3)==='ING'){t='NG';i+=3;}
  else{t=pairs.has(s.slice(i,i+2))?s.slice(i,i+2):s[i];i+=t.length;}
  const v=alphabet.get(t);assert(v!==undefined);
  out.push(v===28?27:v);
 }
 return out;
}
let wordRandomState=0x11a11301;
/** @returns {number} */
function wordRandom(){
 wordRandomState^=wordRandomState<<13;
 wordRandomState^=wordRandomState>>>17;
 wordRandomState^=wordRandomState<<5;
 return (wordRandomState>>>0)/4294967296;
}
/** @param {string} sourceFile @param {number} sourceWords */
function nativeWordChallenges(sourceFile,sourceWords){
 const tokens=read(sourceFile).match(/[A-Za-z]+/g)??[];
 assert.equal(tokens.length,sourceWords);
 const byLength=new Map();
 for(const token of tokens){
  const word=gp28OneWord(token),choices=byLength.get(word.length)??[];
  choices.push(word);byLength.set(word.length,choices);
 }
 for(const target of wordInputs)assert(byLength.has(target.length));
 const rates=[];
 for(let trial=0;trial<400;trial++){
  let numerator=0,denominator=0;
  for(let wi=0;wi<wordInputs.length;wi++){
   const ciphertext=wordInputs[wi],mask=wordMasks[wi];
   const dictionary=byLength.get(ciphertext.length);
   const source=dictionary[Math.floor(wordRandom()*dictionary.length)];
   const cnt=new Uint16Array(28);
   let prev=ciphertext[0],length=0;
   for(let j=1;j<ciphertext.length;j++){
    if(mask[j-1])continue; // Repeat erasure is preserved exactly.
    const coded=options[prev][source[j]];
    const decoded=inverse[prev][coded];
    assert.equal(decoded,source[j]);
    cnt[decoded]++;length++;prev=coded;
   }
   for(const v of cnt)numerator+=v*(v-1);
   denominator+=length*(length-1);
  }
  assert.equal(denominator,39930);
  rates.push(numerator/denominator);
 }
 const mean=rates.reduce((s,v)=>s+v,0)/rates.length;
 const count=rates.filter(v=>v<=observedWord.rate).length;
 assert.equal(count,0);
 return {sourceWords,draws:rates.length,mean,min:Math.min(...rates),max:Math.max(...rates),atOrBelowOriginal:count};
}
const wordControls={
 Shakespeare:nativeWordChallenges('resources/control/shakespeare_first300k.txt',55407),
 Gibran:nativeWordChallenges('resources/control/gibran_prophet_58585.txt',15733),
 Emerson:nativeWordChallenges('resources/control/emerson_essays_2944.txt',77932)
};

console.log(JSON.stringify({status:'PASS',ordinary:n,erasures:erased,
 observed:{pooled:observed[0],perPage:observed[1]},controls,gridKey:{body:chapter.length,keyBytes:key.length,erasures:erasedChapter,originalIoC:observedGridIoc,nativePlantedIoC:nativeGridIoc,recovered:at},wordAllSecret:{original:observedWord,ordinary:recoveredOriginal,erasures:wordErased,controls:wordControls}}));
