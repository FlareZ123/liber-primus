"use strict";

/**
 * SFT: direct plaintext attack on a source-selected polynomial quotient.
 *
 * Hypothesis: the 256-cell p49–51 base60 table, stripped of its source
 * p23/p39 degree-four GP29 polynomial factor, exposes 252 ciphertext
 * GP29 symbols encrypted by a period-32 Vigenere key (the printed table
 * has 32 rows). Every candidate inverse is exact and source-positioned.
 *
 * An independent solved-LP source plant tests whether the language-key
 * optimizer has enough power at this short length and 32-symbol key.
 * A high score without a legible original plaintext is NOT a solution.
 *
 * Windows 11, Node.js 22, run:
 *   node sims/lp2_q252_period32_language_inverse_sft.cjs
 *
 * No external dependencies, network, writes, or original corpus changes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { encodeSourceNativeGP } =
  require("./lp2_native_gp_source_orthography_sft.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const MOD = 29;
const KEYLEN = 32;
const N = 252;
const mod = x => (x % MOD + MOD) % MOD;

/** @param {number[]} originalByteCells */
function quotient(originalByteCells) {
  assert.equal(originalByteCells.length, 256);
  // R(X)G(X) in source-observed descending power basis.
  const factor = [5, 24, 7, 16, 12];
  const remaining = originalByteCells.map(x => x % MOD);
  const q = [];
  for (let i = 0; i < N; i++) {
    const v = mod(6 * remaining[i]); // inverse(5) modulo29 =6
    q.push(v);
    for (let j = 0; j < 5; j++)
      remaining[i + j] = mod(remaining[i + j] - v * factor[j]);
  }
  assert.deepEqual(remaining.slice(-4), [0, 0, 0, 0]);
  assert.deepEqual(q.slice(0, 12),
    [0, 23, 10, 15, 28, 2, 3, 4, 20, 15, 4, 6]);
  return q;
}
const Q = quotient(grid.bytes);
const runeToIndex = new Map(gp.runes.map((r, i) => [r, i]));
const reference = [...solved.sections.map(s => s.source_text).join("")]
  .filter(x => runeToIndex.has(x)).map(x => runeToIndex.get(x));
assert.equal(reference.length, 2979);

const refs = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
];

/**
 * Build a GP-native 4-gram source model with recursive smoothing.
 * Counts are observed on concatenated words, as the p50 quotient has
 * no author-visible native word separators.
 */
function makeModel() {
  const c1 = new Uint32Array(29);
  const c2 = new Uint32Array(29 ** 2);
  const c3 = new Uint32Array(29 ** 3);
  const c4 = new Uint32Array(29 ** 4);
  let total = 0;
  for (const file of refs) {
    const x = encodeSourceNativeGP(read(file));
    total += x.length;
    for (let i = 0; i < x.length; i++) {
      c1[x[i]]++;
      if (i >= 1) c2[x[i-1] * 29 + x[i]]++;
      if (i >= 2) c3[(x[i-2]*29 + x[i-1])*29 + x[i]]++;
      if (i >= 3) c4[((x[i-3]*29+x[i-2])*29+x[i-1])*29+x[i]]++;
    }
  }
  const lm = new Float64Array(29 ** 4);
  for (let a = 0; a < 29; a++)
    for (let b = 0; b < 29; b++)
      for (let c = 0; c < 29; c++)
        for (let d = 0; d < 29; d++) {
          const ab = a*29+b, bc=b*29+c, cd=c*29+d;
          const abc = ab*29+c, bcd=bc*29+d, abcd=abc*29+d;
          const p1=(c1[d]+.5)/(total+29*.5);
          const p2=(c2[cd]+5*p1)/(c1[c]+5);
          const p3=(c3[bcd]+8*p2)/(c2[bc]+8);
          const p4=(c4[abcd]+15*p3)/(c3[abc]+15);
          lm[abcd]=Math.log(p4);
        }
  console.log("MODEL source corpus GP29 symbols " + total +
    ", native 4-gram inventory " + c4.filter(x => x > 0).length);
  return lm;
}
const lm=makeModel();
const BASE=29 ** 3;

/** @param {number[]} p @param {number} i */
function localScore(p,i) {
  return lm[((p[i-3]*29+p[i-2])*29+p[i-1])*29+p[i]];
}
/** @param {number[]} p */
function score(p) {
  let s=0;
  for(let i=3;i<p.length;i++)s+=localScore(p,i);
  return s;
}
/** @param {number[]} text @param {number[]} key */
function encrypt(text,key) {
  return text.map((v,i)=>mod(v+key[i%KEYLEN]));
}
/** @param {number[]} text @param {number[]} key */
function decrypt(text,key) {
  return text.map((v,i)=>mod(v-key[i%KEYLEN]));
}
/** @param {number} seed */
function rng(seed) {
  let x=seed>>>0;
  return ()=>{
    x ^= x << 13; x ^= x>>>17; x ^= x<<5;
    return (x>>>0)/4294967296;
  };
}

