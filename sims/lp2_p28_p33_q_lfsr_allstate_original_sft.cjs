'use strict';

/**
 * Exhaustive original-source cubic LFSR decryption: 29^3 initial states,
 * both additive orientations, and independent authentic GP29 controls.
 * Q(X)=[15,18,12,6] comes from p39 red G and p29 source terminal packet.
 * No original plaintext/key is presumed. Windows Node22/CommonJS SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} p */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
/** @param {string} p */
const load = p => JSON.parse(read(p));

const corpus = load('resources/liber-primus/lp2-corpus.json');
const alphabet = corpus.translit;
const runeMap = new Map(alphabet.map((x, i) => [x, i]));
const MOD = 29;
const SPACE2 = 29 * 29;
const SPACE3 = SPACE2 * 29;
const SPACE4 = SPACE3 * 29;
const BEAM = 2000;
/** @param {number} x */
const mod = x => (x % MOD + MOD) % MOD;

/**
 * GP-native greedy transliteration used for the pinned held-out controls.
 * @param {string} text
 * @returns {number[]}
 */
function encode(text) {
  const out = [];
  const words = text.toUpperCase().match(/[A-Z]+/g) || [];
  for (let word of words) {
    word = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/K/g, 'C').replace(/Z/g, 'S');
    for (let i = 0; i < word.length;) {
      // Exact solved-LP1/p57 source spelling: ING and IO are whole runes.
      if (word.startsWith('ING', i)) {
        out.push(21);
        i += 3;
        continue;
      }
      if (word.startsWith('IO', i)) {
        out.push(27);
        i += 2;
        continue;
      }
      let found;
      let advance = 0;
      for (const len of [3, 2, 1]) {
        const symbol = runeMap.get(word.slice(i, i + len));
        if (symbol !== undefined) {
          found = symbol;
          advance = len;
          break;
        }
      }
      if (found !== undefined) out.push(found);
      i += advance || 1;
    }
  }
  return out;
}

/**
 * Fixed-orientation polynomial long division, coefficients high-degree-first.
 * @param {number[]} input
 * @param {number[]} divisor
 * @returns {number[]}
 */
function divide(input, divisor) {
  const remainder = input.map(mod);
  const quotient = [];
  const inverse = Array.from({length: MOD}, (_, i) => i)
    .find(i => mod(i * divisor[0]) === 1);
  assert.notEqual(inverse, undefined);
  for (let i = 0; i <= remainder.length - divisor.length; i++) {
    const coefficient = mod(remainder[i] * inverse);
    quotient.push(coefficient);
    for (let j = 0; j < divisor.length; j++) {
      remainder[i + j] = mod(remainder[i + j] - coefficient * divisor[j]);
    }
  }
  return { quotient, remainder: remainder.slice(-divisor.length + 1) };
}

/**
 * MLE frequency counts with interpolated lower-order backoff.
 * @param {number[]} train
 */
function trainLanguageModel(train) {
  const c1 = new Float64Array(MOD);
  const c2 = new Float64Array(SPACE2);
  const c3 = new Float64Array(SPACE3);
  const c4 = new Float64Array(SPACE4);
  for (let i = 0; i < train.length; i++) {
    const a = train[i];
    c1[a]++;
    if (i >= 1) c2[train[i - 1] * MOD + a]++;
    if (i >= 2) c3[(train[i - 2] * MOD + train[i - 1]) * MOD + a]++;
    if (i >= 3) {
      c4[((train[i - 3] * MOD + train[i - 2]) * MOD +
        train[i - 1]) * MOD + a]++;
    }
  }
  const p1 = new Float64Array(MOD);
  const p2 = new Float64Array(SPACE2);
  const p3 = new Float64Array(SPACE3);
  const l1 = new Float64Array(MOD);
  const l2 = new Float64Array(SPACE2);
  const l3 = new Float64Array(SPACE3);
  const l4 = new Float32Array(SPACE4);
  for (let i = 0; i < MOD; i++) {
    p1[i] = (c1[i] + 0.2) / (train.length + 0.2 * MOD);
    l1[i] = Math.log(p1[i]);
  }
  for (let i = 0; i < SPACE2; i++) {
    p2[i] = (c2[i] + 5 * p1[i % MOD]) /
      (c1[Math.floor(i / MOD)] + 5);
    l2[i] = Math.log(p2[i]);
  }
  for (let i = 0; i < SPACE3; i++) {
    p3[i] = (c3[i] + 5 * p2[i % SPACE2]) /
      (c2[Math.floor(i / MOD)] + 5);
    l3[i] = Math.log(p3[i]);
  }
  for (let i = 0; i < SPACE4; i++) {
    l4[i] = Math.log((c4[i] + 7 * p3[i % SPACE3]) /
      (c3[Math.floor(i / MOD)] + 7));
  }
  return {l1, l2, l3, l4};
}


