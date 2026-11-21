'use strict';
/**
 * Bounded source-derived sparse-plaintext receiver.
 *
 * Hypothesis (not an authenticated Cicada cipher): C_i=C_(i-1)+
 * a_i(P_i-R_i) (mod29), nonzero unknown a_i, where the original 256-byte
 * printed table supplies R_i as byte mod29. An observed repeat therefore
 * reveals P_i=R_i independently of the 12,901 unknown multipliers.
 * We evaluate all four source-simple global/page clocks x radix60/radix59
 * without recovering the secret multiplier. Windows Node22 CommonJS.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {parseSharedCorpus}=require('./lp2_word_pages.cjs');
const {encodeSourceNativeGP}=require('./lp2_native_gp_source_orthography_sft.cjs');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const c=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const g=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const pages=c.pages.filter(p=>p.page<56&&p.indices.length);
const arr=pages.flatMap(p=>p.indices);
const words=parseSharedCorpus().words;
assert.equal(arr.length,12956);
assert.equal(words.reduce((s,w)=>s+w.length,0),12956);
const at=[];
for(let wi=0;wi<words.length;wi++)for(let pos=0;pos<words[wi].length;pos++)
 at.push({wi,pos,length:words[wi].length});
const events=[];let start=0;
for(const p of pages){
 for(let i=1;i<p.indices.length;i++){
  if(p.indices[i]===p.indices[i-1]){
   const index=start+i;
   events.push({index,page:p.page,pageOffset:i,rune:p.indices[i],...at[index]});
  }
 }
 start+=p.indices.length;
}
assert.equal(events.length,86);
const tokens=g.pages.flatMap(p=>p.tokens);
assert.equal(tokens.length,256);
const byteRead=radix=>{
 const abc=radix===60?g.alphabet:g.alphabet.replace('f','');
 return tokens.map(t=>{
  const x=abc.indexOf(t[0]),y=abc.indexOf(t[1]);
  assert(x>=0&&y>=0);
  const v=x*radix+y;
  assert(v>=0&&v<256);
  return v;
 });
};
const wordSources=[
 ['Shakespeare','resources/control/shakespeare_first300k.txt'],
 ['Gibran','resources/control/gibran_prophet_58585.txt'],
 ['Emerson','resources/control/emerson_essays_2944.txt']
];
const native=[];
for(const [name,fn] of wordSources){
 const text=read(fn);
 const byLen=Array.from({length:15},()=>[]);
 for(const w of text.toUpperCase().match(/[A-Z]+/g)||[]){
  const a=encodeSourceNativeGP(w);
  if(a.length>0&&a.length<15)byLen[a.length].push(a);
 }
 assert(byLen.slice(1).every(v=>v.length>0));
 const bins=Array.from({length:15},(_,len)=>Array.from({length:len},()=>new Uint32Array(29)));
 for(let len=1;len<15;len++)for(const w of byLen[len])
   for(let j=0;j<len;j++)bins[len][j][w[j]]++;
 const pscore=(len,j,letter)=>{
  const n=byLen[len].length;
  return Math.log((bins[len][j][letter]+0.5)/(n+0.5*29));
 };
 native.push({name,byLen,pscore});
}
const rng=(()=>{let s=0x33018086;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};})();
const controlByWord=new Map();
for(let m=0;m<events.length;m++){
 const wi=events[m].wi;
 if(!controlByWord.has(wi))controlByWord.set(wi,[]);
 controlByWord.get(wi).push(events[m]);
}
const configs=[];
for(const radix of [60,59])for(const clock of ['global','page']){
 const bytes=byteRead(radix);
 const letters=events.map(e=>bytes[(clock==='global'?e.index:e.pageOffset)%256]%29);
 configs.push({radix,clock,letters});
}
for(const n of native){
 const controls=[];
 for(let sample=0;sample<600;sample++){
  let sum=0;
  for(const [wi,ev] of controlByWord){
   const len=words[wi].length;
   const items=n.byLen[len];
   const w=items[Math.floor(rng()*items.length)];
   for(const e of ev)sum+=n.pscore(len,e.pos,w[e.pos]);
  }
  controls.push(sum);
 }
 controls.sort((a,b)=>a-b);
 const rows=configs.map(x=>{
  const score=x.letters.reduce((s,r,i)=>{
   const e=events[i];return s+n.pscore(e.length,e.pos,r);
  },0);
  return {radix:x.radix,clock:x.clock,totalLogLikelihood:score,
    perMarkedRune:score/events.length,
    controlBelowOrEqual:controls.filter(v=>v<=score).length,
    nativeControlMin:controls[0],
    nativeControlMedian:controls[300],
    sourceMarkerRunes:x.letters.map(r=>c.translit[r]).join(' ')};
 });
 console.log(JSON.stringify({native:n.name,rows},null,2));
}

/** @param {number} a A nonzero GF(29) multiplier. */
function inverse29(a) {
 for (let i=1;i<29;i++) if ((a*i)%29===1) return i;
 throw new Error('zero multiplier cannot be inverted');
}
/** @param {number[]} symbols */
function ioc(symbols) {
 const counts=new Int32Array(29);
 for(const n of symbols) counts[n]++;
 return counts.reduce((s,v)=>s+v*(v-1),0)/(symbols.length*(symbols.length-1));
}
// Freeze the fully specified, nonfitted multiplier a=1+(byte mod28).
// The first runic value of each page is the source-transmitted IV.
// Both receiver and exact forward regeneration use the original previous C.
for(const {radix,clock} of configs){
 const table=byteRead(radix);
 const decoded=[];
 let global=0;
 for(const p of pages){
  for(let j=1;j<p.indices.length;j++){
   const index=(clock==='global'?global+j:j)%256;
   const b=table[index],a=1+(b%28),ref=b%29;
   const diff=(p.indices[j]-p.indices[j-1]+29)%29;
   const pt=(ref+inverse29(a)*diff)%29;
   assert.equal((p.indices[j-1]+a*(pt-ref)+29*29)%29,p.indices[j]);
   decoded.push(pt);
  }
  global+=p.indices.length;
 }
 assert.equal(decoded.length,12901);
 console.log(JSON.stringify({fullInverse:true,radix,clock,
  originalEligibleRunes:decoded.length,
  fullInverseIoC:ioc(decoded),
  first48PlainTranslit:decoded.slice(0,48).map(x=>c.translit[x]).join(' '),
  exactForwardReencryption:true}));
}

const b=byteRead(60);
const planted=encodeSourceNativeGP(read('resources/control/gibran_prophet_58585.txt')).slice(0,700);
const out=[17];
for(let i=1;i<planted.length;i++){
 const a=1+((7*i+11)%28);
 const r=b[i%256]%29;
 out[i]=(out[i-1]+a*(planted[i]-r)+29*29)%29;
 const p=(r+(out[i]-out[i-1]+29)*(()=>{for(let t=1;t<29;t++)if((t*a)%29===1)return t;throw Error('no inverse');})())%29;
 assert.equal(p,planted[i]);
 assert.equal(out[i]===out[i-1],planted[i]===r);
}
console.log(JSON.stringify({positive:planted.length-1,sourceRuneCount:arr.length,doublets:events.length,models:configs.length,
 classification:'Original repeat slots imply grid-selected sparse plaintext only if an unauthenticated variable-reserved-rune rotor is true'}));
