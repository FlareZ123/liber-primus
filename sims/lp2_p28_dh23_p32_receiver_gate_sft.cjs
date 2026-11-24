"use strict";
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8").replace(/\r/g,"");
const m29=x=>((x%29)+29)%29;
const pow=(x,e)=>{let y=1;for(let i=0;i<e;i++)y=y*x%29;return y;};
const h=(x,y)=>[m29(x-y),m29(x+y)];
function fragments(raw,runeIndex){
  const out=[];let a=[],start=0,off=0;
  const flush=()=>{if(a.length){out.push({start,end:off-1,values:a});a=[];}};
  for(const ch of [...raw]){
    const v=runeIndex.get(ch);
    if(v!==undefined){if(!a.length)start=off;a.push(v);off++;}
    else if(ch==="/"||/\s/u.test(ch)){}
    else flush();
  }
  flush();return out;
}
function loadModel(){
  const raw=read("resources/control/duko_round27_english_quadgrams.txt");
  const bytes=Buffer.from(raw,"utf8");
  const sha=crypto.createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex");
  assert.equal(sha,"da56c2e11e004ad24454750dba8fbe2e19abbc71");
  const q=new Map();let total=0;
  for(const line of raw.trim().split(/\r?\n/u)){const z=/^([A-Z]{4})\s+(\d+)$/u.exec(line.trim());if(z){const n=+z[2];q.set(z[1],Math.log10(n));total+=n;}}
  const lt=Math.log10(total);for(const [k,v] of q)q.set(k,v-lt);
  return {q,floor:Math.log10(.01)-lt,sha,types:q.size};
}
function score(a,t,model){
  const s=a.map(x=>t[x]).join("").replace(/[^A-Z]/gu,"");let n=0;
  for(let i=0;i<s.length-3;i++)n+=model.q.get(s.slice(i,i+4))??model.floor;
  return {score:n/(s.length-3),letters:s.length,preview:s.slice(0,120)};
}
function main(){
  const c=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),t=c.translit;
  const txt=read("resources/liber-primus/lp2-transcription.txt");
  const p=c.pages.find(x=>x.page===32);assert.ok(p);assert.equal(p.indices.length,121);
  const parts=txt.split(/^\s*%\s*$/m),ri=new Map(c.runes.map((r,i)=>[r,i]));
  const f=fragments(parts[32],ri);assert.equal(f.length,22);
  assert.deepEqual([f[7].start,f[7].end,f[7].values.length],[33,43,11]);
  assert.deepEqual([f[15].start,f[15].end,f[15].values.length],[89,96,8]);
  const home=p.indices.slice(33,37),homex=p.indices.slice(33,38),buds=p.indices.slice(93,97),x=p.indices.slice(97,98);
  assert.equal(home.map(v=>t[v]).join(""),"HOME");
  assert.equal(homex.map(v=>t[v]).join(""),"HOMEX");
  assert.equal(buds.map(v=>t[v]).join(""),"BUDS");
  assert.equal(t[x[0]],"B");
  assert.equal(93-33,60);assert.equal(97-37,60);
  assert.deepEqual(h(f[15].values[0],f[15].values.at(-1)),[7,8]);
  const st={p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3,q:4};
  const pm=(x,e,m)=>{let y=1;for(let i=0;i<e;i++)y=y*x%m;return y;};
  assert.equal(pm(st.g,st.a,st.p),st.A);assert.equal(pm(st.g,st.b,st.p),st.B);
  assert.equal(pm(st.A,st.b,st.p),st.K);assert.equal(pm(st.B,st.a,st.p),st.K);
  assert.equal((st.b*st.e)%(st.p-1),1);assert.equal(m29(st.g-st.K),st.e);
  for(let i=0;i<29;i++)assert.equal(pow(pow(i,3),19),i);
  const key=[st.p,st.g,st.a,st.b,st.A,st.B,st.K,st.e,st.q];
  const add=(a,sgn)=>a.map((v,i)=>m29(v+sgn*key[i%key.length]));
  const probe=Array.from({length:121},(_,i)=>(7*i+3)%29);assert.deepEqual(add(add(probe,-1),1),probe);
  const model=loadModel(),cube=a=>a.map(v=>pow(v,3)),inv=a=>a.map(v=>pow(v,19));
  const stateMinus=add(p.indices,-1),statePlus=add(p.indices,1),p57=c.pages.find(x=>x.page===57).indices;
  return {
    status:"bounded negative; no p32 plaintext recovered",
    p28DH23:st,
    p32:{runes:p.indices.length,raw:score(p.indices,t,model),cube:score(cube(p.indices),t,model),inverseCube:score(inv(p.indices),t,model),
      stateKeyMinus:score(stateMinus,t,model),stateKeyPlus:score(statePlus,t,model)},
    p57ClearReference:score(p57,t,model),
    fixedSpans:{
      fragment7:{start:f[7].start,end:f[7].end,text:f[7].values.map(v=>t[v]).join("")},
      fragment15:{start:f[15].start,end:f[15].end,text:f[15].values.map(v=>t[v]).join(""),
        cube:cube(f[15].values).map(v=>t[v]).join(""),inverse:inv(f[15].values).map(v=>t[v]).join(""),
        outerH:h(f[15].values[0],f[15].values.at(-1))},
      HOME:{raw:home.map(v=>t[v]).join(""),cube:cube(home).map(v=>t[v]).join(""),inverse:inv(home).map(v=>t[v]).join("")},
      HOMEX:{raw:homex.map(v=>t[v]).join(""),cube:cube(homex).map(v=>t[v]).join(""),inverse:inv(homex).map(v=>t[v]).join("")},
      BUDS:{raw:buds.map(v=>t[v]).join(""),cube:cube(buds).map(v=>t[v]).join(""),inverse:inv(buds).map(v=>t[v]).join("")},
      translatedX:{raw:t[x[0]],cube:t[cube(x)[0]],inverse:t[inv(x)[0]]}
    },
    previews:{cube:cube(p.indices).map(v=>t[v]).join("").slice(0,160),inverse:inv(p.indices).map(v=>t[v]).join("").slice(0,160),
      stateMinus:stateMinus.map(v=>t[v]).join("").slice(0,160),statePlus:statePlus.map(v=>t[v]).join("").slice(0,160)},
    quadgramBlobSha:model.sha,
    conclusion:"Direct GP29 cube/inverse and direct labeled-DH-state repeating-additive use fail on this independently selected p32 receiver. The navigation loop remains structural; no plaintext is recovered."
  };
}
if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={main};
