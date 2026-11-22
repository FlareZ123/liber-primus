"use strict";
/**
 * SFT: original p0 and p1 matching black-cross artwork as a candidate
 * common GP29 additive pad, granting both directions and signs.
 * A common unknown keystream cancels as C0-C1=P0-P1 (same additive sign)
 * or C0+C1=P0+P1 (opposing signs), or as C0/C1=P0/P1
 * (common nonzero multiplicative pad) or C0*C1=P0*P1
 * (opposing reciprocal pads) over GF(29).
 * Both original pages are independently allowed forward or reverse reading.
 * All models use their exact source-printed word boundaries.
 *
 * The dynamic program grants every possible GP29 plaintext pair, and
 * minimizes how many source-printed words cannot belong to the generous
 * native-GP English lexicon. Page-edge word fragments are free and unscored.
 *
 * Run: node sims/lp2_p0_p1_cross_sharedpad_sft.cjs
 * Reads committed source files; no network, file writes or extra packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const alphabet = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} text @returns {number[]} */
function toRunes(text) {
  const normalized = text.toUpperCase().replace(/[KVZQ]/g, ch =>
    ({K:"C", V:"U", Z:"S", Q:"C"})[ch]);
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const hit = alphabet.find(x => normalized.startsWith(x.s, i));
    if (hit) {
      out.push(hit.i);
      i += hit.s.length;
    } else i++;
  }
  return out;
}

/* Printed '-' and '.' delimiters; '/' and page marks do not end a word. */
const symbols = [], classes = [];
let buffered = [];
function endWord() {
  for (let i = 0; i < buffered.length; i++) {
    classes.push(buffered.length === 1 ? 3
      : i === 0 ? 0 : i === buffered.length - 1 ? 2 : 1);
  }
  symbols.push(...buffered);
  buffered = [];
}
for (const ch of read("resources/liber-primus/lp2-transcription.txt")) {
  if (runeIndex.has(ch)) buffered.push(runeIndex.get(ch));
  else if (ch === "-" || ch === ".") endWord();
}
endWord();

const original = gp.pages.filter(p => p.page < 56)
  .flatMap(p => p.indices);
assert.equal(original.length, 12956);
assert.deepEqual(symbols.slice(0, original.length), original);
const pages = new Map();
let start = 0;
for (const p of gp.pages.filter(p => p.page < 56)) {
  pages.set(p.page, {
    runes: p.indices,
    classes: classes.slice(start, start + p.indices.length)
  });
  start += p.indices.length;
}
assert.equal(start, 12956);
assert.deepEqual([0,1].map(i => pages.get(i).runes.length), [262,266]);

/** @typedef {{edges: Map<number, number>, terminal: boolean}} TrieNode */
/** @type {TrieNode[]} */
const trie = [{edges: new Map(), terminal: false}];
const dictionary = new Set();
const dictByLength = new Map();
let inputRows = 0;
for (const line of read("resources/control/english_wordfreq_textblob.txt")
  .split("\n")) {
  const m = /^([a-z]+) (\d+)$/.exec(line);
  if (!m) continue;
  inputRows++;
  const tokens = toRunes(m[1]);
  dictionary.add(tokens.join(","));
  if (!dictByLength.has(tokens.length)) dictByLength.set(tokens.length, []);
  dictByLength.get(tokens.length).push(tokens);
  let node = 0;
  for (const symbol of tokens) {
    let next = trie[node].edges.get(symbol);
    if (next === undefined) {
      next = trie.length;
      trie[node].edges.set(symbol, next);
      trie.push({edges: new Map(), terminal: false});
    }
    node = next;
  }
  trie[node].terminal = true;
}
assert.equal(inputRows, 29157);
assert.equal(dictionary.size, 29061);
assert.equal(trie.length, 74946);
/* Reversed printed words remain ordinary English when read physically
 * forward. In source-right-to-left alignment use their reversed token
 * spellings in an independently constructed suffix trie. */
