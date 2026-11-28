'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),MOD=29;
const mod=x=>((x%MOD)+MOD)%MOD;
const product=v=>v.reduce((a,b)=>mod(a*b),1);
const sum=v=>mod(v.reduce((a,b)=>a+b,0));
const H4=v=>[mod(v[0]-v[3]),mod(v[1]-v[2]),mod(v[1]+v[2]),mod(v[0]+v[3])];
const powMod=(base,exp,m)=>{let b=base%m,e=exp,r=1;while(e){if(e&1)r=r*b%m;b=b*b%m;e=Math.floor(e/2);}return r;};
const dlog=(base,target,m)=>{let x=1;for(let e=0;e<m-1;e++){if(x===target)return e;x=x*base%m;}throw Error('dlog');};
const inv=(x,m=29)=>{for(let y=1;y<m;y++)if((x*y)%m===1)return y;throw Error('inverse');};
function inverseGF29(matrix){
  const n=matrix.length,rows=matrix.map((r,i)=>r.map(mod).concat(Array.from({length:n},(_,j)=>Number(i===j))));
  let determinant=1;
  for(let c=0;c<n;c++){
    let pivot=-1;for(let r=c;r<n;r++)if(rows[r][c]){pivot=r;break;}assert(pivot>=0);
    if(pivot!==c){[rows[pivot],rows[c]]=[rows[c],rows[pivot]];determinant=mod(-determinant);}
    const lead=rows[c][c];determinant=mod(determinant*lead);const scale=inv(lead);
    rows[c]=rows[c].map(x=>mod(x*scale));
    for(let r=0;r<n;r++)if(r!==c){const f=rows[r][c];rows[r]=rows[r].map((x,j)=>mod(x-f*rows[c][j]));}
  }
  return {determinant,inverse:rows.map(r=>r.slice(n))};
}
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));

// P15 Phase A lower red11 only.
const p15=corpus.pages.find(p=>p.page===15),lowerRunes=p15.indices.slice(9,20);
const desc=(vals,lengths)=>{let at=0;return lengths.map(L=>{const w=vals.slice(at,at+L);at+=L;return{L,S:sum(w),P:product(w)};});};
const lower=desc(lowerRunes,[4,2,5]);
assert.deepEqual(lower,[{L:4,S:22,P:10},{L:2,S:6,P:5},{L:5,S:5,P:0}]);
const K=lower[1].L,a=lower[1].S,g=lower[1].P,q=lower[0].L,F=lower[2].P,p=lower[0].S+1;
assert.deepEqual([p,K,g,q,F],[23,2,5,4,0]);
assert.equal(powMod(g,a,p),8);

// Same color-blind p15 grid predicate used by the independent p15 result.
const grid=[[3258,3222,3152,3038],[3278,3299,3298,2838],[3288,3294,3296,2472],[4516,1206,708,1820]];
const residues=grid.map(r=>r.map(x=>x%29));
const cols=Array.from({length:4},(_,c)=>H4(Array.from({length:4},(_,r)=>residues[r][c])));
const hits=cols.filter(v=>v[0]===mod(p-g)&&v[2]===mod(a*K)&&v[3]===K);
assert.equal(hits.length,1);
const B=hits[0][1],b=dlog(g,B,p);
assert.deepEqual([B,b],[19,15]);
assert.equal(powMod(B,a,p),K);
const p15Predicted=[p,K,g,K,B];
assert.deepEqual(p15Predicted,[23,2,5,2,19]);

// P7 original red products.
const p7=corpus.pages.find(p=>p.page===7);
const redWords=[[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]];
const products=redWords.map(product);
assert.deepEqual(products,[11,26,8,15,2]);
const circulant=row=>Array.from({length:5},(_,i)=>Array.from({length:5},(_,k)=>row[(k-i+5)%5]));
const actual=inverseGF29(circulant(products));
assert.equal(actual.determinant,B);
assert.deepEqual(actual.inverse[0],p15Predicted);

// Charge five cyclic starts and both printed/reversed orientation.
const variants=[];
for(const reversed of [false,true]){
  const base=reversed?products.slice().reverse():products.slice();
  for(let rotation=0;rotation<5;rotation++){
    const row=base.slice(rotation).concat(base.slice(0,rotation));
    const trial=inverseGF29(circulant(row));
    variants.push({reversed,rotation,row,determinant:trial.determinant,firstRow:trial.inverse[0],match:trial.inverse[0].every((x,i)=>x===p15Predicted[i])});
  }
}
const matches=variants.filter(v=>v.match);
assert.deepEqual(matches.map(v=>[v.reversed,v.rotation]),[[false,0]]);
console.log(JSON.stringify({
 classification:'original-only cross-holdout: independent p15 state predicts older p7 circulant inverse identity',
 p15Derived:{p,K,g,B,b,predictedInverseRow:p15Predicted},
 p7:{products,determinant:actual.determinant,inverseFirstRow:actual.inverse[0]},
 orientationCharge:{variants:variants.length,matches},
 boundary:'strengthens shared state serialization; does not authenticate circulant as the intended cipher opcode'
},null,2));
