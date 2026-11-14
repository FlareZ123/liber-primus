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
console.log(JSON.stringify({
 source:"exact 2019 publisher and public attachment APIs only",
 page:{status:main.status,bytes:main.bytes,url:main.url,
  transcriptMentionsDraft:/pdfs? of the runes|37 pages before they were encrypted/i.test(main.text),
  linkCount:links.length,sourceCandidates,
  linkedPDF:links.filter(s=>/\.pdf(?:[?#]|$)/i.test(s))},
 wordpress:attempts,attachments,
 archive:{url:cdxUrl,status:cdx.status,bytes:cdx.bytes,
  error:cdx.status===0?cdx.contentType:null,captures}
},null,2));
