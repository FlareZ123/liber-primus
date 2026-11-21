"use strict";

/**
 * LP2 p0–p2 Peano-curve readout, original-cipher one-step prime/totient gate.
 * Run: node sims/lp2_p0_27square_peano_p56_phi_sft.cjs
 * Dependencies: Node.js stdlib only and committed original-input resources.
 *
 * The source supplies a 27x27 square, but does not explicitly name Peano.
 * This test is a conditional candidate, not a decipherment claim.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const reference = fs.readFileSync(path.join(root,
  "resources", "liber-primus", "lp1-plaintext-reference.txt"), "utf8");
const alphabet = corpus.translit.map((token, index) => [token,index])
  .sort((a,b) => b[0].length-a[0].length);

/** @param {string} s @returns {number[]} */
function encodeGp(s) {
  const out = [];
  for (let word of s.match(/[A-Z]+/g) || []) {
    word = word.replace(/V/g, "U").replace(/K/g, "C").replace(/Q/g, "C");
    for (let i=0;i<word.length;) {
      const item = alphabet.find(([token]) => word.startsWith(token,i));
      assert.ok(item, "invalid source word: "+word);
      out.push(item[1]);
      i += item[0].length;
    }
  }
  return out;
}

/** @param {number} length @returns {number[]} */
function primeList(length) {
  const out = [];
  for (let x=2;out.length<length;x++) {
    let prime = true;
    for (let j=2;j*j<=x;j++) if(x%j===0) {prime=false;break}
    if(prime) out.push(x);
  }
  return out;
}

const initial = corpus.pages.filter(p=>p.page<=2).flatMap(p=>p.indices);
assert.equal(initial.length,729);
const phiShift = primeList(729).map(prime=>(prime-1)%29);

// Independent positive control: exact solved p56, literal F only at pos56.
const p56 = corpus.pages.find(p=>p.page===56).indices;
const expected = encodeGp(
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO "+
  "IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
let primeCursor=0;
const solved = p56.map((v,i)=>i===56?0:
  (v-phiShift[primeCursor++]+29)%29);
assert.deepEqual(solved,expected);
assert.equal(solved.length,85);

// Fit a smoothed 29x29 GP bigram reference exclusively from solved LP1,
// withholding p56 and p57 from training. The Latin reference is normalized to
// the 29-rune GP orthography before counting.
const lines = reference.split("### 56")[0].split(/\r?\n/)
  .filter(line=>/^[A-Z][A-Z ,;.!?"':\-]+$/.test(line)
    && !/\[[^\]]*\]/.test(line));
const train = lines.flatMap(encodeGp);
assert.equal(lines.length,88);
assert.equal(train.length,2397);
const counts=Array.from({length:29},()=>Array(29).fill(.5));
const total=Array(29).fill(14.5);
for(let i=1;i<train.length;i++){counts[train[i-1]][train[i]]++;total[train[i-1]]++}
const bigramLog=counts.map((row,i)=>row.map(v=>Math.log(v/total[i])));

/** @param {number[]} sequence @returns {number} */
function score(sequence) {
  let sum=0;
  for(let i=1;i<sequence.length;i++) sum+=bigramLog[sequence[i-1]][sequence[i]];
  return sum/(sequence.length-1);
}
const solvedScore=score(solved);
assert.ok(solvedScore > -3, "positive-control n-gram reading");

// Peano (1890) 3x3 L-system, third-order traversal visits every lattice point.
const rules={X:"XFYFX+F+YFXFY-F-XFYFX",Y:"YFXFY-F-XFYFX+F+YFXFY"};
let expansion="X";
for(let k=0;k<3;k++) expansion=[...expansion].map(c=>rules[c]||c).join("");
let cell=[0,0],direction=[1,0];
const vertices=[[0,0]];
for(const ch of expansion) {
  if(ch==="F") {
    cell=[cell[0]+direction[0],cell[1]+direction[1]];
    vertices.push(cell);
  } else if(ch==="+") direction=[-direction[1],direction[0]];
  else if(ch==="-") direction=[direction[1],-direction[0]];
}
assert.equal(vertices.length,729);
assert.equal(new Set(vertices.map(p=>p.join(","))).size,729);
assert.equal(Math.max(...vertices.map(p=>p[0])),26);
assert.equal(Math.max(...vertices.map(p=>p[1])),26);

const d4=[
  [0,1,1,0],[0,1,-1,0],[0,-1,1,0],[0,-1,-1,0],
  [1,0,0,1],[1,0,0,-1],[-1,0,0,1],[-1,0,0,-1]
];
/** @param {number[]} point @param {number[]} m @returns {number} */
function remap(point,m) {
  const [r,c]=point;
  const row=m[0]===0?(m[1]===1?c:26-c):(m[0]===1?r:26-r);
  const col=m[2]===0?(m[3]===1?c:26-c):(m[2]===1?r:26-r);
  return row*27+col;
}
let paths=[];
for(const m of d4) {
  const path=vertices.map(p=>remap(p,m));
  paths.push(path,[...path].reverse());
}
paths=[...new Map(paths.map(p=>[p.join(","),p])).values()];
assert.equal(paths.length,8);

/**
 * @param {number[]} order @param {number} offset
 * @param {boolean} literalF
 * @returns {number[]}
 */
function decrypt(order,offset,literalF) {
  let key=0;
  return order.map(pos=>{
    const x=initial[(pos+offset)%729];
    return literalF&&x===0?0:(x-phiShift[key++]+29)%29;
  });
}

let observed=null;
const rotationBest=[];
for(let offset=0;offset<729;offset++) {
  let best={score:-Infinity,path:-1,literalF:false};
  for(let i=0;i<paths.length;i++) {
    for(const literalF of [false,true]) {
      const value=score(decrypt(paths[i],offset,literalF));
      if(value>best.score) best={score:value,path:i,literalF};
    }
  }
  if(offset===0) observed=best;
  rotationBest.push(best.score);
}
assert.ok(observed);
const rank=rotationBest.filter(v=>v>=observed.score).length;
const sorted=[...rotationBest].sort((a,b)=>a-b);
const excerpt=decrypt(paths[observed.path],0,observed.literalF)
  .slice(0,80).map(i=>corpus.translit[i]).join("");
assert.equal(rank,109);
assert.ok(Math.abs(observed.score-(-3.916200497897158))<1e-9);
assert.ok(Math.abs(solvedScore-(-2.699923))<1e-5);
process.stdout.write(JSON.stringify({
  source:"original LP2 pp0-2; solved LP1 language control; solved LP2 p56",
  sourceRunes:initial.length,
  trainedGpRunes:train.length,
  uniquePeanoPaths:paths.length,
  fullVariants:paths.length*2,
  heldOutP56Correct:true,
  heldOutP56BigramScore:solvedScore,
  bestOriginalPath:observed,
  rotationRanksAtLeastAsHigh:rank,
  rotations:rotationBest.length,
  rotationFraction:rank/rotationBest.length,
  medianCyclicRotationScore:sorted[364],
  bestTransliteration80:excerpt,
  recoveredUnknownPagePlaintext:false
},null,2)+"\n");
}

