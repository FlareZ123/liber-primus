"use strict";
/**
 * Exact historical Ahmia 2014 test for Director #1610.
 * Run: node sims/lp2_candidate_onion_ahmia2014_exact_sft.cjs
 */
const assert = require("node:assert/strict");
const {createHash} = require("node:crypto");

const needle = "nz77w2upkfkyj4rh.onion";
const sources = [
  {
    name:"Ahmia initial_data.json",
    url:"https://raw.githubusercontent.com/juhanurmi/ahmia/7db4e805c072ff3e133aaab174815aaa1abb86d6/ahmia/fixtures/initial_data.json",
    gitBlob:"08102c19f74df5d47771dfae8f85ddd8b8b7173d",
    expectedBytes:2759554
  },
  {
    name:"Ahmia example_addresses.html",
    url:"https://raw.githubusercontent.com/juhanurmi/ahmia/c2e2aa4beef0f9fbad542eb2c15d4f0fc2760bc0/ahmia/tests/example_addresses.html",
    gitBlob:"548f8970a89ae780eb504852993261c655a9cb31",
    expectedBytes:1142829
  }
];

function gitBlobSha(bytes) {
  const header = Buffer.from(`blob ${bytes.length}\0`, "utf8");
  return createHash("sha1").update(header).update(bytes).digest("hex");
}

async function main() {
  const results=[];
  for (const source of sources) {
    const response=await fetch(source.url,{signal:AbortSignal.timeout(30000)});
    assert.equal(response.status,200,`${source.name} HTTP`);
    const bytes=Buffer.from(await response.arrayBuffer());
    assert.equal(bytes.length,source.expectedBytes,`${source.name} byte length`);
    assert.equal(gitBlobSha(bytes),source.gitBlob,`${source.name} pinned Git blob`);
    const lower=bytes.toString("utf8").toLowerCase();
    const labelHits=(lower.match(/nz77w2upkfkyj4rh/gu)||[]).length;
    const hostHits=(lower.match(/nz77w2upkfkyj4rh\.onion/gu)||[]).length;
    assert.equal(labelHits,0,`${source.name} exact label absent`);
    assert.equal(hostHits,0,`${source.name} exact host absent`);
    results.push({
      name:source.name,
      url:source.url,
      bytes:bytes.length,
      gitBlob:gitBlobSha(bytes),
      labelHits,
      hostHits
    });
  }
  process.stdout.write(JSON.stringify({
    needle,
    sourceDateContext:"Ahmia June 2014 fixture plus historical rendered address sample",
    results,
    verdict:"NO EXACT MATCH in these two pinned 2014 Ahmia source objects"
  },null,2)+"\n");
}
main().catch(error=>{console.error(error);process.exitCode=1;});
