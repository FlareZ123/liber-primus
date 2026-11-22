'use strict';
/**
 * Reconstruct the original June 18 2014 prime spreadsheet conversation.
 * Sources are 2014 Freenode participant chat, not Cicada-authored instructions.
 * Exact 2014 log Git blob: bdd277c14f94c34b5ae714cd00c238065beeed4e.
 * Invocation: node sims/lp2_2014_sheet_irc_context_sft.cjs --network
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const URL='https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/%23cicadasolvers.freenode.log';
const EXPECT={bytes:18487233,sha:'bdd277c14f94c34b5ae714cd00c238065beeed4e'};
/** @param {Buffer} bytes @returns {string} */
function blobHash(bytes){return crypto.createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');}
/** @param {string[]} lines @param {number} lineNo @param {number} margin */
function printContext(lines,lineNo,margin){
  for(let i=Math.max(0,lineNo-margin-1);i<Math.min(lines.length,lineNo+margin);i++){
    const x=lines[i];
    if (/^2014 Jun 18/.test(x))console.log('LINE '+(i+1)+' '+x.slice(0,700));
  }
}
async function main(){
  assert.ok(process.argv.includes('--network'));
  const response=await fetch(URL,{signal:AbortSignal.timeout(120000)});
  assert.equal(response.status,200);
  const bytes=Buffer.from(await response.arrayBuffer());
  assert.equal(bytes.length,EXPECT.bytes);
  assert.equal(blobHash(bytes),EXPECT.sha);
  const lines=bytes.toString('latin1').split(/\r?\n/);
  assert.ok(lines[203972].includes('sheet.ods'),'Original frozen source line moved');
  console.log('AUTHENTIC source git blob '+EXPECT.sha+' lines '+lines.length);
  printContext(lines,203973,65);
  const terms=/\b(?:sheet\.ods|terrafant|keystream spreadsheet|prime(?:s)? (?:key|stream|row)|nem0)\b/i;
  const matches=[];
  for(let i=0;i<lines.length;i++){
    if(!/^2014 (?:May|Jun|Jul|Aug) /.test(lines[i]))continue;
    if(!terms.test(lines[i]))continue;
    matches.push({line:i+1,text:lines[i].slice(0,400)});
  }
  console.log('RELATED SOURCE-DATED HITS '+JSON.stringify(matches.slice(0,200)));
  console.log('HIT COUNT '+matches.length);
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1});
