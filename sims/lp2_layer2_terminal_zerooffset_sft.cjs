"use strict";

/**
 * LP2 ninth-section 299-rune zero-offset two-layer original-input screen.
 *
 * This is the previously untested terminal section's fixed source-reset cell,
 * not the much larger free-offset campaign. Source original runes and GP
 * alphabet are read from the canonical repository corpus. The 20 number
 * families and 30 words are exactly the finite historic layer2 catalog:
 * https://github.com/pnotisdev/cicada3301/blob/main/work/layer2/export.py
 *
 * Bigram controls are pinned from the external work/phpmt/data/bigram.txt
 * (29x29 transition rows plus one 29-item unigram row). The 299-rune GP
 * English native planted control is pinned from work/phpmt/data/english.txt.
 *
 * Run on Windows 11 with Node 22:
 * node sims/lp2_layer2_terminal_zerooffset_sft.cjs
 *
 * A source-reset (offset 0) screen does not exclude arbitrary offsets.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const sourceRoot = path.join(__dirname, "..", "resources", "liber-primus");
const gp = JSON.parse(fs.readFileSync(path.join(sourceRoot, "lp2-corpus.json"), "utf8"));
const BG = [[3,0,13,14,8,-6,-12,-7,-2,-9,11,-27,-40,-7,-40,-3,0,-11,10,-4,1,-40,-40,-15,12,-40,-10,-40,-14],[-20,-30,-8,-10,13,-1,0,-28,-26,7,5,-40,-40,-7,-34,11,11,-11,19,-4,9,-19,-40,-5,3,-40,-32,-23,-40],[-24,-17,-8,4,-9,-29,-31,-19,-17,-27,3,-40,-33,-26,-40,-18,-25,-27,29,-22,-28,-2,-40,-32,13,-40,-15,-40,-34],[15,14,1,0,14,-2,-16,5,-13,11,-9,-40,-40,-5,-37,0,4,-6,-23,7,1,-37,-40,-2,-8,-40,-18,-40,-36],[-8,0,-1,10,-8,0,-11,-9,-10,-5,9,-39,-39,-9,-40,7,5,-11,18,-2,-6,-18,-40,-3,11,-40,2,-15,-1],[-24,5,-17,14,-2,0,-38,-19,15,-4,4,-40,-40,-30,-40,-4,12,-25,18,-27,-3,-11,-40,-33,11,-40,-13,-13,-26],[-30,-1,-11,12,14,-36,-12,-21,18,1,8,-40,-24,-26,-40,-13,-21,-29,17,-14,-2,-20,-18,-32,9,-40,-9,-7,-40],[-21,-24,-7,11,-8,-18,-30,-13,20,2,17,-40,-40,-24,-40,-1,-18,-25,16,-19,-14,-16,-40,-20,11,-40,-25,-40,-14],[-24,-5,-7,14,-16,-17,-30,-12,-12,-18,20,-40,-40,-23,-40,-14,5,-15,16,-16,-24,-21,-36,-24,18,-40,-9,-36,-2],[-9,-9,4,12,-20,6,-5,-6,-8,-7,4,-32,-37,-17,-40,7,10,-11,9,-15,-10,-20,-40,18,8,-40,-8,-25,-25],[0,1,0,-40,3,9,-1,-24,-23,18,-35,-40,-40,-14,-31,17,13,-14,3,4,4,-40,-40,-2,-24,-40,-40,-40,-40],[-30,23,-30,19,-30,-30,-30,-30,-30,-30,-30,-30,-30,-30,-30,-30,-30,-30,23,-30,-30,-30,-30,-30,1,-30,-30,-30,-19],[7,17,-21,-21,10,-21,3,-10,-21,14,-10,-21,-21,20,-21,-21,-21,-21,-21,-5,7,-21,-21,-21,-10,-21,-21,-21,-21],[-28,2,-16,12,15,-36,-40,-22,1,-40,7,-40,-18,3,-40,-8,1,-27,16,-33,10,-24,-10,-31,13,-40,-18,-23,1],[-13,-10,-11,-3,-21,11,-26,-8,3,-26,12,-37,-37,21,-37,-15,16,-37,10,-21,-26,-37,-37,-26,9,-37,-17,-26,-37],[-7,0,4,12,-15,0,-16,0,5,-4,7,-36,-40,0,-40,6,14,-7,13,-6,-9,-22,-40,-12,11,-40,-16,-14,-21],[-10,4,2,15,5,-8,-18,1,-5,-11,11,-38,-40,-11,-40,8,0,-7,12,-9,-6,-15,-40,-14,10,-40,1,5,-20],[-40,15,-30,9,4,-40,-40,-35,-35,-40,0,-8,-40,-40,-40,-3,-12,-17,22,-35,12,-32,-40,-33,4,-40,11,-22,-1],[-3,-1,-1,-1,13,3,-9,0,-4,11,3,-33,-40,-2,-11,13,3,-6,1,2,4,-27,-40,5,3,-40,-8,-40,-31],[-18,3,-4,11,-30,-21,-31,-11,-13,-11,9,-40,-40,6,-40,4,-13,-1,19,-2,-20,-19,-40,-30,19,-40,-1,-40,-11],[0,-2,-1,9,-13,-9,-17,-7,-13,-13,12,-40,-35,-10,-40,2,-5,-11,14,-11,15,-18,-40,6,11,-40,5,-20,-8],[-2,-1,11,9,-7,-3,-14,5,3,-9,11,-35,-40,-7,-40,16,5,-3,-1,-4,0,-21,-40,-6,10,-40,-14,-40,-35],[-16,1,-8,-16,-16,-16,-27,-27,-27,-27,-27,-27,-27,-27,-27,28,21,-27,-27,-1,-27,-27,-27,-16,-27,-27,-27,-27,-27],[-3,-1,7,9,-2,-3,-7,2,-3,-3,11,-27,-40,-5,-40,9,-2,1,14,-3,-5,-13,-15,-5,10,-40,-8,-20,-12],[-10,0,-16,-39,9,6,-5,-9,-25,20,1,-39,-40,-4,-32,8,14,-6,-40,-2,11,-40,-40,-4,-40,-40,-2,-40,-40],[-5,6,-5,-5,6,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,19,-5,-5,14,-5,-5,-5,-5,-5],[-2,-13,8,16,-4,0,-11,5,-2,-9,7,-27,-40,-4,-40,10,0,1,6,2,-4,-14,-40,-4,12,-40,-15,-40,-13],[-38,4,-30,-27,-2,-25,-9,-33,-33,31,-25,-40,-40,-38,-40,-8,-3,-18,-38,-20,6,-40,-40,-9,-21,-40,-40,-40,-40],[-17,10,-5,-17,19,14,-23,-26,-40,0,-31,-40,-40,-13,-40,12,14,-22,-39,-6,7,-40,-40,9,-26,-40,-40,-40,-40],[-2,2,0,8,6,0,-10,-4,-2,7,7,-36,-40,-6,-30,8,7,-9,13,-3,2,-20,-40,1,8,-40,-6,-17,-16]];
const CONTROL = [14,18,9,3,13,8,3,9,6,10,1,18,15,3,0,8,10,19,15,18,20,0,24,9,23,8,10,15,5,3,19,13,24,16,4,27,16,15,10,9,2,18,4,18,16,4,28,16,3,0,2,18,16,18,9,2,3,1,15,24,9,23,24,0,16,18,4,2,18,24,4,19,26,8,24,23,5,4,3,15,15,18,23,2,18,4,10,1,18,4,16,18,20,18,17,3,24,15,10,9,24,4,19,18,9,27,2,18,4,18,0,18,20,20,19,1,5,8,15,9,3,7,24,9,23,2,18,16,4,3,3,13,15,20,24,26,19,10,15,18,4,24,17,20,26,3,9,2,18,6,4,3,1,9,23,5,3,1,18,4,18,23,7,10,2,10,16,17,1,16,14,18,9,3,13,8,3,9,24,4,3,15,18,9,24,5,18,23,24,9,23,16,24,5,21,24,9,24,14,18,17,18,6,24,9,16,3,15,13,20,10,16,7,3,3,23,7,8,18,4,18,1,13,3,9,3,2,18,4,15,4,3,15,18,24,9,23,23,10,23,2,18,20,10,5,18,2,4,3,1,6,8,3,1,16,8,10,15,24,4,19,26,18,14,10,15,16,15,24,17,3,1,9,23,20,18,15,15,20,10,17,18,4,16,26,3,0,15,13,18,18,5,8,2,18,26,5,1,24];
const WORDS = [
  "DIVINITY","FIRFUMFERENFE","CIRCUMFERENCE","INSTAR","EMERGENCE",
  "PRIMALITY","TOTIENT","PILGRIM","CICADA","LIBERPRIMUS","INTUS",
  "PARABLE","KOAN","WELCOME","PRIMES","SACRED","WISDOM","INSTRUCTION",
  "WARNING","TRUTH","ENLIGHTENED","CONSUMPTION","PRESERVATION",
  "ADHERENCE","DECEPTION","CIRCUMFERENCES","SURFACE","EMERGE",
  "THEPRIMESARESACRED","AWARNING"
];
const N = 960;
const mod = x => (x % 29 + 29) % 29;
assert.equal(BG.length, 30);
assert(BG.every(row => row.length === 29));
assert.equal(CONTROL.length, 299);
assert.equal(gp.pages[54].indices.length, 232);
assert.equal(gp.pages[55].indices.length, 76);
const ciphertext = gp.pages[54].indices.slice(9).concat(gp.pages[55].indices);
assert.equal(ciphertext.length, 299);
const preceding = gp.pages[54].indices[8];
assert.equal(preceding, 19);

/** @param {bigint} n @returns {bigint} */
function isqrt(n) {
  let x = 1n << BigInt(Math.ceil(n.toString(2).length / 2));
  while (true) {
    const y = (x + n / x) >> 1n;
    if (y >= x) return x;
    x = y;
  }
}

