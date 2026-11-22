'use strict';

/**
 * Independent 2014–2016 Arquivo.pt CDX search for six historically documented
 * Cicada 2014 onion hostnames through two early web-gateway representations.
 * Collection and era are independent of the existing 2015 OnionCity source feed.
 */
const onionHosts=[
  'auqgnxjtvdbll3pv',
  'cu343l33nqaekrnw',
  'fv7lyucmeozzd5j4',
  'avowyfgl5lkzfj3n',
  'q4utgdi2n4m4uim5',
  'ut3qtzbrvs7dtvzp'
];
/** @param {string} url */
async function check(url) {
 const endpoint=new URL('https://arquivo.pt/wayback/cdx');
 for(const [k,v] of Object.entries({url,from:'2014',to:'2016',output:'json',limit:'50',matchType:'prefix'}))endpoint.searchParams.set(k,v);
 try{
  const response=await fetch(endpoint,{signal:AbortSignal.timeout(17000)});
  const body=await response.text();
  const records=body.split(/\r?\n/).filter(Boolean).flatMap(line=>{try{
    const x=JSON.parse(line);return [{url:x.url,time:x.timestamp,mime:x.mime,status:x.status,digest:x.digest,source:x.collection}];
  }catch{return [];}});
  return {url,status:response.status,count:records.length,records:records.slice(0,10),error:response.status!==200?body.slice(0,160):undefined};
 }catch(e){return {url,error:String(e)};}
}
async function main(){
 console.log('2014-16 original Cicada historic onion gateway host-prefix source check '+new Date().toISOString());
 for(const host of onionHosts){
   for(const suffix of ['.onion.to/','.onion.city/']){
     for(const protocol of ['http://','https://']){
       console.log(JSON.stringify(await check(protocol+host+suffix)));
     }
   }
 }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
