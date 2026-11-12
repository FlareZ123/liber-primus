"use strict";
/**
 * Agent48: source-locked 1832 and 1842 Lady of Shalott quotation test (#635).
 * Run from repository root: node sims/lp2_tennyson_quote_source_sft.cjs
 * Node.js 22 CommonJS; no external modules, network, or broad book search.
 *
 * Original text witness:
 *   https://github.com/GITenberg/The-Early-Poems-of-Alfred-Lord-Tennyson_8601/blob/master/8601.txt
 *   SHA-1 Git blob f8b91a01e538f0d5c6400a4da728a27a46b4aff7
 *   poem substring UTF-16 indices [135593,141652), including footnote tags.
 * 1832 full source:
 *   https://github.com/kjhealy/mptc/blob/6e784a2f90d22b0735a63417bda513349d5be416/files/examples/shalott_1832.txt
 *   Git blob 2856e7777a09d306a7bbd53051a41579fe6aed82
 * Compare the original seven runic quote windows without fitting a key.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const sha256 = s => createHash("sha256").update(s, "utf8").digest("hex");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const quotes = JSON.parse(read("resources/liber-primus/lp2-quote-punctuation-spans.json")).quotes;
const originalSource = read("resources/liber-primus/lp2-transcription.txt");
const runes = new Set(corpus.runes);

/** @returns {{start:number,end:number,glyphs:string,length:number}[]} */
function originalWords() {
  let runeOffset = 0;
  let start = 0;
  let current = "";
  const words = [];
  function flush() {
    if (!current) return;
    words.push({start, end:runeOffset, glyphs:current, length:[...current].length});
    current = "";
  }
  for (const char of originalSource.split("%").slice(0,55).join("%")) {
    if (runes.has(char)) {
      if (!current) start = runeOffset;
      current += char;
      runeOffset++;
    } else if (char === "%" || char === "/" || /\s/u.test(char)) {
      // Original page and line wraps preserve continued printed words.
    } else flush();
  }
  flush();
  assert.equal(runeOffset,12956);
  assert.equal(words.length,2896);
  return words;
}

/**
 * Source graphemes as alphabetic runs. The editorial [n] markers and
 * PART headings were outside the poem itself, and are stripped first.
 * @param {string} s
 * @returns {string[]}
 */
function poemWords(s) {
  return (s.replace(/\[\d{1,2}\]/gu,"")
    .replace(/^\s*PART\s+(?:I|II|III|IV)\s*$/gmu,"")
    .toUpperCase().match(/[A-Z]+/gu) || []);
}

const tokens = corpus.translit.slice().sort((a,b)=>b.length-a.length);
/** @param {string} raw @param {boolean} foldIng @returns {number} */
function gpLength(raw,foldIng) {
  let w=raw.replace(/QU/gu,"CW").replace(/V/gu,"U")
    .replace(/[KQ]/gu,"C").replace(/Z/gu,"S");
  if(foldIng) w=w.replace(/ING/gu,"NG");
  let length=0;
  for(let i=0;i<w.length;) {
    const token=tokens.find(t=>w.startsWith(t,i));
    assert(token,"unknown GP token at "+i+" in "+w);
    i+=token.length;
    length++;
  }
  return length;
}

/**
 * Longest exact contiguous source/quotation word-length run.
 * @param {number[]} source
 * @param {number[]} target
 * @returns {{complete:number,n:number,s:number,q:number,runes:number}}
 */
function match(source,target) {
  const dp=new Uint16Array(target.length);
  const prefix=[0];
  for(const len of target) prefix.push(prefix.at(-1)+len);
  let complete=0;
  let best={complete:0,n:0,s:-1,q:-1,runes:0};
  for(let i=0;i<source.length;i++) {
    for(let j=target.length-1;j>=0;j--) {
      dp[j]=source[i]===target[j] ? (j===0 ? 1 : dp[j-1]+1) : 0;
      const n=dp[j];
      if(!n)continue;
      const runes=prefix[j+1]-prefix[j+1-n];
      if(n>best.n || (n===best.n && runes>best.runes)) {
        best={complete:0,n,s:i-n+1,q:j-n+1,runes};
      }
    }
    if(dp[target.length-1]===target.length) complete++;
  }
  return {...best,complete};
}

/** Stable wrong-order control. @param {number[]} a @param {number} seed */
function shuffle(a,seed) {
  const result=a.slice();
  let x=seed>>>0;
  for(let i=result.length-1;i>0;i--) {
    x^=x<<13;x^=x>>>17;x^=x<<5;
    const j=(x>>>0)%(i+1);
    [result[i],result[j]]=[result[j],result[i]];
  }
  return result;
}