/** @param {number} q @param {bigint} scale @returns {bigint} */
function atanInverse(q, scale) {
  let term = scale / BigInt(q), sum = 0n, sign = 1n, denominator = 1n;
  const divisor = BigInt(q * q);
  while (term) {
    sum += sign * (term / denominator);
    term /= divisor;
    denominator += 2n;
    sign = -sign;
  }
  return sum;
}

/** @returns {Record<string, number[]>} */
function numberStreams() {
  const scale = 29n ** BigInt(N);
  const pi = 16n * atanInverse(5, scale) - 4n * atanInverse(239, scale);
  let term = scale, e = scale;
  for (let k = 1n; term; k++) {
    term /= k;
    e += term;
  }
  const phiConst = (scale + isqrt(5n * scale * scale)) / 2n;
  const sqrt2Const = isqrt(2n * scale * scale);
  /** @param {bigint} value @returns {number[]} */
  const base29 = value => (value % scale).toString(29)
    .padStart(N, "0").split("").map(d => parseInt(d, 29));
  /** @param {bigint} value @returns {number[]} */
  const base10 = value => (value / scale).toString()
    .concat((value % scale * 10n ** BigInt(N) / scale).toString().padStart(N, "0"))
    .slice(0, N).split("").map(Number);
  const constant = {
    "pi digits (base 10)": base10(pi),
    "pi digits (base 29)": base29(pi),
    "e digits (base 10)": base10(e),
    "e digits (base 29)": base29(e),
    "phi digits (base 29)": base29(phiConst),
    "sqrt2 digits (base 29)": base29(sqrt2Const)
  };
  assert.deepEqual(constant["pi digits (base 29)"].slice(0, 10),
    [4,3,2,8,23,0,12,19,26,22]);
  assert.deepEqual(constant["phi digits (base 29)"].slice(0, 10),
    [17,26,22,6,20,6,19,20,3,8]);
  assert.equal(constant["pi digits (base 10)"].slice(0, 20).join(""),
    "31415926535897932384");
  const end = N * 18 + 3302;
  const sieve = Array(end).fill(true);
  sieve[0] = sieve[1] = false;
  for (let d = 2; d * d < end; d++) {
    if (sieve[d]) for (let k = d * d; k < end; k += d) sieve[k] = false;
  }
  const primes = sieve.flatMap((yes, i) => yes ? [i] : []);
  const phi = Array.from({length: N + 1}, (_, i) => i);
  const sigma = Array(N + 1).fill(0);
  for (let d = 1; d <= N; d++) {
    for (let j = d; j <= N; j += d) sigma[j] += d;
  }
  for (let d = 2; d <= N; d++) {
    if (phi[d] === d) for (let j = d; j <= N; j += d) {
      phi[j] -= Math.floor(phi[j] / d);
    }
  }
  const fibonacci = [0, 1], lucas = [2, 1];
  for (let i = 2; i < N; i++) {
    fibonacci[i] = mod(fibonacci[i - 1] + fibonacci[i - 2]);
    lucas[i] = mod(lucas[i - 1] + lucas[i - 2]);
  }
  let sum = 0;
  const seq = {
    "primes": primes.slice(0, N),
    "primes-1 (totient)": primes.slice(0, N).map(v => v - 1),
    "primes+1": primes.slice(0, N).map(v => v + 1),
    "phi(n)": phi.slice(1),
    "sigma(n)": sigma.slice(1),
    "n": Array.from({length: N}, (_, i) => i + 1),
    "n^2": Array.from({length: N}, (_, i) => (i + 1) ** 2),
    "triangular": Array.from({length: N}, (_, i) => (i + 1) * (i + 2) / 2),
    "fibonacci": fibonacci,
    "lucas": lucas,
    ...constant,
    "primes from 3301": primes.filter(p => p >= 3301).slice(0, N),
    "3301*n": Array.from({length: N}, (_, i) => 3301 * (i + 1)),
    "cumulative prime sum": primes.slice(0, N).map(p => (sum += p)),
    "gematria primes cycle": Array.from({length: N}, (_, i) => gp.prime[i % 29])
  };
  assert.equal(Object.keys(seq).length, 20);
  for (const [name, v] of Object.entries(seq)) {
    assert.equal(v.length, N, name);
    seq[name] = v.map(mod);
  }
  return seq;
}

