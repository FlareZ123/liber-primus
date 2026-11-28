'use strict';
// Source-fixed May 2014 callback discussions from contemporaneous IRC.
// Extract precise neighbourhoods of known first-person upload witnesses and
// later May 11 response, without guessing hidden endpoints.
const https=require('node:https'),crypto=require('node:crypto');
const u='https://raw.githubusercontent.com/neuroretransmit/cicada/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs/%23cicadasolvers.freenode.log';
function get(url){return new Promise((resolve,reject)=>https.get(url,res=>{
 if(res.statusCode!==200){res.resume();reject(Error('HTTP '+res.statusCode));return;}
 const a=[];res.on('data',b=>a.push(b));res.on('end',()=>resolve(Buffer.concat(a)));res.on('error',reject);
}).on('error',reject));}
const centers=[163703,163728,163744,163748,164042,164181,165467,166205,172125,174443,181491];
function run(b){
 const lines=b.toString('utf8').split(/\r?\n/);
 console.log('SHA '+crypto.createHash('sha256').update(b).digest('hex')+' '+b.length+' '+lines.length);
 for(const center of centers){
  const rows=[];for(let i=Math.max(0,center-12);i<=Math.min(lines.length-1,center+12);i++)rows.push([i+1,lines[i].slice(0,700)]);
  console.log('ANCHOR '+JSON.stringify({center: center+1,rows}));
 }
 const all=[];for(let i=0;i<lines.length;i++){
  const x=lines[i];if(!/^2014 May (0[9]|1[0-9]|20) /.test(x))continue;
  if(/\b(?:sol1ton|iIIustrious|NoxPopuli|onecool)\b/i.test(x)&&/onion|message|upload|file|reply|cipher|PGP|key|signed|received|callback|contact|visit|server/i.test(x))
   all.push({line:i+1,text:x.slice(0,550)});
 }
 console.log('LATER-FOCUSED '+JSON.stringify(all.slice(0,170)));
}
get(u).then(run).catch(e=>{console.error(e.stack);process.exitCode=1});
