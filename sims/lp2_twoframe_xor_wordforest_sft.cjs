'use strict';
const fs=require('node:fs');
const path=require('node:path');
function research(inputs){
  const corpus=JSON.parse(inputs[0]),native=JSON.parse(inputs[2]),Q=29,N=716;
  const assert=(v,s)=>{if(!v)throw Error(s)};
  const ids=new Map(corpus.runes.map((r,i)=>[r,i])),letter=new Map(corpus.translit.map((r,i)=>[r,i]));
  for(const [s,i] of [["K",5],["Q",5],["V",1],["Z",15],["ING",21],["IO",27]])letter.set(s,i);
  const str=a=>String.fromCharCode(...a),arr=s=>Array.from(s,c=>c.charCodeAt(0)),digit=s=>Array.from(s,c=>"0123456789ABCDEFGHIJKLMNOPQRS"[c.charCodeAt(0)]).join("");
  function gp(w){const a=[];for(let i=0;i<w.length;){let k=w.slice(i,i+3);if(k==="ING"){a.push(21);i+=3;continue}k=w.slice(i,i+2);if(k.length===2&&letter.has(k)){a.push(letter.get(k));i+=2;continue}assert(letter.has(w[i]),"bad letter");a.push(letter.get(w[i++]));}return str(a)}
  function runeWords(s){let a=[],w=[];for(const c of s){if(ids.has(c))w.push(ids.get(c));else if(w.length){a.push(str(w));w=[]}}if(w.length)a.push(str(w));return a}
  const literary=s=>(s.toUpperCase().match(/[A-Z]+/g)||[]).map(gp);
  const nw=native.sections.map(s=>({name:s.name,words:runeWords(s.source_text)}));
  const koan=nw.find(x=>x.name==="0_koan_1"),div=nw.find(x=>x.name==="0_loss_of_divinity");
  for(const off of [279,142]){let p=0;for(let i=0;i<koan.words.length;i++){let w=koan.words[i];if(off<p+w.length){let j=off-p;assert(w.charCodeAt(j)===24&&w.charCodeAt(j+1)===16,"KOAN correction");koan.words[i]=w.slice(0,j)+str([3])+w.slice(j+2);break}p+=w.length}}
  const dictionary=new Map();
  const add=(w,f)=>dictionary.set(w,(dictionary.get(w)||0)+f);
  for(const line of inputs[3].split(/\r?\n/)){const m=line.match(/^([a-z]+) (\d+)$/);if(m)add(gp(m[1].toUpperCase()),Number(m[2]));}
  for(const n of nw)if(n!==koan&&n!==div)for(const w of n.words)add(w,32);
  const byLen=new Map(),prefixCache=new Map();
  for(const [w,f] of dictionary){if(!byLen.has(w.length))byLen.set(w.length,[]);byLen.get(w.length).push({w,log:Math.log(f)})}
  function domain(len,partial){
    if(!partial)return byLen.get(len)||[];
    if(!prefixCache.has(len)){const m=new Map();for(const [w,f] of dictionary)if(w.length>len){const p=w.slice(0,len);m.set(p,(m.get(p)||0)+f)}prefixCache.set(len,Array.from(m,([w,f])=>({w,log:Math.log(f)})));}
    return prefixCache.get(len);
  }
  const uni=new Float64Array(Q),bi=new Float64Array(Q*Q),tri=new Float64Array(Q**3);
  for(const [w,f] of dictionary)for(let i=0;i<w.length;i++){const c=w.charCodeAt(i);uni[c]+=f;if(i)bi[w.charCodeAt(i-1)*Q+c]+=f;if(i>1)tri[(w.charCodeAt(i-2)*Q+w.charCodeAt(i-1))*Q+c]+=f;}
  const pu=Float64Array.from(uni,x=>(x+.5)/(uni.reduce((a,b)=>a+b,0)+Q*.5)),pb=new Float64Array(Q**2),pt=new Float64Array(Q**3);
  for(let a=0;a<Q;a++){let z=0;for(let b=0;b<Q;b++)z+=bi[a*Q+b];for(let b=0;b<Q;b++)pb[a*Q+b]=(bi[a*Q+b]+12*pu[b])/(z+12)}
  for(let ab=0;ab<Q**2;ab++){let z=0;for(let c=0;c<Q;c++)z+=tri[ab*Q+c];for(let c=0;c<Q;c++)pt[ab*Q+c]=(tri[ab*Q+c]+20*pb[(ab%Q)*Q+c])/(z+20)}
  const lu=Float64Array.from(pu,Math.log),lb=Float64Array.from(pb,Math.log),lt=Float64Array.from(pt,Math.log);
  const legal=Array.from({length:32},(_,d)=>Array.from({length:Q},(_,x)=>x).filter(x=>(x^d)<Q));
  assert(legal.every((a,d)=>a.length===(d===0?29:d<4?28:26)),"legal mask cardinality");
  for(let m=0;m<32;m++)assert(Array.from({length:29},(_,x)=>x).every(x=>(x^m)<29)===(m===0),"universal mask");
  const logadd=(a,b)=>a===-Infinity?b:b===-Infinity?a:Math.max(a,b)+Math.log1p(Math.exp(-Math.abs(a-b)));
  function fallback(d){
    const n=d.length;if(n===1){let best=-Infinity,w=0;for(const a of legal[d[0]]){const v=lu[a]+lu[a^d[0]];if(v>best){best=v;w=a}}return [w]}
    const M=Q*Q,back=new Uint8Array(n*M);let v=new Float64Array(M),v2=new Float64Array(M);v.fill(-Infinity);
    for(const a of legal[d[0]])for(const b of legal[d[1]])v[a*Q+b]=lu[a]+lu[a^d[0]]+lb[a*Q+b]+lb[(a^d[0])*Q+(b^d[1])];
    for(let i=2;i<n;i++){v2.fill(-Infinity);for(const a of legal[d[i-2]])for(const b of legal[d[i-1]]){const ab=a*Q+b,v0=v[ab],base=ab*Q,base2=((a^d[i-2])*Q+(b^d[i-1]))*Q;if(!Number.isFinite(v0))continue;for(const c of legal[d[i]]){const bc=b*Q+c,w=v0+lt[base+c]+lt[base2+(c^d[i])];if(w>v2[bc]){v2[bc]=w;back[i*M+bc]=a}}}[v,v2]=[v2,v]}
    let j=0;for(let i=1;i<M;i++)if(v[i]>v[j])j=i;const x=Array(n);x[n-2]=Math.floor(j/Q);x[n-1]=j%Q;for(let i=n-1;i>=2;i--)x[i-2]=back[i*M+x[i-1]*Q+x[i]];return x;
  }
  function take(words,offset,n=N){let j=0,p=0;while(p<offset){p+=words[j++].length}const out=[];let rem=n;while(rem){const w=words[j++];assert(w,"short native source");out.push({w:w.slice(0,rem),partial:w.length>rem});rem-=Math.min(rem,w.length)}return out}
  const shape=words=>words.map(x=>({len:x.w.length,partial:x.partial}));
  const flatten=words=>arr(words.map(x=>x.w).join(""));
  const known=words=>words.reduce((a,x)=>a+(domain(x.w.length,x.partial).some(y=>y.w===x.w)?x.w.length:0),0);
  function solve(d,sa,sb){
    const nodes=[],lanes=[];
    for(const [lane,ss] of [[0,sa],[1,sb]]){let p=0;const l=[];for(const s of ss){const node={id:nodes.length,lane,start:p,end:p+s.len,partial:s.partial,ds:domain(s.len,s.partial),edges:[]};nodes.push(node);l.push(node);p=node.end}assert(p===d.length,"shape length");lanes.push(l)}
    let i=0,j=0,edgeCount=0;while(i<lanes[0].length&&j<lanes[1].length){const a=lanes[0][i],b=lanes[1][j],lo=Math.max(a.start,b.start),hi=Math.min(a.end,b.end);assert(hi>lo,"overlap");const e={a:a.id,b:b.id,lo,hi};a.edges.push(e);b.edges.push(e);edgeCount++;if(a.end===hi)i++;if(b.end===hi)j++}
    const other=(e,k)=>e.a===k?e.b:e.a;
    const key=(node,w,e,flip)=>{let s="";for(let p=e.lo;p<e.hi;p++)s+=String.fromCharCode(w.charCodeAt(p-node.start)^(flip?d[p]:0));return s};
    const seen=new Set(),out=[Array(d.length),Array(d.length)],components=[];
    function visit(node,parent){
      assert(!seen.has(node.id),"graph cycle");seen.add(node.id);const children=[];
      for(const e of node.edges){const id=other(e,node.id);if(id===parent)continue;const child=nodes[id];visit(child,node.id);const map=new Map();
        for(let k=0;k<child.ds.length;k++){const v=child.val[k];if(v===-Infinity)continue;const h=key(child,child.ds[k].w,e,false),old=map.get(h),cnt=child.cnt[k];if(!old)map.set(h,{v,k,cnt});else{old.cnt+=cnt;if(v>old.v){old.v=v;old.k=k}}}
        children.push({child,e,map});
      }
      node.children=children;node.val=new Float64Array(node.ds.length);node.cnt=Array(node.ds.length).fill(0n);
      for(let k=0;k<node.ds.length;k++){const item=node.ds[k];let v=item.log,cnt=1n;for(const {e,map} of children){const row=map.get(key(node,item.w,e,true));if(!row){v=-Infinity;cnt=0n;break}v+=row.v;cnt*=row.cnt}node.val[k]=v;node.cnt[k]=cnt}
    }
    function trace(node,k){const w=node.ds[k].w;for(let p=node.start;p<node.end;p++)out[node.lane][p]=w.charCodeAt(p-node.start);for(const {child,e,map} of node.children)trace(child,map.get(key(node,w,e,true)).k)}
    function collect(node,list){list.push(node);for(const {child} of node.children)collect(child,list)}
    for(const root of nodes){if(seen.has(root.id))continue;visit(root,-1);const list=[];collect(root,list);const start=Math.min(...list.map(x=>x.start)),end=Math.max(...list.map(x=>x.end));let count=0n,k=-1,best=-Infinity;
      for(let i=0;i<root.ds.length;i++){count+=root.cnt[i];if(root.val[i]>best){best=root.val[i];k=i}}
      if(k>=0)trace(root,k);else{const x=fallback(d.slice(start,end));for(let i=start;i<end;i++){out[0][i]=x[i-start];out[1][i]=x[i-start]^d[i]}}
      components.push({start,end,words:list.length,count:count.toString(),feasible:k>=0,log2count:count===0n?null:Math.log2(Number(count.toString().slice(0,15)))+(Math.max(0,count.toString().length-15))*Math.log2(10)});
    }
    assert(edgeCount===nodes.length-components.length,"forest edge count");
    assert(out[0].every((x,i)=>x>=0&&x<Q&&out[1][i]>=0&&out[1][i]<Q&&(x^out[1][i])===d[i]),"joint output");
    return {x:out[0],y:out[1],components,words:[sa.length,sb.length],feasibleRunes:components.filter(x=>x.feasible).reduce((a,x)=>a+x.end-x.start,0),uniqueRunes:components.filter(x=>x.count==="1").reduce((a,x)=>a+x.end-x.start,0),edgeCount};
  }
  let seed=0x32930303;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
  function choose(a){const lim=Math.floor(2**32/a.length)*a.length;let x;do{x=rng()}while(x>=lim);return a[x%a.length]}
  function test(name,aw,bw,kind){
    const p=flatten(aw),q=flatten(bw);assert(p.length===N&&q.length===N,"native shape");const c=[],e=[],k=[],k2=[];
    for(let i=0;i<N;i++){const m=kind==="independent"?p[i]^choose(legal[0]):p[i]^choose(legal[p[i]^q[i]]);const m2=kind==="independent"?q[i]^choose(legal[0]):m;k.push(m);k2.push(m2);c.push(p[i]^m);e.push(q[i]^m2)}
    if(kind==="wrong-clock")e.push(e.shift());const d=c.map((x,i)=>x^e[i]),z=solve(d,shape(aw),shape(bw)),pad=c.map((x,i)=>x^z.x[i]);assert(z.y.every((x,i)=>(x^pad[i])===e[i]),"replay");
    const correct=z.x.reduce((a,x,i)=>a+(x===p[i]),0),correct2=z.y.reduce((a,x,i)=>a+(x===q[i]),0);
    return {name,kind,known:[known(aw),known(bw)],correct,correct2,keyCorrect:pad.reduce((a,x,i)=>a+(x===k[i]),0),feasibleRunes:z.feasibleRunes,uniqueRunes:z.uniqueRunes,components:z.components,words:z.words,cipher1:c,cipher2:e,truth1:p,truth2:q,truthPad1:k,truthPad2:k2,candidate1:z.x,candidate2:z.y,impliedPad:pad,exactReplay:true};
  }
  const gib=literary(inputs[4].split("THE PROPHET").slice(2).join("THE PROPHET").split("*** END OF")[0]),shk=literary(inputs[5]);
  const pairs=[["native-koan-divinity",take(koan.words,0),take(div.words,0)],["literary-0",take(gib,4000),take(shk,8000)],["literary-1",take(gib,4716),take(shk,8716)]];
  const controls=[];for(const [name,aw,bw] of pairs){controls.push(test(name,aw,bw,"shared"));controls.push(test(name,aw,bw,"independent"));}controls.push(test(...pairs[0],"wrong-clock"));
  const shared=controls.filter(x=>x.kind==="shared"),rivals=controls.filter(x=>x.kind!=="shared");
  const useful=shared.every(x=>Math.min(x.correct,x.correct2)>=N*.7)&&Math.min(...shared.map(x=>x.feasibleRunes))>Math.max(...rivals.map(x=>x.feasibleRunes));
  const a=corpus.pages.slice(0,3).flatMap(p=>p.indices).slice(13),b=corpus.pages.slice(23,27).flatMap(p=>p.indices).slice(16);
  assert(a.length===N&&b.length===1005,"original frame");
  const delta=a.map((x,i)=>x^b[i]),counts=[0,0,0];for(const d of delta)counts[d===0?0:d<4?1:2]++;
  const log10legal=counts.reduce((s,x,i)=>s+x*Math.log10([29,28,26][i]/32),0);
  let original={lengths:[a.length,b.length],deltaCounts:counts,log10legal,universalMasks:[0],unpairedCipher:b.slice(N),decoded:false};
  if(useful){
    const all=corpus.pages.flatMap(p=>p.indices),tape=[],cuts=[0];let p=0,wordStart=0;
    for(const r of inputs[1]){if(ids.has(r)){tape.push(ids.get(r));p++}else if(!"/\n\r%".includes(r)&&p>wordStart){cuts.push(p);wordStart=p}}
    if(cuts.at(-1)!==p)cuts.push(p);assert(tape.length===all.length&&tape.every((x,i)=>x===all[i]),"normalized tape");
    const shapes=(start,end)=>{assert(cuts.includes(start),"nonword start");let k=cuts.indexOf(start),out=[];while(cuts[k]<end){out.push({len:Math.min(cuts[k+1],end)-cuts[k],partial:cuts[k+1]>end});k++}return out};
    const start2=corpus.pages.slice(0,23).reduce((s,p)=>s+p.indices.length,0)+16;
    const sa=shapes(13,13+N),sb=shapes(start2,start2+N),z=solve(delta,sa,sb),pad=a.map((x,i)=>x^z.x[i]);assert(z.y.every((x,i)=>(x^pad[i])===b[i]),"original replay");
    original={...original,decoded:true,wordShapes:[sa,sb],cipher1:a,cipher2:b.slice(0,N),candidate1:z.x,candidate2:z.y,impliedPad:pad,components:z.components,feasibleRunes:z.feasibleRunes,uniqueRunes:z.uniqueRunes,render1:z.x.map(x=>corpus.translit[x]).join(""),render2:z.y.map(x=>corpus.translit[x]).join(""),exactReplay:true};
  }
  return {dictionarySize:dictionary.size,domainSizes:[...byLen].map(([n,a])=>[n,a.length]).sort((a,b)=>a[0]-b[0]),definition:"shared XOR mask conditionally sampled uniformly among masks legal for both known plaintexts; independent pad controls separately legal; exact weighted dictionary forest on true printed word boundaries, prefix domain for truncated final word, exact trigram fallback for infeasible components",controls,useful,original};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
const root=path.resolve(__dirname,'..');
const files=paths.map(p=>fs.readFileSync(path.join(root,p),'utf8'));
const result=research(files);
result.inputBlobs=Object.fromEntries(paths.map((p,i)=>[p,require('node:crypto').createHash('sha1').update('blob '+Buffer.byteLength(files[i])+'\0').update(files[i]).digest('hex')]));
console.log(JSON.stringify(result,null,2));
