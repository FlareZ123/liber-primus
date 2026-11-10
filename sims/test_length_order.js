'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const lib=require('./wordlength_order_test');
const raw=fs.readFileSync(path.join(__dirname,'..','resources','transcriptions','liber_primus_master.txt'),'utf8');
const{lp1,lp2,sections}=lib.parseLengthCorpus(raw);
assert.equal(lp2.length,2896);
assert.equal(lp1.length,694);
assert.deepEqual(sections.map(s=>s.length),[158,255,383,2,435,224,349,355,735]);
const got=lib.lengthTransitions(lp2,1);
assert.deepEqual(got,[[94,278,159],[276,828,445],[161,444,210]]);
const c=lib.lengthIndependence(lp2);
assert.ok(Math.abs(c.chi2-3.949446088360591)<1e-8);
assert.ok(Math.abs(c.pApprox-0.4128908098486713)<1e-8);
const c1=lib.lengthIndependence(lp1);
assert.ok(Math.abs(c1.chi2-15.392690105515554)<1e-8);
const family=lib.lagFamilyNull(lp2,128,300);
assert.equal(family.best.lag,34);
assert.ok(Math.abs(family.best.chi2-10.90048818587277)<1e-8);
assert.equal(family.nullExceed,293);
console.log(JSON.stringify({lp2WordCount:lp2.length,lp1WordCount:lp1.length,
  LP2:{chi2:c.chi2,pApprox:c.pApprox},LP1:{chi2:c1.chi2,pApprox:c1.pApprox},
  family128:family},null,2));
console.log('All word-length ordering regression checks passed');
