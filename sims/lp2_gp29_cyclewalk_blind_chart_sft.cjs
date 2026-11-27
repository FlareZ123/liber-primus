// Calibrated blind chart recovery for period-five coordinate cyclewalking.
const fs=require("node:fs"),path=require("node:path");
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/control/gibran_prophet_58585.txt",
  "resources/external/2013-book-of-law-II.txt",
  "resources/external/cicada2012-blake-marriage-gutenberg45315.txt"
];
const files=paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"));
function run(corpus, model, donors) {
 const N=29,W=6,K=5,tok=[["ING",21],["IO",27],...corpus.translit.map((t,i)=>[t,i])].sort((a,b)=>b[0].length-a[0].length);
 function native(t){const a=[];t=t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<t.length;){const p=tok.find(([x])=>t.startsWith(x,i));if(p){a.push(p[1]);i+=p[0].length}else i++}return a}
 const U=new Float64Array(N),B=new Float64Array(N*N),T=new Float64Array(N**3),L=new Float64Array(N**3),train=native(model);
 for(let i=0;i<train.length;i++){const x=train[i];U[x]++;if(i)B[train[i-1]*N+x]++;if(i>1)T[(train[i-2]*N+train[i-1])*N+x]++}
 for(let x=0;x<N;x++)for(let y=0;y<N;y++){let a=0,b=0;for(let z=0;z<N;z++){a+=T[(x*N+y)*N+z];b+=B[y*N+z]}for(let z=0;z<N;z++){let p=(B[y*N+z]+10*(U[z]+.5)/(train.length+N*.5))/(b+10);L[(x*N+y)*N+z]=Math.log((T[(x*N+y)*N+z]+10*p)/(a+10))}}
 const r=[0,3,1,4,2],c=[2,0,3,1,4],ri=Array(K),ci=Array(K);r.forEach((x,i)=>ri[x]=i);c.forEach((x,i)=>ci[x]=i);
 const powers=(p)=>{let out=[],a=Array.from({length:K},(_,i)=>i);for(let j=0;j<4;j++){a=a.map(x=>p[x]);out.push(a.slice())}return out};
 const plans=[[powers(r),powers(c)],[powers(ri),powers(ci)]];
 function decoder(a,dir) {
  const buf=new Int8Array(a.length),loc=new Int8Array(N),rows=new Int8Array(N),cols=new Int8Array(N),R=new Int8Array(K),C=new Int8Array(K),[rp,cp]=plans[dir];
  return function decode(key){
   for(let i=0;i<N;i++){loc[key[i]]=i;rows[key[i]]=i-i%W;cols[key[i]]=i%W}
   for(let i=0;i<a.length;i+=K){for(let j=0;j<K;j++){let v=a[i+j];R[j]=rows[v];C[j]=cols[v]}
    for(let t=0;t<4;t++){const rr=rp[t],cc=cp[t];let x=R[rr[0]]+C[cc[0]],y=R[rr[1]]+C[cc[1]],z=R[rr[2]]+C[cc[2]],v=R[rr[3]]+C[cc[3]],w=R[rr[4]]+C[cc[4]];if(x===29||y===29||z===29||v===29||w===29)continue;buf[i]=key[x];buf[i+1]=key[y];buf[i+2]=key[z];buf[i+3]=key[v];buf[i+4]=key[w];break}
   }return buf
  }
 }
 function score(a){let t=0;for(let i=2;i<a.length;i++)t+=L[(a[i-2]*N+a[i-1])*N+a[i]];return t}
 function rng(seed){return n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}}
 function shuffle(rnd){let a=Array.from({length:N},(_,i)=>i);for(let i=N-1;i>0;i--){let j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 function fit(a,dir,seed,restarts=8,steps=12000){const rnd=rng(seed),decode=decoder(a,dir),f=k=>score(decode(k));let best={value:-Infinity},history=[];
  for(let n=0;n<restarts;n++){
   let key= n%3===2?best.key.slice():shuffle(rnd);
   if(n%3===2)for(let j=0;j<6;j++){let x=rnd(N),y=rnd(N);[key[x],key[y]]=[key[y],key[x]]}
   let v=f(key),local=v;for(let j=0;j<steps;j++){
    let x=rnd(N),y=rnd(N);if(x===y)continue;let z=rnd(N),triple=(j%7===0&&z!==x&&z!==y);
    [key[x],key[y]]=[key[y],key[x]];if(triple)[key[y],key[z]]=[key[z],key[y]];
    let q=f(key),temp=70*Math.pow(.002,j/steps);
    if(q>=v||(rnd(1<<24)+1)/(1<<24)<Math.exp((q-v)/temp)){v=q}else{if(triple)[key[y],key[z]]=[key[z],key[y]];[key[x],key[y]]=[key[y],key[x]]}
    local=Math.max(local,v);if(v>best.value)best={value:v,key:key.slice()}
   }history.push(local/(a.length-2));
  }return {...best,history}
 }
 const controls=[];
 for(let i=0;i<donors.length;i++){
  let p=native(donors[i]).slice(1000,5005),seed=[8043,4412][i],direction=i,key=shuffle(rng(seed)),ct=Int8Array.from(decoder(p,1-direction)(key));
  let f=fit(ct.slice(0,3000),direction,seed+1),hold=Int8Array.from(decoder(ct.slice(3000),direction)(f.key));
  const accuracy=hold.reduce((n,x,j)=>n+(x===p[j+3000]),0);
  controls.push({i,seed,direction,fit:f.value/2998,history:f.history,held:accuracy,length:hold.length,truth:score(p.slice(3000))/1003,score:score(hold)/1003})
 }
 let original=null;
 if(controls.every(x=>x.held/x.length>=.98)){
  const a=corpus.pages.slice(40,54).flatMap(p=>p.indices).slice(8),b=corpus.pages.slice(23,27).flatMap(p=>p.indices).slice(16);
  original=[];
  for(let d=0;d<2;d++){let f=fit(a,d,9012+d),plain=Int8Array.from(decoder(b,d)(f.key));original.push({d,fit:f.value/2998,held:score(plain)/1003,key:f.key,preview:Array.from(plain.slice(0,180),x=>corpus.translit[x]).join(" ")})}
 }
 return {controls,original}
}
console.log(JSON.stringify(run(JSON.parse(files[0]),files[1],files.slice(2)),null,2));
