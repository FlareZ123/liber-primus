"use strict";

const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");

const ID="0BzOKQofOkvB3YmR1cjJCZGNCdXM";

/** @param {string} url @param {number} [timeoutMs] */
async function req(url,timeoutMs=20000){
  try{
    const r=await fetch(url,{headers:{"User-Agent":"liber-primus-archive-probe/1.0"},signal:AbortSignal.timeout(timeoutMs)});
    const text=await r.text();
    return {url,ok:r.ok,status:r.status,final_url:r.url,headers:Object.fromEntries(r.headers.entries()),text};
  }catch(e){return {url,ok:false,status:0,error:String(e),text:""};}
}

async function main(){
  const originals=[
    `https://drive.google.com/open?id=${ID}`,
    `http://drive.google.com/open?id=${ID}`,
    `https://docs.google.com/spreadsheets/d/${ID}/edit`,
  ];
  const out={generated_at:new Date().toISOString(),id:ID,availability:[],cdx:[],common_crawl:[]};

  for(const original of originals){
    const a=await req("https://archive.org/wayback/available?url="+encodeURIComponent(original)+"&timestamp=20161220");
    out.availability.push({original,status:a.status,ok:a.ok,body:a.text.slice(0,50000)});
    const cdx=await req(
      "https://web.archive.org/cdx/search/cdx?url="+encodeURIComponent(original)+
      "&output=json&fl=timestamp,original,statuscode,mimetype,digest,redirect&filter=statuscode:200&collapse=digest&limit=5000"
    ,30000);
    out.cdx.push({original,status:cdx.status,ok:cdx.ok,body:cdx.text.slice(0,1000000)});
  }

  const col=await req("https://index.commoncrawl.org/collinfo.json");
  if(col.ok){
    let indexes=[];
    try{indexes=JSON.parse(col.text).map(x=>x.id).filter(id=>/^CC-MAIN-(2016|2017|2018)-/.test(id));}catch{}
    const targets=[
      `drive.google.com/open?id=${ID}`,
      `docs.google.com/spreadsheets/d/${ID}/*`,
      `*/*${ID}*`,
    ];
    for(const id of indexes){
      for(const target of targets){
        const u="https://index.commoncrawl.org/"+id+"-index?url="+encodeURIComponent(target)+"&output=json";
        const r=await req(u,10000);
        if(r.ok&&r.text.trim()) out.common_crawl.push({index:id,target,status:r.status,body:r.text.slice(0,200000)});
      }
    }
  }

  const output=path.join(process.env.RUNNER_TEMP||os.tmpdir(),"source-test-output.json");
  fs.writeFileSync(output,JSON.stringify(out,null,2));
  console.log(JSON.stringify(out,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
