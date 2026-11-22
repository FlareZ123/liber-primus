"use strict";
/**
 * Original 2014 Stage10 response-to-LP1 image identity.
 *
 * Source filenames and Git blob objects:
 * Earliest participant snapshot: micheloosterhof/cicada-2014
 * commit 3b15257c5a9efada85b8ccfdb876e2ec934d5b90
 * stage10/{107,167,229}.jpg and stage10/squares.
 * Identical copies exist in krisyotam/cicada3301.
 * Their original Git blob IDs are compared against unmodified LP1 source JPEGs.
 *
 * SFT: node sims/stage10_post_square_three_images_original_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const ROOT=path.join(__dirname,"..");
/** @param {Buffer} data */
function gitBlobSha1(data){
  return crypto.createHash("sha1").update(Buffer.from("blob "+data.length+"\0")).update(data).digest("hex");
}
/** @param {Buffer} data */
function sha256(data){
  return crypto.createHash("sha256").update(data).digest("hex");
}
const three=[
  {urlFile:"107.jpg",archiveFile:"14.jpg",bytes:625668,
   sourceBlob:"28a1ac59a2f1f51d272e4e362c0c35b4be241347",
   sha256:"de2bebe1d06421d94f3dd2b2b5f838ee4cdb5f51b07b14e880e0108f7b79c14e"},
  {urlFile:"167.jpg",archiveFile:"15.jpg",bytes:426945,
   sourceBlob:"32952b7d28028f5fedffceace4de0e7eb688d3d6",
   sha256:"f163903bec1236f1c89c96343d0bd1dee610b697c3ba82514651f04c5fbee4b9"},
  {urlFile:"229.jpg",archiveFile:"16.jpg",bytes:485456,
   sourceBlob:"6f8059f7e8025bf3f51fceefe20be0cce8ce1e20",
   sha256:"984668c680c6089b91587ef6d9eb2a1df1d2b7ee8ab3837655d3933f2adcbfbe"}
];
const response=fs.readFileSync(path.join(ROOT,"resources/external/2014-stage10-post-square-response.html"));
assert.equal(gitBlobSha1(response),"d71303af76016c8e88ed5dcc8a18b08e6276a437");
assert.equal(response.length,152);
const srcHtml=response.toString("utf8");
const targets=Array.from(srcHtml.matchAll(/<img src="\/([^"]+)"\s*\/>/g),m=>m[1]);
assert.deepEqual(targets,three.map(x=>x.urlFile));
assert.ok(srcHtml.includes("Thank you for you submission."));
const recovered=three.map(({urlFile,archiveFile,bytes,sourceBlob,sha256:expected256})=>{
  const data=fs.readFileSync(path.join(ROOT,"resources/liber-primus",archiveFile));
  assert.equal(data.length,bytes);
  const sha=gitBlobSha1(data);
  assert.equal(sha,sourceBlob,"source archived Git object must exactly equal local LP1 original "+urlFile);
  assert.equal(sha256(data),expected256);
  assert.equal(data.subarray(0,2).toString("hex"),"ffd8");
  assert.equal(data.subarray(-2).toString("hex"),"ffd9");
  return {historicalResponse:urlFile,liberPrimusArchive:archiveFile,bytes,gitBlobSha1:sha,sha256:expected256};
});
console.log(JSON.stringify({result:"3/3 byte-identical archived Stage10 response images recovered in LP1",responseGitBlobSha1:gitBlobSha1(response),sourceArchive:"micheloosterhof/cicada-2014 @ 3b15257c5a9efada85b8ccfdb876e2ec934d5b90",objects:recovered,limitation:"Participant-preserved copy; original HTTP server response headers and POST acceptance remain absent; no new LP2 plaintext or key."},null,2));
