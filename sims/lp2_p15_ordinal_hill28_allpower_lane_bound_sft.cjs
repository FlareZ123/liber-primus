// Agent3: all exponent origins/strides of p15 ordinal matrix over Z/28Z.
const fs=require('node:fs');
function powerExperiment(corpus,texts){
 const mod=(a,n)=>((a%n)+n)%n, A=[[14,22,7,0],[9,1,2,6],[6,4,3,5],[8,23,14,10]],T=m=>m[0].map((_,i)=>m.map(r=>r[i])),mat=(m,v)=>m.map(r=>mod(r.reduce((s,x,i)=>s+x*v[i],0),28));
 const I=Array.from({length:4},(_,i)=>Array.from({length:4},(_,j)=>+(i===j))),mul=(a,b)=>a.map(r=>T(b).map(col=>mod(r.reduce((s,x,i)=>s+x*col[i],0),28)));
 let powers=[I];for(let i=1;i<=336;i++){let v=mul(powers[i-1],A);if(JSON.stringify(v)===JSON.stringify(I)){if(i!==336)throw Error("order");break}powers.push(v)}
 if(powers.length!==336)throw Error("order");
 let pow=[1];for(let i=1;i<28;i++)pow.push(pow[i-1]*15%29);let log=Array(29);pow.forEach((v,i)=>log[v]=i);
 function gp(s){const map=new Map(corpus.translit.map((x,i)=>[x,i])),out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/ING/g,"NG").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");while(w.length){const d=w.slice(0,2);if(d.length===2&&map.has(d)){out.push(map.get(d));w=w.slice(2)}else{if(map.has(w[0]))out.push(map.get(w[0]));w=w.slice(1)}}}return out}
 const sort=a=>a.slice().sort((a,b)=>b-a),prefix=a=>{let n=0;return a.map(x=>n+=x)},sum=a=>a.reduce((s,x)=>s+x,0);
 const hist=p=>{let h=Array(29).fill(0);p.forEach(x=>h[x]++);return h};
 const references=(models,n)=>{let out=[];for(const [source,s] of models.entries())for(let start=0;start+n<=s.length;start+=Math.floor(n/4)){let h=hist(s.slice(start,start+n));out.push({source,start,h,pr:prefix(sort(h))})}return out};
 function scan(c,refs){
  let minTop=Math.min(...refs.map(x=>x.pr[0])),results=[];
  for(const t of ["cyclic","log"])for(const transpose of [false,true]){
   const matrices=transpose?powers.map(T):powers;let r=[],esc=0;for(let i=1;i<c.length;i++){let d=mod(c[i]-c[i-1],29);if(d)r.push(t==="log"?log[d]:d-1);else esc++}
   const blocks=r.length>>>2,tab=new Uint32Array(blocks*336);
   for(let j=0;j<blocks;j++){const v=r.slice(j*4,j*4+4);for(let e=0;e<336;e++){let z=mat(matrices[e],v);tab[j*336+e]=z[0]|(z[1]<<5)|(z[2]<<10)|(z[3]<<15)}}
   let h=new Uint16Array(112),topMax=0,topPass=0,fullPass=0,maxWitness=null,compatible=[],minDeficit=Infinity;
   for(let origin=0;origin<336;origin++)for(let stride=0;stride<336;stride++){
    h.fill(0);let e=origin,m0=0,m1=0,m2=0,m3=0;
    for(let j=0;j<blocks;j++){let v=tab[j*336+e],a=++h[v&31],b=++h[28+((v>>>5)&31)],d=++h[56+((v>>>10)&31)],f=++h[84+((v>>>15)&31)];if(a>m0)m0=a;if(b>m1)m1=b;if(d>m2)m2=d;if(f>m3)m3=f;e+=stride;if(e>=336)e-=336}
    for(let j=blocks*4;j<r.length;j++){let l=j%4,z=++h[l*28+r[j]];if(l===0)m0=Math.max(m0,z);if(l===1)m1=Math.max(m1,z);if(l===2)m2=Math.max(m2,z);if(l===3)m3=Math.max(m3,z)}
    const max=Math.max(esc,m0+m1+m2+m3);
    if(max>topMax){topMax=max;maxWitness={origin,stride}}
    if(max<minTop){minDeficit=Math.min(minDeficit,minTop-max);continue}
    topPass++;
    const lane=Array.from({length:4},(_,l)=>sort(Array.from(h.slice(l*28,l*28+28)))),upper=prefix(sort([...Array.from({length:28},(_,i)=>sum(lane.map(x=>x[i]))),esc]));
    let ok=false;
    for(const ref of refs){let d=Math.max(...ref.pr.map((v,i)=>v-upper[i]));minDeficit=Math.min(minDeficit,d);if(d<=0&&ref.h.includes(esc)){ok=true;if(compatible.length<100)compatible.push({origin,stride,source:ref.source,start:ref.start})}}
    if(ok)fullPass++;
   }
   results.push({t,transpose,blocks,esc,keys:336*336,topMax,maxWitness,minTop,topPass,fullPass,minDeficitLower:minDeficit,compatible});
  }
  return results;
 }
 const models=texts.map(gp),c=corpus.pages.filter(p=>p.page>=16&&p.page<=22).flatMap(p=>p.indices),p=models[1].slice(300,300+c.length-1);
 const params={origin:123,stride:77,transpose:true,t:"log",escape:28},r=p.filter(x=>x!==params.escape);
 // Distinct nonlinear lane permutation, fixed across blocks.
 let seed=0x12345678;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed};
 const perms=Array.from({length:4},()=>{let a=Array.from({length:28},(_,i)=>i);for(let i=27;i>0;i--){let j=rand()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a});
 const keyed=r.map((x,i)=>perms[i%4][x]);let mixed=[];
 for(let j=0;j<keyed.length;j+=4){let v=keyed.slice(j,j+4);mixed.push(...(v.length===4?mat(T(powers[mod(-params.origin-params.stride*(j/4),336)]),v):v))}
 let cc=[7],i=0;for(const x of p)cc.push(mod(cc[cc.length-1]+(x===params.escape?0:pow[mixed[i++]]),29));
 const ref=hist(p),control=scan(cc,[{source:1,start:300,h:ref,pr:prefix(sort(ref))}]);
 const actual=control.find(x=>x.t===params.t&&x.transpose===params.transpose);
 if(!actual.compatible.some(x=>x.origin===params.origin&&x.stride===params.stride))throw Error("planted key absent or listing cap");
 const refs=references(models,c.length-1),original=scan(c,refs);
 return {order:336,sourceLength:c.length,referenceWindows:refs.length,control:{params,perms,scan:control},original};
}
const names=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];const read=p=>fs.readFileSync(p,'utf8');const lines=s=>s.split(/\r?\n/).slice(149,450).join('\n');console.log(JSON.stringify(powerExperiment(JSON.parse(read(names[0])),names.slice(1).map(p=>lines(read(p)))),null,2));
