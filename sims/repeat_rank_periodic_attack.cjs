"use strict";
/**
 * Original-source attack on a reversible 29-to-28 feedback alphabet.
 * The 29th code is the literal repetition of the previous ciphertext rune.
 * Two 28-rank orderings are studied: linear deletion and circular increment.
 *
 * A fixed mod-28 additive key with period <=128 cannot hide GP-English
 * concentration in the rank stream. Search both orderings, page-reset and
 * continuous phase, then calibrate the family maximum on independently
 * generated self-avoiding ciphertext retaining all observed repeat positions.
 *
 * Run manually: node sims/repeat_rank_periodic_attack.cjs
 * All inputs are checked-in resources. Uses Node.js builtins only.
 */
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const pages=corpus.pages.filter(p=>p.status==="unsolved"&&p.indices.length).map(p=>p.indices);
const {parseLP2Words}=require("./lp2_word_pages.cjs");
const words=parseLP2Words(fs.readFileSync(path.join(root,"resources/lp2-transcription.txt"),"utf8")).words;
const sourceFiles={Shakespeare:"shakespeare_first300k.txt",Emerson:"emerson_essays_2944.txt",Gibran:"gibran_prophet_58585.txt"};
const runeToIndex=new Map(corpus.runes.map((v,i)=>[v,i]));
const tokenToIndex=new Map(corpus.translit.map((v,i)=>[v,i]));
let rng=0x42a1cace;
/** @returns {number} */
function random(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return(rng>>>0)/4294967296;}
/** @param {number} n */
function draw(n){return Math.floor(random()*n);}
/**
 * @param {number} prev @param {number} current
 * @param {"linear"|"circular"} model
 */
function decode(prev,current,model){
  if(prev===current)return 28;
  return model==="linear"?current-(current>prev?1:0):(current-prev+28)%29;
}
/**
 * @param {number} prev @param {number} rank
 * @param {"linear"|"circular"} model
 */
function encode(prev,rank,model){
  if(rank===28)return prev;
  return model==="linear"?rank+(rank>=prev?1:0):(prev+1+rank)%29;
}
/** @param {string} text @returns {number[][]} */
function englishWords(text){
  const all=(text.toUpperCase().match(/[A-Z]+/g)||[]);
  return all.map(v=>{
    v=v.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
    const out=[];
    for(let i=0;i<v.length;){
      const dig=tokenToIndex.get(v.slice(i,i+2));
      if(dig!==undefined){out.push(dig);i+=2;}
      else{const t=tokenToIndex.get(v[i]);if(t!==undefined)out.push(t);i++;}
    }
    return out;
  }).filter(v=>v.length>0);
}
/** @param {number[][]} material */
function scan(material){
  let best={ioc:-1,period:0,model:"",reset:false};
  const predetermined={};
  for(let k=1;k<=128;k++){
    const counts=Array.from({length:4},()=>new Uint16Array(k*28));
    const ns=[new Uint16Array(k),new Uint16Array(k)];
    let g=0;
    for(const p of material){
      let t=0;
      for(let i=1;i<p.length;i++,t++,g++){
        const prev=p[i-1],cur=p[i];
        if(prev===cur)continue;
        const a=decode(prev,cur,"linear"),b=decode(prev,cur,"circular");
        const x=(t%k)*28,y=(g%k)*28;
        counts[0][x+a]++;counts[1][y+a]++;
        counts[2][x+b]++;counts[3][y+b]++;
        ns[0][t%k]++;ns[1][g%k]++;
      }
    }
    const num=[0,0,0,0],den=[0,0];
    for(let phase=0;phase<k;phase++){
      for(let z=0;z<2;z++){const n=ns[z][phase];den[z]+=n*(n-1);}
      for(let v=0;v<28;v++)for(let z=0;z<4;z++){
        const n=counts[z][phase*28+v];num[z]+=n*(n-1);
      }
    }
    for(let z=0;z<4;z++){
      const ioc=num[z]/den[z%2],model=z<2?"linear":"circular",reset=z%2===0;
      if(ioc>best.ioc)best={ioc,period:k,model,reset};
      if([1,16,64,128].includes(k))predetermined[k+":"+model+":"+(reset?"page":"global")]=ioc;
    }
  }
  return {best,predetermined};
}
/** @returns {number[][]} */
function matchedNull(){
  return pages.map(p=>{
    const result=[draw(29)];
    for(let i=1;i<p.length;i++){
      const prev=result[i-1];
      result.push(p[i]===p[i-1]?prev:encode(prev,draw(28),"linear"));
    }
    return result;
  });
}
/**
 * @param {number[][]} material @param {number} period
 * @param {"linear"|"circular"} model @param {boolean} reset
 */
function atPeriod(material,period,model,reset){
  const count=new Uint16Array(period*28),n=new Uint16Array(period);
  let t=0;
  for(const p of material){
    if(reset)t=0;
    for(let i=1;i<p.length;i++,t++){
      const rank=decode(p[i-1],p[i],model);
      if(rank<28){count[(t%period)*28+rank]++;n[t%period]++;}
    }
  }
  let a=0,b=0;
  for(let j=0;j<period;j++){
    b+=n[j]*(n[j]-1);
    for(let q=0;q<28;q++){const m=count[j*28+q];a+=m*(m-1);}
  }
  return a/b;
}
/**
 * @param {number[]} source @param {number} period
 * @param {"linear"|"circular"} model @param {boolean} reset
 */
