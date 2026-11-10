"use strict";
/**
 * Original LP2 marked-triad / printed-grid GF(29²) root gate.
 *
 * p3 and p39 each carry the only red three-rune spans, both at local
 * offset119. p3 defines u²=3u+8. The p3 middle rune and p39 first rune
 * select z=23+27u; evaluate the unmodified 256 source bytes as a polynomial
 * at that original-source field element. Neither a cipher nor a key is
 * inferred from the exact algebraic identity.
 *
 * Usage: node sims/lp2_red_triad_extension_root_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const load = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const mod = n => ((n % 29) + 29) % 29;

/**
 * GF(29²), polynomial basis {1,u} with u²=3u+8.
 * @param {[number,number]} a
 * @param {[number,number]} b
 * @returns {[number,number]}
 */
function mul2(a,b) {
  return [mod(a[0]*b[0]+8*a[1]*b[1]),
    mod(a[0]*b[1]+a[1]*b[0]+3*a[1]*b[1])];
}

/**
 * Descending polynomial coefficients, value in GF(29²).
 * @param {number[]} coeffs
 * @param {[number,number]} z
 * @returns {[number,number]}
 */
function eval2(coeffs,z) {
  let v = [0,0];
  for (const c of coeffs) {
    v = mul2(v,z);
    v[0] = mod(v[0]+c);
  }
  return v;
}

/**
 * Divide a GF29 polynomial in descending source width by a monic factor.
 * @param {number[]} source
 * @param {number[]} factor
 */
function divideMonic(source,factor) {
  const r = source.slice();
  const q = Array(source.length-factor.length+1).fill(0);
  for(let i=0;i<q.length;i++) {
    const c = r[i];
    q[i] = c;
    for(let j=0;j<factor.length;j++) r[i+j] = mod(r[i+j]-c*factor[j]);
  }
  return {quotient:q,remainder:r.slice(q.length)};
}

/** @param {number[]} a Descending coefficients @param {number[]} b */
function product(a,b) {
  const out = Array(a.length+b.length-1).fill(0);
  for(let i=0;i<a.length;i++)
    for(let j=0;j<b.length;j++)
      out[i+j]=mod(out[i+j]+a[i]*b[j]);
  return out;
}

/** @param {number[]} a @param {[number,number]} x */
function derivativeAt(a,x) {
  const d = a.slice(0,-1).map((v,i) => mod(v*(a.length-1-i)));
  return eval2(d,x);
}

