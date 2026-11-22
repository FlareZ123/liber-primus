"use strict";
/**
 * A first-party historical-operation gate: what genuinely executable
 * instructions are carried from 2014 Stage10 to the LP2 Stage11 release?
 * Tests original archived HTML and the recovered historical Stage10 response.
 * node sims/cicada2014_stage10_stage11_real_operator_only_sft.cjs
 * No network, decoder key fit, or manufactured contemporary PGP-signature proof.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const crypto=require("node:crypto");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} filename */
const read=filename=>fs.readFileSync(path.join(root,filename));
/** @param {Buffer} data */
function gitBlobId(data) {
  return crypto.createHash("sha1").update(Buffer.from("blob "+data.length+"\0")).update(data).digest("hex");
}
/** @param {string} filename */
const readOriginalText=filename=>Buffer.from(read(filename).toString("utf8").replace(/\r\n/gu,"\n"),"utf8");
const htmlBytes=readOriginalText("resources/historical/cicada2014-stage10-original-form.html");
assert.equal(htmlBytes.length,1943);
assert.equal(gitBlobId(htmlBytes),"9d7c35bc8fff24c8079668c9d070d98277502f7c");
const html=htmlBytes.toString("utf8");
assert(html.includes("-----BEGIN PGP SIGNED MESSAGE-----"));
assert(html.includes("Please paste the magic squares into the appropriate textareas below"));
assert(html.includes("provide the URL to your Tor hidden service"));
assert(html.includes("The path to your CGI script which accepts uploads should be '/cgi-bin/upload'"));
assert(html.includes("file uploads should be named 'file'"));
assert(html.includes("place the public key\nin the location '/key.asc'"));
assert(html.includes("We will contact you soon."));
const match=/<form\s+method="([^"]+)"\s+action="([^"]+)"/iu.exec(html);
assert(match);
assert.deepEqual(match.slice(1),["post","/cgi-bin/squares"]);
const fields=[...html.matchAll(/<textarea\s+name="([^"]+)"/giu)].map(m=>m[1]);
assert.deepEqual(fields,["53301","71033","51033"]);
assert.match(html,/<input type="text" name="onion"\s*\/>/iu);
assert.match(html,/<input type="submit" value="Submit"\s*\/>/iu);
assert.doesNotMatch(html,/<script\b|onsubmit\s*=|onload\s*=|<iframe\b/iu);
const response=readOriginalText("resources/external/2014-stage10-post-square-response.html");
assert.equal(gitBlobId(response),"d71303af76016c8e88ed5dcc8a18b08e6276a437");
const delivered=[...response.toString("utf8").matchAll(/<img\s+src="\/([^"]+)"\s*\/>/giu)].map(m=>m[1]);
assert.deepEqual(delivered,["107.jpg","167.jpg","229.jpg"]);
const targets=["14.jpg","15.jpg","16.jpg"];
const verifiedImages=delivered.map((name,i)=>{
  const b=read("resources/liber-primus/"+targets[i]);
  const digest=gitBlobId(b);
  const expected=["28a1ac59a2f1f51d272e4e362c0c35b4be241347",
    "32952b7d28028f5fedffceace4de0e7eb688d3d6",
    "6f8059f7e8025bf3f51fceefe20be0cce8ce1e20"][i];
  assert.equal(digest,expected);
  return {stage10Image:name,identicalOriginalLP1Page:targets[i],gitBlobSha1:digest};
});
const stage11Bytes=readOriginalText("resources/historical/cicada2014-onion7-original-index.html");
assert.equal(stage11Bytes.length,1640);
assert.equal(gitBlobId(stage11Bytes),"303db130705f0ef9be2a738f4336d5cfcebde80c");
const stage11=stage11Bytes.toString("utf8");
assert.match(stage11,/<title>133<\/title>/u);
assert.match(stage11,/<div id="331">/u);
const images=[...stage11.matchAll(/<img src="(\d+)\.jpg"\s*\/>/gu)].map(m=>Number(m[1]));
assert.deepEqual(images,Array.from({length:58},(_,i)=>i));
assert.doesNotMatch(stage11,/<script\b|<form\b|<textarea\b|<iframe\b|<input\b/iu);
const release=read("resources/historical/cicada2014-stage11-message.asc").toString("utf8");
assert(release.includes("ky2khlqdf7qdznac.onion"));
assert(release.includes("We look forward to hearing from you."));
assert(!release.includes("decryption key"));
console.log(JSON.stringify({
  originalStage10Html:{bytes:htmlBytes.length,gitBlobSha1:gitBlobId(htmlBytes),
    signedInstructions:["submit three magic squares","host own Tor hidden service",
      "provide /cgi-bin/upload and input named file",
      "host own public GnuPG key /key.asc","expect server to contact you"],
    serverSidePostRoute:match[2],numericTextareas:fields,
    onionAddressField:"onion",clientExecutableScripts:0,
    originalServerImplementationPresent:false},
  historicallyArchivedResponse:{bytes:response.length,
    gitBlobSha1:gitBlobId(response),servedSourceImages:verifiedImages},
  originalStage11Release:{indexBytes:stage11Bytes.length,
    gitBlobSha1:gitBlobId(stage11Bytes),imageCount:images.length,
    originalHtmlCipherKeyFields:0,originalInlineCipherScripts:0,
    signedMessageReferencesPublishedOnion:true},
  separation:"Stage10 has an original actionable remote CGI contract and historical known returned LP1 JPEGs; Stage11 itself serves 58 JPEG pages. No local key generator or plain-LP2 cipher operation appears in these specific HTML/P﻿GP handoff containers. Server backend and any private replies are not in the original archives.",
  completion:"Finite 2014 Stage10->11 historical route reproduced with exact three delivered original source images, no LP2 plaintext recovered."
},null,2));
