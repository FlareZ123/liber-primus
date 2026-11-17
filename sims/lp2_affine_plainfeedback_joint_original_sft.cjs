"use strict";

/**
 * Complete finite-state GF29 plaintext-feedback cipher SFT.
 *
 * C[i] = C[i-1] + P[i] - a*P[i-1] - b (mod 29).
 * State: previous plaintext P[i-1] and previous ciphertext C[i-1].
 * Inverse is unique for any original C, a, b, initial P[0].
 * Parameters a, b, P[0] are the entire 14.8-bit search grammar.
 * Source-motivated pairs: signed 2013 H and original p39 G coefficients.
 * This is an exploratory original-cipher negative, not an authenticated opcode.
 *
 * No file writes. Node22 on Windows or Linux.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const source = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const printed = read("resources/liber-primus/lp2-transcription.txt");
const gibran = read("resources/control/gibran_prophet_58585.txt");
const shakespeare = read("resources/control/shakespeare_first300k.txt");
const mod = x => (x % 29 + 29) % 29;
const chapters = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const ch = chapters.map(([lo,hi]) =>
  source.pages.filter(p => p.page >= lo && p.page <= hi).flatMap(p => p.indices));
assert.deepEqual(ch.map(v => v.length), [729,1145,1729,1903,1021,1433,1680,3008,308]);
const pages = source.pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(pages.length, 55);
assert.equal(ch.flat().length, 12956);
const validRunes = new Set(source.runes);
const words = [];
let absolute = 0, start = 0, length = 0;
for (const symbol of printed) {
  if (validRunes.has(symbol)) {
    if (!length) start = absolute;
    length++;
    absolute++;
    if (absolute === 12956) {
      words.push({start, length});
      break;
    }
  } else if (symbol === "-" || symbol === "." || symbol === "&") {
    if (length) words.push({start, length});
    length = 0;
  }
}
assert.equal(absolute, 12956);
assert.equal(words.length, 2896);
assert.equal(words.reduce((s,w) => s+w.length, 0), 12956);
assert.equal(Math.max(...words.map(w => w.length)), 14);
const chapterOffsets = [0];
for (const a of ch) chapterOffsets.push(chapterOffsets.at(-1)+a.length);
const pageStarts = [];
let pageCursor = 0;
for (const p of pages) {
  pageStarts.push(pageCursor);
  pageCursor += p.indices.length;
}
assert.equal(pageCursor,12956);

/** Map historical English spelling to source GP29 rune indices. */
const spellings = source.translit.slice().sort((a,b) => b.length-a.length);
const runeIndex = new Map(source.translit.map((r,i) => [r,i]));
function gpWord(raw) {
  const w = raw.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const out = [];
  for(let i=0;i<w.length;) {
    if(w.startsWith("ING",i)) {out.push(21);i+=3;continue;}
    if(w.startsWith("IO",i)) {out.push(27);i+=2;continue;}
    const t = spellings.find(v => w.startsWith(v,i));
    assert.ok(t, "Unmappable token: " + raw);
    out.push(runeIndex.get(t));
    i += t.length;
  }
  return out;
}
function gpSource(text) {return (text.match(/[A-Za-z]+/g)||[]).map(gpWord);}
const nativeG = gpSource(gibran), nativeS = gpSource(shakespeare);
assert.equal(nativeG.length,15733);
assert.equal(nativeS.length,55407);
function nativePlant(src,seed) {
  const buckets = Array.from({length:15},()=>[]);
  for (const w of src) if(w.length <= 14) buckets[w.length].push(w);
  const result = [];
  let state = seed >>> 0;
  for (const w of words) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    const available = buckets[w.length];
    assert.ok(available.length);
    result.push(...available[(state>>>0) % available.length]);
  }
  assert.equal(result.length,12956);
  return result;
}
const plants = [nativePlant(nativeG,0x33011701),nativePlant(nativeS,0x33011702)];

/** Fully reversible plaintext-driven short automaton, same-state no hidden mask. */
function encrypt(p,a,b,initial) {
  const c = [initial];
  for (let i=1;i<p.length;i++) {
    c.push(mod(c[i-1] + p[i] - a*p[i-1] - b));
  }
  return c;
}
function decrypt(c,a,b,initialPlain) {
  const p = [initialPlain];
  for (let i=1;i<c.length;i++) {
    p.push(mod(c[i] - c[i-1] + a*p[i-1] + b));
  }
  return p;
}

/** Count original-source within-physical-page doubles and whole-word 5-backs. */
function jointMetric(tape) {
  let adjacent=0,lag5=0;
  for(const offset of pageStarts) {
    const page = pages[pageStarts.indexOf(offset)];
    for(let i=1;i<page.indices.length;i++) {
      adjacent += tape[offset+i]===tape[offset+i-1];
    }
  }
  for(const w of words) for(let i=5;i<w.length;i++) {
    lag5 += tape[w.start+i]===tape[w.start+i-5];
  }
  return {adjacent,wordLag5:lag5};
}
const original = pages.flatMap(p=>p.indices);
assert.deepEqual(jointMetric(original),{adjacent:86,wordLag5:104});

