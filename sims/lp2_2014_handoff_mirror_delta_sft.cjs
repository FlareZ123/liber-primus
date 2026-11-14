"use strict";
/**
 * 2014 LP2 Stage11 original-vs-2022 modern mirror complete 58-JPEG byte gate.
 * Read-only, Windows-compatible SFT: node sims/lp2_2014_handoff_mirror_delta_sft.cjs
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const base=path.resolve(__dirname,"..");
/** @param {string} relative @returns {Buffer} */
function read(relative){return fs.readFileSync(path.join(base,relative));}
/** @param {string} relative @returns {any} */
function json(relative){return JSON.parse(read(relative).toString("utf8"));}
/** @param {Buffer} bytes @returns {string} */
function gitBlob(bytes){
 const header=Buffer.from("blob "+bytes.length+"\0","utf8");
 return crypto.createHash("sha1").update(header).update(bytes).digest("hex");
}
assert.equal(gitBlob(Buffer.from("hello\n")),"ce013625030ba8dba906f756967f9e9ca394464a");
const stage=json("resources/historical/stage11-2014-index-manifest.json");
const delta=json("im-results/2014-handoff-original-mirror-differences.json");
assert.equal(delta.task,"director-task#827");
assert.equal(stage.images.length,58);
assert.equal(delta.imageDifference.allPages.length,58);
let strippedOnly=0,altered=0,colourOriginal=0,grayOriginal=0;
const pageStats=[];
for(let n=0;n<58;n++){
 const original=stage.images[n],ref=delta.imageDifference.allPages[n];
 assert.equal(ref.page,n);assert.equal(original.sourceFile,n+".jpg");
 assert.equal(original.gitBlobSHA1,ref.originalGitBlob);
 const bytes=read(original.mirrorFile);
 assert.equal(bytes.length,original.sizeBytes);
 assert.equal(gitBlob(bytes),original.gitBlobSHA1,"Original 2014 source changed on p"+n);
 assert.equal(bytes.subarray(0,4).toString("hex"),"ffd8ffe0","2014 original JFIF start");
 assert.equal(bytes.readUInt16BE(4),16,"2014 original 18-byte APP0 length");
 assert.equal(bytes.subarray(6,11).toString("ascii"),"JFIF\u0000");
 const stripped=Buffer.concat([bytes.subarray(0,2),bytes.subarray(20)]);
 assert.equal(stripped.length,original.sizeBytes-18);
 const testHash=gitBlob(stripped);
 const start=bytes.indexOf(Buffer.from([0xff,0xc0]));
 assert.ok(start>0);
 const components=bytes[start+9];
 assert.ok(components===1||components===3);
 if(components===1)grayOriginal++; else colourOriginal++;
 const difference=original.sizeBytes-ref.mirrorBytes;
 assert.equal(ref.diffBytes,difference);
 if(ref.relation==="expected_jfif_app0_18_only"){
   assert.equal(difference,18);
   assert.equal(components,3);
   assert.equal(testHash,ref.mirrorGitBlob,"Expected exact header-only mirror transform p"+n);
   strippedOnly++;
 }else{
   assert.equal(ref.relation,"modified_beyond_jfif_app0");
   assert.ok(difference>18);
   assert.equal(components,1);
   assert.notEqual(testHash,ref.mirrorGitBlob,"Unexpected exact match on modified page p"+n);
   altered++;
 }
 pageStats.push({p:n,componentCount:components,difference,headOnly:ref.relation==="expected_jfif_app0_18_only"});
}
assert.deepEqual([strippedOnly,altered,colourOriginal,grayOriginal],[35,23,35,23]);
assert.equal(delta.imageDifference.standardJfifApp0Only,35);
assert.equal(delta.imageDifference.additionalUnexplainedModifications,23);
const html=read("resources/historical/stage11-2014-index.html");
assert.equal(html.length,1640);
assert.equal(gitBlob(html),delta.periodSource.indexGitBlob);
assert.equal(html.at(-1),10);
assert.equal(gitBlob(html.subarray(0,-1)),delta.modernMirror.indexGitBlob);
for(let i=0;i<58;i++){
 const source='<img src="'+i+'.jpg" />';
 assert.ok(html.toString("utf8").includes(source),"Original HTML missing "+source);
}
assert.equal(gitBlob(read("resources/historical/cicada2014-stage11-message.asc")),
 delta.signedHandoff.originalGitBlob);
console.log(JSON.stringify({
 status:"verified 58 original Stage11 JPEG bytes vs modern archive inventory",
 jfifOnlyMirrorExactSha:35,
 additionalMirrorBytesDiffer:23,
 originalJpegOriginalColor:35,
 originalJpegOriginalGrayscale:23,
 affectedOriginalPages:pageStats.filter(x=>!x.headOnly).map(x=>x.p),
 indexChange:"one missing final LF, exact Git blob",
 sourceSignedHandoff:"original Git blob matches",
 historicalActionableNewKeyOrPlaintext:false
},null,2));
