'use strict';
/**
 * Source-fixed historical Etherpad saved revisions from actual 2016 Wayback HTML.
 * Three original Jan22 2015 IDs only, no arbitrary pad/version enumeration.
 * No remote code execution. Run with Node22 CommonJS.
 */
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const pad='X29BZhdBBe';
const revs=[
 {id:'N6t59CKTj7',timestamp:'20150122161306'},
 {id:'lMfDxJwCBo',timestamp:'20150122161640'},
 {id:'wzRESlRFeI',timestamp:'20150122173641'}
];
function hash(b){return crypto.createHash('sha256').update(b).digest('hex');}
/** @param {{id:string,timestamp:string}} revision */
function urls(revision){
 const path='https://titanpad.com/ep/pad/view/'+pad+'/'+revision.id;
 const old='http://titanpad.com/ep/pad/view/'+pad+'/'+revision.id;
 return [
  {kind:'wayback-availability',url:'https://archive.org/wayback/available?url='+encodeURIComponent(path)+'&timestamp='+revision.timestamp},
  {kind:'original-specific-cdx',url:'https://web.archive.org/cdx/search/cdx?url='+encodeURIComponent(path)+'&output=json&filter=statuscode%3A200'},
  {kind:'2016-capture-fixed-original-view',url:'https://web.archive.org/web/20160412061055/'+path},
  {kind:'2016-capture-http-saved-view',url:'https://web.archive.org/web/20160412061055/'+old},
  {kind:'2016-capture-rawtext',url:'https://web.archive.org/web/20160412061055/'+path+'?pt=1'},
  {kind:'2016-saved-export-original',url:'https://web.archive.org/web/20160412061055/https://titanpad.com/ep/pad/export/'+pad+'/'+revision.id+'?format=txt'},
  {kind:'2016-saved-export-rev-form',url:'https://web.archive.org/web/20160412061055/https://titanpad.com/ep/pad/export/'+pad+'/rev.'+revision.id+'?format=txt'},
  {kind:'exact-export-archive-availability',url:'https://archive.org/wayback/available?url='+encodeURIComponent('https://titanpad.com/ep/pad/export/'+pad+'/'+revision.id+'?format=txt')+'&timestamp='+revision.timestamp},
  {kind:'exact-export-cdx',url:'https://web.archive.org/cdx/search/cdx?url='+encodeURIComponent('https://titanpad.com/ep/pad/export/'+pad+'/'+revision.id+'?format=txt')+'&output=json&filter=statuscode%3A200'}
 ];
}
/** @param {{id:string,timestamp:string}} rev @param {{kind:string,url:string}} target */
async function probe(rev,target){
 try{
  const rs=await fetch(target.url,{redirect:'follow',signal:AbortSignal.timeout(15500),
    headers:{'user-agent':'OriginalEtherpad2015ArchiveResearch/1.0'}});
  const b=Buffer.from(await rs.arrayBuffer());
  const raw=b.toString('utf8');
  const text=raw.match(/"initialAttributedText"\s*:\s*\{\s*"text"\s*:\s*"((?:\\.|[^"\\])*)"/);
  const title=raw.match(/<title[^>]*>(.{0,220}?)<\/title>/is);
  const exact=raw.includes(rev.id),recovery=/rune|freq|bigram|cipher|translate|liber/i.test(raw);
  return {id:rev.id,originalTimestamp:rev.timestamp,kind:target.kind,url:target.url,
   status:rs.status,finalUrl:rs.url,length:b.length,sha256:hash(b),title:title?.[1]??null,
   exactRevisionIdInBody:exact,looksLikeLPData:recovery,hasHistoricalDocText:!!text,
   preview:raw.slice(0,350).replace(/\s+/g,' ')};
 }catch(e){return {id:rev.id,originalTimestamp:rev.timestamp,kind:target.kind,url:target.url,error:String(e)};}
}
async function main(){
 assert.equal(new Set(revs.map(x=>x.id)).size,3);
 const tasks=revs.flatMap(rev=>urls(rev).map(target=>({rev,target})));
 console.log('FROZEN_THREE '+JSON.stringify(revs));
 const results=await Promise.all(tasks.map(x=>probe(x.rev,x.target)));
 for(const r of results)console.log('EXACT_2015_REVISION '+JSON.stringify(r));
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
