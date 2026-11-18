"use strict";
/**
 * Source-shaped bounded gate:
 * p57 says "shed ... circumferences"; peeling one full outer circumference
 * from original p32's 11x11 rune square leaves a 9x9 = 81-rune core.
 * Original p33 begins with a 10-rune red heading and then exactly 81 runes
 * before the next red heading. Test the core only as the literal 9x9 Hill
 * matrix, with no fitted key/phase/offset, in all four natural left/right
 * and transpose orientations.
 *
 * The Hill operator is a modern hypothesis, not an authenticated Cicada
 * instruction. This file exists to bound that exact natural consumer.
 * Windows Node22 CJS, read-only, no dependencies.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const gp=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const p32=gp.pages.find(p=>p.page===32).indices;
const p33=gp.pages.find(p=>p.page===33).indices;
const p57=gp.pages.find(p=>p.page===57).indices;
assert.equal(p32.length,121);
assert(p33.length>=91);
assert(p57.length>=81);
const mod=x=>((x%29)+29)%29;
function scalarInv(a){for(let x=1;x<29;x++)if(mod(a*x)===1)return x;throw new Error("nonunit");}
function inverse(A){
  const n=A.length;
  const M=A.map((row,i)=>row.map(mod).concat(Array.from({length:n},(_,j)=>i===j?1:0)));
  for(let c=0;c<n;c++){
    let p=c;while(p<n&&M[p][c]===0)p++;
    if(p===n)return null;
    [M[c],M[p]]=[M[p],M[c]];
    const z=scalarInv(M[c][c]);M[c]=M[c].map(v=>mod(v*z));
    for(let r=0;r<n;r++)if(r!==c&&M[r][c]){
      const f=M[r][c];M[r]=M[r].map((v,j)=>mod(v-f*M[c][j]));
    }
  }
  return M.map(row=>row.slice(n));
}
const transpose=A=>A[0].map((_,j)=>A.map(row=>row[j]));
const multiply=(A,B)=>A.map(row=>B[0].map((_,j)=>mod(row.reduce((s,x,k)=>s+x*B[k][j],0))));
const flatten=A=>A.flat();
const reshape=a=>Array.from({length:9},(_,r)=>a.slice(9*r,9*r+9));
const ioc=a=>{
  const h=Array(29).fill(0);for(const x of a)h[x]++;
  return h.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
};
const translit=a=>a.map(x=>gp.translit[x]).join("");

const K=Array.from({length:9},(_,r)=>Array.from({length:9},(_,c)=>p32[(r+1)*11+(c+1)]));
const Ki=inverse(K);assert(Ki,"p32 9x9 core must be invertible mod29");
const Kt=transpose(K), Kti=transpose(Ki);
const C=reshape(p33.slice(10,91));
const clear=reshape(p57.slice(0,81));
const cases=[
  {name:"Kinv*C",decode:X=>multiply(Ki,X),encode:P=>multiply(K,P)},
  {name:"KTinv*C",decode:X=>multiply(Kti,X),encode:P=>multiply(Kt,P)},
  {name:"C*Kinv",decode:X=>multiply(X,Ki),encode:P=>multiply(P,K)},
  {name:"C*KTinv",decode:X=>multiply(X,Kti),encode:P=>multiply(P,Kt)}
];
const out=[];
for(const tc of cases){
  const plant=tc.encode(clear);
  assert.deepEqual(tc.decode(plant),clear,tc.name+" positive plant");
  const P=tc.decode(C), flat=flatten(P);
  out.push({name:tc.name,ioc:ioc(flat),translit:translit(flat)});
}
console.log("SOURCE",JSON.stringify({
  p32Runes:p32.length,p32CoreRunes:81,p33BodyRunes:C.flat().length,
  p33BodyInterval:"page33 local[10,91)",matrixInvertible:true
}));
console.log("RAW_P33_BODY_IOC",ioc(flatten(C)));
console.log("CLEAR_P57_PREFIX_IOC",ioc(flatten(clear)));
console.log("HILL9_RESULTS",JSON.stringify(out));
console.log("POSITIVE_PLANTS",cases.length,"of",cases.length);
