// Agent1: source-shaped shared per-position affine page-reset inverse.
// Usage: node sims/lp2_shared_page_affine_sft.cjs
const fs=require("node:fs");
const path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/derived/dukotah-r37-lp1-map-runes.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
const run=function(source) {
  const corpus=JSON.parse(source[0]), native=JSON.parse(source[1]).key, Q=29, mod=x=>(x%Q+Q)%Q;
  const pages=corpus.pages.slice(0,56).filter(p=>p.indices.length).map(p=>({id:p.page,c:p.indices}));
  const lens=pages.map(p=>p.c.length), N=lens.reduce((a,b)=>a+b,0), L=Math.max(...lens);
  if(N!==12956||pages.length!==55) throw Error("corpus mismatch");
  const gp=corpus.translit, tok=[...gp].sort((a,b)=>b.length-a.length);
  function encode(s){let out=[];const start=s.indexOf("*** START OF");if(start>=0)s=s.slice(s.indexOf("\n",start));const end=s.indexOf("*** END OF");if(end>=0)s=s.slice(0,end);for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/ING/g,"NG").replace(/QU/g,"CW").replace(/Q/g,"C").replace(/K/g,"C").replace(/V/g,"U").replace(/Z/g,"S"); for(let i=0;i<w.length;){const t=tok.find(t=>w.startsWith(t,i));if(!t)throw Error(w);out.push(gp.indexOf(t));i+=t.length;}}return out;}
  const donors=[encode(source[2]),encode(source[3])];
  let seed=0x28011201;function rnd(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n;}
  function frame(t,start){let off=start;return lens.map(n=>{const x=t.slice(off,off+n);off+=n;return x;});}
  const uni=Array(Q).fill(.5);const pair=Array.from({length:Q},()=>Array(Q).fill(0));for(let i=0;i<native.length;i++){uni[native[i]]++;if(i)pair[native[i-1]][native[i]]++;}
  const total=uni.reduce((a,b)=>a+b,0), u=uni.map(x=>Math.log(x/total)), B=pair.map(row=>{const sum=row.reduce((a,b)=>a+b,0);return row.map((x,b)=>Math.log((x+8*uni[b]/total)/(sum+8)));});
  const maps=[];for(let a=1;a<Q;a++)for(let b=0;b<Q;b++)maps.push(Array.from({length:Q},(_,x)=>mod(a*x+b)));
  const inv=maps.map(m=>{let a=Array(Q);m.forEach((v,i)=>a[v]=i);return a;});
  function collision(frames){let num=0,den=0;for(let j=0;j<L;j++){let f=Array(Q).fill(0), n=0;for(const r of frames)if(j<r.length){num+=f[r[j]]++;den+=n++;}}return {num,den,rate:num/den};}
  const train=pages.map((p,i)=>p.id<40?i:-1).filter(i=>i>=0), held=pages.map((p,i)=>p.id>=40?i:-1).filter(i=>i>=0);
  function score(rows, ids){let n=0,s=0;for(const i of ids){let r=rows[i];for(let j=0;j<r.length;j++){s+=j?B[r[j-1]][r[j]]:u[r[j]];n++;}}return s/n;}
  function fit(frames){let key=Array(L).fill(0);const rows=frames.map(r=>r.slice());function step(j,phase){const W=Array.from({length:Q},()=>new Float64Array(Q));for(const i of train){const r=frames[i],d=rows[i];if(j>=r.length)continue;const w=W[r[j]];for(let p=0;p<Q;p++)w[p]+=phase===0?u[p]:(j?B[d[j-1]][p]:u[p])+(j+1<r.length?B[p][d[j+1]]:0);}
    let best=phase===0?-Infinity:maps[key[j]].reduce((s,p,c)=>s+W[c][p],0),bi=key[j];for(let k=0;k<maps.length;k++){let s=0,m=maps[k];for(let c=0;c<Q;c++)s+=W[c][m[c]];if(s>best+1e-10){best=s;bi=k;}}key[j]=bi;for(let i=0;i<frames.length;i++)if(j<frames[i].length)rows[i][j]=maps[bi][frames[i][j]];}
    for(let j=0;j<L;j++)step(j,0);let trajectory=[score(rows,train)];for(let pass=0;pass<8;pass++){for(let k=0;k<L;k++)step(pass%2?L-1-k:k,1);trajectory.push(score(rows,train));}
    let replay=0;for(let i=0;i<frames.length;i++)for(let j=0;j<frames[i].length;j++)replay+=inv[key[j]][rows[i][j]]===frames[i][j];return {key,rows,trajectory,held:score(rows,held),replay};}
  function accuracy(a,b,ids){let num=0,den=0;for(let i of ids)for(let j=0;j<a[i].length;j++){num+=a[i][j]===b[i][j];den++;}return {num,den,rate:num/den};}
  let out={N,L,train:train.map(i=>pages[i].id),held:held.map(i=>pages[i].id),nativeN:native.length,donorN:donors.map(d=>d.length),controls:[],collisionWindows:[]};
  for(let k=0;k<donors.length;k++){const d=donors[k];if(d.length<N)throw Error("short donor");let stats=[];for(let z=0;z<256;z++){let start=rnd(d.length-N+1);stats.push(collision(frame(d,start)).rate);}stats.sort((a,b)=>a-b);out.collisionWindows.push({n:stats.length,min:stats[0],median:stats[128],max:stats.at(-1)});
    const start=rnd(d.length-N+1), plain=frame(d,start), secret=Array.from({length:L},()=>rnd(maps.length));
    for(const shared of [true,false]){const crypt=plain.map(r=>r.map((p,j)=>inv[shared?secret[j]:rnd(maps.length)][p]));if(shared&&collision(plain).num!==collision(crypt).num)throw Error("invariant");const f=fit(crypt);out.controls.push({donor:k,start,shared,collision:collision(crypt),actualScore:score(plain,held),recoveredScore:f.held,heldAccuracy:accuracy(f.rows,plain,held),trainAccuracy:accuracy(f.rows,plain,train),keyCorrect:shared?f.key.filter((x,j)=>x===secret[j]).length:null,trajectory:f.trajectory,replay:f.replay});}}
  const original=pages.map(p=>p.c), f=fit(original);
  out.original={collision:collision(original),trajectory:f.trajectory,held:f.held,replay:f.replay,decoded:f.rows.map((r,i)=>({page:pages[i].id,indices:r})),key:f.key};
  return out;
};
const result=run(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")));
console.log(JSON.stringify(result,null,2));
