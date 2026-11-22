'use strict';

/**
 * SFT: examine the 128+128 glyph layout selected by the two original
 * LP2 moth illustrations and p54's enlarged red A, versus the 32x8 table.
 * Reversible direct GP29 byte-residue gate; no plaintext/key claim.
 *
 * Run: node sims/lp2_moth128_red51_terminal256_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = read('lp2-corpus.json');
const grid = read('lp2-grid-256.json');
const ink = read('lp2-ink-annotations.json');
const get = (p) => corpus.pages[p].indices;
const p53 = get(53);
const p54 = get(54);
const p55 = get(55);
const mark53 = ink.pages.find((p) => p.page === 53).red_spans;
const mark54 = ink.pages.find((p) => p.page === 54).red_spans;
const mod = (v) => ((v % 29) + 29) % 29;
const ioc = (xs) => {
  const counts = Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (xs.length * (xs.length - 1));
};
const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

assert.deepEqual([p53.length, p54.length, p55.length], [179, 232, 76]);
assert.equal(mark53.length, 1);
assert.deepEqual([mark53[0].start, mark53[0].length], [128, 51]);
assert.deepEqual([mark54[0].start, mark54[0].length], [0, 9]);
assert.equal(p54[0], 24); // ᚪ, GP A: an enlarged original red drop capital
assert.equal(grid.bytes.length, 256);
assert.equal(grid.pages.reduce((sum, page) => sum + page.bytes.length, 0), 256);
assert.equal(sha256(Buffer.from(grid.bytes)),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

for (const [p, expected] of [
  [70, '4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548'],
  [71, 'dbc2cfca46a150689e60ea83015dcd54ace81245711fefe114d6076b96412ec4'],
  [72, 'a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba'],
]) {
  assert.equal(sha256(fs.readFileSync(path.join(root, String(p) + '.jpg'))), expected);
}

// The two moth-bearing pages supply 179+76 glyphs. Add only the
// oversized p54 A, which is independently visually distinguished.
const halfBlack = p53.slice(0, 128);
const halfOther = [...p53.slice(128), p54[0], ...p55];
assert.deepEqual([halfBlack.length, halfOther.length], [128, 128]);
const carrier = [...halfBlack, ...halfOther];
assert.equal(carrier.length, 256);
const equalityCount = halfBlack.filter((x, i) => x === halfOther[i]).length;
assert.equal(equalityCount, 2);

const native = get(57);
assert.equal(native.length, 95);
const plant = Array.from({ length: 256 }, (_, i) => native[i % native.length]);
const result = { source: {
  input: 'p53[0:179] + p54[0] + p55[0:76]', glyphs: carrier.length,
  black: 128, other: 128, paired_equal: equalityCount,
  grid_cells: 256, raw_ioc: ioc(carrier),
}, candidates: [] };

for (const sign of [-1, 1]) {
  const key = grid.bytes.map((byte) => byte % 29);
  const decrypt = (ct) => ct.map((c, i) => mod(c + sign * key[i]));
  const encrypt = (plain) => plain.map((p, i) => mod(p - sign * key[i]));
  const output = decrypt(carrier);
  assert.deepEqual(encrypt(output), carrier);
  assert.deepEqual(decrypt(encrypt(plant)), plant);
  const entry = {
    sign, decoded_ioc: ioc(output),
    p53_ioc: ioc(output.slice(0, 179)),
    p55_ioc: ioc(output.slice(180)),
    p54_first_decoded_gp_index: output[179],
    first40_gp: output.slice(0, 40).map((v) => corpus.translit[v]).join(' '),
    plant_exact: true,
  };
  result.candidates.push(entry);
}
assert(Math.abs(result.candidates[0].decoded_ioc - 0.03425245098039216) < 1e-12);
assert(Math.abs(result.candidates[1].decoded_ioc - 0.0328125) < 1e-12);

/**
 * Independent proposed p56-known-hash attack: the same 128+rune black
 * ink carrier and 128+rune opposite carrier are aligned with 128 HEX
 * DIGITS printed on solved p56. Treat each hex digit's numeric 0..15
 * value as a GP29 known plaintext rune; recover every individual secret
 * additive shift from black p53, and use exactly the same shifts on the
 * other half, including all 76 unknown p55 runes, without word fitting.
 *
 * There is no Cicada-source instruction selecting this mixed encoding.
 * The calculation is an actual full plaintext candidate that can be
 * decisively judged on untouched p55 rather than via fitted keys.
 */
