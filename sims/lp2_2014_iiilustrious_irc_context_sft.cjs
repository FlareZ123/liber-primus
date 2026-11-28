'use strict';
// #3334 focused provenance extraction from independently archived 2014-2015
// IRC logs. Exhaustive, anchored context lines, no invented onion endpoints.
const https=require('node:https');
const root='https://raw.githubusercontent.com/neuroretransmit/cicada/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs/';
const files=['#cicadasolvers.freenode.log','#33012014.freenode.log'];
function get(url){return new Promise((resolve,reject)=>{https.get(url,res=>{
 if(res.statusCode!==200){res.resume();reject(Error('HTTP '+res.statusCode));return;}
 const bufs=[];res.on('data',b=>bufs.push(b));res.on('end',()=>resolve(Buffer.concat(bufs).toString('utf8')));res.on('error',reject);
 }).on('error',reject);});}
function isNick(s){return /(?:<iIIustrious>|<iII\|out>|\* iIIustrious |\* iII\|out )/.test(s);}
const focus=[
 /2014 Feb 06 17:3[0-9]/,
 /2014 Apr 09 00:0[0-9]/,
 /2014 Jun 10 20:(4[5-9]|5[0-9])/,
 /2014 May 02 /,
 /2014 Apr 0[6-9] /,
 /2014 Apr 1[0-9] /,
 /2014 Apr 2[0-9] /
];
function extract(file,s){const lines=s.split(/\r?\n/),f=[],matches=[];
 for(let i=0;i<lines.length;i++)if(isNick(lines[i])){const line=lines[i];if(focus.some(re=>re.test(line)))matches.push(i);if(/onion|squares|upload|cgi|server|tor|submit|cicada|stage|contact|email|sig|got.*reply|further/i.test(line))f.push({i,line:line.slice(0,650)});}
 const selected=new Set;for(const i of matches)for(let j=Math.max(0,i-8);j<=Math.min(lines.length-1,i+8);j++)selected.add(j);
 let opts=[...selected].sort((a,b)=>a-b);if(opts.length>330)opts=opts.slice(0,330);
 console.log('LOG '+JSON.stringify({file,nBytes:s.length,totalLines:lines.length,nickLines:lines.filter(isNick).length,matchN:matches.length}));
 console.log('FOCUS '+JSON.stringify({file,entries:opts.map(i=>({i,t:lines[i].slice(0,460)}))}));
 console.log('NICK-DETAIL '+JSON.stringify({file,entries:f.slice(0,150)}));
}
(async()=>{for(const file of files)extract(file,await get(root+encodeURIComponent(file)));})().catch(e=>{console.error(e);process.exitCode=1;});