const gpOrder = Array.from({length:29}, (_,i)=>i)
  .sort((a,b)=>gp.translit[b].length - gp.translit[a].length);
const aliases = {V:1, K:5, Z:15, Q:5};
/** @param {string} original @returns {number[]} */
function encodeKey(original) {
  const key = [];
  let word = original;
  while (word.length) {
    const rune = gpOrder.find(i => word.startsWith(gp.translit[i]));
    if (rune !== undefined) {
      key.push(rune);
      word = word.slice(gp.translit[rune].length);
    } else {
      assert.notEqual(aliases[word[0]], undefined, original);
      key.push(aliases[word[0]]);
      word = word.slice(1);
    }
  }
  return key;
}

/**
 * Original external two-stage anti-repeat beam, outer model0/1, and
 * optional literal-F transparency. Score in unscaled bigram log-odds units.
 * @param {number[]} cipher
 * @param {number} prev
 * @param {number[]} outer
 * @param {number[]} inner
 * @param {number} start
 * @param {boolean} litF
 * @param {boolean} atbash
 * @param {number} model
 * @param {number} beam
 * @returns {{score:number,used:number}}
 */
function decode(cipher,prev,outer,inner,start,litF,atbash,model,beam) {
  let states = [{j:0,ph:start,last:29,s:0}];
  const m=inner.length;
  for (let i=0;i<cipher.length;i++) {
    const ci=cipher[i],previous=i===0?prev:cipher[i-1],next=[];
    for (const state of states) {
      const j=state.j;
      if (j+3>outer.length) continue;
      const k0=outer[j],q0=mod(ci-k0);
      const opts=[[q0,model===1&&previous===ci?j+2:j+1]];
      if (previous>=0) {
        if (model===0) {
          const q1=mod(ci-outer[j+1]);
          if (mod(q1+k0)===previous) opts.push([q1,j+2]);
          const q2=mod(ci-outer[j+2]);
          if (mod(q2+k0)===previous && mod(q2+outer[j+1])===previous) {
            opts.push([q2,j+3]);
          }
        } else {
          const q2=mod(ci-outer[j+2]);
          if (mod(q2+k0)===previous) opts.push([q2,j+3]);
        }
      }
      for (const [q,nj] of opts) {
        let p=mod(q-inner[state.ph]);
        if (atbash) p=28-p;
        next.push({j:nj,ph:(state.ph+1)%m,last:p,
          s:state.s+BG[state.last][p]});
        if (litF&&q===0) next.push({j:nj,ph:state.ph,last:0,
          s:state.s+BG[state.last][0]});
      }
    }
    const unique=new Map();
    for (const s of next) {
      const id=s.j+"_"+s.ph,found=unique.get(id);
      if (!found||found.s<s.s) unique.set(id,s);
    }
    states=[...unique.values()].sort((a,b)=>b.s-a.s).slice(0,beam);
    if (!states.length) return {score:-Infinity,used:i+1};
    if (i===29&&states[0].s< -120) return {score:states[0].s/30,used:30};
  }
  return {score:states[0].s/cipher.length,used:cipher.length};
}