const hash128 = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
assert.equal(hash128.length,128);
const known = Array.from(hash128, digit => parseInt(digit,16));
assert.equal(known.length,halfBlack.length);
const inferredShift = halfBlack.map((c,i)=>mod(c-known[i]));
const predictedOther = halfOther.map((c,i)=>mod(c-inferredShift[i]));
const roundtripSecond = predictedOther.map((p,i)=>mod(p+inferredShift[i]));
assert.deepEqual(roundtripSecond,halfOther);
assert.deepEqual(known.map((p,i)=>mod(p+inferredShift[i])),halfBlack);
// A fresh 128-rune GP native-language source positive must recover
// identically, with no tuning or threshold applied to the original.
const plantedOther = Array.from({length:128},(_,i)=>native[i%native.length]);
const plantedCipher = plantedOther.map((p,i)=>mod(p+inferredShift[i]));
assert.deepEqual(plantedCipher.map((c,i)=>mod(c-inferredShift[i])),plantedOther);
const sourceHashCrib={
  hashDigits:known.length,
  recoveredKeySymbols:inferredShift.length,
  reconstructedSecond:predictedOther.length,
  reconstructedP55:predictedOther.slice(52).length,
  recoveredOtherIoc:ioc(predictedOther),
  recoveredP55Ioc:ioc(predictedOther.slice(52)),
  originalP55Ioc:ioc(p55),
  p55First43:predictedOther.slice(52,95).map(i=>corpus.translit[i]).join(''),
  originalP55Reencoded:true, plantedExact128:true
};
assert.ok(Math.abs(sourceHashCrib.recoveredOtherIoc-0.033710629921259845)<1e-12);
assert.ok(Math.abs(sourceHashCrib.recoveredP55Ioc-0.03368421052631579)<1e-12);
assert.equal(sourceHashCrib.reconstructedP55,76);
result.p56HashKnownPlaintextReuse=sourceHashCrib;

/**
 * Three independently printed 128-position records:
 * p53 black GP runes, the middle 68+60 of the original 32x8 table,
 * and p56's 128 literal hexadecimal digits. Fully determine 128
 * target values; a direct byte-mod29 additive key must hit every one.
 */
function sourceRing(depth) {
  const result=[];
  const t=depth,b=31-depth,l=depth,r=7-depth;
  for(let x=l;x<=r;x++)result.push(t*8+x);
  for(let y=t+1;y<=b;y++)result.push(y*8+r);
  for(let x=r-1;x>=l;x--)result.push(b*8+x);
  for(let y=b-1;y>t;y--)result.push(y*8+l);
  return result;
}
function ringDirection(depth, corner, direction) {
  const ring=sourceRing(depth);
  const w=8-2*depth, h=32-2*depth;
  const start=[0,w-1,w+h-2,2*w+h-3][corner];
  return ring.map((_,i)=>ring[((start+direction*i)%ring.length+ring.length)%ring.length]);
}
let allSource128=0,best3way=0;
let natural3way=null;
for(let a=0;a<4;a++)for(const ad of [1,-1])
  for(let b=0;b<4;b++)for(const bd of [1,-1]) {
    const ring128=ringDirection(1,a,ad).concat(ringDirection(2,b,bd));
    assert.equal(ring128.length,128);
    const pad=ring128.map(i=>grid.bytes[i]%29);
    const plus=halfBlack.reduce((sum,x,i)=>sum+(mod(x+pad[i])===known[i]),0);
    const minus=halfBlack.reduce((sum,x,i)=>sum+(mod(x-pad[i])===known[i]),0);
    best3way=Math.max(best3way,plus,minus);
    if(a===0&&ad===1&&b===0&&bd===1)
      natural3way={add:plus,subtract:minus};
    allSource128++;
  }
assert.equal(allSource128,64);
assert.deepEqual(natural3way,{add:3,subtract:3});
assert.equal(best3way,10);
const originalPad=ringDirection(1,0,1).concat(ringDirection(2,0,1))
  .map(i=>grid.bytes[i]%29);
const plantedKnownCipher=known.map((p,i)=>mod(p+originalPad[i]));
assert.deepEqual(plantedKnownCipher.map((c,i)=>mod(c-originalPad[i])),known);
result.p50Middle128MothBlackHashKnownDigit={
  routeCount:allSource128,
  expected:128,
  natural:natural3way,
  bestAcrossBothSigns:best3way,
  plantRecovered:128
};


console.log(JSON.stringify(result, null, 2));
