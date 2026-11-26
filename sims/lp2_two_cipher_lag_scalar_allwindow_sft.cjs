"use strict";
// Exhaustive sliding-window top-two capacity gate, complementary to the two-lag receiver.
const fs=require("node:fs"), path=require("node:path");
const root=path.resolve(__dirname,".."),files=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
function sliding(gp,sources){
 const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const a=[];for(const w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(x=>w.startsWith(x.s,i));if(!t)throw Error(w);a.push(t.i);i+=t.s.length}}}return a}
 function top2(h){let a=0,b=0;for(const x of h){if(x>=a){b=a;a=x}else if(x>b)b=x}return a+b}
 return sources.map(({name,source})=>{
   const tape=native(source),W=3008,N=12956,ch8start=9640,bound=482,h=new Uint16Array(29);
   for(let i=0;i<W;i++)h[tape[i]]++;
   let min=Infinity,minAt=-1,passes=0,fullAlignPasses=0,fullAlignN=0,fullAlignMin=Infinity,fullAlignMinAt=-1;
   for(let i=0;i+W<=tape.length;i++){
     const value=top2(h);
     if(value<min){min=value;minAt=i}
     if(value<=bound)passes++;
     if(i>=ch8start&&i-ch8start+N<=tape.length){fullAlignN++;if(value<fullAlignMin){fullAlignMin=value;fullAlignMinAt=i-ch8start}if(value<=bound)fullAlignPasses++}
     if(i+W<tape.length){h[tape[i]]--;h[tape[i+W]]++}
   }
   return {name,tapeLength:tape.length,windows:tape.length-W+1,min,minAt,passes,fullAlignN,fullAlignMin,fullAlignMinAt,fullAlignPasses}
 })
}
console.log(JSON.stringify(sliding(JSON.parse(read(files[0])),files.slice(1).map(name=>({name,source:read(name)}))),null,2));
