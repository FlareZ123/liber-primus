"use strict";
const fs=require("node:fs");
function experiment(gp,raw){
 const Q=29,S=841,tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);t=t.slice(a?a.index+a[0].length:0,b?b.index:t.length);return (t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]).flatMap(w=>{let p=[];for(let j=0;j<w.length;){const q=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!q)throw Error(w);p.push(q.i);j+=q.t.length}return p})}
 function hist(c){const h=new Int32Array(S);for(let i=1;i<c.length;i++){let a=c[i-1],b=c[i];if(a&&b&&a!==b)h[a*Q+b]++;}return h;}
 function bins(target){const out=Array.from({length:S},()=>[]);
  for(let a=1;a<Q;a++)for(let b=1;b<Q;b++)for(let x=0;x<Q;x++)for(let y=0;y<Q;y++){const ca=(a+x)%Q,cb=(b+y)%Q;if(!ca||!cb||ca===cb)continue;const t=target[ca*Q+cb],row=out[a*Q+b];if(!row[t])row[t]=[];row[t].push(x*Q+y);}
  return out;
 }
 function scan(p,q,W,target,checkKey=null){
  const thresholds=bins(target),counts=new Int32Array(q*S),viol=new Int32Array(q*S),allowed=new Int32Array(q).fill(S);
  const pairs=new Int16Array(p.length-1).fill(-1),phases=new Uint8Array(p.length-1);let phase=0;
  for(let i=0;i+1<p.length;i++){const a=p[i],b=p[i+1];if(a&&b){pairs[i]=a*Q+b;phases[i]=phase;}if(a)phase=(phase+1)%q;}
  function change(i,d){const pair=pairs[i];if(pair<0)return;const j=phases[i],base=j*S,k=base+pair,t=counts[k]+(d<0?-1:0);counts[k]+=d;for(const e of thresholds[pair][t]||[]){const z=base+e,old=viol[z];viol[z]+=d;if(old===0&&d===1)allowed[j]--;if(old===1&&d===-1)allowed[j]++;if(viol[z]<0)throw Error("negative violations");}}
  function cycle(){const adj=Array.from({length:q},()=>new Int32Array(Q));for(let j=0;j<q;j++)for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)if(!viol[j*S+a*Q+b])adj[j][a]|=1<<b;
   for(let a=0;a<Q;a++){let reach=1<<a;for(let j=0;j<q&&reach;j++){let next=0;for(let b=0;b<Q;b++)if(reach&(1<<b))next|=adj[j][b];reach=next;}if(reach&(1<<a))return true;}return false;}
  for(let i=0;i<W-1;i++)change(i,1);
  if(checkKey){for(let j=0;j<q;j++)if(viol[j*S+checkKey[j]*Q+checkKey[(j+1)%q]])throw Error("true cycle lost");}
  let windows=0,localSurvivors=0,cycleSurvivors=0,maxMin=0,minEmpty=q,first=[];
  for(let s=0;s+W<=p.length;s++){windows++;let min=S,empty=0;for(let j=0;j<q;j++){min=Math.min(min,allowed[j]);if(!allowed[j])empty++;}maxMin=Math.max(maxMin,min);minEmpty=Math.min(minEmpty,empty);
   if(min>0){localSurvivors++;if(cycle()){cycleSurvivors++;if(first.length<10)first.push(s);}}
   if(s+W<p.length){change(s,-1);change(s+W-1,1);}
  }
  return {windows,localSurvivors,cycleSurvivors,maxMin,minEmpty,first};
 }
 let seed=0xdea3301;function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/2**32;}
 function plant(p,k){let phase=0,last=-1,c=[],full=[];for(const x of p){const y=x?(x+k[phase])%Q:0;if(x)phase=(phase+1)%k.length;full.push(y);if(y===last&&rnd()<.81)continue;c.push(y);last=y;}const a=hist(c),b=hist(full);if(a.some((x,i)=>x!==b[i]))throw Error("invariant");return c;}
 const donors=raw.map(native),original=gp.pages.slice(0,56).flatMap(x=>x.indices),target=hist(original);
 const controls=[],tests=[];
 for(const q of [8,13])for(let d=0;d<donors.length;d++){const p=donors[d].slice(18000,18000+13400),k=Array.from({length:q},()=>Math.floor(rnd()*Q)),c=plant(p,k);controls.push({q,d,key:k,retained:c.length,full:scan(p,q,p.length,hist(c),k),prefix:scan(p.slice(0,c.length),q,c.length,hist(c),k)});}
 for(const q of [8,13])for(let d=0;d<donors.length;d++)tests.push({q,d,n:donors[d].length,...scan(donors[d],q,original.length,target)});
 return {originalLength:original.length,maskedPairs:target.reduce((a,b)=>a+b,0),maxTarget:Math.max(...target),controls,tests};
}
const gp=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
const donors=["gibran_prophet_58585.txt","emerson_essays_2944.txt","shakespeare_first300k.txt"].map(x=>fs.readFileSync("resources/control/"+x,"utf8"));
console.log(JSON.stringify(experiment(gp,donors),null,2));
