// Agent3: p15 ordinal matrix, all affine offsets and all escape symbols.
const fs=require('node:fs');
function experiment(corpus, texts) {
  const mod=(a,n)=>((a%n)+n)%n;
  const A=[[14,22,7,0],[9,1,2,6],[6,4,3,5],[8,23,14,10]], B=[[12,1,4,17],[8,0,14,7],[19,18,0,20],[7,16,1,18]];
  const mat=(m,v)=>m.map(r=>mod(r.reduce((s,x,i)=>s+x*v[i],0),28));
  for(let i=0;i<4;i++){const u=[0,0,0,0];u[i]=1;if(mat(A,mat(B,u)).some((x,j)=>x!==u[j]))throw Error("matrix");}
  const powers=Array.from({length:28},(_,i)=>{let x=1;for(let j=0;j<i;j++)x=x*15%29;return x});
  const logs=Array(29);powers.forEach((x,i)=>logs[x]=i);
  const rank=(p,e)=>p-(p>e), unrank=(v,e)=>v+(v>=e);
  const trans=(s)=>{let a=[];const map=new Map(corpus.translit.map((x,i)=>[x,i]));for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/ING/g,"NG").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");while(w.length){const pair=w.slice(0,2);if(pair.length===2&&map.has(pair)){a.push(map.get(pair));w=w.slice(2)}else{if(map.has(w[0]))a.push(map.get(w[0]));w=w.slice(1)}}}return a};
  const train=trans(texts[0]), seqs=texts.slice(1).map(trans);
  const counts=Array.from({length:29},()=>Array(29).fill(.25));
  for(let i=1;i<train.length;i++)counts[train[i-1]][train[i]]++;
  const score=counts.map(r=>{const sum=r.reduce((a,b)=>a+b,0);return r.map(v=>Math.log(v/sum))});
  const encode=(p,e,k,t,iv)=>{const ranks=p.filter(x=>x!==e).map((x,i)=>mod(rank(x,e)+k[i%4],28));let mixed=[];for(let i=0;i<ranks.length;i+=4){const v=ranks.slice(i,i+4);mixed.push(...(v.length===4?mat(A,v):v))}let c=[iv],j=0;for(const x of p){const d=x===e?0:(t==="log"?powers[mixed[j++]]:mixed[j++]+1);c.push(mod(c[c.length-1]+d,29))}return c};
  const prepare=(c,t)=>{let r=[],pos=[];for(let i=1;i<c.length;i++){let d=mod(c[i]-c[i-1],29);if(d){pos.push(i-1);r.push(t==="log"?logs[d]:d-1)}}let v=[];for(let i=0;i<r.length;i+=4){const z=r.slice(i,i+4);v.push(...(z.length===4?mat(B,z):z))}let slots=Array.from({length:c.length-1},()=>null);pos.forEach((p,i)=>slots[p]=[i%4,v[i]]);return {slots,cut:pos[999]+1,nonzero:r.length}};
  const decode=(slots,e,k)=>slots.map(s=>s===null?e:unrank(mod(s[1]-k[s[0]],28),e));
  const mean=(p,start,end)=>{let n=0,s=0;for(let i=Math.max(1,start);i<end;i++){s+=score[p[i-1]][p[i]];n++}return s/n};
  // Exact factorization of all 28^4 affine offset vectors: unary and cyclic adjacent-lane pair potentials.
  function fit(slots,e,start,end){
    const U=Array.from({length:4},()=>new Float64Array(28)), V=Array.from({length:4},()=>new Float64Array(784));let constant=0;
    const lookup=Array.from({length:28},(_,z)=>Array.from({length:28},(_,k)=>unrank(mod(z-k,28),e)));
    for(let i=Math.max(1,start);i<end;i++){let a=slots[i-1],b=slots[i];
      if(a===null&&b===null){constant+=score[e][e];continue}
      if(a===null){for(let y=0;y<28;y++)U[b[0]][y]+=score[e][lookup[b[1]][y]];continue}
      if(b===null){for(let x=0;x<28;x++)U[a[0]][x]+=score[lookup[a[1]][x]][e];continue}
      if(b[0]!==((a[0]+1)%4))throw Error("lane cycle");
      const v=V[a[0]],la=lookup[a[1]],lb=lookup[b[1]];
      for(let x=0;x<28;x++){let row=score[la[x]],off=x*28;for(let y=0;y<28;y++)v[off+y]+=row[lb[y]]}
    }
    let best=-Infinity,key=null;
    for(let x0=0;x0<28;x0++)for(let x2=0;x2<28;x2++){
      let m1=-Infinity,m3=-Infinity,j1=-1,j3=-1;
      for(let x=0;x<28;x++){
        let a=U[1][x]+V[0][x0*28+x]+V[1][x*28+x2];if(a>m1){m1=a;j1=x}
        let b=U[3][x]+V[2][x2*28+x]+V[3][x*28+x0];if(b>m3){m3=b;j3=x}
      }
      const v=constant+U[0][x0]+U[2][x2]+m1+m3;if(v>best){best=v;key=[x0,j1,x2,j3]}
    }
    const direct=mean(decode(slots,e,key),start,end),n=end-Math.max(1,start);
    if(Math.abs(direct-best/n)>1e-9)throw Error("factor objective mismatch");
    return {key,mean:direct};
  }
  function solve(c,truth=null,heldBound=false){
    let best=null, bound=-Infinity, candidates=0;
    for(const t of ["cyclic","log"]){const s=prepare(c,t);for(let e=0;e<29;e++){const f=fit(s.slots,e,0,s.cut);candidates++;if(!best||f.mean>best.train){const p=decode(s.slots,e,f.key);best={t,e,key:f.key,train:f.mean,held:mean(p,s.cut,p.length),cut:s.cut,nonzero:s.nonzero,preview:p.slice(0,120).map(x=>corpus.translit[x]).join(" "),replay:encode(p,e,f.key,t,c[0]).every((x,i)=>x===c[i]),...(truth?{matches:p.filter((x,i)=>x===truth[i]).length,heldMatches:p.slice(s.cut).filter((x,i)=>x===truth[i+s.cut]).length,heldLength:p.length-s.cut}:{})}}
      if(heldBound)bound=Math.max(bound,fit(s.slots,e,s.cut,s.slots.length).mean);
    }}
    return {...best,candidates, ...(heldBound?{allKeyHeldUpper:bound}:{})};
  }
  const c=corpus.pages.filter(p=>p.page>=16&&p.page<=22).flatMap(p=>p.indices);
  if(c.length!==1744)throw Error("original length");
  const plants=seqs.map((s,i)=>{let p=s.slice(300,300+c.length-1),e=[28,11][i],k=[[3,9,17,22],[25,2,14,8]][i],t=["cyclic","log"][i];if(p.length!==c.length-1)throw Error("plant length");let ct=encode(p,e,k,t,7+i);return {truth:{e,k,t},truthTrain:mean(p,0,prepare(ct,t).cut),truthHeld:mean(p,prepare(ct,t).cut,p.length),repeats:p.filter(x=>x===e).length,fit:solve(ct,p)}});
  const original=solve(c,null,true);
  return {trainRunes:train.length,sourceRunes:c.length,sourceRepeats:c.slice(1).filter((x,i)=>x===c[i]).length,searchKeys:2*29*28**4,plants,original};
}
const names=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
const read=p=>fs.readFileSync(p,'utf8');
const lines=s=>s.split(/\r?\n/).slice(149,450).join('\n');
console.log(JSON.stringify(experiment(JSON.parse(read(names[0])),names.slice(1).map(p=>lines(read(p)))),null,2));
