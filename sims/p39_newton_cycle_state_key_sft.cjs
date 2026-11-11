"use strict";
/**
 * Source-anchored p39 Newton-cycle state as a direct GP29 additive key.
 * The original 256-byte base-60 table defines P over GF(29). The p39 red
 * triple [27,5,15] is [P(15),P'(15),15]; T(x)=x-P(x)/P'(x) cycles
 * 15 -> 27 -> 21 -> 15. Test only the state-value additive key, continuous
 * and anchored at p39's third red rune (global zero-based offset 9521).
 * Run: node sims/p39_newton_cycle_state_key_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const load = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const mod = n => ((n % 29) + 29) % 29;
const modN = (n, m) => ((n % m) + m) % m;
function jet(a, x) {
  let value = 0, derivative = 0;
  for (const c of a) {
    derivative = mod(derivative * x + value);
    value = mod(value * x + c);
  }
  return { value, derivative };
}
function inverse(a) {
  assert.notEqual(mod(a), 0);
  for (let k = 1; k < 29; k++) if (mod(a * k) === 1) return k;
  throw new Error("nonzero GF(29) element had no inverse");
}
function orbit(a, start) {
  const states = [], seen = new Set();
  let x = start;
  while (!seen.has(x)) {
    seen.add(x); states.push(x);
    const j = jet(a, x);
    if (j.derivative === 0) return { states, exit: "critical-point", endpoint: x };
    x = mod(x - j.value * inverse(j.derivative));
  }
  return { states, exit: "cycle", endpoint: x };
}
function gpEncode(text, translit) {
  const map = new Map(translit.map((s, i) => [s, i])), out = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < word.length;) {
      const two = word.slice(i, i + 2);
      if (map.has(two)) { out.push(map.get(two)); i += 2; }
      else { if (map.has(word[i])) out.push(map.get(word[i])); i++; }
    }
  }
  return out;
}
function shift(a, key, sign) { return a.map((v, i) => mod(v + sign * key[i])); }
function score(a, lm) {
  let s = 0;
  for (let i = 2; i < a.length; i++) s += lm[a[i - 2] * 841 + a[i - 1] * 29 + a[i]];
  return s / (a.length - 2);
}
function ioc(a) {
  const c = Array(29).fill(0);
  for (const x of a) c[x]++;
  return c.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
}
function main() {
  const grid = load("resources/liber-primus/base60-grid.json");
  const corpus = load("resources/liber-primus/lp2-corpus.json");
  const ink = load("resources/liber-primus/lp2-ink-annotations.json");
  const english = fs.readFileSync(path.join(root, "resources/control/shakespeare_first300k.txt"), "utf8");
  const bytes = grid.byte_rows.flat();
  assert.equal(bytes.length, 256);
  const sourceSha = crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex");
  assert.equal(sourceSha, "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
  const triads = ink.pages.flatMap(p => (p.red_spans || []).filter(s => s.length === 3)
    .map(s => ({ page: p.page, start: s.start, indices: [...s.runes].map(r => corpus.runes.indexOf(r)) })));
  assert.deepEqual(triads, [
    { page: 3, start: 119, indices: [13, 23, 2] },
    { page: 39, start: 119, indices: [27, 5, 15] }
  ]);
  assert.deepEqual([jet(bytes, 15).value, jet(bytes, 15).derivative, 15], [27, 5, 15]);
  const sameJet = Array.from({length:29},(_,x)=>x).filter(x=>jet(bytes,x).value===27&&jet(bytes,x).derivative===5);
  assert.deepEqual(sameJet,[14,15]);
  const selected = orbit(bytes,15), wrong = orbit(bytes,14);
  assert.deepEqual(selected,{states:[15,27,21],exit:"cycle",endpoint:15});
  assert.deepEqual(wrong,{states:[14,26,18,22,10,28],exit:"cycle",endpoint:14});
  const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length).map(p=>p.indices);
  const original=pages.flat();
  assert.equal(pages.length,55); assert.equal(original.length,12956);
  const p39Start=pages.slice(0,39).reduce((s,p)=>s+p.length,0);
  const anchor=p39Start+triads[1].start+2;
  assert.equal(p39Start,9400); assert.equal(anchor,9521);
  const key=original.map((_,i)=>selected.states[modN(i-anchor,3)]);
  const wrongKey=original.map((_,i)=>wrong.states[modN(i-anchor,6)]);
  const minus=shift(original,key,-1), plus=shift(original,key,1);
  assert.deepEqual(shift(minus,key,1),original);
  assert.deepEqual(shift(plus,key,-1),original);
  const gp=gpEncode(english,corpus.translit);
  assert(gp.length>162956);
  const tri=new Uint32Array(29**3),bi=new Uint32Array(29**2);
  for(let i=2;i<100000;i++){tri[gp[i-2]*841+gp[i-1]*29+gp[i]]++;bi[gp[i-2]*29+gp[i-1]]++;}
  const lm=Float64Array.from({length:29**3},(_,i)=>Math.log((tri[i]+0.25)/(bi[Math.floor(i/29)]+7.25)));
  const reference=gp.slice(150000,150000+original.length);
  assert.equal(reference.length,original.length);
  const rawScore=score(original,lm),minusScore=score(minus,lm),plusScore=score(plus,lm);
  const wrongScore=score(shift(original,wrongKey,-1),lm),referenceScore=score(reference,lm);
  assert(Math.abs(rawScore-(-4.147504344592278))<1e-9);
  assert(Math.abs(minusScore-(-4.16868518930541))<1e-9);
  assert(Math.abs(plusScore-(-4.1623662026173065))<1e-9);
  assert(Math.abs(referenceScore-(-2.4594998104466215))<1e-9);
  assert(minusScore<rawScore&&plusScore<rawScore);
  const planted=shift(reference,key,1),recovered=shift(planted,key,-1);
  assert.deepEqual(recovered,reference);
  console.log(JSON.stringify({
    classification:"Bounded negative for direct period-three Newton-state additive GP29 key; no unknown plaintext or authentic key",
    source:{base60TableSha256:sourceSha,redTriads:triads,p39GlobalSeedOffset:anchor,p39Jet:[27,5,15],sameJetInputs:sameJet,selectedNewtonOrbit:selected,wrongSeed14Orbit:wrong},
    original:{runes:original.length,rawScore,rawIoC:ioc(original),subtract:{score:minusScore,ioc:ioc(minus)},add:{score:plusScore,ioc:ioc(plus)},wrongSeed14Subtract:{score:wrongScore,ioc:ioc(shift(original,wrongKey,-1))},keyCounts:selected.states.map(s=>[s,key.filter(k=>k===s).length]),exactOriginalRoundTrips:true},
    heldOutNativeGP:{runes:reference.length,score:referenceScore,ioc:ioc(reference),plantedCipherRecoversExactly:true},
    recoveredUnknownPlaintext:false
  },null,2));
}
if(require.main===module)main();
