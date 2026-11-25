'use strict';
const fs=require('node:fs'),path=require('node:path');
function primeInverse(gp,native){
 const check=(b,m)=>{if(!b)throw Error(m)},mod=x=>(x%29+29)%29;
 const mp=new Map(gp.runes.map((r,i)=>[r,i])),ss=native.sections.map(s=>({name:s.name,p:[...s.source_text].filter(r=>mp.has(r)).map(r=>mp.get(r))}));
 const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 const chapters=ranges.map(([a,b])=>({name:`p${a}-${b}`,y:gp.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices)}));
 const n=12956+3301+1,pr=[];for(let x=2;pr.length<n;x++){let prime=true;for(const p of pr){if(p*p>x)break;if(x%p===0){prime=false;break;}}if(prime)pr.push(x);}
 const k=pr.map(x=>(x-1)%29);
 function enc(p,start,sign){let j=start;return p.map(x=>x===0?0:mod(x+sign*k[j++]));}
 const solved=ss.find(x=>x.name==="p56_an_end").p,actual=gp.pages[56].indices;
 check(solved.length===85&&enc(solved,0,1).join(",")===actual.join(","),"authentic p56 replay");
 function repair(raw,choose){const y=[],sw=[];for(let i=0;i<raw.length;){if(i+1<raw.length&&raw[i]===y.at(-1)&&raw[i+1]!==y.at(-1)&&choose()){sw.push(i);y.push(raw[i+1],raw[i]);i+=2;}else y.push(raw[i++]);}return {y,sw};}
 function lm(ex){let a=Array(29).fill(.5),b=Array.from({length:29},()=>Array(29).fill(.2));for(const x of ss)if(x.name!==ex){for(const v of x.p)a[v]++;for(let i=1;i<x.p.length;i++)b[x.p[i-1]][x.p[i]]++;}const norm=x=>{const z=x.reduce((s,v)=>s+v,0);return x.map(v=>Math.log(v/z));};return [norm(a),b.map(norm)];}
 const startmask=(1n<<3302n)-1n,full=(1n<<BigInt(k.length))-1n;
 const masks={};for(const sign of [1,-1]){const m=Array(29).fill(full);for(let j=0;j<k.length;j++)m[mod(sign*k[j])]&=~(1n<<BigInt(j));masks[sign]=m;}
 const bits=b=>{let a=[];while(b){const l=b&-b;a.push(l.toString(2).length-1);b-=l;}return a;};
 const eligible=(y,i)=>i>0&&i+1<y.length&&y[i]!==y[i-1]&&y[i+1]===y[i-1];
 function reach(y,sign){
  const m=masks[sign],step=(b,c)=>((b&m[c])<<1n)|(c===0?b:0n),pre=(b,c)=>((b>>1n)&m[c])|(c===0?b:0n);
  let cur=startmask,next=0n,farthest=0;
  for(let i=0;i<y.length;i++){
    if(cur){farthest=i;next|=step(cur,y[i]);}
    const jump=cur&&eligible(y,i)?step(step(cur,y[i-1]),y[i]):0n;
    [cur,next]=[next,jump];if(!cur&&!next)break;
  }
  if(!cur)return {farthest,origins:[]};
  const b=Array(y.length+2).fill(0n);b[y.length]=full;
  for(let i=y.length-1;i>=0;i--){b[i]=pre(b[i+1],y[i]);if(eligible(y,i))b[i]|=pre(pre(b[i+2],y[i]),y[i-1]);}
  return {farthest:y.length,origins:bits(b[0]&startmask),b};
 }
 function fit(y,sign,lang,r){
  if(!r.origins.length)return null;
  const dp=Array.from({length:y.length+1},()=>new Map());
  const key=(j,p,pend)=>(j*30+p+1)*2+pend;
  for(const j of r.origins)dp[0].set(key(j,-1,0),{j,p:-1,pend:0,score:0,origin:j,parent:null});
  let peak=0;
  function options(c,j){const p=mod(c-sign*k[j]),a=[];if(c===0)a.push([0,j]);if(p!==0)a.push([p,j+1]);return a;}
  function push(i,node,raw,swap){
   const j=i+raw.length,pend=Number(!swap&&i>0&&y[i]===y[i-1]);
   let a=[{j:node.j,p:node.p,score:node.score+(swap?Math.log(.8):0)+(node.pend&&raw[0]!==y[i-1]?Math.log(.2):0),letters:[]}];
   for(const c of raw){let b=[];for(const s of a)for(const [p,j] of options(c,s.j))b.push({j,p,score:s.score+(s.p<0?lang[0][p]:lang[1][s.p][p]),letters:s.letters.concat(p)});a=b;}
   for(const s of a){if(!(r.b[j]&(1n<<BigInt(s.j))))continue;const id=key(s.j,s.p,pend);if(!dp[j].has(id)||dp[j].get(id).score<s.score)dp[j].set(id,{...s,pend,origin:node.origin,parent:node,swap,pos:i});}
  }
  for(let i=0;i<y.length;i++){peak=Math.max(peak,dp[i].size);for(const node of dp[i].values()){push(i,node,[y[i]],false);if(eligible(y,i))push(i,node,[y[i-1],y[i]],true);}}
  let best=null;for(const st of dp[y.length].values())if(!best||st.score>best.score)best=st;
  check(best,"reachability disagrees");
  const p=[],sw=[];for(let z=best;z.parent;z=z.parent){p.unshift(...z.letters);if(z.swap)sw.unshift(z.pos);}
  let si=0,raw=enc(p,best.origin,sign),out=[],replay=[];
  for(let i=0;i<raw.length;){if(i===sw[si]){check(i+1<raw.length&&raw[i]===out.at(-1)&&raw[i+1]!==out.at(-1),"invalid swap");out.push(raw[i+1],raw[i]);replay.push(i);si++;i+=2;}else out.push(raw[i++]);}
  check(out.join(",")===y.join(",")&&replay.join(",")===sw.join(","),"forward replay");
  return {origin:best.origin,score:best.score/y.length,plain:p,swaps:sw.length,peak,preview:p.slice(0,100).map(x=>gp.translit[x]).join("")};
 }
 const controls=[],originals=[];
 let seed=0x3301;const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/2**32;};
 for(const [i,name] of ["0_welcome","0_koan_1","0_loss_of_divinity"].entries()){
  const p=ss.find(x=>x.name===name).p.slice(i*11,i*11+308),origin=[17,1033,3301][i],plant=repair(enc(p,origin,1),()=>rnd()<.8),r=reach(plant.y,1);
  check(r.origins.includes(origin),"true prime origin lost");const f=fit(plant.y,1,lm(name),r);
  controls.push({name,origin,origins:r.origins.length,decodedOrigin:f.origin,correct:f.plain.filter((x,i)=>x===p[i]).length,score:f.score,swaps:plant.sw.length,decodedSwaps:f.swaps,peak:f.peak});
 }
 for(const {name,y} of chapters)for(const sign of [1,-1]){
  const r=reach(y,sign);const f=fit(y,sign,lm(null),r);
  originals.push({name,n:y.length,sign,farthest:r.farthest,origins:r.origins.length,originList:r.origins,fit:f?{...f,plain:undefined}:null});
 }
 return {authenticP56:solved.length,controls,originals};
}
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(primeInverse(...["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"].map(read)),null,2));
