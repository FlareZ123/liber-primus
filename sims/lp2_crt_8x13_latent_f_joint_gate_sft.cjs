"use strict";
/** #2613: exact q104 latent-F joint collision gate; Node 22/CommonJS. */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
function run(gp,raw,blobShas){
  const assert=(x,m)=>{if(!x)throw Error(m)};
  const mod=x=>(x%29+29)%29;
  const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  function native(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error(w);out.push(t.i);w=w.slice(t.s.length)}}return out}
  function stats(a,d){let r=0,b=0;for(let i=d;i<a.length;i++)if(a[i]===a[i-d]){r++;if(i>d&&a[i-1]===a[i-d-1])b++}return [r,b]}
  function bounds(C,d){const D=d+1;let S=new Map([["",[0,0,0,0]]]),peak=1;for(const c of C){const T=new Map(),z=String.fromCharCode(c);function merge(h,a,r,b){let o=T.get(h);if(o){o[0]=Math.min(o[0],a[0]+r);o[1]=Math.max(o[1],a[1]+r);o[2]=Math.min(o[2],a[2]+b);o[3]=Math.max(o[3],a[3]+b)}else T.set(h,[a[0]+r,a[1]+r,a[2]+b,a[3]+b])}for(const [h,a] of S){if(c===0)merge(h,a,0,0);let n=+(h.length>=d&&h.charCodeAt(h.length-d)===c),m=+(n&&h.length>d&&h.charCodeAt(h.length-1)===h.charCodeAt(h.length-d-1));merge((h+z).slice(-D),a,n,m)}S=T;peak=Math.max(peak,S.size)}let a=[Infinity,-Infinity,Infinity,-Infinity];for(const b of S.values()){a[0]=Math.min(a[0],b[0]);a[1]=Math.max(a[1],b[1]);a[2]=Math.min(a[2],b[2]);a[3]=Math.max(a[3],b[3])}return {rune:[a[0],a[1]],bigram:[a[2],a[3]],peak}}
  function events(C,d,bigram){
    const z=[],zi=new Map(),pref=[0];for(let i=0;i<C.length;i++){if(C[i]===0){zi.set(i,z.length);z.push(i)}pref.push(z.length)}
    const pre=C.map((_,i)=>{const a=[];for(let j=i-1;j>=0;j--){a.push(j);if(C[j]!==0)break}return a}),out=[];
    for(let i=d;i<C.length;i++)for(let j=i-d;j>=0;j--){
      const k=i-j-d,l=pref[j],r=pref[i];if(k>r-l)break;if(C[i]!==C[j])continue;
      const pairs=bigram?pre[i].flatMap(a=>pre[j].filter(b=>C[a]===C[b]).map(b=>[a,b])):[[-1,-1]];
      for(const [a,b] of pairs){const co=[...new Set([i,j,a,b].filter(t=>zi.has(t)).map(t=>zi.get(t)))];const he=new Set();
        if(bigram){for(let t=pref[a+1];t<pref[i];t++)he.add(t);for(let t=pref[b+1];t<pref[j];t++)he.add(t)}
        if(co.some(x=>he.has(x)))continue;const h=[...he];const forced=h.filter(x=>l<=x&&x<r).length,forbid=co.filter(x=>l<=x&&x<r).length;if(k<forced||k>r-l-forbid)continue;
        out.push({d,i,j,a,b,l,r,k,co,he:h})
      }
    }return out
  }
  function enabled(e,mask){let sum=0;for(let i=e.l;i<e.r;i++)sum+=mask[i];return sum===e.k&&e.co.every(i=>mask[i]===0)&&e.he.every(i=>mask[i]===1)}
  function active(C,mask){let j=0;return C.filter(c=>c!==0||mask[j++]===0)}
  function pairOK(a,b,n,H){const co=new Set([...a.co,...b.co]),he=new Set([...a.he,...b.he]);if([...co].some(x=>he.has(x)))return false;let k1=a.k,k2=b.k,rest=0,ab=0,aa=0,bb=0;for(let x=0;x<n;x++){const A=a.l<=x&&x<a.r,B=b.l<=x&&x<b.r;if(he.has(x)){k1-=+A;k2-=+B;H--;continue}if(co.has(x))continue;if(A&&B)ab++;else if(A)aa++;else if(B)bb++;else rest++}for(let u=0;u<=ab;u++){const x=k1-u,y=k2-u,h=H-u-x-y;if(x>=0&&x<=aa&&y>=0&&y<=bb&&h>=0&&h<=rest)return true}return false}
  const low=p=>p&-p,idx=b=>b.toString(2).length-1;
  function pop(p){let n=0;while(p){p^=low(p);n++}return n}
  function quota(C,ds,targets,H,nodeCap=100000){
    const E=ds.flatMap(d=>events(C,d,true)),n=C.filter(x=>x===0).length,N=n+1;
    const group=ds.map(d=>E.reduce((b,e,i)=>e.d===d?b|(1n<<BigInt(i)):b,0n)),adj=E.map(()=>0n);
    for(let i=0;i<E.length;i++)for(let j=i+1;j<E.length;j++)if(pairOK(E[i],E[j],n,H)){adj[i]|=1n<<BigInt(j);adj[j]|=1n<<BigInt(i)}
    const edges=E.map(e=>[[e.l,e.r,e.k],[e.r,e.l,-e.k],...e.co.map(x=>[x,x+1,0]),...e.he.map(x=>[x+1,x,-1])]);
    function insert(D,u,v,w){if(D[v*N+u]+w<0)return null;if(D[u*N+v]<=w)return D;const Q=new Int16Array(D.length);for(let i=0;i<N;i++){const a=D[i*N+u]+w;for(let j=0;j<N;j++)Q[i*N+j]=Math.min(D[i*N+j],a+D[v*N+j])}return Q}
    function add(D,e){for(const [u,v,w] of edges[e]){D=insert(D,u,v,w);if(D===null)return null}return D}
    function possible(D,e){return edges[e].every(([u,v,w])=>D[v*N+u]+w>=0)}
    function color(P){let k=0;while(P){k++;let Q=P;while(Q){const b=low(Q),v=idx(b);P^=b;Q^=b;Q&=~adj[v]}}return k}
    let D=new Int16Array(N*N);for(let i=0;i<N;i++)for(let j=0;j<N;j++)D[i*N+j]=Math.max(j-i,0);
    D=insert(D,0,n,H);if(D)D=insert(D,n,0,-H);
    let nodes=0,capped=false;
    function visit(P,need,D){
      if(++nodes>nodeCap){capped=true;return null}
      if(need.every(x=>x===0))return D;
      let G=0n;for(let i=0;i<ds.length;i++)if(need[i]>0)G|=group[i];P&=G;
      for(let Q=P;Q;){const b=low(Q),v=idx(b);Q^=b;if(!possible(D,v))P^=b}
      const sizes=group.map(g=>pop(P&g));if(sizes.some((s,i)=>s<need[i]))return null;
      if(color(P)<need.reduce((a,b)=>a+b,0))return null;
      for(let i=0;i<ds.length;i++)if(need[i]&&color(P&group[i])<need[i])return null;
      let d=-1;for(let i=0;i<ds.length;i++)if(need[i]&&(d<0||sizes[i]-need[i]<sizes[d]-need[d]))d=i;
      for(let Q=P&group[d];Q;){if(pop(Q)<need[d])return null;const b=low(Q),v=idx(b),D2=add(D,v);if(D2){const n2=need.slice();n2[d]--;const a=visit(P&adj[v],n2,D2);if(a)return a;if(capped)return null}P^=b;Q^=b}
      return null
    }
    const ans=D===null?null:visit((1n<<BigInt(E.length))-1n,targets,D);
    const mask=ans?Array.from({length:n},(_,i)=>ans[i+1]-ans[i]):null;
    if(mask){assert(mask.every(x=>x===0||x===1)&&mask.reduce((a,b)=>a+b,0)===H,"witness hold count");const A=active(C,mask);assert(ds.every((d,i)=>stats(A,d)[1]>=targets[i]),"witness collisions")}
    return {eventCounts:ds.map(d=>E.filter(e=>e.d===d).length),nodes,capped,feasible:mask!==null,mask}
  }
  let seed=0x142613;const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
  let toyMasks=0,toyQuota=0;
  for(let t=0;t<36;t++){
    const C=Array.from({length:12},()=>rand()%4),n=C.filter(c=>c===0).length,ds=[2,3],E=ds.map(d=>[events(C,d,false),events(C,d,true)]);const all=[];
    for(let m=0;m<(1<<n);m++){const mask=Array.from({length:n},(_,i)=>(m>>i)&1),A=active(C,mask),s=ds.map(d=>stats(A,d));for(let k=0;k<ds.length;k++)for(let b=0;b<2;b++)assert(E[k][b].filter(e=>enabled(e,mask)).length===s[k][b],"event enumeration");all.push({mask,s,H:mask.reduce((a,b)=>a+b,0)});toyMasks++}
    for(let j=0;j<6;j++){const H=rand()%(n+1),q=[rand()%4,rand()%4],truth=all.some(x=>x.H===H&&q.every((v,i)=>x.s[i][1]>=v)),a=quota(C,ds,q,H);assert(!a.capped&&a.feasible===truth,"quota exact");toyQuota++}
  }
  const names=["Shakespeare","Emerson","Gibran"],controls=raw.map(native),ds=[104,208,312];
  const C=gp.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);assert(C.length===3008&&C.filter(c=>c===0).length===125,"target shape");
  const b=bounds(C,104);const rows=[],survivors=[];
  for(let j=0;j<controls.length;j++){const P=controls[j];const windows=[];for(let i=0;i<32;i++){const start=Math.round(i*(P.length-C.length)/31),w=P.slice(start,start+C.length),a=w.filter(v=>v!==0),s=ds.map(d=>stats(a,d));const row={name:names[j],i,start,holds:w.length-a.length,stats:s};windows.push(row);if(s[0][0]>=b.rune[0]&&s[0][0]<=b.rune[1]&&s[0][1]>=b.bigram[0]&&s[0][1]<=b.bigram[1])survivors.push(row)}rows.push({name:names[j],length:P.length,windows})}
  const decisions=survivors.map(s=>({native:s,quota:quota(C,ds,s.stats.map(x=>x[1]),s.holds)}));
  const plants=[];
  for(let j=0;j<controls.length;j++){const P=controls[j].slice(Math.floor(controls[j].length*(j+1)/5),Math.floor(controls[j].length*(j+1)/5)+3008);const A=[0,...Array.from({length:7},()=>rand()%29)],B=Array.from({length:13},()=>rand()%29);let k=0;const enc=P.map(x=>x===0?0:mod(x+A[k%8]+B[k++%13]));const mask=enc.flatMap((x,i)=>x===0?[+(P[i]===0)]:[]),pa=P.filter(x=>x!==0),ca=active(enc,mask);assert(ca.length===pa.length,"active length");
    const ss=ds.map(d=>stats(pa,d));for(let i=0;i<ds.length;i++){const d=ds[i];assert(stats(ca,d).join()===ss[i].join(),"native CRT collision invariance");for(let b=0;b<2;b++)assert(events(enc,d,!!b).filter(e=>enabled(e,mask)).length===ss[i][b],"native witness event enumeration")}
    plants.push({name:names[j],start:Math.floor(controls[j].length*(j+1)/5),n:P.length,A,B,holds:mask.reduce((a,b)=>a+b,0),cipherFs:mask.length,stats:ss})
  }
  return {sourceBlobShas:blobShas,toyMasks,toyQuota,original:{n:C.length,cipherFs:125,lag104:b},nativeWindows:rows,decisions,plants};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const raw=files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
const blobShas=raw.map(x=>crypto.createHash("sha1").update("blob "+Buffer.byteLength(x)+"\0").update(x).digest("hex"));
console.log(JSON.stringify(run(JSON.parse(raw[0]),raw.slice(1),blobShas),null,2));
