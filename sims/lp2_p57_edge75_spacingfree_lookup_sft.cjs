"use strict";
/** Agent46: spacing-free shared additive lookup recovery, ordinary and plaintext-F bypass. Node.js 22, no dependencies. */
function experiment(inputs, restarts=48, steps=5000){
 const gp=JSON.parse(inputs[0]); const N=29,mod=x=>(x%N+N)%N, map=new Map(gp.translit.map((s,i)=>[s,i]));
 function encode(text){const words=text.toUpperCase().match(/[A-Z]+/g)||[],a=[];for(let w of words){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.slice(i,i+3)==="ING"){a.push(map.get("NG"));i+=3;continue;}const pair=w.slice(i,i+2);if(pair.length===2&&map.has(pair)){a.push(map.get(pair));i+=2;continue;}const x=map.get(w[i++]);if(x!==undefined)a.push(x);}}return a;}
 const train=inputs.slice(1,3).map(encode),cnt=Array.from({length:4},(_,i)=>new Uint32Array(N**(i+1)));
 let total=0;for(const doc of train){total+=doc.length;for(let i=0;i<doc.length;i++){let idx=0,m=1;for(let j=i;j>=0&&j>i-4;j--){idx+=doc[j]*m;m*=N;cnt[i-j][idx]++;}}}
 const lp=Array.from({length:4},(_,i)=>new Float64Array(N**(i+1)));for(let x=0;x<N;x++)lp[0][x]=Math.log((cnt[0][x]+1)/(total+N));
 for(let k=1;k<4;k++){const prior=[0,8,12,20][k],suf=N**k;for(let z=0;z<lp[k].length;z++)lp[k][z]=Math.log((cnt[k][z]+prior*Math.exp(lp[k-1][z%suf]))/(cnt[k-1][Math.floor(z/N)]+prior));}
 let rng=0x4626b9d3;function rnd(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;}const rand=()=>rnd()/4294967296,ri=n=>rnd()%n;
 const render=p=>p.map(x=>gp.translit[x]).join("");
 function score(p){let s=0;for(let i=0;i<p.length;i++){let j=Math.max(0,i-3),q=0;for(;j<=i;j++)q=q*N+p[j];s+=lp[Math.min(i,3)][q];}return s;}
 function attack(c,key,held=null,R=restarts){
  const keys=held===null?key:(()=>{let t=0;const set=new Set(held);return c.map((_,i)=>set.has(i)?-1:key[t++]);})();
  const vars=[...new Set(keys)].filter(x=>x>=0),occ=Array.from({length:N},()=>[]);keys.forEach((x,i)=>{if(x>=0)occ[x].push(i);});const affected=occ.map(a=>[...new Set(a.flatMap(i=>[i,i+1,i+2,i+3].filter(j=>j<c.length)))]);
  const allowed=occ.map(o=>Array.from({length:N},(_,i)=>i).filter(x=>held===null||!o.some(i=>c[i]===x)));
  if(vars.some(v=>allowed[v].length===0))return null;
  let best=-Infinity,bestK=null,hit=0;const elite=[];
  for(let r=0;r<R;r++){
   const k=Array.from({length:N},(_,v)=>allowed[v][ri(allowed[v].length)]),p=c.map((x,i)=>keys[i]<0?0:mod(x-k[keys[i]]));
   function factor(i){let q=0;for(let j=Math.max(0,i-3);j<=i;j++)q=q*N+p[j];return lp[Math.min(i,3)][q];}
   function local(v){let s=0;for(const j of affected[v])s+=factor(j);return s;}
   function set(v,x){k[v]=x;for(const i of occ[v])p[i]=mod(c[i]-x);}
   let s=score(p);
   for(let j=0;j<steps;j++){
    const v=vars[ri(vars.length)],old=k[v],x=allowed[v][ri(allowed[v].length)];if(x===old)continue;const a=local(v);set(v,x);const d=local(v)-a;
    const t=3*Math.pow(.07,j/steps);
    if(d>=0||rand()<Math.exp(d/t))s+=d;else set(v,old);
   }
   for(let pass=0;pass<8;pass++){let changed=0;for(let z=0;z<vars.length;z++){const v=vars[(z+r)%vars.length],old=k[v];let bv=old,bs=local(v);for(const x of allowed[v]){if(x===old)continue;set(v,x);const ss=local(v);if(ss>bs+1e-10){bs=ss;bv=x;}}set(v,bv);if(bv!==old)changed++;}if(!changed)break;}
   s=score(p);if(s>best+1e-9){best=s;bestK=k.slice();hit=1;}else if(Math.abs(s-best)<1e-9)hit++;
   elite.push(s);
  }
  const p=c.map((x,i)=>keys[i]<0?0:mod(x-bestK[keys[i]]));let pos=0;const replay=p.map((x,i)=>held!==null&&x===0?0:mod(x+bestK[key[pos++]]));if(replay.some((x,i)=>x!==c[i]))throw Error("replay");
  return {score:best,plain:render(p),runes:p,key:bestK,hit,median:elite.sort((a,b)=>a-b)[Math.floor(elite.length/2)],...(held===null?{}:{held})};
 }
 function fAttack(c,key){
  const zs=c.map((x,i)=>x===0?i:-1).filter(x=>x>=0);if(zs.length>12)throw Error("too many visible F for this frozen exhaustive-mask test");
  const candidates=[];for(let mask=0;mask<2**zs.length;mask++){const held=zs.filter((_,j)=>(mask>>j)&1);const a=attack(c,key,held,8);if(a)candidates.push(a);}
  candidates.sort((a,b)=>b.score-a.score);const screened=candidates.length;let best=candidates[0];
  for(const a of candidates.slice(0,4)){const b=attack(c,key,a.held,48);if(b.score>best.score)best=b;}
  return {screened,visibleF:zs,best,initialRank:candidates.slice(0,4).map(a=>({held:a.held,score:a.score}))};
 }
 const lens=[7,4,2,6,7,2,2,7,2,4,4,3,3,14,4,2,8,5,3,6];let cursor=0;const pw=lens.map(n=>{const w=gp.pages[57].indices.slice(cursor,cursor+n);cursor+=n;return w;});const c=gp.pages[55].indices.slice(1);
 if(c.length!==75||cursor!==95)throw Error("source shape");
 const sha=encode(inputs[3]),nat=encode(inputs[4]);const holdouts=[sha.slice(3000,3075),sha.slice(81000,81075),nat.slice(400,475),nat.slice(1800,1875)];
 const out={restarts,steps,training:train.map(x=>x.length),sides:[],fhold:[]};
 for(const side of ["first","last"]){const key=pw.flatMap(w=>side==="first"?w.slice(1):w.slice(0,-1));const original=attack(c,key),controls=[],nulls=[];
  for(const p of holdouts){if(p.length!==75)throw Error("holdout too short");const k=Array.from({length:N},()=>ri(N)),enc=p.map((x,i)=>mod(x+k[key[i]])),a=attack(enc,key);controls.push({score:a.score,trueScore:score(p),true:render(p),plain:a.plain,recovery:p.filter((x,i)=>a.runes[i]===x).length,hit:a.hit,median:a.median});}
  for(let j=0;j<4;j++){const n=c.map(()=>ri(N)),a=attack(n,key);nulls.push({score:a.score,plain:a.plain,hit:a.hit});}
  out.sides.push({side,original,controls,nulls});
 }
 rng=0x4657c2a9;
 for(const side of ["first","last"]){
  const key=pw.flatMap(w=>side==="first"?w.slice(1):w.slice(0,-1)),original=fAttack(c,key),controls=[];
  for(const p of [holdouts[0],holdouts[3]]){const k=Array.from({length:N},()=>ri(N));let t=0;const enc=p.map(x=>x===0?0:mod(x+k[key[t++]])),a=fAttack(enc,key);
   controls.push({score:a.best.score,trueScore:score(p),true:render(p),plain:a.best.plain,recovery:p.filter((x,i)=>a.best.runes[i]===x).length,held:a.best.held,trueHeld:p.map((x,i)=>x===0?i:-1).filter(x=>x>=0),screened:a.screened,visibleF:a.visibleF,initialRank:a.initialRank});
  }
  out.fhold.push({side,original,controls});
 }
 return out;
}
module.exports=experiment;
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,"..");const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt","resources/liber-primus/lp1-plaintext-reference.txt"];console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(root,p),"utf8"))),null,2));}
