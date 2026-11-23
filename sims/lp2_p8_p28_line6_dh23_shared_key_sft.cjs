'use strict';
/**
 * LP2 physical p8/p28, matching 23-rune line-6 DH geometry:
 * test a real two-time-pad consequence before proposing a decoder.
 *
 * Native source files and signed-historical controls only, deterministic.
 * Run: node sims/lp2_p8_p28_line6_dh23_shared_key_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(root, name), 'utf8');
}
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const rune = new Map(corpus.runes.map((v, i) => [v, i]));
const parts = transcript.split(/^\s*%\s*$/m);
assert.equal(parts.length, 57); // physical p50 contains no runes
/** @param {number} page @returns {number[][]} */
function lines(page) {
  const section = parts[page <= 49 ? page : page - 1];
  return section.trim().split('/').filter(s => s.trim()).map(line =>
    [...line].filter(ch => rune.has(ch)).map(ch => rune.get(ch)));
}
const a = lines(8), b = lines(28);
assert.deepEqual(a.map(v => v.length),
  [17, 16, 17, 22, 22, 23, 21, 23, 22, 24, 24, 24]);
assert.deepEqual(b.map(v => v.length),
  [23, 23, 25, 23, 23, 23, 22, 25, 21, 21, 18, 22]);
assert.deepEqual(a[5], [26,15,8,1,20,15,26,6,9,1,12,25,9,9,3,25,18,23,24,3,11,27,1]);
assert.deepEqual(b[5], [23,8,9,13,24,12,4,8,9,21,28,0,9,0,3,19,15,9,28,24,10,1,20]);

const p8WordLengths = [5, 2, 3, 4, 4, 5];
const p28WordLengths = [2, 3, 9, 4, 5];
assert.equal(p8WordLengths.reduce((x, y) => x+y, 0), 23);
assert.equal(p28WordLengths.reduce((x, y) => x+y, 0), 23);
const translits = corpus.translit.map((s,i) => ({s,i}))
  .sort((x,y) => y.s.length - x.s.length);
const mod29 = v => (v % 29 + 29) % 29;
/** @param {string} s @returns {string} */
function normalize(s) {
  return s.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
}
/** @param {string} w @returns {number[]} */
function encodeWord(w) {
  const text = normalize(w), result = [];
  for (let pos = 0; pos < text.length;) {
    const match = translits.find(v => text.startsWith(v.s, pos));
    assert.ok(match, 'Unencodable word: ' + w);
    result.push(match.i);
    pos += match.s.length;
  }
  return result;
}
const textGP = numbers => numbers.map(i => corpus.translit[i]).join('');

/** @returns {Map<string, number>} */
function vocabulary() {
  const freq = new Map();
  for (const row of read('resources/control/english_wordfreq_textblob.txt').split('\n')) {
    const hit = /^([a-z]+)\s+(\d+)\s*$/.exec(row);
    if (hit) freq.set(hit[1], Number(hit[2]));
  }
  for (const source of [
    'resources/control/shakespeare_first300k.txt',
    'resources/control/emerson_essays_2944.txt',
    'resources/control/gibran_prophet_58585.txt'
  ]) {
    for (const word of read(source).toLowerCase().match(/[a-z]+/g) || []) {
      freq.set(word, (freq.get(word) || 0) + 1);
    }
  }
  return freq;
}

