'use strict';
// Run from repository root: node sims/lp2_p50_relative_column_order_sft.cjs
const assert = require('node:assert/strict');
const g = require('../resources/liber-primus/lp2-grid-256.json');
const a = g.alphabet, b = a.replace('f','');
const rows = g.pages.flatMap(p => Array.from({length:p.rows},(_,i)=>p.tokens.slice(i*8,i*8+8)));
const cmp = (x,y)=>x<y?-1:x>y?1:0;
const value=(t,abc)=>abc.length*abc.indexOf(t[0])+abc.indexOf(t[1]);
const order=r=>r.map((_,i)=>i).sort((i,j)=>cmp(r[i],r[j]));
const orders=rows.map(order);
assert.deepEqual(g.pages.map(p=>p.rows),[10,13,9]);
let pairs=0;
for(const r of rows){
  assert.equal(r.length,8);
  assert.equal(new Set(r).size,8);
  for(const t of r)for(const c of t){assert.ok(a.includes(c));assert.ok(b.includes(c));}
  for(let j=0;j<8;j++)for(let k=j+1;k<8;k++){
    const s=cmp(r[j],r[k]);
    assert.equal(s,Math.sign(value(r[j],a)-value(r[k],a)));
    assert.equal(s,Math.sign(value(r[j],b)-value(r[k],b)));
    pairs++;
  }
}
assert.equal(pairs,896);
assert.equal(new Set(orders.map(p=>p.join(''))).size,32);
function check(rs,p,expected){
  const decoded=rs.map(row=>p.map(i=>row[i]).join(''));
  assert.equal(decoded.join(''),expected);
  const replay=decoded.map(row=>{const cipher=Array(p.length);p.forEach((i,j)=>cipher[i]=row[j]);return cipher.join('');});
  assert.deepEqual(replay,rs);
  return decoded.join('');
}
const control7=check(['TLBEIEO','VUTHTRE','IDTSEOS','TPOSOYR','SLBTIII','YT4DGUQ','IMNU442','I15339M'],[0,6,2,5,1,4,3],'TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133');
const control14=check(['IDGTKUMLOOARWO','ERTHISUTETLHUT','IATSLLOUIMNITE','LNJ7TFYVOIUAUS','NOCO5JI4MEODZZ'],[2,8,9,1,12,13,11,4,5,7,3,0,6,10],'GOODWORKULTIMATETRUTHISTHEULTIMATEILLUSIONJOINUSATFV7LYUCMEOZZD5J4ONIO');
console.log(JSON.stringify({rows:rows.length,pairs,tieRows:0,distinctOrders:32,orders:orders.map(p=>p.map(i=>i+1).join('')),control7,control14},null,2));
