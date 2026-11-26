#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
function core(data){
 const src=JSON.parse(data[0]),N=29,Q=28,AIO=[3,10,24],mod=(x,p)=>((x%p)+p)%p,ensure=(v,s)=>{if(!v)throw Error(s)};
 const C=src.pages.slice(16,23).flatMap(p=>p.indices),begin=src.pages.slice(0,16).reduce((a,p)=>a+p.indices.length,0),cut=src.pages.slice(16,19).reduce((a,p)=>a+p.indices.length,0);
 let at=0,start=0,cur=0,sites=[];const rs=new Set(src.runes);
 function flush(){if(cur===1&&start>=begin&&start<begin+C.length)sites.push(start-begin);cur=0}
 for(const ch of data[1].split("%").slice(0,55).join("%")){if(rs.has(ch)){if(!cur)start=at;cur++;at++}else if(ch!=="%"&&ch!=="/"&&!/\s/u.test(ch))flush()}flush();
 ensure(at===12956&&C.length===1744&&cut===800&&sites.length===17,"source counts");
 const toks=src.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(t){let out=[],ss=[];for(const m of t.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").matchAll(/[A-Z]+/g)){const w=m[0].replace(/ING/g,"NG").replace(/IO/g,"IA");let a=[];for(let i=0;i<w.length;){const tok=toks.find(x=>w.startsWith(x.s,i));if(tok){a.push(tok.i);i+=tok.s.length}else i++}if(a.length===1&&AIO.includes(a[0]))ss.push(out.length);out.push(...a)}return {out,ss}}
 const tr=native(data[2]).out,h1=new Float64Array(N),h2=new Float64Array(N*N),h3=new Float64Array(N**3),log3=new Float64Array(N**3);
 for(let i=0;i<tr.length;i++){h1[tr[i]]++;if(i)h2[tr[i-1]*N+tr[i]]++;if(i>1)h3[(tr[i-2]*N+tr[i-1])*N+tr[i]]++}
 for(let a=0;a<N;a++)for(let b=0;b<N;b++){let n2=0,n3=0;for(let c=0;c<N;c++){n2+=h2[b*N+c];n3+=h3[(a*N+b)*N+c]}for(let c=0;c<N;c++){let p1=(h1[c]+.5)/(tr.length+N*.5),p2=(h2[b*N+c]+10*p1)/(n2+10);log3[(a*N+b)*N+c]=Math.log((h3[(a*N+b)*N+c]+10*p2)/(n3+10))}}
 function score(p,l,u){let s=0;for(let i=l+2;i<u;i++)s+=log3[(p[i-2]*N+p[i-1])*N+p[i]];return s/(u-l-2)}
 const pow=[],logs=Array(N).fill(-1);let x=1;for(let i=0;i<Q;i++){pow.push(x);logs[x]=i;x=x*15%N}ensure(new Set(pow).size===28,"root");
 const groups=[[0,1,2],[3],[4,5,6,7,8,9],[10],[11,12,13,14,15,16,17,18,19,20,21,22,23],[24],[25,26,27,28]],rank=(p,e)=>p>e?p-1:p,unrank=(p,e)=>p>=e?p+1:p;
 function clock(c,hold){let pos=Array(c.length).fill(-1),d=Array(c.length).fill(0),k=0;for(let i=1;i<c.length;i++){d[i]=mod(c[i]-c[i-1],N);pos[i]=k;if(d[i]||!hold)k++}return {pos,d}}
 function keyStream(a,seed,n){let k=seed.slice(0,4);for(let i=4;i<n;i++)k.push(mod(seed[4]+a[0]*k[i-1]+a[1]*k[i-2]+a[2]*k[i-3]+a[3]*k[i-4],Q));return k}
 function enc(p,a,seed,e,hold,read){const k=keyStream(a,seed,p.length);let c=[p[0]],t=0;for(let i=1;i<p.length;i++){if(p[i]===e){c.push(c[i-1]);if(!hold)t++}else{let q=mod(rank(p[i],e)+k[t++],Q);c.push(mod(c[i-1]+(read?pow[q]:q+1),N))}}return c}
 function dec(c,a,seed,e,hold,read){const k=keyStream(a,seed,c.length),cl=clock(c,hold);return c.map((v,i)=>i===0?v:cl.d[i]===0?e:unrank(mod((read?logs[cl.d[i]]:cl.d[i]-1)-k[cl.pos[i]],Q),e))}
 const vec=(v,p,n)=>Array.from({length:n},(_,i)=>Math.floor(v/p**i)%p),dot=(r,x,p)=>mod(r[0]*x[0]+r[1]*x[1]+r[2]*x[2]+r[3]*x[3]+r[4]*x[4],p);
 function forms(a,p,positions){const ring=Array.from({length:4},(_,i)=>Int32Array.from({length:5},(_,j)=>+(i===j))),out=[];let n=0;for(let t=0;t<=positions[positions.length-1];t++){if(t>=4){const u=ring[t%4],v=ring[(t-1)%4],w=ring[(t-2)%4],z=ring[(t-3)%4];for(let j=0;j<5;j++)u[j]=(a[0]*v[j]+a[1]*w[j]+a[2]*z[j]+a[3]*u[j]+(j===4?1:0))%p}if(t===positions[n]){out.push(Array.from(ring[t%4]));n++}}ensure(out.length===positions.length,"forms");return out}
 function independent7(rows){
  const basis=[],selected=[];for(let i=0;i<10;i++){let r=rows[i].slice();for(const b of basis){const v=r[b.col];if(v)r=r.map((x,j)=>mod(x-v*b.row[j],7))}let col=r.findIndex(v=>v!==0);if(col<0)continue;let inv=1;while(r[col]*inv%7!==1)inv++;r=r.map(x=>x*inv%7);basis.push({col,row:r});selected.push(i);if(selected.length===5)break}
  const d=selected.length,m=selected.map((v,i)=>rows[v].concat(Array.from({length:d},(_,j)=>+(i===j)))),piv=[];let t=0;
  for(let col=0;col<5&&t<d;col++){let u=t;while(u<d&&!m[u][col])u++;if(u===d)continue;[m[t],m[u]]=[m[u],m[t]];let inv=1;while(m[t][col]*inv%7!==1)inv++;m[t]=m[t].map(x=>x*inv%7);for(let j=0;j<d;j++){if(j===t)continue;const f=m[j][col];if(f)m[j]=m[j].map((x,k)=>mod(x-f*m[t][k],7))}piv.push(col);t++}
  ensure(t===d,"rank");return {selected,m,piv,free:Array.from({length:5},(_,i)=>i).filter(i=>!piv.includes(i))};
 }
 const lanes=n=>Array.from({length:n},(_,i)=>1<<(3*i)).reduce((a,b)=>a|b,0),trainLanes=lanes(10),heldLanes=lanes(7),good=(v,m)=>((v|(v>>>1)|(v>>>2))&m)===m;
 function tables(p,d,ss,read){
  return groups.map(es=>{const e=es[0];return ss.map(i=>{const y=read?logs[d[i]]:d[i]-1;let a=Array(p).fill(0);for(let j=0;j<3;j++){let v=AIO[j];if(v!==e)a[mod(y-rank(v,e),p)]|=1<<j}return a})})
 }
 function signature(rows,state,p,tab){let sig=0;for(let i=0;i<10;i++){let b=tab[i][dot(rows[i],state,p)];if(!b)return null;sig|=b<<(3*i)}let held=0;for(let i=10;i<17;i++)held|=tab[i][dot(rows[i],state,p)]<<(3*(i-10));return [sig,held]}
 function candidates(p,cl,ss){
  const positions=ss.map(i=>cl.pos[i]),tabs=[tables(p,cl.d,ss,0),tables(p,cl.d,ss,1)],out=Array.from({length:2},()=>Array.from({length:7},()=>[]));
  for(let ai=0;ai<p**4;ai++){const a=vec(ai,p,4),rows=forms(a,p,positions);
   if(p===4){for(let si=0;si<4**5;si++){const s=vec(si,4,5);for(let read=0;read<2;read++)for(let g=0;g<7;g++){const sig=signature(rows,s,4,tabs[read][g]);if(sig)out[read][g].push({a,s,sig})}}}
   else{const {selected,m,piv,free}=independent7(rows);
    for(let read=0;read<2;read++)for(let g=0;g<7;g++){const tab=tabs[read][g],opts=selected.map(i=>Array.from({length:7},(_,j)=>j).filter(j=>tab[i][j]!==0)),y=Array(selected.length).fill(0);
     function rec(j){if(j<y.length){for(const v of opts[j]){y[j]=v;rec(j+1)}return}const rhs=m.map(row=>mod(row.slice(5).reduce((a,b,k)=>a+b*y[k],0),7));for(let z=0;z<7**free.length;z++){const s=Array(5).fill(0),fv=vec(z,7,free.length);free.forEach((v,i)=>s[v]=fv[i]);piv.forEach((v,i)=>s[v]=mod(rhs[i]-free.reduce((a,b)=>a+m[i][b]*s[b],0),7));const sig=signature(rows,s,7,tab);if(sig)out[read][g].push({a,s,sig})}}
     rec(0);
    }
   }
  }
  return out;
 }
 const crt=(u,v)=>u+4*mod(2*(v-u),7),combine=(u,v)=>u.map((x,i)=>crt(x,v[i]));
 // Small exact check: the row representation agrees with the scalar recurrence for each ring.
 for(const p of [4,7]){const a=[1,2,3,1],s=[2,1,0,3,2],k=s.slice(0,4);for(let i=4;i<100;i++)k.push(mod(s[4]+a[0]*k[i-1]+a[1]*k[i-2]+a[2]*k[i-3]+a[3]*k[i-4],p));const z=[1,3,4,9,99];ensure(forms(a,p,z).every((r,i)=>dot(r,s,p)===k[z[i]]%p),"symbolic rows")}
 function search(c,ss,truth=null){
  const fit=ss.filter(i=>i>0&&i<cut).slice(0,10),held=ss.filter(i=>i>=cut).slice(0,7),selected=fit.concat(held);
  ensure(fit.length===10&&held.length===7&&selected.every(i=>c[i]!==c[i-1]),"nonrepeat singleton count");
  const runs=[];let fitKeys=0,fullKeys=0,trueKeys=0,best=null;
  for(const hold of [false,true]){const cl=clock(c,hold),u=candidates(4,cl,selected),v=candidates(7,cl,selected);
   for(let read=0;read<2;read++){let fc=0,hc=0,exact=0,per=[];
    for(let g=0;g<7;g++){let f0=0,h0=0;
     for(const a of u[read][g])for(const b of v[read][g]){if(!good(a.sig[0]&b.sig[0],trainLanes))continue;f0+=groups[g].length;if(!good(a.sig[1]&b.sig[1],heldLanes))continue;h0+=groups[g].length;const A=combine(a.a,b.a),s=combine(a.s,b.s);
      for(const e of groups[g]){const p=dec(c,A,s,e,hold,read);ensure(selected.every(i=>AIO.includes(p[i])),"CRT join");ensure(enc(p,A,s,e,hold,read).every((v,i)=>v===c[i]),"replay");if(truth&&p.every((v,i)=>v===truth[i]))exact++;const v0={a:A,seed:s,e,hold,read,train:score(p,1,cut),held:score(p,cut,p.length),heldExact:truth?p.slice(cut).filter((v,i)=>v===truth[cut+i]).length:null,excerpt:p.slice(cut,cut+90).map(v=>src.translit[v]).join("")};if(!best||v0.train>best.train)best=v0}
     }fc+=f0;hc+=h0;per.push({e:groups[g],mod4:u[read][g].length,mod7:v[read][g].length,fit:f0,full:h0});
    }fitKeys+=fc;fullKeys+=hc;trueKeys+=exact;runs.push({hold,read,fit:fc,full:hc,exact,per});
   }
  }return {fitSites:fit,heldSites:held,fitKeys,fullKeys,trueKeys,best,runs}
 }
 const original=search(C,sites),controls=[];
 for(let d=0;d<2;d++){const {out,ss}=native(data[3+d]);let offset=1000;for(;offset+1744<out.length;offset+=100){if(ss.filter(i=>i>=offset+1&&i<offset+cut).length>=10&&ss.filter(i=>i>=offset+cut&&i<offset+C.length).length>=7)break}ensure(offset+C.length<out.length,"control span");const p=out.slice(offset,offset+C.length),s=ss.filter(i=>i>=offset&&i<offset+C.length).map(i=>i-offset),a=d?[13,6,21,3]:[5,9,2,11],seed=d?[15,5,23,11,23]:[9,18,2,7,7],e=d?21:28,hold=!d,read=d,c=enc(p,a,seed,e,hold,read),res=search(c,s,p);ensure(res.trueKeys>=1&&res.best.heldExact===C.length-cut,"positive");controls.push({plant:{offset,a,seed,e,hold,read},...res})}
 return {source:{length:C.length,cut,sites},original,controls};
}
console.log(JSON.stringify(core(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
