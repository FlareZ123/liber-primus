'use strict';

/**
 * 2014–2016 archived-text witness search, exact named Cicada source terms only.
 * API: https://arquivo.pt/textsearch/api-docs/v3
 * Dates bound ORIGINAL archive captures. No live Tor requests or open-world URL guesses.
 */
const queries=[
 '"Cicada 3301"',
 '"ky2khlqdf7qdznac"',
 '"36367763ab73783c7af284446c"',
 '"within the deep web there exists a page"',
 '"Liber Primus"'
];
/** @param {string} q */
async function check(q){
 const uri=new URL('https://arquivo.pt/textsearch');
 for(const [key,value] of Object.entries({q,from:'20140101',to:'20161231235959',maxItems:'15',itemsPerSite:'3'}))uri.searchParams.set(key,value);
 try{
  const response=await fetch(uri,{signal:AbortSignal.timeout(30000)});
  const raw=await response.text();
  let data={};try{data=JSON.parse(raw);}catch{}
  const items=Array.isArray(data.response_items)?data.response_items:[];
  console.log(JSON.stringify({q,http:response.status,estimated:data.estimated_nr_results,items:items.map(x=>({title:x.title,url:x.originalURL,date:x.tstamp,archive:x.linkToArchive,snippet:x.snippet?.slice(0,240),digest:x.digest})),error:response.status===200?undefined:raw.slice(0,200)}));
 } catch(e){console.log(JSON.stringify({q,error:String(e)}));}
}
(async()=>{
 console.log('Arquivo source-key raw 2014–2016 full-text lookup '+new Date().toISOString());
 for(const q of queries) await check(q);
})().catch(e=>{console.error(e);process.exitCode=1;});
