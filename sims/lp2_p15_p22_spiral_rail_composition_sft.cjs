"use strict";
const fs=require('node:fs');
const path=require('node:path');
function run(corpus,native){
  const mod=x=>(x%29+29)%29;
  const grid=[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516];
  const key=grid.map(mod);
  const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
  const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  function railPermutation(n){
    return Array.from({length:3},(_,r)=>Array.from({length:n},(_,i)=>i).filter(i=>[0,1,2,1][i%4]===r)).flat();
  }
  function inversePermutation(p){const q=[];p.forEach((v,i)=>q[v]=i);return q}
  function transform(a,dir){let p=railPermutation(a.length);if(dir===-1)p=inversePermutation(p);return p.map(i=>a[i])}
  function additive(a,sign,hold){
    let phase=0;return a.map(x=>{if(hold&&x===0)return 0;let c=mod(x+sign*key[phase]);phase=(phase+1)%16;return c});
  }
  function encrypt(p,sign,dir,order,hold){return order==="rail-after-key"?transform(additive(p,sign,hold),dir):additive(transform(p,dir),sign,hold)}
  function fEdges(c,phase,sign){
    const e=[];if(c===0)e.push([phase,0]);
    const p=mod(c-sign*key[phase]);if(p!==0)e.push([(phase+1)%16,p]);return e;
  }
  function fInverse(c,sign,finish,score){
    const n=c.length;let cur=Array(16).fill(0n);cur[0]=1n;let dead=null;
    for(let i=0;i<n;i++){
      const next=Array(16).fill(0n);
      for(let q=0;q<16;q++)if(cur[q])for(const [r] of fEdges(c[i],q,sign))next[r]+=cur[q];
      cur=next;if(cur.every(x=>x===0n)){dead=i;break;}
    }
    const total=cur.reduce((a,b)=>a+b,0n);let best=null,bestScore=-Infinity,visited=0;
    if(total>0n&&total<=10000n){
      const suffix=Array.from({length:n+1},()=>Array(16).fill(0n));suffix[n].fill(1n);
      for(let i=n-1;i>=0;i--)for(let q=0;q<16;q++)for(const [r] of fEdges(c[i],q,sign))suffix[i][q]+=suffix[i+1][r];
      assert(suffix[0][0]===total,"forward/backward count");
      const tape=[];
      function walk(i,q){
        if(i===n){visited++;const p=finish(tape.slice()),s=score(p);if(s>bestScore){bestScore=s;best=p;}return}
        for(const [r,p] of fEdges(c[i],q,sign))if(suffix[i+1][r]){tape.push(p);walk(i+1,r);tape.pop();}
      }
      walk(0,0);assert(BigInt(visited)===total,"all paths visited");
    }
    return {paths:total.toString(),dead,visited,best};
  }
  const sections=native.sections.map(s=>Array.from(s.source_text).map(r=>native.runes.indexOf(r)).filter(x=>x>=0));
  assert(sections.length===9&&sections.flat().length===2979,"native source count");
  const train=Array.from({length:29},()=>Array(29).fill(.5));
  for(const a of sections.slice(0,7))for(let i=1;i<a.length;i++)train[a[i-1]][a[i]]++;
  for(let i=0;i<29;i++){const z=train[i].reduce((a,b)=>a+b,0);train[i]=train[i].map(x=>Math.log(29*x/z))}
  const score=a=>a.slice(1).reduce((s,x,i)=>s+train[a[i]][x],0)/(a.length-1);
  const ioc=a=>{const c=Array(29).fill(0);a.forEach(x=>c[x]++);return c.reduce((s,v)=>s+v*(v-1),0)/(a.length*(a.length-1))};
  const scopes=[["p15-body-through-p22",corpus.pages.slice(15,23).flatMap(p=>p.indices).slice(20)],["p16-through-p22",corpus.pages.slice(16,23).flatMap(p=>p.indices)]];
  assert(scopes[0][1].length===1883&&scopes[1][1].length===1744,"source geometry");
  const variants=[];
  for(const sign of [1,-1])for(const dir of [1,-1])for(const order of ["rail-after-key","rail-before-key"])variants.push({sign,dir,order});
  function decode(c,{sign,dir,order},hold){
    const x=order==="rail-after-key"?transform(c,-dir):c;
    const finish=p=>order==="rail-before-key"?transform(p,-dir):p;
    if(!hold){const p=finish(x.map((v,i)=>mod(v-sign*key[i%16])));assert(eq(encrypt(p,sign,dir,order,false),c),"ordinary replay");return {paths:"1",dead:null,visited:1,best:p}}
    const out=fInverse(x,sign,finish,score);
    if(out.best)assert(eq(encrypt(out.best,sign,dir,order,true),c),"F replay");
    return out;
  }
  const controls=[];
  for(const p of sections.slice(7)){
    for(const v of variants){
      const c=encrypt(p,v.sign,v.dir,v.order,false);
      assert(eq(decode(c,v,false).best,p),"native ordinary recovery");
      const h=encrypt(p,v.sign,v.dir,v.order,true), out=decode(h,v,true);
      assert(BigInt(out.paths)>0n,"native F plant must survive");
      controls.push({length:p.length,...v,ordinaryExact:true,fPaths:out.paths,fBestExact:out.best?eq(out.best,p):null,nativeScore:score(p),nativeIoc:ioc(p)});
    }
  }
  const results=[];
  for(const [scope,c] of scopes)for(const v of variants)for(const hold of [false,true]){
    const out=decode(c,v,hold);
    results.push({scope,length:c.length,...v,hold,paths:out.paths,dead:out.dead,visited:out.visited,score:out.best?score(out.best):null,ioc:out.best?ioc(out.best):null,preview:out.best?out.best.slice(0,90).map(x=>corpus.translit[x]).join(" "):null});
  }
  return {key,controls,results};
}
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
console.log(JSON.stringify(run(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
