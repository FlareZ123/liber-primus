'use strict';
/*
 * Source-first p40..55 terminal section × 32×8 printed p50 grid.
 * Group every two consecutive printed grid rows into 16 GP29 key cells,
 * assign one such 16-cell strip to each of the 16 mirror-framed pages p40..55.
 * Direct natural GP29 addition, original page-local phase=0, both signs.
 * Both historically live base59/base60 decodings are charged, no fitting.
 * Reproduce: node sims/lp2_p40_55_grid16_direct_gp29_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const grid=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/base60-grid.json'),'utf8'));
const original=corpus.pages.filter(p=>p.page>=40&&p.page<=55);
assert.deepEqual(original.map(p=>p.page),Array.from({length:16},(_,i)=>i+40));
assert.equal(original.reduce((s,p)=>s+p.runic_count,0),3316);
assert.equal(original[10].runic_count,0); // p50 numeric page consumes 16 table slots, no runes
assert.deepEqual(grid.rows.map(row=>row.length),Array(32).fill(8));
const tokens=grid.rows.flat();assert.equal(tokens.length,256);
const alpha60=grid.alphabet,alpha59=alpha60.replace('f','');
assert.equal(alpha60.length,60);assert.equal(alpha59.length,59);
const decode=(s,base,alpha)=>[...s].reduce((n,x)=>{
  const v=alpha.indexOf(x);assert.ok(v>=0);
  return n*base+v;
},0);
const bytes={base60:tokens.map(t=>decode(t,60,alpha60)),base59:tokens.map(t=>decode(t,59,alpha59))};
assert.ok(Object.values(bytes).every(values=>values.length===256&&values.every(n=>n>=0&&n<256)));
const mod=x=>((x%29)+29)%29;
const runes=original.map(p=>p.indices);
function apply(source,sourceBytes,sign){
  assert.equal(source.length,16);assert.equal(sourceBytes.length,256);
  return source.map((page,pageNo)=>page.map((v,i)=>mod(v+sign*sourceBytes[16*pageNo+(i%16)])));
}
const ioc=values=>{
  const n=values.length,counts=Array(29).fill(0);
  for(const v of values){assert.ok(v>=0&&v<29);counts[v]++;}
  return counts.reduce((a,b)=>a+b*(b-1),0)/(n*(n-1));
};
const native57=corpus.pages.find(p=>p.page===57).indices;
assert.equal(native57.length,95);
const nativeBaseline=ioc(native57);
const bookBaseline=ioc(runes.flat());
const tests={};
for(const [codec,sourceBytes] of Object.entries(bytes)){
  for(const sign of [-1,+1]){
    const decoded=apply(runes,sourceBytes,sign);
    assert.deepEqual(apply(decoded,sourceBytes,-sign),runes);
    const flat=decoded.flat(),name=codec+(sign<0?'-minus':'-plus');
    tests[name]={
      bookIoC:ioc(flat),p55IoC:ioc(decoded[15]),
      first20:decoded[0].slice(0,20),p55All76:decoded[15],
      bookRuneCount:flat.length,
    };
  }
  // Synthetic true-key fixture: assign actual 95 solved p57 native runes to the
  // first 95 nonempty terminal-section positions, and fill others from p57.
  // Confirms exact every-position inversion under the real page sizes.
  let at=0;
  const plant=runes.map(pg=>pg.map(()=>native57[(at++)%native57.length]));
  assert.equal(at,3316);
  const ciphertext=apply(plant,sourceBytes,+1);
  const recovered=apply(ciphertext,sourceBytes,-1);
  assert.deepEqual(recovered,plant);
  tests[codec+'-planted']={exactNative3316:true,firstKnown95Matches:native57.every((v,i)=>plant.flat()[i]===v)};
}
const expected={
  'base59-minus':[0.03443808255416855,0.032280701754385965],
  'base59-plus':[0.0344679209718591,0.03263157894736842],
  'base60-minus':[0.03446937650442937,0.03824561403508772],
  'base60-plus':[0.03437567659521821,0.031228070175438598],
};
for(const [name,pair] of Object.entries(expected)){
  assert.ok(Math.abs(tests[name].bookIoC-pair[0])<1e-14);
  assert.ok(Math.abs(tests[name].p55IoC-pair[1])<1e-14);
}
console.log(JSON.stringify({status:'PASS',classification:'bounded original-input negative for direct 16x16 native additive panel-page pad, not all graph/table mechanisms',source:{pages:original.map(p=>[p.page,p.runic_count]),gridShape:[32,8],pageMapping:'p40..55 ordinal i -> original grid cells16i..16i+15, cyclic 16 GP29 keystream per page, page phase 0',unusedNumberedPage50KeyStrip:10,alphabetSources:['base60','base59-without-lowercase-f']},native57IoC:nativeBaseline,unknown3316IoC:bookBaseline,tests},null,2));
