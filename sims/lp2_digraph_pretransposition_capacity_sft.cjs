'use strict';
// Run: node sims/lp2_digraph_pretransposition_capacity_sft.cjs
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
const inputs=paths.map(p=>{const b=fs.readFileSync(path.join(__dirname,'..',p));return {path:p,sha:crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),content:b.toString('utf8')}});
function experiment(inputs){
 const d=JSON.parse(inputs[0].content), A=29,B=A*A;
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const tokens=d.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
 function encode(s){const out=[];for(const w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){const [t,j]=w.startsWith("ING",i)?["ING",21]:w.startsWith("IO",i)?["IO",27]:tokens.find(([t])=>w.startsWith(t,i));out.push(j);i+=t.length}}return out}
 function cap(a,q,phase){const hist=Array.from({length:q},()=>new Int32Array(B));let t=0;for(let i=phase;i+1<a.length;i+=2)hist[t++%q][A*a[i]+a[i+1]]++;
  const tail=a.length-2*t;
  const u=Array(A).fill(tail);
  for(const h of hist){h.sort().reverse();const s=[0];for(const v of h)s.push(s.at(-1)+v);for(let k=1;k<=A;k++)u[k-1]+=s[k*k]+s[2*A*k-k*k]}
  assert(u[28]===a.length,"full envelope");return u;
 }
 function envelope(a,q){const cs=[cap(a,q,0)];if(a.length%2)cs.push(cap(a,q,1));return cs[0].map((v,k)=>Math.max(...cs.map(c=>c[k])))}
 function ranked(a){const h=new Int32Array(A);for(const x of a)h[x]++;h.sort().reverse();let s=0;return Array.from(h,v=>s+=v)}
 function scan(a,n,caps){
  const h=new Int32Array(A),rank=Array.from({length:A},(_,i)=>i),pos=new Int32Array(A);
  for(let i=0;i<n;i++)h[a[i]]++;
  rank.sort((x,y)=>h[y]-h[x]);rank.forEach((v,i)=>pos[v]=i);
  function move(x,delta){h[x]+=delta;let i=pos[x];if(delta>0){while(i>0&&h[x]>h[rank[i-1]]){const y=rank[i-1];rank[i]=y;pos[y]=i;i--}}else{while(i<A-1&&h[x]<h[rank[i+1]]){const y=rank[i+1];rank[i]=y;pos[y]=i;i++}}rank[i]=x;pos[x]=i}
  const out=caps.map(()=>({minMaxExcess:Infinity,at:-1,passes:0}));let minTop8=Infinity,at8=-1;
  const top=new Int32Array(A);
  for(let i=0;i+n<=a.length;i++){
   let s=0;for(let k=0;k<A;k++)top[k]=s+=h[rank[k]];
   if(top[7]<minTop8){minTop8=top[7];at8=i}
   for(let q=0;q<caps.length;q++){let e=0;for(let k=0;k<A-1;k++)e=Math.max(e,top[k]-caps[q][k]);if(e<out[q].minMaxExcess){out[q].minMaxExcess=e;out[q].at=i}if(e===0)out[q].passes++}
   if(i+n<a.length&&a[i]!==a[i+n]){move(a[i],-1);move(a[i+n],1)}
   if(i===0||i+n===a.length||i%65536===0)assert(top.every((v,k)=>v===ranked(a.slice(i,i+n))[k]),"rolling rank");
  }
  return {windows:a.length-n+1,minTop8,at8,byQ:out};
 }
 const donors=inputs.slice(1).map(x=>({name:x.path,a:encode(x.content)}));
 const starts=[0,3,8,15,23,27,33,40,54,56],chapters=starts.slice(0,-1).map((p,i)=>({name:`p${p}–${starts[i+1]-1}`,a:d.pages.slice(p,starts[i+1]).flatMap(x=>x.indices)}));
 assert(chapters.map(x=>x.a.length).join(",")==="729,1145,1729,1903,1021,1433,1680,3008,308","original lengths");
 chapters.push({name:"p40–53 black body",a:chapters[7].a.slice(8)});
 const qs=[1,2,4,8];
 const originals=chapters.map(({name,a})=>{const caps=qs.map(q=>envelope(a,q));return {name,n:a.length,caps,refs:donors.map(x=>({name:x.name,...scan(x.a,a.length,caps)}))}});
 function plant(P,q,seed){
  let x=seed>>>0;function next(){x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}
  function perm(n){const a=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const j=next()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
  const order=perm(P.length),tape=order.map(i=>P[i]),maps=Array.from({length:q},()=>perm(B)),inv=maps.map(m=>{const inv=Array(B);m.forEach((v,i)=>inv[v]=i);return inv});const C=[],D=[];
  for(let i=0;i+1<tape.length;i+=2){const p=A*tape[i]+tape[i+1],c=maps[(i/2)%q][p];C.push(Math.floor(c/A),c%A);const z=inv[(i/2)%q][c];D.push(Math.floor(z/A),z%A)}
  if(tape.length%2){C.push(tape.at(-1));D.push(C.at(-1))}
  const back=Array(P.length);order.forEach((v,i)=>back[v]=D[i]);assert(back.every((v,i)=>v===P[i]),"plant inverse");
  const t=ranked(P),u=envelope(C,q);assert(t.every((v,k)=>v<=u[k]),"true plant passes");
  return {seed,q,n:P.length,exactRecovered:back.length,top8:t[7],cap8:u[7],maxExcess:Math.max(...t.map((v,k)=>v-u[k]))};
 }
 const plants=[plant(donors[0].a.slice(123,3123),1,0x290801),plant(donors[1].a.slice(321,3322),2,0x290802),plant(d.pages[57].indices,1,0x290803)];
 return {inputs:inputs.map(({path,sha})=>({path,sha})),qs,donorLengths:donors.map(x=>[x.name,x.a.length]),originals,plants};
}
console.log(JSON.stringify(experiment(inputs),null,2));
