'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const rows=[
  ['warning',[1],'enclosed','single','none','affine','atbash'],
  ['welcome',[3,4],'enclosed','multiple','none','keyword','q8-fhold'],
  ['wisdom',[5],'discrete','none','square','clear','identity'],
  ['koan1',[6,7,8,9],'enclosed','multiple','none','affine','affine-2-minus'],
  ['loss',[10,11,12,13],'enclosed','multiple','none','clear','identity'],
  ['koan2',[14,15],'footer','single','none','keyword','q13-fhold'],
  ['instruction',[16],'footer','single','square','clear','identity'],
  ['an_end',[73],'discrete','single','hex','prime','prime-minus1-fhold'],
  ['parable',[74],'discrete','single','none','clear','identity']
];
const masks=[1,2,4,3,5,6,7];
const feature=(row,mask)=>[row[2],row[3],row[4]].filter((_,i)=>mask&(1<<i)).join('/');
/** @param {string[]} a */
function mode(a){
  const c=new Map();for(const x of a)c.set(x,(c.get(x)||0)+1);
  const z=[...c].sort((a,b)=>b[1]-a[1]);
  return z.length&&(!z[1]||z[0][1]>z[1][1])?z[0][0]:null;
}
/** @param {string[]} labels @param {number} mask */
function evaluate(labels,mask){
  const predictions=[];
  for(let i=0;i<rows.length;i++){
    const tr=rows.map((_,j)=>j).filter(j=>i!==j);
    const global=mode(tr.map(j=>labels[j]));
    const match=mask?tr.filter(j=>feature(rows[i],mask)===feature(rows[j],mask)):tr;
    predictions.push(mode(match.map(j=>labels[j]))||global);
  }
  return {score:predictions.filter((x,i)=>x===labels[i]).length,predictions};
}
/** @param {string[]} labels */
function permTest(labels){
  const orig=[0,...masks].map(m=>({m,...evaluate(labels,m)}));
  const max=Math.max(...orig.slice(1).map(x=>x.score)),base=orig[0].score;
  let total=0,ge=0,improve=0;
  const counts=new Map();for(const s of labels)counts.set(s,(counts.get(s)||0)+1);
  const y=[];
  function rec(){
    if(y.length===labels.length){
      total++;const b=evaluate(y,0).score,z=Math.max(...masks.map(m=>evaluate(y,m).score));
      if(z>=max)ge++;if(z-b>=max-base)improve++;return;
    }
    for(const [s,n] of counts){if(!n)continue;counts.set(s,n-1);y.push(s);rec();y.pop();counts.set(s,n);}
  }
  rec();return {orig,max,base,total,ge,improve,p:ge/total,pGain:improve/total};
}
const broad=permTest(rows.map(r=>r[5])),exact=permTest(rows.map(r=>r[6]));
assert.deepEqual(broad.orig.map(x=>x.score),[4,2,4,4,2,3,4,4]);
assert.deepEqual(exact.orig.map(x=>x.score),[4,3,4,4,2,4,4,4]);
assert.deepEqual([broad.ge,broad.total,exact.ge,exact.total],[3570,3780,15120,15120]);
const chart=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const native=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const gp=new Map(chart.runes.map((x,i)=>[x,i]));
const digits=s=>[...s].filter(x=>gp.has(x)).map(x=>gp.get(x));
const pages=read('resources/transcriptions/lp1_wulfic_canonical.txt').split('%').map(digits).filter(x=>x.length);
assert.equal(exact.orig.find(x=>x.m===4).predictions[6],'identity');
assert.deepEqual(pages[14],digits(native.sections.find(s=>s.name==='jpg229').source_text));
assert.deepEqual(chart.pages[57].indices,digits(native.sections.find(s=>s.name==='p57_parable').source_text));
console.log(JSON.stringify({rows,broad,exact,identityReplay:{instruction:pages[14].length,parable:chart.pages[57].indices.length}},null,2));
