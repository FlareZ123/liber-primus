"use strict";
const fs=require("node:fs"),os=require("node:os"),path=require("node:path"),cp=require("node:child_process"),assert=require("node:assert/strict");
const {experiment}=require("./lp2_p0_red8_red5_unknown_layer_sft.cjs");
const root=path.resolve(__dirname,"..","resources"),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const base=experiment(read("liber-primus/lp2-corpus.json"),read("liber-primus/lp2-transcription.txt"),read("control/english_wordfreq_textblob.txt"),()=>{});
const temp=fs.mkdtempSync(path.join(os.tmpdir(),"lp2-joint-symbolic-")),exe=path.join(temp,process.platform==="win32"?"sym.exe":"sym");
const mod=x=>(x+29)%29,keystr=k=>k.map(x=>x.toString(29)).join(""),parse=s=>Array.from(s,x=>parseInt(x,29));
function run(cmd,args){const x=cp.spawnSync(cmd,args,{encoding:"utf8",maxBuffer:64*1024*1024});if(x.error)throw x.error;if(x.status!==0)throw Error(cmd+" failed: "+x.stderr);return x}
function scan(words,L,I){
 const body=path.join(temp,"body.txt"),dict=path.join(temp,"dict.txt");fs.writeFileSync(body,words.map(keystr).join(" "));fs.writeFileSync(dict,base.dict.map(keystr).join("\n")+"\n");
 const x=run(exe,[body,dict,String(L),String(I),"run"]);console.log(x.stderr.trim().split("\n").at(-1));return x.stdout.trim().split("\n").filter(Boolean);
}
const trie=[new Map()],terminal=new Set();
for(const w of base.dict){if(w.length===1&&w[0]!==10&&w[0]!==24)continue;let node=0;for(const p of w){if(!trie[node].has(p)){trie[node].set(p,trie.length);trie.push(new Map())}node=trie[node].get(p)}terminal.add(node)}
function segment(C,offset,k,l,w){
 const I=k.length,O=l.length;let s=new Set(Array.from({length:40},(_,j)=>j));
 for(let i=0;i<C.length;i++){const t=new Set(),force=i>=offset&&i<offset+w.length?w[i-offset]:-1;for(const id of s){const node=Math.floor(id/40),ph=id%40,a=Math.floor(ph/O),b=ph%O;if(i===offset&&ph!==0)continue;
  const put=(p,aa,bb)=>{if(force>=0&&p!==force)return;const n=trie[node].get(p);if(n===undefined)return;const state=aa*O+bb;t.add(n*40+state);if(terminal.has(n))t.add(state)};
  const x=C[i],aa=(a+1)%I,bb=(b+1)%O;if(x===0){put(0,a,b);const p=mod(-k[a]);if(p)put(p,aa,b)}const q=mod(x-l[b]),p=mod(q-k[a]);if(q&&p)put(p,aa,bb);
 }s=t;if(!s.size)return {prefixFailure:i+1,complete:false}}
 return {prefixFailure:null,complete:[...s].some(x=>x<40)};
}
try{
 run(process.env.CXX||"g++",["-O3","-std=c++17",path.join(__dirname,"lp2_p0_joint_key_anchor_symbolic.cpp"),"-o",exe]);
 const rows=scan(base.body,11,5);assert.equal(rows.length,4);
 for(const row of rows){const [_,o,b,k,l,w]=row.split(/\s+/);assert.equal(b,"0");const seg=segment(base.body.flat(),Number(o),parse(k),parse(l),parse(w));assert(!seg.complete);console.log(row,JSON.stringify(seg))}
 const known=scan(base.body,12,8);assert.deepEqual(known,["SURVIVOR 587 0 5e04223m 0opa0 a9gi4fi5ga96"]);
 const ks8=[[15,8,18,3,6,19,27,0],[4,19,2,0,28,13,8,1],[23,4,11,7,17,22,0,9]],ks5=[[15,26,18,21,5],[0,0,3,12,19],[5,12,13,17,26]];
 for(const I of [5,8])for(let j=0;j<3;j++){
  const k=I===5?ks5[j]:ks8[j],l=I===5?ks8[j]:ks5[j],offset=base.ctrl.slice(0,13).flat().length;
  let a=0,b=0,i=0,K,L;
  const C=base.ctrl.map(w=>w.map(p=>{if(i++===offset){K=k.slice(a).concat(k.slice(0,a));L=l.slice(b).concat(l.slice(0,b))}if(!p)return 0;const q=mod(p+k[a]);a=(a+1)%k.length;if(!q)return 0;const x=mod(q+l[b]);b=(b+1)%l.length;return x}));
  const candidates=scan(C,14,I),s="SURVIVOR "+offset+" 0 "+keystr(K)+" "+keystr(L)+" "+keystr(base.ctrl[13]);assert(candidates.includes(s));assert(segment(C.flat(),offset,K,L,base.ctrl[13]).complete);console.log("PASS planted pair and free segmentation",s);
 }
}finally{fs.rmSync(temp,{recursive:true,force:true})}
