'use strict';
const fs=require('node:fs'),path=require('node:path');
const read=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'));
function experiment(grid,corpus,solved){
 const mod=x=>(x%29+29)%29,a=grid.alphabet,b=a.replace("f",""),val=(s,t)=>s.length*s.indexOf(t[0])+s.indexOf(t[1]),tokens=grid.pages.flatMap(p=>p.tokens);
 const digits=tokens.filter((_,i)=>Math.floor(i/8)>=2&&Math.floor(i/8)<30&&i%8>=2&&i%8<6).map(t=>val(a,t)-val(b,t));
 if(digits.length!==112||digits.some(d=>d<0||d>4))throw Error("core");
 const z=digits.reduce((n,d)=>5n*n+BigInt(d),0n),key=[];for(let n=z;n;n/=29n)key.unshift(Number(n%29n));
 if(key.reduce((n,d)=>29n*n+BigInt(d),0n)!==z)throw Error("serialization");
 const seq=x=>Array.from(x.source_text).map(r=>corpus.runes.indexOf(r)).filter(v=>v>=0);
 const p57=seq(solved.sections.find(x=>x.name==="p57_parable")),p56=seq(solved.sections.find(x=>x.name==="p56_an_end"));
 const train=solved.sections.filter(x=>!x.name.startsWith("p5")).map(seq);
 const u=Array(29).fill(1),bb=Array.from({length:29},()=>Array(29).fill(.5));
 for(const p of train){p.forEach(x=>u[x]++);for(let i=1;i<p.length;i++)bb[p[i-1]][p[i]]++}
 const sum=x=>x.reduce((a,b)=>a+b,0),ul=u.map(x=>Math.log(x/sum(u))),bl=bb.map(r=>r.map(x=>Math.log(x/sum(r))));
 function enc(p,k,start=0,hold=true){let j=start;return p.map(x=>{if(hold&&x===0)return 0;return mod(x+k[j++%k.length])})}
 function score(p){return p.reduce((v,x,i)=>v+(i?bl[p[i-1]][x]:ul[x]),0)/p.length}
 function decode(c,k,start=0){
  let states=new Map([[start*30+29,{j:start,last:29,count:1n,s:0,p:[]}]]),prefix=0;
  for(const v of c){const next=new Map();for(const st of states.values()){
   function put(p,j){const id=j*30+p,s=st.s+(st.last===29?ul[p]:bl[st.last][p]),old=next.get(id);if(old){old.count+=st.count;if(s>old.s){old.s=s;old.p=[...st.p,p]}}else next.set(id,{j,last:p,count:st.count,s,p:[...st.p,p]})}
   if(v===0)put(0,st.j);const p=mod(v-k[st.j]);if(p!==0)put(p,(st.j+1)%k.length);
  }if(!next.size)return {prefix,count:"0"};prefix++;states=next;}
  const top=[...states.values()].sort((a,b)=>b.s-a.s)[0],count=[...states.values()].reduce((n,x)=>n+x.count,0n);
  if(enc(top.p,k,start).some((v,i)=>v!==c[i]))throw Error("replay");return {prefix,count:String(count),score:top.s/c.length,p:top.p};
 }
 const primes=[];for(let i=2;primes.length<p56.length;i++)if(primes.every(p=>p*p>i||i%p))primes.push(i);
 const historical=corpus.pages[56].indices,hist=enc(p56,primes.map(p=>mod(p-1))),histMatch=hist.filter((v,i)=>v===historical[i]).length;
 if(histMatch!==p56.length)throw Error("historical control");
 const controls=[p57,p56].map(p=>{const d=decode(enc(p,key),key);return {n:p.length,correct:d.p.filter((v,i)=>v===p[i]).length,paths:d.count,score:d.score,nativeScore:score(p)}});
 const scopes=[[0,3],[3,8],[8,15],[15,23],[23,27],[27,33],[33,40],[40,54],[54,56],[55,56]];
 const target=corpus.pages[55].indices,ordinary=target.map((v,i)=>mod(v-key[i%key.length]));
 if(enc(ordinary,key,0,false).some((v,i)=>v!==target[i]))throw Error("ordinary replay");
 const result=scopes.map(([s,e])=>{const c=corpus.pages.filter(p=>p.page>=s&&p.page<e).flatMap(p=>p.indices),all=Array.from({length:key.length},(_,j)=>decode(c,key,j)),fixed=all[0],surviving=all.flatMap((x,j)=>x.count!=="0"?[{phase:j,count:x.count,score:x.score,p:x.p}]:[]),best=surviving.slice().sort((a,b)=>b.score-a.score)[0];return {start:s,end:e,n:c.length,fixed:{prefix:fixed.prefix,count:fixed.count,score:fixed.score,p:fixed.p?.map(v=>corpus.translit[v]).join(" ")},maxPrefix:Math.max(...all.map(x=>x.prefix)),surviving:surviving.map(({p,...x})=>x),totalPaths:surviving.reduce((n,x)=>n+BigInt(x.count),0n).toString(),best:best&&{phase:best.phase,score:best.score,text:best.p.map(v=>corpus.translit[v]).join(" ")}}});
 return {hex:z.toString(16),key,keyLength:key.length,historical:{n:p56.length,matches:histMatch},controls,result,p55Ordinary:{score:score(ordinary),text:ordinary.map(v=>corpus.translit[v]).join(" ")}};
}
console.log(JSON.stringify(experiment(...["resources/liber-primus/lp2-grid-256.json","resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"].map(read)),null,2));
