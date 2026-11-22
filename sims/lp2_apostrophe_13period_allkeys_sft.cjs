'use strict';

/**
 * Exact original-LP2 all-key test for a common GP29 affine slope and a single
 * 13-symbol additive key, with three source-motivated rune-consuming clocks.
 * Conditional plaintext: four printed apostrophes mark ordinary English
 * contractions from the fixed, preregistered source-audit dictionary.
 * Run (Windows Node 22): node sims/lp2_apostrophe_13period_allkeys_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {any} */
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const marks = read('resources/liber-primus/lp2-quote-punctuation-spans.json');
const alphabet = new Map(corpus.translit.map((letter, index) => [letter, index]));
/** @param {number} n @returns {number} */
const mod = n => ((n % 29) + 29) % 29;

const examples = [
  { page: 4, label: "MXI'W", local: 164, global: 1110, stem: 3,
    words: ['DONT','CANT','WONT','AINT','ISNT','LETS','GODS',
      'ONES','MANS','MENS','SHED','YOUD','ALLS'] },
  { page: 21, label: "AEO'Y", local: 36, global: 5138, stem: 2,
    words: ['ITS','HES','WED','HED','ITD','DOS'] },
  { page: 35, label: "PE'T", local: 80, global: 8515, stem: 2,
    words: ['ITS','HES','WED','HED','ITD','DOS'] },
  { page: 41, label: "XLJ'C", local: 218, global: 10089, stem: 3,
    words: ['DONT','CANT','WONT','AINT','ISNT','LETS','GODS',
      'ONES','MANS','MENS','SHED','YOUD','ALLS'] }
];
const chapterStarts = [0,729,1874,3603,5506,6527,7960,9640,12648];
const four = marks.source_visible_apostrophes;
assert.equal(four.length, 4);
assert.equal(corpus.pages.slice(0,56).reduce((a,p)=>a+p.indices.length,0), 12956);
const sites = examples.map((e,i) => {
  const p = corpus.pages[e.page];
  const a = four[i];
  assert.deepEqual([a.page, a.local_before_rune, a.global_before_rune,
    a.cipher_word, a.stem_runes, a.scan],
    [e.page, e.local, e.global, e.label, e.stem, (e.page+17)+'.jpg']);
  const start = e.local - e.stem;
  const cipher = p.indices.slice(start, e.local+1);
  assert.equal(cipher.length, e.stem+1);
  assert.equal(cipher.map(x=>corpus.translit[x]).join(''), e.label.replace("'",""));
  const prefix = corpus.pages.slice(0,e.page).reduce((n,page)=>n+page.indices.length,0);
  assert.equal(prefix+start, e.global-e.stem);
  return {...e, cipher, startGlobal:prefix+start, startLocal:start};
});
const candidates = sites.map(s=>s.words.map(w=>[...w].map(x=>{
  assert.ok(alphabet.has(x), 'Non-GP candidate letter '+x);
  return alphabet.get(x);
})));
/** @param {typeof sites[number]} site @param {'global'|'page'|'chapter'} clock */
function slotStart(site,clock) {
  if (clock === 'page') return site.startLocal;
  if (clock === 'global') return site.startGlobal;
  const boundary = chapterStarts.filter(x=>x<=site.startGlobal).at(-1);
  assert.ok(Number.isInteger(boundary));
  return site.startGlobal-boundary;
}
/**
 * Count every contraction tuple and every invertible common slope a=1..28
 * compatible with a single unknown 13-symbol key K, where
 * C[t] = a*P[t] + K[clock(t) mod13] (mod29).
 * Each candidate contributes constraints on K; no key is guessed or scored.
 * @param {'global'|'page'|'chapter'} clock
 * @param {number[]} selected
 * @param {number[][]|null} overrideCipher
 * @returns {number}
 */
function countSolutions(clock,selected,overrideCipher=null) {
  let count = 0;
  for (let a=1; a<29; a++) {
    /** @param {number} depth @param {Map<number,number>} key */
    function visit(depth,key) {
      if (depth===selected.length) { count++; return; }
      const i=selected[depth], site=sites[i];
      const start=slotStart(site,clock);
      const ciphertext = overrideCipher ? overrideCipher[i] : site.cipher;
      for (const letters of candidates[i]) {
        const next = new Map(key);
        let valid=true;
        for (let j=0;j<letters.length;j++) {
          const slot=mod13(start+j);
          const k=mod(ciphertext[j]-a*letters[j]);
          if (next.has(slot) && next.get(slot)!==k) {valid=false;break;}
          next.set(slot,k);
        }
        if (valid) visit(depth+1,next);
      }
    }
    visit(0,new Map());
  }
  return count;
}
/** @param {number} n @returns {number} */
const mod13 = n => ((n%13)+13)%13;

