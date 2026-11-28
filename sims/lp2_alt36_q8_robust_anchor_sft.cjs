"use strict";
// Exact, OOV-tolerant anchor union and continuous min-plus inverse for the preserved-word Round48 mod36 hypothesis.
const paths={
  "gp": "resources/liber-primus/lp2-corpus.json",
  "groups": "resources/liber-primus/lp2-page-groups-54-55-derived.json",
  "gold": "resources/external/relikd-solved-gp29-native-v1.json",
  "shakespeare": "resources/control/shakespeare_first300k.txt",
  "gibran": "resources/control/gibran_prophet_58585.txt",
  "emerson": "resources/control/emerson_essays_2944.txt",
  "textblob": "resources/control/english_wordfreq_textblob.txt",
  "dwyl": "resources/control/dwyl-english-alpha-gp13-14-only.txt"
};
function prepare(raw){
 const gp=JSON.parse(raw.gp),g=JSON.parse(raw.groups),gold=JSON.parse(raw.gold),A="0123456789abcdefghijklmnopqrstuvwxyz",tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const arr=s=>[...s].map(c=>A.indexOf(c)),render=w=>arr(w).map(i=>gp.translit[i]).join("");
 function word(w){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let v="";for(let i=0;i<w.length;){const t=w.startsWith("ING",i)?{s:"ING",i:21}:w.startsWith("IO",i)?{s:"IO",i:27}:tokens.find(t=>w.startsWith(t.s,i));if(!t)throw Error("unmapped "+w);v+=A[t.i];i+=t.s.length}return v}
 const donors=[raw.shakespeare,raw.gibran,raw.emerson].map(t=>(t.toUpperCase().match(/[A-Z]+/g)||[]).map(word)),clear=gold.sections.find(s=>s.name==="p57_parable").source_text.split(/[•⁜⁘\s]+/).filter(Boolean).map(w=>[...w].map(x=>A[gp.runes.indexOf(x)]).join(""));
 const base=new Set([...donors.flat(),...clear]),tb=raw.textblob.split(/\r?\n/).filter(l=>/^[a-z]+ \d+$/.test(l)).map(l=>word(l.split(" ")[0])),dw=raw.dwyl.split(/\r?\n/).filter(l=>/^[a-z]+$/.test(l)).map(word),mid=new Set([...base,...tb]),wide=new Set([...mid,...dw]);
 const body=g.p54.body_groups.slice(),tail=g.p55.groups.slice();body[body.length-1]+=tail.shift();body.push(...tail);
 if(body.length!==64||body.join("").length!==299||body.join("")!==[...gp.pages.find(x=>x.page===54).indices.slice(9),...gp.pages.find(x=>x.page===55).indices].map(x=>A[x]).join(""))throw Error("original drift");
 if(base.size!==12232||mid.size!==32082||wide.size!==60399)throw Error("lexicon drift");
 return {A,arr,render,word,donors,clear,base,mid,wide,body}
}

