"use strict";

/**
 * Search exact original 2014 IRC blobs for VERSIONED repository URLs.
 * Source-handle inventory for Director #900 (excluding Pastebin/rcrypto).
 * Node 22 CommonJS. Read-only; original Git-blob identities asserted.
 * Run with manual CommonJS workflow, no local source checkout changes.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

const sources = [
  ["#cicadasolvers.freenode.log",18487233,"bdd277c14f94c34b5ae714cd00c238065beeed4e"],
  ["#33012014.freenode.log",8629610,"a2880b1db31ce523599ef30ca2e55291bf295900"],
  ["#cicadasolvers.freenode.2.log",27234234,"72634a9d071d32af767edbffc0493d810e88cd0d"]
];
const ref = "ade9a02889ef8acbc8cde8edbfd0a785c369f4c3";
function blob(b) {
  return crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex");
}
function extractRepos(line) {
  const list=[];
  const re=/(?:https?:\/\/|git:\/\/)(?:www\.)?(?:github\.com|gist\.github\.com|bitbucket\.org|code\.google\.com|sourceforge\.net|gitlab\.com)\/[^\s<>'"()[\]{}]+/gi;
  for(const m of line.matchAll(re)){
    const u=m[0].replace(/[.,;:!?]+$/,"");
    const parsed=new URL(u);
    const p=parsed.pathname.split("/").filter(Boolean);
    // Github two-component repository with optional commit/subpath.
    let host=parsed.host.toLowerCase();
    let handle=host==="gist.github.com"
      ?host+"/"+p.slice(0,2).join("/")
      :host+"/"+p.slice(0,2).join("/");
    if(p.length>=2 || host==="gist.github.com")list.push({url:u,handle});
  }
  return list;
}
async function main() {
  assert.equal(extractRepos("2014 May 19 http://github.com/example/repo/blob/123/x.py").length,1);
  const byHandle=new Map();
  const candidates=[];
  let allLinks=0,dated=0;
  for (const [name,len,sha] of sources) {
    const url="https://raw.githubusercontent.com/neuroretransmit/cicada/"+ref+"/irc-logs/"+encodeURIComponent(name);
    const response=await fetch(url);
    assert.equal(response.status,200,"raw source "+name);
    const b=Buffer.from(await response.arrayBuffer());
    assert.equal(b.length,len,"size "+name);
    assert.equal(blob(b),sha,"source Git blob "+name);
    const lines=b.toString("latin1").split(/\r?\n/);
    for(let i=0;i<lines.length;i++){
      if(!/^2014 (?:May|Jun|Jul|Aug) /.test(lines[i]))continue;
      dated++;
      const found=extractRepos(lines[i]);
      if(!found.length)continue;
      allLinks+=found.length;
      const nearby=lines.slice(Math.max(0,i-3),Math.min(lines.length,i+4)).join(" ");
      const direct=/(?:liber.?primus|lp2|rune|decrypt|decipher|cicada|3301|cipher|crypto|primus|wiki|gematria|p56)/i.test(lines[i]);
      const context=/(?:liber.?primus|lp2|rune|decrypt|decipher|cicada|3301|cipher|crypto|primus|page 0|page 55)/i.test(nearby);
      for(const {url,handle} of found){
        if(!byHandle.has(handle))byHandle.set(handle,{handle,count:0,records:[]});
        const h=byHandle.get(handle);
        h.count++;
        const sample={file:name,line:i+1,url,text:lines[i].slice(0,420),direct,context};
        if(h.records.length<9)h.records.push(sample);
        if(context)candidates.push(sample);
      }
    }
    console.log("ARCHIVE "+name+" verified "+len+" bytes; scanned "+lines.length+" source lines");
  }
  const ranked=[...byHandle.values()].map(h=>({
    ...h,
    priority:Math.max(...h.records.map(r=>Number(r.direct)*4+Number(r.context)*2)),
  })).sort((a,b)=>b.priority-a.priority||b.count-a.count||a.handle.localeCompare(b.handle));
  console.log(JSON.stringify({
    period:"original May-Aug 2014, SHA1 verified",
    datedLines:dated,links:allLinks,uniqueRepositoryHandles:byHandle.size,
    contextMatchedLines:candidates.length,
    allRepositoryHandles:ranked.slice(0,100).map(({handle,count,priority,records})=>({
      handle,count,priority,records:records.slice(0,2)
    })),
    excludedLinkedExternalPastes:true,
    decryptedUnknownPlaintext:false
  },null,2));
}
main().catch(err=>{console.error(err);process.exitCode=1;});
