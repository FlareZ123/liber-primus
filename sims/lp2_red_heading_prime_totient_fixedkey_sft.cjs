'use strict';

/**
 * Exact native LP2 red-heading prime-totient key transfer, one frozen rule.
 * Node.js 22 CommonJS SFT. No keys, phases, F masks or decoder parameters fit.
 * Run: node sims/lp2_red_heading_prime_totient_fixedkey_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const source = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const mod = x => ((x%29)+29)%29;
const headings = [[0,0,13],[3,0,16],[8,0,12],[15,9,11],
  [23,0,16],[27,0,19],[33,0,10],[33,91,8],[40,0,8]];
const stream = [];
const base = [];
for (const p of source.pages.filter(q => q.page <= 55)) {
  base[p.page] = stream.length;
  stream.push(...p.indices);
}
assert.equal(stream.length,12956);
const sections = headings.map(([page,start,length],i) => {
  const red = ink.pages.find(x => x.page===page).red_spans
    .find(x => x.start===start && x.length===length);
  assert.ok(red);
  const symbols = source.pages[page].indices.slice(start,start+length);
  assert.equal(symbols.map(x => source.runes[x]).join(''),red.runes);
  const key = symbols.map(x => mod(source.prime[x]-1));
  const begin = base[page]+start+length;
  const end = i+1 < headings.length
    ? base[headings[i+1][0]]+headings[i+1][1] : stream.length;
  return {page, start, key, body:stream.slice(begin,end)};
});
assert.deepEqual(sections.map(x=>x.body.length),
  [716,1129,1726,1883,1005,1414,81,1581,3308]);
const decrypt = (cipher,key) => cipher.map((c,i)=>mod(c-key[i%key.length]));
const encrypt = (plain,key) => plain.map((p,i)=>mod(p+key[i%key.length]));
const ioc = s => {
  const counts = new Uint32Array(29);
  for(const c of s) counts[c]++;
  return counts.reduce((v,c)=>v+c*(c-1),0)/(s.length*(s.length-1));
};
const subs = {K:'C',Q:'C',V:'U',Z:'S'};
const pairs = {TH:2, NG:21, EO:12, OE:22, AE:25, IA:27, EA:28};
const letters = {A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,L:20,
  M:19,N:9,O:3,P:13,R:4,S:15,T:16,U:1,W:7,X:14,Y:26};
function gpText(text) {
  const textChars = text.toUpperCase().replace(/[^A-Z]/g,'')
    .replace(/[KQVZ]/g,ch=>subs[ch]);
  const out=[];
  for(let i=0;i<textChars.length;i++) {
    const pair=pairs[textChars.slice(i,i+2)];
    if(pair!==undefined){out.push(pair);i++}
    else out.push(letters[textChars[i]]);
  }
  return out;
}
const shakespeare=read('resources/control/shakespeare_first300k.txt').replace(/\r\n/g,'\n');
assert.equal(shakespeare.length,300000);
const train=gpText(shakespeare.slice(0,200000));
const heldout=gpText(shakespeare.slice(200000));
const U=new Uint32Array(29),B=new Uint32Array(841),T=new Uint32Array(24389);
for(let i=0;i<train.length;i++) {
  U[train[i]]++;
  if(i)B[train[i-1]*29+train[i]]++;
  if(i>1)T[(train[i-2]*29+train[i-1])*29+train[i]]++;
}
const u=Array.from(U,x=>Math.log((x+1)/(train.length+29)));
const b=new Float64Array(841),t=new Float64Array(24389);
for(let a=0;a<29;a++)for(let c=0;c<29;c++) {
  b[a*29+c]=Math.log((B[a*29+c]+12*Math.exp(u[c]))/(U[a]+12));
  for(let d=0;d<29;d++) {
    const pos=(a*29+c)*29+d;
    t[pos]=Math.log((T[pos]+9*Math.exp(b[c*29+d]))/(B[a*29+c]+9));
  }
}
function score(seq) {
  assert.ok(seq.length>=2);
  let v=u[seq[0]]+b[seq[0]*29+seq[1]];
  for(let i=2;i<seq.length;i++)v+=t[(seq[i-2]*29+seq[i-1])*29+seq[i]];
  return v/seq.length;
}
let total=0, raw=0, decoded=0, control=0, cursor=0;
const C=[],P=[];
const each=[];
for(const x of sections) {
  const p=decrypt(x.body,x.key);
  assert.deepEqual(encrypt(p,x.key),x.body);
  C.push(...x.body);P.push(...p);
  const native=heldout.slice(cursor,cursor+x.body.length);
  cursor+=x.body.length;
  assert.equal(native.length,x.body.length);
  assert.deepEqual(decrypt(encrypt(native,x.key),x.key),native);
  const n=x.body.length;
  raw+=n*score(x.body);
  decoded+=n*score(p);
  control+=n*score(native);
  total+=n;
  each.push({page:x.page,offset:x.start,runicKey:x.key.length,
    sourceRunes:n,decodedIoC:ioc(p),decodedScore:score(p),
    first16:p.slice(0,16).map(q=>source.translit[q]).join(' ')});
}
assert.equal(total,12843);
assert.ok(Math.abs(ioc(P)-0.03450842596637748)<1e-9);
assert.ok(Math.abs(decoded/total-(-3.8863099837645616))<1e-9);
assert.ok(control/total > decoded/total + 1);
console.log(JSON.stringify({
  method:'Use original nine GP29 red title runes, replace each with phi(its GP prime) modulo29, repeat as fixed additive key through its following body; natural zero phase and no F skip.',
  originalRunes:12956,redHeadings:9,bodyRunes:total,
  rawBodyIoC:ioc(C),transformedIoC:ioc(P),
  rawGPTrigram:raw/total,transformedGPTrigram:decoded/total,
  independentNativeGPTrigram:control/total,
  syntheticNativeRoundtrip:total+'/12843',
  originalRoundtrip:total+'/12843',
  sections:each,decision:'No English plaintext; fixed authentic p56 prime-totient title-key transfer fails as direct native-GP decoder.'
},null,2));
