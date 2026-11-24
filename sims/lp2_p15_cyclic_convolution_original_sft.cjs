"use strict";
// Two literal cyclic convolution interpretations of the recovered p15 square; no fitted key.
const fs=require("node:fs"),path=require("node:path");
function experiment(corpus,donor,transcript,lexicon){
 const assert=(b,m)=>{if(!b)throw Error(m)},eq=(a,b,m)=>assert(JSON.stringify(a)===JSON.stringify(b),m);
 const Q=29,mod=x=>((x%Q)+Q)%Q,inv=x=>{for(let i=1;i<Q;i++)if(mod(x*i)===1)return i;throw Error("nonunit")};
 const grid=[[3258,3222,3152,3038],[3278,3299,3298,2838],[3288,3294,3296,2472],[4516,1206,708,1820]];
 const path=[[1,1],[1,2],[2,2],[2,1],[2,0],[1,0],[0,0],[0,1],[0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0]];
 const spiral=path.map(([i,j])=>mod(grid[i][j])),matrix=grid.flat().map(mod);
 const orig=corpus.pages.slice(16,23).flatMap(p=>p.indices),train=corpus.pages.slice(16,21).reduce((s,p)=>s+p.indices.length,0);
 eq([orig.length,train],[1744,1340],"original sizes");
 const idx=new Map(corpus.runes.map((r,i)=>[r,i]));
 const native=donor.sections.flatMap(s=>(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).flatMap(w=>[...w].map(r=>idx.get(r)))).slice(0,orig.length);
 const ioc=a=>{let h=Array(Q).fill(0);for(const x of a)h[x]++;return h.reduce((s,v)=>s+v*(v-1),0)/(a.length*(a.length-1));};
 const mat1=Array.from({length:16},(_,i)=>Array.from({length:16},(_,j)=>spiral[(i-j+16)%16]));
 const mat2=Array.from({length:16},(_,i)=>Array.from({length:16},(_,j)=>matrix[((Math.floor(i/4)-Math.floor(j/4)+4)%4)*4+(i%4-j%4+4)%4]));
 function reduction(A){const n=A.length,M=A.map((r,i)=>r.concat(Array.from({length:n},(_,j)=>i===j?1:0)));let rank=0,pivots=[];
  for(let c=0;c<n;c++){let p=rank;while(p<n&&!M[p][c])p++;if(p===n)continue;[M[p],M[rank]]=[M[rank],M[p]];let k=inv(M[rank][c]);M[rank]=M[rank].map(x=>mod(x*k));for(let i=0;i<n;i++)if(i!==rank&&M[i][c]){let z=M[i][c];M[i]=M[i].map((x,j)=>mod(x-z*M[rank][j]));}pivots.push(c);rank++;}
  return {rank,pivots,rref:M.map(r=>r.slice(0,n)),left:M.map(r=>r.slice(n))};
 }
 const mv=(A,x)=>A.map(r=>mod(r.reduce((s,v,i)=>s+v*x[i],0)));
 const blocks=(a,n)=>Array.from({length:a.length/n},(_,i)=>a.slice(i*n,(i+1)*n));
 const tokens=corpus.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length),dict=new Set();
 for(const l of lexicon.split("\n")){let w=l.trim().split(/\s+/)[0]?.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");if(!w)continue;let a=[];while(w){const m=tokens.find(x=>w.startsWith(x.t));if(!m){a=[];break;}a.push(m.i);w=w.slice(m.t.length);}if(a.length)dict.add(a.join(","));}
 let words=[],w=[];for(const ch of transcript.split("%").slice(0,55).join("%")){if(idx.has(ch))w.push(idx.get(ch));else if(ch!=="%"&&ch!=="/"&&!/\s/u.test(ch)&&w.length){words.push(w);w=[];}}if(w.length)words.push(w);
 const start=corpus.pages.slice(0,16).reduce((s,p)=>s+p.indices.length,0);
 function stat(a,from,to){let off=0,n=0,hit=0,long=0,longHit=0,sample=[];for(const w of words){const i=off-start,j=i+w.length;off+=w.length;if(i>=from&&j<=to){const p=a.slice(i,j);n++;if(w.length>=5)long++;if(dict.has(p.join(","))){hit++;if(w.length>=5)longHit++;}if(sample.length<8)sample.push(p.map(x=>corpus.translit[x]).join(""));}}return {n,hit,long,longHit,ioc:ioc(a.slice(from,to)),sample};}
 function evaluate(A,name){const d=reduction(A),B=blocks(orig,16);const bad=B.map((b,i)=>({i,syndrome:mv(d.left,b).slice(d.rank)})).filter(x=>x.syndrome.some(v=>v!==0));
  if(d.rank<16){const enc=blocks(native,16).map(x=>mv(A,x));assert(enc.every(y=>mv(d.left,y).slice(d.rank).every(v=>v===0)),"plant membership");
   const root=12,powers=[1,root,mod(root*root),mod(root**3)];
   const spectrum=Array.from({length:4},(_,u)=>Array.from({length:4},(_,v)=>mod(matrix.reduce((s,x,i)=>s+x*powers[mod((u*Math.floor(i/4)+v*(i%4))%4)],0))));
   return {name,rank:d.rank,originalImpossible:bad.length,firstBad:bad.slice(0,4),nativePlantBlocks:enc.length,spectrum};}
  const out=B.flatMap(x=>mv(d.left,x));eq(blocks(out,16).flatMap(x=>mv(A,x)),orig,"original replay");
  const enc=blocks(native,16).flatMap(x=>mv(A,x));eq(blocks(enc,16).flatMap(x=>mv(d.left,x)),native,"native replay");
  const reverse=B.flatMap(x=>mv(A,x));eq(blocks(reverse,16).flatMap(x=>mv(d.left,x)),orig,"reverse replay");
  const revNative=blocks(native,16).flatMap(x=>mv(d.left,x));eq(blocks(revNative,16).flatMap(x=>mv(A,x)),native,"reverse native replay");
  return {name,rank:d.rank,train:stat(out,0,train),holdout:stat(out,train,orig.length),reverseTrain:stat(reverse,0,train),reverseHoldout:stat(reverse,train,orig.length),nativeIoc:ioc(native)};
 }
 return {spiral,matrix,oneD:evaluate(mat1,"source spiral / cyclic length16"),twoD:evaluate(mat2,"physical 4x4 torus")};
}
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/liber-primus/lp2-transcription.txt"),read("resources/control/english_wordfreq_textblob.txt")),null,2));
