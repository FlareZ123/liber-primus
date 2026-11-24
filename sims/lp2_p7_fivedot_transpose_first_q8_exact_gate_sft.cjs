"use strict";
/** Director #2616: fixed plaintext-transpose-first q8 F-hold necessary gate.
 * Standard-library Node22/CommonJS; read-only. Donor calibration is known-fit plaintext, not blind.
 */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const files=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/liber-primus/lp2-transcription.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/beowulf_oe_gp_profile_corrected.json",
  "resources/control/latin-vulgate-heldout-gp.json"
];
const root=path.resolve(__dirname,"..");
function run(raw, sourceShas) {
  const assert=(x,m)=>{if(!x)throw Error(m)};
  const gp=JSON.parse(raw[0]), n=1729,h=346,q=8,cut=230;
  const order=[0,1,2,3,4].sort((a,b)=>[3105.73973,3166.68765,2866.70402,3127.5,2936.20488][a]-[3105.73973,3166.68765,2866.70402,3127.5,2936.20488][b]);
  assert(order.join()==="2,4,0,3,1","source dot order");
  const pages=raw[1].split(/\r?\n%\r?\n/), ord=new Map(gp.runes.map((v,i)=>[v,i])),mixed=[];
  for(let p=8;p<=14;p++){const a=[];for(const v of pages[p]){if(v==="7")mixed.push(-1);else if(ord.has(v)){a.push(ord.get(v));mixed.push(ord.get(v))}}assert(a.join()===gp.pages[p].indices.join(),"page source equality "+p)}
  assert(mixed.length===n+1&&mixed.indexOf(-1)===692&&mixed.filter(x=>x===-1).length===1,"literal source 7");
  const C=mixed.filter(x=>x!==-1),F=C.filter(x=>x===0).length;
  assert(C.length===n&&F===66,"source length/zero");
  const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  /** @param {string} s @returns {number[]} */
  function native(s){const a=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));assert(t,"native token");a.push(t.i);w=w.slice(t.s.length)}}return a}
  /** @param {number[]} p */
  function columns(p){assert(p.length===n,"donor length");const src=[-1,...p],out=Array.from({length:5},()=>Array(h));for(let r=0;r<h;r++)for(let j=0;j<5;j++)out[order[j]][r]=src[5*r+j];assert(out[2][0]===-1,"marker");return out}
  /** @param {number[][]} pc */
  function uncolumns(pc){const a=[];for(let r=0;r<h;r++)for(const j of order)a.push(pc[j][r]);assert(a.shift()===-1,"natural marker");return a}
  /** @param {number[]} a @param {number} period */
  function stats(a,period=q){let r=0,b=0;for(let d=period;d<=3*period;d+=period)for(let i=d;i<a.length;i++)if(a[i]===a[i-d]){r++;if(i>d&&a[i-1]===a[i-d-1])b++}return [r,b]}
  /** @param {number[]} ciph @param {number} period */
  function bounds(ciph,period=q){
    const D=3*period+1;let S=new Map([["",[0,0,0,0]]]),peak=1;
    for(const c of ciph){
      const T=new Map(),z=String.fromCharCode(c);
      function merge(h,a,r,b){const o=T.get(h);if(o){o[0]=Math.min(o[0],a[0]+r);o[1]=Math.max(o[1],a[1]+r);o[2]=Math.min(o[2],a[2]+b);o[3]=Math.max(o[3],a[3]+b)}else T.set(h,[a[0]+r,a[1]+r,a[2]+b,a[3]+b])}
      for(const [h,a] of S){
        if(c===0)merge(h,a,0,0);
        let r=0,b=0;for(let d=period;d<=3*period;d+=period)if(h.length>=d&&h.charCodeAt(h.length-d)===c){r++;if(h.length>d&&h.charCodeAt(h.length-1)===h.charCodeAt(h.length-d-1))b++}
        merge((h+z).slice(-D),a,r,b);
      }
      S=T;peak=Math.max(peak,S.size);
    }
    const a=[Infinity,-Infinity,Infinity,-Infinity];for(const b of S.values()){a[0]=Math.min(a[0],b[0]);a[1]=Math.max(a[1],b[1]);a[2]=Math.min(a[2],b[2]);a[3]=Math.max(a[3],b[3])}
    return {rune:a.slice(0,2),bigram:a.slice(2),peak};
  }
  let seed=0x261604;const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
  for(let t=0;t<128;t++){
    const c=Array.from({length:18},()=>rng()%5),z=c.flatMap((v,i)=>v===0?[i]:[]),period=2+rng()%5,ss=[];
    for(let m=0;m<2**z.length;m++){const skip=new Set(z.filter((_,i)=>(m>>i)&1));ss.push(stats(c.filter((_,i)=>!skip.has(i)),period))}
    const b=bounds(c,period);for(let j=0;j<2;j++){const vals=ss.map(x=>x[j]);assert([Math.min(...vals),Math.max(...vals)].join()===(j?b.bigram:b.rune).join(),"toy mask oracle")}
  }
  const bo=bounds(C);assert(bo.rune.join()==="132,210"&&bo.bigram.join()==="4,10","original exact bounds");
  const P=[native(raw[2].replace(/^#.*$/gm,"")),...raw.slice(3,6).map(native)];
  const oe=JSON.parse(raw[6]),la=JSON.parse(raw[7]);P.push(Array.from(oe.sourceGpBase29,x=>oe.positiveControlAlphabet.indexOf(x)),la.runes);
  assert(P.map(x=>x.length).join()==="3510,217106,321327,62492,48012,2400","pinned control lengths");
  /** @param {number[]} p */
  function scan(p) {
    const cols=Array.from({length:5},(_,k)=>{const a=[],A=[0];for(let i=k;i<p.length;i+=5){if(p[i]!==0)a.push(p[i]);A.push(a.length)}const pref=[8,16,24].map(d=>{const s=new Int32Array(a.length+1);for(let i=0;i<a.length;i++)s[i+1]=s[i]+Number(i>=d&&a[i]===a[i-d]);return s});return {A,pref}});
    function within(start){let R=0,H=0;for(let d=0;d<5;d++){const p=start+d,k=p%5,i=(p-k)/5,len=d===4?345:346,{A,pref}=cols[k],a=A[i],b=A[i+len];H+=len-(b-a);for(let j=0;j<3;j++)R+=pref[j][b]-pref[j][Math.min(b,a+8*(j+1))]}return [R,H]}
    let min=Infinity,minOffset=-1,small=0,holdPossible=0,runePossible=0,jointPossible=0;
    for(let s=0;s<=p.length-n;s++){const [r,H]=within(s);if(r<min){min=r;minOffset=s}if(H<=F)holdPossible++;if(r<=bo.rune[1]){small++;const a=columns(p.slice(s,s+n)).flat().filter(x=>x>0),[R,B]=stats(a);assert(R>=r,"within lower bound");if(H<=F&&R>=bo.rune[0]&&R<=bo.rune[1]){runePossible++;if(B>=bo.bigram[0]&&B<=bo.bigram[1])jointPossible++}}}
    for(let j=0;j<32;j++){const s=Math.round(j*(p.length-n)/31),plain=p.slice(s,s+n),pc=columns(plain),a=pc.flat().filter(x=>x>0),[r,H]=within(s);assert(uncolumns(pc).join()===plain.join(),"geometry inverse");assert(H===n-a.length&&r===pc.reduce((v,c)=>v+stats(c.filter(x=>x>0))[0],0)&&r<=stats(a)[0],"prefix count equals direct within")}
    return {windows:p.length-n+1,minWithin:min,minOffset,withinAtMost210:small,holdPossible,runePossible,jointPossible};
  }
  const names=["solved LP1 reference","Shakespeare","Emerson","Gibran","Beowulf Old English","Vulgate Latin"];
  const scans=P.map((p,i)=>({name:names[i],n:p.length,...scan(p)}));
  assert(scans.map(x=>x.minWithin).join()==="286,244,246,258,229,356"&&scans.every(x=>x.withinAtMost210===0),"all-window necessary exclusion");
  const total=scans.reduce((a,b)=>a+b.windows,0);assert(total===644479,"window total");
  // Separate donor-only calibration. Known complete natural fit rows are supplied,
  // but key and all withheld plaintext are hidden from the predictor.
  // Model is frozen from the independent solved reference; no donor text is used
  // for its language probabilities.
  const train=P[0],un=new Int32Array(29),bi=new Int32Array(29*29),tri=new Int32Array(29**3),den=new Int32Array(29*29);
  for(let i=0;i<train.length;i++){let c=train[i];un[c]++;if(i>0)bi[train[i-1]*29+c]++;if(i>1){const ab=train[i-2]*29+train[i-1];tri[ab*29+c]++;den[ab]++}}
  const score=new Float64Array(29**3);for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++){const k=a*29+b,bu=(bi[b*29+c]+4*(un[c]+1)/(train.length+29))/(un[b]+4);score[k*29+c]=Math.log((tri[k*29+c]+4*bu)/(den[k]+4))}
  const mod=x=>(x+29)%29;
  /** @param {number[]} p @param {number[]} key */
  function plant(p,key){const pc=columns(p),cc=pc.map(x=>x.slice());let phase=0;for(let j=0;j<5;j++)for(let r=0;r<h;r++){const v=pc[j][r];cc[j][r]=v<0?v:v===0?0:(v+key[phase++%q])%29}return {pc,cc}}
  /** @param {number[][]} cc @param {number[][]} fit */
  function predict(cc,fit){
    const K=Array(q).fill(-1);let phase=0;
    for(let r=0;r<cut;r++){const v=fit[0][r],c=cc[0][r];if(v<=0)continue;const k=mod(c-v);assert(K[phase]===-1||K[phase]===k,"fit key conflict");K[phase]=k;phase=(phase+1)%q}
    assert(!K.includes(-1),"fit incomplete key");
    const starts=[],ends=[];
    for(let j=0;j<5;j++){starts[j]=[];ends[j]=[];for(let s=0;s<q;s++){if(j===0&&s!==0)continue;let a=s,legal=true;for(let r=0;r<cut;r++){const v=fit[j][r],c=cc[j][r];if(v<=0){if(v!==c)legal=false}else{if((v+K[a])%29!==c)legal=false;a=(a+1)%q}}if(legal){starts[j].push(s);ends[j].push(a)}}}
    assert(starts.every(x=>x.length===1),"donor fit must identify physical start phases");
    const init=ends.map(x=>x[0]),lastFit=order.map(j=>fit[j][cut-1]),a0=lastFit[3],b0=lastFit[4];
    let S=new Map(),peak=0;const state=(ph,a,b)=>ph.reduce((v,p,i)=>v+p*8**i,0)*841+a*29+b;
    S.set(state(init,a0,b0),{ph:init,a:a0,b:b0,score:0,out:""});
    for(let r=cut;r<h;r++)for(const j of order){const T=new Map(),c=cc[j][r];for(const st of S.values()){
      const push=(v,next)=>{const ph=st.ph.slice();ph[j]=next;const sc=st.score+score[(st.a*29+st.b)*29+v],id=state(ph,st.b,v),old=T.get(id);if(!old||sc>old.score)T.set(id,{ph,a:st.b,b:v,score:sc,out:st.out+String.fromCharCode(v)})};
      if(c===0)push(0,st.ph[j]);const v=mod(c-K[st.ph[j]]);if(v!==0)push(v,(st.ph[j]+1)%q);
    }S=T;peak=Math.max(peak,S.size)}
    let best=null,legal=0;for(const s of S.values())if(s.ph.slice(0,4).every((v,j)=>v===starts[j+1][0])){legal++;if(best===null||s.score>best.score)best=s}
    assert(best,"donor continuation");return {K,starts:starts.flat(),ends:ends.flat(),peak,legal,out:Array.from(best.out,c=>c.charCodeAt(0)),score:best.score};
  }
  const plants=[];
  for(const [j,i,key] of [[1,7,[3,19,2,8,11,25,4,7]],[2,17,[0,28,9,5,16,23,2,11]],[3,23,[12,9,24,5,3,1,8,0]]]){
    const start=Math.round(i*(P[j].length-n)/31),p=P[j].slice(start,start+n),{pc,cc}=plant(p,key),flat=pc.flat().filter(v=>v>=0),c=cc.flat().filter(v=>v>=0),a=flat.filter(v=>v>0),s=stats(a),b=bounds(c);
    assert(s.join()===stats(c.filter((_,i)=>flat[i]>0)).join(),"phase invariant on plant");
    assert(s[0]>=b.rune[0]&&s[0]<=b.rune[1]&&s[1]>=b.bigram[0]&&s[1]<=b.bigram[1],"plant must pass gate");
    const got=predict(cc,pc.map(x=>x.slice(0,cut))),truth=p.slice(cut*5-1),correct=got.out.filter((v,i)=>v===truth[i]).length;
    const re=plant([...p.slice(0,cut*5-1),...got.out],got.K),replay=re.cc.every((x,i)=>x.join()===cc[i].join());
    assert(got.K.join()===key.join()&&replay,"hidden donor key and exact ciphertext replay");
    plants.push({name:names[j],i,start,key,recovered:got.K,starts:got.starts,ends:got.ends,peak:got.peak,legalEndStates:got.legal,withheld:truth.length,correct,replay,score:got.score,holds:n-a.length,cipherF:c.filter(x=>x===0).length,stats:s,bounds:b});
  }
  assert(plants.map(x=>x.correct).join()==="580,574,580","frozen donor continuation accuracy");
  return {sourceShas,n,F,originalBounds:bo,toyCases:128,controlWindows:total,scans,plants,fitRows:cut,fitRunes:cut*5-1,withheldRunes:n-(cut*5-1),note:"Finite-register necessary gate; all masks and period-8 phase bijections. Donor calibration supplies fit-row plaintext, not blind ciphertext-only recovery."};
}
const raw=files.map(p=>fs.readFileSync(path.join(root,p),"utf8"));
const sourceShas=raw.map(s=>crypto.createHash("sha1").update("blob "+Buffer.byteLength(s)+"\0").update(s).digest("hex"));
const img=fs.readFileSync(path.join(root,"resources/liber-primus/24.jpg"));
if(crypto.createHash("sha256").update(img).digest("hex")!=="91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c")throw Error("p7 source image");
console.log(JSON.stringify(run(raw,sourceShas),null,2));
