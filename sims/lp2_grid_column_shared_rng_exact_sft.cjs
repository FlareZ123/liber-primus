"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
function mtRaw(seed){const m=new Uint32Array(624);let words=[];let v=BigInt(seed);if(v<0n)v=-v;do{words.push(Number(v&0xffffffffn));v>>=32n}while(v);m[0]=19650218;for(let i=1;i<624;i++)m[i]=(Math.imul(1812433253,m[i-1]^(m[i-1]>>>30))+i)>>>0;let i=1,j=0;for(let k=0;k<Math.max(624,words.length);k++){m[i]=((m[i]^Math.imul(m[i-1]^(m[i-1]>>>30),1664525))+words[j]+j)>>>0;if(++i===624){m[0]=m[623];i=1}if(++j===words.length)j=0}for(let k=0;k<623;k++){m[i]=((m[i]^Math.imul(m[i-1]^(m[i-1]>>>30),1566083941))-i)>>>0;if(++i===624){m[0]=m[623];i=1}}m[0]=0x80000000;i=624;function draw(){if(i===624){for(let k=0;k<624;k++){const y=(m[k]&0x80000000)|(m[(k+1)%624]&0x7fffffff);m[k]=m[(k+397)%624]^(y>>>1)^((y&1)?0x9908b0df:0)}i=0}let y=m[i++];y^=y>>>11;y^=(y<<7)&0x9d2c5680;y^=(y<<15)&0xefc60000;y^=y>>>18;return y>>>0}return draw}
const Q=2**53, length=[729,1145,1738,1894,1021,1433,1680,3316];
const modes=["randrange","float","uint32"], schedules=["conditional","keyfirst","coinfirst"], policies=["consuming","physical","nohold"];
function machine(seed,mode,schedule,sign){
 const draw=mtRaw(seed),raw=[],cache=[];
 function word(j){while(raw.length<=j)raw.push(draw());return raw[j]}
 function coin(j){return [(word(j)>>>5)*67108864+(word(j+1)>>>6),j+2]}
 function key(j){let k;if(mode==="randrange"){do{k=word(j++)>>>27}while(k>=29)}else if(mode==="uint32")k=word(j++)%29;else{const [u,t]=coin(j);j=t;k=Math.floor(29*(u/Q))}
 return [(29+sign*k)%29,j]}
 function trial(j){if(cache[j])return cache[j];let k,u=null,t=j;
 if(schedule==="coinfirst"){[u,t]=coin(t)}[k,t]=key(t);if(schedule==="keyfirst"){[u,t]=coin(t)}return cache[j]={k,u,t}}
 return {trial,coin};
}
function union(A){if(!A.length)return A;A.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const out=[A[0].slice()];
 for(let i=1;i<A.length;i++){const a=A[i],last=out.at(-1);if(a[0]<=last[1]||a[0]-last[1]===1)last[1]=Math.max(last[1],a[1]);else out.push(a.slice())}return out}
