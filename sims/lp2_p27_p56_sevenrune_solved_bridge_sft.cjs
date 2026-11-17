"use strict";

/** Original source-only p27→p55/p56 seven-rune bridge and solved p56 first-rune check.
 * Node22 CommonJS read-only single-file test. The p27 plaintext is UNDETERMINED.
 */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const source=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8"));
const all=source.pages.flatMap(p=>p.indices);
const first=source.pages[27].indices.slice(28,35);
const second=source.pages[55].indices.slice(70).concat(source.pages[56].indices[0]);
assert.equal(all.length,13136);
assert.deepEqual(first,[23,11,1,17,18,10,25]);
assert.deepEqual(second,first);
assert.equal(source.pages[55].indices.length,76);
assert.equal(source.pages[56].indices[0],25);
assert.equal(source.translit[24],"A");
assert.equal((25-1+29)%29,24,"p56 first rune under first prime-totient key");
const windows=new Map,repeat=[];
for(let i=0;i<=all.length-7;i++){
  const seq=all.slice(i,i+7).join(",");
  if(windows.has(seq))repeat.push({firstOffset:windows.get(seq),secondOffset:i,indices:seq});
  else windows.set(seq,i);
}
assert.deepEqual(repeat,[{firstOffset:6555,secondOffset:12950,
  indices:"23,11,1,17,18,10,25"}]);
console.log(JSON.stringify({
  originalSourceLength:all.length,
  repeatedSevenRuneWindows:repeat,
  sites:["p27 local28–34","p55 local70–75 + solved p56 local0"],
  sourceGlyphs:first.map(i=>source.translit[i]).join("-"),
  solvedP56FirstCipher:25,
  solvedP56FirstPlain:24,
  solvedP56FirstKeyPhiPrime2:1,
  originalP27Plain:"unknown without proven key/state transfer"
},null,2));
