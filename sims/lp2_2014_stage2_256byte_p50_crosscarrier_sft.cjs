"use strict";

/**
 * LP2 pp49–51 and the independently archived 2014 Onion2 512-character
 * historical stream: source-frozen bytewise XOR plus 2014 RSA transport gate.
 * Uses the actual published 32x8 printed base60 table.
 * SFT (Windows11 / Node22): node sims/lp2_2014_stage2_256byte_p50_crosscarrier_sft.cjs
 *
 * Source: neuroretransmit/cicada, 2014/003-second-onion/README.md
 * Exact original page source: resources/liber-primus/base60-grid.json
 * Historical RSA source: neuroretransmit/cicada,
 * 2014/002-first-onion/README.md (PGP-signed OAEP envelope).
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

/** @param {Buffer} input @returns {string} */
function sha256(input) { return crypto.createHash("sha256").update(input).digest("hex"); }
/** @param {Buffer} input @returns {number} */
function entropy(input) {
  const hist = Array(256).fill(0);
  for (const x of input) hist[x]++;
  return hist.reduce((h,c) => c ? h-(c/input.length)*Math.log2(c/input.length) : h,0);
}
/** @param {Buffer} buf @returns {bigint} */
function beInteger(buf) { return BigInt("0x" + buf.toString("hex")); }

const grid = JSON.parse(fs.readFileSync(path.resolve(
  __dirname, "../resources/liber-primus/base60-grid.json"), "utf8"));
