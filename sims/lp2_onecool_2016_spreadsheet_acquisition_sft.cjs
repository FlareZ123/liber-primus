"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");

const ID = "0BzOKQofOkvB3YmR1cjJCZGNCdXM";

/** @param {string} url */
async function grab(url) {
  try {
    const r = await fetch(url, {
      redirect:"follow",
      headers:{"User-Agent":"Mozilla/5.0 liber-primus-source-acquisition/1.0"},
      signal:AbortSignal.timeout(30000),
    });
    const b = Buffer.from(await r.arrayBuffer());
    return {
      url,
      final_url:r.url,
      status:r.status,
      ok:r.ok,
      content_type:r.headers.get("content-type"),
      content_disposition:r.headers.get("content-disposition"),
      bytes:b.length,
      sha256:crypto.createHash("sha256").update(b).digest("hex"),
      prefix_hex:b.subarray(0,32).toString("hex"),
      prefix_text:b.subarray(0,500).toString("utf8").replace(/[\r\n]+/g," ").slice(0,300),
      body:b,
    };
  } catch (e) {
    return {url,status:0,ok:false,error:String(e),body:Buffer.alloc(0)};
  }
}

async function main() {
  const urls = [
    `https://drive.google.com/open?id=${ID}`,
    `https://drive.google.com/uc?export=download&id=${ID}`,
    `https://drive.usercontent.google.com/download?id=${ID}&export=download&confirm=t`,
    `https://docs.google.com/spreadsheets/d/${ID}/export?format=xlsx`,
    `https://docs.google.com/spreadsheets/d/${ID}/export?format=csv`,
    `https://docs.google.com/spreadsheets/d/${ID}/edit`,
  ];

  const rs=[];
  for (const u of urls) rs.push(await grab(u));

  const unique=new Map();
  for(const r of rs){
    if(r.bytes>0 && !unique.has(r.sha256)) unique.set(r.sha256,r);
  }

  const outDir=process.env.RUNNER_TEMP || os.tmpdir();
  for(const [hash,r] of unique){
    const ext=(r.content_type||"").includes("spreadsheet")||r.prefix_hex.startsWith("504b0304")?".xlsx":
      (r.content_type||"").includes("csv")?".csv":".bin";
    fs.writeFileSync(path.join(outDir,`onecool-2016-${hash.slice(0,16)}${ext}`),r.body);
  }

  const summary=rs.map(({body,...r})=>r);
  fs.writeFileSync(path.join(outDir,"source-test-output.json"),JSON.stringify({id:ID,results:summary},null,2));
  console.log(JSON.stringify({id:ID,results:summary},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
