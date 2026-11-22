"use strict";
/**
 * One source-fixed H1 inversion on physical LP2 pp54–55:
 * p54's nine red GP ordinal runes act as the keyword; prime-totient is
 * the historically demonstrated running stream. Node.js 22 CommonJS.
 * Exact source and planted known-LP1 controls; no fitted original key.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const Q = 29;
const red = [24, 19, 21, 23, 27, 2, 14, 10, 19];
const gp = ["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
// pnotisdev/cicada3301 work/h5rs/src/logf.rs, Self-Reliance GP unigram prior.
const logf = [-3.627225549919135,-3.171893216150944,-3.383398158345403,-2.5820450256710257,-2.8039932356397377,-3.3206777364242908,-4.3908269120731305,-3.777481620401693,-3.527648700316938,-2.6219294362065617,-2.7044499163767224,-6.92541340580455,-7.987324327622232,-4.013164331071345,-6.364996870462134,-2.601912254223261,-2.6744379309954787,-4.218360586657605,-2.08781209076449,-3.6533955292644595,-3.15555710102528,-5.3394258871799445,-7.3875972223481945,-3.2920170242342945,-2.5922481995215776,-10.499629951598346,-3.9866966206258936,-5.058367309065212,-4.928490375505553];
const mod = x => (x % Q + Q) % Q;

/** @param {number} n @returns {number[]} */
function primes(n) {
  const out = [];
  for (let k = 2; out.length < n; k++) {
    let prime = true;
    for (const p of out) {
      if (p * p > k) break;
      if (k % p === 0) { prime = false; break; }
    }
    if (prime) out.push(k);
  }
  return out;
}

/** @param {number[]} x */
function ioc(x) {
  const f = Array(Q).fill(0);
  for (const v of x) f[v]++;
  return Q * f.reduce((s,v) => s + v * (v - 1), 0) / (x.length * (x.length - 1));
}

/** Deterministic GP tokenization of the known LP1 control, not a ciphertext transcription.
 * @param {string} s @returns {number[]}
 */
function toGP(s) {
  const normalized = s.toUpperCase().replaceAll("V","U").replaceAll("K","C").replaceAll("Z","S").replaceAll("Q","CW");
  const tokens = gp.map((glyph,i) => ({glyph,i})).sort((a,b) => b.glyph.length - a.glyph.length || a.i - b.i);
  const out = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let j = 0; j < word.length;) {
      const token = tokens.find(x => word.startsWith(x.glyph,j));
      assert.ok(token, "Invalid GP token in " + word);
      out.push(token.i);
      j += token.glyph.length;
    }
  }
  return out;
}

/** Beam inverse of H1 skip and coin branches with the completely fixed key.
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {number} previous
 * @param {0|1} model
 * @param {boolean} transparentF
 */
