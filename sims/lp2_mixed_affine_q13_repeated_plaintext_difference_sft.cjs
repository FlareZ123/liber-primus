'use strict';
const fs=require('node:fs');
const path=require('node:path');
function experiment(corpus,native){
 const Q=13,L=30,M=29;
 const inv=Array.from({length:M},(_,x)=>x?Array.from({length:M},(_,y)=>y).find(y=>x*y%M===1):0);
 const mod=x=>((x%M)+M)%M;
 const assert=(v,s)=>{if(!v)throw Error(s)};
 const index=new Map(corpus.runes.map((x,i)=>[x,i]));
 const sections=native.sections.map(s=>({name:s.name,p:[...s.source_text].filter(x=>index.has(x)).map(x=>index.get(x))}));
 const original=corpus.pages.slice(0,56).flatMap(p=>p.indices);
 /** Exhaust every physical start-pair and every shared F hold subset in a 30-rune window.
  * For nonholding lanes, use a linear diagonal scan. For nonempty hold masks,
  * only windows touching a shared zero need examination.
  */
 function scan(c){
   const N=c.length,D=new Int8Array(N),active=new Int8Array(L);
   let pairs=0,nohold=0,holdWindows=0,holdMasks=0,holdHits=0,maxNoHold=0;
   const hits=[];
   for(let delta=1;delta<=N-L;delta++){
     const len=N-delta,shared=[];
     for(let i=0;i<len;i++){D[i]=(c[i]-c[i+delta]+M)%M;if(c[i]===0&&c[i+delta]===0)shared.push(i);}
     pairs+=len-L+1;
     let start=Q,b=-1,lastSpecific=Q-1;
     for(let i=Q;i<len;i++){
       const x=D[i-Q],y=D[i];
       if((x===0)!==(y===0)){start=i+1;b=-1;lastSpecific=i;continue;}
       if(x!==0){const r=y*inv[x]%M;
         if(b!==-1&&b!==r)start=lastSpecific+1;
         b=r;lastSpecific=i;
       }
       const n=i-start+1+Q;
       if(n>maxNoHold)maxNoHold=n;
       if(n>=L){nohold++;if(hits.length<1000)hits.push({a:i-L+1,b:i-L+1+delta,slope:b,holds:[],active:L});}
     }
     // Union of the start intervals within L-1 positions of each shared zero.
     let last=-1;
     for(const z of shared){
       const lo=Math.max(0,z-L+1,last+1),hi=Math.min(z,len-L);
       for(let a=lo;a<=hi;a++){
         holdWindows++;
         const zpos=[];
         for(let j=a;j<a+L;j++)if(c[j]===0&&c[j+delta]===0)zpos.push(j-a);
         assert(zpos.length<31,"too many simultaneous zeros for integer mask");
         const bitpos=new Int8Array(L).fill(-1);
         zpos.forEach((v,i)=>bitpos[v]=i);
         for(let m=1;m<(1<<zpos.length);m++){
           holdMasks++;
           let n=0,bb=-1,ok=true;
           for(let i=0;i<L;i++){
             const k=bitpos[i];if(k>=0&&(m&(1<<k)))continue;
             const y=D[a+i];active[n]=y;
             if(n>=Q){const x=active[n-Q];
               if((x===0)!==(y===0)){ok=false;break;}
               if(x!==0){const r=y*inv[x]%M;if(bb!==-1&&bb!==r){ok=false;break;}bb=r;}
             }n++;
           }
           if(ok&&n>Q){holdHits++;if(hits.length<1000)hits.push({a,b:a+delta,slope:bb,holds:zpos.filter((_,i)=>m&(1<<i)),active:n});}
         }
       }
       last=Math.max(last,hi);
     }
   }
   return {pairs,nohold,holdWindows,holdMasks,holdHits,maxNoHold,hits};
 }
 let seed=0x6b3301;const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
 const rr=n=>rand()%n;
 function encrypt(p,key,forceZero){
   const X=Array.from({length:Q},()=>1+rr(28)),C=Array.from({length:Q},()=>rr(29));const out=[];
   let t=0;
   for(const z of p){
     if(!z){out.push(0);continue;}
     const x=key.u*z%M;
     if(t===0&&forceZero)C[0]=mod((-x-key.a*X[0]-key.d)*inv[key.b]);
     const y=mod(x+key.a*X.shift()+key.b*C.shift()+key.d);out.push(y);X.push(x);C.push(y);t++;
   }return out;
 }
 const repeats=[];
 for(const s of sections){
   let best={length:0,a:0,b:0};
   for(let a=0;a<s.p.length;a++)for(let b=a+1;b<s.p.length;b++){
     let n=0;while(n<b-a&&b+n<s.p.length&&s.p[a+n]===s.p[b+n])n++;
     if(n>best.length)best={length:n,a,b};
   }
   repeats.push({name:s.name,...best});
 }
 const best=repeats.reduce((a,b)=>a.length>=b.length?a:b);
 assert(best.length>=L,"no natural repeated native quote");
 const src=sections.find(s=>s.name===best.name);
 const controls=[];
 for(let i=0;i<6;i++){
   const p=i<3?src.p.slice(best.a,best.a+best.length):sections[1].p.slice(30,95);
   const k={u:1+rr(28),a:1+rr(28),b:1+rr(28),d:rr(29)};
   const A=encrypt(p,k,i>=3),B=encrypt(p,k,i>=3);
   const c=[...A,...Array.from({length:17},()=>rr(29)),...B],offset=A.length+17;
   const res=scan(c),trueHolds=p.slice(0,L).flatMap((v,j)=>v===0?[j]:[]);
   const found=res.hits.some(h=>h.a===0&&h.b===offset&&h.slope===k.b&&JSON.stringify(h.holds)===JSON.stringify(trueHolds));
   assert(found,"shared-phrase control not recovered "+i);
   controls.push({i,source:i<3?best.name:"0_welcome",length:p.length,slope:k.b,trueHolds,ordinarySharedZero:A[0]===0&&B[0]===0&&p[0]!==0,found,hitCount:res.nohold+res.holdHits});
 }
 const result=scan(original);
 assert(result.pairs===(original.length-L+1)*(original.length-L)/2,"pair coverage");
 return {q:Q,physicalLength:L,nativeRepeats:repeats,controls,original:result};
}
const root=path.join(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
console.log(JSON.stringify(experiment(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
