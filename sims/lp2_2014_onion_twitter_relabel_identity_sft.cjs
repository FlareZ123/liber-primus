'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..');
const inputs=["resources/liber-primus/base60-grid.json","resources/external/2014-stage05-three-onion-hex-blocks.txt","resources/cicada2013-twitter-hex-stream.txt"];
const hashes=["4698c0806e6bab06a39cfbc3c3283b862de58b35","3a72ae0552acbfe3225269d7b10a0fed4fef068d","b3164929b090ffee06490e8ca86f495aa1db50c7"];
const content=inputs.map((p,i)=>{const b=fs.readFileSync(path.join(root,p));const sha=createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');if(sha!==hashes[i])throw Error('source changed: '+p);return b.toString('utf8')});
function analyze(grid,source,tweets){
  const check=(v,msg)=>{if(!v)throw Error(msg)};
  /** @param {number[] | string[]} a */
  function signature(a){const m=new Map();return a.map(x=>{if(!m.has(x))m.set(x,m.size);return m.get(x)})}
  /** @param {number[]} a */
  function counts(a){const m=new Map();for(const x of a)m.set(x,(m.get(x)||0)+1);return [...m.values()].sort((a,b)=>b-a)}
  /** @param {number[]} a */
  function profile(a){const p={};for(const n of counts(a))p[n]=(p[n]||0)+1;return p}
  /** @param {number[]} a @param {number[]} b */
  function edits(a,b){const x=counts(a),y=counts(b);check(a.length===b.length,"equal lengths");return a.length-x.reduce((s,n,i)=>s+Math.min(n,y[i]||0),0)}
  /** @param {Uint8Array} tape @param {number[]} p */
  function match(tape,p){
    const q=signature(p),pairs=[];
    for(let j=0;j<q.length;j++){const k=q.indexOf(q[j]);if(k<j)pairs.push([k,j])}
    const hits=[];let repeatPass=0;
    for(let i=0;i<=tape.length-q.length;i++){
      if(!pairs.every(([a,b])=>tape[i+a]===tape[i+b]))continue;
      repeatPass++;
      if(signature(Array.from(tape.slice(i,i+q.length))).every((x,j)=>x===q[j]))hits.push(i);
    }
    return {windows:tape.length-q.length+1,repeatPass,hits};
  }
  const d=JSON.parse(grid);check(d.rows.length===32&&d.rows.every(x=>x.length===8),"32×8");
  const g=signature(d.rows.flat());
  check(g.length===256&&new Set(g).size===161,"grid length/distinct");
  const h=source.match(/^[0-9a-f]{512}$/gm).map(x=>x.match(/../g).map(y=>parseInt(y,16)));
  check(h.length===3&&h.every(x=>x.length===256),"3 onion blocks");
  const t=new Uint8Array(64167),seen=new Uint8Array(64167);
  const lines=tweets.trim().split(/\r?\n/);check(lines.length===988,"Twitter records");
  for(const line of lines){
    const [address,hex]=line.split(/:\s*/);check(/^[0-9a-f]{7}$/i.test(address)&&/^(?:[0-9a-f]{2})+$/i.test(hex),"record format");
    const off=parseInt(address,16);
    for(let i=0;i<hex.length/2;i++){check(off+i<t.length&&!seen[off+i],"coverage");seen[off+i]=1;t[off+i]=parseInt(hex.slice(2*i,2*i+2),16)}
  }
  check(seen.every(x=>x===1),"complete tape");
  const reflect=a=>Array.from({length:32},(_,i)=>a.slice(i*8,i*8+8).reverse()).flat();
  const hist=[],windows=[],controls=[];
  for(let mask=1;mask<8;mask++){
    const a=Array.from({length:256},(_,i)=>h.reduce((v,x,j)=>v^((mask>>j&1)?x[i]:0),0));
    hist.push({mask,profile:profile(a),minimumEdits:edits(g,a)});
    check(edits(a,a.map(x=>(x*101+73)&255).reverse())===0,"relabel/reorder control");
    for(const [order,p] of [["forward",a],["reverse",a.slice().reverse()]])windows.push({name:`xor${mask}`,order,...match(t,p)});
  }
  for(const [order,p] of [["forward",g],["reverse",g.slice().reverse()],["reflection",reflect(g)],["reflected-reverse",reflect(g).reverse()]])windows.push({name:"p50",order,...match(t,p)});
  const plant=t.slice();plant.set(g.map(x=>(x*101+73)&255),1000);
  const pc=match(plant,g);check(pc.hits.includes(1000),"positive relabel plant");
  check(edits([0,0,1,1],[0,0,0,1])===1,"edit formula toy");
  check(match(Uint8Array.from([0,0,0,1]),[0,0,1,2]).hits.length===0,"noninjective map negative");
  check(hist.map(x=>x.minimumEdits).join(",")==="4,6,4,11,9,11,5","original minimum edits");
  check(windows.every(x=>x.repeatPass===0&&x.hits.length===0),"original equality graph");
  return {targetProfile:profile(g),hist,windows,totalWindows:windows.reduce((s,x)=>s+x.windows,0),plant:pc};
}
console.log(JSON.stringify(analyze(...content),null,2));
