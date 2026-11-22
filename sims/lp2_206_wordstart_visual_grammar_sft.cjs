'use strict';
/**
 * Physical original LP2 206 genuine whole-word line-start gate.
 * Node.js 22 CJS, manual execution only, deterministic and read-only.
 * This is a compositor/selection test, never a claim of plaintext.
 *
 * Source glyph advances (all 29) are obtained from native image 60.jpg
 * first seven lines and independently checked on source 61.jpg:
 * sims/source_glyph_advance_inversion.py
 * sims/line_start_raster_width_control.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { WIDTHS } = require('./line_start_raster_width_control.cjs');

const ROOT = path.resolve(__dirname, '..');
const get = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const corpus = JSON.parse(get('resources/liber-primus/lp2-corpus.json'));
const lp2 = get('resources/liber-primus/lp2-transcription.txt');
const lp1 = get('resources/transcriptions/lp1_wulfic_canonical.txt');
const ink = JSON.parse(get('resources/liber-primus/lp2-ink-annotations.json'));
const IDS = new Map(corpus.runes.map((rune, i) => [rune, i]));
assert.equal(WIDTHS.length, 29);

/** @typedef {{ p:number, r:number, first:boolean, line:boolean, red:boolean, len:number, sum:number, prevLen:number, delim:string }} Word */

/** Parse physical rune word fragments with real printed wraps and source ink. 
 *  The 32 cross-page words each become two physical word fragments.
 * @param {string} source
 * @param {boolean} lp2Mode
 * @returns {{words:Word[],runes:number,pages:number}}
 */
function parseWords(source, lp2Mode) {
  const records = source.split('%');
  const pages = lp2Mode ? records.slice(0,55) : records.filter(s=>s.trim());
  const redSpans = new Map(ink.pages.map(p=>[p.page,p.red_spans || []]));
  /** @type {Word[]} */
  const words = [];
  let runes = 0;
  for (const [p,rec] of pages.entries()) {
    const physical = p<50 ? p : p+1;
    const spans = lp2Mode ? (redSpans.get(physical)||[]) : [];
    let newWord = true, atLine = true, first = true, local = 0;
    let current = null, delimiter = 'page', prevLen = 0;
    const pageRunes = [];
    for (const char of rec) {
      const r = IDS.get(char);
      if (r !== undefined) {
        if (newWord) {
          current = {
            p, r, first, line:atLine,
            red:spans.some(s=>s.start<=local && local<s.start+s.length),
            len:0, sum:0, prevLen, delim:delimiter
          };
          words.push(current);
          newWord = false;
        }
        current.len++;
        current.sum += WIDTHS[r];
        atLine = false; first = false; local++;
        runes++; pageRunes.push(r);
      } else if (char === '\n') {
        atLine = true;
      } else if (char === '-' || char === '.' || char === '&' ||
          char === '$' || (!lp2Mode && char >= '0' && char <= '9')) {
        newWord = true;
        delimiter = char;
        prevLen = current ? current.len : 0;
      }
    }
    if (lp2Mode) {
      const record = corpus.pages[physical];
      assert.deepEqual(pageRunes,record.indices,
        'Source source-cipher indices at physical page '+physical);
    }
  }
  return {words,runes,pages:pages.length};
}

/** @param {number} w @returns {number} */
function firstBin(w) { return w<25?0:w<42?1:w<53?2:w<67?3:4; }
/** @param {number} w @returns {number} */
function wordSumBin(w) { return w<120?0:w<240?1:w<360?2:w<540?3:4; }
/** @param {number} n @returns {number} */
function lenBin(n) { return n<=1?0:n<=2?1:n<=4?2:n<=6?3:4; }
/** @param {number} n @returns {number} */
function prevLenBin(n) { return n<=2?0:n<=5?1:n<=9?2:3; }

const feature = {
  first: w => firstBin(WIDTHS[w.r]),
  length: w => lenBin(w.len),
  sum: w => wordSumBin(w.sum),
  previous: w => prevLenBin(w.prevLen),
  delimiter: w => w.delim === '.' ? 1 : 0
};

/** @typedef {{pool:number[],pick:number}} Group */
/** @typedef {{groups:Group[],o:number[],e:number[],n:number,fixed:number}} Population */
/**
 * Exact conditional original-source null. Only physical whole-word beginnings
 * are eligible. Page-first sites are fixed compositor entries and excluded.
 * Preserve page, selected conditioning bins and selected count in each group.
 * @param {Word[]} words
 * @param {string[]} fields
 * @param {boolean} excludeRed
 * @param {number} lo
 * @param {number} hi
 * @param {boolean} dashOnly
 * @returns {Population}
 */
function population(words,fields,excludeRed,lo=0,hi=55,dashOnly=false) {
  const map = new Map(), o = Array(29).fill(0), e = Array(29).fill(0);
  for (const w of words) {
    if (w.first || w.p<lo || w.p>=hi || (excludeRed&&w.red) ||
        (dashOnly && w.delim !== '-')) continue;
    const key = [w.p,...fields.map(f=>feature[f](w))].join(':');
    if (!map.has(key)) map.set(key,{pool:[],pick:0});
    const g = map.get(key);
    g.pool.push(w.r);
    g.pick += Number(w.line);
    if (w.line) o[w.r]++;
  }
  const groups = [...map.values()].filter(g=>g.pick>0);
  for (const g of groups)
    for (const r of g.pool) e[r] += g.pick/g.pool.length;
  return {
    groups,o,e,n:o.reduce((s,v)=>s+v,0),
    fixed: groups.filter(g=>g.pick===g.pool.length).reduce((s,g)=>s+g.pick,0)
  };
}

