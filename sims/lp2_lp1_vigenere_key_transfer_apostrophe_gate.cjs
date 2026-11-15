'use strict';

// Transfer one exact, independently solved LP1 Vigenere key to four original
// LP2 apostrophe anchors. No key, phase, or plaintext is fitted.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');

const root=path.resolve(__dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const c=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const marks=JSON.parse(read('resources/liber-primus/lp2-quote-punctuation-spans.json'));
const keyText='FIRFUMFERENFE';
const key=[...keyText].map(ch=>c.translit.indexOf(ch));
const mod=x=>((x%29)+29)%29;
assert.equal(key.length,13);
assert.ok(key.every(x=>x>=0));

// Positive control: the exact original LP1 p14 known plaintext/ciphertext.
const lp1=read('resources/transcriptions/lp1_wulfic_canonical.txt').split('%')[12];
const solvedLP1=read('resources/liber-primus/lp1-plaintext-reference.txt');
const lp1At=lp1.indexOf('ᛁ-ᚱᚹᚾᛒ');
assert.ok(lp1At>=0);
assert.ok(solvedLP1.includes("I DON'T HAVE A VOICE IN MY HEAD"));
const runeIndex=new Map(c.runes.map((r,i)=>[r,i]));
const priorRunes=[...lp1.slice(0,lp1At)].filter(ch=>runeIndex.has(ch)).map(ch=>runeIndex.get(ch));
const priorF=priorRunes.filter(x=>x===0).length;
assert.equal(priorRunes.length,145);
assert.equal(priorF,2);
const controlCipher=[10,4,7,9,17]; // I-RWNB
const controlPlain=[10,23,3,9,16]; // I-DONT
const controlKey=controlCipher.map((x,i)=>mod(x-controlPlain[i]));
assert.deepEqual(controlKey,key.slice(0,5));
assert.equal(mod(priorRunes.length-priorF,key.length),0);

// Use only the 56 original unsolved physical pages. The known p56/p57 pages
// are not allowed to affect the book clock.
const pages=c.pages.filter(p=>p.page<=55);
const pageByNumber=new Map(pages.map(p=>[p.page,p]));
const prefix=new Map();
const flat=[];
for(const p of pages){prefix.set(p.page,flat.length);flat.push(...p.indices);}
assert.equal(flat.length,12956);
function countNonF(start,end){
  let n=0;
  for(let i=start;i<end;i++)if(flat[i]!==0)n++;
  return n;
}

// Original visual-chapter boundaries in the 12,956-rune p0-p55 register.
const chapterStarts=[0,729,1874,3603,5506,6527,7960,9640,12648];
assert.equal(chapterStarts.length,9);
assert.equal(chapterStarts[0],0);
assert.ok(chapterStarts.every((x,i)=>x>=0&&x<flat.length&&(i===0||x>chapterStarts[i-1])));
function chapterStart(global){return chapterStarts.filter(x=>x<=global).at(-1);}

const sites=marks.source_visible_apostrophes;
assert.deepEqual(sites.map(s=>[s.page,s.local_before_rune,s.stem_runes,s.tail_runes,s.cipher_word]),[
  [4,164,3,1,"MXI'W"],
  [21,36,2,1,"AEO'Y"],
  [35,80,2,1,"PE'T"],
  [41,218,3,1,"XLJ'C"],
]);
const clocks=['book','page','chapter','word'];
const candidateWords={
  3:['ITS','HES','WED','HED','ITD','DOS'],
  4:['DONT','CANT','WONT','AINT','ISNT','LETS','GODS','ONES','MANS','MENS','SHES','YOUD']
};
const singleLetterIndex=new Map(c.translit.map((s,i)=>[s,i]).filter(([s])=>s.length===1));
function candidateIndices(word){
  return [...word].map(ch=>singleLetterIndex.get(ch));
}
const output=[];
for(const clock of clocks){
  for(const site of sites){
    const page=pageByNumber.get(site.page);
    assert.ok(page);
    const wordStart=site.local_before_rune-site.stem_runes;
    const wordLength=site.stem_runes+site.tail_runes;
    const cipher=page.indices.slice(wordStart,wordStart+wordLength);
    assert.equal(cipher.length,wordLength);
    const roman=cipher.map(x=>c.translit[x]);
    const sourceLabel=roman.slice(0,site.stem_runes).join('')+"'"+roman.slice(site.stem_runes).join('');
    assert.equal(sourceLabel,site.cipher_word,'original word/rune transcription mismatch');
    const globalStart=prefix.get(site.page)+wordStart;
    const initialCount=clock==='book'?countNonF(0,globalStart):
      clock==='page'?countNonF(prefix.get(site.page),globalStart):
      clock==='chapter'?countNonF(chapterStart(globalStart),globalStart):0;
    let phase=initialCount%key.length;
    const phaseAtWord=phase;
    const plain=[];
    for(const x of cipher){
      if(x===0){plain.push(0);continue;} // Authentic transparent-F bypass.
      plain.push(mod(x-key[phase]));
      phase=(phase+1)%key.length;
    }
    const candidates=(candidateWords[wordLength]||[]).filter(w=>{
      const v=candidateIndices(w);
      return v.length===plain.length&&v.every((x,i)=>x===plain[i]);
    });
    const plainRoman=plain.map(x=>c.translit[x]);
    output.push({
      clock,page:site.page,word:site.cipher_word,globalStart,
      keyPhase:phaseAtWord,cipherIndices:cipher,plainIndices:plain,
      plaintextRunes:plainRoman.join(' '),plaintextRomanization:plainRoman.join(''),
      apostropheAfterRune:site.stem_runes,candidateContractionMatches:candidates
    });
  }
}
assert.equal(output.length,16);
assert.equal(output.filter(x=>x.candidateContractionMatches.length>0).length,0);
console.log(JSON.stringify({
  test:'Transfer authentic solved LP1 p14 Vigenere key to four source-visible LP2 apostrophe anchors',
  LP1_positive_control:{
    key:keyText,keyIndices:key,sourceCipher:'I-RWNB',knownPlaintext:"I DON'T",
    firstFiveKeySymbols:controlKey,precedingRunes:priorRunes.length,
    precedingLiteralFBypasses:priorF,phaseAtKnownWord:(145-priorF)%13,
    apostropheConsumesKeyPosition:false
  },
  LP2_input:{originalPages:56,originalRunes:flat.length,sourceAnchors:sites.length},
  keyClockPolicies:clocks,
  transparentCipherFBypass:true,
  exactCandidateContractions:candidateWords,
  tests:output.length,
  candidateMatches:0,
  output,
  decision:'NO_LP1_KEY_TRANSFER_MATCH_AT_ANY_OF_THE_FOUR_LP2_APOSTROPHE_ANCHORS_OR_TESTED_CLOCKS',
  limitation:'The key is authenticated for LP1 p14 only. This finite transfer test does not exclude a different LP2 key, different reset policy, or unrelated cipher.'
},null,2));
