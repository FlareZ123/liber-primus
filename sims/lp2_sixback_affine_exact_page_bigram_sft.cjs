'use strict';

/**
 * Original LP2 six-back GP29 affine-family test conditioned on *every*
 * original page's directed bigram inventory and original printed words.
 * Unlike a fixed-map screen, each null book selects its own best map
 * among all 812 invertible affine (a,b) transforms.
 *
 * Run Windows: node sims/lp2_sixback_affine_exact_page_bigram_sft.cjs
 * Node.js 22, CommonJS, no network, no output file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const text = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const original = pages.flatMap(p => p.indices);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const words = text.split('%').slice(0, 55).join('%').split(/[-.&$§]/u)
  .map(part => [...part].filter(g => runeIndex.has(g)).map(g => runeIndex.get(g)))
  .filter(w => w.length);
assert.equal(pages.length, 55);
assert.equal(original.length, 12956);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), original);
const pairs = [];
let offset = 0;
for (const word of words) {
  for (let i = 6; i < word.length; i++) pairs.push([offset + i - 6, offset + i]);
  offset += word.length;
}
assert.equal(offset, original.length);
assert.equal(pairs.length, 1290);

/** @param {number} n @returns {number} */
function mod(n) { return (n % 29 + 29) % 29; }
/** @param {number[]} book @returns {{best:number,a:number,b:number,winners:number,fixedT6:number}} */
function score(book) {
  const counts = new Uint16Array(812);
  for (const [past, current] of pairs) {
    const x = book[past], y = book[current];
    for (let a = 1; a <= 28; a++)
      counts[(a - 1) * 29 + mod(y - a * x)]++;
  }
  let best = 0, index = -1, winners = 0;
  for (let i = 0; i < counts.length; i++) {
    if (counts[i] > best) { best = counts[i]; index = i; winners = 1; }
    else if (counts[i] === best) winners++;
  }
  return {best, a: Math.floor(index / 29) + 1,
    b: index % 29, winners, fixedT6: counts[(27-1)*29+24]};
}
assert.deepEqual(score(original), {best:80,a:27,b:24,winners:1,fixedT6:80});

