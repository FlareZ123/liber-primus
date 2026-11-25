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
  if(native(p57lat).join(",")!==p57r.join(","))throw Error("p57 spelling control");
  const donors=raw.slice(2).map(native);
  if(donors.map(x=>x.length).join(",")!=="62492,217106,321327")throw Error("donor size");
  const N=201,B=512,T=5;
  const pow=[1,29,841,24389,707281,20511149];
  const counts=Array.from({length:5},(_,k)=>k===4?new Map():new Uint32Array(pow[k+1]));
  const totals=Array.from({length:5},(_,k)=>new Uint32Array(pow[k]));
  function train(a){let h=0,l=0;for(const x of a){for(let k=0;k<=l;k++){const u=h%pow[k],v=u*29+x;totals[k][u]++;if(k===4)counts[k].set(v,(counts[k].get(v)||0)+1);else counts[k][v]++;}h=(h*29+x)%pow[4];l=Math.min(l+1,4);}}
  for(const a of donors)train(a.slice(0,Math.floor(a.length*.8)));
  const cache=new Map();
  function probs(h,l){const id=l*pow[4]+h;let p=cache.get(id);if(p)return p;p=new Float64Array(29);for(let x=0;x<29;x++){let z=1/29;for(let k=0;k<=l;k++){const u=h%pow[k],v=u*29+x,n=k===4?counts[k].get(v)||0:counts[k][v];z=(n+8*z)/(totals[k][u]+8);}p[x]=Math.log(z)+LOG;}cache.set(id,p);return p}
  function seeded(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}}
