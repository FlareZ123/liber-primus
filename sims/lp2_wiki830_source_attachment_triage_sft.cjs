"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const API = "https://uncovering-cicada.fandom.com/api.php";
const ARCHIVE = "https://api.github.com/repos/cicada-solvers/The-Complete-Cicada3301-Archive/git/trees/main?recursive=1";
const OUTPUT = path.resolve("im-results/wiki-source-triage");
const HEADERS = { "user-agent": "Mozilla/5.0 (Cicada source census; read-only)",
  accept: "application/json,text/html,*/*" };
const HOSTS = new Set(["static.wikia.nocookie.net", "vignette.wikia.nocookie.net",
  "images.wikia.com", "uncovering-cicada.fandom.com"]);
const TARGET = /(?:stage.?11|2014.?onion.?7|59(?:\.|_|\b)|next|signed|hash|continuation)/i;
const TOPIC = /(?:liber|primus|onion|2014|2015|2016|2017|stage|signed|message|hash|continuation|unreleased|secret|key|59|58|tor|deep.?web|cicada|3301)/i;

/** @param {string} url @param {Record<string,string>} extras */
async function load(url, extras = {}) {
  const response = await fetch(url, {headers:{...HEADERS,...extras},
    signal:AbortSignal.timeout(25000)});
  if (!response.ok) throw new Error("HTTP " + response.status + " at " + new URL(url).hostname);
  return response;
}

/** @param {string} name */
function norm(name) {
  return path.basename(name).replace(/^File:/i,"").toLowerCase().replace(/[^a-z0-9]/g,"");
}

/** @param {{name:string,timestamp:string,size:number}} im */
function priority(im) {
  let n=im.name.replace(/[_\-.]/g," ");
  return (TOPIC.test(n)?15:0)+(TARGET.test(im.name)?30:0)+
    (/\.(bin|zip|7z|rar|asc|pgp|gpg|pdf|txt|html|pcap|dat|json)$/i.test(im.name)?30:0)+
    (/^201[3-6]/.test(im.timestamp)?20:0)+(im.size>0&&im.size<=10000000?1:0);
}

/** @param {string} file @param {Buffer|string} data */
function writeAtomic(file,data) {
  const temp=file+".partial-"+process.pid;
  fs.writeFileSync(temp,data,{flag:"wx"});
  fs.renameSync(temp,file);
}

async function wikiList() {
  let all=[],next={};
  for(;;) {
    const query=new URLSearchParams({action:"query",list:"allimages",ailimit:"500",
      aiprop:"url|sha1|size|timestamp",format:"json",...next});
    const response=await load(API+"?"+query.toString());
    const data=await response.json();
    assert(Array.isArray(data.query?.allimages),"unexpected wiki API data");
    all.push(...data.query.allimages);
    console.log("Wiki listed",all.length);
    if(!data.continue) return all;
    next=data.continue;
    assert(all.length<=3000,"unexpected wiki pagination");
  }
}

async function archiveList() {
  const headers=process.env.GITHUB_TOKEN?
    {authorization:"Bearer "+process.env.GITHUB_TOKEN}:{};
  const response=await load(ARCHIVE,headers);
  const result=await response.json();
  assert(Array.isArray(result.tree)&&!result.truncated,"archive tree unavailable");
  return result.tree.filter(e=>e.type==="blob");
}

/** @param {Array<any>} images */
async function fetchCandidates(images) {
  const candidates=images.filter(im=>priority(im)>=15&&im.size>0&&im.size<=10000000)
    .sort((a,b)=>priority(b)-priority(a)||a.name.localeCompare(b.name)).slice(0,35);
  const outcomes=[];
  for(const im of candidates) {
    const url=new URL(im.url);
    if(!HOSTS.has(url.hostname)) {
      outcomes.push({name:im.name,status:"host-blocked",host:url.hostname});
      continue;
    }
    try {
      const response=await load(url.toString(),
        {referer:"https://uncovering-cicada.fandom.com/"});
      const bytes=Buffer.from(await response.arrayBuffer());
      const sha1=crypto.createHash("sha1").update(bytes).digest("hex");
      const valid=sha1===im.sha1;
      if(valid) writeAtomic(path.join(OUTPUT,im.name.replace(/[^a-z0-9._-]/gi,"_").slice(0,120)),bytes);
      outcomes.push({name:im.name,status:valid?"verified":"sha1-mismatch",
        sha1,publishedSha1:im.sha1,bytes:bytes.length});
    } catch(error) {
      outcomes.push({name:im.name,status:"unavailable",detail:String(error).slice(0,160)});
    }
    console.log("Downloaded candidate",outcomes.length,candidates.length,
      outcomes.at(-1).status,im.name);
  }
  return outcomes;
}

async function main() {
  if(process.argv.includes("--selftest")) {
    assert.equal(norm("2014/pages/Liber_Primus.JPG"),"liberprimusjpg");
    assert(priority({name:"2014-onion7-signed.asc",timestamp:"2014-01-01",size:300})>=70);
    assert.equal(crypto.createHash("sha1").update("abc").digest("hex"),
      "a9993e364706816aba3e25717850c26c9cd0d89d");
    console.log("SELFTEST PASS");
    return;
  }
  fs.mkdirSync(OUTPUT,{recursive:true});
  const lock=path.join(OUTPUT,".source-lock");
  const fd=fs.openSync(lock,"wx");
  try {
    const images=await wikiList();
    const archive=await archiveList();
    const names=new Set(archive.map(e=>norm(e.path)));
    const unknown=images.filter(im=>!names.has(norm(im.name)))
      .sort((a,b)=>priority(b)-priority(a)||a.name.localeCompare(b.name));
    const known=images.length-unknown.length;
    const downloads=await fetchCandidates(unknown);
    const byExt={},byYear={};
    for(const im of images){
      const ext=im.name.split(".").pop().toLowerCase();
      const year=String(im.timestamp).slice(0,4);
      byExt[ext]=(byExt[ext]||0)+1;
      byYear[year]=(byYear[year]||0)+1;
    }
    const report={source:API,images:images.length,archiveFiles:archive.length,
      wikiNameMatchesInArchive:known,wikiNamesAbsentFromArchive:unknown.length,
      fileTypes:byExt,uploadYears:byYear,downloads,
      highestPriority:unknown.slice(0,150).map(im=>({
        name:im.name,size:im.size,sha1:im.sha1,timestamp:im.timestamp,
        priority:priority(im),url:im.url}))};
    writeAtomic(path.join(OUTPUT,"source-index.json"),JSON.stringify(images,null,2));
    writeAtomic(path.join(OUTPUT,"triage.json"),JSON.stringify(report,null,2));
    console.log("FINAL_SUMMARY",JSON.stringify({images:images.length,
      known,unmatched:unknown.length,downloads:downloads.length,
      verified:downloads.filter(x=>x.status==="verified").length,
      unavailability:downloads.filter(x=>x.status==="unavailable").length}));
  } finally {
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

main().catch(error=>{
  console.error("ORIGINAL-CORPUS-TRIAGE-ERROR",String(error));
  process.exitCode=1;
});
