"use strict";
/**
 * Original-LP2 32 cross-page words -> 32 rows of the eight-column number table.
 * Frozen, source-visible one-based column: number of runes after each seam.
 * Read-only single-file test: node sims/lp2_crosspage32_gridbyte_key_sft.cjs
 * Node.js 22 / Windows 11. No external packages or secret parameter search.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const {createDecipheriv, createCipheriv, createHash} = require("node:crypto");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");
const {encodeWords} = require("./lp2_difference_allletter_capacity_sft.cjs");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const raw = read("resources/liber-primus/lp2-transcription.txt");
const parsed = parseLP2Words(raw);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const mod = (n, m) => ((n % m) + m) % m;

/**
 * Traverse the original transcription without treating line or page wrapping
 * as word boundaries; collect the source-visible rune counts on each side.
 * @returns {Array<{leftPage:number, rightPage:number, left:number, right:number}>}
 */
function pageSeams() {
  const text = raw.split("%").slice(0, 55).join("%");
  const result = [];
  /** @type {{page:number, n:number}[]} */
  let parts = [];
  let page = 0;
  const finish = () => {
    if (parts.length > 1) {
      assert.equal(parts.length, 2);
      assert.equal(parts[1].page, parts[0].page + 1);
      result.push({leftPage:parts[0].page, rightPage:parts[1].page,
        left:parts[0].n, right:parts[1].n});
    }
    parts = [];
  };
  for (const char of text) {
    if (runeIndex.has(char)) {
      const last = parts[parts.length - 1];
      if (last && last.page === page) last.n++;
      else parts.push({page, n:1});
    } else if (char === "%") page++;
    else if (char === "/" || /\s/u.test(char)) { /* printed wrap */ }
    else finish();
  }
  finish();
  return result;
}

/** @param {number[]} values @returns {string} */
function gp(values) {
  return values.map(x => corpus.translit[x]).join("");
}
/** @param {number[]} values @param {number[]} shapes @returns {number[][]} */
function groups(values, shapes) {
  let offset = 0;
  const out = shapes.map(n => {
    const w = values.slice(offset, offset + n);
    assert.equal(w.length, n);
    offset += n;
    return w;
  });
  assert.equal(offset, values.length);
  return out;
}

