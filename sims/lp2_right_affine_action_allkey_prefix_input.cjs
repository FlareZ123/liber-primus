"use strict";
/** Rebuild exact all-key prefix-gate integer score input. Run with --meta for calibration JSON. */
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function prepare(g,trans,native,sources,screened){
 const mod=x=>((x%29)+29)%29,cls=Array.from({length:29},(_,i)=>[1,3,10,12,18,22,24,25,26,27,28].includes(i)?0:1),tokens=g.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(s){const out=[];s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(const w of s.match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3}else if(w.startsWith("IO",i)){out.push(27);i+=2}else{const t=tokens.find(t=>w.startsWith(t.s,i));if(!t)throw Error(w);out.push(t.i);i+=t.s.length}}}return out}
 const ids=new Map(g.runes.map((x,i)=>[x,i])),words=trans.replace(/\r\n/g,"\n").split("%").slice(0,55).join("%").replace(/\/\n/g,"").replace(/[\r\n%]/g,"").match(new RegExp("["+g.runes.join("")+"]+","gu")).map(w=>Array.from(w,x=>ids.get(x)));
 const orig=g.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);if(orig.length!==12956||words.length!==2896||words[0].length!==8||words[1].length!==5||words.flat().some((x,i)=>x!==orig[i]))throw Error("source mismatch");
 const texts=sources.map(([name,source])=>({name,p:encode(source)})),ref=texts[1].p,uni=new Uint32Array(29),bi=new Uint32Array(841),tri=new Uint32Array(24389);
 for(let i=0;i<ref.length;i++){uni[ref[i]]++;if(i)bi[ref[i-1]*29+ref[i]]++;if(i>1)tri[(ref[i-2]*29+ref[i-1])*29+ref[i]]++}
 const score=Array(24389);
 for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++){const pu=(uni[c]+1)/(ref.length+29),pb=(bi[b*29+c]+20*pu)/(uni[b]+20);score[(a*29+b)*29+c]=Math.round(256*Math.log((tri[(a*29+b)*29+c]+20*pb)/(bi[a*29+b]+20)))}
 const nativeTexts=native.sections.map((s,i)=>({name:"native-section-"+i,p:Array.from(s.source_text).filter(x=>ids.has(x)).map(x=>ids.get(x))}));
 const lens=[32,64,128],calibration=lens.map(n=>{
   let floor=Infinity,total=0;const rows=[];
   for(const t of [...texts,...nativeTexts]){if(t.p.length<n)continue;const pref=[0];for(let i=2;i<t.p.length;i++)pref.push(pref.at(-1)+score[(t.p[i-2]*29+t.p[i-1])*29+t.p[i]]);
     let min=Infinity;for(let i=0;i+n<=t.p.length;i++)min=Math.min(min,pref[i+n-2]-pref[i]);
     const windows=t.p.length-n+1;rows.push({name:t.name,windows,min,mean:min/(256*(n-2))});total+=windows;floor=Math.min(floor,min);
   }
   return {n,floor,mean:floor/(256*(n-2)),total,rows};
 });
 const a0=[17,12],a1=[24,9],iv=[19,4],truth=[a0,a1,iv];
 if(mod(a0[0]*a1[1]+a0[1])===mod(a1[0]*a0[1]+a1[1]))throw Error("commuting plant");
 if(screened.candidates.some(x=>JSON.stringify(x.coeff)===JSON.stringify([a0,a1])))throw Error("plant unexpectedly repeat-screened");
 const plant=texts[0].p.slice(45000,45000+orig.length-13);if(plant.length!==orig.length-13)throw Error("short plant");
 let A=iv[0],B=iv[1];const pc=[];for(const p of plant){pc.push(mod(A*p+B));const [a,b]=cls[p]?a1:a0;B=mod(A*b+B);A=mod(A*a)}
 const p0=orig.slice(13),p54=g.pages[54].indices.slice(9).concat(g.pages[55].indices),train=g.pages.filter(p=>p.page<=2).reduce((s,p)=>s+p.indices.length,0)-13;
 if(train!==716||p54.length!==299||p0.length!==12943)throw Error("frame");
 function scorePrefix(p,n){let sum=0;for(let i=2;i<n;i++)sum+=score[(p[i-2]*29+p[i-1])*29+p[i]];return sum}
 const plantScores=calibration.map(x=>({n:x.n,score:scorePrefix(plant,x.n),floor:x.floor}));if(plantScores.some(x=>x.score<x.floor))throw Error("plant below fixed floor");
 const datasets=[{name:"plant",cipher:pc,plain:plant,train,truth},{name:"p0_black",cipher:p0,train},{name:"p54_black",cipher:p54,train:213}];
 let lines=[lens.join(" "),calibration.map(x=>x.floor).join(" "),cls.join(" "),score.join(" "),String(datasets.length)];
 for(const d of datasets){lines.push([d.name,d.cipher.length,d.train,d.truth?1:0].join(" "));if(d.truth)lines.push(d.truth.flat().join(" "));lines.push(d.cipher.join(" "));if(d.plain)lines.push(d.plain.join(" "))}
 return {input:lines.join("\n")+"\n",meta:{calibration,plant:{source:"Shakespeare",nativeOffset:45000,key:truth,screened:false,scores:plantScores,length:plant.length},frames:datasets.map(d=>({name:d.name,length:d.cipher.length,train:d.train})),scoreScale:256,scoreMin:Math.min(...score),scoreMax:Math.max(...score)}};
}
const g=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),trans=read("resources/liber-primus/lp2-transcription.txt"),native=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const sources=[["Shakespeare","resources/control/shakespeare_first300k.txt"],["Gibran","resources/control/gibran_prophet_58585.txt"],["Emerson","resources/control/emerson_essays_2944.txt"]].map(([n,f])=>[n,read(f)]);
const p=prepare(g,trans,native,sources,JSON.parse(read("im-results/lp2-right-affine-action-screened-alliv-output.json")));process.stdout.write(process.argv.includes("--meta")?JSON.stringify(p.meta,null,2)+"\n":p.input);
