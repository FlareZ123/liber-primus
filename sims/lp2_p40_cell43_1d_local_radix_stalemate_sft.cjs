"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/base60-grid.json"), "utf8"
));
const transcription = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8"
);
const segments = transcription.split(/^%$/m);
assert.equal(segments.length, 57);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const numbers = text => [...text].flatMap(ch => runeIndex.has(ch) ? [runeIndex.get(ch)] : []);
const pageText = page => page === 50 ? "" :
  segments[page < 50 ? page : page - 1].replace(/[\/\r\n]/g, "");
const words = text => text.split(/[-.&$§]/).map(numbers).filter(w => w.length);

const p48=pageText(48), p49=pageText(49), p51=pageText(51), p52=pageText(52);
const pre48=p48.slice(p48.lastIndexOf(".")+1);
const pre49=p49.slice(0,p49.lastIndexOf(".")+1);
const post52=p52.slice(0,p52.indexOf(".")+1);
const before=pre48+pre49, after=p51+post52;
assert.deepEqual([numbers(pre48).length,numbers(pre49).length],[72,66]);
assert.deepEqual([numbers(p51).length,numbers(post52).length],[92,78]);
assert.deepEqual([numbers(before).length,numbers(after).length],[138,170]);
assert.deepEqual([words(before).length,words(after).length],[33,40]);

const tokens=grid.rows.flat();
assert.equal(tokens.length,256);
assert.equal(tokens[43],"1D");

const alpha60=grid.alphabet;
assert.equal(alpha60.length,60);
const alpha59=alpha60.replace("f","");
assert.equal(alpha59.length,59);
const value=(token,alphabet,radix)=>{
  const hi=alphabet.indexOf(token[0]), lo=alphabet.indexOf(token[1]);
  assert.ok(hi>=0&&lo>=0);
  return radix*hi+lo;
};
const token=tokens[43];
const hex=parseInt(token,16);
const base59=value(token,alpha59,59);
const base60=value(token,alpha60,60);
assert.deepEqual([hex,base59,base60],[29,72,73]);

const localFacts={
  gpAlphabetSize:corpus.runes.length,
  pretableP48TailRunes:numbers(pre48).length,
  flankingCompleteWords:words(before).length+words(after).length,
};
assert.deepEqual(localFacts,{gpAlphabetSize:29,pretableP48TailRunes:72,flankingCompleteWords:73});
assert.equal(hex,localFacts.gpAlphabetSize);
assert.equal(base59,localFacts.pretableP48TailRunes);
assert.equal(base60,localFacts.flankingCompleteWords);

console.log(JSON.stringify({
  status:"PASS",
  independentlySelectedCell:43,
  token,
  radixReadings:{hex,base59,base60},
  localSourceFacts:localFacts,
  flankingSentences:{
    before:{runes:numbers(before).length,words:words(before).length,parts:[72,66]},
    after:{runes:numbers(after).length,words:words(after).length,parts:[92,78]},
  },
  conclusion:"Cell43 token 1D has an exact three-way source-visible radix ambiguity: hex=29 equals GP alphabet size, base59=72 equals the p48 contribution to the intact pretable sentence, and base60=73 equals total words in the two intact table-flanking sentences. The selected cell cannot by itself authenticate a radix or receiver count.",
},null,2));
