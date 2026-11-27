'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
/** @param {object} corpus @param {number[]} native @param {string} literary */
function run(corpus,native,literary){
 const Q=29,mod=x=>(x%Q+Q)%Q,m=new Map(corpus.translit.map((x,i)=>[x,i]));
 function gp(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/ING/g,"NG").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");while(w.length){const n=m.has(w.slice(0,2))?2:1,v=m.get(w.slice(0,n));if(v===undefined)throw Error(w);out.push(v);w=w.slice(n);}}return out;}
 const tr=gp(literary.slice(0,Math.floor(literary.length/2))),hist=new Float64Array(Q).fill(.2),cnt=new Float64Array(Q*Q).fill(.2);
 for(let i=0;i<tr.length;i++){hist[tr[i]]++;if(i)cnt[Q*tr[i-1]+tr[i]]++;}
 const log1=Array.from(hist,x=>Math.log(x/(tr.length+Q*.2))),log2=new Float64Array(Q*Q);
 for(let p=0;p<Q;p++){let s=0;for(let q=0;q<Q;q++)s+=cnt[p*Q+q];for(let q=0;q<Q;q++)log2[p*Q+q]=Math.log(cnt[p*Q+q]/s);}
 const pow=Array.from({length:Q},(_,g)=>{const a=new Int32Array(Q);a[0]=1;for(let p=1;p<Q;p++)a[p]=a[p-1]*g%Q;return a;});
 const inv=Array.from({length:Q},(_,x)=>{for(let z=1;z<Q;z++)if(x*z%Q===1)return z;return 0;});
 const orig=corpus.pages.slice(0,3).flatMap(p=>p.indices).slice(13),split=249;
 if(orig.length!==716||native.length<2216)throw Error("unexpected input width");
 function encode(p,k,c0){const c=[c0];for(let i=1;i<p.length;i++)c.push(mod(c[i-1]+mod(p[i]-k.a*p[i-1]-k.b)*inv[pow[k.g][p[i-1]]]));return c;}
 function decode(c,k,p0){const p=[p0];for(let i=1;i<c.length;i++)p.push(mod(k.a*p[i-1]+k.b+pow[k.g][p[i-1]]*mod(c[i]-c[i-1])));return p;}
 function score(p,lo,hi){let s=0;for(let i=lo;i<hi;i++)s+=i?log2[p[i-1]*Q+p[i]]:log1[p[i]];return s/(hi-lo);}
 function selectAB(p){let best;for(let a=0;a<Q;a++)for(let b=0;b<Q;b++){let count=0;for(let i=1;i<split;i++)if(p[i]===mod(a*p[i-1]+b))count++;const err=Math.abs(count-2);if(!best||err<best.err)best={a,b,err};}return {a:best.a,b:best.b};}
 const render=p=>p.map(x=>corpus.translit[x]).join("");
 function attack(c,truth=null){
  const started=Date.now(),delta=Int32Array.from(c.slice(1,split),(v,i)=>mod(v-c[i]));
  const next=new Uint8Array(Q*Q),cost=new Float64Array(Q*Q),first=new Float64Array(Q),second=new Float64Array(Q);
  let best={total:-Infinity},runner=-Infinity,truthScore=null,ties=0,tried=0;
  for(let g=2;g<Q;g++)for(let a=0;a<Q;a++)for(let b=0;b<Q;b++){
   for(let d=0;d<Q;d++)for(let p=0;p<Q;p++){const q=(a*p+b+pow[g][p]*d)%Q,j=d*Q+p;next[j]=q;cost[j]=log2[p*Q+q];}
   first.fill(0);let x=first,y=second;
   for(let i=delta.length-1;i>=0;i--){const base=delta[i]*Q;for(let p=0;p<Q;p++){const j=base+p;y[p]=cost[j]+x[next[j]];}const temp=x;x=y;y=temp;}
   let v=-Infinity,p0=0;
   for(let p=0;p<Q;p++){const s=x[p]+log1[p];if(s>v){v=s;p0=p;}}
   if(truth&&truth.g===g&&truth.a===a&&truth.b===b)truthScore=v;
   if(v>best.total+1e-9){runner=best.total;best={g,a,b,p0,total:v};ties=1;}else if(Math.abs(v-best.total)<1e-9)ties++;else if(v>runner)runner=v;
   tried++;
  }
  const p=decode(c,best,best.p0),back=encode(p,best,c[0]);if(back.some((v,i)=>v!==c[i]))throw Error("replay failure");
  return {best,runner,truthScore,ties,tried,initialStates:tried*Q,fit:score(p,0,split),held:score(p,split,p.length),elapsed_ms:Date.now()-started,head:render(p.slice(0,120)),heldHead:render(p.slice(split,split+120)),repeatCount:c.slice(1).filter((v,i)=>v===c[i]).length,accuracy:truth?{fit:p.slice(0,split).filter((v,i)=>v===truth.plain[i]).length,held:p.slice(split).filter((v,i)=>v===truth.plain[i+split]).length}:null,recovered:p};
 }
 const plant1=native.slice(0,716),plant2=native.slice(1500,2216),k1={g:2,...selectAB(plant1)},k2={g:3,...selectAB(plant2)};
 return {schema:1,model:"P[i] = a*P[i-1]+b+g^P[i-1]*(C[i]-C[i-1]) mod29; g=2..28",trainRunes:tr.length,fit:split,held:orig.length-split,original:attack(orig),controls:[{key:k1,plaintextFit:score(plant1,0,split),plaintextHeld:score(plant1,split,plant1.length),...attack(encode(plant1,k1,13),{...k1,plain:plant1})},{key:k2,plaintextFit:score(plant2,0,split),plaintextHeld:score(plant2,split,plant2.length),...attack(encode(plant2,k2,7),{...k2,plain:plant2})}]};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/derived/dukotah-r37-lp1-map-runes.json","resources/control/gibran_prophet_58585.txt"];
const out=run(JSON.parse(read(paths[0])),JSON.parse(read(paths[1])).key,read(paths[2]));
console.log(JSON.stringify(out,null,2));
