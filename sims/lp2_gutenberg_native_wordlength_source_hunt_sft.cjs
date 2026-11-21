'use strict';

/**
 * Source-text recovery attempt, without inventing ciphertext plaintext/key.
 * Compare the untouched 2,896 original LP2 rune-word lengths to public-domain
 * historical works under the same GP29 orthography. A 15+ consecutive-word
 * native-length match can nominate an independently checkable quotation crib.
 *
 * This goes beyond the eleven previously scanned local source corpora.
 * Network input is restricted to Project Gutenberg public-domain plain texts.
 * No bytes are written. Original source URL and fetched SHA-256 are logged.
 *
 * Windows Node.js 22: node sims/lp2_gutenberg_native_wordlength_source_hunt_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const text = fs.readFileSync(path.join(ROOT,
  'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const runeSet = new Set(corpus.runes);
const sections = text.split('%');
assert.equal(sections.length, 57);

/** @param {string} source @returns {string[]} */
function getRuneWords(source) {
  const words = [];
  let word = '';
  function finish() {
    if (word) words.push(word);
    word = '';
  }
  for (const character of source) {
    if (runeSet.has(character)) word += character;
    else if (character === '/' || character === '%' || /\s/u.test(character)) continue;
    else finish();
  }
  finish();
  return words;
}

const unknownWords = getRuneWords(sections.slice(0, 55).join('%'));
const unknown = unknownWords.map(w => [...w].length);
assert.equal(unknownWords.length, 2896);
assert.equal(unknown.reduce((a,b) => a+b,0), 12956);

/** @param {string} word @returns {number} */
function gpLength(word) {
  const s = word.toUpperCase().replace(/V/g,'U')
    .replace(/K/g,'C').replace(/Q/g,'C').replace(/Z/g,'S');
  let result = 0;
  const compounds = new Set(['TH','EO','NG','OE','AE','IA','EA']);
  for (let i=0; i<s.length;) {
    if (s.slice(i,i+3) === 'ING') i+=3;
    else if (compounds.has(s.slice(i,i+2))) i+=2;
    else i++;
    result++;
  }
  return result;
}
/** @param {string[]} words @returns {number[]} */
const lengths = words => words.map(gpLength);
const solvedP57Words = getRuneWords(sections[56]);
const solvedEnglish = 'PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE '+
  'WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE';
assert.equal(solvedP57Words.length,20);
assert.deepEqual(solvedP57Words.map(w=>[...w].length), lengths(solvedEnglish.split(' ')));

// A planted native 20-word solved-page control must be recovered exactly
// even when placed inside the original ciphertext word-length target.
const planted = unknown.slice();
planted.splice(317,20,...lengths(solvedEnglish.split(' ')));

/**
 * @param {number[]} target
 * @param {number[]} source
 * @param {string[]} words
 * @param {number} width
 * @returns {{windows:number, top:object[]}}
 */
function compare(target, source, words, width) {
  const index = new Map();
  for (let i=0;i+width<=target.length;i++) {
    const key = target.slice(i,i+width).join(',');
    const hit = index.get(key);
    if (hit) hit.push(i);
    else index.set(key,[i]);
  }
  const found=[];
  let windows=0;
  for (let j=0;j+width<=source.length;j++) {
    const slots=index.get(source.slice(j,j+width).join(','));
    if (!slots) continue;
    for (const i of slots) {
      windows++;
      let startI=i, startJ=j, end=width;
      while (startI>0 && startJ>0 && target[startI-1]===source[startJ-1]) {
        startI--; startJ--;
      }
      while (i+end<target.length && j+end<source.length &&
        target[i+end]===source[j+end]) end++;
      const length=(i-startI)+end;
      if (length>=12) found.push({
        targetWord:startI, sourceWord:startJ, length,
        excerpt:words.slice(startJ,startJ+Math.min(length,30)).join(' ')
      });
    }
  }
  const unique=new Map();
  for (const hit of found) {
    const key=hit.targetWord+':'+hit.sourceWord+':'+hit.length;
    if (!unique.has(key)) unique.set(key,hit);
  }
  return {windows,top:[...unique.values()].sort((a,b)=>b.length-a.length).slice(0,12)};
}

