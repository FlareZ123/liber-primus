'use strict';

/**
 * Source-first, no-key plaintext crib attack on *whole printed word lengths*.
 *
 * Previous #333 tested 13 short Cicada-era source files (6,991 normalized
 * words). The original Project Gutenberg host returns HTTP503 to Actions;
 * this reproducer reads the matching public GITenberg GitHub text blobs.
 * This distinct sealed extension tests nine independently identified
 * pre-2014 Project Gutenberg philosophy/poetry books in their full text.
 * All nine books/URLs, GP29 spelling reductions, 10-word discovery seeds
 * and 10 subsequent withheld words are frozen below; no edit/gap search.
 *
 * Copyright: this script fetches public-domain texts without redistributing
 * them. Their exact SHA-256 and received word counts are reported.
 *
 * Windows 11, Node.js >=22, no dependencies:
 *   node sims/lp2_philosophy_gutenberg_unseen_wordlength_crib_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');
const {createHash} = require('node:crypto');

const ROOT = path.join(__dirname, '..');
const RUNES = new Set([... 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ']);
const BODY_STARTS = [0,729,1874,3612,5506,6527,7960,8051,9640,12956];
const DISCOVERY = 10;
const WITHHELD = 10;
const SEED = 0x33012014;
const NULL_DRAWS = 500;

// These are source-age candidates, not claimed manuscript quotations.
// Gutenberg 45315 (Blake) and the full Book of the Law are already in #333.
const BOOKS = Object.freeze([
  {id:2944, name:'Emerson Essays First Series (1841)', slug:'Essays---First-Series_2944', file:'2944.txt'},
  {id:2945, name:'Emerson Essays Second Series (1844)', slug:'Essays---Second-Series_2945', file:'2945.txt'},
  {id:205, name:'Thoreau Walden and Civil Disobedience (1854)', slug:'Walden-and-On-The-Duty-Of-Civil-Disobedience_205', file:'205.txt'},
  {id:1998, name:'Nietzsche Thus Spake Zarathustra (1885, Common translation)', slug:'Thus-Spake-Zarathustra--A-Book-for-All-and-None_1998', file:'1998.txt'},
  {id:1497, name:'Plato Republic (Jowett translation)', slug:'The-Republic_1497', file:'1497.txt'},
  {id:2680, name:'Marcus Aurelius Meditations (Long translation)', slug:'Meditations_2680', file:'2680.txt'},
  {id:1322, name:'Whitman Leaves of Grass (1892 edition)', slug:'Leaves-of-Grass_1322', file:'1322.txt'},
  {id:1232, name:'Machiavelli The Prince (Marriott translation)', slug:'The-Prince_1232', file:'1232.txt'},
  {id:2701, name:'Melville Moby Dick (1851)', slug:'Moby-Dick--Or-The-Whale_2701', file:'2701.txt'}
]);

/**
 * @param {string} word English ASCII word
 * @returns {number} Rune count under existing project normalization (#333).
 */
function gpLength(word) {
  const s = word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/K/g,'C').replace(/Z/g,'S');
  let result = 0;
  for(let i=0; i<s.length; result++) {
    if(s.startsWith('ING',i)) i+=3;
    else if(['TH','EO','OE','AE','IA','EA','NG'].includes(s.slice(i,i+2)))
      i+=2;
    else i++;
  }
  return result;
}

/**
 * @param {string} raw Canonical original GP29 transcription.
 * @returns {{length:number,start:number,end:number}[]}
 */
function originalWholeWords(raw) {
  const words=[];
  let current=0,start=0,count=0;
  const flush=()=>{
    if(current) words.push({length:current,start,end:count});
    current=0;
  };
  for(const char of raw) {
    if(RUNES.has(char)) {
      if(!current) start=count;
      current++;count++;
    } else if('-.&$§'.includes(char)) flush();
  }
  flush();
  assert.equal(count,13136);
  assert.equal(words.filter(w=>w.start<12956).length,2896);
  return words.filter(w=>w.start<12956);
}

/**
 * Only original 9 main body units may contain a matching intact quotation.
 * @returns {number[][]}
 */
