'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/external/2013-book-of-law-III.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function experiment(raw){
 const c=JSON.parse(raw[0]),v=raw[1].split(/\r?\n/).find(x=>x.startsWith("2. ")).slice(3),native=JSON.parse(raw[2]);
 const Q=29,mod=x=>(x%Q+Q)%Q,inv=x=>{for(let i=1;i<Q;i++)if(mod(i*x)===1)return i;throw Error("zero inverse")},check=(v,m)=>{if(!v)throw Error(m)};
 const alphabet=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function gp(w){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let a=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{const t=alphabet.find(t=>w.startsWith(t.s,i));check(t,"GP "+w);a.push(t.i);i+=t.s.length}}return a}
 const words=[...v.matchAll(/[a-z]+/gi)].map(m=>({w:m[0],raw:m.index,a:gp(m[0])}));
 const idx=words.findIndex(w=>w.w==="homeward"),before=words.slice(0,idx).reduce((s,x)=>s+x.a.length,0),P=words.flatMap(x=>x.a),start=25-before,C=c.pages[32].indices;
 check(start===7&&P.length===108&&words[idx].raw===25&&C.length===121,"placement");
 check(C.slice(28,37).join(",")==="2,0,0,3,2,8,3,19,18","original motif");
 function bm(s){let C=[1],B=[1],L=0,m=1,b=1;for(let n=0;n<s.length;n++){let d=s[n];for(let i=1;i<=L;i++)d=mod(d+(C[i]??0)*s[n-i]);if(!d){m++;continue}let T=C.slice(),coef=mod(d*inv(b));while(C.length<B.length+m)C.push(0);for(let j=0;j<B.length;j++)C[j+m]=mod(C[j+m]-coef*B[j]);if(2*L<=n){L=n+1-L;B=T;b=d;m=1}else m++;}while(C.length<=L)C.push(0);return {L,coeff:C.slice(0,L+1)}}
 function predict(s,fit,count){let a=s.slice();for(let j=0;j<count;j++){let k=0;for(let i=1;i<=fit.L;i++)k=mod(k-fit.coeff[i]*a[a.length-i]);a.push(k)}return a}
 function period(s){for(let q=1;q<=s.length;q++)if(s.every((x,i)=>i<q||x===s[i-q]))return q}
 function replay(s,fit){return s.every((x,i)=>i<fit.L||mod(x+fit.coeff.slice(1).reduce((z,a,j)=>z+a*s[i-j-1],0))===0)}
 function test(C,P){
  const k=P.map((p,i)=>mod(C[start+i]-p)),fit=bm(k.slice(0,80)),full=bm(k),pred=predict(k.slice(0,80),fit,28).slice(80);
  check(replay(k.slice(0,80),fit)&&replay(k,full),"recurrence replay");
  check(k.every((x,i)=>mod(P[i]+x)===C[start+i]),"forward cipher replay");
  const holds=P.map((p,i)=>p===0&&C[start+i]!==0?{offset:start+i,cipher:C[start+i]}:null).filter(Boolean);
  return {shift:k,minimumExactPeriod:period(k),fitRecurrence:fit,fullRecurrence:full,heldMatches:pred.filter((x,i)=>x===k[i+80]).length,heldPredictedPlaintext:pred.map((x,i)=>c.translit[mod(C[start+80+i]-x)]).join(" "),heldTruePlaintext:P.slice(80).map(x=>c.translit[x]).join(" "),transparentFContradictions:holds}
 }
 const controls=[];
 const configs=[{name:"0_welcome",seed:[4,19,7],coef:[3,5,7]},{name:"0_koan_1",seed:[5,17,2,21,9],coef:[2,3,5,7,11]}];
 for(const {name,seed,coef} of configs){
  const text=native.sections.find(s=>s.name===name).source_text,p=[...text].filter(x=>c.runes.includes(x)).map(x=>c.runes.indexOf(x)).slice(0,121);
  check(p.length===121,"control length");
  const key=seed.slice();while(key.length<121)key.push(mod(coef.reduce((s,a,i)=>s+a*key[key.length-i-1],0)));
  const cp=p.map((x,i)=>mod(x+key[i])),res=test(cp,p.slice(start,start+108));
  check(res.heldMatches===28&&res.fitRecurrence.L===coef.length,"control recurrence");
  const recovered=predict(key.slice(start,start+80),res.fitRecurrence,121-start-80).map((x,i)=>mod(cp[start+i]-x));
  check(recovered.length===121-start&&recovered.every((x,i)=>x===p[start+i]),"full control right prediction");
  const keyback=key.slice(start,start+80),last=res.fitRecurrence.coeff.at(-1);check(last!==0,"invertible recurrence");
  for(let i=0;i<start;i++){let t=keyback[res.fitRecurrence.L-1];for(let j=1;j<res.fitRecurrence.L;j++)t=mod(t+res.fitRecurrence.coeff[j]*keyback[res.fitRecurrence.L-1-j]);keyback.unshift(mod(-t*inv(last)))}
  check(keyback.slice(0,start).every((x,i)=>mod(cp[i]-x)===p[i]),"control left prediction");
  controls.push({name,seed,coef,fitRecurrence:res.fitRecurrence,fullRecurrence:res.fullRecurrence,heldMatches:res.heldMatches,wholePageRecovered:121,minimumExactPeriod:res.minimumExactPeriod})
 }
 return {placement:{start,end:start+P.length,homewardNativeOffset:before,homewardPhysical:25,knownLength:P.length,sourceVerse:v},original:test(C,P),controls};
}
if(require.main===module)console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'))),null,2));
module.exports={experiment};
