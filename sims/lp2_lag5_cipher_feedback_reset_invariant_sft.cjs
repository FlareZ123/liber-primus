'use strict';

/**
 * Source-frozen lag-five ciphertext-feedback state-reset test.
 * Candidate inverse: C[t] = P[t] + K[scope][t mod 5] + C[t-5] mod29.
 * At segment positions t < 5 ciphertext is an unrestricted IV.
 * Therefore D[t]=C[t]-C[t-5] is a rotation of P[t] in each phase.
 * Histograms' equality counts are independent of every unknown K.
 * Node22 CommonJS SFT.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {encodeSourceNativeGP}=require('./lp2_native_gp_source_orthography_sft.cjs');
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length).map(p=>p.indices);
const book=pages.flat();
assert.equal(pages.length,55);
assert.equal(book.length,12956);
const chapterLens=[729,1145,1729,1903,1021,1433,1680,3008,308];
const pageLens=pages.map(p=>p.length);
/** @param {number[]} s @param {number[]} lens */
function partition(s,lens){let pos=0;const parts=lens.map(n=>{const v=s.slice(pos,pos+n);pos+=n;return v});assert.equal(pos,s.length);return parts;}
const chapters=partition(book,chapterLens);
const src=read('resources/lp2-transcription.txt')
  .split('%').slice(0,55).join('%')
  .replace(/\/\r?\n/g,'').replace(/[\r\n%]/g,'');
const re=new RegExp('['+corpus.runes.join('')+']+','gu');
const charToIndex=new Map(corpus.runes.map((c,i)=>[c,i]));
const words=(src.match(re)||[]).map(s=>[...s].map(c=>charToIndex.get(c)));
assert.equal(words.length,2896);
assert.deepEqual(words.flat(),book);
const wordLens=words.map(w=>w.length);

/** @param {number[][]} groups @param {boolean} shared */
function invariant(groups,shared=false){
  let eligible=0,pairs=0,equals=0;
  const pooled=Array.from({length:5},()=>[]);
  /** @param {number[]} values */
  function count(values){
    pairs+=values.length*(values.length-1)/2;
    const hist=Array(29).fill(0);
    for(const v of values)hist[v]++;
    for(const n of hist)equals+=n*(n-1)/2;
  }
  for(const group of groups)for(let r=0;r<5;r++){
    const values=[];
    for(let t=5+r;t<group.length;t+=5)
      values.push((group[t]-group[t-5]+29)%29);
    eligible+=values.length;
    if(shared)pooled[r].push(...values);else count(values);
  }
  if(shared)pooled.forEach(count);
  return {eligible,pairs,equals,ioc:equals/pairs};
}

/** @param {number[][]} groups @param {boolean} shared */
function nativeCollisions(groups,shared=false){
  let pairs=0,equals=0;
  const pooled=Array.from({length:5},()=>[]);
  /** @param {number[]} values */
  function count(values){
    pairs+=values.length*(values.length-1)/2;
    const hist=Array(29).fill(0);
    for(const v of values)hist[v]++;
    for(const n of hist)equals+=n*(n-1)/2;
  }
  for(const group of groups)for(let r=0;r<5;r++){
    const values=[];
    for(let t=5+r;t<group.length;t+=5)values.push(group[t]);
    if(shared)pooled[r].push(...values);else count(values);
  }
  if(shared)pooled.forEach(count);
  return {pairs,equals};
}
const K=[2,3,5,7,11]; // fixed five prime values in plants only
/** @param {number[][]} groups */
function plant(groups){
  return groups.map(g=>{
    const c=g.slice();
    for(let t=5;t<g.length;t++)c[t]=(g[t]+K[t%5]+c[t-5])%29;
    for(let t=5;t<g.length;t++)
      assert.equal((c[t]-c[t-5]-K[t%5]+58)%29,g[t]);
    return c;
  });
}
const observed={
  chapters:invariant(chapters),
  pages:invariant(pages),
  wordShared:invariant(words,true),
  wordIndependent:invariant(words)
};
assert.deepEqual(observed.chapters,{
  eligible:12911,pairs:2332072,equals:80270,ioc:80270/2332072
});
assert.deepEqual(observed.pages,{
  eligible:12681,pairs:302016,equals:10401,ioc:10401/302016
});
assert.deepEqual(observed.wordShared,{
  eligible:2105,pairs:634908,equals:21817,ioc:21817/634908
});
assert.deepEqual(observed.wordIndependent,{
  eligible:2105,pairs:92,equals:6,ioc:6/92
});
const english=encodeSourceNativeGP(read('resources/control/shakespeare_first300k.txt'));
assert.equal(english.length,217106);
const windowCount=Math.floor(english.length/book.length);
assert.equal(windowCount,16);
const controls=[];
for(let i=0;i<windowCount;i++){
  const p=english.slice(i*book.length,(i+1)*book.length);
  const pchap=partition(p,chapterLens),ppage=partition(p,pageLens),pword=partition(p,wordLens);
  const cchap=plant(pchap),cpage=plant(ppage),cword=plant(pword);
  const cases=[
    [pchap,cchap,false,'chapters'],
    [ppage,cpage,false,'pages'],
    [pword,cword,true,'wordShared'],
    [pword,cword,false,'wordIndependent']
  ];
  const record={};
  for(const [plain,cipher,shared,label] of cases){
    const actual=invariant(cipher,shared);
    const expected=nativeCollisions(plain,shared);
    assert.equal(actual.pairs,expected.pairs);
    assert.equal(actual.equals,expected.equals);
    record[label]=actual.ioc;
  }
  controls.push(record);
}
const minima=Object.fromEntries(
  Object.keys(observed).map(k=>[k,Math.min(...controls.map(row=>row[k]))])
);
assert(minima.chapters>0.057 && minima.pages>0.057 &&
  minima.wordShared>0.056);
for(const k of ['chapters','pages','wordShared']){
  assert(observed[k].ioc<minima[k]);
  assert(observed[k].ioc<1/29+0.001);
}
console.log(JSON.stringify({
  source:'original LP2 p0-55, source-true nine visual chapters',
  candidate:'C[t]=P[t]+K[phase]+C[t-5] mod29',
  originalRunes:book.length,visualChapters:chapters.length,
  runePages:pages.length,printedWords:words.length,
  independentNativeGPControlWindows:windowCount,
  observed,controlMinimum: minima,
  wordIndependentKeyLimitation:'Only 92 original within-class comparison pairs and 10851 unconstrained first-five IV rune positions',
  exactPlantInversionsPassed:true,
  genuineUnknownPlaintextRecovered:false
},null,2));
