'use strict';
/** Reproducible original LP2 JPEG non-entropy carrier and component-run census; Node 22, read only. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
/**
 * Read a baseline JPEG's source-visible headers and terminal EOI.
 * @param {Buffer} bytes
 * @returns {{sections:Array<{id:number,sha:string,bytes:Buffer}>,tail:number}}
 */
function inspect(bytes) {
  assert.equal(bytes.readUInt16BE(0), 0xffd8);
  const sections = [];
  let k=2;
  while(k<bytes.length) {
    assert.equal(bytes[k++],255);
    while(bytes[k]===255) k++;
    const id=bytes[k++];
    assert(id!==0xd8 && id!==0xd9 && id!==0);
    const len=bytes.readUInt16BE(k);
    assert(len>=2 && k+len<=bytes.length);
    const chunk=bytes.subarray(k+2,k+len);
    sections.push({id,bytes:chunk,sha:crypto.createHash('sha256').update(chunk).digest('hex')});
    k+=len;
    if(id!==0xda) continue;
    while(k<bytes.length-1) {
      if(bytes[k]!==255){k++;continue;}
      const next=bytes[k+1];
      if(next===0 || (next>=0xd0 && next<=0xd7)){k+=2;continue;}
      assert.equal(next,0xd9,'single-scan JPEG EOI');
      return {sections,tail:bytes.length-(k+2)};
    }
    throw Error('missing EOI');
  }
  throw Error('missing SOS');
}
/** @param {number[]} values @returns {number[]} */
function runs(values) {
  if (values.length === 0) return [];
  const out = [];
  let start = 0;
  for (let i = 1; i <= values.length; i++) {
    if (i === values.length || values[i] !== values[start]) {
      out.push(i - start);
      start = i;
    }
  }
  return out;
}
/** @param {number} x @param {number} m @returns {number} */
function modN(x, m) { return ((x % m) + m) % m; }
/** @param {number[]} v @returns {number[]} */
function H(v) {
  const n=v.length,m=Math.floor(n/2),out=[];
  for(let i=0;i<m;i++)out.push(modN(v[i]-v[n-1-i],29));
  if(n%2)out.push(v[m]);
  for(let i=m-1;i>=0;i--)out.push(modN(v[i]+v[n-1-i],29));
  return out;
}
/** @param {[number,number]} pair @returns {[number,number]} */
function h29(pair){return /** @type {[number,number]} */ (H(pair));}
/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function powMod(base,exponent,modulus){
  let out=1,b=modN(base,modulus),e=exponent;
  while(e>0){if(e&1)out=(out*b)%modulus;b=(b*b)%modulus;e>>=1;}
  return out;
}
/** @param {number} x @param {number} modulus @returns {number} */
function inverseMod(x,modulus){
  for(let y=1;y<modulus;y++)if((x*y)%modulus===1)return y;
  throw Error(`noninvertible ${x} mod ${modulus}`);
}
/** @param {number[]} a @param {number} k @returns {number[]} */
function rotate(a, k) {
  return a.slice(k).concat(a.slice(0, k));
}
/** Exact input: the original 58 LP2 JPEGs corresponding to physical pp0-57. */
function main() {
  const root=path.join(__dirname,'..','resources','liber-primus');
  const owner=new Map();
  let rgb=0, mono=0, sample;
  const markerCounts=new Map();
  const components=[];
  for(let n=17;n<=74;n++) {
    const file=String(n).padStart(2,'0')+'.jpg';
    const raw=fs.readFileSync(path.join(root,file));
    if(!sample)sample=raw;
    const parsed=inspect(raw);
    assert.equal(parsed.tail,0,file+' trailer');
    const ids=parsed.sections.map(s=>s.id);
    const apps=ids.filter(x=>x>=0xe0 && x<=0xef);
    assert.deepEqual(apps,[0xe0,0xe2],file+' APP inventory');
    assert(!ids.includes(0xfe),file+' COM inventory');
    const sof=parsed.sections.find(s=>s.id===0xc0);
    assert(sof,file+' SOF0');
    assert.equal(sof.bytes.readUInt16BE(1),3600);
    assert.equal(sof.bytes.readUInt16BE(3),2400);
    const channels=sof.bytes[5];
    assert(channels===1 || channels===3);
    components.push(channels);
    if(channels===1)mono++;else rgb++;
    assert.equal(ids.filter(x=>x===0xdb).length,channels===1?1:2);
    assert.equal(ids.filter(x=>x===0xc4).length,channels===1?2:4);
    assert.equal(ids.filter(x=>x===0xda).length,1);
    for(const seg of parsed.sections){
      markerCounts.set(seg.id,(markerCounts.get(seg.id)||0)+1);
      if(![0xe0,0xe2,0xdb].includes(seg.id))continue;
      const key=seg.id.toString(16)+':'+seg.sha;
      owner.set(key,(owner.get(key)||0)+1);
    }
  }
  assert.deepEqual([rgb,mono],[35,23]);
  const grayscalePages=components.flatMap((c,p)=>(c===1?[p]:[]));
  assert.deepEqual(grayscalePages,[16,17,18,19,20,21,24,25,28,29,30,31,41,42,43,44,45,46,47,48,50,51,52]);
  const segmentRuns=runs(components);
  assert.deepEqual(segmentRuns,[16,6,2,2,2,4,9,8,1,3,5]);
  const grayscaleRunLengths=segmentRuns.filter((_,i)=>i%2===1);
  const rgbRunLengths=segmentRuns.filter((_,i)=>i%2===0);
  assert.deepEqual(grayscaleRunLengths,[6,2,4,8,3]);
  assert.deepEqual(rgbRunLengths,[16,2,2,9,1,5]);
  assert.deepEqual(h29([grayscaleRunLengths[0],grayscaleRunLengths[1]]),grayscaleRunLengths.slice(2,4));
  const presentations=[];
  for(const reversed of [false,true]){
    const base=reversed?[...grayscaleRunLengths].reverse():grayscaleRunLengths;
    for(let rotation=0;rotation<base.length;rotation++){
      const v=rotate(base,rotation);
      if(h29([v[0],v[1]]).every((x,i)=>x===v[i+2]))presentations.push({reversed,rotation,values:v});
    }
  }
  assert.deepEqual(presentations,[{reversed:false,rotation:0,values:[6,2,4,8,3]}]);
  let positiveCompositions=0,hCompositions=0;
  for(let a=1;a<23;a++)for(let b=1;b<23;b++)for(let c=1;c<23;c++)for(let d=1;d<23;d++){
    const e=23-a-b-c-d;
    if(e<=0)continue;
    positiveCompositions++;
    const h=h29([a,b]);
    if(h[0]===c&&h[1]===d)hCompositions++;
  }
  assert.equal(positiveCompositions,7315);
  assert.equal(hCompositions,15);

  // Treat the component partition itself as a candidate DH packet.
  const pDH=mono,gDH=grayscaleRunLengths.length;
  const [aDH,KDH,qDH,ADH,eDH]=grayscaleRunLengths;
  assert.deepEqual([pDH,gDH,aDH,KDH,qDH,ADH,eDH],[23,5,6,2,4,8,3]);
  assert.equal(powMod(gDH,aDH,pDH),ADH);
  const bDH=inverseMod(eDH,pDH-1),BDH=powMod(gDH,bDH,pDH);
  assert.deepEqual([bDH,BDH],[15,19]);
  assert.equal(powMod(ADH,bDH,pDH),KDH);
  assert.equal(powMod(BDH,aDH,pDH),KDH);

  // All 120 assignments of the observed run lengths to [a,K,q,A,e].
  const assignmentHits=[];
  for(let ai=0;ai<5;ai++)for(let Ki=0;Ki<5;Ki++)for(let qi=0;qi<5;qi++)for(let Ai=0;Ai<5;Ai++)for(let ei=0;ei<5;ei++){
    const idx=[ai,Ki,qi,Ai,ei];
    if(new Set(idx).size!==5)continue;
    const [aa,KK,qq,AA,ee]=idx.map(i=>grayscaleRunLengths[i]);
    let bb;try{bb=inverseMod(ee,pDH-1);}catch{continue;}
    if(powMod(gDH,aa,pDH)===AA&&powMod(AA,bb,pDH)===KK)
      assignmentHits.push({indices:idx,values:[aa,KK,qq,AA,ee],b:bb,B:powMod(gDH,bb,pDH)});
  }
  assert.deepEqual(assignmentHits,[{indices:[0,1,2,3,4],values:[6,2,4,8,3],b:15,B:19}]);

  // Self-selected H^g prediction of the independently frozen p3 E(Q).
  const independentQ=[17,24],orbit=[];
  let hv=grayscaleRunLengths.slice();
  while(!orbit.some(x=>x.every((v,i)=>v===hv[i]))){orbit.push(hv);hv=H(hv);}
  assert.equal(orbit.length,28);
  const qOrbitHits=orbit.flatMap((v,k)=>v[0]===17&&v[1]===24?[k]:[]);
  assert.deepEqual(qOrbitHits,[gDH]);
  const hg=orbit[gDH];
  assert.deepEqual(hg,[17,24,4,18,22]);
  assert.deepEqual(hg,[modN(bDH+KDH,29),modN(-gDH,29),qDH,pDH-gDH,pDH-1]);

  // p3: u^2=3u+8 = e*u+A; Q multiplication is state-valued.
  const [xQ,yQ]=independentQ;
  const qMatrix=[[xQ,modN(ADH*yQ,29)],[yQ,modN(xQ+eDH*yQ,29)]];
  assert.deepEqual(qMatrix,[[17,18],[24,2]]);
  assert.deepEqual(qMatrix,[[modN(bDH+KDH,29),pDH-gDH],[modN(-gDH,29),KDH]]);

  let fixedDhCompositions=0,hgQCompositions=0,jointCompositions=0;
  for(let aa=1;aa<pDH;aa++)for(let KK=1;KK<pDH;KK++)for(let qq=1;qq<pDH;qq++)for(let AA=1;AA<pDH;AA++){
    const ee=pDH-aa-KK-qq-AA;if(ee<=0)continue;
    let bb,dh=false;try{bb=inverseMod(ee,pDH-1);dh=powMod(gDH,aa,pDH)===AA&&powMod(AA,bb,pDH)===KK;}catch{}
    if(dh)fixedDhCompositions++;
    let v=[aa,KK,qq,AA,ee];for(let k=0;k<gDH;k++)v=H(v);
    const qhit=v[0]===17&&v[1]===24;
    if(qhit)hgQCompositions++;
    if(dh&&qhit)jointCompositions++;
  }
  assert.deepEqual([fixedDhCompositions,hgQCompositions,jointCompositions],[11,15,1]);
  const fixed=Array.from(owner.entries()).sort((a,b)=>a[0].localeCompare(b[0]));
  assert.equal(fixed.filter(x=>x[0].startsWith('e0:')).length,1);
  assert.equal(fixed.filter(x=>x[0].startsWith('e2:')).length,1);
  assert.deepEqual(fixed.filter(x=>x[0].startsWith('db:')).map(x=>x[1]).sort((a,b)=>a-b),[35,58]);
  assert.equal(fixed.find(x=>x[0].startsWith('e0:'))[1],58);
  assert.equal(fixed.find(x=>x[0].startsWith('e2:'))[1],58);
  const sentinel=Buffer.from([255,254,0,4,65,66]);
  assert(inspect(Buffer.concat([sample.subarray(0,2),sentinel,sample.subarray(2)])).sections.some(s=>s.id===0xfe),'synthetic COM positive');
  const icc=inspect(sample).sections.find(s=>s.id===0xe2);
  assert(icc.bytes.includes(Buffer.from('Artifex Software sRGB ICC Profile')));
  console.log(JSON.stringify({
    source:'58 source JPEGs 17.jpg–74.jpg',frames:{rgb,grayscale:mono},
    grayscalePages,componentSegmentRuns:segmentRuns,grayscaleRunLengths,rgbRunLengths,
    grayscaleRunState:{values:grayscaleRunLengths,hFirstPair:h29([grayscaleRunLengths[0],grayscaleRunLengths[1]]),fifth:grayscaleRunLengths[4],uniquePrintedPresentationAmongCyclicAndReverse:presentations.length===1,positiveFiveCompositionsOf23:positiveCompositions,hCompatibleFiveCompositionsOf23:hCompositions,dhState:{p:pDH,g:gDH,a:aDH,K:KDH,q:qDH,A:ADH,e:eDH,b:bDH,B:BDH},roleAssignmentHits:assignmentHits,hOrbitLength:orbit.length,hPowerG:hg,qOrbitHits,independentQ,qMatrix,fixedDhCompositions,hPowerGQCompositions:hgQCompositions,jointDhAndQCompositions:jointCompositions},
    sharedNonEntropyHeaders:fixed.map(([sha,count])=>({sha,count})),
    markerCounts:Object.fromEntries(Array.from(markerCounts.entries()).sort((a,b)=>a[0]-b[0]).map(([k,v])=>[k.toString(16),v])),
    missingPageSpecificAPPandCOM:true,trailingBytes:0,singleScans:58,
    limitation:'The component-run H identity is source-exact but post-discovery; export-mode causality and a body-cipher receiver remain unproved.'
  },null,2));
}
if(require.main===module)main();
module.exports={inspect,runs,H,h29,powMod,inverseMod};