'use strict';

// Retrieve only the exact historical context for the participant's
// 560.17 / first-seventeen-pages speculation. This is context, not authority
// for an LP2 operation. Verify the pinned Git blob before displaying matches.

const crypto = require('node:crypto');
const URI = 'https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/%23cicadasolvers.freenode.2.log';
const EXPECTED_LENGTH = 27234234;
const EXPECTED_BLOB = '72634a9d071d32af767edbffc0493d810e88cd0d';

function gitBlobSha1(b) {
  return crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
}
async function main() {
  const r=await fetch(URI);
  if(!r.ok) throw new Error('IRC log fetch failed: HTTP '+r.status);
  const b=Buffer.from(await r.arrayBuffer());
  const sha=gitBlobSha1(b);
  if(b.length!==EXPECTED_LENGTH || sha!==EXPECTED_BLOB) throw new Error('IRC log pinned-source mismatch: '+b.length+' '+sha);
  const lines=b.toString('utf8').split(/\r?\n/);
  const hits=[];
  for(let i=0;i<lines.length;i++){
    if(/560\.17|first seventeen|first 17 pages|seventeen pages/i.test(lines[i])){
      const lo=Math.max(0,i-3), hi=Math.min(lines.length,i+5);
      hits.push({line:i+1,context:lines.slice(lo,hi)});
    }
  }
  console.log(JSON.stringify({
    source:{uri:URI,length:b.length,gitBlobSha1:sha,lines:lines.length},
    matchCount:hits.length,
    matches:hits
  },null,2));
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1;});
