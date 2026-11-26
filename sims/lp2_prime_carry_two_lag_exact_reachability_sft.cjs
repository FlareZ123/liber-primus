'use strict';
const fs=require('node:fs');
const path=require('node:path');
function exactAudit(corpus,solved){
  const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
  const c=corpus.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
  assert(c.length===3008,"chapter length");
  const clock=[];for(let n=2;clock.length<c.length;n++){let prime=true;for(let j=2;j*j<=n;j++)if(n%j===0){prime=false;break}if(prime)clock.push((n-1)%29)}
  const mod=x=>(x%29+29)%29;
  function reach(cipher,a,b,plain){
    let states=new Set([0]),jTrue=0,i=0;
    for(;i<cipher.length;i++){
      const next=new Set(),feedback=a*(cipher[i-1]??0)+b*(cipher[i-2]??0);
      for(const j of states){
        if(cipher[i]===0)next.add(j);
        if(mod(cipher[i]-feedback-clock[j])!==0)next.add(j+1);
      }
      states=next;
      if(plain){jTrue+=+(plain[i]!==0);assert(states.has(jTrue),"true path lost at "+i);}
      if(!states.size)break;
    }
    return {a,b,firstDead:i===cipher.length?null:i,endStates:states.size};
  }
  function encode(plain,a,b){let c=[],j=0;for(const p of plain){c.push(p===0?0:mod(p+a*(c.at(-1)??0)+b*(c.at(-2)??0)+clock[j++]));}return c}
  const plainOf=s=>Array.from(s.source_text).filter(x=>corpus.runes.includes(x)).map(x=>corpus.runes.indexOf(x));
  const p56=plainOf(solved.sections.find(s=>s.name==="p56_an_end"));
  const p56c=corpus.pages.find(p=>p.page===56).indices;
  assert(JSON.stringify(encode(p56,0,0))===JSON.stringify(p56c),"authentic p56 replay");
  const controls=[{name:"authentic p56",n:p56.length,...reach(p56c,0,0,p56)}];
  const native=solved.sections.filter(s=>!s.name.startsWith("p56")&&!s.name.startsWith("p57")).map(s=>({name:s.name,plain:plainOf(s)})).filter(s=>s.plain.length>=50).slice(0,3);
  assert(native.length===3,"native control count");
  for(let i=0;i<native.length;i++){const {name,plain}=native[i],a=[7,13,19][i],b=[11,5,8][i];controls.push({name,n:plain.length,...reach(encode(plain,a,b),a,b,plain)})}
  const rows=[];for(let a=0;a<29;a++)for(let b=1;b<29;b++)rows.push(reach(c,a,b));
  const survivors=rows.filter(x=>x.firstDead===null);
  const latest=rows.filter(x=>x.firstDead!==null).sort((x,y)=>y.firstDead-x.firstDead)[0];
  return {n:c.length,controls,keys:rows.length,survivors:survivors.length,latestDeath:latest,rows};
}
module.exports={exactAudit};
if(require.main===module){const root=path.resolve(__dirname,'..');const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));console.log(JSON.stringify(exactAudit(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));}