assert.equal(quotes.length,7);
const original=originalWords();
const expectedCounts=[4,5,2,14,13,34,14];
const expectedSha=[
  "63fc17007006c722d4499193d3a99e7e21e8a917390b84b650e49effcb1d5897",
  "4f6afe50dd170c5f13fd7ac120084a6660396bead790e11bbf36a2919e58dcd0",
  "5c4a5c8b3d46f45ef5d6defcd70913c30036ed6e5240e67850ae9c922a3b57b4",
  "bdde0efb32e5411684c5b6ab9344fc16376485e7e1d0defdf4adb30e06250148",
  "5396834f1468f0efde79621ad13fcb02a8f5f31909552ed9db904e96c8b8ba88",
  "910ed2b11ffad802b8d269297296731a486a98c1fc17a232fa03bcf92d9c2a7e",
  "9601a31e0197eb30af7e03bc41c57ed18f964b9c3cb3ce010eb1f439ebf57e6c"
];
const tape=quotes.map((q,i)=>{
  const selected=original.filter(w=>w.start>=q.start && w.end<=q.end);
  assert.equal(selected[0]?.start,q.start);
  assert.equal(selected.at(-1)?.end,q.end);
  assert.equal(selected.length,expectedCounts[i]);
  assert.equal(selected.reduce((s,w)=>s+w.length,0),q.end-q.start);
  assert.equal(sha256(selected.map(w=>w.glyphs).join("")),expectedSha[i]);
  return selected.map(w=>w.length);
});
assert.equal(tape.reduce((s,a)=>s+a.reduce((n,x)=>n+x,0),0),405);

const sources=[
  {
    id:"1832",file:"resources/external/tennyson-lady-of-shalott-1832-mptc.txt",
    expectedWords:1052,expectedFull:5,
    expectedLongest:[[3,3,2,5,4,5,5],[3,3,2,5,3,5,5]]
  },
  {
    id:"1842",file:"resources/external/tennyson-lady-of-shalott-1842-gutenberg8601.txt",
    expectedWords:1003,expectedFull:3,
    expectedLongest:[[3,3,2,4,4,5,4],[3,3,2,4,4,5,4]]
  }
];
const rows=[],sourcesAudited=[];
for (const source of sources) {
  const raw=read(source.file);
  assert(raw.startsWith(source.id==="1832" ? "Part I\n" : "PART I\r\n"));
  assert(raw.includes("Lady of Shalott"));
  const sourceWords=poemWords(raw);
  assert.equal(sourceWords.length,source.expectedWords);
  sourcesAudited.push({edition:source.id,sha256:sha256(raw),sourceWords:sourceWords.length});
  for(const [orthography,foldIng] of [true,false].entries()) {
    const lengths=sourceWords.map(word=>gpLength(word,foldIng));
    // Planted 34-word source-native positive control.
    const seed=lengths.slice(200,234);
    const control=match(lengths,seed);
    assert.equal(control.n,34);
    assert(control.complete>=1);
    for(let quote=0;quote<7;quote++) {
      const observed=match(lengths,tape[quote]);
      const nullMatch=match(shuffle(lengths,0x33012012),tape[quote]);
      assert.equal(observed.complete,quote===2?source.expectedFull:0);
      assert.equal(observed.n,source.expectedLongest[orthography][quote]);
      rows.push({
        source:source.id,foldIng,quote,
        quoteWords:tape[quote].length,quoteRunes:tape[quote].reduce((a,b)=>a+b,0),
        ...observed,wrongOrderLongest:nullMatch.n,
        sourceExcerpt:sourceWords.slice(observed.s,observed.s+observed.n).join(" ")
      });
    }
  }
}
/**
 * Quote 2 is only two original complete words (3 + 9 GP runes). To test
 * the strongest possible source-family candidate before rejecting it,
 * enumerate every 3/9 contiguous pair in the complete Emerson volume
 * and in both exact poem witnesses, then grant an arbitrary *unknown*
 * monoalphabetic GP29 bijection. Ciphertext GP indices 28 and 20 recur
 * at 0,8 and 2,5 respectively, so both corresponding GP plaintext
 * positions must also be equal. No key guessing or scoring is used.
 */
const q2=original.filter(w=>w.start>=quotes[2].start && w.end<=quotes[2].end);
const q2Cipher=q2.flatMap(w=>[...w.glyphs].map(g=>corpus.runes.indexOf(g)));
assert.deepEqual(q2Cipher,[28,13,20,23,3,20,10,14,28,21,18,4]);

