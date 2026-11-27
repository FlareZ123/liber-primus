'use strict';
// Run from the repository root with Node.js 22.
const fs = require('node:fs');
const path = require('node:path');
function run(corpus) {
  const A=29,mask=(1<<A)-1;
  const pc=x=>{x=x-((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return (((x+(x>>>4))&0x0f0f0f0f)*0x01010101)>>>24};
  function transpose(z){const t=Array(A).fill(0);for(let i=0;i<A;i++)for(let b=z[i];b;b&=b-1)t[31-Math.clz32(b&-b)]|=1<<i;return t}
  function plan(n,kind,k){
    const r=Int32Array.from({length:n},(_,i)=>i),c=r.slice();
    if(kind==="cyclic"||kind==="linear"){for(let i=0;i<n;i++)c[i]=(i-k+n)%n;return {r,c,start:kind==="linear"?k:0,end:n};}
    const end=n-n%k;
    for(let s=0;s<end;s+=k)for(let i=0;i<k;i++){
      const p=s+(i>>1),q=s+((i+k)>>1),x=i&1?q:p,y=i&1?p:q;
      if(kind==="inverse"){r[s+i]=x;c[s+i]=y;}else{r[x]=s+i;c[y]=s+i;}
    }
    return {r,c,start:0,end};
  }
  function support(a,kind,k){
    const z=Array(A).fill(0),N=a.length;
    if(kind==="linear"||kind==="cyclic"){for(let i=kind==="linear"?k:0;i<N;i++)z[a[i]]|=1<<a[(i-k+N)%N];return z}
    if(kind==="inverse"){for(let s=0;s+k<=N;s+=k)for(let i=0;i<k;i++){const p=s+(i>>1),q=s+((i+k)>>1);if(i&1)z[a[q]]|=1<<a[p];else z[a[p]]|=1<<a[q]}return z}
    const ri=new Int32Array(k),ci=new Int32Array(k);for(let i=0;i<k;i++){const p=i>>1,q=(i+k)>>1;if(i&1){ri[q]=i;ci[p]=i}else{ri[p]=i;ci[q]=i}}
    for(let s=0;s+k<=N;s+=k)for(let i=0;i<k;i++)z[a[s+ri[i]]]|=1<<a[s+ci[i]];
    return z;
  }
  function degrees(z){return [Math.max(...z.map(v=>A-pc(v))),Math.max(...transpose(z).map(v=>A-pc(v)))]}
  function rectangle(z,m,k){
    if(m>k)return rectangle(transpose(z),k,m);
    const missing=z.map((v,i)=>(mask^v)&~(1<<i)),eligible=missing.map((v,i)=>[v,i]).filter(([v])=>pc(v)>=k).map(([,i])=>i);
    function dfs(start,left,cols){if(pc(cols)<k)return false;if(!left)return true;for(let i=start;i<=eligible.length-left;i++)if(dfs(i+1,left-1,cols&missing[eligible[i]]))return true;return false}
    return dfs(0,m,mask);
  }
  function grid(lens,rev=0,perm=Array.from({length:A},(_,i)=>i)){
    const w=Math.max(...lens),g=[],map=[];let v=0;
    for(let row=0;row<lens.length;row++){g[row]=Array(w).fill(-1);for(let i=0;i<lens[row];i++){const c=(rev>>row)&1?w-1-i:i,x=perm[v++];g[row][c]=x;map[x]=[row,c]}}
    return {g,map};
  }
  function inverse(a,p,G,H=G){return a.map((x,i)=>H.g[G.map[a[p.r[i]]][0]][G.map[a[p.c[i]]][1]])}
  function forward(a,p,G,H=G){const rc=a.map(x=>H.map[x].slice());for(let i=0;i<a.length;i++){rc[p.r[i]][0]=H.map[a[i]][0];rc[p.c[i]][1]=H.map[a[i]][1]}return rc.map(([x,y])=>G.g[x][y])}
  const a=corpus.pages.slice(0,56).flatMap(p=>p.indices),opening=corpus.pages.slice(0,3).flatMap(p=>p.indices).slice(13);
  if(a.length!==12956||opening.length!==716)throw Error("source");
  const full={};
  for(const [kind,start,stop,step] of [["cyclic",1,6478,1],["linear",1,3301,1],["inverse",3,12955,2],["forward",3,12955,2]]){
    let n=0,hist={},maxSum=0,minCoverage=Infinity,exceptions=[];
    for(let k=start;k<=stop;k+=step){const z=support(a,kind,k),[dr,dc]=degrees(z),d=Math.max(dr,dc);n++;hist[d]=(hist[d]||0)+1;maxSum=Math.max(maxSum,dr+dc);minCoverage=Math.min(minCoverage,kind==="linear"?a.length-k:kind==="cyclic"?a.length:a.length-a.length%k);if(d>1)exceptions.push(k);if((dr+dc)**2>=A)throw Error("not excluded");}
    full[kind]={n,hist,maxSum,minCoverage,exceptions};
  }
  const historical={};
  for(const kind of ["cyclic","inverse","forward"]){
    let n=0,legal=[],maxCoverage=0;
    for(let k=kind==="cyclic"?1:3;k<=(kind==="cyclic"?358:715);k+=kind==="cyclic"?1:2){
      const z=support(opening,kind,k),t=transpose(z),v=rectangle(z,5,9),w=rectangle(t,5,9),coverage=kind==="cyclic"?716:716-716%k;
      n+=2;if(v||w){legal.push([k,coverage,Number(v)+Number(w)]);maxCoverage=Math.max(maxCoverage,coverage)}
    }
    historical[kind]={n,legal:legal.reduce((s,x)=>s+x[2],0),maxCoverage,witnessPeriods:legal};
  }
  const lags=[1,2,3,4,5,6,7,8,9,10,11,13,15,16,19,23,29,31,55,57,75,95,103,109,233,256],periods=[3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,55,57,75,95,103,109,233,255,257];
  const fixed={};
  for(const lens of [[10,10,9],[6,6,6,6,5],[15,14],[8,8,8,5],[5,5,5,5,5,4],[3,3,3,3,3,3,3,3,3,2]]){
    let n=0,fit=0,held=0,full=0,minHold=Infinity,byKind={linear:{fit:0,held:0},inverse:{fit:0,held:0}};
    const plans=[];
    for(const [kind,ks] of [["linear",lags],["inverse",periods]])for(const k of ks){if(k>=249)continue;const p=plan(opening.length,kind,k);let tr=[],te=[];for(let i=p.start;i<p.end;i++){const x=p.r[i],y=p.c[i];if(i<249&&x<249&&y<249)tr.push([x,y]);if(i>=249&&x>=249&&y>=249)te.push([x,y])}plans.push({kind,p,tr,te})}
    for(let rev=0;rev<1<<lens.length;rev++){
      const {g,map}=grid(lens,rev);
      for(const {kind,p,tr,te} of plans)for(const swap of [false,true]){
        const hole=([x,y])=>{if(swap)[x,y]=[y,x];return g[map[opening[x]][0]][map[opening[y]][1]]<0};
        n++;if(tr.some(hole))continue;fit++;byKind[kind].fit++;
        const h=te.reduce((s,t)=>s+Number(hole(t)),0);minHold=Math.min(minHold,h);if(h)continue;held++;byKind[kind].held++;
        let ok=true;for(let i=p.start;i<p.end;i++)if(hole([p.r[i],p.c[i]])){ok=false;break}if(ok)full++;
      }
    }
    fixed[lens.join(",")]={n,fit,held,full,minHold:Number.isFinite(minHold)?minHold:null,byKind};
  }
  const controls=[],p57=corpus.pages[57].indices,absent=Array.from({length:A},(_,i)=>i).filter(i=>!p57.includes(i));
  for(const lens of [[10,10,9],[6,6,6,6,5],[15,14],[8,8,8,5]]){
    const w=lens[0],m=lens.at(-1),rr=lens.length,kk=(rr-1)*(w-m);
    const make=(reverse=false)=>{
      const perm=Array(A).fill(-1);let q=0;
      if(m<kk){for(let i=(rr-1)*w;i<A;i++)perm[i]=absent[q++];}
      else {for(let i=0;i<rr-1;i++)for(let c=m;c<w;c++)perm[i*w+c]=absent[q++];}
      const rem=Array.from({length:A},(_,i)=>i).filter(i=>!perm.includes(i));if(reverse)rem.reverse();
      for(let i=0;i<A;i++)if(perm[i]<0)perm[i]=rem.shift();return grid(lens,0,perm);
    };
    const G=make(),H=make(true);
    for(const [kind,k] of [["cyclic",13],["inverse",19],["forward",19]]){
      const p=plan(p57.length,kind,k);
      for(const separate of [false,true]){
        const src=separate?H:G,c=forward(p57,p,src,G);
        if(c.some(x=>x<0)||inverse(c,p,src,G).some((x,i)=>x!==p57[i]))throw Error("native control");
        const [dr,dc]=degrees(support(c,kind,k));if((dr+dc)**2<A)throw Error("control obstruction");
        if(!rectangle(support(c,kind,k),m,kk))throw Error("same-layout hole control");
        controls.push({lens,kind,k,separate,exact:p57.length,distinct:new Set(c).size});
      }
    }
  }
  let seed=3301,rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
  for(let t=0;t<1000;t++){const z=Array(A).fill(mask);for(let i=0;i<5;i++)z[i]=(mask^31)|(rand()&31);let ok=false;for(let x=0;x<5;x++)for(let y=x+1;y<5;y++)for(let b=0;b<5;b++)if(b!==x&&b!==y&&!(z[x]&(1<<b))&&!(z[y]&(1<<b)))ok=true;if(rectangle(z,2,1)!==ok)throw Error("toy oracle")}
  // Independently verify the optimized support computation against the
  // explicit coordinate plans for all tested control and representative source widths.
  for(const x of [opening,a,p57])for(const [kind,k] of [["cyclic",13],["linear",23],["inverse",13],["forward",19],["inverse",55],["forward",75]]){
    const p=plan(x.length,kind,k),z=Array(A).fill(0);for(let i=p.start;i<p.end;i++)z[x[p.r[i]]]|=1<<x[p.c[i]];
    if(z.some((v,i)=>v!==support(x,kind,k)[i]))throw Error("support plan mismatch");
  }
  return {full,historical,fixed,controls,oracleChecks:1000};
}
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'));
console.log(JSON.stringify(run(corpus), null, 2));
