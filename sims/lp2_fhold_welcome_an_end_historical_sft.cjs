'use strict';
/**
 * Director #2790: first-party historical search for WELCOME and p56 AN END F-hold discovery.
 * Fetches only the two pinned 2014 IRC archives used by the prior source-selection audit,
 * verifies exact byte counts and Git blob SHA-1s, then emits dated target/F-rule matches
 * with local context. This is an evidence index, not an inference that every participant
 * statement is authoritative or that the archive contains the whole discovery.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const ref = 'ade9a02889ef8acbc8cde8edbfd0a785c369f4c3';
const files = [
  ['#cicadasolvers.freenode.log',18487233,'bdd277c14f94c34b5ae714cd00c238065beeed4e'],
  ['#33012014.freenode.log',8629610,'a2880b1db31ce523599ef30ca2e55291bf295900']
];
const dateLine = /^2014 (Jan|Feb|Mar|Apr|May) /i;
const categories = {
  welcome: /\\b(?:welcome|wisdom)\\b/i,
  an_end: /\\b(?:an\\s+end|the\\s+end)\\b/i,
  f_rule: /(?:\\bF(?:'s|s)?\\b|\\bzero[- ]shift\\b|transparent\\s+F|F\\s*(?:=|is)\\s*0)/i,
  explicit_bypass: /(?:transparent|not\\s+encrypt(?:ed)?|not\\s+encod(?:ed|ing)|skip(?:s|ped|ping)?|hold(?:s|ing)?|does(?:n't| not)\\s+advance|key\\s+does(?:n't| not)\\s+advance|zero[- ]shift)/i,
  cipher_method: /(?:crib|plaintext|cipher|decrypt|decode|vigen[eè]re|key|shift|rune|gematria)/i
};
function context(lines, ids, radius=5, limit=12) {
  const chosen=new Set();
  for(const i of ids.slice(0,limit)) for(let j=Math.max(0,i-radius);j<=Math.min(lines.length-1,i+radius);j++) chosen.add(j);
  return [...chosen].sort((a,b)=>a-b).map(i=>({line:i+1,text:lines[i].slice(0,600)}));
}
async function main(){
  const output={pinnedCommit:ref,archives:[]};
  for(const [name,bytes,sha] of files){
    const url='https://raw.githubusercontent.com/neuroretransmit/cicada/'+ref+'/irc-logs/'+encodeURIComponent(name);
    const response=await fetch(url);
    assert.equal(response.status,200,'fetch '+name);
    const raw=Buffer.from(await response.arrayBuffer());
    assert.equal(raw.length,bytes,'byte length '+name);
    const actual=crypto.createHash('sha1').update('blob '+bytes+'\\0').update(raw).digest('hex');
    assert.equal(actual,sha,'git blob SHA-1 '+name);
    const lines=raw.toString('latin1').split(/\\r?\\n/);
    const found={};
    for(const [cat,re] of Object.entries(categories)){
      const ids=[];
      for(let i=0;i<lines.length;i++){
        const s=lines[i];
        if(!dateLine.test(s))continue;
        if(re.test(s))ids.push(i);
      }
      found[cat]={count:ids.length,first:ids.slice(0,80).map(i=>({line:i+1,text:lines[i].slice(0,600)})),contexts:context(lines,ids,5,10)};
    }
    const cross=[];
    for(let i=0;i<lines.length;i++){
      const s=lines[i]; if(!dateLine.test(s))continue;
      const target=categories.welcome.test(s)||categories.an_end.test(s);
      const rule=categories.f_rule.test(s)||categories.explicit_bypass.test(s);
      const cryptoTerm=categories.cipher_method.test(s);
      if((target&&(rule||cryptoTerm))||(rule&&cryptoTerm))cross.push(i);
    }
    found.cross_reference={count:cross.length,first:cross.slice(0,120).map(i=>({line:i+1,text:lines[i].slice(0,600)})),contexts:context(lines,cross,7,16)};
    output.archives.push({name,bytes,blobSha1:actual,lineCount:lines.length,found});
  }
  console.log(JSON.stringify(output,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1});
