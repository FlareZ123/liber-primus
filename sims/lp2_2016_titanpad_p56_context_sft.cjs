'use strict';
/**
 * Original Wayback response content extraction, source pinned by the
 * 2016-04-12 CDX capture for a May 2014 solver workpad.
 * No interpretation of page-56 URL is authorized absent source context.
 */
const crypto=require('node:crypto');
const host='https://web.archive.org/web/';
const pad='https://titanpad.com/vFCy7T5p0O';
const times=['20160412033034','20160702002913'];
/** @param {string} t */
function matches(t){
 const refs=['36367763ab73783c7af28444','AN END','THE DEEP WEB','cluosh','page 56','page56','PAGE 56','https://','http://','.onion','initialAttributedText','clientVars'];
 const notes={};
 for(const phrase of refs){
  const lower=t.toLowerCase(),p=phrase.toLowerCase(),indexes=[];let idx=0;
  while((idx=lower.indexOf(p,idx))>=0){indexes.push(idx);idx+=p.length;if(indexes.length>=100)break;}
  notes[phrase]={count:indexes.length,first:indexes.slice(0,phrase==='.onion'?12:phrase.includes('http')?4:3).map(i=>({offset:i,text:t.slice(Math.max(0,i-600),Math.min(t.length,i+1100))}))};
 }
 return notes;
}
async function run(){
 for(const ts of times){
  const url=host+ts+'id_/'+pad, r=await fetch(url,{signal:AbortSignal.timeout(25000)});
  const t=await r.text();console.log(JSON.stringify({ts,http:r.status,url:r.url,length:t.length,sha256:crypto.createHash('sha256').update(t).digest('hex'),sourceEvidence:matches(t)}));
 }
}
run().catch(e=>{console.error(e);process.exitCode=1;});
