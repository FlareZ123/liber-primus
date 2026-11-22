'use strict';

/**
 * Original p49-p51 256-cell successor-map transducer:
 * an arbitrary hidden deterministic GP29 encoder keyed by the table pointer
 * that advances exactly once after every complete printed word.
 *
 * Any two identical plaintext words begun at the same pointer must generate
 * the same ciphertext word regardless of all undisclosed per-state keys.
 * Test all 256 possible pointer seeds algebraically, by proving eventual
 * period divides 22 and exhibiting later same-phase plaintext-word repeats
 * whose actual original ciphertext spellings are different.
 *
 * No English scorer, guessed plaintext, or cipher-key fitting.
 * Windows 11, Node.js 22 CommonJS, no dependencies.
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const transcription = read('resources/lp2-transcription.txt').replace(/\r\n/g, '\n');
const runeToIndex = new Map(corpus.runes.map((r,i) => [r,i]));
const tokens = corpus.translit.map((text,i) => ({text,i}))
  .sort((a,b) => b.text.length - a.text.length);

const HASH60 = '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290';
const sections = [158, 255, 385, 435, 224, 326, 378, 735];
const PHASE_PERIOD = 22;
const TERMINAL_AFTER = 40;

/** @param {number} radix @returns {number[]} */
function successor(radix) {
  const alphabet = radix === 60 ? table.alphabet : table.alphabet.replace('f', '');
  assert.equal(alphabet.length, radix);
  const values = table.rows.flat().map(token => {
    assert.equal(token.length, 2);
    const a = alphabet.indexOf(token[0]);
    const b = alphabet.indexOf(token[1]);
    assert(a >= 0 && b >= 0);
    const n = a * radix + b;
    assert(n >= 0 && n <= 255);
    return n;
  });
  assert.equal(values.length, 256);
  return values;
}

/**
 * @param {number[]} f
 * @returns {{cycleCounts:object,cycles:number[][],maxTransient:number,maxDistinctPath:number}}
 */
function cycles(f) {
  const counts = new Map();
  const cyclesFound = new Map();
  let maxTransient = 0, maxDistinctPath = 0;
  for (let seed = 0; seed < 256; seed++) {
    let s = seed, step = 0;
    const first = new Map();
    while (!first.has(s)) {
      first.set(s, step++);
      s = f[s];
    }
    const start = first.get(s);
    const period = step - start;
    maxTransient = Math.max(maxTransient, start);
    maxDistinctPath = Math.max(maxDistinctPath, step);
    counts.set(period, (counts.get(period) || 0) + 1);
    const cycle = [];
    for(let i = 0; i < period; i++) {
      cycle.push(s);
      s = f[s];
    }
    const key = cycle.slice().sort((a,b)=>a-b).join('.');
    cyclesFound.set(key,cycle);
  }
  for(const seed of Array.from({length:256}, (_,i)=>i)) {
    let state = seed;
    const seen = [];
    for(let i=0;i<TERMINAL_AFTER+PHASE_PERIOD+1;i++) {
      seen.push(state);
      state=f[state];
    }
    for(let i=TERMINAL_AFTER;i<seen.length-PHASE_PERIOD;i++)
      assert.equal(seen[i],seen[i+PHASE_PERIOD],
        'pointer recurrence differs at source-independent 22-word lag');
  }
  return {
    cycleCounts: Object.fromEntries(counts),
    cycles: [...cyclesFound.values()].map(a=>a.slice().sort((x,y)=>x-y)),
    maxTransient, maxDistinctPath
  };
}

