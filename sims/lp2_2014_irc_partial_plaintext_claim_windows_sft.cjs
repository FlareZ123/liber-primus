'use strict';
/** Original 2014 IRC windows around claims of partially deciphered LP2 text.
 * Node.js 22 CommonJS. Source bytes are pinned before processing. */
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const commit='ade9a02889ef8acbc8cde8edbfd0a785c369f4c3';
const blob='bdd277c14f94c34b5ae714cd00c238065beeed4e';
const windows=[[190223,23,'May27 13-rune word'],[212402,33,'June25 spiral key claim'],
 [213422,26,'June26 two-rune words'],[225858,24,'July23 key claim'],
 [237684,38,'August28 nine-rune claim'],[228577,48,'July28 layered-prime explanation']];
/** @param {Buffer} b */
const gitBlob=b=>crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
/** @param {string[]} lines */
function extract(lines){
 const out=[];
 for(const [center,margin,topic] of windows){
   out.push({center,topic,lines:lines.slice(center-1-margin,center+margin)
     .map((text,i)=>({line:center-margin+i,text:text.slice(0,620)}))});
 }
 return out;
}
async function main(){
 const plant=Array(237750).fill('2014 Jan 01 test');
 plant[237683]='2014 Aug 28 21:04 <x> nine-rune candidate';
 assert(extract(plant).find(x=>x.center===237684).lines.some(x=>x.text.includes('nine-rune')));
 console.log('PLANTED one-based IRC line window: PASS');
 if(process.argv.includes('--selftest'))return;
 const url='https://raw.githubusercontent.com/neuroretransmit/cicada/'+commit+'/irc-logs/%23cicadasolvers.freenode.log';
 const r=await fetch(url);assert.equal(r.status,200);
 const b=Buffer.from(await r.arrayBuffer());
 assert.equal(b.length,18487233);
 assert.equal(gitBlob(b),blob);
 console.log('SOURCE VERIFIED '+b.length+' bytes '+blob);
 const lines=b.toString('latin1').split(/\r?\n/);
 for(const w of extract(lines)){
   console.log('=== SOURCE CONTEXT '+w.center+' '+w.topic);
   for(const q of w.lines)console.log('L'+q.line+' '+q.text);
 }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
