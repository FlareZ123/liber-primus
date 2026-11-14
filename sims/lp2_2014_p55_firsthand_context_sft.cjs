'use strict';

/**
 * Read exact 2014 original IRC eyewitness question contexts for original p55.
 * For each source-discussion occurrence print only ±18 surrounding log lines,
 * preserving the speaker, date and adjacent possible key-source explanation.
 * Node22 CJS, read-only.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const url = 'https://raw.githubusercontent.com/neuroretransmit/cicada/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs/%23cicadasolvers.freenode.log';
const anchors = [
  {label:'prime continuation',match:/2014 May 19 02:37 <Ammar__> Try this the last prime used on 56/},
  {label:'multibranched',match:/2014 May 20 22:29 <silence_> page 55 13 letter rune/},
  {label:'enlightenment',match:/2014 May 21 18:09 <amone> idontworkfor3301:if the 13 rune word/},
  {label:'Jordan J2',match:/2014 May 21 18:17 <BlueFox> and I'm guessing someone has already tried J_2/}
];
(async()=>{
  const response=await fetch(url);
  assert.equal(response.status,200);
  const b=Buffer.from(await response.arrayBuffer());
  assert.equal(b.length,18487233);
  const sha=crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
  assert.equal(sha,'bdd277c14f94c34b5ae714cd00c238065beeed4e');
  const lines=b.toString('latin1').split(/\r?\n/);
  for(const anchor of anchors){
    const positions=[];
    for(let i=0;i<lines.length;i++)if(anchor.match.test(lines[i]))positions.push(i);
    assert.equal(positions.length,1,anchor.label);
    const i=positions[0];
    console.log('SOURCE '+anchor.label+' L'+(i+1));
    const lower=Math.max(0,i-18),upper=Math.min(lines.length,i+19);
    for(let n=lower;n<upper;n++)console.log('L'+(n+1)+' '+lines[n].slice(0,280));
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
