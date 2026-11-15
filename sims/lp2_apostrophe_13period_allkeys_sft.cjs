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
console.log(JSON.stringify({
  originalApostropheSites:sites.map(s=>({page:s.page,scan:s.page+17,
    localSuffix:s.local,globalSuffix:s.global,original:s.label})),
  model:'C=a*P+K[clock mod13] in GP29; shared a in 1..28, secret K[13]',
  nativeEnglishCondition:'13/6/6/13 fixed candidate contractions; no F skip',
  clocks:summary, lp1SourceControl:lp1Differences,
  scope:'conditional finite-family obstruction; no plaintext or LP2 key'
},null,2));
