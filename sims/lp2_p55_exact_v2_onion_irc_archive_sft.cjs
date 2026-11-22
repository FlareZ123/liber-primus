'use strict';

/**
 * Exactly one original p55-derived onion hostname in five pinned IRC logs.
 * The extraction candidate remains untrusted; this is archival evidence only.
 * Node 22 single-file test. No connection to an onion or puzzle endpoint.
 */
const assert = require('node:assert/strict');
const https = require('node:https');
const crypto = require('node:crypto');

const commit = 'ade9a02889ef8acbc8cde8edbfd0a785c369f4c3';
const base = 'https://raw.githubusercontent.com/neuroretransmit/cicada/' + commit + '/irc-logs/';
const logs = [
  ['#33012014.freenode.log',8629610,'a2880b1db31ce523599ef30ca2e55291bf295900'],
  ['#cicadasolvers.freenode.log',18487233,'bdd277c14f94c34b5ae714cd00c238065beeed4e'],
  ['#cicadasolvers.freenode.2.log',27234234,'72634a9d071d32af767edbffc0493d810e88cd0d'],
  ['#3301cado.freenode.log',326982,'2006fa51b1130fab1bd2b8064bff54e3b2912abd'],
  ['#cicada3301.freenode.log',291299,'7eb6a3dacc841aee3930696f3b0441d091a1a457']
];
const candidate = '6sws36unkmvdy4b7.onion';
const knownHost = 'ky2khlqdf7qdznac.onion';
const markers = [candidate,candidate.slice(0,-6),candidate.slice(0,10),knownHost,knownHost.slice(0,-6)];
/** @param {string} url @param {number} max @returns {Promise<Buffer>} */
function retrieve(url,max) {
  return new Promise((resolve,reject) => {
    const req = https.get(url,{timeout:30000},res=>{
      if(res.statusCode!==200) {res.resume();reject(Error('archive HTTP '+res.statusCode));return;}
      const parts=[];let total=0;
      res.on('data',chunk=>{
        total+=chunk.length;
        if(total>max)res.destroy(Error('archive byte boundary violated'));
        else parts.push(chunk);
      });
      res.on('end',()=>resolve(Buffer.concat(parts,total)));
      res.on('error',reject);
    });
    req.on('timeout',()=>req.destroy(Error('archive timeout')));
    req.on('error',reject);
  });
}
/** @param {Buffer} bytes @returns {string} */
function gitBlob(bytes) {
  return crypto.createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0','ascii'))
    .update(bytes).digest('hex');
}
/** @param {string[]} lines */
function scan(lines) {
  const totals = Object.fromEntries(markers.map(k=>[k,0]));
  const matches=[];
  for(let i=0;i<lines.length;i++) {
    const raw=lines[i];
    const found=markers.filter(marker=>raw.toLowerCase().includes(marker));
    if(!found.length)continue;
    for(const marker of found) totals[marker]++;
    matches.push({line:i+1,markers:found,context:lines.slice(Math.max(0,i-2),Math.min(lines.length,i+3)).map((text,j)=>({line:Math.max(0,i-2)+j+1,text:text.slice(0,500)}))});
  }
  return {totals,matches};
}
assert.deepEqual(scan(['foo','historical '+knownHost,'other '+candidate]).totals,{
  [candidate]:1,[candidate.slice(0,-6)]:1,[candidate.slice(0,10)]:1,
  [knownHost]:1,[knownHost.slice(0,-6)]:1
});
async function main() {
  const evidence=[];
  for(const [name,size,sha] of logs) {
    const url=base+encodeURIComponent(name);
    const bytes=await retrieve(url,size);
    assert.equal(bytes.length,size,'archived bytes '+name);
    assert.equal(gitBlob(bytes),sha,'archived blob '+name);
    const lines=bytes.toString('utf8').split(/\r?\n/);
    const found=scan(lines);
    evidence.push({name,pinnedGitBlobSha1:sha,originalBytes:size,
      sha256:crypto.createHash('sha256').update(bytes).digest('hex'),
      source:url,lines:lines.length,...found});
    console.log('SOURCE '+JSON.stringify(evidence.at(-1)));
  }
  const targetHits=evidence.reduce((n,x)=>n+x.totals[candidate.slice(0,10)],0);
  const hostControl=evidence.reduce((n,x)=>n+x.totals[knownHost],0);
  console.log('DECISION '+JSON.stringify({
    testedHost:candidate,hostIsAuthenticated:false,
    totalPinnedArchives:logs.length,
    targetPrefixMatches:targetHits,
    independentlyHistoricalControl:knownHost,
    historicalControlMentions:hostControl,
    verdict:targetHits?'investigate original dated contextual hit':'no exact candidate or first-ten-character prefix in five preserved IRC archives',
    caveat:'Negative covers only these original public participants logs. No network service was contacted.'
  },null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
