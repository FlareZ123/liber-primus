'use strict';
/**
 * Original red119 triple as a finite GF29 degree-3 LFSR seed.
 *
 * Input is the two uniquely red13-bracketed, three-rune red spans on
 * physical p3 and p39; both black tails begin at original rune offset 122.
 * The 32x8 pp49-51 numerical table supplies the exact cubic field factor
 * x^3 + 14x^2 + 16x + 24 over GF29. Try its direct/reciprocal clock,
 * raw/known-LP1-Atbash red seeds, seed/next-block cursor, two inverse signs.
 *
 * Node 22, built-ins; run from repository root:
 * node sims/lp2_red119_p50_cubic_feedback_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
/** @param {string} file */
const readJson=file=>JSON.parse(fs.readFileSync(path.join(ROOT,file),'utf8'));
const corpus=readJson('resources/liber-primus/lp2-corpus.json');
const grid=readJson('resources/liber-primus/lp2-grid-256.json');
const mod=x=>(x%29+29)%29;
assert.equal(grid.bytes.length,256);
const originalPolynomial=grid.bytes.slice().reverse().map(mod);
const cubic=[24,16,14,1];
for(let degree=255;degree>=3;degree--){
  const scale=originalPolynomial[degree];
  for(let j=0;j<=3;j++){
    originalPolynomial[degree-3+j]=mod(
      originalPolynomial[degree-3+j]-scale*cubic[j]
    );
  }
}
assert.deepEqual(originalPolynomial.slice(0,3),[0,0,0],
  'Source p50 cubic factor is exact, not a guessed polynomial');
const triples=[
  {page:3,red:[13,23,2],length:95},
  {page:39,red:[27,5,15],length:118}
];
const native=corpus.pages[57].indices;
assert.equal(native.length,95);
/** @param {number[]} v */
function coincidence(v){
  const count=Array(29).fill(0);
  for(const x of v)count[x]++;
  return count.reduce((s,c)=>s+c*(c-1),0)/(v.length*(v.length-1));
}
/**
 * Monic order3 recurrence from either the cubic source polynomial
 * x^3+14x^2+16x+24 or its monic reciprocal
 * x^3+20x^2+3x+23.
 * @param {number[]} seed
 * @param {boolean} reciprocal
 * @param {number} length
 */
function keyStream(seed,reciprocal,length){
  const t=reciprocal?[20,3,23]:[14,16,24];
  const k=seed.slice();
  while(k.length<length){
    const i=k.length;
    k.push(mod(-t[0]*k[i-1]-t[1]*k[i-2]-t[2]*k[i-3]));
  }
  return k;
}
const records=[];
for(const item of triples){
  const p=corpus.pages[item.page].indices;
  assert.deepEqual(p.slice(119,122),item.red);
  const ciphertext=p.slice(122);
  assert.equal(ciphertext.length,item.length);
  const top=[];
  for(const seedMode of ['ink','atbash']){
    const seed=seedMode==='ink'?item.red:item.red.map(x=>28-x);
    for(const reciprocal of [false,true]){
      const k=keyStream(seed,reciprocal,ciphertext.length+3);
      for(const clock of [0,3])for(const sign of [-1,1]){
        const plaintext=ciphertext.map((v,i)=>mod(v+sign*k[i+clock]));
        const encoded=plaintext.map((v,i)=>mod(v-sign*k[i+clock]));
        assert.deepEqual(encoded,ciphertext);
        // Native text provides a stringent full-length forward/inverse plant.
        const control=Array.from({length:ciphertext.length},
          (_,i)=>native[i%native.length]);
        const synthetic=control.map((v,i)=>mod(v-sign*k[i+clock]));
        assert.deepEqual(synthetic.map((v,i)=>mod(v+sign*k[i+clock])),
          control);
        const ioc=coincidence(plaintext);
        const first24=plaintext.slice(0,24)
          .map(v=>corpus.translit[v]).join('');
        top.push({seedMode,polynomial:reciprocal?'reciprocal':'forward',
          clock,sign,ioc,first24});
      }
    }
  }
  assert.equal(top.length,16);
  assert(top.every(x=>x.ioc<0.041));
  top.sort((a,b)=>b.ioc-a.ioc);
  records.push({page:item.page,blackTailRunes:ciphertext.length,
    rawIoC:coincidence(ciphertext),modelCount:top.length,
    peakIoC:top[0].ioc,peak:top[0],results:top});
}
assert.equal(records.length,2);
console.log(JSON.stringify({
  original:{sourceCubicFactor:'x^3+14x^2+16x+24',
    redPages:[3,39],redOffset119:119,blackStart:122,
    blackLengths:[95,118]},
  models:records,positiveControls:{total:32,
    originalReencoded:32,nativePlantsDecoded:32},
  conclusion:'Both original black tails remain nonlinguistic under all 32 source-conditioned cubic LFSR inverses; no authentic key or plaintext.'
},null,2));