/** @param {number} a @param {number} b @param {number} c @returns {number[]} */
function qStream(a,b,c) {
  const k=[a,b,c];
  for (let i=3;i<277;i++) k.push(mod(-2*(18*k[i-1]+12*k[i-2]+6*k[i-3])));
  for(let i=0;i<k.length-3;i++) {
    assert.equal(mod(15*k[i+3]+18*k[i+2]+12*k[i+1]+6*k[i]),0);
  }
  return k;
}
/** @param {number[]} arr @param {number[]} key @param {number} sign @returns {number[]} */
function decoded(arr,key,sign) {
  return arr.map((x,i)=>mod(x+sign*key[i]));
}
/** @param {number[]} arr @param {ReturnType<typeof trainLanguageModel>} lang @returns {number} */
function meanNativeLogScore(arr,lang) {
  const {l1,l2,l3,l4}=lang, n=arr.length;
  let score=l1[arr[0]]+l2[arr[0]*MOD+arr[1]]+
    l3[(arr[0]*MOD+arr[1])*MOD+arr[2]];
  for(let i=3;i<n;i++){
    const ix=((arr[i-3]*MOD+arr[i-2])*MOD+arr[i-1])*MOD+arr[i];
    score+=l4[ix];
  }
  return score/n;
}
/** @param {Array<{a:number,b:number,c:number,sign:number,score:number}>} arr
 * @param {{a:number,b:number,c:number,sign:number,score:number}} row */
function insertTop(arr,row) {
  if (arr.length>=8&&row.score<=arr[arr.length-1].score) return;
  arr.push(row);
  arr.sort((x,y)=>y.score-x.score);
  arr.length=Math.min(arr.length,8);
}
const sources = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/shakespeare_first300k.txt',
].map(p=>encode(read(p)));
const training=sources.flatMap(x=>x.slice(0,Math.floor(x.length*0.7)));
const heldout=sources.map(x=>x.slice(Math.floor(x.length*0.7)));
const lang=trainLanguageModel(training);
assert.equal(training.length,420646);
const source28=corpus.pages[28].indices;
const source33=corpus.pages[33].indices;
assert.deepEqual([source28.length,source33.length],[269,214]);
// The last native-GP page p57 is a real solved positive, separate from literature.
const source57=corpus.pages[57].indices;
assert.equal(source57.length,95);
const held28=heldout[0].slice(227,496);
const held33=heldout[1].slice(871,1085);
const nativeSeed=[7,13,23], nativeKey=qStream(...nativeSeed);
const planted28=decoded(held28,nativeKey,+1);
const planted33=decoded(held33,nativeKey,+1);
const planted57=decoded(source57,nativeKey,+1);
for (const [source,planted] of [[held28,planted28],[held33,planted33],[source57,planted57]]) {
  assert.deepEqual(decoded(planted,nativeKey,-1),source);
}

// Unmodified original p28/p33, a heldout independent same-key native plant,
// and a genuine known solved p57 native plant. Full uniform seed space exactly.
const top={original28:[],original33:[],originalJoint:[],nativeJoint:[],solved57:[]};
const total=29**3;
for(let seed=0;seed<total;seed++){
  const a=Math.floor(seed/841),b=Math.floor(seed/29)%29,c=seed%29;
  const key=qStream(a,b,c);
  for(const sign of [-1,1]) {
    const native28=decoded(planted28,key,sign);
    const native33=decoded(planted33,key,sign);
    const original28=decoded(source28,key,sign);
    const original33=decoded(source33,key,sign);
    const score28=meanNativeLogScore(original28,lang);
    const score33=meanNativeLogScore(original33,lang);
    const row={a,b,c,sign};
    insertTop(top.original28,{...row,score:score28});
    insertTop(top.original33,{...row,score:score33});
    insertTop(top.originalJoint,{...row,score:(score28*source28.length+score33*source33.length)/(source28.length+source33.length)});
    insertTop(top.nativeJoint,{...row,score:(meanNativeLogScore(native28,lang)*native28.length+meanNativeLogScore(native33,lang)*native33.length)/(native28.length+native33.length)});
    insertTop(top.solved57,{...row,score:meanNativeLogScore(decoded(planted57,key,sign),lang)});
  }
}
const isTrue=x=>x.a===nativeSeed[0]&&x.b===nativeSeed[1]&&x.c===nativeSeed[2]&&x.sign===-1;
assert(isTrue(top.nativeJoint[0]),'native heldout same-pad plant must recover exact 3-symbol seed and direction');
// Every original winner exactly reencrypts; report only a readable first100
// from each best output rather than introducing a fitted ciphertext exception.
const bestOriginal=top.originalJoint[0];
const checkKey=qStream(bestOriginal.a,bestOriginal.b,bestOriginal.c);
const plain28=decoded(source28,checkKey,bestOriginal.sign);
const plain33=decoded(source33,checkKey,bestOriginal.sign);
assert.deepEqual(decoded(plain28,checkKey,-bestOriginal.sign),source28);
assert.deepEqual(decoded(plain33,checkKey,-bestOriginal.sign),source33);
const latin=a=>a.map(x=>alphabet[x]).join('');
const result={
  status:'PASS',
  originalSource:'p39 G=(15,5,27), p29 Q=(15,18,12,6) via factor (X-3)',
  attackedOriginalPages:[28,33],
  fullSeedSpace:total,positivePadSeed:nativeSeed,
  originalTop: {
    p28:top.original28,
    p33:top.original33,
    joint:top.originalJoint,
  },
  positiveNativeJoint:top.nativeJoint.slice(0,4),
  independentSolved57Positive:top.solved57.slice(0,4),
  recoveredNativeSeedExactly:isTrue(top.nativeJoint[0]),
  bestOriginalFirstRunes:{p28:latin(plain28.slice(0,100)),p33:latin(plain33.slice(0,100))},
  interpretation:'Exhaustive source-cubic GP29 direct additive keystream tested; all 29^3 seeds, both directions, independent native positives. No human-visible original receiver rule or unknown plaintext claimed.',
};
console.log(JSON.stringify(result,null,2));
