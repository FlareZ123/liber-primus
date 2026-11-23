"use strict";

/**
 * A genuinely different direct cipher family from C_i = a*C_(i-1) + h(P_i):
 *
 *   C_i = a*P_i + b*P_(i-1) + c (mod 29), i>=1.
 *
 * The plaintext, rather than the ciphertext, has feedback. The first
 * plaintext rune of every original physical page is unrestricted; a!=0.
 * Each page independently chooses a,b,c and an initial plaintext rune.
 *
 * Score exact best-case native-GP index of coincidence over ALL secret keys,
 * with no English fitting, guessed crib or selected chapter. If this very
 * generous maximum is unlike ordinary native GP English, direct inversion
 * cannot be the intended one-layer native-English cipher under this model.
 *
 * Windows 11, Node.js 22: node sims/lp2_plaintext_fir_allsecret_page_sft.cjs
 * Read-only, deterministic, original-source, no external packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root,relative),"utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const original = gp.pages.filter(p => p.page < 56 && p.indices.length);
assert.equal(original.length,55);
assert.equal(original.reduce((n,p) => n + p.indices.length,0),12956);
const mod = x => (x % 29 + 29) % 29;

/** @param {readonly number[]} seq */
function collisionNumerator(seq) {
  const histogram = new Uint16Array(29);
  for (const symbol of seq) histogram[symbol]++;
  let count = 0;
  for (const n of histogram) count += n * (n - 1);
  return count;
}

/**
 * C_i = Q_i + lambda*Q_(i-1) + c, with Q_i=a*P_i.
 * For lambda != -1, the constant c can be removed by translating the
 * entire Q sequence by c/(1+lambda), which preserves equality/IoC.
 * Therefore a and c require NO enumeration when lambda != 28.
 *
 * lambda=28 is special: Q_i=Q_(i-1)+C_i-c. The intercept c
 * becomes a progressive ramp and MUST be separately enumerated.
 *
 * Enumerate every lambda, and all possible free page initials,
 * or every intercept for the special lambda=28. Return the
 * largest collision numerator among every admissible page key.
 *
 * @param {readonly number[]} cipher
 */
function bestPage(cipher) {
  let best={numerator:-1,ratio:-1,seed:0,intercept:0};
  for(let ratio=0;ratio<29;ratio++) {
    const firstSeeds=ratio===28?1:29;
    const intercepts=ratio===28?29:1;
    for(let intercept=0;intercept<intercepts;intercept++) {
      for(let seed=0;seed<firstSeeds;seed++) {
        let state=seed;
        const hist=new Uint16Array(29);
        hist[state]++;
        for(let i=1;i<cipher.length;i++) {
          state=mod(cipher[i]-intercept-ratio*state);
          hist[state]++;
        }
        let numerator=0;
        for(const count of hist) numerator+=count*(count-1);
        if(numerator>best.numerator) {
          best={numerator,ratio,seed,intercept};
        }
      }
    }
  }
  return best;
}

/** @param {readonly number[][]} book */
function ioc(book) {
  let numerator=0,denominator=0;
  for(const page of book) {
    numerator+=collisionNumerator(page);
    denominator+=page.length*(page.length-1);
  }
  return numerator/denominator;
}

/** @param {readonly number[]} source */
function overlay(source) {
  let offset=0;
  const pages=original.map(p=>{
    const sequence=source.slice(offset,offset+p.indices.length);
    offset+=p.indices.length;
    return sequence;
  });
  assert.equal(offset,12956);
  return pages;
}

const originalPlain=original.map(p=>p.indices);
const unkeyedOriginalIoC=ioc(originalPlain);
assert.ok(Math.abs(unkeyedOriginalIoC-0.034039152716604265)<1e-14);

const sourceOptimals=originalPlain.map(bestPage);
let bestNumerator=0,denominator=0;
for(let j=0;j<originalPlain.length;j++){
  bestNumerator+=sourceOptimals[j].numerator;
  const n=originalPlain[j].length;
  denominator+=n*(n-1);
}
const bestPossibleOriginalIoC=bestNumerator/denominator;
assert.ok(Math.abs(bestPossibleOriginalIoC-0.03866999817417381)<1e-14,
  "Reproduce full 55-page all-secret upper bound");

const controls=[
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"]
].map(([name,relative])=>{
  const plain=overlay(encodeSourceNativeGP(read(relative)).slice(0,12956));
  return {name,plain,ioc:ioc(plain)};
});
assert.equal(controls.length,3);
assert(controls.every(c=>c.ioc>0.06),
  "Three author-independent native GP English controls exceed all-original-key bound");

// A true source-English positive. Use every page's original length and
// independent a,b,c, including the otherwise singular lambda=28 branch.
// All 12,956 genuine source-native English GP symbols are recovered by
// the correct inverse and re-encode the planted cipher byte-for-byte.
const seedText=controls[0].plain;
const planted=[];
for(let j=0;j<seedText.length;j++){
  const plain=seedText[j];
  const ratio=j===0?28:(j*11+5)%29;
  const a=1+(j*7+3)%28;
  const b=mod(a*ratio);
  const c=mod(j*13+17);
  const cipher=new Array(plain.length);
  cipher[0]=mod(j*5+3); // page-initial ciphertext is unrestricted in this family
  for(let i=1;i<plain.length;i++){
    cipher[i]=mod(a*plain[i]+b*plain[i-1]+c);
  }
  const recovered=new Array(plain.length);
  recovered[0]=plain[0];
  const invA=Array.from({length:29},(_,k)=>k).find(k=>mod(a*k)===1);
  assert.notEqual(invA,undefined);
  for(let i=1;i<cipher.length;i++){
    recovered[i]=mod(invA*mod(cipher[i]-b*recovered[i-1]-c));
  }
  assert.deepEqual(recovered,plain,"Source-native GP planted reversible FIR model");
  planted.push(cipher);
}
const plantedMinimum=ioc(seedText);
const plantedMaximum=planted.reduce((s,page)=>s+bestPage(page).numerator,0)/denominator;
assert(plantedMaximum+1e-13>=plantedMinimum,
  "All-key inference must admit every authentic planted key");

// A source-pure mathematical gate, not recovery from unknown original pages.
console.log(JSON.stringify({
  status:"no authentic LP2 plaintext/key recovered",
  operation:"C_i=a*P_i+b*P_(i-1)+c mod29; each page free first P and independent secret a,b,c; a nonzero",
  sourcePages:original.length,sourceRunes:12956,
  exhaustiveParameterReduction:"29 b/a ratios times 29 allowed initial/constant choices per page",
  originalUnkeyedPageIoC:unkeyedOriginalIoC,
  originalAllSecretMaxPageIoC:bestPossibleOriginalIoC,
  nativeGpControls:controls.map(({name,ioc})=>({name,ioc})),
  positivePlant:{runes:12956,sourceIoC:plantedMinimum,allSecretUpper:plantedMaximum,
    exactFullPlaintextRecovery:true},
  sourceMaximumKeyRatios:sourceOptimals.map(x=>x.ratio)
},null,2));
