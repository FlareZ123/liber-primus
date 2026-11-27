// Agent9: exact Fibonacci-exponent Hill receiver with ordinary and latent-F clocks.
"use strict";
function core(corpus, control) {
  const mod=x=>(x%29+29)%29, N=4;
  const I=Array.from({length:N},(_,i)=>Array.from({length:N},(_,j)=>+(i===j)));
  const M=[[10,3,20,22],[1,22,21,25],[11,17,19,7],[21,17,12,22]];
  const S=M.map(a=>a.slice()); S[3][0]=8;S[3][1]=12;
  const mul=(a,b)=>a.map(row=>b[0].map((_,j)=>mod(row.reduce((s,x,i)=>s+x*b[i][j],0))));
  const eq=(a,b)=>a.every((row,i)=>row.every((x,j)=>x===b[i][j]));
  const transpose=a=>a[0].map((_,i)=>a.map(row=>row[i]));
  const pow=(m,e)=>{let a=I,b=m;while(e){if(e%2)a=mul(a,b);b=mul(b,b);e=Math.floor(e/2);}return a;};
  const fib=(order)=>{let a=0,b=1,t=[];do{t.push(a);[a,b]=[b,(a+b)%order];}while(a!==0||b!==1);return t;};
  const matvec=(m,a)=>{const out=[];for(let i=0;i<4;i++){const q=m[i];out.push((q[0]*a[0]+q[1]*a[1]+q[2]*a[2]+q[3]*a[3])%29);}return out;};
  const variants=[];
  for(const [name,m,order] of [["printed",M,101040],["signed",S,812]]){
    if(!eq(pow(m,order),I))throw Error("bad matrix order");
    const primes=order===101040?[2,3,5,421]:[2,7,29];
    for(const p of primes)if(order%p===0&&eq(pow(m,order/p),I))throw Error("nonminimal order");
    const tape=fib(order);
    for(const tr of [0,1])for(const sign of [1,-1]){
      const a=tr?transpose(m):m;
      const seq=tape.map(x=>pow(a,((sign*x)%order+order)%order));
      const inv=tape.map(x=>pow(a,((-sign*x)%order+order)%order));
      for(let i=0;i<tape.length;i++)if(!eq(mul(seq[i],inv[i]),I))throw Error("inverse");
      variants.push({name,tr,sign,period:tape.length,seq,inv});
    }
  }
  function encodeLatin(s){
    let out=[];const labels=corpus.translit;
    for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){
      w=w.replace(/QU/g,"CW").replace(/K/g,"C").replace(/V/g,"U").replace(/Z/g,"S");
      for(let i=0;i<w.length;){let k=labels.indexOf(w.slice(i,i+2));if(k>=0&&i+1<w.length){out.push(k);i+=2;}else {k=labels.indexOf(w[i++]);if(k>=0)out.push(k);}}
    }
    return out;
  }
  const donor=encodeLatin(control), train=donor.slice(0,Math.floor(donor.length/2));
  const n=29**3, counts=new Float64Array(n).fill(.2), ctx=new Float64Array(29**2).fill(29*.2);
  for(let i=2;i<train.length;i++){const q=29*train[i-2]+train[i-1];counts[q*29+train[i]]++;ctx[q]++;}
  const lp=counts.map((x,i)=>Math.log(x/ctx[Math.floor(i/29)]));
  function score(a,start,end){let s=0,nn=0;for(let i=Math.max(2,start);i<end;i++){s+=lp[(a[i-2]*29+a[i-1])*29+a[i]];nn++;}return s/nn;}
  function transform(a,v,phase,decode=false,hold=false){
    const mats=decode?v.inv:v.seq, out=a.slice();let pos=[];
    for(let i=0;i<a.length;i++)if(!hold||a[i]!==0)pos.push(i);
    if(pos.length%4)throw Error("incomplete block");
    for(let j=0;j<pos.length;j+=4){const ix=pos.slice(j,j+4),q=matvec(mats[(phase+j/4)%v.period],ix.map(k=>a[k]));for(let k=0;k<4;k++)out[ix[k]]=q[k];}
    return out;
  }
  // Generate all legal consuming four-tuples, granting every visible zero as either a hold or a consumed output.
  function makeChoices(c){
    const cache=new Array(c.length+1);
    function get(start){
      if(cache[start])return cache[start];
      const out=[];
      function walk(i,vals){
        if(vals.length===4){out.push([i,vals]);return;}
        if(i===c.length)return;
        if(c[i]===0)walk(i+1,vals);
        walk(i+1,vals.concat(c[i]));
      }
      walk(start,[]);cache[start]=out;return out;
    }
    let tail=c.length;while(tail&&c[tail-1]===0)tail--;
    return {get,tail};
  }
  function legal(c,choices,v,phase){
    let states=[0],b=0,furthest=0,peak=1;
    while(states.length){
      if(states.some(i=>i>=choices.tail))return {complete:true,furthest:c.length,peak,blocks:b};
      const m=v.inv[(phase+b)%v.period],next=new Set();
      for(const i of states)for(const [end,x] of choices.get(i)){
        if(matvec(m,x).every(y=>y!==0)){next.add(end);furthest=Math.max(furthest,end);}
      }
      states=Array.from(next);peak=Math.max(peak,states.length);b++;
    }
    return {complete:false,furthest,peak,blocks:b};
  }
  const C=corpus.pages.slice(16,23).flatMap(p=>p.indices);
  if(C.length!==1744)throw Error("source length");
  const half=C.length/2, choices=makeChoices(C);
  const d0=donor.slice(train.length,train.length+C.length), d1=donor.slice(train.length+C.length,train.length+2*C.length);
  const plants=[{v:0,phase:137,p:d0},{v:6,phase:211,p:d1}];
  for(const plant of plants)plant.c=transform(plant.p,variants[plant.v],plant.phase);
  const data=[C,...plants.map(p=>p.c)];
  const best=data.map(()=>null), natural=[], phaseStats=[];
  let candidates=0, complete=0, maxPrefix=0, peak=0, fullWitnesses=[];
  for(let k=0;k<variants.length;k++){
    const v=variants[k];let pass=0,far=0,localPeak=0;
    for(let phase=0;phase<v.period;phase++){
      candidates++;
      const a=legal(C,choices,v,phase);
      if(a.complete){complete++;pass++;fullWitnesses.push({v:k,phase,...a});}
      far=Math.max(far,a.furthest);localPeak=Math.max(localPeak,a.peak);
      for(let di=0;di<data.length;di++){
        const p=transform(data[di],v,phase,true),fit=score(p,0,half);
        if(!best[di]||fit>best[di].fit)best[di]={v:k,phase,fit,held:score(p,half,p.length),p};
      }
      if(phase===0||phase===17){
        const p=transform(C,v,phase,true);
        natural.push({v:k,phase,fit:score(p,0,half),held:score(p,half,p.length),legal:a});
      }
    }
    phaseStats.push({v:k,name:v.name,tr:v.tr,sign:v.sign,period:v.period,pass,far,peak:localPeak});
    maxPrefix=Math.max(maxPrefix,far);peak=Math.max(peak,localPeak);
  }
  const outBest=best.map((x,i)=>({...x,p:undefined,preview:x.p.slice(0,120).map(z=>corpus.translit[z]).join(""),replay:transform(x.p,variants[x.v],x.phase).every((z,k)=>z===data[i][k]),exact:i?x.p.filter((z,k)=>z===plants[i-1].p[k]).length:null}));
  const holdPlants=[];
  for(let k=0;k<variants.length;k++)for(const phase of [0,17,Math.floor(variants[k].period/3)]){
    const p=d0.slice();while(p.filter(x=>x!==0).length%4)p.pop();
    const c=transform(p,variants[k],phase,false,true);
    const a=legal(c,makeChoices(c),variants[k],phase);
    if(!a.complete)throw Error("transparent F plant rejected");
    holdPlants.push({v:k,phase,length:p.length,zero:p.filter(x=>!x).length,complete:a.complete});
  }
  return {candidates,complete,maxPrefix,peak,phaseStats,fullWitnesses,natural,best:outBest,holdPlants,donorLength:donor.length,sourceZero:C.filter(x=>!x).length,controlHeld:[score(d0,half,d0.length),score(d1,half,d1.length)]};
}
if (require.main === module) {
  const fs = require("node:fs");
  const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
  const control = fs.readFileSync("resources/control/gibran_prophet_58585.txt", "utf8");
  console.log(JSON.stringify(core(corpus, control), null, 2));
}
module.exports = {core};
