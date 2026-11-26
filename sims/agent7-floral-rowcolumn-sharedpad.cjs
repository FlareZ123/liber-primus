"use strict";
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
const study=function study(raw){
 const R=29,S=841,mod=x=>(x%R+R)%R,assert=(x,m)=>{if(!x)throw Error(m)},corpus=JSON.parse(raw[0]),idx=new Map(corpus.runes.map((x,i)=>[x,i]));
 const lines=raw[1].split(/\r?\n/).map(s=>Array.from(s).filter(x=>idx.has(x)).map(x=>idx.get(x))).filter(x=>x.length);
 let li=0;const pages=new Map();for(let p of corpus.pages.filter(x=>x.page<56&&x.indices.length)){let l=[],n=0;while(n<p.indices.length){let x=lines[li++];n+=x.length;l.push(x)}assert(n===p.indices.length&&JSON.stringify(l.flat())===JSON.stringify(p.indices),"layout replay "+p.page);pages.set(p.page,l)}
 assert(li===594,"original line count");const selected=[41,42,43,44,45,46,47,48,52],shape=selected.map(p=>pages.get(p).map(x=>x.length)),original=selected.map(p=>pages.get(p));
 const tokens=corpus.translit.map((x,i)=>[x.toUpperCase(),i]).sort((a,b)=>b[0].length-a[0].length);
 function encode(s){let out=[];for(let w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){while(w.length){let t=w.startsWith("ING")?["ING",21]:w.startsWith("IO")?["IO",27]:tokens.find(t=>w.startsWith(t[0]));if(!t){w=w.slice(1);continue}out.push(t[1]);w=w.slice(t[0].length)}}return out}
 const train=encode(raw[2]),g=encode(raw[3]),e=encode(raw[4]),c1=new Float64Array(R),c2=new Float64Array(S),c3=new Float64Array(S*R);
 for(let i=0;i<train.length;i++){let x=train[i];c1[x]++;if(i)c2[train[i-1]*R+x]++;if(i>1)c3[(train[i-2]*R+train[i-1])*R+x]++}
 const p1=Float64Array.from(c1,x=>(x+.5)/(train.length+14.5)),p2=new Float64Array(S),p3=new Float64Array(S*R);
 for(let a=0;a<R;a++){let n=0;for(let b=0;b<R;b++)n+=c2[a*R+b];for(let b=0;b<R;b++)p2[a*R+b]=(c2[a*R+b]+16*p1[b])/(n+16)}
 for(let ab=0;ab<S;ab++){let n=0;for(let c=0;c<R;c++)n+=c3[ab*R+c];for(let c=0;c<R;c++)p3[ab*R+c]=(c3[ab*R+c]+32*p2[(ab%R)*R+c])/(n+32)}
 /** Each row has a distinct key; line starts are marginalized under a fresh language prior. */
 function infer(streams){
  let n=Math.max(...streams.map(x=>x.length));if(!n)return {logBF:0,key:[]};let f=new Float64Array(S),v=new Float64Array(S),trace=new Uint8Array(n*S),logL=0,df=0;
  const dec=streams.map(x=>x.map(z=>Array.from({length:R},(_,k)=>mod(z-k))));
  function norm(f,v,len){let sum=0,max=0;for(let i=0;i<len;i++){sum+=f[i];if(v[i]>max)max=v[i]}assert(sum>0&&max>0,"positive probability");for(let i=0;i<len;i++){f[i]/=sum;v[i]/=max}logL+=Math.log(sum)}
  for(let i=0;i<n;i++){
   let active=dec.filter(x=>x.length>i);df+=active.length-1;let nf=new Float64Array(S),nv=new Float64Array(S);
   if(i===0){for(let k=0;k<R;k++){let w=1;for(let x of active)w*=p1[x[0][k]];nf[k]=nv[k]=w}norm(nf,nv,R)}
   else if(i===1){for(let a=0;a<R;a++)for(let b=0;b<R;b++){let w=1;for(let x of active)w*=p2[x[0][a]*R+x[1][b]];nf[a*R+b]=f[a]*w;nv[a*R+b]=v[a]*w}norm(nf,nv,S)}
   else {const rows=active.map(x=>[x[i-2],x[i-1],x[i]]);for(let a=0;a<R;a++)for(let b=0;b<R;b++){let ix=a*R+b,fa=f[ix],va=v[ix],bases=rows.map(x=>(x[0][a]*R+x[1][b])*R);for(let c=0;c<R;c++){let w=1;for(let j=0;j<rows.length;j++)w*=p3[bases[j]+rows[j][2][c]];let dest=b*R+c;nf[dest]+=fa*w;let q=va*w;if(q>nv[dest]){nv[dest]=q;trace[i*S+dest]=a}}}norm(nf,nv,S)}
   f=nf;v=nv
  }
  let best=0;for(let j=1;j<(n===1?R:S);j++)if(v[j]>v[best])best=j;
  let key=Array(n);key[n-1]=best%R;if(n>=2)key[n-2]=Math.floor(best/R);for(let i=n-1;i>=2;i--)key[i-2]=trace[i*S+key[i-1]*R+key[i]];
  return {logBF:logL+df*Math.log(R),key}
 }
 function evaluate(streams,truth){
  let rows=Math.max(...streams.map(x=>x.length)),fitBF=0,holdBF=0,plain=streams.map(x=>x.map(y=>Array(y.length))),covered=0,total=streams[8].flat().length;
  const keys=[];let details=[];
  for(let r=0;r<rows;r++){
   const row=streams.map(x=>x[r]||[]),fit=infer(row.slice(0,8)),joint=infer(row);
   fitBF+=fit.logBF;holdBF+=joint.logBF-fit.logBF;keys.push(fit.key);
   for(let k=0;k<streams.length;k++)if(streams[k][r])for(let j=0;j<row[k].length;j++){if(j>=fit.key.length){plain[k][r][j]=null;continue}let z=mod(row[k][j]-fit.key[j]);plain[k][r][j]=z;assert(mod(z+fit.key[j])===row[k][j],"replay");if(k===8)covered++}
   details.push({row:r,fitBF:fit.logBF,holdBF:joint.logBF-fit.logBF,fitLengths:row.slice(0,8).map(x=>x.length),heldLength:row[8].length})
  }
  let out={fitBF,holdBF,heldNatsPerRune:holdBF/total,covered,total,keys,details,heldDecode:plain[8].map(x=>x.map(z=>z===null?"?":corpus.translit[z]).join("")).join("\n")};
  if(truth)out.heldAccuracy=plain[8].flat().filter((z,i)=>z===truth[8].flat()[i]).length/total;return out
 }
 let seed=0xa751f911;function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%29}
 function plant(donor,offset,shared){let at=offset;const truth=shape.map(l=>l.map(n=>{let x=donor.slice(at,at+n);at+=n;assert(x.length===n,"control length");return x})),keys=Array.from({length:shared?1:9},()=>Array.from({length:Math.max(...shape.map(x=>x.length))},()=>Array.from({length:Math.max(...shape.flat())},rand)));return evaluate(truth.map((p,i)=>p.map((row,r)=>row.map((z,j)=>mod(z+keys[shared?0:i][r][j])))),truth)}
 const out={selected,shape,trainLength:train.length,controls:[]};for(let [name,d] of [["Gibran",g],["Emerson",e]])for(let j=0;j<2;j++)for(let shared of [true,false])out.controls.push({name,j,shared,...plant(d,5000+j*10000,shared)});out.original=evaluate(original);return out;
};
console.log(JSON.stringify(study(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
