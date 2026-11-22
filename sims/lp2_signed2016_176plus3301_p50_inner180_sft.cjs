/**
 * LP2 original p50 interior180 versus source-signed 2016 native-GP176+3301.
 * Hypothesis gate: literal 180-place source-selected stream, at physical origin.
 * Four natural signed-additive inverses only, fully reproducible Node22 CJS.
 */
"use strict";

const fs = require("node:fs");
const assert = require("node:assert/strict");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const load = (p) => fs.readFileSync(path.join(root, p), "utf8");
const original = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(load("resources/liber-primus/lp2-grid-256.json"));
const signed = load("resources/historical/cicada2016-4gq25-outguess.asc");
const gibran = load("resources/control/gibran_prophet_58585.txt");
const lp1 = load("resources/liber-primus/lp1-plaintext-reference.txt");
const tokens = original.translit
  .map((t, i) => ({t, i})).sort((a,b) => b.t.length - a.t.length);
const ligature = ["ING","TH","NG","EO","OE","AE","IA","EA"];

/** @param {string} text @returns {number[]} */
function toGP(text) {
  const words = (text.toUpperCase().match(/[A-Z]+/g) || []).map((s) =>
    s.replaceAll("V","U").replaceAll("K","C").replaceAll("Z","S").replaceAll("Q","CW"));
  const output = [];
  for (const w of words) {
    for (let i = 0; i < w.length;) {
      const trig = ligature.find((s) => w.startsWith(s,i));
      const segment = trig === "ING" ? "NG" : trig || w[i];
      const t = tokens.find((row) => row.t === segment);
      assert.ok(t, "Unrepresentable GP symbol " + segment + " in " + w);
      output.push(t.i);
      i += trig ? trig.length : 1;
    }
  }
  return output;
}

const signedStart = signed.indexOf("Hash: SHA1");
const signatureStart = signed.indexOf("-----BEGIN PGP SIGNATURE-----");
assert(signedStart >= 0 && signatureStart > signedStart);
const clear = signed.slice(signedStart + "Hash: SHA1".length, signatureStart)
  .replace(/\b3301\b/g,"").replace(/\b7A35090F\b/g,"");
const clearWords = clear.match(/[A-Z]+/gi) || [];
assert.equal(clearWords.length,43,"Source-signed 43 alphabetic words");
const key176 = toGP(clear);
assert.equal(key176.length,176,"Source-signed 2016 body has 176 native GP signs");
const signedKey180 = [...key176, 3,3,0,1];
assert.equal(signedKey180.length,180);

const clearP57 = "PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE";
assert.deepEqual(toGP(clearP57), original.pages[57].indices, "Exact p57 95-rune source-native positive");
const control = toGP(clearP57+" "+clearP57).slice(0,180);
const adjacentKnownOriginal = [...original.pages[56].indices, ...original.pages[57].indices];
assert.equal(adjacentKnownOriginal.length,180);
assert.equal(control.length,180);

assert.equal(table.pages.flatMap((p)=>p.bytes).length,256);
const full = table.pages.flatMap((p)=>p.bytes);
const inside = [];
for (let y=1; y<31; y++) for(let x=1; x<7; x++) inside.push(full[y*8+x]);
assert.equal(inside.length,180);
const insideByColumns = Array.from({length:180},(_,i)=> inside[(i%30)*6+Math.floor(i/30)]);

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const h=new Array(29).fill(0);
  for (const v of values) { assert.ok(Number.isInteger(v)&&v>=0&&v<29); h[v]++; }
  return h.reduce((sum,n)=>sum+n*(n-1),0)/(values.length*(values.length-1));
}

/** @param {number[]} values @returns {Float64Array} */
function train(values) {
  const tri=new Float64Array(29*29*29),bi=new Float64Array(29*29);
  for(let i=2;i<values.length;i++){
    const a=values[i-2]*29+values[i-1];
    tri[a*29+values[i]]++;bi[a]++;
  }
  const log=new Float64Array(tri.length);
  for(let i=0;i<log.length;i++)log[i]=Math.log((tri[i]+0.25)/(bi[Math.floor(i/29)]+29*0.25));
  return log;
}

/** @param {number[]} values @param {Float64Array} log @returns {number} */
function score(values,log) {
  let sum=0;
  for(let i=2;i<values.length;i++)sum+=log[(values[i-2]*29+values[i-1])*29+values[i]];
  return sum/(values.length-2);
}

