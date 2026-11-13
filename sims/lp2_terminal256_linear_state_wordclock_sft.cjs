'use strict';
/**
 * Original LP2 terminal-ring GF(2) word-clock state-rank inversion.
 * Tests ANY secret GF(2)-linear byte-output state, no transition or seed fit.
 * Node 22 SFT: node sims/lp2_terminal256_linear_state_wordclock_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const read=x=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',x),'utf8'));
const c=read('resources/liber-primus/lp2-corpus.json');
const grid=Buffer.from(read('resources/liber-primus/lp2-grid-256.json').bytes);
assert.equal(crypto.createHash('sha256').update(grid).digest('hex'),
 '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
function primes(n){const p=[];for(let v=2;p.length<n;v++){
  let ok=true;for(const d of p){if(d*d>v)break;if(v%d===0){ok=false;break;}}
  if(ok)p.push(v);
}return p;}
const pp=primes(85);let clock=0;
const cipher56=c.pages[56].indices;
const p56=cipher56.map((x,i)=>i===56?x:((x-(pp[clock++]-1))%29+29)%29);
assert.equal(clock,84);
assert.equal(p56.map(x=>c.translit[x]).join(''),
 'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE');
const p57=c.pages[57].indices;
const known=p56.concat(p57);
assert.deepEqual([c.pages[55].indices.length,p56.length,p57.length,known.length],[76,85,95,180]);
function ring(t){const a=[];const top=t,bot=31-t,left=t,right=7-t;
 for(let j=left;j<=right;j++)a.push(top*8+j);
 for(let k=top+1;k<=bot;k++)a.push(k*8+right);
 for(let j=right-1;j>=left;j--)a.push(bot*8+j);
 for(let k=bot-1;k>top;k--)a.push(k*8+left);
 return a;
}
assert.deepEqual([0,1,2,3].map(t=>ring(t).length),[76,68,60,52]);
function route(corner,rev){const out=[];for(let t=1;t<=3;t++){
 const s=ring(t),w=8-2*t,h=32-2*t;
 const starts=[0,w-1,w+h-2,2*w+h-3],beg=starts[corner];
 for(let i=0;i<s.length;i++)out.push(s[(beg+(rev?-i:i)+s.length)%s.length]);
}return out;}
/**
 * Solve all eight byte bitplanes against a shared degree-L recurrence.
 * Each equation: bit[t] = XOR(coeff[j-1] & bit[t-j]), j=1..L.
 * Null return is a CERTIFICATE no such polynomial exists for any key.
 * @param {number[]} bytes
 * @param {number} L
 * @param {boolean} recover
 * @returns {{L:number, rank:number,coefficients?:number[]}|null}
 */
function common(bytes,L,recover=false){
 const rhs=1n<<BigInt(L),mask=rhs-1n;
 const shifts=Array.from({length:L},(_,j)=>1n<<BigInt(j));
 const piv=new Map();
 for(let lane=0;lane<8;lane++)for(let t=L;t<bytes.length;t++){
  let row=((bytes[t]>>lane)&1)?rhs:0n;
  for(let j=1;j<=L;j++)if((bytes[t-j]>>lane)&1)row^=shifts[j-1];
  let rest=row&mask;
  while(rest){
    const bit=rest&-rest,prev=piv.get(bit);
    if(prev===undefined){piv.set(bit,row);break;}
    row^=prev;rest=row&mask;
  }
  if(!rest&&(row&rhs))return null;
 }
 if(!recover)return {L,rank:piv.size};
 let sol=0n;
 for(const [bit,row] of [...piv.entries()].sort((a,b)=>a[0]>b[0]?-1:1)){
   let val=(row&rhs)?1:0,used=row&mask&sol;
   while(used){val^=1;used&=used-1n;}
   if(val)sol|=bit;
 }
 return {L,rank:piv.size,coefficients:shifts.map(bit=>(sol&bit)?1:0)};
}
function order(bytes){
 let lo=0,hi=bytes.length;
 while(lo<hi){const mid=(lo+hi)>>1;if(common(bytes,mid))hi=mid;else lo=mid+1;}
 return lo;
}
const results=[];
for(let corner=0;corner<4;corner++)for(let rev=0;rev<2;rev++){
 const positions=route(corner,!!rev);
 for(const register of ['plaintext','printed-p56']){
  const target=register==='plaintext'?known:cipher56.concat(p57);
  const mask=target.map((v,i)=>grid[positions[i]]^v);
  const L=order(mask);
  assert.equal(common(mask,L-1),null);
  assert(common(mask,L));
  results.push({corner,anticlockwise:!!rev,register,minimumSharedOrder:L});
 }
}
assert.equal(results.length,16);
assert.equal(Math.min(...results.map(v=>v.minimumSharedOrder)),160);
assert.equal(Math.max(...results.map(v=>v.minimumSharedOrder)),161);

/* Independent planted, genuinely 128-BIT GF(2)-linear state. Eight
 * output taps are shifted linear projections of this SINGLE state. */
let seed=0x33018301;
const state=Array.from({length:128},()=>{
 seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
 return (seed>>>=0)&1;
});
for(let t=128;t<305;t++)state.push(state[t-1]^state[t-7]^state[t-128]);
const mask=Array.from({length:256},(_,t)=>{
 let b=0;for(let lane=0;lane<8;lane++)b|=state[t+7*lane]<<lane;return b;
});
const outer=ring(0),inside=route(0,false);
assert.equal(new Set([...outer,...inside]).size,256);
const secret=p57.slice(0,76),encrypted=new Uint8Array(256);
for(let i=0;i<76;i++)encrypted[outer[i]]=secret[i]^mask[i];
for(let i=0;i<180;i++)encrypted[inside[i]]=known[i]^mask[76+i];
const seen=inside.map((pos,i)=>encrypted[pos]^known[i]);
const detected=order(seen);
assert(detected<=128);
const recoveredModel=common(seen,detected,true);
assert.equal(recoveredModel.rank,detected);
assert.equal(recoveredModel.coefficients.at(-1),1);
const full=Array(76).fill(0).concat(seen);
for(let t=76+detected-1;t>=detected;t--){
 let b=full[t];
 for(let j=1;j<detected;j++)if(recoveredModel.coefficients[j-1])b^=full[t-j];
 full[t-detected]=b;
}
assert.deepEqual(full.slice(0,76),mask.slice(0,76));
const deciphered=outer.map((pos,i)=>encrypted[pos]^full[i]);
assert.deepEqual(deciphered,secret);
console.log(JSON.stringify({
 source:'Original p50 byte table / known LP2 p56+p57 runes',
 sourceBytes:grid.length, withheldOriginalP55:c.pages[55].indices.length,
 knownByteSteps:180, modelCount:results.length,
 minCommonOrder:Math.min(...results.map(v=>v.minimumSharedOrder)),
 maxCommonOrder:Math.max(...results.map(v=>v.minimumSharedOrder)),
 allSecretStateDimensionsExcluded:'0 through 159, linear state and linear byte output',
 results,
 positivePlant:{
  actualStateBits:128, detectedCommonOrder:detected,
  solvedEquationRank:recoveredModel.rank,
  hiddenOriginalGeometryRunesRecovered:deciphered.length,
  authenticRecovered:false,
  exactSyntheticRecovery:true
 }
},null,2));
