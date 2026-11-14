'use strict';
/**
 * Exact 28 Jan 2015 anonymous wiki Fibonacci-pages claim source acquisition.
 * Use real source URL and original/historical revisions. No execution of scripts/binaries.
 * Windows11 Node22 CommonJS standalone. Static evidence only.
 */
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const root='https://uncovering-cicada.fandom.com';
const targets=[
  {label:'LP article comment record',url:root+'/wikia.php?controller=ArticleCommentsController&method=getComments&title=Liber_Primus&namespace=0&hideDeleted=false&page=1'},
  {label:'LP ideas comment record',url:root+'/wikia.php?controller=ArticleCommentsController&method=getComments&title=Liber_Primus_Ideas_and_Suggestions&namespace=0&hideDeleted=false&page=1'},
  {label:'p15 spiral comment record',url:root+'/wikia.php?controller=ArticleCommentsController&method=getComments&title='+encodeURIComponent('Onion 7: numbers on page 15')+'&namespace=0&hideDeleted=false&page=1'},
  {label:'p15 spiral first edit',url:root+'/api.php?action=query&prop=revisions&titles='+encodeURIComponent('Onion 7: numbers on page 15')+'&rvprop=ids%7Ctimestamp%7Ccomment&rvlimit=1&rvdir=newer&format=json'},
  {label:'LP ideas first edit',url:root+'/api.php?action=query&prop=revisions&titles='+encodeURIComponent('Liber Primus Ideas and Suggestions')+'&rvprop=ids%7Ctimestamp%7Ccomment&rvlimit=1&rvdir=newer&format=json'},
  {label:'site namespaces',url:root+'/api.php?action=query&meta=siteinfo&siprop=namespaces%7Cgeneral&format=json'},
  {label:'literal quote search',url:root+'/api.php?action=query&list=search&srsearch='+encodeURIComponent('"The key is in page 15"')+'&srlimit=20&format=json'},
  {label:'spiral claim search',url:root+'/api.php?action=query&list=search&srsearch='+encodeURIComponent('spiral fibonacci binary')+'&srlimit=20&format=json'},
  {label:'LP article revision',url:root+'/api.php?action=query&prop=revisions&titles=Liber_Primus&rvprop=ids%7Ctimestamp%7Ccomment&rvlimit=15&rvstart=2015-02-01T00:00:00Z&rvdir=older&format=json'},
  {label:'LP suggestions revision',url:root+'/api.php?action=query&prop=revisions&titles=Liber_Primus_Ideas_and_Suggestions&rvprop=ids%7Ctimestamp%7Ccomment&rvlimit=15&rvstart=2015-02-01T00:00:00Z&rvdir=older&format=json'},
  {label:'LP article public',url:root+'/wiki/Liber_Primus'},
  {label:'Wayback LP 2015',url:'https://archive.org/wayback/available?url='+encodeURIComponent(root+'/wiki/Liber_Primus')+'&timestamp=20150128'},
  {label:'Wayback suggestions 2015',url:'https://archive.org/wayback/available?url='+encodeURIComponent(root+'/wiki/Liber_Primus_Ideas_and_Suggestions')+'&timestamp=20150128'}
];
/** @param {string} t @param {number} n */
function sha(t,n){return crypto.createHash('sha256').update(t.slice(0,n)).digest('hex');}
async function main(){
 assert.equal(targets.length,13);
 const out=await Promise.all(targets.map(async t=>{
  try{
   const r=await fetch(t.url,{redirect:'follow',signal:AbortSignal.timeout(19000),
      headers:{'user-agent':'LP2OriginalSourceResearch/1.0 (historical source read only)'}});
   const b=await r.text();const idx=b.toLowerCase().indexOf('13,21,34');
   return {label:t.label,url:t.url,status:r.status,final:r.url,type:r.headers.get('content-type'),length:b.length,sha256:sha(b,b.length),
    snippet:b.slice(0,2800),quoteAt:idx,nearQuote:idx>=0?b.slice(Math.max(0,idx-320),idx+520):null};
  }catch(e){return {label:t.label,url:t.url,error:String(e)};}
 }));
 for(const o of out)console.log('WIKI_SOURCE '+JSON.stringify(o));
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});