"use strict";

/**
 * Original flower-page 105-pair word-consistency test for any same-pad
 * five-bit XOR GP29-ordinal page-start reset. Source-native word dictionary
 * domains and exact overlapping original printed word coordinates.
 *
 * Node.js 22 / Windows11 / CommonJS / no writes or external dependencies.
 * SFT: node sims/lp2_floral_page_start_xor_word_csp_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const source = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const physicalTranscript = read("resources/lp2-transcription.txt").split("%").slice(0, 55);
const vocabularyFiles = [
  "resources/control/english_wordfreq_textblob.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
];
const dictionary = new Set(vocabularyFiles.flatMap(file =>
  read(file).toUpperCase().match(/[A-Z]+/g) || []));
const GP = new Map(source.translit.map((token, index) => [token, index]));
const digraphs = ["TH", "EO", "NG", "OE", "AE", "IA", "EA"];

/** Reconstruct frozen source-native English spelling. @param {string} word */
function encodeWord(word) {
  const values = [];
  word = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S")
    .replace(/ING/g, "NG").replace(/IO/g, "IA");
  for (let i = 0; i < word.length;) {
    const token = digraphs.find(x => word.startsWith(x, i)) || word[i];
    const value = GP.get(token);
    if (value === undefined) return [];
    values.push(value);
    i += token.length;
  }
  return values;
}
const byLength = Array.from({length:15}, () => []);
const wordNames = new Map();
const seen = Array.from({length:15}, () => new Set());
for (const word of dictionary) {
  const values = encodeWord(word), n = values.length;
  if (n < 1 || n > 14) continue;
  const id = values.join(",");
  if (!wordNames.has(id)) wordNames.set(id, []);
  wordNames.get(id).push(word);
  if (seen[n].has(id)) continue;
  seen[n].add(id);
  byLength[n].push(values);
}
assert.equal(dictionary.size, 32196);
assert.deepEqual(byLength.slice(1).map(x => x.length),
  [26,194,806,2285,3954,5174,5286,4792,3770,2652,1607,867,422,172]);

const originalRuneMap = new Map(source.runes.map((rune, i) => [rune, i]));
/**
 * Parse only authentic punctuation as a word delimiter, retaining line
 * and page wraps. Drop the first and last word of every page from lexical
 * constraints because a physical page can interrupt a word.
 * @param {number} physicalPage
 */
function parsePage(physicalPage) {
  const offset = physicalPage === 40 ? 8 : physicalPage === 54 ? 9 : 0;
  // Original page50 is rune-free, omitted by the transcript.
  const raw = physicalTranscript[physicalPage >= 51 ?
    physicalPage - 1 : physicalPage];
  let at = 0, first = 0, word = [];
  const words = [];
  function finish() {
    if (word.length) {
      words.push({start:first, end:at, length:word.length, symbols:word});
      word = [];
    }
  }
  for (const character of raw) {
    const value = originalRuneMap.get(character);
    if (value !== undefined) {
      if (word.length === 0) first = at;
      word.push(value);
      at++;
    } else if (character === "/" || /\s/u.test(character)) {
      // Whitespace and slash mark typography, not word termination.
    } else {
      finish();
    }
  }
  finish();
  const black = source.pages[physicalPage].indices.slice(offset);
  assert.equal(black.length, at - offset);
  const valid = words.filter(w => w.start >= offset).map(w => ({
    ...w, start:w.start - offset, end:w.end - offset
  }));
  return {
    page:physicalPage, count:black.length, symbols:black,
    words:valid.slice(1, -1)
  };
}
const flower = source.pages.filter(p =>
  p.page >= 40 && p.page <= 55 && p.indices.length > 0)
  .map(p => parsePage(p.page));
assert.deepEqual(flower.map(p => p.page),
  [40,41,42,43,44,45,46,47,48,49,51,52,53,54,55]);
assert.equal(flower.length, 15);

/**
 * Cross-page same XOR key forces plaintext XOR of each word overlap
 * to equal the original five-bit ciphertext XOR. Compute one constraint
 * with no key or language-model scoring.
 */
