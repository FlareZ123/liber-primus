'use strict';
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
function scanAll(corpus,native,historical,mode="original"){
 const Q=29,TRAIN=96,HOLD=100,mod=x=>(x%Q+Q)%Q,idx=new Map(corpus.runes.map((x,i)=>[x,i])),tok=new Map(corpus.translit.map((x,i)=>[x,i]));
 function gp(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");while(w.length){const n=tok.has(w.slice(0,2))?2:1,v=tok.get(w.slice(0,n));if(v===undefined)throw Error(w);out.push(v);w=w.slice(n);}}return out;}
 const sources=native.sections.map(s=>({name:s.name,P:[...s.source_text].filter(x=>idx.has(x)).map(x=>idx.get(x)),kind:"native"}));
 historical.forEach((s,i)=>{if(i===4){const a=s.indexOf("*** START OF"),b=s.indexOf("*** END OF");if(a>=0&&b>a)s=s.slice(s.indexOf("\n",a)+1,b);}sources.push({name:["Liber AL I","Liber AL II","Liber AL III","Self-Reliance","Blake Marriage"][i],P:gp(s),kind:"historical"});});
 const C=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
 if(C.length!==12956)throw Error("source tape");
 const inv=new Uint8Array(Q);for(let a=1;a<Q;a++)for(let b=1;b<Q;b++)if(a*b%Q===1)inv[a]=b;
 function scan(cipher,src){
  const zeros=[];for(let i=0;i<cipher.length;i++)if(!cipher[i])zeros.push(i);
  const F=new Int16Array(Q*Q),R=new Int16Array(Q*Q),ft=new Uint32Array(Q*Q),rt=new Uint32Array(Q*Q),count=new Uint8Array(Q),p1=new Int8Array(Q),d1=new Int8Array(Q),a=new Int8Array(Q),b=new Int8Array(Q);
  let epoch=0,starts=0,alignments=0,zeroCompatible=0,repeatCompatible=0,permutationCompatible=0,affineCompatible=0;const hits=[];
  function put(p,q,d){const k=p*Q+q,j=p*Q+d;if(ft[k]===epoch&&F[k]!==d||rt[j]===epoch&&R[j]!==q)return false;ft[k]=epoch;F[k]=d;rt[j]=epoch;R[j]=q;return true;}
  const P=src.P,first=new Int16Array(Q*Q);
  for(let s=0;s+TRAIN+HOLD<=P.length;s++){
   const fs=[],edges=[];let prev=-1;for(let j=0;j<TRAIN;j++){const p=P[s+j];if(!p){fs.push(j);continue;}if(prev>=0)edges.push([P[s+prev],p,prev,j]);prev=j;}
   if(!fs.length)continue;starts++;const witness=[];first.fill(-1);for(let j=0;j<edges.length;j++){const [p,q]=edges[j],k=p*Q+q;if(first[k]>=0){witness.push([edges[first[k]],edges[j]]);if(witness.length>=6)break;}else first[k]=j;}
   const f=fs[0],max=cipher.length-TRAIN-HOLD;
   for(const z of zeros){const t=z-f;if(t<0||t>max)continue;alignments++;let ok=true;for(let j=1;j<fs.length;j++)if(cipher[t+fs[j]]){ok=false;break;}if(!ok)continue;zeroCompatible++;
    for(const [u,v] of witness)if(mod(cipher[t+u[3]]-cipher[t+u[2]])!==mod(cipher[t+v[3]]-cipher[t+v[2]])){ok=false;break;}if(!ok)continue;repeatCompatible++;
    epoch++;for(const [p,q,i,j] of edges)if(!put(p,q,mod(cipher[t+j]-cipher[t+i]))){ok=false;break;}if(!ok)continue;permutationCompatible++;
    count.fill(0);for(const [p,q,i,j] of edges){const d=mod(cipher[t+j]-cipher[t+i]);if(!count[p]){count[p]=1;p1[p]=q;d1[p]=d;}else if(count[p]===1){if(q!==p1[p]){a[p]=mod((d-d1[p])*inv[mod(q-p1[p])]);if(!a[p]){ok=false;break;}b[p]=mod(d-a[p]*q);count[p]=2;}}else if(mod(a[p]*q+b[p])!==d){ok=false;break;}}
    if(!ok)continue;affineCompatible++;
    let extended=0,teacherPredicted=0,teacherCorrect=0,holdValid=0,pr=prev;for(let j=TRAIN;j<TRAIN+HOLD;j++){const q=P[s+j];if(!q){if(cipher[t+j])break;holdValid++;extended++;continue;}const p=P[s+pr],d=mod(cipher[t+j]-cipher[t+pr]);if(count[p]===2){teacherPredicted++;teacherCorrect+=mod(a[p]*q+b[p])===d;}else if(count[p]===1&&q===p1[p]){teacherPredicted++;teacherCorrect+=d1[p]===d;}if(count[p]===2&&mod(a[p]*q+b[p])!==d||count[p]===1&&q===p1[p]&&d1[p]!==d||count[p]===1&&q!==p1[p]&&d1[p]===d)break;extended++;pr=j;}
    hits.push({s,t,rowsFixed:count.reduce((n,x)=>n+(x===2),0),extended,teacherPredicted,teacherCorrect,holdValid,keys:Array.from(count,(v,p)=>v===2?{p,a:a[p],b:b[p]}:null).filter(Boolean)});
   }
  }
  return {name:src.name,kind:src.kind,length:P.length,starts,alignments,zeroCompatible,repeatCompatible,permutationCompatible,affineCompatible,hits};
 }
 const start=Date.now();
 if(mode==="original")return {schema:1,scope:"Literal-F hold on both feedback registers; exact arbitrary-row permutation and affine-row constraints for source quotations with >=1 F in the 96-rune fitting span; 100 held runes reserved.",TRAIN,HOLD,sourceResults:sources.map(src=>scan(C,src)),elapsedMs:Date.now()-start};
 let seed=0x241127;function rnd(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n;}
 const controls=[];
 for(const src of [sources.find(x=>x.kind==="native"&&x.P.length>350),sources.find(x=>x.name==="Self-Reliance")]){
  if(!src)throw Error("control donor");let s=137;while(s+TRAIN+HOLD<src.P.length&&!src.P.slice(s,s+TRAIN).includes(0))s++;const P=src.P.slice(s,s+TRAIN+HOLD);if(P.length!==TRAIN+HOLD)throw Error("control window");
  const A=Array.from({length:Q},()=>1+rnd(28)),B=Array.from({length:Q},()=>rnd(Q)),target=177,plant=C.slice(0,1000);let prev=1,cv=plant[target-1];for(let j=0;j<P.length;j++){const q=P[j];if(!q){plant[target+j]=0;continue;}cv=mod(cv+A[prev]*q+B[prev]);plant[target+j]=cv;prev=q;}
  const result=scan(plant,src),hit=result.hits.find(x=>x.s===s&&x.t===target);if(!hit||hit.extended!==HOLD||hit.teacherCorrect!==hit.teacherPredicted||hit.keys.some(x=>x.a!==A[x.p]||x.b!==B[x.p]))throw Error("plant failure");
  controls.push({name:src.name,s,target,hit,summary:{...result,hits:undefined}});
 }
 return {schema:1,TRAIN,HOLD,controls,elapsedMs:Date.now()-start};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/external/2013-liber-al-bookcode-I.txt","resources/external/2013-liber-al-bookcode-II.txt","resources/external/2013-liber-al-bookcode-III.txt","resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt","resources/external/cicada2012-blake-marriage-gutenberg45315.txt"];
const data=paths.map(read);console.log(JSON.stringify(scanAll(JSON.parse(data[0]),JSON.parse(data[1]),data.slice(2),process.argv[2]||'original'),null,2));
