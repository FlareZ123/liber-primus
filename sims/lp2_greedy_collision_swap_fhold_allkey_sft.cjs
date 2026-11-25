'use strict';
const fs=require('node:fs'),path=require('node:path');
function run(gp,lp1,donor,raw){
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const ix=new Map(gp.runes.map((v,i)=>[v,i])),readRunes=s=>[...s].filter(x=>ix.has(x)).map(x=>ix.get(x));
 const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error(w);out.push(t.i);w=w.slice(t.s.length)}}return out}
 function stats(a,q){let r=0,b=0;for(let i=0;i<a.length;i++)for(let k=1;k<=3;k++){const d=k*q;if(i>=d&&a[i]===a[i-d]){r++;if(i>d&&a[i-1]===a[i-d-1])b++}}return [r,b]}
 function eligible(y,i,both){return i+1<y.length&&y[i]!==y[i+1]&&((i>0&&y[i-1]===y[i+1])||(both&&i+2<y.length&&y[i]===y[i+2]));}
 function bounds(y,q,both=false){
  const D=3*q+1;let S=new Map([["",[0,0]]]),next=new Map(),peak=1;
  function merge(M,h,a,b){const old=M.get(h);if(old){old[0]=Math.max(old[0],a);old[1]=Math.max(old[1],b)}else M.set(h,[a,b])}
  function push(M,h,v,c){if(c===0)merge(M,h,...v);let a=0,b=0;for(let k=1;k<=3;k++){const d=k*q;if(h.length>=d&&h.charCodeAt(h.length-d)===c){a++;if(h.length>d&&h.charCodeAt(h.length-1)===h.charCodeAt(h.length-d-1))b++}}merge(M,(h+String.fromCharCode(c)).slice(-D),v[0]+a,v[1]+b)}
  for(let i=0;i<y.length;i++){const T=next;next=new Map();const sw=eligible(y,i,both);for(const [h,v] of S){push(T,h,v,y[i]);if(sw){const tmp=new Map();push(tmp,h,v,y[i+1]);for(const [hh,vv] of tmp)push(next,hh,vv,y[i]);}}S=T;peak=Math.max(peak,S.size+next.size)}
  let a=0,b=0;for(const v of S.values()){a=Math.max(a,v[0]);b=Math.max(b,v[1])}return {rune:a,bigram:b,peak};
 }
 function brute(y,q,both){let max=[0,0];function masks(raw,i,active){if(i===raw.length){const s=stats(active,q);max=max.map((v,j)=>Math.max(v,s[j]));return;}if(raw[i]===0)masks(raw,i+1,active);masks(raw,i+1,active.concat(raw[i]));}
  function paths(i,raw){if(i===y.length){masks(raw,0,[]);return;}paths(i+1,raw.concat(y[i]));if(eligible(y,i,both))paths(i+2,raw.concat(y[i+1],y[i]));}paths(0,[]);return max;}
 let toyCases=0;for(let n=1;n<=8;n++)for(let u=0;u<3**n;u+=31){let v=u;const y=Array.from({length:n},()=>{const d=v%3;v=Math.floor(v/3);return d;});for(const q of [1,2,3])for(const both of [false,true]){const b=bounds(y,q,both),a=brute(y,q,both);assert(b.rune===a[0]&&b.bigram===a[1],"toy maximum");toyCases++;}}
 function cipher(p,key){let k=0;return p.map(v=>v===0?0:(v+key[k++%key.length])%29);}
 function repair(a,choose){let y=[],swaps=[];for(let i=0;i<a.length;){if(i+1<a.length&&a[i]===y.at(-1)&&a[i+1]!==a[i]&&choose()){y.push(a[i+1],a[i]);swaps.push(i);i+=2;}else y.push(a[i++]);}return {y,swaps};}
 let seed=0x19193301;const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/2**32;};
 const hist=[{name:"WELCOME",C:readRunes(lp1.split("%").slice(1,3).join("%")),P:readRunes(donor.sections.find(s=>s.name==="0_welcome").source_text),K:[23,10,1,10,9,10,16,26]},{name:"KOAN",C:readRunes(lp1.split("$")[5]),P:readRunes(donor.sections.find(s=>s.name==="jpg107-167").source_text),K:[0,10,4,0,1,19,0,18,4,18,9,0,18]}];
 const reference=raw.map(native);
 const controls=[];
 function checkPlant(name,P,K,rev,actualC=null){const C=cipher(P,K);if(actualC)assert(C.join()===actualC.join(),"native replay");const input=rev?C.slice().reverse():C;const rr=repair(input,()=>random()<.8),Y=rev?rr.y.slice().reverse():rr.y;const s=stats(P.filter(v=>v!==0),K.length);const b=bounds(Y,K.length,rev);assert(s[0]<=b.rune&&s[1]<=b.bigram,"plant excluded");const inv=rr.y.slice();for(const i of rr.swaps){assert(eligible(rr.y,i,false),"forward motif");[inv[i],inv[i+1]]=[inv[i+1],inv[i]]}assert(inv.join()===input.join(),"repair replay");controls.push({name,q:K.length,n:P.length,rev,swaps:rr.swaps.length,actual:s,bounds:b});}
 for(const h of hist)for(const rev of [false,true])checkPlant(h.name,h.P,h.K,rev,h.C);
 for(const [j,q] of [8,13,29].entries())for(const rev of [false,true]){const p=reference[j].slice(10000+j*2000,10600+j*2000),key=Array.from({length:q},()=>Math.floor(random()*29));checkPlant(`literary-${j}`,p,key,rev);}
 const y=gp.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);assert(y.length===3008,"source size");const F=y.filter(v=>v===0).length;assert(F===125,"source F");
 const targets=[8,13,29].map(q=>{const samples=[];for(const [j,P] of reference.entries())for(let i=0;i<32;i++){const start=Math.round(i*(P.length-y.length)/31),a=P.slice(start,start+y.length).filter(v=>v!==0);samples.push({j,i,start,H:y.length-a.length,stats:stats(a,q)});}const min=[0,1].map(k=>Math.min(...samples.map(x=>x.stats[k])));const minRate=[0,1].map(k=>Math.min(...samples.map(x=>x.stats[k]/(3*(y.length-x.H)-6*q-(k?3:0)))));
 const models=[false,true].map(both=>{const b=bounds(y,q,both),maxRate=[b.rune/(3*(y.length-F)-6*q),b.bigram/(3*(y.length-F)-6*q-3)];return {both,...b,maxRate,rawPass:samples.filter(x=>x.stats[0]<=b.rune&&x.stats[1]<=b.bigram).length,ratePass:samples.filter(x=>x.stats.every((v,k)=>v/(3*(y.length-x.H)-6*q-(k?3:0))<=maxRate[k])).length};});return {q,min,minRate,models,samples};});
 return {n:y.length,F,toyCases,controls,targets};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp1_wulfic_canonical.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const d=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
const out=run(JSON.parse(d[0]),d[1],JSON.parse(d[2]),d.slice(3));
console.log(JSON.stringify(out,null,2));
