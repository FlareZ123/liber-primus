"use strict";
/** Source-aligned shared byte pad with arbitrary private GF(2) affine mixers. */
const fs=require("node:fs"),path=require("node:path");
function experiment(gp,grid){
 const assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29,parity=x=>{x^=x>>>16;x^=x>>>8;x^=x>>>4;return (0x6996>>>(x&15))&1};
 const C=gp.pages.find(p=>p.page===56).indices,Q=gp.pages.find(p=>p.page===57).indices;
 const primes=[];for(let p=2;primes.length<84;p++)if(!primes.some(q=>p%q===0))primes.push(p);
 let j=0;const P=C.map((x,i)=>i===56?0:mod(x-primes[j++]+1));j=0;
 assert(C.every((x,i)=>i===56?x===0:x===mod(P[i]+primes[j++]-1)),"p56 replay");
 const tokens=grid.pages.flatMap(p=>p.tokens);assert(C.length===85&&Q.length===95&&tokens.length===256,"source sizes");
 /** @param {number[]} values @param {number} width */
 function basis(values,width){const b=Array(width).fill(0);for(let x of values){for(let k=width-1;k>=0;k--){if(!(x&(1<<k)))continue;if(b[k])x^=b[k];else{b[k]=x;break}}}return b.filter(Boolean)}
 /**
  * Eliminate all label, row and column coefficients simultaneously; the
  * residual 16-bit rows annihilate every admissible pair of mixing rows.
  * @param {number[]} p @param {number[]} q @param {number[]} values
  * @param {boolean} reflect
  */
 function analyze(p,q,values,reflect){
   const piv=new Map(),res=[],certs=[];let directXorFails=0,directParityFails=0;const rows=[];
   for(let i=0;i<85;i++){const t=i+43,z=reflect?t^7:t;
     const a=(1n<<BigInt(p[i]))^(1n<<BigInt(29+q[i+10]))^(1n<<BigInt(58+t%8))^(1n<<BigInt(66+(t>>3)));
     rows.push({a,b:values[t]|(values[128+z]<<8)});
   }
   for(let i=0;i<85;i++){let {a,b}=rows[i],w=1n<<BigInt(i);
     for(let k=0;k<82;k++){if(!(a&(1n<<BigInt(k))))continue;const v=piv.get(k);if(v){a^=v.a;b^=v.b;w^=v.w}else{piv.set(k,{a,b,w});break}}
     if(a===0n){res.push(b);let aa=0n,bb=0;const slots=[];for(let l=0;l<85;l++)if(w&(1n<<BigInt(l))){aa^=rows[l].a;bb^=rows[l].b;slots.push(l+43)}
       assert(aa===0n&&bb===b,"certificate replay");
       const d=(b&255)^(b>>>8);if(d)directXorFails++;if(d&1)directParityFails++;
       certs.push({slots,residual:b});
     }
   }
   const rb=basis(res,16),kernel=[];for(let x=0;x<65536;x++)if(rb.every(y=>!parity(x&y)))kernel.push(x);
   const leftRank=basis(kernel.map(x=>x&255),8).length,rightRank=basis(kernel.map(x=>x>>>8),8).length;
   assert(kernel.length===2**(16-rb.length),"kernel dimension");
   return {nuisanceRank:piv.size,residualRank:rb.length,kernelDimension:16-rb.length,leftRank,rightRank,directXorFails,directParityFails,certs,kernel};
 }
 let seed=191127;
 function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 function matrix(){let m;do{m=Array.from({length:8},()=>rng()&255)}while(basis(m,8).length!==8);return m}
 const apply=(m,x)=>m.reduce((a,v,i)=>a|(parity(v&x)<<i),0);
 const out=[];
 for(const radix of [59,60]){
   const alph=radix===59?grid.alphabet.replace("f",""):grid.alphabet;
   const values=tokens.map(s=>alph.indexOf(s[0])*radix+alph.indexOf(s[1]));assert(values.every(x=>x>=0&&x<256),"byte alphabet");
   for(const reflect of [false,true])for(const plain56 of [true,false]){
     const p=plain56?P:C;
     const original=analyze(p,Q,values,reflect);
     assert(original.residualRank===16&&original.kernel.length===1&&original.directParityFails>0,"original decision");
     const L=matrix(),R=matrix(),LI=Array(256),RI=Array(256);for(let x=0;x<256;x++){LI[apply(L,x)]=x;RI[apply(R,x)]=x}
     function labels(){const a=Array.from({length:256},(_,i)=>i);for(let i=255;i>0;i--){const j=rng()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a.slice(0,29)}
     const X=labels(),Y=labels(),a=Array.from({length:8},()=>rng()&255),b=Array.from({length:16},()=>rng()&255),plant=Array.from({length:256},()=>rng()&255);
     for(let i=0;i<85;i++){const t=i+43,z=reflect?t^7:t,k=rng()&255;plant[t]=LI[X[p[i]]^k^a[t%8]^b[t>>3]];plant[128+z]=RI[Y[Q[i+10]]^k]}
     const control=analyze(p,Q,plant,reflect);
     const trueRows=L.map((x,i)=>x|(R[i]<<8));assert(trueRows.every(x=>control.kernel.includes(x)),"all true inverse rows present");assert(control.leftRank===8&&control.rightRank===8,"both planted matrices possible");
     const combinations=Array.from({length:256},(_,mask)=>trueRows.reduce((v,x,i)=>v^((mask&(1<<i))?x:0),0));
     assert(control.kernelDimension===8&&combinations.every(x=>control.kernel.includes(x)),"unique relative mixer up to common output basis");
     out.push({radix,reflect,plain56,original,control:{nuisanceRank:control.nuisanceRank,residualRank:control.residualRank,kernelDimension:control.kernelDimension,leftRank:control.leftRank,rightRank:control.rightRank,trueRowsRecovered:trueRows.filter(x=>control.kernel.includes(x)).length,relativeMixerRowSpaceRecovered:true}});
   }
 }
 return {knownPairs:85,seed:191127,results:out};
}
if(require.main===module){const read=f=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",f),"utf8"));console.log(JSON.stringify(experiment(read("resources/liber-primus/lp2-corpus.json"),read("resources/liber-primus/lp2-grid-256.json")),null,2));}
module.exports={experiment};
