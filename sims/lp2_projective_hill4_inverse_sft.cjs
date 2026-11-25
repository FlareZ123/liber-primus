'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..','resources','liber-primus');
const c=JSON.parse(fs.readFileSync(path.join(root,'lp2-corpus.json'),'utf8'));
const s=fs.readFileSync(path.join(root,'lp1-plaintext-reference.txt'),'utf8');
function attack(c,s){
 const mod=x=>((x%29)+29)%29;const inv=x=>{for(let j=1;j<29;j++)if(x*j%29===1)return j;throw Error('zero inverse')};
 const labels=c.translit.map((v,i)=>[v,i]).sort((a,b)=>b[0].length-a[0].length);const str=s.split('\n').filter(l=>!l.startsWith('#')&&!l.startsWith('[')&&/^[A-Z]/.test(l)).join(' ').replace(/K/g,'C').replace(/Q/g,'CW').replace(/V/g,'U').replace(/Z/g,'S');const ref=[];for(let i=0;i<str.length;){const m=labels.find(([x])=>str.startsWith(x,i));if(m){ref.push(m[1]);i+=m[0].length}else i++}
 const rows=[];for(let j=0;j<4;j++){const n=29**(3-j);for(let z=0;z<n;z++){let a=Array(4).fill(0),q=z;a[j]=1;for(let k=j+1;k<4;k++){a[k]=q%29;q=Math.floor(q/29)}rows.push(a)}}
 const histEnergy=h=>h.reduce((a,x)=>a+x*x,0);
 function hist(a){let h=Array(29).fill(0);for(const x of a)h[x]++;return h}
 const ic=a=>(histEnergy(hist(a))-a.length)/(a.length*(a.length-1));
 function rank(a){let m=a.map(x=>x.slice()),r=0;for(let j=0;j<4;j++){let k=m.findIndex((v,i)=>i>=r&&v[j]);if(k<0)continue;[m[r],m[k]]=[m[k],m[r]];let v=inv(m[r][j]);m[r]=m[r].map(x=>x*v%29);for(let i=r+1;i<m.length;i++){let t=m[i][j];for(let l=j;l<4;l++)m[i][l]=mod(m[i][l]-t*m[r][l])}r++}return r}
 function select(t){const n=Math.floor(t.length/4);let u=new Uint8Array(29);const e=[];for(const a of rows){u.fill(0);let [x,y,z,w]=a;for(let i=0;i<4*n;i+=4)u[(x*t[i]+y*t[i+1]+z*t[i+2]+w*t[i+3])%29]++;let v=0;for(let k=0;k<29;k++)v+=u[k]*u[k];e.push([v,a])}e.sort((a,b)=>b[0]-a[0]);let chosen=[];for(const item of e){if(rank([...chosen.map(x=>x[1]),item[1]])>chosen.length)chosen.push(item);if(chosen.length===4)break}return {n,chosen,norm:chosen.reduce((s,x)=>s+Math.sqrt(x[0]),0),max:e[0][0],maxDirection:e[0][1]}}
 function scan(t){const a=[];for(let off=0;off<4;off++){let b=select(t.slice(off)),fringe=t.length-4*b.n;a.push({phase:off,blocks:b.n,fringe,rows:b.chosen,pooledBound:((b.norm+fringe)**2-t.length)/(t.length*(t.length-1)),norm:b.norm+fringe,maxRowIoc:(b.max-b.n)/(b.n*(b.n-1))})}return a}
 const t=c.pages.filter(p=>p.page>=15&&p.page<=22).flatMap(p=>p.indices), chapter=scan(t), body=scan(t.slice(20)), pages=c.pages.filter(p=>p.page>=15&&p.page<=22).map(p=>({page:p.page,n:p.indices.length,phases:scan(p.indices)}));
 const maxPrivateNorm=pages.reduce((s,p)=>s+Math.max(...p.phases.map(x=>x.norm)),0);
 function referenceWindows(n){let lo=1,hi=0;for(let i=0;i+n<=ref.length;i++){let x=ic(ref.slice(i,i+n));lo=Math.min(lo,x);hi=Math.max(hi,x)}return {n,min:lo,max:hi,windows:Math.max(0,ref.length-n+1)}}
 const train=ref.slice(0,994), hold=ref.slice(994,2594);
 const probs=hist(train).map(x=>Math.log((x+1)/(train.length+29)));
 const big=Array.from({length:29},()=>Array(29).fill(1));for(let i=1;i<train.length;i++)big[train[i-1]][train[i]]++;const lp=big.map(a=>{let n=a.reduce((s,v)=>s+v,0);return a.map(x=>Math.log(x/n))});
 const score=t=>t.slice(1).reduce((s,v,i)=>s+lp[t[i]][v],0)/(t.length-1);
 function decode(C,basis){const out=[];for(let i=0;i+3<C.length;i+=4)for(const [a,b] of basis)out.push(mod(a.reduce((s,x,k)=>s+x*C[i+k],b)));return out}
 function plant(matrix,offset){const C=decode(hold,matrix.map((x,i)=>[x,offset[i]]));let fit=C.slice(0,1000),sel=select(fit),cand=sel.chosen.map(([_,a])=>{const seq=[];for(let i=0;i<fit.length;i+=4)seq.push(a.reduce((s,v,k)=>s+v*fit[i+k],0)%29);let opts=[];for(let m=1;m<29;m++)for(let b=0;b<29;b++){const p=seq.map(x=>(m*x+b)%29);opts.push({m,b,p,s:p.reduce((s,x)=>s+probs[x],0)})}opts.sort((a,b)=>b.s-a.s);return {a,opts:opts.slice(0,16)}});let best={score:-Infinity};function perms(a){if(a.length===0)return [[]];return a.flatMap((v,i)=>perms(a.filter((_,j)=>j!==i)).map(q=>[v,...q]))}
 const pc={};for(let x=0;x<4;x++)for(let y=0;y<4;y++)if(x!==y)for(let seam=0;seam<2;seam++){pc[[x,y,seam]]=cand[x].opts.map(a=>cand[y].opts.map(b=>a.p.slice(0,a.p.length-seam).reduce((s,v,i)=>s+lp[v][b.p[i+seam]],0)))}
 for(const order of perms([0,1,2,3])){const [x,y,z,w]=order;for(let a=0;a<16;a++)for(let b=0;b<16;b++)for(let d=0;d<16;d++)for(let e=0;e<16;e++){let sc=pc[[x,y,0]][a][b]+pc[[y,z,0]][b][d]+pc[[z,w,0]][d][e]+pc[[w,x,1]][e][a];if(sc>best.score){const basis=order.map((j,k)=>{const o=cand[j].opts[[a,b,d,e][k]];return [cand[j].a.map(x=>x*o.m%29),o.b]});best={score:sc,basis,order,indices:[a,b,d,e]}}}}
 const out=decode(C,best.basis);return {matrix,offset,rank:rank(matrix),basis:best.basis,directions:sel.chosen,fitCorrect:out.slice(0,1000).filter((x,i)=>x===hold[i]).length,holdoutCorrect:out.slice(1000).filter((x,i)=>x===hold[i+1000]).length,holdoutN:out.length-1000,holdoutScore:score(out.slice(1000)),actualScore:score(hold.slice(1000)),preview:out.slice(0,70).map(x=>c.translit[x]).join('')}
 }
 return {rowCount:rows.length,refLength:ref.length,chapter,body,pages,privateBound:(maxPrivateNorm**2-t.length)/(t.length*(t.length-1)),native:[referenceWindows(t.length),referenceWindows(t.length-20)],plants:[plant([[1,3,6,4],[2,1,3,8],[7,5,2,3],[4,2,9,7]],[1,11,7,5]),plant([[2,3,9,4],[1,7,3,6],[8,5,2,1],[3,6,4,10]],[17,3,26,12])]};
}
console.log(JSON.stringify(attack(c,s),null,2));