/** @param {Map<string,number>} words */
function trie(words) {
  const nodes = [{next:new Map(), word:null, count:0}];
  const byLen = new Map();
  for (const [word, count] of words) {
    const indices = encodeWord(word);
    if (!indices.length || indices.length > 9) continue;
    const best = byLen.get(indices.length);
    if (!best || count > best.count) {
      byLen.set(indices.length, {word, count});
    }
    let node = 0;
    for (const value of indices) {
      let next = nodes[node].next.get(value);
      if (next === undefined) {
        next = nodes.length;
        nodes.push({next:new Map(), word:null, count:0});
        nodes[node].next.set(value, next);
      }
      node = next;
    }
    if (count > nodes[node].count) {
      nodes[node].word = word;
      nodes[node].count = count;
    }
  }
  return {nodes,byLen};
}
const dict = vocabulary();
const {nodes,byLen} = trie(dict);
assert.equal(dict.size, 32190);
assert.equal(nodes.length, 58840);
/** @param {number[]} lengths @returns {Set<number>} */
function boundaries(lengths) {
  let t=0;
  const ends=new Set();
  for (const n of lengths) {t+=n; ends.add(t-1);}
  return ends;
}
const endA=boundaries(p8WordLengths),endB=boundaries(p28WordLengths);
/**
 * Under shared stream with C=multiplier*P+K, the key cancels:
 *     P8[i] - P28[i] = inv(multiplier)*(C8[i]-C28[i]).
 * Word boundaries are retained in both plaintexts.
 * @param {number[]} delta (P8-P28 mod29)
 * @returns {{count:number,deadAt?:number,score?:number,pa?:number[],pb?:number[]}}
 */
function intersect(delta) {
  let state = new Map([['0:0',{a:0,b:0,score:0,plain:[]}]]);
  for (let pos=0;pos<delta.length;pos++) {
    const next = new Map();
    for (const prior of state.values()) {
      for (const [x,na] of nodes[prior.a].next) {
        const y = mod29(x-delta[pos]);
        const nb = nodes[prior.b].next.get(y);
        if (nb === undefined) continue;
        const ta = endA.has(pos) ? nodes[na].word : null;
        const tb = endB.has(pos) ? nodes[nb].word : null;
        if ((endA.has(pos) && ta === null) ||
            (endB.has(pos) && tb === null)) continue;
        const xa = ta === null ? na : 0;
        const xb = tb === null ? nb : 0;
        const key = xa + ':' + xb;
        const score = prior.score +
          (ta !== null ? Math.log1p(nodes[na].count) : 0) +
          (tb !== null ? Math.log1p(nodes[nb].count) : 0);
        const existing = next.get(key);
        if (!existing || score > existing.score) {
          next.set(key, {
            a:xa, b:xb, score,
            plain:prior.plain.concat(x)
          });
        }
      }
    }
    state = next;
    if (!state.size) return {count:0,deadAt:pos};
  }
  const chosen = [...state.values()].sort((x,y) => y.score - x.score)[0];
  return {
    count:state.size, score:chosen.score,
    pa:chosen.plain,
    pb:chosen.plain.map((x,i) => mod29(x-delta[i]))
  };
}
const rawDelta = a[5].map((v,i) => mod29(v-b[5][i]));
assert.deepEqual(rawDelta, [3,7,28,17,25,3,22,27,0,9,13,25,0,9,0,6,3,14,25,8,1,26,10]);
const allFactors=[];
for (let factor=1;factor<29;factor++) {
  const inverse=Array.from({length:29},(_,i)=>i).find(x=>x*factor%29===1);
  assert.ok(inverse !== undefined);
  const test=intersect(rawDelta.map(v=>v*inverse%29));
  allFactors.push({factor,inverse,count:test.count,deadAt:test.deadAt});
}
assert.deepEqual(allFactors.filter(x=>x.count>0).map(x=>x.factor),
  [2,4,13,18]);

