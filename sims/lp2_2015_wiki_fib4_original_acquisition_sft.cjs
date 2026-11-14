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
  {label:'2015 p15 original revision',url:root+'/api.php?action=query&prop=revisions&titles='+encodeURIComponent('Onion 7: numbers on page 15')+'&rvprop=ids%7Ctimestamp%7Ccontent%7Csha1%7Cuser&rvlimit=6&rvstart=2015-02-01T00:00:00Z&rvdir=older&format=json'},
  {label:'2015 p15 talk revision',url:root+'/api.php?action=query&prop=revisions&titles='+encodeURIComponent('Talk:Onion 7: numbers on page 15')+'&rvprop=ids%7Ctimestamp%7Ccontent%7Csha1%7Cuser&rvlimit=6&rvstart=2015-02-01T00:00:00Z&rvdir=older&format=json'},
  {label:'LP core wiki title search',url:root+'/api.php?action=query&list=search&srsearch='+encodeURIComponent('Liber Primus')+'&srlimit=100&format=json'},
  {label:'p15 spiral wiki title search',url:root+'/api.php?action=query&list=search&srsearch='+encodeURIComponent('page 15 spiral')+'&srlimit=100&format=json'},
  {label:'p15 spiral comment page zero',url:root+'/wikia.php?controller=ArticleCommentsController&method=getComments&title='+encodeURIComponent('Onion 7: numbers on page 15')+'&namespace=0&hideDeleted=false&page=0'},
  {label:'LP article comment page zero',url:root+'/wikia.php?controller=ArticleCommentsController&method=getComments&title=Liber_Primus&namespace=0&hideDeleted=false&page=0'},
  {label:'LP ideas comment page zero',url:root+'/wikia.php?controller=ArticleCommentsController&method=getComments&title=Liber_Primus_Ideas_and_Suggestions&namespace=0&hideDeleted=false&page=0'},
  {label:'LP 2015 article first edit',url:root+'/api.php?action=query&prop=revisions&titles='+encodeURIComponent('Liber Primus')+'&rvprop=ids%7Ctimestamp%7Ccomment&rvlimit=1&rvdir=newer&format=json'},
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
  {label:'Wayback p15 original 2015',url:'https://archive.org/wayback/available?url='+encodeURIComponent(root+'/wiki/Onion_7:_numbers_on_page_15')+'&timestamp=20150128'},
  {label:'Wayback LP 2015',url:'https://archive.org/wayback/available?url='+encodeURIComponent(root+'/wiki/Liber_Primus')+'&timestamp=20150128'},
  {label:'Wayback suggestions 2015',url:'https://archive.org/wayback/available?url='+encodeURIComponent(root+'/wiki/Liber_Primus_Ideas_and_Suggestions')+'&timestamp=20150128'}
];
/** @param {string} t @param {number} n */
function sha(t,n){return crypto.createHash('sha256').update(t.slice(0,n)).digest('hex');}
async function main(){
 assert.equal(targets.length,22);
 const out=await Promise.all(targets.map(async t=>{
  try{
   const r=await fetch(t.url,{redirect:'follow',signal:AbortSignal.timeout(19000),
      headers:{'user-agent':'LP2OriginalSourceResearch/1.0 (historical source read only)'}});
   const b=await r.text();
   if(t.label.startsWith('2015 p15')){
      try{
       const j=JSON.parse(b);
       const pg=Object.values(j.query?.pages??{})[0];
       console.log('P15_FROZEN_REVISIONS '+JSON.stringify({label:t.label,pageid:pg?.pageid,title:pg?.title,
         revs:pg?.revisions?.map(x=>({id:x.revid,at:x.timestamp,hash:x.sha1,author:x.user,
           length:x['*']?.length??0,quote:x['*']?.match(/.{0,120}(?:base64|13.{1,3}21.{1,3}34.{1,3}55|\\.bin).{0,180}/gi)?.slice(0,5)}))??[]}));
      }catch(e){console.log('REVISION_PARSE '+String(e))}
   }
   if(t.label.endsWith('wiki title search')){
     try{
      const j=JSON.parse(b);
      console.log('WIKI_PAGE_CANDIDATES '+JSON.stringify({label:t.label,
       titles:j.query?.search?.map(v=>({title:v.title,id:v.pageid,ns:v.ns}))}));
     }catch(e){console.log('SEARCH_PARSE '+String(e))}
   }
   if(t.label==='p15 spiral comment page zero'){
      try{
       const j=JSON.parse(b);
       for(const x of j.threads??[]){
        for(const post of [x.firstPost,...(x.posts??[])])console.log('P15_ORIGINAL_POST '+JSON.stringify({
         threadId:x.id,postId:post.id,iso:new Date(post.creationDate.epochSecond*1000).toISOString(),
         text:post.renderedContent?.replace(/<[^>]*>/g,' ').replace(/&[^;]+;/g,' '),
         author:post.createdBy?.name,attachments:post.attachments
        }));
       }
      }catch(e){console.log('P15_COMMENT_PARSE '+String(e))}
   }
   const idx=b.toLowerCase().indexOf('13,21,34');
   return {label:t.label,url:t.url,status:r.status,final:r.url,type:r.headers.get('content-type'),length:b.length,sha256:sha(b,b.length),
    snippet:b.slice(0,2800),quoteAt:idx,nearQuote:idx>=0?b.slice(Math.max(0,idx-320),idx+520):null};
  }catch(e){return {label:t.label,url:t.url,error:String(e)};}
 }));
 for(const o of out)console.log('WIKI_SOURCE '+JSON.stringify(o));
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});