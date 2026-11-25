"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const {encodeSourceNativeGP:encode}=require("./lp2_native_gp_source_orthography_sft.cjs");
const {train,scorePlain}=require("./lp2_fhold_cyclic_ngram_map.cjs");
const root=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(root,f),"utf8");
const C=JSON.parse(read("resources/liber-primus/lp2-corpus.json")).pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
const lengths=[729,1145,1729,1903,1021,1433,1680,3008,308];
assert.equal(C.length,12956);assert.equal(lengths.reduce((a,b)=>a+b),C.length);
const chap=[];let pos=0;for(const n of lengths){chap.push(C.slice(pos,pos+n));pos+=n}
const donors=["shakespeare_first300k.txt","gibran_prophet_58585.txt","emerson_essays_2944.txt"].map(f=>encode(read("resources/control/"+f)));
const lm=train(donors.map(x=>x.slice(0,Math.floor(x.length*.8))));
const mod=x=>(x+29)%29;
/** Exact feasible-phase and target-letter count maxima for every assigned key. */
function enumerate(a,q,visit){
 const full=(1<<q)-1,masks=new Int32Array(29).fill(full),K=new Int8Array(q).fill(-1);
 let nodes=0,leaves=0,maxE=0;const byWeight=new Array(q+1).fill(0);
 function feasible(){let p=full;for(const x of a){const v=p&masks[x];p=(((v<<1)|(v>>>(q-1)))&full)|(x===0?p:0);if(!p)return false}return true}
 function maxLetter(t){let d=new Int32Array(q),e=new Int32Array(q);for(const x of a){e.fill(-1000000);for(let j=0;j<q;j++){if(d[j]<0)continue;if(x===0)e[j]=Math.max(e[j],d[j]+(t===0));if(x!==K[j]){const k=(j+1)%q;e[k]=Math.max(e[k],d[j]+(mod(x-K[j])===t))}}[d,e]=[e,d]}return Math.max(...d)}
 function dfs(i){nodes++;if(!feasible())return;if(i===q){leaves++;byWeight[Array.from(K).filter(x=>x!==0).length]++;const e=maxLetter(18);maxE=Math.max(maxE,e);if(visit)visit(K,e);return}for(let v=0;v<29;v++){K[i]=v;masks[v]&=~(1<<i);dfs(i+1);masks[v]|=1<<i}K[i]=-1}
 dfs(0);return {nodes,leaves,byWeight,maxE};
}
/** Exact trigram MAP for a fixed key, all latent holds; history bits are the
 * two most recent consume decisions. Together with current phase these
 * uniquely determine the last two plaintext letters. */
function map(a,K,trace=false){
 const q=K.length,L=q*4;let d=new Float64Array(L).fill(-Infinity),e=new Float64Array(L);
 // All key rotations are already enumerated; canonical start phase 0.
 d[0]=0;const back=trace?new Int16Array(a.length*L).fill(-1):null;
 for(let i=0;i<a.length;i++){e.fill(-Infinity);const c=a[i];
  for(let j=0;j<q;j++)for(let h=0;h<4;h++){
   const s=j*4+h,v=d[s];if(v===-Infinity)continue;
   const l=h&1,m=(h>>1)&1;
   const b=i===0?0:l?mod(a[i-1]-K[(j+q-1)%q]):0;
   const aa=i<2?0:m?mod(a[i-2]-K[(j+2*q-l-1)%q]):0;
   function emit(p,k,cons){const t=k*4+((h*2+cons)&3);const score=v+(i===0?lm.uni[p]:i===1?lm.bi[b*29+p]:lm.tri[(aa*29+b)*29+p]);if(score>e[t]){e[t]=score;if(back)back[i*L+t]=s}}
   if(c===0)emit(0,j,0);
   if(c!==K[j])emit(mod(c-K[j]),(j+1)%q,1);
  }[d,e]=[e,d];
 }
 let end=0;for(let k=1;k<L;k++)if(d[k]>d[end])end=k;
 const score=d[end];if(!trace||score===-Infinity)return {score};
 const p=new Array(a.length);let s=end;for(let i=a.length-1;i>=0;i--){const j=s>>2,cons=s&1;p[i]=cons?mod(a[i]-K[(j+q-1)%q]):0;s=back[i*L+s];assert(s>=0)}
 assert.equal(s,0);assert(Math.abs(score-scorePlain(p,lm,3))<1e-7);
 let j=0;assert.deepEqual(p.map(x=>x===0?0:mod(x+K[j++%q])),a);
 return {score,p};
}
function minE(n){return Math.min(...donors.map(a=>{let e=0,m=Infinity;for(let i=0;i<a.length;i++){e+=+(a[i]===18);if(i>=n)e-=+(a[i-n]===18);if(i>=n-1)m=Math.min(m,e)}return m}))}
function attack(a,q,withMap){let best=-Infinity,key=null,scored=0;const e=enumerate(a,q,withMap?(K)=>{const z=map(a,K).score;scored++;if(z>best){best=z;key=Array.from(K)}}:null);const output={n:a.length,q,nativeMinE:minE(a.length),...e,scored};if(key){const r=map(a,key,true);output.best={key,score:best,perRune:best/a.length,p:r.p};}return output}
const original=[];for(let s=0;s<chap.length;s++)for(let q=2;q<=5;q++){const z=attack(chap[s],q,(s===0&&q===5)||(s===8&&q>=3));original.push({chapter:s,...z});console.log(JSON.stringify({type:"original",chapter:s,...z}))}
const late=chap[7].concat(chap[8]);for(let q=6;q<=8;q++){const z=attack(late,q,false);console.log(JSON.stringify({type:"late",...z}))}
const controls=[];for(const [s,n,q,key] of [[0,729,5,[3,12,23,5,27]],[1,308,5,[4,0,15,26,7]],[2,308,3,[11,20,6]],[2,308,4,[16,10,5,2]]]){
 const start=Math.floor(donors[s].length*.8)+123,plain=donors[s].slice(start,start+n);let j=0;const cipher=plain.map(x=>x===0?0:mod(x+key[j++%q]));const z=attack(cipher,q,true);
 const hits=z.best.p.reduce((a,b,i)=>a+(b===plain[i]),0);const exactKey=z.best.key.every((v,i)=>v===key[i]);console.log(JSON.stringify({type:"control",s,n,q,key,exactKey,hits,trueScore:scorePlain(plain,lm,3)/n,...z}));controls.push({exactKey,hits,n});
}
console.log(JSON.stringify({type:"complete",controls}));
