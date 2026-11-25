'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const g = read('resources/liber-primus/lp2-grid-256.json');
const c = read('resources/liber-primus/lp2-corpus.json');
const n = read('resources/external/relikd-solved-gp29-native-v1.json');
const page = p => c.pages.find(x => x.page === p).indices;
const known = ['p56_an_end','p57_parable'].flatMap(name =>
 [...n.sections.find(x => x.name === name).source_text].map(x => c.runes.indexOf(x)).filter(x => x >= 0));
const rows = [g.bytes, page(55), page(56), page(57), known];
assert.deepEqual(rows.map(x=>x.length), [256,76,85,95,180]);
let h=14695981039346656037n;
for(const x of rows.flat()) h=BigInt.asUintN(64,(h^BigInt(x))*1099511628211n);
assert.equal(h,0x1fbb6cf28298303fn,'frozen source vector fingerprint');
/** @param {number} x */
const mod = x => ((x%29)+29)%29;
const inv = x => { for(let i=1;i<29;i++) if(mod(x*i)===1)return i; throw Error('zero pivot'); };
const s=[];
for(let d=0;d<4;d++){
 const r0=d,r1=31-d,c0=d,c1=7-d;
 for(let j=c0;j<=c1;j++)s.push(8*r0+j);
 for(let i=r0+1;i<=r1;i++)s.push(8*i+c1);
 for(let j=c1-1;j>=c0;j--)s.push(8*r1+j);
 for(let i=r1-1;i>r0;i--)s.push(8*i+c0);
}
assert.equal(new Set(s).size,256);
/** Exact rank over GF(29). @param {number[][]} input */
function rank(input){
 const a=input.map(row=>row.map(mod));let r=0;
 for(let j=0;j<a[0].length&&r<a.length;j++){
  const p=a.findIndex((row,i)=>i>=r&&row[j]!==0);
  if(p<0)continue;
  [a[p],a[r]]=[a[r],a[p]];
  const t=inv(a[r][j]);a[r]=a[r].map(x=>mod(x*t));
  for(let i=r+1;i<a.length;i++)if(a[i][j]){const z=a[i][j];a[i]=a[i].map((x,k)=>mod(x-z*a[r][k]));}
  r++;
 }
 return r;
}
const mask=[...page(56).map((x,i)=>mod(x-known[i])),...Array(95).fill(0)];
for(const radix of [59,60]){
 const abc=radix===59?g.alphabet.replace('f',''):g.alphabet;
 const b=g.pages.flatMap(p=>p.tokens).map(t=>mod(radix*abc.indexOf(t[0])+abc.indexOf(t[1])));
 const A=s.slice(76).map(i=>[1,...s.slice(0,76).map(d=>b[((Math.floor(i/8)+Math.floor(d/8))%32)*8+(i%8+d%8)%8])]);
 for(const [label,y] of [['direct',known],['pad',mask]]){
  const fit=A.slice(0,85);
  const rk=rank(fit),aug=rank(fit.map((row,i)=>[...row,y[i]]));
  const all=rank(A),allAug=rank(A.map((row,i)=>[...row,y[i]]));
  console.log({radix,label,perimeterWeights:76,fit:[rk,aug],all:[all,allAug]});
  assert.deepEqual([rk,aug,all,allAug],[77,78,77,78]);
 }
}
const exe=process.argv[2];
if(!exe)throw Error('Supply path to compiled lp2_terminal_sparse_torus executable');
const result=spawnSync(path.resolve(exe),[],{input:rows.map(x=>x.join(' ')).join('\n')+'\n',encoding:'utf8',maxBuffer:1024*1024});
if(result.error)throw result.error;
process.stdout.write(result.stdout);
process.stderr.write(result.stderr);
assert.equal(result.status,0);
assert.equal((result.stdout.match(/unique_fit_keys=0/g)||[]).length,4);
assert.equal((result.stdout.match(/planted border=76\/76/g)||[]).length,2);
