'use strict';
const crypto=require('node:crypto');
const URI='https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/%23cicadasolvers.freenode.2.log';
const LENGTH=27234234, BLOB='72634a9d071d32af767edbffc0493d810e88cd0d';
function gitSha(b){return crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');}
async function main(){
 const r=await fetch(URI); if(!r.ok) throw new Error('HTTP '+r.status);
 const b=Buffer.from(await r.arrayBuffer()), sha=gitSha(b);
 if(b.length!==LENGTH||sha!==BLOB) throw new Error('Pinned IRC source mismatch');
 const lines=b.toString('utf8').split(/\r?\n/);
 const out=lines.map((line,i)=>({line:i+1,text:line})).filter(x=>/^2016 Apr 15 0[4-5]:/.test(x.text));
 console.log(JSON.stringify({source:{uri:URI,length:b.length,gitBlobSha1:sha},count:out.length,lines:out},null,2));
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1;});
