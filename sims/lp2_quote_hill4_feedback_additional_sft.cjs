'use strict';
// Exact fixed-spelling extension of the 36-coefficient all-phase affine feedback inverse.
function engine(){
 const N=160,S=80,Q=29,mod=x=>(x%Q+Q)%Q,assert=(x,msg)=>{if(!x)throw Error(msg)},eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]),inv=x=>{for(let i=1;i<Q;i++)if(mod(x*i)===1)return i;throw Error("zero inverse")},dot=(a,b)=>mod(a.reduce((s,x,i)=>s+x*b[i],0));
 function rank(A){let a=A.map(x=>x.slice()),r=0;for(let c=0;c<a[0].length&&r<a.length;c++){let i=r;while(i<a.length&&!a[i][c])i++;if(i===a.length)continue;[a[r],a[i]]=[a[i],a[r]];let z=inv(a[r][c]);a[r]=a[r].map(x=>mod(z*x));for(let j=r+1;j<a.length;j++){let v=a[j][c];if(v)a[j]=a[j].map((x,k)=>mod(x-v*a[r][k]))}r++}return r}
 function inverse(A){let n=A.length,a=A.map((x,i)=>x.concat(Array.from({length:n},(_,j)=>+(i===j))));for(let c=0;c<n;c++){let i=c;while(i<n&&!a[i][c])i++;if(i===n)return null;[a[i],a[c]]=[a[c],a[i]];let z=inv(a[c][c]);a[c]=a[c].map(x=>mod(z*x));for(let j=0;j<n;j++)if(j!==c){let v=a[j][c];if(v)a[j]=a[j].map((x,k)=>mod(x-v*a[c][k]))}}return a.map(x=>x.slice(n))}
 function encrypt(P,K,iv){const invU=inverse(K.map(k=>k.slice(0,4)));assert(invU,"invertible U");let C=[];for(let i=0;i<P.length;i+=4){let prev=i?C.slice(i-4,i):iv,y=K.map((k,j)=>mod(P[i+j]-dot(k.slice(4),prev.concat(1))));C.push(...invU.map(r=>dot(r,y)))}return C}
 function contexts(C,n,hold,back){if(!n)return [[]];let out=new Map();function rec(i,a){if(a.length===n){let v=back?a.slice().reverse():a.slice();out.set(v.join(),v);return}if(i<0||i>=C.length)return;let x=C[i],j=i+(back?-1:1);if(hold&&x===0)rec(j,a);a.push(x);rec(j,a);a.pop()}rec(back?C.length-1:0,[]);return [...out.values()]}
 function features(C,H,phase,prior,post=[]){let at=[];for(let i=0;i<C.length;i++)if(!H.has(i))at.push(i);let A=prior.concat(at.map(i=>C[i]),post),blocks=[];for(let i=phase?phase-4:0;i<at.length&&i+3<at.length+post.length;i+=4){let j=prior.length+i;assert(j>=4,"prior context");blocks.push({at:[0,1,2,3].map(d=>at[i+d]??-1),f:A.slice(j,j+4).concat(A.slice(j-4,j),1)})}return{at,blocks}}
 function build(C,H,phase,prior){const {blocks}=features(C,H,phase,prior),complete=blocks.filter(b=>b.at.every(i=>i>=0)),B=[],bi=[];for(let i=0;i<complete.length&&B.length<9;i++)if(rank(B.concat([complete[i].f]))>B.length){B.push(complete[i].f);bi.push(i)}if(B.length<9)return{blocked:true};const R=inverse(B),nonbasis=complete.filter((_,i)=>!bi.includes(i)),cols=R[0].map((_,j)=>R.map(r=>r[j]));return{blocks,base:bi.map(i=>complete[i]),R,rels:nonbasis.map(b=>({at:b.at,coef:cols.map(col=>dot(b.f,col))}))}}
 function scan(C,pre,post,candidates){
  assert(C.length===N&&pre.filter(x=>x!==0).length>=7&&post.filter(x=>x!==0).length>=3,"context");let cache=new Map(),prefix=[],full=[],blocked=0,stat=Array.from({length:8},(_,k)=>({hold:k>=4,phase:k%4,compatible:0,cases:0,rankBlocked:0,relationPass:0,invertible:0,prefix:0,full:0}));
  const contextCache=stat.map(s=>contexts(pre,s.phase?8-s.phase:4,s.hold,true));
  for(let c of candidates)for(let hold of [false,true]){
   const P=c.P,H=new Set();let ok=true;if(hold)for(let i=0;i<S;i++)if(P[i]===0){if(C[i]!==0){ok=false;break}H.add(i)}if(!ok)continue;
   for(let phase=0;phase<4;phase++){let z=(hold?4:0)+phase,st=stat[z];st.compatible++;for(let prior of contextCache[z]){
    st.cases++;const id=[hold,phase,[...H].join(),prior.join()].join("|");let f=cache.get(id);if(!f){f=build(C.slice(0,S),H,phase,prior);cache.set(id,f)}
    if(f.blocked){blocked++;st.rankBlocked++;continue}
    const target=Array.from({length:4},(_,j)=>f.base.map(b=>P[b.at[j]]));let consistent=true;for(let r of f.rels){for(let j=0;j<4;j++)if(dot(r.coef,target[j])!==P[r.at[j]]){consistent=false;break}if(!consistent)break}if(!consistent)continue;st.relationPass++;
    const K=target.map(y=>f.R.map(r=>dot(r,y)));if(rank(K.map(k=>k.slice(0,4)))!==4)continue;st.invertible++;
    if(!f.blocks.every(b=>b.at.every((i,j)=>i<0||dot(K[j],b.f)===P[i])))continue;
    st.prefix++;const rec={name:c.name,start:c.start,K,hold,phase,prior};prefix.push(rec);
    let HH=new Set(H),valid=true;if(hold)for(let i=S;i<N;i++)if(P[i]===0){if(C[i]!==0){valid=false;break}HH.add(i)}if(!valid)continue;
    const remain=(4-((N-HH.size-phase)%4+4)%4)%4;
    for(let future of contexts(post,remain,hold,false)){let ff=features(C,HH,phase,prior,future);if(!ff.blocks.every(b=>b.at.every((i,j)=>i<0||dot(K[j],b.f)===P[i])))continue;
     const recovered=Array(N).fill(-1);for(let i of HH)recovered[i]=0;for(let b of ff.blocks)for(let j=0;j<4;j++)if(b.at[j]>=0)recovered[b.at[j]]=dot(K[j],b.f);assert(eq(recovered,P),"full plaintext coverage");st.full++;full.push({...rec,future});
    }
   }}
  }
  let key=x=>JSON.stringify([x.name,x.start,x.K,x.hold,x.phase]),dedup=x=>[...new Map(x.map(y=>[key(y),y])).values()];
  return{candidates:candidates.length,featureClasses:cache.size,blocked,stat,prefix:dedup(prefix),full:dedup(full)};
 }
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
 function plants(sources){const names=["The Time Machine","The Book of Tea","Beowulf Old English"],cases=[];let r=rng(0x25110615);for(let i=0;i<8;i++){let s=sources.find(x=>x.name===names[i%3]),half=Math.floor(i/3)%2,opts=s.candidates.filter(c=>c.start>=Math.floor(half*s.runes/2)+N&&c.start+N<Math.floor((half+1)*s.runes/2)&&cases.every(x=>x.name!==c.name||Math.abs(x.start-c.start)>=N));assert(opts.length,"source options");let c=opts[r()%opts.length],P=c.P,hold=i<4,phase=i%4,K;do{K=Array.from({length:4},()=>Array.from({length:9},()=>r()%Q))}while(rank(K.map(k=>k.slice(0,4)))!==4);let pre=Array.from({length:16+(4-phase)%4},()=>1+r()%28),post=Array.from({length:16},()=>1+r()%28);if(hold){pre.splice(8,0,0);post.splice(4,0,0)}let all=pre.concat(P,post);while(all.filter(x=>!hold||x!==0).length%4)all.push(1+r()%28);let iv=Array.from({length:4},()=>r()%Q),AC=encrypt(all.filter(x=>!hold||x!==0),K,iv),j=0,C=all.map(x=>hold&&x===0?0:AC[j++]);assert(j===AC.length,"plant replay");let target=C.slice(pre.length,pre.length+N);cases.push({name:c.name,start:c.start,K,hold,phase,pre:C.slice(0,pre.length),C:target,post:C.slice(pre.length+N),nullC:Array.from({length:N},()=>r()%Q),P})}return cases}
 function evaluate(sources,cases){let c=sources.flatMap(x=>x.candidates);return {sources:sources.map(x=>({name:x.name,count:x.candidates.length})),controls:cases.map(x=>scan(x.C,x.pre,x.post,c)),nulls:cases.map(x=>scan(x.nullC,x.pre,x.post,c))}}
 function gate(batches,cases){let checks=cases.map((x,i)=>{let p=batches.flatMap(b=>b.controls[i].prefix),f=batches.flatMap(b=>b.controls[i].full),nulls=batches.flatMap(b=>b.nulls[i].prefix),blocked=batches.reduce((s,b)=>s+b.controls[i].blocked+b.nulls[i].blocked,0);let correct=f.length===1&&f[0].name===x.name&&f[0].start===x.start&&f[0].hold===x.hold&&f[0].phase===x.phase&&JSON.stringify(f[0].K)===JSON.stringify(x.K);return{source:x.name,start:x.start,hold:x.hold,phase:x.phase,prefix:p.length,full:f.length,nulls:nulls.length,blocked,correct}});return{pass:checks.every(x=>x.correct&&x.nulls===0&&x.blocked===0),checks}}
 return{scan,plants,evaluate,gate}
}
module.exports=engine();
if(require.main===module){
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),root=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const {MANIFEST,parse}=require('./lp2_quote_joint_additional_sources_sft.cjs'),gp=read('resources/liber-primus/lp2-corpus.json'),oe=read('resources/control/beowulf_oe_gp_profile_corrected.json');
const folder=process.argv[2];if(!folder)throw Error('Supply 31 pinned source files in directory');
const sources=MANIFEST.map(m=>{let raw=fs.readFileSync(path.join(folder,path.basename(m.file)));if(crypto.createHash('sha1').update('blob '+raw.length+'\0').update(raw).digest('hex')!==m.sha)throw Error('source drift '+m.name);return parse(raw.toString('utf8'),m,gp,oe)});
const E=module.exports,cases=E.plants(sources),b=E.evaluate(sources,cases),g=E.gate([b],cases);if(!g.pass)throw Error('calibration failed');let original=null;if(process.argv.includes('--original')){const U=gp.pages.filter(p=>p.page<=55).sort((a,b)=>a.page-b.page).flatMap(p=>p.indices);original=E.scan(U.slice(10279,10439),U.slice(10259,10279),U.slice(10439,10459),sources.flatMap(x=>x.candidates))}console.log(JSON.stringify({gate:g,original},null,2));}
