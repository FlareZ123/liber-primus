'use strict';
// Agent5: all-row ciphertext-only unknown chained Hill4 key recovery.
const fs=require('node:fs'),path=require('node:path');
function experiment(corpus,transcript,solved,lexicon){
 const Q=29,D=4,N=Q**D,check=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%Q+Q)%Q;
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const idx=new Map(corpus.runes.map((r,i)=>[r,i]));
 const words=[];let w=[];for(const c of transcript.split("%").slice(0,55).join("%")){if(idx.has(c))w.push(idx.get(c));else if(c!=="%"&&c!=="/"&&!/\s/u.test(c)&&w.length){words.push(w);w=[];}}if(w.length)words.push(w);
 const tape=words.flat();check(words.length===2896&&same(tape,corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices)),"original parse");
 const roles=ws=>ws.flatMap(w=>w.map((_,j)=>w.length===1?0:j===0?1:j===w.length-1?2:3));
 const allRoles=roles(words),offsets=[];let n=0;for(const w of words){offsets.push(n);n+=w.length;}
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),key=p=>String.fromCharCode(...p);
 function gp(s){s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");const p=[];while(s.length){const m=tokens.find(t=>s.startsWith(t.s));if(!m)return null;p.push(m.i);s=s.slice(m.s.length);}return p;}
 const counts=Array.from({length:4},()=>Array(Q).fill(1)),dict=new Set();
 for(const l of lexicon.split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(l);if(!m)continue;const p=gp(m[1]);if(!p)continue;dict.add(key(p));const weight=Math.sqrt(+m[2]);for(let j=0;j<p.length;j++){const role=p.length===1?0:j===0?1:j===p.length-1?2:3;counts[role][p[j]]+=weight;}}
 check(dict.size===29060,"lexicon");
 const log=counts.map(a=>{const s=a.reduce((a,b)=>a+b,0);return a.map(x=>Math.log(x/s));});
 function rank(A){const a=A.map(r=>r.slice());let k=0;for(let j=0;j<D&&k<a.length;j++){let i=k;while(i<a.length&&!a[i][j])i++;if(i===a.length)continue;[a[k],a[i]]=[a[i],a[k]];const inv=Array.from({length:Q},(_,z)=>z).find(z=>mod(z*a[k][j])===1);a[k]=a[k].map(x=>mod(x*inv));for(i=k+1;i<a.length;i++){const s=a[i][j];a[i]=a[i].map((x,l)=>mod(x-s*a[k][l]));}k++;}return k;}
 function inverse(A){const a=A.map((r,i)=>r.concat(Array.from({length:D},(_,j)=>+(i===j))));for(let j=0;j<D;j++){let i=j;while(i<D&&!a[i][j])i++;check(i<D,"singular");[a[j],a[i]]=[a[i],a[j]];let q=1;while(mod(a[j][j]*q)!==1)q++;a[j]=a[j].map(x=>mod(x*q));for(i=0;i<D;i++)if(i!==j){const s=a[i][j];a[i]=a[i].map((x,k)=>mod(x-s*a[j][k]));}}return a.map(r=>r.slice(D));}
 const mul=(A,v)=>A.map(r=>mod(r.reduce((s,a,j)=>s+a*v[j],0)));
 function encrypt(p,M){let prev=Array(D).fill(0),out=[];for(let i=0;i<p.length;i+=D){prev=mul(M,p.slice(i,i+D).map((v,j)=>mod(v+prev[j])));out.push(...prev);}return out;}
 function decrypt(c,R){let prev=Array(D).fill(0),out=[];for(let i=0;i<c.length;i+=D){const b=c.slice(i,i+D);out.push(...mul(R,b).map((v,j)=>mod(v-prev[j])));prev=b;}return out;}
 function rowOf(k){return [Math.floor(k/(Q**3)),Math.floor(k/(Q**2))%Q,Math.floor(k/Q)%Q,k%Q];}
 // Exact exhaustive row likelihood over all nonzero GF29^4 rows.
 // Top 64 per coordinate are enough to certify the global optimum when
 // they span GF29^4: for any three other independent rows, the best row
 // outside their span is in this list. No true-key oracle.
 function recover(c,r,train){
  check(train%D===0&&train<=c.length,"training length");
  const B=train/D-1,AB=new Uint8Array(Q*Q*B),CD=new Uint8Array(Q*Q*B),L=Array.from({length:D},()=>new Float64Array(B*Q));
  for(let i=0;i<B;i++){
   const j=(i+1)*D,x=c.slice(j,j+D);
   for(let a=0;a<Q;a++)for(let b=0;b<Q;b++){AB[(a*Q+b)*B+i]=(a*x[0]+b*x[1])%Q;CD[(a*Q+b)*B+i]=(a*x[2]+b*x[3])%Q;}
   for(let k=0;k<D;k++)for(let v=0;v<Q;v++)L[k][i*Q+v]=log[r[j+k]][mod(v-c[j-D+k])];
  }
  const [L0,L1,L2,L3]=L,top=Array.from({length:D},()=>[]);
  function offer(a,score,row){if(a.length===64&&score<=a[a.length-1].score)return;let j=a.length;while(j&&a[j-1].score<score)j--;a.splice(j,0,{score,row});if(a.length>64)a.pop();}
  for(let ab=0;ab<Q*Q;ab++)for(let cd=0;cd<Q*Q;cd++){
   if(ab===0&&cd===0)continue;
   let s0=0,s1=0,s2=0,s3=0,pa=ab*B,pb=cd*B;
   for(let i=0;i<B;i++){let v=AB[pa+i]+CD[pb+i];if(v>=Q)v-=Q;const q=i*Q+v;s0+=L0[q];s1+=L1[q];s2+=L2[q];s3+=L3[q];}
   const row=ab*Q*Q+cd;offer(top[0],s0,row);offer(top[1],s1,row);offer(top[2],s2,row);offer(top[3],s3,row);
  }
  const basis=top.map(a=>{const b=[];for(const x of a){const row=rowOf(x.row);if(rank(b.map(z=>z.vec).concat([row]))>b.length)b.push({...x,vec:row});if(b.length===D)break;}check(b.length===D,"top64 span");return b;});
  let best=null;
  for(const a of basis[0])for(const b of basis[1])for(const d of basis[2])for(const e of basis[3]){
   const rows=[a,b,d,e],R=rows.map(x=>x.vec),score=rows.reduce((n,x)=>n+x.score,0);
   if((!best||score>best.score)&&rank(R)===D)best={R,score};
  }
  check(best,"invertible key");const p=decrypt(c,best.R);check(same(encrypt(p,inverse(best.R)),c),"exact forward");
  function avg(a,b){let s=0;for(let i=a;i<b;i++)s+=log[r[i]][p[i]];return s/(b-a);}
  return {R:best.R,score:best.score/(train-D),independentUpper:top.reduce((s,a)=>s+a[0].score,0)/(train-D),holdout:avg(train,c.length),margins:top.map(a=>(a[0].score-a[1].score)/B),p};
 }
 const pageStart=corpus.pages.filter(p=>p.page<16).reduce((n,p)=>n+p.indices.length,0);
 const orig=corpus.pages.filter(p=>p.page>=16&&p.page<=22).flatMap(p=>p.indices),train=corpus.pages.filter(p=>p.page>=16&&p.page<=20).reduce((n,p)=>n+p.indices.length,0);
 check(orig.length===1744&&train===1340&&same(orig,tape.slice(pageStart,pageStart+orig.length)),"p16–22");
 const oRole=allRoles.slice(pageStart,pageStart+orig.length);
 const donor=solved.sections.flatMap(s=>(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(c=>idx.get(c)))),dp=donor.flat(),dr=roles(donor);
 function plant(seed,start){
  let x=seed>>>0;function rng(){x=(Math.imul(x,1664525)+1013904223)>>>0;return x;}
  let M;do{M=Array.from({length:D},()=>Array.from({length:D},()=>rng()%Q));}while(rank(M)<D);
  const p=dp.slice(start,start+orig.length),r=dr.slice(start,start+orig.length),c=encrypt(p,M),a=recover(c,r,train);
  return {seed,start,exactKey:same(a.R,inverse(M)),runes:p.length,correct:a.p.filter((v,i)=>v===p[i]).length,heldoutCorrect:a.p.slice(train).filter((v,i)=>v===p[train+i]).length,score:a.score,holdout:a.holdout,margins:a.margins};
 }
 const plants=[plant(5310,0),plant(5311,dp.length-orig.length)];
 const a=recover(orig,oRole,train);
 function lexRegion(from,to){const arr=words.map((w,i)=>({w,at:offsets[i]})).filter(({w,at})=>at>=pageStart+from&&at+w.length<=pageStart+to).map(({w,at})=>a.p.slice(at-pageStart,at-pageStart+w.length));return {words:arr.length,known:arr.filter(w=>dict.has(key(w))).length,long:arr.filter(w=>w.length>=5).length,longKnown:arr.filter(w=>w.length>=5&&dict.has(key(w))).length,sample:arr.slice(0,24).map(w=>w.map(x=>corpus.translit[x]).join("")).join(" ")};}
 return {plants,original:{R:a.R,score:a.score,independentUpper:a.independentUpper,holdout:a.holdout,margins:a.margins,train:lexRegion(D,train),test:lexRegion(train,orig.length)}};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"];
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
console.log(JSON.stringify(experiment(JSON.parse(read(paths[0])),read(paths[1]),JSON.parse(read(paths[2])),read(paths[3])),null,2));
