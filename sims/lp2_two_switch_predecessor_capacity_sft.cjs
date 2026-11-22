'use strict';
/**
 * Two-switch predecessor-alphabet capacity on all original LP2 ciphertext.
 * A direct, key-independent necessity test. Node.js 22 / CommonJS.
 * Reads only canonical local data, makes no writes or external requests.
 *
 * An independent hidden two-state selector is granted at EVERY rune,
 * and each state plus the previous ciphertext rune chooses any bijective
 * 29-symbol substitution table. This is deliberately much more powerful
 * than a deterministic two-root map or a fixed alternation clock.
 *
 * Run: node sims/lp2_two_switch_predecessor_capacity_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @type {{pages:Array<{page:number,indices:number[],runic_count:number}>,translit:string[]}} */
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const Q = 29;
const E = corpus.translit.indexOf('E');
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const total = pages.reduce((n,p) => n+p.indices.length,0);
const chapterRanges = [[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]];
assert.equal(E,18);
assert.equal(pages.length,55);
assert.equal(total,12956);

/**
 * @param {Array<Array<{indices:number[]}>>} scopes
 * @returns {{counts:number[],transitions:number,starts:number,matrices:number[][][]}}
 */
function capacities(scopes) {
  const matrices = scopes.map(() =>
    Array.from({length:Q},() => Array(Q).fill(0)));
  let starts = 0;
  let transitions = 0;
  for(let group=0;group<scopes.length;group++) {
    for(const page of scopes[group]) {
      starts++;
      for(let i=1;i<page.indices.length;i++) {
        const s=page.indices[i-1], c=page.indices[i];
        assert.ok(s>=0 && s<Q && c>=0 && c<Q);
        matrices[group][s][c]++;
        transitions++;
      }
    }
  }
  const counts = [];
  for(let stateCount=1;stateCount<=4;stateCount++) {
    let max = starts; // All physical-page first runes are unconstrained.
    for(const matrix of matrices) {
      for(const row of matrix) {
        const sorted = [...row].sort((a,b) => b-a);
        for(let state=0;state<stateCount;state++) max+=sorted[state];
      }
    }
    counts.push(max);
  }
  assert.equal(starts+transitions,total);
  return {counts,transitions,starts,matrices};
}
const global = capacities([pages]);
const chapters = capacities(chapterRanges.map(([a,b])=>
  pages.filter(p=>p.page>=a && p.page<=b)));
const physicalPages = capacities(pages.map(p=>[p]));
assert.deepEqual(global.counts,[769,1414,2026,2619]);
assert.deepEqual(chapters.counts,[1310,2344,3258,4097]);
assert.deepEqual(physicalPages.counts,[2790,4787,6429,7893]);

/** @returns {()=>number} */
function generator() {
  let x=0x33012029;
  return () => {x ^= x<<13; x ^= x>>>17; x ^= x<<5; return x>>>0;};
}

/**
 * Construct one maximally generous original-cipher witness: for each
 * previous-ciphertext rune, assign plaintext E to each of that row's
 * two most frequent distinct outputs under two secret bijections.
 * The mode selector is allowed to depend on the actual ciphertext;
 * real manuscript authorship is NOT inferred from this witness.
 *
 * @param {number[][]} matrix
 * @returns {{maps:number[][][],inverses:number[][][],chosen:number[][]}}
 */
