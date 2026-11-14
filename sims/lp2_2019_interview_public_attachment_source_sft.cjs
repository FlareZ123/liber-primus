"use strict";
/**
 * Exact publisher-only 2019 runic-PDF source metadata test.
 * Run node sims/lp2_2019_interview_public_attachment_source_sft.cjs
 * Read-only links/WordPress public REST and dated Wayback CDX.
 */
const assert=require("node:assert/strict");
const PAGE="https://therealsamizdat.com/2019/08/30/cicada-files-ghost3301-interview/";
const base=new URL(PAGE).origin;
async function get(url){
  try{
    const r=await fetch(url,{signal:AbortSignal.timeout(14000),redirect:"follow",
      headers:{"user-agent":"LP2-2019-publisher-asset-source-audit/1"}});
    const t=await r.text();
    return {url:r.url,status:r.status,contentType:r.headers.get("content-type")||"",
      bytes:Buffer.byteLength(t),text:t};
  }catch(e){
    return {url,status:0,contentType:"Error: "+String(e),bytes:0,text:""};
  }
}
function linked(html,origin){
  const a=[];
  for(const m of html.matchAll(/\b(?:href|src|data)\s*=\s*["']([^"'<>]+)["']/gi)){
    const s=m[1].replace(/&amp;/g,"&");
    if(/^(?:data|javascript):/i.test(s))continue;
    let target;
    try{target=new URL(s,origin).href;}catch{continue;}
    if(!a.includes(target))a.push(target);
  }
  return a;
}
function draft(s){return /\.pdf(?:[?#]|$)|\.odt(?:[?#]|$)|\.docx?(?:[?#]|$)|(?:rune|liber.?primus|manuscript|unencrypt|draft)/i.test(s);}
assert.deepEqual(linked('<a href="https://example.org/original.pdf"></a>',PAGE),["https://example.org/original.pdf"]);
assert(draft("https://example.org/unencrypted-runes.pdf"));
async function audit(){
const main=await get(PAGE);
const links=linked(main.text,main.url);
const sourceCandidates=links.filter(draft);
const wp=[
 base+"/wp-json/wp/v2/posts?slug=cicada-files-ghost3301-interview",
 base+"/?rest_route=%2Fwp%2Fv2%2Fposts&slug=cicada-files-ghost3301-interview"
];
const attempts=[];
let post=null;
for(const url of wp){
 const response=await get(url);let arr=null;
 if(response.status===200){
  try{const v=JSON.parse(response.text);if(Array.isArray(v))arr=v;}catch{}
 }
 attempts.push({url,status:response.status,contentType:response.contentType,
   bytes:response.bytes,posts:arr?.map(z=>({id:z.id,date:z.date,modified:z.modified,
     link:z.link,slug:z.slug})).slice(0,3)||null});
 if(arr?.length){post=arr.find(v=>v.slug==="cicada-files-ghost3301-interview")||arr[0];break;}
}
// Public WordPress.com hosted-site API, documented by WordPress.com:
 // GET /rest/v1.1/sites/$site/posts/slug:$post_slug (no auth).
 // The archived in-page ma91c1an.files.wordpress.com is an independently
 // source-visible hosting hint, not a guessed manuscript filename.
const hosted=[];
for(const site of ["therealsamizdat.com","ma91c1an.wordpress.com"]){
 const url="https://public-api.wordpress.com/rest/v1.1/sites/"
    +site+"/posts/slug:cicada-files-ghost3301-interview";
 const resp=await get(url);
 let details=null;
 if(resp.status===200){
   try{
     const obj=JSON.parse(resp.text);
     details={ID:obj.ID,site_ID:obj.site_ID,date:obj.date,modified:obj.modified,
       URL:obj.URL,attachment_count:obj.attachment_count,
       attachments:Object.values(obj.attachments||{}).map(m=>({
         ID:m.ID,mime_type:m.mime_type,URL:m.URL,slug:m.slug,date:m.date,
         file:m.file,title:m.title
       })).slice(0,30)};
   }catch{}
 }
 hosted.push({site,url,status:resp.status,contentType:resp.contentType,
   bytes:resp.bytes,details});
 if(details?.ID)break;
}
// The original post is identified by its public WordPress.com site_ID/ID.
// Request only its attached media, not any site's unrelated library files.
const hostedMedia=[];
for(const entry of hosted){
 const o=entry.details;
 if(!o?.ID||!o?.site_ID)continue;
 const url="https://public-api.wordpress.com/rest/v1.1/sites/"
  +o.site_ID+"/media/?post_ID="+o.ID+"&number=100";
 const response=await get(url);
 let media=null;
 if(response.status===200){
  try{
    const v=JSON.parse(response.text);
    if(Array.isArray(v.media)){
      media=v.media.map(m=>({ID:m.ID,date:m.date,mime_type:m.mime_type,
         file:m.file,URL:m.URL,post_ID:m.post_ID,title:m.title}));
    }
  }catch{}
 }
 hostedMedia.push({url,status:response.status,bytes:response.bytes,
   contentType:response.contentType,found:media?.length||null,media});
 break;
}
const wpV2Media=[];
for(const entry of hosted){
 if(!entry.details?.site_ID||!entry.details?.ID)continue;
 const url="https://public-api.wordpress.com/wp/v2/sites/"
  +entry.details.site_ID+"/media?parent="+entry.details.ID+"&per_page=100";
 const resp=await get(url);
 let media=null;
 if(resp.status===200){
  try{const v=JSON.parse(resp.text);if(Array.isArray(v))
    media=v.map(m=>({id:m.id,date:m.date,mime_type:m.mime_type,
      media_type:m.media_type,source_url:m.source_url,slug:m.slug,
      parent:m.post,filename:m.media_details?.file}));}catch{}
 }
 wpV2Media.push({url,status:resp.status,bytes:resp.bytes,
    contentType:resp.contentType,media});
 break;
}
const attachments=[];
if(post?.id){
 for(const url of [
 base+"/wp-json/wp/v2/media?parent="+post.id+"&per_page=100",
 base+"/?rest_route=%2Fwp%2Fv2%2Fmedia&parent="+post.id+"&per_page=100"
 ]){
  const response=await get(url);let media=null;
  if(response.status===200){
   try{const v=JSON.parse(response.text);if(Array.isArray(v))
    media=v.map(m=>({id:m.id,date:m.date,mime_type:m.mime_type,
      media_type:m.media_type,source_url:m.source_url,filename:m.media_details?.file}));}catch{}
  }
  attachments.push({url,status:response.status,bytes:response.bytes,
    contentType:response.contentType,media});
  if(media)break;
 }
}
const cdxUrl="https://web.archive.org/cdx/search/cdx?"+new URLSearchParams({
  url:PAGE,output:"json",filter:"statuscode:200",from:"2019",to:"2020",
  collapse:"timestamp:6"});
const cdx=await get(cdxUrl);
let captures=null;
if(cdx.status===200){try{const v=JSON.parse(cdx.text);if(Array.isArray(v))captures=v.slice(0,20);}catch{}}
const historical=[];
for(const item of (captures||[]).slice(1,3)){
  const stamp=item[1];
  const archiveUrl="https://web.archive.org/web/"+stamp+"id_/"+PAGE;
  const result=await get(archiveUrl);
  const oldLinks=linked(result.text,result.url);
  historical.push({timestamp:stamp,archiveUrl,
    status:result.status,bytes:result.bytes,
    contentType:result.contentType,transcriptMentionsDraft:
      /pdfs? of the runes|37 pages before they were encrypted/i.test(result.text),
    linkCount:oldLinks.length,
    sourceCandidates:oldLinks.filter(draft).slice(0,30),
    linkedPDF:oldLinks.filter(link=>/\.pdf(?:[?#]|$)/i.test(link)).slice(0,20)
  });
}
console.log(JSON.stringify({
 source:"exact 2019 publisher and public attachment APIs only",
 page:{status:main.status,bytes:main.bytes,url:main.url,
  transcriptMentionsDraft:/pdfs? of the runes|37 pages before they were encrypted/i.test(main.text),
  linkCount:links.length,sourceCandidates,
  linkedPDF:links.filter(s=>/\.pdf(?:[?#]|$)/i.test(s))},
 wordpress:attempts,attachments,hosted,hostedMedia,wpV2Media,historical,
 archive:{url:cdxUrl,status:cdx.status,bytes:cdx.bytes,
  error:cdx.status===0?cdx.contentType:null,captures}
},null,2));
}

audit().catch(error=>{console.error(error);process.exitCode=1;});
