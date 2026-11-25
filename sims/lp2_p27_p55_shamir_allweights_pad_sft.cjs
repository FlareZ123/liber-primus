"use strict";
/** Agent14: all normalized three-share field mixtures as p55 pad, consuming and literal plaintext-F hold. */
const fs=require("node:fs"),path=require("node:path");
function experiment(corpus,english){
 const R=29,mod=x=>(x%R+R)%R,ix=new Map(corpus.translit.map((t,i)=>[t,i]));
 const norm=english.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
 const donor=[];for(let i=0;i<norm.length;i++){if(!/[A-Z]/.test(norm[i]))continue;const p=norm.slice(i,i+2);if(ix.has(p)){donor.push(ix.get(p));i++}else if(ix.has(norm[i]))donor.push(ix.get(norm[i]));}
 const cut=Math.floor(donor.length*.67),c1=new Int32Array(29),c2=new Int32Array(841),c3=new Int32Array(24389);
 for(let i=0;i<cut;i++){const z=donor[i];c1[z]++;if(i)c2[donor[i-1]*29+z]++;if(i>1)c3[(donor[i-2]*29+donor[i-1])*29+z]++}
 const p1=Float64Array.from(c1,x=>(x+.005)/(cut+29*.005)),p2=new Float64Array(841),l1=Float64Array.from(p1,Math.log),l2=new Float64Array(841),l3=new Float64Array(24389);
 for(let a=0;a<29;a++)for(let b=0;b<29;b++){const j=a*29+b;p2[j]=(c2[j]+.7*p1[b])/(c1[a]+.7);l2[j]=Math.log(p2[j])}
 for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++){const j=(a*29+b)*29+c;l3[j]=Math.log((c3[j]+2.5*p2[b*29+c])/(c2[a*29+b]+2.5))}
 function score(x){let s=l1[x[0]]+l2[x[0]*29+x[1]];for(let i=2;i<x.length;i++)s+=l3[(x[i-2]*29+x[i-1])*29+x[i]];return s}
 const p27=corpus.pages[27].indices,p55=corpus.pages[55].indices;
 if(p27.length!==234||p55.length!==76||p27.slice(28,34).join()!=p55.slice(70).join())throw Error("source seam");
 const stripped=p27.slice(34).concat(p27.slice(0,28)),idxs=Array.from({length:76},(_,i)=>i);
 const layouts=[
 ["marker-contiguous",idxs.map(i=>[stripped[i],stripped[i+76],stripped[i+152]])],
 ["marker-interleaved",idxs.map(i=>stripped.slice(3*i,3*i+3))],
 ["row-outer-trim",idxs.map(i=>[p27[i+1],p27[i+79],p27[i+157]])],
 ["triple-outer-trim",idxs.map(i=>p27.slice(3*(i+1),3*(i+2)))]
 ];
 const keys=[];
 for(let [layout,triples] of layouts)for(let a=1;a<29;a++)for(let b=1;b<29;b++){const c=mod(1-a-b);if(c===0)continue;for(let sign of [1,-1]){const coeff=[a,b,c],key=triples.map(t=>mod(sign*(a*t[0]+b*t[1]+c*t[2])));keys.push({layout,coeff,sign,key})}}
 if(keys.length!==4*757*2)throw Error("keys "+keys.length);
 function enc(p,key,hold){let j=0;return p.map(v=>hold&&v===0?0:mod(v+key[j++]))}
 function attack(ct){
  let best=null,runner=-Infinity,ordinary=0,holdPaths=0,holdKeys=0;const bestByMode={ordinary:null,hold:null},bestByLayout={};let top=[];
  function submit(p,k,mode,used){const s=score(p);const row={layout:k.layout,coeff:k.coeff,sign:k.sign,mode,used,score:s,p:p.slice(),key:k.key};if(mode==="ordinary")ordinary++;else holdPaths++;if(!best||s>best.score){if(best)runner=best.score;best=row}else if(s>runner)runner=s;
   if(!bestByMode[mode]||s>bestByMode[mode].score)bestByMode[mode]=row;
   if(!bestByLayout[k.layout]||s>bestByLayout[k.layout].score)bestByLayout[k.layout]=row;
  }
  for(const k of keys){
   submit(ct.map((v,i)=>mod(v-k.key[i])),k,"ordinary",ct.length);
   let any=false;const p=[];
   function walk(i,j){if(i===ct.length){any=true;submit(p,k,"hold",j);return}
    if(ct[i]===0){p.push(0);walk(i+1,j);p.pop()}
    const v=mod(ct[i]-k.key[j]);if(v!==0){p.push(v);walk(i+1,j+1);p.pop()}
   }
   walk(0,0);if(any)holdKeys++;
  }
  for(const r of [best,...Object.values(bestByMode),...Object.values(bestByLayout)])if(enc(r.p,r.key,r.mode==="hold").join()!=ct.join())throw Error("replay");
  return {best,runner,ordinary,holdPaths,holdKeys,bestByMode,bestByLayout};
 }
 const fmt=r=>({layout:r.layout,coeff:r.coeff,sign:r.sign,mode:r.mode,used:r.used,score:r.score,mean:r.score/r.p.length,plaintext:r.p.map(v=>corpus.translit[v]).join(""),indices:r.p});
 const actual=attack(p55);
 const plants=[];
 const cases=[
  {layout:"marker-contiguous",coeff:[3,26,1],sign:1,hold:false,p:corpus.pages[57].indices.slice(0,76)},
  {layout:"marker-interleaved",coeff:[1,26,3],sign:1,hold:true,p:donor.slice(cut+1500,cut+1576)},
  {layout:"row-outer-trim",coeff:[8,11,11],sign:-1,hold:false,p:donor.slice(cut+3000,cut+3076)},
  {layout:"triple-outer-trim",coeff:[7,9,14],sign:1,hold:true,p:donor.slice(cut+5000,cut+5076)}
 ];
 for(const t of cases){const k=keys.find(r=>r.layout===t.layout&&r.coeff.join()===t.coeff.join()&&r.sign===t.sign);if(!k)throw Error("plant");
  const ct=enc(t.p,k.key,t.hold),r=attack(ct),b=r.best;
  plants.push({truth:{layout:t.layout,coeff:t.coeff,sign:t.sign,mode:t.hold?"hold":"ordinary"},selected:fmt(b),exact:b.p.filter((v,i)=>v===t.p[i]).length,truthScore:score(t.p),sameKey:b.key.join()===k.key.join(),runner:r.runner});
 }
 return {source:{p27:p27.length,p55:p55.length,marker:p55.slice(70),donorTrain:cut},weights:757,keys:keys.length,original:{best:fmt(actual.best),runner:actual.runner,ordinary:actual.ordinary,holdPaths:actual.holdPaths,holdKeys:actual.holdKeys,bestByMode:Object.fromEntries(Object.entries(actual.bestByMode).map(([k,v])=>[k,fmt(v)])),bestByLayout:Object.fromEntries(Object.entries(actual.bestByLayout).map(([k,v])=>[k,fmt(v)]))},plants};
}
module.exports={experiment};
if(require.main===module){const root=path.join(__dirname,"..");const read=p=>fs.readFileSync(path.join(root,p),"utf8");console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/control/shakespeare_first300k.txt")),null,2));}