function main() {
  const seams = pageSeams();
  assert.equal(seams.length, parsed.crossPageWords);
  assert.equal(seams.length, 32);
  assert.equal(parsed.runeCount, 12956);
  assert.equal(parsed.words.length, 2896);
  assert.ok(seams.every(x => x.right >= 1 && x.right <= 7));
  const table = grid.pages.flatMap(x => x.bytes);
  assert.equal(table.length, 256);
  const addresses = seams.map((x, row) => row * 8 + x.right - 1);
  const key = addresses.map(i => table[i]);
  const keyHex = Buffer.from(key).toString("hex");
  // The 32 selected bytes would also be the right length for an AES-256
  // key. Test exactly one no-IV, no-padding direct 256-table-byte receiver.
  // This is a candidate consumer only: no first-party source selects AES.
  const keyBuffer=Buffer.from(key);
  const tableBuffer=Buffer.from(table);
  const aesD=createDecipheriv("aes-256-ecb",keyBuffer,null);
  aesD.setAutoPadding(false);
  const aesPlain=Buffer.concat([aesD.update(tableBuffer),aesD.final()]);
  const aesE=createCipheriv("aes-256-ecb",keyBuffer,null);
  aesE.setAutoPadding(false);
  assert.deepEqual(Buffer.concat([aesE.update(aesPlain),aesE.final()]),
    tableBuffer);
  const aesHash=createHash("sha256").update(aesPlain).digest("hex");
  assert.equal(aesHash,
    "3f7f59bf277f813ecef8490dba4eed7ca5f0c0da26f2a9dc95261f7155e5ca16");
  const ascii=Array.from(aesPlain).filter(v=>
    (v>=32 && v<=126) || v===10 || v===13).length;
  assert.equal(ascii,99);
  const aesResult={algorithm:"AES-256-ECB, no IV, no padding",
    source:"Original 256 base60 bytes, including 32 key-selected entries",
    plaintextSHA256:aesHash,plaintextFirst16:aesPlain.subarray(0,16).toString("hex"),
    printableASCIIof256:ascii,roundtrip:true,
    verdict:"No ordinary ASCII or standard recognizable file header; unselected consumer"};
  assert.equal(keyHex,
    "61f9cac6505456feff728edc483f49ed780ad221c0f0839c007f063b446a1671");
  // Test whether 32 seams and all right fragments fitting an 8-column
  // table could arise by ordinary page wrapping. Preserve every chapter's
  // printed word-length multiset and every exact original page-rune count.
  const chapterBounds = [[0,2],[3,7],[8,14],[15,22],[23,26],
    [27,32],[33,39],[40,52],[53,54]];
  const pageLengths = corpus.pages.filter(p => p.page <= 55 &&
    p.indices.length).map(p => p.indices.length);
  assert.equal(pageLengths.length,55);
  /** @param {number[]} lengths @param {number[]} pLengths @returns {number[]} */
  function crossingRightLengths(lengths, pLengths) {
    let boundary=0, before=0, word=0;
    const right=[];
    for(let p=0;p<pLengths.length-1;p++) {
      boundary+=pLengths[p];
      while(before+lengths[word]<=boundary) {
        before+=lengths[word++];
      }
      if(before<boundary)right.push(lengths[word]-(boundary-before));
    }
    return right;
  }
  const chapterSamples = chapterBounds.map(([lo,hi]) => {
    const lengths = parsed.words.filter(w =>
      w.startPage>=lo && w.endPage<=hi).map(w => w.length);
    const pLengths = pageLengths.slice(lo,hi+1);
    assert.equal(lengths.reduce((a,b)=>a+b,0),
      pLengths.reduce((a,b)=>a+b,0));
    return {lengths,pLengths};
  });
  const realChapterSeams = chapterSamples.map(({lengths,pLengths}) =>
    crossingRightLengths(lengths,pLengths));
  assert.deepEqual(realChapterSeams.map(x=>x.length),
    [2,4,2,4,3,3,2,11,1]);
  assert.equal(realChapterSeams.flat().length,32);
  assert.ok(realChapterSeams.flat().every(x=>x>=1&&x<=7));
  let state=41720919;
  const rand=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;
    return (state>>>0)/4294967296;};
  const sampleCount=20000;
  let exact32=0,atMost32=0,allUnder8=0,joint=0;
  for(let i=0;i<sampleCount;i++){
    let n=0,within8=true;
    for(const chapter of chapterSamples){
      const lengths=chapter.lengths.slice();
      for(let j=lengths.length-1;j>0;j--){
        const k=Math.floor(rand()*(j+1));
        [lengths[j],lengths[k]]=[lengths[k],lengths[j]];
      }
      const fragments=crossingRightLengths(lengths,chapter.pLengths);
      n+=fragments.length;
      if(fragments.some(x=>x>7))within8=false;
    }
    if(n===32)exact32++;
    if(n<=32)atMost32++;
    if(within8)allUnder8++;
    if(n===32&&within8)joint++;
  }
  const pageWrapNull={method:"shuffle complete source word lengths within each chapter, preserve exact printed page-rune counts",
    seed:41720919,samples:sampleCount,exactly32:exact32,
    atMost32,allRightFragmentsFit8Columns:allUnder8,
    exactly32AndFit8Columns:joint,
    note:"Post-selected exploratory coincidences, no adjusted significance claim"};
  const key29 = key.map(n => n % 29);
  const key28 = key.map(n => n % 28);
  const all = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
  const target = corpus.pages.find(p => p.page === 55).indices;
  assert.equal(all.length, 12956);
  assert.equal(target.length, 76);
  const start = all.length - target.length;
  assert.deepEqual(all.slice(start), target);

  // One rune completes a printed word carried from physical p54.
  const shapes = [1, ...parsed.byContainedPage[54].map(w => w.length)];
  assert.deepEqual(shapes, [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
  const previous = all[start - 1];
  /** @param {number[]} c @param {number} phase @returns {number[]} */
  const gp29 = (c, phase) => c.map((x,i) => mod(x - key29[mod(i+phase,32)],29));
  /** @param {number[]} c @param {number} phase @param {number} prior @returns {number[]} */
  const gp28 = (c, phase, prior) => c.map((x,i) => {
    const delta = mod(x - (i ? c[i-1] : prior), 29);
    return delta === 0 ? 28 : mod(delta - 1 - key28[mod(i+phase,32)], 28);
  });
  const inverse = [
    {method:"GP29 additive, page-start", symbols:gp29(target, 0)},
    {method:"GP29 additive, full-book clock", symbols:gp29(target, start)},
    {method:"GP28 nonself step, page-start", symbols:gp28(target, 0, previous)},
    {method:"GP28 nonself step, full-book clock", symbols:gp28(target, start, previous)},
  ];
  const referencePaths = [
    "resources/control/gibran_prophet_58585.txt",
    "resources/control/emerson_essays_2944.txt",
    "resources/control/shakespeare_first300k.txt"
  ];
  const refs = referencePaths.flatMap(file => encodeWords(read(file)));
  const lexicon = new Set(refs.filter(w => w.length >= 3).map(w => w.join(",")));
  const originals = inverse.map(({method,symbols}) => {
    const chunks = groups(symbols, shapes);
    const hits = chunks.slice(1).filter(w =>
      w.length >= 3 && lexicon.has(w.join(","))).map(gp);
    return {method, sourceNativeDictionaryWordsLength3Plus:hits,
      gpWords:chunks.map(gp)};
  });
  assert.ok(originals.every(x =>
    x.sourceNativeDictionaryWordsLength3Plus.length === 0));

  // Same word-shape planted controls. The inserted EA checks the 29th
  // repeat/escape state in the GP28 model rather than silently skipping it.
  const banks = new Map();
  for (const w of refs) {
    if (!banks.has(w.length)) banks.set(w.length, []);
    banks.get(w.length).push(w);
  }
  const used = new Map();
  const native = shapes.flatMap(n => {
    const next = used.get(n) || 0;
    const word = banks.get(n)?.[next];
    assert.ok(word && word.length === n);
    used.set(n, next+1);
    return word;
  });
  assert.equal(native.length, 76);
  for (const phase of [0, start]) {
    const c29 = native.map((v,i) => mod(v+key29[mod(i+phase,32)],29));
    assert.deepEqual(gp29(c29,phase),native);
    const positive = native.slice();
    positive[12] = 28;
    const c28 = [];
    for (let i=0;i<positive.length;i++) {
      const diff = positive[i] === 28 ? 0 :
        1 + mod(positive[i] + key28[mod(i+phase,32)],28);
      c28.push(mod((i ? c28[i-1] : previous) + diff,29));
    }
    assert.deepEqual(gp28(c28,phase,previous),positive);
  }
  console.log(JSON.stringify({
    classification:"EXPLORATORY CLUE-CONSTRAINED KEY; DIRECT CONSUMERS NEGATIVE",
    input:{unknownRunes:all.length,words:parsed.words.length,
      crossPageWords:seams.length,tableBytes:table.length,
      p55SourceScan:"72.jpg",p55Runes:target.length,
      note:"p55 starts with a one-rune carried word completion"},
    selector:"row = chronological original page-crossing word 1..32; column = number of runes after the seam (1-based)",
    seamPositions:seams, selectedGridIndices:addresses,
    selectedBytesHex:keyHex, keyAsGP29:gp(key29),
    keyAsGP28:gp(key28),
    controls:{nativeSameShape76RuneRoundTrip29:true,
      nativeSameShape76RuneRoundTrip28WithEARepeat:true,
      sourceNativeLexiconSize:lexicon.size,pageWrapNull},
    original:originals,tableSelfDecrypt:aesResult,
    decision:"Source count and grid dimensions provide a conditional 32-byte key. The exact GP29 additive/GP28 predecessor consumers yield no GP-English words of length >=3 on physical p55; no authored instruction selects the seam mapping, cipher family or key consumer."
  },null,2));
}
if (require.main === module) main();
module.exports = {main, pageSeams};
