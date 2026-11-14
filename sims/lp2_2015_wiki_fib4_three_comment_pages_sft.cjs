'use strict';
/**
 * Bounded January-2015 Cicada wiki comment provenance: three source candidates.
 * Original dates and exact Fandom ArticleComments API, no remote execution.
 */
const crypto=require('node:crypto');
const titles=[
 'CICADA 3301 Liber Primus Sacred BOOK',
 'What Happened Liber Primus (Post 2014)',
 'CICADA 3301 2014 PUZZLE FACTS PART 8'
];
/** @param {string} b */
function sha(b){return crypto.createHash('sha256').update(b).digest('hex');}
/** @param {string} title @param {number} page */
async function get(title,page){
 const url='https://uncovering-cicada.fandom.com/wikia.php?controller=ArticleCommentsController&method=getComments&title='+encodeURIComponent(title)+'&namespace=0&hideDeleted=false&page='+page;
 try{
  const response=await fetch(url,{signal:AbortSignal.timeout(17000)});
  const bytes=Buffer.from(await response.arrayBuffer()),raw=bytes.toString('utf8');
  const j=response.ok?JSON.parse(raw):{};
  const posts=(j.threads??[]).flatMap(x=>[x.firstPost,...(x.posts??[])])
   .filter(Boolean).map(x=>({id:x.id,at:new Date(x.creationDate.epochSecond*1000).toISOString(),
      content:x.renderedContent?.replace(/<[^>]*>/g,' ').replace(/&[^;]+;/g,' '),
      attachments:x.attachments}));
  const hits=posts.filter(x=>/spiral|base.?64|13.21.34|\\.bin\\b|key is in page 15/i.test(x.content));
  const jan2015=posts.filter(x=>x.at>='2015-01-01'&&x.at<'2015-03-01');
  return {title,page,url,status:response.status,total:j.totalCount??null,count:posts.length,
     oldest:posts.at(-1)?.at,newest:posts[0]?.at,hash:sha(bytes),hits,jan2015,head:raw.slice(0,120)};
 }catch(e){return {title,page,url,error:String(e)}}
}
async function main(){
 const arr=await Promise.all([
 ...titles.map(title=>get(title,0)),
 ...[1,2,3,4].flatMap(page=>[titles[0],titles[2]].map(title=>get(title,page)))
 ]);
 for(const r of arr)console.log('WIKI3_DISCOVERY '+JSON.stringify(r));
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1});
