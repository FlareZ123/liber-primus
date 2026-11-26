'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');

function experiment(corpus, solved, squareText) {
  const q = 29;
  const mod = x => ((x % q) + q) % q;
  const tr = a => a[0].map((_,j)=>a.map(r=>r[j]));
  const identity = n => Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>+(i===j)));
  const mul = (a,b) => a.map(r=>tr(b).map(c=>mod(r.reduce((s,x,i)=>s+x*c[i],0))));
  const inverse = a => {
    const n=a.length, id=identity(n), b=a.map((r,i)=>[...r.map(mod),...id[i]]);
    for(let i=0;i<n;i++){
      const j=b.findIndex((r,k)=>k>=i&&r[i]!==0);
      if(j<0)throw Error('singular matrix');
      [b[i],b[j]]=[b[j],b[i]];
      const u=Array.from({length:q-1},(_,k)=>k+1).find(x=>mod(x*b[i][i])===1);
      b[i]=b[i].map(x=>mod(x*u));
      for(let k=0;k<n;k++)if(k!==i){const v=b[k][i];b[k]=b[k].map((x,h)=>mod(x-v*b[i][h]));}
    }
    return b.map(r=>r.slice(n));
  };
  const kron=(a,b)=>a.flatMap(r=>b.map(s=>r.flatMap(x=>s.map(y=>mod(x*y)))));
  const det3=a=>mod(a[0][0]*(a[1][1]*a[2][2]-a[1][2]*a[2][1])-a[0][1]*(a[1][0]*a[2][2]-a[1][2]*a[2][0])+a[0][2]*(a[1][0]*a[2][1]-a[1][1]*a[2][0]));
  const nums=squareText.match(/\d+/g).map(Number);
  assert.equal(nums.length,99);
  let cursor=0;
  const squares=[5,7,5].map(n=>Array.from({length:n},()=>nums.slice(cursor,cursor+=n)));
  const cores=squares.map(a=>{const k=(a.length-3)/2;return a.slice(k,k+3).map(r=>r.slice(k,k+3));});
  const determinants=cores.map(det3);
  assert.deepEqual(determinants,[24,2,24]);
  const K=cores.reduce(kron), Ki=inverse(K), I=identity(27);
  assert.deepEqual(mul(K,Ki),I);
  assert.deepEqual(mul(Ki,K),I);
  const source=corpus.pages.slice(0,3).flatMap(p=>p.indices);
  assert.deepEqual(corpus.pages.slice(0,3).map(p=>p.indices.length),[262,266,201]);
  const sections=solved.sections.map(s=>({name:s.name,values:[...s.source_text].map(x=>solved.runes.indexOf(x)).filter(x=>x>=0)}));
  const donor=sections.reduce((a,b)=>a.values.length>=b.values.length?a:b);
  assert.ok(donor.values.length>=729);
  const training=sections.filter(s=>s!==donor);
  const counts=Array.from({length:q},()=>Array(q).fill(.25));
  for(const s of training)for(let i=1;i<s.values.length;i++)counts[s.values[i-1]][s.values[i]]++;
  const logs=counts.map(row=>{const z=row.reduce((a,b)=>a+b);return row.map(x=>Math.log(x/z));});
  const score=a=>a.slice(1).reduce((s,x,i)=>s+logs[a[i]][x],0)/(a.length-1);
  const ioc=a=>{const h=Array(q).fill(0);for(const x of a)h[x]++;return h.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));};
  const pack=a=>Array.from({length:27},(_,i)=>a.slice(i*27,i*27+27));
  const flat=a=>a.flat();
  const render=a=>a.map(x=>corpus.translit[x]).join(' ');
  const modes=[{name:'I',D:I,E:I},{name:'K^-1',D:Ki,E:K},{name:'K^-T',D:tr(Ki),E:tr(K)}];
  const original=pack(source), plants=[donor.values.slice(0,729),donor.values.slice(-729)];
  const candidates=[];
  for(const l of modes)for(const r of modes){
    if(l.name==='I'&&r.name==='I')continue;
    const decode=C=>mul(mul(l.D,C),r.D);
    const encode=P=>mul(mul(l.E,P),r.E);
    const plain=flat(decode(original));
    assert.deepEqual(flat(encode(pack(plain))),source);
    for(const p of plants)assert.deepEqual(flat(decode(encode(pack(p)))),p);
    candidates.push({left:l.name,right:r.name,ioc:ioc(plain),bigram:score(plain),p1p2Bigram:score(plain.slice(262)),prefix:render(plain.slice(0,48)),replay:729,plantRecovered:1458});
  }
  const native=[];
  for(let i=0;i+729<=donor.values.length;i++)native.push(score(donor.values.slice(i,i+729)));
  return {cores,determinants,source:{ioc:ioc(source),bigram:score(source)},donor:donor.name,donorLength:donor.values.length,donorWindows:native.length,donorMin:Math.min(...native),donorMax:Math.max(...native),plantScores:plants.map(score),candidates};
}
if(require.main===module) {
  const result=experiment(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8')),JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8')),fs.readFileSync('resources/cicada2014-openpuff-magic-squares.txt','utf8'));
  console.log(JSON.stringify(result,null,2));
}
module.exports={experiment};
