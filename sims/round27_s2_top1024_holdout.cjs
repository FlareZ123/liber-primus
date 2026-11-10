"use strict";
/**
 * Independently retest the 1024 strongest S2 L120 panel screen seeds
 * on an unselected 240-rune interval, using exactly the corresponding
 * MT-derived key and published English-quadgram beam decoder.
 *
 * Inputs are archived source: the original LP2 p0, frozen Round27
 * top_S2.json and its exact quadgram source.
 * Node 22 CommonJS. Run: node sims/round27_s2_top1024_holdout.cjs
 *
 * Selection correction: this is a complete finite top-1024 accounting,
 * rather than a handpicked second-stage example. It is not a complete
 * 9-register pmax test and does not cover the unscanned 55.86% seeds.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const {beam} = require("./round27_s2_crosslane_alias.cjs");
const ROOT = path.resolve(__dirname, "..");
const top = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/control/duko_round27_s2_top1024.json"), "utf8"));
const quad = fs.readFileSync(path.join(ROOT,
  "resources/control/duko_round27_english_quadgrams.txt"), "utf8");
const source = fs.readFileSync(path.join(ROOT,
  "resources/control/shakespeare_first300k.txt"), "utf8");

assert.equal(top.length, 1024);
assert.equal(new Set(top.map(x=>x.seed)).size, 1024);
for (let i = 1; i < top.length; i++)
  assert.ok(top[i-1].pmax >= top[i].pmax);

const chunks = quad.trim().split(/\r?\n/).map(line=>line.split(/\s+/));
const total = chunks.reduce((s,x)=>s+Number(x[1]),0);
assert.equal(total, 7266795);
const freq = new Map(chunks.map(x=>[x[0],Math.log10(Number(x[1])/total)]));
const floor = Math.log10(0.01/total);
function scoreLatin(s) {
  let value = 0;
  for (let i=0;i<s.length-3;i++)value+=freq.get(s.slice(i,i+4))??floor;
  return value / (s.length-3);
}

function main() {
  const sourceLatin = source.slice(100000,240000).replace(/[^A-Za-z]/g,"").toUpperCase();
  const references = Array.from({length:40},(_,i)=>
    scoreLatin(sourceLatin.slice(i*1000,i*1000+285))).sort((a,b)=>a-b);
  const records=[];
  for (let rank=0;rank<top.length;rank++) {
    const item=top[rank];
    const x=beam(item.seed,"exact",240);
    const score=scoreLatin(x.latin);
    assert.ok(Math.abs(score-x.quadScore)<1e-9);
    records.push({
      originalL120Rank:rank+1,seed:item.seed,
      oldL120Pmax:item.pmax,quadPerLatinChar:score,
      latinLength:x.nchars,skips:x.n_skips,
      originalL240Prefix:x.latin.slice(0,100),
    });
  }
  records.sort((a,b)=>b.quadPerLatinChar-a.quadPerLatinChar);
  const scores=records.map(x=>x.quadPerLatinChar).sort((a,b)=>a-b);
  const best=records[0];
  const bestSource=references[0];
  const result={
    classification:"Complete 1024-candidate S2 English-quadgram holdout; no source plaintext recovered",
    selection:"All 1024 original archived top_S2 seeds, selected under nine-register pmax at L120; each independently decoded from its 32-bit seed under exact keyskip and scored at L240",
    unknownOriginalLengthRunes:240,sourceArchiveCount:top.length,
    nativeEnglishReference:{windows:references.length,windowLatinLength:285,
      minimum:references[0],median:references[20],maximum:references.at(-1)},
    sourceRecoveredThreshold:bestSource,
    originalScoreDistribution:{minimum:scores[0],quartile1:scores[256],
      median:scores[512],quartile3:scores[768],maximum:scores.at(-1)},
    aboveWorstEnglishReference:records.filter(x=>x.quadPerLatinChar>=bestSource).length,
    best15:records.slice(0,15),
    firstStageWinner:records.find(x=>x.seed===35563892),
    scope:"This challenge addresses source-English quadgrams only. Other GP languages and unknown binary registers require separate tests; the 9-register L240 panel is not rebuilt.",
  };
  assert.ok(best.quadPerLatinChar<0);
  return result;
}
if (require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={main};
