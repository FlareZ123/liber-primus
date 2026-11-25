"use strict";
const fs=require("node:fs");const path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function marginal(C,f,s,cap){
  const n=C[0].length,D=cap+1,STR=204,NB=D*D*D*STR,inc=[D*D*STR,D*STR,STR];
  const off=Array.from({length:8},(_,m)=>inc.reduce((a,v,j)=>a+((m>>j&1)?v:0),0));
  const slot=(m,k)=>m?1+(m-1)*29+k:0;
  let cur=new Float64Array(NB),next=new Float64Array(NB),total=0,visited=0;cur[0]=1;
  const mod=x=>(x+29)%29;
  for(let t=0;t<=n+cap;t++){
    if(t>=n){const d=t-n,base=d*(inc[0]+inc[1]+inc[2]);total+=cur[base];cur[base]=0;}
    if(t===n+cap)break;
    next.fill(0);
    const lo=Math.max(0,t-n),hi=Math.min(cap,t);
    const pre=Array.from({length:3},(_,j)=>Array.from({length:D},(_,d)=>{
      const i=t-d;if(i<0||i>n)return null;
      if(i===n)return {inactive:true,allow:false,e:new Float64Array(29).fill(1),q:new Float64Array(29),delta:-1};
      const c=C[j][i],p=i?C[j][i-1]:-1,a=c===p?1-s:1,e=new Float64Array(29),q=new Float64Array(29);
      for(let k=0;k<29;k++){e[k]=29*f[mod(c-k)]*a;if(i>0)q[k]=f[mod(p-k)]*s;}
      return {inactive:false,allow:i>0&&d<cap,e,q,delta:i?mod(c-p):-1};
    }));
    for(let d0=lo;d0<=hi;d0++)for(let d1=lo;d1<=hi;d1++)for(let d2=lo;d2<=hi;d2++){
      const base=d0*inc[0]+d1*inc[1]+d2*inc[2],a=pre[0][d0],b=pre[1][d1],c=pre[2][d2];
      const inactive=(a.inactive?1:0)|(b.inactive?2:0)|(c.inactive?4:0),active=7^inactive;
      if(!active)continue;
      const allowed=(a.allow?1:0)|(b.allow?2:0)|(c.allow?4:0);
      const valid=[];
      for(let m=0;m<8;m++){
        if(m&~allowed)continue;
        let delta=-1,ok=true;
        for(const [j,o] of [[0,a],[1,b],[2,c]])if(m>>j&1){if(delta>=0&&delta!==o.delta)ok=false;delta=o.delta;}
        if(ok)valid.push([m,delta,base+off[m|inactive]]);
      }
      // Every active pending track emits using the already fixed plaintext;
      // the key prior is still paid once for this common tick.
      for(let p=0;p<8;p++){
        if(p&~active)continue;
        const options=valid.filter(v=>!(v[0]&p));
        const p0=p&1,p1=p&2,p2=p&4;
        if(p===0&&cur[base]===0)continue;
        for(let k=0;k<29;k++){
          const mass=cur[base+slot(p,k)]/29;
          if(!mass)continue;visited++;
          const e0=p0?29:a.e[k],e1=p1?29:b.e[k],e2=p2?29:c.e[k];
          const q0=a.q[k],q1=b.q[k],q2=c.q[k];
          for(const [m,delta,dest] of options){
            const w=mass*(m&1?q0:e0)*(m&2?q1:e1)*(m&4?q2:e2);
            next[dest+slot(m,m?mod(k+delta):0)]+=w;
          }
        }
      }
    }
    [cur,next]=[next,cur];
  }
  function independent(a){
    let q=new Float64Array(D);q[0]=1;
    for(let i=1;i<a.length;i++){const p=new Float64Array(D),accept=a[i]===a[i-1]?1-s:1;
      for(let d=0;d<D;d++){p[d]+=q[d]*accept;if(d<cap)p[d+1]+=q[d]*s/29;}q=p;
    }
    return q.reduce((x,y)=>x+y,0);
  }
  const logNull=C.reduce((z,a)=>z+Math.log(independent(a)),0);
  return {logCommon:Math.log(total),logNull,logLR:Math.log(total)-logNull,visited,cap,n}
}
function brute(C,f,s,cap){
  const n=C[0].length,mod=x=>(x+29)%29;
  function rec(i,p,d){if(i.every(x=>x===n))return 1;let z=0;
    for(let k=0;k<29;k++){
      const ops=[[],[],[]];
      for(let j=0;j<3;j++){
        if(i[j]===n){ops[j].push([i[j],-1,d[j],1]);continue;}
        const c=C[j][i[j]],prev=i[j]?C[j][i[j]-1]:-1,x=mod(c-k);
        if(p[j]>=0){if(x===p[j])ops[j].push([i[j]+1,-1,d[j],29]);continue;}
        ops[j].push([i[j]+1,-1,d[j],29*f[x]*(c===prev?1-s:1)]);
        if(i[j]&&d[j]<cap)ops[j].push([i[j],mod(prev-k),d[j]+1,s*f[mod(prev-k)]]);
      }
      for(const a of ops[0])for(const b of ops[1])for(const c of ops[2])z+=a[3]*b[3]*c[3]*rec([a[0],b[0],c[0]],[a[1],b[1],c[1]],[a[2],b[2],c[2]])/29;
    }return z;
  }
  return rec([0,0,0],[-1,-1,-1],[0,0,0]);
}
function run(raw,config={}){
  const gp=JSON.parse(raw[0]),solved=JSON.parse(raw[1]),s=.81288,N=config.N||128,cap=config.cap??Math.ceil(N/16);
  const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
  function native(t){const a=[];for(const w of t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let j=0;j<w.length;){const q=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));if(!q)throw Error("native");a.push(q.i);j+=q.t.length;}}return a;}
  const donors=raw.slice(2).map(native);
  if(donors.map(x=>x.length).join(",")!=="62492,217106,321327")throw Error("donor size");
  const p57=solved.sections.find(x=>x.name==="p57_parable").source_text;
  const p57r=[...p57].map(x=>gp.runes.indexOf(x)).filter(x=>x>=0);
  if(native("PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE").join(",")!==p57r.join(","))throw Error("p57 control");
  const f=Array(29).fill(8/29);for(const a of donors)for(let i=0;i<Math.floor(a.length*.8);i++)f[a[i]]++;
  const total=f.reduce((a,b)=>a+b);for(let j=0;j<29;j++)f[j]/=total;
  function seeded(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;}}
  function plant(P,seed,independent=false){const rng=seeded(seed),C=P.map(()=>[]),pos=[0,0,0],pend=[false,false,false],skip=[0,0,0];while(pos.some((x,j)=>x<P[j].length)){const k=Math.floor(rng()*29);for(let j=0;j<3;j++){if(pos[j]===P[j].length)continue;const kj=independent?Math.floor(rng()*29):k,c=(P[j][pos[j]]+kj)%29;if(!pend[j]&&pos[j]>0&&C[j].at(-1)===c&&rng()<s){pend[j]=true;skip[j]++;continue;}C[j].push(c);pos[j]++;pend[j]=false;}}return {C,skip}}
  const toy=[[1,1],[2,3],[5,9]],m=marginal(toy,f,s,1),b=brute(toy,f,s,1);
  if(Math.abs(Math.exp(m.logCommon)-b)>1e-10*Math.max(1,b))throw Error("toy mismatch");
  const results=[],nulls=[];
  const start=config.startTrial||0,trials=config.trials||4;
  for(let q=start;q<start+trials;q++){
    const P=donors.map((a,j)=>a.slice(Math.floor(a.length*.82)+q*1027+j*71,Math.floor(a.length*.82)+q*1027+j*71+N)),p=plant(P,0xBAAD1200+q);
    results.push({q,skip:p.skip,...marginal(p.C,f,s,cap)});
  }
  for(let q=0;q<(config.nulls||4);q++){
    const P=donors.map((a,j)=>a.slice(Math.floor(a.length*.94)+q*499+j*31,Math.floor(a.length*.94)+q*499+j*31+N)),p=plant(P,0x1FDEA100+q,true);
    nulls.push({q,skip:p.skip,...marginal(p.C,f,s,cap)});
  }
  // Sign separation is a frozen small-sample gate, not a significance claim.
  const gate=results.filter(x=>x.logLR>0).length>=3&&nulls.every(x=>x.logLR<0);
  const original=[];
  if(gate&&config.original){const full=[24,25,26].map(p=>gp.pages[p].indices);for(const offsets of [[0,0,0],[3,2,1]])original.push({offsets,...marginal(full.map((a,j)=>a.slice(offsets[j],offsets[j]+N)),f,s,cap)});}
  return {config:{N,cap,s,unigram:"first 80% of three donors; Dirichlet total8"},toy:{dp:Math.exp(m.logCommon),brute:b},results,nulls,gate,original}
}
const cfg={N:128,cap:8,trials:4,nulls:4,original:true};console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")),cfg),null,2));
