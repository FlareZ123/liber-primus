'use strict';
/**
 * Original five-numbered LP2 passage inverse using two solved LP1 texts:
 * the 157 rune 1033-square text and the 89 rune 3301-square text.
 * Read-only Windows Node22 CJS. Candidate keys are source authentic,
 * but their reuse as LP2 encryption keys is an unproved hypothesis.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');
/** @param {string} p */
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const src=load('resources/liber-primus/lp2-corpus.json');
const solved=load('resources/external/relikd-solved-gp29-native-v1.json');
assert.deepEqual(src.runes,solved.runes);
/** @param {number} n */
const page=n=>src.pages.find(p=>p.page===n).indices;
const units=[
  page(36).slice(99,238),page(37).slice(0,91),
  page(37).slice(91,189),
  [...page(37).slice(189,228),...page(38).slice(0,57)],
  page(38).slice(57,186)
];
assert.deepEqual(units.map(x=>x.length),[139,91,98,96,129]);
const lookup=new Map(src.runes.map((r,i)=>[r,i]));
/** @param {string} name */
function textKey(name){
  const s=solved.sections.find(x=>x.name===name);
  assert(s);
  return Array.from(s.source_text).filter(x=>lookup.has(x)).map(x=>lookup.get(x));
}
const a=textKey('0_wisdom'),b=textKey('jpg229');
assert.equal(a.length,157);
assert.equal(b.length,89);
const mod=x=>((x%29)+29)%29;
/** @param {number[]} values */
function ioc(values){
  const h=Array(29).fill(0);
  for(const x of values)h[x]++;
  return h.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}
/** @param {number[]} values */
const render=values=>values.map(x=>src.translit[x]).join('');
const models=[
  {label:'1033-each',keys:units.map(()=>a),reset:true},
  {label:'3301-each',keys:units.map(()=>b),reset:true},
  {label:'1033-3301-alternating',keys:units.map((_,i)=>i%2?b:a),reset:true},
  {label:'1033-3301-continuous',keys:units.map(()=>a.concat(b)),reset:false}
];
const positive=page(57),out=[];
assert.equal(positive.length,95);
for(const model of models)for(const sign of [-1,1]){
  let clock=0,originalRecovered=0,nativeRecovered=0;
  const decoded=[];
  for(let i=0;i<units.length;i++){
    if(model.reset)clock=0;
    const key=model.keys[i],plain=[];
    for(let j=0;j<units[i].length;j++){
      const k=key[clock++%key.length],c=units[i][j],p=mod(c+sign*k);
      plain.push(p);
      assert.equal(mod(p-sign*k),c);
      originalRecovered++;
      const native=positive[(j+i*17)%positive.length];
      assert.equal(mod(mod(native-sign*k)+sign*k),native);
      nativeRecovered++;
    }
    decoded.push(plain);
  }
  assert.equal(originalRecovered,553);
  assert.equal(nativeRecovered,553);
  out.push({
    model:model.label,sign,originalRecovered,nativeRecovered,
    ioc:ioc(decoded.flat()),perUnit:decoded.map(ioc),
    first60:render(decoded[0].slice(0,60)),
    second40:render(decoded[1].slice(0,40))
  });
}
const expected=[0.0337094,0.0348167,0.0354195,0.0341353,0.0347905,0.0343908,0.0351312,0.0342532];
out.forEach((r,i)=>assert(Math.abs(r.ioc-expected[i])<1e-7));
console.log(JSON.stringify({
  assertion:'no new original-page GP29 prose under any fixed sourced running-key contract',
  sourceKeySizes:[a.length,b.length],
  nativeControlIoc:ioc(positive),
  originalUnitSizes:units.map(x=>x.length),out
},null,2));
