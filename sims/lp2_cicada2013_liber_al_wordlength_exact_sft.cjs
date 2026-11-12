'use strict';

/**
 * Complete fixed-source Liber AL vel Legis GP-rune word-length crib gate.
 * The Book of the Law was explicitly selected by Cicada 2013 for a book
 * cipher; source byte-exact static word-length vectors are preserved in
 * resources/derived instead of relying on live web download at test time.
 *
 * Refines the previous four-corpus crib screen with a distinct, historically
 * explicit key source; this script never fits a rune key or plaintext.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {parseSharedCorpus,physicalLP2Page}=require('./lp2_word_pages.cjs');

const root=path.join(__dirname,'..');
const sources=JSON.parse(fs.readFileSync(path.join(root,'resources','derived','cicada2013_liber_al_wordlengths.json'),'utf8'));
const orig=parseSharedCorpus();
assert.equal(orig.words.length,2896);
assert.equal(orig.runeCount,12956);
const current=orig.words.map(word=>word.length);
const K=8;

/** @param {number[]} words @param {number} i */
function token(words,i){return words.slice(i,i+K).join(',');}
/**
 * @param {number[]} manuscript
 * @param {number[]} source
 */
function compare(manuscript,source) {
  const index=new Map();
  for(let i=0;i<=manuscript.length-K;i++){
    const word=token(manuscript,i);
    if(!index.has(word))index.set(word,[]);
    index.get(word).push(i);
  }
  const visited=new Set(),candidates=[];
  for(let j=0;j<=source.length-K;j++){
    for(const a of index.get(token(source,j))||[]){
      let i=a,h=j,n=K;
      while(i>0&&h>0&&manuscript[i-1]===source[h-1]){
        i--;h--;n++;
      }
      while(i+n<manuscript.length&&h+n<source.length&&
        manuscript[i+n]===source[h+n])n++;
      const id=i+':'+h;
      if(!visited.has(id)){
        visited.add(id);
        candidates.push({manuscriptWord:i,sourceWord:h,words:n,
          physicalPage:physicalLP2Page(orig.words[i].startPage)});
      }
    }
  }
  return candidates.sort((a,b)=>b.words-a.words||a.manuscriptWord-b.manuscriptWord);
}
const result=[];
for(const source of sources.sources){
  assert.ok(source.gitBlobSha&&source.source.startsWith('https://github.com/'));
  assert.equal(source.latinWordLengths.length,source.sourceWordCount);
  assert.equal(source.gpWordLengths.length,source.sourceWordCount);
  for(const [mode,lens] of [
    ['Latin uncontracted',source.latinWordLengths],
    ['GP rune greedy contracting ING TH NG EO OE AE IA EA',source.gpWordLengths]
  ]){
    const matches=compare(current,lens);
    const expectedMax=source.label==='authentic-2013-archive-chapter1'?0:8;
    assert.equal(matches[0]?.words||0,expectedMax,source.label+': '+mode);
    assert.ok(!matches.some(candidate=>candidate.words>=12));
    // The exact same word-length index/extend search must find a 16-word
    // source passage placed amid all the unchanged manuscript word lengths.
    const planted=current.slice();
    for(let i=0;i<16;i++)planted[1000+i]=lens[250+i];
    assert.ok(compare(planted,lens).some(candidate=>candidate.manuscriptWord===1000
      &&candidate.sourceWord===250&&candidate.words>=16));
    result.push({source:source.label,mode,sourceWords:lens.length,
      longestSourceExactWords:matches[0]?.words||0,
      originalCandidatesAtLeast12:matches.filter(x=>x.words>=12).length,
      topExactSourceLocation:matches.slice(0,5),planted16Recovered:true});
  }
}
console.log(JSON.stringify({
  status:'No 12+-word original LP2 quotation matching Cicada-2013 original Crowley book code',
  manuscriptWords:orig.words.length,manuscriptRunes:orig.runeCount,
  2013Source:'first chapter preserved in the original 2013 Cicada archive',
  control:'16 consecutive GP/LATIN word lengths implanted at fixed original LP2 word index1000',
  results:result,
  limitations:'Does not exclude fresh authored text, a short <=8-word quotation, different orthography, or punctuation/word-boundary changes; no cipher plaintext or key recovered'
},null,2));
