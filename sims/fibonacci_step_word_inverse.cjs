"use strict";
/**
 * Constructive exact wordwise inverse of a source-motivated, nonlinear GP29
 * ciphertext STEP cipher with a 28-state Fibonacci rotor.
 *
 * For P in GP indices 0..27, emit C_i-C_(i-1) =
 *   15^((P_i + K_i) mod 28) (mod 29).
 * The 29th GP letter EA (index 28) emits step zero. Key K_i obeys
 * K_i = K_(i-1)+K_(i-2) (mod 28), reset at each original rune word.
 * The two starting key residues of EVERY word are completely unknown.
 *
 * Since 15 has multiplicative order 28 mod29, discrete log15 of the
 * actual output step is an exact inverse for each nonzero transition.
 * For a candidate lexical word, recover its unknown K0,K1 algebraically
 * from the earliest available nonerased positions and verify all later
 * letters. Zero differences require literal EA and never constrain K.
 *
 * No red-title key is assumed, and no seed is fitted from withheld runes.
 * The cipher's exact positive tests include GP EA and source-matched word
 * lengths. Independent-per-position-key alternatives measure false matches.
 *
 * Node22 / CommonJS, built-ins only.
 * @module fibonacci_step_word_inverse
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const {loadLexicon,sampleHeldout} =
  require("./word_period5_unknown_key_exact_inverse.cjs");

const ROOT = path.resolve(__dirname, "..");
const RAW = fs.readFileSync(path.join(ROOT,"resources/lp2-transcription.txt"),"utf8");
const GP = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"),"utf8"));
const ID = new Map(GP.runes.map((r,i) => [r,i]));
const WORDS = parseSharedCorpus().words.map(w => [...w.runes].map(r => {
  const n = ID.get(r);
  assert.notEqual(n,undefined);
  return n;
}));
const MOD = 29, RING = 28, GENERATOR = 15, MARKER = 28;
const MIN_LENGTH = 9;
const SEED = 0x29151153;
assert.equal(WORDS.length,2896);
assert.equal(WORDS.reduce((s,w)=>s+w.length,0),12956);
const EXP = [], LOG = new Int8Array(MOD).fill(-1);
for (let i=0,x=1;i<RING;i++,x=x*GENERATOR%MOD) {
  assert.equal(LOG[x],-1);
  LOG[x]=i;EXP.push(x);
}
assert.equal(EXP.length,RING);
assert.equal(EXP[(RING-1)]*GENERATOR%MOD,1);
assert.equal(LOG[0],-1);

/** @param {number} x */
function mod28(x) {return ((x % RING) + RING) % RING;}
/** @param {number} x */
function mod29(x) {return ((x % MOD) + MOD) % MOD;}
/** @param {number} seed @returns {()=>number} */
function rng(seed) {
  let s=seed>>>0;
  assert.ok(s!==0);
  return () => {
    s^=s<<13;s^=s>>>17;s^=s<<5;
    return s>>>0;
  };
}
/**
 * Derive logarithmic transitions directly from consecutive *published*
 * original ciphertext runes. The first rune lacks a known predecessor.
 * @param {number[][]} ciphertext
 * @param {number} previous Initial prior output, or -1 when unknown.
 * @returns {number[][]}
 */
function steps(ciphertext,previous=-1) {
  return ciphertext.map(word => word.map(c => {
    const e=previous<0?-2:LOG[mod29(c-previous)];
    previous=c;
    return e;
  }));
}
/**
 * Exact unbounded-seed recurrence feasibility test for one GP lexical word.
 *
 * Two independent unknown starting keys satisfy the recurrence, with
 * every nonzero logged transition constraining K_i = e_i - P_i mod28.
 * If first two positions are unknown (EA marker), enumerate only their
 * missing seed components, at most 784 pairs; all ordinary words require
 * one pair. Every candidate seed exactly forwards all recorded transitions.
 *
 * @param {number[]} publishedSteps Symbols -2 unknown, -1 zero, 0..27 nonzero.
 * @param {number[]} plaintext GP indices.
 * @param {"forward"|"reverse"} direction
 * @returns {Array<[number,number]>} Feasible pairs of 28-ary seeds.
 */
