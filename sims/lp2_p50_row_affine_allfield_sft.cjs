'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const deg = x => 31 - Math.clz32(x);
function rem(a,b) {
  while (a && deg(a)>=deg(b)) a ^= b << (deg(a)-deg(b));
  return a;
}
function fields() {
  // A reducible degree-eight polynomial has a factor of degree at most four.
  return Array.from({length:128},(_,i)=>257+2*i).filter(f=>{
    for(let d=1;d<=4;d++) for(let g=1<<d;g<1<<(d+1);g++) if(rem(f,g)===0) return false;
    return true;
  });
}
function mul(a,b,f) {
  let c=0;
  while(b){if(b&1)c^=a;b>>=1;a<<=1;if(a&256)a^=f;}
  return c;
}
function pow(a,n,f) {
  let b=1;
  while(n){if(n&1)b=mul(b,a,f);a=mul(a,a,f);n>>=1;}
  return b;
}
/** @param {number[][]} rows @param {number} f */
function rank(rows,f) {
  const m=rows.map(r=>[...r]), ix=rows.map((_,i)=>i);
  let k=0,det=1;
  for(let j=0;j<8;j++){
    const p=m.findIndex((r,i)=>i>=k&&r[j]!==0);
    if(p<0)continue;
    [m[k],m[p]]=[m[p],m[k]];[ix[k],ix[p]]=[ix[p],ix[k]];
    const q=m[k][j],inv=pow(q,254,f);
    det=mul(det,q,f);
    for(let l=j;l<8;l++)m[k][l]=mul(m[k][l],inv,f);
    for(let i=k+1;i<m.length;i++){
      const v=m[i][j];
      for(let l=j;l<8;l++)m[i][l]^=mul(v,m[k][l],f);
    }
    k++;
  }
  return {rank:k,pivots:ix.slice(0,k),det:k===8?det:0};
}
const delta = rows=>rows.slice(1).map(r=>r.map((x,i)=>x^rows[0][i]));
/** @param {object} grid */
function run(grid) {
  const fs=fields(),out=[];
  if(fs.length!==30)throw Error('field count');
  let fieldInverseChecks=0,linearPlants=0,affinePlants=0,fullRankPlants=0,reflectionChecks=0;
  for(const f of fs)for(let a=1;a<256;a++){
    if(mul(a,pow(a,254,f),f)!==1)throw Error('non-field');
    fieldInverseChecks++;
  }
  for(const radix of [60,59]){
    const a=radix===60?grid.alphabet:grid.alphabet.replace('f','');
    const pages=grid.pages.map(p=>Array.from({length:p.rows},(_,i)=>p.tokens.slice(8*i,8*i+8).map(t=>{
      const h=a.indexOf(t[0]),l=a.indexOf(t[1]);if(h<0||l<0)throw Error('bad token');return a.length*h+l;
    })));
    const all=pages.flat();
    if(all.length!==32||pages.map(p=>p.length).join()!=='10,13,9'||all.some(r=>r.length!==8||r.some(x=>x<0||x>255)))throw Error('bad rows');
    for(const [scope,rows] of [['all',all],...pages.map((p,i)=>['p'+(49+i),p])]){
      const results=fs.map(f=>{
        const linear=rank(rows,f),affine=rank(delta(rows),f);
        const reflected=rows.map(r=>[...r].reverse());
        if(rank(reflected,f).rank!==linear.rank||rank(delta(reflected),f).rank!==affine.rank)throw Error('reflection changed rank');
        reflectionChecks++;
        // Seven-dimensional systematic code, arbitrary nonzero check coefficients.
        const weights=[1,2,3,5,7,11,13];
        const planted=rows.map(r=>[...r.slice(0,7),r.slice(0,7).reduce((s,x,i)=>s^mul(x,weights[i],f),0)]);
        if(rank(planted,f).rank>7||rank(delta(planted),f).rank>7)throw Error('linear plant');
        linearPlants++;
        const shifted=planted.map(r=>r.map((x,i)=>x^rows[0][i]));
        if(rank(delta(shifted),f).rank>7)throw Error('affine plant');
        affinePlants++;
        const origin=rows[0],basis=[origin,...Array.from({length:8},(_,i)=>origin.map((x,j)=>x^(i===j?1:0)))];
        if(rank(delta(basis),f).rank!==8)throw Error('full rank plant');
        fullRankPlants++;
        return {f:f.toString(16),linear,affine};
      });
      out.push({radix,scope,n:rows.length,linearMin:Math.min(...results.map(r=>r.linear.rank)),affineMin:Math.min(...results.map(r=>r.affine.rank)),results});
    }
  }
  return {fields:fs.map(f=>f.toString(16)),fieldInverseChecks,linearPlants,affinePlants,fullRankPlants,reflectionChecks,out};
}
if(require.main===module){
  const raw=fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-grid-256.json'));
  const blob=crypto.createHash('sha1').update('blob '+raw.length+'\0').update(raw).digest('hex');
  if(blob!=='2550eae357442912220e05dc51147523a61dd75a')throw Error('input blob mismatch');
  console.log(JSON.stringify(run(JSON.parse(raw.toString('utf8'))),null,2));
}
module.exports={run};
