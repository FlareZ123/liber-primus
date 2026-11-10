'use strict';
/**
 * All-secret quarter/grouped F79-phase cipher necessary-condition gate.
 * Reproduce: node sims/field79_fourgroup_allkey_gate.cjs
 *
 * Conditional candidate: LP2 all 12,956 runes circularly framed as
 * 164 packets ×79, phase35; the first step is salt and remaining
 * 78 steps are GP28 nonzero ranks or 86 zero-step EA markers.
 * This is a source-motivated hypothesis, NOT a recovered cipher.
 *
 * Allow four independent secret GP28 bijections for EACH of 78 public
 * F79 phase values, whether packets are grouped in 41-block quarters or
 * by block ordinal modulo 4. Four clocks × four salt mixes × two grouping
 * rules = 32 architectures, all arbitrary secret 28! tables per state.
 * An exact all-key top-k majorization bound survives every hidden key.
 *
 * Native source comparisons: all contiguous GP28 Shakespeare and
 * Latin Vulgate windows of 12,706 non-EA characters. These windows
 * overlap heavily and are finite register-controls, not p-values.
 *
 * Node 22 CommonJS. No network, writes, or third-party dependencies.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {encode}=require('./word_partition_invariant.cjs');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
const LENGTH=12956, PACKETS=164, WIDTH=79, PAYLOAD=78, START=35;
const mod=(x,n)=>(x%n+n)%n;
assert.equal(original.length,LENGTH);
assert.equal(PACKETS*WIDTH,LENGTH);

const records=[];
for(let b=0;b<PACKETS;b++){
 const i=(START+WIDTH*b)%LENGTH;
 const salt=mod(original[i]-original[mod(i-1,LENGTH)],29);
 for(let j=1;j<=PAYLOAD;j++){
  const step=mod(original[(i+j)%LENGTH]-original[(i+j-1)%LENGTH],29);
  records.push({b,j,salt,r:step?step-1:-1});
 }
}
assert.equal(records.length,12792);
assert.equal(records.filter(x=>x.r<0).length,86);
const used=records.filter(x=>x.r>=0).length;
assert.equal(used,12706);
assert.ok(records.every(x=>x.salt>0));
const clocks=['global79','payload78','packetPlusColumn','blockOnly'];
const mixes=['none','addsalt','xorsalt','mulsalt'];
const groups=['quarters','modulo4'];

/** @param {{b:number,j:number,salt:number}} x */
function phase(x,clock,mix){
 let t=clock==='global79'?79*x.b+x.j
 :clock==='payload78'?78*x.b+x.j-1
 :clock==='packetPlusColumn'?x.b+x.j:x.b;
 t+=START;
 if(mix==='addsalt')t+=x.salt;
 else if(mix==='xorsalt')t^=x.salt;
 else if(mix==='mulsalt')t+=x.b*x.salt;
 return mod(t,78);
}
/** @param {{b:number,j:number,salt:number}} x */
function sourceState(x,clock,mix,group){
 const lane=group==='quarters'?Math.floor(x.b/41):x.b%4;
 return 78*lane+phase(x,clock,mix);
}
const models=[];
for(const clock of clocks)for(const mix of mixes)for(const group of groups){
 const hist=Array.from({length:312},()=>new Uint16Array(28));
 for(const x of records)if(x.r>=0)
  hist[sourceState(x,clock,mix,group)][x.r]++;
 const upper=new Uint16Array(28);
 for(const state of hist){
  const bins=Array.from(state).sort((a,b)=>b-a);
  let total=0;
  for(let k=0;k<28;k++){total+=bins[k];upper[k]+=total;}
 }
 assert.equal(upper[27],used);
 models.push({clock,mix,group,upper,minimumEdits:Infinity,nearestOffset:-1});
}
assert.equal(models.length,32);
assert.equal(Math.max(...models.map(x=>x.upper[11])),9567);

const shakespeare=read('resources/control/shakespeare_first300k.txt')
 .toUpperCase().match(/[A-Z]+/g).flatMap(encode).filter(x=>x<28);
const latinAlphabet='0123456789ABCDEFGHIJKLMNOPQRS';
const latin=read('resources/control/latin-vulgate-gp-wholewords.txt')
 .split(/\r?\n/u).filter(line=>line&&!line.trimStart().startsWith('#'))
 .flatMap(word=>[...word].map(ch=>latinAlphabet.indexOf(ch))).filter(x=>x<28);
assert.equal(shakespeare.length,217167);
assert.equal(latin.length,204511);

/**
 * Exact source-native model-independent top12 minimum.
 * @param {number[]} source
 */
function referenceTop12(source){
 const h=new Uint16Array(28);
 for(let i=0;i<used;i++)h[source[i]]++;
 let minimum=Infinity,offset=-1;
 for(let start=0;start<=source.length-used;start++){
  if(start){h[source[start-1]]--;h[source[start+used-1]]++;}
  const bins=Array.from(h).sort((a,b)=>b-a);
  let top=0;for(let k=0;k<12;k++)top+=bins[k];
  if(top<minimum){minimum=top;offset=start;}
 }
 return {windows:source.length-used+1,minTop12:minimum,offset};
}
const latinTop12=referenceTop12(latin);
assert.equal(latinTop12.windows,191806);
assert.equal(latinTop12.minTop12,11028);

