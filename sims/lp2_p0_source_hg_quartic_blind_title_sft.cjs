'use strict';
/**
 * Original LP2 p0 first 8+5 red rune title, inverse of original p50 H*G
 * quartic factor as a full unknown-state GF29 running-key cipher.
 *
 * Source factor from 2013 BASE29 3QO and original p39 red triple:
 * H(x)=3+26x+24x^2, G(x)=27+5x+15x^2. Their monic product is
 * 14+9x+13x^2+28x^3+x^4. Both orientations are tested.
 *
 * Model C = a*P+b+K mod29 (a != 0), F-transparent with two possible
 * interpretations of original p0 red word 8th ciphertext F. Dictionary
 * contains all native-GP words from source TextBlob, no preferred title.
 * First four consumed runes freely seed K, subsequent 8/9 title rune
 * constraints are solved with exact GF29 affine arithmetic and hash join.
 *
 * Reproduce: node sims/lp2_p0_source_hg_quartic_blind_title_sft.cjs
 * Windows Node 22. No third-party packages; read-only original inputs.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const gp=JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'),'utf8'));
const words=fs.readFileSync(path.join(root,
  'resources/control/english_wordfreq_textblob.txt'),'utf8');
const C=gp.pages[0].indices;
const mod=n=>(n%29+29)%29;
const inv=Array.from({length:29},(_,n)=>{
  if(n===0)return 0;
  for(let i=1;i<29;i++)if(i*n%29===1)return i;
  throw Error('No inverse');
});
const gpTokens=gp.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} w @returns {number[]|null} */
function encode(w) {
  w=w.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out=[];
  for(let i=0;i<w.length;){
    if(w.startsWith('ING',i)){out.push(21);i+=3;}
    else if(w.startsWith('IO',i)){out.push(27);i+=2;}
    else{
      const t=gpTokens.find(x=>w.startsWith(x.s,i));
      if(!t)return null;
      out.push(t.i);i+=t.s.length;
    }
  }
  return out;
}
const first8=[],second5=[];
for(const m of words.matchAll(/^([a-z]+) (\d+)$/gm)){
  const runes=encode(m[1]);if(!runes)continue;
  const entry={word:m[1],runes,freq:Number(m[2])};
  if(runes.length===8)first8.push(entry);
  if(runes.length===5&&runes.every(v=>v!==0))second5.push(entry);
}
const literalFirst=first8.filter(x=>x.runes[7]===0 &&
  x.runes.slice(0,7).every(v=>v!==0));
const encryptedFirst=first8.filter(x=>x.runes.every(v=>v!==0));
assert.equal(C.length,262);
assert.equal(C[7],0);
assert.equal(first8.length,4331);
assert.equal(second5.length,3320);
assert.equal(literalFirst.length,5);
assert.equal(encryptedFirst.length,3872);
const H=[3,26,24],G=[27,5,15];
const product=Array(5).fill(0);
for(let i=0;i<3;i++)for(let j=0;j<3;j++)
  product[i+j]=mod(product[i+j]+H[i]*G[j]);
assert.deepEqual(product,[23,21,11,17,12]);
const monic=product.map(v=>mod(v*inv[product[4]]));
assert.deepEqual(monic,[14,9,13,28,1]);
/** @param {number[]} f @param {number[]} seed @param {number} count */
function extend(f,seed,count){
 const key=seed.slice();
 while(key.length<count){
  const t=key.length;let sum=0;
  for(let i=0;i<4;i++)sum+=f[i]*key[t-4+i];
  key.push(mod(-sum*inv[f[4]]));
 }
 return key;
}
/** @param {number[]} x */
const key=x=>x.join(',');
/**
 * Exact simultaneous inverse across all 812 affine GP29 transforms.
 * Original title has 13 printed runes with fixed 8+5 word boundaries.
 */
