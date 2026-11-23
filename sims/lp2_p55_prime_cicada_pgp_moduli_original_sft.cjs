"use strict";
/**
 * A direct factor bridge from the original p55 strict-interior GP29 integer
 * to Cicada's genuinely authenticated 2012 signing/encryption public keys.
 * An RSA factor from the source puzzle would be decisive, but the source
 * never instructs a factoring or public-key operation; this is an exact,
 * bounded, and very inexpensive high-value falsification.
 *
 * Run: node sims/lp2_p55_prime_cicada_pgp_moduli_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {dearmor, parseKeys} = require("./grid_rsa_pgp_signature.cjs");

const root = path.resolve(__dirname, "..");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const c = corpus.pages.find(p => p.page === 55).indices;
const lengths = [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.equal(c.length, 76);
let at = 0;
const core = [], shell = [];
for (let i = 0; i < lengths.length; i++) {
  const n = lengths[i], word = c.slice(at, at+n);
  at += n;
  if (i === 0) shell.push(...word);
  else {
    shell.push(word[0], word[n-1]);
    core.push(...word.slice(1,-1));
  }
}
assert.equal(at, 76);
assert.deepEqual([core.length,shell.length],[43,33]);
const sourceInteger = core.reduce((a,v) => a*29n+BigInt(v),0n);
assert.equal(sourceInteger % 8n,0n);
const p = sourceInteger / 8n;
assert.equal(p.toString(2).length,206);
assert.equal(p,63755441409934721069036418908763882578170591536653256311514221n);

const originalArmor = fs.readFileSync(path.join(root,
  "resources/historical/cicada-3301-2012-public-key.asc"),"utf8");
const keyPackets = parseKeys(dearmor(originalArmor));
assert.deepEqual(keyPackets.map(k=>k.tag),[6,14]);
assert.deepEqual(keyPackets.map(k=>k.bits),[4096,4096]);
assert.deepEqual(keyPackets.map(k=>k.exponent),[65537n,65537n]);
assert.equal(keyPackets[0].fingerprint,
  "6D854CD7933322A601C3286D181F01E57A35090F");
assert.equal(keyPackets[1].fingerprint,
  "DEC57731ACCBFD11EEBA13434D390ECF671DDEB1");

function gcd(a,b){while(b){const r=a%b;a=b;b=r;}return a;}
const fixed = keyPackets.map(key=>({
  tag:key.tag,
  fingerprint:key.fingerprint,
  publicExponent:key.exponent.toString(),
  modulusBits:key.bits,
  modulusPrefix:key.modulus.toString(16).slice(0,32),
  remainderModP:(key.modulus%p).toString(),
  gcd:gcd(key.modulus,p).toString()
}));
assert(fixed.every(row=>row.gcd==="1" && row.remainderModP!=="0"));
const plantedModulus = p * ((1n << 3890n) + 3n);
assert(plantedModulus.toString(2).length >= 4096);
assert.equal(gcd(plantedModulus,p),p);
console.log(JSON.stringify({
  source:"original p55 strict-interior BASE29 prime, Cicada RSA v4 original armored public key",
  p206:p.toString(),
  original4096bitKeyModuli:fixed,
  plantedValidLargeFactorDetected:true,
  decision:"Neither original authenticated Cicada RSA modulus has the p55 source-prime factor; no private key or LP2 plaintext. P55 interpretation remains unauthenticated."
},null,2));
console.log("PASS");
