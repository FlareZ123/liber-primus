'use strict';
/**
 * #914 fixed five source-dated 2015-16 original LP2 external-discussion handles.
 * Exact IRC line/date from a pinned Git blob; read-only historical retrieval.
 * Windows Node22/CommonJS, GitHub Actions manual dispatch; no remote code execution.
 */
const crypto = require('node:crypto');
const fixed = [
  {id:'wiki-p0',line:145149,date:'2015-08-01',title:'PAGE 0',url:'http://uncovering-cicada.wikia.com/wiki/PAGE_0'},
  {id:'wiki-58',line:261632,date:'2016-01-14',title:'58 Pages: Revisited',url:'http://uncovering-cicada.wikia.com/wiki/58_Pages:_Revisited'},
  {id:'wiki-p32',line:268980,date:'2016-01-16',title:'PAGE 32',url:'http://uncovering-cicada.wikia.com/wiki/PAGE_32'},
  {id:'forum-case',line:282334,date:'2016-01-26',url:'http://cicada3301.boards.net/thread/12/case-shift-independent-text-analysis'},
  {id:'forum-supposed',line:334208,date:'2016-04-26',url:'http://calypne.boards.net/thread/53/supposed-decoded-liber-primus'}
];
const root = 'https://uncovering-cicada.fandom.com';
const key = /(?:plain.?text|decipher|decrypt|solv(?:ed|ing)|key(?:word)?|cipher|transform|algorithm|prime|code|ᚠ|ᚢ|ᚦ)/ig;
function digest(s) {return crypto.createHash('sha256').update(s).digest('hex');}
function clean(s){return String(s||'').replace(/<[^>]+>/g,' ').replace(/&(?:nbsp|amp|quot);/g,' ').replace(/\s+/g,' ').trim();}
function contexts(s, max=20) {
 const r=[]; let m; key.lastIndex=0;
 while ((m=key.exec(s))!==null&&r.length<max) {
  r.push(s.slice(Math.max(0,m.index-90),Math.min(s.length,m.index+170)).replace(/\s+/g,' '));
  key.lastIndex=m.index+Math.max(1,m[0].length);
 }
 return r;
}
async function get(label, url){
 try {
  const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(22000),
    headers:{'user-agent':'LP2 Period Source Preservation/1.0'}});
  const b=await r.text();
  const meta={label,status:r.status,final:r.url,bytes:Buffer.byteLength(b),sha256:digest(b),contentType:r.headers.get('content-type')};
  if(!r.ok)return {...meta,excerpt:clean(b).slice(0,180)};
  return {...meta,body:b};
 } catch(e){return {label,error:String(e)};}
}
async function inspectWiki(x) {
 const title=x.title; const q=encodeURIComponent(title);
 const rv = root+'/api.php?action=query&prop=revisions&titles='+q+
    '&rvprop=ids%7Ctimestamp%7Ccontent%7Csha1%7Cuser&rvlimit=20&rvstart=2016-12-31T23:59:59Z&rvdir=older&format=json';
 const r=await get(x.id+'-rev',rv);
 if(r.body){
  try{
    const j=JSON.parse(r.body),pg=Object.values(j.query?.pages||{})[0];
    const revs=(pg?.revisions||[]).map(v=>({id:v.revid,at:v.timestamp,sha1:v.sha1,user:v.user,
      length:(v['*']||v.slots?.main?.['*']||'').length,
      hits:contexts(v['*']||v.slots?.main?.['*']||'',10)}));
    console.log('FIVE_WIKI_REV '+JSON.stringify({handle:x.id,source_date:x.date,source_line:x.line,pageId:pg?.pageid,title:pg?.title,
      sha256:r.sha256,revisions:revs}));
  }catch(e){console.log('FIVE_PARSE_FAIL '+JSON.stringify({handle:x.id,what:'rev',error:String(e),start:r.body.slice(0,250)}))}
 }else{console.log('FIVE_FETCH_FAIL '+JSON.stringify({...r,handle:x.id}));}
 for(let i=0;i<3;i++){
  const cm=root+'/wikia.php?controller=ArticleCommentsController&method=getComments&title='+q+
      '&namespace=0&hideDeleted=false&page='+i;
  const c=await get(x.id+'-comments'+i,cm);
  if(!c.body){console.log('FIVE_FETCH_FAIL '+JSON.stringify({...c,handle:x.id}));continue}
  try{
   const j=JSON.parse(c.body);
   const posts=[];
   for(const t of j.threads||[]) {
    for(const p of [t.firstPost,...(t.posts||[])]) {
     if(!p)continue;
     const dt=p.creationDate?.epochSecond?new Date(p.creationDate.epochSecond*1000).toISOString():null;
     const v=clean(p.renderedContent||p.rawContent||'');
     if(dt&&dt<'2017-01-01'&&dt>='2015-01-01'&&/(?:plain.?text|decipher|decrypt|solv|key|cipher|algorithm|prime|ᚠ|ᚢ|ᚦ|p.?32|p.?0)/i.test(v)) {
      posts.push({id:p.id,thread:t.id,at:dt,author:p.createdBy?.name,text:v.slice(0,550),sha256:digest(v)});
     }
    }
   }
   console.log('FIVE_WIKI_COMMENTS '+JSON.stringify({handle:x.id,index:i,sha256:c.sha256,bytes:c.bytes,roots:(j.threads||[]).length,
       period_potential_posts:posts.slice(0,70),truncated:posts.length>70}));
  }catch(e){console.log('FIVE_PARSE_FAIL '+JSON.stringify({handle:x.id,what:'comments',index:i,error:String(e),start:c.body.slice(0,250)}))}
 }
}
async function inspectForum(x) {
 for(const [label,u] of [
  ['direct',x.url.replace(/^http:/,'https:')],
  ['archive-api','https://archive.org/wayback/available?url='+encodeURIComponent(x.url)+'&timestamp='+x.date.replaceAll('-','')]
 ]) {
   const r=await get(x.id+'-'+label,u);
   if(r.body){
    const v=clean(r.body);
    console.log('FIVE_FORUM '+JSON.stringify({handle:x.id,label,source_date:x.date,source_line:x.line,url:u,status:r.status,
      final:r.final,sha256:r.sha256,bytes:r.bytes,excerpt:v.slice(0,650),hits:contexts(v,15)}));
    if(label==='archive-api'){
      try{
        const j=JSON.parse(r.body),snap=j.archived_snapshots?.closest;
        if(snap?.url){
          const k=await get(x.id+'-archived-body',snap.url);
          console.log('FIVE_FORUM_ARCHIVE '+JSON.stringify({handle:x.id,at:snap.timestamp,status:snap.status,
            replay:k.body?{status:k.status,bytes:k.bytes,sha256:k.sha256,excerpt:clean(k.body).slice(0,1000),
            hits:contexts(clean(k.body),20)}:k}));
        }
      }catch(e){console.log('FIVE_PARSE_FAIL '+JSON.stringify({handle:x.id,what:'wayback',error:String(e)}))}
    }
   }else{console.log('FIVE_FETCH_FAIL '+JSON.stringify({...r,handle:x.id}));}
 }
}
async function main(){
 console.log('FIVE_FROZEN_HANDLES '+JSON.stringify(fixed));
 for(const x of fixed){if(x.title)await inspectWiki(x);else await inspectForum(x);}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
