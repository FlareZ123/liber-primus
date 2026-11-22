'use strict';

/**
 * Original p29/p50 GF29 double root24 as a radix60 vs radix59 separator.
 *
 * The original p39 three consecutive red GP29 indices [27,5,15] are
 * reversed to high-first G(X)=15X^2+5X+27=15(X-24)^2 mod29.
 * EXACT original p29 277 GP29 rune coefficients and the p50 256 source
 * 2-digit base60 token bytes are both divisible by G(X), whereas the
 * competing 59-character alphabet with unused f deleted is not.
 *
 * Source consequence: 24^7=1, smaller positive exponents do not; 277−256
 * =21=3×7, so both source streams share the same ragged 7-lane column
 * width. This is an exploratory 2014-human radix-selector hypothesis,
 * NOT a proof of author intent or a recovered ciphertext plaintext.
 *
 * The negative/sensitivity control makes an actual source-native GP29
 * 254-symbol payload and appends exactly two linearly determined checksum
 * runes to form a 256-symbol codeword divisible by G. One edited checksum
 * rune breaks the factor. The tool touches no tracked files.
 *
 * Windows Node.js 22 CommonJS, read-only.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid=JSON.parse(read('resources/liber-primus/base60-grid.json'));
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const sourceByte=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const red=ink.pages.find(p=>p.page===39).red_spans.find(r=>r.start===119);
assert(red);
assert.equal(red.runes,'ᛡᚳᛋ');
const redIndices=Array.from(red.runes,glyph=>gp.runes.indexOf(glyph));
assert.deepEqual(redIndices,[27,5,15]);
const G=redIndices.slice().reverse();
assert.deepEqual(G,[15,5,27]);
assert.equal(grid.alphabet.length,60);
const alphabet59=grid.alphabet.replace('f','');
assert.equal(alphabet59.length,59);
const tokens=grid.rows.flat();
assert.equal(tokens.length,256);
assert(tokens.every(s=>s.length===2));
assert(tokens.every(s=>!s.includes('f')));
const bytes60=tokens.map(s=>grid.alphabet.indexOf(s[0])*60+
  grid.alphabet.indexOf(s[1]));
const bytes59=tokens.map(s=>alphabet59.indexOf(s[0])*59+
  alphabet59.indexOf(s[1]));
assert.deepEqual(bytes60,sourceByte.bytes);
assert(bytes59.every(v=>v>=0&&v<=255));
const mod=x=>((x%29)+29)%29;
const inv=a=>{for(let x=1;x<29;x++)if(mod(a*x)===1)return x;throw Error('zero divisor')};

/**
 * High-degree-first exact GF29 division by a nonzero high coefficient.
 * @param {number[]} numerator
 * @param {number[]} denominator
 * @returns {{quotient:number[],remainder:number[]}}
 */
function divide(numerator,denominator){
  const current=numerator.map(mod),den=denominator.map(mod);
  assert(den[0]!==0);
  assert(current.length>=den.length);
  const quotient=Array(current.length-den.length+1).fill(0);
  const li=inv(den[0]);
  for(let i=0;i<quotient.length;i++){
    const factor=mod(current[i]*li);
    quotient[i]=factor;
    for(let j=0;j<den.length;j++){
      current[i+j]=mod(current[i+j]-factor*den[j]);
    }
  }
  return {quotient,remainder:current.slice(quotient.length)};
}
/** @param {number[]} coefficients @param {number} x @returns {number} */
const evalPoly=(coefficients,x)=>coefficients.reduce((a,c)=>mod(a*x+c),0);
/** @param {number[]} c @returns {number[]} */
const derivative=c=>c.slice(0,-1).map((v,i)=>mod(v*(c.length-1-i)));
/** @param {number[]} coeffs */
const signature=coeffs=>({
  rootValue:evalPoly(coeffs,24),
  derivativeAtRoot:evalPoly(derivative(coeffs),24),
  remainder:divide(coeffs,G).remainder
});
const p29=gp.pages[29].indices;
assert.equal(p29.length,277);
assert.equal(bytes60.length,256);
assert.equal(p29.length-bytes60.length,21);
assert.equal(21%7,0);
const roots=[];
let v=1;
for(let n=1;n<=7;n++){v=mod(v*24);roots.push(v)}
assert.deepEqual(roots,[24,25,20,16,7,23,1]);
assert.deepEqual(signature(p29),{rootValue:0,derivativeAtRoot:0,remainder:[0,0]});
assert.deepEqual(signature(bytes60),{rootValue:0,derivativeAtRoot:0,remainder:[0,0]});
assert.deepEqual(signature(bytes59),{rootValue:20,derivativeAtRoot:12,remainder:[12,22]});

// 2-symbol parity append needs no key guessing: exact GF29 linear equations
// from P(24)=P'(24)=0. An artificial native GP29 payload is 254 symbols,
// wholly independently selected before the checksum.
const native=gp.pages[57].indices;
assert.equal(native.length,95);
const payload=Array.from({length:254},(_,i)=>native[i%native.length]);
const prefixAt=evalPoly(payload,24);
const prefixDeriv=evalPoly(derivative(payload),24);
const x=24;
const bigPrefixAt=mod(x*x*prefixAt);
const bigPrefixDeriv=mod(2*x*prefixAt+x*x*prefixDeriv);
const u=mod(-bigPrefixDeriv);
const v2=mod(-bigPrefixAt-u*x);
const plant=[...payload,u,v2];
assert.equal(plant.length,256);
assert.deepEqual(signature(plant),{rootValue:0,derivativeAtRoot:0,remainder:[0,0]});
const mutated=plant.slice();
mutated[255]=mod(mutated[255]+1);
assert.notDeepEqual(signature(mutated).remainder,[0,0]);
const recoveredPayload=plant.slice(0,-2);
assert.deepEqual(recoveredPayload,payload);
const statuses=[
  {source:'original p29 native GP29 page',length:p29.length,...signature(p29)},
  {source:'original p50 base60 source numeral bytes',length:bytes60.length,...signature(bytes60)},
  {source:'same printed p50 cells as base59 with omitted f',length:bytes59.length,...signature(bytes59)}
];
console.log(JSON.stringify({
  status:'PASS',
  classification:'conditional original-source base60 vs base59 common double-root selector',
  visibleRedSource: red.runes,
  highFirstG:G,
  orderOf24Modulo29:7,
  powersOf24Modulo29:roots,
  lengths:[p29.length,bytes60.length],
  gap21IsThree7Cycles:true,
  source:statuses,
  nativeGP29Control:{
    dataRuneLength:payload.length,
    checksumSymbols:[u,v2],
    exactRecoveredSymbols:recoveredPayload.length,
    plantedFactorTrue:true,
    singleSymbolMutantFactorFalse:true
  },
  decision:'base60 retains p29/p39 double-root24 bridge, base59 destroys it; authorship of bridge remains a separate hypothesis and no plaintext is recovered.'
},null,2));
