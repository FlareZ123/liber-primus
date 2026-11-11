#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const file = path.join(__dirname, "../resources/liber-primus/lp2-corpus.json");
const raw = fs.readFileSync(file);
const blobSha = createHash("sha1").update(Buffer.from(`blob ${raw.length}\\0`)).update(raw).digest("hex");
const expectedBlobSha = "054f2a0f780b7d46901acbe3d9bf4f0ac1801165";
assert.equal(blobSha, expectedBlobSha, "canonical corpus blob changed");
const corpus = JSON.parse(raw.toString("utf8"));
const pageNumbers = [40,41,42,43,44,45,46,47,48,49,51,52,53,54,55];
const pages = corpus.pages.filter(p => pageNumbers.includes(p.page)).sort((a,b)=>a.page-b.page);
assert.deepEqual(pages.map(p=>p.page), pageNumbers);
const roots = pages.map(p=>p.indices.at(-1));
assert.deepEqual(roots, [27,11,25,16,15,21,25,25,0,23,0,8,9,26,10]);
const body = pages.flatMap(p=>p.indices.slice(0,-1));
const firstEdgeBody = pages.flatMap(p=>p.indices.slice(1));
assert.equal(pages.reduce((n,p)=>n+p.indices.length,0),3316);
assert.equal(body.length,3301);
assert.equal(firstEdgeBody.length,3301);
function prime(n){if(n<2)return false;for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true;}
const primes = Array.from({length:3300},(_,i)=>i+2).filter(prime);
assert.equal(primes.length,464);
assert.equal(primes[173],1033);
assert.equal(primes.at(-1),3301);
const sample = primes.map(p=>body[p-1]);
const firstControl = primes.map(p=>firstEdgeBody[p-1]);
const mod29=n=>((n%29)+29)%29;
function ioc(a){const counts=Array(29).fill(0);for(const x of a)counts[x]++;return counts.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));}
const tr=a=>a.map(i=>corpus.translit[i]).join("");
const keyCases=[];
for(const [direction,fn] of [
 ["C-K",(c,k,p)=>mod29(c-k[p%k.length])],
 ["C+K",(c,k,p)=>mod29(c+k[p%k.length])],
 ["K-C",(c,k,p)=>mod29(k[p%k.length]-c)]
]){
 const decoded=body.map((c,p)=>fn(c,roots,p));
 const inherited=primes.map(p=>fn(body[p-1],roots,p-1));
 assert.deepEqual(inherited,primes.map(p=>decoded[p-1]));
 keyCases.push({direction,body_ioc:ioc(decoded),inherited_prime_sample_ioc:ioc(inherited),body_prefix:tr(decoded.slice(0,96)),sample_prefix:tr(inherited.slice(0,96))});
}
console.log(JSON.stringify({
 corpus_git_blob_sha:blobSha,
 selected_pages:pageNumbers,
 raw_rune_count:3316,
 body_length:body.length,
 roots,
 roots_transliteration:tr(roots),
 prime_count:primes.length,
 prime_sample_length:sample.length,
 prime_sample_ioc:ioc(sample),
 prime_sample_prefix:tr(sample.slice(0,120)),
 first_edge_control_length:firstEdgeBody.length,
 first_edge_sample_ioc:ioc(firstControl),
 root_key_cases:keyCases,
 interpretation:"No GP-English plaintext. The 3301 length match is not discriminating: first-edge deletion also gives 3301 and a similarly flat prime sample."
},null,2));
