"use strict";
/**
 * Issue #343: literal word-circumference extraction from the original LP2 text.
 * Reproduce: node sims/lp2_p57_literal_word_circumference_sft.cjs
 *
 * The canonical line breaks, punctuation and page boundaries are preserved.
 * Only '-' '.' '&' '$' and '§' end a printed word, as in the repository's
 * established full-word parser. '/' and '%' never terminate a word.
 *
 * The only proposed operation is remove first/last rune of each whole word.
 * The endpoint stream is retained so this extraction is exactly reversible.
 * Nothing in this program searches keys, shifts, rotations or plaintext fits.
 *
 * @module lp2_p57_literal_word_circumference_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const SOURCE = path.resolve(__dirname, "../resources/liber-primus/lp2-transcription.txt");
const SOURCE_GIT_BLOB = "43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7";
const INTERIOR_GIT_BLOB = "ddef28abf08ce0651084864ad0fa858b6d104d48";
const EXTERIOR_GIT_BLOB = "8c710f10558d58e6bdd99aeb678a2d6198f2770f";
const ALPHABET = [..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
const RUNES = new Set(ALPHABET);
const UNSOLVED_RUNES = 12956;
const UNSOLVED_WORDS = 2896;
const BODY_STARTS = [0,729,1874,3612,5506,6527,7960,8051,9640,12956];
const SHUFFLES = 512;
const SHUFFLE_SEED = 0x34357021;

/** @param {string} s @returns {string} */
function gitBlob(s) {
  const bytes = Buffer.from(s, "utf8");
  return crypto.createHash("sha1").update("blob " + bytes.length + "\0")
    .update(bytes).digest("hex");
}
/** @param {string} s @returns {string} */
function sha256(s) {
  return crypto.createHash("sha256").update(s, "utf8").digest("hex");
}
/**
 * @param {string} raw
 * @returns {{runes:string, words:Array<{start:number,end:number,glyphs:string}>}}
 */
function parseWords(raw) {
  const all = [], words = [];
  let current = [], start = 0;
  /** @returns {void} */
  function flush() {
    if (!current.length) return;
    words.push({start,end:all.length,glyphs:current.join("")});
    current = [];
  }
  for (const ch of raw) {
    if (RUNES.has(ch)) {
      if (!current.length) start = all.length;
      all.push(ch);
      current.push(ch);
    } else if ("-.&$§".includes(ch)) {
      flush();
    }
  }
  flush();
  return {runes:all.join(""),words};
}
/**
 * @param {{glyphs:string}} word
 * @returns {{len:number,inside:string,outside:string}}
 */
function splitWord(word) {
  const chars = [...word.glyphs], len = chars.length;
  return {
    len,
    inside:chars.slice(1,-1).join(""),
    outside:chars[0] + (len > 1 ? chars[len-1] : "")
  };
}
/**
 * @param {{len:number,inside:string,outside:string}} token
 * @returns {string}
 */
function rebuildWord(token) {
  const a = [...token.outside], inner = [...token.inside];
  assert.equal(inner.length,Math.max(0,token.len-2));
  assert.equal(a.length,token.len === 1 ? 1 : 2);
  return token.len === 1 ? a[0] : a[0] + token.inside + a[1];
}
/** @param {string} s @returns {number} */
function ioc(s) {
  const counts = Array(29).fill(0), list = [...s];
  for (const ch of list) {
    const i = ALPHABET.indexOf(ch);
    assert.ok(i >= 0);
    counts[i]++;
  }
  const n = list.length;
  return counts.reduce((sum,x)=>sum+x*(x-1),0)/(n*(n-1));
}
/** @param {Array<{start:number,end:number,glyphs:string}>} ws */
function bodyWords(ws) {
  const bodies = BODY_STARTS.slice(0,-1).map((start,i)=>
    ws.filter(w=>w.start>=start && w.end<=BODY_STARTS[i+1])
  );
  assert.deepEqual(bodies.map(x=>x.length),[158,255,385,435,224,326,23,355,735]);
  assert.equal(bodies.reduce((s,b)=>s+b.length,0),UNSOLVED_WORDS);
  return bodies;
}
/**
 * Exact longest-common-substring test up to 14 runes (if a match of 14
 * exists, only the lower bound 14 is returned).
 * @param {string} s @param {string} t @returns {number}
 */