/** Page/word-length-preserving complete plant, with nine genuine chapter cuts. */
function sourceShapeCipher(plant,a,b) {
  const out=[];
  for(let k=0;k<ch.length;k++) {
    const off=chapterOffsets[k],plain=plant.slice(off,off+ch[k].length);
    out.push(...encrypt(plain,a,b,plain[0]));
  }
  return out;
}

/** Independent English GP29 trigram table, source no original LP2 training. */
const training = nativeG.flat().slice(0,50000);
const counts = new Float64Array(29**3).fill(0.1);
for(let i=2;i<training.length;i++) {
  counts[(training[i-2]*29+training[i-1])*29+training[i]]++;
}
const logProbability = new Float64Array(29**3);
for(let t=0;t<29*29;t++) {
  let sum=0;
  for(let x=0;x<29;x++) sum+=counts[t*29+x];
  for(let x=0;x<29;x++) logProbability[t*29+x]=Math.log(counts[t*29+x]/sum);
}
function trigram(v) {
  let score=0;
  for(let i=2;i<v.length;i++) {
    score+=logProbability[(v[i-2]*29+v[i-1])*29+v[i]];
  }
  return score/(v.length-2);
}

/** Explicit finite search: 29^2 keyed affine rules and 29 initial rune states. */
function search(target) {
  let best={score:-Infinity};
  for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let initial=0;initial<29;initial++) {
    const plain=decrypt(target,a,b,initial);
    const score=trigram(plain);
    if(score>best.score)best={a,b,initial,score,plain};
  }
  return best;
}

const originalBest=search(ch[0]);
const holdCandidate = Array.from({length:29},(_,initial) => ({initial,
  plain:decrypt(ch[7],originalBest.a,originalBest.b,initial)}));
const hold = holdCandidate.reduce((best,v) => trigram(v.plain)>trigram(best.plain)?v:best)
  .plain;
assert.deepEqual(encrypt(originalBest.plain,originalBest.a,originalBest.b,ch[0][0]),ch[0]);
assert.deepEqual(encrypt(hold,originalBest.a,originalBest.b,ch[7][0]),ch[7]);
const rawScore=trigram(ch[0]);
const fixed = [[24,15],[5,27],[26,3],[24,26],[3,26]];
const nativeMetrics=[];
for(const p of plants) {
  const items=[];
  for(const [a,b] of fixed) items.push({a,b,...jointMetric(sourceShapeCipher(p,a,b))});
  nativeMetrics.push(items);
}
const jointSurvivors=[];
for(let a=0;a<29;a++)for(let b=0;b<29;b++) {
  const scores=plants.map(p=>jointMetric(sourceShapeCipher(p,a,b)));
  if(scores.every(s=>s.adjacent<=125 && s.wordLag5>=90)) {
    jointSurvivors.push({a,b,gibran:scores[0],shakespeare:scores[1]});
  }
}
// A genuinely planted source prose must rank ahead of all wrong short keys.
const targetPlain=nativeS.flat().slice(80000,80729);
assert.equal(targetPlain.length,729);
const sourceKey={a:24,b:15,initial:mod(targetPlain[0]+17)};
const cipherPlant=encrypt(targetPlain,sourceKey.a,sourceKey.b,sourceKey.initial);
const sourceRecovered=search(cipherPlant);
const correct=sourceRecovered.plain.every((x,i)=>x===targetPlain[i]);
assert.ok(correct, "Planted true-key recovery failed; rank needs recalibration");
assert.equal(sourceRecovered.a,sourceKey.a);
assert.equal(sourceRecovered.b,sourceKey.b);
assert.equal(sourceRecovered.initial,targetPlain[0]);
assert.deepEqual(encrypt(sourceRecovered.plain,sourceRecovered.a,sourceRecovered.b,cipherPlant[0]),cipherPlant);
console.log(JSON.stringify({
  source:{"corpus":"resources/liber-primus/lp2-corpus.json",
    "words":2896,"runes":12956,"page_count":55},
  originalMetric:jointMetric(original),
  model:"C[i]=C[i-1]+P[i]-a*P[i-1]-b mod29",
  tested:29*29*29,
  controlMetrics:nativeMetrics,
  nativeJointSurvivors:jointSurvivors,
  rawP0Score:rawScore,
  topP0:{a:originalBest.a,b:originalBest.b,initial:originalBest.initial,
    score:originalBest.score,holdoutP40Score:trigram(hold),
    first40:originalBest.plain.slice(0,40).map(x=>source.translit[x]).join("-")},
  nativeScores:{shakespeare:trigram(targetPlain),
    p57:trigram(source.pages.find(p=>p.page===57).indices)},
  planted:{sourceKey,recoveredKey:{
      a:sourceRecovered.a,b:sourceRecovered.b,initial:sourceRecovered.initial},
    recoveredAll729:correct,score:sourceRecovered.score}
},null,2));