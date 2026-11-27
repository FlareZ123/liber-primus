'use strict';
// Run: node sims/lp2_p40_pretransposition_phase_digraph_sft.cjs
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
const inputs=paths.map(p=>{const b=fs.readFileSync(path.join(__dirname,'..',p));return {path:p,sha:crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),content:b.toString('utf8')}});
function experiment(inputs){
 const d=JSON.parse(inputs[0].content),A=29,B=841,W=8,R=375,N=3000;
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const tokens=d.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
 function encode(s){const out=[];for(const w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){const [t,j]=w.startsWith("ING",i)?["ING",21]:w.startsWith("IO",i)?["IO",27]:tokens.find(([t])=>w.startsWith(t,i));out.push(j);i+=t.length}}return out}
 const donors=inputs.slice(1).map(x=>({name:x.path,a:encode(x.content)}));
 const full=d.pages.slice(40,54).flatMap(x=>x.indices),C=full.slice(8);assert(full.length===3008&&C.length===N&&full.slice(0,8).join(",")==="0,9,19,26,6,23,25,8","source body");
 const edges=[], eid=Array.from({length:W},()=>new Int32Array(W));
 for(let x=0;x<W;x++)for(let y=x+1;y<W;y++){eid[x][y]=eid[y][x]=edges.length;edges.push([x,y])}
 function hist(){const f=new Int32Array(R+1);f[0]=B;return {h:new Int16Array(B),f,Q:0}}
 function update(o,x,delta){const n=o.h[x],m=n+delta;assert(m>=0,"count");o.f[n]--;o.f[m]++;o.h[x]=m;o.Q+=m*(m-1)-n*(n-1)}
 function equal(a,b){if(a.Q!==b.Q)return false;for(let i=0;i<a.f.length;i++)if(a.f[i]!==b.f[i])return false;return true}
 function targets(C,q){const out=Array.from({length:q},hist);for(let i=0;i<N;i+=2)update(out[(i/2)%q],A*C[i]+C[i+1],1);return out}
 function candidates(masks){let count=0,first=null,path=[];function walk(rem,slots){if(!rem){count++;if(first===null)first=path.slice();return}const x=31-Math.clz32(rem&-rem),r=rem^(1<<x);for(let z=r;z;z&=z-1){const y=31-Math.clz32(z&-z),e=eid[x][y];for(let t=masks[e]&slots;t;t&=t-1){const slot=31-Math.clz32(t&-t);path.push([x,y,slot]);walk(r^(1<<y),slots^(1<<slot));path.pop()}}}walk(255,15);return {count,first}}
 const t4=targets(C,4),t8=targets(C,8);
 function scan(a,t4,t8){
  const out={windows:0,q4Pass:0,q8Pass:0,q4First:null,q8First:null,q4AnyEdge:0,q8AnyEdge:0};
  for(let s=0;s<W&&s+N<=a.length;s++){
   const h=edges.map(()=>[hist(),hist(),hist()]);
   function row(r,delta){const start=s+r*W;for(let e=0;e<edges.length;e++){const [x,y]=edges[e],v=A*a[start+x]+a[start+y];update(h[e][0],v,delta);update(h[e][1+(r&1)],v,delta)}}
   for(let r=0;r<R;r++)row(r,1);
   const m4=new Int32Array(edges.length),m8=new Int32Array(edges.length);
   for(let r=0;s+r*W+N<=a.length;r++){
    out.windows++;m4.fill(0);m8.fill(0);let any4=false,any8=false;
    for(let e=0;e<edges.length;e++){
     const v=h[e],h0=v[1+(r&1)],h1=v[1+((r+1)&1)];
     for(let k=0;k<4;k++){
      if(equal(v[0],t4[k]))m4[e]|=1<<k;
      if(equal(h0,t8[k])&&equal(h1,t8[k+4]))m8[e]|=1<<k;
     }
     any4||=m4[e]!==0;any8||=m8[e]!==0;
    }
    if(any4){out.q4AnyEdge++;const c=candidates(m4);if(c.count){out.q4Pass++;if(out.q4First===null)out.q4First={offset:s+r*W,...c}}}
    if(any8){out.q8AnyEdge++;const c=candidates(m8);if(c.count){out.q8Pass++;if(out.q8First===null)out.q8First={offset:s+r*W,...c}}}
    if(s+(r+1)*W+N<=a.length){row(r,-1);row(r+R,1)}
   }
  }
  assert(out.windows===a.length-N+1,"all starts");return out;
 }
 function plant(P,q,seed){let x=seed>>>0;function next(){x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}function perm(n){const a=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const j=next()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
  const order=perm(W),maps=Array.from({length:q},()=>perm(B)),inv=maps.map(m=>{const a=Array(B);m.forEach((v,i)=>a[v]=i);return a}),C=[],back=[];
  for(let r=0;r<R;r++){const row=[];for(let k=0;k<4;k++){const a=P[r*W+order[k*2]],b=P[r*W+order[k*2+1]],state=(r*4+k)%q,c=maps[state][A*a+b];C.push(Math.floor(c/A),c%A);const z=inv[state][c];row[order[2*k]]=Math.floor(z/A);row[order[2*k+1]]=z%A}back.push(...row)}
  assert(back.every((v,i)=>v===P[i]),"exact inverse");
  const s=scan(P,targets(C,4),targets(C,8)),pass=q===4?s.q4Pass:s.q8Pass;assert(pass===1,"true plant passes");
  return {seed,q,secretColumnOrder:order,recoveredRunes:back.length,match:q===4?s.q4First:s.q8First};
 }
 // Check exact count-vector comparator, including two different histograms with equal collision counts.
 const z=hist(),w=hist();update(z,0,1);update(w,1,1);assert(equal(z,w),"bijection");update(z,0,1);update(w,2,1);assert(!equal(z,w),"distinct multiplicities");
 const compact=o=>({Q:o.Q,spectrum:Array.from(o.f).slice(0,1+o.f.findLastIndex(v=>v!==0))});
 return {inputs:inputs.map(({path,sha})=>({path,sha})),n:N,header:full.slice(0,8),targets:{q4:t4.map(compact),q8:t8.map(compact)},originals:donors.map(({name,a})=>({name,...scan(a,t4,t8)})),plants:[plant(donors[0].a.slice(345,3345),4,0x400804),plant(donors[1].a.slice(789,3789),8,0x400808)]};
}
console.log(JSON.stringify(experiment(inputs),null,2));
