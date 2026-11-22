'use strict';
/**
 * Period source cross-reference for the 2015-01-28 uploaded p0 punch-card image.
 * Retrieve historical File: description and article transclusions, to test whether
 * its contemporaneous author actually supplied an executable reading operation.
 */
const API='https://uncovering-cicada.fandom.com/api.php';
const name='File:01_-_9AQaicp_with_basic_puch_card_system_.jpg';
async function query(params){
 const url=API+'?'+new URLSearchParams({action:'query',format:'json',...params});
 const res=await fetch(url,{signal:AbortSignal.timeout(20000),headers:{'user-agent':'Cicada-original-2015-punchcard-description-gate/1.0'}});
 if(!res.ok)throw new Error('Wiki HTTP '+res.status+' '+url);
 return res.json();
}
async function main(){
 console.log('PUNCHCARD_DESCRIPTION_FROZEN '+JSON.stringify({name,date:'2015-01-28T23:03:42Z'}));
 const p=await query({prop:'revisions',titles:name,rvprop:'ids|timestamp|user|comment|content|sha1',rvlimit:'20'});
 const pg=Object.values(p.query?.pages||{})[0]||{};
 const rev=(pg.revisions||[]).map(r=>({id:r.revid,at:r.timestamp,user:r.user,comment:r.comment,sha1:r.sha1,text:String(r['*']||r.slots?.main?.['*']||'').slice(0,2500)}));
 console.log('PUNCHCARD_FILE_REVISIONS '+JSON.stringify({title:pg.title,pageid:pg.pageid,count:rev.length,revisions:rev}));
 const e=await query({list:'embeddedin',eititle:name,eilimit:'100'});
 const x=(e.query?.embeddedin||[]).map(q=>({pageid:q.pageid,title:q.title}));
 console.log('PUNCHCARD_EMBEDDED_IN '+JSON.stringify({count:x.length,backlinks:x,continue:e.continue||null}));
 for(const obj of x.slice(0,6)){
  const j=await query({prop:'revisions',titles:obj.title,rvprop:'ids|timestamp|content',rvlimit:'12',rvdir:'newer',rvstart:'2015-01-01T00:00:00Z',rvend:'2016-01-01T00:00:00Z'});
  const page=Object.values(j.query?.pages||{})[0]||{};
  const rows=(page.revisions||[]).map(r=>{
   const txt=String(r['*']||r.slots?.main?.['*']||'');
   const terms=/(?:9AQaicp|puch|punch.?card|grille|liber primus|decod|key)/ig;
   const hits=[];let m;
   while((m=terms.exec(txt))&&hits.length<16)hits.push(txt.slice(Math.max(0,m.index-90),Math.min(txt.length,m.index+180)));
   return {id:r.revid,at:r.timestamp,text_sha1:'suppressed',hits: hits.map(s=>s.slice(0,210)),len:txt.length};
  });
  console.log('PUNCHCARD_EMBED_REVISIONS '+JSON.stringify({title:obj.title,pageid:obj.pageid,rows}));
 }
}
main().catch(e=>{console.error('PUNCHCARD_DESCRIPTION_GATE_FAILED',String(e));process.exitCode=1});
