"use strict";
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const assert=require("node:assert/strict");

/**
 * Source-exact, fixed-scope scan of original wiki uploads dated 2013–2016.
 * Excludes already archived byte-identical artifacts by the pinned SHA-1 index.
 * No PNG/JPEG recompression or transformed CDN data is ever scored as original.
 */
const SOURCE="resources/historical/uncovering-cicada-wiki-830-index-20261113.json";
const OUTPUT="im-results/wiki-historical-byte-scan";
const HOSTS=new Set(["static.wikia.nocookie.net","vignette.wikia.nocookie.net",
  "images.wikia.com","uncovering-cicada.fandom.com"]);
const MARKERS=["-----BEGIN PGP SIGNED MESSAGE-----","-----BEGIN PGP MESSAGE-----",
  "-----BEGIN PGP PUBLIC KEY BLOCK-----", "BEGIN RSA PRIVATE KEY", "onion"];
const MAGIC=[
  ["jpeg",Buffer.from([0xff,0xd8,0xff])],
  ["png",Buffer.from([137,80,78,71,13,10,26,10])],
  ["gif",Buffer.from("GIF8")],
  ["pdf",Buffer.from("%PDF-")],
  ["zip",Buffer.from([80,75,3,4])]
];

/** @param {Buffer} bytes */
function identify(bytes) {
  for(const [name,signature] of MAGIC) {
    if(bytes.subarray(0,signature.length).equals(signature))return name;
  }
  return "other";
}

/** @param {Buffer} bytes @param {string} type */
function trailing(bytes,type) {
  if(type==="jpeg") {
    const index=bytes.lastIndexOf(Buffer.from([0xff,0xd9]));
    return index<0?null:bytes.length-(index+2);
  }
  if(type==="png") {
    const footer=Buffer.from([0,0,0,0,73,69,78,68,174,66,96,130]);
    const index=bytes.lastIndexOf(footer);
    return index<0?null:bytes.length-(index+footer.length);
  }
  if(type==="gif") {
    const index=bytes.lastIndexOf(0x3b);
    return index<0?null:bytes.length-(index+1);
  }
  return null;
}

/** @param {string} file @param {string} body */
function atomicWrite(file,body) {
  const tmp=file+".partial-"+process.pid;
  fs.writeFileSync(tmp,body,{flag:"wx"});
  fs.renameSync(tmp,file);
}

/** @param {Record<string,any>} source */
async function one(source) {
  const origin=new URL(source.url);
  if(!HOSTS.has(origin.hostname)) return {name:source.name,status:"outside-source-host"};
  const urls=[origin.toString(),origin.toString().split("/revision/")[0]];
  urls.push(urls[1]+"/revision/latest?format=original");
  let last={name:source.name,status:"unavailable"};
  for(const url of urls) {
    try {
      const r=await fetch(url,{headers:{"user-agent":"Mozilla/5.0 (read-only source integrity survey)",
        "referer":"https://uncovering-cicada.fandom.com/"},
        signal:AbortSignal.timeout(12000)});
      if(!r.ok) {last={name:source.name,status:"http-"+r.status};continue;}
      const length=Number(r.headers.get("content-length")||0);
      if(length>12000000) return {name:source.name,status:"oversized"};
      const bytes=Buffer.from(await r.arrayBuffer());
      if(bytes.length>12000000) return {name:source.name,status:"oversized"};
      const digest=crypto.createHash("sha1").update(bytes).digest("hex");
      if(digest!==source.sha1) {
        last={name:source.name,status:"transformed",observedBytes:bytes.length,
          sourceBytes:source.size,observedSHA1:digest};
        continue;
      }
      const type=identify(bytes);
      const extra=trailing(bytes,type);
      const matches=MARKERS.filter(s=>bytes.includes(Buffer.from(s)));
      const unusual=(extra!==null&&extra>16)||matches.length>0||(type==="other"&&bytes.length>100);
      const verdict={name:source.name,status:"verified",date:source.uploaded.slice(0,10),
        sha1:digest,bytes:bytes.length,type,trailerBytes:extra,
        textMarkers:matches,unusual};
      if(unusual) {
        const file=path.join(OUTPUT,"flagged",source.name.replace(/[^A-Za-z0-9._-]/g,"_"));
        fs.mkdirSync(path.dirname(file),{recursive:true});
        const tmp=file+".partial-"+process.pid;
        fs.writeFileSync(tmp,bytes,{flag:"wx"});
        fs.renameSync(tmp,file);
        verdict.savedFile=file;
        verdict.final64=bytes.subarray(-64).toString("hex");
      }
      return verdict;
    } catch(error) {
      last={name:source.name,status:"failed",reason:String(error).slice(0,130)};
    }
  }
  return last;
}

async function main(){
  if(process.argv.includes("--selftest")){
    const a=Buffer.from([0xff,0xd8,0xff,0,0xff,0xd9]);
    assert.equal(identify(a),"jpeg");
    assert.equal(trailing(a,"jpeg"),0);
    assert.equal(trailing(Buffer.concat([a,Buffer.from("OPENPGP")]),"jpeg"),7);
    const b=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),
      Buffer.from([0,0,0,0,73,69,78,68,174,66,96,130])]);
    assert.equal(trailing(b,"png"),0);
    console.log("WIKI_HISTORICAL_SELFTEST_PASS");
    return;
  }
  const index=JSON.parse(fs.readFileSync(SOURCE,"utf8"));
  assert(index.count===830 && index.files.length===830);
  const selected=index.files.filter(f=>f.uploaded>="2013-01-01"&&f.uploaded<"2017-01-01" &&
    !f.exactArchiveSHA1Match &&f.size>0&&f.size<=12000000);
  fs.mkdirSync(OUTPUT,{recursive:true});
  const lock=path.join(OUTPUT,".source.lock");
  const fd=fs.openSync(lock,"wx");
  try {
    let pointer=0,finished=0;
    const results=new Array(selected.length);
    const worker=async()=>{
      for(;;){
        const i=pointer++;
        if(i>=selected.length) return;
        results[i]=await one(selected[i]);
        finished++;
        if(finished%50===0) console.log("HISTORICAL_PROGRESS",finished,selected.length);
        if(results[i].unusual) console.log("AUTHENTIC_PAYLOAD_INDICATOR",JSON.stringify(results[i]));
      }
    };
    await Promise.all(Array.from({length:8},()=>worker()));
    const status={}; const types={}; let unusual=0;
    for(const item of results) {
      status[item.status]=(status[item.status]||0)+1;
      if(item.status==="verified"){
        types[item.type]=(types[item.type]||0)+1;
        unusual+=Number(item.unusual);
      }
    }
    const report={source:SOURCE,sourceCount:830,dateRule:"2013–2016 only",
      excludedIfExactArchivedSHA1:true,selectedCount:selected.length,
      status,verifiedTypes:types,unusualCount:unusual,
      results};
    atomicWrite(path.join(OUTPUT,"historical-original-byte-results.json"),
      JSON.stringify(report,null,2)+"\n");
    console.log("HISTORICAL_FINAL",JSON.stringify({selected:selected.length,status,
      types,unusual,flagged:results.filter(x=>x.unusual)}));
  } finally {
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}
main().catch(e=>{console.error("HISTORICAL_SOURCE_ERROR",String(e));process.exitCode=1;});
