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
 // Each edge chooses the complete runs of literal-F holds immediately before the next
 // consuming event(s). This is a unique canonical decomposition of every mask pair.
 const idx=(a,b,c,d)=>((a*B+b)*B+c)*B+d, init=idx(Q,Q,Q,Q), LQ=Math.log(Q);
 function joint(y,z,known){
   const H=y.length+1,W=z.length+1,cells=Array(H*W);cells[0]=new Map([[init,[1,0,-1,-1,0,0,-1,-1]]]);let count=0,peak=0,edges=0;
   const holds=(t,i,a,b,lock)=>{const out=[[i,a,b,1,0]];let w=1,l=0;while(i<t.length&&t[i]===0&&!(i===0&&lock!==null&&lock!==0)){let q=(a*B+b)*Q;w*=Q*prob[q];l+=LQ+logs[q];i++;a=b;b=0;out.push([i,a,b,w,l]);}return out;};
   for(let i=0;i<H;i++)for(let j=0;j<W;j++){const at=i*W+j,m=cells[at];if(!m||at===H*W-1)continue;peak=Math.max(peak,m.size);count+=m.size;
     for(const [s,e] of m){const d=s%B,cc=Math.floor(s/B)%B,b=Math.floor(s/B**2)%B,a=Math.floor(s/B**3),A=holds(y,i,a,b,known),Z=holds(z,j,cc,d,null);
       for(const [ii,aa,bb,wa,la] of A)for(const [jj,cc,dd,wb,lb] of Z){const ha=ii-i,hb=jj-j,ex=ii<y.length,ez=jj<z.length,dest=(ii+(ex?1:0))*W+jj+(ez?1:0),n=cells[dest]||(cells[dest]=new Map()),pbase=(aa*B+bb)*Q,rbase=(cc*B+dd)*Q,weight=e[0]*wa*wb,val=e[1]+la+lb,ka=ii===0&&known!==null?known:-1;
         function put(ns,w,v,p,q){if(Math.floor(dest/W)===H-1)ns=(Q*B+Q)*B*B+ns%(B*B);if(dest%W===W-1)ns=Math.floor(ns/(B*B))*B*B+Q*B+Q;edges++;const old=n.get(ns);if(old){old[0]+=w;if(v>old[1]){old[1]=v;old[2]=at;old[3]=s;old[4]=ha;old[5]=hb;old[6]=p;old[7]=q;}}else n.set(ns,[w,v,at,s,ha,hb,p,q]);}
         if(ex&&ez){const delta=mod(z[jj]-y[ii]);for(let p=1;p<Q;p++){if(ka>=0&&ka!==p)continue;const q=mod(p+delta);if(q)put(idx(bb,p,dd,q),weight*Q*prob[pbase+p]*prob[rbase+q],val+LQ+logs[pbase+p]+logs[rbase+q],p,q);}}
         else if(ex){for(let p=1;p<Q;p++)if(ka<0||ka===p)put(idx(bb,p,cc,dd),weight*prob[pbase+p],val+logs[pbase+p],p,-1);}
         else if(ez){for(let q=1;q<Q;q++)put(idx(aa,bb,dd,q),weight*prob[rbase+q],val+logs[rbase+q],-1,q);}
         else put(idx(aa,bb,cc,dd),weight,val,-1,-1);
       }
     }
   }
   const last=H*W-1,m=cells[last];assert(m&&m.size,"no final state");let sum=0,best=-Infinity,state=-1;for(const [s,e] of m){sum+=e[0];if(e[1]>best){best=e[1];state=s;}}assert(sum>0&&Number.isFinite(sum),"final mass");
   let at=last,p=Array(y.length),r=Array(z.length);while(at!==0){const e=cells[at].get(state),[,,prev,ps,ha,hb,pa,pb]=e,i=Math.floor(prev/W),j=prev%W;for(let k=0;k<ha;k++)p[i+k]=0;for(let k=0;k<hb;k++)r[j+k]=0;if(pa>=0)p[i+ha]=pa;if(pb>=0)r[j+hb]=pb;at=prev;state=ps;}
   assert(p.filter(Number.isInteger).length===y.length&&r.filter(Number.isInteger).length===z.length,"trace length");
   const kp=p.flatMap((x,i)=>x?[mod(y[i]-x)]:[]),kr=r.flatMap((x,i)=>x?[mod(z[i]-x)]:[]);assert(kp.slice(0,Math.min(kp.length,kr.length)).every((x,i)=>x===kr[i]),"shared suffix replay");assert(p.every((x,i)=>x?true:y[i]===0)&&r.every((x,i)=>x?true:z[i]===0),"F replay");
   return {evi:Math.log(sum)-(y.length+z.length)*LQ,best:best-(y.length+z.length)*LQ,peak,count,edges,p:p.reverse(),r:r.reverse(),keyA:kp.reverse(),keyB:kr.reverse()};
 }
 function nullEvidence(y,known){let f=new Float64Array(B*B),nf=new Float64Array(B*B),e=0;f[Q*B+Q]=1;
 for(let i=0;i<y.length;i++){let c=y[i];nf.fill(0);for(let s=0;s<f.length;s++){const fs=f[s];if(!fs)continue;let b=s%B,base=s*Q;for(let p=0;p<Q;p++){if(i===0&&known!==null&&p!==known)continue;if(!p&&c!==0)continue;nf[b*B+p]+=fs*prob[base+p]/(p?Q:1);}}let z=nf.reduce((a,b)=>a+b,0);assert(z>0,"null");e+=Math.log(z);for(let j=0;j<nf.length;j++)nf[j]/=z;[f,nf]=[nf,f];}return e;}
 function solve(a,b,known=null,truthA=null,truthB=null){const y=a.slice().reverse(),z=b.slice().reverse(),rr=joint(y,z,known),n0=nullEvidence(y,known)+nullEvidence(z,null),render=p=>p.map(x=>c.translit[x]).join("");return {n:[a.length,b.length],zero:[a.filter(x=>!x).length,b.filter(x=>!x).length],known,logBF:rr.evi-n0,logBFPerPair:(rr.evi-n0)/Math.min(a.length,b.length),bestLog:rr.best,peak:rr.peak,states:rr.count,edges:rr.edges,plainA:render(rr.p),plainB:render(rr.r),p:rr.p,r:rr.r,keyA:rr.keyA,keyB:rr.keyB,correct:truthA?[rr.p.filter((x,i)=>x===truthA[i]).length,rr.r.filter((x,i)=>x===truthB[i]).length]:null};}
 let seed=0x28F57027;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n}
 function plant(a,b,share,known){let ka=Array.from({length:a.filter(x=>x).length},()=>rand(Q)),kb=Array.from({length:b.filter(x=>x).length},()=>rand(Q));if(share)for(let i=1;i<=Math.min(ka.length,kb.length);i++)kb[kb.length-i]=ka[ka.length-i];const enc=(p,k)=>{let j=0;return p.map(x=>x?mod(x+k[j++]):0)};return [enc(a,ka),enc(b,kb)]}
 const p55=c.pages[55].indices,ch=c.pages.slice(27,33).flatMap(p=>p.indices),p27=ch.slice(-42).concat(ch.slice(0,34));assert(p55.length===76&&p27.length===76&&String(p55.slice(-6))===String(p27.slice(-6)),"bookend");
 if(caseIndex===0)return {name:"original-76",...solve(p55,p27)};
 if(caseIndex===1){const a=p55.concat(c.pages[56].indices[0]),b=p27.concat(ch[34]),known=native(n.sections.find(s=>s.name==="p56_an_end").source_text)[0];assert(a.at(-1)===b.at(-1)&&known===24,"known seam");return {name:"original-77-known-A",...solve(a,b,known)}}
 if(caseIndex===2){return {name:"tree-p32-p55-offset19",...solve(p55,c.pages[32].indices.slice(19,95))}}
 if(caseIndex===11){return {name:"original-70-anchor-removed",...solve(p55.slice(0,-6),p27.slice(0,-6))}}
 if(caseIndex===12)return {name:"original-selected-six-anchor-only",...solve(p55.slice(-6),p27.slice(-6))};
 if(caseIndex===13)return {name:"original-selected-seven-anchor-only-known-A",...solve(p55.slice(-6).concat(c.pages[56].indices[0]),p27.slice(-6).concat(ch[34]),24)};
 const j=caseIndex-3,share=j%2===0,k=Math.floor(j/2),hasKnown=k%2===1,L=hasKnown?77:76;
 let a=test[k%3].slice(700+k*300,700+k*300+L),b=test[(k+1)%3].slice(2100+k*400,2100+k*400+L);
 if(hasKnown){a[a.length-1]=24;b[b.length-1]=24;}const known=hasKnown?24:null;
 // Independent pad null has the same known terminal constraint and same sources.
 const [y,z]=plant(a,b,share,known);return {name:"control-"+k+(share?"-shared":"-independent"),share,truthA:a,truthB:b,...solve(y,z,known,a,b)};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
if(require.main===module){console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(p,'utf8')),Number(process.argv[2]||0)),null,2));}
module.exports=experiment;
