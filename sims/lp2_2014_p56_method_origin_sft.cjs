'use strict';
/**
 * First p56 solve-method witness screen, May–July 2014 IRC.
 * Read-only, frozen original Git blobs. Run: node sims/lp2_2014_p56_method_origin_sft.cjs
 * Dates and nicknames are observations in community logs, not author authentication.
 * Node.js 22 CJS. No dependencies.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const F = [
  ['#cicadasolvers.freenode.log', 18487233, 'bdd277c14f94c34b5ae714cd00c238065beeed4e'],
  ['#33012014.freenode.log', 8629610, 'a2880b1db31ce523599ef30ca2e55291bf295900'],
  ['#cicadasolvers.freenode.2.log', 27234234, '72634a9d071d32af767edbffc0493d810e88cd0d']
];
const ref = 'ade9a02889ef8acbc8cde8edbfd0a785c369f4c3';
const period = /^2014 (May|Jun|Jul) (\d\d) (\d\d:\d\d) /;
const p56 = /\b(?:page[ -]?(?:56|fifty.six)|pg[ -]?56|p56|56\.jpg|an end|the end)\b/i;
const methods = /\b(?:totient|euler|phi|prime|skip|bypass|interrupt|plaintext|decrypt|decipher|crack|decode|solv|key|offset|vigenere)\w*/i;
const specifics = /\b(?:totient|euler|phi|prime|skipp?ing|skip|interrupt|bypass|an end)\b/i;
const solution = /\b(?:solved|solv(?:e|ing)|decoded|decrypted|deciphered|cracked|key(?:word)?\s+(?:is|was)|got\s+it)\b/i;
/** @param {Buffer} b */
function blob(b) {return crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');}
/** @param {string[]} lines @param {number} i @param {number} radius */
function window(lines,i,radius=3) {return lines.slice(Math.max(0,i-radius),i+radius+1).map((line,j)=>'L'+(Math.max(0,i-radius)+j+1)+' '+line.slice(0,260));}
/** @param {string[]} lines @param {number[]} ids @param {string} name */
function display(lines,ids,name,max=80) {
  console.log('CATEGORY '+name+' count='+ids.length+' (first '+Math.min(ids.length,max)+')');
  for (const i of ids.slice(0,max)) console.log('L'+(i+1)+' '+lines[i].slice(0,420));
}
async function main(){
  const plant=['2014 May 15 19:57 <c> use totient?','2014 May 15 19:58 <c> jk','2014 Jun 19 00:01 <a> page 56 solved','2014 Jun 20 00:01 <b> AN END'];
  assert.equal(plant.filter(s=>p56.test(s)&&solution.test(s)).length,1);
  assert(methods.test(plant[0]));
  assert.equal(blob(Buffer.from('hi')),'32f95c0d1244a78b2be1bab8de17906fabb2c4a8');
  console.log('CONTROL: static clue and original blob SHA1 tests PASS');
  for(const [name,bytes,sha] of F) {
    const url='https://raw.githubusercontent.com/neuroretransmit/cicada/'+ref+'/irc-logs/'+encodeURIComponent(name);
    const response=await fetch(url);
    assert.equal(response.status,200,url);
    const raw=Buffer.from(await response.arrayBuffer());
    assert.equal(raw.length,bytes,name+' size');
    assert.equal(blob(raw),sha,name+' blob hash');
    const lines=raw.toString('latin1').split(/\r?\n/);
    const matched=[],specific=[],solved=[],cluosh=[],end=[],all56=[];
    for(let i=0;i<lines.length;i++) {
      const s=lines[i];
      if(!period.test(s))continue;
      const is56=p56.test(s);
      if(is56)all56.push(i);
      if(/\bAN END\b/i.test(s))end.push(i);
      if(/<cluosh>/i.test(s)&&/(?:rune|page|p56|solv|key|totient|cipher|decrypt|prime|shift|skip|phi)/i.test(s))cluosh.push(i);
      if(specifics.test(s)&&(/\b(?:p56|page\s*56|cluosh|an end)\b/i.test(s)||(/<cluosh>/i.test(s))))specific.push(i);
      if(is56&&solution.test(s))solved.push(i);
      if(is56&&methods.test(s))matched.push(i);
    }
    console.log('=== ARCHIVE '+name+' bytes='+bytes+' sha='+sha+' MayJul p56 mentions='+all56.length);
    display(lines,specific,'explicit operation/source-person link',80);
    display(lines,solved,'explicit page56 solved claim',70);
    display(lines,end,'literal AN END occurrences',45);
    display(lines,cluosh,'cluosh method-related statements',90);
    display(lines,matched,'page56 and method same line',80);
    const important=new Set([...specific.slice(0,30),...solved.slice(0,30),...end.slice(0,18),...cluosh.slice(0,25)]);
    const ix=[...important].sort((a,b)=>a-b);
    console.log('=== CONTEXT source='+name+' windows='+ix.length);
    for(const i of ix)console.log('WINDOW '+name+' '+(i+1)+'\n'+window(lines,i,2).join('\n'));
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
