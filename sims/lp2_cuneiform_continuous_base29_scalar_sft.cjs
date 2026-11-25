'use strict';
// Agent28: exact all-unit 3-digit continuous BASE29 scalar inverse.
const fs=require('node:fs'),path=require('node:path');
function experiment(data,index){
 const co=JSON.parse(data[0]),nat=JSON.parse(data[1]),mod=x=>((x%29)+29)%29,assert=(x,m)=>{if(!x)throw Error(m)};
 const gp=new Map(co.runes.map((x,i)=>[x,i])),tok=co.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const encode=s=>{let out=[];for(let w of s.match(/[A-Za-z]+/g)||[]){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3;continue}if(w.startsWith("IO",i)){out.push(27);i+=2;continue}let t=tok.find(t=>w.startsWith(t.s,i));assert(t,"unknown token");out.push(t.i);i+=t.s.length}}return out};
 const native=nat.sections.map(s=>[...s.source_text].filter(x=>gp.has(x)).map(x=>gp.get(x))),train=[...native,encode(data[2]),encode(data[3])],em=encode(data[4]);
 const U=new Float64Array(29).fill(1),B=new Float64Array(841),T=new Float64Array(29**3),BS=new Float64Array(29),TS=new Float64Array(841);
 for(const p of train)for(let i=0;i<p.length;i++){U[p[i]]++;if(i){B[p[i-1]*29+p[i]]++;BS[p[i-1]]++}if(i>1){let j=p[i-2]*29+p[i-1];T[j*29+p[i]]++;TS[j]++}}
 let total=U.reduce((a,b)=>a+b,0),lm=new Float64Array(29**3),bi=new Float64Array(841),uni=U.map(x=>Math.log(29*x/total));
 for(let a=0;a<29;a++)for(let b=0;b<29;b++){bi[a*29+b]=Math.log(29*(B[a*29+b]+20*U[b]/total)/(BS[a]+20));for(let c=0;c<29;c++){let h=a*29+b;lm[h*29+c]=Math.log(29*(T[h*29+c]+12*Math.exp(bi[b*29+c])/29)/(TS[h]+12))}}
 function score(P){let s=uni[P[0]];if(P.length>1)s+=bi[P[0]*29+P[1]];for(let i=2;i<P.length;i++)s+=lm[(P[i-2]*29+P[i-1])*29+P[i]];return s/P.length}
 const inv=Array.from({length:29},(_,x)=>Array.from({length:29},(_,y)=>y).find(y=>x*y%29===1)??0);
 const pages=co.pages.filter(p=>p.page>=33&&p.page<=39),C0=pages.flatMap(p=>p.indices),N=C0.length,len=pages.map(p=>p.indices.length);
 const source=[1033,3301,1033*3301],keyset=Array.from({length:29**3-1},(_,i)=>i+1).filter(x=>x%29!==0);keyset.push(source[2]);assert(new Set(keyset).size===keyset.length,"keyset");
 function transform(C,a,op,msb,start,end,initial=0,out=new Uint8Array(end-start)){
 let carry=initial,iv=inv[a%29],n=end-start;
 if(op==="divide"){
  if(msb)for(let i=end-1;i>=start;i--){let c=C[i],p=mod((c-carry)*iv);out[i-start]=p;carry=(carry+a*p-c)/29}
  else for(let i=start;i<end;i++){let c=C[i],p=mod((c-carry)*iv);out[i-start]=p;carry=(carry+a*p-c)/29}
 }else{
  if(msb)for(let i=end-1;i>=start;i--){let z=carry+a*C[i];out[i-start]=z%29;carry=Math.floor(z/29)}
  else for(let i=start;i<end;i++){let z=carry+a*C[i];out[i-start]=z%29;carry=Math.floor(z/29)}
 }
 assert(Number.isInteger(carry)&&carry>=0&&carry<a,"carry");return {P:out,carry}
 }
 const other=op=>op==="divide"?"multiply":"divide";
 function ranges(msb){return msb?{fitStart:len[0]+len[1],fitEnd:N,holdStart:0,holdEnd:len[0]+len[1]}:{fitStart:0,fitEnd:len.slice(0,5).reduce((a,b)=>a+b,0),holdStart:len.slice(0,5).reduce((a,b)=>a+b,0),holdEnd:N}}
 function search(C,msb){
 let {fitStart,fitEnd,holdStart,holdEnd}=ranges(msb),buf=new Uint8Array(fitEnd-fitStart),rank=[],fixed=[];
 for(let op of ["divide","multiply"])for(let a of keyset){
 const z=transform(C,a,op,msb,fitStart,fitEnd,0,buf),s=score(buf),r={a,op,fit:s,carry:z.carry};
 if(source.includes(a))fixed.push(r);
 if(rank.length<8||s>rank.at(-1).fit){rank.push(r);rank.sort((a,b)=>b.fit-a.fit);if(rank.length>8)rank.pop()}
 }
 function full(r){
 const f=transform(C,r.a,r.op,msb,fitStart,fitEnd),h=transform(C,r.a,r.op,msb,holdStart,holdEnd,f.carry),P=msb?[...h.P,...f.P]:[...f.P,...h.P];
 const enc=transform(P,r.a,other(r.op),msb,0,N).P;assert(enc.every((v,i)=>v===C[i]),"full replay");
 return {...r,hold:score(h.P),fitN:f.P.length,holdN:h.P.length,fitPreview:[...f.P.slice(0,90)].map(v=>co.translit[v]).join(""),holdPreview:[...h.P.slice(0,90)].map(v=>co.translit[v]).join(""),P}
 }
 return {msb,range:ranges(msb),searched:keyset.length*2,top:rank,win:full(rank[0]),fixed:fixed.map(x=>{const {P,...r}=full(x);return r})}
 }
 const specs=[{msb:true,a:1033,op:"divide"},{msb:true,a:19837,op:"multiply"},{msb:false,a:3301,op:"divide"},{msb:false,a:21421,op:"multiply"}];
 if(index<4){let spec=specs[index],P=em.slice(130000+index*N,130000+(index+1)*N);assert(P.length===N,"donor length");
 const C=[...transform(P,spec.a,other(spec.op),spec.msb,0,N).P],r=search(C,spec.msb);
 const {P:out,...w}=r.win;
 return {name:"control-"+index,N,len,truth:spec,correct:out.filter((v,i)=>v===P[i]).length,fitCorrect:out.slice(r.range.fitStart,r.range.fitEnd).filter((v,i)=>v===P[r.range.fitStart+i]).length,holdCorrect:out.slice(r.range.holdStart,r.range.holdEnd).filter((v,i)=>v===P[r.range.holdStart+i]).length,...r,win:w};
 }
 const msb=index===4,r=search(C0,msb);const {P,...w}=r.win;return {name:msb?"original-MSB-first":"original-LSB-first",N,len,...r,win:w}
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8')),Number(process.argv[2]??0)),null,2));
module.exports={experiment,paths};