function fit(publishedSteps,plaintext,direction="forward") {
  const n=publishedSteps.length;
  assert.equal(n,plaintext.length);
  const known=new Int8Array(n).fill(-1);
  for (let i=0;i<n;i++) {
    const e=publishedSteps[i],p=plaintext[i];
    if(e===-2)continue;
    if (e===-1) {
      if(p!==MARKER)return [];
    } else {
      if(p===MARKER)return [];
      known[i]=mod28(e-p);
    }
  }
  const possible=[];
  const aValues=known[0]<0?
    Array.from({length:RING},(_,i)=>i):[known[0]];
  const bValues=n===1 || known[1]<0?
    Array.from({length:RING},(_,i)=>i):[known[1]];
  for(const a of aValues)for(const b of bValues){
    let first=a,second=b,compatible=true;
    for(let i=2;i<n;i++){
      const next=direction==="forward"?
        mod28(first+second):mod28(first-second);
      if(known[i]>=0 && known[i]!==next) {
        compatible=false;break;
      }
      first=second;second=next;
    }
    if(compatible)possible.push([a,b]);
  }
  return possible;
}
/** @param {number[][]} ciphertext @param {number[][]} source @param {number[][]} keys */
function exactRoundtrip(ciphertext,source,keys) {
  let previous=8;
  for(let wi=0;wi<source.length;wi++){
    const p=source[wi],c=ciphertext[wi];
    assert.equal(c.length,p.length);
    let [a,b]=keys[wi];
    for(let i=0;i<p.length;i++){
      const k=i===0?a:i===1?b:mod28(a+b);
      if(i>=2){a=b;b=k;}
      const val=p[i]===MARKER?previous:mod29(previous+EXP[(p[i]+k)%RING]);
      assert.equal(c[i],val,"Source forward roundtrip at word "+wi+", offset "+i);
      previous=c[i];
    }
  }
}
/**
 * True full-cipher generator with independent word-initial two-key state.
 * 28-ary recurrence, zero step for source EA, arbitrary previous glyph.
 * @param {number[][]} plaintext
 * @param {()=>number} draw
 * @param {"forward"|"reverse"|"iid"} direction
 */
function encipher(plaintext,draw,direction="forward") {
  let previous=8,markers=0;
  const pages=[],keys=[];
  for(const word of plaintext){
    let a=draw()%RING,b=draw()%RING;
    keys.push([a,b]);
    const printed=[];
    for(let i=0;i<word.length;i++){
      const k=i===0?a:i===1?b:direction==="forward"?
        mod28(a+b):direction==="reverse"?mod28(a-b):draw()%RING;
      if(i>=2){a=b;b=k;}
      if(word[i]===MARKER)markers++;
      const c=word[i]===MARKER?previous:
        mod29(previous+EXP[(word[i]+k)%RING]);
      printed.push(c);previous=c;
    }
    pages.push(printed);
  }
  return {words:pages,keys,markers};
}
/**
 * @param {number[][]} ciphertext
 * @param {Map<number,Array<{spelling:string,gp:number[],count:number}>>} lex
 * @param {"forward"|"reverse"} direction
 * @param {number} [minLength]
 */