function plant(source,period,model,reset){
  const key=Array.from({length:period},()=>draw(28));
  const result=[];
  let g=0,matched=0,total=0,repeats=0;
  for(const shape of pages){
    const off=draw(source.length-shape.length);
    const plain=source.slice(off,off+shape.length);
    const page=[draw(29)];
    for(let i=1;i<shape.length;i++,g++){
      const t=(reset?i-1:g)%period;
      const rank=plain[i]===28?28:(plain[i]+key[t])%28;
      const next=encode(page[i-1],rank,model);
      page.push(next);repeats+=+(next===page[i-1]);
      const inverted=decode(page[i-1],next,model);
      matched+=+((inverted===28?28:(inverted-key[t]+28)%28)===plain[i]);
      total++;
    }
    result.push(page);
  }
  if(matched!==total)throw Error("Planted inverse mismatch");
  return {ioc:atPeriod(result,period,model,reset),repeats};
}
/** @param {number[]} values */
function describe(values){
  const x=[...values].sort((a,b)=>a-b);
  return {n:x.length,min:x[0],mean:values.reduce((a,b)=>a+b,0)/x.length,
    median:x[Math.floor(x.length/2)],q95:x[Math.ceil(x.length*.95)-1],max:x.at(-1)};
}
/** @param {number[][]} src */
function byLength(src){
  const tab=new Map();
  for(const w of src){
    if(!tab.has(w.length))tab.set(w.length,{count:0,sum:new Float64Array(87),sq:new Float64Array(87)});
    const row=tab.get(w.length);
    row.count++;
    const local=new Uint8Array(87);
    for(let i=1;i<w.length;i++)local[3*w[i]+(i===w.length-1?2:i===1?0:1)]++;
    for(let j=0;j<87;j++){row.sum[j]+=local[j];row.sq[j]+=local[j]*local[j];}
  }
  return tab;
}
/**
 * @param {number[]} seen
 * @param {Map<number,number>} lengths
 * @param {number[][]} src
 */
function place(seen,lengths,src){
  const table=byLength(src),candidates=[];
  for(let letter=0;letter<29;letter++){
    const expected=[0,0,0],sd2=[0,0,0];
    for(const [len,n] of lengths){
      const row=table.get(len);
      if(!row)throw Error("Missing English source length "+len);
      for(let b=0;b<3;b++){
        const ix=letter*3+b,mean=row.sum[ix]/row.count;
        expected[b]+=n*mean;
        sd2[b]+=n*Math.max(0,row.sq[ix]/row.count-mean*mean);
      }
    }
    const chi=expected.reduce((s,v,i)=>s+(seen[i]-v)**2/Math.max(1,sd2[i]),0);
    candidates.push({glyph:corpus.translit[letter],chi,expected,sd:sd2.map(Math.sqrt)});
  }
  candidates.sort((a,b)=>a.chi-b.chi);
  return {bestThree:candidates.slice(0,3),EA:candidates.find(x=>x.glyph==="EA")};
}
function main(){
  if(pages.length!==55||pages.reduce((s,p)=>s+p.length,0)!==12956||words.length!==2896)
    throw Error("Original LP2 corpus contract changed");
  for(const model of ["linear","circular"])for(let prev=0;prev<29;prev++)
    for(let rank=0;rank<29;rank++)
      if(decode(prev,encode(prev,rank,model),model)!==rank)throw Error("Non-bijective rank");
  const original=scan(pages),nullMax=[];
  for(let trial=0;trial<200;trial++)nullMax.push(scan(matchedNull()).best.ioc);
  const english={};
  for(const [name,file] of Object.entries(sourceFiles))
    english[name]=englishWords(fs.readFileSync(path.join(root,"resources/control",file),"utf8"));
  const shakespeare=english.Shakespeare.flat();
  const positive=[];
  for(const model of ["linear","circular"])for(const reset of [true,false])
    for(const period of [16,64,128]){
      const ic=[],reps=[];
      for(let trial=0;trial<12;trial++){
        const x=plant(shakespeare,period,model,reset);
        ic.push(x.ioc);reps.push(x.repeats);
      }
      positive.push({model,reset,period,score:describe(ic),repeatsMean:describe(reps).mean,exactInversion:true});
    }
  const lengths=new Map(),seen=[0,0,0];
  for(const w of words){
    lengths.set(w.length,(lengths.get(w.length)||0)+1);
    const x=Array.from(w.runes,r=>runeToIndex.get(r));
    for(let i=1;i<x.length;i++)if(x[i]===x[i-1])
      seen[i===x.length-1?2:i===1?0:1]++;
  }
  if(seen.reduce((a,b)=>a+b,0)!==63)throw Error("Original whole-word repeat contract changed");
  const marker={observed:seen,binOrder:["second except final","middle","last"],source:{}};
  for(const [name,src] of Object.entries(english))marker.source[name]=place(seen,lengths,src);
  const report={seed:"0x42a1cace",runePages:55,runes:12956,words:2896,baseline:1/28,
    original,matchedNull:{trials:200,maxima:describe(nullMax),
      exceedances:nullMax.filter(v=>v>=original.best.ioc).length,
      pUpper:(1+nullMax.filter(v=>v>=original.best.ioc).length)/201},
    positive,marker};
  process.stdout.write(JSON.stringify(report,null,2)+"\n");
}
if(require.main===module)main();
module.exports={decode,encode,scan,atPeriod,place};
