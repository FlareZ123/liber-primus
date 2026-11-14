'use strict';
/**
 * Read-only original post extraction for the March-April 2016 Calypne source.
 * Reproduces post IDs, dates, content fingerprints and GP rune alignment.
 * Usage: node sims/lp2_2016_calypne_thread_probe_sft.cjs
 */
const crypto = require('node:crypto');
const fs = require('node:fs');
const sources = [
  ['live', 'https://calypne.boards.net/thread/53/supposed-decoded-liber-primus'],
  ['2016-04-18', 'https://web.archive.org/web/20160418151142/http://calypne.boards.net:80/thread/53/supposed-decoded-liber-primus']
];
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const runeChars = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ';
const runeNames = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
const source = fs.readFileSync('resources/liber-primus/lp2-transcription.txt','utf8').split('%')[0];
const originalP0 = Array.from(source).filter(c=>runeChars.includes(c)).map(c=>runeNames[runeChars.indexOf(c)]);
/** @param {string} html */
function clean(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,'')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi,'')
    .replace(/<br\s*\/?\s*>/gi,'\n').replace(/<\/(?:p|div|blockquote)>/gi,'\n')
    .replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ')
    .replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'")
    .replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/[ \t]+/g,' ').replace(/\n[\s\n]*/g,'\n').trim();
}
/** Extract the complete balanced div.message body, including nested quoted posts.
 * @param {string} chunk */
function messageHtml(chunk) {
  const open=/<div\s+class=["']message["'][^>]*>/i.exec(chunk);
  if(!open)return '';
  let depth=1, idx=open.index+open[0].length, cursor=idx;
  const tags=/<\/?div\b[^>]*>/gi; tags.lastIndex=idx;let m;
  while((m=tags.exec(chunk))){depth+=m[0].startsWith('</')?-1:1;if(!depth){cursor=m.index;break;}}
  return chunk.slice(idx,cursor);
}
/** @param {string} doc @param {string} name */
function inspect(doc,name){
  const posts=[...doc.matchAll(/<tr\s+id=["']post-(\d+)["'][^>]*class=["'][^"']*\bpost\b[^"']*["'][^>]*>/gi)];
  console.log('CALYPNE_POST_COUNT '+JSON.stringify({name,n:posts.length,ids:posts.map(m=>+m[1])}));
  for(let i=0;i<posts.length;i++){
    const head=posts[i], body=doc.slice(head.index,posts[i+1]?.index??doc.length);
    const html=messageHtml(body), text=clean(html);
    const date=/<abbr\b[^>]*data-timestamp=["'](\d+)["']/i.exec(body)?.[1]??
      /<abbr\b[^>]*title=["']([^"']+)["']/i.exec(body)?.[1];
    const user=/<h3\b[^>]*>Post by ([^<]*?) on <abbr/i.exec(body)?.[1]??'';
    const linkMatches=[...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)].map(m=>m[1]);
    const pageMarkers=[...text.matchAll(/\bpage\s*(\d{1,2})\s*:/gi)].map(m=>+m[1]);
    const isFirst=Number(head[1])===278;
    console.log('CALYPNE_POST '+JSON.stringify({name,id:+head[1],date,user,bytes:Buffer.byteLength(text),sha256:sha(text),start:text.slice(0,isFirst?260:1350),end:isFirst?text.slice(-350):'',links:[...new Set(linkMatches)].slice(0,20),pageMarkers:isFirst?pageMarkers:undefined}));
    if(isFirst){
      const pos=text.toLowerCase().indexOf('page 0:');
      const s=text.slice(pos+7), tokenStart=s.search(/(?:^|\n)S-H-E-O-G-M-IA-F/);
      const candidates=(tokenStart>=0?s.slice(tokenStart).match(/[A-Z]+/g):[]).slice(0,Math.max(160,originalP0.length));
      let n=0;while(n<originalP0.length&&candidates[n]===originalP0[n])n++;
      console.log('CALYPNE_RUNECHECK '+JSON.stringify({name,p0OriginalLen:originalP0.length,matchPrefix:n,inspected:Math.min(originalP0.length,candidates.length),firstOriginal:originalP0.slice(0,40).join('-'),firstSource:candidates.slice(0,40).join('-'),p0Position:pos,tokenStart}));
      for(const term of ['plaintext','decoded','decrypted','translation','key','pastebin.com','http://pastebin']){
        const match=[...text.matchAll(new RegExp(term.replaceAll('.','\\.'),'gi'))].slice(0,4).map(m=>text.slice(Math.max(0,m.index-80),m.index+110).replace(/\n/g,' '));
        console.log('CALYPNE_TERM '+JSON.stringify({name,term,examples:match}));
      }
    }
  }
}
(async()=>{
  for(const [name,url] of sources){
    try{
      const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(30000)}),doc=await r.text();
      console.log('CALYPNE_SOURCE '+JSON.stringify({name,status:r.status,bytes:Buffer.byteLength(doc),sha256:sha(doc),url:r.url}));
      if(!r.ok)throw Error('HTTP '+r.status);
      inspect(doc,name);
    }catch(e){console.log('CALYPNE_ERROR '+JSON.stringify({name,error:String(e)}));process.exitCode=1;}
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