/** @returns {{spans:object[],pages:number[],pageLocals:number[],sections:number[],sectionLocals:number[]}} */
function sourceWords() {
  // Slash, '%' physical page, and whitespace do NOT break carried words.
  const source = transcription.split('%').slice(0,55).join('%');
  const spans = [];
  let runes = [], word = [], start = 0;
  for (const ch of source) {
    if (runeToIndex.has(ch)) {
      if (!word.length) start = runes.length;
      const v=runeToIndex.get(ch);
      word.push(v);
      runes.push(v);
    } else if (ch==='%' || ch==='/' || /\s/u.test(ch)) {
      // Source-true split word continues across a line or physical page.
    } else if (word.length) {
      spans.push({start,len:word.length,cipher:word.join('.')});
      word = [];
    }
  }
  if (word.length) spans.push({start,len:word.length,cipher:word.join('.')});
  assert.equal(runes.length, 12956);
  assert.equal(spans.length, 2896);
  assert.equal(sections.reduce((s,n)=>s+n,0),spans.length);
  const long = spans.filter(w=>w.len>=4);
  assert.equal(new Set(long.map(w=>w.cipher)).size,long.length,
    'Original ciphertext has an unexpected repeated word length >=4');
  const pageStarts=[];
  let offset=0;
  for(const p of corpus.pages.slice(0,56)) {
    if (p.indices.length) {
      pageStarts.push([p.page, offset]);
      offset+=p.indices.length;
    }
  }
  assert.equal(pageStarts.length,55);
  assert.equal(offset,12956);
  let pageIndex=0;
  const pageLocals=[], pages=[], pageCounters=new Map();
  for(const w of spans) {
    while(pageIndex<pageStarts.length-1 &&
          pageStarts[pageIndex+1][1]<=w.start) pageIndex++;
    const page=pageStarts[pageIndex][0];
    pages.push(page);
    const n=pageCounters.get(page)||0;
    pageLocals.push(n);
    pageCounters.set(page,n+1);
  }
  const sectionLocals=[], sectionIds=[];
  sections.forEach((n,j)=>{
    for(let i=0;i<n;i++) {
      sectionLocals.push(i);
      sectionIds.push(j);
    }
  });
  assert.equal(sectionIds.length,spans.length);
  return {spans,pages,pageLocals,sections:sectionIds,sectionLocals};
}

/** @param {string} sourceWord @returns {number[]|null} */
function nativeGP(sourceWord) {
  const word = sourceWord.toUpperCase().normalize('NFD')
    .replace(/\p{M}/gu,'')
    .replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S');
  if(!/^[A-Z]+$/u.test(word)) return null;
  const values = [];
  for(let i=0;i<word.length;) {
    if(word.startsWith('ING',i)) {
      values.push(21);
      i+=3;
    } else if(word.startsWith('IO',i)) {
      values.push(27);
      i+=2;
    } else {
      const token=tokens.find(x=>word.startsWith(x.text,i));
      assert(token,'unknown GP29 transliteration '+word.slice(i));
      values.push(token.i);
      i+=token.text.length;
    }
  }
  return values;
}

/**
 * For each valid original-long-word position at >=40 words from its
 * candidate state reset, a plaintext word matched at identical state
 * in the period-22 phase must generate identical full cipher words.
 * All original >=4-letter cipher words are distinct, so repeated
 * plaintext word + phase classes are explicit all-secret contradictions.
 *
 * @param {string[]} plaintextWords
 * @param {object} source
 * @param {'global'|'section'|'page'} mode
 * @param {string[]=} ciphertextWords
 * @returns {{conflicts:number,first:null|object}}
 */
function witness(plaintextWords,source,mode,ciphertextWords) {
  const observed = ciphertextWords || source.spans.map(w=>w.cipher);
  const seen=new Map();
  let conflicts=0,first=null;
  for(let i=0;i<source.spans.length;i++) {
    if(source.spans[i].len<4)continue;
    const id=mode==='global'?0:
      mode==='section'?source.sections[i]:source.pages[i];
    const local=mode==='global'?i:
      mode==='section'?source.sectionLocals[i]:source.pageLocals[i];
    if(local<TERMINAL_AFTER) continue;
    const key=id+'|'+(local%PHASE_PERIOD)+'|'+plaintextWords[i];
    const prior=seen.get(key);
    if(prior) {
      if(prior.cipher!==observed[i]) {
        conflicts++;
        if(first===null) first={wordIndex:i,previous:prior.i,
          length:source.spans[i].len,group:id,phase:local%PHASE_PERIOD,
          text:plaintextWords[i]};
      }
    } else seen.set(key,{cipher:observed[i],i});
  }
  return {conflicts,first};
}

