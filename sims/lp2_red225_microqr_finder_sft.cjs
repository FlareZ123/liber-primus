"use strict";
/**
 * Does the exact set of 225 LP2 red GP runes form a 15x15 Micro QR M3
 * bitmap under ANY global assignment of one binary bit to each rune?
 * Necessary-finder-pattern gate under row/column serial and serpentine
 * readings, all 8 mirror/rotation transforms.
 *
 * Node.js 22/CommonJS, no dependencies or writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const load = file => JSON.parse(fs.readFileSync(
  path.join(ROOT, file), "utf8"));
const ink = load("resources/liber-primus/lp2-ink-annotations.json");
const corpus = load("resources/liber-primus/lp2-corpus.json");
const lookup = new Map(corpus.runes.map((r,i)=>[r,i]));
const RED = ink.pages.flatMap(p => (p.red_spans || []).flatMap(s =>
  [...s.runes].map(r=>lookup.get(r))));
assert.equal(RED.length,225);
assert.ok(RED.every(v=>Number.isInteger(v)&&v>=0&&v<29));
const SIDE = 15, FINDER = 7;
/**
 * Treat chronological 225 red runes as module codes in a 15x15 square.
 * mode0 row-major, mode1 column-major, mode2 row serpentine,
 * mode3 column serpentine; each source label occupies exactly one cell.
 * @param {number[]} input
 * @param {number} mode
 * @returns {Int16Array[]}
 */
function matrix(input,mode) {
  const out = Array.from({length:SIDE},()=>new Int16Array(SIDE));
  for(let i=0;i<225;i++) {
    let r=Math.floor(i/SIDE),c=i%SIDE;
    if(mode===1) [r,c]=[c,r];
    if(mode===2 && (r&1)) c=SIDE-1-c;
    if(mode===3) {
      const oldCol=c,oldRow=r;
      r=(oldCol&1)?SIDE-1-oldRow:oldRow;
      c=oldCol;
    }
    out[r][c]=input[i];
  }
  return out;
}
/**
 * 8 symmetries of a square: optional flip then 0,90,180,270 rotations.
 * @param {Int16Array[]} m
 * @param {number} r
 * @param {number} c
 * @param {number} orient
 * @returns {number}
 */
function glyph(m,r,c,orient) {
  if(orient&1)c=SIDE-1-c;
  for(let k=0;k<(orient>>1);k++) [r,c]=[c,SIDE-1-r];
  return m[r][c];
}
/** Known fixed 7x7 Micro QR finder: dark/light/dark concentric rings. */
function fixedFinderBit(r,c) {
  const d=Math.min(r,c,FINDER-1-r,FINDER-1-c);
  return d===1?0:1;
}
/**
 * Minimize required disagreements over ALL 2^29 independent rune bits:
 * for each rune, one global bit can satisfy at most its majority colour.
 * The 29 assignments optimize independently, so this is the EXACT
 * optimal value without enumerating 536,870,912 possible binary maps.
 *
 * @param {number[]} red
 * @param {number} mode
 * @param {number} orient
 * @returns {number}
 */
function minWrong(red,mode,orient) {
  const m=matrix(red,mode);
  const hist=Array.from({length:29},()=>[0,0]);
  for(let r=0;r<FINDER;r++)for(let c=0;c<FINDER;c++) {
    hist[glyph(m,r,c,orient)][fixedFinderBit(r,c)]++;
  }
  return hist.reduce((acc,[light,dark])=>acc+Math.min(light,dark),0);
}
function bestScore(red) {
  let best={minWrong:49,mode:-1,orient:-1};
  for(let mode=0;mode<4;mode++)
  for(let orient=0;orient<8;orient++) {
    const score=minWrong(red,mode,orient);
    if(score<best.minWrong)best={minWrong:score,mode,orient};
  }
  return best;
}
function controls() {
  // 1,000 whole-inventory shuffles preserve exact 225-rune histogram.
  let seed=0x3301225;
  const rand=()=> {
    seed ^= seed<<13; seed ^= seed>>>17; seed ^= seed<<5;
    return seed>>>0;
  };
  const trials=[];
  for(let t=0;t<1000;t++) {
    const copy=RED.slice();
    for(let i=224;i>0;i--) {
      const j=rand()%(i+1);
      [copy[i],copy[j]]=[copy[j],copy[i]];
    }
    trials.push(bestScore(copy).minWrong);
  }
  return trials;
}
function main() {
  const real=bestScore(RED);
  assert.deepEqual(real,{minWrong:7,mode:0,orient:3});
  const planted=RED.slice();
  for(let r=0;r<7;r++)for(let c=0;c<7;c++) {
    // one code means black, the other white; no key inferred from source.
    planted[r*15+c]=fixedFinderBit(r,c)===1?0:1;
  }
  assert.equal(minWrong(planted,0,0),0);
  const nulls=controls();
  const count=nulls.filter(score=>score<=real.minWrong).length;
  assert.equal(count,788);
  assert.equal(Math.min(...nulls),2);
  const output={
    status:"No exact Micro QR M3 finder under global 29-rune bit labelling",
    evidence:{
      actualRedRunes:RED.length,gridShape:"15x15",fixedFinder:"7x7",
      alphabetSize:29,serialReadings:4,squareSymmetries:8,
      minimumUnavoidableWrongModules:real.minWrong,
      bestSerialReading:real.mode,bestSymmetry:real.orient
    },
    globalSymbolMapOptimizedExactly: true,
    plantedPositive:{
      oneCodeForDarkAndOneForLight:true,minimumWrongModules:0
    },
    null:{
      shuffles:nulls.length,
      equallyOrMorePatternLike:count,
      plusOneLowerTail:(count+1)/(nulls.length+1),
      meanBestWrong:nulls.reduce((a,b)=>a+b,0)/nulls.length,
      minBestWrong:Math.min(...nulls),
      maxBestWrong:Math.max(...nulls)
    }
  };
  console.log(JSON.stringify(output,null,2));
}
if(require.main===module)main();
module.exports={minWrong,bestScore,controls,main};
