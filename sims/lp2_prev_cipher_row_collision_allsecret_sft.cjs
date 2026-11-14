'use strict';

/**
 * Source-exact, secret-key-independent collision gate for a predecessor-indexed
 * GP29 substitution: C[i] = row[scope, C[i-1]][P[i]].
 * A row is an arbitrary hidden 29-symbol permutation; different pages may
 * have entirely independent secret rows. The quantity measured below is
 * unchanged by every such secret permutation.
 *
 * Original input: 55 rune-bearing unknown LP2 pages, 12,956 runes and
 * 2,896 complete words. Word/line/page wrap grammar is not guessed.
 * Positive controls use word-length-matched, authentic English corpus words,
 * then encrypt them with an unknown 29-permutation per predecessor state.
 * The cipher is deliberately biased AGAINST adjacent equality.
 *
 * Run: node sims/lp2_prev_cipher_row_collision_allsecret_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.join(__dirname, '..');
/** @param {string} relative */
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const raw = read('resources/lp2-transcription.txt');
const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
const content = raw.split('%').slice(0, 55).join('%');

/** @type {Array<{value:number,page:number,wordStart:boolean}>} */
const events = [];
let page = 0;
let wordStart = true;
for (const char of content) {
  if (runeMap.has(char)) {
    events.push({value:runeMap.get(char),page,wordStart});
    wordStart = false;
  } else if (char === '%') {
    page++;
  } else if (char === '/' || /\s/u.test(char)) {
    // Wraps never separate words.
  } else {
    wordStart = true;
  }
}
const initial = events.map(e => e.value);
assert.equal(page, 54);
assert.equal(initial.length, 12956);
assert.equal(events.filter(e => e.wordStart).length, 2896);
assert.deepEqual(initial,
  corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices));
assert.equal(events.slice(1).filter((e, k) =>
  e.page === events[k].page && e.value === events[k].value).length, 86);

const names = corpus.translit.map((token,index) => ({token,index}))
  .sort((a,b) => b.token.length-a.token.length);
/** @param {string} word @returns {number[]} */
function gpWord(word) {
  const normalized = word.toUpperCase().replace(/QU/gu,'CW')
    .replace(/V/gu,'U').replace(/[KQ]/gu,'C').replace(/Z/gu,'S');
  const result = [];
  for(let pos=0;pos<normalized.length;) {
    const match=names.find(x => normalized.startsWith(x.token,pos));
    assert.ok(match, 'Unknown GP text at '+normalized.slice(pos));
    result.push(match.index);
    pos+=match.token.length;
  }
  return result;
}

/** @param {string} sourceText */
function vocabulary(sourceText) {
  /** @type {number[][][]} */
  const buckets=Array.from({length:15},()=>[]);
  for(const word of sourceText.match(/[A-Za-z]+/gu)||[]) {
    const runes=gpWord(word);
    if (runes.length<=14) buckets[runes.length].push(runes);
  }
  assert.ok(buckets.slice(1).every(list=>list.length>0));
  return buckets;
}

/** Xorshift32 pseudorandom generator; seed fixed for reproducibility. */
function random32(seed) {
  let state=seed>>>0;
  assert.ok(state);
  return () => {
    state^=state<<13; state^=state>>>17; state^=state<<5;
    return state>>>0;
  };
}

/**
 * Retain every original word length, in its printed order and original page.
 * Draw independent, real vocabulary words of each required GP length.
 * @param {number[][][]} buckets
 * @param {()=>number} random
 */
function plainPlant(buckets,random) {
  const plain=[];
  for(let i=0;i<events.length;) {
    assert.ok(events[i].wordStart);
    let stop=i+1;
    while(stop<events.length&&!events[stop].wordStart)stop++;
    const pool=buckets[stop-i];
    assert.ok(pool&&pool.length>0);
    const selected=pool[random()%pool.length];
    plain.push(...selected);
    i=stop;
  }
  assert.equal(plain.length,12956);
  return plain;
}

/**
 * Every secret row is bijective. To match the source's rare doublets,
 * force the predecessor output to correspond to rare plaintext NG or J,
 * chosen once per row. The decoder knows these arbitrary secret rows.
 * @param {number} previous
 * @param {()=>number} random
 */
function rowPermutation(previous,random) {
  const row=Array.from({length:29},(_,i)=>i);
  for(let i=28;i>0;i--) {
    const j=random()%(i+1);
    [row[i],row[j]]=[row[j],row[i]];
  }
  const rare=random()%4===0?11:21; // J/NG in 25%/75% secret rows.
  const other=row.indexOf(previous);
  [row[rare],row[other]]=[row[other],row[rare]];
  assert.equal(new Set(row).size,29);
  return row;
}

/**
 * @param {number[]} plain
 * @param {'book'|'page'} scope
 * @param {()=>number} random
 */
