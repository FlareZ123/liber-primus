'use strict';

/**
 * Period 2014 p56 continuation-host witness scan.
 * Search only post-LP2 May-August 2014 original solver IRC logs, and require
 * a same-day textual p56 anchor near any 16-character Tor v2 hostname.
 *
 * Run: node sims/lp2_2014_p56_onion_witness_sft.cjs [--selftest]
 * No interpretation of a participant claim as creator authentication.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const sources = [
  {name:'#cicadasolvers.freenode.log',size:18487233,sha:'bdd277c14f94c34b5ae714cd00c238065beeed4e'},
  {name:'#33012014.freenode.log',size:8629610,sha:'a2880b1db31ce523599ef30ca2e55291bf295900'}
];
const commit='ade9a02889ef8acbc8cde8edbfd0a785c369f4c3';
const hostPattern=/\b[a-z2-7]{16}\.onion\b/ig;
const anchorPattern=/\b(?:page[\s#._-]*56|p[\s#._-]*56|an[\s_-]*end|36367763ab73783c|within the deep web|page that hashes to)\b/i;
const datePattern=/^2014 (May|Jun|Jul|Aug) \d{2} /;
const contextRadius=25;

/** @param {Buffer} bytes */
function blobSha(bytes) {
  return crypto.createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
}
/** @param {string} line */
function day(line) { return datePattern.test(line) ? line.slice(0,11) : null; }
/** @param {string} line */
function hosts(line) { return [...new Set((line.match(hostPattern)||[]).map(x=>x.toLowerCase()))]; }

/** @param {string} name @param {string} original */
function scan(name,original) {
  const lines=original.split(/\r?\n/);
  const anchors=[];
  const links=[];
  for(let i=0;i<lines.length;i++){
    if(!day(lines[i]))continue;
    if(anchorPattern.test(lines[i]))anchors.push(i);
    if(hosts(lines[i]).length)links.push(i);
  }
  const witnesses=[];
  for(const i of links){
    const d=day(lines[i]);
    const nearby=anchors.filter(j=>Math.abs(j-i)<=contextRadius && day(lines[j])===d);
    if(!nearby.length)continue;
    witnesses.push({
      hostname:hosts(lines[i]),logLine:i+1,date:d,
      sourceLine:lines[i].slice(0,550),
      p56Anchors:nearby.map(j=>({line:j+1,text:lines[j].slice(0,550)}))
    });
  }
  const focused=anchors.filter(i=>/(36367763ab73783c|page that hashes to|within the deep web)/i.test(lines[i]));
  return {
    archive:name,lines:lines.length,datedP56Anchors:anchors.length,
    datedTorHostLines:links.length,nearbyP56HostWitnesses:witnesses.length,
    hostWitnesses:witnesses.slice(0,100),
    explicitP56References:focused.slice(0,70).map(i=>({line:i+1,text:lines[i].slice(0,600)}))
  };
}
async function main(){
  const sample=[
    '2014 May 17 12:00 <a> page 56 hashes to',
    '2014 May 17 12:02 <b> sourcehostabcdef.onion',
    '2014 May 18 12:00 <c> sourcehostabcdef.onion',
    '2014 Jun 02 12:00 <d> completely unrelated onion address',
  ].join('\n');
  const s=scan('plant',sample);
  assert.equal(s.datedP56Anchors,1);
  assert.equal(s.nearbyP56HostWitnesses,1);
  assert.equal(s.hostWitnesses[0].logLine,2);
  console.log('PLANTED same-day p56-host witness control: PASS');
  if(process.argv.includes('--selftest'))return;
  for(const source of sources){
    const url='https://raw.githubusercontent.com/neuroretransmit/cicada/'+commit+'/irc-logs/'+encodeURIComponent(source.name);
    const response=await fetch(url);
    assert.equal(response.status,200,'Pinned archive retrieval '+source.name);
    const b=Buffer.from(await response.arrayBuffer());
    assert.equal(b.length,source.size,'Source byte-count invariant');
    assert.equal(blobSha(b),source.sha,'Pinned original Git blob');
    console.log('SOURCE VERIFIED '+source.name+' bytes='+b.length+' git_blob='+source.sha);
    console.log('RESULT '+JSON.stringify(scan(source.name,b.toString('latin1'))));
  }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
