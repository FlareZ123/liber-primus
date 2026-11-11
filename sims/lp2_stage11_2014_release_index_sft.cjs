"use strict";
/**
 * Recheck the complete 2014 Stage11 original participant-archived publication
 * index and all 58 individually served LP2 image members against this repo.
 *
 * Run from repository checkout: node sims/lp2_stage11_2014_release_index_sft.cjs
 * Researching an outer ZIP/container? This is the pinned actual HTML envelope,
 * NOT evidence that a downloadable signed ZIP existed.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const crypto=require("node:crypto");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const record=JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/historical/stage11-2014-index-manifest.json"),"utf8"));
const html=fs.readFileSync(path.join(ROOT,"resources/historical/stage11-2014-index.html"));
/** @param {Buffer} content */
function gitBlob(content){
  return crypto.createHash("sha1")
    .update(Buffer.from("blob "+content.length+"\0"))
    .update(content).digest("hex");
}
assert.equal(html.length,1640);
assert.equal(gitBlob(html),"303db130705f0ef9be2a738f4336d5cfcebde80c");
assert.equal(record.provenance.indexGitBlobSHA1,gitBlob(html));
assert.equal(record.provenance.sourceCommit,"6c3421a4d245596e403c88e037509d162a2afd17");
assert.equal(record.provenance.archiveTreeFolderEntries,59);
const text=html.toString("utf8");
assert.match(text,/^<html>\n<head><title>133<\/title><\/head>\n<body>\n<div id="331">\n/);
assert.match(text,/<\/div>\n<\/body>\n<\/html>\n$/);
assert.equal(record.images.length,58);
const urls=[...text.matchAll(/<img src="(\d+\.jpg)" \/><br \/>/g)].map(m=>m[1]);
assert.equal(urls.length,58);
assert.deepEqual(urls,Array.from({length:58},(_,i)=>i+".jpg"));
const stripped=text.replace(/^<html>\n<head><title>133<\/title><\/head>\n<body>\n<div id="331">\n/,"")
  .replaceAll(/<img src="\d+\.jpg" \/><br \/>\n/g,"")
  .replace(/<\/div>\n<\/body>\n<\/html>\n$/,"");
assert.equal(stripped,"","index contains no other elements, source keys or download link");
let total=0;
const verified=[];
for(let i=0;i<58;i++){
 const e=record.images[i];
 assert.equal(e.sourceFile,i+".jpg");
 const mirror="resources/liber-primus/"+String(i+17).padStart(2,"0")+".jpg";
 assert.equal(e.mirrorFile,mirror);
 const bytes=fs.readFileSync(path.join(ROOT,mirror));
 assert.equal(bytes.length,e.sizeBytes);
 const sha=gitBlob(bytes);
 assert.equal(sha,e.gitBlobSHA1);
 total+=bytes.length;
 verified.push({source:e.sourceFile,mirror,gitBlob:sha,bytes:bytes.length});
}
console.log(JSON.stringify({
  conclusion:"All 58 historical May 2014 HTML-index LP2 members are exact source copies; index has no executable instruction or download wrapper",
  originalParticipantCommit:record.provenance.sourceCommit,
  indexGitBlobSHA1:gitBlob(html),
  pageCount:verified.length,allVerified:true,totalSourceImageBytes:total,
  first:verified[0],last:verified.at(-1),
  note:"A separate original ZIP/tar or HTTP response header is not evidenced by this pinned participant snapshot"
},null,2));
