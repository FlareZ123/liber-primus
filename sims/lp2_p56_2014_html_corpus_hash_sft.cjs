"use strict";
/*
 * Exact-byte candidate gate for the p56 128-hex deep-web digest.
 * Source: krisyotam/cicada3301, pinned to commit 76d3ee8c762f60025822c8c05edbf31351636469
 * (GPL-3.0 community archive). This checks 17 unique 2014 HTML page blobs
 * discovered among 49 relevant 2014/onion HTML paths. It does not normalize
 * HTML, extract bodies, or guess missing HTTP wrappers.
 *
 * Run from repository root:
 *   node sims/lp2_p56_2014_html_corpus_hash_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const ARCHIVE = "krisyotam/cicada3301";
const COMMIT = "76d3ee8c762f60025822c8c05edbf31351636469";
const TARGET = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
const CANDIDATES = [
  {
    "label": "stage02",
    "path": "archives/cijhho/assets/2014/stage02/auqgnxjtvdbll3pv.onion/index.html",
    "size": 104,
    "blob": "807541d764ed33c976717b7ee2d08ac0720ce56b"
  },
  {
    "label": "stage03",
    "path": "archives/cijhho/assets/2014/stage03/cu343l33nqaekrnw.onion/index.html",
    "size": 541,
    "blob": "c979fa7e23de1b04b502467da75ff5b506b97ff8"
  },
  {
    "label": "stage04",
    "path": "archives/cijhho/assets/2014/stage04/fv7lyucmeozzd5j4.onion/index.html",
    "size": 524,
    "blob": "81837b8d5e89f6a31731b84a217a6fdeaa62aff8"
  },
  {
    "label": "stage05",
    "path": "archives/cijhho/assets/2014/stage05/avowyfgl5lkzfj3n.onion/index.html",
    "size": 615,
    "blob": "69958517953dba63b8f5f76f34dda2c1967be01c"
  },
  {
    "label": "stage06",
    "path": "archives/cijhho/assets/2014/stage06/avowyfgl5lkzfj3n.onion/index.html",
    "size": 5149029,
    "blob": "f8b6e108b8dab4fa095356f73a4f53e41918cb55"
  },
  {
    "label": "stage07",
    "path": "archives/cijhho/assets/2014/stage07/q4utgdi2n4m4uim5.onion/index.html",
    "size": 13526359,
    "blob": "afb1ae7b8ffe2def6d1cd7a2f7ce961e550331b9"
  },
  {
    "label": "stage09",
    "path": "archives/cijhho/assets/2014/stage09/ut3qtzbrvs7dtvzp.onion/index.html",
    "size": 8623291,
    "blob": "eeabba07a9a97d5446cbf6bddc6f6bf4f18d13ff"
  },
  {
    "label": "stage10",
    "path": "archives/cijhho/assets/2014/stage10/ut3qtzbrvs7dtvzp.onion/index.html",
    "size": 1943,
    "blob": "9d7c35bc8fff24c8079668c9d070d98277502f7c"
  },
  {
    "label": "stage11",
    "path": "archives/cijhho/assets/2014/stage11/ky2khlqdf7qdznac.onion/index.html",
    "size": 1640,
    "blob": "303db130705f0ef9be2a738f4336d5cfcebde80c"
  },
  {
    "label": "onion5-post",
    "path": "tools/solvers/ibotpeaches/onions/q4utgdi2n4m4uim5.onion/post/index.html",
    "size": 359282,
    "blob": "58de2bf93cc61e6817f7cae98afd690df9b9d039"
  },
  {
    "label": "clearnet-post",
    "path": "tools/solvers/ibotpeaches/onions/845145127.com/post/index.html",
    "size": 1218,
    "blob": "be032ea7308bf3996827c542075b4726df6f1247"
  },
  {
    "label": "clearnet-post2",
    "path": "tools/solvers/ibotpeaches/onions/845145127.com/post2/index.html",
    "size": 7978,
    "blob": "73f2663258713fe31fd05150926137e983e80b10"
  },
  {
    "label": "cu343-pre",
    "path": "tools/solvers/ibotpeaches/onions/cu343l33nqaekrnw.onion/pre/index.html",
    "size": 524,
    "blob": "0de51aaeed32a13e37f1166e6709f04e277bcc35"
  },
  {
    "label": "fv7-pre",
    "path": "tools/solvers/ibotpeaches/onions/fv7lyucmeozzd5j4.onion/pre/index.html",
    "size": 525,
    "blob": "75dd2a3a0c291a9113c72cd74d7a61fbdfff87fb"
  },
  {
    "label": "ky2-post",
    "path": "tools/solvers/ibotpeaches/onions/ky2khlqdf7qdznac.onion/post/index.html",
    "size": 1872,
    "blob": "ca32c61d6ade50bc4dbc715bf637629f4e0d19ca"
  },
  {
    "label": "ut3-post",
    "path": "tools/solvers/ibotpeaches/onions/ut3qtzbrvs7dtvzp.onion/post/index.html",
    "size": 1980,
    "blob": "e2eefba48af2006957072f60bfdeabb4f27b28f4"
  },
  {
    "label": "ut3-post2",
    "path": "tools/solvers/ibotpeaches/onions/ut3qtzbrvs7dtvzp.onion/post2/index.html",
    "size": 152,
    "blob": "d71303af76016c8e88ed5dcc8a18b08e6276a437"
  }
];
const encodePath = p => p.split("/").map(encodeURIComponent).join("/");
const gitBlobSHA1 = bytes => crypto.createHash("sha1")
  .update(Buffer.concat([Buffer.from("blob " + bytes.length + "\0"), bytes]))
  .digest("hex");
const algorithms = ["sha512","blake2b512"];
for (const name of algorithms) {
  if (!crypto.getHashes().includes(name)) throw new Error("Required hash unavailable: " + name);
}
async function main() {
  const results = [];
  for (const item of CANDIDATES) {
    const url = "https://raw.githubusercontent.com/" + ARCHIVE + "/" + COMMIT + "/" + encodePath(item.path);
    const response = await fetch(url, {headers:{"User-Agent":"liber-primus-p56-html-hash-sft"}});
    if (!response.ok) throw new Error(item.label + ": HTTP " + response.status + " for " + url);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(bytes.length,item.size,item.label + " byte length");
    const blob = gitBlobSHA1(bytes);
    assert.equal(blob,item.blob,item.label + " Git blob SHA-1");
    const row = {
      label:item.label,path:item.path,bytes:bytes.length,gitBlobSHA1:blob,
      sha512:crypto.createHash("sha512").update(bytes).digest("hex"),
      blake2b512:crypto.createHash("blake2b512").update(bytes).digest("hex")
    };
    row.matches = {sha512:row.sha512===TARGET,blake2b512:row.blake2b512===TARGET};
    results.push(row);
  }
  const matches = results.filter(x=>x.matches.sha512||x.matches.blake2b512);
  console.log(JSON.stringify({
    source:{repository:ARCHIVE,commit:COMMIT,license:"GPL-3.0 community archive",relevantHTMLPaths:49,unique2014PageBlobs:CANDIDATES.length},
    target:TARGET,
    scope:"exact raw HTML bytes only; no HTML normalization, body extraction, URL hashing, wrapper guesses, or unpreserved response bytes",
    algorithms,comparisonCount:results.length*algorithms.length,matches:matches.length,
    classification:matches.length?"MATCH FOUND":"BOUNDED NEGATIVE: no exact 2014 HTML page blob matches under SHA-512 or BLAKE2b-512",
    results
  },null,2));
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1;});
