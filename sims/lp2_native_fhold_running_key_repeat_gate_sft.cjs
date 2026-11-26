'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/transcriptions/lp1_wulfic_canonical.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function experiment(inputs){
 const assert=(v,m)=>{if(!v)throw Error(m||"assertion")},gp=JSON.parse(inputs[0]),native=JSON.parse(inputs[1]),ix=new Map(gp.runes.map((x,i)=>[x,i])),alpha=new Map(gp.translit.map((x,i)=>[x,i]));
 alpha.set("ING",21);alpha.set("IO",27);
 const extract=s=>Array.from(s).filter(x=>ix.has(x)).map(x=>ix.get(x));
 const same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const sections=new Map(native.sections.map(s=>[s.name,extract(s.source_text)]));
 function replay(p,key,c){let j=0;const enc=p.map(x=>x===0?0:(x+key[j++%key.length])%29);assert(same(enc,c),"authentic replay");return {runes:p.length,consumed:j,holds:p.length-j}}
 const nativeControls={WELCOME:replay(sections.get("0_welcome"),[23,10,1,10,9,10,16,26],extract(inputs[2].split("%").slice(1,3).join("%"))),KOAN:replay(sections.get("jpg107-167"),[0,10,4,0,1,19,0,18,4,18,9,0,18],extract(inputs[2].split("$")[5]))};
 function donor(s){
  const start=/\*\*\* START OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[^\r\n]*\*\*\*/i.exec(s);if(start)s=s.slice(start.index+start[0].length);
  const end=/\*\*\* END OF (?:THIS|THE) PROJECT GUTENBERG EBOOK/i.exec(s);if(end)s=s.slice(0,end.index);
  const out=[];for(let t of s.match(/[A-Za-z]+/g)||[]){t=t.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");while(t.length){let ok=false;for(let n=Math.min(t.length,3);n>=1;n--){const v=alpha.get(t.slice(0,n));if(v!==undefined){out.push(v);t=t.slice(n);ok=true;break}}assert(ok,"donor transliteration")}}
  return out;
 }
 const labels=["Gibran","Shakespeare","Emerson"],donors=inputs.slice(3).map(donor);
 const page=(a,b)=>gp.pages.filter(x=>x.page>=a&&x.page<=b).flatMap(x=>x.indices);
 const geometries=[["p0–55",page(0,55)],["p40–53",page(40,53)],["p54–55",page(54,55)],["p54–55 black",page(54,55).slice(9)]];
 assert(geometries.map(x=>x[1].length).join(",")==="12956,3008,308,299");
 function measures(c){let f=0,r=0,rr0=0;for(let i=0;i<c.length;i++){if(c[i]===0)f++;if(i&&c[i]===c[i-1]){r++;if(c[i]===0)rr0++}}return {f,repeats:r,repeatF:rr0}}
 function profile(d){const a=new Float64Array(29),b=new Float64Array(841);for(let i=0;i<d.length;i++){a[d[i]]++;if(i)b[d[i-1]*29+d[i]]++}return {uni:Array.from(a,x=>x/d.length),bi:Array.from(b,x=>x/(d.length-1))}}
 const profiles=donors.map(profile);
 function stationary(p,k){
  let f=p.uni[0],repeat=p.bi[0];
  for(let a=1;a<29;a++){f+=p.uni[a]*k.uni[29-a];repeat+=(p.bi[a]+p.bi[a*29])*k.uni[29-a]}
  const delta=Array(29).fill(0);for(let x=0;x<29;x++)for(let y=0;y<29;y++)delta[(y-x+29)%29]+=k.bi[x*29+y];
  for(let a=1;a<29;a++)for(let b=1;b<29;b++)repeat+=p.bi[a*29+b]*delta[(a-b+29)%29];
  return {f,repeat};
 }
 const expected=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(i!==j)expected.push({plain:labels[i],key:labels[j],...stationary(profiles[i],profiles[j])});
 let rng=0x33013032;
 function rand(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n}
 function stats(a,field,observed){const v=a.map(x=>x[field]),mean=v.reduce((s,x)=>s+x,0)/v.length;return {min:Math.min(...v),max:Math.max(...v),mean,sd:Math.sqrt(v.reduce((s,x)=>s+(x-mean)**2,0)/v.length),atOrBelow:v.filter(x=>x<=observed).length}}
 function windowF(d,n,ceiling){let f=d.slice(0,n).filter(x=>x===0).length,min=f,max=f,le=Number(f<=ceiling),total=1;for(let i=n;i<d.length;i++){f+=Number(d[i]===0)-Number(d[i-n]===0);min=Math.min(min,f);max=Math.max(max,f);le+=Number(f<=ceiling);total++}return {min,max,le,total}}
 const modes=["nativeHold","uniformHold","transparentConsume","ordinaryConsume"],results=[];
 for(const [name,C] of geometries){
  const n=C.length,original=measures(C),samples=[];
  for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(i!==j){
   const d=donors[i],k=donors[j];assert(d.length>=n&&k.length>=n);
   for(let trial=0;trial<200;trial++){
    const a=rand(d.length-n+1),b=rand(k.length-n+1),p=d.slice(a,a+n),key=k.slice(b,b+n);
    const uniform=Array.from({length:n},()=>rand(29));let cursor=0,consumingF=0;const c0=[],c1=[],c2=[],c3=[];
    for(let t=0;t<n;t++){const v=p[t];
     if(v===0){c0.push(0);c1.push(0);c2.push(0)}
     else {const z=(v+key[cursor])%29;c0.push(z);c1.push((v+uniform[cursor])%29);c2.push((v+key[t])%29);if(z===0)consumingF++;assert((z-key[cursor]+29)%29===v,"conditional native inverse");cursor++}
     c3.push((v+key[t])%29);
    }
    const holds=n-cursor;assert(c0.filter(x=>x===0).length===holds+consumingF);
    samples.push({plain:labels[i],key:labels[j],a,b,holds,consumingF,nativeHold:measures(c0),uniformHold:measures(c1),transparentConsume:measures(c2),ordinaryConsume:measures(c3)});
   }
  }
  const summaries={};for(const mode of modes){const s=samples.map(x=>x[mode]);summaries[mode]={f:stats(s,"f",original.f),repeats:stats(s,"repeats",original.repeats),repeatF:stats(s,"repeatF",original.repeatF),jointAtOrBelow:s.filter(x=>x.f<=original.f&&x.repeats<=original.repeats).length}}
  results.push({name,n,original,sampleCount:samples.length,allPlainWindows:donors.map((d,i)=>({donor:labels[i],...windowF(d,n,original.f)})),summaries,samples});
 }
 return {nativeControls,donorLengths:donors.map((d,i)=>({name:labels[i],length:d.length,f:profiles[i].uni[0]})),stationaryExpected:expected,results};
}
if(require.main===module) console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'))),null,2));
module.exports={experiment,files};
