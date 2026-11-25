"use strict";
const fs=require("node:fs");const path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function prepare(raw,N=128){
 const gp=JSON.parse(raw[0]),solved=JSON.parse(raw[1]),s=.81288;
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function native(t){const a=[];for(const w of t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let j=0;j<w.length;){const q=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));if(!q)throw Error("native");a.push(q.i);j+=q.t.length;}}return a;}
 const donors=raw.slice(2).map(native);
 if(donors.map(x=>x.length).join(",")!=="62492,217106,321327")throw Error("donor size");
 const p57=solved.sections.find(x=>x.name==="p57_parable").source_text;
 const p57r=[...p57].map(x=>gp.runes.indexOf(x)).filter(x=>x>=0);
 if(native("PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE").join(",")!==p57r.join(","))throw Error("p57 control");
 const uni=Array(29).fill(0),bi=Array(841).fill(0);
 for(const a of donors)for(let i=0;i<Math.floor(a.length*.8);i++){uni[a[i]]++;if(i)bi[a[i-1]*29+a[i]]++;}
 function seeded(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;}}
 const mod=x=>(x+29)%29;
 function plant(P,seed,independent=false){
  const rng=seeded(seed),C=P.map(()=>[]),pos=[0,0,0],pend=[false,false,false],keys=[],masks=[],holds=[];
  while(pos.some((x,j)=>x<P[j].length)){
    const z=[0,0,0];
    for(let j=0;j<3;j++)while(!pend[j]&&pos[j]<P[j].length&&P[j][pos[j]]===0){C[j].push(0);pos[j]++;z[j]++;}
    holds.push(z);
    if(pos.every((x,j)=>x===P[j].length)){keys.push(-1);masks.push(0);break;}
    const k=Math.floor(rng()*29);let mask=0;keys.push(k);
    for(let j=0;j<3;j++){
      if(pos[j]===P[j].length)continue;
      const kj=independent?Math.floor(rng()*29):k,c=mod(P[j][pos[j]]+kj);
      if(!pend[j]&&pos[j]>0&&C[j].at(-1)===c&&rng()<s){pend[j]=true;mask|=1<<j;continue;}
      C[j].push(c);pos[j]++;pend[j]=false;
    }
    masks.push(mask);
  }
  return {C,keys,masks,holds}
}
 const cases=[],start=N===128?0:4;
 for(let q=start;q<start+4;q++){const P=donors.map((a,j)=>a.slice(Math.floor(a.length*.82)+q*1027+j*71,Math.floor(a.length*.82)+q*1027+j*71+N));const p=plant(P,0xBAAD1200+q);cases.push({name:"shared"+q,C:p.C,skip:p.masks.reduce((acc,m)=>acc.map((x,j)=>x+((m>>j)&1)),[0,0,0])});}
 for(let q=0;q<4;q++){const P=donors.map((a,j)=>a.slice(Math.floor(a.length*.94)+q*499+j*31,Math.floor(a.length*.94)+q*499+j*31+N));const p=plant(P,0x1FDEA100+q,true);cases.push({name:"null"+q,C:p.C,skip:p.masks.reduce((acc,m)=>acc.map((x,j)=>x+((m>>j)&1)),[0,0,0])});}
 const full=[24,25,26].map(p=>gp.pages[p].indices);
 for(const offsets of [[0,0,0],[3,2,1]])cases.push({name:"original"+offsets.join(""),C:full.map((a,j)=>a.slice(offsets[j],offsets[j]+N))});
 const alphabet="0123456789ABCDEFGHIJKLMNOPQRS",encode=a=>a.map(x=>alphabet[x]).join("");
 const input=[N,uni.map(x=>x.toString(36)).join(" "),bi.map(x=>x.toString(36)).join(" "),cases.length,...cases.map(x=>[x.name,...x.C.map(encode)].join(" "))].join("\n")+"\n";
 let hash=2166136261;for(const x of input){hash^=x.charCodeAt(0);hash=Math.imul(hash,16777619)>>>0;}
 return {input,fnv32:hash.toString(16),skips:cases.map(x=>[x.name,x.skip])};
}
const result=prepare(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")),process.argv.includes("--full")?264:128);process.stdout.write(result.input);
