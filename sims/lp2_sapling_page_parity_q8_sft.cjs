'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function experiment(corpus,native,gibran,shakespeare){
const assert=(x,msg)=>{if(!x)throw Error(msg)};
const q=8, m=29, mod=x=>(x%m+m)%m;
const lengths=corpus.pages.slice(8,15).map(p=>p.indices.length);
assert(JSON.stringify(lengths)==="[255,268,263,273,261,272,137]","lengths");
const pages=corpus.pages.slice(8,15).map(p=>p.indices);
const train=native.sections.slice(0,7).map(s=>[...s.source_text].map(x=>native.runes.indexOf(x)).filter(x=>x>=0));
const uni=new Float64Array(m).fill(1), bi=new Float64Array(m*m), tri=new Float64Array(m*m*m), bic=new Float64Array(m), tric=new Float64Array(m*m);
for(const a of train)for(let i=0;i<a.length;i++){uni[a[i]]++;if(i){bi[a[i-1]*m+a[i]]++;bic[a[i-1]]++}if(i>1){const k=a[i-2]*m+a[i-1];tri[k*m+a[i]]++;tric[k]++}}
const sum=uni.reduce((a,b)=>a+b,0);for(let i=0;i<m;i++)uni[i]/=sum;
const logu=Array.from(uni,Math.log);
const logt=Float64Array.from(tri,(v,i)=>{const k=Math.floor(i/m), b=k%m,c=i%m,p=(bi[b*m+c]+10*uni[c])/(bic[b]+10);return Math.log((v+10*p)/(tric[k]+10))});
const split=arr=>{let pos=[0,0];return lengths.map((n,i)=>{const k=i%2,a=arr[k].slice(pos[k],pos[k]+n);pos[k]+=n;assert(a.length===n,"short lane");return a})};
const join=pp=>[pp.filter((_,i)=>i%2===0).flat(),pp.filter((_,i)=>i%2===1).flat()];
const cut=[lengths[0]+lengths[2]+lengths[4],lengths[1]+lengths[3]];
const orig=join(pages);assert(JSON.stringify(split(orig))===JSON.stringify(pages),"layout inverse");
const score=(a,start)=>{let s=0,n=0;for(let i=Math.max(2,start);i<a.length;i++){s+=logt[(a[i-2]*m+a[i-1])*m+a[i]];n++}return [s,n]};
const infer=parts=>{const vals=Array.from({length:q},()=>new Float64Array(m));for(const a of parts)for(let i=0;i<a.length;i++)for(let k=0;k<m;k++)vals[i%q][k]+=logu[mod(a[i]-k)];return vals.map(v=>Array.from(v).indexOf(Math.max(...v)))};
const decode=(a,k)=>a.map((c,i)=>mod(c-k[i%q]));
const enc=(a,k)=>a.map((p,i)=>mod(p+k[i%q]));
const equal=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
const combine=x=>x.reduce((a,b)=>[a[0]+b[0],a[1]+b[1]],[0,0]);
function evalModel(pp,full=false){
 const a=join(pp), prefix=a.map((x,i)=>x.slice(0,cut[i]));
 const ks=infer(prefix), models={common:[ks,ks],independent:prefix.map(x=>infer([x]))};
 const out={};
 for(const [name,k] of Object.entries(models)){
   const p=a.map((v,i)=>decode(v,k[i]));assert(p.every((v,i)=>equal(enc(v,k[i]),a[i])),"cipher replay");
   const tr=combine(p.map((v,i)=>score(v.slice(0,cut[i]),0))), ho=p.map((v,i)=>score(v,cut[i])), total=combine(ho);
   out[name]={keys:k,train:tr[0]/tr[1],held:total[0]/total[1],heldLane:ho.map(v=>v[0]/v[1]),...(full?{decoded:p.map(v=>v.map(x=>corpus.translit[x]).join(" ")),decodedIndices:p}:{} )};
 }
 const flat=pp.flat(), n=lengths.slice(0,5).reduce((a,b)=>a+b,0), k=infer([flat.slice(0,n)]), p=decode(flat,k);
 assert(equal(enc(p,k),flat),"single replay");
 let t=score(p.slice(0,n),0),h=score(p,n);out.single={keys:[k],train:t[0]/t[1],held:h[0]/h[1],...(full?{decoded:p.map(x=>corpus.translit[x]).join(" ")}:{})};
 return out;
}
const gpMap=new Map(corpus.translit.map((x,i)=>[x,i]));const convert=s=>{const out=[];for(let word of (s.toUpperCase().match(/[A-Z]+/g)||[])){word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<word.length;){let token=["ING","TH","EO","NG","OE","AE","IA","EA","IO"].find(x=>word.startsWith(x,i))||word[i];const x=gpMap.get(token==="ING"?"NG":token==="IO"?"IA":token);assert(x!==undefined,"token "+token);out.push(x);i+=token.length}}return out};
const donors=[convert(gibran),convert(shakespeare)];const fixtures=[];
const n0=orig[0].length,n1=orig[1].length,total=n0+n1;
for(let d=0;d<donors.length;d++){const a=donors[d];for(let f=0;f<12;f++){let off=100+f*(total+31);if(off+total>a.length)break;const pp=[a.slice(off,off+n0),a.slice(off+n0,off+total)];let k0=Array.from({length:q},(_,i)=>mod(3+f*7+d*11+i*i*5+i*3)),k1=Array.from({length:q},(_,i)=>mod(12+f*3+d*13+i*i*2+i*7));
 for(const kind of ["common","independent","single"]){
 let k=kind==="common"?[k0,k0]:[k0,k1], c;
 if(kind==="single"){let flat=enc(a.slice(off,off+total),k0),j=0;c=lengths.map(n=>{let z=flat.slice(j,j+n);j+=n;return z})}
 else c=split(pp.map((v,i)=>enc(v,k[i])));
 const v=evalModel(c);
 fixtures.push({donor:d,fixture:f,kind,correct:kind==="single"?equal(v.single.keys[0],k0):v[kind].keys.every((z,i)=>equal(z,k[i])),held:{common:v.common.held,independent:v.independent.held,single:v.single.held},gap:v.independent.held-v.single.held});
 }
}}
const result=evalModel(pages,true);
const summary={};
for(const kind of ["common","independent","single"]){const f=fixtures.filter(x=>x.kind===kind);summary[kind]={count:f.length,exact:f.filter(x=>x.correct).length,heldMin:Math.min(...f.map(x=>x.held[kind])),heldMax:Math.max(...f.map(x=>x.held[kind])),gapMin:Math.min(...f.map(x=>x.gap)),gapMax:Math.max(...f.map(x=>x.gap)),independentBeatsSingle:f.filter(x=>x.gap>0).length}}
return {lengths,laneLengths:[n0,n1],trainingLengths:cut,donorLengths:donors.map(x=>x.length),summary,fixtures,result};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
const data=files.map(p=>fs.readFileSync(path.join(root,p),'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(data[0]),JSON.parse(data[1]),data[2],data[3]),null,2));
