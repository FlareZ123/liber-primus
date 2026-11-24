'use strict';
/** Director #2486: extract only the original LP1 second-Koan discovery conversation. */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const ref = 'ade9a02889ef8acbc8cde8edbfd0a785c369f4c3';
const files = [
 ['#cicadasolvers.freenode.log',18487233,'bdd277c14f94c34b5ae714cd00c238065beeed4e'],
 ['#33012014.freenode.log',8629610,'a2880b1db31ce523599ef30ca2e55291bf295900']
];
async function main(){
 for(const [name,bytes,sha] of files){
  const response=await fetch('https://raw.githubusercontent.com/neuroretransmit/cicada/'+ref+'/irc-logs/'+encodeURIComponent(name));
  assert.equal(response.status,200);
  const raw=Buffer.from(await response.arrayBuffer());
  assert.equal(raw.length,bytes);
  assert.equal(crypto.createHash('sha1').update('blob '+bytes+'\0').update(raw).digest('hex'),sha);
  const lines=raw.toString('latin1').split(/\r?\n/);
  const matches=[],crib=[],keywords=[];
  for(let i=0;i<lines.length;i++){
   const s=lines[i];
   if(!/^2014 (Jan|Feb|Mar|Apr|May) /.test(s))continue;
   if(/firfumferenfe|firfumference|the whole key is easy|the A isn't encrypted|when c.s become f.s|two f.s where not encoded|key was CIRCUMFERENCE/i.test(s))matches.push(i);
   if(/a koan.{0,30}during a less|first two words.{0,25}a koan|a isn.t encrypted/i.test(s))crib.push(i);
   if(/circumference/i.test(s)&&/\b(key|vigenere|crib|decod|decrypt|shift|guess|solv|try|tried)\w*/i.test(s))keywords.push(i);
  }
  console.log('SOURCE '+name+' matches='+matches.length+' crib='+crib.length+' keywords='+keywords.length);
  for(const [tag,ids] of [['literal',matches],['crib',crib],['circumference-method',keywords]]) {
   console.log('CATEGORY '+tag);
   for(const i of ids.slice(0,40))console.log('L'+(i+1)+' '+lines[i].slice(0,420));
  }
  const first=matches[0];
  if(first!==undefined){
   const selected=new Set([...matches.slice(0,12),...crib.filter(i=>Math.abs(i-first)<2000).slice(0,8),...keywords.filter(i=>Math.abs(i-first)<2000).slice(0,8)]);
   const idx=new Set();
   for(const i of selected)for(let j=Math.max(0,i-8);j<=Math.min(lines.length-1,i+8);j++)idx.add(j);
   console.log('CONTEXT (first discovery ±8 around matched lines)');
   for(const i of [...idx].sort((a,b)=>a-b))console.log('L'+(i+1)+' '+lines[i].slice(0,450));
  }
 }
}
main().catch(e=>{console.error(e);process.exitCode=1});
