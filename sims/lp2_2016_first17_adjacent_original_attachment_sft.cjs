'use strict';
/** Issue #2416: original-era adjacent IRC attachment and handoff witness scan.
 * Do NOT repeat the already-failed LP1-first17 repeated-key experiment.
 * Source pinned 27,234,234-byte 2014–2016 original archived IRC blob.
 * Node22/CommonJS, read-only. Exact match contexts and neighbor URLs only.
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const URL='https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/%23cicadasolvers.freenode.2.log';
const SHA='72634a9d071d32af767edbffc0493d810e88cd0d', SIZE=27234234;
const clean=s=>s.replace(/[\x00-\x1f]/g,' ').slice(0,620);
const stamp=s=>s.slice(0,17);
const anchor=/(?:first|last|all|initial|previous|solved|last)\s*(?:seventeen|fifty.seven|17|57)\s*(?:pages?|runes?|symbols?)|\b(?:first|last)\s*(?:17|57)\b|560\.17|the\s+17\s+pages|first\s+17|last\s+57|basic\s+gematria|shifted\s+form/i;
const ref=/(?:https?:\/\/|ftp:\/\/|(?:\bwww\.|\b(?:pastebin|gist|github|titanpad|etherpad|dropbox|mediafire|mega|archive\.org|onion)\b)|\b\w[\w-]{2,}\.(?:py|lua|c|cpp|js|txt|zip|rar|7z|pdf|asc|pgp|gpg|tar|png|jpg)\b)/i;
const handoff=/\b(?:file|script|program|paste|attachment|key|decrypt|decode|solution|plain(?:text)|algorithm|source|link|upload|download|modulo|shift|matrix)\b/i;
async function main(){
  const response=await fetch(URL);
  assert.equal(response.status,200);
  const b=Buffer.from(await response.arrayBuffer());
  assert.equal(b.length,SIZE);
  const git=crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
  assert.equal(git,SHA);
  const lines=b.toString('latin1').split(/\r?\n/);
  const hits=[];
  for(let i=0;i<lines.length;i++) if(/^2016 /.test(lines[i])&&anchor.test(lines[i]))hits.push(i);
  console.log('PIN '+JSON.stringify({url:URL,git,SIZE,totalLines:lines.length,anchorCount:hits.length}));
  for(const i of hits){
    console.log('ANCHOR '+(i+1)+' '+clean(lines[i]));
    for(let j=Math.max(0,i-5);j<=Math.min(lines.length-1,i+5);j++)
      if(j!==i) console.log('NEAR L'+(j+1)+' '+clean(lines[j]));
  }
  // Collect unique exact line refs within +/- 160 source lines of an anchor.
  // Larger window gathers same-session file URLs without searching the whole corpus.
  const candidates=new Map();
  for(const i of hits)for(let j=Math.max(0,i-160);j<=Math.min(lines.length-1,i+160);j++){
    const s=lines[j];if(!/^2016 /.test(s))continue;
    if(ref.test(s)|| (Math.abs(j-i)<=35 && handoff.test(s))) {
      const d=Math.abs(j-i), existing=candidates.get(j);
      if(!existing||d<existing.d)candidates.set(j,{n:j+1,d,text:clean(s),ref:ref.test(s)});
    }
  }
  const refs=[...candidates.values()].filter(x=>x.ref).sort((a,b)=>a.d-b.d||a.n-b.n);
  const near=[...candidates.values()].filter(x=>!x.ref).sort((a,b)=>a.d-b.d||a.n-b.n);
  console.log('ADJACENT_COUNTS '+JSON.stringify({ref:refs.length,handoff:near.length,range:160,anchorCount:hits.length}));
  for(const x of refs.slice(0,155)) console.log('REF '+JSON.stringify(x));
  for(const x of near.slice(0,65)) console.log('HANDOFF '+JSON.stringify(x));
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});