// Positive: the genuine original LP1 Koan Vigenere uses a 13-rune key
// FIRFUMFERENFE and preserves the original apostrophe in DON'T->RWN'B.
const lp1Plain = [...'IDONT'].map(x=>alphabet.get(x));
const lp1Cipher = [...'IRWNB'].map(x=>alphabet.get(x));
const lp1Differences=lp1Cipher.map((c,i)=>mod(c-lp1Plain[i]));
assert.deepEqual(lp1Differences,[0,10,4,0,1]);
assert.deepEqual([... 'FIRFUMFERENFE'].slice(0,5).map(x=>alphabet.get(x)),
  lp1Differences);
assert.equal('FIRFUMFERENFE'.length,13);

// Positive planted every clock: all the same unknown slope and 13 key.
const secret=7, secretKey=[4,15,9,2,11,27,8,16,3,20,6,1,24];
const plantWords=['DONT','ITS','HES','CANT'];
const all=[0,1,2,3];
const summary={};
for (const clock of ['global','page','chapter']) {
  const original=countSolutions(clock,all);
  assert.equal(original,0,clock+' original all-key contradiction');
  const plant=sites.map((site,i)=>[...plantWords[i]].map((ch,j)=>
    mod(secret*alphabet.get(ch)+secretKey[mod13(slotStart(site,clock)+j)])));
  for(let i=0;i<4;i++)for(let j=0;j<plant[i].length;j++){
    const shift=secretKey[mod13(slotStart(sites[i],clock)+j)];
    const recovered=mod((plant[i][j]-shift)*25); // 7^-1 mod29=25
    assert.equal(recovered,alphabet.get(plantWords[i][j]));
    assert.equal(mod(secret*recovered+shift),plant[i][j]);
  }
  const plantedCount=countSolutions(clock,all,plant);
  assert.ok(plantedCount>0,clock+' planted nonzero solutions');
  summary[clock]={originalSolutions:original,plantedSolutions:plantedCount,
    siteSlots:sites.map(s=>s.cipher.map((_,j)=>mod13(slotStart(s,clock)+j)))};
}
assert.equal(countSolutions('page',[1,3]),0);
assert.equal(countSolutions('global',[2,3]),0);
assert.equal(countSolutions('chapter',[0,1,2]),432);
assert.equal(countSolutions('chapter',[0,1,2,3]),0);

/*
 * Transparent plaintext-F extension. In the solved LP1/p56 policy, plaintext F
 * emits ciphertext F without advancing K. A ciphertext F can alternatively be
 * an encrypted non-F rune. A non-F ciphertext C at key slot q MUST have K[q]!=C,
 * otherwise the inverse plaintext is F and would have been bypassed. A consumed
 * ciphertext F must have K[q]!=0. These necessary restrictions are key-slope
 * independent for every nonzero a. Enumerate all actual source-F positions
 * before each apostrophe. No post-selected skip phase or secret key is fitted.
 */
const allValueBits=(1<<29)-1;
/**
 * All F-consume / F-bypass histories on an exact source prefix, grouped by the
 * number of nonconsuming F events, each with 13 masks of forbidden key values.
 * @param {number[]} cipher
 * @returns {Array<Array<{forbidden:number[],skipped:number[]}>>}
 */
function prefixHistories(cipher) {
  const paths=[];
  /** @param {number} i @param {number} skips @param {number[]} forbidden @param {number[]} skipped */
  function walk(i,skips,forbidden,skipped) {
    if (i===cipher.length) {
      paths.push({skips,forbidden,skipped});
      return;
    }
    const c=cipher[i];
    if (c===0) walk(i+1,skips+1,forbidden,skipped.concat(i));
    const slot=mod13(i-skips);
    const next=forbidden.slice();
    next[slot] |= 1<<c;
    walk(i+1,skips,next,skipped);
  }
  walk(0,0,Array(13).fill(0),[]);
  const bySkip=Array.from({length:cipher.filter(c=>c===0).length+1},()=>[]);
  for(const item of paths)bySkip[item.skips].push(item);
  return bySkip;
}
/** @param {number[]} forbidden @param {Map<number,number>} key */
function allowedHistory(forbidden,key) {
  for(let slot=0;slot<13;slot++) {
    const mask=forbidden[slot];
    if(key.has(slot)) {
      if(mask & (1<<key.get(slot))) return false;
    } else if (mask===allValueBits) return false;
  }
  return true;
}
const sourcePrefixes=sites.map(s=>
  corpus.pages[s.page].indices.slice(0,s.startLocal));
const histories=sourcePrefixes.map(prefixHistories);
assert.deepEqual(histories.map(group=>group.map(paths=>paths.length)),[
  [1,5,10,10,5,1],[1],[1,1],
  [1,9,36,84,126,126,84,36,9,1]
]);