function encryptAndVerify(plain,scope,random) {
  const tables=new Map();
  const ciphertext=[];
  let previous=random()%29;
  for(let i=0;i<plain.length;i++) {
    const e=events[i], prior=events[i-1];
    if (scope==='page'&&prior&&prior.page!==e.page)previous=random()%29;
    const key=(scope==='book'?0:e.page)+':'+previous;
    if (!tables.has(key)) tables.set(key,rowPermutation(previous,random));
    const row=tables.get(key);
    const c=row[plain[i]];
    assert.equal(row.indexOf(c),plain[i]);
    ciphertext.push(c);
    previous=c;
  }
  assert.equal(ciphertext.length,12956);
  return ciphertext;
}

/**
 * Secret-row invariant: probability two separate current letters are equal,
 * conditional on identical previous ciphertext rune and source scope.
 * Compare all within-page transitions or ONLY within-complete-word pairs.
 * @param {number[]} sequence
 * @param {'book'|'page'} scope
 * @param {boolean} onlyInsideWords
 */
function rowCollision(sequence,scope,onlyInsideWords) {
  /** @type {Map<number,Uint16Array>} */
  const histograms=new Map();
  let pairs=0;
  for(let i=1;i<sequence.length;i++) {
    const now=events[i],before=events[i-1];
    if (now.page!==before.page ||
      (onlyInsideWords&&now.wordStart))continue;
    pairs++;
    const group=(scope==='book'?0:now.page)*29+sequence[i-1];
    let row=histograms.get(group);
    if(!row){row=new Uint16Array(29);histograms.set(group,row);}
    row[sequence[i]]++;
  }
  let same=0,possible=0;
  for(const row of histograms.values()) {
    let size=0;
    for(const n of row){same+=n*(n-1);size+=n;}
    possible+=size*(size-1);
  }
  assert.ok(possible>0);
  return {pairs,states:histograms.size,same,possible,value:same/possible};
}

const groups=['book','page'];
const observed=Object.fromEntries(groups.map(scope=>[scope,{
  all:rowCollision(initial,scope,false),
  withinWords:rowCollision(initial,scope,true)
}]));
assert.equal(observed.page.all.pairs,12901);
assert.equal(observed.page.withinWords.pairs,10028);
assert.equal(observed.page.all.same,3838);
assert.equal(observed.page.all.possible,108018);
assert.equal(observed.page.withinWords.same,2300);
assert.equal(observed.page.withinWords.possible,65058);
assert.equal(observed.book.all.same,202956);
assert.equal(observed.book.all.possible,5738428);

function summarize(series, observedScore) {
  const sorted=series.slice().sort((a,b)=>a-b);
  return {
    minimum: sorted[0],median:sorted[Math.floor(sorted.length/2)],
    maximum:sorted[sorted.length-1],
    countAtOrBelowOriginal:sorted.filter(x=>x<=observedScore).length,
    samples:sorted.length
  };
}
const references=[
  ['gibran','resources/control/gibran_prophet_58585.txt'],
  ['shakespeare','resources/control/shakespeare_first300k.txt'],
  ['emerson','resources/control/emerson_essays_2944.txt']
];
const trialCount=48, control={};
for(let s=0;s<references.length;s++) {
  const [name,filename]=references[s], buckets=vocabulary(read(filename));
  const random=random32((0x4a11ca34+0x1000333*s)>>>0);
  const byScope=Object.fromEntries(groups.map(x=>[x,{
    all:[],withinWords:[],adjacentEquals:[]
  }]));
  for(let trial=0;trial<trialCount;trial++) {
    const clear=plainPlant(buckets,random);
    for(const scope of groups) {
      const cipher=encryptAndVerify(clear,scope,random);
      byScope[scope].all.push(rowCollision(cipher,scope,false).value);
      byScope[scope].withinWords.push(
        rowCollision(cipher,scope,true).value);
      byScope[scope].adjacentEquals.push(
        cipher.slice(1).filter((v,i) =>
          events[i+1].page===events[i].page&&v===cipher[i]).length);
    }
  }
  control[name]=Object.fromEntries(groups.map(scope=>[scope,{
    all:summarize(byScope[scope].all,observed[scope].all.value),
    withinWords:summarize(byScope[scope].withinWords,
      observed[scope].withinWords.value),
    adjacentEquals:summarize(byScope[scope].adjacentEquals,86)
  }]));
  assert.ok(groups.every(scope=>
    control[name][scope].all.countAtOrBelowOriginal===0&&
    control[name][scope].withinWords.countAtOrBelowOriginal===0));
}

const output={
  status:'PASS',classification:'reference-conditional predecessor-row cipher gate; no original plaintext',
  originalSourceSHA256:crypto.createHash('sha256').update(raw).digest('hex'),
  originalRunes:12956,originalWords:2896,originalDoublets:86,
  model:'C_i = arbitrary-secret permutation[scope,C_previous](P_i)',
  testInvariant:'conditional within-row identical pair collision',
  observed,
  plantedSources:control,
  positiveControls:'288 full-corpus 12,956-rune bijective row cipher inversions, 144 native word plants',
  limitations:'Reference-conditional: changing rows by word position, a running pad, transposition, non-GP registers or another language are outside this model.'
};
console.log(JSON.stringify(output,null,2));
