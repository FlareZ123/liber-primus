'use strict';

/**
 * Source-pinned historical SKY/UDP discriminator on the larger archived
 * solver IRC channels. Read-only HTTPS to publicly preserved Git blob bytes.
 * Never contacts an historical Cicada puzzle server.
 *
 * Node 22: node sims/lp2_2014_udp_laterchannels_archive_sft.cjs
 */
const assert = require('node:assert/strict');
const https = require('node:https');
const crypto = require('node:crypto');

const COMMIT = 'ade9a02889ef8acbc8cde8edbfd0a785c369f4c3';
const PREFIX = 'https://raw.githubusercontent.com/neuroretransmit/cicada/'
  + COMMIT + '/irc-logs/';
const LOGS = [
  {name:'#cicadasolvers.freenode.log',bytes:18487233,
    sha:'bdd277c14f94c34b5ae714cd00c238065beeed4e'},
  {name:'#cicadasolvers.freenode.2.log',bytes:27234234,
    sha:'72634a9d071d32af767edbffc0493d810e88cd0d'},
  {name:'#3301cado.freenode.log',bytes:326982,
    sha:'2006fa51b1130fab1bd2b8064bff54e3b2912abd'},
  {name:'#cicada3301.freenode.log',bytes:291299,
    sha:'7eb6a3dacc841aee3930696f3b0441d091a1a457'}
];

/** @param {string} url @param {number} size @returns {Promise<Buffer>} */
function retrieve(url,size) {
  return new Promise((resolve,reject)=>{
    const req=https.get(url,{timeout:30000},res=>{
      if(res.statusCode!==200){res.resume();reject(Error('archive HTTP '+res.statusCode));return;}
      const parts=[];let count=0;
      res.on('data',p=>{
        count+=p.length;
        if(count>size)res.destroy(Error('source grew beyond pinned size'));
        else parts.push(p);
      });
      res.on('end',()=>resolve(Buffer.concat(parts,count)));
      res.on('error',reject);
    });
    req.on('timeout',()=>req.destroy(Error('archived log timeout')));
    req.on('error',reject);
  });
}
/** @param {Buffer} bytes @returns {string} */
function gitBlob(bytes) {
  return crypto.createHash('sha1')
    .update(Buffer.from('blob '+bytes.length+'\0','ascii'))
    .update(bytes).digest('hex');
}
/** @param {string[]} lines @returns {object} */
function inspect(lines){
  const rules={
    udp:/\budp\b/i,
    port9133:/\b9133\b/i,
    port3319:/\b3319\b/i,
    pcap:/\bpcap\b|packet\s+capture/i,
    candidateProtocolAndPort:/\budp\b.*\b(9133|3301|1033|3319)\b|\b(9133|3301|1033|3319)\b.*\budp\b/i
  };
  const counters=Object.fromEntries(Object.keys(rules).map(k=>[k,0]));
  const records=Object.fromEntries(Object.keys(rules).map(k=>[k,[]]));
  for(let i=0;i<lines.length;i++){
    const line=lines[i];
    for(const [name,re] of Object.entries(rules)){
      if(re.test(line)){
        counters[name]++;
        if(records[name].length<35)
          records[name].push({line:i+1,text:line.slice(0,500)});
      }
    }
  }
  return {lines:lines.length,first:lines[0]?.slice(0,130),
    last:lines[lines.length-2]?.slice(0,130),counts:counters,
    cappedSourceLineExamples:records};
}
assert(inspect(['mention UDP 9133.']).counts.udp===1);
assert(inspect(['mention UDP 9133.']).counts.candidateProtocolAndPort===1);

async function main(){
  for(const spec of LOGS){
    const url=PREFIX+encodeURIComponent(spec.name);
    const bytes=await retrieve(url,spec.bytes);
    assert.equal(bytes.length,spec.bytes);
    assert.equal(gitBlob(bytes),spec.sha);
    const result={
      name:spec.name,
      source:url,rawBytes:spec.bytes,pinnedGitBlobSha1:spec.sha,
      sha256:crypto.createHash('sha256').update(bytes).digest('hex'),
      ...inspect(bytes.toString('utf8').split(/\r?\n/)),
      // Frozen after first unbiased matching pass: inspect the complete
      // surrounding participant conversation for each potentially relevant
      // protocol/port claim. 1-based source file line positions.
      sourceContext:(spec.name==='#cicadasolvers.freenode.log'
        ? [[5529,5545],[8438,8475],[36712,36743],
          [92412,92434],[94764,94781],[177391,177408]]
        : spec.name==='#cicadasolvers.freenode.2.log'
        ? [[164413,164457]]
        : []).map(([lo,hi])=>({
          sourceLines:[lo,hi],
          conversation:bytes.toString('utf8').split(/\r?\n/)
            .slice(lo-1,hi).map((line,i)=>({line:lo+i,text:line.slice(0,500)}))
        })),
      packetsSent:0
    };
    console.log('ARCHIVED_LOG_RESULT '+JSON.stringify(result));
  }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