const reverseTrie = [{edges:new Map(), terminal:false}];
for (const word of dictionary) {
  let node=0;
  for (const symbol of word.split(",").map(Number).reverse()) {
    let next=reverseTrie[node].edges.get(symbol);
    if (next===undefined) {
      next=reverseTrie.length;
      reverseTrie[node].edges.set(symbol,next);
      reverseTrie.push({edges:new Map(),terminal:false});
    }
    node=next;
  }
  reverseTrie[node].terminal=true;
}

/**
 * Exactly minimize total non-dictionary COMPLETE words over all pairs of GP29
 * plaintexts satisfying the key-independent difference at each position.
 * Original page carry-prefixes and unfinished final words are uncharged.
 *
 * @param {number} pa
 * @param {number} pb
 * @param {number[]} [cipherA]
 * @param {number[]} [cipherB]
 * @returns {{n:number,minOov:number,firstForced:number|null,maxStates:number,
 *   completeWords:number[], checkpoints:number[][]}}
 */
function inverse29(value) {
  assert(value > 0 && value < 29);
  for(let j=1;j<29;j++) if((j*value)%29===1)return j;
  throw Error('noninvertible nonzero element of prime field');
}

function minOov(pa, pb, cipherA, cipherB, reverseA=false, reverseB=false, op="diff") {
  const plainA = pages.get(pa);
  const plainB = pages.get(pb);
  const reverse = p => ({
    runes: [...p.runes].reverse(),
    classes: [...p.classes].reverse().map(x => x === 0 ? 2 : x === 2 ? 0 : x)
  });
  const a = reverseA ? reverse(plainA) : plainA;
  const b = reverseB ? reverse(plainB) : plainB;
  const ca = cipherA ? (reverseA ? [...cipherA].reverse() : cipherA) : a.runes;
  const cb = cipherB ? (reverseB ? [...cipherB].reverse() : cipherB) : b.runes;
  const n = Math.min(a.runes.length, b.runes.length);
  const dictionaryA = reverseA ? reverseTrie : trie;
  const reverseDictionary = reverseB ? reverseTrie : trie;
  const unknown = Math.max(trie.length, reverseTrie.length);
  const base = unknown + 1;
  const firstA = a.classes[0] === 1 || a.classes[0] === 2 ? unknown : 0;
  const firstB = b.classes[0] === 1 || b.classes[0] === 2 ? unknown : 0;
  let states = new Map([[firstA * base + firstB, 0]]);
  let maxStates = states.size;
  let firstForced = null;
  const checkpoints = [];

  for (let t = 0; t < n; t++) {
    const endA = a.classes[t] === 2 || a.classes[t] === 3;
    const endB = b.classes[t] === 2 || b.classes[t] === 3;
    const delta = (ca[t] + (op === "diff" ? -cb[t] : cb[t]) + 29) % 29;
    const pairs = [];
    if (op === "diff" || op === "sum") {
      for (let runeA=0;runeA<29;runeA++)
        pairs.push([runeA,(op === "diff" ? runeA-delta+29:delta-runeA+29)%29]);
    } else {
      const cA=ca[t],cB=cb[t];
      if (cA===0&&cB===0) pairs.push([0,0]);
      else if (cA===0) for(let runeB=1;runeB<29;runeB++) pairs.push([0,runeB]);
      else if (cB===0) for(let runeA=1;runeA<29;runeA++) pairs.push([runeA,0]);
      else for(let runeA=1;runeA<29;runeA++) {
        const runeB=op === "mulSame"
          ? (runeA*cB*inverse29(cA))%29
          : (cA*cB*inverse29(runeA))%29;
        pairs.push([runeA,runeB]);
      }
    }
    const next = new Map();
    for (const [key, cost] of states) {
      const nodeA = Math.floor(key / base);
      const nodeB = key % base;
      for (const [runeA,runeB] of pairs) {
        let newA = nodeA === unknown ? unknown
          : dictionaryA[nodeA].edges.get(runeA);
        let newB = nodeB === unknown ? unknown
          : reverseDictionary[nodeB].edges.get(runeB);
        let extra = 0;
        if (newA === undefined) {
          newA = unknown;
          extra++;
        } else if (endA && newA !== unknown && !dictionaryA[newA].terminal) {
          extra++;
        }
        if (newB === undefined) {
          newB = unknown;
          extra++;
        } else if (endB && newB !== unknown && !reverseDictionary[newB].terminal) {
          extra++;
        }
        const dest = (endA ? 0 : newA) * base + (endB ? 0 : newB);
        const candidate = cost + extra;
        const prior = next.get(dest);
        if (prior === undefined || candidate < prior)
          next.set(dest, candidate);
      }
    }
    states = next;
    maxStates = Math.max(maxStates, states.size);
    let least = Infinity;
    for (const cost of states.values()) least = Math.min(least, cost);
    if (least > 0 && firstForced === null) firstForced = t;
    if ((t + 1) % 50 === 0 || t === n - 1)
      checkpoints.push([t + 1, least, states.size]);
    assert(states.size <= 100000, "unexpected DP state explosion");
  }
  return {
    n, minOov: Math.min(...states.values()), firstForced, maxStates,
    completeWords: [a,b].map(p => p.classes.slice(0, n)
      .filter(c => c === 2 || c === 3).length),
    checkpoints
  };
}


