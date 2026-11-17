#!/usr/bin/env node
'use strict';

// Test the literal "shed the circumference" reading of the candidate p50
// 5x5 frame: retain its central 3x3 as a Hill-3 key for p55's 75-rune
// suffix. Test both raw p55 and one source-motivated OutGuess ARC4
// intermediate from the original 2013 title. This is not a solution.

const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const read = file => JSON.parse(fs.readFileSync(path.join(process.cwd(), file), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const grid = read('resources/liber-primus/base60-grid.json');
const tokens = grid.rows.flat();
const alphabet = grid.alphabet.replace('f', '');
const mod = n => ((n % 29) + 29) % 29;
const cellValue = token => alphabet.indexOf(token[0]) * 59 + alphabet.indexOf(token[1]);

const five = Array.from({length:5}, (_,r) =>
  Array.from({length:5}, (_,c) => cellValue(tokens[(21+r)*8+1+c])));
assert.deepEqual([five[0][0],five[0][4],five[4][0],five[4][4]],[224,115,73,75]);
const K = five.slice(1,4).map(row => row.slice(1,4).map(mod));
assert.deepEqual(K,[[18,27,26],[19,22,9],[12,1,28]]);

function determinant3(a) {
  return mod(a[0][0]*(a[1][1]*a[2][2]-a[1][2]*a[2][1])-
    a[0][1]*(a[1][0]*a[2][2]-a[1][2]*a[2][0])+
    a[0][2]*(a[1][0]*a[2][1]-a[1][1]*a[2][0]));
}
function inverse3(matrix) {
  const a=matrix.map((row,i)=>row.concat([0,0,0].map((_,j)=>Number(i===j))));
  for(let col=0;col<3;col++){
    let p=col;while(p<3&&a[p][col]===0)p++;
    assert(p<3);[a[col],a[p]]=[a[p],a[col]];
    let inv=0;while(mod(inv*a[col][col])!==1)inv++;
    a[col]=a[col].map(x=>mod(x*inv));
    for(let r=0;r<3;r++)if(r!==col){const m=a[r][col];a[r]=a[r].map((x,j)=>mod(x-m*a[col][j]));}
  }
  return a.map(row=>row.slice(3));
}
function multiply3(a,b) {
  return a.map(row=>b[0].map((_,col)=>mod(row.reduce((s,x,k)=>s+x*b[k][col],0))));
}
function transform(values,matrix,side) {
  assert.equal(values.length%3,0);
  const out=[];
  for(let i=0;i<values.length;i+=3){
    const v=values.slice(i,i+3);
    if(side==='left')for(let r=0;r<3;r++)out.push(mod(matrix[r].reduce((s,x,j)=>s+x*v[j],0)));
    else for(let c=0;c<3;c++)out.push(mod(v.reduce((s,x,r)=>s+x*matrix[r][c],0)));
  }
  return out;
}
function ioc(values) {
  const h=Array(29).fill(0);for(const x of values)h[x]++;
  return h.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}
function outguessBytes(password,count) {
  const digest=createHash('md5').update(Buffer.from('Encryption'+password,'utf8')).digest();
  assert.equal(digest.toString('hex'),'7109b76280eff14ffad72473c624cae2');
  const s=Array.from({length:256},(_,i)=>i);
  let i=255,j=0;
  for(let k=0;k<256;k++){
    i=(i+1)&255;j=(j+s[i]+digest[k&15])&255;[s[i],s[j]]=[s[j],s[i]];
  }
  const out=[];
  for(let k=0;k<count;k++){
    i=(i+1)&255;j=(j+s[i])&255;[s[i],s[j]]=[s[j],s[i]];
    out.push(s[(s[i]+s[j])&255]);
  }
  return out;
}

const Kinv=inverse3(K);
assert.equal(determinant3(K),10);
assert.deepEqual(multiply3(K,Kinv),[[1,0,0],[0,1,0],[0,0,1]]);
const p55=corpus.pages.find(p=>p.page===55).indices;
const p57=corpus.pages.find(p=>p.page===57).indices;
assert.equal(p55.length,76);
assert.equal(corpus.translit[p55[0]],'NG');
const rawBody=p55.slice(1), clearControl=p57.slice(0,75);
assert.equal(rawBody.length,75);
assert.equal(clearControl.length,75);

function gate(original,control,threshold) {
  const outcomes=[];
  for(const [name,D,E] of [['K^-1',Kinv,K],['K',K,Kinv]])for(const side of ['left','right']){
    const decoded=transform(original,D,side);
    assert.deepEqual(transform(decoded,E,side),original);
    const planted=transform(control,E,side);
    assert.deepEqual(transform(planted,D,side),control);
    outcomes.push({decodeMatrix:name,side,ioc:ioc(decoded),
      output:decoded.map(x=>corpus.translit[x]).join(''),
      exactOriginalRoundTrip:true,clearP57PlantRecovered:true});
  }
  if(threshold!==null)assert(outcomes.every(x=>x.ioc<threshold));
  return outcomes;
}

const rawOutcomes=gate(rawBody,clearControl,0.038);
const password='The Instar Emergence';
const pad=outguessBytes(password,p55.length);
const intermediate=p55.map((c,i)=>mod(c-pad[i]%29));
assert.deepEqual(intermediate.slice(0,10),[26,8,0,6,3,6,8,24,9,0]);
assert.equal(ioc(intermediate),0.05473684210526316);
const intermediateBody=intermediate.slice(1);
assert.equal(intermediateBody.length,75);
const compositePad=pad.slice(1);
const compositeOutcomes=[];
for(const [name,D,E] of [['K^-1',Kinv,K],['K',K,Kinv]])for(const side of ['left','right']){
  const decoded=transform(intermediateBody,D,side);
  assert.deepEqual(transform(decoded,E,side),intermediateBody);
  const hillPlant=transform(clearControl,E,side);
  const compositeCipher=hillPlant.map((x,i)=>mod(x+compositePad[i]%29));
  const afterArc4=compositeCipher.map((x,i)=>mod(x-compositePad[i]%29));
  assert.deepEqual(transform(afterArc4,D,side),clearControl);
  compositeOutcomes.push({decodeMatrix:name,side,ioc:ioc(decoded),
    output:decoded.map(x=>corpus.translit[x]).join(''),
    exactOriginalRoundTrip:true,twoLayerClearP57PlantRecovered:true});
}

console.log(JSON.stringify({
  sourceSquareBase59:five,
  central3x3GP29Key:K,
  determinantModulo29:determinant3(K),
  inverseModulo29:Kinv,
  p55RawBody:{length:rawBody.length,ioc:ioc(rawBody)},
  p57ClearControl:{length:p57.length,ioc:ioc(p57)},
  rawHill3Outcomes:rawOutcomes,
  outguessFirstStage:{password,fullPageIoc:ioc(intermediate),bodyIoc:ioc(intermediateBody),
    firstTenGP29Indices:intermediate.slice(0,10)},
  outguessThenHill3Outcomes:compositeOutcomes,
  conclusion:'Four direct Hill-3 and four OutGuess-title ARC4 then Hill-3 variants fail to recover coherent original plaintext.'
},null,2));
