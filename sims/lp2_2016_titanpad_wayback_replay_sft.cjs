'use strict';
/**
 * Replay ONLY independently indexed 2016 captures of the exact source-dated
 * May 2014 Cicada solver workpad. Do not enumerate onion domains.
 * Windows: node sims/lp2_2016_titanpad_wayback_replay_sft.cjs
 */
const crypto=require('node:crypto');
const orig='https://titanpad.com/vFCy7T5p0O';
const timestamps=['20160411191458','20160412033034','20160412061415','20160412063658','20160702002913'];
const seen=new Set();
async function check(timestamp){
 const url='https://web.archive.org/web/'+timestamp+'id_/'+orig;
 const out={timestamp,url};
 try{
  const r=await fetch(url,{signal:AbortSignal.timeout(20000),headers:{'user-agent':'LP2-2014-solver-pad-source-check/1.0'}});
  out.http=r.status;out.finalUrl=r.url;out.contentType=r.headers.get('content-type');
  const body=await r.text();out.bytes=Buffer.byteLength(body);
  out.sha256=crypto.createHash('sha256').update(body).digest('hex');
  const indicators=['36367763ab73783c7af28444','AN END','THE DEEP WEB','p56','page 56','cluosh','ky2khlqdf7qdznac','cicada','primus','clientVars','padVars','ace2','export/txt','readOnlyId'];
  out.matches=indicators.filter(term=>body.toLowerCase().includes(term.toLowerCase()));
  out.links=[...body.matchAll(/(?:href|src)=['"]([^'"]{1,400})['"]/gi)].map(m=>m[1]).filter(v=>/https?|onion|titanpad|etherpad|export/i.test(v)).slice(0,36);
  out.urls=[...new Set([...body.matchAll(/(?:https?:\/\/|[a-z2-7]{16}\.onion)[^\s"'<>]{0,150}/gi)].map(m=>m[0]))].slice(0,55);
  const lower=body.toLowerCase();
  out.contexts={};
  for(const phrase of ['36367763ab73783c7af28444','AN END','THE DEEP WEB','page 56','cluosh','initialAttributedText','clientVars']){
   const i=lower.indexOf(phrase.toLowerCase());
   if(i>=0)out.contexts[phrase]=body.slice(Math.max(0,i-450),Math.min(body.length,i+1500));
  }
  const onionHits=[...body.matchAll(/[a-z2-7]{16}\\.onion/gi)];
  out.onionContext=onionHits.slice(0,20).map(m=>body.slice(Math.max(0,m.index-130),Math.min(body.length,m.index+160)));
  seen.add(out.sha256);
 }catch(e){out.error=String(e.message??e)}
 console.log(JSON.stringify(out));
 return out;
}
(async()=>{
 const all=[];
 for(const t of timestamps)all.push(await check(t));
 console.log(JSON.stringify({captureCount:all.length,successful:all.filter(x=>x.http===200).length,uniqueBodyDigests:seen.size,containsExactTarget:all.filter(x=>x.matches?.some(t=>t==='36367763ab73783c7af28444')).map(x=>x.timestamp)}));
})().catch(e=>{console.error(e);process.exitCode=1});
