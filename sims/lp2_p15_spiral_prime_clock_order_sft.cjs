'use strict';
const fs=require('node:fs');const path=require('node:path');
function experiment(A,B){
const assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29;
const p=[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12],q=p.map((_,i)=>p.indexOf(i));
const K=[];for(let n=2;K.length<6100;n++){let b=true;for(let d=2;d*d<=n;d++)if(n%d===0){b=false;break}if(b)K.push((n-1)%29)}
const c=A.pages.slice(15,23).flatMap((p,i)=>i?p.indices:p.indices.slice(20));assert(c.length===1883,"original");
const donorNames=["0_koan_1","0_loss_of_divinity","jpg107-167","jpg229"];
const d=B.sections.filter(s=>donorNames.includes(s.name)).flatMap(s=>[...s.source_text].map(x=>A.runes.indexOf(x)).filter(x=>x>=0)).slice(0,c.length);
function clock(o,lead,perm,absolute=false){return Array.from({length:c.length+1},(_,i)=>{if(absolute){const j=o+i;return K[j-j%16+perm[j%16]]}if(i<lead)return K[o+i];const j=i-lead;return K[o+lead+j-j%16+perm[j%16]]})}
function enc(plain,key){let j=0;return plain.map(x=>x===0?0:mod(x+key[j++]))}
const known=B.sections.find(s=>s.name==="p56_an_end");const native=[...known.source_text].map(x=>A.runes.indexOf(x)).filter(v=>v>=0);assert(String(enc(native,K))===String(A.pages[56].indices),"p56 authentic");
function reach(c,k){let a=new Uint8Array(c.length+2),z=0;a[0]=1;for(let i=0;i<c.length;i++){let any=0,v=c[i];if(v===0){for(let h=z+1;h>=0;h--){a[h]=((h<=z&&a[h]&&k[i-h]!==0)||(h>0&&a[h-1]))?1:0;any|=a[h]}z++}else for(let h=0;h<=z;h++){if(a[h]&&k[i-h]===v)a[h]=0;any|=a[h]}if(!any)return i}return c.length}
const cases=[];for(const [name,perm] of [["spiral",p],["inverse",q]]){for(let lead=0;lead<16;lead++){let full=0,train=0,max=0,best=[];for(let o=0;o<=3301;o++){const n=reach(c,clock(o,lead,perm));if(n>=928)train++;if(n===c.length)full++;if(n>max){max=n;best=[o]}else if(n===max)best.push(o)}cases.push({name,lead,full,train,max,best})}let full=0,train=0,max=0,best=[];for(let o=0;o<=3301;o++){const n=reach(c,clock(o,0,perm,true));if(n>=928)train++;if(n===c.length)full++;if(n>max){max=n;best=[o]}else if(n===max)best.push(o)}cases.push({name,absolute:true,full,train,max,best})}
const plants=[{o:0,lead:0,perm:p},{o:133,lead:5,perm:q},{o:1033,lead:10,perm:p},{o:3301,lead:15,perm:q},{o:133,lead:0,perm:p,absolute:true}].map(({o,lead,perm,absolute})=>{const k=clock(o,lead,perm,absolute),x=enc(d,k),n=reach(x,k);assert(n===c.length,"native plant");return {o,lead,absolute:!!absolute,n}});
return {cases,plants};
}
const read=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'));console.log(JSON.stringify(experiment(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));