'use strict';
const fs=require('node:fs');
const path=require('node:path');
function experiment(source,transcription,which="all") {
  /** @param {boolean} condition @param {string} message */
  function check(condition,message){if(!condition)throw Error(message);}
  const R=source.runes, idx=new Map(R.map((r,i)=>[r,i])), mod=n=>(n%29+29)%29;
  const primes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
  const wordRE=new RegExp("["+R.join("")+"]+","gu");
  const words=source.sections.map(s=>(s.source_text.match(wordRE)||[]).map(w=>[...w].map(r=>idx.get(r))));
  let off=0,fixes=0;
  words[3]=words[3].map(w=>{const o=off;off+=w.length;if(o===140||o===277){check(w.join(",")==="7,8,24,16","WHO correction mismatch");fixes++;return [7,8,3];}return w;});
  check(fixes===2,"source corrections");
  const plains=words.map(w=>w.flat()), tape=[...transcription].filter(r=>idx.has(r)).map(r=>idx.get(r));
  check(tape.length===13136&&plains.slice(0,7).flat().length===2797,"source lengths");
  function phi(n){let m=n,out=n;for(let p=2;p*p<=m;p++){if(m%p===0){out-=out/p;while(m%p===0)m/=p;}}if(m>1)out-=out/m;return out;}
  function keys(exclude=-1){const sums=words.slice(0,7).flatMap((w,i)=>i===exclude?[]:w).map(w=>w.reduce((s,r)=>s+primes[r],0));return {sum:sums.map(mod),phi:sums.map(n=>mod(phi(n)))};}
  const train=[0,2,3,4,6].map(i=>plains[i]);
  const U=new Float64Array(29).fill(.5),B=new Float64Array(29*29),T=new Float64Array(29*29*29),BD=new Float64Array(29),TD=new Float64Array(29*29);
  for(const a of train){for(let i=0;i<a.length;i++){U[a[i]]++;if(i>0){B[a[i-1]*29+a[i]]++;BD[a[i-1]]++;}if(i>1){T[(a[i-2]*29+a[i-1])*29+a[i]]++;TD[a[i-2]*29+a[i-1]]++;}}}
  const un=U.reduce((a,b)=>a+b,0),sc=new Float64Array(30*30*29);
  for(let a=0;a<30;a++)for(let b=0;b<30;b++)for(let p=0;p<29;p++){let v=U[p]/un;if(b<29)v=(B[b*29+p]+6*v)/(BD[b]+6);if(a<29&&b<29)v=(T[(a*29+b)*29+p]+6*v)/(TD[a*29+b]+6);sc[(a*30+b)*29+p]=Math.log(v);}
  /** @param {number[]} P @param {number[]} K @param {number} origin @param {number} sign @param {boolean} hold */
  function encrypt(P,K,origin,sign,hold){let j=origin;return P.map(p=>{if(hold&&p===0)return 0;const c=mod(p+sign*K[j]);j=(j+1)%K.length;return c;});}
  /** Exact finite-state Viterbi on (cyclic phase, two plaintext context runes). */
  function decode(C,K,sign,hold,start=null){
    const M=K.length;let states=new Map();
    if(start===null){for(let j=0;j<M;j++)states.set(j*900+899,{j,a:29,b:29,s:0,o:j,prev:null,p:-1});}
    else states.set(start.j*900+start.a*30+start.b,{j:start.j,a:start.a,b:start.b,s:0,o:start.o,prev:null,p:-1});
    let consumed=0;
    for(const c of C){const next=new Map();
      for(const z of states.values()){
        function add(p,j){const a=z.b,b=p,s=z.s+sc[(z.a*30+z.b)*29+p],id=j*900+a*30+b,q=next.get(id);if(!q||s>q.s)next.set(id,{j,a,b,s,o:z.o,prev:z,p});}
        if(hold&&c===0)add(0,z.j);
        const p=mod(c-sign*K[z.j]);if(!hold||p!==0)add(p,(z.j+1)%M);
      }
      if(!next.size)return {dead:consumed};
      states=next;consumed++;
    }
    let best=null;for(const z of states.values())if(best===null||z.s>best.s)best=z;
    const out=[];for(let z=best;z.prev!==null;z=z.prev)out.push(z.p);out.reverse();
    return {out,s:best.s,o:best.o,j:best.j,a:best.a,b:best.b,states:states.size};
  }
  function score(P){let a=29,b=29,s=0;for(const p of P){s+=sc[(a*30+b)*29+p];a=b;b=p;}return s/P.length;}
  function same(a,b){return a.length===b.length&&a.every((x,i)=>x===b[i]);}
  function match(a,b){return a.reduce((n,p,i)=>n+(p===b[i]),0);}
  function fit(C,ks,truth=null){const n=200;check(C.length===308,"fixed receiver length");const out=[];
    for(const [kind,K] of Object.entries(ks))for(const sign of [-1,1])for(const hold of [false,true]){
      const p=decode(C.slice(0,n),K,sign,hold);
      if(!p.out){out.push({kind,sign,hold,prefixDead:p.dead});continue;}
      check(same(encrypt(p.out,K,p.o,sign,hold),C.slice(0,n)),"prefix replay");
      const h=decode(C.slice(n),K,sign,hold,p);
      const row={kind,sign,hold,origin:p.o,phaseAtSplit:p.j,prefixScore:p.s/n,holdScore:h.out?h.s/(C.length-n):null,holdDead:h.dead??null,prefixExact:truth?match(p.out,truth.slice(0,n)):null,holdExact:truth&&h.out?match(h.out,truth.slice(n)):null,prefix:p.out,holdout:h.out??null};
      if(h.out)check(same(encrypt(p.out.concat(h.out),K,p.o,sign,hold),C),"full replay");
      out.push(row);
    }
    const best=out.filter(x=>x.prefixScore!==undefined).sort((a,b)=>b.prefixScore-a.prefixScore)[0];
    return {best,variants:out};
  }
  const starts=[0,729,1874,3603,5506,6527,7960,9640,12648], names=["p0–2","p3–7","p8–14","p15–22","p23–26","p27–32","p33–39","p40–53","p54–55"];
  const ks=keys();
  check(ks.sum.length===695,"word count");
  const controls=[];
  if(which!=="original"){
    const cases=[{section:1,offset:0,kind:"sum",sign:1,hold:true,origin:137},{section:1,offset:207,kind:"phi",sign:-1,hold:false,origin:311},{section:5,offset:0,kind:"phi",sign:1,hold:true,origin:89},{section:5,offset:11,kind:"sum",sign:-1,hold:false,origin:433}];
    for(const c of cases){const K=keys(c.section),P=plains[c.section].slice(c.offset,c.offset+308),cipher=encrypt(P,K[c.kind],c.origin,c.sign,c.hold);const result=fit(cipher,K,P);controls.push({type:"plant",...c,truthScore:score(P),...result});
      let seed=0x25adbeef^c.origin;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
      const wrong=K[c.kind].slice();for(let i=wrong.length-1;i>0;i--){const j=rand()%(i+1);[wrong[i],wrong[j]]=[wrong[j],wrong[i]];}
      const nullCipher=encrypt(P,wrong,c.origin,c.sign,c.hold);controls.push({type:"wrong-source",...c,truthScore:score(P),...fit(nullCipher,K,P)});
    }
  }
  const originals=which==="controls"?[]:starts.map((start,i)=>({chapter:names[i],start,...fit(tape.slice(start,start+308),ks)}));
  let primeList=[];for(let p=2;primeList.length<85;p++){let isPrime=true;for(let d=2;d*d<=p;d++)if(p%d===0){isPrime=false;break;}if(isPrime)primeList.push(p-1);}
  check(same(encrypt(plains[7],primeList.map(mod),0,1,true),tape.slice(12956,13041)),"p56 authentic replay");
  return {keyLength:ks.sum.length,correctedSourceLength:2797,trainLength:train.flat().length,sourceScores:plains.map(score),p56Replay:85,controls,originals};
}
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const result=experiment(JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/liber-primus/lp2-transcription.txt"),process.argv[2]||'all');
console.log(JSON.stringify(result,null,2));
