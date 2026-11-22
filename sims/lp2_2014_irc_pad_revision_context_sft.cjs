'use strict';
/**
 * Extract ONLY historically witnessed pad revision/export links from the
 * source-pinned 2014 Freenode originals. Earlier p56 and general solver-file
 * mining are intentionally outside this test.
 *
 * Windows Node.js 22: node sims/lp2_2014_irc_pad_revision_context_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const sources = [
  {name:'#cicadasolvers.freenode.log',bytes:18487233,
    sha1:'bdd277c14f94c34b5ae714cd00c238065beeed4e'},
  {name:'#33012014.freenode.log',bytes:8629610,
    sha1:'a2880b1db31ce523599ef30ca2e55291bf295900'},
];
/** @param {Buffer} b */
function gitBlob(b) {
  return crypto.createHash('sha1').update('blob '+b.length+'\0','ascii')
    .update(b).digest('hex');
}
/** @param {string[]} lines @param {string} source */
function inspect(lines,source) {
  const direct=[];
  const revision=[];
  for(let i=0;i<lines.length;i++) {
    const line=lines[i];
    if(!/^2014 (May|Jun|Jul|Aug) \d\d /.test(line)) continue;
    if(/vFCy7T5p0O|hJ8pVQ5S43/i.test(line)) {
      direct.push({
        line:i+1,
        context:lines.slice(Math.max(0,i-3),Math.min(lines.length,i+4))
          .map((text,k)=>({line:Math.max(0,i-3)+k+1,text:text.slice(0,460)})),
      });
    }
    if(/(titanpad|etherpad|pad\.com|timeslider|pad.history|pad revision|\/export\/(?:txt|html|etherpad))/i.test(line) &&
      /(history|revision|timeslider|export|download|backup|clone|snapshot)/i.test(line)) {
      revision.push({line:i+1,text:line.slice(0,550)});
    }
  }
  return {source,padMentions:direct.length,mentionContext:direct.slice(0,35),
    candidateRevisionDiscussions:revision.length,
    revisionSamples:revision.slice(0,30)};
}
async function main() {
  const out=[];
  for(const meta of sources){
    const url='https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/%23'+meta.name.slice(1);
    const response=await fetch(url,{signal:AbortSignal.timeout(90000),
      headers:{'user-agent':'LP2-pad-original-revision-history-source/1.0'}});
    assert.equal(response.status,200,url+' '+response.status);
    const blob=Buffer.from(await response.arrayBuffer());
    assert.equal(blob.length,meta.bytes,meta.name+' size');
    assert.equal(gitBlob(blob),meta.sha1,meta.name+' Git object identity');
    const lines=blob.toString('latin1').split(/\r?\n/);
    const item=inspect(lines,meta.name);
    item.sourceGitBlob=meta.sha1;
    item.sourceBytes=blob.length;
    console.log(JSON.stringify(item));
    out.push(item);
  }
  console.log('SUMMARY '+JSON.stringify({
    sourceWitnessedPadIDs:['vFCy7T5p0O','hJ8pVQ5S43'],
    verified2014ChannelBlobs:out.map(x=>x.sourceGitBlob),
    padMentions:out.reduce((n,x)=>n+x.padMentions,0),
    revisionDiscussions:out.reduce((n,x)=>n+x.candidateRevisionDiscussions,0),
    historicalLimit:'Chat statements are participant records, never a reconstructed Etherpad database or first-party Cicada instruction',
  }));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