assert.equal(grid.rows.length,32);
assert.ok(grid.rows.every(row => row.length===8));
const printedBytes = Buffer.from(grid.byte_rows.flat());
assert.equal(printedBytes.length,256);
assert.equal(sha256(printedBytes),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

/* From 2014 Onion2: 512 consecutive hex characters before <!--761-->.
 * This string was chronologically available before original LP2.
 */
const historicalHex = "634292ba49fe336edada779a34054a335c2ec12c8bbaed4b92dcc05efe98f76abffdc2389bdb9de2cf20c009acdc1945ab095a52609a5c219afd5f3b3edf10fcb25950666dfe8d8c433cd10c0b4c72efdfe12c6270d5cfde291f9cf0d73cb1211140136e4057380c963d70c76948d9cf6775960cf98fbafa435c44015c5959837a0f8d9f46e094f27c5797b7f8ab49bf28fa674d2ad2f726e197839956921dab29724cd48e1a81fc9bab3565f7513e3e368cd0327b47cf595afebb78d6b5bca92ba021cd6734f4362a0b341f359157173b53d49ea5dff5889d2c9de6b0d7e8c615286ce596bfa83f50b6eeabd153aaf50cd75f39929ba11fb0f8e8d611442846";
assert.match(historicalHex,/^[0-9a-f]{512}$/);
const historicalBytes = Buffer.from(historicalHex,"hex");
assert.equal(historicalBytes.length,256);

/* Explicit historical 2013/2014 XOR precedent: one exact, aligned
 * source-order byte xor with no fitted offset, direction or key phase.
 */
/* The other two January2014 same-length original onion pages:
 * <!--1033--> and X-Cicada:3301. All three chronological 256-byte
 * streams are known sources, hence there is ONE natural XOR of all
 * three followed by the physically 256-byte LP2 numeric receiver.
 * These hex bytes are period participant archive objects.
 */
const stage3Hex="87de5b7fa26ab85d2256c453e7f5bc3ac7f25ee743297817febd7741ededf07ca0c7e8b1788ea4131441a8f71c63943d8b56aea6a45159e2f59f9a194af23eaabf9de0f3123c041c882d5b7e03e17ac49be67cef29fbc7786e3bda321a176498835f6198ef22e81c30d44281cd217f7a46f58c84dd7b29b941403ecd75c0c735d20266121f875aa8dec28f32fc153b1393e143fc71616945eea3c10d6820bd631cf775cf3c1f27925b4a2da655f783f7616f3359b23cff6fb5cb69bcb745c55dff439f7eb6a4094bd302b65a84360a62f94c8b010250fcc431c190d6ed8cc8a3bfce37dddb24b93f502ad83c5fa21923189d8be7a6127c4105fcf0e5275286f2";
const stage4Hex="bf1d5574ca36efd524e6c34c26cbd628b19aa835aceb94ea7f2ca7f33d1b8f51476bc597d4bf9ad5111d8f39ef5351b3b090bce47f023002fe69928e79f6f8147f6fe051f2f159041f932f5190308d7441fc3cecead0851662d3217485827e640a4183fa5bc8cef5ff7d1473d2746a37fbc8b94318ff0d3aeb467017c0ea5cb33b3e6967453986e1450b35ad47861f679cf7db5a6c170bcfb67544983ec1e36b27ee8c5721da39d27dbfa0cdc15ba3cbaa425e8a8b96b81ab665f3ebc41563a0e9270695d3d68887cfab2c07b290718307f764afba684b17fcfd71323f64206e5fa378b4ee89e80885733080065dd34a5c838898906b8d43de9f1d8eb6922bad";
const stage3Bytes=Buffer.from(stage3Hex,"hex");
const stage4Bytes=Buffer.from(stage4Hex,"hex");
assert.equal(stage3Bytes.length,256);
assert.equal(stage4Bytes.length,256);
const authenticThreeOnionXOR=Buffer.alloc(256);
const fourSourceXOR=Buffer.alloc(256);
for(let i=0;i<256;i++){
  authenticThreeOnionXOR[i]=historicalBytes[i]^stage3Bytes[i]^stage4Bytes[i];
  fourSourceXOR[i]=authenticThreeOnionXOR[i]^printedBytes[i];
}
function byteMetrics(buffer){
  return {
    strict_ascii:buffer.filter(x=>x>=32&&x<=126).length,
    unique_bytes:new Set(buffer).size,
    entropy_bits_per_byte:entropy(buffer),
    hex_prefix:buffer.toString("hex").slice(0,96),
    known_file_header:knownHeaders.some(h=>buffer.toString("hex").startsWith(h)),
  };
}
const decoded = Buffer.alloc(256);
for(let i=0;i<256;i++)decoded[i]=printedBytes[i]^historicalBytes[i];
const recovered = Buffer.alloc(256);
for(let i=0;i<256;i++)recovered[i]=decoded[i]^historicalBytes[i];
assert.deepEqual(recovered,printedBytes);
const printable=decoded.filter(x=>x===9||x===10||x===13||x>=32&&x<=126).length;
const strictASCII=decoded.filter(x=>x>=32&&x<=126).length;
const knownHeaders=["25504446","504b0304","1f8b08","425a68","789c","89504e47","ffd8ff","7b22","7b0a","2d2d2d2d2d"];
const magic=knownHeaders.filter(head=>decoded.toString("hex").startsWith(head));
const allZero=decoded.every(b=>b===0);
/* The exact original LP2 p56 128-hex target; no first-party digest
 * algorithm is specified. SHA512 is the one-byte-size-matched candidate.
 * The bare Onion2 payload's own SHA512 was already excluded separately.
 */
const p56Target="36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
assert.match(p56Target,/^[0-9a-f]{128}$/);
const terminalDigestChecks=[
  ["original_p50_source_grid",printedBytes],
  ["one_literal_prior_stage_xor",decoded],
  ["one_literal_full_three_onion_xor_with_table",fourSourceXOR]
].map(([sourceName,bytes])=>({
  source:sourceName,
  sha512:crypto.createHash("sha512").update(bytes).digest("hex"),
}));
assert.ok(terminalDigestChecks.every(v=>v.sha512!==p56Target));
const originalPageIndexByte=grid.byte_rows.flat()[0];

/* Historic 2014 Onion1 RSA Crypt::RSA::ES::OAEP modulus is 432 bits.
 * Four 8x8 groups of the original 32x8 table create FOUR 64-byte
 * 512-bit big-endian integers, each larger than N. Normal RSA ciphertext
 * representatives MUST lie in [0,N). This excludes this exact shape.
 */
const p=97513779050322159297664671238670850085661086043266591739338007321n;
const q=77506098606928780021829964781695212837195959082370473820509360759n;
const N=7557912574608535164426718292058021255641310207187633095795069445700059210248050757270234679993673844203148013173091173786572116639n;
assert.equal(p*q,N);
assert.equal(N.toString(2).length,432);
const blocks=Array.from({length:4},(_,j)=>printedBytes.subarray(j*64,j*64+64));
const compare=blocks.map(b=>({bits:beInteger(b).toString(2).length,representativeIsValid:beInteger(b)<N}));
assert.ok(compare.every(b=>!b.representativeIsValid));

/* Source material is deliberately independent; no original LP2 op
 * tells us to pair it with the table. A roundtrip is only a code check.
 */
const report={
  historical_512hex_bytes:historicalBytes.length,
  historical_stream_sha256:sha256(historicalBytes),
  original_LP2_grid_bytes:printedBytes.length,
  original_LP2_grid_sha256:sha256(printedBytes),
  known_2014_stage2_exact_XOR_replay:true,
  decrypted_printable_with_whitespace:printable,
  decrypted_strict_printable:strictASCII,
  decrypted_unique_bytes:new Set(decoded).size,
  decrypted_entropy:entropy(decoded),
  decrypted_hex_prefix:decoded.toString("hex").slice(0,96),
  p56_128hex_SHA512_scope:terminalDigestChecks.map(v=>({source:v.source,sha512_equals_p56:v.sha512===p56Target,sha512_prefix:v.sha512.slice(0,32)})),
  triple_source_2014_onion_xor:byteMetrics(authenticThreeOnionXOR),
  four_source_2014_three_onions_plus_original_grid:byteMetrics(fourSourceXOR),
  decoded_has_whole_grammar_or_file_header:!!magic.length,
  exact_hist_2014_RSA_modulus_bits:N.toString(2).length,
  exact_RSAPKCS1_four_8x8_cipher_groups:compare,
  source_derived_key_or_unknown_LP2_plaintext:false,
  decision:"Literal published-order 256-byte XOR gives nonprose data; four 64-byte RSA ciphertext blocks invalid for the actually 432-bit historical modulus."
};
console.log(JSON.stringify(report,null,2));
