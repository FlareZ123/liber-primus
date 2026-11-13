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
console.log(JSON.stringify({status:'PASS',ordinary:n,erasures:erased,
 observed:{pooled:observed[0],perPage:observed[1]},controls}));
