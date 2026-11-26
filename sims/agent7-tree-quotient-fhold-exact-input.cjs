"use strict";
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
const study=function study(raw,mode){
 const R=29,START=29,B=128,mod=x=>(x%R+R)%R,assert=(x,m)=>{if(!x)throw Error(m)},corpus=JSON.parse(raw[0]);
 const tokens=corpus.translit.map((x,i)=>[x.toUpperCase(),i]).sort((a,b)=>b[0].length-a[0].length);
 function encode(s){let out=[];for(let w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){while(w.length){let t=w.startsWith("ING")?["ING",21]:w.startsWith("IO")?["IO",27]:tokens.find(t=>w.startsWith(t[0]));if(!t){w=w.slice(1);continue}out.push(t[1]);w=w.slice(t[0].length)}}return out}
 function div(x,r){let q=[x[0]];for(let i=1;i<x.length-1;i++)q.push(mod(x[i]+r*q[i-1]));assert(mod(x.at(-1)+r*q.at(-1))===0,"remainder");return q}
 const pages=corpus.pages.map(p=>p.indices),original=[div(div(pages[10],7),24),pages[12],div(pages[11],24),pages[13]],lengths=original.map(x=>x.length);
 const train=encode(raw[1]),g=encode(raw[2]),e=encode(raw[3]),c1=new Float64Array(R),c2=new Float64Array(R*R),p=new Float64Array((R+1)*R);
 for(let i=0;i<train.length;i++){c1[train[i]]++;if(i)c2[train[i-1]*R+train[i]]++}
 for(let z=0;z<R;z++)p[START*R+z]=(c1[z]+.5)/(train.length+R*.5);
 for(let a=0;a<R;a++){let n=0;for(let z=0;z<R;z++)n+=c2[a*R+z];for(let z=0;z<R;z++)p[a*R+z]=(c2[a*R+z]+16*p[START*R+z])/(n+16)}
 const prob=(a,z)=>p[a*R+z];
 function suffix(c){let n=c.length,f=new Float64Array((n+1)*30);for(let a=0;a<30;a++)f[n*30+a]=1;for(let i=n-1;i>=0;i--)for(let a=0;a<30;a++){let sum=0;for(let z=0;z<R;z++)if(z||c[i]===0)sum+=prob(a,z)*(z?1:29)*f[(i+1)*30+z];f[i*30+a]=sum}return f}
let x=original;if(mode==="prefix20")x=original.map(y=>y.slice(0,20));else if(mode==="control0"){let seed=0x334a7111;function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%29}const truth=[g.slice(3000,3000+lengths[0]),e.slice(5000,5000+lengths[1]),g.slice(12000,12000+lengths[2]),e.slice(16000,16000+lengths[3])],k=Array.from({length:272},rand);x=truth.map(y=>{let i=0;return y.map(z=>z===0?0:mod(z+k[i++]))})}else assert(mode==="original","mode: original, prefix20, control0");return [...x.map(y=>y.map(z=>z.toString(36)).join("")),Array.from(c1).join(" "),...Array.from({length:29},(_,i)=>Array.from(c2.slice(i*29,i*29+29)).join(" "))].join("\n")+"\n"};
process.stdout.write(study(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")),process.argv[2]||"original"));