/** @param {number[]} plain @param {number[]} outer
 * @param {number[]} keyword @returns {number[]} */
function plant(plain, outer, keyword) {
  const cipher=[];
  let j=0,phase=0;
  for (const p of plain) {
    const q=p===0?0:mod(p+keyword[phase]);
    if (p!==0) phase=(phase+1)%keyword.length;
    let retries=0;
    while (cipher.length&&mod(q+outer[j])===cipher[cipher.length-1]) {
      j++;
      retries++;
      assert(retries<=2,"historical two-collision model max");
    }
    cipher.push(mod(q+outer[j]));
    j++;
  }
  assert.equal(cipher.length,299);
  return cipher;
}

/** @param {Record<string, number[]>} streams */
function run(streams) {
  const kw=WORDS.map(name=>({name,key:encodeKey(name)}));
  assert.equal(kw.length,30);
  const best=[],all=[];
  let tests=0,complete=0;
  for (const [outerName,values] of Object.entries(streams)) {
    let top={score:-Infinity};
    for (const sign of [1,28]) {
      const stream=values.map(x=>mod(sign*x));
      for (const {name,key} of kw) for (const innerSign of [1,28]) {
        const inner=key.map(x=>mod(innerSign*x));
        for (let phase=0;phase<inner.length;phase++)
        for (const model of [0,1]) for (const literalF of [false,true])
        for (const atbash of [false,true]) {
          const o=decode(ciphertext,preceding,stream,inner,phase,literalF,
            atbash,model,16);
          tests++;
          if (o.used===299) {
            complete++;
            if (o.score>top.score) {
              top={outerName,sign,keyword:name,innerSign,phase,model,
                literalF,atbash,...o};
            }
          }
        }
      }
    }
    best.push(top);
    if (top.used===299) all.push(top);
  }
  all.sort((a,b)=>b.score-a.score);
  return {tests,complete,earlyAborts:tests-complete,best:all[0],perStream:best};
}