// The source p28 DH construction has shared secret K=2. Its fixed multiplier
// is an independently proposed *candidate*, not an authenticated instruction.
const slope=2, invSlope=15;
const hit=intersect(rawDelta.map(v=>v*invSlope%29));
assert.equal(hit.count,1);
function words(indices,lengths) {
  let cursor=0;
  return lengths.map(n => {
    const text=textGP(indices.slice(cursor,cursor+n));
    cursor+=n;
    return text;
  });
}
const wordA=words(hit.pa,p8WordLengths),wordB=words(hit.pb,p28WordLengths);
assert.deepEqual(wordA, ['SCREW','IF','XUI','HURT','SPUN','SHELL']);
assert.deepEqual(wordB, ['EAT','MAN','DESULTORY','SIXTH','BROWS']);
const key=hit.pa.map((p,i)=>mod29(a[5][i]-slope*p));
assert.ok(hit.pb.every((p,i)=>mod29(b[5][i]-slope*p)===key[i]));
assert.equal(key.length,23);
/** @param {number[]} plaintext @param {number[]} keyBytes */
function encrypt(plaintext,keyBytes) {
  return plaintext.map((v,i)=>mod29(slope*v+keyBytes[i%keyBytes.length]));
}
/** @param {number[]} cipher @param {number[]} keyBytes */
function decrypt(cipher,keyBytes) {
  return cipher.map((v,i)=>mod29(invSlope*(v-keyBytes[i%keyBytes.length])));
}
assert.deepEqual(encrypt(hit.pa,key), a[5]);
assert.deepEqual(encrypt(hit.pb,key), b[5]);

/** Positive: independently assembled source-native dictionary words under
 * a deterministic 23-slot key must survive the identical CSP. */
function plant(lengths) {
  return lengths.flatMap(len => encodeWord(byLen.get(len).word));
}
const plainA=plant(p8WordLengths),plainB=plant(p28WordLengths);
const plantedKey=Array.from({length:23},(_,i)=>mod29(i*17+3));
const cA=encrypt(plainA,plantedKey),cB=encrypt(plainB,plantedKey);
const plantedDelta=cA.map((v,i)=>mod29((v-cB[i])*invSlope));
const positive=intersect(plantedDelta);
assert.ok(positive.count >= 1);
assert.equal(positive.deadAt, undefined);
assert.ok(positive.pa.length===23 && positive.pb.length===23);
assert.deepEqual(decrypt(cA,plantedKey),plainA);
assert.deepEqual(decrypt(cB,plantedKey),plainB);

// The 23-position repeated line key now predicts both ENTIRE physical pages,
// including 11 lines never used for constructing the conditional key.
/** @param {number[]} nums @returns {number} */
function ioc(nums) {
  const counts=Array(29).fill(0);
  for (const n of nums) counts[n]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/(nums.length*(nums.length-1));
}
const decodedA=a.map(row=>decrypt(row,key));
const decodedB=b.map(row=>decrypt(row,key));
assert.deepEqual(decodedA[5],hit.pa);
assert.deepEqual(decodedB[5],hit.pb);
const allA=decodedA.flat(),allB=decodedB.flat();
assert.equal(allA.length,255);
assert.equal(allB.length,269);
assert.ok(Math.abs(ioc(allA)-0.03322525860737996)<1e-12);
assert.ok(Math.abs(ioc(allB)-0.035066304166897856)<1e-12);
console.log(JSON.stringify({
  scope:'Two original 23-rune physical line6 occurrences with the same candidate DH geometry',
  originalPages:[8,28],
  originalWords:[p8WordLengths,p28WordLengths],
  naturalAffineFactors:allFactors.filter(x=>x.count>0).map(x=>x.factor),
  sourceDHMultiplier:2,
  conditionalLine6DictionaryPair:[wordA.join(' '),wordB.join(' ')],
  conditionalKey23:textGP(key),
  sourceExactReencryptBoth:true,
  independentNativeWordPositive:true,
  unknownLine6PlaintextAuthenticated:false,
  untouchedPhysicalLineTransfers:11,
  fullOriginalPages:{
    p8:{runes:allA.length,IoC:ioc(allA),firstLine:textGP(decodedA[0])},
    p28:{runes:allB.length,IoC:ioc(allB),firstLine:textGP(decodedB[0])}
  },
  result:'Reject fixed 23-position line-reset reuse of this fitted common affine-2 key: independent original lines remain nonlinguistic.'
},null,2));
