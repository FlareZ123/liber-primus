"use strict";

/**
 * Frozen source-page preimage gate for the solved LP2 p56 "AN END" hash.
 * Tests the original seventh-onion HTML, its id=331 DOM fragment, and the
 * 58 original JPEG payloads in their exact index.html display order.
 * Run from the repository root:
 *   node sims/onion7_index_an_end_digest_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "resources", "cicada2014-onion7-index.html"));
const target = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
const expectedBlob = "303db130705f0ef9be2a738f4336d5cfcebde80c";
const expectedImageConcatSha512 = "527c81dcf2b0efb4e62c1fad28cd80c86723c8ded52b39a07742bcc300604a3205bb60080d51aa1d70dce82ac5394d2fec3758b242362c8ac57ef0473d1fcc50";

/** @param {Buffer} data @param {string} algorithm @returns {string} */
function digest(data, algorithm) {
  return crypto.createHash(algorithm).update(data).digest("hex");
}

/** @param {Buffer} data @returns {string} */
function gitBlobSha(data) {
  return digest(Buffer.concat([
    Buffer.from("blob " + data.length + "\0", "utf8"), data
  ]), "sha1");
}

assert.equal(source.length, 1640);
assert.equal(gitBlobSha(source), expectedBlob);
assert.match(target, /^[0-9a-f]{128}$/);

const openTag = Buffer.from('<div id="331">', "utf8");
const closeTag = Buffer.from("</div>", "utf8");
const divStart = source.indexOf(openTag);
const divEnd = source.indexOf(closeTag, divStart);
assert.ok(divStart >= 0 && divEnd > divStart);
const divInclusive = source.subarray(divStart, divEnd + closeTag.length);
const divInner = source.subarray(divStart + openTag.length, divEnd);
assert.equal(divInclusive.length, 1577);
assert.equal(divInner.length, 1557);

const imageFiles = Array.from({length:58}, (_, i) =>
  path.join(root, "resources", "liber-primus", String(i + 17) + ".jpg"));
const imageBuffers = imageFiles.map(file => fs.readFileSync(file));
const imageConcat = Buffer.concat(imageBuffers);
assert.equal(imageBuffers.length, 58);
assert.equal(imageConcat.length, 35362230);
assert.equal(digest(imageConcat, "sha512"), expectedImageConcatSha512);

const candidates = [
  {name:"original-lf", bytes:source},
  {name:"original-crlf", bytes:Buffer.from(source.toString("utf8").replace(/\n/g, "\r\n"))},
  {name:"trailing-whitespace-trim", bytes:Buffer.from(source.toString("utf8").trimEnd())},
  {name:"id331-div-inclusive", bytes:divInclusive},
  {name:"id331-div-inner-html", bytes:divInner},
  {name:"58-image-payload-concat-page-order", bytes:imageConcat}
];
const algorithms = ["sha512", "sha3-512", "blake2b512"];
const results = candidates.flatMap(({name,bytes}) =>
  algorithms.map(algorithm => ({
    candidate:name,
    bytes:bytes.length,
    algorithm,
    hash:digest(bytes, algorithm)
  }))
);
assert.equal(results.length, 18);
assert.equal(results.filter(x => x.hash === target).length, 0);
assert.equal(results.find(x => x.candidate === "original-lf" && x.algorithm === "sha512").hash,
  "83e50c118edb70dc34c9c760e332830a066b82006ebbbdcc7347b818d1961a571f32ef5a3717e98e282754d4a004dc0f7f0d99fb3824bb1b281a947c7ba70a31");
assert.equal(results.find(x => x.candidate === "id331-div-inclusive" && x.algorithm === "sha512").hash,
  "f0241399337616cb25f3b59ec19a351418da61945a0ea85a6f8d79f796a4a0406f00be860871c06aa5cbe3688619e544baf53d3b52e7e778eadd4636e465c684");
assert.equal(results.find(x => x.candidate === "id331-div-inner-html" && x.algorithm === "sha512").hash,
  "a92b0a7928dcf89009e937cfc70b75b2a975e0c05df32399c23ddb09169ca1abd24f290f1543ad51b20544dcbebd99cc875596a34085c1da9c3e7f83af72edbb");

console.log(JSON.stringify({
  source:"resources/cicada2014-onion7-index.html",
  originalBytes:source.length,
  originalGitBlobSha:gitBlobSha(source),
  target,
  id331DivBytes:divInclusive.length,
  id331InnerHtmlBytes:divInner.length,
  imageCount:imageBuffers.length,
  imageConcatBytes:imageConcat.length,
  imageConcatSha512:digest(imageConcat, "sha512"),
  comparisons:results,
  matchingPreimages:0,
  conclusion:"The exact archived HTML, its id=331 element and inner HTML, and the ordered 58-image payload concatenation are not direct preimages under the declared digest algorithms."
},null,2));