/**
 * Period-32 Vigenere search via independent deterministic restarts of
 * coordinate-wise global conditional likelihood optimization.
 * The eight instances of each phase modify disjoint 4-gram neighborhoods.
 * This is an attack attempt, not an exhaustive key proof.
 * @param {number[]} cipher
 * @param {number} seed
 * @param {number} starts
 */
function attack(cipher,seed,starts) {
  assert.equal(cipher.length,N);
  const random=rng(seed);
  const affected=Array.from({length:KEYLEN},(_,phase)=>{
    const selected=new Set();
    for(let i=phase;i<N;i+=KEYLEN)
      for(let end=Math.max(3,i);end<=Math.min(N-1,i+3);end++)
        selected.add(end);
    return [...selected];
  });
  let best={score:-Infinity,key:[],plain:[]};
  for(let restart=0;restart<starts;restart++) {
    const key=Array.from({length:KEYLEN},()=>Math.floor(random()*MOD));
    const plain=decrypt(cipher,key);
    let s=score(plain);
    for(let round=0;round<100;round++) {
      const phases=Array.from({length:KEYLEN},(_,i)=>i);
      for(let i=KEYLEN-1;i>0;i--) {
        const j=Math.floor(random()*(i+1));
        [phases[i],phases[j]]=[phases[j],phases[i]];
      }
      const temperature=round<70 ? 2.0*Math.pow(.90,round) : 0;
      let changed=0;
      for(const ph of phases) {
        const positions=[];
        for(let i=ph;i<N;i+=KEYLEN)positions.push(i);
        const oldKey=key[ph];
        let oldAffected=0;
        for(const end of affected[ph])oldAffected+=localScore(plain,end);
        let winner=-Infinity;
        let chosen=oldKey;
        let chosenActual=oldAffected;
        for(let candidate=0;candidate<MOD;candidate++) {
          for(const i of positions)plain[i]=mod(cipher[i]-candidate);
          let proposed=0;
          for(const end of affected[ph])proposed+=localScore(plain,end);
          const noisy=proposed+(temperature ? -temperature*Math.log(-Math.log(Math.max(1e-12,random()))) : 0);
          if(noisy>winner) {
            winner=noisy;
            chosen=candidate;
            chosenActual=proposed;
          }
        }
        for(const i of positions)plain[i]=mod(cipher[i]-chosen);
        if(chosen!==oldKey)changed++;
        key[ph]=chosen;
        s+=chosenActual-oldAffected;
      }
      if(round>=70 && !changed)break;
    }
    // Re-score directly, guarding against stale delta bookkeeping.
    const actual=score(plain);
    assert(Math.abs(s-actual)<1e-5);
    if(actual>best.score) {
      best={score:actual,key:[...key],plain:[...plain]};
    }
    if((restart+1)%16===0)
      console.log("search seed " +seed+" restart "+(restart+1)+"/"+starts+
        " peak score "+(best.score/(N-3)).toFixed(5));
  }
  return best;
}

/** @param {number[]} p */
function ioc(p) {
  const n=new Uint32Array(29);
  for(const v of p)n[v]++;
  return n.reduce((s,x)=>s+x*(x-1),0)/(p.length*(p.length-1));
}
const toLatin = p => p.map(x=>gp.translit[x]).join("");
const reveal = (label,obj) =>
  console.log(JSON.stringify({
    label,
    meanLogProbability:obj.score/(N-3),
    ioC:ioc(obj.plain),
    recoveredKey:obj.key,
    romanizedPrefix:toLatin(obj.plain).slice(0,320)
  },null,2));
const known=reference.slice(1030,1030+N);
assert.equal(known.length,N);
const trueKey=Array.from({length:KEYLEN},(_,i)=>(7*i*i+11*i+3)%29);
const plantedCipher=encrypt(known,trueKey);
assert.deepEqual(decrypt(plantedCipher,trueKey),known);
const control=attack(plantedCipher,0x51a61957,64);
reveal("AUTHENTIC GP SOURCE PLANT",control);
console.log("CONTROL exact recovered key positions " +
  control.key.filter((x,i)=>x===trueKey[i]).length + "/32");
console.log("CONTROL exact recovered plaintext positions " +
  control.plain.filter((x,i)=>x===known[i]).length + "/252");
console.log("CONTROL true source score "+(score(known)/(N-3)).toFixed(5)+
  ", source IoC "+ioc(known).toFixed(5));
const original=attack(Q,0x3301c25a,64);
reveal("ORIGINAL p50 quartic quotient",original);
console.log("ORIGINAL raw quotient score "+(score(Q)/(N-3)).toFixed(5)+
  ", source original raw IoC "+ioc(Q).toFixed(5));
console.log("PASS: exact polynomial extraction and source-native positive inverse");
