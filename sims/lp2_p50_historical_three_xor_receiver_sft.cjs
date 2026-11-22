"use strict";

/**
 * LP2 p50 H/G quotient and historical three-block XOR receiver gate.
 *
 * Source operands: actual 256 base60-decoded p50 bytes; the independently
 * sourced 2013 BASE29 and p39 red-triad GF29 quartic factors; archived 2014
 * Stage05 three 256-byte hexadecimal blocks. No tuneable key, phase, or text.
 *
 * Run: node sims/lp2_p50_historical_three_xor_receiver_sft.cjs
 * Windows 11 / Node 22 / CommonJS.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(ROOT, relative), "utf8");
const sha256 = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const modulo = x => ((x % 29) + 29) % 29;
const DIVISOR = Object.freeze([12, 17, 11, 21, 23]); // H_2013 * G_p39, high to low
const INVERSE_LEAD = 17; // 12*17 = 1 mod29

/** @param {number[]} input @returns {{quotient:number[],remainder:number[]}} */
function divide(input) {
  assert.equal(input.length, 256);
  const a = input.map(modulo);
  const quotient = [];
  for (let i = 0; i < 252; i++) {
    const q = modulo(a[i] * INVERSE_LEAD);
    quotient.push(q);
    for (let j = 0; j < 5; j++) a[i+j] = modulo(a[i+j] - q * DIVISOR[j]);
  }
  return {quotient, remainder:a.slice(252)};
}

/** @param {number[]} quotient @returns {number[]} */
function multiply(quotient) {
  assert.equal(quotient.length, 252);
  const output = Array(256).fill(0);
  for (let i = 0; i < quotient.length; i++) {
    for (let j = 0; j < DIVISOR.length; j++) {
      output[i+j] = modulo(output[i+j] + quotient[i]*DIVISOR[j]);
    }
  }
  return output;
}

/** @param {number[]} digits @returns {Buffer} */
function base29ToBytes(digits) {
  let value = 0n;
  for (const d of digits) {
    assert(d >= 0 && d <= 28);
    value = value*29n + BigInt(d);
  }
  let hex = value.toString(16);
  if (hex.length % 2) hex = "0"+hex;
  return Buffer.from(hex, "hex");
}

/** @param {Buffer} bytes @param {number} length @returns {number[]} */
function bytesToBase29(bytes, length) {
  let n = BigInt("0x"+bytes.toString("hex"));
  const a = Array(length).fill(0);
  for (let i = length-1; i >= 0; i--) {
    a[i] = Number(n%29n);
    n /= 29n;
  }
  assert.equal(n, 0n);
  return a;
}

/** @param {Buffer[]} parts @returns {Buffer} */
function xor(parts) {
  assert(parts.length >= 2);
  assert(parts.every(part => part.length === parts[0].length));
  const result = Buffer.alloc(parts[0].length);
  for (const p of parts) for (let i=0; i<p.length; i++) result[i] ^= p[i];
  return result;
}

/** @param {Buffer} b @returns {number} */
function printableCount(b) {
  return [...b].filter(x=>(x>=32&&x<=126)||x===9||x===10||x===13).length;
}

/** @param {Buffer} b @returns {boolean} */
function hasPlainHeader(b) {
  const known = [
    Buffer.from("-----BEGIN PGP"),
    Buffer.from("1f8b", "hex"), Buffer.from("504b0304", "hex"),
    Buffer.from("89504e470d0a1a0a", "hex"), Buffer.from("%PDF"),
    Buffer.from("789c", "hex"), Buffer.from("78da", "hex"),
  ];
  return known.some(x=>b.subarray(0,x.length).equals(x));
}

function main() {
  const table = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
  const source = Buffer.from(table.pages.flatMap(p=>p.bytes));
  assert.equal(source.length, 256);
  assert.equal(sha256(source),
    "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

  const {quotient,remainder} = divide([...source]);
  assert.deepEqual(remainder,[0,0,0,0]);
  assert.deepEqual(quotient.slice(0,20),
    [0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21,7,21,18,7]);
  assert.deepEqual(multiply(quotient),[...source].map(modulo));
  const packet = base29ToBytes(quotient);
  assert.equal(packet.length,153);
  assert.equal(packet.subarray(0,16).toString("hex"),"04598e588f3e70d4100f40d7489f9855");
  assert.equal(sha256(packet),
    "288a929f70ffa0556fd8507fb3ab7f6a4720625c9341aab60141f0a89d890d31");

  // A single zero-parameter split exists: 153 = 3*51, the same operation
  // as the historically archived three equal-sized Stage05 hex blocks.
  const three = [0,1,2].map(i=>packet.subarray(51*i,51*(i+1)));
  const recovered = xor(three);
  assert.equal(recovered.length,51);
  assert.equal(sha256(recovered),
    "609e18bf78948ad3a53993dce1f25085acf10534c90b45e2c7d360932d87d017");
  assert.equal(printableCount(recovered),18);
  assert.equal(hasPlainHeader(recovered),false);

  const archive = read("resources/external/2014-stage05-three-onion-hex-blocks.txt");
  const match = archive.match(/^[a-f0-9]{512}$/gim) || [];
  assert.equal(match.length,3);
  const historical = match.map(x=>Buffer.from(x,"hex"));
  assert(historical.every(x=>x.length===256));
  const combinations=[];
  for(let mask=0;mask<8;mask++) {
    const row = xor([source,Buffer.alloc(256),...historical.filter((_,i)=>(mask&(1<<i))!==0)]);
    const cnt=printableCount(row);
    const entry={mask,printable:cnt,total:256,
      header:hasPlainHeader(row),prefix:row.subarray(0,8).toString("hex")};
    assert(cnt<140);
    assert(!entry.header);
    combinations.push(entry);
  }

  // End-to-end positive plant: synthesize 3x51 shares whose XOR is native
  // English, encode all 153 bytes through BASE29, multiply by the exact
  // original source quartic, then recover with the same reader.
  const message=Buffer.from("THE SOURCE-LOCKED THREE-SHARE XOR PLANT IS LEGIBLE.","ascii");
  assert.equal(message.length,51);
  const planted = Buffer.concat([three[0],three[1],xor([three[0],three[1],message])]);
  const plantedDigits = bytesToBase29(planted,252);
  const manufacturedGrid = multiply(plantedDigits);
  const rebuilt = divide(manufacturedGrid);
  assert.deepEqual(rebuilt.remainder,[0,0,0,0]);
  assert.deepEqual(rebuilt.quotient,plantedDigits);
  assert(base29ToBytes(rebuilt.quotient).equals(planted));
  const plantedOutput = xor([0,1,2].map(i=>planted.subarray(i*51,(i+1)*51)));
  assert(plantedOutput.equals(message));

  console.log(JSON.stringify({
    status:"PASS",tableBytes:source.length,
    originalQuotientDigits:quotient.length,
    originalPacketBytes:packet.length,
    packetPrefix:packet.subarray(0,16).toString("hex"),
    originalThreeShareXor:{bytes:51,sha256:sha256(recovered),
      printable:printableCount(recovered),plainHeader:hasPlainHeader(recovered)},
    historicalSource:{threeOriginalBlocks:historical.length,bytesPerBlock:256},
    p50XorHistoricallyTypedBlockSubsets:combinations,
    positivePlant:{bytes:51,exactRecovery:true},
    decision:"Neither source-typed direct XOR receiver produces a plaintext or recognizable packet. No key, first-party source instruction coupling these operands, or unknown-page plaintext is established."
  },null,2));
}
if (require.main === module) main();
module.exports={divide,multiply,base29ToBytes,bytesToBase29,xor};
