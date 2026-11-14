'use strict';
/**
 * Audit one historically cited 2016 forum thread using source-pinned endpoints.
 * Source text is read only; no linked files or scripts are executed.
 * Reproduction: node sims/lp2_2016_calypne_thread_probe_sft.cjs
 */
const crypto = require('node:crypto');
const urls = [
  ['live', 'https://calypne.boards.net/thread/53/supposed-decoded-liber-primus'],
  ['archive20160418', 'https://web.archive.org/web/20160418151142/http://calypne.boards.net:80/thread/53/supposed-decoded-liber-primus'],
];
const hash = s => crypto.createHash('sha256').update(s).digest('hex');
/** @param {string} s */
function htmlText(s) {
  return s.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|#160);/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ').trim();
}
/** @param {string} text @param {RegExp} regex @param {number} cap */
function samples(text,regex,cap) {
  const found=[];let m;
  while((m=regex.exec(text)) && found.length<cap)found.push({index:m.index,tag:m[0].slice(0,300),context:text.slice(Math.max(0,m.index-150),m.index+600).replace(/\s+/g,' ').slice(0,800)});
  return found;
}
async function main(){
  for(const [name,url] of urls){
    try {
      const response=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(25000),headers:{'user-agent':'LP2 Source-Gate/1.0'}});
      const body=await response.text();
      console.log('CALYPNE_META '+JSON.stringify({name,status:response.status,final:response.url,bytes:Buffer.byteLength(body),sha256:hash(body)}));
      for(const [kind,rx] of [
        ['article',/<article\b[^>]*>/gi],
        ['postdiv',/<(?:div|li|tr)\b[^>]*\b(?:id|class|data-post-id)=["'][^"']*post[^"']*["'][^>]*>/gi],
        ['message',/<(?:div|article)\b[^>]*class=["'][^"']*(?:message|content-body|post-content)[^"']*["'][^>]*>/gi],
        ['first-post',/\bpost-278\b|\bpost_278\b|\bpost-id=["']278/gi]
      ]) console.log('CALYPNE_TAGS '+JSON.stringify({name,kind,samples:samples(body,rx,kind==='postdiv'?18:8)}));
      const cut=htmlText(body);
      for(const keyword of ['Supposed "decoded"','scam','hacked','decrypted','translation','decoded']){
        const ix=cut.toLowerCase().indexOf(keyword.toLowerCase());
        console.log('CALYPNE_TEXT_HITS '+JSON.stringify({name,keyword,excerpt:ix<0?'':cut.slice(Math.max(0,ix-180),ix+500)}));
      }
    }catch(error){console.log('CALYPNE_ERROR '+JSON.stringify({name,error:String(error)}));process.exitCode=1;}
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