/** @param {number} seed @returns {()=>number} */
function xorshift(seed) {
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}

/** @param {Record<string, number[]>} original
 * @returns {Record<string, number[]>} */
function shuffledStreams(original) {
  const next=xorshift(0x33011339), shuffled={};
  for (const [name,values] of Object.entries(original)) {
    const v=values.slice();
    for (let i=v.length-1;i>0;i--) {
      const j=next()%(i+1);
      [v[i],v[j]]=[v[j],v[i]];
    }
    shuffled[name]=v;
  }
  return shuffled;
}

const original=numberStreams();
const actual=run(original);
assert.equal(actual.tests,162560);
assert.equal(actual.complete,1889);
assert(Math.abs(actual.best.score-(-6.096989966555184))<1e-12);
const matched=run(shuffledStreams(original));
assert.equal(matched.tests,actual.tests);
const inputKey=encodeKey("DIVINITY");
const plantCipher=plant(CONTROL,original["primes-1 (totient)"],inputKey);
const positive=decode(plantCipher,-1,original["primes-1 (totient)"],
  inputKey,0,true,false,0,16);
assert.equal(positive.used,299);
assert(positive.score>7);
const wrong=decode(plantCipher,-1,original["sigma(n)"],
  inputKey,0,true,false,0,16);
console.log(JSON.stringify({
  scope:"Original ninth LP2 visual section black body, zero outer key offset",
  originalRunes:299,originalPrevRune:preceding,
  originalCorpus:"resources/liber-primus/lp2-corpus.json",
  catalog:"20 historical streams x 30 historical keywords; all phases, both signs, both anti-repeat models, litF0/1 and Atbash0/1",
  original:actual,matchedSourceHistogramShuffle:matched,
  control:{plain:299,positive,wrong},
  decision:"Zero-offset ninth-section fixed catalog rejects GP-English direct inverse; free-offset historical screen remains open."
},null,2));
