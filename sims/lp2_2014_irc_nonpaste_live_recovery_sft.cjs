"use strict";
/**
 * Bounded recovery of live bytes from six 2014 source-posted solver-file URLs.
 * NEVER executes downloaded code. Recognizes ZIP/JAR by magic only.
 * Node22: node sims/lp2_2014_irc_nonpaste_live_recovery_sft.cjs --selftest
 * Manual-only network mode: --network
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const urls=[
  {id:"sheet",url:"http://terrafant.asia/sheet.ods",expect:".ods"},
  {id:"unrune2",url:"http://www.mediafire.com/download/umlv6bbd54n5w9d/UnRuneIt2.jar",expect:".jar"},
  {id:"unrune1",url:"http://www.mediafire.com/download/uqvlspfs3ny3516/UnRuneIt.jar",expect:".jar"},
  {id:"runes_by_page",url:"http://onecool.us/runes_by_page.txt",expect:".txt"},
  {id:"unstructured",url:"http://onecool.us/unstructured_runes.txt",expect:".txt"},
  {id:"p2emj",url:"https://infotomb.com/p2emj.txt",expect:".txt"}
];
/** @param {Buffer} x @returns {string} */
const sha=x=>crypto.createHash("sha256").update(x).digest("hex");
/** @param {string} filename @param {Buffer} x */
function atomic(filename,x){
  const full=path.join("irc-2014-nonpaste-live",filename);
  fs.mkdirSync(path.dirname(full),{recursive:true});
  const lock=full+".lock",fd=fs.openSync(lock,"wx");
  try{const temp=full+"."+process.pid+".tmp";
    fs.writeFileSync(temp,x,{flag:"wx"});fs.renameSync(temp,full);
  }finally{fs.closeSync(fd);fs.unlinkSync(lock);}
}
/** @param {string} url @returns {Promise<object>} */
async function get(url){
  try{
    const r=await fetch(url,{redirect:"follow",signal:AbortSignal.timeout(20000),
      headers:{"user-agent":"Mozilla/5.0 (compatible; LP2source/1.0)"}});
    const b=Buffer.from(await r.arrayBuffer());
    return {http:r.status,finalUrl:r.url,contentType:r.headers.get("content-type"),
      contentDisposition:r.headers.get("content-disposition"),bytes:b.length,
      sha256:sha(b),binary:b,
      html:b.length<=500000?b.toString("utf8"):""};
  }catch(e){return {error:String(e)};}
}
/** @param {string} html @returns {string[]} */
function mediafireHints(html){
  const out=[];
  for(const rx of [/id=["']downloadButton["'][^>]+href=["']([^"']+)/i,
    /href=["']([^"']+)["'][^>]+id=["']downloadButton["']/i,
    /https?:\\\/\\\/download[^"'\s]+/ig,
    /https?:\/\/download[^"'\s]+/ig]){
    const m=html.match(rx);
    if(m)out.push((m[1]??m[0]).replaceAll("&amp;","&"));
  }
  return [...new Set(out)].slice(0,5);
}
/** @param {typeof urls[number]} item @returns {Promise<object>} */
async function inspect(item){
  const variants=[item.url];
  if(item.id.startsWith("unrune")){
    const m=/download\/([^/]+)\/([^/?]+)/.exec(item.url);
    assert(m);
    variants.push("https://www.mediafire.com/file/"+m[1]+"/"+m[2]+"/file");
  }
  const answers=[];
  for(const url of variants){
    const v=await get(url);
    const itemResult={requested:url,http:v.http,finalUrl:v.finalUrl,
      contentType:v.contentType,contentDisposition:v.contentDisposition,
      bytes:v.bytes,sha256:v.sha256,error:v.error};
    if(v.binary){
      const b=v.binary;
      const isZip=b.length>4&&b.subarray(0,4).equals(Buffer.from([0x50,0x4b,0x03,0x04]));
      const isText=item.expect===".txt" && b.length<200000 &&
        b.every(x=>x===9||x===10||x===13||(x>=32&&x<=126));
      itemResult.magic=b.subarray(0,16).toString("hex");
      itemResult.title=(v.html.match(/<title[^>]*>([^<]{0,180})<\/title>/i)||[])[1]??null;
      itemResult.mediafireHints=item.id.startsWith("unrune")?mediafireHints(v.html):[];
      // These links originate in the live MediaFire page for the exact 2014
      // published file ID. Download only; never execute the JAR.
      if(item.id.startsWith("unrune") && itemResult.mediafireHints.length){
        itemResult.sourceDownloads=[];
        for(const direct of itemResult.mediafireHints.slice(0,1)){
          if(!/^https?:\/\/download[0-9]+\.mediafire\.com\//u.test(direct))continue;
          const fetched=await get(direct);
          const summary={http:fetched.http,error:fetched.error,
            finalUrl:fetched.finalUrl,bytes:fetched.bytes,
            sha256:fetched.sha256,contentType:fetched.contentType};
          if(fetched.binary){
            summary.magic=fetched.binary.subarray(0,16).toString("hex");
            const zip=fetched.binary.length>100 &&
              fetched.binary.subarray(0,4).equals(Buffer.from([0x50,0x4b,0x03,0x04]));
            if(fetched.http===200 && zip && fetched.binary.length<10000000){
              const fn=item.id+".jar";
              atomic(fn,fetched.binary);
              summary.recovered=fn;
            }
          }
          itemResult.sourceDownloads.push(summary);
        }
      }
      if(v.http===200 && (isZip||isText) && b.length>80 && b.length<10000000){
        const fn=item.id+item.expect;
        atomic(fn,b);itemResult.recovered=fn;
        if(isText)itemResult.firstText=b.toString("utf8").slice(0,600);
      }
    }
    answers.push(itemResult);
  }
  return {id:item.id,answers};
}
function selftest(){
  assert.equal(urls.length,6);
  assert.equal(new Set(urls.map(x=>x.url)).size,6);
  assert.deepEqual(mediafireHints('<a id="downloadButton" href="https://download123.mediafire.com/a.jar">'),
    ["https://download123.mediafire.com/a.jar"]);
  console.log("PASS original six 2014 URLs, ZIP-byte and MediaFire link parsing");
}
async function main(){
  if(process.argv.includes("--selftest")){selftest();return;}
  assert.ok(process.argv.includes("--network"));
  const out=[];
  for(let i=0;i<urls.length;i+=2){
    const pair=await Promise.all(urls.slice(i,i+2).map(inspect));
    for(const x of pair){out.push(x);console.log("OBJECT "+JSON.stringify(x));}
  }
  console.log("SUMMARY "+JSON.stringify({
    sourceUrls:urls.length,liveDownloaded:out.flatMap(x=>x.answers)
      .filter(x=>x.recovered).map(x=>x.recovered),
    caution:"Original URL host response does not alone prove 2014 byte authenticity; inspect ZIP statically, never execute JAR"
  }));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
