"use strict";
/** Original Onion6 three-square form/response contract.
 *  Node.js 20+; zero dependencies. Run:
 *    node sims/cicada2014_onion6_form_response_sft.cjs
 * Archived HTML is a later sourced witness, not a signed server POST transcript.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname,"..");
const source = JSON.parse(fs.readFileSync(path.join(root,
  "resources/external/cicada2014-onion6-magic-form-and-response.json"),"utf8"));
const [formFile, responseFile] = source.files;
function gitBlobSha(text) {
  const b = Buffer.from(text,"utf8");
  return crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex");
}
assert.equal(gitBlobSha(formFile.raw_html),formFile.original_git_blob_sha1);
assert.equal(gitBlobSha(responseFile.raw_html),responseFile.original_git_blob_sha1);
const form = formFile.raw_html;
const response = responseFile.raw_html;
assert.match(form, /<form\s+method="post"\s+action="\/cgi-bin\/squares">/i);
const squareFields = [...form.matchAll(/<textarea\s+name="([^"]+)"><\/textarea>/g)]
  .map(m=>m[1]);
assert.deepEqual(squareFields,["53301","71033","51033"]);
assert.match(form,/<input\s+type="text"\s+name="onion"\s*\/>/);
const images = [...response.matchAll(/<img\s+src="([^"]+)"\s*\/>/g)]
  .map(m=>m[1]);
assert.deepEqual(images,["/107.jpg","/167.jpg","/229.jpg"]);
assert.match(response, /Thank you for you submission/);

const raw = fs.readFileSync(path.join(root,
 "resources/cicada2014-openpuff-magic-squares.txt"),"utf8");
const squares = raw.trim().split(/\r?\n\s*\r?\n/).map(block=>
  block.trim().split(/\r?\n/).map(line=>line.trim().split(/\s+/).map(Number)));
assert.equal(squares.length,3);
const expected = [{n:5,sum:3301,field:"53301"},{n:7,sum:1033,field:"71033"},
                  {n:5,sum:1033,field:"51033"}];
for(let s=0;s<3;s++) {
 const grid=squares[s], {n,sum,field}=expected[s];
 assert.equal(squareFields[s],field);
 assert.equal(grid.length,n);
 assert.ok(grid.every(row=>row.length===n));
 for(const row of grid)assert.equal(row.reduce((a,b)=>a+b,0),sum);
 for(let col=0;col<n;col++)assert.equal(grid.reduce((a,row)=>a+row[col],0),sum);
 assert.equal(grid.reduce((a,row,i)=>a+row[i],0),sum);
 assert.equal(grid.reduce((a,row,i)=>a+row[n-i-1],0),sum);
}
console.log(JSON.stringify({
 sourceArchive:source.source_repository,
 formMethod:"POST",formAction:"/cgi-bin/squares",
 squareFields,additionalField:"onion",
 squareOrdersAndSums:expected,
 responseHtmlGitBlobSha:responseFile.original_git_blob_sha1,
 responsePageImages:images,
 hasOriginalServerHttpRequestOrResponseHeaders:false,
 knownContinuation:"First-release Liber Primus final three pages (LP1 pages 14–16)",
 remainingOriginalLp2DecryptKey:"none"
},null,2));
