'use strict';
/**
 * Dated January 2015 archive attachment source gate.
 * Bounded successor to the p15 four-Fibonacci-page historical claim:
 * original IRC 2015-01-28 L84447 described a Base64->.bin runnable script.
 * This checks contemporaneous original wiki-upload records for actual media
 * operands. Merely matching a filename never authenticates the claim.
 * Runs Node22 CommonJS; no code/binary execution and no file writes.
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const API='https://uncovering-cicada.fandom.com/api.php';
const START='2014-11-01T00:00:00Z';
const END='2015-03-01T00:00:00Z';
const HEADERS={'user-agent':'LP2-2015-OriginalAttachmentGate/1.0','accept':'application/json'};
function hash(b){return crypto.createHash('sha256').update(b).digest('hex')}
async function query(params){
 const url=API+'?'+new URLSearchParams(params);
 const r=await fetch(url,{headers:HEADERS,signal:AbortSignal.timeout(25000)});
 assert(r.ok,'wiki HTTP '+r.status+' '+url);
 return r.json();
}
async function main(){
 const all=[];let cont={};
 do{
  const j=await query({action:'query',list:'allimages',ailimit:'500',
    aiprop:'url|sha1|size|timestamp|user|comment',format:'json',...cont});
  assert(Array.isArray(j.query?.allimages),'missing files');
  all.push(...j.query.allimages);
  cont=j.continue||null;
  assert(all.length<=2000,'unanticipated listing');
 }while(cont);
 const target=all.filter(x=>x.timestamp>=START&&x.timestamp<END)
   .sort((a,b)=>a.timestamp.localeCompare(b.timestamp)||a.name.localeCompare(b.name));
 const candidates=target.filter(x=>/\.(?:bin|exe|py|pl|sh|bat|js|jar|zip|rar|7z|asc|gpg|pgp|txt|pdf|html?|json|dat|c|h|cpp)$/i.test(x.name)
 ||/(?:bin|script|key|binary|base64|fibonacci|rune|decode|solver|page.?15|punch|puch)/i.test(x.name));
 const jan=target.filter(x=>x.timestamp>='2015-01-01T00:00:00Z'&&x.timestamp<'2015-02-15T00:00:00Z');
 const compressed=target.map(x=>({name:x.name,date:x.timestamp,bytes:x.size,sha1:x.sha1,
   user:x.user,comment:x.comment?.slice(0,150)}));
 console.log('WIKI_2015_ATTACHMENT_GATE '+JSON.stringify({
  source:API,original_irc:'2015 Jan 28 16:05 L84447',
  start:START,end:END,total_wiki_objects:all.length,
  time_window:target.length,jan1_to_feb15:jan.length,
  candidate_uploads:candidates.map(x=>({
   name:x.name,date:x.timestamp,bytes:x.size,sha1:x.sha1,
   url:x.url,user:x.user,comment:x.comment?.slice(0,300)
  })),
  complete_jan1_to_feb15:jan.map(x=>({name:x.name,date:x.timestamp,bytes:x.size,sha1:x.sha1})),
  narrow_jan28_to_feb1:target.filter(x=>x.timestamp>='2015-01-28'&&x.timestamp<'2015-02-02').map(x=>({name:x.name,date:x.timestamp,user:x.user,comment:x.comment,url:x.url})),
  all_window_manifest_digest:hash(JSON.stringify(compressed)),
  month_counts:Object.fromEntries(['2014-11','2014-12','2015-01','2015-02'].map(m=>[m,target.filter(x=>x.timestamp.startsWith(m)).length]))
 }));
}
main().catch(e=>{console.error('WIKI_2015_ATTACHMENT_GATE_FAILED',String(e.stack||e));process.exitCode=1});
