#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const GP_RUNES = ["ᚠ","ᚢ","ᚦ","ᚩ","ᚱ","ᚳ","ᚷ","ᚹ","ᚻ","ᚾ","ᛁ","ᛄ","ᛇ","ᛈ","ᛉ","ᛋ","ᛏ","ᛒ","ᛖ","ᛗ","ᛚ","ᛝ","ᛟ","ᛞ","ᚪ","ᚫ","ᚣ","ᛡ","ᛠ"];
const GP_TRANSLIT = ["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
const GP_INDEX = new Map(GP_RUNES.map((r, i) => [r, i]));
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const annotations = readJson("resources/liber-primus/lp2-ink-annotations.json");
const pages = corpus.pages.filter((p) => p.page <= 55);
const flat = pages.flatMap((p) => p.indices);
const withinTransitions = pages.reduce((n, p) => n + Math.max(0, p.indices.length - 1), 0);
const withinRepeats = pages.reduce((n, p) => {
  let k = 0;
  for (let i = 1; i < p.indices.length; i++) if (p.indices[i] === p.indices[i - 1]) k++;
  return n + k;
}, 0);
let flatRepeats = 0;
for (let i = 1; i < flat.length; i++) if (flat[i] === flat[i - 1]) flatRepeats++;
const spans = annotations.pages.filter((p) => p.page <= 55)
  .flatMap((p) => (p.red_spans || []).map((s) => ({ page: p.page, start: s.start, length: s.length, runes: s.runes })));
const DROP_CAP_SPANS = [[0,0],[3,0],[3,119],[6,71],[8,0],[15,0],[23,0],[27,0],[33,0],[33,91],[39,119],[40,0],[54,0]];
const dropcapKeys = new Set(DROP_CAP_SPANS.map(([p,s]) => p + ":" + s));
const dropcapSpans = DROP_CAP_SPANS.map(([p,s]) => {
  const found = spans.find((x) => x.page === p && x.start === s);
  if (!found) throw new Error("Missing dropcap span at p" + p + "@" + s);
  return found;
});
const nonDropSpans = spans.filter((x) => !dropcapKeys.has(x.page + ":" + x.start));
const dropcapValues = dropcapSpans.map((s) => GP_INDEX.get(Array.from(s.runes)[0]));
if (dropcapValues.some((x) => x === undefined)) throw new Error("Unmapped dropcap rune");
const dropcapTranslit = dropcapValues.map((x) => GP_TRANSLIT[x]).join("");
let dropcapBase29 = 0n;
for (const x of dropcapValues) dropcapBase29 = dropcapBase29 * 29n + BigInt(x);
const dotEvents = pages.flatMap((p) => (p.large_punctuation || [])
  .filter(([pos,count,color]) => color === "red" && (count === 13 || count === 10))
  .map(([pos,count]) => ({page:p.page,pos,count})))
  .sort((a,b) => a.page - b.page || a.pos - b.pos);
const dotBits = dotEvents.map((x) => x.count === 13 ? "1" : "0").join("");
const reverse = [...dotBits].reverse().join("");
const complement = [...dotBits].map((x) => x === "1" ? "0" : "1").join("");
const reverseComplement = [...reverse].map((x) => x === "1" ? "0" : "1").join("");
const dotSeeds = [["forward",dotBits],["reverse",reverse],["complement",complement],["reverse_complement",reverseComplement]]
  .map(([name,bits]) => ({name,bits,integer:BigInt("0b"+bits).toString()}));
const q = 1 / 29;
function filterFit(n,k) {
  const r=k/n, sHat=(q-r)/(q*(1-r));
  const seR=Math.sqrt(r*(1-r)/n), seS=((1-q)/(q*Math.pow(1-r,2)))*seR;
  const candidate=13/16, candidateRate=q*(1-candidate)/(1-q*candidate);
  const logLikelihoodDelta=k*Math.log(candidateRate/r)+(n-k)*Math.log((1-candidateRate)/(1-r));
  return {transitions:n,repeats:k,observedRate:r,fittedSuppression:sHat,
    approximate95PercentCI:[sHat-1.96*seS,sHat+1.96*seS],
    sourceCandidate:"13/16",candidateSuppression:candidate,candidateRepeatRate:candidateRate,
    predictedRepeats:n*candidateRate,logLikelihoodDeltaFromMLE:logLikelihoodDelta};
}
const output={
  source:{corpus:"resources/liber-primus/lp2-corpus.json",annotations:"resources/liber-primus/lp2-ink-annotations.json",
    unknownPages:[0,55],unknownRunes:flat.length,withinPageTransitions:withinTransitions,
    withinPageRepeats:withinRepeats,flattenedTransitions:flat.length-1,flattenedRepeats:flatRepeats},
  redSpanRelation:{totalUnknownPageRedSpans:spans.length,dropcapMarkedSpans:dropcapSpans.length,
    nonDropcapSpans:nonDropSpans.map(({page,start,length})=>({page,start,length})),
    dropcapValues,dropcapTranslit,dropcapBase29Integer:dropcapBase29.toString(),
    dropcapBase29Low32:Number(dropcapBase29&0xffffffffn)},
  separateRedDotStream:{events:dotEvents.length,thirteenDotCount:dotEvents.filter(x=>x.count===13).length,
    tenDotCount:dotEvents.filter(x=>x.count===10).length,bits:dotBits,seedVariants:dotSeeds},
  filterFits:{withinPage:filterFit(withinTransitions,withinRepeats),flattened:filterFit(flat.length-1,flatRepeats)},
  interpretation:"13/16 is a source-selected candidate rejection probability, not an established cipher mechanism or recovered key."
};
if(flat.length!==12956||withinTransitions!==12901||withinRepeats!==86||flatRepeats!==86)
  throw new Error("Unexpected canonical LP2 corpus counts: "+JSON.stringify(output.source));
if(spans.length!==16||dropcapSpans.length!==13||nonDropSpans.length!==3)
  throw new Error("Unexpected red-span/dropcap counts: "+JSON.stringify(output.redSpanRelation));
if(dotEvents.length!==30||dotBits!=="111111111111111111111001110111")
  throw new Error("Unexpected red-dot stream: "+JSON.stringify(output.separateRedDotStream));
if(dropcapTranslit!=="SLPAXLUMDNGIAFA")throw new Error("Unexpected dropcap sequence: "+dropcapTranslit);
console.log(JSON.stringify(output,null,2));
