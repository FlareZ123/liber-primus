'use strict';
/**
 * SFT: original LP2 p28 55 multi-rune words -> one-exterior-shed p33
 * matched-length register; optionally preserve original Q cubic quotient.
 *
 * Entire book original 55-page length census, genuine source word breaks,
 * exact GF29 Q remainders, source-visible one-edge-per-long-word geometry,
 * eight frozen simple Vigenere consumptions, solved p57 planted positives.
 * No retuned pad, phase search, language filter or file writes.
 * Windows 11 Node.js 22 / CommonJS.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
/** @param {string} name @returns {string} */
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const book=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const segments=read('resources/liber-primus/lp2-transcription.txt').split('%');
const map=new Map(book.runes.map((r,i)=>[r,i]));
/** @param {number} x @returns {number} */
const mod=x=>(x%29+29)%29;
/** @param {number} physicalPage @returns {number[][]} */
function printedWords(physicalPage) {
  const result=[];
  let word=[];
  for(const ch of segments[physicalPage<50?physicalPage:physicalPage-1]) {
    if(map.has(ch))word.push(map.get(ch));
    else if(ch!=='/'&&!/\s/u.test(ch)) {
      if(word.length){result.push(word);word=[];}
    }
  }
  if(word.length)result.push(word);
  return result;
}
/** @param {number[]} p @returns {number} */
function ioc(p) {
  const h=Array(29).fill(0);
  for(const x of p)h[x]++;
  return h.reduce((s,v)=>s+v*(v-1),0)/(p.length*(p.length-1));
}
/** @param {number[]} x @param {number[]} y @returns {number[]} */
function add(x,y) {
  assert.equal(x.length,y.length);
  return x.map((v,i)=>mod(v+y[i]));
}
/** @param {number[]} x @param {number[]} y @returns {number[]} */
function subtract(x,y) {
  assert.equal(x.length,y.length);
  return x.map((v,i)=>mod(v-y[i]));
}
/** @param {number[][]} w @param {'first'|'last'} side @returns {number[]} */
function shed(w,side) {
  return w.flatMap(word=>word.length<2?word:
    side==='first'?word.slice(1):word.slice(0,-1));
}
const Q=[15,18,12,6];
/**
 * @param {number[]} text high-degree-first
 * @returns {{q:number[],r:number[]}}
 */
function quotient(text) {
  const rem=text.slice(), q=[];
  for(let i=0;i<text.length-Q.length+1;i++) {
    const coeff=mod(rem[i]*2); // inverse of leading15 in GF29
    q.push(coeff);
    for(let j=0;j<4;j++)rem[i+j]=mod(rem[i+j]-coeff*Q[j]);
  }
  return {q,r:rem.slice(-3)};
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function product(a,b) {
  const out=Array(a.length+b.length-1).fill(0);
  for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)
    out[i+j]=mod(out[i+j]+a[i]*b[j]);
  return out;
}
/** @param {number[]} q @param {number[]} r @returns {number[]} */
function restore(q,r) {
  const a=product(q,Q);
  for(let i=0;i<3;i++)a[a.length-3+i]=mod(a[a.length-3+i]+r[i]);
  return a;
}
/** @param {number[]} q @param {number[]} printedLengths @returns {number[][]} */
function repacket(q,printedLengths) {
  const result=[];
  let offset=0;
  for(const length of printedLengths) {
    result.push(q.slice(offset,offset+length));
    offset+=length;
  }
  assert.equal(offset,q.length);
  return result;
}
function main() {
  const original=book.pages.filter(p=>p.page<=55&&p.indices.length);
  assert.equal(original.length,55);
  const stats=original.map(p=>{
    const words=printedWords(p.page);
    assert.deepEqual(words.flat(),p.indices);
    return {page:p.page,n:p.indices.length,words:words.length,
      multi:words.filter(w=>w.length>1).length,
      single:words.filter(w=>w.length===1).length,
      retained:p.indices.length-words.filter(w=>w.length>1).length};
  });
  const lengthMatches=stats.flatMap(a=>stats.filter(b=>
    a.page!==b.page&&a.retained===b.n).map(b=>[a.page,b.page]));
  assert.deepEqual(lengthMatches,[
    [7,15],[9,23],[13,33],[25,3],[28,33],
    [29,7],[44,3],[47,3]
  ]);
  const p28=printedWords(28),p33=book.pages[33].indices;
  const n28=stats.find(x=>x.page===28),n33=stats.find(x=>x.page===33);
  assert.deepEqual([n28.n,n28.words,n28.multi,n28.single,n28.retained,n33.n],
    [269,59,55,4,214,214]);
  const [Q28,Q33]=[quotient(book.pages[28].indices),quotient(p33)];
  assert.deepEqual(Q28.r,[17,27,12]);
  assert.deepEqual(Q33.r,Q28.r);
  assert.deepEqual([Q28.q.length,Q33.q.length],[266,211]);
  assert.deepEqual(restore(Q28.q,Q28.r),book.pages[28].indices);
  assert.deepEqual(restore(Q33.q,Q33.r),p33);
  const lengths=p28.map(w=>w.length);
  assert.equal(lengths.at(-1),8);
  lengths[lengths.length-1]-=3; // polynomial remainder occupies last3 printed runes
  assert.equal(lengths.filter(x=>x>1).length,55);
  const q28Words=repacket(Q28.q,lengths);
  assert.equal(shed(q28Words,'first').length,211);
  assert.equal(shed(q28Words,'last').length,211);
  const solved=book.pages[57].indices;
  assert.equal(solved.length,95);
  const cases=[];
  for(const [register,source,cipher] of [
    ['original',p28,p33],['GF29-Q-quotient',q28Words,Q33.q]
  ]) {
    for(const edge of ['first','last']) {
      const key=shed(source,edge);
      assert.equal(key.length,cipher.length);
      const match=key.filter((x,i)=>x===cipher[i]).length;
      for(const sign of [-1,1]) {
        const plain=cipher.map((x,i)=>mod(x+sign*key[i]));
        const round=plain.map((x,i)=>mod(x-sign*key[i]));
        assert.deepEqual(round,cipher);
        const planted=Array.from({length:key.length},(_,i)=>solved[i%solved.length]);
        const encrypted=add(planted,key);
        assert.deepEqual(subtract(encrypted,key),planted);
        cases.push({
          register,edge,sign,n:plain.length,
          samePositions:match,originalPlainIoC:ioc(plain),
          originalPlainPrefix:plain.slice(0,65)
            .map(x=>book.translit[x]).join('')
        });
      }
    }
  }
  assert.equal(cases.length,8);
  assert(cases.every(x=>x.originalPlainIoC<0.04));
  console.log(JSON.stringify({
    originalBookRunePages:55,
    originalOneExteriorLengthMatchPairs:lengthMatches,
    novelPair:[28,33],p28:n28,p33:n33,
    sharedQ:[17,27,12],
    exactOriginalQReplays:true,
    originalAndQSourceLengths:[[269,214],[266,211]],
    originalP57NativePlant:95,
    vigenereConsumers:cases,
    verdict:'Exact 55-edge original word geometry is new provisional source alignment; no real p33 plaintext under these eight fixed classic direct inverse choices, and no original clue names edge side/operation.'
  },null,2));
}
if(require.main===module)main();
module.exports={main};
