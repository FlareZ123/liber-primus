'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
/** @param {object} grid Scan-verified physical token grid. */
function run(grid) {
  const mul=(a,b)=>{let c=0;while(b){if(b&1)c^=a;b>>=1;a<<=1;if(a&256)a^=0x11d;}return c;};
  const pow=[1];for(let i=1;i<255;i++)pow.push(mul(pow[i-1],2));
  if(new Set(pow).size!==255)throw Error("bad field");
  const syndrome=(row,r)=>Array.from({length:r},(_,i)=>row.reduce((v,b)=>mul(v,pow[i])^b,0));
  const encode=(msg,r)=>{let g=[1];for(let i=0;i<r;i++){let h=Array(g.length+1).fill(0);g.forEach((v,j)=>{h[j]^=v;h[j+1]^=mul(v,pow[i]);});g=h;}
    let w=[...msg,...Array(r).fill(0)];for(let i=0;i<msg.length;i++){let a=w[i];g.forEach((v,j)=>w[i+j]^=mul(a,v));}return [...msg,...w.slice(msg.length)];};
  let result=[];
  for(const radix of [60,59]){
    let alpha=radix===60?grid.alphabet:grid.alphabet.replace("f","");
    const rows=grid.pages.flatMap(p=>Array.from({length:p.rows},(_,i)=>p.tokens.slice(8*i,8*i+8).map(t=>alpha.length*alpha.indexOf(t[0])+alpha.indexOf(t[1]))));
    if(rows.length!==32||rows.some(r=>r.length!==8||r.some(v=>v<0||v>255)))throw Error("bad grid");
    let cases=[],positive=0,negative=0,original=0,regeneration=0;
    for(const reflected of [false,true])for(let r=1;r<8;r++){
      let hits=[];
      for(let i=0;i<rows.length;i++){
        let row=reflected?[...rows[i]].reverse():rows[i];
        if(syndrome(row,r).every(v=>v===0)){hits.push(i+1);original++;}
        if(encode(row.slice(0,8-r),r).every((v,j)=>v===row[j]))regeneration++;
        let plant=encode(row.slice(0,8-r),r);
        if(!syndrome(plant,r).every(v=>v===0)||!encode(plant.slice(0,8-r),r).every((v,j)=>v===plant[j]))throw Error("plant failed");
        positive++;
        for(let j=0;j<8;j++){let bad=[...plant];bad[j]^=1;if(syndrome(bad,r).every(v=>v===0))throw Error("negative failed");negative++;}
      }
      cases.push({reflected,r,hits});
    }
    result.push({radix,firstSyndromes:rows.map(r=>syndrome(r,1)[0]),cases,original,regeneration,positive,negative});
  }
  return result;
}
if(require.main===module){const raw=fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-grid-256.json'));const blob=crypto.createHash('sha1').update(`blob ${raw.length}\0`).update(raw).digest('hex');if(blob!=='2550eae357442912220e05dc51147523a61dd75a')throw Error('input blob mismatch');console.log(JSON.stringify(run(JSON.parse(raw.toString('utf8'))),null,2));}
module.exports={run};
