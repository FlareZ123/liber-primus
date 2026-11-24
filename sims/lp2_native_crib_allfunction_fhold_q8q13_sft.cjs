// All-function native crib transfer with real Fehu holds, no dictionary assumptions.
const fs=require('node:fs');
const gp=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const src=JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8'));
function experiment(gp,src,mode){
 const rune=new Map(gp.runes.map((x,i)=>[x,i]));
 const donors=src.sections.map(s=>({name:s.name,pt:Array.from(s.source_text).filter(c=>rune.has(c)).map(c=>rune.get(c))}));
 const ct=gp.pages.slice(0,56).flatMap(p=>p.indices);
 if(ct.length!==12956)throw Error("cipher length");
 /** @param {number[]} c @param {number} q @param {{name:string,pt:number[]}[]} ds */
 function scan(c,q,ds=donors){
   let stamp=0,max=0,best=null,at32=0,at40=0,at48=0,at80=0,knownPred=0;
   const seen=new Int32Array(29),val=new Int8Array(29),queue=new Int8Array(q);
   for(const d of ds){const p=d.pt;
   for(let a=0;a+q<p.length;a++){for(let b=0;b+q<c.length;b++){
     stamp++;let used=0,n=0,distinct=0,pred=0;const lim=Math.min(p.length-a,c.length-b);
     for(;n<lim;n++){
       const x=p[a+n],y=c[b+n];if(x===0){if(y!==0)break;continue;}
       if(used>=q){
         const u=queue[used%q],z=(y-x+29)%29;
         if(seen[u]===stamp){if(val[u]!==z)break;if(n>=48&&n<80)pred++;}
         else{if(n>=48)break;seen[u]=stamp;val[u]=z;distinct++;}
       }
       queue[used%q]=x;used++;
     }
     if(n>=32)at32++;if(n>=40)at40++;if(n>=48)at48++;if(n>=80){at80++;knownPred=Math.max(knownPred,pred);}
     if(n>max){max=n;best={donor:d.name,sourceOffset:a,targetOffset:b,phrase:p.slice(a,a+n).map(x=>gp.translit[x]).join(""),observedRows:distinct};}
   }}}
   return {q,max,best,at32,at40,at48,at80,knownPred,comparisons:stamp};
 }
 /** @param {number[]} p @param {number} q @param {number} seed */
 function plant(p,q,seed){
   const map=Array.from({length:29},(_,i)=>(i*i+7*i+seed)%29),primer=Array.from({length:q},(_,i)=>(3*i+seed)%29),queue=primer.slice();
   let cur=0;const cipher=p.map(x=>{if(x===0)return 0;const y=(x+queue[cur])%29;queue[cur]=map[x];cur=(cur+1)%q;return y;});
   return {cipher,map,primer};
 }
 /** Fit only the first 180 physical runes; every unknown holdout map row remains unknown. */
 function predict(p,q,seed){
   const {cipher,map,primer}=plant(p,q,seed),learned=new Int8Array(29).fill(-1),head=new Int8Array(q),recovered=[];
   let j=0,predicted=0,unknown=0,held=0,knownF=0;
   for(let i=0;i<p.length;i++){
     const x=p[i],y=cipher[i];
     if(!x){if(y!==0)throw Error("F");if(i>=180){knownF++;predicted++;}held++;continue;}
     if(j<q){recovered.push((y-x+29)%29);}
     else{const u=head[j%q],z=(y-x+29)%29;
       if(i<180){if(learned[u]>=0&&learned[u]!==z)throw Error("map conflict");learned[u]=z;}
       else if(learned[u]<0){unknown++;}
       else{if((x+learned[u])%29!==y)throw Error("prediction");predicted++;}
     }
     head[j%q]=x;j++;
   }
   if(recovered.some((x,i)=>x!==primer[i])||learned.some((x,i)=>x>=0&&x!==map[i]))throw Error("control recovery");
   return {q,seed,fit:180,holdout:p.length-180,predicted,unknown,knownF,totalF:held,recoveredRows:Array.from(learned).filter(x=>x>=0).length,primer:recovered};
 }
 if(mode==="controls"){
 const d=donors.find(d=>d.name==="0_welcome"),p=d.pt.slice(0,180);
 if(!p.includes(0))throw Error("no transparent Fehu control");
 return {development:[8,13].map(q=>scan(plant(p,q,3).cipher,q,[{name:d.name,pt:p}])),controls:[8,13].flatMap(q=>["0_koan_1","0_loss_of_divinity"].map((name,i)=>({name,...predict(donors.find(d=>d.name===name).pt.slice(100,340),q,17+i+q)})))};
 }
 if(mode==="q8"||mode==="q13")return scan(ct,Number(mode.slice(1)));
 if(mode.startsWith("null")){
 const j=Number(mode.slice(4))||1;let state=3301+j;function random(n){state=(Math.imul(state,1664525)+1013904223)>>>0;return state%n;}
 const a=ct.slice();for(let i=a.length-1;i>0;i--){const k=random(i+1);[a[i],a[k]]=[a[k],a[i]];}return scan(a,13);
 }
 throw Error("Use controls, q8, q13, null1, ...");
}
console.log(JSON.stringify(experiment(gp,src,process.argv[2]||'controls'),null,2));
