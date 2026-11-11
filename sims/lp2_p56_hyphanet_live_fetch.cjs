"use strict";

/**
 * Time-bounded real-network test of the four precommitted p56->Hyphanet 0.7
 * CHK candidates. Run only with a locally connected legacy Hyphanet/Freenet
 * 0.7 FProxy, never with the incompatible Freenet 2023 redesign.
 *
 * Syntactic URL validity is not a content recovery. An FProxy HTTP 200
 * responding with content after a verified working-control fetch is stronger
 * but still needs content/PGP/source validation. A failed fetch without a
 * healthy network is inconclusive.
 *
 * Node.js 22: node sims/lp2_p56_hyphanet_live_fetch.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const crypto = require("node:crypto");
const {readDigest,candidate} = require("./lp2_p56_freenet_chk_uri_sft.cjs");

const ROOT = path.resolve(__dirname, "..");
const REPORT_DIR = path.join(ROOT,"im-results-runtime","lp2-p56-chk-live");
const LOCAL_FPROXY = "http://127.0.0.1:8888/";
const PER_REQUEST_MS = 100000;
const MAX_BYTES = 2*1024*1024;
/** Public example URI from 0.7 Freenet CHK documentation. It may now expire. */
const CONTROL = "freenet:CHK@MBkDVZUDgjVN4Hrjtj8u2~KBtAXGzJGte99CRhA-TZU,q4dp0VskEeY9lC1OHJTq-~TDX32q37oOX8BpvDMWrdQ,AAIC--8/Zeh.Arrowoftime%28draft%29%28230s%29.pdf";

/**
 * Fetch a local FProxy path. Never redirect to public-network HTTP addresses.
 * @param {string} route
 * @param {number} timeout
 * @returns {Promise<{status:number,headers:Record<string,string|string[]|undefined>,body:Buffer,url:string}>}
 */
function request(route,timeout=PER_REQUEST_MS) {
  assert.match(route,/^(?:freenet:)?CHK@|^$/u);
  const url = LOCAL_FPROXY + route;
  return new Promise((resolve,reject)=>{
    const req=http.get(url, {agent:false}, res=>{
      const parts=[];
      let size=0,failed=false;
      res.on("data",chunk=>{
        size+=chunk.length;
        if(size>MAX_BYTES){failed=true;req.destroy(new Error("Max response size 2MiB"));return;}
        parts.push(chunk);
      });
      res.on("end",()=>{
        if(!failed) resolve({
          status:res.statusCode??0,
          headers:res.headers,
          body:Buffer.concat(parts),
          url
        });
      });
      res.on("error",reject);
    });
    req.setTimeout(timeout,()=>req.destroy(new Error("Timeout after "+timeout+" ms")));
    req.on("error",reject);
  });
}

/**
 * Summarize without misclassifying FProxy error HTML as content.
 * @param {string} name
 * @param {{status:number,headers:Record<string,string|string[]|undefined>,body:Buffer,url:string}} response
 */
function summary(name,response) {
  const contentType = String(response.headers["content-type"]??"");
  const fragment = response.body.subarray(0,512).toString("utf8");
  const fproxyError=/data not found|route not found|failure|download failed|network error|not connected|first.time wizard|connection refused|request failed|incompatible key|unable to fetch/iu.test(fragment);
  return {
    name,url:response.url,status:response.status,bytes:response.body.length,
    contentType,sha256:crypto.createHash("sha256").update(response.body).digest("hex"),
    fproxyErrorMarker:fproxyError,
    potentiallyRetrieved:response.status===200 && response.body.length>0 && !fproxyError,
    opening:fragment.replace(/[^\x20-\x7e]/gu,".").slice(0,120)
  };
}

async function main() {
  fs.mkdirSync(REPORT_DIR,{recursive:true});
  const lock = path.join(REPORT_DIR,".fetch.lock");
  const lockFd=fs.openSync(lock,"wx");
  const results={
    provenance:"Candidate fields from original five p56 hex rows; missing five settings bytes guessed from standard CHK examples",
    startedAt:new Date().toISOString(),
    control:CONTROL,
    fproxyLocalUrl:LOCAL_FPROXY,
    requests:[],
    caveat:"A syntactic CHK or an offline failed fetch is no original-page content recovery. The public-control CHK itself may be extinct."
  };
  try {
    const src=fs.readFileSync(path.join(ROOT,"resources","external","Liber Primus 57.txt"),"utf8");
    const {digest}=readDigest(src);
    assert.equal(Buffer.from(digest,"hex").length,64);
    let ready=false;
    for(let attempt=0;attempt<42;attempt++){
      try{
        const page=await request("",7500);
        if(page.status>0) {ready=true;results.fproxyRoot={status:page.status,bytes:page.body.length};break;}
      }catch(e){results.startupLastError=String(e);}
      await new Promise(resolve=>setTimeout(resolve,5000));
    }
    results.fproxyHttpReady=ready;
    if(!ready){results.disposition="No accessible Hyphanet FProxy; all CHK network results inconclusive";return;}
    for(const [name,uri] of [
      ["public-control",CONTROL],
      ...[false,true].flatMap(swap=>["AAIC--8","AAMC--8"].map(
        extra=>["original-split-"+(swap?"swapped-":"")+extra,candidate(digest,swap,extra)]
      ))
    ]){
      try {
        const value=await request(uri);
        const s=summary(name,value);
        results.requests.push(s);
        console.log("HY_PHANET_CANDIDATE "+JSON.stringify(s));
        if(s.potentiallyRetrieved && name!=="public-control"){
          const safe=name.replace(/[^a-z0-9-]/gu,"_");
          const file=path.join(REPORT_DIR,safe+".bin");
          fs.writeFileSync(file+".incomplete",value.body,{flag:"wx"});
          fs.renameSync(file+".incomplete",file);
          s.savedPath=path.relative(ROOT,file);
        }
      } catch(e){
        const s={name,uri,error:String(e),potentiallyRetrieved:false};
        results.requests.push(s);
        console.log("HY_PHANET_CANDIDATE "+JSON.stringify(s));
      }
    }
    const publicOkay=results.requests[0]?.potentiallyRetrieved===true;
    const possible=results.requests.slice(1).filter(s=>s.potentiallyRetrieved);
    results.disposition=possible.length
      ? "Some candidate requests yielded content-shaped FProxy HTTP 200. Must independently authenticate payload before treating it as Cicada."
      : publicOkay
        ? "Public documented CHK fetched; four fixed p56 CHKs did not return content-shaped HTTP 200 on this network run. Historical absence not proven."
        : "No verified accessible public-control CHK. All four p56 non-retrievals are network-inconclusive.";
  } finally {
    results.finishedAt=new Date().toISOString();
    const dest=path.join(REPORT_DIR,"summary.json");
    fs.writeFileSync(dest+".incomplete",JSON.stringify(results,null,2)+"\n",{flag:"wx"});
    fs.renameSync(dest+".incomplete",dest);
    fs.closeSync(lockFd);
    fs.rmSync(lock,{force:true});
    console.log("HY_PHANET_FINAL "+JSON.stringify({
      disposition:results.disposition,
      fproxyHttpReady:results.fproxyHttpReady,
      controlOkay:results.requests[0]?.potentiallyRetrieved,
      possibleTargets:results.requests.slice(1).filter(x=>x.potentiallyRetrieved).map(x=>x.name),
      report:path.relative(ROOT,dest)
    }));
  }
}

if(require.main===module)main().catch(err=>{console.error(err);process.exitCode=1;});
module.exports={main,request,summary,CONTROL};