function seed(obs,lex,optimized=false){
 const A="0123456789abcdefghijklmnopqrstuvwxyz",arr=s=>Uint8Array.from([...s],c=>A.indexOf(c)),C=arr(obs),n=C.length,K=new Int8Array(8).fill(-1),keys=new Map();let nodes=0,full=0,forms=0,leaves=0;
 if(n<8)throw Error("anchor shorter than period");
 const pow=[1,36,1296,46656,1679616,60466176,2176782336,78364164096];
 function canon(){let k=0;for(let i=0;i<8;i++)k+=K[i]*pow[i];let b=k;for(let i=1;i<8;i++){k=Math.floor(k/36)+(k%36)*pow[7];if(k<b)b=k}return b}
 for(const w of lex){if(w.length<n)continue;forms++;const P=arr(w),m=P.length;
 function accept(){const k=canon();if(!keys.has(k))keys.set(k,w);leaves++}
 function suffix(i,h,last,retry){full++;let j=0;while(i<m){if(m-i<n-h)return;const c=(P[i]+K[j])%36;j=(j+1)&7;if(c===last){if(++retry>=8)return;continue}retry=0;last=c;i++;if(c<29){if(h===n||c!==C[h])return;h++}}if(h===n)accept()}
 function prefix(i,h,j,last,retry){
   nodes++;const slack=m-i-(n-h);if(slack<0)return;
   if(j===8){suffix(i,h,last,retry);return}
   if(i===m)throw Error("premature key");
   const p=P[i],next=j+1;
   if(h<n&&C[h]!==last){const c=C[h];K[j]=(c-p+36)%36;prefix(i+1,h+1,next,c,0)}
   if(last<36&&retry<7){K[j]=(last-p+36)%36;prefix(i,h,next,last,retry+1)}
   if(slack>0)for(let c=29;c<36;c++){if(c===last)continue;K[j]=(c-p+36)%36;prefix(i+1,h,next,c,0)}
 }
 function recursive(i,h,j,last,retry){
   nodes++;const slack=m-i-(n-h);if(slack<0)return;
   if(i===m){if(h===n)accept();return}
   const p=P[i],next=(j+1)&7,k=K[j];
   if(k>=0){const c=(p+k)%36;if(c===last){if(retry<7)recursive(i,h,next,last,retry+1)}else if(c>=29){if(slack>0)recursive(i+1,h,next,c,0)}else if(h<n&&c===C[h])recursive(i+1,h+1,next,c,0);return}
   if(h<n&&C[h]!==last){const c=C[h];K[j]=(c-p+36)%36;recursive(i+1,h+1,next,c,0)}
   if(last<36&&retry<7){K[j]=(last-p+36)%36;recursive(i,h,next,last,retry+1)}
   if(slack>0)for(let c=29;c<36;c++){if(c===last)continue;K[j]=(c-p+36)%36;recursive(i+1,h,next,c,0)}
   K[j]=-1
 }
 if(optimized)prefix(0,0,0,36,0);else recursive(0,0,0,36,0)
 }
 return {nodes,full,forms,leaves,keys:[...keys]}
}

