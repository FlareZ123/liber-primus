'use strict';
/**
 * Source-preserving candidate literal-quotation recovery from original LP2:
 * 2,896 printed rune-word lengths scanned against a preregistered set of
 * pre-2014 public-domain classical/philosophical source eBooks.
 *
 * Unlike plain English decryption, a genuinely long sequence of matching
 * word lengths can select exact source text even under a full-length pad.
 * This is a crib-discovery experiment, not a decryption.
 * Online original sources: Project Gutenberg's public cache/epub text path.
 *
 * Node 22: node sims/lp2_classic_gutenberg_wordcrib_sft.cjs
 * No dependencies, no persisted downloads, bounded 3 parallel requests.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {parseSharedCorpus,physicalLP2Page} = require('./lp2_word_pages.cjs');
const original=parseSharedCorpus();
assert.equal(original.words.length,2896);
assert.equal(original.runeCount,12956);
const target=original.words.map(w=>w.length);
/** @type {Array<[string, number]>} A priori selected source texts */
const BOOKS=[
  ['Plato Republic',1497],
  ['Marcus Aurelius Meditations',2680],
  ['Tao Te Ching',216],
  ['The Kybalion',14209],
  ['Siddhartha',2500],
  ['Bhagavad Gita',2388],
  ['Walden',205],
  ['Thus Spake Zarathustra',1998],
  ['Beowulf',16328],
  ['Mabinogion',9721],
  ['Utopia',2130],
  ['The Golden Bough',3623],
  ['The Book of Mormon',17],
  ['Paradise Lost',20],
  ['Divine Comedy',8800],
  ['Frankenstein',84],
  ['Alice Adventures',11],
  ['Moby Dick',2701],
  ['A Tale of Two Cities',98],
  ['War and Peace',2600],
  ['Crime and Punishment',2554],
  ['Don Quixote',996],
  ['The Time Machine',35],
  ['H G Wells Invisible Man',5230],
  ['Emerson Nature',29433],
  ['Montaigne Essays',3600],
  ['Thomas a Kempis Imitation of Christ',1653],
  ['The Dhammapada',2017],
  ['The Secret Doctrine',54824],
  ['Nietzsche Beyond Good and Evil',4363],
  ['Walt Whitman Leaves of Grass',1322],
  ['John Bunyan Pilgrims Progress',131],
];
const WIDTH=7;
const gpDouble=new Set(['TH','NG','EO','OE','AE','IA','EA']);
/** @param {string} word @returns {number} */
function runeLength(word){
  let n=0;
  for(let i=0;i<word.length;n++){
    if(word.slice(i,i+3)==='ING')i+=3;
    else if(gpDouble.has(word.slice(i,i+2)))i+=2;
    else i++;
  }
  return n;
}
/**
 * @param {string} t
 * @returns {string[]}
 */
function sourceWords(t){
  const begin=t.search(/\*\*\* START OF THE PROJECT GUTENBERG EBOOK/i);
  if(begin>=0)t=t.slice(begin);
  const end=t.search(/\*\*\* END OF THE PROJECT GUTENBERG EBOOK/i);
  if(end>=0)t=t.slice(0,end);
  return t.toUpperCase().match(/[A-Z]+/g)||[];
}
const index=new Map();
for(let i=0;i+WIDTH<=target.length;i++){
  const key=target.slice(i,i+WIDTH).join(',');
  const group=index.get(key)||[];
  group.push(i);index.set(key,group);
}
/**
 * @param {number[]} doc
 * @param {string[]} words
 * @param {string} mode
 * @param {string} book
 */
function match(doc,words,mode,book) {
  const found=new Map();
  for(let j=0;j+WIDTH<=doc.length;j++){
    const key=doc.slice(j,j+WIDTH).join(',');
    for(const i0 of index.get(key)||[]){
      let i=i0,b=j,len=WIDTH;
      while(i>0&&b>0&&target[i-1]===doc[b-1]){i--;b--;len++;}
      while(i+len<target.length&&b+len<doc.length&&target[i+len]===doc[b+len])len++;
      const id=i+':'+b;
      if(!found.has(id))found.set(id,{
        mode,book,matchingWords:len,originalWord:i,
        originalPage:physicalLP2Page(original.words[i].startPage),
        sourceWord:b,snippet:words.slice(b,b+Math.min(len,18)).join(' ')
      });
    }
  }
  return [...found.values()].sort((a,b)=>b.matchingWords-a.matchingWords).slice(0,3);
}
// Actual 30-word known-source planted control exercises the same complete
// seven-word seed lookup and maximal-left/right extension as the search.
const plantedExcerpt=target.slice(111,141);
const positiveMatches=match(plantedExcerpt,Array(30).fill('PLANT'),'GP29','positive');
assert(positiveMatches.some(hit=>hit.originalWord===111&&
  hit.sourceWord===0&&hit.matchingWords>=30),
  'source-exact 30-word sequence must be recovered by the real matcher');
async function run(){
  const recorded=[],failures=[],best=[];
  let next=0;
  /** @returns {Promise<void>} */
  async function worker(){
    while(next<BOOKS.length){
      const [title,id]=BOOKS[next++];
      const url='https://www.gutenberg.org/cache/epub/'+id+'/pg'+id+'.txt';
      try{
        const response=await fetch(url,{signal:AbortSignal.timeout(20000),
          headers:{'User-Agent':'Cicada3301-research/1.0 (public-domain-text-crib)'}});
        if(!response.ok)throw new Error('HTTP '+response.status);
        const body=await response.text();
        const words=sourceWords(body);
        if(words.length<150)throw new Error('Too few source words: '+words.length);
        const sha=crypto.createHash('sha256').update(body).digest('hex');
        recorded.push({title,id,sha256:sha,words:words.length,bytes:Buffer.byteLength(body)});
        const modes=[['Latin',words.map(w=>w.length)],['GP29',words.map(runeLength)]];
        for(const [mode,document] of modes)
          for(const hit of match(document,words,mode,title))
            best.push({...hit,sourceId:id});
      }catch(error){failures.push({title,id,error:String(error)});}
    }
  }
  await Promise.all(Array.from({length:3},()=>worker()));
  if(recorded.length<8)throw new Error('Insufficient accessible books; '+JSON.stringify(failures));
  const sorted=best.sort((a,b)=>b.matchingWords-a.matchingWords||
    a.originalWord-b.originalWord).slice(0,28);
  const strongest=sorted[0]?.matchingWords||0;
  // Even lengthy matches remain potential cribs. Require independent
  // cipher-key verification before designating the source a true plaintext.
  const decision=strongest>=18?
    'DISCOVERY CANDIDATE: verify original context and independent cipher operation before claiming plaintext':
    'No literal >=18-word-length source crib in the frozen historical-classics panel';
  console.log(JSON.stringify({
    date:'2026-11-13',targetWords:target.length,sourceMode:['Latin','GP29'],
    sourceSelection:'32 pre-2014 philosophical/literary eBooks',
    corpusSearched:recorded.length,totalSourceWords:recorded.reduce((s,r)=>s+r.words,0),
    failures,bookDigests:recorded.sort((a,b)=>a.id-b.id),
    positivePlant:{insertedWord:111,length:30,actualThirtyWordMatchRecovered:true},
    topMatches:sorted,decision
  },null,2));
}
run().catch(error=>{console.error(error);process.exitCode=1;});
