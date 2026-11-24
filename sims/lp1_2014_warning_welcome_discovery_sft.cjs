'use strict';
/** Director #2495: two distinct LP1 historical operation decisions, no second-koan key extraction. */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const ref='ade9a02889ef8acbc8cde8edbfd0a785c369f4c3';
const sources=[
 ['#cicadasolvers.freenode.log',18487233,'bdd277c14f94c34b5ae714cd00c238065beeed4e'],
 ['#33012014.freenode.log',8629610,'a2880b1db31ce523599ef30ca2e55291bf295900']
];
const predicates={
 warning:s=>/\ba warning\b|\bbelieve nothing\b|\bexperience your death\b/i.test(s),
 atbash:s=>/\batbash\b|\brevers(?:e|ed|ing).{0,35}(?:rune|alphabet|gematria)|(?:rune|alphabet|gematria).{0,35}\brevers(?:e|ed|ing)\b/i.test(s),
 welcome:s=>/\bwelcome.{0,12}pilgrim\b|\bjourney.{0,20}end of all things\b|\bdivinity\b.{0,60}\b(?:key|vigenere|decrypt|decode|cipher|crib)\w*|\b(?:key|vigenere|decrypt|decode|cipher|crib)\w*.{0,60}\bdivinity\b/i.test(s),
 affine:s=>/\b(?:atbash|reverse(?:d)? alphabet).{0,55}\b(?:shift|offset|caesar|3|three)\b|\b(?:shift|offset|caesar).{0,55}\b(?:atbash|reverse(?:d)? alphabet)\b/i.test(s)
};
async function main(){
 for(const [name,size,sha] of sources){
  const response=await fetch('https://raw.githubusercontent.com/neuroretransmit/cicada/'+ref+'/irc-logs/'+encodeURIComponent(name));
  assert.equal(response.status,200);
  const raw=Buffer.from(await response.arrayBuffer());
  assert.equal(raw.length,size);
  assert.equal(crypto.createHash('sha1').update('blob '+size+'\0').update(raw).digest('hex'),sha);
  const lines=raw.toString('latin1').split(/\r?\n/);
  console.log('SOURCE',name);
  const candidates=[];
  for(let i=0;i<lines.length;i++)if(/^2014 (Jan|Feb|Mar|Apr) /.test(lines[i]))candidates.push(i);
  for(const [tag,pred] of Object.entries(predicates)){
   const matches=candidates.filter(i=>pred(lines[i]));
   console.log('CATEGORY',tag,'COUNT',matches.length);
   for(const i of matches.slice(0,22))console.log('L'+(i+1),lines[i].slice(0,420));
   const selected=matches.filter(i=>/2014 Feb /.test(lines[i])).slice(0,3);
   const context=new Set();
   for(const i of selected)for(let j=Math.max(0,i-5);j<=Math.min(lines.length-1,i+5);j++)context.add(j);
   for(const i of [...context].sort((a,b)=>a-b))console.log('CTX L'+(i+1),lines[i].slice(0,420));
  }
 }
}
main().catch(e=>{console.error(e);process.exitCode=1});