function sourceBodies() {
  const text=fs.readFileSync(path.join(ROOT,
    'resources/liber-primus/lp2-transcription.txt'),'utf8');
  const words=originalWholeWords(text);
  const bodies=BODY_STARTS.slice(0,-1).map((begin,i)=>
    words.filter(w=>w.start>=begin && w.end<=BODY_STARTS[i+1])
      .map(w=>w.length));
  assert.deepEqual(bodies.map(b=>b.length),
    [158,255,385,435,224,326,23,355,735]);
  return bodies;
}

/**
 * @param {string} url
 * @param {number} hops
 * @returns {Promise<string>}
 */
function getText(url,hops=0) {
  assert(hops <= 3);
  return new Promise((resolve,reject)=>{
    const request=https.get(url,{headers:{
      'user-agent':'LP2-HistoricalSource-Research/1.0 (original-wordlength-crib)',
      'accept':'text/plain'
    }},response=>{
      if([301,302,307,308].includes(response.statusCode)) {
        response.resume();
        const location=response.headers.location;
        if(!location) return reject(new Error('redirect without Location '+url));
        getText(new URL(location,url).href,hops+1).then(resolve,reject);
        return;
      }
      if(response.statusCode!==200) {
        response.resume();
        reject(new Error('HTTP '+response.statusCode+' '+url));
        return;
      }
      let size=0;
      const chunks=[];
      response.on('data',chunk=>{
        size+=chunk.length;
        if(size>15_000_000) {
          response.destroy(new Error('source file over 15 MB limit'));
          return;
        }
        chunks.push(chunk);
      });
      response.on('end',()=>resolve(Buffer.concat(chunks).toString('utf8')));
      response.on('error',reject);
    });
    request.setTimeout(45000,()=>request.destroy(new Error('timeout '+url)));
    request.on('error',reject);
  });
}

/**
 * @param {string} raw
 * @returns {string} EBook body without Gutenberg preface/license and metadata.
 */
function ebookBody(raw) {
  const start=/\*\*\* START OF (?:THIS |THE )?PROJECT GUTENBERG EBOOK[^\n]*\*\*\*/i.exec(raw);
  const end=/\*\*\* END OF (?:THIS |THE )?PROJECT GUTENBERG EBOOK[^\n]*\*\*\*/i.exec(raw);
  assert(start && end && end.index>start.index);
  return raw.slice(start.index+start[0].length,end.index);
}

/** @param {number[]} values @returns {string} */
const signature=values=>values.map(n=>String.fromCharCode(35+n)).join('');

/**
 * @param {number[][]} bodies
 * @param {{name:string,words:string[],lengths:number[],seq:string,index:Map<string,number[]>}[]} sources
 * @returns {{maximum:number,at?:object,seedHits:number,forwardTenHits:number}}
 */
function match(bodies,sources) {
  let maximum=0,at,seedHits=0,forwardTenHits=0;
  for(let b=0;b<bodies.length;b++) {
    const target=signature(bodies[b]);
    for(let book=0;book<sources.length;book++) {
      const source=sources[book];
      for(let i=0;i+DISCOVERY<=target.length;i++) {
        const js=source.index.get(target.slice(i,i+DISCOVERY));
        if(!js) continue;
        for(const j of js) {
          seedHits++;
          let after=DISCOVERY;
          // The source text and actual original manuscript continuation are
          // compared only after an exact independent discovery seed exists.
          while(i+after<target.length && j+after<source.seq.length
            && target[i+after]===source.seq[j+after]) after++;
          if(after>=DISCOVERY+WITHHELD) forwardTenHits++;
          let before=0;
          while(i-before>0 && j-before>0
            && target[i-before-1]===source.seq[j-before-1]) before++;
          const n=before+after;
          if(n>maximum) {
            maximum=n;
            at={body:b,originalWordWithinBody:i-before,
              source:source.name,sourceStartWord:j-before,
              sourceText:source.words.slice(j-before,j+after).join(' '),
              predictedTen:source.lengths.slice(j+DISCOVERY,j+DISCOVERY+WITHHELD),
              originalTen:bodies[b].slice(i+DISCOVERY,i+DISCOVERY+WITHHELD),
              discoveryWords:DISCOVERY,fullMatchedWords:n,
              forwardUnseenMatchedWords:after-DISCOVERY};
          }
        }
      }
    }
  }
  return {maximum,at,seedHits,forwardTenHits};
}

