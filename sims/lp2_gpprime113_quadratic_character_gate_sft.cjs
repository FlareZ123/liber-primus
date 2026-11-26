'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(inputs){
 const c=JSON.parse(inputs[0]),native=JSON.parse(inputs[1]),M=113,Q=112,G=5,ord=5,mask=(1<<ord)-1;
 const powers=[1];for(let i=1;i<Q;i++)powers.push(powers[i-1]*G%M);if(new Set(powers).size!==Q)throw Error("generator");
 const cl=c.prime.map(p=>powers.indexOf(p)%2),toBits=a=>a.map(x=>cl[x]);
 const nat=native.sections.filter(x=>x.name!=="0_wisdom").map(s=>({name:s.name,a:[...s.source_text].map(r=>c.runes.indexOf(r)).filter(x=>x>=0)}));
 const tok=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(s){let out=[];for(let w of s.match(/[A-Za-z]+/g)||[]){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3;continue}if(w.startsWith("IO",i)){out.push(27);i+=2;continue}const t=tok.find(t=>w.startsWith(t.s,i));if(!t)throw Error("normalization "+w);out.push(t.i);i+=t.s.length}}return out}
 const train=nat.map(s=>toBits(s.a)),counts=Array.from({length:1<<ord},()=>[1,1]);function code(a,i){let x=0;for(let j=i-ord;j<i;j++)x=x*2+a[j];return x}
 for(const a of train)for(let i=ord;i<a.length;i++)counts[code(a,i)][a[i]]++;
 const log=counts.map(([x,y])=>[Math.log(x/(x+y)),Math.log(y/(x+y))]);
 const vals=a=>a.map((b,i)=>i<ord?0:log[code(a,i)][b]);
 const score=a=>vals(a).reduce((s,x)=>s+x,0)/(a.length-ord);
 function bestFlip(a){const v=vals(a),total=v.reduce((s,x)=>s+x,0);let best=total,loc=-1;for(let j=0;j<a.length;j++){a[j]^=1;let s=total;for(let i=Math.max(ord,j);i<=Math.min(a.length-1,j+ord);i++)s+=log[code(a,i)][a[i]]-v[i];a[j]^=1;if(s>best){best=s;loc=j}}return {score:best/(a.length-ord),loc}}
 function near(d,t){let hits=new Set();const mid=Math.floor(t.length/2);for(const [half,off] of [[t.slice(0,mid),0],[t.slice(mid),mid]])for(let pos=d.indexOf(half);pos>=0;pos=d.indexOf(half,pos+1)){const j=pos-off;if(j<0||j+t.length>d.length)continue;let err=0;for(let k=0;k<t.length&&err<=1;k++)err+=d[j+k]!==t[k];if(err<=1)hits.add(j)}return [...hits].sort((a,b)=>a-b)}
 const starts=[0,3,8,15,23,27,33,40,54,56],offs=[13,16,12,20,16,19,10,8,9];
 const targets=starts.slice(0,-1).map((p,i)=>({page:p,a:toBits(c.pages.slice(p,starts[i+1]).flatMap(x=>x.indices).slice(offs[i]))}));
 const donors=inputs.slice(2).map((s,i)=>({name:["Gibran","Shakespeare","Emerson"][i],a:toBits(encode(s))}));
 let result={order:ord,classMap:cl,training:nat.map(x=>({name:x.name,n:x.a.length})),counts,donors:donors.map(x=>({name:x.name,n:x.a.length})),targets:[],positiveControls:[]};
 for(const d of donors){const ds=d.a.join("");const t=ds.slice(1000,1300).split("");t[173]=t[173]==="0"?"1":"0";const hits=near(ds,t.join(""));if(!hits.includes(1000))throw Error("one-mismatch control");result.positiveControls.push({donor:d.name,oneBitMutatedStart:1000,recovered:hits.includes(1000),matches:hits.length})}
 for(const t of targets){const ts=t.a.join(""),raw=score(t.a),best=bestFlip(t.a),r={page:t.page,n:t.a.length,raw,best,donors:[],authentic:[]};
  for(const d of donors){const a=d.a,v=vals(a),pre=new Float64Array(a.length+1);for(let i=0;i<a.length;i++)pre[i+1]=pre[i]+v[i];let min=Infinity,max=-Infinity,below=0,windows=0;
   for(let i=0;i+t.a.length<=a.length;i++){const s=(pre[i+t.a.length]-pre[i+ord])/(t.a.length-ord);min=Math.min(min,s);max=Math.max(max,s);below+=s<=best.score;windows++}
   r.donors.push({name:d.name,windows,min,max,belowOrEqualBestOneFlip:below,nearMatches:near(a.join(""),ts).length});
  }
  for(const d of nat){if(d.a.length<t.a.length)continue;const a=toBits(d.a);r.authentic.push({name:d.name,windows:a.length-t.a.length+1,nearMatches:near(a.join(""),ts).length})}
  result.targets.push(r);
 }
 return result;
}
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