function commonMax14(s,t) {
  const upper = Math.min(14,s.length,t.length);
  for (let k=upper;k>=1;k--) {
    const grams = new Set();
    for (let j=0;j+k<=t.length;j++) grams.add(t.slice(j,j+k));
    for (let j=0;j+k<=s.length;j++) if (grams.has(s.slice(j,j+k))) return k;
  }
  return 0;
}
/** @param {number} seed @returns {()=>number} */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}
/** @param {Array<Array<{start:number,end:number,glyphs:string}>>} bodies @param {()=>number} rand */
function shuffleByBody(bodies,rand) {
  return bodies.map(body=>{
    const arr = body.slice();
    for (let i=arr.length-1;i>0;i--) {
      const j = rand() % (i+1);
      [arr[i],arr[j]] = [arr[j],arr[i]];
    }
    return arr;
  }).flat();
}
/** @param {number[]} counts @returns {Record<string,number>} */
function histogram(counts) {
  const out = {};
  for (const n of counts) out[n] = (out[n] || 0) + 1;
  return out;
}
function run() {
  const raw = fs.readFileSync(SOURCE,"utf8");
  assert.equal(gitBlob(raw),SOURCE_GIT_BLOB);
  const corpus = parseWords(raw);
  assert.equal([...corpus.runes].length,13136);
  assert.equal(corpus.words.length,2941);
  const unknown = corpus.words.filter(w=>w.start<UNSOLVED_RUNES);
  assert.equal(unknown.length,UNSOLVED_WORDS);
  assert.equal(unknown.at(-1).end,UNSOLVED_RUNES);
  const original = corpus.runes.slice(0,UNSOLVED_RUNES);
  const parts = unknown.map(splitWord);
  const inside = parts.map(x=>x.inside).join("");
  const outside = parts.map(x=>x.outside).join("");
  assert.equal(inside.length,7247);
  assert.equal(outside.length,5709);
  assert.equal(parts.filter(x=>x.len===1).length,83);
  assert.equal(parts.filter(x=>x.len===2).length,448);
  assert.equal(parts.filter(x=>x.inside.length===0).length,531);
  assert.equal(parts.map(rebuildWord).join(""),original);
  assert.equal(gitBlob(inside),INTERIOR_GIT_BLOB);
  assert.equal(gitBlob(outside),EXTERIOR_GIT_BLOB);
  const bodies = bodyWords(unknown);
  const perBody = bodies.map((b,i)=>{
    const x = b.map(w=>splitWord(w).inside).join("");
    const y = b.map(w=>splitWord(w).outside).join("");
    return {
      body:i+1,words:b.length,interiorRunes:x.length,exteriorRunes:y.length,
      interiorIoC:+ioc(x).toFixed(6),exteriorIoC:+ioc(y).toFixed(6)
    };
  });
  const solvedPages = raw.split("%").filter(page=>
    [...page].some(ch=>RUNES.has(ch)));
  const p57 = parseWords(solvedPages.at(-1)).words.map(splitWord);
  assert.equal(p57.length,20);
  const controlInside = p57.map(x=>x.inside).join("");
  const controlOutside = p57.map(x=>x.outside).join("");
  const observedInside = commonMax14(inside,controlInside);
  const observedOutside = commonMax14(outside,controlOutside);
  const rand = xorshift32(SHUFFLE_SEED);
  const nullInside=[],nullOutside=[];
  for(let i=0;i<SHUFFLES;i++) {
    const shuffled = shuffleByBody(bodies,rand).map(splitWord);
    nullInside.push(commonMax14(shuffled.map(x=>x.inside).join(""),controlInside));
    nullOutside.push(commonMax14(shuffled.map(x=>x.outside).join(""),controlOutside));
  }
  assert.equal(observedInside,4);
  assert.equal(observedOutside,3);
  assert.deepEqual(histogram(nullInside),{"4":492,"5":20});
  assert.deepEqual(histogram(nullOutside),{"3":396,"4":111,"5":5});
  assert.ok(ioc(inside)<0.04 && ioc(outside)<0.04);
  assert.ok(ioc(controlInside)>0.07);
  const summary = {
    source:{path:"resources/liber-primus/lp2-transcription.txt",gitBlob:SOURCE_GIT_BLOB},
    contract:{unsolvedWords:UNSOLVED_WORDS,unsolvedRunes:UNSOLVED_RUNES,
      singletons:83,lengthTwo:448,emptyInteriors:531,
      wordBoundaryRule:"-.&$§",crossPageWordsRemainWhole:true,
      bodyStarts:BODY_STARTS},
    original:{sha256:sha256(original),ioc:ioc(original)},
    interior:{runes:inside.length,sha256:sha256(inside),
      gitBlob:INTERIOR_GIT_BLOB,ioc:ioc(inside),firstRunes:inside.slice(0,160)},
    exterior:{runes:outside.length,sha256:sha256(outside),
      gitBlob:EXTERIOR_GIT_BLOB,ioc:ioc(outside),firstRunes:outside.slice(0,160)},
    perBody,
    p57:{words:p57.length,interiorIoC:ioc(controlInside),
      exteriorIoC:ioc(controlOutside)},
    exactOriginalRebuild:true,
    literalControlMatches:{
      originalInsideMax14:observedInside,originalOutsideMax14:observedOutside,
      shuffles:SHUFFLES,seed:SHUFFLE_SEED,
      shuffledInsideHistogram:histogram(nullInside),
      shuffledOutsideHistogram:histogram(nullOutside),
      shuffledInsideGeObserved:nullInside.filter(n=>n>=observedInside).length,
      shuffledOutsideGeObserved:nullOutside.filter(n=>n>=observedOutside).length
    }
  };
  console.log(JSON.stringify(summary,null,2));
  if (process.argv.includes("--full")) {
    console.log(JSON.stringify({
      interiorRunes:inside,endpointRunes:outside,
      words:unknown.map((w,i)=>({word:i,start:w.start,end:w.end,
        length:parts[i].len,interior:parts[i].inside,
        endpoints:parts[i].outside}))
    },null,2));
  }
}
if(require.main===module) run();
module.exports={run,parseWords,splitWord,rebuildWord};
