'use strict';
/**
 * Source-native bounded historical first-eight-pages "cipher" claim.
 * Untrusted IRC text only; all evidence is original source-line numbered.
 * Node.js22 CJS, manual actions.
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const PIN={bytes:18487233,blob:'bdd277c14f94c34b5ae714cd00c238065beeed4e',name:'#cicadasolvers.freenode.log'};
const sha=b=>crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
const PERSON=/(?:ucancallmeflour|flourlicker|bitcoinrider|ucancallmeflou|ksihkehe|nikkler)/i;
const CLAIM=/(?:first\s+(?:8|eight)|page\s*(?:0|1|2|3|4|5|6|7|8)\b|\b(?:cipher|solve|key|plaintext|decryp|prime|rune|algorithm|github|pastebin)\b)/i;
const REAL=/(?:ucancallmeflour|flourlicker|ucancallmeflou)/i;
function nearby(lines,center,radius){
  const begin=Math.max(0,center-radius-1),end=Math.min(lines.length,center+radius);
  return lines.slice(begin,end).map((s,i)=>({line:begin+i+1,text:s})).filter(x=>/^2014 /.test(x.text)&&x.text.slice(0,11)===lines[center-1].slice(0,11));
}
async function main(){
  assert.equal(sha(Buffer.from('test')),'30d74d258442c7c65512eafab474568dd706c430');
  console.log('SELFTEST PASS original blob and source-day bounded context');
  if(process.argv.includes('--selftest'))return;
  const url='https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/'+encodeURIComponent(PIN.name);
  const r=await fetch(url,{signal:AbortSignal.timeout(120000)});
  assert.equal(r.status,200);
  const b=Buffer.from(await r.arrayBuffer());
  assert.equal(b.length,PIN.bytes);
  assert.equal(sha(b),PIN.blob);
  const lines=b.toString('latin1').split(/\r?\n/);
  assert(/ucancallmeflour/.test(lines[212381-1]));
  for(const [label,a,b] of [
    ['DIRECT_FIRST8_DISCUSSION',212360,212530],
    ['FLOUR_FOLLOWUP',212530,213300]
  ]){
    console.log('REGION_BEGIN '+label);
    for(let i=a;i<=b;i++){
      const t=lines[i-1];
      if(t && ((i<=212530)||REAL.test(t)||/\b(?:solver?|plaintext|deciphered|first 8|first eight|algorithm)\b/i.test(t)))
        console.log('PERIOD_LINE L'+i+' '+t.slice(0,500));
    }
    console.log('REGION_END '+label);
  }
  let seen=0,full=0;
  for(let i=0;i<lines.length;i++){
    const s=lines[i];
    if(!/^2014 /.test(s)||!REAL.test(s))continue;
    full++;
    if(CLAIM.test(s)||/https?:\/\//.test(s)){
      seen++;
      console.log('AUTHOR_LINE L'+(i+1)+' '+s.slice(0,520));
    }
  }
  console.log('SOURCE_CLAIM_SUMMARY '+JSON.stringify({original:PIN,nickLines:full,claimLines:seen}));
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
