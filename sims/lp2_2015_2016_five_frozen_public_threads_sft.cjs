'use strict';
/**
 * Original-source review of five frozen 2015–16 public discussion threads.
 * Extract period revisions from Fandom native API; source code is never executed.
 * Node 22 CommonJS, read-only. Director #914.
 */
const crypto=require('node:crypto');
const root='https://uncovering-cicada.fandom.com';
const titles=[
  {name:'LIBER_NOVUS',at:'2015-08-02T00:00:00Z'},
  {name:'PAGE_0',at:'2015-08-02T00:00:00Z'},
  {name:'2016_Puzzle',at:'2016-01-25T00:00:00Z'}
];
function digest(s){return crypto.createHash('sha256').update(s).digest('hex');}
function plain(s){return String(s||'').replace(/<[^>]*>/g,' ').replace(/&[^;]+;/g,' ');}
const keywords=/(?:key|decrypt|decipher|plaintext|translate|decoded|solve|shift|rotat|prime|alberti|offset|source|book|cipher|rune|word|caesar|transpos|fibonacc|[ᚠ-ᛡ])/i;
async function fetchText(url){
 try{
 const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(18000),
   headers:{'user-agent':'LP2HistoricalSourceArchiveReadOnly/1.0'}});
 const body=await r.text();
 return {status:r.status,url:r.url,bytes:Buffer.byteLength(body),hash:digest(body),body};
 }catch(e){return {error:String(e),body:''};}
}
async function main(){
 for(const target of titles){
  const n=target.name;
  const paths=[
  ['start',root+'/api.php?action=query&prop=revisions&titles='+encodeURIComponent(n)+
    '&rvprop=ids%7Ctimestamp%7Ccomment%7Cuser%7Csha1&rvlimit=1&rvdir=newer&format=json'],
  ['revisions',root+'/api.php?action=query&prop=revisions&titles='+encodeURIComponent(n)+
    '&rvprop=ids%7Ctimestamp%7Ccontent%7Csha1%7Cuser%7Ccomment&rvlimit=15&rvstart='+target.at+
    '&rvdir=older&format=json'],
  ['comments-0',root+'/wikia.php?controller=ArticleCommentsController&method=getComments&title='+encodeURIComponent(n)+
    '&namespace=0&hideDeleted=false&page=0'],
  ['comments-1',root+'/wikia.php?controller=ArticleCommentsController&method=getComments&title='+encodeURIComponent(n)+
    '&namespace=0&hideDeleted=false&page=1']
  ];
  for(const [kind,url] of paths){
    const reply=await fetchText(url);
    const status={target:n,kind,url,status:reply.status,error:reply.error,final:reply.url,
      bytes:reply.bytes,sha256:reply.hash};
    let j;
    try{j=JSON.parse(reply.body);}
    catch{console.log('THREAD_SOURCE '+JSON.stringify({...status,preview:reply.body.slice(0,300)}));continue;}
    if(kind==='start'||kind==='revisions'){
     const page=Object.values(j.query?.pages||{})[0]||{};
     const revs=page.revisions||[];
     console.log('THREAD_SOURCE '+JSON.stringify({...status,pageid:page.pageid,
       title:page.title,
       revisions:revs.map(v=>{
         const body=v['*']||v.slots?.main?.['*']||'';
         const matches=[];
         for(const line of body.split(/\r?\n/)){if(keywords.test(line)&&line.length>12)matches.push(line.slice(0,360));}
         return {id:v.revid,at:v.timestamp,sha1:v.sha1,editor:v.user,comment:v.comment,
           sourceLength:body.length,matchingLines:matches.slice(0,28)};
       })}));
    }else{
      const output=[];
      for(const t of j.threads||[]){
        for(const post of [t.firstPost,...(t.posts||[])])if(post){
          const content=plain(post.renderedContent);
          const epoch=post.creationDate?.epochSecond;
          const date=epoch?new Date(epoch*1000).toISOString():null;
          if(date&&date.slice(0,4)<'2017')
            output.push({thread:t.id,id:post.id,date,author:post.createdBy?.name,
              text:content.slice(0,1100),sourceLength:content.length,attachments:post.attachments});
        }
      }
      console.log('THREAD_SOURCE '+JSON.stringify({...status,totalRoots:j.threads?.length||0,
        originalPosts:output.slice(0,150)}));
    }
  }
 }
 const others=[
  ['board-direct','https://cicada3301.boards.net/thread/12/case-shift-independent-text-analysis'],
  ['board-wayback','https://archive.org/wayback/available?url='+encodeURIComponent('http://cicada3301.boards.net/thread/12/case-shift-independent-text-analysis')+'&timestamp=20160126'],
  ['old-wikia-novus-wayback','https://archive.org/wayback/available?url='+encodeURIComponent('http://uncovering-cicada.wikia.com/wiki/LIBER_NOVUS')+'&timestamp=20150801'],
  ['old-wikia-p0-wayback','https://archive.org/wayback/available?url='+encodeURIComponent('http://uncovering-cicada.wikia.com/wiki/PAGE_0')+'&timestamp=20150801'],
  ['fandom-novus-wayback','https://archive.org/wayback/available?url='+encodeURIComponent(root+'/wiki/LIBER_NOVUS')+'&timestamp=20150801'],
  ['fandom-p0-wayback','https://archive.org/wayback/available?url='+encodeURIComponent(root+'/wiki/PAGE_0')+'&timestamp=20150801'],
  ['fandom-2016-wayback','https://archive.org/wayback/available?url='+encodeURIComponent(root+'/wiki/2016_Puzzle')+'&timestamp=20160106']
 ];
 const results=await Promise.all(others.map(async ([name,url])=>{
   const r=await fetchText(url);
   if(name==='board-direct'&&r.body){
    const post=/<div class="message">([\s\S]*?)<\/div>/i.exec(r.body);
    if(post){
      const body=post[1].replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]*>/g,' ')
        .replace(/&nbsp;/g,' ').replace(/&quot;/g,'"').replace(/&#39;/g,"'")
        .replace(/&gt;/g,'>').replace(/&lt;/g,'<');
      console.log('BOARD_MAIN_POST '+JSON.stringify({rawSha256:r.hash,htmlOffset:post.index,text:body}));
    }

     const re=/(?:mortlach|shift independent|post-message|message-content|message-text|thread-title|post-content|decryption|cipher)/gi;
     const matches=[];let m;
     while((m=re.exec(r.body))!==null&&matches.length<65){
       const start=Math.max(0,m.index-200),end=Math.min(r.body.length,m.index+600);
       matches.push({offset:m.index,match:m[0],near:r.body.slice(start,end)});
     }
     console.log('BOARD_HTML_HIGHLIGHTS '+JSON.stringify({url,status:r.status,matches}));
   }
   return {name,url,status:r.status,error:r.error,final:r.url,bytes:r.bytes,
      sha256:r.hash,preview:r.body?.slice(0,1300)};
 }));
 for(const x of results)console.log('OTHER_SOURCE '+JSON.stringify(x));
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
