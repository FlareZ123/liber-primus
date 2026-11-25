'use strict';
const fs=require('node:fs'),path=require('node:path');
function run(gp,native){
  const assert=(b,m)=>{if(!b)throw Error(m)},mod=x=>(x%29+29)%29;
  const runeMap=new Map(gp.runes.map((r,i)=>[r,i]));
  const sections=native.sections.map(s=>({name:s.name,x:[...s.source_text].filter(r=>runeMap.has(r)).map(r=>runeMap.get(r))}));
  const keys=[{name:"DIUINITY",k:[23,10,1,10,9,10,16,26]},{name:"FIRFUMFERENFE",k:[0,10,4,0,1,19,0,18,4,18,9,0,18]}];
  const q=.8, logq=Math.log(q), logskip=Math.log1p(-q);
  function model(exclude){
    const a=Array(29).fill(.5),b=Array.from({length:29},()=>Array(29).fill(.2));
    for(const s of sections)if(s.name!==exclude){for(const x of s.x)a[x]++;for(let i=1;i<s.x.length;i++)b[s.x[i-1]][s.x[i]]++;}
    const z=a.reduce((s,x)=>s+x,0);
    return [a.map(x=>Math.log(x/z)),b.map(row=>{const z=row.reduce((s,x)=>s+x,0);return row.map(x=>Math.log(x/z));})];
  }
  function rng(seed){let s=seed>>>0;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296;};}
  function encode(p,k,hold,phase){
    return p.map(x=>{if(hold&&x===0)return 0;const c=mod(x+k[phase]);phase=(phase+1)%k.length;return c;});
  }
  function repair(raw,choose){
    const out=[],swaps=[];
    for(let i=0;i<raw.length;){
      const prev=out.at(-1);
      if(i+1<raw.length&&raw[i]===prev&&raw[i+1]!==prev&&choose(i)){
        swaps.push(i);out.push(raw[i+1],raw[i]);i+=2;
      }else out.push(raw[i++]);
    }
    return {out,swaps};
  }
  function invert(y,k,hold,lm){
    // DAG over output offsets; phase, previous plaintext, pending singleton-repeat decision.
    const n=y.length,L=k.length,dp=Array.from({length:n+1},()=>new Map());
    const pack=(ph,prev,pend)=>(ph*30+prev+1)*2+pend;
    for(let ph=0;ph<L;ph++)dp[0].set(pack(ph,-1,0),{v:0,ph,prev:-1,pend:0,origin:ph,parent:null,letters:[],raw:[],swap:false,pos:0});
    function options(c,ph){
      const p=mod(c-k[ph]),a=[];
      if(hold&&c===0)a.push([0,ph]);
      if(!hold||p!==0)a.push([p,(ph+1)%L]);
      return a;
    }
    function push(i,node,raw,swap){
      let a=[{v:node.v+(swap?logq:0)+(node.pend&&raw[0]!==y[i-1]?logskip:0),ph:node.ph,prev:node.prev,p:[]}];
      for(const c of raw){const b=[];for(const st of a)for(const [p,ph] of options(c,st.ph))b.push({v:st.v+(st.prev<0?lm[0][p]:lm[1][st.prev][p]),ph,prev:p,p:st.p.concat(p)});a=b;}
      const j=i+raw.length,pend=Number(!swap&&i>0&&y[i]===y[i-1]);
      for(const st of a){const id=pack(st.ph,st.prev,pend);if(!dp[j].has(id)||dp[j].get(id).v<st.v)dp[j].set(id,{...st,pend,origin:node.origin,parent:node,letters:st.p,raw,swap,pos:i});}
    }
    for(let i=0;i<n;i++){
      for(const node of dp[i].values()){
        push(i,node,[y[i]],false);
        if(i>0&&i+1<n&&y[i]!==y[i-1]&&y[i+1]===y[i-1])push(i,node,[y[i-1],y[i]],true);
      }
    }
    if(!dp[n].size)return null;
    let best=null;for(const st of dp[n].values())if(!best||st.v>best.v)best=st;
    let p=[],raw=[],swaps=[];
    for(let x=best;x.parent;x=x.parent){p.unshift(...x.letters);raw.unshift(...x.raw);if(x.swap)swaps.unshift(x.pos);}
    const re=repair(encode(p,k,hold,best.origin),i=>swaps.includes(i));
    assert(re.out.join(",")===y.join(",")&&re.swaps.join(",")===swaps.join(","),"replay");
    const language=p.reduce((s,x,i)=>s+(i?lm[1][p[i-1]][x]:lm[0][x]),0)/n;
    return {score:best.v/n,language,phase:best.origin,swaps:swaps.length,plain:p,preview:p.slice(0,100).map(x=>gp.translit[x]).join("")};
  }
  // Verify the complete transducer language for every 3-symbol tape of length <=7.
  // In a deterministic repair, output repeat AA followed by B != A requires the next output A.
  let exhaustive=0;
  for(let n=1;n<=7;n++){
    const outputs=new Set();
    for(let u=0;u<3**n;u++){let z=u;const x=Array.from({length:n},()=>{const a=z%3;z=Math.floor(z/3);return a;});outputs.add(repair(x,()=>true).out.join(""));}
    for(let u=0;u<3**n;u++){let z=u;const y=Array.from({length:n},()=>{const a=z%3;z=Math.floor(z/3);return a;});
      const violations=y.flatMap((x,i)=>i>0&&i+1<n&&x===y[i-1]&&y[i+1]!==x&&(i+2>=n||y[i+2]!==x)?[i]:[]);
      // Every violation must be impossible; sufficiency is not claimed.
      if(violations.length)assert(!outputs.has(y.join("")),"deterministic obstruction unsound");
      exhaustive++;
    }
  }
  const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]].map(([a,b])=>({name:`p${a}-${b}`,y:gp.pages.filter(x=>x.page>=a&&x.page<=b).flatMap(x=>x.indices)}));
  const deterministic=chapters.map(({name,y})=>({name,n:y.length,repeats:y.filter((x,i)=>i&&x===y[i-1]).length,violations:y.flatMap((x,i)=>i>0&&i+1<y.length&&x===y[i-1]&&y[i+1]!==x&&(i+2>=y.length||y[i+2]!==x)?[i]:[])}));
  const donors=["0_welcome","0_koan_1","0_loss_of_divinity"],controls=[],originals=[],nulls=[];
  const terminal=chapters.at(-1).y;assert(terminal.length===308,"terminal length");
  const targets=[chapters[0],chapters.at(-2),chapters.at(-1)];
  for(const {name,k} of keys)for(const hold of [false,true]){
    for(let j=0;j<donors.length;j++){
      const s=sections.find(s=>s.name===donors[j]),p=s.x.slice(j*11,j*11+308),phase=(3+j*2)%k.length,random=rng(3301+j+100*k.length+Number(hold));
      assert(p.length===308,"donor size");
      const plant=repair(encode(p,k,hold,phase),()=>random()<q),fit=invert(plant.out,k,hold,model(s.name));
      controls.push({key:name,hold,donor:s.name,phase,swaps:plant.swaps.length,decodedPhase:fit?.phase,correct:fit?.plain.filter((x,i)=>x===p[i]).length??0,score:fit?.score,language:fit?.language});
    }
    const lm=model(null);
    for(const t of targets){const fit=invert(t.y,k,hold,lm);originals.push({key:name,hold,target:t.name,n:t.y.length,...(fit?{...fit,plain:undefined}:{noPath:true})});}
    for(let j=0;j<12;j++){
      const random=rng(30001+j+100*k.length+Number(hold)),y=[Math.floor(random()*29)];
      while(y.length<308){const a=y.at(-1);y.push(random()<86/12955?a:(a+1+Math.floor(random()*28))%29);}
      const fit=invert(y,k,hold,lm);nulls.push({key:name,hold,j,score:fit?.score??null,language:fit?.language??null});
    }
  }
  return {q,exhaustive,deterministic,controls,originals,nulls};
}
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(run(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
