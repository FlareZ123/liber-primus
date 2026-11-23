"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const chapterRanges = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const MAX_SYMBOLS = 29;
const SAMPLES = 256;

function physicalPage(runeBearingPage) {
  return runeBearingPage >= 50 ? runeBearingPage + 1 : runeBearingPage;
}
function chapterOfPage(page) {
  const p = physicalPage(page);
  const index = chapterRanges.findIndex(([a,b]) => p >= a && p <= b);
  assert.ok(index >= 0, "page outside the nine source-visible chapters: " + p);
  return index;
}
function parseOriginalWords(raw) {
  const stream = raw.split("%").slice(0, 55).join("%");
  const words = [];
  let page = 0, runes = [], pages = [];
  function finish() {
    if (runes.length) words.push({runes, pages});
    runes = [];
    pages = [];
  }
  for (const ch of stream) {
    if (runeIndex.has(ch)) {
      runes.push(runeIndex.get(ch));
      pages.push(page);
    } else if (ch === "%") {
      page++;
    } else if (ch === "/" || /\s/u.test(ch)) {
      // Printed line wraps do not terminate words.
    } else {
      finish();
    }
  }
  finish();
  return words;
}
const originalWords = parseOriginalWords(read("resources/liber-primus/lp2-transcription.txt"));
const originalRuneCount = originalWords.reduce((n,w) => n + w.runes.length, 0);
const crossPageWords = originalWords.filter(w => w.pages[0] !== w.pages[w.pages.length - 1]).length;
const maxWordLength = Math.max(...originalWords.map(w => w.runes.length));
assert.deepEqual([originalWords.length, originalRuneCount, crossPageWords, maxWordLength],
  [2896, 12956, 32, 14]);

