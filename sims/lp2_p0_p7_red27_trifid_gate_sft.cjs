'use strict';

/**
 * Frozen source-led complementary red13+red14 as 27-cell Trifid-key test.
 *
 * Independent visible premise: physical LP2 p0 begins with a red 13-rune
 * title, p7 ends with a red 14-rune colophon, and the first three pages
 * total 729=27^2 original GP29 runes. A keyed Trifid is one direct,
 * reversible 27-cell conversion, with F and EA retained as literal
 * exceptions (declared before reading results). This is a HYPOTHESIS
 * without authenticated cross-page glue or a source-specified cube cipher.
 *
 * To run on Windows: Node.js 22 CommonJS, no npm dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.resolve(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const pages = corpus.pages;
const p0 = pages.find((p) => p.page === 0).indices;
const p1 = pages.find((p) => p.page === 1).indices;
const p2 = pages.find((p) => p.page === 2).indices;
const p7 = pages.find((p) => p.page === 7).indices;
assert.deepEqual([p0.length, p1.length, p2.length, p7.length], [262,266,201,208]);
assert.equal(p0.length + p1.length + p2.length, 729);
const red0 = p0.slice(0, 13);
const red7 = p7.slice(194, 208);
assert.deepEqual(red0, [15,8,18,3,6,19,27,0,15,26,18,21,5]);
assert.deepEqual(red7, [23,3,22,16,2,25,5,7,11,14,28,6,28,19]);
const combined = [...red0, ...red7];
assert.equal(combined.length, 27);
const CORE = Array.from({length:27}, (_, i) => i + 1);
const unique = [...new Set(combined.filter((n) => n !== 0 && n !== 28))];
const cube = [...unique, ...CORE.filter((n) => !unique.includes(n))];
assert.equal(cube.length, 27);
assert.deepEqual([...cube].sort((a, b) => a - b), CORE);

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const n of symbols) counts[n] += 1;
  return counts.reduce((sum, count) => sum + count*(count-1), 0) /
    (symbols.length * (symbols.length-1));
}
/** @param {number[]} symbols @returns {string} */
const latin = (symbols) => symbols.map((n) => corpus.translit[n]).join('');
/**
 * Classical keyed Trifid on supplied page-local/crosspage parts.
 * F(index0) and EA(index28) are literal and do not advance its block.
 * @param {number[][]} parts
 * @param {boolean} inverse
 * @returns {number[]}
 */
function trifid(parts, inverse) {
  const lookup = new Int16Array(29).fill(-1);
  cube.forEach((n, index) => { lookup[n] = index; });
  const result = [];
  for (const part of parts) {
    const output = part.slice();
    const positions = [];
    const indices = [];
    part.forEach((n, at) => {
      if (lookup[n] >= 0) {
        positions.push(at);
        indices.push(lookup[n]);
      } else {
        assert.ok(n === 0 || n === 28);
      }
    });
    for (let start = 0; start < indices.length; start += 27) {
      const block = indices.slice(start, start+27);
      const len = block.length;
      const decodedDigits = block.flatMap((n) => [
        Math.floor(n/9), Math.floor(n/3)%3, n%3
      ]);
      const mapped = new Array(len);
      if (inverse) {
        for (let i=0;i<len;i++) {
          mapped[i] = 9*decodedDigits[i] +
            3*decodedDigits[len+i] + decodedDigits[2*len+i];
        }
      } else {
        const rows = [];
        for (let k=0;k<3;k++)
          for (const n of block) rows.push(
            k===0 ? Math.floor(n/9) :
            k===1 ? Math.floor(n/3)%3 : n%3
          );
        for (let i=0;i<len;i++)
          mapped[i] = 9*rows[3*i] + 3*rows[3*i+1] + rows[3*i+2];
      }
      for (let i=0;i<len;i++) output[positions[start+i]] = cube[mapped[i]];
    }
    result.push(...output);
  }
  return result;
}
const orig = [...p0.slice(13), ...p1, ...p2];
assert.equal(orig.length, 716);
assert.equal(orig.slice(0,249).length,249);
const solved = pages.find((p)=>p.page===57).indices;
assert.equal(solved.length,95);
console.log('red13+red14 length:', combined.length,
  'unique keys retained:', unique.length,
  '27-cube:', cube, 'body length:',orig.length);

