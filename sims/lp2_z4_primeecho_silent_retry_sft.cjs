'use strict';
const fs=require('node:fs');const path=require('node:path');
function analyze(corpus,source){
 const primes=[...source.matchAll(/^echo( -n| )?\s+"(\d+)\t"; sleep (\.05|2)$/gm)].map(m=>+m[2]);
 if(primes.length!==464||primes[173]!==1033||primes[463]!==3301)throw Error("source");
 const key=primes.slice(174),L=key.length,mod=(x,m)=>(x%m+m)%m;
 const target=corpus.pages[33].indices.slice(91).concat(...corpus.pages.slice(34,40).map(p=>p.indices)),prev=corpus.pages[33].indices[90];
 if(target.length!==1589)throw Error("target");
 const p57=corpus.pages[57].indices;
 function engine(m,sign){
 const table=Array.from({length:30},()=>Array.from({length:L},()=>Array.from({length:29},()=>[])));
 const shifts=key.map(p=>mod(sign*(p-1),m));
 function emit(p,j,last){
  const seen=new Set();
  for(let steps=1;;steps++){
   // internal last=29 is a valid silent symbol; use -1 for initial sentinel.
   const actual=j*(m+1)+(last+1);
   if(seen.has(actual))return null;seen.add(actual);
   const c=mod(p+shifts[j],m);j=(j+1)%L;
   if(c===last)continue;
   last=c;
   if(c<29)return {c,j,steps};
  }
 }
 for(let a=0;a<30;a++)for(let j=0;j<L;j++)for(let p=0;p<29;p++){const r=emit(p,j,a===29?-1:a);if(r)table[a][j][r.c].push({p,j:r.j,steps:r.steps})}
 function reach(c,first,all){
 let count=new Float64Array(L);if(all)count.fill(1);else count[0]=1;
 let minimum=L,scale=0,firstFork=-1;
 for(let i=0;i<c.length;i++){
 const next=new Float64Array(L);let a=i?c[i-1]:first;
 for(let j=0;j<L;j++)if(count[j])for(const t of table[a][j][c[i]])next[t.j]+=count[j];
 const sum=next.reduce((a,b)=>a+b,0),active=next.filter(x=>x>0).length;
 if(!sum)return {prefix:i,active:0,minActive:minimum,firstFork};
 if(sum>1&&firstFork<0)firstFork=i;minimum=Math.min(minimum,active);
 scale+=Math.log2(sum);for(let j=0;j<L;j++)next[j]/=sum;count=next;
 }
 return {prefix:c.length,active:count.filter(x=>x>0).length,minActive:minimum,firstFork,log2Histories:scale};
 }
 function plant(first){
 let j=0,last=first===29?-1:first;
 const plain=Array.from({length:target.length},(_,i)=>p57[i%p57.length]),c=[];let steps=0;
 for(const p of plain){const r=emit(p,j,last);if(!r)return {failedAt:c.length};c.push(r.c);last=r.c;j=r.j;steps+=r.steps;}
 const result=reach(c,first,false);if(result.prefix!==plain.length)throw Error("planted reachability");
 // independently recover true phase history by checking all actual deterministic transitions.
 let phase=0,prior=first;for(let i=0;i<c.length;i++){const t=table[prior][phase][c[i]].find(t=>t.p===plain[i]);if(!t)throw Error("true path missing");phase=t.j;prior=c[i];}if(phase!==j)throw Error("phase mismatch");
 return {length:c.length,doublets:c.filter((v,i)=>i&&v===c[i-1]).length,steps,endPhase:j,...result};
 }
 let missing=0,multi=0,cycles=0;
 for(let a=0;a<30;a++)for(let j=0;j<L;j++){let n=0;for(let c=0;c<29;c++){let k=table[a][j][c].length;n+=k;if(!k)missing++;if(k>1)multi++;}cycles+=29-n;}
 return {m,sign,table:{missing,multi,cycles},observedPrevious:prev,original:[{first:"previous",fixed:reach(target,prev,false),any:reach(target,prev,true)},{first:"reset",fixed:reach(target,29,false),any:reach(target,29,true)}],plant:plant(prev)};
 }
 return [34,35,36,37,38].flatMap(m=>[1,-1].map(s=>engine(m,s)));
}
if(require.main===module){const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');console.log(JSON.stringify(analyze(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/historical/cicada2013-os-original-prime-echo.sh')),null,2));}
module.exports={analyze};
