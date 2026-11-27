'use strict';
const fs=require('node:fs'),path=require('node:path');
const read=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'));
function fullReach(corpus,native,controls){
 const Q=29,mod=x=>(x%Q+Q)%Q,ALL=(1<<29)-2,orig=corpus.pages.slice(0,3).flatMap(x=>x.indices).slice(13),pow=Array.from({length:Q},(_,g)=>{const a=new Uint8Array(Q);a[0]=1;for(let p=1;p<Q;p++)a[p]=a[p-1]*g%Q;return a;}),inv=Array.from({length:Q},(_,x)=>{for(let y=1;y<Q;y++)if(x*y%Q===1)return y;return 0;});
 function encode(p,k,c0){if(!p[0]||!c0)throw Error("initial");const c=[c0];let last=c0,u=p[0];for(let i=1;i<p.length;i++){const v=p[i];if(!v){c.push(0);continue;}last=mod(last+mod(v-k.a*u-k.b)*inv[pow[k.g][u]]);c.push(last);u=v;}return c;}
 function steps(c){let last=c[0];const s=[];for(let i=1;i<c.length;i++){const prior=c[i-1],v=c[i];s[i]={d:[mod(v-prior),mod(v-last),v],zero:v===0,priorZero:prior===0};if(v)last=v;}return s;}
 function reach(c,k,initial=ALL,record=false){const s=steps(c),next=new Uint8Array(Q*Q);for(let d=0;d<Q;d++)for(let p=1;p<Q;p++)next[d*Q+p]=(k.a*p+k.b+pow[k.g][p]*d)%Q;
  function move(mask,base){let out=0;while(mask){const p=31-Math.clz32(mask&-mask);mask&=mask-1;const q=next[base+p];if(q)out|=1<<q;}return out;}
  let a=initial,b=0,h=0;const masks=record?[[a,b,h]]:null;
  for(let i=1;i<c.length;i++){const x=s[i],A=move(a,x.d[0]*Q)|move(b,x.d[1]*Q)|move(h,x.d[2]*Q);if(x.zero){if(x.priorZero)h|=a;else b|=a;}else{b=0;h=0;}a=A;if(record)masks.push([a,b,h]);if(!(a|b|h))return {length:i,masks};}
  return {length:c.length,masks};
 }
 // Independent explicit scalar state oracle for short prefixes, includes last emitted F
 // and real previous consuming ciphertext rather than compressed type masks.
 function oracle(c,k,initial){let live=new Set();for(let p=1;p<Q;p++)if(initial&(1<<p))live.add(p+","+c[0]+","+p);for(let i=1;i<c.length;i++){let next=new Set();for(let t of live){let [p,v,e]=t.split(",").map(Number);let q=mod(k.a*p+k.b+pow[k.g][p]*mod(c[i]-v));if(q)next.add(q+","+c[i]+","+q);if(!c[i])next.add(p+","+v+",0");}live=next;if(!live.size)return i;}return c.length;}
 let seed=0x291337;function rnd(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n;}
 for(let trial=0;trial<300;trial++){let k={g:2+rnd(27),a:rnd(29),b:rnd(29)},c=[1+rnd(28),...Array.from({length:12},()=>rnd(2)?0:rnd(29))],initial=trial%2?ALL:1<<(1+rnd(28));if(reach(c,k,initial).length!==oracle(c,k,initial))throw Error("oracle mismatch "+trial);}
 const plantResults=controls.map((x,i)=>{const t=x.truth,p=native.slice(t.start,t.start+orig.length),c=encode(p,t.key,[13,7][i]),r=reach(c,t.key,1<<p[0],true);if(r.length!==c.length)throw Error("true control pruned");let u=p[0],v=c[0];for(let j=1;j<c.length;j++){let kind;if(p[j]){u=p[j];v=c[j];kind=0;}else kind=v===0?2:1;if(!(r.masks[j][kind]&(1<<u)))throw Error("true trace pruned");}return {key:t.key,start:t.start,truthStateTrace:r.length};});
 const histogram=Array(orig.length+1).fill(0),survivors=[];let best=0,bestKeys=[];const start=Date.now();
 for(let g=2;g<Q;g++)for(let a=0;a<Q;a++)for(let b=0;b<Q;b++){const k={g,a,b},r=reach(orig,k);histogram[r.length]++;if(r.length>best){best=r.length;bestKeys=[k];}else if(r.length===best)bestKeys.push(k);if(r.length===orig.length)survivors.push(k);}
 return {schema:1,scope:"Exact full-prefix legal path reachability; all g=2..28 and a,b=0..28, all 28 nonzero P0, all literal-F hold interpretations; no language scores or known plaintext required.",prefixLength:orig.length,tried:22707,fitFeasible:histogram.slice(249).reduce((s,v)=>s+v,0),maximumPrefix:best,maximumPrefixKeys:bestKeys,survivors,nonemptyFailureHistogram:histogram.map((n,length)=>({length,n})).filter(x=>x.n),oracleTrials:300,plantResults,elapsedMs:Date.now()-start};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/derived/dukotah-r37-lp1-map-runes.json","im-results/lp2-exponential-slope-plainprev-fhold-control1-output.json","im-results/lp2-exponential-slope-plainprev-fhold-control2-output.json"];
console.log(JSON.stringify(fullReach(read(paths[0]),read(paths[1]).key,[read(paths[2]).control1,read(paths[3]).control2]),null,2));
