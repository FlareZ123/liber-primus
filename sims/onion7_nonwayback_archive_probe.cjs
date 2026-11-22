'use strict';
const { createHash } = require('node:crypto');
const hosts = ['ky2khlqdf7qdznac.onion','ky2khlqdf7qdznac.onion.to','ky2khlqdf7qdznac.tor2web.org','ky2khlqdf7qdznac.onion.link','ky2khlqdf7qdznac.onion.city'];
async function get(url) {
  try {
    const response = await fetch(url, {signal:AbortSignal.timeout(18000),headers:{'user-agent':'LiberPrimus-Stage11-Archive-Census/1'}});
    const bytes = Buffer.from(await response.arrayBuffer());
    return {status:response.status,url:response.url,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),body:bytes.length<1200000?bytes.toString('utf8'):''};
  } catch (error) {return {error:String(error)};}
}
async function cdx(host,control) {
  const q = new URL('https://arquivo.pt/wayback/cdx');
  q.searchParams.set('url',control?'http://www.sapo.pt/':'http://'+host+'/*');
  q.searchParams.set('from','2014'); q.searchParams.set('to','2018');
  q.searchParams.set('output','json'); q.searchParams.set('limit','200');
  const r=await get(q.href);
  let captures=[];
  if(r.status===200 && r.body) {try {captures=r.body.trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);}catch(e){r.parse_error=String(e);}}
  const replays=[];
  for(const c of captures.filter(x=>String(x.status||x.statuscode)==='200' && /text\/(html|plain)/i.test(x.mime||x.mimetype||'')).slice(0,3)) {
    const url='https://arquivo.pt/wayback/'+c.timestamp+'id_/'+(c.url||'http://'+host+'/');
    const x=await get(url); delete x.body; replays.push({requested:url,...x});
  }
  delete r.body;
  return {source:'arquivo.pt',host,control,requested:q.href,captures,replays,...r};
}
async function today(host,control) {
  const url='https://archive.ph/http://'+(control?'example.com':host)+'/';
  const r=await get(url); const html=r.body||'';
  const links=[...new Set(html.match(/https?:\/\/archive\.(?:ph|is|today|li|md)\/[a-zA-Z0-9]{4,8}\b/g)||[])];
  delete r.body;
  return {source:'archive.ph',host,control,requested:url,snapshot_links:links,...r};
}
async function main(){
 const results=[await cdx('www.sapo.pt',true),await today('example.com',true)];
 for(const host of hosts){results.push(await cdx(host,false),await today(host,false));}
 const positives=results.filter(x=>!x.control&&(x.captures?.length||x.snapshot_links?.length));
 process.stdout.write(JSON.stringify({schema:1,purpose:'Non-Wayback exact historical Stage11-host archive census',date:new Date().toISOString(),hosts,positive_index_results:positives.length,warning:'Controls must succeed for scoped negatives; errors/timeouts are inconclusive. Exact original HTTP bytes require a successful indexed replay, not a listing.',results},null,2)+'\n');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
