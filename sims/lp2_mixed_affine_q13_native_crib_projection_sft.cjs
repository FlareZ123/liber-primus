'use strict';
const fs=require('node:fs');
const path=require('node:path');
function experiment(corpus,native){
  const M=29,Q=13,T=26,L=42;
  const mod=x=>((x%M)+M)%M;
  const inv=Array.from({length:M},(_,i)=>i===0?0:Array.from({length:M},(_,j)=>j).find(j=>i*j%M===1));
  const assert=(x,msg)=>{if(!x)throw new Error(msg)};
  assert(JSON.stringify(corpus.runes)===JSON.stringify(native.runes),"alphabet mismatch");
  const ix=new Map(corpus.runes.map((v,i)=>[v,i]));
  const sections=native.sections.map(s=>({name:s.name,p:[...s.source_text].filter(ch=>ix.has(ch)).map(ch=>ix.get(ch))}));
  const C=corpus.pages.slice(0,56).flatMap(p=>p.indices);
  assert(C.length===12956,"unexpected source length");
  /** Invert a 3x3 matrix over GP29; null for singular. */
  function invert(rows){
    const a=rows.map((row,i)=>[...row,...[0,1,2].map(j=>+(j===i))]);
    for(let i=0;i<3;i++){
      const k=a.findIndex((row,j)=>j>=i&&row[i]!==0);if(k<0)return null;
      [a[i],a[k]]=[a[k],a[i]];
      const w=inv[a[i][i]];a[i]=a[i].map(v=>mod(v*w));
      for(let j=0;j<3;j++)if(j!==i){const w=a[j][i];a[j]=a[j].map((v,k)=>mod(v-w*a[i][k]));}
    }return a.map(row=>row.slice(3));
  }
  /** Compile exact known-plaintext equations for a single source position. */
  function compile(p){
    const active=[],holds=[];
    for(let i=0;i<T;i++)(p[i]===0?holds:active).push(i);
    const rows=[];
    for(let i=Q;i<active.length;i++){
      const t=active[i],z=active[i-Q];rows.push({t,z,r:[p[t],p[z],1]});
    }
    let piv,mi;
    outer:for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++)for(let k=j+1;k<rows.length;k++){
      const a=[rows[i],rows[j],rows[k]];const b=invert(a.map(x=>x.r));if(b){piv=a;mi=b;break outer;}
    }
    if(!piv)return null;
    const residual=rows.filter(x=>!piv.includes(x)).map(x=>{
      const w=mi[0].map((_,j)=>mod(x.r.reduce((s,v,k)=>s+v*mi[k][j],0)));
      return {t:x.t,z:x.z,w};
    });
    return {p,holds,piv,mi,residual};
  }
  const compiled=[];let singular=0;
  for(const s of sections)for(let i=0;i+L<=s.p.length;i++){
    const v=compile(s.p.slice(i,i+L));if(v)compiled.push({...v,name:s.name,at:i});else singular++;
  }
  /** Exact search: eliminate u,v,d using source-only pivot rows. */
  function search(c){
    let checked=0,compatible=0,projected=0,training=0,exact=0;
    const full=[],trainExamples=[];
    for(const s of compiled){
      const [r0,r1,r2]=s.piv;
      for(let j=0;j+L<=c.length;j++){
        checked++;
        let ok=true;for(const h of s.holds)if(c[j+h]!==0){ok=false;break;}if(!ok)continue;
        compatible++;
        const c0=c[j+r0.t],c1=c[j+r1.t],c2=c[j+r2.t];
        const z0=c[j+r0.z],z1=c[j+r1.z],z2=c[j+r2.z];
        let b=-1;
        for(const x of s.residual){
          const [w0,w1,w2]=x.w;
          const A=mod(c[j+x.t]-w0*c0-w1*c1-w2*c2);
          const B=mod(c[j+x.z]-w0*z0-w1*z1-w2*z2);
          if(B===0){if(A!==0){ok=false;break;}}
          else if(b===-1)b=A*inv[B]%M;
          else if(A!==b*B%M){ok=false;break;}
        }
        if(!ok)continue;projected++;
        for(let bb=b===-1?0:b;bb<=(b===-1?28:b);bb++){
          const rhs=[mod(c0-bb*z0),mod(c1-bb*z1),mod(c2-bb*z2)];
          const [u,v,d]=s.mi.map(row=>mod(row.reduce((a,x,i)=>a+x*rhs[i],0)));
          if(!u)continue;
          training++;
          const active=[];let end=L;
          for(let i=0;i<L;i++){
            if(!s.p[i]){if(c[j+i]){end=i;break;}continue;}
            if(active.length>=Q){const k=active[active.length-Q];
              if(c[j+i]!==mod(u*s.p[i]+v*s.p[k]+bb*c[j+k]+d)){end=i;break;}
            }active.push(i);
          }
          assert(end>=T,"projection false positive");
          const hit={source:s.name,sourceOffset:s.at,cipherOffset:j,u,a:v*inv[u]%M,b:bb,d,matched:end};
          if(trainExamples.length<20)trainExamples.push(hit);
          if(end===L){exact++;full.push(hit);}
        }
      }
    }
    return {checked,compatible,projected,training,exact,full,trainExamples};
  }
  let seed=0x6ca3301;
  const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
  const rr=n=>rand()%n;
  /** Plant complete continuous native-F encryption, with independent primers. */
  function encrypt(p,k){
    const X=Array.from({length:Q},()=>1+rr(28)),Z=Array.from({length:Q},()=>rr(29));
    return p.map(x=>{if(!x)return 0;
      const a=k.u*x%M,c=mod(a+k.a*X.shift()+k.b*Z.shift()+k.d);X.push(a);Z.push(c);return c;
    });
  }
  const controls=[];
  for(let n=0;n<6;n++){
    const s=sections[n+1],start=rr(s.p.length-L+1);
    const k={u:1+rr(28),a:rr(29),b:n===0?0:rr(29),d:rr(29)};
    const pre=sections[(n+3)%sections.length].p.slice(0,17),post=sections[(n+4)%sections.length].p.slice(0,17);
    const p=[...pre,...s.p.slice(start,start+L),...post];
    const c=encrypt(p,k),res=search(c);
    const found=res.full.some(h=>h.source===s.name&&h.sourceOffset===start&&h.cipherOffset===pre.length&&["u","a","b","d"].every(x=>h[x]===k[x]));
    assert(found,"planted key/quote missing: "+n);
    controls.push({n,source:s.name,start,offset:pre.length,key:k,holds:p.slice(pre.length,pre.length+L).filter(x=>x===0).length,exactHits:res.exact,trainingHits:res.training,found});
  }
  const original=search(C);
  return {q:Q,train:T,length:L,sourceLengths:sections.map(s=>({name:s.name,length:s.p.length})),sourceWindows:compiled.length,singular,controls,original};
}
const root=path.join(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
console.log(JSON.stringify(experiment(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
