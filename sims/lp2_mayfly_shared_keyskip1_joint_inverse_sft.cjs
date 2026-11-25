"use strict";
const fs=require("node:fs");const path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function experiment(raw, config={}) {
  const gp=JSON.parse(raw[0]), solved=JSON.parse(raw[1]);
  const mod=x=>(x+29)%29, LOG=Math.log(29), s=.81288;
  const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
  function native(t){const a=[];for(const w of t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let j=0;j<w.length;){let q=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));if(!q)throw Error("native");a.push(q.i);j+=q.t.length;}}return a}
  const p57=solved.sections.find(x=>x.name==="p57_parable").source_text;
  const p57r=[...p57].map(x=>gp.runes.indexOf(x)).filter(x=>x>=0);
  const p57lat="PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE";
  // Verify original donor sizes; native spelling control is separate and literal.
  const donors=raw.slice(2).map(native);
  if(donors.map(x=>x.length).join(",")!=="62492,217106,321327")throw Error("donor size");
  const N=config.N||128,B=config.B||512;
  const pow=[1,29,841,24389,707281,20511149];
  const counts=Array.from({length:5},(_,k)=>k===4?new Map():new Uint32Array(pow[k+1]));
  const totals=Array.from({length:5},(_,k)=>new Uint32Array(pow[k]));
  function train(a){let h=0,l=0;for(const x of a){for(let k=0;k<=l;k++){const u=h%pow[k],v=u*29+x;totals[k][u]++;if(k===4)counts[k].set(v,(counts[k].get(v)||0)+1);else counts[k][v]++;}h=(h*29+x)%pow[4];l=Math.min(l+1,4);}}
  for(const a of donors)train(a.slice(0,Math.floor(a.length*.8)));
  const cache=new Map();
  function probs(h,l){const id=l*pow[4]+h;let p=cache.get(id);if(p)return p;p=new Float64Array(29);for(let x=0;x<29;x++){let z=1/29;for(let k=0;k<=l;k++){const u=h%pow[k],v=u*29+x,n=k===4?counts[k].get(v)||0:counts[k][v];z=(n+8*z)/(totals[k][u]+8);}p[x]=Math.log(z)+LOG;}cache.set(id,p);return p}
  function seeded(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}}
  function plant(P,seed,independent=false){const rng=seeded(seed), C=P.map(()=>[]), pos=[0,0,0], pend=[false,false,false], keys=[], masks=[];while(pos.some((x,j)=>x<P[j].length)){const k=Math.floor(rng()*29);let mask=0;keys.push(k);for(let j=0;j<3;j++){if(pos[j]===P[j].length)continue;const kj=independent?Math.floor(rng()*29):k,c=mod(P[j][pos[j]]+kj);if(!pend[j]&&pos[j]>0&&C[j].at(-1)===c&&rng()<s){pend[j]=true;mask|=1<<j;continue;}C[j].push(c);pos[j]++;pend[j]=false;}masks.push(mask);}return {C,keys,masks}}
  function replay(C,keys,masks){const p=[[],[],[]],i=[0,0,0],pending=[-1,-1,-1],skip=[0,0,0],h=[0,0,0],l=[0,0,0];let score=0;for(let t=0;t<keys.length;t++){const k=keys[t];score-=LOG;for(let j=0;j<3;j++){if(i[j]===C[j].length){if(masks[t]>>j&1)throw Error("skip after end");continue;}const isSkip=!!(masks[t]>>j&1),prev=i[j]?C[j][i[j]-1]:-1,next=C[j][i[j]];if(isSkip&&(!i[j]||pending[j]>=0))throw Error("illegal skip");const x=isSkip?mod(prev-k):mod(next-k);if(pending[j]>=0){if(x!==pending[j]||isSkip)throw Error("pending mismatch");pending[j]=-1;}else{score+=probs(h[j],l[j])[x];h[j]=(h[j]*29+x)%pow[4];l[j]=Math.min(l[j]+1,4);if(isSkip){pending[j]=x;skip[j]++;score+=Math.log(s);}else if(next===prev)score+=Math.log(1-s);p[j].push(x);}if(!isSkip){if(mod(x+k)!==next)throw Error("replay");i[j]++;}else if(mod(x+k)!==prev)throw Error("rejected replay");}}if(i.some((x,j)=>x!==C[j].length)||pending.some(x=>x>=0))throw Error("unfinished");return {p,score,skip}}
  function decode(C,oracle=null){const n=C[0].length, cap=Math.ceil(n/16), maxTick=n+cap;let beam=[{i:[0,0,0],h:[0,0,0],pending:[-1,-1,-1],score:0,node:null}],best=null,retained=0,explored=0;
    for(let t=0;t<maxTick&&beam.length;t++){const cand=[];for(const st of beam){let force=-1,valid=true;for(let j=0;j<3;j++)if(st.pending[j]>=0){const x=mod(C[j][st.i[j]]-st.pending[j]);if(force>=0&&force!==x){valid=false;break;}force=x;}if(!valid)continue;
      const pd=st.h.map((h,j)=>probs(h,Math.min(4,st.i[j]+(st.pending[j]>=0?1:0))));
      for(let k=force<0?0:force;k<=(force<0?28:force);k++){const ops=[[],[],[]];for(let j=0;j<3;j++){let i=st.i[j],h=st.h[j],p=st.pending[j];if(i===n){ops[j].push([i,h,-1,0,0]);continue;}const next=C[j][i],prev=i?C[j][i-1]:-1,x=mod(next-k),held=p>=0;
          if(!held||x===p)ops[j].push([i+1,held?h:(h*29+x)%pow[4],-1,held?0:pd[j][x]+(next===prev?Math.log(1-s):0),0]);
          if(!held&&i>0&&t-i<cap){const q=mod(prev-k);ops[j].push([i,(h*29+q)%pow[4],q,pd[j][q]+Math.log(s),1<<j]);}
        }
        for(const a of ops[0])for(const b of ops[1])for(const c of ops[2]){const mask=a[4]|b[4]|c[4];if(oracle&&mask!==oracle[t])continue;const ns={i:[a[0],b[0],c[0]],h:[a[1],b[1],c[1]],pending:[a[2],b[2],c[2]],score:st.score-LOG+a[3]+b[3]+c[3],node:{parent:st.node,k,mask}};explored++;if(ns.i.every(x=>x===n)){if(!best||ns.score>best.score)best=ns;}else cand.push(ns);}
      }}
      cand.sort((a,b)=>b.score-a.score);const seen=new Set();beam=[];for(const q of cand){const id=q.i.join(",")+"|"+q.h.join(",")+"|"+q.pending.join(",");if(seen.has(id))continue;seen.add(id);beam.push(q);if(beam.length===B)break;}retained+=beam.length;
    }
    if(!best)return {ok:false,explored,retained};const keys=[],masks=[];for(let p=best.node;p;p=p.parent){keys.push(p.k);masks.push(p.mask);}keys.reverse();masks.reverse();const v=replay(C,keys,masks);if(Math.abs(v.score-best.score)>1e-7)throw Error("score mismatch "+v.score+" "+best.score);return {ok:true,...v,keys,masks,explored,retained}
  }
  const results=[];
  for(let q=0;q<(config.trials||4);q++){const P=donors.map((a,j)=>a.slice(Math.floor(a.length*.82)+q*1027+j*71,Math.floor(a.length*.82)+q*1027+j*71+N));const planted=plant(P,0xBAAD1200+q),tr=replay(planted.C,planted.keys,planted.masks);if(tr.p.some((a,j)=>a.some((x,i)=>x!==P[j][i])))throw Error("plant replay mismatch");const d=decode(planted.C);const match=d.ok?d.p.map((a,j)=>a.filter((x,i)=>x===P[j][i]).length):[0,0,0];const item={q,N,B,trueSkip:tr.skip,trueScore:tr.score,score:d.score,match,decodedSkip:d.skip,explored:d.explored,retained:d.retained,pass:match.every(x=>x>=.8*N)};if(q===0&&!item.pass){const o=decode(planted.C,planted.masks);item.oracle={match:o.ok?o.p.map((a,j)=>a.filter((x,i)=>x===P[j][i]).length):[0,0,0],score:o.score,explored:o.explored};}results.push(item)}
  return {config:{N,B,s,skipCap:Math.ceil(N/16),training:"first 80% of each donor, order 4 interpolated Dirichlet alpha 8"},p57Control:p57r.length,results,gate:results.length>=4&&results.filter(x=>x.pass).length>=3,cache:cache.size};
}
const args={N:128,B:512,trials:4};
const result=experiment(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")),args);console.log(JSON.stringify(result,null,2));
