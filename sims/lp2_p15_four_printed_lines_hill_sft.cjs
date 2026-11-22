"use strict";

/**
 * Issue #775. One frozen original p15 source selector: four printed rune
 * lines immediately following the 4x4 square, column-aligned from left.
 * Exactly four reversible matrix conventions. No page/register/offset scans.
 *
 * Node.js 22 CJS SFT; source-native GP29 Shakespeare held-out LP1 controls.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} =
  require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.join(__dirname, "..");
const read = filename => fs.readFileSync(path.join(root, filename),"utf8")
  .replace(/\r\n/g,"\n");
const source = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const index = new Map(source.runes.map((rune,i) => [rune,i]));
const master = read("resources/transcriptions/liber_primus_master.txt");
const lp2Page15 = master.split("%")[31];
const marker =
  "3258-3222-3152-3038/\n" +
  "3278-3299-3298-2838/\n" +
  "3288-3294-3296-2472/\n" +
  "4516-1206-708-1820/";
assert.equal(lp2Page15.split(marker).length,2,
  "original physical LP2 p15 numerical square must occur once");
const afterSquare=lp2Page15.split(marker)[1];
assert.ok(afterSquare.includes("\n&\n$\n"),"original paragraph break");
const printed = afterSquare.split("\n&\n$\n")[1].split("/");
const runeLines = printed.filter(line => [...line].some(c=>index.has(c)))
  .map(line => [...line].filter(c=>index.has(c)).map(c=>index.get(c)));
assert.deepEqual(runeLines.map(x=>x.length),[21,17,22,23,23,22,22]);

// The canonical corpus has nine page-title runes preceding the square.
// All 150 original body runes following the square must match exactly.
const canonicalP15=source.pages.find(page=>page.page===15).indices;
assert.equal(canonicalP15.length,159);
assert.deepEqual(runeLines.flat(),canonicalP15.slice(9));
const laneLen=Math.min(...runeLines.slice(0,4).map(x=>x.length));
assert.equal(laneLen,17);
const lanes=runeLines.slice(0,4).map(line=>line.slice(0,laneLen));
assert.equal(lanes.flat().length,68);
const remainderCount=canonicalP15.length-68;
assert.equal(remainderCount,91); // 9 title, 15 first-line tails, 67 subsequent-line symbols

const M=[
  [3258,3222,3152,3038],
  [3278,3299,3298,2838],
  [3288,3294,3296,2472],
  [4516,1206,708,1820]
];
const inv=[
  [19,1,6,3],
  [11,7,8,22],
  [2,10,15,28],
  [25,4,1,15]
];
const mod=n=>((n%29)+29)%29;
const transpose=matrix=>matrix.map((_,j)=>matrix.map(row=>row[j]));
function apply(matrix,streams) {
  assert.equal(streams.length,4);
  assert(streams.every(s=>s.length===laneLen));
  return Array.from({length:4},(_,i)=>
    Array.from({length:laneLen},(_,t)=>
      mod(matrix[i].reduce((sum,a,k)=>sum+a*streams[k][t],0))));
}
for(let i=0;i<4;i++)for(let j=0;j<4;j++)
  assert.equal(mod(M[i].reduce((sum,a,k)=>sum+a*inv[k][j],0)),i===j?1:0);

// Author-independent GP29 linguistic scorer and original-author control.
const shakespeare=encodeSourceNativeGP(read("resources/control/shakespeare_first300k.txt"));
assert.equal(shakespeare.length,217106);
const bi=new Int32Array(29*29),tri=new Int32Array(29*29*29);
for(let i=2;i<shakespeare.length;i++){
  const b=29*shakespeare[i-2]+shakespeare[i-1];
  bi[b]++;
  tri[29*b+shakespeare[i]]++;
}
function score(seq) {
  let total=0;
  for(let i=2;i<seq.length;i++){
    const b=29*seq[i-2]+seq[i-1];
    total+=Math.log((tri[29*b+seq[i]]+1)/(bi[b]+29));
  }
  return total/(seq.length-2);
}
const nativeLP1=read("resources/transcriptions/lp1_wulfic_canonical.txt")
  .split("%");
const authorClearPages=[3,8,9,10,11,14].map(p=>
  [...nativeLP1[p]].filter(c=>index.has(c)).map(c=>index.get(c)));
assert.deepEqual(authorClearPages.map(p=>p.length),[157,187,207,192,169,89]);
const sourcePositive=authorClearPages.slice(0,4).map(p=>p.slice(0,laneLen));
assert.deepEqual(apply(inv,apply(M,sourcePositive)),sourcePositive);
assert.deepEqual(apply(transpose(inv),apply(transpose(M),sourcePositive)),sourcePositive);
const authorScore=authorClearPages.reduce((sum,p)=>
  sum+(p.length-2)*score(p),0)/
  authorClearPages.reduce((sum,p)=>sum+p.length-2,0);
const translit=arr=>arr.map(j=>source.translit[j]).join(" ");
const variants=[
  ["M^-1",inv],
  ["(M^-1)^T",transpose(inv)],
  ["M",M],
  ["M^T",transpose(M)]
];
const result=variants.map(([operation,matrix])=>{
  const output=apply(matrix,lanes);
  // Matrix output has exact original printed-line rune count only; preserve
  // the other 91 source runes, no padding and no guessed tail carry.
  assert.equal(output.flat().length+remainderCount,canonicalP15.length);
  return {
    operation,
    scorePerLine:output.map(score),
    mean:output.reduce((sum,line)=>sum+score(line),0)/4,
    output:output.map(translit)
  };
});
const raw=lanes.map(score);
console.log(JSON.stringify({
  source:"original LP2 physical p15, first four printed runic lines after original numerical square",
  pageOriginalRunes:canonicalP15.length,
  bodyLines:runeLines.map(line=>line.length),
  fourNativeColumns:laneLen,
  transformedRunes:4*laneLen,
  untouchedRemainderRunes:remainderCount,
  exactMatrixInverseNativePlant:4*laneLen,
  originalAuthorClearLP1Score:authorScore,
  shakespeareTrainingScore:score(shakespeare),
  rawLineScores:raw,
  rawLines:lanes.map(translit),
  candidates:result,
  recoveredPlaintext:result.some(x=>x.mean>-3.1)
},null,2));
assert(result.every(x=>x.mean<-3.3),"new possible original source-native plaintext warrants inspection");