for (const [reset, parts] of [
  ['continuous-after-red', [orig]],
  ['page-local-after-red', [p0.slice(13),p1,p2]],
]) {
  for (const inverse of [true,false]) {
    const transformed = trifid(parts, inverse);
    const reverse = trifid([transformed], !inverse);
    if (reset === 'continuous-after-red') {
      assert.deepEqual(reverse, orig);
    } else {
      const transformedParts = [
        transformed.slice(0,249), transformed.slice(249,515), transformed.slice(515)
      ];
      assert.deepEqual(trifid(transformedParts,!inverse),orig);
    }
    const plant = [Array.from({length:249}, (_,i)=>solved[i % 95])];
    const roundtrip = trifid([trifid(plant,!inverse)],inverse);
    assert.deepEqual(roundtrip,plant[0]);
    console.log(
      reset, inverse?'decrypt':'encrypt',
      'p0 IoC:',ioc(transformed.slice(0,249)).toFixed(7),
      'p0 head (first100):',latin(transformed.slice(0,100)),
      'all716 IoC:',ioc(transformed).toFixed(7)
    );
  }
}
console.log('source p0 body IoC:',ioc(p0.slice(13)).toFixed(7),
  'solved p57 IoC:',ioc(solved).toFixed(7));
// An independent, simpler 27-character-pad reading: start with the
// previously recovered retrospective title's 13-key, then append the
// unmodified 14-rune p7 red colophon. Because first 13 plaintext symbols
// were used to derive the title key, that opening match is NOT evidence.
const titleKey = [26,24,8,19,27,24,18,3,0,8,0,16,19];
const additive27 = [...titleKey, ...red7];
assert.equal(additive27.length, 27);
const complete = [ ...p0, ...p1, ...p2 ];
assert.equal(complete.length, 27*27);
const mod = (n) => ((n % 29)+29)%29;
const padDecoded = complete.map((n,i)=>mod(n-additive27[i%27]));
assert.equal(latin(padDecoded.slice(0,13)), 'EPIPHANYSEECS');
assert.deepEqual(padDecoded.map((n,i)=>mod(n+additive27[i%27])),complete);
console.log('repeated27-pad title positive by construction:',latin(padDecoded.slice(0,13)),
  'original all-body IoC:',ioc(padDecoded.slice(13)).toFixed(7),
  'p0 body first100:',latin(padDecoded.slice(13,113)));

// Historical Cicada used Vigenere/autokey; the exactly 27-rune seed
// also admits a 27-back autokey with a fixed starting orientation.
// Test the four feedback/sign branches on untouched 729 runes.
// Each must forward-roundtrip and pass a solved-page planted fixture.
for (const feedback of ['plain', 'cipher']) {
  for (const sign of [-1, 1]) {
    const decode27 = (ciphertext) => {
      const plaintext = [];
      for (let i = 0; i < ciphertext.length; i++) {
        const key = i < 27 ? additive27[i] :
          feedback === 'plain' ? plaintext[i-27] : ciphertext[i-27];
        plaintext.push(mod(ciphertext[i] + sign*key));
      }
      return plaintext;
    };
    const encode27 = (plaintext) => {
      const ciphertext = [];
      for (let i = 0; i < plaintext.length; i++) {
        const key = i < 27 ? additive27[i] :
          feedback === 'plain' ? plaintext[i-27] : ciphertext[i-27];
        ciphertext.push(mod(plaintext[i] - sign*key));
      }
      return ciphertext;
    };
    const decoded = decode27(complete);
    assert.deepEqual(encode27(decoded), complete);
    const nativePlant = Array.from({length:729}, (_,i)=>solved[i%solved.length]);
    assert.deepEqual(decode27(encode27(nativePlant)),nativePlant);
    if (sign===-1) assert.equal(latin(decoded.slice(0,13)), 'EPIPHANYSEECS');
    console.log('27-back autokey',feedback,sign,
      'original 716-body IoC',ioc(decoded.slice(13)).toFixed(7),
      'p0 black head (first100)',latin(decoded.slice(13,113)));
  }
}