// Exact 28-way sorted-frequency deficit. At each control window, a
// one-symbol edit can raise occupancy in a chosen top-k set by at most one.
// For each candidate choose the largest positive deficit over all k,
// then minimize this necessary number of changes over ALL source windows.
const h=new Uint16Array(28);
for(let i=0;i<used;i++)h[shakespeare[i]]++;
let minShakespeareTop12=Infinity,minShakespeareTop1=Infinity;
for(let start=0;start<=shakespeare.length-used;start++){
 if(start){h[shakespeare[start-1]]--;h[shakespeare[start+used-1]]++;}
 const bins=Array.from(h).sort((a,b)=>b-a);
 let acc=0;
 const changes=new Int32Array(models.length);
 for(let k=0;k<28;k++){
  acc+=bins[k];
  if(k===0)minShakespeareTop1=Math.min(minShakespeareTop1,acc);
  if(k===11)minShakespeareTop12=Math.min(minShakespeareTop12,acc);
  for(let z=0;z<models.length;z++)
   changes[z]=Math.max(changes[z],acc-models[z].upper[k]);
 }
 for(let z=0;z<models.length;z++)if(changes[z]<models[z].minimumEdits){
  models[z].minimumEdits=changes[z];models[z].nearestOffset=start;
 }
}
assert.equal(shakespeare.length-used+1,204462);
assert.equal(minShakespeareTop1,1381);
assert.equal(minShakespeareTop12,9608);
assert.ok(models.every(x=>x.minimumEdits>=335));
const mostPermissive=models.slice().sort((a,b)=>a.minimumEdits-b.minimumEdits)[0];
assert.equal(mostPermissive.minimumEdits,335);
assert.equal(mostPermissive.clock,'payload78');
assert.equal(mostPermissive.group,'modulo4');

// Source-native positive with 312 independently keyed secret 28-bijections
// and the exact original layout of 86 zero-rank marker locations.
const positiveModel=models.find(x=>x.clock==='global79'&&x.mix==='addsalt'&&x.group==='quarters');
assert.ok(positiveModel);
const invertible=[1,3,5,9,11,13,15,17,19,23,25,27];
const keys=Array.from({length:312},(_,s)=>({a:invertible[(s*7+3)%invertible.length],b:(s*13+7)%28}));
const source=shakespeare.slice(150000,150000+used);
assert.equal(source.length,used);
let pos=0;
const encrypted=records.map(x=>{
 if(x.r<0)return -1;
 const {a,b}=keys[sourceState(x,positiveModel.clock,positiveModel.mix,positiveModel.group)];
 return mod(a*source[pos++]+b,28);
});
assert.equal(pos,used);
const recovery=encrypted.map((rank,i)=>{
 if(rank<0)return -1;
 const x=records[i],{a,b}=keys[sourceState(x,positiveModel.clock,positiveModel.mix,positiveModel.group)];
 for(let plain=0;plain<28;plain++)if(mod(a*plain+b,28)===rank)return plain;
 throw new Error('Permutation inversion failed');
}).filter(x=>x>=0);
assert.deepEqual(recovery,source);

console.log(JSON.stringify({
 status:'exact conditional exclusion; no unknown LP2 plaintext or authentic cipher',
 source:{runes:LENGTH,packets:PACKETS,width:WIDTH,phase:START,
  nonzeroRanks:used,zeroSteps:records.length-used},
 secretModel:{clocks:4,nonceMixes:4,fourGroupPatterns:2,
  evaluatedArchitectures:models.length,arbitrarySecretBijectionsPerModel:312},
 sourceWindows:{shakespeare:204462,latin:latinTop12.windows,
  minimumShakespeareTop1:minShakespeareTop1,minimumShakespeareTop12:minShakespeareTop12,
  minimumLatinTop12:latinTop12.minTop12},
 originalCapacities:{maxTop12Across32:Math.max(...models.map(x=>x.upper[11])),
  latinMinimumChangesByTop12:latinTop12.minTop12-9567,
  shakespeareMinimumChangesAllKAll32:mostPermissive.minimumEdits,
  leastExcludingClock:mostPermissive.clock,leastExcludingMix:mostPermissive.mix,
  leastExcludingGrouping:mostPermissive.group},
 positiveControl:{secretStateTables:312,sourceRunes:source.length,
  recovered:recovery.length,zeroMarkerSitesUnchanged:true},
 models:models.map(x=>({clock:x.clock,mix:x.mix,group:x.group,
  top1:x.upper[0],top3:x.upper[2],top12:x.upper[11],
  minShakespeareEdits:x.minimumEdits,nearestShakespeareOffset:x.nearestOffset})),
 caveat:'All bounds condition on conjectural 164×79/zero-EA direct-GP framing. 4 epoch/lane states keyed only by stated public phase; hidden per-rune state, other encodings, altered framing remain open. Overlapping reference windows are finite exact controls, not independent trials.'
},null,2));
