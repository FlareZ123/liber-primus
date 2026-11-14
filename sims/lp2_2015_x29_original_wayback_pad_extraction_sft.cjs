"use strict";
/** Bounded original 2016 Wayback capture of 2015 Jan22 LP2 rune-pair pad.
 * Read-only, source-locked, Node22/CommonJS, no arbitrary URL scans.
 */
const crypto=require("node:crypto");
const id="X29BZhdBBe";
const stamp=["20160412061055","20160702063058"];
/** @param {string} raw */
function uncover(raw){
  const keys=["clientVars","initialAttributedText","collab_client_vars","ace-editor","padInner","<title>","etherpad","word","rune"];
  const matches=keys.map(k=>({key:k,idx:raw.indexOf(k)}));
  const chunks=matches.filter(x=>x.idx>=0).map(x=>({key:x.key,
    context:raw.slice(Math.max(0,x.idx-90),x.idx+620).replace(/\s+/g," ")}));
  const rx=/"initialAttributedText"\s*:\s*\{\s*"text"\s*:\s*"((?:\\.|[^"\\])*)"/g;
  const texts=[...raw.matchAll(rx)].map(m=>{
    const encoded=m[1].replace(/\\x([0-9a-fA-F]{2})/g,"\\u00$1").replace(/\\'/g,"'");
    try{return JSON.parse('"'+encoded+'"');}
    catch(e){return {decodeError:String(e),rawStart:m[1].slice(0,1200),rawEnd:m[1].slice(-100)};}
  });
  return {matches,contexts:chunks,extracted_texts:texts.map(s=>typeof s==="string"?({
    length:s.length,start:s.slice(0,1400),end:s.slice(-300),
    words:{"prime":(s.match(/prime/gi)||[]).length,"key":(s.match(/key/gi)||[]).length,
      "frequency":(s.match(/frequen/gi)||[]).length},
    sha256:crypto.createHash("sha256").update(s).digest("hex")
  }):s)};
}
async function main(){
  for(const date of stamp){
    const url=`https://web.archive.org/web/${date}/https://titanpad.com/${id}`;
    const response=await fetch(url,{signal:AbortSignal.timeout(18000)});
    const raw=await response.text();
    const revisionMatch=raw.match(/"initialRevisionList":(\[.*?\]),"/s);
    if(revisionMatch) {
      try {
        const revisions=JSON.parse(revisionMatch[1]);
        console.log("REVISION_META "+JSON.stringify({date,count:revisions.length,earliest:revisions.slice(-4).map(r=>({id:r.id,timestamp:r.timestamp,label:r.label})),latest:revisions.slice(0,2).map(r=>({id:r.id,timestamp:r.timestamp,label:r.label}))}));
      } catch(e) { console.log("REVISION_METADATA_ERROR "+String(e)); }
    }
    console.log("CAPTURE "+JSON.stringify({date,url:response.url,http:response.status,
      bytes:raw.length,sha256:crypto.createHash("sha256").update(raw).digest("hex"),
      parsed:uncover(raw)}));
  }
  const prefix="titanpad.com/ep/pad/view/X29BZhdBBe";
  const query="https://web.archive.org/cdx/search/cdx?url="+encodeURIComponent(prefix)+"&matchType=prefix&output=json&filter=statuscode:200";
  const resp=await fetch(query,{signal:AbortSignal.timeout(12000)});
  const raw=await resp.text();
  console.log("REVISION_ARCHIVE_INDEX "+JSON.stringify({url:query,http:resp.status,bytes:raw.length,preview:raw.slice(0,150)}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
