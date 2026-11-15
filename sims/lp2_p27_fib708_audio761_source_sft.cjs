"use strict";

/**
 * A source-selected, two-clue historical audio key test on original LP2 p27 and its independently repeated terminal p55 pair.
 *
 * Fibonacci prime-index pick at physical p15 red/body boundary = 708,
 * copied original p27 body under same operation = 761, a genuine historical
 * 2013 MP3 source whose exact bytes were used as an XOR key earlier.
 *
 * Test only source-selected byte origin 708 in that original 761.MP3 and
 * direct GP29 2014-era additive mixing. Both signs and the authentic
 * plaintext-F unconsumed bypass are tested without key search or fitting.
 *
 * The historic byte-XOR actually used in 2013 does not by itself specify
 * byte-to-GP29 reduction or a 2014 recipient, so this is a conditional
 * exact inverse attempt rather than an asserted creator instruction.
 * Run: node sims/lp2_p27_fib708_audio761_source_sft.cjs /tmp/761.MP3
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const gp = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-ink-annotations.json"), "utf8"));
const sourceAudio = fs.readFileSync(process.argv[2]);
assert.equal(sourceAudio.length, 4010732);
assert.equal(crypto.createHash("sha256").update(sourceAudio).digest("hex"),
  "83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460");
const f = [0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987];
const p15 = gp.pages.slice(15, 23).flatMap(p => p.indices);
const p27 = gp.pages.slice(27, 33).flatMap(p => p.indices);
assert.equal(p15.length, 1903);
assert.equal(p27.length, 1433);
const p15Head = 20, p27Head = 19;
const pick = (a, start) => f.map(i => a[start+i]);
const sum = seq => seq.reduce((s, index) => s + gp.prime[index], 0);
assert.equal(sum(pick(p15, p15Head)), 708);
assert.equal(sum(pick(p27, p27Head)), 761);
const red15 = ink.pages.find(p => p.page === 15).red_spans;
const red27 = ink.pages.find(p => p.page === 27).red_spans;
assert.deepEqual([red15[0].start, red15[0].length], [0, 9]);
assert.deepEqual([red15[1].start, red15[1].length], [9, 11]);
assert.deepEqual([red27[0].start, red27[0].length], [0, 19]);
assert.equal(gp.pages[57].indices.length, 95);
const key = Array.from(sourceAudio.subarray(708, 708+p27.length), x => x % 29);
const mod = x => (x % 29 + 29) % 29;
const ic = seq => {
  const counts = Array(29).fill(0);
  seq.forEach(x => counts[x]++);
  return counts.reduce((s,n) => s+n*(n-1),0)/(seq.length*(seq.length-1));
};

/**
 * Exact all literal-F skip masks: state j is the number of consumed audio
 * bytes. Only F ciphertext can encode unconsumed plaintext F. A non-F
 * ciphertext cannot have plaintext F under any legal mixed key step.
 * @param {number[]} ciphertext @param {number} startByte @param {number} sign
 */
function reachable(ciphertext, startByte, sign) {
  let states = new Set([0]);
  for(let i=0;i<ciphertext.length;i++) {
    const next=new Set();
    for(const j of states) {
      const k=sourceAudio[startByte+j]%29;
      if(ciphertext[i]===0)next.add(j);
      const plain=mod(ciphertext[i]-sign*k);
      if(plain!==0)next.add(j+1);
    }
    if(!next.size)return {processed:i+1,contradiction:i,endingStates:[]};
    states=next;
  }
  return {processed:ciphertext.length,contradiction:-1,endingStates:[...states].sort((a,b)=>a-b)};
}
/** @param {number[]} original @param {number} startByte @param {number} sign */
function direct(original,startByte,sign) {
 return original.map((c,i)=>mod(c-sign*(sourceAudio[startByte+i]%29)));
}
/** @param {number[]} plaintext @param {number} startByte @param {number} sign */
function plant(plaintext,startByte,sign) {
 let used=0;
 const ciphertext=plaintext.map(p=>{
  if(p===0)return 0;
  return mod(p+sign*(sourceAudio[startByte+used++]%29));
 });
 return {ciphertext,used};
}
const p57=gp.pages[57].indices;
for (const sign of [-1,1]) {
 const originalPlant=plant(p57,708,sign);
 const check=reachable(originalPlant.ciphertext,708,sign);
 assert.equal(check.contradiction,-1);
 assert(check.endingStates.includes(originalPlant.used));
}
const black=p27.slice(p27Head);
const p55=gp.pages[55].indices;
assert.equal(p55.length,76);
assert.deepEqual(p55.slice(-6),gp.pages[27].indices.slice(28,34)); // unique 2014 printed DJU-BEI shared pair
const output=[];
for(const [name,data] of [
  ["p27-black",black],
  ["p27-with-heading",p27],
  ["p55-shared-terminal-pair",p55],
]) {
 for(const sign of [-1,1]) {
  const decoded=direct(data,708,sign);
  const fSkip=reachable(data,708,sign);
  output.push({
   target:name,sign,
   cipherRunes:data.length,
   directDecodedIoC:ic(decoded),
   exactNoOp:decoded.every((x,i)=>x===data[i]),
   nonzeroByteResidueCount:data.reduce((n,_,i)=>n+Number(sourceAudio[708+i]%29!==0),0),
   directDecodedFirst42:decoded.slice(0,42).map(i=>gp.translit[i]).join(" "),
   legalFSkipAllMasks:fSkip,
  });
 }
}
console.log(JSON.stringify({
 evidenceClass:"Conditional source-cued two-number original-input inverse; no assumed secret key",
 source:"p15 Fibonacci rune pickup708; p27 same operation761; archived original 2013 761.MP3 bytes",
 originalMP3Sha256:"83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460",
 exactByteOffset:708,
 reducer:"unsigned MP3 byte modulo29",
 cipher:"GP29 additive Vigenere; ± and historically authentic literal-F skip",
 p27FibonacciChecksum:761,
 p15FibonacciChecksum:708,
 knownP57PlantExact:true,
 originalResults:output,
},null,2));
