/**
 * Ciphertext-only GF(29) finite-memory plaintext-filter inverse.
 * Run: node sims/lp2_plaintext_fir_allkey_ioc_sft.cjs
 * Original fit p16–21, frozen holdout p40–53, all-consuming GP indices.
 * No word-boundary assumptions. Two complete 29^4 normalized searches,
 * and two target-excluded native-reference plants per family.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..','resources','liber-primus');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'lp2-corpus.json'),'utf8'));
const reference=fs.readFileSync(path.join(root,'lp1-plaintext-reference.txt'),'utf8');
const labels=corpus.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
const normalized=reference.split('\n').filter(l=>!l.startsWith('#')&&!l.startsWith('[')&&/^[A-Z]/.test(l)).join(' ').replace(/K/g,'C').replace(/Q/g,'CW').replace(/V/g,'U').replace(/Z/g,'S');
const plain=[];
for(let i=0;i<normalized.length;){
  const m=labels.find(([s])=>normalized.startsWith(s,i));
  if(m){plain.push(m[1]);i+=m[0].length;}else i++;
}
/** @param {number} first @param {number} last @returns {number[]} */
const tape=(first,last)=>corpus.pages.filter(p=>p.page>=first&&p.page<=last).flatMap(p=>p.indices);
const fit=tape(16,21), hold=tape(40,53), full=tape(16,53);
assert.equal(fit.length,1613);assert.equal(hold.length,3008);assert.equal(full.length,8886);assert.equal(plain.length,2607);
const mod=x=>((x%29)+29)%29;
const mul=Array.from({length:29},(_,k)=>Uint8Array.from({length:29},(_,j)=>k*j%29));
const inv=Array.from({length:29},(_,x)=>mul[x].indexOf(1));
const logf=Array(29).fill(1);
for(const p of plain.slice(1613))logf[p]++;
for(let i=0;i<29;i++)logf[i]=Math.log(logf[i]/(plain.length-1613+29));
/** @param {number[]} a */
function ioc(a){const h=new Uint32Array(29);for(const x of a)h[x]++;return h.reduce((s,v)=>s+v*(v-1),0)/(a.length*(a.length-1))}
function decode3(c,b,d,e,k,a=1){
  const out=[];let x1=0,x2=0,x3=0;
  for(const v of c){const x=(v+b*x1+d*x2+e*x3+k)%29;out.push(x*a%29);x3=x2;x2=x1;x1=x;}
  return out;
}
function encode3(p,b,d,e,k,a){
  const out=[];let x1=0,x2=0,x3=0;
  for(const v of p){const x=v*inv[a]%29;out.push(mod(x-b*x1-d*x2-e*x3-k));x3=x2;x2=x1;x1=x}
  return out;
}
function decode2(c,b,d,s,t,k,a=1,z=0){
  const out=[];let x1=s,x2=t;
  for(const v of c){const x=(v+b*x1+d*x2+k)%29;out.push((x*a+z)%29);x2=x1;x1=x}
  return out;
}
function encode2(p,b,d,s,t,k,a=1,z=0){
  const out=[];let x1=s,x2=t;
  for(const v of p){const x=mod(v-z)*inv[a]%29;out.push(mod(x-b*x1-d*x2-k));x2=x1;x1=x}
  return out;
}
function tracker(n){
  let best=-1,ties=0,keys=[],ranked=[];
  return {
    /** @param {number[]} key @param {number} score */
    add(key,score){
      if(score>best){best=score;keys=[key];ties=1}
      else if(score===best){ties++;if(keys.length<100)keys.push(key)}
      if(ranked.length<16||score>ranked[ranked.length-1].score){ranked.push({key,score});ranked.sort((a,b)=>b.score-a.score);if(ranked.length>16)ranked.pop()}
    },
    result(){return {max:best/(n*(n-1)),keys,ties,ranked:ranked.map(o=>({...o,ioc:o.score/(n*(n-1))}))}}
  };
}
function count(freq){let score=0;for(let j=0;j<29;j++)score+=freq[j]*(freq[j]-1);return score}
/** @param {number[]} cipher */
function search3(cipher){
  const n=cipher.length,yy=new Uint8Array(n),zz=new Uint8Array(n),freq=new Uint32Array(29),result=tracker(n);
  for(let b=0;b<29;b++)for(let d=0;d<29;d++)for(let e=0;e<29;e++){
    let y1=0,y2=0,y3=0,z1=0,z2=0,z3=0;
    for(let i=0;i<n;i++){
      const y=(cipher[i]+b*y1+d*y2+e*y3)%29,z=(1+b*z1+d*z2+e*z3)%29;
      yy[i]=y;zz[i]=z;y3=y2;y2=y1;y1=y;z3=z2;z2=z1;z1=z;
    }
    for(let k=0;k<29;k++){
      freq.fill(0);const mm=mul[k];
      for(let i=0;i<n;i++){const v=yy[i]+mm[zz[i]];freq[v>=29?v-29:v]++}
      result.add([b,d,e,k],count(freq));
    }
  }
  return result.result();
}
/** @param {number[]} cipher */
function search2(cipher){
  const n=cipher.length,y=new Uint8Array(n),u=new Uint8Array(n),v=new Uint8Array(n),temp=new Uint8Array(n),freq=new Uint32Array(29),result=tracker(n);
  for(let b=0;b<29;b++)for(let d=0;d<29;d++){
    const res=(b+d)%29===1;
    let y1=0,y2=0,u1=1,u2=0,v1=0,v2=res?0:1;
    for(let i=0;i<n;i++){
      const yy=(cipher[i]+b*y1+d*y2)%29,uu=(b*u1+d*u2)%29,vv=(b*v1+d*v2+(res?1:0))%29;
      y[i]=yy;u[i]=uu;v[i]=vv;y2=y1;y1=yy;u2=u1;u1=uu;v2=v1;v1=vv;
    }
    for(let s=0;s<29;s++){
      const mm=mul[s];
      for(let i=0;i<n;i++){const x=y[i]+mm[u[i]];temp[i]=x>=29?x-29:x}
      for(let j=0;j<29;j++){
        freq.fill(0);const nn=mul[j];
        for(let i=0;i<n;i++){const x=temp[i]+nn[v[i]];freq[x>=29?x-29:x]++}
        result.add([b,d,s,res?0:j,res?j:0],count(freq));
      }
    }
  }
  return result.result();
}
/** @param {number[]} x @param {boolean} shift */
function affine(x,shift){
  const f=new Uint32Array(29);for(const v of x)f[v]++;
  let aBest=0,zBest=0,score=-Infinity;
  for(let a=1;a<29;a++)for(let z=0;z<(shift?29:1);z++){
    let s=0;for(let i=0;i<29;i++)s+=f[i]*logf[(a*i+z)%29];
    if(s>score){score=s;aBest=a;zBest=z}
  }
  return {a:aBest,z:zBest,score:score/x.length};
}
const translit=a=>a.slice(0,80).map(v=>corpus.translit[v]).join(' ');
const avg=a=>a.reduce((s,v)=>s+logf[v],0)/a.length;
const equal=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
function original(order){
  const search=order===3?search3:search2,decode=order===3?decode3:decode2,encode=order===3?encode3:encode2;
  const result=search(fit);
  const top=result.ranked.map(o=>{
    const a=affine(decode(fit,...o.key),order===2);
    const key=order===3?[...o.key,a.a]:[...o.key,a.a,a.z];
    const fp=decode(fit,...key),hp=order===3?decode(hold,...key):decode(full,...key).slice(-hold.length);
    return {key,fitIoc:o.ioc,holdIoc:ioc(hp),fitLog:a.score,holdLog:avg(hp),fitPrefix:translit(fp),holdPrefix:translit(hp),replay:equal(encode(fp,...key),fit)};
  });
  assert(top.every(x=>x.replay));
  return {order,normalizedKeys:29**4,fullKeys:28*29**(order===3?4:5),result,top};
}
function control(order,trueKey,start){
  const search=order===3?search3:search2,decode=order===3?decode3:decode2,encode=order===3?encode3:encode2;
  const train=plain.slice(start,start+400),test=plain.slice(start+400,start+800);
  const c=order===3?encode(train,...trueKey):encode([...train,...test],...trueKey);
  const hc=order===3?encode(test,...trueKey):c;
  const result=search(c.slice(0,400));
  const fitted=result.keys.map(key=>{
    const a=affine(decode(c.slice(0,400),...key),order===2);
    const k=order===3?[...key,a.a]:[...key,a.a,a.z];
    const f=decode(c,...k).slice(0,400),h=decode(hc,...k).slice(-400);
    return {key:k,fitMatch:f.filter((v,i)=>v===train[i]).length,holdMatch:h.filter((v,i)=>v===test[i]).length};
  });
  assert(fitted.some(x=>x.fitMatch===400&&x.holdMatch===400));
  return {order,trueKey,start,result,fitted};
}
const result={
  fitRunes:fit.length,holdRunes:hold.length,normalizedReferenceRunes:plain.length,
  nativeIoc:[ioc(plain.slice(0,1613)),ioc(plain.slice(1613))],
  original:[original(3),original(2)],
  controls:[
    control(3,[5,11,7,13,17],0),
    control(3,[13,4,0,21,8],800),
    control(2,[13,4,9,12,21,8,0],800),
    control(2,[12,18,3,19,7,11,0],0)
  ]
};
console.log(JSON.stringify(result,null,2));