function edges(left, right, leftCipher = left.symbols,
  rightCipher = right.symbols) {
  const out = [];
  for (const a of left.words) for (const b of right.words) {
    const start = Math.max(a.start,b.start);
    const end = Math.min(a.end,b.end);
    if (end <= start) continue;
    const delta = [];
    for (let i=start;i<end;i++)
      delta.push(leftCipher[i] ^ rightCipher[i]);
    out.push({a,b,start,end,length:end-start,delta});
  }
  return out.sort((x,y) => y.length - x.length);
}

/** Local, necessary dictionary-word overlap test, independent of key. */
function edgePossible(edge) {
  const {a,b,start,length,delta}=edge;
  const prefixA=start-a.start, prefixB=start-b.start;
  const positions=new Set(byLength[b.length].map(w =>
    w.slice(prefixB,prefixB+length).join(",")));
  for(const candidate of byLength[a.length]) {
    const required=[];
    for(let i=0;i<length;i++)
      required.push(candidate[prefixA+i] ^ delta[i]);
    if(positions.has(required.join(","))) return true;
  }
  return false;
}

/**
 * Enforce arc consistency on the bipartite graph of printed words:
 * each word owns one source-native dictionary entry, each source index
 * shared between the pages creates an exact 5-bit XOR constraint.
 * A zero domain proves this two-time-pad pair impossible under the model.
 */
function arcConsistency(left,right,originalEdges) {
  const aVars=left.words.map((w,i)=>({...w,id:"A"+i,domain:byLength[w.length].slice()}));
  const bVars=right.words.map((w,i)=>({...w,id:"B"+i,domain:byLength[w.length].slice()}));
  const lookupA=new Map(left.words.map((w,i)=>[w,aVars[i]]));
  const lookupB=new Map(right.words.map((w,i)=>[w,bVars[i]]));
  const constraints=originalEdges.map(e=>({...e,a:lookupA.get(e.a),b:lookupB.get(e.b)}));
  let rounds=0,revisions=0,contradiction=null;
  while(rounds<20) {
    rounds++;
    let changed=false;
    for (const edge of constraints) {
      for(const side of ["a","b"]) {
        const variable=edge[side],other=edge[side==="a"?"b":"a"];
        const local=edge.start-variable.start;
        const remote=edge.start-other.start;
        const supported=new Set(other.domain.map(word =>
          word.slice(remote,remote+edge.length).join(",")));
        const oldCount=variable.domain.length;
        variable.domain=variable.domain.filter(word=>{
          const expected=[];
          for(let i=0;i<edge.length;i++)
            expected.push(word[local+i] ^ edge.delta[i]);
          return supported.has(expected.join(","));
        });
        if(variable.domain.length<oldCount) {revisions++; changed=true;}
        if(!variable.domain.length) {
          contradiction={start:edge.start,end:edge.end,length:edge.length,
            side,wordLength:variable.length,
            otherLength:other.length,rounds};
          break;
        }
      }
      if(contradiction) break;
    }
    if(contradiction || !changed) break;
  }
  const forced=[...aVars.map(x=>({...x,page:left.page})),
    ...bVars.map(x=>({...x,page:right.page}))]
    .filter(x=>x.domain.length===1)
    .map(x=>({
      page:x.page,start:x.start,length:x.length,
      words:wordNames.get(x.domain[0].join(",")) || []
    }));
  return {rounds,revisions,contradiction,forced};
}
const comparisons=[],survivors=[];
let evaluatedEdges=0;
for(let i=0;i<flower.length;i++)for(let j=i+1;j<flower.length;j++){
  const left=flower[i],right=flower[j];
  const list=edges(left,right);
  let failing=null,checked=0;
  for(const e of list){
    checked++;evaluatedEdges++;
    if(!edgePossible(e)) {
      failing={start:e.start,end:e.end,length:e.length,
        leftWordLength:e.a.length,rightWordLength:e.b.length};
      break;
    }
  }
  const report={left:left.page,right:right.page,
    overlappingInteriorWords:list.length,checked,failing};
  comparisons.push(report);
  if(!failing) survivors.push({left,right,edges:list,report});
}
assert.equal(comparisons.length,105);
assert.equal(evaluatedEdges,159);
assert.equal(survivors.length,2);
assert.deepEqual(survivors.map(x=>[x.left.page,x.right.page]),
  [[41,49],[46,49]]);
