'use strict';
// Read-only source-specific p55 perimeter/prime composition SFT.
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function experiment(gp,grid,reference) {
  const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const requireTrue=(x,m)=>{if(!x)throw Error(m);};
  const mod=x=>(x%29+29)%29;
  const page=i=>gp.pages.find(x=>x.page===i).indices;
  const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  function encode(s){return s.split(" ").flatMap(w=>{const out=[];for(let i=0;i<w.length;){const t=tokens.find(t=>w.startsWith(t.s,i));requireTrue(t,"unknown token "+w);out.push(t.i);i+=t.s.length;}return out;});}
  const primes=[];for(let n=2;primes.length<100;n++){let ok=true;for(let d=2;d*d<=n;d++)if(n%d===0){ok=false;break;}if(ok)primes.push(n-1);}
  const phi=p=>{let k=0;return p.map(x=>x===0?0:mod(x+primes[k++]));};
  function unphi(c){let states=[{p:[],k:0}];for(const x of c){const next=[];for(const s of states){if(x===0)next.push({p:s.p.concat(0),k:s.k});const y=mod(x-primes[s.k]);if(y!==0)next.push({p:s.p.concat(y),k:s.k+1});}states=next;if(!states.length)break;}return states.map(s=>s.p);}
  const p56=encode("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
  requireTrue(eq(phi(p56),page(56)),"p56 exact native control");
  const p57=page(57), original=page(55);
  const ring=[];for(let c=0;c<8;c++)ring.push(c);for(let r=1;r<32;r++)ring.push(r*8+7);for(let c=6;c>=0;c--)ring.push(31*8+c);for(let r=30;r>=1;r--)ring.push(r*8);
  requireTrue(ring.length===76&&new Set(ring).size===76&&original.length===76,"perimeter");
  const values=ring.map(i=>grid.bytes[i]);
  const alphabet=grid.alphabet, alt=alphabet.replace("f","");
  const gridTokens=grid.pages.flatMap(p=>p.tokens);
  const base59=ring.map(i=>59*alt.indexOf(gridTokens[i][0])+alt.indexOf(gridTokens[i][1]));
  const inv=p=>{const q=[];p.forEach((x,i)=>q[x]=i);return q;};
  const apply=(x,p)=>p.map(i=>x[i]);
  function permutations(v){const out=[];for(const ccw of [false,true])for(const descending of [false,true]){
    const walk=ccw?[0,...Array.from({length:75},(_,i)=>75-i)]:Array.from({length:76},(_,i)=>i);
    const p=walk.map(i=>v[i]).map((_,i)=>i).sort((i,j)=>(descending?-1:1)*(v[walk[i]]-v[walk[j]])||i-j);
    for(const inverse of [false,true])out.push({label:`${ccw?"CCW":"CW"}/${descending?"desc":"asc"}/${inverse?"inverse":"direct"}`,perm:inverse?inv(p):p});
  }return out;}
  requireTrue(eq(permutations(values),permutations(base59)),"radix order invariance");
  const roman=p=>p.map(i=>gp.translit[i]).join("");
  const train=reference.split(/^### 56\s*$/m)[0].split(/\r?\n/).filter(x=>!/^#|^\[/.test(x)).join("").toUpperCase().replace(/[^A-Z]/g,"");
  const counts=new Map();for(let i=0;i+2<train.length;i++){const x=train.slice(i,i+3);counts.set(x,(counts.get(x)||0)+1);}
  const denom=train.length-2+0.5*26**3;
  function score(p){const s=roman(p);let z=0;for(let i=0;i+2<s.length;i++)z+=Math.log(((counts.get(s.slice(i,i+3))||0)+.5)/denom);return z/(s.length-2);}
  function cases(v,c,detail=false){const out=[];let paths=0;for(const {label,perm} of permutations(v))for(const order of ["unrank-then-unphi","unphi-then-unrank"]){
    const pp=inv(perm);
    const candidates=order==="unrank-then-unphi"?unphi(apply(c,perm)):unphi(c).map(x=>apply(x,perm));
    paths+=candidates.length;
    for(const p of candidates){if(detail)requireTrue(eq(order==="unrank-then-unphi"?apply(phi(p),pp):phi(apply(p,pp)),c),"original exact replay");out.push({label,order,score:score(p),...(detail?{text:roman(p),p}: {})});}
  }return {paths,best:out.reduce((a,b)=>!a||b.score>a.score?b:a,null),candidates:detail?out.sort((a,b)=>b.score-a.score):undefined};}
  let checks=0,unique=0;
  const donor=[p56.slice(0,76),p57.slice(0,76),p57.slice(-76)];
  for(const p of donor)for(const {perm} of permutations(values))for(const order of ["unrank-then-unphi","unphi-then-unrank"]){
    const pp=inv(perm),c=order==="unrank-then-unphi"?apply(phi(p),pp):phi(apply(p,pp));
    const recovered=order==="unrank-then-unphi"?unphi(apply(c,perm)):unphi(c).map(x=>apply(x,perm));
    requireTrue(recovered.some(x=>eq(x,p)),"native plant recovery");checks++;if(recovered.length===1)unique++;
  }
  const observed=cases(values,original,true);
  let state=0x330176;function rnd(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;}
  const nullscores=[];let exceed=0,feasible=0;for(let trial=0;trial<2000;trial++){const v=values.slice();for(let i=v.length-1;i>0;i--){const j=rnd()%(i+1);[v[i],v[j]]=[v[j],v[i]];}const x=cases(v,original);if(x.best){feasible++;nullscores.push(x.best.score);if(!observed.best||x.best.score>=observed.best.score)exceed++;}}
  nullscores.sort((a,b)=>a-b);
  return {nativeP56:p56.length,ringUniqueValues:new Set(values).size,controlChecks:checks,uniqueControlPaths:unique,donorScores:donor.map(score),originalPaths:observed.paths,originalBest:observed.best,originalTop:observed.candidates.slice(0,8).map(({p,...x})=>x),nullTrials:2000,nullFeasible:feasible,nullExceed:exceed,pFamily:(exceed+1)/2001,nullMedian:nullscores[Math.floor(nullscores.length/2)],null95:nullscores[Math.floor(.95*nullscores.length)]};
}
const result=experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("resources/liber-primus/lp2-grid-256.json")),read("resources/liber-primus/lp1-plaintext-reference.txt"));
console.log(JSON.stringify(result,null,2));
