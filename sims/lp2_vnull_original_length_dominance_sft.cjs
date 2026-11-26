"use strict";
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/orthodox_daily_prayers_pg34981.txt"];
function experiment(raw){
 const c=JSON.parse(raw[0]),runes=new Set(c.runes),body=raw[1].split("%").slice(0,55).join("%");let original=[],n=0;for(const l of body){if(runes.has(l))n++;else if("-.$&§0123456789".includes(l)){if(n)original.push(n);n=0}}if(n)original.push(n);
 const N=original.length,T=original.reduce((s,x)=>s+x,0),Q=Math.max(...original),obs=Array.from({length:Q},(_,i)=>original.filter(x=>x<=i+1).length),rmax=(1-.664/3.448)*9/256;
 if(N!==2896||T!==12956||Q!==14||obs[0]!==83)throw Error("source parser");
 const modes=["prior-native","native","checker"],base=c.translit.slice(),sort=a=>a.sort((x,y)=>y.length-x.length),labels={ "prior-native":sort(["ING",...base.map(s=>s==="IA"?"IO":s)]),native:sort(base.slice()),checker:sort(base.slice())};
 function len(w,mode){w=w.toUpperCase().replace(/'/g,"");if(mode!=="checker")w=w.replace(/QU/g,"CW");if(mode==="native")w=w.replace(/ING/g,"NG").replace(/IO/g,"IA");w=w.replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let i=0,n=0;while(i<w.length){let a=labels[mode].find(s=>w.startsWith(s,i));if(!a)throw Error(w);i+=a.length;n++}return n}
 function words(t,mode){if(mode!=="prior-native")t=t.split(/\*\*\* END OF/i)[0].replace(/^.*?\*\*\* START OF[^\n]*\n/is,"");return Array.from(t.matchAll(mode==="prior-native"?/[A-Za-z]+/g:/[A-Za-z]+(?:'[A-Za-z]+)*/g),m=>len(m[0],mode))}
 function logTail(m){const d=T-m;if(d<=0)return 0;const trials=T-1;if(d>trials)return -Infinity;let lp=trials*Math.log1p(-rmax);for(let i=1;i<=d;i++)lp+=Math.log(trials-i+1)-Math.log(i)+Math.log(rmax)-Math.log1p(-rmax);let sum=lp;for(let i=d+1;i<=trials;i++){lp+=Math.log(trials-i+1)-Math.log(i)+Math.log(rmax)-Math.log1p(-rmax);sum=Math.max(sum,lp)+Math.log1p(Math.exp(-Math.abs(sum-lp)))}return Math.min(0,sum)/Math.LN10}
 function bound(ls){let h=new Array(Q+2).fill(0),total=0,compatible=0,max=-1,at=-1,wh=null;for(const l of ls.slice(0,N)){h[Math.min(Q+1,l)]++;total+=l}for(let i=0;i<=ls.length-N;i++){if(i){const a=ls[i-1],b=ls[i+N-1];h[Math.min(Q+1,a)]--;h[Math.min(Q+1,b)]++;total+=b-a}let ok=total<=T,s=0;for(let k=1;k<=Q&&ok;k++){s+=h[k];if(s<obs[k-1])ok=false}if(ok){compatible++;if(total>max){max=total;at=i;wh=h.slice(1)}}}return {windows:ls.length-N+1,compatible,maxNativeRunes:max,offset:at,requiredNulls:max<0?null:T-max,log10Upper:max<0?null:logTail(max),histogram:wh}}
 const rows=[];for(const mode of modes)for(let j=2;j<raw.length;j++){const ls=words(raw[j],mode);rows.push({mode,donor:j-2,words:ls.length,...bound(ls)})}
 // Nonnegative extensions must preserve sorted length dominance.
 let state=0x29694c9;function ri(n){state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)%n}
 let controls=0;for(let j=2;j<raw.length;j++){let ls=words(raw[j],"native");for(let trial=0;trial<16;trial++){let offset=ri(ls.length-N+1),p=ls.slice(offset,offset+N).sort((a,b)=>a-b),v=p.map(l=>l+ri(3)).sort((a,b)=>a-b);if(p.some((l,i)=>l>v[i]))throw Error("dominance control");controls++}}
 return {source:{N,T,obs,rmax},rows,controls};
}
if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
module.exports={experiment,paths};