const afterArc=survivors.map(x=>({
  ...x.report,arc:arcConsistency(x.left,x.right,x.edges)
}));
assert(afterArc[0].arc.contradiction);
assert(afterArc[1].arc.contradiction);

// Positive original-shaped plant: retain each of the 15 physical source
// word-interval layouts and choose genuine native-English GP words for them.
const plantedPlaintext=flower.map(page=>{
  const plaintext=Array(page.count).fill(0);
  for(const [i,word] of page.words.entries()) {
    const sample=byLength[word.length][i%byLength[word.length].length];
    plaintext.splice(word.start,word.length,...sample);
  }
  return plaintext;
});
// One COMMON nonzero five-bit key for all page starts. Since 29 glyphs
// occupy only 0..28 in 5-bit space, select each literal bit0 key only if
// every planted glyph at that offset stays representable (never 29).
const maxN=Math.max(...plantedPlaintext.map(x=>x.length));
const key=Array.from({length:maxN},(_,i)=>
  i%2===0 && plantedPlaintext.every(p=>i>=p.length || p[i]!==28) ? 1 : 0);
assert(key.some(x=>x===1));
const planted=plantedPlaintext.map(p=>p.map((x,i)=>x^key[i]));
assert(planted.every(p=>p.every(v=>v>=0 && v<29)));
let positiveCount=0;
for(let i=0;i<flower.length;i++)for(let j=i+1;j<flower.length;j++){
  const plantEdges=edges(flower[i],flower[j],planted[i],planted[j]);
  assert(plantEdges.every(edgePossible));
  positiveCount++;
}
assert.equal(positiveCount,105);
// Genuine solved p56/p57 positive: same literal 5-bit keystream and
// unchanged source-native GP glyphs. Whole receiver remains 29-symbol.
const p57=source.pages[57].indices, p56=source.pages[56].indices;
const n=Math.min(p57.length,p56.length);
let nonzero=0;
for(let i=0;i<n;i++){
  const k=i%2===0 && p57[i]!==28 && p56[i]!==28 ? 1 : 0;
  nonzero+=k;
  const c1=p57[i]^k,c2=p56[i]^k;
  assert(c1<29 && c2<29);
  assert.equal(c1^k,p57[i]);
  assert.equal(c2^k,p56[i]);
  assert.equal(c1^c2,p57[i]^p56[i]);
}
assert(nonzero>0);

console.log(JSON.stringify({
  scope:"15 source-visible floral page starts, 105 pairwise 5-bit XOR shared-pad candidates, complete interior words",
  words:dictionary.size,
  runeDictionaryDomainSizes:byLength.slice(1).map(w=>w.length),
  localOverlap:{pairs:comparisons.length,edgesChecked:evaluatedEdges,
    rejected:comparisons.filter(x=>x.failing).length,
    survivors:survivors.map(x=>[x.left.page,x.right.page])},
  arcConsistency:afterArc.map(x=>({pair:[x.left,x.right],
    contradiction:x.arc.contradiction,
    rounds:x.arc.rounds,revisions:x.arc.revisions,
    forcedWords:x.arc.forced
  })),
  syntheticSamePadPositivePairs:positiveCount,
  originalSolvedP57GP29Positive:n,
  nonzeroSolvedPlantXORClocks:nonzero,
  decision:"103/105 source floral XOR-pad page pairs fail native-English local word constraints, and both remaining 41/49 and 46/49 pairs have globally empty exact word domains under arc consistency. No source-aligned same five-bit XOR pad produces native-English complete words for any original page pair. No plaintext or key recovered."
},null,2));
