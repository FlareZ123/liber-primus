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

console.log(JSON.stringify({status:'PASS',ordinary:n,erasures:erased,
 observed:{pooled:observed[0],perPage:observed[1]},controls,gridKey:{body:chapter.length,keyBytes:key.length,erasures:erasedChapter,originalIoC:observedGridIoc,nativePlantedIoC:nativeGridIoc,recovered:at}}));
