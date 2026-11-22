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
/** @param {Buffer} bytes @returns {{tabs:number,whitespaceLines:number[],trailing:number[]}} */
function tabSpaceInventory(bytes) {
  const input = bytes.toString("utf8");
  const lines = input.split(/\r?\n/u);
  const whitespaceLines = [];
  const trailing = [];
  for (const line of lines) {
    if (/^[ \t]+$/u.test(line)) whitespaceLines.push(line.length);
    const match = /[ \t]+$/u.exec(line);
    if (match) trailing.push(match[0].length);
  }
  return {tabs: (input.match(/\t/gu) || []).length, whitespaceLines, trailing};
}
const indexSpace = tabSpaceInventory(html);
assert.deepEqual(indexSpace, {tabs: 0, whitespaceLines: [], trailing: []});
const signed2014 = fs.readFileSync(path.join(ROOT,
  "resources/cicada2014-may2-signed-message.asc"));
assert.equal(signed2014.length, 1183);
assert.equal(gitBlob(signed2014), "e2b7382ac2cfb0adfe028cc063fc6048e0ad718e");
const signedSpace = tabSpaceInventory(signed2014);
assert.deepEqual(signedSpace, {
  tabs: 0,
  whitespaceLines: [3,11,13,17,29,31,37],
  trailing: [2,3,7,11,13,17,23,29,31,37]
});
// The original 2013 four-line source-positive is reproduced by
// lp2_2013_whitespace_ascii_punctuation_selector_sft.cjs.
// Both 2014 wrappers lack the literal two-symbol binary source carrier.

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
  original2013BinaryWhitespaceTransfer:{
    positiveControl:"2013 Git blob 297c1dfee74ff79acc2d944952d06d1012928803",
    rule:"complete all-tab/space lines; tab=1, space=0; eight-bit ASCII",
    may2014Index:indexSpace,may2014UnsignedWhitespaceWitness:signedSpace,
    directCarrier:"absent: no tabs and no whitespace-only HTML lines"
  },
  note:"A separate original ZIP/tar or HTTP response header is not evidenced by this pinned participant snapshot"
},null,2));