const fTransparent = {wordAndSkipAssignments:0,
  compatibleWithEachSourcePrefix:0,
  firstPrefixContradiction:[0,0,0,0],
  admissibleSkipCounts:[5,0,1,9]};
for(let slope=1;slope<29;slope++) {
  /**
   * Enumerate a shared secret K, all four frozen candidate words, and all
   * possible prefix bypass counts, with apostrophe cursor held stationary.
   * @param {number} depth @param {Map<number,number>} key
   * @param {number[]} bypasses
   */
  function visit(depth,key,bypasses) {
    if(depth===sites.length) {
      fTransparent.wordAndSkipAssignments++;
      for(let i=0;i<sites.length;i++) {
        if(!histories[i][bypasses[i]].some(h=>
          allowedHistory(h.forbidden,key))) {
          fTransparent.firstPrefixContradiction[i]++;
          return;
        }
      }
      fTransparent.compatibleWithEachSourcePrefix++;
      return;
    }
    const site=sites[depth];
    for(let skipped=0;skipped<histories[depth].length;skipped++) {
      for(const letters of candidates[depth]) {
        const next=new Map(key);
        let valid=true;
        for(let j=0;j<letters.length;j++) {
          const slot=mod13(site.startLocal-skipped+j);
          const k=mod(site.cipher[j]-slope*letters[j]);
          if(next.has(slot) && next.get(slot)!==k) {
            valid=false;break;
          }
          next.set(slot,k);
        }
        if(valid)visit(depth+1,next,bypasses.concat(skipped));
      }
    }
  }
  visit(0,new Map(),[]);
}
assert.equal(fTransparent.wordAndSkipAssignments,2118);
assert.equal(fTransparent.compatibleWithEachSourcePrefix,0);
assert.deepEqual(fTransparent.firstPrefixContradiction,[2093,17,6,2]);

// Positive source-shaped transparent-F plant: retain original prefix length
// and *exact observed ciphertext-F positions*, make those source F events true
// plaintext F skips, and fill other plaintext prefix runes with native U (1).
// The same secret a=7 and K[13] genuinely encrypts every marked word.
const plantedNative = {slope:secret,key:secretKey,chosenWords:plantWords,
  sourcePrefixFPositionsPreserved:true,positiveSites:0};
for(let i=0;i<sites.length;i++) {
  const site=sites[i],prefix=sourcePrefixes[i],cipher=[],plain=[];
  let cursor=0;
  for(const sourceCipher of prefix) {
    if(sourceCipher===0) {
      cipher.push(0);
      plain.push(0);
    } else {
      cipher.push(mod(secret*1+secretKey[mod13(cursor)]));
      plain.push(1);
      cursor++;
    }
  }
  assert.deepEqual(cipher.map((c,k)=>c===0?k:-1).filter(k=>k>=0),
    prefix.map((c,k)=>c===0?k:-1).filter(k=>k>=0));
  for(let j=0;j<prefix.length;j++) {
    if(plain[j]===0) {
      assert.equal(cipher[j],0);continue;
    }
    const skips=plain.slice(0,j).filter(c=>c===0).length;
    assert.equal(cipher[j],mod(secret*plain[j]+
      secretKey[mod13(j-skips)]));
  }
  const plantedWord=[...plantWords[i]].map(ch=>alphabet.get(ch));
  const keyAtSuffix=new Map();
  for(let j=0;j<plantedWord.length;j++) {
    const slot=mod13(cursor+j);
    const c=mod(secret*plantedWord[j]+secretKey[slot]);
    keyAtSuffix.set(slot,secretKey[slot]);
    assert.equal(mod((c-secretKey[slot])*25),plantedWord[j]);
  }
  const possible=prefixHistories(cipher);
  assert.ok(possible[prefix.filter(c=>c===0).length].some(h=>
    allowedHistory(h.forbidden,new Map(
      secretKey.map((v,k)=>[k,v])))));
  plantedNative.positiveSites++;
}
assert.equal(plantedNative.positiveSites,4);

console.log(JSON.stringify({
  originalApostropheSites:sites.map(s=>({page:s.page,scan:s.page+17,
    localSuffix:s.local,globalSuffix:s.global,original:s.label})),
  model:'C=a*P+K[clock mod13] in GP29; shared a in 1..28, secret K[13]',
  nativeEnglishCondition:'13/6/6/13 fixed candidate contractions; no F skip',
  clocks:summary, fTransparent, plantedNative, lp1SourceControl:lp1Differences,
  scope:'conditional all-F-bypass finite-family contradiction; no plaintext or LP2 key'
},null,2));