function scan(ciphertext,lex,direction="forward",minLength=MIN_LENGTH,previous=-1) {
  const allSteps=steps(ciphertext,previous),hits=[],byLength={};
  for(let wi=0;wi<ciphertext.length;wi++) {
    const target=allSteps[wi],n=target.length;
    if(n<minLength)continue;
    const matches=[];
    for(const entry of lex.get(n)||[]) {
      const seeds=fit(target,entry.gp,direction);
      if(seeds.length)matches.push({
        spelling:entry.spelling,frequency:entry.count,
        seeds:seeds.slice(0,4),seedCount:seeds.length,
        plaintext:entry.gp
      });
    }
    const bin=byLength[n]||(byLength[n]={tested:0,wordsWithMatches:0,matches:0});
    bin.tested++;bin.wordsWithMatches+=Number(matches.length>0);
    bin.matches+=matches.length;
    if(matches.length) {
      matches.sort((a,b)=>b.frequency-a.frequency);
      hits.push({wordIndex:wi,length:n,
        sourceCiphertext:ciphertext[wi].map(x=>GP.runes[x]).join(""),
        candidateCount:matches.length,
        best:matches.slice(0,5)});
    }
  }
  return {checkedWords:Object.values(byLength).reduce((x,y)=>x+y.tested,0),
    wordsWithCandidates:hits.length,byLength,hits};
}
/**
 * @param {number} [trials=40]
 */
function run(trials=40) {
  const lex=loadLexicon(),original={};
  for(const direction of ["forward","reverse"])
    original[direction]=scan(WORDS,lex,direction);
  const random=rng(SEED),source=sampleHeldout(lex,random);
  const positive={};
  for(const direction of ["forward","reverse"]){
    const planted=encipher(source.plaintext,random,direction);
    const latent=steps(planted.words,8);
    for(let i=0;i<source.plaintext.length;i++) {
      const seeds=fit(latent[i],source.plaintext[i],direction);
      assert.ok(seeds.some(x=>x[0]===planted.keys[i][0] &&
        x[1]===planted.keys[i][1]),"True source/key excluded: "+i);
    }
    const fitOriginal=scan(planted.words,lex,direction,MIN_LENGTH,8);
    assert.ok(fitOriginal.wordsWithCandidates>=source.longWordsInLexicon);
    positive[direction]={trueSeedAndSourceRecovered:source.plaintext.length,
      sourceLongInLexicon:source.longWordsInLexicon,
      wordsWithCandidate:fitOriginal.wordsWithCandidates,
      zeroStepMarkers:planted.markers};
  }
  const nulls=[],same=encipher(source.plaintext,random,"iid").words;
  nulls.push(scan(same,lex,"forward",MIN_LENGTH,8).wordsWithCandidates);
  for(let i=1;i<trials;i++)
    nulls.push(scan(encipher(source.plaintext,random,"iid").words,lex,"forward",MIN_LENGTH,8).wordsWithCandidates);
  return {mechanism:"GP nonzero difference = 15^((P + Fibonacci28-key) mod 28); GP EA emits a zero difference",
    source:{unknownOriginalRunes:12956,wholeWords:2896,
      originalTranscriptSha256:createHash("sha256").update(RAW).digest("hex"),
      englishDictionary:"resources/control/english_wordfreq_textblob.txt",
      wordLengthMinimum:MIN_LENGTH,generator:GENERATOR,
      markerIndex:MARKER},
    original:{
      forward:{checkedWords:original.forward.checkedWords,
        wordsWithCandidates:original.forward.wordsWithCandidates,
        byLength:original.forward.byLength,hits:original.forward.hits.slice(0,40)},
      reverse:{checkedWords:original.reverse.checkedWords,
        wordsWithCandidates:original.reverse.wordsWithCandidates,
        byLength:original.reverse.byLength,hits:original.reverse.hits.slice(0,40)}
    },
    positive,independentPerRuneKeyControl:{
      trials,seed:"0x"+SEED.toString(16),
      mean:nulls.reduce((a,b)=>a+b,0)/nulls.length,
      max:Math.max(...nulls),min:Math.min(...nulls),
      positiveNulls:nulls.filter(x=>x>0).length},
    limits:"Exact GP words, preserved word spaces and source EA marker. Unconstrained two-key state per word. No claim of original key/plaintext unless original words have unambiguous source matches."};
}
if(require.main===module)
  console.log(JSON.stringify(run(Number(process.argv[2]||40)),null,2));
module.exports={mod28,mod29,steps,fit,encipher,scan,run,EXP,LOG};
