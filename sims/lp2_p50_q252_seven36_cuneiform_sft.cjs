'use strict';

/**
 * Source-bound Q252 -> seven 36-token cuneiform key hypothesis.
 * Reads unchanged original LP2 rune ciphertext and original printed base60 table.
 * Each variant is algebraically invertible; F-transparent paths are checked
 * with an exact dynamic state set, including optional non-F encodings of C=F.
 * Running: node sims/lp2_p50_q252_seven36_cuneiform_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const json = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const book = json('resources/liber-primus/lp2-corpus.json');
const table = json('resources/liber-primus/lp2-grid-256.json');
const mod = x => ((x % 29) + 29) % 29;
const inv = x => {
  for(let i=1;i<29;i++) if(mod(i*x)===1)return i;
  throw new Error('nonunit polynomial leading coefficient');
};

/** @param {number[]} h @param {number[]} g */
function multiplyAsc(h,g){
  const out=Array(h.length+g.length-1).fill(0);
  for(let i=0;i<h.length;i++)for(let j=0;j<g.length;j++)out[i+j]=mod(out[i+j]+h[i]*g[j]);
  return out;
}

/** Divide all original p50 coefficients in first-cell-highest order, mod29. */
function quotient(){
  assert.equal(table.bytes.length,256);
  const h=[3,26,24],g=[27,5,15];
  const factor=multiplyAsc(h,g).reverse();
  assert.deepEqual(factor,[12,17,11,21,23]);
  const rem=table.bytes.map(mod);
  const out=[];
  const firstInv=inv(factor[0]);
  for(let i=0;i<252;i++){
    const x=mod(rem[i]*firstInv);
    out.push(x);
    for(let j=0;j<factor.length;j++)rem[i+j]=mod(rem[i+j]-x*factor[j]);
  }
  assert(rem.every(x=>x===0), 'two original-source factors must divide p50');
  assert.deepEqual(out.slice(0,10),[0,12,9,28,2,25,23,21,18,28]);
  return out;
}
/** @param {number[]} stream */
function ioc(stream){
  const counts=Array(29).fill(0);
  for(const x of stream) counts[x]++;
  return counts.reduce((sum,n)=>sum+n*(n-1),0)/(stream.length*(stream.length-1));
}
/** Total within-source-page IoC: no page-boundary pairs. */
function pageIoc(pages){
  let numerator=0,denominator=0;
  for(const page of pages){
    const counts=Array(29).fill(0);
    for(const x of page)counts[x]++;
    numerator+=counts.reduce((sum,n)=>sum+n*(n-1),0);
    denominator+=page.length*(page.length-1);
  }
  return numerator/denominator;
}

/**
 * Exact original-cipher F-transparent legal-state DP.
 * Plain F=0 emits cipher F=0 without consuming a key.
 * Non-F plaintext always consumes one of the 36 source key symbols.
 * Cipher F can originate from either legal branch.
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} inverseSign P=C+inverseSign*K
 */
function inverseLegal(cipher,key,inverseSign){
  let clocks=new Set([0]);
  for(let i=0;i<cipher.length;i++){
    const next=new Set();
    for(const clock of clocks){
      const p=mod(cipher[i]+inverseSign*key[clock%36]);
      if(p!==0)next.add(clock+1);
      if(cipher[i]===0)next.add(clock);
    }
    clocks=next;
    if(!clocks.size)return {firstImpossibleOffset:i,endClocks:0};
  }
  return {firstImpossibleOffset:-1,endClocks:clocks.size};
}
/** Authentic inverse positive: encrypt solved GP plaintext under same key. */
function encryptFtransparent(plain,key,inverseSign){
  let clock=0;
  return plain.map(p=>{
    if(p===0)return 0;
    const c=mod(p-inverseSign*key[clock%36]);
    clock++;
    return c;
  });
}

const q=quotient();
const cuneiform=book.pages.slice(33,40).map(p=>p.indices);
assert.deepEqual(cuneiform.map(x=>x.length),[214,261,271,238,228,228,240]);
assert.equal(book.pages[50].indices.length,0);
assert.equal(book.pages[57].indices.length,95);

const expected={
  'rows:-1':[1,111,9,50,15,20,22],
  'rows:1':[64,80,24,10,0,51,31],
  'columns:-1':[69,9,13,29,2,24,2],
  'columns:1':[2,5,118,33,23,5,67]
};
const all=[];
for(const orientation of ['rows','columns']){
  const keys=Array.from({length:7},(_,r)=>Array.from({length:36},(_,c)=>
    orientation==='rows'?q[r*36+c]:q[c*7+r]));
  for(const inverseSign of [-1,1]){
    const inverted=cuneiform.map((cipher,i)=>cipher.map((v,j)=>mod(v+inverseSign*keys[i][j%36])));
    const firstImpossible=cuneiform.map((cipher,i)=>inverseLegal(cipher,keys[i],inverseSign).firstImpossibleOffset);
    assert.deepEqual(firstImpossible,expected[orientation+':'+inverseSign]);
    assert(inverted.every((p,i)=>p.every((v,j)=>
      mod(v-inverseSign*keys[i][j%36])===cuneiform[i][j])));
    assert(inverted.every(p=>ioc(p)<0.045),'all seven real page IoCs must remain nonprose');
    const solved=book.pages[57].indices;
    for(let i=0;i<7;i++){
      const planted=encryptFtransparent(solved,keys[i],inverseSign);
      const legal=inverseLegal(planted,keys[i],inverseSign);
      assert.equal(legal.firstImpossibleOffset,-1,'native solved text must be mechanically valid');
      assert(legal.endClocks>0);
    }
    all.push({orientation,inverseSign,sourceRuneCount:inverted.flat().length,
      sourcePageIoc:Number(pageIoc(cuneiform).toFixed(12)),
      inversePageIoc:Number(pageIoc(inverted).toFixed(12)),
      firstImpossibleOffset:firstImpossible,
      plantedSolvedGP:7,allOriginalPagesLegallyInvertible:false});
  }
}
assert.equal(all.length,4);
console.log(JSON.stringify({status:'bounded negative; no unknown plaintext',factor:'H(X)G(X)',quotientCount:q.length,quotientPrefix:q.slice(0,16),originalPageLengths:cuneiform.map(x=>x.length),cases:all},null,2));
