'use strict';
// Agent48: source-fixed mirror shell-pair affine inverse; Node.js CommonJS read-only.
const fs=require('node:fs'),path=require('node:path');
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
const inputs=paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
function run(inputs){
 const gp=JSON.parse(inputs[0]),map=new Map(gp.runes.map((r,i)=>[r,i])), mod=x=>(x%29+29)%29;
 const raw=inputs[1].split('%').slice(0,55).join('%');
 const words=[];let w=[],offset=0,start=0;
 const finish=()=>{if(w.length)words.push({w,start});w=[];};
 for(const ch of raw){if(map.has(ch)){if(!w.length)start=offset;w.push(map.get(ch));offset++;}else if(ch==='%'||ch==='/'||/\s/u.test(ch)){}else finish();}finish();
 const original=gp.pages.filter(x=>x.page<=55).flatMap(x=>x.indices);
 if(words.length!==2896||offset!==12956||words.flatMap(x=>x.w).some((x,i)=>x!==original[i]))throw Error("source mismatch");
 const cut=gp.pages.filter(x=>x.page<40).reduce((a,x)=>a+x.indices.length,0);
 const trans=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function gpWord(text){const s=text.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');const out=[];for(let i=0;i<s.length;){if(s.startsWith('ING',i)){out.push(21);i+=3;continue;}if(s.startsWith('IO',i)){out.push(27);i+=2;continue;}let hit=trans.find(k=>s.startsWith(k.s,i));if(hit){out.push(hit.i);i+=hit.s.length;}else i++;}return out;}
 function prose(s){return (s.match(/[A-Za-z]+/g)||[]).map(gpWord).filter(w=>w.length);}
 function pairs(book){return book.flatMap(({w,start})=>Array.from({length:Math.floor(w.length/2)},(_,d)=>({x:w[d],y:w[w.length-1-d],d,len:w.length,start})))}
 const ref=prose(inputs[2]);const refs=pairs(ref.map(w=>({w,start:0})));
 const ctx=p=>`${p.len}:${p.d}`;
 const models=new Map();
 for(const p of refs){const k=ctx(p);if(!models.has(k))models.set(k,[new Float64Array(29).fill(0.5),new Float64Array(29).fill(0.5)]);let m=models.get(k);m[0][p.x]++;m[1][p.y]++;}
 const pooled=[new Float64Array(29).fill(.5),new Float64Array(29).fill(.5)];for(const p of refs){pooled[0][p.x]++;pooled[1][p.y]++;}
 const logs=m=>m.map(a=>{let n=a.reduce((x,y)=>x+y,0);return Float64Array.from(a,x=>Math.log(x/n));});
 for(const [k,m] of models)models.set(k,logs(m));const fallback=logs(pooled);
 const directions=Array.from({length:30},(_,i)=>i===29?[0,1]:[1,i]);
 /** Exact separable maximum over all invertible affine 2x2 keys. */
 function fit(ps){
  const blocks=new Map();for(const p of ps){const k=ctx(p);if(!blocks.has(k))blocks.set(k,new Int32Array(841));blocks.get(k)[29*p.x+p.y]++;}
  const nonempty=[...blocks].map(([k,h])=>({m:models.get(k)||fallback,h:[...h].map((n,i)=>[n,i]).filter(x=>x[0])}));
  const best=[[],[]];
  for(let di=0;di<directions.length;di++){
   const [u,v]=directions[di];const proj=nonempty.map(({m,h})=>{let a=new Int32Array(29);for(let [n,i] of h)a[(u*Math.floor(i/29)+v*(i%29))%29]+=n;return {m,a};});
   for(let side=0;side<2;side++){
    let win={score:-Infinity};
    for(let s=1;s<29;s++)for(let t=0;t<29;t++){
     let score=0;for(const {m,a} of proj){let l=m[side];for(let z=0;z<29;z++)if(a[z])score+=a[z]*l[(s*z+t)%29];}
     if(score>win.score)win={score,row:[u*s%29,v*s%29,t],di};
    }best[side].push(win);
   }
  }
  let winner={score:-Infinity};for(const a of best[0])for(const b of best[1])if(a.di!==b.di&&a.score+b.score>winner.score)winner={score:a.score+b.score,key:[a.row,b.row]};
  return winner;
 }
 function transform(ps,key){return ps.map(p=>({...p,x:mod(key[0][0]*p.x+key[0][1]*p.y+key[0][2]),y:mod(key[1][0]*p.x+key[1][1]*p.y+key[1][2])}));}
 function inverse(key){let [[a,b,t],[c,d,u]]=key,det=mod(a*d-b*c),i=0;for(let k=1;k<29;k++)if(mod(det*k)===1)i=k;if(!i)throw Error("singular");let A=mod(d*i),B=mod(-b*i),C=mod(-c*i),D=mod(a*i);return [[A,B,mod(-A*t-B*u)],[C,D,mod(-C*t-D*u)]];}
 function score(ps){let s=0;for(const p of ps){const m=models.get(ctx(p))||fallback;s+=m[0][p.x]+m[1][p.y];}return s/(2*ps.length);}
 function collisions(ps,context){let h=new Map(),E=0;for(const p of ps){const k=context(p)+':'+(29*p.x+p.y),n=h.get(k)||0;E+=n;h.set(k,n+1);}return E;}
 const chapters=[729,1874,3612,5506,6527,7960,9640,12648,12956];
 const chapter=p=>chapters.findIndex(x=>p.start<x);
 function invariants(ps){return [p=>'',p=>String(p.d),p=>ctx(p),p=>chapter(p)+':'+p.d,p=>chapter(p)+':'+ctx(p)].map(f=>collisions(ps,f));}
 const equal=(a,b)=>a.length===b.length&&a.every((p,i)=>p.x===b[i].x&&p.y===b[i].y);
 function examine(ps){const fitPs=ps.filter(p=>p.start<cut),testPs=ps.filter(p=>p.start>=cut);let winner=fit(fitPs),decoded=transform(ps,winner.key),replay=transform(decoded,inverse(winner.key));if(!equal(ps,replay))throw Error("replay");return {key:winner.key,fitScore:score(decoded.filter(p=>p.start<cut)),holdoutScore:score(decoded.filter(p=>p.start>=cut)),fitPairs:fitPs.length,holdoutPairs:testPs.length,collision:invariants(ps),decoded};}
 const orig=pairs(words),o=examine(orig);
 let state=0x48c1c301;const random=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;};
 function pools(s){let by=new Map();for(const w of prose(s)){if(!by.has(w.length))by.set(w.length,[]);by.get(w.length).push(w);}return by;}
 function match(by){return words.map(({w,start})=>{let pool=by.get(w.length);if(!pool||!pool.length)throw Error("missing length "+w.length);return {w:pool[Math.floor(random()*pool.length)],start};});}
 function plant(by,key){let matched=match(by),plain=pairs(matched),cipher=transform(plain,inverse(key)),r=examine(cipher),correct=r.decoded.filter((p,i)=>p.start>=cut&&p.x===plain[i].x&&p.y===plain[i].y).length;
  if(JSON.stringify(invariants(plain))!==JSON.stringify(invariants(cipher)))throw Error("collision invariant");return {hiddenInverse:key,recovered:r.key,fitScore:r.fitScore,holdoutScore:r.holdoutScore,correctHoldoutPairs:correct,totalHoldoutPairs:r.holdoutPairs,collision:r.collision};}
 const donors=[pools(inputs[3]),pools(inputs[4])];
 const planted=[plant(donors[0],[[3,7,12],[8,5,6]]),plant(donors[1],[[11,2,23],[9,17,1]])];
 const resamples=donors.map(by=>{let min=Array(5).fill(Infinity),max=Array(5).fill(-Infinity),atOrBelow=Array(5).fill(0);for(let n=0;n<128;n++){let c=invariants(pairs(match(by)));for(let i=0;i<5;i++){min[i]=Math.min(min[i],c[i]);max[i]=Math.max(max[i],c[i]);if(c[i]<=o.collision[i])atOrBelow[i]++;}}return {draws:128,min,max,atOrBelow};});
 const reconstructed=words.map(({w})=>w.slice());let pi=0;for(let w of reconstructed)for(let d=0;d<Math.floor(w.length/2);d++){w[d]=o.decoded[pi].x;w[w.length-1-d]=o.decoded[pi++].y;}
 const preview=reconstructed.slice(0,25).map(w=>w.map(x=>gp.translit[x]).join('')).join(' ');
 delete o.decoded;
 return {wordCount:words.length,runeCount:offset,sourceCut:cut,inputLengths:inputs.map(s=>s.length),pairCount:orig.length,untouchedCenters:offset-2*orig.length,contexts:["global","depth","length×depth","chapter×depth","chapter×length×depth"],original:o,planted,resamples,preview,modelRefPairs:refs.length};
}
console.log(JSON.stringify(run(inputs),null,2));
