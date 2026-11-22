"use strict";
/**
 * Original-input, secret-key-independent 812/3248-period test for two
 * literal GP29 symbolwise cipher readings of the signed p15 matrix.
 *
 * The previously certified p15 Fibonacci-prime signed matrix has order
 * 812 over GF(29). Sampling one M^t state per rune gives a key/state
 * period dividing 812; emitting four coordinates per state gives a
 * serialized period dividing 4*812=3248. At those lags, ANY secret
 * time-stationary bijection of GP symbols (including any secret affine
 * alphabet and any per-state substitution) preserves exact plaintext
 * equality. The test is conditional on a GP-native plaintext register,
 * a word/section-preserving symbolwise mapping and the declared clocks.
 *
 * Node.js 22, CommonJS, one-file read-only SFT.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = name => fs.readFileSync(path.join(__dirname, "..", name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const mod = x => (x % 29 + 29) % 29;
const M = [[10,3,20,22], [1,22,21,25], [11,17,19,7], [8,12,12,22]];
const ID = Array.from({length:4}, (_,r) =>
  Array.from({length:4}, (_,c) => Number(r === c)));

/** @param {number[][]} a @param {number[][]} b @returns {number[][]} */
function mul(a, b) {
  return a.map(row => Array.from({length:4}, (_,j) =>
    mod(row.reduce((sum, x, k) => sum + x*b[k][j], 0))));
}

/** @param {number[]} a @returns {number} */
function lagEqual(a, lag) {
  let n=0;
  for (let i=0; i+lag<a.length; i++) if (a[i] === a[i+lag]) n++;
  return n;
}

/** @param {number[][]} sections @returns {number} */
function sectionEqual(sections, lag) {
  return sections.reduce((sum, s) => sum + lagEqual(s, lag), 0);
}

/** @param {string} value @returns {number[]} */
function gpEncode(value) {
  const glyphs = corpus.translit.map((name,index) => ({name,index}))
    .sort((a,b) => b.name.length-a.name.length);
  const words = value.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g) || [];
  const out=[];
  for (const word of words) for (let j=0; j<word.length;) {
    const g = glyphs.find(item => word.startsWith(item.name, j));
    assert.ok(g, "Native GP input has an unmappable character");
    out.push(g.index);
    j += g.name.length;
  }
  return out;
}

/**
 * @param {number[]} seq
 * @param {number[]} sizes
 * @returns {number[][]}
 */
function split(seq, sizes) {
  let at=0;
  const chunks=sizes.map(size => {
    const x=seq.slice(at,at+size); at+=size;
    assert.equal(x.length,size);
    return x;
  });
  assert.equal(at,seq.length);
  return chunks;
}

/** @param {number[]} key @param {number} n */
function hasFullPeriod(key,n) {
  assert.equal(key.length,n);
  for (let divisor=1;divisor<n;divisor++) {
    if (n%divisor) continue;
    assert(key.some((x,i) => x!==key[i%divisor]),
      "Projected state repeats before the claimed period");
  }
}