/** @param {number} seed @returns {()=>number} */
function rng(seed) {
  let state = seed>>>0;
  return () => {
    state ^= state<<13; state ^= state>>>17; state ^= state<<5;
    return state>>>0;
  };
}
/** @param {Group[]} groups @param {()=>number} next @returns {number[]} */
function draw(groups,next) {
  const o = Array(29).fill(0);
  for (const g of groups) {
    const pool = g.pool.slice();
    for (let k=0;k<g.pick;k++) {
      const j = k+next()%(pool.length-k);
      [pool[k],pool[j]]=[pool[j],pool[k]];
      o[pool[k]]++;
    }
  }
  return o;
}
/** @param {number[]} o @param {number[]} e @returns {number} */
function chi(o,e) {
  return o.reduce((s,v,i)=>s+(v-e[i])**2/(e[i]+1e-8),0);
}
/** @param {number[]} o @param {Population} p @param {number[]} w */
function dot(o,p,w) {
  return o.reduce((s,v,i)=>s+(v-p.e[i])*w[i],0);
}

/**
 * Monte Carlo conditional pooled test + mutually held-out source page halves.
 * Early pages 0..27; late physical-record pages 28..55 except rune-free 50.
 * Residual training weights shrink by +4 expected samples per rune.
 * The null preserves each page's observed whole-word initial inventory.
 * @param {Word[]} words
 * @param {string[]} fields
 * @param {boolean} excludeRed
 * @param {number} seed
 * @param {boolean} dashOnly
 */
function evaluate(words,fields,excludeRed,seed,dashOnly=false) {
  const all = population(words,fields,excludeRed,0,55,dashOnly);
  const early = population(words,fields,excludeRed,0,28,dashOnly);
  const late = population(words,fields,excludeRed,28,55,dashOnly);
  const wE = early.o.map((v,i)=>(v-early.e[i])/(early.e[i]+4));
  const wL = late.o.map((v,i)=>(v-late.e[i])/(late.e[i]+4));
  const actual = chi(all.o,all.e);
  const forward = dot(late.o,late,wE);
  const reverse = dot(early.o,early,wL);
  const next = rng(seed);
  const n = 10000;
  let high=0,highF=0,highR=0;
  for (let j=0;j<n;j++) {
    high += Number(chi(draw(all.groups,next),all.e)>=actual);
    highF += Number(dot(draw(late.groups,next),late,wE)>=forward);
    highR += Number(dot(draw(early.groups,next),early,wL)>=reverse);
  }
  return {
    n:all.n, early:early.n, late:late.n,
    chi:+actual.toFixed(6), fixed:all.fixed,
    nullP:(high+1)/(n+1),
    earlyToLateP:(highF+1)/(n+1),
    lateToEarlyP:(highR+1)/(n+1),
    high,highF,highR
  };
}

function main() {
  const source = parseWords(lp2,true);
  const old = parseWords(lp1,false);
  assert.equal(source.pages,55);
  assert.equal(source.runes,12956);
  assert.equal(source.words.length,2928); // 2896 printed words + 32 carries
  assert.equal(source.words.filter(w=>w.line).length,206);
  assert.equal(source.words.filter(w=>w.line&&!w.first).length,151);
  assert.equal(source.words.filter(w=>w.line&&!w.first&&!w.red).length,144);
  assert.equal(old.pages,15);
  assert.equal(old.runes,2797);
  assert.equal(old.words.filter(w=>w.line).length,73);
  const variants = [
    {name:'source-native first advance only',f:['first'],red:true},
    {name:'source-native first+word advance',f:['first','sum'],red:true},
    {name:'source-native first+word length',f:['first','length'],red:true},
    {name:'source-native first+word advance+length',f:['first','sum','length'],red:true},
    {name:'preceding-word-length conditioned',f:['first','sum','length','previous'],red:true},
    {name:'punctuation+preceding-word-length conditioned',f:['first','sum','length','delimiter','previous'],red:true},
    {name:'dash-only+preceding-word-length conditioned',f:['first','sum','length','previous'],red:true,dash:true}
  ];
  const tests = variants.map((v,i)=>({
    name:v.name,...evaluate(source.words,v.f,v.red,(0x13062026+i)>>>0,!!v.dash)
  }));
  const lp1Control = evaluate(old.words,['first','sum','length'],false,0x1f1f1f1f);
  // Stable source-format checks; significance alone is not acceptance.
  assert.equal(tests[3].n,144);
  assert.equal(tests[3].fixed,34);
  assert.equal(tests[4].n,144);
  assert.equal(tests[4].fixed,70);
  assert.equal(tests[5].fixed,77);
  assert.equal(tests[6].n,127);
  assert.equal(lp1Control.n,58);
  console.log(JSON.stringify({
    evidence:'Original-source conditional compositor test, not plaintext',
    directGlyphAdvanceSource:'sims/source_glyph_advance_inversion.py + 60.jpg, checked 61.jpg',
    physicalWords:2896, wordFragments:2928, sourceStartRunes:206,
    nonPageSelected:151, nonPageNonredSelected:144,
    null:'Within each original physical page and source-visible feature bin, sample the observed count without replacement from original word fragments',
    nMonteCarlo:10000, tests,lp1Control,
    limitation:'Exploratory multiple models; small site counts; conditioning 70-77 of 144 sites renders those fixed; no independent authored selector, cipher key, or authentic plaintext.'
  },null,2));
}
if (require.main === module) main();
