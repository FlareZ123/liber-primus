'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const degree=x=>31-Math.clz32(x);
function rem(a,b){while(a&&degree(a)>=degree(b))a^=b<<(degree(a)-degree(b));return a;}
const fields=()=>Array.from({length:128},(_,i)=>257+2*i).filter(f=>{
  for(let d=1;d<=4;d++)for(let g=1<<d;g<1<<(d+1);g++)if(rem(f,g)===0)return false;
  return true;
});
function field(f) {
  function mul(a,b){let c=0;while(b){if(b&1)c^=a;b>>=1;a<<=1;if(a&256)a^=f;}return c;}
  const inv=Array(256).fill(0);
  for(let a=1;a<256;a++){let b=1,n=254,q=a;while(n){if(n&1)b=mul(b,q);q=mul(q,q);n>>=1;}inv[a]=b;}
  return {mul,inv};
}
/** Insert one row into a normalized echelon basis; return null on full rank. */
function extend(basis,row,F) {
  const v=[...row];
  for(let j=0;j<8;j++){
    if(!v[j])continue;
    if(basis[j]){
      const a=v[j];for(let k=j;k<8;k++)v[k]^=F.mul(a,basis[j][k]);
    }else{
      const next=[...basis],a=F.inv[v[j]];
      for(let k=j;k<8;k++)v[k]=F.mul(v[k],a);
      next[j]=v;
      return next.every(Boolean)?null:next;
    }
  }
  return basis;
}
/** Exact surviving relative orientation paths. Global reflection fixes row zero forward. */
function solve(rows,F) {
  const base=rows[0];
  let frontier=[{basis:Array(8).fill(null),mask:''}];
  const counts=[1];
  for(let i=1;i<rows.length;i++){
    const choices=[rows[i],[...rows[i]].reverse()].map(r=>r.map((x,j)=>x^base[j]));
    const next=[];
    for(const s of frontier)for(let d=0;d<2;d++){
      const basis=extend(s.basis,choices[d],F);
      if(basis!==null)next.push({basis,mask:s.mask+d});
    }
    frontier=next;counts.push(frontier.length);
    if(!frontier.length)break;
    // Positive controls have all rows in a rank-7 subspace for their true mask.
    // Their other possible paths generally die; no cap, all paths are retained.
  }
  return {counts,live:frontier.length,witnesses:frontier.map(s=>({mask:'0'+s.mask,rank:s.basis.filter(Boolean).length}))};
}
/** @param {object} grid */
function run(grid){
  const fs=fields(),results=[];
  if(fs.length!==30)throw Error('field count');
  let plantChecks=0,smallExhaustive=0;
  for(const radix of [60,59]){
    const a=radix===60?grid.alphabet:grid.alphabet.replace('f','');
    const rows=grid.pages.flatMap(p=>Array.from({length:p.rows},(_,i)=>p.tokens.slice(8*i,8*i+8).map(t=>{
      const x=a.indexOf(t[0]),y=a.indexOf(t[1]);if(x<0||y<0)throw Error('token');return a.length*x+y;
    })));
    if(rows.length!==32||rows.some(r=>r.length!==8||r.some(x=>x<0||x>255)))throw Error('rows');
    for(const f of fs){
      const F=field(f);
      const result=solve(rows,F);
      // A source-prefix matched affine code with secret nonzero weights and hidden reflections.
      // Use just 12 rows for positive control: enough for exact truth-mask retention,
      // avoiding exponential redundant branches in unusually symmetric plants.
      const w=[1,2,3,5,7,11,13],constant=97;
      const raw=rows.slice(0,12).map(r=>[...r.slice(0,7),r.slice(0,7).reduce((s,x,i)=>s^F.mul(x,w[i]),constant)]);
      const mask=raw.map((_,i)=>i>0&&(i%3===1||i%5===2)?1:0).join('');
      const plant=raw.map((r,i)=>mask[i]==='1'?[...r].reverse():r);
      const planted=solve(plant,F);
      if(!planted.witnesses.some(s=>s.mask===mask))throw Error('hidden mask lost');
      plantChecks++;
      // Independent exact brute-force rank on the first nine rows (256 masks).
      // Rank computed from scratch by column pivoting, not the incremental routine.
      function rank(rows) {
        const m=rows.map(r=>[...r]);let k=0;
        for(let j=0;j<8;j++){
          const p=m.findIndex((r,i)=>i>=k&&r[j]);if(p<0)continue;
          [m[k],m[p]]=[m[p],m[k]];
          const a=F.inv[m[k][j]];
          for(let z=j;z<8;z++)m[k][z]=F.mul(m[k][z],a);
          for(let i=k+1;i<m.length;i++){const q=m[i][j];for(let z=j;z<8;z++)m[i][z]^=F.mul(q,m[k][z]);}
          k++;
        }
        return k;
      }
      const brute=[];
      for(let m=0;m<256;m++){
        const mask='0'+m.toString(2).padStart(8,'0');
        const oriented=rows.slice(0,9).map((r,i)=>mask[i]==='1'?[...r].reverse():r);
        if(rank(oriented.slice(1).map(r=>r.map((x,j)=>x^oriented[0][j])))<8)brute.push(mask);
      }
      const fast=solve(rows.slice(0,9),F).witnesses.map(s=>s.mask);
      if(brute.join()!==fast.join())throw Error('brute mismatch');
      smallExhaustive+=256;
      results.push({radix,f:f.toString(16),...result,plantWitnesses:planted.live});
    }
  }
  return {plantChecks,smallExhaustive,results};
}
if(require.main===module){
  const raw=fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-grid-256.json'));
  const blob=crypto.createHash('sha1').update('blob '+raw.length+'\0').update(raw).digest('hex');
  if(blob!=='2550eae357442912220e05dc51147523a61dd75a')throw Error('input blob mismatch');
  console.log(JSON.stringify(run(JSON.parse(raw.toString('utf8'))),null,2));
}
module.exports={run};
