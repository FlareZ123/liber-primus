"use strict";
/**
 * Chapter-conditioned original page-carry cardinality control (Node 22 CJS).
 * Reads only canonical original-source text. No file writes or network.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const RUNE = /[\u16A0-\u16FF]/u;
// Rune-bearing page ordinals; physical LP2 page 50 has no runes.
const CHAPTERS = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,52],[53,54]];

/** @returns {{count:number, words:number, isInterior:Uint8Array, lines:number[][], ends:number[]}} */
function parse() {
  const raw = fs.readFileSync(path.join(__dirname,"..","resources","lp2-transcription.txt"),"utf8");
  const pages = raw.split("%").slice(0,55);
  assert.equal(pages.length,55);
  let count=0, start=-1;
  const words=[],lines=[],ends=[];
  for(const page of pages) {
    const marks=[];
    for(const ch of page) {
      if(RUNE.test(ch)) {
        if(start<0) start=count;
        count++;
      } else if(ch==="/") marks.push(count);
      else if(!/\s/u.test(ch) && start>=0) {
        words.push([start,count]);
        start=-1;
      }
    }
    lines.push(marks);
    ends.push(count);
  }
  if(start>=0) words.push([start,count]);
  const isInterior=new Uint8Array(count+1);
  for(const [a,b] of words) for(let x=a+1;x<b;x++) isInterior[x]=1;
  assert.equal(count,12956);
  assert.equal(words.length,2896);
  return {count,words:words.length,isInterior,lines,ends};
}

/** @param {number} n @param {number} k @returns {number} */
function choose(n,k) {
  if(k<0 || k>n) return 0;
  let v=1;
  for(let i=1;i<=Math.min(k,n-k);i++) v*=(n-i+1)/i;
  return v;
}

/** @param {number} n @param {number} k @param {number} draws @returns {number[]} */
function hg(n,k,draws) {
  const denom=choose(n,draws);
  return Array.from({length:draws+1},(_,x)=>
    choose(k,x)*choose(n-k,draws-x)/denom);
}

function main() {
  const {count,words,isInterior,lines,ends}=parse();
  const carries=xs=>xs.reduce((n,x)=>n+isInterior[x],0);
  const pg=ends.slice(0,-1),wraps=lines.flat();
  assert.equal(pg.length,54);
  assert.equal(carries(pg),32);
  assert.equal(wraps.length,594);
  assert.equal(carries(wraps),420);

  // Naive exact phase-shift control, which does not preserve chapter starts.
  let low=0,total=0;
  for(let phase=0;phase<count;phase++) {
    const val=pg.reduce((n,b)=>n+isInterior[(b+phase)%count],0);
    if(val<=32) low++;
    total+=val;
  }
  assert.equal(low,28);
  assert.ok(Math.abs(total/count-41.929607903673975)<1e-10);

  let pmf=[1],observed=0,expected=0,draws=0;
  const summary=[];
  for(const [first,last] of CHAPTERS) {
    const population=lines.slice(first,last+1).flat();
    const n=population.length,k=carries(population),size=last-first;
    const hit=carries(ends.slice(first,last));
    const local=hg(n,k,size),next=new Array(pmf.length+size).fill(0);
    for(let a=0;a<pmf.length;a++)
      for(let b=0;b<local.length;b++) next[a+b]+=pmf[a]*local[b];
    pmf=next;
    observed+=hit;
    expected+=size*k/n;
    draws+=size;
    summary.push({pageRange:first+"-"+last,wrapCount:n,wordCrossingWraps:k,pageGaps:size,carries:hit});
  }
  const chapterGaps=CHAPTERS.slice(0,-1).map(group=>ends[group[1]]);
  const p=pmf.slice(0,observed+1).reduce((s,v)=>s+v,0);
  assert.equal(chapterGaps.length,8);
  assert.equal(carries(chapterGaps),0);
  assert.equal(draws,46);
  assert.equal(observed,32);
  assert.ok(Math.abs(expected-32.571549588130715)<1e-10);
  assert.ok(Math.abs(p-0.48243923723766613)<1e-9);
  assert.ok(Math.abs(pmf.reduce((s,v)=>s+v,0)-1)<1e-10);

  console.log("Original GP29 runes="+count+" words="+words+" pageBreaks=54 carries="+carries(pg));
  console.log("LineWraps="+wraps.length+" lineWrapCarries="+carries(wraps));
  console.log("Whole-book cyclic phase null: 28/12956 <= 32, mean="+(total/count).toFixed(6));
  console.log("Source-visible chapter endings: 8; chapter carries="+carries(chapterGaps));
  console.log("Original per-chapter pools: "+JSON.stringify(summary));
  console.log("Within-chapter page breaks: "+draws+"; observed carries="+observed);
  console.log("Chapter-stratified line-wrap null: expected="+expected.toFixed(6)+" P(X<=32)="+p.toFixed(9));
  console.log("PASS: exact 32↔32 cardinality is ordinary given original chapter/line-wrap layout");
}

main();
