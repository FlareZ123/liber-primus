"use strict";

/**
 * Source-selected Euclidean / continued-fraction transport of the original
 * 2048-bit 32x8 grid integer N and page53 red-rune base29 integer R.
 *
 * Exact necessary test: if a naturally obtained continued-fraction partial
 * quotient encodes one GP rune as q-1, every noninitial quotient must lie in
 * [1,29]. No language key or plaintext fitting is involved.
 *
 * Run: node sims/grid_red53_euclid_quotient_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} p */
function read(p) {return fs.readFileSync(path.join(ROOT, p), "utf8");}
const g=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const c=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const bytes=g.pages.flatMap(p=>p.bytes);
assert.equal(bytes.length,256);
const page=c.pages.find(p=>p.page===53);
assert.equal(page.indices.length,179);
const red=page.indices.slice(128);
assert.equal(red.length,51);
const as29=digits=>digits.reduce((n,d)=>29n*n+BigInt(d),0n);
const N=bytes.reduce((n,b)=>256n*n+BigInt(b),0n);
const R=as29(red);

/**
 * Euclidean partial quotients [floor(a/b), floor(b/(a%b)), ...].
 * @param {bigint} a
 * @param {bigint} b
 * @returns {{quotients:bigint[],gcd:bigint}}
 */
function euclid(a,b){
  const quotients=[];
  while(b!==0n){const q=a/b;quotients.push(q);[a,b]=[b,a%b];}
  return {quotients,gcd:a};
}

/**
 * Construct a coprime positive numerator/denominator with specified genuine
 * canonical simple continued-fraction quotients; used only for a plant.
 * @param {bigint[]} qs
 * @returns {[bigint,bigint]}
 */
function fromContinuedFraction(qs){
  assert(qs.length>1&&qs.at(-1)>=2n);
  let numerator=qs.at(-1),denominator=1n;
  for(let i=qs.length-2;i>=0;i--)
    [numerator,denominator]=[qs[i]*numerator+denominator,numerator];
  return [numerator,denominator];
}

/** @param {number[]} a */
function ioc(a){
  const hist=Array(29).fill(0);
  for(const x of a)hist[x]++;
  return hist.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}

function main(){
  const x=euclid(N,R);
  assert.equal(x.gcd,358n);
  assert.equal(x.quotients.length,144);
  assert.equal(x.quotients[0]>29n,true);
  // With the initial floor(N/R) known to be an enormous size alignment,
  // exactly the remaining 143 quotients would encode GP output symbols.
  const body=x.quotients.slice(1);
  const failures=body.flatMap((q,i)=>q>29n?[{offset:i+1,quotient:q.toString()}]:[]);
  assert.deepEqual(failures,[{offset:8,quotient:"193"},{offset:40,quotient:"30"},
    {offset:56,quotient:"33"},{offset:78,quotient:"47"},
    {offset:97,quotient:"37"},{offset:101,quotient:"253"}]);

  // Natural GP embedding q=gp+1 fails exactly at those six observed terms.
  // Mod29 would repair the alphabet but arbitrarily discard information:
  // count and IoC still supply a precise negative plaintext observation.
  const reduced=body.map(q=>Number((q-1n)%29n));
  // True positive: a 143-symbol native-GP source passage is explicitly
  // embedded as tail quotients+1, with first free scale quotient 2^60.
  // A terminal index1 guarantees the canonical final quotient >=2.
  const planted=Array.from({length:143},(_,i)=>(i*7+i*i*3)%29);
  planted[planted.length-1]=1;
  const cfr=[(1n<<60n),...planted.map(p=>BigInt(p+1))];
  const [pN,pR]=fromContinuedFraction(cfr);
  const known=euclid(358n*pN,358n*pR);
  assert.deepEqual(known.quotients,cfr);
  assert.equal(known.gcd,358n);
  assert.deepEqual(known.quotients.slice(1).map(q=>Number(q-1n)),planted);

  console.log(JSON.stringify({
    source:"canonical original 256 grid bytes and original p53 51 red GP29 runes",
    gridBits:N.toString(2).length,redBits:R.toString(2).length,
    euclidGcd:x.gcd.toString(),totalEuclidQuotients:x.quotients.length,
    quotientBodyCount:body.length,
    exactNaturalGpRangeFailCount:failures.length,failures,
    lossyModulo29CandidateIoc:ioc(reduced),
    lossyModulo29CandidatePrefix:reduced.slice(0,70).map(v=>c.translit[v]).join(""),
    constructedPositiveRecovered:planted.length,
    inference:"q=GPindex+1 direct Euclidean transport fails six exact source quotients; modulo29 loses information and gives no plaintext"
  },null,2));
}
if(require.main===module)main();
module.exports={euclid,fromContinuedFraction,main};
