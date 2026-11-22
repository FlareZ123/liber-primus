'use strict';

/**
 * Original LP2 predecessor-SUM exceptional-step family, exact all-key gate.
 * C[i]=C[i-1] iff (P[i]+P[i-1]) mod29 equals a secret K constant within
 * one of the 29 author-marked sections; all 28 remaining steps may use any
 * independently secret permutation. Test all 29^29 section keys against
 * original page geometry in source-native English, and prove a full
 * GP29 nonaffine rotor positive cipher decodes exactly.
 *
 * Node.js 22 CommonJS, Windows 11, read-only, no third-party dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} p @returns {string} */
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const book = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const punctuation = JSON.parse(read('resources/liber-primus/lp2-punctuation-identity.json'));
const refs = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt'
];
const Q = 29, N = 12956;
const originals = book.pages.filter((p) => p.page <= 55 && p.indices.length);
const sourceTape = originals.flatMap((p) => p.indices);
assert.equal(originals.length, 55);
assert.equal(sourceTape.length, N);
let total = 0;
const pageStarts = originals.map((p) => {
  const at = total;
  total += p.indices.length;
  return at;
});
assert.equal(total, N);
const marks = [...new Set(punctuation.events
  .filter((e) => e.symbol === '⁜')
  .map((e) => e.rune_offset)
  .filter((x) => x > 0 && x < N))].sort((a,b) => a-b);
assert.equal(punctuation.large_mark_alignment.matched_records, 31);
assert.equal(marks.length, 28);
const cuts = [...new Set([0,N,...pageStarts,...marks])].sort((a,b) => a-b);
/** @type {{start:number,end:number,group:number}[]} */
const spans = [];
let group = 0;
for (let i=0;i+1<cuts.length;i++) {
  if (marks.includes(cuts[i])) group++;
  spans.push({start:cuts[i],end:cuts[i+1],group});
}
assert.equal(group+1, 29);
assert.equal(spans.length, 74);
const eligible = spans.reduce((s,p) => s+p.end-p.start-1, 0);
assert.equal(eligible, 12882);
let originalEquals = 0;
for (const sp of spans)
  for (let i=sp.start+1;i<sp.end;i++)
    originalEquals += Number(sourceTape[i]===sourceTape[i-1]);
assert.equal(originalEquals, 86);

const tokens = [
  ['ING',21],['IO',27], ...book.translit.map((s,i)=>[s,i])
].sort((a,b)=>b[0].length-a[0].length);
/**
 * Source-attested GP spelling. Original solved LP1 has ING=21, IO=27.
 * @param {string} text @returns {number[]}
 */
function nativeGP(text) {
  const result = [];
  for (const raw of text.toUpperCase().match(/[A-Z]+/g)||[]) {
    const w = raw.replace(/QU/g,'CW').replace(/V/g,'U')
      .replace(/[KQ]/g,'C').replace(/Z/g,'S');
    for (let i=0;i<w.length;) {
      const item = tokens.find(([s])=>w.startsWith(s,i));
      assert.ok(item,'Unmappable GP word');
      result.push(item[1]);
      i += item[0].length;
    }
  }
  return result;
}
/**
 * Exact best of all 29^29 secret section keys on every native plaintext
 * window of the entire original 12956-rune geometry.
 * @param {number[]} plain
 */
function allKeys(plain) {
  const classes = new Uint8Array(plain.length);
  for (let i=1;i<plain.length;i++)
    classes[i]=(plain[i]+plain[i-1])%Q;
  const counts = Array.from({length:29},()=>new Int32Array(Q));
  for (const sp of spans)
    for (let i=sp.start+1;i<sp.end;i++)
      counts[sp.group][classes[i]]++;
  const windows = plain.length-N+1;
  let minimum=Infinity,start=-1,sum=0,compatible=0;
  let bestKeys=[];
  for (let off=0;off<windows;off++) {
    if (off) {
      for (const sp of spans) {
        counts[sp.group][classes[off+sp.start]]--;
        counts[sp.group][classes[off+sp.end-1]]++;
      }
    }
    let cost=0;
    const keys=[];
    for (const hist of counts) {
      let min=Infinity,kStar=-1;
      for (let k=0;k<Q;k++)
        if (hist[k]<min) {min=hist[k];kStar=k;}
      cost+=min;
      keys.push(kStar);
    }
    if(cost<minimum){minimum=cost;start=off;bestKeys=keys;}
    if(cost<=originalEquals)compatible++;
    sum+=cost;
  }
  return {runes:plain.length,windows,minimum,start,
    average:sum/windows,compatible,bestKeys};
}
/** @param {number} n @param {number} q @returns {number} */
const mod=(n,q)=>(n%q+q)%q;
/**
 * True reversible native positive, author-mark resets, 29 distinct symbols.
 * Nonzero successor residues permute by multiplier17 (inverse5) mod28.
 * @param {number[]} plain @returns {number[]}
 */
function encrypt(plain) {
  const output=new Array(N);
  for (const sp of spans) {
    const k=(24+7*sp.group)%Q;
    const iv=mod(11*sp.group+17*sp.start+19,Q);
    output[sp.start]=(plain[sp.start]+iv)%Q;
    for(let i=sp.start+1;i<sp.end;i++){
      const z=mod(plain[i]+plain[i-1]-k,Q);
      const rotor=(7*i+11*sp.group)%28;
      const step=z===0?0:1+((17*(z-1)+rotor)%28);
      output[i]=(output[i-1]+step)%Q;
      assert.equal(output[i]===output[i-1],z===0);
    }
  }
  return output;
}
/** @param {number[]} cipher @returns {number[]} */
function decrypt(cipher) {
  const output=new Array(N);
  for (const sp of spans) {
    const k=(24+7*sp.group)%Q;
    const iv=mod(11*sp.group+17*sp.start+19,Q);
    output[sp.start]=mod(cipher[sp.start]-iv,Q);
    for(let i=sp.start+1;i<sp.end;i++){
      const step=mod(cipher[i]-cipher[i-1],Q);
      const rotor=(7*i+11*sp.group)%28;
      const z=step===0?0:1+mod(5*(step-1-rotor),28);
      output[i]=mod(z+k-output[i-1],Q);
    }
  }
  return output;
}
/**
 * Independently source selected each of 29 original mark-defined passages,
 * retaining page-cut positions, 10k frozen xorshift32 controls.
 * @param {number[][]} plainTexts
 */