const gibranWords = gibran.match(/[a-zA-Z]+/g) || [];
const gibranWordCounts = gibranWords.map((w)=>toGP(w).length);
let exact176Windows=0;
let running43 = gibranWordCounts.slice(0,43).reduce((a,b)=>a+b,0);
for(let i=0;i+43<=gibranWordCounts.length;i++) {
  if(i>0)running43+=gibranWordCounts[i+42]-gibranWordCounts[i-1];
  if(running43===176) exact176Windows++;
}
const gibran43Windows = gibranWordCounts.length-42;
console.log("LENGTH_NULL "+JSON.stringify({
  nativeSourceWords:43,signedReneLength:176,numericDigits:4,p50InteriorCells:180,
  gibran43WordWindows:gibran43Windows,gibranExact176:exact176Windows,
  fraction:gibran43Windows ? exact176Windows/gibran43Windows : 0
}));

const reference=toGP(gibran);
const model=train(reference);
const controls=[];
for(let i=0;i+180<=reference.length;i+=13) controls.push(score(reference.slice(i,i+180),model));
const lp1ref = toGP(lp1.split("### 56")[0].split(/\r?\n/).filter(line=>
  !line.trimStart().startsWith("#") && !line.trimStart().startsWith("[")).join(" "));
const lp1Score=score(lp1ref.slice(0,180),model);
controls.sort((a,b)=>a-b);

console.log("PASS authentic GP transliteration p57 95/95; signed words="+clearWords.length+
  " nativeRunes="+key176.length+" plus digit3301(4)="+signedKey180.length);
console.log("PASS printed p50 32x8 perimeter76 interior180; independent solved p57 native GP plant=180");
console.log("NATIVE_CONTROL "+JSON.stringify({
  gibranWindows:controls.length,gibranMin:controls[0],
  gibran05:controls[Math.floor(controls.length*0.05)],
  gibranMedian:controls[Math.floor(controls.length*0.5)],
  independentLP1First180:lp1Score,
  solvedP57Tiled180:score(control,model),
}));
const results = [];
for (const [order, bytes] of [["original-row-major",inside],["original-column-major",insideByColumns]]) {
  for (const sign of [-1,1]) {
    const candidate=bytes.map((b,i)=>((b %29)+sign*signedKey180[i]+29)%29);
    const replay=candidate.map((p,i)=>(p-sign*signedKey180[i]+29)%29);
    assert.deepEqual(replay,bytes.map(v=>v%29),"Exact residue re-encode "+order+" "+sign);
    const planted=control.map((p,i)=>(p-sign*signedKey180[i]+29)%29);
    const decoded=planted.map((c,i)=>(c+sign*signedKey180[i]+29)%29);
    assert.deepEqual(decoded,control,"Exact 180/180 authentic GP29 plant "+order+" "+sign);
    let adjacentExactMatches = 0;
    let firstAdjacentMismatch = -1;
    for(let i=0;i<180;i++)if(candidate[i]===adjacentKnownOriginal[i]) adjacentExactMatches++;
    else if(firstAdjacentMismatch===-1) firstAdjacentMismatch=i;
    assert.ok(firstAdjacentMismatch>=0);
    const rec={order,sign,ioc:ioc(candidate),trigram:score(candidate,model),
      adjacentPrintedP56P57ExactPositions:adjacentExactMatches,firstAdjacentMismatch,
      percentileAmongGibran:controls.filter(x=>x<=score(candidate,model)).length/controls.length,
      first32: candidate.slice(0,32).map(v=>original.translit[v]).join(".")};
    results.push(rec);
    console.log("ORIGINAL_RESULT "+JSON.stringify(rec));
  }
}
console.log("SUMMARY "+JSON.stringify({
  authenticSignedAlphabeticWords:43,authenticSignedNativeGP:176,isolatedSignedDigits:"3301",digitCount:4,
  sourceSelectedHypothesis:"signed GP176 plus numeric3301 as a one-to-one 180-symbol additive key",
  receiver:"p50 rectangle strict interior 30x6=180, original base60 bytes modulo29",
  models:4,positive:"all four 180/180 original solved p57 native GP plants",
  nativeControls:controls.length,
  exactKnownAdjacentP56P57Matches:results.map(x=>x.adjacentPrintedP56P57ExactPositions),
  bestModel:results.slice().sort((a,b)=>b.trigram-a.trigram)[0],
  unknownPlaintextRecovered:false,
}));
