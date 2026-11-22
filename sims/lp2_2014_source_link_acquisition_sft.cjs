"use strict";
/**
 * Original 2014 IRC source-locked file recovery, static read-only inspection.
 * No historical program is executed. All output files use a lock and rename.
 * Node.js 22 CommonJS, manual GitHub Actions only.
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const ORIGIN={name:"#cicadasolvers.freenode.log",size:18487233,blob:"bdd277c14f94c34b5ae714cd00c238065beeed4e"};
const OBJECTS=[
  {line:174324,id:"dpr-crib",url:"http://d.pr/lvT7/5eqt1FrD"},
  {line:204064,id:"sendspace-p0",url:"https://www.sendspace.com/file/k7ufm0"},
  {line:237789,id:"sprunge-DbXN",url:"http://sprunge.us/DbXN"},
  {line:237790,id:"sprunge-BbUK",url:"http://sprunge.us/BbUK"},
  {line:237796,id:"sprunge-LIWC",url:"http://sprunge.us/LIWC"},
  {line:237797,id:"sprunge-EMXR",url:"http://sprunge.us/EMXR"},
  {line:216903,id:"pastebin-gXDGVf1Y",url:"http://pastebin.com/gXDGVf1Y"},
  {line:216906,id:"pastebin-N3qCRSq2",url:"http://pastebin.com/N3qCRSq2"},
  {line:177148,id:"pastie-9173007",url:"http://pastie.org/9173007"},
  {line:184995,id:"shadow-clear",url:"https://shadow-code.org/cicada/analysis.php?data=clear"},
  {line:200894,id:"sprunge-RZdd",url:"http://sprunge.us/RZdd"},
  {line:229856,id:"pastebin-dGJSgN0m",url:"http://pastebin.com/dGJSgN0m"}
];
const SHA=b=>crypto.createHash("sha256").update(b).digest("hex");
const git=b=>crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex");
function atomic(file,bytes){
  fs.mkdirSync(path.dirname(file),{recursive:true});
  const fd=fs.openSync(file+".lock","wx");
  try{const temp=file+"."+process.pid+".tmp";fs.writeFileSync(temp,bytes,{flag:"wx"});fs.renameSync(temp,file)}
  finally{fs.closeSync(fd);fs.unlinkSync(file+".lock")}
}
async function get(url){
  try{
    const r=await fetch(url,{redirect:"follow",signal:AbortSignal.timeout(15000),
      headers:{"user-agent":"Mozilla/5.0 (compatible; historical-source-byte-inspection/1.0)"}});
    const b=Buffer.from(await r.arrayBuffer());
    return {url,final:r.url,status:r.status,type:r.headers.get("content-type"),bytes:b.length,sha256:SHA(b),buffer:b};
  }catch(e){return {url,error:String(e)}}
}
function variants(url){
  const v=[url];
  if(url.startsWith("http:"))v.push(url.replace(/^http:/,"https:"));
  let m=url.match(/pastebin\.com\/([A-Za-z0-9]+)/);
  if(m)v.unshift("https://pastebin.com/raw/"+m[1]);
  m=url.match(/sprunge\.us\/([A-Za-z0-9]+)/);
  if(m)v.unshift("https://sprunge.us/"+m[1]);
  return [...new Set(v)];
}
async function probe(item){
  const results=[];
  for(const url of variants(item.url)){
    const r=await get(url);
    const {buffer,...meta}=r;
    const classification=buffer?(
      buffer.subarray(0,3).equals(Buffer.from("PK\x03"))?"zip":
      /(?:<html|<!doctype html|<head)/i.test(buffer.subarray(0,400).toString("latin1"))?"html":
      buffer.every(x=>x===9||x===10||x===13||(x>=32&&x<=126))?"ascii":"other"
    ):"failed";
    const entry={...meta,classification};
    if(buffer && r.status===200&&classification==="ascii"&&buffer.length>0&&buffer.length<150000){
      entry.preview=buffer.toString("utf8").slice(0,1400);
      const filename="irc2014-link-acquired/"+item.id+"-"+results.length+".txt";
      atomic(filename,buffer);entry.retained=filename;
    }
    if(buffer&&r.status===200&&classification==="zip"&&buffer.length<5000000){
      const filename="irc2014-link-acquired/"+item.id+"-"+results.length+".zip";
      atomic(filename,buffer);entry.retained=filename;
    }
    if(buffer&&r.status===200&&classification==="html"&&buffer.length<150000){
      entry.pageTitle=(buffer.toString("utf8").match(/<title[^>]*>([^<]{0,160})/i)||[])[1]??null;
      entry.preview=buffer.toString("utf8").replace(/<script\b[^>]*>[\s\S]*?<\/script>/ig,"").slice(0,260);
    }
    results.push(entry);
    if(entry.retained)break;
  }
  return {id:item.id,original:item.url,sourceLine:item.line,results};
}
async function main(){
  assert.equal(OBJECTS.length,12);
  assert.equal(new Set(OBJECTS.map(x=>x.id)).size,12);
  if(process.argv.includes("--selftest")){
    assert.equal(variants("http://pastebin.com/abc")[0],"https://pastebin.com/raw/abc");
    assert.equal(git(Buffer.from("test")),"30d74d258442c7c65512eafab474568dd706c430");
    console.log("SELFTEST PASS: original link list, Git blob, raw variants");
    return;
  }
  const originalUrl="https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/"+encodeURIComponent(ORIGIN.name);
  const r=await fetch(originalUrl,{signal:AbortSignal.timeout(120000)});
  assert.equal(r.status,200,"original source retrieval");
  const b=Buffer.from(await r.arrayBuffer());
  assert.equal(b.length,ORIGIN.size,"original log length");
  assert.equal(git(b),ORIGIN.blob,"original log Git blob identity");
  const lines=b.toString("latin1").split(/\r?\n/);
  for(const item of OBJECTS){
    assert(lines[item.line-1].includes(item.url),"historical link differs "+item.id+" L"+item.line);
    const radius=["sendspace-p0","dpr-crib","sprunge-DbXN"].includes(item.id)?16:5;
    console.log("SOURCE_CONTEXT",item.id,"L"+item.line);
    for(let i=item.line-radius;i<=item.line+radius;i++){
      const s=lines[i-1];if(s&&/^2014 /.test(s)&&s.slice(0,11)===lines[item.line-1].slice(0,11))
        console.log(" L"+i+" "+s.slice(0,380));
    }
  }
  const results=[];
  for(let i=0;i<OBJECTS.length;i+=3){
    const batch=await Promise.all(OBJECTS.slice(i,i+3).map(probe));
    for(const item of batch){results.push(item);console.log("ACQUISITION",JSON.stringify(item))}
  }
  const pathName="irc2014-link-acquired/manifest.json";
  atomic(pathName,Buffer.from(JSON.stringify({source:ORIGIN,objects:results},null,2)+"\n"));
  console.log("SUMMARY originalFiles="+OBJECTS.length+" retained="+results.flatMap(x=>x.results).filter(x=>x.retained).length);
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1});