function evaluate(p,ids){
 const {A,arr,render,donors,wide,body}=p;
 const root={next:Array(29).fill(null),w:null};for(const w of wide){let n=root;for(const p of arr(w)){if(!n.next[p])n.next[p]={next:Array(29).fill(null),w:null};n=n.next[p]}n.w=w}
 const N=296,INF=1e6,id=(j,last)=>j*37+last;
 function run(K,C){
 const by=Array.from({length:N},()=>Array.from({length:36},()=>[])),enc=Array.from({length:N},()=>Array(29).fill(null)),silent=Array.from({length:N},()=>[]);
 for(let s=0;s<N;s++)for(let p=0;p<29;p++){let j=Math.floor(s/37),last=s%37,c=(p+K[j])%36,count=0;while(c===last){j=(j+1)&7;if(++count===8)break;c=(p+K[j])%36}if(count===8)continue;const t=id((j+1)&7,c);by[s][c].push([p,t]);enc[s][p]=[c,t];if(c>=29&&!silent[s].includes(t))silent[s].push(t)}
 function close(v){const q=[];for(let s=0;s<N;s++)if(v[s]<INF)q.push(s);for(let i=0;i<q.length;i++){const s=q[i];for(const t of silent[s])if(v[t]>v[s]){v[t]=v[s];q.push(t)}}return v}
 const blank=()=>new Int32Array(N).fill(INF);
 function encode(W){let s=id(0,36);return W.map(w=>{let o="";for(const p of arr(w)){const e=enc[s][p];if(!e)throw Error("dead control");if(e[0]<29)o+=A[e[0]];s=e[1]}return o})}
 function decode(C){let v=blank();for(let j=0;j<8;j++)v[id(j,36)]=0;const groups=[];for(const obs of C){const target=arr(obs),m=target.length,words=new Set();v=close(v);let lex=blank(),visits=0;
 function visit(n,s,i,cost){visits++;if(n.w!==null&&i===m){words.add(n.w);if(lex[s]>cost)lex[s]=cost}if(i<m)for(const [p,t] of by[s][target[i]])if(n.next[p])visit(n.next[p],t,i+1,cost);for(let c=29;c<36;c++)for(const [p,t] of by[s][c])if(n.next[p])visit(n.next[p],t,i,cost)}
 for(let s=0;s<N;s++)visit(root,s,0,v[s]);
 let cur=v.slice();for(const c of target){let nx=blank();for(let s=0;s<N;s++)if(cur[s]<INF)for(const [p,t] of by[s][c])if(nx[t]>cur[s])nx[t]=cur[s];cur=close(nx)}
 for(let s=0;s<N;s++)if(cur[s]<INF)cur[s]++;
 for(let s=0;s<N;s++)v[s]=Math.min(lex[s],cur[s]);
 groups.push({obs,support:words.size,sample:[...words].slice(0,4).map(render),min:Math.min(...v),visits})
 }return {min:Math.min(...v),independentUnsupported:groups.filter(z=>!z.support).length,groups}}
 const result=decode(C),W=donors[1].slice(Math.floor(donors[1].length*.57)+100,Math.floor(donors[1].length*.57)+164),plant=decode(encode(W));if(plant.min!==0)throw Error("plant failed");
 return {K,result,plant:{n:W.length,min:plant.min,unsupported:plant.independentUnsupported}}
 }
 const out=[];for(const num of ids){let x=num;const K=[];for(let i=0;i<8;i++){K.push(x%36);x=Math.floor(x/36)}out.push({num,...run(K,body)})}
 return {wide:wide.size,out}
}
const expected=[
  {
    "i": 54,
    "register": "wide",
    "obs": "hs0eaj15d8lkc",
    "forms": 28988,
    "nodes": 137173095,
    "full": 0,
    "leaves": 0,
    "keys": []
  },
  {
    "i": 47,
    "register": "mid",
    "obs": "63g2eis46ql",
    "forms": 3145,
    "nodes": 563557014,
    "full": 0,
    "leaves": 0,
    "keys": []
  },
  {
    "i": 12,
    "register": "base",
    "obs": "n78hl0o5b1",
    "forms": 1630,
    "nodes": 374914830,
    "full": 284771702,
    "leaves": 3,
    "keys": [
      [
        44321370793,
        "3fgi9gogr9"
      ],
      [
        53850532201,
        "ani9ga0a5ogr9"
      ],
      [
        56027314537,
        "ani9ga0a5ogr9"
      ]
    ]
  },
  {
    "i": 45,
    "register": "base",
    "obs": "8so5ajebji",
    "forms": 1630,
    "nodes": 374914830,
    "full": 284771702,
    "leaves": 5,
    "keys": [
      [
        29747019654,
        "nafon1o9go6i"
      ],
      [
        20244179994,
        "d4if54adgr9"
      ],
      [
        381348400330,
        "190ia69inkq"
      ],
      [
        520813317546,
        "d4ifi41ogr9"
      ],
      [
        128992497051,
        "d4ifi9gogr9"
      ]
    ]
  }
];
const mins=[44,44,42,41,46,46,44,46],unsupported=[44,44,42,41,45,46,44,46],ids=expected.flatMap(x=>x.keys.map(k=>k[0]));
function main(raw,mode){const p=prepare(raw);if(mode.startsWith("anchor=")){const i=Number(mode.slice(7)),e=expected.find(z=>z.i===i);if(!e)throw Error("unknown anchor");const z=seed(p.body[i],p[e.register],i===12||i===45);const k=z.keys.map(x=>x[0]).sort((a,b)=>a-b),w=e.keys.map(x=>x[0]).sort((a,b)=>a-b);if(JSON.stringify(k)!==JSON.stringify(w)||z.forms!==e.forms||z.leaves!==e.leaves||z.nodes!==e.nodes||z.full!==e.full)throw Error("anchor result drift: "+JSON.stringify(z));return {i,register:e.register,obs:p.body[i],...z}}
if(mode==="eval"){const z=evaluate(p,ids);z.out.forEach((x,i)=>{if(x.result.min!==mins[i]||x.result.independentUnsupported!==unsupported[i])throw Error("inverse result drift")});return z}
throw Error("use eval or anchor=54|47|12|45")}
module.exports={prepare,seed,evaluate,main};
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,"..");const raw=Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,fs.readFileSync(path.join(root,p),"utf8")]));console.log(JSON.stringify(main(raw,process.argv[2]||"eval"),null,2));}
