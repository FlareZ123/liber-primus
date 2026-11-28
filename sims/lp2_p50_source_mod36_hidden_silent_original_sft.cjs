'use strict';
/**
 * Source-typed p50 256-table keystream -> independent exact C11 mod36
 * hidden-output receiver. FINITE, PREDECLARED ORIGINAL CIPHER TEST, not
 * a claim that Cicada selected mod36 or used p50 for this page.
 *
 * Key: fixed original row-major p49–51 grid of 256 base60/base59 values,
 * repeated in the printed order; each value reduced mod36. All starting
 * phases zero, no alphabet fitting, no source-chosen phase/scope after output.
 *
 * Authenticate the receiver on source-native GP29 held-out plants using
 * precisely this key, then compare literal original pages with controls.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const raw={
 gp:read('resources/liber-primus/lp2-corpus.json'),
 shakespeare:read('resources/control/shakespeare_first300k.txt'),
 gibran:read('resources/control/gibran_prophet_58585.txt'),
 emerson:read('resources/control/emerson_essays_2944.txt')
};
const gp=JSON.parse(raw.gp),grid=JSON.parse(read('resources/liber-primus/base60-grid.json')),
  decoder=require('./lp2_alt36_silent_exact_latent_viterbi_sft.cjs').experiment,
  tokens=grid.rows.flat();
assert.equal(tokens.length,256);
assert.equal(gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices).length,12956);
assert.equal(gp.pages[54].indices.slice(9).length+gp.pages[55].indices.length,299);
assert.equal(grid.alphabet.length,60);
const norm=x=>((x%36)+36)%36;
const alphabet59=grid.alphabet.replace('f','');
assert.equal(alphabet59.length,59);
function sourceKey(alphabet){
 const v=tokens.map(token=>{
  assert.equal(token.length,2);
  const hi=alphabet.indexOf(token[0]),lo=alphabet.indexOf(token[1]);
  assert(hi>=0&&lo>=0,token);
  return hi*alphabet.length+lo;
 });
 assert(v.every(x=>x>=0&&x<=255));
 return {base:alphabet.length,bytes:v,unit:v.map(x=>x%36)};
}
function fullKey(unit,len){return Array.from({length:Math.ceil(1.9*len)+128},(_,i)=>unit[i%256]);}
const sorted=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
function encodeNative(source){
 const p=[];
 for(const w0 of source.toUpperCase().match(/[A-Z]+/g)||[]){
  const w=w0.replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
  for(let j=0;j<w.length;){
   const v=w.startsWith('ING',j)?{t:'ING',i:21}:w.startsWith('IO',j)?{t:'IO',i:27}:sorted.find(x=>w.startsWith(x.t,j));
   assert(v,'Unmapped GP word '+w.slice(j));p.push(v.i);j+=v.t.length;
  }
  p.push(29); // source-native plaintext word spaces are genuine hidden-model SPACE29
 }
 return p;
}
function strictSender(P,K){
 let j=0,prev=-1;const out=[];
 for(const p of P){
  assert(p>=0&&p<=29);
  while(norm(p+K[j])===prev){j++;assert(j<K.length);}
  const c=norm(p+K[j]);out.push({c,p,keyIndex:j});
  prev=c;j++;
 }
 return out;
}
function lcs(a,b){
 const p=new Uint16Array(b.length+1),q=new Uint16Array(b.length+1);
 for(const x of a){
  q.fill(0);
  for(let i=0;i<b.length;i++)q[i+1]=x===b[i]?p[i]+1:Math.max(p[i+1],q[i]);
  p.set(q);
 }
 return p[b.length];
}
const scope=[
 {name:'original-p0-first-260',c:gp.pages[0].indices.slice(0,260)},
 {name:'original-p54-body-plus-p55',c:gp.pages[54].indices.slice(9).concat(gp.pages[55].indices)}
];
const plants=[
 {name:'Shakespeare-native-held-text',t:raw.shakespeare},
 {name:'Gibran-native-held-text',t:raw.gibran}
];
const rows=[];
for(const alphabet of [grid.alphabet,alphabet59]){
 const key=sourceKey(alphabet);
 const status={base:key.base,min:Math.min(...key.bytes),max:Math.max(...key.bytes),
   unique:new Set(key.bytes).size,mod36Distinct:new Set(key.unit).size,
   zeroDecimalCells:[13,39,192,210,229].map(i=>({i,token:tokens[i],v:key.bytes[i]}))};
 for(const plant of plants){
  // Frozen final 25% textual sample, disjoint from receiver's first-57%
  // LM training subset in every donor. No original ciphertext in sampling.
  const complete=encodeNative(plant.t),start=Math.floor(.75*complete.length),P=complete.slice(start,start+380);
  assert.equal(P.length,380);
  const K=fullKey(key.unit,400);
  const generated=strictSender(P,K);
  const shown=generated.filter(x=>x.c<29),C=shown.map(x=>x.c),
    visiblePlain=shown.filter(x=>x.p<29).map(x=>x.p);
  const response=decoder(raw,{decodeInput:{cipher:C,key:K},beam:380,maxHidden:3});
  assert.equal(response.status.startsWith('candidate'),true,JSON.stringify(response).slice(0,300));
  const decoded=response.indices,ratio=lcs(decoded,visiblePlain)/Math.max(decoded.length,visiblePlain.length);
  rows.push({class:'positive-control',base:key.base,target:plant.name,
    inputGPPlainWithSpaces:P.length,visibleCipher:C.length,visibleNativePlain:visiblePlain.length,
    decoded:decoded.length,lcsRatio:ratio,score:response.score,
    preview:response.transliteration.slice(0,110)});
 }
 for(const item of scope){
  const C=item.c,K=fullKey(key.unit,C.length);
  const result=decoder(raw,{decodeInput:{cipher:C,key:K},beam:380,maxHidden:3});
  if(result.status!=='candidate decoder output (not an authenticated original plaintext)'){
   rows.push({class:'original',base:key.base,target:item.name,status:result.status,failed:result.failed});
   continue;
  }
  rows.push({class:'original',base:key.base,target:item.name,inputCipher:C.length,
    decoded:result.indices.length,keyLast:result.lastConsumedKeyIndex,
    score:result.score,preview:result.transliteration.slice(0,170),
    originalCandidateNoSpaces:result.transliteration});
 }
 rows.push({class:'key-source',...status});
}
const controls=rows.filter(x=>x.class==='positive-control');
assert.equal(controls.length,4);
for(const control of controls){
 // Controls are end-to-end implementation diagnostics; a failed control
 // invalidates original-cipher interpretation, not a successful negative.
 assert(control.lcsRatio>.75,
  'source-key native ciphertext positive did not recover; original scores are invalid: '+JSON.stringify(control));
}
console.log(JSON.stringify({schema:'lp2-p50-mod36-hidden-key-gate-v1',
 hypothesis:'p50 source bytes modulo36 as periodic strict-repeat hidden-output keystream',
 scope:'literal source row-major, first cell phase0, both surviving base59/60 grammars; no alternative phase',
 notes:'Original outputs are candidates only: decode is a language-scored Viterbi path, not an authenticated Cicada mechanism.',
 rows},null,2));
