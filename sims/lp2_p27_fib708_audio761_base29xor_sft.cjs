"use strict";

/**
 * Source-supplied 708 (p15 Fibonacci original-body checksum) and
 * 761.MP3 (p27 Fibonacci original-body checksum and source title)
 * as a historically documented bytewise XOR.
 *
 * This test differs from the already performed direct byte-mod29
 * Vigenere: serialize the entire original 1414-GP29-rune p27..32
 * black body as one canonical big-endian base29 integer, pad to the
 * exact full radix29 domain byte width, XOR at literal audio byte708.
 * No key offset sweep, alignment tuning, variable header or salt.
 *
 * node sims/lp2_p27_fib708_audio761_base29xor_sft.cjs C:\path\761.MP3
 */
const fs = require("node:fs");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const pages = corpus.pages.filter(p => p.page >= 27 && p.page <= 32);
assert.deepEqual(pages.map(p => p.page), [27,28,29,30,31,32]);
const entire = pages.flatMap(p => p.indices);
assert.equal(entire.length, 1433);
const body = entire.slice(19);
assert.equal(body.length, 1414);
const p57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(p57.length, 95);
assert.equal(process.argv.length, 3);
const audio = fs.readFileSync(process.argv[2]);
assert.equal(audio.length, 4010732);
const sha = crypto.createHash("sha256").update(audio).digest("hex");
assert.equal(sha,"83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460");

/** @param {number[]} symbols @returns {Buffer} */
function base29ToBuffer(symbols) {
  let integer = 0n;
  for (const digit of symbols) {
    assert.ok(Number.isInteger(digit) && digit >= 0 && digit <= 28);
    integer = integer * 29n + BigInt(digit);
  }
  let fullRange = 29n ** BigInt(symbols.length) - 1n;
  let width = 0;
  while (fullRange > 0n) { width++; fullRange >>= 8n; }
  const hex = integer.toString(16).padStart(width * 2, "0");
  assert.equal(hex.length,width * 2);
  return Buffer.from(hex,"hex");
}

/** @param {Buffer} input @param {number} count @returns {number[]} */
function bufferToBase29(input,count) {
  let x = BigInt("0x" + input.toString("hex"));
  const out = Array(count).fill(0);
  for (let i = count - 1; i >= 0; i--) {
    out[i] = Number(x % 29n);
    x /= 29n;
  }
  assert.equal(x,0n, "full-byte width can encode overflow, not accepted");
  return out;
}

/** @param {Buffer} input @param {number} offset @returns {Buffer} */
function audioXor(input,offset) {
  assert.ok(offset >= 0 && offset + input.length <= audio.length);
  const out = Buffer.alloc(input.length);
  for(let i=0;i<input.length;i++)out[i]=input[i]^audio[offset+i];
  return out;
}

/** @param {Buffer} buf @returns {{printable:number,longest:number,zeros:number,header:string,tail:string,asciiHead:string,sha256:string}} */
function describe(buf) {
  let printable=0,longest=0,run=0,zeros=0;
  for(const b of buf) {
    zeros += +(b===0);
    if (b >=32 && b <=126 || b===10 || b===13 || b===9) {
      printable++;run++;longest=Math.max(run,longest);
    } else run=0;
  }
  return {
    printable, longest, zeros,
    header:buf.subarray(0,32).toString("hex"),
    tail:buf.subarray(-16).toString("hex"),
    asciiHead:[...buf.subarray(0,96)].map(b=>b>=32&&b<=126
      ?String.fromCharCode(b):".").join(""),
    sha256:crypto.createHash("sha256").update(buf).digest("hex")
  };
}

const original = base29ToBuffer(body);
assert.equal(original.length,859);
assert.deepEqual(bufferToBase29(original,body.length),body);
const result = audioXor(original,708);
assert.deepEqual(audioXor(result,708),original);

// Exact known GP-native positive: encode authentic clear p57 GP rune
// units in the same fixed-domain radix, XOR at the same literal offset,
// decrypt and restore the exact 95 native runes with no guessed key.
const plant = base29ToBuffer(p57);
assert.deepEqual(bufferToBase29(plant,p57.length),p57);
const plantedCipher = audioXor(plant,708);
const plantedPlain = audioXor(plantedCipher,708);
assert.deepEqual(plantedPlain,plant);
assert.deepEqual(bufferToBase29(plantedPlain,p57.length),p57);

const whole = base29ToBuffer(entire);
assert.equal(whole.length,871);
assert.deepEqual(bufferToBase29(whole,entire.length),entire);
const wholeXor = audioXor(whole,708);
assert.deepEqual(audioXor(wholeXor,708),whole);

console.log(JSON.stringify({
  source:"2013 761.MP3 authentic XOR starting at source-derived byte 708",
  audioSha256:sha,
  audioSourceOffset:708,
  firstNonzeroAfter708:audio.findIndex((b,i)=>i>=708 && b!==0),
  byte708:audio[708],
  byte206:audio[206],
  source708Head128:audio.subarray(708,836).toString("hex"),
  audioFirstNonzeroAfter206:audio.findIndex((b,i)=>i>=206 && b!==0),
  bodyOrigin:"LP2 pp27-32 after 19-rune red heading",
  serialization:"canonical big-endian full base29 integer, unsigned bytes padded to ceil(log_256(29^N))",
  inputRuneCounts:{body:body.length,whole:entire.length,control:p57.length},
  recoveredNativePositive:p57.length,
  bodyRaw:{bytes:original.length, ...describe(original)},
  bodyXor:{bytes:result.length, ...describe(result)},
  fullChapterXor:{bytes:wholeXor.length, ...describe(wholeXor)}
},null,2));
