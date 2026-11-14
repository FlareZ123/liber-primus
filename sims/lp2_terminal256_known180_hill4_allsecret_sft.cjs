"use strict";
/**
 * All-secret GF29 4x4 Hill/affine key recovery from the terminal p56+p57
 * 180 solved GP runes against the original pp49-51 256-cell numeric table.
 * Read-only, Node 22 CommonJS, no dependencies. Rowwise or NW clockwise
 * 32x8 shells under every source-canonical corner and turn direction.
 * Tests both input directions, all-secret keys and independent GP positives.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=f=>fs.readFileSync(path.join(__dirname,"..",f),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json")).bytes.map(v=>v%29);
const mod=v=>(v%29+29)%29;
const primes=[];for(let n=2;primes.length<90;n++){let prime=true;for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break;}if(prime)primes.push(n);}
let phase=0;
const known=gp.pages[56].indices.map((v,i)=>i===56?v:mod(v-primes[phase++]+1)).concat(gp.pages[57].indices);
assert.equal(phase,84);assert.equal(known.length,180);assert.equal(gp.pages[55].indices.length,76);
assert.equal(known.slice(0,5).map(i=>gp.translit[i]).join(""),"ANEND");
/** Original top-left-clockwise ring readout for all 32×8 table cells. */
function rings(){const idx=[],lengths=[];for(let k=0;k<4;k++){const start=idx.length,t=k,b=31-k,l=k,r=7-k;for(let c=l;c<=r;c++)idx.push(t*8+c);for(let y=t+1;y<=b;y++)idx.push(y*8+r);for(let c=r-1;c>=l;c--)idx.push(b*8+c);for(let y=b-1;y>t;y--)idx.push(y*8+l);lengths.push(idx.length-start);}assert.deepEqual(lengths,[76,68,60,52]);assert.equal(new Set(idx).size,256);return idx;}
const blocks=v=>Array.from({length:v.length/4},(_,i)=>v.slice(4*i,4*i+4));
/** Solve X*W=Y, allowing all GF29 coefficients and singular matrices. */
function solve(X,Y){const d=X[0].length,m=Y[0].length,R=X.map((x,i)=>[...x,...Y[i]]);
let rank=0;const piv=[];for(let j=0;j<d;j++){let q=R.findIndex((row,i)=>i>=rank&&row[j]);if(q===-1)continue;[R[rank],R[q]]=[R[q],R[rank]];let iv=Array.from({length:28},(_,i)=>i+1).find(v=>mod(v*R[rank][j])===1);
for(let z=j;z<d+m;z++)R[rank][z]=mod(R[rank][z]*iv);for(let i=0;i<R.length;i++)if(i!==rank){let f=R[i][j];for(let z=j;z<d+m;z++)R[i][z]=mod(R[i][z]-f*R[rank][z]);}piv.push(j);rank++;}
const bad=R.findIndex((row,i)=>i>=rank&&row.slice(d).some(x=>x));
const W=Array.from({length:d},()=>Array(m).fill(0));for(let i=0;i<rank;i++)W[piv[i]]=R[i].slice(d);
return{rank,consistent:bad===-1,bad,residual:bad<0?[]:R[bad].slice(d),W};
}
const dot=(x,W)=>W[0].map((_,j)=>mod(x.reduce((s,v,k)=>s+v*W[k][j],0)));
/** All four corners and both directions, same orientation on all four rings. */
function orientedRings(corner,direction) {
 const canonical=rings(),readout=[];
 let offset=0;
 for(let k=0;k<4;k++){
  const w=8-2*k,h=32-2*k,len=2*(w+h)-4;
  const shell=canonical.slice(offset,offset+len);
  const starts=[0,w-1,w+h-2,2*w+h-3];
  for(let j=0;j<len;j++)
   readout.push(shell[(starts[corner]+direction*j+len*10)%len]);
  offset+=len;
 }
 assert.equal(offset,256);
 assert.equal(new Set(readout).size,256);
 return readout;
}
const orders=[{name:"rowwise",indices:grid.map((_,i)=>i)}];
for(let corner=0;corner<4;corner++)
 for(const direction of [1,-1])
  orders.push({name:["NW","NE","SE","SW"][corner]+(direction===1?"-CW":"-CCW"),
   indices:orientedRings(corner,direction)});
assert.equal(orders.length,9);
const results=[];
for(const o of orders){const values=o.indices.map(i=>grid[i]),A=blocks(values.slice(76)),B=blocks(known);
assert.equal(A.length,45);for(const reverse of [false,true])for(const affine of [false,true]){
const X=reverse?B:A,Y=reverse?A:B,ans=solve(affine?X.map(x=>x.concat(1)):X,Y);
assert.equal(ans.rank,affine?5:4);assert.equal(ans.consistent,false);
assert.equal(ans.bad,affine?5:4);
results.push({order:o.name,direction:reverse?"known-to-table":"table-to-known",family:affine?"affine":"linear",rank:ans.rank,firstContradiction:ans.bad,residual:ans.residual});}
// Source-independent secret key and a complete planted 256-rune text whose
// last 180 are literally the established p56+p57 GP-native plaintext.
const plaintext=gp.pages[57].indices.slice(0,76).concat(known);
const K=[[1,2,0,0],[0,1,2,0],[0,0,1,2],[0,0,0,1]],bias=[4,9,13,17];
const plant=blocks(plaintext).flatMap(y=>{let x=[];for(let i=0;i<4;i++)x[i]=mod(y[i]-bias[i]-x.reduce((s,v,j)=>s+v*K[j][i],0));return x;});
const learned=solve(blocks(plant.slice(76)).map(x=>x.concat(1)),B);
assert.equal(learned.consistent,true);assert.equal(learned.rank,5);assert.deepEqual(learned.W,K.concat([bias]));
assert.deepEqual(blocks(plant).flatMap(x=>dot(x.concat(1),learned.W)),plaintext);
results.push({order:o.name,family:"affine native positive",known:180,unknownRecovered:76});
}
console.log(JSON.stringify({source:"original 256-cell pp49-51 and original p56-57 180 solved plaintext",decision:"Every secret 4x4 GF29 linear/affine table-to-terminal model fails in 9 natural source readouts and both mapping directions; native GP 76-rune positives recovered",results},null,2));
