'use strict';
const fs=require('node:fs'),path=require('node:path');
function study(raw){
 const Q=29,starts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956],c=JSON.parse(raw);
 const assert=(v,s)=>{if(!v)throw Error(s)};
 const pop=x=>{let n=0;while(x){x&=x-1;n++}return n};
 function setup(C,K,q){const zeros=[];for(let i=0;i<C.length;i++)if(C[i]===0)zeros.push(i);const bounds=[-1,...zeros,C.length],layers=[];
   for(let s=0;s<=zeros.length;s++){
     const begin=bounds[s]+1,end=bounds[s+1],masks=new Uint32Array((s+1)*q),nextKey=new Uint8Array(s+1);
     for(let h=0;h<=s;h++){for(let i=begin;i<end;i++)masks[h*q+C[i]]|=1<<K[(i-h)%K.length];if(s<zeros.length)nextKey[h]=K[(end-h)%K.length]}
     layers.push({masks,nextKey})
   }return {layers}
 }
 // All d,l pair support in parallel for fixed beta(c)=k. Each d has a
 // 29-bit mask of the ranks l permitting a path to this clock state.
 function pairSupport(S,c,k,q){const all=(1<<q)-1,bit=1<<k,n=S.layers.length,cur=new Uint32Array(n*q),next=new Uint32Array(n*q),out=new Uint32Array(q);let a=cur,b=next;
   for(let d=0;d<q;d++)a[d]=d===c?bit:all^bit;
   for(let s=0;s<n;s++){const {masks,nextKey}=S.layers[s];b.fill(0);
     for(let h=0;h<=s;h++){const off=h*q;if(!(a[off+c]&bit)||(masks[off+c]&bit))continue;
       if(s===n-1){for(let d=0;d<q;d++)out[d]|=a[off+d]&~masks[off+d];continue}
       const zbit=1<<nextKey[h],canConsume=c!==0||bit!==zbit;
       for(let d=0;d<q;d++){const v=a[off+d]&~masks[off+d];b[off+q+d]|=v;if(canConsume)b[off+d]|=d===0?v&~zbit:v}
     }
     [a,b]=[b,a]
   }
   return out
 }
 function direct(C,K,c,k,d,l){let holds=new Set([0]);for(let i=0;i<C.length;i++){const next=new Set,cc=C[i];for(const h of holds){const x=K[(i-h)%K.length];if(cc===0)next.add(h+1);if((cc!==c||x!==k)&&(cc!==d||x!==l))next.add(h)}holds=next;if(!holds.size)return false}return true}
 let rng=0x93301;function random(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0}
 let comparisons=0;
 for(let trial=0;trial<40;trial++){const q=4,C=Array.from({length:5+trial%12},()=>random()%q),K=Array.from({length:17},()=>random()%q),S=setup(C,K,q);
   for(let c=0;c<q;c++)for(let k=0;k<q;k++){const p=pairSupport(S,c,k,q);for(let d=0;d<q;d++)for(let l=0;l<q;l++){const expected=(c===d?k===l:k!==l)&&direct(C,K,c,k,d,l);assert(Boolean(p[d]&(1<<l))===expected,'small pair projection mismatch');comparisons++}}
 }
 const primes=[];for(let i=2;primes.length<3008;i++)if(primes.every(p=>p*p>i||i%p!==0))primes.push(i);const K=primes.map(p=>(p-1)%Q),tape=c.pages.slice(0,56).flatMap(p=>p.indices),rows=starts.slice(0,-1).map((x,i)=>tape.slice(x,starts[i+1])),S=rows.map(row=>setup(row,K,Q)).sort((a,b)=>b.layers.length-a.layers.length);
 const compat=new Uint32Array(Q*Q*Q),all=(1<<Q)-1,domains=new Uint32Array(Q).fill(all);
 let localPairs=0,unaryDead=0;
 for(let c=0;c<Q;c++)for(let k=0;k<Q;k++){const off=(c*Q+k)*Q,bit=1<<k;
   for(let d=0;d<Q;d++)compat[off+d]=d===c?bit:all^bit;
   for(const s of S){const support=pairSupport(s,c,k,Q);let dead=false;for(let d=0;d<Q;d++){compat[off+d]&=support[d];if(!compat[off+d])dead=true}if(dead){compat.fill(0,off,off+Q);domains[c]&=~bit;unaryDead++;break}}
 }
 // Arc consistency over exact pair projections; deleting a rank with no
 // support in another row is sound even if that pair's path differs.
 let iterations=0,changed=true;
 while(changed){changed=false;iterations++;for(let c=0;c<Q;c++){let values=domains[c];while(values){const k=31-Math.clz32(values&-values);values&=values-1;const off=(c*Q+k)*Q;for(let d=0;d<Q;d++)if(!(compat[off+d]&domains[d])){domains[c]&=~(1<<k);changed=true;break}}}}
 for(let c=0;c<Q;c++)for(let k=0;k<Q;k++)if(domains[c]&(1<<k))for(let d=c+1;d<Q;d++)localPairs+=pop(compat[(c*Q+k)*Q+d]&domains[d]);
 // Symmetry on live pairs: both directions must describe the same pair feasibility.
 let symmetryChecks=0;
 for(let c=0;c<Q;c++)for(let k=0;k<Q;k++)if(domains[c]&(1<<k))for(let d=c+1;d<Q;d++)for(let l=0;l<Q;l++)if(domains[d]&(1<<l)){
   assert(Boolean(compat[(c*Q+k)*Q+d]&(1<<l))===Boolean(compat[(d*Q+l)*Q+c]&(1<<k)),'pair projection symmetry');symmetryChecks++
 }
 const output={schedule:'p56 prime-minus-one, chapter reset zero, literal F hold',runes:tape.length,smallExactPairChecks:comparisons,unaryDead,arcIterations:iterations,domains:Array.from(domains),domainSizes:Array.from(domains,pop),compatibleLivePairs:localPairs,symmetryChecks,compat:Array.from(compat)};
 return output
}
if(require.main===module)console.log(JSON.stringify(study(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'))));
module.exports={study};
