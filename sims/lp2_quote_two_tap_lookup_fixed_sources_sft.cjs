'use strict';
const q=29,mod=x=>((x%29)+29)%29,inv=x=>{for(let i=1;i<29;i++)if(mod(x*i)===1)return i;throw Error("inverse")},check=(x,m)=>{if(!x)throw Error(m)};
 const Q=29,sz=58;
 class State {
  constructor(copy){this.p=copy?copy.p.slice():Array.from({length:sz},(_,i)=>i);this.s=copy?copy.s.slice():Array(sz).fill(1);this.d0=copy?copy.d0.slice():Array(sz).fill(0);this.d1=copy?copy.d1.slice():Array(sz).fill(0);this.a=copy?copy.a:null;this.log=[]}
  find(i){let x=0,y=0;while(this.p[i]!==i){x+=this.d0[i];y+=this.d1[i];i=this.p[i]}return [i,mod(x),mod(y)]}
  push(u,v,c,p){const [ru,x,y]=this.find(u),[rv,z,w]=this.find(v+29);const b=mod(c-x+z),m=mod(-p-y+w);
   if(ru===rv){if(!m)return b===0;const a=mod(-b*inv(m));if(a===0||this.a!==null&&a!==this.a)return false;if(this.a===null){this.log.push(["a",null]);this.a=a}return true}
   let i=ru,j=rv,d=b,e=m;if(this.s[i]>this.s[j]){[i,j]=[j,i];d=mod(-d);e=mod(-e)}
   this.log.push(["u",i,j,this.s[j]]);this.p[i]=j;this.d0[i]=d;this.d1[i]=e;this.s[j]+=this.s[i];return true
  }
  undo(n){while(this.log.length>n){const [t,i,j,s]=this.log.pop();if(t==="a")this.a=i;else{this.p[i]=i;this.d0[i]=this.d1[i]=0;this.s[j]=s}}}
  predict(u,v,p){const [ru,x,y]=this.find(u),[rv,z,w]=this.find(v+29);if(ru!==rv)return null;const m=mod(y-w+p);return m&&this.a===null?null:mod(x-z+m*(this.a??1))}
  accepts(a,H,J){if(this.a!==null&&this.a!==a)return false;const X=H.concat(J.map(v=>mod(-v)));return this.p.every((par,i)=>mod(X[i]-X[par]-this.d0[i]-this.d1[i]*a)===0)}
  witness(){const a=this.a??1;const X=this.p.map((_,i)=>{const [r,x,y]=this.find(i);return mod(x+y*a)});return {a,H:X.slice(0,29),J:X.slice(29).map(x=>mod(-x))}}
  rank(){return this.p.filter((p,i)=>p!==i).length+(this.a===null?0:1)}
 }

function fit(P,C,hold){
 const st=new State();let u=0,v=0,n=0;
 for(let i=0;i<C.length;i++){const p=P[i];if(hold&&p===0){if(C[i]!==0)return null;continue}if(n++>=2&&!st.push(u,v,C[i],p))return null;v=u;u=p}
 return {st,u,v};
}
function scan(all,C,hold,truth=null){const prefix=[],full=[];
 for(const x of all){const f=fit(x.P,C.slice(0,80),hold);if(!f)continue;let u=f.u,v=f.v,forced=0,contradiction=false;const pred=[];
  for(let i=80;i<160;i++){const p=x.P[i],c=hold&&p===0?0:f.st.predict(u,v,p);pred.push(c);if(c!==null){forced++;if(c!==C[i])contradiction=true}if(!hold||p!==0){v=u;u=p}}
  const rec={name:x.name,start:x.start,rank:f.st.rank(),slope:f.st.a,forced,contradiction,truth:truth?x.name===truth.name&&x.start===truth.start&&f.st.accepts(truth.k.a,truth.k.H,truth.k.J):null};
  prefix.push(rec);
  if(contradiction)continue;const z=fit(x.P,C,hold);if(!z)continue;const k=z.st.witness();let h=0,j=0,n=0;
  for(let i=0;i<C.length;i++){const p=x.P[i];if(hold&&p===0){check(C[i]===0,"hold replay");continue}if(n++>=2)check(mod(k.a*p+k.H[h]+k.J[j])===C[i],"internal replay");j=h;h=p}
  full.push({...rec,pred,plain:x.P,k,fullRank:z.st.rank(),trueKey:truth?z.st.accepts(truth.k.a,truth.k.H,truth.k.J):null})
 }return {prefix,full};
}
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
function run(sources,C,seed){
 const all=sources.flatMap(s=>s.candidates);const random=rng(seed),r=()=>Math.floor(random()*29),controls=[],nulls=[];
 const nonempty=sources.filter(s=>s.candidates.length);
 for(const s of [nonempty[0],nonempty.at(-1)]){for(const hold of [false,true]){
  const x=s.candidates[Math.floor(random()*s.candidates.length)],k={a:1+Math.floor(random()*28),H:Array.from({length:29},r),J:Array.from({length:29},r),entry:[r(),r()]};let [u,v]=k.entry;
  const synth=x.P.map(p=>{if(hold&&p===0)return 0;const y=mod(k.a*p+k.H[u]+k.J[v]);v=u;u=p;return y});
  const truth={...x,k},t=scan(all,synth,hold,truth);const f=t.full.filter(z=>z.name===x.name&&z.start===x.start&&z.trueKey);
  controls.push({hold,name:x.name,start:x.start,prefix:t.prefix.length,full:t.full.length,trueRetained:f.length===1,forced:f[0]?.forced,allTrueSource:t.full.every(z=>z.name===x.name&&z.start===x.start)});
  const z=scan(all,Array.from({length:160},r),hold);nulls.push({hold,prefix:z.prefix.length,full:z.full.length});
 }}
 const gate=controls.every(c=>c.trueRetained&&c.forced>=40&&c.allTrueSource)&&nulls.every(c=>c.full===0);
 return {sources:sources.map(s=>({name:s.name,candidates:s.candidates.length})),total:all.length,gate,controls,nulls,original:gate?[false,true].map(hold=>({hold,...scan(all,C,hold)})):null};
}
module.exports={run,fit,scan};
if(require.main===module){
 const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),root=path.join(__dirname,'..');
 const {MANIFEST,parse}=require('./lp2_quote_joint_additional_sources_sft.cjs');
 const folder=process.argv[2];check(folder,'provide frozen source directory, filenames as in MANIFEST');
 const gp=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
 const oe=JSON.parse(fs.readFileSync(path.join(root,'resources/control/beowulf_oe_gp_profile_corrected.json'),'utf8'));
 const C=gp.pages.filter(p=>p.page<=55).sort((a,b)=>a.page-b.page).flatMap(p=>p.indices).slice(10279,10439);
 const batches=[];for(let start=0;start<MANIFEST.length;start+=8){const sources=MANIFEST.slice(start,start+8).map(m=>{const raw=fs.readFileSync(path.join(folder,path.basename(m.file)));check(crypto.createHash('sha1').update('blob '+raw.length+String.fromCharCode(0)).update(raw).digest('hex')===m.sha,'source drift '+m.name);return parse(raw.toString('utf8'),m,gp,oe)});batches.push(run(sources,C,0x29d0b4+start))}
 console.log(JSON.stringify(batches,null,2));
}
