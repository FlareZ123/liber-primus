'use strict';
// Agent 12: p33/p39 red-mark to p50 pointer chain, then authentic p56
// prime-totient clock, tested on the exact original p55 fragment boundaries.
// Read-only SFT for Windows Node.js 22.
const a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const c=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const g=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/base60-grid.json'),'utf8'));
const raw=fs.readFileSync(path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8');
const page=n=>c.pages.find(p=>p.page===n).indices;
const table=g.byte_rows.flat(),from=page(33).slice(91,99).reduce((x,y)=>x+y,0);
const to=page(39).slice(119,122).reduce((x,y)=>x+y,0);
a.equal(from,84);a.equal(to,47);a.equal(table.length,256);
const nodes=[];let x=from;
do{a.ok(!nodes.includes(x));nodes.push(x);x=table[x];}while(nodes[nodes.length-1]!==to&&nodes.length<256);
const values=nodes.map(n=>table[n]);
a.deepEqual(nodes,[84,173,117,171,54,156,52,86,111,115,247,192,0,203,68,199,47]);
a.deepEqual(values,[173,117,171,54,156,52,86,111,115,247,192,0,203,68,199,47,76]);
const index=new Map(c.runes.map((s,i)=>[s,i]));
const words=raw.split('%')[54].replace(/\/\s*/g,'').split(/[-.&$§\s]+/g)
  .map(t=>[...t].filter(s=>index.has(s)).map(s=>index.get(s))).filter(w=>w.length);
a.deepEqual(words.flat(),page(55));
a.deepEqual(words.map(w=>w.length),[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
a.deepEqual(page(55).map((v,i)=>v===0?i:-1).filter(i=>i>=0),[15,25,41]);
const primes=[];for(let n=2;primes.length<280;n++){let p=true;for(let d=2;d*d<=n;d++)if(n%d===0){p=false;break}if(p)primes.push(n)}
/** @param {number[][]} input @param {number[]} seeds @param {number} sign @param {number} mask */
function decode(input,seeds,sign,mask){
  let f=0,invalid=0;const p=[];
  for(let j=0;j<input.length;j++){let k=seeds[j];
    for(const rune of input[j]){const skip=rune===0&&!!((mask>>>f)&1);
      if(rune===0)f++;
      const v=skip?0:((rune+sign*(primes[k++]-1))%29+29)%29;
      if(v===0&&rune!==0)invalid++;p.push(v);
    }
  }
  return{p,invalid};
}
/** @param {number[]} p */
function ioc(p){const cnt=Array(29).fill(0);for(const x of p)cnt[x]++;return cnt.reduce((s,n)=>s+n*(n-1),0)/(p.length*(p.length-1));}
const findings=[];
for(const [name,seeds] of [['node',nodes],['byte',values]])for(const sign of [-1,1]){
  const candidates=Array.from({length:8},(_,mask)=>{
    const z=decode(words,seeds,sign,mask);
    return{mask,invalidF:z.invalid,ioc:ioc(z.p),translit:z.p.map(i=>c.translit[i]).join(' ')};
  });
  findings.push({name,sign,validF:candidates.filter(q=>q.invalidF===0).length,
    maxIoC:Math.max(...candidates.map(q=>q.ioc)),readouts:candidates});
}
a.deepEqual(findings.map(x=>x.validF),[8,0,0,0]);
a.ok(Math.abs(findings[0].maxIoC-0.0431578947368421)<1e-12);
// Independent native p57 plaintext plant uses exact source word lengths/keys.
const native=page(57).slice(0,76);let offset=0,mask=0,f=0;const encrypted=[];
for(let j=0;j<words.length;j++){let k=nodes[j];const word=[];
  for(let t=0;t<words[j].length;t++){const p=native[offset++];
    const v=p===0?0:(p+primes[k++]-1)%29;
    if(v===0){if(p===0)mask|=(1<<f);f++;}
    word.push(v);
  }
  encrypted.push(word);
}
a.equal(offset,76);a.deepEqual(decode(encrypted,nodes,-1,mask).p,native);
// The separate established 85-rune original solved-p56 test is reusable.
require('./authentic_lp2_p56_totient_regression.cjs');
console.log(JSON.stringify({status:'PASS',nodes,values,originalRunes:76,
 nativePlant:'76/76',models:findings},null,2));
