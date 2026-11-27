'use strict';
// Reconstruct the November 2014 crashdemons XOR scan, with held-out output rows.
const fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path'),assert=require('node:assert/strict');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const display=b=>[...b].map(x=>x>=32&&x<=126?String.fromCharCode(x):'.').join('');
const hex=x=>x.toString(16).padStart(8,'0').toUpperCase();
async function main(){
 const r=await fetch('https://pastebin.com/raw/hJPaQR4k');assert.equal(r.status,200);
 const raw=Buffer.from(await r.arrayBuffer());assert.equal(sha(raw),'756c1c10eb660d5faf4a02fdaa988b6b5f218caf66b619f96bb4594eb2f886d4');
 const lines=raw.toString('utf8').split(/\r?\n/);const rows=[];
 for(const line of lines){const m=line.match(/^\|  (.{20}) @ 0x([0-9A-Fa-f]+) \((\d+)R\)/);if(m)rows.push({s:m[1],o:parseInt(m[2],16),score:+m[3]});}
 const files=Array.from({length:58},(_,p)=>fs.readFileSync(path.join('resources/liber-primus',String(p+17).padStart(2,'0')+'.jpg')));
 assert.equal(rows[0].o,0x7668);assert.equal(rows[1].o,0x13890);
 const k=Buffer.alloc(20),a=rows[0],b=rows[1];const known=[];
 for(let i=0;i<20;i++){if(a.s[i]==='.')continue;assert.equal(files[0][a.o+i],files[0][b.o+i]);k[i]=files[0][a.o+i]^a.s.charCodeAt(i);known.push(i);}
 assert.equal(known.length,19);
 // Use a third distinct output with visible character at the missing position.
 const t=rows.find(x=>x.o===0xdea9);assert(t);const pos=Array.from({length:20},(_,i)=>i).find(i=>!known.includes(i));
 const possible=files.flatMap((f,p)=>t.o+20<=f.length&&known.every(i=>t.s[i]==='.'||(f[t.o+i]^k[i])===t.s.charCodeAt(i))?[p]:[]);
 assert.deepEqual(possible,[2]);k[pos]=files[2][t.o+pos]^t.s.charCodeAt(pos);
 const score=(b,mask)=>[...b].filter(x=>x>=32&&x<=126||(x>=9&&x<=13&&(mask&(1<<(x-9))))).length;
 const matches=rows.map(x=>({...x,pages:files.flatMap((f,p)=>{if(x.o+20>f.length)return [];const b=Buffer.from(k.map((v,i)=>v^f[x.o+i]));return display(b)===x.s?[{p,b:b.toString('hex'),ascii:score(b,0),scores:Array.from({length:32},(_,i)=>score(b,i))}]:[]})}));
 const fitting=Array.from({length:32},(_,i)=>i).filter(m=>matches.every(x=>x.pages.some(p=>p.scores[m]===x.score)));
 const exact=matches.filter(x=>x.pages.length);console.log('SCAN '+JSON.stringify({rows:rows.length,unparsed:lines.filter(x=>x.trim()&&!/^\|  .{20} @ 0x[0-9A-Fa-f]+ \(\d+R\)/.test(x)).slice(0,12),key:k.toString('hex'),matched:exact.length,uniquePage:exact.filter(x=>x.pages.length===1).length,unmatched:matches.filter(x=>!x.pages.length).slice(0,10),fitting,holdout:rows.length-3}));
 const scans=[];
 for(const mask of fitting.slice(0,4)){
  const counts={},maxima=[],hist={};
  const lookup=Array.from(k,v=>Uint8Array.from({length:256},(_,x)=>{x^=v;return +(x>=32&&x<=126||(x>=9&&x<=13&&(mask&(1<<(x-9)))))}));
  for(let p=0;p<files.length;p++){
   const f=files[p],n=f.length-19;let best=0,offsets=[];
   for(let o=0;o<n;o++){let s=0;for(let i=0;i<20;i++)s+=lookup[i][f[o+i]];if(s>=17)hist[s]=(hist[s]||0)+1;if(s>best){best=s;offsets=[o]}else if(s===best)offsets.push(o);}
   counts[best]=(counts[best]||0)+1;
   for(const o of offsets){const s=display(Buffer.from(k.map((v,i)=>v^f[o+i])));maxima.push({p,o,s,score:best});}
  }
  const id=x=>x.s+'|'+x.o+'|'+x.score, mset=a=>{const m=new Map();for(const x of a)m.set(id(x),(m.get(id(x))||0)+1);return m;};
  const expected=mset(rows),actual=mset(maxima);let overlap=0;
  for(const [id,n] of expected)overlap+=Math.min(n,actual.get(id)||0);
  const stat={mask,counts,hist,maxima:maxima.length,overlap,sourceOnly:rows.length-overlap,recomputedOnly:maxima.length-overlap,top:maxima.filter(x=>x.score>=19)};
  console.log('MAXIMA '+JSON.stringify(stat));scans.push({...stat,maxima});
 }
 fs.writeFileSync(path.join(process.env.RUNNER_TEMP||'.','source-test-output.json'),JSON.stringify({key:k.toString('hex'),matches,fitting,scans}));
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1});
