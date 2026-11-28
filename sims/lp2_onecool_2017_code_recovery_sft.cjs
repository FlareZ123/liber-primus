"use strict";

const {execFileSync}=require("node:child_process");
const crypto=require("node:crypto");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");

const URL="https://gitlab.com/onecool/3301-public.git";

/** @param {Buffer|string} x */
function sha256(x){return crypto.createHash("sha256").update(x).digest("hex");}
/** @param {string} cwd @param {string[]} args */
function git(cwd,args){
  return execFileSync("git",["-C",cwd,...args],{encoding:"utf8",timeout:180000,maxBuffer:64*1024*1024});
}
/** @param {string} s */
function lines(s){return s.split(/\r?\n/).filter(Boolean);}
/** @param {string} p */
function sourceLike(p){
  if(/(^|\/)(\.git|media|img|images?|meme|__pycache__)(\/|$)/i.test(p)) return false;
  return /\.(py|js|rb|pl|sh|md|txt|json|csv|html?)$/i.test(p) || /(^|\/)(readme|license)(\.|$)/i.test(p);
}

function main(){
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"onecool-code-"));
  const clone=path.join(tmp,"repo");
  execFileSync("git",["clone","--depth=1",URL,clone],{encoding:"utf8",timeout:180000,maxBuffer:64*1024*1024});
  const tip=git(clone,["rev-parse","HEAD"]).trim();
  const paths=lines(git(clone,["ls-tree","-r","--name-only","HEAD"])).filter(sourceLike).sort();
  const files=[];
  for(const rel of paths){
    const abs=path.join(clone,...rel.split("/"));
    const st=fs.statSync(abs);
    if(st.size>500000) continue;
    const b=fs.readFileSync(abs);
    const text=b.toString("utf8");
    const lower=(rel+"\n"+text).toLowerCase();
    const relevance=[
      "prime","pi(","gematria","liber","primus","decrypt","translate","shift",
      "rune","cipher","page_number","section","3301","1033","babylon","bacon"
    ].filter(k=>lower.includes(k));
    files.push({path:rel,bytes:b.length,sha256:sha256(b),relevance,text});
  }
  const out={generated_at:new Date().toISOString(),source_repo:URL,tip,file_count:files.length,files};
  fs.writeFileSync(path.join(process.env.RUNNER_TEMP||os.tmpdir(),"onecool-2017-code-recovery.json"),JSON.stringify(out,null,2));
  console.log(JSON.stringify({
    source_repo:URL,tip,file_count:files.length,
    relevant:files.filter(f=>f.relevance.length).map(f=>({
      path:f.path,bytes:f.bytes,sha256:f.sha256,relevance:f.relevance,
      preview:f.text.slice(0,5000)
    }))
  },null,2));
}
try{main();}catch(e){console.error(e);process.exitCode=1;}
