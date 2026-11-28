'use strict';
// #3334: link original 2014 upload protocol to an actual participant endpoint.
// Read three preserved primary IRC logs at a pinned Git commit and emit only
// independently dated relevant lines; this is an archival acquisition aid,
// not a network probe of onion services or a claim that a callback occurred.
const https=require('node:https');
const base='https://raw.githubusercontent.com/neuroretransmit/cicada/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs/';
const files=['#33012014.freenode.log','#cicadasolvers.freenode.log','#cicadasolvers.freenode.2.log','#cicadaops.freenode.log','#cicada3301.freenode.log','#3301ops.freenode.log'];
function get(url,left=3){
 return new Promise((resolve,reject)=>https.get(url,res=>{
  if([301,302,307,308].includes(res.statusCode)&&left){res.resume();get(new URL(res.headers.location,url),left-1).then(resolve,reject);return;}
  if(res.statusCode!==200){res.resume();reject(Error('GET '+res.statusCode+' '+url));return;}
  let total=0,buf=[];res.on('data',b=>{total+=b.length;if(total>35*1024*1024){res.destroy(Error('large log'));return;}buf.push(b);});
  res.on('end',()=>resolve(Buffer.concat(buf)));res.on('error',reject);
 }).on('error',reject));
}
const nick=/\b(?:iIIustrious|iII\|out|iiibot|noxpopuli)\b/i;
const action=/cgi-bin\/upload|\/key\.asc|[a-z2-7]{16}\.onion|SQUARES|submit|callbacks?|GET \/? |POST \/|upload(?:ed|s|ing)?|tor hidden service|hidden service|server|file\b|form|key\b/i;
const strong=/cgi-bin\/upload|\/key\.asc|[a-z2-7]{16}\.onion|callback|POST \/|GET \//i;
function scan(id,buffer){
 const s=buffer.toString('utf8'),lines=s.split(/\r?\n/),rows=[],months=new Map(),hostlines=[],nicklines=[],actions=[];
 for(let i=0;i<lines.length;i++){
  const l=lines[i];if(nick.test(l)){nicklines.push(i);const m=l.match(/(?:201[2345]\s+\w{3}\s+\d{1,2}|20\d\d[-/]\d\d[-/]\d\d)/);const k=m?.[0]||'undated';
   months.set(k,(months.get(k)||0)+1);
   if(action.test(l))rows.push({i,text:l.slice(0,460),score:strong.test(l)?3:1});}
  if(strong.test(l))actions.push(i);
  if(/[a-z2-7]{16}\.onion/i.test(l))hostlines.push(i);
 }
 const near=hostlines.filter(i=>nicklines.some(j=>Math.abs(i-j)<=9)).slice(0,60).map(i=>({i,nearNick:Math.min(...nicklines.map(j=>Math.abs(i-j))),text:lines[i].slice(0,450)}));
 const upload=actions.filter(i=>/cgi-bin\/upload|\/key\.asc|POST \/|GET \//i.test(lines[i])).slice(0,30).map(i=>({i,text:lines[i].slice(0,450)}));
 rows.sort((a,b)=>b.score-a.score||a.i-b.i);
 console.log('LOG '+JSON.stringify({id,bytes:buffer.length,totalLines:lines.length,nickLines:nicklines.length,nearHostLines:near.length,months:Array.from(months.entries()).sort().slice(0,40)}));
 console.log('NICK-SIGNAL '+JSON.stringify({id,rows:rows.slice(0,110)}));
 console.log('NEAR-ONION '+JSON.stringify({id,near}));
 console.log('UPLOADER-MENTIONS '+JSON.stringify({id,rows:upload}));
}
(async()=>{
 for(const file of files)scan(file,await get(base+encodeURIComponent(file)));
 console.log('COMPLETE all six pinned raw IRC archives reviewed; high-signal excerpts above');
})().catch(e=>{console.error(e.stack||String(e));process.exitCode=1;});
