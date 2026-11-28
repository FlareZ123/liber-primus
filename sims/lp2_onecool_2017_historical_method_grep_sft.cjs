"use strict";

const {execFileSync}=require("node:child_process");
const crypto=require("node:crypto");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");

const URL="https://gitlab.com/onecool/3301-public.git";
const NEEDLES=[
  {name:"pi_function", re:/\bpi\s*\(/i},
  {name:"prime_count", re:/prime.{0,30}count|count.{0,30}prime|primecount|prime_count/i},
  {name:"modifier", re:/modifier/i},
  {name:"shift", re:/shift/i},
  {name:"caesar", re:/caesar/i},
  {name:"vigenere", re:/vigen[eè]re/i},
  {name:"rotate", re:/rotat/i},
  {name:"gematria", re:/gematria/i},
  {name:"prime", re:/prime/i},
];

/** @param {string} cwd @param {string[]} args @param {number} [timeout] */
function git(cwd,args,timeout=180000){
  return execFileSync("git",["-C",cwd,...args],{
    encoding:"utf8",timeout,maxBuffer:128*1024*1024
  });
}
/** @param {Buffer|string} x */
function sha256(x){return crypto.createHash("sha256").update(x).digest("hex");}
/** @param {string} s */
function lines(s){return s.split(/\r?\n/).filter(Boolean);}
/** @param {string} s */
function likelyText(s){
  if(!s.length) return true;
  let bad=0;
  for(const ch of s){
    const cp=ch.codePointAt(0);
    if(cp===0) return false;
    if(cp<9 || (cp>13&&cp<32)) bad++;
  }
  return bad/Math.max(1,s.length)<0.01;
}

function main(){
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"onecool-history-grep-"));
  const mirror=path.join(tmp,"repo.git");
  execFileSync("git",["clone","--mirror",URL,mirror],{
    encoding:"utf8",timeout:180000,maxBuffer:128*1024*1024
  });

  const commits=lines(git(mirror,["rev-list","--all","--reverse"]));
  const commitMeta=Object.fromEntries(commits.map(sha=>{
    const row=git(mirror,["show","-s","--format=%aI%x09%s",sha],30000).trim();
    const [authored_at,...subject]=row.split("\t");
    return [sha,{authored_at,subject:subject.join("\t")}];
  }));

  // Build complete path history to expose files deleted before current tip.
  const pathEvents=[];
  const allPaths=new Set();
  for(const sha of commits){
    const changed=lines(git(mirror,["diff-tree","--root","--no-commit-id","--name-status","-r",sha],30000));
    for(const row of changed){
      const parts=row.split("\t");
      const status=parts[0];
      const paths=parts.slice(1);
      for(const p of paths) allPaths.add(p);
      pathEvents.push({sha,...commitMeta[sha],status,paths});
    }
  }

  // Every reachable blob, including blobs no longer referenced by tip.
  const revObjects=lines(git(mirror,["rev-list","--objects","--all"]));
  const blobToPaths=new Map();
  for(const row of revObjects){
    const m=row.match(/^([0-9a-f]{40})(?:\s+(.*))?$/);
    if(!m||!m[2]) continue;
    if(!blobToPaths.has(m[1])) blobToPaths.set(m[1],new Set());
    blobToPaths.get(m[1]).add(m[2]);
  }

  const hits=[];
  let blobsScanned=0, textBlobs=0;
  for(const [oid,pathsSet] of blobToPaths){
    let type;
    try{type=git(mirror,["cat-file","-t",oid],30000).trim();}catch{continue;}
    if(type!=="blob") continue;
    let size;
    try{size=Number(git(mirror,["cat-file","-s",oid],30000).trim());}catch{continue;}
    if(!Number.isFinite(size)||size>1000000) continue;
    blobsScanned++;
    let text;
    try{text=git(mirror,["cat-file","-p",oid],30000);}catch{continue;}
    if(!likelyText(text)) continue;
    textBlobs++;

    const matched=[];
    for(const n of NEEDLES){
      const m=n.re.exec(text);
      if(m){
        const i=m.index;
        matched.push({
          needle:n.name,
          offset:i,
          context:text.slice(Math.max(0,i-240),Math.min(text.length,i+900))
        });
      }
    }
    if(matched.length){
      hits.push({
        oid,size,sha256:sha256(text),
        paths:[...pathsSet].sort(),
        matched
      });
    }
  }

  // Pin which commits/path versions carried the high-value terms.
  const highValue=hits.filter(h=>h.matched.some(m=>
    ["pi_function","prime_count","modifier","shift","caesar","vigenere","rotate"].includes(m.needle)
  ));

  const out={
    generated_at:new Date().toISOString(),
    source_repo:URL,
    commits:commits.map(sha=>({sha,...commitMeta[sha]})),
    counts:{
      commits:commits.length,
      historical_paths:allPaths.size,
      path_events:pathEvents.length,
      reachable_named_objects:blobToPaths.size,
      blobs_scanned:blobsScanned,
      text_blobs:textBlobs,
      term_hit_blobs:hits.length,
      high_value_term_blobs:highValue.length
    },
    historical_paths:[...allPaths].sort(),
    high_value_hits:highValue,
    prime_or_gematria_hits:hits.filter(h=>h.matched.some(m=>["prime","gematria"].includes(m.needle))),
    path_events
  };

  fs.writeFileSync(
    path.join(process.env.RUNNER_TEMP||os.tmpdir(),"onecool-2017-historical-method-grep.json"),
    JSON.stringify(out,null,2)
  );
  console.log(JSON.stringify({
    counts:out.counts,
    historical_paths:out.historical_paths,
    high_value_hits:out.high_value_hits,
    prime_or_gematria_hits:out.prime_or_gematria_hits.map(h=>({
      oid:h.oid,size:h.size,paths:h.paths,
      matched:h.matched.map(m=>({needle:m.needle,context:m.context.slice(0,1200)}))
    }))
  },null,2));
}
try{main();}catch(e){console.error(e);process.exitCode=1;}
