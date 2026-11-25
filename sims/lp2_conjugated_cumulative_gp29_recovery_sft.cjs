'use strict';
/** Original ciphertext conjugated cumulative addition, spacing-free blind recovery. */
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function experiment(gp,em,gi){
 const m=29,L=m*m*m,mod=n=>(n+29)%29;
 let seed=0x33019abc; const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296}, ri=n=>Math.floor(rnd()*n);
 const enc=s=>{const out=[];let tok=gp.translit.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3;continue}if(w.startsWith("IO",i)){out.push(27);i+=2;continue}let t=tok.find(x=>w.startsWith(x[0],i));if(!t)throw Error(w);out.push(t[1]);i+=t[0].length}}return out};
 const training=enc(em), donor=enc(gi), ct=gp.pages.filter(p=>p.page>=16&&p.page<=22).flatMap(p=>p.indices);
 if(ct.length!==1744)throw Error("source length");
 const uni=new Float64Array(m), bi=new Float64Array(m*m), tri=new Float64Array(L), bic=new Float64Array(m*m), uc=new Float64Array(m);
 for(let i=0;i<training.length;i++){let c=training[i];uni[c]++;if(i){let b=training[i-1];bi[b*m+c]++;uc[b]++}if(i>1){let a=training[i-2],b=training[i-1];tri[(a*m+b)*m+c]++;bic[a*m+b]++}}
 const score=new Float64Array(L);for(let a=0;a<m;a++)for(let b=0;b<m;b++)for(let c=0;c<m;c++){const k=(a*m+b)*m+c;let p1=(uni[c]+0.5)/(training.length+14.5),p2=(bi[b*m+c]+20*p1)/(uc[b]+20),p3=(tri[k]+35*p2)/(bic[a*m+b]+35);score[k]=Math.log(p3)}
 const repeat=ct.slice(1).filter((x,i)=>x===ct[i]).length;
 const anchors=[...uni.keys()].sort((a,b)=>Math.abs(uni[a]/training.length-repeat/(ct.length-1))-Math.abs(uni[b]/training.length-repeat/(ct.length-1))).slice(0,2);
 const perm=()=>{let p=Array.from({length:m},(_,i)=>i);for(let i=m-1;i>0;i--){let j=ri(i+1);[p[i],p[j]]=[p[j],p[i]]}return p};
 const decode=(c,p,b)=>c.slice(1).map((v,i)=>mod(p[v]-p[c[i]]+b));
 const evaluate=(c,p,b,l,h)=>{let v=decode(c,p,b),s=0;for(let i=Math.max(2,l);i<h;i++)s+=score[(v[i-2]*m+v[i-1])*m+v[i]];return s/(h-Math.max(2,l))};
 const encrypt=(p,key,b,iv=7)=>{let inv=[];key.forEach((v,i)=>inv[v]=i);let out=[iv];for(let x of p)out.push(inv[mod(key[out.at(-1)]+x-b)]);return out};
 const solve=(c,b,steps=30000,restarts=4)=>{const n=Math.floor((c.length-1)*.7), train=c.slice(0,n+1), ends=[];for(let j=3;j<train.length;j++)ends.push(j);
   const inc=Array.from({length:m},()=>[]);for(let j of ends){let seen=new Set(train.slice(j-3,j+1));for(let x of seen)inc[x].push(j)}
   let best=-Infinity,bestKey=null, runs=[];
   for(let r=0;r<restarts;r++){let p=perm(), cache=new Float64Array(train.length),stamp=new Int32Array(train.length),seenId=0;
    const term=j=>{let a=mod(p[train[j-2]]-p[train[j-3]]+b),d=mod(p[train[j-1]]-p[train[j-2]]+b),e=mod(p[train[j]]-p[train[j-1]]+b);return score[(a*m+d)*m+e]};
    let s=0;for(let j of ends){cache[j]=term(j);s+=cache[j]}let local=s, key=p.slice();
    const affected=new Int32Array(train.length), newvals=new Float64Array(train.length);
    for(let it=0;it<steps;it++){let x=ri(m),y=ri(m-1);if(y>=x)y++;[p[x],p[y]]=[p[y],p[x]];seenId++;let count=0,delta=0;
      for(let j of inc[x]){stamp[j]=seenId;affected[count++]=j}
      for(let j of inc[y])if(stamp[j]!==seenId)affected[count++]=j;
      for(let k=0;k<count;k++){let j=affected[k],v=term(j);newvals[k]=v;delta+=v-cache[j]}
      let temp=20*Math.pow(.0125,it/steps);
      if(delta>=0||rnd()<Math.exp(delta/temp)){s+=delta;for(let k=0;k<count;k++)cache[affected[k]]=newvals[k];if(s>local){local=s;key=p.slice()}}
      else [p[x],p[y]]=[p[y],p[x]];
    }
    runs.push(local/(n-2));if(local>best){best=local;bestKey=key}
   }
   let d=decode(c,bestKey,b), rr=encrypt(d,bestKey,b,c[0]);if(rr.some((x,i)=>x!==c[i]))throw Error("replay");
   return {train:best/(n-2),holdout:evaluate(c,bestKey,b,n,c.length-1),key:bestKey,preview:d.slice(n,n+100).map(i=>gp.translit[i]).join(""),restarts:runs,decoded:d,cut:n};
 };
 const summarize=({decoded,...x})=>x;
 const results={sourceLength:ct.length,anchorRates:anchors.map(b=>[gp.translit[b],uni[b]/training.length]),nativeTraining:training.length,originalRepeatCount:repeat,tests:[],nulls:[],fresh:[]};
 for(let b of anchors){const truth=donor.slice(10000,10000+ct.length-1), secret=perm(), plant=encrypt(truth,secret,b);let pos=solve(plant,b),orig=solve(ct,b);let match=pos.decoded.slice(pos.cut).filter((x,i)=>x===truth[pos.cut+i]).length;results.tests.push({b,plant:{...summarize(pos),holdoutMatches:match,holdoutN:truth.length-pos.cut,trueTrain:evaluate(plant,secret,b,0,pos.cut),trueHoldout:evaluate(plant,secret,b,pos.cut,truth.length)},original:summarize(orig)})}
 // A null with the exact original equality mask, and a disjoint native passage.
 // These follow the original two pre-existing tests; their RNG draws do not alter them.
 for(let b of anchors){
   let nullCt=[ri(m)];for(let i=1;i<ct.length;i++){let prev=nullCt.at(-1);if(ct[i]===ct[i-1])nullCt.push(prev);else{let v=ri(m-1);nullCt.push(v>=prev?v+1:v)}}
   results.nulls.push({b,...summarize(solve(nullCt,b))});
   let truth=donor.slice(30000,30000+ct.length-1),secret=perm(),plant=encrypt(truth,secret,b);let pos=solve(plant,b);
   results.fresh.push({b,...summarize(pos),holdoutMatches:pos.decoded.slice(pos.cut).filter((x,i)=>x===truth[pos.cut+i]).length,holdoutN:truth.length-pos.cut,trueHoldout:evaluate(plant,secret,b,pos.cut,truth.length)});
 }
 return results;
}
console.log(JSON.stringify(experiment(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/control/emerson_essays_2944.txt'),read('resources/control/gibran_prophet_58585.txt')),null,2));