/**
 * @param {()=>number} random
 * @param {number[][]} bodies
 * @returns {number[][]}
 */
function shuffle(random,bodies) {
  const all=bodies.flat();
  for(let i=all.length-1;i>0;i--) {
    const j=random()%(i+1);
    [all[i],all[j]]=[all[j],all[i]];
  }
  let index=0;
  return bodies.map(body=>{
    const piece=all.slice(index,index+body.length);
    index+=body.length;
    return piece;
  });
}

/** @returns {()=>number} */
function prng() {
  let x=SEED;
  return ()=>{
    x^=x<<13;x^=x>>>17;x^=x<<5;
    return x>>>0;
  };
}

async function main() {
  const bodies=sourceBodies();
  const sources=[];
  for(const book of BOOKS) {
    const url='https://raw.githubusercontent.com/GITenberg/' + book.slug + '/master/' + book.file;
    const raw=await getText(url);
    const content=ebookBody(raw);
    const words=content.match(/[A-Za-z]+/g)||[];
    assert(words.length>10000,(book.name+' source too short: '+words.length));
    const lengths=words.map(gpLength);
    const seq=signature(lengths);
    const index=new Map();
    for(let j=0;j+DISCOVERY<=seq.length;j++) {
      const key=seq.slice(j,j+DISCOVERY);
      if(!index.has(key)) index.set(key,[]);
      index.get(key).push(j);
    }
    sources.push({name:book.name,words,lengths,seq,index,
      sourceUrl:url,sha256:createHash('sha256').update(raw).digest('hex')});
    console.log('DOWNLOADED',book.id,book.name,words.length,raw.length,
      sources.at(-1).sha256);
  }

  // Matched-orthography positive control: copy one genuine known source
  // interval and confirm a discovery seed recovers the next ten unseen words.
  const planted=sources[0].lengths.slice(100,130);
  const plant=match([planted],[sources[0]]);
  assert(plant.maximum>=30 && plant.forwardTenHits>=1);

  const observed=match(bodies,sources);
  const rand=prng(), nullMax=[],nullPredicted=[];
  for(let k=0;k<NULL_DRAWS;k++) {
    const result=match(shuffle(rand,bodies),sources);
    nullMax.push(result.maximum);
    nullPredicted.push(result.forwardTenHits);
  }
  const ge=nullMax.filter(n=>n>=observed.maximum).length;
  const gePred=nullPredicted.filter(n=>n>=observed.forwardTenHits).length;
  const report={
    exactSourceContract:{unknownRunes:12956,printedWords:2896,
      bodies:bodies.map(b=>b.length),discoveryWords:DISCOVERY,
      prospectiveWithheldWords:WITHHELD,
      noGapNoResetNoOptimizedAlphabet:true},
    books:sources.map(s=>({name:s.name,sourceUrl:s.sourceUrl,
      sha256:s.sha256,englishWords:s.words.length})),
    sourceWordTotal:sources.reduce((a,s)=>a+s.words.length,0),
    plantedControl:{maxMatched:plant.maximum,forwardTenHits:plant.forwardTenHits},
    original:observed,
    originalRecovery:observed.forwardTenHits>0,
    familywiseNull:{draws:NULL_DRAWS,seed:SEED,geMax:ge,
      addOneMaxP:(ge+1)/(NULL_DRAWS+1),geForwardTen:gePred,
      addOneForwardTenP:(gePred+1)/(NULL_DRAWS+1),
      nullMaxMax:Math.max(...nullMax)},
    decision:observed.forwardTenHits>0
      ? 'LONG ORIGINAL WORD-LENGTH CRIB: requires manual image-readback and independent cipher reencryption'
      : 'No ten-discovery plus ten-continuation exact word-length crib in this fixed external corpus'
  };
  console.log(JSON.stringify(report,null,2));
}
main().catch(error=>{console.error('SOURCE/TEST FAILURE',error.stack);process.exitCode=1;});
