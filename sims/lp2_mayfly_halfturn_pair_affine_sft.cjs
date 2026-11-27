"use strict";
// Source-fixed p24-p26 paired affine receiver. Run from repository root: node sims/lp2_mayfly_halfturn_pair_affine_sft.cjs
const fs = require("node:fs");
function experiment(corpus,training,control){
 const mod=x=>((x%29)+29)%29, inv=x=>{for(let y=1;y<29;y++)if(mod(x*y)===1)return y;throw Error("singular")};
 const check=(condition,message)=>{if(!condition)throw Error(message)};
 const labels=corpus.translit;
 const lookup=new Map(labels.map((v,i)=>[v,i]));
 const encode=s=>{const words=s.toUpperCase().match(/[A-Z]+/g)||[];return words.flatMap(w=>{w=w.replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const out=[];for(let i=0;i<w.length;){const pair=w.slice(i,i+2);if(pair.length===2&&lookup.has(pair)){out.push(lookup.get(pair));i+=2}else{if(lookup.has(w[i]))out.push(lookup.get(w[i]));i++}}return out})};
 const train=encode(training.split("*** START OF THIS PROJECT GUTENBERG EBOOK THE PROPHET ***")[1].split("*** END OF")[0]);
 const native=encode(control.split(/\r?\n/).filter(l=>l.trim()&&!/^\s*(#|\[|\()/.test(l)).join(" "));
 check(train.length>10000&&native.length>2200,"training or controls missing");
 const uni=new Float64Array(29),bi=new Float64Array(29**2),tri=new Float64Array(29**3),bc=new Float64Array(29);
 for(let i=0;i<train.length;i++){let c=train[i];uni[c]++;if(i>0){const b=train[i-1];bi[b*29+c]++;bc[b]++;}if(i>1)tri[(train[i-2]*29+train[i-1])*29+c]++}
 const log=new Float64Array(29**3);
 for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++){const q=(bi[b*29+c]+5*(uni[c]+1)/(train.length+29))/(bc[b]+5);log[(a*29+b)*29+c]=Math.log((tri[(a*29+b)*29+c]+10*q)/(bi[a*29+b]+10));}
 const score=x=>{let v=0;for(let i=2;i<x.length;i++)v+=log[(x[i-2]*29+x[i-1])*29+x[i]];return v/(x.length-2)};
 const read=x=>x.map(y=>labels[y]).join("");
 const lines=[[22,24,21,24,23,21,22,23,23,22,22,23],[22,22,24,23,23,23,24,23,21,24,23,21],[20,22,23,22,24,23,24,21,19,24,23,20]];
 const splits=[135,137,134],lens=[270,273,265];
 const source=corpus.pages.filter(p=>p.page>=24&&p.page<=26).map((p,i)=>{check(p.indices.length===lens[i],"page length");return p.indices});
 const geometry=(i,mode)=>{let upper=splits[i],lower=lens[i]-upper;const pairs=[];if(mode==="flat"){for(let j=0;j<Math.min(upper,lower);j++)pairs.push([j,lower-1-j]);}else{let start=[0];for(const l of lines[i])start.push(start.at(-1)+l);for(let j=0;j<6;j++){let k=11-j;for(let t=0;t<Math.min(lines[i][j],lines[i][k]);t++)pairs.push([start[j]+t,start[k+1]-1-t-upper]);}}return {upper,lower,pairs}};
 const frame=(page,i,mode)=>{let g=geometry(i,mode);return {...g,a:page.slice(0,g.upper),b:page.slice(g.upper)}};
 const rows=[];for(let a=0;a<29;a++)for(let b=0;b<29;b++)if(a||b){const direction=a?mod(b*inv(a)):29;for(let k=0;k<29;k++)rows.push({a,b,k,direction})}
 check(rows.length===24360,"row count");
 const det=(r,s)=>mod(r.a*s.b-r.b*s.a);
 const rowDecode=(f,r,lane,rev)=>{let x=(lane===0?f.a:f.b).slice();for(const [i,j] of f.pairs)x[lane===0?i:j]=mod(r.a*f.a[i]+r.b*f.b[j]+r.k);return lane===1&&!rev?x.reverse():x};
 const fit=(f,rev)=>{let bestA=Array(30).fill(null),bestB=Array(30).fill(null);for(const r of rows){let u=score(rowDecode(f,r,0,rev)),v=score(rowDecode(f,r,1,rev));const d=r.direction;if(!bestA[d]||u>bestA[d].score)bestA[d]={...r,score:u};if(!bestB[d]||v>bestB[d].score)bestB[d]={...r,score:v};}
 let best=null;for(const r of bestA)for(const s of bestB)if(det(r,s)){let value=(r.score+s.score)/2;if(!best||value>best.value)best={r,s,value}}
 return best};
 const decode=(f,key,rev)=>({a:rowDecode(f,key.r,0,rev),b:rowDecode(f,key.s,1,rev)});
 const encrypt=(a,b,g,key,rev)=>{const y=rev?b.slice():b.slice().reverse();const d=inv(det(key.r,key.s));let ca=a.slice(),cb=y.slice();for(const [i,j] of g.pairs){let p=mod(a[i]-key.r.k),q=mod(y[j]-key.s.k);ca[i]=mod(d*(key.s.b*p-key.r.b*q));cb[j]=mod(d*(-key.s.a*p+key.r.a*q));}return [...ca,...cb]};
 const assess=(pages,mode,rev)=>{const key=fit(frame(pages[0],0,mode),rev);let evals=pages.map((p,i)=>{let f=frame(p,i,mode),d=decode(f,key,rev),enc=encrypt(d.a,d.b,f,key,rev);check(enc.length===p.length&&enc.every((x,j)=>x===p[j]),"replay failure");return {nPairs:f.pairs.length,unpaired:p.length-2*f.pairs.length,scoreA:score(d.a),scoreB:score(d.b),a:read(d.a),b:read(d.b),indicesA:d.a,indicesB:d.b}});return {key,evals}};
 const result={trainingRunes:train.length,controlRunes:native.length,rowCount:rows.length,fullAffineKeyCount:29**2*(29**2-1)*(29**2-29),original:[],plants:[],nulls:[]};
 const simpleRows=[{r:{a:1,b:1,k:0},s:{a:1,b:28,k:0}},{r:{a:1,b:0,k:0},s:{a:28,b:1,k:0}},{r:{a:1,b:28,k:0},s:{a:0,b:1,k:0}}];
 let seed=123456789;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%29};
 const nullPages=Array.from({length:3},()=>lens.map(l=>Array.from({length:l},rng)));
 for(const mode of ["flat","line"])for(const rev of [false,true]){let orig=assess(source,mode,rev);result.original.push({mode,rev,...orig,simple:simpleRows.map(key=>({key,lanes:source.map((p,i)=>{const d=decode(frame(p,i,mode),key,rev);return {scoreA:score(d.a),scoreB:score(d.b),a:read(d.a),b:read(d.b)}})}))});
 for(let plant=0;plant<2;plant++){const key=plant?{r:{a:9,b:17,k:22},s:{a:12,b:5,k:3}}:{r:{a:1,b:1,k:3},s:{a:1,b:28,k:7}};let pos=plant*850;const truth=lens.map((n,i)=>{let g=geometry(i,mode),a=native.slice(pos,pos+g.upper);pos+=g.upper;let b=native.slice(pos,pos+g.lower);pos+=g.lower;return {a,b}});let pages=truth.map((d,i)=>encrypt(d.a,d.b,geometry(i,mode),key,rev));let resultPlant=assess(pages,mode,rev);result.plants.push({mode,rev,plant,key,recoveredKey:resultPlant.key,counts:resultPlant.evals.map((d,i)=>({a:d.indicesA.filter((v,j)=>v===truth[i].a[j]).length,b:d.indicesB.filter((v,j)=>v===truth[i].b[j]).length,nA:truth[i].a.length,nB:truth[i].b.length,scoreA:d.scoreA,scoreB:d.scoreB}))});}
 for(let n=0;n<3;n++){const a=assess(nullPages[n],mode,rev);result.nulls.push({n,mode,rev,scores:a.evals.map(d=>[d.scoreA,d.scoreB])})}}
 return result;
}
const paths = ["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/liber-primus/lp1-plaintext-reference.txt"];
const inputs = paths.map(p=>fs.readFileSync(p,"utf8"));
console.log(JSON.stringify(experiment(JSON.parse(inputs[0]),inputs[1],inputs[2]),null,2));
