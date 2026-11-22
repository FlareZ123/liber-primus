"use strict";
/**
 * Original LP2 cuneiform red-section, printed-line bookcode and p50 SW rim.
 * Read-only SFT. Node 22, CommonJS. Run from repository root.
 *
 * Independent source selectors:
 * - repeated authentic cuneiform inscriptions (17,13)_60 and (55,1)_60;
 * - red heading at p33 rune91 starts exactly on printed line6;
 * - next red heading at p39 rune119 ends that section;
 * - actual printed lines, using first-party book-coordinate precedent.
 *
 * This is a conditional bookcode, not an authenticated LP2 plaintext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} name */
function read(name) {
  return fs.readFileSync(path.join(root, name), "utf8");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const physical = read("resources/liber-primus/lp2-transcription.txt").split("%");
const glyphs = new Map(corpus.runes.map((r, i) => [r, i]));
const lines = [];
const headings = [];
for (let p = 0; p < 56; p++) {
  if (p === 50) {
    assert.equal(corpus.pages[p].indices.length, 0, "rune-free numeric p50");
    continue;
  }
  // The physical transcription deliberately excludes the rune-free table p50.
  const source = physical[p < 50 ? p : p - 1];
  const rows = [];
  let current = [], offset = 0, lineStart = 0;
  for (const ch of source) {
    if (glyphs.has(ch)) {
      current.push(glyphs.get(ch));
      offset++;
    } else if (ch === "\n" && current.length) {
      rows.push({page: p, number: rows.length + 1, start: lineStart, end: offset, values: current});
      current = [];
      lineStart = offset;
    }
  }
  if (current.length) {
    rows.push({page: p, number: rows.length + 1, start: lineStart, end: offset, values: current});
  }
  assert.equal(offset, corpus.pages[p].indices.length, "original page rune count p" + p);
  const base = lines.length;
  lines.push(...rows);
  const annotation = ink.pages.find(x => x.page === p);
  for (const span of annotation?.red_spans || []) {
    const row = rows.findIndex(r => r.start <= span.start && r.end > span.start);
    assert(row >= 0, "red rune must be printed on a real line");
    headings.push({page: p, offset: span.start, n: span.length, index: base + row, exactLine: rows[row].start === span.start});
  }
}
headings.sort((a, b) => a.index - b.index);
assert.equal(lines.length, 594);
assert.equal(headings.length, 16);
const start = headings.find(h => h.page === 33 && h.offset === 91);
const stop = headings.find(h => h.page === 39 && h.offset === 119);
assert(start && stop && start.exactLine && stop.exactLine);
assert.equal(lines[start.index].number, 6);
assert.equal(lines[stop.index].number, 7);
const section = lines.slice(start.index, stop.index);
assert.equal(section.length, 69);
assert.equal(section.reduce((a, l) => a + l.values.length, 0), 1468);
assert.equal(corpus.pages.slice(33, 40).reduce((a, p) => a + p.indices.length, 0), 1680);
assert.equal(lines.filter(l => l.page >= 33 && l.page <= 39).length, 80);

/** @param {{values:number[]}[]} rows @param {number} row1 @param {number} col1 */
function at(rows, row1, col1) {
  const row = rows[row1 - 1];
  assert(row && col1 >= 1 && col1 <= row.values.length, "original line/rune pointer out of bounds");
  const code = row.values[col1 - 1];
  return {code, translit: corpus.translit[code], page: row.page, line: row.number, runeOffset: row.start + col1 - 1};
}
const a = at(section, 17, 13);
const b = at(section, 55, 1);
assert.deepEqual(a, {code:15,translit:"S",page:34,line:11,runeOffset:233});
assert.deepEqual(b, {code:7,translit:"W",page:38,line:3,runeOffset:44});
console.log("Original red-section line/rune addresses (17,13),(55,1):",a,b);
console.log("Bookcode reading: SW (southwest), conditional.");

const comparable = [];
for (let i = 0; i < headings.length; i++) {
  const heading = headings[i];
  const end = i + 1 < headings.length ? headings[i + 1].index : lines.length;
  const rows = lines.slice(heading.index, end);
  if (rows.length < 55 || rows[16].values.length < 13 || rows[54].values.length < 1) continue;
  comparable.push({page: heading.page, offset: heading.offset, lineCount: rows.length,
    reading: at(rows,17,13).translit + at(rows,55,1).translit});
}
assert.deepEqual(comparable.map(r => [r.page,r.offset,r.lineCount,r.reading]), [
  [8,0,79,"IS"], [15,9,85,"XA"], [27,0,65,"NNG"],
  [33,91,69,"SW"], [40,0,131,"RAE"]
]);
console.log("All other red-to-red sections supporting both literal coordinates:",comparable);

// Test one concrete next receiver suggested by the extracted compass direction:
// start at the southwest corner of the authentic p49-p51 32x8 numerical grid,
// traverse its 76-cell perimeter in either orientation, use the conventional
// base59/drop-f or base60 token reading modulo GP29 as a direct p55 76-rune key.
const tokens = grid.pages.flatMap(page => page.tokens);
const actual = corpus.pages[55].indices;
assert.equal(tokens.length, 256);
assert.equal(actual.length, 76);
const clockwise = [];
for (let row = 31; row >= 0; row--) clockwise.push([row,0]);
for (let col = 1; col <= 7; col++) clockwise.push([0,col]);
for (let row = 1; row <= 31; row++) clockwise.push([row,7]);
for (let col = 6; col >= 1; col--) clockwise.push([31,col]);
assert.equal(clockwise.length, 76);
const counterclockwise = [clockwise[0],...clockwise.slice(1).reverse()];
const nativeControl = corpus.pages[57].indices.slice(0,76);
assert.equal(nativeControl.length, 76);
/** @param {number[]} xs */
function ioc(xs) {
  const frequency = Array(29).fill(0);
  for (const x of xs) frequency[x]++;
  return frequency.reduce((s,v) => s + v*(v-1),0)/(xs.length*(xs.length-1));
}
const outcomes = [];
for (const [direction, coords] of [["SW clockwise",clockwise],["SW counterclockwise",counterclockwise]]) {
  const keyTokens = coords.map(([row,col]) => tokens[row*8+col]);
  for (const radix of [59,60]) {
    const alphabet = radix === 59 ? grid.alphabet.replace("f","") : grid.alphabet;
    assert.equal(alphabet.length,radix);
    const key = keyTokens.map(token => {
      const hi=alphabet.indexOf(token[0]), lo=alphabet.indexOf(token[1]);
      assert(hi >= 0 && lo >= 0, "table token outside chosen numeric base");
      return (radix*hi+lo)%29;
    });
    for (const sign of [-1,1]) {
      const plain = actual.map((c,i) => (c + sign*key[i] + 29)%29);
      assert(plain.every((x,i) => (x - sign*key[i] + 29)%29 === actual[i]));
      const seeded = nativeControl.map((v,i) => (v - sign*key[i] + 29)%29);
      assert.deepEqual(seeded.map((v,i) => (v + sign*key[i] + 29)%29), nativeControl);
      outcomes.push({direction,radix,sign,ioc:ioc(plain),
        output:plain.map(x=>corpus.translit[x]).join("")});
    }
  }
}
assert.equal(outcomes.length,8);
assert(outcomes.every(x=>x.ioc < 0.04));
console.log("SW-directed p50 rim --> p55 original 76-rune direct-key results:");
for (const result of outcomes) console.log(JSON.stringify(result));
console.log("PASS: source-only SW pointer is exact; eight simple rim-key receivers fail native-GP concentration and recover no readable original plaintext.");


// SW also uniquely abbreviates an original LP1 heading, SOME WISDOM (p05).
// That heading contains the actual 1033 5x5 square printed in 2014, hence
// is a plausible human source receiver for these cuneiform numerals.
// Historical Stage04 used solved LP1 prose to key a GP29 Vigenere cipher.
// Probe exactly the printed 10-rune heading and its 64-rune prose body as
// repeating, zero-phase, page-item-reset keys with the two additive signs.
const wisdom = read("resources/external/2013-0-wisdom.txt");
const titleEnd = wisdom.indexOf("⁜");
const knowThis = wisdom.indexOf("ᚳᚾᚩᚹ•ᚦᛁᛋ");
assert(titleEnd >= 0 && knowThis > titleEnd);
const wisdomIndex = text => [...text].filter(ch => glyphs.has(ch)).map(ch => glyphs.get(ch));
const wisdomKeys = [
  {name:"LP1 SOME WISDOM heading",key:wisdomIndex(wisdom.slice(0,titleEnd))},
  {name:"LP1 SOME WISDOM body",key:wisdomIndex(wisdom.slice(titleEnd+1,knowThis))}
];
assert.deepEqual(wisdomKeys.map(x => x.key.length),[10,64]);
assert.equal(wisdomKeys[0].key.map(x => corpus.translit[x]).join(""),"SOMEWISDOM");
const numbered = [
  corpus.pages[36].indices.slice(99,238),
  corpus.pages[37].indices.slice(0,91),
  corpus.pages[37].indices.slice(91,189),
  corpus.pages[37].indices.slice(189,228).concat(corpus.pages[38].indices.slice(0,57)),
  corpus.pages[38].indices.slice(57,186)
];
assert.deepEqual(numbered.map(x => x.length),[139,91,98,96,129]);
const wisdomOutcomes = [];
for(const {name,key} of wisdomKeys){
  for(const sign of [-1,1]){
    // Cipher = Plain - sign*key. The same source key is used to plant known
    // solved p57 plaintext and to decode original unknown numbered material.
    const planted = nativeControl.map((plain,i) =>
      (plain-sign*key[i%key.length]+29)%29);
    const restored = planted.map((cipher,i) =>
      (cipher+sign*key[i%key.length]+29)%29);
    assert.deepEqual(restored,nativeControl);
    const results = numbered.map((source,unit) => {
      const plaintext = source.map((cipher,i) =>
        (cipher+sign*key[i%key.length]+29)%29);
      assert.deepEqual(plaintext.map((plain,i) =>
        (plain-sign*key[i%key.length]+29)%29),source);
      return {unit:unit+1,n:source.length,ioc:ioc(plaintext),
        first35:plaintext.slice(0,35).map(x => corpus.translit[x]).join("")};
    });
    assert(results.every(x => x.ioc > 0.025 && x.ioc < 0.042));
    wisdomOutcomes.push({name,sign,results});
  }
}
assert.equal(wisdomOutcomes.length,4);
console.log("SW -> literal LP1 SOME WISDOM Vigenere receivers on original five numbered units:");
for(const result of wisdomOutcomes)console.log(JSON.stringify(result));
console.log("PASS: Four source-linked title/body Vigenere transfers recover no native numbered plaintext.");


// The literal two recovered GP runes S=15, W=7 also form a complete,
// zero-phase two-symbol Vigenere key. Test it directly on its original source
// red-to-red section and on the full five numbered statements, without
// inferring a second recipient or retuning any clock.
const sourceChapter=corpus.pages[33].indices.slice(91)
  .concat(...[34,35,36,37,38].map(p=>corpus.pages[p].indices),
    corpus.pages[39].indices.slice(0,119));
const sourceFive=numbered.flat();
assert.equal(sourceChapter.length,1468);
assert.equal(sourceFive.length,553);
const literalSW=[a.code,b.code];
assert.deepEqual(literalSW,[15,7]);
for(const [name,ciphertext] of [["p33 to p39 red to red",sourceChapter],["five numbered items",sourceFive]]){
  for(const sign of [-1,1]){
    const output=ciphertext.map((v,i)=>(v+sign*literalSW[i%2]+29)%29);
    assert.deepEqual(output.map((v,i)=>(v-sign*literalSW[i%2]+29)%29),ciphertext);
    const nativePlant=nativeControl.map((v,i)=>(v-sign*literalSW[i%2]+29)%29);
    assert.deepEqual(nativePlant.map((v,i)=>(v+sign*literalSW[i%2]+29)%29),nativeControl);
    const score=ioc(output);
    assert(score>0.030&&score<0.039);
    console.log(JSON.stringify({receiver:name,derived_GP29_key:"SW",sign,n:output.length,
      decoded_ioc:score,first80:output.slice(0,80).map(x=>corpus.translit[x]).join("")}));
  }
}
console.log("PASS: direct literal SW key on its original source chapter and five numbered passages produces no native prose.");


// Source-selected numerical bridge: the SW table corner is byte113 (token1r),
// exactly the first prime after the 29th GP prime 109. Freeze the historical
// solved-p56 prime-totient decoder at that prime on the 76 original p55 runes.
// Three literal F ciphertext sites admit 2^3 transparent-F clock choices.
assert.equal(grid.bytes[31*8],113);
assert.equal(grid.pages.flatMap(p=>p.tokens)[31*8],"1r");
assert.equal(corpus.prime.at(-1),109);
const p55Source=corpus.pages[55].indices;
const p55F=p55Source.flatMap((value,i)=>value===0?[i]:[]);
assert.deepEqual(p55F,[15,25,41]);
const cornerPrimes=[];
for(let candidate=113;cornerPrimes.length<76;candidate++){
  let prime=true;
  for(let d=2;d*d<=candidate;d++)if(candidate%d===0){prime=false;break;}
  if(prime)cornerPrimes.push(candidate);
}
assert.equal(cornerPrimes[0],113);
const cornerModels=[];
for(const sign of [-1,1]){
  const ciphertextPositive=nativeControl.map((v,i)=>(v-sign*(cornerPrimes[i]-1)%29+29)%29);
  const decodedPositive=ciphertextPositive.map((v,i)=>(v+sign*(cornerPrimes[i]-1)%29+29)%29);
  assert.deepEqual(decodedPositive,nativeControl);
  for(let mask=0;mask<8;mask++){
    let key=0,output=[],skips=[];
    for(let i=0;i<p55Source.length;i++){
      const fIndex=p55F.indexOf(i);
      const bypass=fIndex>=0&&(mask&(1<<fIndex))!==0;
      if(bypass){output.push(0);skips.push(i);}
      else output.push((p55Source[i]+sign*(cornerPrimes[key++]-1)%29+29)%29);
    }
    let replayIndex=0;
    assert.deepEqual(output.map((v,i)=>skips.includes(i)?0:(v-sign*(cornerPrimes[replayIndex++]-1)%29+29)%29),p55Source);
    const score=ioc(output);
    cornerModels.push({sign,mask,skips,ioc:score,first50:output.slice(0,50).map(x=>corpus.translit[x]).join("")});
  }
}
assert.equal(cornerModels.length,16);
assert(cornerModels.every(x=>x.ioc<0.05));
console.log("SW source corner prime113, historical prime-totient receiver, original p55 16 F-transparent choices:");
for(const x of cornerModels)console.log(JSON.stringify(x));
console.log("PASS: candidate SW->113 has no p55 original native plaintext under any literal-F clock mask.");