function intersection(A,B){const out=[];let i=0,j=0;while(i<A.length&&j<B.length){const l=Math.max(A[i][0],B[j][0]),h=Math.min(A[i][1],B[j][1]);if(l<=h)out.push([l,h]);if(A[i][1]<B[j][1])i++;else j++}return out}
function domain(policy){return policy==="nohold"?[Math.floor(.72*Q)+1,Math.floor(.882*Q)]:[0,Q]}
function reach(C,seed,mode,schedule,sign,policy,limits=domain(policy)){
 const M=machine(seed,mode,schedule,sign),hold=policy!=="nohold";
 let states=new Map([[0,[limits]]]),maxStates=1;
 for(let i=0;i<C.length;i++){
  const c=C[i],next=new Map();
  function add(j,prev,R,lo,hi){if(lo>hi)return;const k=j*30+prev+1;let a=next.get(k);
   for(const x of R){const l=Math.max(lo,x[0]),h=Math.min(hi,x[1]);if(l<=h){if(!a){a=[];next.set(k,a)}a.push([l,h])}}}
  for(const [state,R] of states){
    const j=Math.floor(state/30),prev=state%30-1,t0=M.trial(j);
    if(hold&&c===0)add(j,policy==="physical"?0:prev,R,...limits);
    const p=(c+29-t0.k)%29;
    if(c!==prev&&(!hold||p!==0))add(t0.t,c,R,...limits);
    const p0=(prev+29-t0.k)%29;
    if(prev<0||(hold&&p0===0))continue;
    let t=t0,lo=limits[0],hi=limits[1],pos=t.t;
    while(lo<=hi){
      let u=t.u;if(u===null){[u,pos]=M.coin(pos)}
      if(c===prev)add(pos,c,R,lo,Math.min(hi,u));lo=Math.max(lo,u+1);if(lo>hi)break;
      t=M.trial(pos);pos=t.t;const emit=(p0+t.k)%29;
      if(emit!==prev){if(emit===c)add(pos,c,R,lo,hi);break}
    }
  }
  if(!next.size)return {dead:i,intervals:[],maxStates};
  for(const [k,R] of next)next.set(k,union(R));states=next;maxStates=Math.max(maxStates,states.size);
 }
 return {dead:C.length,intervals:union([...states.values()].flat()),maxStates}
}
function plant(P,seed,mode,schedule,sign,policy,t){
 const M=machine(seed,mode,schedule,sign);let j=0,prev=-1;const C=[];
 for(const p of P){
   if(p===0&&policy!=="nohold"){C.push(0);if(policy==="physical")prev=0;continue}
   while(true){const z=M.trial(j);j=z.t;const c=(p+z.k)%29;
     if(c!==prev){C.push(c);prev=c;break}
     let u=z.u;if(u===null){[u,j]=M.coin(j)}
     if(u>=t){C.push(c);prev=c;break}
   }
 }return C
}
function matching(matrix,limits){
 const dp=Array.from({length:256},()=>[]);dp[0]=[limits];
 for(let mask=0;mask<255;mask++){
  if(!dp[mask].length)continue;let row=0;for(let m=mask;m;m&=m-1)row++;
  for(let c=0;c<8;c++)if(!(mask&(1<<c))){
    const next=mask|(1<<c),hit=intersection(dp[mask],matrix[row][c].intervals);
    if(hit.length)dp[next]=union(dp[next].concat(hit))
  }
 }return dp[255]
}
function witness(matrix,t){const used=new Set(),a=[];
 function visit(i){if(i===8)return true;for(let j=0;j<8;j++)if(!used.has(j)&&matrix[i][j].intervals.some(([l,h])=>l<=t&&t<=h)){used.add(j);a.push(j);if(visit(i+1))return true;a.pop();used.delete(j)}return false}
 return visit(0)?a:null
}
function run(C,rows){
 assert.equal(C.length,12956);assert.equal(rows.length,32);assert.ok(rows.every(r=>r.length===8));
 const groups=[];let offset=0;for(const n of length){groups.push(C.slice(offset,offset+n));offset+=n}
 const columns=Array.from({length:8},(_,c)=>rows.map(r=>r[c]));
 function seed(c,endian){const a=columns[c];return (endian==="big"?a:a.slice().reverse()).reduce((n,x)=>(n<<8n)|BigInt(x),0n)}
 const d=mtRaw(seed(0,"big"));assert.deepEqual(Array.from({length:8},()=>d()),[3900148268,2094580756,548002278,3335857440,2343225008,2665391861,529435163,234020831]);
 const assignment=[5,0,7,2,6,1,3,4],plain=mtRaw(0x3301),donors=length.map(n=>Array.from({length:n},()=>plain()%29));
 const controls=[];for(const mode of modes)for(const schedule of schedules)for(const policy of policies){
   const endian=controls.length%2?"little":"big",sign=controls.length%2?-1:1,t=Math.ceil(.81288*Q);
   const matrix=Array.from({length:8},()=>Array.from({length:8},()=>({intervals:[]})));
   for(let i=0;i<8;i++){const col=assignment[i],k=seed(col,endian),cipher=plant(donors[i],k,mode,schedule,sign,policy,t),got=reach(cipher,k,mode,schedule,sign,policy);
     assert.ok(got.intervals.some(([l,h])=>l<=t&&t<=h));matrix[i][col]=got}
   assert.ok(matching(matrix,domain(policy)).some(([l,h])=>l<=t&&t<=h));assert.deepEqual(witness(matrix,t),assignment);
   controls.push({mode,schedule,policy,endian,sign,t,assignment})
 }
 const results=[];for(const endian of ["big","little"])for(const mode of modes)for(const sign of [1,-1])for(const schedule of schedules)for(const policy of policies){
   const matrix=groups.map(g=>columns.map((_,c)=>reach(g,seed(c,endian),mode,schedule,sign,policy)));
   const joint=matching(matrix,domain(policy));
   results.push({endian,mode,sign,schedule,policy,completeEdges:matrix.flat().filter(x=>x.intervals.length).length,dead:matrix.map(row=>row.map(x=>x.dead)),edgeIntervals:matrix.map(row=>row.map(x=>x.intervals)),joint,witness:joint.length?witness(matrix,joint[0][0]):null})
 }
 return {length,controls,results,summary:{settings:results.length,pairTests:results.length*64,assignments:results.length*40320,feasibleSettings:results.filter(x=>x.joint.length).length,completeEdges:results.reduce((a,x)=>a+x.completeEdges,0)}}
}
module.exports={run,machine,reach,plant,matching,witness,domain,mtRaw};
if(require.main===module){
 const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8")),table=JSON.parse(fs.readFileSync(path.join(__dirname,"../resources/liber-primus/base60-grid.json"),"utf8"));
 console.log(JSON.stringify(run(corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),table.byte_rows),null,2))
}