/** @param {string} raw @param {boolean} foldIng */
function nativeWord(raw,foldIng) {
  let w=raw.replace(/QU/gu,"CW").replace(/V/gu,"U")
    .replace(/[KQ]/gu,"C").replace(/Z/gu,"S");
  if(foldIng)w=w.replace(/ING/gu,"NG");
  const indices=[];
  for(let i=0;i<w.length;) {
    const token=tokens.find(t=>w.startsWith(t,i));
    assert(token);
    indices.push(corpus.translit.indexOf(token));
    i+=token.length;
  }
  return indices;
}

/** @param {number[]} plaintext */
function fitsUnknownBijection(plaintext) {
  const forward=new Map(),backward=new Map();
  for(let i=0;i<12;i++) {
    const c=q2Cipher[i],p=plaintext[i];
    if((forward.has(c)&&forward.get(c)!==p)
      ||(backward.has(p)&&backward.get(p)!==c))return false;
    forward.set(c,p);backward.set(p,c);
  }
  return true;
}
// An arbitrary planted permutation with the real original repeated-rune
// pattern is recoverable, while one altered repeated position is rejected.
const plant=q2Cipher.map(x=>(x*11+7)%29);
assert(fitsUnknownBijection(plant));
const bad=plant.slice();bad[8]=(bad[8]+1)%29;
assert(!fitsUnknownBijection(bad));

const sourceFamily=[
  {id:"Emerson Essays First Series #2944",
    file:"resources/control/emerson_essays_2944.txt",
    expectedWords:77932,nativePairs:[570,578],repeatA:[21,21],repeatB:[21,22]},
  ...sources.map(source=>({
    id:"Tennyson "+source.id,file:source.file,
    expectedWords:source.expectedWords,
    nativePairs:source.id==="1832" ? [5,5] : [3,3],
    repeatA:[0,0],repeatB:[0,0]
  }))
];
const quote2AllSecretGate=[];
for(const source of sourceFamily) {
  const raw=read(source.file);
  const words=(source.id.startsWith("Tennyson")
    ?poemWords(raw):(raw.toUpperCase().match(/[A-Z]+/gu)||[]));
  assert.equal(words.length,source.expectedWords);
  for(const [index,foldIng] of [true,false].entries()) {
    const native=words.map(w=>nativeWord(w,foldIng));
    let lengthPairs=0,repeatA=0,repeatB=0,repeatBoth=0,bijections=0;
    for(let j=0;j+1<native.length;j++) {
      if(native[j].length!==3||native[j+1].length!==9)continue;
      lengthPairs++;
      const test=[...native[j],...native[j+1]];
      const a=test[0]===test[8],b=test[2]===test[5];
      if(a)repeatA++;
      if(b)repeatB++;
      if(a&&b)repeatBoth++;
      if(fitsUnknownBijection(test))bijections++;
    }
    assert.equal(lengthPairs,source.nativePairs[index]);
    assert.equal(repeatA,source.repeatA[index]);
    assert.equal(repeatB,source.repeatB[index]);
    assert.equal(repeatBoth,0);
    assert.equal(bijections,0);
    quote2AllSecretGate.push({source:source.id,foldIng,
      sourceWords:words.length,lengthPairs,repeatA,repeatB,repeatBoth,bijections});
  }
}

/**
 * Complete, all-secret monoalphabetic source-family gate over every one of
 * the seven original quotation windows; quotes shorter than the prior
 * 12-word gate now get the full equality constraint as well.
 */