function independentPassages(plainTexts) {
  const endings=[...marks,N];
  const sections=endings.map((end,i)=>{
    const start=i?endings[i-1]:0;
    return {start,end,parts:spans.filter(sp=>sp.group===i)};
  });
  const classified=plainTexts.map(plain=>{
    const c=new Uint8Array(plain.length);
    for(let i=1;i<plain.length;i++)c[i]=(plain[i]+plain[i-1])%Q;
    return c;
  });
  let seed=0x3301;
  const random32=()=>{
    seed^=seed<<13; seed^=seed>>>17; seed^=seed<<5;
    return seed>>>0;
  };
  const results=[];
  for(let trial=0;trial<10000;trial++){
    let score=0;
    for(const section of sections){
      const corpus=classified[random32()%classified.length];
      const length=section.end-section.start;
      const offset=random32()%(corpus.length-length+1);
      const hist=new Int16Array(Q);
      for(const sp of section.parts)
        for(let j=sp.start-section.start+1;j<sp.end-section.start;j++)
          hist[corpus[offset+j]]++;
      let min=Infinity;
      for(const x of hist)if(x<min)min=x;
      score+=min;
    }
    results.push(score);
  }
  results.sort((a,b)=>a-b);
  return {
    seed:'0x3301',trials:results.length,minimum:results[0],
    q01:results[99],median:results[4999],
    mean:results.reduce((s,x)=>s+x,0)/results.length,
    maximum:results[results.length-1],
    compatible:results.filter(x=>x<=originalEquals).length
  };
}
const native=refs.map(f=>nativeGP(read(f)));
// Independent pre-existing Latin-Vulgate word-preserving GP corpus.
const latinDigits='0123456789ABCDEFGHIJKLMNOPQRS';
const latin=read('resources/control/latin-vulgate-gp-wholewords.txt')
  .split(/\r?\n/).filter(s=>/^[0-9A-S]+$/.test(s))
  .flatMap(s=>Array.from(s).map(c=>latinDigits.indexOf(c)));
assert.equal(latin.length,204802);
assert.ok(latin.every(x=>x>=0&&x<29));
native.push(latin);
// Independent corrected Beowulf Old-English rune register. Its base29
// serialization is alphabetically indexed A-Z,a-c, not ASCII 0-9,A-S.
const beowulf=JSON.parse(read('resources/control/beowulf_oe_gp_profile_corrected.json'));
assert.equal(beowulf.positiveControlAlphabet,'ABCDEFGHIJKLMNOPQRSTUVWXYZabc');
const oldEnglish=Array.from(beowulf.sourceGpBase29)
  .map(c=>beowulf.positiveControlAlphabet.indexOf(c));
assert.equal(oldEnglish.length,48012);
assert.ok(oldEnglish.every(x=>x>=0&&x<29));
const oldCounts=Array.from({length:29},()=>0);
for(const x of oldEnglish)oldCounts[x]++;
assert.deepEqual(oldCounts,beowulf.allGpCounts);
native.push(oldEnglish);
assert.deepEqual(native.map(x=>x.length),[62492,217106,321327,204802,48012]);
const scans=native.map(allKeys);
assert.deepEqual(scans.map(x=>x.windows),[49537,204151,308372,191847,35057]);
assert.deepEqual(scans.map(x=>x.minimum),[138,129,140,100,119]);
assert.deepEqual(scans.map(x=>x.start),[41265,29470,224755,71107,5275]);
assert.deepEqual(scans.map(x=>x.compatible),[0,0,0,0,0]);
const sourceControls=independentPassages(native.slice(0,3));
assert.equal(sourceControls.minimum,136);
assert.equal(sourceControls.q01,151);
assert.equal(sourceControls.median,176);
assert.equal(sourceControls.mean,175.8596);
assert.equal(sourceControls.compatible,0);
const plant=native[0].slice(0,N);
const c=encrypt(plant);
assert.deepEqual(decrypt(c),plant);
assert.deepEqual(encrypt(decrypt(c)),c);
console.log(JSON.stringify({
  original:{runes:N,pages:originals.length,marks:marks.length,
    originalSections:group+1,spans:spans.length,eligible,
    repeated:originalEquals},
  family:'C[i]=C[i-1] iff plaintext predecessor SUM is a section-fixed GP29 residue; each other successor is arbitrarily permutable',
  scans:scans.map((row,i)=>({file:[...refs,
    'resources/control/latin-vulgate-gp-wholewords.txt',
    'resources/control/beowulf_oe_gp_profile_corrected.json'][i],...row})),
  totalNativeWindows:scans.reduce((s,row)=>s+row.windows,0),
  independentPassages:sourceControls,
  positive:{originalLengthNativeRunes:plant.length,
    exactForwardInverse:true},
  conclusion:'No full-source-length native GP English window permits even 29 independently chosen marked-section SUM-zero markers. Language, state-changing markers and other operations remain open.'
},null,2));
console.log('PASS: original GP29 SUM-zero all-secret marked-section test and 12956/12956 positive.');
