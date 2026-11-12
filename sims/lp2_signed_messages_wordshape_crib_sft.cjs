"use strict";
/**
 * Original-source crib gate, independent of cipher family:
 * Before trying any key, ask whether a long verbatim original LP2 passage
 * could preserve printed word lengths from a preserved 2012–May-2014
 * Cicada clear-signed message. This is motivated by the independently
 * solved p57 repeating an original 2013 MP3 ID3 text, and by LP2's
 * explicitly marked quotation spans. No ciphertext values are scored.
 *
 * CommonJS, Node 22, read-only, repo-relative, SFT with planted controls.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const c = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const tr = fs.readFileSync(path.join(root,
  "resources/lp2-transcription.txt"), "utf8");
const files = [
  ["2014-May release", "resources/cicada2014-may2-signed-message.asc",5],
  ["2012 countdown", "resources/historical/cicada2012-countdown-message.asc",5],
  ["2012 MIDI email", "resources/historical/cicada2012-midi-email.asc",6],
  ["2013 first Onion", "resources/historical/cicada2013-first-onion-hello.asc",5],
  ["2013 forest", "resources/historical/cicada2013-forest-clue.asc",4],
  ["2013 sky", "resources/historical/cicada2013-second-onion-everything-you-need.asc",5],
  ["2013 ICMP", "resources/historical/cicada2013-second-onion-icmp-echo.asc",5],
  ["2014 Stage11", "resources/historical/cicada2014-stage11-message.asc",5],
];

/** @param {string} source @returns {{word:string,length:number}[]} */
function sourceWords(source) {
  const marker = "-----BEGIN PGP SIGNED MESSAGE-----";
  assert.ok(source.includes(marker));
  const after = source.slice(source.indexOf("\n\n",source.indexOf(marker))+2);
  const body = after.split("-----BEGIN PGP SIGNATURE-----")[0];
  const units = ["ING", ...c.translit].sort((a,b)=>b.length-a.length);
  return (body.match(/[A-Za-z]+(?:'[A-Za-z]+)*/g) || []).map((original) => {
    let s = original.replace(/[^A-Za-z]/g,"").toUpperCase()
      .replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
    let n = 0;
    while(s.length) {
      const atom = units.find(token => s.startsWith(token));
      assert.ok(atom, "Unmapped source text " + original + " -> " + s);
      s=s.slice(atom.length);
      n++;
    }
    return {word:original,length:n};
  });
}

/** @param {string} raw @returns {{length:number,page:number}[]} */
function originalWords(raw) {
  const runic=/[\u16A0-\u16FF]/u, result=[];
  let page=0, cur=0, start=0;
  for(const ch of raw.split("%").slice(0,55).join("%")) {
    if(runic.test(ch)) {if(cur===0)start=page;cur++;}
    else if(ch==="%")page++;
    else if(ch==="/" || /\s/u.test(ch)) {}
    else if(cur) {result.push({length:cur,page:start});cur=0;}
  }
  if(cur)result.push({length:cur,page:start});
  return result;
}

/**
 * Find the maximum contiguous matching word-length window.
 * @param {number[]} keyLengths
 * @param {number[]} targetLengths
 */
function longest(keyLengths,targetLengths) {
  let best = {count:0,keyStart:0,targetStart:0};
  for(let i=0;i<keyLengths.length;i++) {
    for(let j=0;j<targetLengths.length;j++) {
      let n=0;
      while(i+n<keyLengths.length && j+n<targetLengths.length &&
        keyLengths[i+n]===targetLengths[j+n])n++;
      if(n>best.count)best={count:n,keyStart:i,targetStart:j};
    }
  }
  return best;
}
const target=originalWords(tr);
assert.equal(target.length,2896);
assert.equal(target.reduce((s,x)=>s+x.length,0),12956);
const targetLens=target.map(x=>x.length);
const outcomes=[];
for(const [name,file,expected] of files) {
  const bytes=fs.readFileSync(path.join(root,file),"utf8");
  const source=sourceWords(bytes);
  const sizes=source.map(x=>x.length);
  const found=longest(sizes,targetLens);
  assert.equal(found.count,expected, "Changed full-source match gate: "+name);
  const nativePlant=targetLens.slice();
  assert.ok(1100+sizes.length<targetLens.length);
  nativePlant.splice(1100,sizes.length,...sizes);
  assert.ok(longest(sizes,nativePlant).count>=source.length,
    "Full original message length-sequence plant must be recovered");
  outcomes.push({
    source:name,words:source.length,
    longestOriginalMatch:found.count,
    originalPhysicalPage:target[found.targetStart].page>=50?
      target[found.targetStart].page+1:target[found.targetStart].page,
    sourcePhrase:source.slice(found.keyStart,found.keyStart+found.count)
      .map(x=>x.word).join(" "),
    completeSourcePlantRecovered:true,
  });
}
assert.ok(outcomes.every(x=>x.longestOriginalMatch<=6));
console.log(JSON.stringify({
  sourceFamily:"Eight preserved Cicada signed messages through May 2014",
  runeWordCount:target.length,runeCount:12956,
  originalMethod:"Complete contiguous GP-aware printed word lengths, no offsets, resets, or fitted plaintext",
  results:outcomes,
  decision:"No 7+ word verbatim plaintext crib from these eight original message witnesses"
},null,2));