function encodeGP28Words(text, excluded) {
  const symbols = corpus.translit.map((name,index) => ({name,index}))
    .filter(x => x.name !== excluded)
    .sort((a,b) => b.name.length - a.name.length);
  assert.equal(symbols.length, 28);
  const clean = text.replace(/^#.*$/gm, " ").toUpperCase()
    .replace(/QU/g, "CW").replace(/V/g, "U").replace(/K/g, "C")
    .replace(/Z/g, "S").replace(/Q/g, "C");
  return (clean.match(/[A-Z]+/g) || []).map(word => {
    const out = [];
    for (let j = 0; j < word.length;) {
      const hit = symbols.find(x => word.startsWith(x.name, j));
      assert.ok(hit, "unmappable control text: " + word.slice(j));
      out.push(hit.index);
      j += hit.name.length;
    }
    return out;
  }).filter(w => w.length);
}
function rng32(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}
function makeModel(words, pageReset) {
  const G = chapterRanges.length;
  const T = Array.from({length:G}, () =>
    Array.from({length:maxWordLength}, () =>
      Array.from({length:MAX_SYMBOLS}, () => new Array(MAX_SYMBOLS).fill(0))));
  const mappedPositions = [];
  let repeats = 0, pageCuts = 0, chapterCuts = 0;
  for (let wi = 0; wi < words.length; wi++) {
    const w = words[wi];
    for (let j = 0; j < w.runes.length; j++) {
      const g = chapterOfPage(w.pages[j]);
      if (j === 0) continue;
      const prevChapter = chapterOfPage(w.pages[j-1]);
      if (g !== prevChapter) {
        chapterCuts++;
        continue;
      }
      if (pageReset && w.pages[j] !== w.pages[j-1]) {
        pageCuts++;
        continue;
      }
      const s = w.runes[j-1], y = w.runes[j];
      if (s === y) {
        repeats++;
        continue;
      }
      T[g][j][s][y]++;
      mappedPositions.push({wi,j,g,s,y});
    }
  }
  const U = Array.from({length:G}, () =>
    Array.from({length:maxWordLength}, () => new Array(29).fill(0)));
  for (let g = 0; g < G; g++) {
    for (let j = 1; j < maxWordLength; j++) {
      const rows = T[g][j].map((row,s) =>
        row.filter((_,y) => y !== s).sort((a,b) => b-a));
      for (let k = 1; k <= 28; k++) {
        U[g][j][k] = rows.reduce((sum,row) =>
          sum + row.slice(0,k).reduce((a,b) => a+b, 0), 0);
      }
    }
  }
  return {
    pageReset, T, U, mappedPositions, mapped: mappedPositions.length,
    repeats, pageCuts, chapterCuts, wordStarts: words.length,
    freePositions: words.length + repeats + pageCuts + chapterCuts
  };
}
function evaluateDonor(donorWords, model) {
  const G = chapterRanges.length;
  const counts = Array.from({length:G}, () =>
    Array.from({length:maxWordLength}, () => new Array(29).fill(0)));
  for (const p of model.mappedPositions) counts[p.g][p.j][donorWords[p.wi][p.j]]++;
  let best = {margin:-Infinity,k:0,chapter:-1,position:-1,sourceCap:0,donorTop:0};
  let violations = 0;
  for (let g = 0; g < G; g++) {
    for (let j = 1; j < maxWordLength; j++) {
      const sorted = counts[g][j].slice().sort((a,b) => b-a);
      let sum = 0;
      for (let k = 1; k <= 28; k++) {
        sum += sorted[k-1];
        const margin = sum - model.U[g][j][k];
        if (margin > 0) violations++;
        if (margin > best.margin) {
          best = {margin,k,chapter:g,position:j,
            sourceCap:model.U[g][j][k],donorTop:sum};
        }
      }
    }
  }
  return {violations,best};
}
function donorPools(text, excluded) {
  const byLength = new Map();
  for (const word of encodeGP28Words(text, excluded)) {
    if (!byLength.has(word.length)) byLength.set(word.length, []);
    byLength.get(word.length).push(word);
  }
  for (const w of originalWords) {
    assert.ok(byLength.has(w.runes.length),
      "no " + excluded + "-free native control word of length " + w.runes.length);
  }
  return byLength;
}
function sampleDonorWords(pools, seed) {
  const next = rng32(seed);
  return originalWords.map(w => {
    const pool = pools.get(w.runes.length);
    return pool[next() % pool.length];
  });
}
function positivePlant(donorWords, excluded, pageReset, seed) {
  const excludedIndex = corpus.translit.indexOf(excluded);
  const active = Array.from({length:29},(_,i)=>i).filter(i=>i!==excludedIndex);
  assert.equal(active.length,28);
  const next = rng32(seed);
  const maps = Array.from({length:9},()=>Array.from({length:29},()=>new Array(29).fill(-1)));
  const inverses = Array.from({length:9},()=>Array.from({length:29},()=>new Array(29).fill(-1)));
  for (let g=0;g<9;g++) for (let s=0;s<29;s++) {
    const outputs = Array.from({length:29},(_,i)=>i).filter(i=>i!==s);
    for (let i=27;i>0;i--) {
      const j=next()%(i+1);
      [outputs[i],outputs[j]]=[outputs[j],outputs[i]];
    }
    for (let i=0;i<28;i++) {
      maps[g][s][active[i]]=outputs[i];
      inverses[g][s][outputs[i]]=active[i];
    }
  }
  const cipherWords = [], sidecar = [];
  let sidecarPositions = 0;
  for (let wi=0;wi<originalWords.length;wi++) {
    const source=originalWords[wi], plain=donorWords[wi];
    const cipher=new Array(plain.length), side=new Array(plain.length);
    for (let j=0;j<plain.length;j++) {
      const g=chapterOfPage(source.pages[j]);
      const chapterCut=j>0 && g!==chapterOfPage(source.pages[j-1]);
      const pageCut=j>0 && pageReset && source.pages[j]!==source.pages[j-1];
      const repeat=j>0 && !chapterCut && !pageCut &&
        source.runes[j]===source.runes[j-1];
      if (j===0 || chapterCut || pageCut || repeat) {
        side[j]=plain[j];
        sidecarPositions++;
        cipher[j]=repeat ? cipher[j-1] : next()%29;
      } else {
        const state=cipher[j-1];
        cipher[j]=maps[g][state][plain[j]];
        assert.ok(cipher[j]>=0 && cipher[j]!==state);
      }
    }
    cipherWords.push({runes:cipher,pages:source.pages});
    sidecar.push(side);
  }
  const recovered=[];
  for (let wi=0;wi<cipherWords.length;wi++) {
    const source=originalWords[wi], cipher=cipherWords[wi].runes, side=sidecar[wi];
    const plain=new Array(cipher.length);
    for (let j=0;j<cipher.length;j++) {
      const g=chapterOfPage(source.pages[j]);
      const chapterCut=j>0 && g!==chapterOfPage(source.pages[j-1]);
      const pageCut=j>0 && pageReset && source.pages[j]!==source.pages[j-1];
      const repeat=j>0 && !chapterCut && !pageCut &&
        source.runes[j]===source.runes[j-1];
      if (j===0 || chapterCut || pageCut || repeat) {
        plain[j]=side[j];
      } else {
        const state=cipher[j-1];
        plain[j]=inverses[g][state][cipher[j]];
        assert.ok(plain[j]>=0);
      }
    }
    recovered.push(plain);
  }
  assert.deepEqual(recovered,donorWords);
  return {cipherWords,sidecarPositions,recoveredRunes:recovered.reduce((n,w)=>n+w.length,0)};
}
function main() {
  const controls = [
    ["Gibran","resources/control/gibran_prophet_58585.txt"],
    ["Emerson","resources/control/emerson_essays_2944.txt"],
    ["Shakespeare","resources/control/shakespeare_first300k.txt"]
  ];
  const negative = [];
  for (const excluded of ["EO","OE"]) {
    const pools = controls.map(([name,file]) => ({name,pools:donorPools(read(file),excluded)}));
    for (const pageReset of [false,true]) {
      const model = makeModel(originalWords,pageReset);
      assert.deepEqual([model.mapped,model.repeats,model.pageCuts,model.chapterCuts,
        model.wordStarts,model.freePositions],
        pageReset ? [9965,63,32,0,2896,2991] : [9997,63,0,0,2896,2959]);
      for (let ci=0;ci<pools.length;ci++) {
        const {name,pools:byLength}=pools[ci];
        let plantsWithViolation=0, minimumMaximumViolation=Infinity;
        let maximumMaximumViolation=-Infinity, weakestWitness=null;
        for (let sample=0;sample<SAMPLES;sample++) {
          const seed=(0x33012026 ^ ((ci+1)*0x9e3779b9) ^
            ((excluded==="EO"?1:2)<<16) ^ sample)>>>0;
          const donor=sampleDonorWords(byLength,seed);
          const result=evaluateDonor(donor,model);
          if (result.best.margin>0) plantsWithViolation++;
          if (result.best.margin<minimumMaximumViolation) {
            minimumMaximumViolation=result.best.margin;
            weakestWitness={sample,...result.best};
          }
          if (result.best.margin>maximumMaximumViolation)
            maximumMaximumViolation=result.best.margin;
        }
        assert.equal(plantsWithViolation,SAMPLES);
        assert.ok(minimumMaximumViolation>0);
        negative.push({excluded,pageReset,control:name,samples:SAMPLES,
          plantsWithViolation,minimumMaximumViolation,maximumMaximumViolation,
          weakestWitness});
      }
    }
  }
  const positiveExcluded="EO";
  const positivePools=donorPools(read(controls[0][1]),positiveExcluded);
  const positiveDonor=sampleDonorWords(positivePools,0x33012026);
  const positive=[];
  for (const pageReset of [false,true]) {
    const plant=positivePlant(positiveDonor,positiveExcluded,pageReset,
      pageReset?0x6c696265:0x7072696d);
    const model=makeModel(plant.cipherWords,pageReset);
    const bound=evaluateDonor(positiveDonor,model);
    assert.ok(bound.best.margin<=0);
    assert.deepEqual([model.mapped,model.repeats,model.pageCuts,model.freePositions],
      pageReset?[9965,63,32,2991]:[9997,63,0,2959]);
    positive.push({pageReset,exactRecovery:true,recoveredRunes:plant.recoveredRunes,
      sidecarPositions:plant.sidecarPositions,mappedTransitions:model.mapped,
      maximumInvariantViolation:bound.best.margin});
  }
  const output={
    source:{runes:originalRuneCount,words:originalWords.length,crossPageWords,
      maxWordLength,chapters:chapterRanges},
    model:"one arbitrary 29x28 bijection per (visual chapter, previous ciphertext rune); word resets; repeat sidecar; optional page resets",
    negative,positive,
    decision:"EXCLUDED for the tested native-GP-English controls: fixed per-chapter GP28 predecessor-ciphertext row permutations excluding EO or OE, even when word starts, repeat exceptions, and optional page-reset positions are supplied freely. Not excluded: per-page/per-word changing keys, F-special no-op/transparent mechanisms, other alphabets or languages, moving spaces, variable-length/nonlocal transforms. No original plaintext or source-selected key recovered."
  };
  console.log(JSON.stringify(output,null,2));
  return output;
}
if (require.main===module) main();
module.exports={main,parseOriginalWords,encodeGP28Words,makeModel,evaluateDonor,positivePlant};
