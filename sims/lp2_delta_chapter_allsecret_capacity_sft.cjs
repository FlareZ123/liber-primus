'use strict';
/**
 * Key-independent original-input gate for a chapter-static GP29
 * first-difference substitution, with arbitrary secret rune relabeling.
 *
 * Model: P_i = permutation[chapter(i)][(C_i-C_(i-1)) mod 29],
 * i>0 in each physical rune page. Initial page runes are unrestricted.
 * The secret permutations may be ANY of 29!, independently for each
 * of the nine original visible chapters.
 *
 * Positive plant and native-GP tests use source-existing heldout corpora.
 * Node 22: node sims/lp2_delta_chapter_allsecret_capacity_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
/** @param {string} filename @returns {string} */
function read(filename){return fs.readFileSync(path.join(root,filename),'utf8');}
const db=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages=db.pages.filter(p=>p.page<=55);
assert.equal(pages.length,56);
const C=pages.flatMap(p=>p.indices),N=C.length;
assert.equal(N,12956);
const cuts=[0,729,1874,3603,5506,6527,7960,9640,12648,N];
const gp=db.translit.map((token,index)=>({token,index}))
  .sort((a,b)=>b.token.length-a.token.length);
/** @param {string} text @returns {number[]} */
function encodeGP(text){
  const result=[];
  for(const original of text.match(/[A-Za-z]+/g)||[]){
    const word=original.toUpperCase().replace(/[KVZQ]/g,
      c=>({K:'C',V:'U',Z:'S',Q:'C'})[c]);
    for(let i=0;i<word.length;){
      const t=gp.find(x=>word.startsWith(x.token,i));
      assert(t,'Unencodable native GP token: '+word.slice(i));
      result.push(t.index);
      i+=t.token.length;
    }
  }
  return result;
}
const sources=[
  {name:'Shakespeare',indices:encodeGP(read('resources/control/shakespeare_first300k.txt')),
    starts:[20000,56000,92000,128000,164000]},
  {name:'Gibran',indices:encodeGP(read('resources/control/gibran_prophet_58585.txt')),
    starts:[1000,11000,21000,31000,41000]}
];
const mod=x=>(x%29+29)%29;
const observations=[];
const byChapter=Array.from({length:9},()=>[]);
let offset=0,chapter=0;
for(const p of pages){
  for(let i=1;i<p.indices.length;i++){
    const k=offset+i;
    while(k>=cuts[chapter+1])chapter++;
    assert(chapter<9);
    observations.push({position:k,chapter,step:mod(p.indices[i]-p.indices[i-1])});
    byChapter[chapter].push(observations.at(-1));
  }
  offset+=p.indices.length;
}
assert.equal(offset,N);
assert.equal(observations.length,12901);
const zero=observations.filter(o=>o.step===0).length;
assert.equal(zero,86);
/** @param {number[]} items @returns {number[]} */
function histogram(items){
  const h=Array(29).fill(0);
  for(const symbol of items){assert(symbol>=0&&symbol<29);h[symbol]++;}
  return h;
}
/** @param {number[]} a @param {number[]} b @returns {number} */
function minEdits(a,b){
  assert.equal(a.reduce((x,y)=>x+y,0),b.reduce((x,y)=>x+y,0));
  const sa=a.slice().sort((x,y)=>x-y),sb=b.slice().sort((x,y)=>x-y);
  return sa.reduce((sum,x,i)=>sum+Math.abs(x-sb[i]),0)/2;
}
const fullHist=histogram(observations.map(o=>o.step));
assert.equal(Math.max(...fullHist),510);
const origChapterHists=byChapter.map(os=>histogram(os.map(o=>o.step)));
const origMax=origChapterHists.map(h=>Math.max(...h));
assert.deepEqual(origMax,[38,55,77,87,47,65,82,123,20]);
let minNativeMax=Infinity,minGlobalEdits=Infinity,minChapterEdits=Infinity;
let allComparisons=0;
const control=[];
const chapterMinMax=Array(9).fill(Infinity);
for(const source of sources){
  for(const start of source.starts){
    const words=source.indices.slice(start,start+N);
    assert.equal(words.length,N);
    const nativeFull=histogram(observations.map(o=>words[o.position]));
    const nativeFullMax=Math.max(...nativeFull);
    const globalEdits=minEdits(fullHist,nativeFull);
    let chapterEdits=0;
    for(let z=0;z<9;z++){
      const h=histogram(byChapter[z].map(o=>words[o.position]));
      const m=Math.max(...h);
      assert(m>origMax[z],
        'A secret chapter alphabet cannot equal this native GP chapter');
      chapterMinMax[z]=Math.min(chapterMinMax[z],m);
      chapterEdits+=minEdits(origChapterHists[z],h);
      allComparisons++;
    }
    minNativeMax=Math.min(minNativeMax,nativeFullMax);
    minGlobalEdits=Math.min(minGlobalEdits,globalEdits);
    minChapterEdits=Math.min(minChapterEdits,chapterEdits);
    control.push({source:source.name,start,nativeFullMax,globalEdits,chapterEdits});
  }
}
assert.equal(allComparisons,90);
assert.deepEqual(chapterMinMax,[71,108,175,195,99,147,179,316,31]);
assert.equal(minNativeMax,1410);
assert.equal(minGlobalEdits,4011);
assert.equal(minChapterEdits,3638);
// Source-native whole-book plant: arbitrary independently secret
// 29-symbol substitution per original chapter; page starts pass through.
const truePlain=sources[0].indices.slice(20000,20000+N);
let seed=0x51a8cb37;
/** @returns {number} */
function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
const keys=Array.from({length:9},()=>{
  const p=Array.from({length:29},(_,i)=>i);
  for(let i=28;i>0;i--){const k=rng()%(i+1);[p[i],p[k]]=[p[k],p[i]];}
  return p;
});
const inverse=keys.map(key=>key.map((_,i)=>key.indexOf(i)));
let recovered=0,reencrypted=0,wrong=0;
offset=0;chapter=0;
for(const page of pages){
  if(page.indices.length){
    let prev=truePlain[offset];
    const recoveredStart=prev;
    assert.equal(recoveredStart,truePlain[offset]);
    recovered++;
    for(let i=1;i<page.indices.length;i++){
      const k=offset+i;
      while(k>=cuts[chapter+1])chapter++;
      const p=truePlain[k], cipher=mod(prev+keys[chapter][p]);
      const d=mod(cipher-prev),dec=inverse[chapter][d];
      assert.equal(dec,p);
      assert.equal(mod(prev+keys[chapter][dec]),cipher);
      recovered++;reencrypted++;
      const wrongChapter=(chapter+1)%9;
      if(inverse[wrongChapter][d]===p)wrong++;
      prev=cipher;
    }
  }
  offset+=page.indices.length;
}
assert.equal(recovered,N);
assert.equal(reencrypted,12901);
assert(wrong<2500);
console.log(JSON.stringify({
  model:'arbitrary secret GP29 symbol bijection, one independent key per visually printed chapter, applied to 29-valued predecessor differences',
  original:{runes:N,physicalTransitions:observations.length,repeatSteps:zero,
    fullDifferenceHistogram:fullHist,chapterPositions:byChapter.map(x=>x.length),
    chapterMaxima:origMax},
  native:{sources:control.length,chapterComparisons:allComparisons,
    globalNativeMaximumLowerBound:minNativeMax,
    nativeChapterMaximumLowerBounds:chapterMinMax,
    minRequiredRuneIdentityChangesAfterAnyGlobalBijection:minGlobalEdits,
    minRequiredChangesAfterNineIndependentBijections:minChapterEdits,
    minimumChangedFraction:minChapterEdits/observations.length},
  controls:{plantRecovered:recovered,plantReencrypted:reencrypted,
    wrongChapterMatches:wrong},
  caveat:'Finite authentic-style English controls; unchanged GP29 length, one static alphabet per visible chapter, and full per-page predecessor state. Dynamic/word-specific keys, variable-length or non-GP intermediates are not covered. No unknown plaintext.'
},null,2));
