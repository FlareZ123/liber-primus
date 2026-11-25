"use strict";
/** Agent9: exact GF29 rate2/3 memory-one check-syndrome gate. Read-only. */
const fs=require("node:fs"),path=require("node:path");
function experiment(raw){
 const gp=JSON.parse(raw[0]),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const mod=x=>(x%29+29)%29,check=(v,m)=>{if(!v)throw Error(m)},same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]),inv=x=>{x=mod(x);for(let j=1;j<29;j++)if(x*j%29===1)return j;throw Error("singular")};
 function word(w){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));if(!q)throw Error("native "+w);o.push(q.i);j+=q.t.length;}return o;}
 function body(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length);}
 const donors=raw.slice(1).map(t=>(body(t).toUpperCase().match(/[A-Z]+/g)||[]).flatMap(word));
 // Incremental row basis with original-row certificate, exact GF29.
 function basis(rows,n){const R=Array(n).fill(null),chosen=[];for(let i=0;i<rows.length;i++){let v=rows[i].map(mod);for(let j=0;j<n;j++){if(!v[j])continue;if(R[j]){const a=v[j];for(let k=j;k<n;k++)v[k]=mod(v[k]-a*R[j][k]);}else{const q=inv(v[j]);v=v.map(x=>mod(x*q));R[j]=v;chosen.push(i);break;}}if(chosen.length===n)break;}
  const free=Array.from({length:n},(_,i)=>i).filter(i=>!R[i]),nullspace=[];for(const f of free){const v=Array(n).fill(0);v[f]=1;for(let j=n-1;j>=0;j--)if(R[j])v[j]=mod(-R[j].slice(j+1).reduce((s,x,k)=>s+x*v[j+1+k],0));check(rows.every(a=>mod(a.reduce((s,x,k)=>s+x*v[k],0))===0),"nullspace replay");nullspace.push(v);}
  return {rank:chosen.length,chosen,nullspace};
 }
 function determinant(rows){const a=rows.map(r=>r.map(mod));let d=1;for(let j=0;j<a.length;j++){const p=a.findIndex((r,i)=>i>=j&&r[j]);if(p<0)return 0;if(p!==j){[a[p],a[j]]=[a[j],a[p]];d=mod(-d);}d=mod(d*a[j][j]);const q=inv(a[j][j]);for(let i=j+1;i<a.length;i++){const f=mod(a[i][j]*q);for(let k=j;k<a.length;k++)a[i][k]=mod(a[i][k]-f*a[j][k]);}}return d;}
 const triples=a=>{check(a.length%3===0,"complete triple framing");return Array.from({length:a.length/3},(_,i)=>a.slice(3*i,3*i+3));};
 const features=(a,mem,affine=false)=>{const t=triples(a),rows=[];for(let i=mem;i<t.length;i++){const r=[];for(let j=0;j<=mem;j++)r.push(...t[i-j]);if(affine)r.push(1);rows.push(r);}return rows;};
 function rankInfo(a,mem,affine=false){const rows=features(a,mem,affine),n=3*(mem+1)+Number(affine),b=basis(rows,n);return {...b,rows:rows.length,firstFullRankBlock:b.rank===n?b.chosen.at(-1)+mem:null,determinant:b.rank===n?determinant(b.chosen.map(i=>rows[i])):null};}
 const mix=(u,v,w)=>[mod(u+w),mod(v+w),mod(u+v+w)];
 const unmix=([x,y,z])=>[mod(z-y),mod(z-x),mod(x+y-z)];
 function encode(p,key){check(p.length%2===0,"paired data");let u0=0,v0=0;const out=[];for(let i=0;i<p.length;i+=2){const u=p[i],v=p[i+1],w=mod(key[0]*u+key[1]*v+key[2]*u0+key[3]*v0);out.push(...mix(u,v,w));u0=u;v0=v;}return out;}
 function decode(a){return triples(a).flatMap(t=>unmix(t).slice(0,2));}
 function parityRows(a){let prev=[0,0],rows=[];for(const t of triples(a)){const [u,v,w]=unmix(t);rows.push([u,v,...prev,w]);prev=[u,v];}return rows;}
 function recover(a){const rows=parityRows(a),z=basis(rows,5);if(z.nullspace.length!==1||!z.nullspace[0][4])return null;const h=z.nullspace[0],q=inv(h[4]);return h.slice(0,4).map(v=>mod(-q*v));}
 function checkSymbols(a,k){return parityRows(a).filter(r=>mod(r.slice(0,4).reduce((s,v,i)=>s+v*k[i],0))===r[4]).length;}
 const A=gp.pages.filter(p=>p.page<=2).flatMap(p=>p.indices),B=gp.pages.filter(p=>p.page>=33&&p.page<=39).flatMap(p=>p.indices);check(A.length===729&&B.length===1680,"frozen chapter lengths");
 let seed=2824;function R(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
 const controls=[];
 const equal=a=>a.slice(1).filter((x,i)=>x===a[i]).length;
 function rateOne(p){let prev=0;return p.map(x=>(prev=mod(prev+x+1)));}
 function half(p,a,b){let prev=0;const out=[];for(const u of p){out.push(u,mod(a*u+b*prev));prev=u;}return out;}
 for(let d=0;d<3;d++){
  const tail=donors[d].slice(Math.floor(donors[d].length*.8)),start=R()%(tail.length-3000);
  const p=tail.slice(start,start+486),q=tail.slice(start+486,start+1606),k=Array.from({length:4},()=>R()%29);if(!k[2]&&!k[3])k[3]=1;
  const c=encode(p,k),h=encode(q,k),fit=recover(c);check(fit&&same(fit,k),"blind planted coefficient recovery");check(same(decode(c),p)&&same(decode(h),q),"planted data inversion");
  const rate=rateOne(tail.slice(start,start+729)),wrong=half(tail.slice(start,start+366),k[0],k[2]).slice(0,729),pad=Array.from({length:729},()=>R()%29);
  controls.push({donor:d,key:k,fit,correctFit:decode(c).length,correctHoldout:decode(h).length,heldoutChecks:checkSymbols(h,fit),fitRanks:[rankInfo(c,1),rankInfo(c,2)],holdRanks:[rankInfo(h,1),rankInfo(h,2)],negatives:{rateOne:{repeats:equal(rate),rank:rankInfo(rate,2)},wrongRate:{rank:rankInfo(wrong,2)},uniformPad:{rank:rankInfo(pad,2)}}});
 }
 const original=[["p0-2",A],["p33-39",B]].map(([name,a])=>({name,runes:a.length,rank0:rankInfo(a,0),rank1:rankInfo(a,1),rank2:rankInfo(a,2),affineRank2:rankInfo(a,2,true),fixedMixKey:recover(a)}));
 return {capacity:{developmentData:486,developmentChecks:243,holdoutData:1120,holdoutChecks:560},controls,original};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