function stationaryMono(candidateCipher,candidatePlain) {
  if(candidateCipher.length!==candidatePlain.length)return false;
  const forward=new Map(),backward=new Map();
  for(let i=0;i<candidateCipher.length;i++) {
    const c=candidateCipher[i],p=candidatePlain[i];
    if((forward.has(c)&&forward.get(c)!==p)
      ||(backward.has(p)&&backward.get(p)!==c))return false;
    forward.set(c,p);backward.set(p,c);
  }
  return true;
}
const allQuoteTargets=quotes.map(q=>{
  const selected=original.filter(w=>w.start>=q.start&&w.end<=q.end);
  return {
    lengths:selected.map(w=>w.length),
    cipher:selected.flatMap(w=>[...w.glyphs].map(g=>corpus.runes.indexOf(g)))
  };
});
const expectedWholeQuotePairs={
  "Emerson Essays First Series #2944":[
    [22,5,570,0,0,0,0],
    [22,6,578,0,0,0,0]
  ],
  "Tennyson 1832":[
    [0,0,5,0,0,0,0],
    [0,0,5,0,0,0,0]
  ],
  "Tennyson 1842":[
    [0,0,3,0,0,0,0],
    [0,0,3,0,0,0,0]
  ]
};
const allQuoteMonoGate=[];
for(const source of sourceFamily) {
  const raw=read(source.file);
  const words=source.id.startsWith("Tennyson")
    ?poemWords(raw):(raw.toUpperCase().match(/[A-Z]+/gu)||[]);
  for(const [mode,foldIng] of [true,false].entries()) {
    const native=words.map(w=>nativeWord(w,foldIng));
    for(const [quoteIndex,q] of allQuoteTargets.entries()) {
      let exactLengthCount=0,secretMonoCount=0;
      for(let i=0;i+q.lengths.length<=native.length;i++) {
        if(!q.lengths.every((n,j)=>native[i+j].length===n))continue;
        exactLengthCount++;
        const plain=native.slice(i,i+q.lengths.length).flat();
        if(stationaryMono(q.cipher,plain))secretMonoCount++;
      }
      assert.equal(exactLengthCount,
        expectedWholeQuotePairs[source.id][mode][quoteIndex]);
      assert.equal(secretMonoCount,0);
      allQuoteMonoGate.push({
        source:source.id,foldIng,quoteIndex,
        sourceWords:words.length,quoteWords:q.lengths.length,
        originalRunes:q.cipher.length,exactLengthCount,secretMonoCount
      });
    }
  }
}
// Source-native all-secret positive: a 14-word Tennyson passage permuted
// through any nonzero GP29 affine alphabet relabeling remains feasible.
const plainPositive=poemWords(read(sources[0].file)).slice(200,214)
  .flatMap(w=>nativeWord(w,true));
const monoPositive=plainPositive.map(p=>(p*11+7)%29);
assert(stationaryMono(monoPositive,plainPositive));

/**
 * Last direct-text rescue for the three *already chosen* editions: allow
 * the ciphertext's original word boundaries to be completely unrelated to
 * the historical source's spaces. Keep rune order, original GP glyphs and
 * a single secret stationary monoalphabetic bijection on every exact
 * quotation rune. This is stronger than the earlier whole-word gate and
 * has no source-derived position/key selection.
 */
const withoutSpacesExpected = {
  "Emerson Essays First Series #2944": [
    [0,0,85,0,0,0,0], [0,0,84,0,0,0,0]
  ],
  "Tennyson 1832": [
    [0,0,0,0,0,0,0], [0,0,0,0,0,0,0]
  ],
  "Tennyson 1842": [
    [0,0,1,0,0,0,0], [0,0,1,0,0,0,0]
  ]
};
const spacingIndependentMonoGate=[];
for(const source of sourceFamily) {
  const raw=read(source.file);
  const words=source.id.startsWith("Tennyson")
    ?poemWords(raw):(raw.toUpperCase().match(/[A-Z]+/gu)||[]);
  for(const [mode,foldIng] of [true,false].entries()) {
    const native=words.flatMap(w=>nativeWord(w,foldIng));
    for(const [quoteIndex,q] of allQuoteTargets.entries()) {
      let matches=0,firstIndex=-1;
      for(let offset=0;offset+q.cipher.length<=native.length;offset++) {
        let forward=new Int16Array(29).fill(-1);
        let backward=new Int16Array(29).fill(-1);
        let compatible=true;
        for(let i=0;i<q.cipher.length;i++) {
          const c=q.cipher[i],p=native[offset+i];
          if((forward[c]>=0&&forward[c]!==p)
            ||(backward[p]>=0&&backward[p]!==c)) {
            compatible=false;break;
          }
          forward[c]=p;backward[p]=c;
        }
        if(compatible) {
          matches++;
          if(firstIndex===-1)firstIndex=offset;
        }
      }
      assert.equal(matches,withoutSpacesExpected[source.id][mode][quoteIndex]);
      spacingIndependentMonoGate.push({
        source:source.id,foldIng,quoteIndex,
        sourceRuneCount:native.length,
        quoteRunes:q.cipher.length,matches,firstIndex
      });
    }
  }
}

console.log(JSON.stringify({
  spacingIndependentMonoGate,
  allQuoteMonoGate,
  quote2AllSecretGate,
  editions:sourcesAudited,originalWords:original.length,
  originalRuneCount:12956,positivePlant:"source-native 34-word recovered",
  matches:rows,
  conclusion:"Neither 1832 nor 1842 poem supplies a 12-word / 40-rune exact quotation crib; historical Emerson whole-book maximum was already nine."
},null,2));
