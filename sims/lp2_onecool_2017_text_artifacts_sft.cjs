"use strict";

const {execFileSync}=require("node:child_process");
const crypto=require("node:crypto");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");

const URL="https://gitlab.com/onecool/3301-public.git";

/** @param {Buffer|string} value */
function sha256(value){return crypto.createHash("sha256").update(value).digest("hex");}
/** @param {string} p */
function isTarget(p){
  return /(^|\/)(liber_primus\/(text|json)\/|rune[^/]*\.(json|txt)$|gematria[^/]*\.(json|txt)$)/i.test(p);
}
/** @param {string} dir */
function walk(dir){
  const out=[];
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    if(ent.name===".git") continue;
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()) out.push(...walk(p));
    else if(ent.isFile()) out.push(p);
  }
  return out;
}
/** @param {string} text */
function jsonShape(text){
  try{
    const x=JSON.parse(text);
    if(Array.isArray(x)) return {type:"array",length:x.length,first_type:x.length?typeof x[0]:null};
    if(x&&typeof x==="object") return {type:"object",keys:Object.keys(x).slice(0,50)};
    return {type:typeof x,value:x};
  }catch{return null;}
}

function main(){
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"onecool-2017-text-"));
  const clone=path.join(tmp,"repo");
  execFileSync("git",["clone","--depth=1",URL,clone],{encoding:"utf8",timeout:180000,maxBuffer:128*1024*1024});
  const tip=execFileSync("git",["-C",clone,"rev-parse","HEAD"],{encoding:"utf8"}).trim();
  const files=walk(clone).filter(p=>isTarget(path.relative(clone,p).replaceAll("\\","/"))).sort();
  const artifacts=[];
  for(const abs of files){
    const rel=path.relative(clone,abs).replaceAll("\\","/");
    const b=fs.readFileSync(abs);
    const text=b.toString("utf8");
    artifacts.push({
      path:rel,
      bytes:b.length,
      sha256:sha256(b),
      json_shape:jsonShape(text),
      text:text.length<=200000?text:text.slice(0,200000),
      truncated:text.length>200000
    });
  }
  const out={generated_at:new Date().toISOString(),source_repo:URL,tip,artifact_count:artifacts.length,artifacts};
  fs.writeFileSync(path.join(process.env.RUNNER_TEMP||os.tmpdir(),"onecool-2017-text-artifacts.json"),JSON.stringify(out,null,2));

  const compact=artifacts.map(a=>({
    path:a.path,bytes:a.bytes,sha256:a.sha256,json_shape:a.json_shape,
    preview:a.text.slice(0,1200).replace(/[\r\n]+/g," ")
  }));
  console.log(JSON.stringify({source_repo:URL,tip,artifact_count:artifacts.length,artifacts:compact},null,2));
}
try{main();}catch(e){console.error(e);process.exitCode=1;}
