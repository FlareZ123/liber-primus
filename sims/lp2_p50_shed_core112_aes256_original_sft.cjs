'use strict';

/**
 * One source-conditioned possible 256-bit key, tested without fitting.
 * Solved p57 SHED suggests base60 minus omit-f base59 (difference 0..4).
 * p28 DH shared2 conditionally peels two original 32x8 rectangular shells.
 * Remaining 28x4 = 112 base5 digits, original row-major, 255-bit integer.
 * Test AES256-CTR fixed IV=0 against unmodified unknown GP29 ciphertext.
 * Neither the peel instruction nor AES use is author-authenticated.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const G = JSON.parse(fs.readFileSync(path.join(root,
  'resources','liber-primus','lp2-grid-256.json'),'utf8'));
const C = JSON.parse(fs.readFileSync(path.join(root,
  'resources','liber-primus','lp2-corpus.json'),'utf8'));

const a60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const a59 = a60.replace('f','');
assert.equal(G.alphabet,a60);
const tokens=G.pages.flatMap(p=>p.tokens);
assert.equal(tokens.length,256);
const b60=tokens.map(x=>60*a60.indexOf(x[0])+a60.indexOf(x[1]));
const b59=tokens.map(x=>59*a59.indexOf(x[0])+a59.indexOf(x[1]));
const diff=b60.map((v,i)=>v-b59[i]);
assert(diff.every(v=>v>=0&&v<=4));
const hist=Array(5).fill(0);
diff.forEach(v=>hist[v]++);
assert.deepEqual(hist,[36,62,62,63,33]);
const core=[];
for(let row=2;row<30;row++)for(let col=2;col<6;col++)
  core.push(diff[8*row+col]);
assert.equal(core.length,112);
assert.equal(core.reduce((a,b)=>a+b,0),199);
assert.deepEqual(core.slice(0,12),[0,0,2,2,3,0,2,1,3,0,1,1]);
const keyInt=core.reduce((v,d)=>5n*v+BigInt(d),0n);
assert.equal(keyInt.toString(2).length,255);
const key=Buffer.from(keyInt.toString(16).padStart(64,'0'),'hex');
assert.equal(key.length,32);
assert.equal(key.toString('hex'),
  '55f78eab5d76f4d9f577829b25c560fbc83e7a5ff90e1381be067f7957995987');

/** @param {number} length */
function stream(length) {
  const crypt=crypto.createCipheriv('aes-256-ctr',key,Buffer.alloc(16));
  return Buffer.concat([crypt.update(Buffer.alloc(length)),crypt.final()]);
}
/** @param {number[]} symbols @param {'encrypt'|'decrypt'} mode */
function transform(symbols,mode) {
  const mask=stream(symbols.length);
  return symbols.map((v,i)=>(v+(mode==='encrypt'?mask[i]:-mask[i])+29*9)%29);
}
/** @param {number[]} v */
function ioc(v) {
  const h=Array(29).fill(0);
  v.forEach(x=>h[x]++);
  return h.reduce((s,n)=>s+n*(n-1),0)/(v.length*(v.length-1));
}
const unsolved=C.pages.filter(p=>p.page<=55);
assert.equal(unsolved.length,56);
const all=unsolved.flatMap(p=>p.indices);
assert.equal(all.length,12956);
const dec=transform(all,'decrypt');
assert.deepEqual(transform(dec,'encrypt'),all);
const perPage=new Map();let off=0;
for(const p of unsolved){perPage.set(p.page,dec.slice(off,off+p.indices.length));off+=p.indices.length}
assert.equal(off,all.length);
for(const [name,nums,n] of [
 ['p16-21_train',[16,17,18,19,20,21],1613],
 ['p40-53_holdout',Array.from({length:14},(_,i)=>i+40),3008],
 ['p0-2_holdout',[0,1,2],729],
 ['p54-55_holdout',[54,55],308],
 ['p55_terminal',[55],76],
 ]) {
  const vals=nums.flatMap(p=>perPage.get(p));
  assert.equal(vals.length,n);
  console.log(name+' n='+n+' IoC='+ioc(vals).toFixed(9)+
    ' GPfirst75='+vals.slice(0,75).map(i=>C.translit[i]).join(' '));
}
const p57=C.pages.find(p=>p.page===57).indices;
assert.equal(p57.length,95);
for(const n of [1613,3008]) {
  const original=Array.from({length:n},(_,i)=>p57[i%p57.length]);
  const encrypted=transform(original,'encrypt');
  assert.deepEqual(transform(encrypted,'decrypt'),original);
  console.log('Authentic p57 native GP planted '+n+'/'+n+' IoC='+ioc(original).toFixed(9));
}
console.log('Key='+key.toString('hex')+'; SHA256='+
  crypto.createHash('sha256').update(key).digest('hex'));
console.log('Original full book n='+all.length+' IoC='+ioc(dec).toFixed(9));
console.log('DECISION: source key candidate is exact; AES256-CTR-zero-IV is unselected. '+
  'Only promote if the original GP plaintext is coherent and heldout.');
