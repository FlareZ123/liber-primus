'use strict';
// Agent28: exact paired latent-F shared-suffix-pad marginal and inverse.
const fs=require('node:fs');
function experiment(inputs,caseIndex){
 const c=JSON.parse(inputs[0]),n=JSON.parse(inputs[1]),Q=29,B=30,S=B**4,mod=x=>((x%Q)+Q)%Q,assert=(b,m)=>{if(!b)throw Error(m)};
 const alpha=new Map(c.translit.map((x,i)=>[x,i]));alpha.set("ING",21);alpha.set("IO",27);
 const native=s=>Array.from(s).map(x=>c.runes.indexOf(x)).filter(x=>x>=0);
 function donor(s){const start=/\*\*\* START OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[^\r\n]*\*\*\*/i.exec(s);if(start)s=s.slice(start.index+start[0].length);const end=/\*\*\* END OF (?:THIS|THE) PROJECT GUTENBERG EBOOK/i.exec(s);if(end)s=s.slice(0,end.index);let a=[];for(let t of s.match(/[A-Za-z]+/g)||[]){t=t.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");while(t.length){let ok=false;for(let k=Math.min(t.length,3);k>=1;k--){const v=alpha.get(t.slice(0,k));if(v!==undefined){a.push(v);t=t.slice(k);ok=true;break}}assert(ok,"translit")}}return a}
 const donors=inputs.slice(2).map(donor),cuts=donors.map(d=>Math.floor(d.length*.7)),test=donors.map((d,i)=>d.slice(cuts[i])),train=donors.map((d,i)=>d.slice(0,cuts[i]).reverse());
 const uni=new Float64Array(Q),bi=new Float64Array(Q*Q),tri=new Float64Array(Q**3);
 for(const d of train)for(let i=0;i<d.length;i++){uni[d[i]]++;if(i)bi[d[i-1]*Q+d[i]]++;if(i>=2)tri[(d[i-2]*Q+d[i-1])*Q+d[i]]++}
 const total=uni.reduce((a,b)=>a+b,0),u=Array.from(uni,x=>(x+.5)/(total+.5*Q)),bb=new Float64Array(Q*Q),prob=new Float64Array(B*B*Q),logs=new Float64Array(B*B*Q);
 for(let x=0;x<Q;x++){let k=0;for(let y=0;y<Q;y++)k+=bi[x*Q+y];for(let y=0;y<Q;y++)bb[x*Q+y]=(bi[x*Q+y]+16*u[y])/(k+16)}
 for(let x=0;x<B;x++)for(let y=0;y<B;y++){let k=0;if(x<Q&&y<Q)for(let z=0;z<Q;z++)k+=tri[(x*Q+y)*Q+z];let check=0;for(let z=0;z<Q;z++){let p=y===Q?u[z]:x===Q?bb[y*Q+z]:(tri[(x*Q+y)*Q+z]+32*bb[y*Q+z])/(k+32);let i=(x*B+y)*Q+z;prob[i]=p;logs[i]=Math.log(p);check+=p}assert(Math.abs(check-1)<1e-10,"LM normalization")}
 const logadd=(a,b)=>a===-Infinity?b:b===-Infinity?a:Math.max(a,b)+Math.log1p(Math.exp(-Math.abs(a-b)));
 function masks(y,known){let out=[new Uint8Array(y.length)];for(let i=0;i<y.length;i++)if(y[i]===0&&!(i===0&&known!==null&&known!==0)){out=out.concat(out.map(m=>{let k=m.slice();k[i]=1;return k}));}return out}
 const idx=(a,b,c,d)=>((a*B+b)*B+c)*B+d, init=idx(Q,Q,Q,Q);
 let f=new Float64Array(S),v=new Float64Array(S),nf=new Float64Array(S),nv=new Float64Array(S),stamp=new Int32Array(S),prev=new Int32Array(S),time=0;
 function events(y,z,m,k){let i=0,j=0,e=[];while(i<y.length||j<z.length){while(i<y.length&&m[i])e.push([i++,-1,0]);while(j<z.length&&k[j])e.push([-1,j++,1]);if(i<y.length&&j<z.length)e.push([i++,j++,2]);else if(i<y.length)e.push([i++,-1,3]);else if(j<z.length)e.push([-1,j++,4]);}return e}
 function joint(y,z,m,k,known,trace=false){
  let ids=[init];f[init]=1;v[init]=0;let evi=0,max=1;const ev=events(y,z,m,k),hist=[];
  for(const [i,j,kind] of ev){const t=++time,ni=[],delta=kind===2?mod(z[j]-y[i]):0,ka=i===0&&known!==null?known:-1;
   function put(s,weight,val,old){if(stamp[s]!==t){stamp[s]=t;ni.push(s);nf[s]=weight;nv[s]=val;prev[s]=old}else{nf[s]+=weight;if(val>nv[s]){nv[s]=val;prev[s]=old}}}
   for(let q=0;q<ids.length;q++){
    const s=ids[q],d=s%B,cc=Math.floor(s/B)%B,b=Math.floor(s/B**2)%B,a=Math.floor(s/B**3),ab=(a*B+b)*Q,cd=(cc*B+d)*Q,fs=f[s],vs=v[s];
    if(kind===0){if(ka<0||ka===0)put(idx(b,0,cc,d),fs*prob[ab],vs+logs[ab],q)}
    else if(kind===1)put(idx(a,b,d,0),fs*prob[cd],vs+logs[cd],q);
    else if(kind===2){for(let p=1;p<Q;p++){if(ka>=0&&ka!==p)continue;let r=mod(p+delta);if(r)put(idx(b,p,d,r),fs*prob[ab+p]*prob[cd+r]/Q,vs+logs[ab+p]+logs[cd+r]-Math.log(Q),q)}}
    else if(kind===3){for(let p=1;p<Q;p++)if(ka<0||ka===p)put(idx(b,p,cc,d),fs*prob[ab+p]/Q,vs+logs[ab+p]-Math.log(Q),q)}
    else{for(let r=1;r<Q;r++)put(idx(a,b,d,r),fs*prob[cd+r]/Q,vs+logs[cd+r]-Math.log(Q),q)}
   }
   if(!ni.length)return {evi:-Infinity,best:-Infinity};
   let sum=0;for(const s of ni)sum+=nf[s];assert(sum>0,"mass");evi+=Math.log(sum);for(const s of ni)nf[s]/=sum;
   if(trace)hist.push({ids:Int32Array.from(ni),prev:Int32Array.from(ni,s=>prev[s])});
   [f,nf]=[nf,f];[v,nv]=[nv,v];ids=ni;max=Math.max(max,ids.length);
  }
  let q=0;for(let k=1;k<ids.length;k++)if(v[ids[k]]>v[ids[q]])q=k;const best=v[ids[q]],out={evi,best,max};
  if(trace){const p=Array(y.length),r=Array(z.length);for(let t=ev.length-1;t>=0;t--){const [i,j]=ev[t],h=hist[t],s=h.ids[q];if(i>=0)p[i]=Math.floor(s/B**2)%B;if(j>=0)r[j]=s%B;q=h.prev[q]}const kp=p.flatMap((x,i)=>x?[mod(y[i]-x)]:[]),kr=r.flatMap((x,i)=>x?[mod(z[i]-x)]:[]);assert(kp.slice(0,Math.min(kp.length,kr.length)).every((x,i)=>x===kr[i]),"shared suffix replay");assert(p.every((x,i)=>x?true:y[i]===0)&&r.every((x,i)=>x?true:z[i]===0),"F replay");Object.assign(out,{p:p.reverse(),r:r.reverse(),keyA:kp.reverse(),keyB:kr.reverse()});}
  return out;
 }
 function nullEvidence(y,known){let f=new Float64Array(B*B),nf=new Float64Array(B*B),e=0;f[Q*B+Q]=1;
 for(let i=0;i<y.length;i++){let c=y[i];nf.fill(0);for(let s=0;s<f.length;s++){const fs=f[s];if(!fs)continue;let b=s%B,base=s*Q;for(let p=0;p<Q;p++){if(i===0&&known!==null&&p!==known)continue;if(!p&&c!==0)continue;nf[b*B+p]+=fs*prob[base+p]/(p?Q:1);}}let z=nf.reduce((a,b)=>a+b,0);assert(z>0,"null");e+=Math.log(z);for(let j=0;j<nf.length;j++)nf[j]/=z;[f,nf]=[nf,f];}return e;}
 function solve(a,b,known=null,truthA=null,truthB=null){const y=a.slice().reverse(),z=b.slice().reverse(),ma=masks(y,known),mb=masks(z,null);let best=-Infinity,ev=-Infinity,pair=null,max=0,count=0;
  for(const m of ma)for(const k of mb){const r=joint(y,z,m,k,known);count++;ev=logadd(ev,r.evi);if(r.best>best){best=r.best;pair=[m,k]}max=Math.max(max,r.max||0);}
  const rr=joint(y,z,...pair,known,true);assert(Math.abs(rr.best-best)<1e-8,"replay score");const n0=nullEvidence(y,known)+nullEvidence(z,null);
  const render=p=>p.map(x=>c.translit[x]).join("");return {n:[a.length,b.length],zero:[a.filter(x=>!x).length,b.filter(x=>!x).length],known,maskPairs:count,logBF:ev-n0,logBFPerPair:(ev-n0)/Math.min(a.length,b.length),bestLog:best,max,plainA:render(rr.p),plainB:render(rr.r),p:rr.p,r:rr.r,keyA:rr.keyA,keyB:rr.keyB,correct:truthA?[rr.p.filter((x,i)=>x===truthA[i]).length,rr.r.filter((x,i)=>x===truthB[i]).length]:null};
 }
 let seed=0x28F57027;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n}
 function plant(a,b,share,known){let ka=Array.from({length:a.filter(x=>x).length},()=>rand(Q)),kb=Array.from({length:b.filter(x=>x).length},()=>rand(Q));if(share)for(let i=1;i<=Math.min(ka.length,kb.length);i++)kb[kb.length-i]=ka[ka.length-i];const enc=(p,k)=>{let j=0;return p.map(x=>x?mod(x+k[j++]):0)};return [enc(a,ka),enc(b,kb)]}
 const p55=c.pages[55].indices,ch=c.pages.slice(27,33).flatMap(p=>p.indices),p27=ch.slice(-42).concat(ch.slice(0,34));assert(p55.length===76&&p27.length===76&&String(p55.slice(-6))===String(p27.slice(-6)),"bookend");
 if(caseIndex===0)return {name:"original-76",...solve(p55,p27)};
 if(caseIndex===1){const a=p55.concat(c.pages[56].indices[0]),b=p27.concat(ch[34]),known=native(n.sections.find(s=>s.name==="p56_an_end").source_text)[0];assert(a.at(-1)===b.at(-1)&&known===24,"known seam");return {name:"original-77-known-A",...solve(a,b,known)}}
 if(caseIndex===2){return {name:"tree-p32-p55-offset19",...solve(p55,c.pages[32].indices.slice(19,95))}}
 const j=caseIndex-3,share=j%2===0,k=Math.floor(j/2),hasKnown=k%2===1,L=hasKnown?77:76;
 let a=test[k%3].slice(700+k*300,700+k*300+L),b=test[(k+1)%3].slice(2100+k*400,2100+k*400+L);
 if(hasKnown){a[a.length-1]=24;b[b.length-1]=24;}const known=hasKnown?24:null;
 // Independent pad null has the same known terminal constraint and same sources.
 const [y,z]=plant(a,b,share,known);return {name:"control-"+k+(share?"-shared":"-independent"),share,truthA:a,truthB:b,...solve(y,z,known,a,b)};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
if(require.main===module){console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(p,'utf8')),Number(process.argv[2]||0)),null,2));}
module.exports=experiment;