// All-secret, source-only 27x27 exclusion: a period-27 additive GP29 pad,
// or ANY arbitrary fixed bijection of the 29-symbol alphabet at every one
// of its 27 positions, must preserve equality between symbols observed
// in the same column of the 27x27 grid. No secret key is required.
function columnEqual27(glyphs) {
  assert.equal(glyphs.length,729);
  let hits=0,pairs=0;
  for(let phase=0;phase<27;phase++){
    const counts=Array(29).fill(0);
    for(let i=phase;i<729;i+=27)counts[glyphs[i]]++;
    hits+=counts.reduce((s,n)=>s+n*(n-1)/2,0);
    pairs+=27*26/2;
  }
  return {hits,pairs,rate:hits/pairs};
}
const wholeCipher=complete;
const originalCol=columnEqual27(wholeCipher);
assert.deepEqual([originalCol.hits,originalCol.pairs],[326,9477]);
const lp1Reference=fs.readFileSync(path.resolve(__dirname,'..',
  'resources/liber-primus/lp1-plaintext-reference.txt'),'utf8')
  .replace(/^#.*$/gm,' ').replace(/\[[^\]]*\]/g,' ')
  .toUpperCase();
const gpAlphabet=corpus.translit.map((sp,i)=>({sp,i}))
  .sort((a,b)=>b.sp.length-a.sp.length);
const nativeRunes=[];
for(let word of (lp1Reference.match(/[A-Z]+/g)||[])){
  word=word.replace(/QU/g,'CW').replace(/K/g,'C')
    .replace(/V/g,'U').replace(/Z/g,'S');
  for(let i=0;i<word.length;){
    const token=gpAlphabet.find((item)=>word.startsWith(item.sp,i));
    assert.ok(token,'unencodable LP1 native word');
    nativeRunes.push(token.i);
    i+=token.sp.length;
  }
}
assert.ok(nativeRunes.length>3000);
const nativeEqual=[];
for(let start=0;start+729<=nativeRunes.length;start++){
  nativeEqual.push(columnEqual27(nativeRunes.slice(start,start+729)).rate);
}
const sortedRates=[...nativeEqual].sort((a,b)=>a-b);
const firstPlant=nativeRunes.slice(0,729);
const allSecretMappings=[];
let secretSeed=0x33270129;
const rnd=()=>{secretSeed^=secretSeed<<13;secretSeed^=secretSeed>>>17;
  secretSeed^=secretSeed<<5;return secretSeed>>>0;};
for(let phase=0;phase<27;phase++){
  const perm=Array.from({length:29},(_,i)=>i);
  for(let i=28;i>0;i--){
    const j=rnd()%(i+1);
    [perm[i],perm[j]]=[perm[j],perm[i]];
  }
  allSecretMappings.push(perm);
}
const plantedBijection=firstPlant.map((c,i)=>
  allSecretMappings[i%27][c]);
const inversePerm=allSecretMappings.map(perm=>{
  const inv=Array(29);perm.forEach((v,i)=>{inv[v]=i;});return inv;
});
assert.deepEqual(plantedBijection.map((c,i)=>inversePerm[i%27][c]),firstPlant);
assert.deepEqual(columnEqual27(plantedBijection),columnEqual27(firstPlant));
const rankAtOriginal=nativeEqual.filter(v=>v<=originalCol.rate).length;
const colQuantiles=[0.05,0.5,0.95].map(q=>
  +sortedRates[Math.floor(q*(sortedRates.length-1))].toFixed(7));
console.log('27x27 all-secret phase-bijection invariant',JSON.stringify({
  original:originalCol,
  uniformExpected:1/29,
  solvedLP1NativeWindows:nativeEqual.length,
  solvedNativeMin:+sortedRates[0].toFixed(7),
  solvedNativeQuantiles5_50_95:colQuantiles,
  nativeControlsAtOrBelowOriginal:rankAtOriginal,
  secretBijectionPlantExactReconstruction:true,
  conclusion:'period27 phase-fixed GP29 bijections do not explain original opening chapter'
}));
// Repeat the all-secret necessary condition with two physically motivated
// clock resets: each printed page, and each page with red13 peeled off p0.
// Invariance holds even when each reset starts an independently secret
// 27-position alphabet of arbitrary fixed bijections.
function columnEqualGrouped(groups) {
  const hist=Array.from({length:27},()=>Array(29).fill(0));
  for(const symbols of groups)
    symbols.forEach((rune,i)=>{hist[i%27][rune]++;});
  let hits=0,pairs=0;
  for(const cells of hist){
    const n=cells.reduce((sum,c)=>sum+c,0);
    pairs+=n*(n-1)/2;
    hits+=cells.reduce((sum,c)=>sum+c*(c-1)/2,0);
  }
  return {hits,pairs,rate:hits/pairs};
}
const splitRivals=[
  {name:'physical-page-reset', groups:[p0,p1,p2], expected:[298,9493]},
  {name:'marker13-plus-page-reset',groups:[p0.slice(13),p1,p2],expected:[282,9149]}
];
for(const entry of splitRivals){
  const counts=columnEqualGrouped(entry.groups);
  assert.deepEqual([counts.hits,counts.pairs],entry.expected);
  let nativeMinimum=Infinity,nativeAtOrBelow=0,nativeCount=0;
  const len=entry.groups.reduce((sum,g)=>sum+g.length,0);
  for(let start=0;start+len<=nativeRunes.length;start++){
    let at=start;
    const sourceGroups=entry.groups.map(group=>{
      const slice=nativeRunes.slice(at,at+group.length);
      at+=group.length;
      return slice;
    });
    const rate=columnEqualGrouped(sourceGroups).rate;
    nativeMinimum=Math.min(nativeMinimum,rate);
    nativeAtOrBelow+=Number(rate<=counts.rate);
    nativeCount++;
  }
  assert.equal(nativeAtOrBelow,0);
  assert.ok(nativeMinimum>0.05);
  const plaintext=Array.from({length:len},(_,i)=>nativeRunes[i]);
  let offset=0;
  const planted=entry.groups.map(g=>{
    const encrypted=plaintext.slice(offset,offset+g.length)
      .map((rune,i)=>allSecretMappings[i%27][rune]);
    offset+=g.length;return encrypted;
  });
  const decrypted=planted.map(group=>group.map((rune,i)=>inversePerm[i%27][rune]));
  assert.deepEqual(decrypted.flat(),plaintext);
  const clean=[];
  let pos=0;
  for(const g of entry.groups){clean.push(plaintext.slice(pos,pos+g.length));pos+=g.length;}
  assert.deepEqual(columnEqualGrouped(planted),columnEqualGrouped(clean));
  console.log('27x27 reset phase-bijection invariant',JSON.stringify({
    sourceClock:entry.name,original:counts,solvedNativeWindows:nativeCount,
    solvedNativeMinimum:+nativeMinimum.toFixed(7),
    controlsAtOrBelowOriginal:nativeAtOrBelow,plantedSecretRoundtrip:true
  }));
}
// The solved p56 F-transparent rule suggests one further clock rival:
// literal GP F=0 is emitted unchanged and consumes NO key position. For
// all other 28 symbols, each phase has an arbitrary 28-symbol bijection.
// This is still fully secret-key independent because phase and literal
// positions are visible in ciphertext under the stipulated F rule.
function fSkipColumnEqual(groups,reset){
  const hist=Array.from({length:27},()=>Array(29).fill(0));
  let phase=0;
  for(const group of groups){
    if(reset)phase=0;
    for(const rune of group){
      if(rune===0)continue;
      hist[phase%27][rune]++;
      phase++;
    }
  }
  let hits=0,pairs=0;
  for(const counts of hist){
    const size=counts.reduce((s,v)=>s+v,0);
    pairs+=size*(size-1)/2;
    hits+=counts.reduce((s,v)=>s+v*(v-1)/2,0);
  }
  return {hits,pairs,rate:hits/pairs};
}
// Derive the same fixed secret-key positive for all 4 original clocks.
// Each phase's 28-character alphabet is a permutation of non-F symbols;
// F is exactly fixed. This is the same first-party behavior established
// locally for p56, hypothetically transferred to the opening chapter.
const fSkipBijections=allSecretMappings.map(permutation=>{
  const out=[0,...Array.from({length:28},(_,i)=>i+1)];
  let source=permutation.filter(v=>v!==0).map(v=>v+1);
  // Mapping v->v+1 can contain 29 (when old28); instead use stable rank.
  const perm=Array.from({length:28},(_,i)=>i+1);
  for(let i=27;i>0;i--){const j=rnd()%(i+1);[perm[i],perm[j]]=[perm[j],perm[i]];}
  return [0,...perm];
});
for(const mode of [
  {name:'full-chapter-nonF',parts:[complete],reset:false,expect:[292,8600]},
  {name:'page-reset-nonF',parts:[p0,p1,p2],reset:true,expect:[277,8615]},
  {name:'after-red-continuous-nonF',parts:[p0.slice(13),p1,p2],reset:false,expect:[287,8300]},
  {name:'after-red-page-reset-nonF',parts:[p0.slice(13),p1,p2],reset:true,expect:[272,8312]}
]){
  const original=fSkipColumnEqual(mode.parts,mode.reset);
  assert.deepEqual([original.hits,original.pairs],mode.expect);
  let nativeMin=Infinity,nativeCount=0,nativeAtOrBelow=0;
  const total=mode.parts.reduce((s,p)=>s+p.length,0);
  for(let start=0;start+total<=nativeRunes.length;start++){
    let at=start;
    const groups=mode.parts.map(part=>{
      const seq=nativeRunes.slice(at,at+part.length);
      at+=part.length;return seq;
    });
    const rate=fSkipColumnEqual(groups,mode.reset).rate;
    nativeMin=Math.min(rate,nativeMin);
    nativeAtOrBelow+=Number(rate<=original.rate);
    nativeCount++;
  }
  assert.ok(nativeMin>0.05);
  assert.equal(nativeAtOrBelow,0);
  let globalPhase=0;
  const plain=mode.parts.map((group,i)=>{
    return nativeRunes.slice(
      mode.parts.slice(0,i).reduce((s,p)=>s+p.length,0),
      mode.parts.slice(0,i+1).reduce((s,p)=>s+p.length,0));
  });
  const cipher=plain.map(group=>{
    if(mode.reset)globalPhase=0;
    return group.map(rune=>{
      if(rune===0)return 0;
      const value=fSkipBijections[globalPhase%27][rune];
      globalPhase++;return value;
    });
  });
  assert.deepEqual(fSkipColumnEqual(cipher,mode.reset),fSkipColumnEqual(plain,mode.reset));
  let phase=0;
  const recovered=cipher.map(group=>{
    if(mode.reset)phase=0;
    return group.map(rune=>{
      if(rune===0)return 0;
      const at=phase%27;phase++;
      return fSkipBijections[at].indexOf(rune);
    });
  });
  assert.deepEqual(recovered,plain);
  console.log('27-phase all-secret literal-F skip invariant',JSON.stringify({
    sourceClock:mode.name,original,controls:nativeCount,
    nativeMinimum:+nativeMin.toFixed(7),
    controlsAtOrBelowOriginal:nativeAtOrBelow,
    planted28BijectionRoundtrip:true
  }));
}
console.log('PASS: frozen complementary-27 Trifid tests; no plaintext claim');