const variants = [
  {reverseA:false, reverseB:false, op:"diff"},
  {reverseA:false, reverseB:false, op:"sum"},
  {reverseA:false, reverseB:true, op:"diff"},
  {reverseA:false, reverseB:true, op:"sum"},
  {reverseA:true, reverseB:false, op:"diff"},
  {reverseA:true, reverseB:false, op:"sum"},
  {reverseA:true, reverseB:true, op:"diff"},
  {reverseA:true, reverseB:true, op:"sum"},
  ...[false,true].flatMap(reverseA=>[false,true].flatMap(reverseB=>
    [{reverseA,reverseB,op:"mulSame"},{reverseA,reverseB,op:"mulInverse"}]))
];
const originals = variants.map(v => ({ ...v,
  ...minOov(0, 1, undefined, undefined, v.reverseA, v.reverseB, v.op)
}));
assert.deepEqual(originals.slice(0,8).map(x => x.minOov), [14, 16, 16, 14, 14, 14, 15, 12]);
assert.deepEqual(originals.slice(0,8).map(x => x.firstForced), [12, 12, 12, 7, 12, 12, 15, 19]);

/* Build native-GP controls from unchanged Gibran words of matching lengths. */
const gibranWords = read("resources/control/gibran_prophet_58585.txt")
  .toUpperCase().match(/[A-Z]+/g).map(toRunes).filter(w => w.length);
assert.equal(gibranWords.length, 15733);
const sourceByLength = new Map();
let nativeOov = 0;
for (const word of gibranWords) {
  if (!sourceByLength.has(word.length)) sourceByLength.set(word.length, []);
  sourceByLength.get(word.length).push(word);
  if (!dictionary.has(word.join(","))) nativeOov++;
}
assert.equal(nativeOov, 292);
let seed = 0x3301650;
/** @param {number} n @returns {number} */
function randomInt(n) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed % n;
}

