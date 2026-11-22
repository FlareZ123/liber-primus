'use strict';

/**
 * Bounded 2015 Arquivo.pt CDX check for contemporary OnionCity host-index inputs.
 * Source contract: https://arquivo.pt/wayback/cdx/api-docs/v3
 * No Tor access, no scraping current onion endpoints, no downloaded-body storage.
 */
const sites = [
 'http://www.publico.pt/',
 'http://www.sapo.pt/',
 'http://onion.city/sitemap.xml',
 'http://www.onion.city/sitemap.xml',
 'http://onion.city/',
 'http://skunksworkedp2cg.onion.city/sites.txt',
 'http://xlmvhk3rpdux26dz.onion.city/',
 'http://kkkkkku5juzqh33a.onion.city/',
 'http://ky2khlqdf7qdznac.onion.city/',
 'https://ahmia.fi/onions/'
];
/** @param {string} url */
async function inspect(url) {
 const endpoint=new URL('https://arquivo.pt/wayback/cdx');
 for (const [key,value] of Object.entries({url,from:'2015',to:'2015',output:'json',limit:'20'}))
   endpoint.searchParams.set(key,value);
 try{
  const res=await fetch(endpoint,{signal:AbortSignal.timeout(15000)});
  const body=(await res.text()).slice(0,20000);
  const records=body.split(/\r?\n/).filter(Boolean).flatMap(row=>{try{const x=JSON.parse(row);return [{url:x.url,timestamp:x.timestamp,status:x.status,mime:x.mime,filename:x.filename}]}catch{return []}});
  return {url,status:res.status,count:records.length,records,excerpt:res.status===200?undefined:body.slice(0,220),bodyLength:body.length};
 }catch(e){return {url,error:String(e)}}
}
(async()=>{
 console.log('Arquivo.pt CDX bounded 2015 original-source index lookup: '+new Date().toISOString());
 for(const url of sites) console.log(JSON.stringify(await inspect(url)));
})().catch(e=>{console.error(e);process.exitCode=1;});
