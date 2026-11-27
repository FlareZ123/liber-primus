'use strict';
const fs=require('node:fs');
const path=require('node:path');
function experiment(corpus,grid){
  const assert=(x,m)=>{if(!x)throw Error(m)};
  const mod=x=>(x%29+29)%29;
  const [p55,c56,p57]=corpus.pages.slice(-3).map(p=>p.indices);
  assert(p55.length===76&&c56.length===85&&p57.length===95,"terminal sizes");
  const primes=[];for(let n=2;primes.length<85;n++)if(primes.every(p=>p*p>n||n%p))primes.push(n);
  let clock=0;
  const p56=c56.map((c,i)=>i===56?0:mod(c-(primes[clock++]-1)));
  clock=0;assert(p56.every((p,i)=>i===56?(p===0&&c56[i]===0):(p!==0&&mod(p+primes[clock++]-1)===c56[i]))&&clock===84,"authentic p56 replay");
  const row=Array.from({length:256},(_,i)=>i);
  const rim=[...Array.from({length:8},(_,i)=>i),...Array.from({length:30},(_,i)=>8*(i+1)+7),...Array.from({length:8},(_,i)=>255-i),...Array.from({length:30},(_,i)=>8*(30-i))];
  assert(rim.length===76&&new Set(rim).size===76,"perimeter");
  const layouts={row,rim:[...rim,...row.filter(i=>!rim.includes(i))]};
  function evaluate(records){
    const input=new Map(),output=new Map();let functionFailures=0,injectivityFailures=0,first=null;
    for(const r of records){
      const ki=`${r.s},${r.c}`,ko=`${r.s},${r.p}`;
      if(input.has(ki)&&input.get(ki).p!==r.p){functionFailures++;first??={type:"function",a:input.get(ki),b:r}}
      if(output.has(ko)&&output.get(ko).c!==r.c){injectivityFailures++;first??={type:"injective",a:output.get(ko),b:r}}
      if(!input.has(ki))input.set(ki,r);if(!output.has(ko))output.set(ko,r);
    }
    return {distinctInputs:input.size,distinctOutputs:output.size,functionFailures,injectivityFailures,first};
  }
  const affineFit=rs=>{const fits=[];for(let a=0;a<29;a++)for(let b=0;b<29;b++)if(rs.every(r=>mod(r.p+a*r.s+b)===r.c))fits.push([a,b]);return fits};
  const results=[];
  for(const radix of [59,60]){
    const alphabet=radix===59?grid.alphabet.replace("f",""):grid.alphabet;
    const f=grid.pages.flatMap(p=>p.tokens).map(t=>radix*alphabet.indexOf(t[0])+alphabet.indexOf(t[1]));
    assert(f.length===256&&f.every(x=>x>=0&&x<256),"address range");
    if(radix===60)assert(f.every((x,i)=>x===grid.bytes[i]),"radix60 source crosscheck");
    for(const [layout,order] of Object.entries(layouts)){
      assert(new Set(order).size===256,"layout bijection");
      function scatter(xs){const q=Array(256);order.forEach((i,j)=>q[i]=xs[j]);return q}
      function records(c,p){return order.map((i,j)=>({i,j,s:c[f[i]],c:c[i],p:p[i],target:f[i]}))}
      const original=records(scatter([...p55,...c56,...p57]),scatter([...Array(76).fill(null),...p56,...p57]));
      const train=original.slice(76,161),held=original.slice(161),joint=original.slice(76);
      // Construct a native GP plant with C_i=P_i+2*C_f(i)+7 mod29.
      // Solve each orbit by its cycle equation; no unknown C is supplied.
      const a=2,b=7,truth=scatter([...p57.slice(0,76),...p56,...p57]);
      function encrypt(P){
        const C=Array(256).fill(null);
        for(let start=0;start<256;start++){
          if(C[start]!==null)continue;
          let path=[],seen=new Map(),i=start;
          while(C[i]===null&&!seen.has(i)){seen.set(i,path.length);path.push(i);i=f[i]}
          if(C[i]===null){
            const cycle=path.slice(seen.get(i));let pow=1,sum=0;
            for(const k of cycle){sum=mod(sum+pow*(P[k]+b));pow=mod(pow*a)}
            const d=mod(1-pow),inv=Array.from({length:29},(_,j)=>j).find(j=>mod(d*j)===1);
            assert(inv!==undefined,"unique cycle equation");
            C[i]=mod(sum*inv);
          }
          for(let j=path.length-1;j>=0;j--){const k=path[j];if(C[k]===null){assert(C[f[k]]!==null,"known successor");C[k]=mod(P[k]+a*C[f[k]]+b)}}
        }
        assert(C.every((c,i)=>mod(P[i]+a*C[f[i]]+b)===c),"plant replay");
        return C;
      }
      const plantC=encrypt(truth),plant=records(plantC,truth);
      const plantFit=affineFit(plant.slice(76,161));assert(plantFit.length===1&&plantFit[0][0]===a&&plantFit[0][1]===b,"blind affine recovery");
      const [aa,bb]=plantFit[0];
      const recovered=plant.map(r=>mod(r.c-aa*r.s-bb));
      const plantReport={affineFit:plantFit,allSecretCompatibility:evaluate(plant),held57Correct:recovered.slice(161).filter((v,i)=>v===p57[i]).length,held55Correct:recovered.slice(0,76).filter((v,i)=>v===p57[i]).length};
      assert(plantReport.held57Correct===95&&plantReport.held55Correct===76&&!plantReport.allSecretCompatibility.first,"positive controls");
      results.push({radix,layout,p56:evaluate(train),p57:evaluate(held),combined:evaluate(joint),p56AffineFits:affineFit(train),plant:plantReport});
    }
  }
  return {source:{corpus:"054f2a0f780b7d46901acbe3d9bf4f0ac1801165",grid:"2550eae357442912220e05dc51147523a61dd75a"},p56Replay:85,consumingPrimes:84,results};
}
const root=path.join(__dirname,'..','resources','liber-primus');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
console.log(JSON.stringify(experiment(read('lp2-corpus.json'),read('lp2-grid-256.json')),null,2));