const p57Words=solvedEnglish.split(' ');
const plantedTest=compare(planted,lengths(p57Words),p57Words,9);
assert(plantedTest.top.some(x=>x.length===20 && x.targetWord===317));

const BOOKS = [
  [10,'KJV Bible'],
  [1998,'Thus Spake Zarathustra'],
  [1322,'Leaves of Grass'],
  [2680,'Meditations of Marcus Aurelius'],
  [131,'The Pilgrims Progress'],
  [2701,'Moby Dick'],
  [26,'Paradise Lost'],
  [1497,'Platos Republic'],
  [216,'Tao Te Ching'],
  [2388,'Bhagavad Gita'],
  [2017,'The Dhammapada'],
  [205,'Walden'],
  [71,'Civil Disobedience'],
  [14209,'The Kybalion'],
  [4363,'Beyond Good and Evil'],
  [2500,'Siddhartha'],
  [1727,'Odyssey'],
  [1934,'Blake Songs of Innocence'],
  [98,'Tale of Two Cities'],
  [174,'The Picture of Dorian Gray'],
  [84,'Frankenstein'],
  [5200,'The Metamorphosis'],
  [1080,'A Modest Proposal'],
  [100,'Complete Shakespeare'],
  [829,'Gullivers Travels'],
  [1661,'Sherlock Holmes'],
  [55,'Wizard of Oz'],
  [3600,'Essays of Montaigne'],
  [120,'Treasure Island'],
  [1184,'Count of Monte Cristo']
];

function mainBody(source) {
  const start=/\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\r\n]*\*\*\*/i.exec(source);
  if (start) source=source.slice(start.index+start[0].length);
  const end=/\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK/i.exec(source);
  if (end) source=source.slice(0,end.index);
  return source;
}

/** @param {number} id @param {string} name */
async function fetchBook(id,name) {
  const url='https://www.gutenberg.org/cache/epub/'+id+'/pg'+id+'.txt';
  const response=await fetch(url,{signal:AbortSignal.timeout(35000)});
  if (!response.ok) throw new Error('HTTP '+response.status);
  const raw=await response.text();
  const sha=crypto.createHash('sha256').update(raw,'utf8').digest('hex');
  const words=mainBody(raw).match(/[A-Za-z]+/g)||[];
  const output=compare(unknown,lengths(words),words,9);
  return {
    id,name,url,sha256:sha,sourceWords:words.length,
    matchingNineWordWindows:output.windows,
    topExactLengthMatches:output.top
  };
}

async function main() {
  console.log('PLANTED_CONTROL '+JSON.stringify(plantedTest));
  console.log('UNKNOWN_SOURCE '+JSON.stringify({pages:55,words:unknown.length,runes:12956,
    originalWordLengthSha256:crypto.createHash('sha256').update(unknown.join(',')).digest('hex')}));
  const completed=[],failed=[];
  const pending=BOOKS.slice();
  const runners=Array.from({length:4},async()=>{
    while(pending.length){
      const [id,name]=pending.shift();
      try {
        const hit=await fetchBook(id,name);
        completed.push(hit);
        console.log('SOURCE '+JSON.stringify(hit));
      } catch(error) {
        const failedBook={id,name,reason:String(error.message||error)};
        failed.push(failedBook);
        console.log('UNAVAILABLE '+JSON.stringify(failedBook));
      }
    }
  });
  await Promise.all(runners);
  const matches=completed.flatMap(b=>b.topExactLengthMatches.map(m=>({
    source:b.name,sourceId:b.id,sha256:b.sha256,...m
  }))).sort((a,b)=>b.length-a.length);
  console.log('TOP_CANDIDATES '+JSON.stringify(matches.slice(0,30)));
  console.log('RESULT '+JSON.stringify({
    status:'PASS: source-word length search completed; word-length matches do not alone decrypt',
    inputs:BOOKS.length,completed:completed.length,unavailable:failed.length,
    wordsSearched:completed.reduce((a,b)=>a+b.sourceWords,0),
    longest:matches[0]||null,atLeast15:matches.filter(m=>m.length>=15).length,
    noAuthenticatedCiphertextPlaintext: true
  }));
}
main().catch(error=>{console.error(error.stack||String(error));process.exitCode=1;});