function plant(P,seed,independent=false){
  const rng=seeded(seed),C=P.map(()=>[]),pos=Array(T).fill(0),pend=Array(T).fill(false),keys=[],masks=[],holds=[];
  while(pos.some((x,j)=>x<P[j].length)){
    const z=Array(T).fill(0);
    for(let j=0;j<T;j++)while(!pend[j]&&pos[j]<P[j].length&&P[j][pos[j]]===0){C[j].push(0);pos[j]++;z[j]++;}
    holds.push(z);
    if(pos.every((x,j)=>x===P[j].length)){keys.push(-1);masks.push(0);break;}
    const k=Math.floor(rng()*29);let mask=0;keys.push(k);
    for(let j=0;j<T;j++){
      if(pos[j]===P[j].length)continue;
      const kj=independent?Math.floor(rng()*29):k,c=mod(P[j][pos[j]]+kj);
      if(!pend[j]&&pos[j]>0&&C[j].at(-1)===c&&rng()<s){pend[j]=true;mask|=1<<j;continue;}
      C[j].push(c);pos[j]++;pend[j]=false;
    }
    masks.push(mask);
  }
  return {C,keys,masks,holds}
}
function replay(C,keys,masks,holds){
  const p=Array.from({length:T},()=>[]),i=Array(T).fill(0),pending=Array(T).fill(-1),skip=Array(T).fill(0),holdCount=Array(T).fill(0),h=Array(T).fill(0),l=Array(T).fill(0);let score=0;
  function letter(j,x){score+=probs(h[j],l[j])[x];h[j]=(h[j]*29+x)%pow[4];l[j]=Math.min(l[j]+1,4);p[j].push(x);}
  for(let t=0;t<keys.length;t++){
    const k=keys[t];
    for(let j=0;j<T;j++)for(let a=0;a<holds[t][j];a++){
      if(pending[j]>=0||C[j][i[j]]!==0)throw Error("illegal literal F");
      letter(j,0);i[j]++;holdCount[j]++;
    }
    if(k===-1){if(i.some((x,j)=>x!==C[j].length)||masks[t])throw Error("illegal terminal holds");continue;}
    if(i.every((x,j)=>x===C[j].length))throw Error("unused key");
    score-=LOG;
    for(let j=0;j<T;j++){
      if(i[j]===C[j].length){if(masks[t]>>j&1)throw Error("skip after end");continue;}
      const isSkip=!!(masks[t]>>j&1),prev=i[j]?C[j][i[j]-1]:-1,next=C[j][i[j]];
      if(isSkip&&(!i[j]||pending[j]>=0))throw Error("illegal skip");
      const x=isSkip?mod(prev-k):mod(next-k);if(x===0)throw Error("consuming plaintext F");
      if(pending[j]>=0){if(x!==pending[j]||isSkip)throw Error("pending mismatch");pending[j]=-1;}
      else{letter(j,x);if(isSkip){pending[j]=x;skip[j]++;score+=Math.log(s);}else if(next===prev)score+=Math.log(1-s);}
      if(!isSkip){if(mod(x+k)!==next)throw Error("replay");i[j]++;}
      else if(mod(x+k)!==prev)throw Error("rejected replay");
    }
  }
  if(i.some((x,j)=>x!==C[j].length)||pending.some(x=>x>=0))throw Error("unfinished");
  return {p,score,skip,holdCount}
}

  // The same bounded top-B heap, now with latent literal-F prefixes.
  function decode(C){
    const n=C[0].length,cap=Math.ceil(n/16),empty=()=>Array(T).fill(0);
    let beam=[{i:empty(),h:empty(),pending:Array(T).fill(-1),sk:empty(),score:0,node:null}],best=null,retained=0,explored=0,pruned=0;
    for(let t=0;t<=n+cap&&beam.length;t++){
      const heap=[],loc=new Map();
      function swap(a,b){[heap[a],heap[b]]=[heap[b],heap[a]];loc.set(heap[a].id,a);loc.set(heap[b].id,b);}
      function up(a){while(a){const p=(a-1)>>1;if(heap[p].score<=heap[a].score)break;swap(a,p);a=p;}}
      function down(a){for(;;){let b=2*a+1;if(b>=heap.length)break;if(b+1<heap.length&&heap[b+1].score<heap[b].score)b++;if(heap[a].score<=heap[b].score)break;swap(a,b);a=b;}}
      function put(q){
        const id=q.i.join(",")+"|"+q.h.join(",")+"|"+q.pending.join(",")+"|"+q.sk.join(","),a=loc.get(id);q.id=id;
        if(a!==undefined){if(heap[a].score>=q.score)return;heap[a]=q;down(a);return;}
        if(heap.length<B){loc.set(id,heap.length);heap.push(q);up(heap.length-1);}
        else if(q.score>heap[0].score){loc.delete(heap[0].id);heap[0]=q;loc.set(id,0);down(0);}
      }
      const cutoff=()=>heap.length<B?-Infinity:heap[0].score;
      beam.sort((a,b)=>b.score-a.score);
      for(const st of beam){
        let force=-1,valid=true;
        for(let j=0;j<T;j++)if(st.pending[j]>=0){const x=mod(C[j][st.i[j]]-st.pending[j]);if(force>=0&&force!==x){valid=false;break;}force=x;}
        if(!valid)continue;
        const prefixes=st.i.map((i,j)=>{
          let h=st.h[j],cost=0,z=0,p=st.pending[j];const out=[];
          for(;;){const pd=probs(h,Math.min(4,i+(p>=0?1:0)));out.push({i,h,cost,z,p,pd});if(p>=0||i===n||C[j][i]!==0)break;cost+=pd[0];h=(h*29)%pow[4];i++;z++;}
          return out;
        });
        for(let k=force<0?0:force;k<=(force<0?28:force);k++){
          const ops=Array.from({length:T},()=>[]);
          for(let j=0;j<T;j++){
            for(const o of prefixes[j]){
              const {i,h,p,pd,cost,z}=o;
              if(i===n){ops[j].push([i,h,-1,cost,0,z,st.sk[j],0]);continue;}
              const next=C[j][i],prev=i?C[j][i-1]:-1,x=mod(next-k),held=p>=0;
              if(x!==0&&(!held||x===p))ops[j].push([i+1,held?h:(h*29+x)%pow[4],-1,cost+(held?0:pd[x]+(next===prev?Math.log(1-s):0)),0,z,st.sk[j],1]);
              if(!held&&i>0&&st.sk[j]<cap){const q=mod(prev-k);if(q!==0)ops[j].push([i,(h*29+q)%pow[4],q,cost+pd[q]+Math.log(s),1<<j,z,st.sk[j]+1,1]);}
            }
            ops[j].sort((a,b)=>b[3]-a[3]);
          }
          if(ops.some(a=>!a.length))continue;
          const suffix=Array(T+1).fill(0);
          for(let j=T-1;j>=0;j--)suffix[j]=suffix[j+1]+ops[j][0][3];
          const canEnd=ops.every(a=>a.some(o=>o[0]===n)),canNoKey=ops.every(a=>a.some(o=>!o[7]));
          const ii=empty(),hh=empty(),pp=empty(),zz=empty(),ss=empty();
          function visit(j,score,mask,done,active){
            const floor=canEnd?Math.min(cutoff(),best?best.score:-Infinity):cutoff();
            if(score+suffix[j]+(!active&&canNoKey?LOG:0)<floor){pruned++;return;}
            if(j===T){
              if(!active&&k!==0)return;if(active&&t===n+cap)return;
              explored++;
              if(done){if(!active)score+=LOG;if(!best||score>best.score)best={score,node:{parent:st.node,k:active?k:-1,mask,z:zz.slice()}};return;}
              if(!active||score<cutoff())return;
              put({i:ii.slice(),h:hh.slice(),pending:pp.slice(),sk:ss.slice(),score,node:{parent:st.node,k,mask,z:zz.slice()}});return;
            }
            for(const o of ops[j]){ii[j]=o[0];hh[j]=o[1];pp[j]=o[2];zz[j]=o[5];ss[j]=o[6];visit(j+1,score+o[3],mask|o[4],done&&o[0]===n,active||o[7]);}
          }
          visit(0,st.score-LOG,0,true,false);
        }
      }
      beam=heap;retained+=beam.length;
    }
    if(!best)return {ok:false,explored,retained,pruned};
    const keys=[],masks=[],holds=[];for(let p=best.node;p;p=p.parent){keys.push(p.k);masks.push(p.mask);holds.push(p.z);}keys.reverse();masks.reverse();holds.reverse();
    const v=replay(C,keys,masks,holds);if(Math.abs(v.score-best.score)>1e-7)throw Error("score mismatch");
    return {ok:true,...v,keys,masks,holds,explored,retained,pruned};
  }
  const body=gp.pages.slice(23,27).flatMap(x=>x.indices).slice(16);
  if(body.length!==1005)throw Error("source boundary");
  const layouts={blocks:Array.from({length:T},(_,j)=>body.slice(j*N,(j+1)*N)),quintets:Array.from({length:T},(_,j)=>body.filter((_,i)=>i%T===j))};
  const repeats=C=>C.map(a=>a.reduce((s,x,i)=>s+(i>0&&x===a[i-1]?1:0),0));
  const choose=(q,independent)=>[0,1,2,0,2].map((d,j)=>{const a=donors[d],i=independent?Math.floor(a.length*.94)+q*499+j*31+(j>=3?1800:0):Math.floor(a.length*.81)+q*800+j*53+(j>=3?4000:0);const p=a.slice(i,i+N);if(p.length!==N)throw Error("window");return p;});
  const cases=[];
  for(const item of config.cases||["shared0","shared1","shared2","shared3","null0","null1","null2","null3"]){
    if(layouts[item]){const C=layouts[item],d=decode(C);cases.push({item,repeats:repeats(C),score:d.score,skip:d.skip,holdCount:d.holdCount,explored:d.explored,pruned:d.pruned,keys:d.keys,masks:d.masks,holds:d.holds,plain:d.p,render:d.p?.map(a=>a.map(x=>gp.translit[x]).join(""))});continue;}
    const q=+item.at(-1),independent=item.startsWith("null"),P=choose(q,independent),a=plant(P,(independent?0x5EED9100:0x5EEDA100)+q,independent);
    let truth=null;if(!independent){truth=replay(a.C,a.keys,a.masks,a.holds);if(truth.p.some((x,j)=>x.some((v,i)=>v!==P[j][i])))throw Error("plant replay");}
    const d=decode(a.C),match=d.ok?d.p.map((x,j)=>x.filter((v,i)=>v===P[j][i]).length):Array(T).fill(0);
    cases.push({item,repeats:repeats(a.C),score:d.score,trueScore:truth?.score,skip:d.skip,trueSkip:truth?.skip,holdCount:d.holdCount,trueHold:truth?.holdCount,match,pass:match.every(n=>n>=.8*N),explored:d.explored,pruned:d.pruned,retained:d.retained});
  }
  return {config:{N,B,T,s,skipCap:Math.ceil(N/16),clock:"literal F transparent, physical predecessor",training:"first 80% of native donors, 5-gram Dirichlet alpha8"},sourceRepeats:Object.fromEntries(Object.entries(layouts).map(([k,v])=>[k,repeats(v)])),cases,cache:cache.size};
}
const args=process.argv.slice(2);const result=experiment(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")),args.length?{cases:args}:{});console.log(JSON.stringify(result,null,2));
