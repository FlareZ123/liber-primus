'use strict';
const fs=require('node:fs');
const path=require('node:path');
function experiment(C,G){
  const assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29;
  const page=n=>C.pages.find(p=>p.page===n).indices,c55=page(55),c56=page(56),c57=page(57);
  assert(c55.length===76&&c56.length===85&&c57.length===95,"terminal lengths");
  const primes=[];for(let n=2;primes.length<84;n++)if(!primes.some(p=>p*p<=n&&n%p===0))primes.push(n);
  let k=0;const p56=c56.map((x,i)=>i===56?0:mod(x-primes[k++]+1));assert(k===84&&c56[56]===0,"F clock");
  k=0;assert(p56.every((x,i)=>c56[i]===(i===56?0:mod(x+primes[k++]-1))),"native p56 replay");
  const originalP=[...Array(76).fill(null),...p56,...c57],originalC=[...c55,...c56,...c57],plantP=[...c57.slice(0,76),...p56,...c57];
  const tokens=G.pages.flatMap(p=>p.tokens),labels=[...new Set(tokens)],all=Array.from({length:256},(_,i)=>i);
  assert(tokens.length===256&&labels.length===161,"grid");
  const inner=all.filter(i=>i>=8&&i<248&&i%8>0&&i%8<7),outer=all.filter(i=>!inner.includes(i));
  assert(inner.length===180&&outer.length===76,"SHED geometry");
  const layouts=[["row-major",all],["SHED-row-major",[...outer,...inner]]];
  const baseN=labels.length+40;
  function features(mode,cell,c){
    const n=labels.length+(mode==="token"?0:40)+(mode==="slope"?1:mode==="lookup"?29:0);
    const a=Array(n).fill(0);a[labels.indexOf(tokens[cell])]=1;
    if(mode!=="token"){a[labels.length+Math.floor(cell/8)]=1;a[labels.length+32+cell%8]=1}
    if(mode==="slope")a[n-1]=c;if(mode==="lookup")a[n-29+c]=1;return a;
  }
  function eliminate(A,y,limit=A[0].length){
    const n=A[0].length,m=A.map((a,i)=>[...a.map(mod),mod(y[i])]),piv=[];let rank=0;
    for(let j=0;j<limit&&rank<m.length;j++){
      let t=rank;while(t<m.length&&m[t][j]===0)t++;if(t===m.length)continue;
      [m[t],m[rank]]=[m[rank],m[t]];let inv=1;while(mod(m[rank][j]*inv)!==1)inv++;
      for(let l=j;l<=n;l++)m[rank][l]=mod(m[rank][l]*inv);
      for(let i=0;i<m.length;i++)if(i!==rank&&m[i][j]){
        const f=m[i][j];for(let l=j;l<=n;l++)m[i][l]=mod(m[i][l]-f*m[rank][l]);
      }
      piv.push(j);rank++;
    }
    const bad=limit===n&&m.slice(rank).some(a=>a[n]!==0);
    function residual(a){
      const x=[...a.map(mod),0];
      for(let i=0;i<rank;i++){const j=piv[i],f=x[j];if(f)for(let l=j;l<=n;l++)x[l]=mod(x[l]-f*m[i][l])}
      return x;
    }
    function predict(a){const x=residual(a);return x.slice(0,n).some(Boolean)?null:mod(-x[n])}
    return {rank,aug:rank+Number(bad),bad,piv,m,residual,predict};
  }
  function projection(A){
    const n=A[0].length,known=eliminate(A.slice(76),Array(180).fill(0));
    const r=A.slice(0,76).map(a=>known.residual(a).slice(0,n));
    return {rank:eliminate(r,Array(76).fill(0)).rank,forced:r.map((a,i)=>a.some(Boolean)?-1:i).filter(i=>i>=0)};
  }
  function bijection(A,y,witness=null,enumerate=true){
    const b=eliminate(A.slice(76),y.slice(76),baseN);
    const residual=b.m.slice(b.rank).map(r=>r.slice(baseN));
    const equations=residual.map(r=>r.slice(0,29)),rhs=residual.map(r=>r[29]);
    // H(0)=0 is a translation gauge; every permutation has sum 0 mod29.
    equations.push(Array.from({length:29},(_,i)=>Number(i===0)),Array(29).fill(1));rhs.push(0,0);
    const r=eliminate(equations,rhs);
    if(r.bad)return {linearInconsistent:true};
    const free=Array.from({length:29},(_,i)=>i).filter(i=>!r.piv.includes(i));
    const coeff=r.piv.filter(i=>i!==0).map(i=>{
      const row=r.m[r.piv.indexOf(i)];
      return [i,row[29],...free.map(j=>mod(-row[j]))];
    });
    let witnessAccepted=null;
    if(witness){
      const w=witness.map(x=>mod(x-witness[0]));
      witnessAccepted=new Set(w).size===29&&equations.every((a,i)=>mod(a.reduce((s,x,j)=>s+x*w[j],0))===rhs[i]);
      assert(witnessAccepted,"known planted permutation survives gauge and residue equations");
    }
    let tested=null,count=null,first=null;
    if(enumerate&&free.length<=5){
      tested=0;count=0;const x=Array(free.length).fill(0);
      function dfs(d,used){
        if(d===free.length){
          tested++;let mask=used;const v=Array(29).fill(0);
          for(let j=0;j<free.length;j++)v[free[j]]=x[j];
          for(const row of coeff){
            let s=row[1];for(let j=0;j<free.length;j++)s+=row[j+2]*x[j];s%=29;
            if(mask&(1<<s))return;mask|=1<<s;v[row[0]]=s;
          }
          count++;if(!first)first=v;return;
        }
        for(let z=1;z<29;z++)if(!(used&(1<<z))){x[d]=z;dfs(d+1,used|(1<<z))}
      }
      dfs(0,1);
      assert(!witness||count>0,"planted permutation enumeration");
    }
    return {linearInconsistent:false,dimension:free.length,free,tested,count,first,witnessAccepted};
  }
  const modes=["token","offsets","slope","lookup"],data=[],controls=[];
  function run(layout,order,mode,P,X,plant=false,witness=null,enumerate=false){
    const A=order.map((cell,i)=>features(mode,cell,X[i]));
    const y=P.map((p,i)=>p===null?0:mode==="slope"||mode==="lookup"?p:mod(p-X[i]));
    const train=eliminate(A.slice(76,161),y.slice(76,161)),full=eliminate(A.slice(76),y.slice(76));
    function predictions(sol,start,end){
      if(sol.bad)return null;let forced=0,correct=0;
      for(let i=start;i<end;i++){const p=sol.predict(A[i]);if(p!==null){forced++;const actual=mode==="token"||mode==="offsets"?mod(p+X[i]):p;if(actual===P[i])correct++}}
      return {forced,correct:plant||start>=76?correct:null};
    }
    const o={layout,mode,train:[train.rank,train.aug],full:[full.rank,full.aug],hold:predictions(train,161,256),target:predictions(full,0,76)};
    if(mode==="lookup"){
      o.projection=projection(A);o.fixedAlphabetProjection=projection(A.map(a=>a.slice(0,baseN)));
      o.permutation=bijection(A,y,witness,enumerate);
    }
    return o;
  }
  function rng(seed){let s=seed>>>0;return n=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s%n}}
  for(const [layout,order] of layouts)for(const mode of modes){
    data.push(run(layout,order,mode,originalP,originalC,false,null,true));
    for(let seed=1;seed<=3;seed++){
      const random=rng(0x330100+seed),F=labels.map(()=>random(29)),R=Array.from({length:32},()=>random(29)),S=Array.from({length:8},()=>random(29));
      const H=Array.from({length:29},(_,i)=>i);
      if(mode==="lookup")for(let i=28;i>0;i--){const j=random(i+1);[H[i],H[j]]=[H[j],H[i]]}
      if(mode==="slope")for(let i=0;i<29;i++)H[i]=mod(5*i);
      const X=order.map((cell,i)=>{
        const pad=F[labels.indexOf(tokens[cell])]+(mode==="token"?0:R[Math.floor(cell/8)]+S[cell%8]);
        return H.indexOf(mod(plantP[i]-pad));
      });
      const o=run(layout,order,mode,plantP,X,true,mode==="lookup"?H:null,seed===1&&layout==="row-major");
      assert(o.train[0]===o.train[1]&&o.full[0]===o.full[1],"plant consistency");
      assert(o.hold.correct===o.hold.forced&&o.target.correct===o.target.forced,"exact forced predictions");
      controls.push({...o,seed});
    }
  }
  let r=eliminate([[1,1]],[7]);assert(r.predict([1,1])===7&&r.predict([1,0])===null,"toy underdetermined");
  r=eliminate([[1,1],[1,28]],[7,3]);assert(r.predict([1,0])===5&&r.predict([0,1])===2,"toy full rank");
  r=eliminate([[1,1],[1,1]],[7,8]);assert(r.bad&&r.aug===2,"toy contradiction");
  assert(data[3].permutation.tested===11793600&&data[3].permutation.count===0,"exhaustive row-major permutation result");
  assert(data[3].fixedAlphabetProjection.rank===41&&data[7].fixedAlphabetProjection.rank===38,"fixed alphabet projection");
  return {source:{p56Replay:85,consumed:84,tokens:labels.length},data,controls};
}
const root=path.resolve(__dirname,'..');
const load=n=>JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus',n),'utf8'));
console.log(JSON.stringify(experiment(load('lp2-corpus.json'),load('lp2-grid-256.json')),null,2));
