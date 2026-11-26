#!/usr/bin/env node
"use strict";
/** Hash the large, otherwise unexplained .htaccess object in the archived
 * 2014 avowyfgl5lkzfj3n.onion service against the LP2 p56 digest. */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const {spawnSync}=require("node:child_process");
const URL="https://archive.org/download/avowyfgl5lkzfj3n.onion/.htaccess";
const EXPECTED_BYTES=5064619;
const EXPECTED_SHA1="b7221547309e1179e4056a36b86cf9b20537c47a";
const EXPECTED_MD5="3bd58415200e42b03dfb63acde59537f";
const TARGET="36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
const hash=(alg,b)=>crypto.createHash(alg).update(b).digest("hex");
function whirlpool(b){
 const p=spawnSync("openssl",["dgst","-provider","legacy","-whirlpool"],{input:b});
 assert.equal(p.status,0,p.stderr.toString("utf8"));
 return p.stdout.toString("utf8").trim().split("=").pop().trim().toLowerCase();
}
async function main(){
 const r=await fetch(URL,{redirect:"follow"});
 assert.equal(r.status,200,`HTTP ${r.status} for ${URL}`);
 const b=Buffer.from(await r.arrayBuffer());
 assert.equal(b.length,EXPECTED_BYTES);
 const sha1=hash("sha1",b),md5=hash("md5",b);
 assert.equal(sha1,EXPECTED_SHA1,"Internet Archive SHA-1 mismatch");
 assert.equal(md5,EXPECTED_MD5,"Internet Archive MD5 mismatch");
 const hashes={
  sha512:hash("sha512",b),
  sha3_512:hash("sha3-512",b),
  blake2b_512:hash("blake2b512",b),
  whirlpool:whirlpool(b)
 };
 const printable=[...b].filter(x=>x===9||x===10||x===13||(x>=32&&x<=126)).length/b.length;
 console.log(JSON.stringify({
  test:"p56 hash against archived 2014 avowy onion4 .htaccess object",
  source:{url:URL,archive_item:"avowyfgl5lkzfj3n.onion",item_date:"2014-01-29",bytes:b.length,sha1,md5,sha256:hash("sha256",b),first64_hex:b.subarray(0,64).toString("hex"),first64_ascii:b.subarray(0,64).toString("latin1").replace(/[^\x20-\x7e]/g,"."),printable_fraction:printable},
  target:TARGET,hashes,matches:Object.fromEntries(Object.entries(hashes).map(([k,v])=>[k,v===TARGET])),
  conclusion:Object.values(hashes).some(x=>x===TARGET)?"EXACT SOURCE PREIMAGE FOUND":"Archived .htaccess object does not match the p56 digest under tested 512-bit hashes"
 },null,2));
}
main().catch(e=>{console.error(e.stack||String(e));process.exit(1);});
