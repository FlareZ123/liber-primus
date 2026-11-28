'use strict';
// #3334 follow-on independent input acquisition: URLs and explicit cryptographic
// objects from preserved 1–20 May 2014 chat, when LP2/onion7 was released.
// No unbounded link crawl or inferred ciphertext. New raw input only.
const https=require('node:https'),crypto=require('node:crypto');
const base='https://raw.githubusercontent.com/neuroretransmit/cicada/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs/';
const files=['#cicadasolvers.freenode.log','#33012014.freenode.log'];
const get=u=>new Promise((resolve,reject)=>https.get(u,r=>{
 if(r.statusCode!==200){r.resume();reject(Error('HTTP '+r.statusCode+' '+u));return;}
 let total=0,parts=[];r.on('data',b=>{total+=b.length;if(total>26e6){r.destroy(Error('cap'));return;}parts.push(b)});
 r.on('end',()=>resolve(Buffer.concat(parts)));r.on('error',reject);
}).on('error',reject));
const date=/^2014 May (0[1-9]|1[0-9]|20) /;
const context=/message\.txt|\.asc\b|\bLP2\b|liber.?primus|runes?|cipher|decrypt|password|key\.asc|upload|server|callback|signed|secret|recipient|invitation|onion|prime|hash|magicsquares?|PGP|payload|hidden service/i;
const url=/\b(?:https?:\/\/[^\s<>"']+|[a-z2-7]{16}\.onion(?:\/[^\s<>"']*)?|[a-z0-9_-]+\.pastebin\.com\/[^\s<>"']+)/gi;
function print(f,bytes){
 const rows=bytes.toString('utf8').split(/\r?\n/),selected=[];
 const hosts=new Map(),sigs=[],ranked=[],datecounts={};
 for(let i=0;i<rows.length;i++){const line=rows[i];if(!date.test(line))continue;
  const d=line.slice(0,11);datecounts[d]=(datecounts[d]||0)+1;
  const links=[...line.matchAll(url)].map(m=>m[0].replace(/[\])},.;]+$/,''));
  for(const u of links){let host=u.replace(/^https?:\/\//i,'').split('/')[0].toLowerCase();hosts.set(host,(hosts.get(host)||0)+1);}
  if(links.length)selected.push({i,date:d,urls:links.slice(0,8),text:line.slice(0,600)});
  if(context.test(line))ranked.push({i,date:d,text:line.slice(0,640)});
  if(/begin pgp|sha-512|whirlpool|p(?:age)?(?:0|1|2|5[0-7])\b|upload.*(message|file)|message.*(upload|file)/i.test(line))sigs.push({i,date:d,text:line.slice(0,520)});
 }
 console.log('MANIFEST '+JSON.stringify({file:f,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),datecounts,allMayUrls:selected.length,cryptoMentions:ranked.length,priority:sigs.length,topHosts:[...hosts].sort((a,b)=>b[1]-a[1]).slice(0,55)}));
 console.log('URL_ROWS '+JSON.stringify({file:f,rows:selected.slice(0,260)}));
 console.log('CRYPTO_ROWS '+JSON.stringify({file:f,rows:sigs.slice(0,150)}));
}
(async()=>{for(const f of files)print(f,await get(base+encodeURIComponent(f)));})().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
