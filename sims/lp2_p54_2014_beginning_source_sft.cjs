'use strict';
/** Exact-source 2014 p54 "A BEGINNING" and nine-number IRC witness. */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const REV='ade9a02889ef8acbc8cde8edbfd0a785c369f4c3';
const NAME='#cicadasolvers.freenode.log';
const BYTES=18487233, BLOB='bdd277c14f94c34b5ae714cd00c238065beeed4e';
/** @param {Buffer} b @returns {string} */
const gitBlob=b=>crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
/** @param {string[]} lines @param {number} n @param {number} before @param {number} after */
const context=(lines,n,before=3,after=5)=>{
 const start=Math.max(0,n-1-before);
 return lines.slice(start,n+after).map((s,j)=>'L'+(start+j+1)+' '+s.slice(0,800)).join('\n');
};
async function main(){
 assert.equal(gitBlob(Buffer.from('hi')),'32f95c0d1244a78b2be1bab8de17906fabb2c4a8');
 const u='https://raw.githubusercontent.com/neuroretransmit/cicada/'+REV+'/irc-logs/'+encodeURIComponent(NAME);
 const res=await fetch(u);assert.equal(res.status,200);
 const b=Buffer.from(await res.arrayBuffer());assert.equal(b.length,BYTES);
 assert.equal(gitBlob(b),BLOB);
 const lines=b.toString('latin1').split(/\r?\n/);assert(lines.length>200000);
 console.log('ORIGINAL',JSON.stringify({REV,NAME,BYTES,BLOB,lines:lines.length}));
 console.log('FROZEN_LINE_186651\n'+context(lines,186651,24,32));
 const source=(s)=>/^2014 May (?:2[0-9]|3[01]) /.test(s)&&/<[^>]+>/.test(s);
 const p54=/\b(?:p(?:age)?\s*#?54|p54|pic\s*54)\b/i;
 const begin=/\bbeginning\b/i;
 const nine=/(?:\b\d{1,3}[ ,;:+-]+){8}\d{1,3}\b/;
 const hits=[];for(let i=0;i<lines.length;i++)
   if(source(lines[i])&&(p54.test(lines[i])||begin.test(lines[i])||nine.test(lines[i])))hits.push(i+1);
 const focus=hits.filter(n=>n>=179000&&n<=204000);
 console.log('MAY_P54_OR_NUMERIC_HITS',focus.length);
 const starts=focus.filter((n,i)=>!focus.slice(0,i).some(m=>Math.abs(m-n)<=3));
 for(const n of starts.slice(0,80))console.log('MAY_CONTEXT_L'+n+'\n'+context(lines,n,3,5));
 console.log('ALL_HIT_LINES',JSON.stringify(focus));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
