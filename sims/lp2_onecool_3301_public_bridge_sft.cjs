"use strict";

const {execFileSync} = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const OLD_URL="https://gitlab.com/onecool/3301-public.git";
const LP_URL="https://gitlab.com/onecool/liber_primus.git";

/** @param {string} cwd @param {string[]} args @param {number} [timeout] */
function git(cwd,args,timeout=120000){
  return execFileSync("git",["-C",cwd,...args],{encoding:"utf8",timeout,maxBuffer:64*1024*1024});
}

/** @param {string} text */
function lines(text){return text.split(/\r?\n/).filter(Boolean);}

/** @param {string} dir */
function objectMap(dir){
  const out=new Map();
  for(const line of lines(git(dir,["rev-list","--objects","--all"]))){
    const m=line.match(/^([0-9a-f]{40})(?:\s+(.*))?$/);
    if(!m) continue;
    const [_,oid,p]=m;
    if(!out.has(oid)) out.set(oid,[]);
    if(p) out.get(oid).push(p);
  }
  return out;
}

/** @param {string} dir */
function commits(dir){
  return lines(git(dir,["log","--all","--reverse","--format=%H%x09%P%x09%aI%x09%an%x09%ae%x09%s"])).map(line=>{
    const [sha,parents,at,name,email,...subject]=line.split("\t");
    return {sha,parents:parents?parents.split(" "):[],authored_at:at,author_name:name,author_email:email,subject:subject.join("\t")};
  });
}

/** @param {string} dir @param {string[]} shas */
function interestingPathsByCommit(dir,shas){
  const re=/(liber|primus|rune|gematria|lp2|page[_ -]?[0-9]|decrypt|cicada)/i;
  return shas.map(sha=>{
    const paths=lines(git(dir,["ls-tree","-r","--name-only",sha],30000));
    return {sha,matches:paths.filter(p=>re.test(p))};
  }).filter(x=>x.matches.length);
}

function main(){
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"onecool-bridge-"));
  const old=path.join(tmp,"old.git");
  const lp=path.join(tmp,"lp.git");
  execFileSync("git",["clone","--mirror",OLD_URL,old],{encoding:"utf8",timeout:180000,maxBuffer:64*1024*1024});
  execFileSync("git",["clone","--mirror",LP_URL,lp],{encoding:"utf8",timeout:180000,maxBuffer:64*1024*1024});

  const oldMap=objectMap(old);
  const lpMap=objectMap(lp);
  const overlap=[];
  for(const [oid,oldPaths] of oldMap){
    const lpPaths=lpMap.get(oid);
    if(lpPaths) overlap.push({oid,old_paths:oldPaths,lp_paths:lpPaths});
  }

  const oldCommits=commits(old);
  const lpCommits=commits(lp);
  const pre2018=oldCommits.filter(c=>Date.parse(c.authored_at)<Date.parse("2018-01-01T00:00:00Z"));
  const pathMatches=interestingPathsByCommit(old,oldCommits.map(c=>c.sha));

  const oldRefs=lines(git(old,["for-each-ref","--format=%(refname)%09%(objectname)"]));
  const oldFsck=lines(git(old,["fsck","--full","--unreachable","--no-reflogs"]));

  const out={
    generated_at:new Date().toISOString(),
    old_repo:OLD_URL,
    lp_repo:LP_URL,
    old_refs:oldRefs,
    old_commits:oldCommits,
    old_pre2018_commits:pre2018,
    old_interesting_paths:pathMatches,
    lp_commits:lpCommits,
    exact_git_object_overlap:overlap,
    counts:{old_objects:oldMap.size,lp_objects:lpMap.size,overlap:overlap.length},
    old_fsck_unreachable:oldFsck,
  };

  fs.writeFileSync(path.join(process.env.RUNNER_TEMP||os.tmpdir(),"source-test-output.json"),JSON.stringify(out,null,2));
  console.log(JSON.stringify(out,null,2));
}
try{main();}catch(e){console.error(e);process.exitCode=1;}