function main() {
  assert.deepEqual(corpus.pages[39].indices.slice(119,122),[27,5,15]);
  assert.equal(corpus.pages[15].indices.length,159);
  const phase812=[], phase3248=[];
  let state=ID;
  for (let t=0;t<812;t++) {
    phase812.push(state[0][0]);
    for (let row=0;row<4;row++) phase3248.push(state[row][0]);
    state=mul(M,state);
  }
  assert.deepEqual(state,ID,"Full signed matrix order does not divide 812");
  for (const q of [2,7,29]) {
    let p=ID;
    for (let t=0;t<812/q;t++) p=mul(M,p);
    assert.notDeepEqual(p,ID,"Full matrix order should be exactly 812");
  }
  hasFullPeriod(phase812,812);
  hasFullPeriod(phase3248,3248);

  const pages=[[0,2],[3,7],[8,14],[15,22],[23,26],
               [27,32],[33,39],[40,53],[54,55]];
  const sections=pages.map(([a,b]) =>
    corpus.pages.slice(a,b+1).flatMap(page => page.indices));
  const sizes=sections.map(section => section.length);
  assert.deepEqual(sizes,[729,1145,1729,1903,1021,1433,1680,3008,308]);
  const N=sizes.reduce((a,b)=>a+b,0);
  assert.equal(N,12956);
  const period812=812, period3248=3248;
  const totalPairs812=sizes.reduce((sum,n)=>sum+Math.max(0,n-period812),0);
  const original812=sectionEqual(sections,period812);
  assert.equal(totalPairs812,6235);
  assert.equal(original812,206);

  const tail=corpus.pages.slice(15,56).flatMap(p=>p.indices).slice(9);
  assert.equal(tail.length,9344);
  const original3248=lagEqual(tail,period3248);
  const totalPairs3248=tail.length-period3248;
  assert.equal(totalPairs3248,6096);
  assert.equal(original3248,219);

  const sources=[
    ["Gibran","resources/control/gibran_prophet_58585.txt"],
    ["Shakespeare","resources/control/shakespeare_first300k.txt"],
    ["Emerson","resources/control/emerson_essays_2944.txt"]
  ];
  const controls=[];
  let gibran=null;
  for (const [name,file] of sources) {
    const native=gpEncode(read(file));
    assert(native.length>=N);
    if (!gibran) gibran=native;
    const scores812=[], scores3248=[];
    for (let offset=0;offset+N<=native.length;offset+=Math.floor(N/2)) {
      const x=native.slice(offset,offset+N);
      scores812.push(sectionEqual(split(x,sizes),period812));
    }
    for (let offset=0;offset+tail.length<=native.length;offset+=Math.floor(tail.length/2))
      scores3248.push(lagEqual(native.slice(offset,offset+tail.length),period3248));
    const row={name,nativeRunes:native.length,
      n812:scores812.length,min812:Math.min(...scores812),max812:Math.max(...scores812),
      n3248:scores3248.length,min3248:Math.min(...scores3248),max3248:Math.max(...scores3248)};
    controls.push(row);
    assert(row.min812>original812,"An original native register equals the source 812-score");
    assert(row.min3248>original3248,"An original native register equals the source 3248-score");
  }
  assert.deepEqual(controls.map(x=>[x.n812,x.min812,x.n3248,x.min3248]),
    [[8,340,12,347],[32,345,45,312],[49,339,68,340]]);

  // Plant secret 812-phase source-matrix affine permutations, restarting at
  // all nine original visual section boundaries. The key is NEVER used in
  // the original-cipher comparison and is recovered in these native plants.
  const native812=split(gibran.slice(0,N),sizes);
  const planted812=native812.map(section => section.map((x,i) =>
    mod(7*x+phase812[i%period812])));
  const decoded812=planted812.map(section => section.map((x,i) =>
    mod(25*(x-phase812[i%period812]))));
  assert.deepEqual(decoded812,native812);
  assert.equal(sectionEqual(planted812,period812),
    sectionEqual(native812,period812));

  // Independent source-M 4-vector serialization, one block per power,
  // no reset after physical p15:9 through p55. Its complete repeat
  // period is exactly 3248 GP symbols, not the highlighted scalar's 28.
  const native3248=gibran.slice(0,tail.length);
  const planted3248=native3248.map((x,i) =>
    mod(7*x+phase3248[i%period3248]));
  const decoded3248=planted3248.map((x,i) =>
    mod(25*(x-phase3248[i%period3248])));
  assert.deepEqual(decoded3248,native3248);
  assert.equal(lagEqual(planted3248,period3248),
    lagEqual(native3248,period3248));

  const result={
    classification:"conditional all-secret GP29 symbolwise exclusion; no plaintext recovered",
    sourceMatrixOrder:812,sourceScalarPeriod:812,serializedFourVectorPeriod:3248,
    chapterLag812:{originalMatches:original812,pairs:totalPairs812,
      originalRate:original812/totalPairs812},
    continuousP15ToP55Lag3248:{originalMatches:original3248,pairs:totalPairs3248,
      originalRate:original3248/totalPairs3248},
    controls,
    originalAgainstNative:{all812:controls.every(x=>x.min812>original812),
      all3248:controls.every(x=>x.min3248>original3248)},
    positiveNativeReencryption:{period812Runes:N,period3248Runes:tail.length}
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if (require.main === module) main();
module.exports={main,lagEqual,gpEncode};