/** @param {number} page */
function nativePlant(page) {
  const layout = pages.get(page).classes;
  const output = [], status = {
    scoredWords: 0, nativeOov: 0, randomFragments: 0, gibranFallbacks: 0
  };
  for (let i = 0; i < layout.length;) {
    let end = i;
    while (end < layout.length && layout[end] !== 2
      && layout[end] !== 3) end++;
    const complete = end < layout.length;
    const wholeWord = layout[i] === 0 || layout[i] === 3;
    if (complete && wholeWord) {
      const length = end - i + 1;
      let options = sourceByLength.get(length);
      if (!options || !options.length) {
        options = dictByLength.get(length);
        status.gibranFallbacks++;
      }
      assert(options && options.length);
      const selected = options[randomInt(options.length)];
      output.push(...selected);
      status.scoredWords++;
      if (!dictionary.has(selected.join(","))) status.nativeOov++;
      i = end + 1;
    } else {
      const count = complete ? end - i + 1 : layout.length - i;
      for (let j = 0; j < count; j++) output.push(randomInt(29));
      status.randomFragments += count;
      i += count;
    }
  }
  assert.equal(output.length, layout.length);
  return {output, status};
}


/* The one-pad positive plant follows the source page-word layout while
 * giving the investigator a wholly unknown per-position key.  Reversing
 * p1 also reverses the p1 word boundary classes, with start/end swapped. */
const controls = [];
for (const {reverseA, reverseB, op} of variants) {
  const a = nativePlant(0), b = nativePlant(1);
  const n = Math.min(a.output.length, b.output.length);
  const nonzero=op === "mulSame"||op === "mulInverse";
  const K = Array.from({length:n}, () => nonzero ? randomInt(28)+1 : randomInt(29));
  const independent = Array.from({length:n}, () => nonzero ? randomInt(28)+1 : randomInt(29));
  const encA = a.output.map((x,i) => {
    const t = reverseA ? a.output.length - 1 - i : i;
    return nonzero ? (x*K[t])%29 : (x+K[t])%29;
  });
  const encB = b.output.map((x,i) => {
    const t = reverseB ? b.output.length - 1 - i : i;
    if (t >= n) return x;
    if(nonzero) return (x*(op === "mulSame"?K[t]:inverse29(K[t])))%29;
    const k = op === "diff" ? K[t] : 29 - K[t];
    return (x+k)%29;
  });
  const encWrongB = b.output.map((x,i) => {
    const t = reverseB ? b.output.length - 1 - i : i;
    if (t >= n) return x;
    if(nonzero) return (x*(op === "mulSame"?independent[t]:inverse29(independent[t])))%29;
    const k = op === "diff" ? independent[t] : 29-independent[t];
    return (x+k)%29;
  });
  for (let t=0;t<n;t++) {
    const j=reverseB ? b.output.length - 1 - t : t;
    const k=reverseA ? a.output.length - 1 - t : t;
    const recoveredA = nonzero ? (encA[k]*inverse29(K[t]))%29
      : (encA[k]-K[t]+29)%29;
    const recoveredB = nonzero ? (encB[j]*(op === "mulSame" ? inverse29(K[t]):K[t]))%29
      : (encB[j] + (op === "diff" ? -K[t] : K[t]) + 29)%29;
    assert.equal(recoveredA,a.output[k]);
    assert.equal(recoveredB,b.output[j]);
  }
  const good = minOov(0,1,encA,encB,reverseA,reverseB,op);
  const bad = minOov(0,1,encA,encWrongB,reverseA,reverseB,op);
  assert(good.minOov <= a.status.nativeOov + b.status.nativeOov + 4);
  controls.push({reverseA,reverseB, op, nativeA:a.status, nativeB:b.status,
    matchedSamePad:good.minOov, independentPads:bad.minOov});

}
assert.deepEqual(controls.slice(0,8).map(x => x.matchedSamePad), [2,2,2,1,1,1,1,3]);
assert.deepEqual(controls.slice(0,8).map(x => x.independentPads), [14,11,16,16,12,15,14,14]);
console.log(JSON.stringify({
  source:"Original LP2 p0+p1 shared black crosses, additive pad both signs and p1 orientations",
  pageLengths:[pages.get(0).runes.length,pages.get(1).runes.length],
  dictionary:{inputRows, gpDistinct:dictionary.size,trieNodes:trie.length},
  originals, controls
}, null,2));