function main() {
  const grid=load("resources/liber-primus/base60-grid.json");
  const corpus=load("resources/liber-primus/lp2-corpus.json");
  const ink=load("resources/liber-primus/lp2-ink-annotations.json");
  const triads=ink.pages.flatMap(p => (p.red_spans||[])
    .filter(span => span.length===3)
    .map(span=>({page:p.page,start:span.start,
      indices:[...span.runes].map(ch=>corpus.runes.indexOf(ch))})));
  assert.deepEqual(triads.map(t=>[t.page,t.start,t.indices]),
    [[3,119,[13,23,2]],[39,119,[27,5,15]]]);
  for(const t of triads) {
    const p=corpus.pages.find(x=>x.page===t.page);
    assert.deepEqual(p.indices.slice(t.start,t.start+3),t.indices);
  }
  const [a,b]=triads.map(t=>t.indices);

  // The two red triples appear in source JPEGs 20.jpg and 56.jpg.
  // A retrospective, file-label-independent two-hop numerical coincidence:
  // 20 + (first two p3 GP indices 13+23) = 56; 56 + (p39
  // last index15) = 71.jpg, the illuminated-Ac physical p54.
  const p3PrimeSum=a.reduce((sum,i)=>sum+corpus.prime[i],0);
  const p39PrimeSum=b.reduce((sum,i)=>sum+corpus.prime[i],0);
  assert.deepEqual([p3PrimeSum,p39PrimeSum],[137,173]);
  // GP prime-weight totals differ by the SAME 36-image gap.
  assert.equal(p39PrimeSum-p3PrimeSum,56-20);
  assert.equal(a[0]+a[1],p39PrimeSum-p3PrimeSum);
  assert.equal(20+a[0]+a[1],56);
  assert.equal(56+b[2],71);
  assert.equal(triads[0].page+a[0]+a[1],triads[1].page);
  assert.equal(triads[1].page+b[2],54);
  assert.equal(corpus.pages.find(p=>p.page===54).indices[0],24);
  // Doubling first p39 rune by last p3 rune gives physical page54.
  // This last equality depends on editorial zero-based physical indexing.
  assert.equal(a[2]*b[0],54);
  assert.equal(mod(a[1]*a[1]-4*a[0]*a[2]),19);

  // Both authentic marked triples occur at the 120th rune, counting
  // the first rune as 1, and have length three. Under p3's primitive
  // field generator u, the directly derived exponent is 3*120=360.
  /** @param {[number,number]} x @param {number} exponent */
  const pow2=(x,exponent)=>{
    let out=[1,0],base=x,e=exponent;
    while(e>0) {
      if(e%2===1)out=mul2(out,base);
      e=Math.floor(e/2);
      if(e>0)base=mul2(base,base);
    }
    return out;
  };
  const oneBasedMarkedOffset=triads[0].start+1;
  const markedSpanLength=a.length;
  assert.equal(triads[1].start+1,oneBasedMarkedOffset);
  assert.equal(b.length,markedSpanLength);
  assert.equal(oneBasedMarkedOffset,120);
  assert.equal(markedSpanLength,3);
  assert.deepEqual(pow2([0,1],oneBasedMarkedOffset),[7,0]);
  const markPositionLengthRoot=pow2([0,1],oneBasedMarkedOffset*markedSpanLength);
  assert.deepEqual(markPositionLengthRoot,[24,0]);
  assert.equal(markPositionLengthRoot[0],corpus.pages.find(p=>p.page===54).indices[0]);
  assert.equal(mod(7*7*7),24);

  assert.deepEqual([mod(a[2]*3+a[1]),mod(a[2]*8+a[0])],[0,0]);

  const alphabet="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
  assert.equal(grid.alphabet,alphabet);
  const bytes=grid.byte_rows.flat();
  assert.equal(bytes.length,256);
  assert.deepEqual(grid.rows.flat().map(s=>
    alphabet.indexOf(s[0])*60+alphabet.indexOf(s[1])),bytes);
  assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
    "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
  const P=bytes.map(mod);
  assert.equal(P[0],0); // First byte 203 = 7 * 29.
  assert.equal(P[1],28); // Actual source polynomial degree 254.

  const z=[a[1],b[0]];
  assert.deepEqual(z,[23,27]);
  assert.deepEqual(eval2(P,z),[0,0]);
  assert.notDeepEqual(derivativeAt(P,z),[0,0]); // Simple extension root.
  const wrongP=P.slice();
  wrongP[255]=mod(wrongP[255]+1);
  assert.deepEqual(eval2(wrongP,z),[1,0]);

  // Source-indexed alternative coordinate readings: three-by-three in both
  // orders, with no post-hoc language/key tuning. Exactly one is an F29² root.
  const crossHits=[];
  for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++) {
    const ab=[a[i],b[j]],ba=[b[j],a[i]];
    if(eval2(P,ab).every(v=>v===0))crossHits.push({order:"p3-p39",i,j,coordinates:ab});
    if(eval2(P,ba).every(v=>v===0))crossHits.push({order:"p39-p3",i,j,coordinates:ba});
  }
  assert.deepEqual(crossHits,[{order:"p3-p39",i:1,j:0,coordinates:[23,27]}]);

  // The p3 field generator u has exact order 840. Enumerate the entire
  // multiplicative field to obtain every original P-root in GF(29²).
  const roots=[];
  let state=[1,0];
  const seen=new Set();
  for(let e=0;e<840;e++) {
    assert(!seen.has(state.join(",")));
    seen.add(state.join(","));
    if(eval2(P,state).every(v=>v===0))roots.push({exponent:e,coordinates:state});
    state=mul2(state,[0,1]);
  }
  assert.deepEqual(state,[1,0]);
  assert.equal(seen.size,840);
  assert.deepEqual(roots,[
    {exponent:360,coordinates:[24,0]},
    {exponent:433,coordinates:[23,27]},
    {exponent:797,coordinates:[17,2]}
  ]);
  assert.equal(433%28,a[0]); // Descriptive source-index congruence.
  assert.equal(433%29,b[0]); // Descriptive source-index congruence.

  // The two extension roots are Frobenius conjugates. Their trace and norm
  // both equal 11, so X²+18X+11 is a second exact grid polynomial factor.
  const h=[1,18,11];
  const extFactor=divideMonic(P,h);
  assert.deepEqual(extFactor.remainder,[0,0]);
  const markFactor=[1,10,25]; // (X-24)^2 over F29.
  assert.deepEqual(divideMonic(P,markFactor).remainder,[0,0]);
  const quartic=product(markFactor,h);
  assert.deepEqual(quartic,[1,28,13,9,14]);
  const both=divideMonic(P,quartic);
  assert.deepEqual(both.remainder,[0,0,0,0]);
  assert.equal(both.quotient.length,252);
  assert.equal(both.quotient[0],0);
  assert.notEqual(both.quotient[1],0);

  console.log(JSON.stringify({
    classification:"Exact cross-artifact algebra; potential source state, no LP2 key/plaintext",
    originalGridSha256:"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290",
    redTriads:triads,markedPrimeSums:[137,173],
    independentSourceGapIdentities:["173−137=36=56−20","13+23=36=56−20"],
    sourceJpegHop:"20.jpg + 13 + 23 = 56.jpg; 56.jpg + 15 = 71.jpg",
    editorialIndexOnlyEcho:"p3 trailing 2 * p39 opening 27 = p54",
    extensionRelation:"u²=3u+8",
    redLengthPositionExponent:"3 × (119+1) = 360; u^120 = 7; u^360 = 24 = oversized p54 Ac and p39 root",
    crossSourcePoint:"p3 middle + p39 first * u = 23+27u",
    crossSourceCandidates:18,exactCrossSourceRootHits:crossHits,
    allNonzeroFieldRoots:roots,
    sourceIndexCRT:"433 mod28 = 13 (p3 first); 433 mod29 = 27 (p39 first); noted post hoc",
    extensionQuadraticFactor:"X²+18X+11",
    combinedQuarticFactor:"X^4+28X^3+13X²+9X+14",
    twiceFactoredFixedWidthQuotient:both.quotient.length,
    canonicalTwiceFactoredCoefficients:both.quotient.length-1,
    positiveControl:"exact monic quartic division and finite-field root",
    negativeControl:"perturbed final source byte does not vanish"
  },null,2));
}
if(require.main===module)main();