function search(cipher,f,literal){
 assert.equal(cipher[7],0);
 assert(cipher.slice(0,7).every(v=>v!==0));
 assert(cipher.slice(8,13).every(v=>v!==0));
 const active=literal?cipher.slice(0,7).concat(cipher.slice(8,13)):
  cipher.slice(0,13);
 const left=literal?7:8;
 const leftWords=literal?literalFirst:encryptedFirst;
 const rows=active.length-4;
 const sum=mod(f.reduce((a,b)=>a+b,0));
 assert.equal(sum,7);
 const coefficients=Array.from({length:rows},(_,r)=>
  Array.from({length:active.length},(_,j)=>
   j>=r&&j<r+5?f[j-r]:0));
 /** @param {number[]} values @param {number} start */
 const projection=(values,start)=>coefficients.map(row=>
  mod(values.reduce((s,value,j)=>s+value*row[start+j],0)));
 const dc=projection(active,0);
 const rhs=new Map();
 for(const w of second5){
  const k=key(projection(w.runes,left));
  const arr=rhs.get(k)||[];arr.push(w);rhs.set(k,arr);
 }
 const lhs=leftWords.map(w=>({word:w,
  projection:projection(w.runes.slice(0,left),0)}));
 const survivors=[];
 for(let a=1;a<29;a++)for(let b=0;b<29;b++){
  const required=dc.map(x=>mod((x-b*sum)*inv[a]));
  for(const u of lhs){
   const need=required.map((v,j)=>mod(v-u.projection[j]));
   const matches=rhs.get(key(need));
   if(!matches)continue;
   for(const w of matches){
    const plain=u.word.runes.slice(0,left).concat(w.runes);
    const seed=plain.slice(0,4).map((p,j)=>mod(active[j]-a*p-b));
    const K=extend(f,seed,active.length);
    assert(plain.every((p,j)=>mod(a*p+b+K[j])===active[j]),
      'Quartic original title replay failed');
    survivors.push({words:u.word.word+' '+w.word,a,b});
   }
  }
 }
 return {source:'original p0 title',literalF:literal,first:lhs.length,
  second:second5.length,rows,quarticTitleSurvivors:survivors.length,
  survivors};
}
/** Source-native positive plant with chosen original F role. */
function positive(f,literal){
 const title=(literal?['YOURSELF','SEEKS']:['EPIPHANY','SEEKS']);
 const wordsRunes=title.map(encode);
 assert.deepEqual(wordsRunes.map(x=>x.length),[8,5]);
 const P=wordsRunes.flat();
 const a=7,b=3;
 for(let nonce=0;nonce<1000;nonce++){
  const seed=Array.from({length:4},(_,i)=>mod(3+17*i+nonce*(i+2)));
  if(!literal){
   const basis=Array.from({length:4},(_,j)=>{
    const e=Array(4).fill(0);e[j]=1;return extend(f,e,8)[7];
   });
   const idx=basis.findIndex(x=>x!==0);
   assert(idx>=0);
   const current=extend(f,seed,8)[7];
   seed[idx]=mod(seed[idx]+mod(-a*P[7]-b-current)*inv[basis[idx]]);
  }
  const K=extend(f,seed,13);
  const cipher=[];let clock=0;
  for(const p of P){
   if(literal&&p===0)cipher.push(0);
   else cipher.push(mod(a*p+b+K[clock++]));
  }
  if(cipher.findIndex(v=>v===0)!==7||
      cipher.filter(v=>v===0).length!==1)continue;
  const result=search(cipher,f,literal);
  assert(result.survivors.some(x=>x.words===title.join(' ').toLowerCase() &&
    x.a===a&&x.b===b),'Planted authentic title failed');
  return {phrase:title.join(' '),nonce,a,b,restored:true};
 }
 throw Error('Unable to plant original-width source quartic title');
}
const results=[];
for(const [name,f] of [['forward',monic],['reciprocal',monic.slice().reverse()]])
 for(const literal of [true,false]){
  const planted=positive(f,literal);
  const original=search(C,f,literal);
  assert.equal(original.quarticTitleSurvivors,0);
  results.push({orientation:name,role:literal?'literalF':'encryptedF',
    planted,original});
 }
console.log(JSON.stringify({model:'p50 H*G monic GF29 quartic affine key',
  originalRunes:C.length,
  positiveSyntheticControls:4,
  conclusion:'No GP-native dictionary first two words under either original title F clock or polynomial orientation',
  results},null,2));
