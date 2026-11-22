"use strict";
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const assert=require("node:assert/strict");

/** Publish only source metadata, never unhashed wiki media bytes. */
async function main() {
  const token=process.env.GITHUB_TOKEN;
  assert(token,"Actions contents-write token required");
  const input=path.resolve("im-results/wiki-source-triage/source-index.json");
  const files=JSON.parse(fs.readFileSync(input,"utf8"));
  assert(files.length===830,"expected complete 830-image reference registry");
  const out={source:"https://uncovering-cicada.fandom.com/api.php",
    sourceAction:"query/list=allimages&aiprop=url|sha1|size|timestamp",
    retrievedUTC:"2026-11-13",
    attribution:"Uncovering Cicada Wiki contributors; MediaWiki API listing; CC BY-SA",
    scope:"File metadata only. Upload timestamps do not establish original puzzle authorship.",
    count:files.length,
    files:files.map(im=>({name:im.name,size:im.size,sha1:im.sha1,
      uploaded:im.timestamp,url:im.url,
      exactArchiveSHA1Match:!!im.archiveExactSHA1Match,
      archiveRelativePath:im.archiveRelativePath||null}))};
  const body=JSON.stringify(out,null,2)+"\n";
  const api="https://api.github.com/repos/FlareZ123/liber-primus/contents/resources/historical/uncovering-cicada-wiki-830-index-20261113.json";
  const headers={"authorization":"Bearer "+token,"accept":"application/vnd.github+json",
    "x-github-api-version":"2022-11-28","user-agent":"liber-primus-archive"};
  const pre=await fetch(api,{headers,signal:AbortSignal.timeout(20000)});
  if(pre.status===200) {
    console.log("Source registry already present; leaving immutable",api);
    return;
  }
  assert(pre.status===404,"unexpected contents GET "+pre.status);
  const response=await fetch(api,{method:"PUT",headers:{...headers,"content-type":"application/json"},
    body:JSON.stringify({message:"Agent 4: pin source-authentic 830-image Wiki attachment metadata",
      content:Buffer.from(body,"utf8").toString("base64"),branch:"main"}),
    signal:AbortSignal.timeout(30000)});
  const result=await response.json();
  assert(response.status===201,"GitHub upload failed "+response.status+" "+JSON.stringify(result).slice(0,400));
  console.log("PUBLISHED_REGISTRY",JSON.stringify({size:Buffer.byteLength(body),
    sha256:crypto.createHash("sha256").update(body).digest("hex"),
    commit:result.commit.sha,url:result.content.html_url}));
}
main().catch(e=>{console.error("REGISTRY_PUBLISH_FAILED",String(e));process.exitCode=1;});
