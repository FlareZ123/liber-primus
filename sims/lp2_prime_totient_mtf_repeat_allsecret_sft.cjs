'use strict';
// All-secret initial-MTF-alphabet lower bound with the authentic p56 clear-F clock.
const fs=require('node:fs'), path=require('node:path');
function repeatGate(g,gibran,sh,em,lp){
 const gp=JSON.parse(g),mod=x=>(x%29+29)%29,id=Array.from({length:29},(_,i)=>i),tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const a=[];for(const w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){const t=w.startsWith("ING",i)?{s:"ING",i:21}:w.startsWith("IO",i)?{s:"IO",i:27}:tok.find(t=>w.startsWith(t.s,i));if(!t)throw Error(w);a.push(t.i);i+=t.s.length}}return a}
 const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]),c=gp.pages.slice(0,56).flatMap(p=>p.indices),n=c.length;
 const pri=[];for(let x=2;pri.length<n;x++){let ok=true;for(let d=2;d*d<=x;d++)if(x%d===0){ok=false;break}if(ok)pri.push(mod(x-1))}
 /** @param {number[]} p @param {boolean} skip */
 function shift(p,skip){let j=0;return p.map(x=>skip&&x===0?0:mod(x+pri[j++]))}
 const p56=native("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE");
 if(!eq(shift(p56,true),gp.pages[56].indices)||!eq(native(lp.split("### 57\n")[1]),gp.pages[57].indices))throw Error("solved source");
 /** @param {number[]} s @param {number[]} pi */
 function mtf(s,pi){let L=pi.slice();return s.map(x=>{let j=L.indexOf(x);L.splice(j,1);L.unshift(x);return j})}
 // A repeat-access rank is exact independently of the initial permutation.
 /** @param {number[]} s */
 function lower(s){const seen=new Map(),r=[];for(let i=0;i<s.length;i++){const x=s[i],j=seen.get(x);r.push(j===undefined?-1:new Set(s.slice(j+1,i)).size);seen.set(x,i)}let known=0,hits=0;for(let i=1;i<r.length;i++)if(r[i]>=0&&r[i-1]>=0){known++;if(r[i]===r[i-1])hits++}return {known,hits,r}}
 const off=[0];for(const p of gp.pages.slice(0,56))off.push(off.at(-1)+p.indices.length);
 const regs=[["book",[0,n]],["chapter",[0,3,8,15,23,28,33,40,54,56].map(i=>off[i])],["page",off]];
 const corpora=[["Gibran",native(gibran.slice(gibran.indexOf("Almustafa"),gibran.indexOf("*** END OF")))],["Shakespeare",native(sh)],["Emerson",native(em)]];
 const donors=corpora.flatMap(([name,p])=>[0,Math.floor((p.length-n)/2),p.length-n].map(start=>({name,start,p:p.slice(start,start+n)})));
 const count=(s)=>s.slice(1).reduce((a,x,i)=>a+Number(x===s[i]),0);
 const out=[];
 for(const [clock,b] of regs){
  const spans=b.slice(1).map((hi,i)=>[b[i],hi]).filter(([lo,hi])=>hi>lo);
  const orig=spans.reduce((s,[lo,hi])=>s+count(c.slice(lo,hi)),0);
  for(const skip of [false,true]){
   const controls=donors.map(d=>{
    let known=0,hits=0,totalA=0,totalB=0;
    for(const [lo,hi] of spans){
     const s=shift(d.p.slice(lo,hi),skip),z=lower(s),a=mtf(s,id),pi=id.map(i=>mod(7*i+3));[pi[0],pi[9]]=[pi[9],pi[0]];const b=mtf(s,pi);
     for(let i=0;i<z.r.length;i++)if(z.r[i]>=0&&(z.r[i]!==a[i]||z.r[i]!==b[i]))throw Error("rank invariant");
     known+=z.known;hits+=z.hits;totalA+=count(a);totalB+=count(b);
    }
    if(totalA<hits||totalB<hits)throw Error("repeat bound");
    return {name:d.name,start:d.start,known,hits,canonical:totalA,nonlinear:totalB};
   });
   out.push({clock,skip,originalRepeats:orig,min:Math.min(...controls.map(x=>x.hits)),max:Math.max(...controls.map(x=>x.hits)),controls});
  }
 }
 const expected=[[405,480],[396,486],[408,453],[392,482],[367,415],[368,425]];
 if(n!==12956||count(c)!==86||out.some((x,i)=>x.originalRepeats!==86||x.min!==expected[i][0]||x.max!==expected[i][1]))throw Error("original/finite control counts changed");
 return {n,originalGlobal:count(c),out};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/liber-primus/lp1-plaintext-reference.txt"];
const data=files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'));
console.log(JSON.stringify(repeatGate(...data),null,2));
