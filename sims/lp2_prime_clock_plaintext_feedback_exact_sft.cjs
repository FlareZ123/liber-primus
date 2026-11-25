/** Exact p56 prime-minus-one + plaintext FIR composition; all secret coefficients.
 * Run: node sims/lp2_prime_clock_plaintext_feedback_exact_sft.cjs.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..','resources','liber-primus');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'lp2-corpus.json'),'utf8'));
const tape=corpus.pages.filter(p=>p.page>=16&&p.page<=21).flatMap(p=>p.indices);
assert.equal(tape.length,1613);
const primes=[];
for(let n=2;primes.length<2000;n++){
  let ok=true;for(const p of primes){if(p*p>n)break;if(n%p===0){ok=false;break}}
  if(ok)primes.push(n);
}
const pm=Uint8Array.from(primes,x=>(x-1)%29);
const mod=x=>((x%29)+29)%29;
const inv=a=>Array.from({length:29},(_,x)=>x).find(x=>a*x%29===1);
/** @param {number[]} cipher @param {1|2} order */
function exact(cipher,order){
  const M=29**order,Z=cipher.filter(v=>v===0).length,N=M*(Z+1);
  const h=new Uint8Array(N),s1=new Uint8Array(N),s2=new Uint8Array(N),ss=new Uint16Array(N);
  for(let s=0;s<N;s++){h[s]=Math.floor(s/M);ss[s]=s%M;s1[s]=s%29;s2[s]=Math.floor(s/29)%29}
  const seen=new Uint32Array(N),hist=new Uint32Array(cipher.length+1),survivors=[];
  let stamp=0,ar=new Int32Array(N),br=new Int32Array(N),maxStates=0,visited=0,transitions=0;
  for(let b=0;b<29;b++)for(let d=0;d<(order===2?29:1);d++){
    const f=new Uint8Array(M);
    for(let s=0;s<M;s++)f[s]=(b*s1[s]+d*s2[s])%29;
    for(let m=1;m<29;m++){
      const pp=Uint8Array.from(pm,v=>m*v%29);
      for(let k=0;k<29;k++){
        let count=order===2?1:M;
        for(let s=0;s<count;s++)ar[s]=s;
        let i=0;
        for(;i<cipher.length;i++){
          const C=cipher[i];stamp++;let next=0;const bias=C+k;
          for(let j=0;j<count;j++){
            const s=ar[j];visited++;
            if(C===0){const t=s+M;if(seen[t]!==stamp){seen[t]=stamp;br[next++]=t}}
            const x=(bias+f[ss[s]]+pp[i-h[s]])%29;
            if(x!==0){
              const t=x+(order===2?29*s1[s]:0)+M*h[s];
              if(seen[t]!==stamp){seen[t]=stamp;br[next++]=t}
            }
          }
          transitions++;
          if(next===0)break;
          count=next;const swap=ar;ar=br;br=swap;
          if(count>maxStates)maxStates=count;
        }
        hist[i]++;
        if(i===cipher.length)survivors.push({key:order===2?[b,d,m,k]:[b,m,k],states:count,example:ar[0]});
      }
    }
  }
  const checkpoints=[0,20,40,80,160,320,600,800,1000,1200,1400,1600,1613].map(x=>[x,hist.slice(x).reduce((a,b)=>a+b,0)]);
  return {order,total:29**(order+1)*28,initialStatesPerKey:order===2?1:M,checkpoints,furthest:hist.findLastIndex(x=>x>0),survivors,maxStates,visited,transitions};
}
const labels=corpus.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
function gp(s){
  s=s.replace(/K/g,'C').replace(/Q/g,'CW').replace(/V/g,'U').replace(/Z/g,'S');
  const a=[];
  for(let i=0;i<s.length;){const m=labels.find(([x])=>s.startsWith(x,i));if(m){a.push(m[1]);i+=m[0].length;}else i++}
  return a;
}
const plain=gp(fs.readFileSync(path.join(root,'lp1-plaintext-reference.txt'),'utf8').split('\n').filter(l=>!l.startsWith('#')&&!l.startsWith('[')&&/^[A-Z]/.test(l)).join(' '));
function encode(p,coeff,seed,m,k,a){
  let s=seed.slice(),clock=0,cipher=[],holds=0,generatedZeros=0;
  for(const v of p){
    if(v===0){cipher.push(0);holds++;continue}
    const x=v*inv(a)%29,C=mod(x-k-m*pm[clock++]-s.reduce((n,w,i)=>n+w*coeff[i],0));
    if(C===0)generatedZeros++;
    cipher.push(C);s=[x,...s.slice(0,-1)];
  }
  return {cipher,clock,final:s,holds,generatedZeros};
}
function reach(cipher,coeff,initials,m,k){
  let states=new Map(initials.map(s=>['0,'+s.join(','),[0,...s]]));
  for(let i=0;i<cipher.length;i++){
    const C=cipher[i],next=new Map();
    for(const [,state] of states){
      const [h,...s]=state;
      if(C===0){const q=[h+1,...s];next.set(q.join(','),q)}
      const x=mod(C+k+m*pm[i-h]+s.reduce((n,v,j)=>n+v*coeff[j],0));
      if(x!==0){const q=[h,x,...s.slice(0,-1)];next.set(q.join(','),q)}
    }
    states=next;if(!states.size)break;
  }
  return states;
}
const p56=gp('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE');
const q56=encode(p56,[0,0],[0,0],28,0,1),orig=corpus.pages.find(p=>p.page===56).indices;
assert.deepEqual(q56.cipher,orig);
const control56={n:p56.length,consumed:q56.clock,holds:q56.holds,generatedZeros:q56.generatedZeros,exact:true,reachable:reach(orig,[0,0],[[0,0]],28,0).has([q56.holds,...q56.final].join(','))};
assert(control56.reachable);
const controls=[
  {coeff:[5,11],seed:[0,0],m:17,k:13,a:7,p:plain.slice(0,800)},
  {coeff:[12],seed:[19],m:9,k:7,a:11,p:plain.slice(800,1600)}
].map(o=>{
  const q=encode(o.p,o.coeff,o.seed,o.m,o.k,o.a);
  const starts=o.coeff.length===2?[o.seed]:Array.from({length:29},(_,i)=>[i]);
  const states=reach(q.cipher,o.coeff,starts,o.m,o.k);
  assert(states.has([q.holds,...q.final].join(',')));
  return {coeff:o.coeff,seed:o.seed,m:o.m,k:o.k,a:o.a,n:o.p.length,holds:q.holds,generatedZeros:q.generatedZeros,consumed:q.clock,final:q.final,reachable:true,states:states.size};
});
let bruteAgreements=0;
for(let j=0;j<64;j++){
  const coeff=[(j*7+3)%29,(j*13+5)%29],init=[j%29,(j*3)%29],k=(j*19)%29,m=j%28+1;
  const t=Array.from({length:12},(_,i)=>i%3===0?0:(j*11+i*7)%29),brute=new Set();
  function dfs(i,h,s){
    if(i===t.length){brute.add([h,...s].join(','));return}
    if(t[i]===0)dfs(i+1,h+1,s);
    const x=mod(t[i]+k+m*pm[i-h]+s.reduce((n,v,l)=>n+v*coeff[l],0));
    if(x!==0)dfs(i+1,h,[x,...s.slice(0,-1)]);
  }
  dfs(0,0,init);const a=reach(t,coeff,[init],m,k);
  assert.equal(a.size,brute.size);assert([...brute].every(x=>a.has(x)));bruteAgreements++;
}
const order2=exact(tape,2),order1=exact(tape,1);
assert.equal(order2.survivors.length,0);assert.equal(order1.survivors.length,0);
console.log(JSON.stringify({n:tape.length,zeros:tape.filter(x=>x===0).length,order2,order1,control56,controls,bruteAgreements},null,2));