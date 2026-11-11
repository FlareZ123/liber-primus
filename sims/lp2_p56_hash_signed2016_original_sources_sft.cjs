"use strict";
/**
 * SHA-512 historical image/source preimage test for solved p56 deep-web hash.
 * Human route: solved LP2 p56 supplies a 64-byte digest; 2016's authentic
 * signed message returns to LP2 through its signed tree image and p32/p55.
 * Test exact unmodified source files and canonical text, no password search.
 */
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
/** @param {string} relative */
const read=relative=>fs.readFileSync(path.join(root,relative));
const target=JSON.parse(read("resources/cicada2014-archive-hash-manifest.json").toString("utf8"))
  .targetHex;
assert.match(target,/^[0-9a-f]{128}$/u);
const sha512=bytes=>crypto.createHash("sha512").update(bytes).digest("hex");
assert.equal(sha512(Buffer.from("abc","ascii")),
  "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f");
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
assert.equal(signed.length,1136);
const text=signed.toString("utf8");
const begin=text.indexOf("Hello.");
const end=text.indexOf("-----BEGIN PGP SIGNATURE-----");
assert(begin>=0&&end>begin);
const cleartext=text.slice(begin,end);
const canonical=cleartext.replace(/\r\n/gu,"\n").split("\n")
  .map(line=>line.replace(/[ \t]+$/gu,"")).join("\r\n");
const armor=text.slice(end);
const match=armor.match(/-----BEGIN PGP SIGNATURE-----\r?\nVersion: [^\r\n]+\r?\n\r?\n([\s\S]*?)\r?\n-----END PGP SIGNATURE-----/u);
assert(match);
const packet=Buffer.from(match[1].split(/\r?\n/u)
  .filter(line=>line&&!line.startsWith("=")).join(""),"base64");
assert.equal(packet.length,543);
const mpi=packet.subarray(-512);
const files=[
  "resources/historical/cicada2016-4gq25.jpg",
  "resources/historical/cicada2016-4gq25-outguess.asc",
  "resources/liber-primus/31.jpg",
  "resources/liber-primus/49.jpg",
  "resources/liber-primus/72.jpg"
];
const inputs=files.map(name=>({name,bytes:read(name)}));
inputs.push(
  {name:"2016 extracted cleartext exact on-disk line endings",bytes:Buffer.from(cleartext,"utf8")},
  {name:"2016 cleartext canonical CRLF",bytes:Buffer.from(canonical,"utf8")},
  {name:"2016 OpenPGP signature packet",bytes:packet},
  {name:"2016 OpenPGP signature RSA MPI",bytes:mpi});
const evaluated=inputs.map(x=>({source:x.name,size:x.bytes.length,
  sha512:sha512(x.bytes),matchesP56Hash:sha512(x.bytes)===target}));
assert.equal(evaluated.length,9);
console.log(JSON.stringify({
  test:"P56 archived deep-web digest vs untouched 2016 signed source and illustrated book tree carriers",
  target,forms:evaluated,
  matches:evaluated.filter(x=>x.matchesP56Hash),
  conclusion:evaluated.some(x=>x.matchesP56Hash)?"EXACT KNOWN-SOURCE PREIMAGE":"No direct SHA-512 source preimage; historical hash remains unresolved"
},null,2));
