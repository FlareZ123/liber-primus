"use strict";
/**
 * Bounded source-identified archive locator for six 2014 original IRC file links.
 * Reads no unknown ciphertext. Does not execute any recovered binary or code.
 * Node.js 22: node sims/lp2_2014_irc_sixfiles_archive_gate.cjs --selftest
 * Network probe only from manual CI: --network
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const targets=[
  {id:"sheet",date:"2014-06-18",line:203973,url:"http://terrafant.asia/sheet.ods",context:"contemporaneous solver spreadsheet: row1 keystream"},
  {id:"unrune2",date:"2014-05-19",line:181191,url:"http://www.mediafire.com/download/umlv6bbd54n5w9d/UnRuneIt2.jar",context:"second participant UnRuneIt Java program"},
  {id:"unrune1",date:"2014-05-15",line:178610,url:"http://www.mediafire.com/download/uqvlspfs3ny3516/UnRuneIt.jar",context:"participant-built beta UnRuneIt Java program"},
  {id:"runes_by_page",date:"2014-05-08",line:171853,url:"http://onecool.us/runes_by_page.txt",context:"participant-runed-page transcript, reported errors"},
  {id:"unstructured",date:"2014-05-12",line:175326,url:"http://onecool.us/unstructured_runes.txt",context:"participant-derived rune transcript"},
  {id:"p2emj",date:"2014-05-02",line:163745,url:"https://infotomb.com/p2emj.txt",context:"explicit participant description: first-page transcript"}
];
/** @param {Buffer|string} s @returns {string} */
function sha(s){return crypto.createHash("sha256").update(s).digest("hex");}
/**
 * @param {unknown} raw
 * @returns {Array<Record<string,string>>}
 */
function parsedRecords(raw){
  if(Array.isArray(raw)){
    const [header,...rows]=raw;
    if(!Array.isArray(header))return [];
    return rows.filter(Array.isArray).map(row=>Object.fromEntries(
      header.map((key,j)=>[String(key),String(row[j]??"")])));
  }
  if(typeof raw==="string"){
    return raw.split(/\r?\n/).filter(line=>line.trim().startsWith("{"))
      .flatMap(line=>{try{return [JSON.parse(line)];}catch{return [];}});
  }
  return [];
}
/** @param {string} url @returns {Promise<object>} */
async function request(url){
  try{
    const response=await fetch(url,{signal:AbortSignal.timeout(16000),
      redirect:"follow",headers:{"user-agent":"LP2-exact-original-2014-source-locator/1.0"}});
    const bytes=Buffer.from(await response.arrayBuffer());
    return {status:response.status,bytes:bytes.length,sha256:sha(bytes),
      finalUrl:response.url,contentType:response.headers.get("content-type"),
      body:bytes.toString("utf8")};
  }catch(e){return {error:String(e)};}
}
/** @param {typeof targets[number]} item @returns {Promise<object>} */
async function inspect(item){
  const out={id:item.id,date:item.date,originalLine:item.line,
    exactUrl:item.url,sourceDescription:item.context,archives:[]};
  for(const archive of ["wayback","arquivo"]){
    const cdx=new URL(archive==="wayback"?"https://web.archive.org/cdx/search/cdx":
      "https://arquivo.pt/wayback/cdx");
    for(const [k,v] of [["url",item.url],["from","2014"],["to","2019"],
      ["output","json"],["limit","100"],["filter","statuscode:200"]])cdx.searchParams.set(k,v);
    const res=await request(cdx.toString());
    let records=[];
    if(res.body)try{records=parsedRecords(JSON.parse(res.body));}catch{records=parsedRecords(res.body);}
    const full=records.filter(x=>String(x.original??x.url??"").toLowerCase().includes(
      new URL(item.url).pathname.toLowerCase().split("/").at(-1)));
    out.archives.push({archive,http:res.status,transportError:res.error,bytes:res.bytes,
      recordCount:records.length,matchedPathRecords:full.length,
      dated:full.slice(0,6).map(x=>({timestamp:x.timestamp,original:x.original??x.url,
        status:x.statuscode??x.status,mime:x.mimetype??x.mime,digest:x.digest}))});
  }
  return out;
}
function selftest(){
  assert.equal(targets.length,6);
  assert.equal(new Set(targets.map(x=>x.url)).size,6);
  assert.deepEqual(parsedRecords([["timestamp","original"],["20140512","http://onecool.us/unstructured_runes.txt"]]),
    [{timestamp:"20140512",original:"http://onecool.us/unstructured_runes.txt"}]);
  assert.deepEqual(parsedRecords('{"timestamp":"20140612","statuscode":"200"}'),
    [{timestamp:"20140612",statuscode:"200"}]);
  console.log("PASS: six source-dated objects and both historical CDX formats");
}
async function main(){
  if(process.argv.includes("--selftest")){selftest();return;}
  assert.ok(process.argv.includes("--network"));
  const out=[];
  for(let i=0;i<targets.length;i+=3){
    const results=await Promise.all(targets.slice(i,i+3).map(inspect));
    for(const r of results){out.push(r);console.log("OBJECT "+JSON.stringify(r));}
  }
  console.log("SUMMARY "+JSON.stringify({objects:out.length,archives:12,
    successfulIndexes:out.flatMap(x=>x.archives).filter(x=>x.http===200).length,
    objectsWithDatedCaptures:out.filter(x=>x.archives.some(a=>a.matchedPathRecords>0)).map(x=>x.id),
    sourceLimit:"CDX records alone do not authenticate or recover the body bytes"}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