function decode(ciphertext,key,previous,model,transparentF) {
  /** @type {Map<number,{score:number,plain:number[],ptr:number[],skips:number,bypass:boolean[]}>} */
  let active = new Map([[0,{score:0,plain:[],ptr:[],skips:0,bypass:[]}]]);
  for (let i = 0; i < ciphertext.length; i++) {
    const c = ciphertext[i], prev = i === 0 ? previous : ciphertext[i-1];
    /** @type {Map<number,{score:number,plain:number[],ptr:number[],skips:number,bypass:boolean[]}>} */
    const next = new Map();
    for (const [j,s] of active) {
      assert.ok(j + 3 < key.length);
      /** @param {number} used @param {number} p @param {number} dest @param {number} skip @param {boolean} bypass */
      function add(used,p,dest,skip,bypass=false) {
        const score = s.score + logf[p] - 3.575550768806933 * skip;
        if (score <= (next.get(dest)?.score ?? -Infinity)) return;
        next.set(dest,{score,plain:s.plain.concat(p),ptr:s.ptr.concat(used),skips:s.skips+skip,bypass:s.bypass.concat(bypass)});
      }
      add(j,mod(c-key[j]),j+(model === 1 && prev === c ? 2 : 1),0);
      if (transparentF && c === 0) add(j,0,j,0,true);
      if (prev < 0) continue;
      if (model === 0) {
        const p1 = mod(c-key[j+1]);
        if (mod(p1+key[j]) === prev) add(j+1,p1,j+2,1);
        const p2 = mod(c-key[j+2]);
        if (mod(p2+key[j]) === prev && mod(p2+key[j+1]) === prev) add(j+2,p2,j+3,2);
      } else {
        const p2 = mod(c-key[j+2]);
        if (mod(p2+key[j]) === prev) add(j+2,p2,j+3,1);
      }
    }
    active = new Map([...next].sort((a,b) => b[1].score-a[1].score).slice(0,64));
    assert.ok(active.size);
  }
  const winning = [...active.values()].sort((a,b) => b.score-a.score)[0];
  for (let i = 0; i < ciphertext.length; i++) {
    if (winning.bypass[i]) assert.equal(winning.plain[i],ciphertext[i],"transparent-F");
    else assert.equal(mod(winning.plain[i]+key[winning.ptr[i]]),ciphertext[i],"forward cipher");
  }
  return {...winning,ioc:ioc(winning.plain),preview:winning.plain.slice(0,75).map(x=>gp[x]).join("")};
}

/** Deterministic genuine skip-model planted ciphertext and true key trajectory.
 * @param {number[]} plain @param {number[]} key @param {number} previous
 */
function plant(plain,key,previous) {
  let state = 420, j = 0, skipped = 0;
  const c=[], ptr=[];
  function draw() { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 4294967296; }
  for (const p of plain) {
    let n = 0;
    while (n < 5 && mod(p+key[j]) === previous && draw() < 0.81) { j++; n++; skipped++; }
    const x = mod(p+key[j]); c.push(x); ptr.push(j); previous=x; j++;
  }
  return {c,ptr,skipped};
}

function main() {
  const root=path.resolve(__dirname,"..");
  const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
  const p54=corpus.pages[54].indices,p55=corpus.pages[55].indices;
  assert.equal(p54.length,232); assert.equal(p55.length,76);
  assert.deepEqual(p54.slice(0,9),red);
  const c=p54.slice(9).concat(p55);
  assert.equal(c.length,299);
  const source=fs.readFileSync(path.join(root,"resources/liber-primus/lp1-plaintext-reference.txt"),"utf8");
  const koan=source.split("### 6\n")[1].split("### 7")[0].replace(/^A KOAN\s*/,"");
  const native=toGP(koan).slice(0,299);
  assert.equal(native.length,299);
  const t=primes(1500).map(p => mod(p-1));
  const key=offset => Array.from({length:850},(_,j) => mod(t[j+offset]+red[j%9]));
  const planted=plant(native,key(0),19);
  const recovered=decode(planted.c,key(0),19,0,false);
  const plainHits=native.filter((v,i) => recovered.plain[i] === v).length;
  const pointerHits=planted.ptr.filter((v,i) => recovered.ptr[i] === v).length;
  console.log("CONTROL original-LP1-text GP plant: plaintext="+plainHits+"/299 pointer="+pointerHits+"/299 skips="+planted.skipped+" IoC="+recovered.ioc.toFixed(7));
  assert.equal(plainHits,299); assert.equal(pointerHits,299);
  for (const offset of [0,9]) for (const model of [0,1]) for (const transparentF of [false,true]) {
    const out=decode(c,key(offset),19,model,transparentF);
    console.log("ORIGINAL offset="+offset+" model="+model+" literalF="+transparentF+" IoC="+out.ioc.toFixed(7)+" logf/rune="+(out.score/299).toFixed(7)+" skips="+out.skips+" preview="+out.preview);
  }
}
if (require.main === module) main();
module.exports={decode,plant,primes,toGP};
