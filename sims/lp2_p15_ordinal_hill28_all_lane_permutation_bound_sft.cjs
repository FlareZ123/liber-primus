// Agent3: exact arbitrary per-lane permutation concentration envelope.
const fs=require('node:fs');
function boundExperiment(corpus,texts){
 const mod=(a,n)=>((a%n)+n)%n;
 const A=[[14,22,7,0],[9,1,2,6],[6,4,3,5],[8,23,14,10]],B=[[12,1,4,17],[8,0,14,7],[19,18,0,20],[7,16,1,18]],T=m=>m[0].map((_,i)=>m.map(r=>r[i])),mat=(m,v)=>m.map(r=>mod(r.reduce((s,x,i)=>s+x*v[i],0),28));
 let pow=[1];for(let i=1;i<28;i++)pow.push(pow[i-1]*15%29);let log=Array(29);pow.forEach((v,i)=>log[v]=i);
 function gp(s){const map=new Map(corpus.translit.map((x,i)=>[x,i])),out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/ING/g,"NG").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");while(w.length){const d=w.slice(0,2);if(d.length===2&&map.has(d)){out.push(map.get(d));w=w.slice(2)}else{if(map.has(w[0]))out.push(map.get(w[0]));w=w.slice(1)}}}return out}
 const models=texts.map(gp),pages=corpus.pages.filter(p=>p.page>=16&&p.page<=22).map(p=>p.indices);
 const sum=a=>a.reduce((x,y)=>x+y,0),sort=a=>a.slice().sort((a,b)=>b-a),prefix=a=>{let n=0;return a.map(v=>n+=v)};
 function lanes(frames,m,t,priv=false){
  const groups=[],pooled=Array.from({length:4},()=>Array(28).fill(0));let esc=0,total=0;
  for(const c of frames){let r=[],counts=priv?Array.from({length:4},()=>Array(28).fill(0)):pooled;for(let i=1;i<c.length;i++){const d=mod(c[i]-c[i-1],29);total++;if(!d)esc++;else r.push(t==="cyclic"?d-1:log[d])}
   for(let j=0;j<r.length;j+=4){let v=r.slice(j,j+4);if(v.length===4)v=mat(m,v);v.forEach((x,l)=>counts[l][x]++)}
   if(priv)groups.push(...counts);
  }
  if(!priv)groups.push(...pooled);
  const sorted=groups.map(sort),envelope=sort([...Array.from({length:28},(_,i)=>sum(sorted.map(r=>r[i]))),esc]);
  if(sum(envelope)!==total)throw Error("lost symbols");return {esc,total,envelope,upper:prefix(envelope)};
 }
 const hist=p=>{let h=Array(29).fill(0);p.forEach(x=>h[x]++);return h};
 function compare(env,p){let h=hist(p),pr=prefix(sort(h)),deficits=pr.map((v,i)=>v-env.upper[i]);return {maxDeficit:Math.max(...deficits),top1:pr[0],at:1+deficits.indexOf(Math.max(...deficits)),escapeEligible:h.filter(x=>x===env.esc).length}}
 const out=[];
 for(const [frame,frames,priv] of [["chapter",[pages.flat()],false],["page-shared",pages,false],["page-private",pages,true]])for(const [name,m] of [["B",B],["BT",T(B)],["A",A],["AT",T(A)]])for(const t of ["cyclic","log"]){
  const env=lanes(frames,m,t,priv),windows=[];for(let j=0;j<models.length;j++)for(let s=0;s+env.total<=models[j].length;s+=Math.floor(env.total/4))windows.push({...compare(env,models[j].slice(s,s+env.total)),source:j,offset:s});
  out.push({frame,matrix:name,transport:t,total:env.total,esc:env.esc,upper:env.upper,windows:windows.length,minMaxDeficit:Math.min(...windows.map(x=>x.maxDeficit)),maxMaxDeficit:Math.max(...windows.map(x=>x.maxDeficit)),minNativeTop1:Math.min(...windows.map(x=>x.top1)),passes:windows.filter(x=>x.maxDeficit<=0&&x.escapeEligible>0).length,majorizationPasses:windows.filter(x=>x.maxDeficit<=0).length});
 }
 let seed=0x12345678;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed};
 const perms=Array.from({length:4},()=>{let a=Array.from({length:28},(_,i)=>i);for(let i=27;i>0;i--){let j=rand()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a});
 const e=28,p=models[1].slice(300,2043),r=p.filter(x=>x!==e).map((x,i)=>perms[i%4][x]);let mixed=[];for(let j=0;j<r.length;j+=4){let v=r.slice(j,j+4);mixed.push(...(v.length===4?mat(A,v):v))}
 let c=[7],j=0;for(const x of p)c.push(mod(c[c.length-1]+(x===e?0:mixed[j++]+1),29));const env=lanes([c],B,"cyclic"),control=compare(env,p);
 if(control.maxDeficit>0||control.escapeEligible===0)throw Error("control fails");return {out,control:{...control,total:env.total,esc:env.esc,top1Upper:env.upper[0],perms}};
}
const names=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
const read=p=>fs.readFileSync(p,'utf8');const lines=s=>s.split(/\r?\n/).slice(149,450).join('\n');
console.log(JSON.stringify(boundExperiment(JSON.parse(read(names[0])),names.slice(1).map(p=>lines(read(p)))),null,2));