/** @param {number} initial @returns {()=>number} */
function randomGenerator(initial) {
  let state = initial >>> 0;
  return () => {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}
const random = randomGenerator(0x712623a5);
/** @param {number} n @returns {number} */
function randomIndex(n) { return Math.floor(random() * n); }
/** @param {number[]} source */
function graph(source) {
  const out = Array.from({length: 29}, () => []);
  for (let i = 1; i < source.length; i++) out[source[i-1]].push(source[i]);
  return {source,out,root:source[source.length-1]};
}
const graphs = pages.map(p => graph(p.indices));

/**
 * Uniform labeled-edge Euler-trail sampling with cycle-popped last-exit tree.
 * This is the original exact-page-bigram sampler's graph construction, with
 * a fresh frozen seed for the independent affine-family statistic.
 * @param {{source:number[],out:number[][],root:number}} g
 * @returns {number[]}
 */
function randomEuler(g) {
  const {source,out,root} = g;
  const last = new Int16Array(29).fill(-1);
  for (let v = 0; v < 29; v++)
    if (v !== root && out[v].length) last[v] = randomIndex(out[v].length);
  let ready = false;
  while (!ready) {
    ready = true;
    for (let v = 0; v < 29 && ready; v++) {
      if (v === root || !out[v].length) continue;
      const position = new Int16Array(29).fill(-1);
      const trail = [];
      let vertex = v;
      while (vertex !== root && position[vertex] === -1) {
        assert.ok(last[vertex] >= 0);
        position[vertex] = trail.length;
        trail.push(vertex);
        vertex = out[vertex][last[vertex]];
      }
      if (vertex !== root) {
        ready = false;
        for (const cycleVertex of trail.slice(position[vertex]))
          last[cycleVertex] = randomIndex(out[cycleVertex].length);
      }
    }
  }
  const shuffled = out.map((values, vertex) => {
    const edges = values.map((dest, label) => ({dest,label}));
    for (let i = edges.length - 1; i > 0; i--) {
      const j = randomIndex(i + 1);
      [edges[i],edges[j]] = [edges[j],edges[i]];
    }
    if (vertex !== root && last[vertex] >= 0) {
      const index = edges.findIndex(x => x.label === last[vertex]);
      assert.ok(index >= 0);
      edges.push(edges.splice(index, 1)[0]);
    }
    return edges;
  });
  const cursor = new Uint16Array(29);
  const result = [source[0]];
  let current = source[0];
  for (let i = 1; i < source.length; i++) {
    const edge = shuffled[current][cursor[current]++];
    assert.ok(edge);
    current = edge.dest;
    result.push(current);
  }
  assert.equal(current, root);
  for (let v = 0; v < 29; v++) assert.equal(cursor[v],shuffled[v].length);
  return result;
}
/** @param {number[]} first @param {number[]} second */
function verifyEdges(first,second) {
  assert.equal(first.length,second.length);
  assert.equal(first[0],second[0]);
  assert.equal(first.at(-1),second.at(-1));
  const diff = new Int16Array(29*29);
  for (let i = 1; i < first.length; i++) {
    diff[first[i-1]*29+first[i]]++;
    diff[second[i-1]*29+second[i]]--;
  }
  assert.ok(diff.every(v=>v===0));
}

/**
 * New independent-half statistic evaluated under the same exact original-page
 * bigram-preserving null. The whole-book winner was retrospectively selected.
 * We test whether the winner of each disjoint original-source half agrees.
 * @param {number[]} book
 */
function splitRank(book){
 const counts=[new Uint16Array(812),new Uint16Array(812)];
 const pairsByHalf=[0,0];
 for(const [past,current] of pairs){
  const half=Number(current>=6478);
  pairsByHalf[half]++;
  const c=counts[half],x=book[past],y=book[current];
  for(let a=1;a<=28;a++)
   c[(a-1)*29+mod(y-a*x)]++;
 }
 return counts.map((c,i)=>{
  let max=-1,winner=-1,ties=0;
  for(let k=0;k<c.length;k++){
   if(c[k]>max){max=c[k];winner=k;ties=1;}
   else if(c[k]===max)ties++;
  }
  return {pairs:pairsByHalf[i],max,
   a:Math.floor(winner/29)+1,b:winner%29,
   winner,ties,sourceFixed:c[(27-1)*29+24]};
 });
}
const observedSplit=splitRank(original);
assert.deepEqual(observedSplit.map(s=>({pairs:s.pairs,max:s.max,a:s.a,b:s.b,ties:s.ties})),
 [{pairs:644,max:40,a:27,b:24,ties:1},{pairs:646,max:40,a:27,b:24,ties:1}]);

const count = 1500;
let sum = 0, squares = 0, fixedSum = 0, maximum = -1, minimum = Infinity;
let exceed = 0, fixedExceed = 0;
let sameSplitWinner=0, bothSourceWinner=0, bothFixed40=0;
for (let trial = 0; trial < count; trial++) {
  const candidate = [];
  for (const g of graphs) {
    const page = randomEuler(g);
    if (trial === 0) verifyEdges(g.source,page);
    candidate.push(...page);
  }
  const s = score(candidate);
  const halves = splitRank(candidate);
  if(halves[0].winner===halves[1].winner) sameSplitWinner++;
  if(halves.every(h=>h.winner===(27-1)*29+24)) bothSourceWinner++;
  if(halves.every(h=>h.sourceFixed>=40)) bothFixed40++;
  sum += s.best; squares += s.best*s.best; fixedSum += s.fixedT6;
  maximum = Math.max(maximum,s.best); minimum = Math.min(minimum,s.best);
  if (s.best >= 80) exceed++;
  if (s.fixedT6 >= 80) fixedExceed++;
}
const mean = sum / count, sd = Math.sqrt(squares/count - mean*mean);
assert.equal(sum,100061);
assert.equal(maximum,78);
assert.equal(minimum,61);
assert.equal(exceed,0);
assert.equal(fixedExceed,0);
assert.equal(fixedSum,67026);
assert.ok(Math.abs(mean-66.70733333333334)<1e-10);
assert.ok(Math.abs(sd-2.645816740105255)<1e-10);
// Descriptive source-chapter localization. The winning map itself was
// selected from the entire original book, so chapter counts are not
// independent significance tests.
const chapterRanges = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const pageAtRune = new Uint8Array(original.length);
let runeOffset = 0;
for (const page of pages) {
  pageAtRune.fill(page.page, runeOffset, runeOffset + page.indices.length);
  runeOffset += page.indices.length;
}
const chapterCounts = chapterRanges.map(([first,last]) =>
  ({first,last,pairs:0,t6:0}));
for (const [past,current] of pairs) {
  const page = pageAtRune[current];
  const chapter = chapterCounts.find(c => c.first <= page && page <= c.last);
  assert.ok(chapter);
  chapter.pairs++;
  chapter.t6 += Number(original[current] === mod(24 - 2*original[past]));
}
assert.deepEqual(chapterCounts.map(c => [c.pairs,c.t6]),
  [[79,6],[106,6],[184,10],[178,13],[100,5],
   [144,11],[162,9],[302,20],[35,0]]);
assert.equal(chapterCounts.reduce((s,c) => s+c.t6,0),80);
const insideSix = new Uint8Array(original.length);
for (const [,current] of pairs) insideSix[current] = 1;
let allSix = 0, localSix = 0;
for (let i = 6; i < original.length; i++) {
  if (original[i] === mod(24 - 2*original[i-6])) {
    allSix++;
    localSix += insideSix[i];
  }
}
const wholeSix = {all:allSix,inside:localSix,outside:allSix-localSix,
  allSlots:original.length-6,insideSlots:pairs.length,
  outsideSlots:original.length-6-pairs.length};
assert.deepEqual(wholeSix,
  {all:482,inside:80,outside:402,allSlots:12950,
   insideSlots:1290,outsideSlots:11660});


console.log(JSON.stringify({
  source:'unaltered original 55 LP2 rune pages, 2896 printed words',
  nRunes:original.length,wordLocalLag6Pairs:pairs.length,
  family:'all invertible GP29 affine six-back maps, 28*29=812',
  observed:score(original),
  sourceHalfReplication:{
   observed:observedSplit,
   nullSameWinner:sameSplitWinner,
   nullBothSourceWinner:bothSourceWinner,
   nullBothSourceFixedAtLeast40:bothFixed40,
   nullTrials:count,
   nullConditioning:'Exact original-page directed bigrams',
  },
  originalSourceChapters:chapterCounts,
  originalWholeStreamSixBack:wholeSix,
  null:'uniform original-page labeled-edge Euler trails; exact per-page ordered bigrams, original endpoints and printed words',
  seed:'0x712623a5',trialCount:count,
  nullBest:{mean,sd,min:minimum,max:maximum,upperHits:exceed,
    plusOneUpperTail:(exceed+1)/(count+1)},
  nullFixedT6:{mean:fixedSum/count,upperHits:fixedExceed},
  interpretation:'T6 six-back excess persists beyond exact page-bigram count conditioning, but is retrospectively selected and yields no plaintext'
},null,2));
