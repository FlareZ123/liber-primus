#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const assert = require("assert");
const input = process.argv[2] || path.join(__dirname, "../resources/external/Liber Primus 57.txt");
const bytes = fs.readFileSync(input);
const gitBlobSha = crypto.createHash("sha1").update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`), bytes])).digest("hex");
assert.strictEqual(gitBlobSha, "4d346cd5c0c85dac71624cc2ad3c100f963404bc");
const lines = bytes.toString("utf8").split(/\r?\n/);
const counts = {10:{total:0,inline:0,eol:0},13:{total:0,inline:0,eol:0},23:{total:0,inline:0,eol:0}};
let page=null;
for(let i=0;i<lines.length;i++){
 const pm=/^%(\d{2})$/.exec(lines[i].trim()); if(pm){page=Number(pm[1]);continue;}
 if(page===null)continue;
 for(const m of lines[i].matchAll(/᛭⁕|⁕|᛭/gu)){
  const type=m[0]==="᛭⁕"?23:m[0]==="⁕"?13:10;
  const rest=lines[i].slice(m.index+m[0].length).replace(/[\]\s]/gu,"");
  counts[type].total++; counts[type][rest.length?"inline":"eol"]++;
 }
}
assert.deepStrictEqual([counts[13].total,counts[13].inline,counts[13].eol],[31,15,16]);
assert.deepStrictEqual([counts[10].total,counts[10].inline,counts[10].eol],[4,1,3]);
assert.deepStrictEqual([counts[23].total,counts[23].inline,counts[23].eol],[1,0,1]);
console.log(JSON.stringify({gitBlobSha,counts},null,2));