function makeTightMaps(matrix) {
  const maps = [[],[]], inverses=[[],[]],chosen=[];
  for(let s=0;s<Q;s++) {
    const ranked=Array.from({length:Q},(_,c)=>c)
      .sort((a,b)=>matrix[s][b]-matrix[s][a] || a-b);
    chosen.push(ranked.slice(0,2));
    for(let mode=0;mode<2;mode++) {
      const top=ranked[mode];
      const other=Array.from({length:Q},(_,i)=>i).filter(c=>c!==top);
      const keys=[top,...other];
      const map=Array(Q).fill(-1), inverse=Array(Q).fill(-1);
      map[E]=keys[0];
      let at=1;
      for(let p=0;p<Q;p++) if(p!==E) map[p]=keys[at++];
      for(let p=0;p<Q;p++) inverse[map[p]]=p;
      assert.equal(new Set(map).size,Q);
      maps[mode][s]=map;
      inverses[mode][s]=inverse;
    }
  }
  return {maps,inverses,chosen};
}
const tight=makeTightMaps(global.matrices[0]);
let originalE=0, originalRoundtripped=0;
for(const page of pages) {
  originalE++; // Grant arbitrary plaintext E for the page first rune.
  for(let j=1;j<page.indices.length;j++) {
    const before=page.indices[j-1], c=page.indices[j];
    const mode=c===tight.chosen[before][1] ? 1 : 0;
    const p=tight.inverses[mode][before][c];
    assert.equal(tight.maps[mode][before][p],c);
    if(p===E) originalE++;
    originalRoundtripped++;
  }
}
assert.equal(originalRoundtripped,12901);
assert.equal(originalE,global.counts[1]);

// Fully working unrelated two-state forward encoder on 12,956 genuine
// solved-page GP-English symbols, with both state flags known to the decoder.
const rng=generator(), secret=[[],[]], secretInverse=[[],[]];
for(let mode=0;mode<2;mode++) {
  for(let s=0;s<Q;s++) {
    const alphabet=Array.from({length:Q},(_,i)=>i);
    for(let j=Q-1;j>0;j--) {
      const k=rng()%(j+1);
      [alphabet[j],alphabet[k]]=[alphabet[k],alphabet[j]];
    }
    secret[mode][s]=alphabet;
    const inverse=Array(Q);
    for(let p=0;p<Q;p++)inverse[alphabet[p]]=p;
    secretInverse[mode][s]=inverse;
  }
}
const solved=corpus.pages.find(p=>p.page===57).indices;
assert.equal(solved.length,95);
assert.equal(solved.filter(v=>v===E).length,15);
let sourceOffset=0, plantRecovered=0, plantE=0;
const plantPages=[];
for(const page of pages) {
  /** @type {number[]} */
  const c=[0],modes=[-1],plain=[];
  for(let j=0;j<page.indices.length;j++)
    plain.push(solved[(sourceOffset+j)%solved.length]);
  sourceOffset += page.indices.length;
  c[0]=(plain[0]+17)%Q; // Arbitrary page-initial seed.
  plantE += +(plain[0]===E);
  for(let j=1;j<plain.length;j++) {
    const mode=rng()&1;
    modes[j]=mode;
    c[j]=secret[mode][c[j-1]][plain[j]];
    const inverse=secretInverse[mode][c[j-1]][c[j]];
    assert.equal(inverse,plain[j]);
    plantRecovered++;
    plantE += +(inverse===E);
  }
  plantPages.push({cipher:c,plain,modes});
}
const planted = capacities([plantPages.map(p=>({indices:p.cipher}))]);
assert.ok(plantE>global.counts[1]);
assert.ok(plantE<=planted.counts[1]);
assert.equal(plantRecovered,12901);
console.log('LP2 original source: '+total+' rune positions, '+global.starts+
  ' unconstrained starts and '+global.transitions+' exact transitions');
console.log('Max frequency of any one plaintext rune under ANY unknown secret'+
  ' predecessor-conditioned bijections, with 1/2/3/4 hidden modes:');
console.log('  Book-static:       '+global.counts.join(' / '));
console.log('  Nine chapter keys: '+chapters.counts.join(' / '));
console.log('  Independent pages: '+physicalPages.counts.join(' / '));
console.log('Tight two-mode original witness: '+originalE+' possible E of '+total+
  ', all '+originalRoundtripped+' constrained source runes exactly replayed');
console.log('Native solved-p57 repeated positive: '+plantE+' E, '+
  plantRecovered+' exact encoded/decoded transitions, own two-mode'+
  ' ciphertext bound '+planted.counts[1]);
console.log('Decision: fixed global two-branch predecessor ciphers cannot produce'+
  ' native-GP plaintext with more than 1414 E runes on this original'+
  ' manuscript. Unknown chapter/page rekeying or >=3 modes remain open.');
