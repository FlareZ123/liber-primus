"use strict";
/**
 * Reproduce the 2016-seed / 2014-LCG / p49-51 76:180 geometry consumer gates.
 *
 * Tests the natural perimeter/interior correspondence against p55 and the
 * known p56+p57 plaintext: direct plaintext, additive pad, 5-bit XOR pad,
 * and LCG-state transposition. This is a bounded rejection test, not a
 * proposed decryption.
 *
 * @module lp2_onion7_133331_geometry_split_gate_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const mod = (x, n) => ((x % n) + n) % n;

function toGp(text, translit) {
  const tokens = translit.map((token, index) => ({token,index}))
    .sort((a,b) => b.token.length - a.token.length);
  const out = [];
  for (const word of text.split(" ")) {
    for (let i = 0; i < word.length;) {
      const t = tokens.find(x => word.startsWith(x.token, i));
      assert.ok(t, "unmapped plaintext at " + word.slice(i));
      out.push(t.index);
      i += t.token.length;
    }
  }
  return out;
}
const textOf = (values, translit) => values.map(i => translit[i] ?? "?").join("");
const matchCount = (a,b) => a.reduce((n,v,i) => n + (v === b[i] ? 1 : 0), 0);
function invert(perm) {
  const inverse = new Array(perm.length);
  perm.forEach((v,i) => { inverse[v] = i; });
  assert.equal(new Set(perm).size, perm.length);
  return inverse;
}
const apply = (values, permutation) => permutation.map(i => values[i]);

function run() {
  const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
  const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
  assert.equal(grid.shape, "32 rows by 8 columns across LP2 pages 49, 50, 51");
  assert.equal(grid.bytes.length, 256);

  // Historical source parameters: Onion7 HTML title=133 and div id=331.
  const html = read("resources/cicada2014-onion7-index.html");
  const titleStart = html.indexOf("<title>") + "<title>".length;
  const titleEnd = html.indexOf("</title>", titleStart);
  const a = Number(html.slice(titleStart, titleEnd).trim());
  const divStart = html.indexOf('<div id="') + '<div id="'.length;
  const divEnd = html.indexOf('"', divStart);
  const c = Number(html.slice(divStart, divEnd));
  assert.deepEqual([a,c], [133,331]);

  // The source-derived 13-token PRNG payload documented in the carrier report.
  // Folding its GP29 indices as a base-29 integer yields seed 22 mod 256.
  const payload = ["L","C","B","P","NG","P","A","R","R","TH","B","P","C"];
  const payloadIndices = payload.map(t => {
    const i = corpus.translit.indexOf(t);
    assert.ok(i >= 0, "unknown GP29 payload token " + t);
    return i;
  });
  const payloadInteger = payloadIndices.reduce(
    (n,v) => n * 29n + BigInt(v), 0n);
  const seed = Number(payloadInteger % 256n);
  assert.equal(payloadInteger.toString(), "7144649572585460758");
  assert.equal(seed, 22);

  const p55 = corpus.pages.find(p => p.page === 55).indices;
  const c56 = corpus.pages.find(p => p.page === 56).indices;
  const c57 = corpus.pages.find(p => p.page === 57).indices;
  const p56 = toGp(
    "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE",
    corpus.translit
  );
  const p57Text = solved.sections.find(s => s.name === "p57_parable").source_text;
  const p57 = Array.from(p57Text)
    .filter(ch => corpus.runes.includes(ch))
    .map(ch => corpus.runes.indexOf(ch));
  const cipher = [...c56,...c57];
  const plain = [...p56,...p57];
  assert.deepEqual([p55.length,p56.length,p57.length,cipher.length,plain.length],
    [76,85,95,180,180]);

  // Canonical clockwise perimeter (top, right, bottom, left) and row-major interior.
  const perimeter = [];
  for (let col=0; col<8; col++) perimeter.push(col);
  for (let row=1; row<31; row++) perimeter.push(row*8+7);
  for (let col=7; col>=0; col--) perimeter.push(31*8+col);
  for (let row=30; row>=1; row--) perimeter.push(row*8);
  const perimeterSet = new Set(perimeter);
  const interior = [];
  for (let row=1; row<31; row++) {
    for (let col=1; col<7; col++) interior.push(row*8+col);
  }
  assert.deepEqual([perimeter.length,interior.length,perimeterSet.size],
    [76,180,76]);

  // Full-cycle LCG traversal, starting at the 2016-derived seed.
  const states = [];
  let x = seed;
  for (let t=0; t<256; t++) {
    states.push(x);
    x = mod(a*x+c,256);
  }
  assert.equal(x,seed);
  assert.equal(new Set(states).size,256);
  const lcgPerimeterCells = states.filter(i => perimeterSet.has(i));
  const lcgInteriorCells = states.filter(i => !perimeterSet.has(i));
  assert.deepEqual([lcgPerimeterCells.length,lcgInteriorCells.length],
    [76,180]);

  const rowPerimeter = perimeter.map(i => grid.bytes[i]);
  const rowInterior = interior.map(i => grid.bytes[i]);
  const lcgPerimeter = lcgPerimeterCells.map(i => grid.bytes[i]);
  const lcgInterior = lcgInteriorCells.map(i => grid.bytes[i]);
  const rowPerimeter29 = rowPerimeter.map(v => v%29);
  const rowInterior29 = rowInterior.map(v => v%29);
  const lcgPerimeter29 = lcgPerimeter.map(v => v%29);
  const lcgInterior29 = lcgInterior.map(v => v%29);
  const rowInterior32 = rowInterior.map(v => v%32);
  const lcgInterior32 = lcgInterior.map(v => v%32);
  const lcgPerimeter32 = lcgPerimeter.map(v => v%32);

  const neededMinus = cipher.map((v,i) => mod(v-plain[i],29));
  const neededPlus = cipher.map((v,i) => mod(plain[i]-v,29));
  const neededXor = cipher.map((v,i) => v ^ plain[i]);

  const p55RowMinus = p55.map((v,i) => mod(v-rowPerimeter29[i],29));
  const p55RowPlus = p55.map((v,i) => mod(v+rowPerimeter29[i],29));
  const p55LcgMinus = p55.map((v,i) => mod(v-lcgPerimeter29[i],29));
  const p55LcgPlus = p55.map((v,i) => mod(v+lcgPerimeter29[i],29));
  const p55RowXor = p55.map((v,i) => v ^ rowPerimeter32[i]);
  const p55LcgXor = p55.map((v,i) => v ^ lcgPerimeter32[i]);

  // LCG state indices, filtered by geometry, as a transposition permutation.
  const perimeterRank = new Map(perimeter.map((cell,i) => [cell,i]));
  const interiorRank = new Map(interior.map((cell,i) => [cell,i]));
  const perimeterPermutation = lcgPerimeterCells.map(cell => perimeterRank.get(cell));
  const interiorPermutation = lcgInteriorCells.map(cell => interiorRank.get(cell));
  const perimeterInverse = invert(perimeterPermutation);
  const interiorInverse = invert(interiorPermutation);
  const p55Forward = apply(p55,perimeterPermutation);
  const p55Inverse = apply(p55,perimeterInverse);
  const innerForward = apply(cipher,interiorPermutation);
  const innerInverse = apply(cipher,interiorInverse);

  const valueModulo76Unique = new Set(lcgPerimeter.map(v => v%76)).size;
  const valueModulo180Unique = new Set(lcgInterior.map(v => v%180)).size;
  const results = {
    source:{a,c,seed,payload,payloadIndices,payloadInteger:payloadInteger.toString()},
    geometry:{perimeter:perimeter.length,interior:interior.length},
    directStreams:{
      rowInteriorPlainMatches:matchCount(rowInterior29,plain),
      lcgInteriorPlainMatches:matchCount(lcgInterior29,plain),
      lcgInteriorCipherMatches:matchCount(lcgInterior29,cipher),
      lcgInteriorCminusPMatches:matchCount(lcgInterior29,neededMinus),
      lcgInteriorPminusCMatches:matchCount(lcgInterior29,neededPlus),
    },
    additivePerimeter:{
      rowMajor:{minus:textOf(p55RowMinus,corpus.translit),plus:textOf(p55RowPlus,corpus.translit)},
      lcg:{minus:textOf(p55LcgMinus,corpus.translit),plus:textOf(p55LcgPlus,corpus.translit)},
    },
    xorPad:{
      rowInteriorRequiredMatches:matchCount(rowInterior32,neededXor),
      lcgInteriorRequiredMatches:matchCount(lcgInterior32,neededXor),
      rowPerimeterInvalid:p55RowXor.filter(v => v>28).length,
      lcgPerimeterInvalid:p55LcgXor.filter(v => v>28).length,
    },
    indexPermutation:{
      perimeterUnique:new Set(perimeterPermutation).size,
      interiorUnique:new Set(interiorPermutation).size,
      p55Forward:textOf(p55Forward,corpus.translit),
      p55Inverse:textOf(p55Inverse,corpus.translit),
      innerForwardPlainMatches:matchCount(innerForward,plain),
      innerInversePlainMatches:matchCount(innerInverse,plain),
      innerForwardCipherMatches:matchCount(innerForward,cipher),
      innerInverseCipherMatches:matchCount(innerInverse,cipher),
    },
    rawValuePositionControls:{
      perimeterUniqueModulo76:valueModulo76Unique,
      interiorUniqueModulo180:valueModulo180Unique,
    },
  };

  assert.deepEqual(results.directStreams, {
    rowInteriorPlainMatches:6,
    lcgInteriorPlainMatches:8,
    lcgInteriorCipherMatches:10,
    lcgInteriorCminusPMatches:7,
    lcgInteriorPminusCMatches:6,
  });
  assert.deepEqual(results.xorPad, {
    rowInteriorRequiredMatches:6,
    lcgInteriorRequiredMatches:7,
    rowPerimeterInvalid:7,
    lcgPerimeterInvalid:8,
  });
  assert.deepEqual(results.indexPermutation, {
    perimeterUnique:76,
    interiorUnique:180,
    p55Forward:"OEATHXGEOEADIWDSCEAIXEIAEOEFAEILCGUUMUTHDEOFXMEAENGIAEEOXCCMTHPSSAEBEBNGHJSIWBSHISMGFTHEOBRBPCM",
    p55Inverse:"SWEOAETHGGFIEOFFXCINGAAEEHISJGMUIOECUDBEDBSEAEAPIAEMDTHBEAXSBXRILWECCHMEOIASCNGEOTHTHMEBEOSXUPM",
    innerForwardPlainMatches:7,
    innerInversePlainMatches:10,
    innerForwardCipherMatches:9,
    innerInverseCipherMatches:9,
  });
  assert.deepEqual(results.rawValuePositionControls, {
    perimeterUniqueModulo76:51,
    interiorUniqueModulo180:106,
  });
  assert.equal(results.additivePerimeter.lcg.minus,
    "SEIDAXWAEXCLUMDPLFFRYSHCJTHASJFWMLNFLMEOAEYEOHEOACOETTHJISBAEBNSYOEEOCNGEOTHRGRFTPEOSAENGHEAEOU");
  assert.equal(results.additivePerimeter.lcg.plus,
    "IAOEAYMTIAOAAERJIAIHNAEMUPTGODAECPNNALGWPLCYCLPEBIJTHDOEAEBNGOTJOSIHEOEAEOAEAFNGIARAEIAPNGUDGAM");
  return results;
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {run};
