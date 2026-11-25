/** Exact all-key F-hold reachability for plaintext-feedback FIR order3 zero-state
 * and order2 arbitrary-state; physical LP2 p16–21.
 * Run node sims/lp2_plaintext_fir_fhold_exact_sft.cjs.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..','resources','liber-primus');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'lp2-corpus.json'),'utf8'));
const tape=corpus.pages.filter(p=>p.page>=16&&p.page<=21).flatMap(p=>p.indices);
assert.equal(tape.length,1613);
const mod=x=>((x%29)+29)%29;
const inv=a=>Array.from({length:29},(_,x)=>x).find(x=>a*x%29===1);
/** @param {number[]} cipher @param {2|3} order */
function exact(cipher,order){
  const N=29**order,p1=new Uint8Array(N),p2=new Uint8Array(N),p3=new Uint8Array(N);
  for(let s=0;s<N;s++){p1[s]=s%29;p2[s]=Math.floor(s/29)%29;p3[s]=Math.floor(s/841)}
  const seen=new Uint32Array(N),hist=new Uint32Array(cipher.length+1),survivors=[];
  let stamp=0,ar=new Int32Array(N),br=new Int32Array(N),maxStates=0,visited=0,transitions=0;
  for(let b=0;b<29;b++)for(let d=0;d<29;d++)for(let e=0;e<(order===3?29:1);e++){
    const f=new Uint8Array(N);
    for(let s=0;s<N;s++)f[s]=(b*p1[s]+d*p2[s]+e*p3[s])%29;
    for(let k=0;k<29;k++){
      let count=order===3?1:N;
      for(let s=0;s<count;s++)ar[s]=s;
      let i=0;
      for(;i<cipher.length;i++){
        const C=cipher[i];stamp++;let next=0;const bias=C+k;
        for(let j=0;j<count;j++){
          const s=ar[j];visited++;
          if(C===0&&seen[s]!==stamp){seen[s]=stamp;br[next++]=s}
          const x=(bias+f[s])%29;
          if(x!==0){
            const t=x+29*p1[s]+(order===3?841*p2[s]:0);
            if(seen[t]!==stamp){seen[t]=stamp;br[next++]=t}
          }
        }
        transitions++;
        if(next===0)break;
        count=next;const swap=ar;ar=br;br=swap;
        if(count>maxStates)maxStates=count;
      }
      hist[i]++;
      if(i===cipher.length)survivors.push({key:order===3?[b,d,e,k]:[b,d,k],states:count,example:ar[0]});
    }
  }
  const checkpoints=[0,20,40,80,160,320,600,800,1000,1200,1400,1600,1613].map(x=>[x,hist.slice(x).reduce((a,b)=>a+b,0)]);
  return {order,total:29**(order+1),initialStatesPerKey:order===3?1:N,checkpoints,survivors,maxStates,visited,transitions};
}
function step(s,coeff,C,k){
  const x=mod(C+k+s.reduce((n,v,i)=>n+v*coeff[i],0));
  return x===0?null:[x,...s.slice(0,-1)];
}
function encode(p,coeff,initial,k,a){
  let s=initial.slice(),cipher=[],holds=0,ordinaryZeros=0;
  for(const v of p){
    if(v===0){cipher.push(0);holds++;continue}
    const x=v*inv(a)%29,C=mod(x-k-s.reduce((n,w,i)=>n+w*coeff[i],0));
    if(C===0)ordinaryZeros++;
    cipher.push(C);s=[x,...s.slice(0,-1)];
  }
  return {cipher,final:s,holds,ordinaryZeros};
}
function reach(cipher,coeff,initial,k){
  let states=new Map(initial.map(s=>[s.join(','),s]));
  for(const C of cipher){
    const next=new Map();
    for(const [id,s] of states){
      if(C===0)next.set(id,s);
      const t=step(s,coeff,C,k);if(t)next.set(t.join(','),t);
    }
    states=next;if(!states.size)break;
  }
  return states;
}
const ref=fs.readFileSync(path.join(root,'lp1-plaintext-reference.txt'),'utf8').split('\n').filter(l=>!l.startsWith('#')&&!l.startsWith('[')&&/^[A-Z]/.test(l)).join(' ').replace(/K/g,'C').replace(/Q/g,'CW').replace(/V/g,'U').replace(/Z/g,'S');
const labels=corpus.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length),plain=[];
for(let i=0;i<ref.length;){const m=labels.find(([s])=>ref.startsWith(s,i));if(m){plain.push(m[1]);i+=m[0].length;}else i++}
const controls=[
  {order:3,coeff:[5,11,7],initial:[0,0,0],k:13,a:17,p:plain.slice(0,800)},
  {order:2,coeff:[12,18],initial:[3,19],k:7,a:11,p:plain.slice(800,1600)}
].map(o=>{
  const q=encode(o.p,o.coeff,o.initial,o.k,o.a);
  const initials=o.order===3?[o.initial]:Array.from({length:841},(_,i)=>[i%29,Math.floor(i/29)]);
  const final=reach(q.cipher,o.coeff,initials,o.k);
  assert(final.has(q.final.join(',')));
  return {order:o.order,key:o.coeff,initial:o.initial,bias:o.k,scale:o.a,length:o.p.length,holds:q.holds,generatedZeros:q.ordinaryZeros,final:q.final,reachable:true,states:final.size};
});
let bruteAgreements=0;
for(let j=0;j<64;j++){
  const coeff=[(j*7+3)%29,(j*13+5)%29,(j*17+1)%29],init=[j%29,(j*3)%29,(j*5)%29],k=(j*19)%29;
  const cipher=Array.from({length:12},(_,i)=>i%3===0?0:(j*11+i*7)%29),brute=new Set();
  function dfs(i,s){
    if(i===cipher.length){brute.add(s.join(','));return}
    if(cipher[i]===0)dfs(i+1,s);
    const t=step(s,coeff,cipher[i],k);if(t)dfs(i+1,t);
  }
  dfs(0,init);const d=reach(cipher,coeff,[init],k);
  assert.equal(d.size,brute.size);assert([...brute].every(x=>d.has(x)));bruteAgreements++;
}
const result3=exact(tape,3),result2=exact(tape,2);
assert.deepEqual(result3.survivors.map(x=>x.key),[[0,0,0,0]]);
assert.deepEqual(result2.survivors.map(x=>x.key),[[0,0,0]]);
const f=new Uint32Array(29);for(const v of tape)f[v]++;
const trivialSurvivorIoc=f.reduce((s,n)=>s+n*(n-1),0)/(tape.length*(tape.length-1));
console.log(JSON.stringify({n:tape.length,zeros:tape.filter(x=>x===0).length,result3,result2,controls,bruteAgreements,trivialSurvivorIoc},null,2));