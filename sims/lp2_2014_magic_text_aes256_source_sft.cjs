"use strict";
/**
 * Single historical key-transfer trial: the exact 745-byte 2014
 * OpenPuff-extracted magic-squares text becomes a SHA-256 AES-256-CTR key.
 * Read-only original LP2 test plus positive inversion plants.
 *
 * Run: node sims/lp2_2014_magic_text_aes256_source_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createCipheriv, createHash } = require("node:crypto");
const { encode, train } = require("./grid_keyskip_viterbi.cjs");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file));
const json = file => JSON.parse(read(file).toString("utf8"));
const corpus = json("resources/liber-primus/lp2-corpus.json");
const source = read("resources/cicada2014-openpuff-magic-squares.txt");
const ciphertext = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
assert.equal(source.length, 745);
assert.equal(ciphertext.length, 12956);
const key = createHash("sha256").update(source).digest();
const visual = [729,1145,1729,1903,1021,1433,1680,3008,308];
assert.equal(visual.reduce((a,b) => a + b, 0), ciphertext.length);
const mod = (a,n) => (a % n + n) % n;
const model = train(read("resources/control/shakespeare_first300k.txt").toString("utf8"));
const native = encode(read("resources/control/shakespeare_first300k.txt").toString("utf8"));
assert(native.length >= 12956);

function keystream(n) {
  const aes = createCipheriv("aes-256-ctr", key, Buffer.alloc(16));
  return Buffer.concat([aes.update(Buffer.alloc(n)), aes.final()]);
}
function ioc(array) {
  const h = Array(29).fill(0);
  for (const x of array) h[x]++;
  return h.reduce((v,n) => v + n*(n-1),0)/(array.length*(array.length-1));
}
function score(array) {
  let sum = 0;
  for (let i=2; i<array.length; i++) {
    sum += model.trigram[(array[i-2]*29 + array[i-1])*29 + array[i]];
  }
  return sum/(array.length-2);
}
const powers = [];
const logs = Array(29).fill(-1);
for (let i=0,x=1;i<28;i++,x=x*15%29) {
  assert.equal(logs[x], -1);
  powers.push(x);
  logs[x] = i;
}
assert.equal(new Set(powers).size, 28);
function decrypt(cipher,pad,kind,sign) {
  let previous = 0;
  return cipher.map((c,i) => {
    if (kind === "direct29") return mod(c + sign*(pad[i]%29),29);
    const step = mod(c-previous,29);
    previous = c;
    return step === 0 ? 28 : mod(logs[step] + sign*(pad[i]%28),28);
  });
}
function encrypt(plain,pad,kind,sign) {
  let previous = 0;
  return plain.map((p,i) => {
    if (kind === "direct29") return mod(p - sign*(pad[i]%29),29);
    if (p !== 28) previous = mod(previous + powers[mod(p-sign*(pad[i]%28),28)],29);
    return previous;
  });
}
const layouts = {
  continuous: [ciphertext],
  visual_chapter_reset: (() => {
    let offset = 0;
    return visual.map(n => {
      const segment = ciphertext.slice(offset,offset+n);
      offset += n;
      return segment;
    });
  })()
};
const records=[];
for (const [layout,segments] of Object.entries(layouts)) {
  for (const kind of ["direct29","gp28_predecessor"]) {
    for (const sign of [-1,1]) {
      const parts = [];
      let offset = 0;
      for (const segment of segments) {
        const pad = keystream(segment.length);
        const dec = decrypt(segment,pad,kind,sign);
        assert.deepEqual(encrypt(dec,pad,kind,sign),segment);
        const control = native.slice(offset,offset+segment.length);
        assert.deepEqual(decrypt(encrypt(control,pad,kind,sign),pad,kind,sign),control);
        parts.push(dec);
        offset += segment.length;
      }
      const output = parts.flat();
      assert.equal(output.length,ciphertext.length);
      records.push({
        layout,kind,sign,
        ioc:ioc(output),
        englishTrigramLogScore:score(output),
        opening: output.slice(0,80).map(x=>corpus.translit[x]).join(""),
        exactReencryption:true
      });
    }
  }
}
records.sort((a,b) => b.englishTrigramLogScore - a.englishTrigramLogScore);
console.log(JSON.stringify({
  premise:"Original source-native 2014 magic-square text hashed as an AES-256-CTR key, zero nonce and counter.",
  uncertainty:"No signed Cicada instruction selects SHA-256 or AES for this cross-release transfer.",
  original2014SourceBytes:source.length,
  original2014SourceSha256:key.toString("hex"),
  originalCipherRunes:ciphertext.length,
  frozenCases:records.length,
  nativeEnglish:{ioc:ioc(native.slice(0,ciphertext.length)),englishTrigramLogScore:score(native.slice(0,ciphertext.length))},
  originalCiphertext:{ioc:ioc(ciphertext),englishTrigramLogScore:score(ciphertext)},
  results:records,
  positive:"Every tested original inverse exactly reencrypts; separate real GP-native 12,956-symbol plaintext plants invert exactly under every case.",
  interpretation:"Only readable original plaintext plus independently justified key and method could authenticate a result."
},null,2));
