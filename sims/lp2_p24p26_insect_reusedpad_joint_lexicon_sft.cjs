"use strict";
/**
 * Issue #2148: word-preserving, key-independent, two-time-pad attack on
 * original physical LP2 p24/p26 identical insect illustrations.
 *
 * Source-frozen hypothesis: C_A[t] = P_A[t] + K[t] (mod 29) and
 * C_B[t] = P_B[t] + K[t] (mod 29), reset at the first complete word on
 * each page. Thus D[t] = C_A[t]-C_B[t] = P_A[t]-P_B[t] (mod 29).
 * Clock: every rune consumes one pad symbol; no F skipping or rephasing.
 *
 * Native-GP English word-trie product decoder. The pair of authentic
 * printed word-break tapes are hard constraints; no unknown key is fitted.
 * The beam is a search heuristic; death after clipping is NOT a proof of
 * infeasibility. Positive solved-native and independent-pad controls
 * measure its power. SFT is read-only, Node 22/CommonJS.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8").replace(/\r\n/g,"\n");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const runeMap = new Map(gp.runes.map((r, i) => [r, i]));
const wordRE = new RegExp("[" + gp.runes.join("") + "]+", "gu");
const transcript = read("resources/lp2-transcription.txt").split(/^%\s*$/m);
const WIDTH = 250, CAL = 150, BEAM = 12000, MOD = 29;
assert.equal(transcript.length, 57);
const reduce = (x) => ((x % MOD) + MOD) % MOD;
/** @param {string} runes */
function gpWord(runes) { return Array.from(runes, r => runeMap.get(r)); }
/** @param {number[]} indices */
function code(indices) { return indices.map(n => String.fromCharCode(65 + n)).join(""); }
/** @param {string} value */
function decode(value) {
  return Array.from(value, c => {
    const j = c.charCodeAt(0) - 65;
    return j === 21 ? "ING" : j === 27 ? "IO" : gp.translit[j];
  }).join("");
}
/** @param {number} n */
function printedPage(n) {
  const page = gp.pages.find(p => p.page === n);
  const original = transcript[n].replace(/\/\n/g, "").replace(/\s+/g, "");
  const words = [];
  let pos = 0;
  for (const match of original.matchAll(wordRE)) {
    const vals = gpWord(match[0]);
    assert(vals.every(x => Number.isInteger(x)));
    words.push({start:pos, end:pos + vals.length, indices:vals});
    pos += vals.length;
  }
  assert.equal(pos, page.indices.length);
  assert.deepEqual(words.flatMap(w => w.indices), page.indices);
  return {page:n, values:page.indices, words};
}
const byPage = Object.fromEntries([24,25,26].map(n => [n, printedPage(n)]));
/**
 * A source-first, complete-word start. P23's last word extends to p24
 * rune 2; p24's last word extends to p25 runes 0..1; p25's last word
 * extends to p26 rune 0. Exact joins appear in the transcription.
 */
const starts = {24:3, 25:2, 26:1};
assert.deepEqual([24,25,26].map(n => byPage[n].words[1].start),
  [3,2,1]);
/** @param {{values:number[],words:{start:number,end:number}[]}} source
 * @param {number} offset */
function track(source, offset) {
  const values = source.values.slice(offset, offset + WIDTH);
  assert.equal(values.length, WIDTH);
  const ends = new Uint8Array(WIDTH);
  for (const w of source.words) {
    if (w.end > offset && w.end <= offset + WIDTH)
      ends[w.end - offset - 1] = 1;
  }
  assert(source.words.some(w => w.start === offset));
  return {values, ends};
}
const targets = Object.fromEntries([24,25,26].map(n =>
  [n, track(byPage[n], starts[n])]));
const pageTop = Object.fromEntries([24,25,26].map(n =>
  [n, track(byPage[n], 0)]));
// Native English training words and weights are source-independent of
// any unknown LP2 plaintext. The solved LP1 runes are authentic controls.
const lex = new Map();
/** @param {number[]} nums @param {number} count @param {string} word */
function add(nums, count, word) {
  if (!nums.length || nums.length > 20) return;
  const k = code(nums), old = lex.get(k);
  if (!old || count > old.count) lex.set(k, {count, word});
}
for (const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/)) {
  const m = /^([a-z]+) (\d+)$/.exec(line);
  if (m) add(encodeSourceNativeGP(m[1]), Number(m[2]), m[1]);
}
const knownLP1 = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const start = knownLP1.indexOf("ᚦᛖ-ᛚᚩᛋᛋ");
const stop = knownLP1.indexOf("\n$\n%\n", start);
assert(start >= 0 && stop > start);
const lp1Solved = knownLP1.slice(start, stop)
  .replace(/\/\n%\n/g, "").replace(/\/\n/g, "").replace(/\n/g, "");
