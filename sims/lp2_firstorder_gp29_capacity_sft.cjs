"use strict";

/**
 * All-key majorization bound for direct GP29 plaintext under any reversible
 * one-rune substitution whose state is the preceding ciphertext rune.
 *
 * SFT: node sims/lp2_firstorder_gp29_capacity_sft.cjs
 * @module lp2_firstorder_gp29_capacity_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname,"..");
/** @param {string} name */
const read = (name) => fs.readFileSync(path.join(ROOT,name),"utf8");
/** @param {number[][]} segments @returns {number[][]} */
function transitions(segments) {
  const rows = Array.from({length:30},()=>Array(29).fill(0));
  for (const segment of segments) {
    let previous=29; // page/word/entire-stream start sentinel
    for (const symbol of segment) {
      rows[previous][symbol]++;
      previous=symbol;
    }
  }
  return rows;
}
/** @param {number[][]} rows @returns {number[]} */
function majorizationCapacity(rows) {
  const sorted = rows.map(row=>[...row].sort((a,b)=>b-a));
  const output = Array(29).fill(0);
  for (const row of sorted) {
    let sum=0;
    for (let k=0;k<29;k++) {
      sum+=row[k];
      output[k]+=sum;
    }
  }
  return output;
}
/** @param {number[]} tokens */
function topCounts(tokens) {
  const counts = Array(29).fill(0);
  for (const c of tokens) counts[c]++;
  counts.sort((a,b)=>b-a);
  return counts.map((_,i)=>counts.slice(0,i+1).reduce((a,b)=>a+b,0));
}
/** @param {string} native @param {string[]} translit */
function encodeNativeEnglish(native,translit) {
  const parts = native.replace(/^#.*$/gm," ").replace(/\[[^\]]*\]/g," ")
    .toUpperCase().match(/[A-Z]+/g)||[];
  const entries=translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  const tokens=[];
  for (const raw of parts) {
    const word=raw.replace(/[KVZ]/g,ch=>({K:"C",V:"U",Z:"S"})[ch]);
    for (let i=0;i<word.length;) {
      const token=entries.find(entry=>word.startsWith(entry.s,i));
      if (token){tokens.push(token.i);i+=token.s.length;}
      else i++; // no rune for standalone Q; original LP1 reference is editorial Latin
    }
  }
  return tokens;
}
/**
 * Positive all-secret per-state affine permutations. This example uses
 * thirty different source-independent permutations, selected BEFORE seeing
 * the original ciphertext; arithmetic is modulo the prime 29.
 * @param {number[][]} plaintextSegments
 */
function positivePlant(plaintextSegments) {
  const mul=Array.from({length:30},(_,s)=>1+((s*7+3)%28));
  const add=Array.from({length:30},(_,s)=>(s*13+5)%29);
  const output=[];
  const recovered=[];
  for (const part of plaintextSegments) {
    let previous=29;
    const encoded=[],decoded=[];
    for (const p of part) {
      const c=(mul[previous]*p+add[previous])%29;
      encoded.push(c);
      const candidates=Array.from({length:29},(_,i)=>i).filter(i=>
        (mul[previous]*i+add[previous])%29===c);
      assert.equal(candidates.length,1);
      decoded.push(candidates[0]);
      previous=c;
    }
    output.push(encoded);
    recovered.push(decoded);
  }
  assert.deepEqual(recovered,plaintextSegments);
  const plainFlat=plaintextSegments.flat(), cipherFlat=output.flat();
  assert.equal(cipherFlat.length,plainFlat.length);
  const capacity=majorizationCapacity(transitions(output));
  const plainTop=topCounts(plainFlat);
  for (let i=0;i<29;i++) assert.ok(capacity[i]>=plainTop[i],
    `positive plant top-${i+1} cannot exceed invariant upper bound`);
  return {sourceRunes:plainFlat.length,
    upperTop1:capacity[0],plainTop1:plainTop[0],
    upperTop12:capacity[11],plainTop12:plainTop[11]};
}
/** @param {number[][][]} chapterGroups */
function independentChapterCapacity(chapterGroups) {
  const perChapter=chapterGroups.map(groups=>majorizationCapacity(transitions(groups)));
  return Array.from({length:29},(_,k)=>perChapter.reduce((sum,cap)=>sum+cap[k],0));
}
/** @param {number[]} all @param {number} start @param {number} end @param {Set<number>} resetSites */
function splitInterval(all,start,end,resetSites) {
  const parts=[];
  let part=[];
  for (let i=start;i<end;i++) {
    if (part.length && resetSites.has(i)) {
      parts.push(part);
      part=[];
    }
    part.push(all[i]);
  }
  if (part.length)parts.push(part);
  return parts;
}

/** @param {number[]} all @param {number[]} lengths */
function groupByLengths(all,lengths) {
  let pos=0;
  const out=lengths.map(len=>{const chunk=all.slice(pos,pos+len);pos+=len;return chunk;});
  assert.equal(pos,all.length);
  return out;
}

function main() {
  const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const pageObjects=corpus.pages.filter(p=>p.page<=55);
  const pages=pageObjects.map(p=>p.indices).filter(p=>p.length>0);
  const all=pages.flat();
  assert.equal(all.length,12956);
  assert.equal(pages.length,55); // physical numeric-only p50 omitted
  const parsed=parseLP2Words(read("resources/liber-primus/lp2-transcription.txt"));
  const words=parsed.words.map(({runes})=>[...runes].map(r=>corpus.runes.indexOf(r)));
  assert.equal(words.length,2896);
  assert.deepEqual(words.flat(),all);
  // Nine fixed physical red-heading / 13-dot sites: no inferred phase or
  // adjustable boundaries. p15 and p33 each have an interior red heading.
  const annotations=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
  const headSites=[[0,0],[3,0],[8,0],[15,9],[23,0],[27,0],[33,0],[33,91],[40,0]];
  const offsets=new Map();
  let offset=0;
  for (const p of pageObjects){offsets.set(p.page,offset);offset+=p.indices.length;}
  assert.equal(offset,all.length);
  const headingCuts=headSites.map(([page,local])=>{
    const annotated=annotations.pages.find(p=>p.page===page);
    assert.ok(annotated.red_spans.some(span=>span.start===local));
    return offsets.get(page)+local;
  });
  headingCuts.push(all.length);
  assert.deepEqual(headingCuts,[0,729,1874,3612,5506,6527,7960,8051,9640,12956]);
  const wordStarts=new Set([0]);
  const pageStarts=new Set([0]);
  let running=0;
  for (const w of words){wordStarts.add(running);running+=w.length;}
  assert.equal(running,all.length);
  running=0;
  for (const p of pages){pageStarts.add(running);running+=p.length;}
  assert.equal(running,all.length);
  const chapters=headingCuts.slice(0,-1).map((start,i)=>[all.slice(start,headingCuts[i+1])]);
  const chaptersWord=headingCuts.slice(0,-1).map((start,i)=>
    splitInterval(all,start,headingCuts[i+1],wordStarts));
  const chaptersPage=headingCuts.slice(0,-1).map((start,i)=>
    splitInterval(all,start,headingCuts[i+1],pageStarts));
  const variants=[
    {name:"continuous",segments:[all],expected:[717,1365,6769]},
    {name:"page-reset",segments:pages,expected:[719,1368,6784]},
    {name:"word-reset",segments:words,expected:[695,1318,6671]},
    {name:"nine-red-head-specific",chapters,expected:[1253,2285,8886]},
    {name:"nine-red-head+page-reset",chapters:chaptersPage,expected:[1256,2296,8911]},
    {name:"nine-red-head+word-reset",chapters:chaptersWord,expected:[1226,2246,8767]}
  ];

  // A historically solved Cicada GP-English reference supplies a domain
  // illustration; it is NOT claimed to be the unknown plaintext.
  const native=encodeNativeEnglish(read("resources/liber-primus/lp1-plaintext-reference.txt"),
    corpus.translit);
  assert.equal(native.length,3287);
  const nativeE=native.filter(i=>i===corpus.translit.indexOf("E")).length;
  assert.equal(nativeE,406);
  const nativeTop=topCounts(native);
  assert.equal(nativeTop[11],2552);
  assert.equal(nativeTop[0],406);
  const plainLikeLP1=Array.from({length:all.length},(_,i)=>native[i%native.length]);
  const results=[];
  for (const item of variants) {
    const capacity=item.chapters ? independentChapterCapacity(item.chapters)
      : majorizationCapacity(transitions(item.segments));
    assert.deepEqual([capacity[0],capacity[1],capacity[11]],item.expected);
    assert.equal(capacity[28],12956);
    const sourceCounts=topCounts(plainLikeLP1);
    const lengths=(item.chapters ? item.chapters.flat() : item.segments).map(part=>part.length);
    const planted=positivePlant(groupByLengths(plainLikeLP1,lengths));
    results.push({reset:item.name,
      states:item.chapters ? item.chapters.reduce((n,c)=>n+c.length,0) : item.segments.length,
      sourceDependentTables:item.chapters ? item.chapters.length : 1,
      top1Maximum:capacity[0],
      top2Maximum:capacity[1],top12Maximum:capacity[11],
      top1MaxPct:capacity[0]/12956,top12MaxPct:capacity[11]/12956,
      authenticLP1Top1Fraction:406/3287,authenticLP1Top12Fraction:2552/3287,
      repeatLP1Top1:sourceCounts[0],repeatLP1Top12:sourceCounts[11],
      lowerBoundTop12ForcedEditsIfLP1Repeated:sourceCounts[11]-capacity[11],
      positivePlant:planted});
  }
  console.log(JSON.stringify({scope:"all 12,956 original unsolved GP29 runes, 55 rune-bearing physical pages, 2,896 original complete words",
    theorem:"for each state and any lossless bijection onto plaintext symbols, top-k plaintext total <= sum of k largest observed outgoing state-transition counts",
    source:"original LP2; authentic solved LP1 English GP tokens as comparison",
    conditionalConclusion:"native-GP English with E at 12.35% or top twelve at 77.64% is incompatible even with nine independent red-heading state tables (9.69% and 68.78% are generous upper bounds)",
    exclusions:"arbitrary per-predecessor GP29 permutations, including nine independent red-heading state tables, under continuous/page/word-reset original segmentation",
    outsideScope:"multiple-history state, position-dependent rotor, variable-width, auxiliary key stream, other intermediate alphabets, compressed plaintext, stochastic outputs",
    results},null,2));
}
if (require.main===module)main();
module.exports={main,transitions,majorizationCapacity,topCounts};
