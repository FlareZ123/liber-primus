"use strict";
const fs=require("node:fs");
function experiment(raw,gp,known){
 const mod=x=>(x+29)%29;
 const tokens=gp.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
 function encode(raw){const result=[];for(let w of raw.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");for(let i=0;i<w.length;){const t=tokens.find(([s])=>w.startsWith(s,i));if(!t)throw Error("unmapped "+w.slice(i));result.push(t[1]);i+=t[0].length;}}return result;}
 const key=encode(raw), parse=s=>Array.from(s).map(x=>gp.runes.indexOf(x)).filter(x=>x>=0);
 function enc(p,k,origin,sign){let j=origin;return p.map(x=>x===0?0:mod(x+sign*k[j++]));}
 function sweep(c,k,sign){
  const m=c.filter(x=>x===0).length+1;
  let cur=new Int32Array(m),next=new Int32Array(m),seen=new Int32Array(m),tag=0;
  const survivors=[],hist=new Uint32Array(c.length+1);let max=0,best=[];
  const signed=k.map(x=>mod(sign*x));
  for(let start=0;start<=k.length;start++){
   let n=1;cur[0]=0;let i=0;
   for(;i<c.length;i++){
    let nn=0;tag++;const x=c[i];
    for(let z=0;z<n;z++){const h=cur[z],j=start+i-h;
     if(j<k.length&&x!==signed[j]&&seen[h]!==tag){seen[h]=tag;next[nn++]=h;}
     if(x===0&&seen[h+1]!==tag){seen[h+1]=tag;next[nn++]=h+1;}
    }
    if(!nn)break;
    const t=cur;cur=next;next=t;n=nn;
   }
   hist[i]++;
   if(i>max){max=i;best=[start];}else if(i===max&&best.length<10)best.push(start);
   if(i===c.length)survivors.push({start,ends:n});
  }
  return {sign,starts:k.length+1,max,best,survivorCount:survivors.length,survivors:survivors.slice(0,100),prefixAtLeast100:hist.slice(100).reduce((s,x)=>s+x,0)};
 }
 const plain56=parse(known.sections.at(-2).source_text),p56=gp.pages[56].indices;const primes=[];for(let x=2;primes.length<85;x++){if(primes.every(p=>p*p>x||x%p!==0))primes.push(x);}
 const p56replay=enc(plain56,primes.map(p=>(p-1)%29),0,1);
 if(p56replay.some((x,i)=>x!==p56[i]))throw Error("real p56 replay failed");
 const full=gp.pages.slice(0,56).flatMap(p=>p.indices);
 const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 const cases=[{name:"full p0-55",c:full},{name:"black opening p0-2",c:full.slice(13,729)},{name:"black terminal p54-55",c:gp.pages.slice(54,56).flatMap(p=>p.indices).slice(9)},...ranges.map(([a,b])=>({name:`p${a}-${b}`,c:gp.pages.slice(a,b+1).flatMap(p=>p.indices)}))];
 const results=cases.map(({name,c})=>({name,length:c.length,zeros:c.filter(x=>x===0).length,runs:[1,-1].map(sign=>sweep(c,key,sign))}));
 const plants=known.sections.slice(5).map((s,i)=>{const p=parse(s.source_text),start=[133,3301,761,1033][i],sign=i%2?-1:1,c=enc(p,key,start,sign),v=sweep(c,key,sign);return {name:s.name,length:p.length,start,sign,plantedIncluded:v.survivors.some(x=>x.start===start),...v};});
 return {keyLength:key.length,rawWords:(raw.toUpperCase().match(/[A-Z]+/g)||[]).length,p56Control:plain56.length,results,plants};
}
const paths=["resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt","resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(experiment(fs.readFileSync(paths[0],"utf8"),JSON.parse(fs.readFileSync(paths[1],"utf8")),JSON.parse(fs.readFileSync(paths[2],"utf8"))),null,2));