const solvedWords = Array.from(lp1Solved.matchAll(wordRE), m => gpWord(m[0]));
assert.equal(solvedWords.length, 181);
for (const w of solvedWords) add(w, 25, decode(code(w)));
const p57 = gp.pages.find(p => p.page === 57);
for (const m of read("resources/liber-primus/lp1-plaintext-reference.txt").matchAll(/[A-Za-z]{1,24}/g))
  add(encodeSourceNativeGP(m[0]), 12, m[0].toLowerCase());
const nodes = [];
function newNode() {
  nodes.push({next:new Int32Array(MOD).fill(-1), edges:[], score:-Infinity, word:null});
  return nodes.length - 1;
}
newNode();
/** @param {string} encoded @param {number} count @param {string} word */
function insert(encoded, count, word) {
  let node = 0;
  for (const c of encoded) {
    const rune = c.charCodeAt(0)-65, old = nodes[node].next[rune];
    if (old < 0) {
      const next = newNode();
      nodes[node].next[rune] = next;
      nodes[node].edges.push(rune);
      node = next;
    } else node = old;
  }
  nodes[node].score = Math.log1p(count);
  nodes[node].word = word;
}
for (const [letters, item] of lex) insert(letters, item.count, item.word);
assert(nodes[0].edges.length >= 20);
const show = (encoded, ends) => {
  const out=[];let last=0;
  for(let i=0;i<encoded.length;i++) if(ends[i]) {
    out.push(decode(encoded.slice(last,i+1)));last=i+1;
  }
  if(last<encoded.length)out.push("["+decode(encoded.slice(last))+"]");
  return out.join(" ");
};
/**
 * Joint Viterbi over two dictionary tries. At each position the second
 * plaintext rune is fixed by the first plaintext rune and observed D.
 * Pair state (trieA,trieB) collapses equivalent histories.
 *
 * @param {number[]} difference
 * @param {Uint8Array} endsA
 * @param {Uint8Array} endsB
 */
function joint(difference,endsA,endsB,freeA=0,freeB=0) {
  let beam = [{a:0,b:0,score:0,letters:""}];
  const trace = []; let clipped = 0;
  let first={alive:false,score:null,candidate:null};
  for (let t=0; t<difference.length;t++) {
    const choice = new Map();
    for (const s of beam) {
      const allowed=t<freeA ? Array.from({length:MOD},(_,j)=>j) : nodes[s.a].edges;
      for (const x of allowed) {
        const y=reduce(x-difference[t]);
        let a=t<freeA ? 0 : nodes[s.a].next[x];
        let b=t<freeB ? 0 : nodes[s.b].next[y];
        if (b<0)continue;
        let score=s.score;
        if(t>=freeA&&endsA[t]){if(!Number.isFinite(nodes[a].score))continue;
          score+=nodes[a].score;a=0;}
        if(t>=freeB&&endsB[t]){if(!Number.isFinite(nodes[b].score))continue;
          score+=nodes[b].score;b=0;}
        const id=a*nodes.length+b;
        const previous=choice.get(id);
        if(!previous||score>previous.score)
          choice.set(id,{a,b,score,letters:s.letters+String.fromCharCode(65+x)});
      }
    }
    if (!choice.size)
      return {alive:false,deadAt:t,trace,clipped,first,lexWords:lex.size};
    const count=choice.size;
    beam=Array.from(choice.values()).sort((u,v)=>v.score-u.score).slice(0,BEAM);
    if(count>BEAM)clipped++;
    if(t===CAL-1){const top=beam[0];first={alive:true,score:top.score,
      candidate:top.letters,states:count};}
    if(t%25===24 || t===difference.length-1)
      trace.push([t+1,count,beam.length,Number(beam[0].score.toFixed(2))]);
  }
  const top=beam[0];
  return {alive:true,first,score:top.score,candidate:top.letters,
    states:beam.length,clipped,trace,lexWords:lex.size};
}
/** @param {number[]} a @param {number[]} b */
function minus(a,b) {
  assert.equal(a.length,b.length);
  return a.map((x,i)=>reduce(x-b[i]));
}
let rng=0x2148aa27;
/** @returns {number} */
function random(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;}
function encrypt(plain,pad){return plain.map((p,i)=>reduce(p+pad[i]));}
function newPad(){return Array.from({length:WIDTH},()=>random()%MOD);}
const results=[];
/** @param {string} name @param {{values:number[],ends:Uint8Array}} a
 * @param {{values:number[],ends:Uint8Array}} b
 * @param {boolean} known */
