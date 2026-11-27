'use strict';
const fs=require('node:fs');
const path=require('node:path');
function main(corpus,native) {
  const mod=x=>((x%29)+29)%29;
  const inv=x=>{for(let j=1;j<29;j++)if(mod(x*j)===1)return j;throw Error("zero inverse")};
  const assert=(b,m)=>{if(!b)throw Error(m)};
  const alpha="0123456789abcdefghijklmnopqrs";
  const A=[7,10,20,20], B=[13,24,2,15];
  const c=corpus.pages.slice(33,41).flatMap(p=>p.indices);
  const x=132,y=corpus.pages.slice(33,40).reduce((a,p)=>a+p.indices.length,0)+71;
  assert(x===132&&y===1751&&c.length===1911,"source geometry");
  assert(c.slice(x,x+4).join()==="3,15,17,22"&&c.slice(y,y+4).join()==="4,15,14,21","anchor coordinates");
  const idx=new Map(native.runes.map((v,i)=>[v,i]));
  const seq=native.sections.map(s=>[...s.source_text].filter(v=>idx.has(v)).map(v=>idx.get(v)));
  const train=[0,2,5,6,7].map(i=>seq[i]);
  const count=Array.from({length:29},()=>Array(29).fill(0.5));
  for(const a of train)for(let i=1;i<a.length;i++)count[a[i-1]][a[i]]++;
  const ll=count.map(r=>{const z=r.reduce((a,b)=>a+b,0);return r.map(v=>Math.log(v/z))});
  const score=t=>t.length<2?null:t.slice(1).reduce((s,v,i)=>s+ll[t[i]][v],0)/(t.length-1);
  const enc=t=>t.map(v=>alpha[v]).join("");
  const dec=s=>[...s].map(v=>alpha.indexOf(v));
  const kvalue=(k,h)=>mod(k[0]+h.reduce((s,v,i)=>s+k[i+1]*v,0));
  const push=(h,v)=>[v,...h.slice(0,-1)];
  function histories(t,i,m,hold){
    const out=new Map();
    function recur(j,h){if(h.length===m){out.set(h.join(),h);return}if(j<0)return;
      recur(j-1,[...h,t[j]]);if(hold&&t[j]===0)recur(j-1,h);
    }recur(i-1,[]);return [...out.values()];
  }
  function rows(t,i,p,h){return p.map((v,j)=>{const u=t[i+j],row=[1,...h,mod(u-v)];h=push(h,u);return row})}
  function solve(rows,n){
    const a=rows.map(r=>r.map(mod));let r=0;const piv=[];
    for(let j=0;j<n;j++){let i=r;while(i<a.length&&a[i][j]===0)i++;if(i===a.length)continue;
      [a[i],a[r]]=[a[r],a[i]];const q=inv(a[r][j]);a[r]=a[r].map(v=>mod(v*q));
      for(let l=0;l<a.length;l++)if(l!==r&&a[l][j]){const q=a[l][j];a[l]=a[l].map((v,k)=>mod(v-q*a[r][k]))}
      piv.push(j);r++;
    }
    if(a.some(row=>row.slice(0,n).every(v=>!v)&&row[n]))return {rank:r,solutions:[]};
    const free=Array.from({length:n},(_,i)=>i).filter(i=>!piv.includes(i));const solutions=[];const k=Array(n).fill(0);
    function gen(i){if(i<free.length){for(let v=0;v<29;v++){k[free[i]]=v;gen(i+1)}return}
      for(let j=0;j<r;j++)k[piv[j]]=mod(a[j][n]-free.reduce((s,f)=>s+a[j][f]*k[f],0));
      assert(rows.every(row=>mod(row.slice(0,n).reduce((s,v,i)=>s+v*k[i],0))===row[n]),"linear solution");solutions.push([...k]);
    }gen(0);return{rank:r,solutions};
  }
  function receiver(t,k,h,hy,hold){
    let states=new Map([[h.join()+"|-1",{h,last:-1,n:1n,best:0,path:""}]]);
    for(let i=x;i<t.length;i++){
      const next=new Map(),u=t[i],forced=i<x+4?A[i-x]:i>=y&&i<y+4?B[i-y]:null;
      for(const v of states.values()){
        if(i===y&&v.h.join()!==hy.join())continue;
        const p=mod(u-kvalue(k,v.h));
        const choices=[];
        if(!hold||p!==0)choices.push([p,push(v.h,u)]);
        if(hold&&u===0)choices.push([0,v.h]);
        for(const [p2,h2] of choices){
          if(forced!==null&&p2!==forced)continue;
          const key=h2.join()+"|"+p2;
          const z=next.get(key),s=v.best+(v.last<0?0:ll[v.last][p2]);
          if(!z)next.set(key,{h:h2,last:p2,n:v.n,best:s,path:v.path+alpha[p2]});
          else {z.n+=v.n;if(s>z.best){z.best=s;z.path=v.path+alpha[p2]}}
        }
      }
      states=next;if(!states.size)return {dead:i,paths:"0"};
    }
    const n=[...states.values()].reduce((s,v)=>s+v.n,0n);
    const v=[...states.values()].sort((a,b)=>b.best-a.best)[0],p=dec(v.path);
    let h2=h;for(let j=0;j<p.length;j++){const q=p[j];const u=hold&&q===0?0:mod(q+kvalue(k,h2));assert(u===t[x+j],"exact replay");if(!(hold&&q===0))h2=push(h2,u)}
    return {dead:null,paths:n.toString(),prefixScore:score(p.slice(4,y-x)),suffixScore:score(p.slice(y-x+4)),suffix:p.slice(y-x+4).map(v=>corpus.translit[v]).join(""),plaintext:v.path};
  }
  function attack(t,m,hold){
    const hx=histories(t,x,m,hold),hy=histories(t,y,m,hold);let count=0,rankHist={},out=[];
    for(const a of hx)for(const b of hy){
      const s=solve([...rows(t,x,A,a),...rows(t,y,B,b)],m+1);
      rankHist[s.rank]=(rankHist[s.rank]||0)+1;
      for(const k of s.solutions){count++;out.push({k,hx:a,hy:b,...receiver(t,k,a,b,hold)})}
    }
    return {m,hold,histories:[hx.length,hy.length],rankHist,linearCandidates:count,legal:out.filter(v=>v.dead===null).length,out};
  }
  const donor=[...seq[1],...seq[3],...seq[4]].slice(0,c.length);
  donor.splice(x,4,...A);donor.splice(y,4,...B);
  function plant(k,hold){
    let h=Array.from({length:k.length-1},(_,i)=>i+1);
    const t=donor.map(p=>{if(hold&&p===0)return 0;const u=mod(p+kvalue(k,h));h=push(h,u);return u});
    const r=attack(t,k.length-1,hold);
    const truth=r.out.filter(v=>v.k.join()===k.join()&&v.dead===null);
    assert(truth.length>0,"planted key lost");
    return {key:k,hold,legal:r.legal,candidates:r.linearCandidates,histories:r.histories,truthPaths:truth.map(v=>v.paths),bestTruthAccuracy:Math.max(...truth.map(v=>dec(v.plaintext).filter((p,i)=>p===donor[x+i]).length)),total:donor.length-x,donorSuffixScore:score(donor.slice(y+4))};
  }
  const controls=[plant([8,2,5,11,7,3,9],false),plant([3,1,8,15,4,5,12],true)];
  const original=[attack(c,6,false),attack(c,6,true),attack(c,7,false),attack(c,7,true)];
  return {geometry:{x,y,n:c.length,holdout:c.length-y-4},nativeP57Score:score(seq[8]),controls,original};
}
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
console.log(JSON.stringify(main(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