/** @param {string} donor @param {number} seed @param {object} source @returns {object} */
function donorControls(donor,seed,source) {
  const byLen = Array.from({length:15},()=>[]);
  const words=donor.match(/\p{L}+/gu) || [];
  for(const word of words) {
    const native=nativeGP(word);
    if(native && native.length<=14) byLen[native.length].push(native.join('.'));
  }
  assert(source.spans.every(w=>byLen[w.len].length>0));
  let state=seed|0;
  function random() {
    state ^= state<<13; state ^= state>>>17; state ^= state<<5;
    return state>>>0;
  }
  const samples=[];
  let plantCheck=false;
  for(let sample=0;sample<64;sample++) {
    const plain=source.spans.map(w=>{
      const pool=byLen[w.len];
      return pool[random()%pool.length];
    });
    const global=witness(plain,source,'global');
    const section=witness(plain,source,'section');
    const page=witness(plain,source,'page');
    samples.push({global:global.conflicts,section:section.conflicts,page:page.conflicts});
    if(sample===0) {
      // A real full-corpus GP-native positive: deterministic source-keyed
      // Caesar map with a fixed hidden additive per-state key.
      const f=successor(60);
      let pointer=0x33;
      const planted=[],recovered=[];
      for(let i=0;i<plain.length;i++) {
        const cipher=plain[i].split('.').map(x=>(Number(x)+(pointer%29))%29);
        planted.push(cipher.join('.'));
        recovered.push(cipher.map(x=>(x-pointer%29+29)%29).join('.'));
        pointer=f[pointer];
      }
      assert.deepEqual(recovered,plain);
      assert.equal(witness(plain,source,'global',planted).conflicts,0,
        'planted authentic table-state cipher must satisfy arbitrary hidden key theorem');
      const broken=planted.slice();
      const first=global.first;
      assert(first,'original must have a repeated native word/state');
      broken[first.wordIndex]=broken[first.wordIndex].replace(/^\d+/,x=>
        String((Number(x)+1)%29));
      assert(witness(plain,source,'global',broken).conflicts>0,
        'single rune tamper must create a same-state conflict');
      plantCheck=true;
    }
  }
  assert(plantCheck);
  const stats=key=>{
    const sorted=samples.map(r=>r[key]).sort((a,b)=>a-b);
    return {min:sorted[0],median:sorted[32],max:sorted[63],
      numberContradicted:sorted.filter(x=>x>0).length};
  };
  return {donorWords:words.length,samples:64,global:stats('global'),
    chapterReset:stats('section'),physicalPageReset:stats('page'),
    nativeGPPlantedRealTableMap:'PASS',
    oneRuneTamper:'PASS'};
}

function main() {
  assert.equal(table.rows.length,32);
  assert(table.rows.every(x=>x.length===8));
  const b60=successor(60),b59=successor(59);
  assert.equal(crypto.createHash('sha256').update(Buffer.from(b60))
    .digest('hex'),HASH60);
  assert.deepEqual(table.byte_rows.flat(),b60);
  const sixty=cycles(b60),fiftyNine=cycles(b59);
  assert.deepEqual(sixty.cycleCounts,{'2':4,'11':252});
  assert.deepEqual(fiftyNine.cycleCounts,{'1':256});
  assert.equal(sixty.maxTransient,24);
  assert.equal(fiftyNine.maxTransient,38);
  const source=sourceWords();
  const sources={
    Shakespeare:donorControls(
      read('resources/control/shakespeare_first300k.txt'),0x330112,source),
    Gibran:donorControls(
      read('resources/control/gibran_prophet_58585.txt'),0x330161,source)
  };
  for(const r of Object.values(sources)) {
    assert.equal(r.global.numberContradicted,64);
    assert.equal(r.chapterReset.numberContradicted,64);
    // Source page resets are a distinct mechanism and intentionally may survive.
  }
  console.log(JSON.stringify({
    hypothesis:'state s_(word+1) = original printed table[s_word]',
    source:{originalGPWords:source.spans.length,originalGPRunes:12956,
      uniqueOriginalLongWordCiphertexts:source.spans.filter(w=>w.len>=4).length,
      baselineOriginalRepeatedLongCipherWords:0},
    graph:{base60:sixty,base59:fiftyNine,
      allSeedsAfterWord40HavePeriodDividing22:true},
    theorem:'same native GP plaintext word at same recurrent state gives identical source ciphertext word for every secret deterministic word cipher',
    sourceMatchedNativeControls:sources,
    nativePlantedForwardInverse:'PASS',
    scope:'word-independent transition T[state] once per complete word, no rune-dependent updates; one global or independent chapter initializers',
    warning:'not an exclusion of unknown manuscript plaintext, non-English plaintext, page-private resets, keyed state update per letter, or external key'
  },null,2));
  console.log('PASS: original 256 tokens, all 256 seeds per radix, 128 length-matched native-GP samples, real pointer-plant and tamper');
}
if (require.main === module) main();