function evaluate(name,a,b,truthA=null,truthB=null,freeA=0,freeB=0){
  const d=minus(a.values,b.values),answer=joint(d,a.ends,b.ends,freeA,freeB);
  const r={name,alive:answer.alive,deadAt:answer.deadAt,
    first150:answer.first,states:answer.states,clipped:answer.clipped,
    trace:answer.trace};
  if(answer.candidate){
    r.score=Number((answer.score/WIDTH).toFixed(4));
    r.plainA=show(answer.candidate,a.ends);
    const other=code(Array.from(d,(v,i)=>reduce(answer.candidate.charCodeAt(i)-65-v)));
    r.plainB=show(other,b.ends);
    if(truthA&&truthB){
      let matchA=0,matchB=0;
      for(let i=0;i<WIDTH;i++){
        matchA+=Number(answer.candidate.charCodeAt(i)-65===truthA.values[i]);
        matchB+=Number(other.charCodeAt(i)-65===truthB.values[i]);
      }
      r.correct=[matchA,matchB];
    }
  }
  results.push(r);
  process.stdout.write(JSON.stringify(r)+"\n");
}
const controlWordsA=solvedWords.slice(0,85), controlWordsB=solvedWords.slice(85);
function solvedTrack(words) {
  const values=words.flat().slice(0,WIDTH);
  assert.equal(values.length,WIDTH);
  const ends=new Uint8Array(WIDTH);let p=0;
  for(const word of words){p+=word.length;if(p<=WIDTH)ends[p-1]=1;}
  return {values,ends};
}
const ca=solvedTrack(controlWordsA),cb=solvedTrack(controlWordsB);
/**
 * Additional power control: keep p24/p26's ORIGINAL printed word-length
 * tapes exactly, but fill them from authentic solved LP1 GP words. When
 * no solved word has a required length, use a source-independent common
 * TextBlob dictionary word and count that substitution.
 */
function matchedTrack(template) {
  let cursor=0,fallbacks=0; const values=[];
  for(let end=0;end<WIDTH;end++){
    if(!template.ends[end])continue;
    const needed=end+1-cursor;
    let options=solvedWords.filter(w=>w.length===needed);
    if(!options.length){
      fallbacks++;
      const dict=Array.from(lex.keys()).filter(w=>w.length===needed);
      assert(dict.length,"no dictionary word of length "+needed);
      const chosen=dict[random()%dict.length];
      options=[Array.from(chosen,c=>c.charCodeAt(0)-65)];
    }
    const chosen=options[random()%options.length];
    values.push(...chosen);cursor=end+1;
  }
  if(cursor<WIDTH){
    const needed=WIDTH-cursor;
    let options=solvedWords.filter(w=>w.length>=needed);
    assert(options.length);
    values.push(...options[random()%options.length].slice(0,needed));
  }
  assert.equal(values.length,WIDTH);
  return {values,ends:template.ends,fallbacks};
}
const matchedA=matchedTrack(targets[24]),matchedB=matchedTrack(targets[26]);
const matchedPad=newPad(), matchedOther=newPad();
const matchedSharedA={...matchedA,values:encrypt(matchedA.values,matchedPad)};
const matchedSharedB={...matchedB,values:encrypt(matchedB.values,matchedPad)};
const matchedIndependentB={...matchedB,values:encrypt(matchedB.values,matchedOther)};
const pad=newPad();
const sharedA={...ca,values:encrypt(ca.values,pad)};
const sharedB={...cb,values:encrypt(cb.values,pad)};
const independentB={...cb,values:encrypt(cb.values,newPad())};
console.log("setup",JSON.stringify({pages:[24,25,26].map(n=>({page:n,
  runes:byPage[n].values.length,start:starts[n],wordEnds:targets[n].ends.reduce((s,v)=>s+v,0)})),
  width:WIDTH,calibration:CAL,beam:BEAM,lexicon:lex.size,trieNodes:nodes.length,
  nativeControl:[ca.values.length,cb.values.length],matchedLayoutFallbacks:[matchedA.fallbacks,matchedB.fallbacks]}));
evaluate("matched-layout-shared-pad",matchedSharedA,matchedSharedB,matchedA,matchedB);
evaluate("matched-layout-independent-pads",matchedSharedA,matchedIndependentB);
evaluate("planted-shared-pad",sharedA,sharedB,ca,cb);
evaluate("planted-independent-pads",sharedA,independentB,false);
evaluate("original-p24-p26",targets[24],targets[26]);
evaluate("original-p24-p26-page-start",pageTop[24],pageTop[26],null,null,3,1);
evaluate("near-art-negative-p24-p25",targets[24],targets[25]);
evaluate("near-art-negative-p25-p26",targets[25],targets[26]);
console.log("summary",JSON.stringify(results.map(({name,alive,deadAt,score,states,clipped,correct})=>
  ({name,alive,deadAt,score,states,clipped,correct}))));
