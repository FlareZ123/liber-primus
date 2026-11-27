'use strict';
// Witten, Neal, Cleary (CACM 1987), Figs 3 and 4, adapted to GP29+EOF.
// Full-byte framing is an exploratory LP2 transport, not a Cicada instruction.
function experiment(gp, lp1, donorTexts, testOriginal=true) {
  const assert=(x,m)=>{if(!x)throw Error(m)}, eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  const HALF=32768,Q=16384,TQ=49152,TOP=65535,MAX=16383,EOF=29;
  function model(wrong=false) {
    const order=Array.from({length:30},(_,i)=>i), f=Array(30).fill(1);
    if(wrong)f[0]=2;
    let total=30+Number(wrong), rescales=0;
    return {
      find:s=>order.indexOf(s), symbol:i=>order[i],
      range(i){let lo=0;for(let j=i+1;j<30;j++)lo+=f[j];return [lo,lo+f[i],total]},
      locate(v){let j=0,hi=total;while(hi-f[j]>v)hi-=f[j++];return j},
      total:()=>total, rescales:()=>rescales,
      update(i) {
        if(total===MAX){total=0;for(let j=0;j<30;j++){f[j]=(f[j]+1)>>1;total+=f[j]}rescales++}
        let j=i;while(j>0&&f[j-1]===f[j])j--;
        [order[i],order[j]]=[order[j],order[i]];f[j]++;total++;
      }
    };
  }
  function encode(plain,wrong=false){
    const m=model(wrong), out=[];let low=0,high=TOP,follow=0,byte=0,bits=0,emitted=0;
    function bit(v){byte|=v<<bits;bits++;emitted++;if(bits===8){out.push(byte);byte=0;bits=0}}
    function emit(v){bit(v);while(follow>0){bit(1-v);follow--}}
    for(const s of [...plain,EOF]){
      const i=m.find(s);assert(i>=0,"source symbol");const [a,b,t]=m.range(i),w=high-low+1;
      high=low+Math.floor(w*b/t)-1;low+=Math.floor(w*a/t);
      for(;;){
        if(high<HALF)emit(0);
        else if(low>=HALF){emit(1);low-=HALF;high-=HALF}
        else if(low>=Q&&high<TQ){follow++;low-=Q;high-=Q}
        else break;
        low*=2;high=2*high+1;
      }
      if(s!==EOF)m.update(i);
    }
    follow++;emit(low<Q?0:1);
    out.push(byte); // published unconditional final flush, including aligned empty byte
    return {bytes:out,emitted,rescales:m.rescales()};
  }
  function decode(bytes,wrong=false){
    const m=model(wrong),plain=[];let low=0,high=TOP,value=0,pos=0;
    function bit(){
      if(pos>=8*(bytes.length+14))return -1; // historical guard: 14 extra EOF byte reads
      const b=pos>=8*bytes.length?1:(bytes[pos>>3]>>(pos&7))&1;pos++;return b;
    }
    for(let i=0;i<16;i++){const b=bit();if(b<0)return {status:"missing-eof",decoded:0};value=2*value+b}
    for(;;){
      assert(value>=low&&value<=high,"arithmetic invariant");
      const w=high-low+1,v=Math.floor(((value-low+1)*m.total()-1)/w),i=m.locate(v),s=m.symbol(i);
      const [a,b,t]=m.range(i);high=low+Math.floor(w*b/t)-1;low+=Math.floor(w*a/t);
      for(;;){
        if(high<HALF){}
        else if(low>=HALF){low-=HALF;high-=HALF;value-=HALF}
        else if(low>=Q&&high<TQ){low-=Q;high-=Q;value-=Q}
        else break;
        low*=2;high=2*high+1;const bitValue=bit();
        if(bitValue<0)return {status:"missing-eof",decoded:plain.length,readBits:pos};
        value=2*value+bitValue;
      }
      if(s===EOF){
        const rep=encode(plain,wrong);
        const status=eq(rep.bytes,bytes)?"canonical":"noncanonical-eof";
        return {status,decoded:plain.length,canonicalBytes:rep.bytes.length,readBits:pos,rescales:m.rescales(),...(status==="canonical"?{plain}: {})};
      }
      plain.push(s);m.update(i);
    }
  }
  // For m octets, pad the big-endian integer to the smallest n with 29^n >= 256^m.
  // Since 256>29, n determines m uniquely. Empty array maps to empty digits.
  function width(m){
    const target=1n<<BigInt(8*m);let n=Math.ceil(8*m/Math.log2(29)),p=29n**BigInt(n);
    while(p<target){p*=29n;n++}while(n>0&&p/29n>=target){p/=29n;n--}return n;
  }
  function pack(bytes){
    let x=0n;for(const b of bytes)x=(x<<8n)+BigInt(b);
    const a=Array(width(bytes.length));for(let i=a.length-1;i>=0;i--){a[i]=Number(x%29n);x/=29n}assert(x===0n,"radix overflow");return a;
  }
  function unpack(a){
    let m=Math.floor(a.length*Math.log2(29)/8);
    while(width(m)>a.length)m--;while(width(m+1)<=a.length)m++;
    if(width(m)!==a.length)return {status:"width-impossible",bytesExpected:m};
    let x=0n;for(const v of a){assert(Number.isInteger(v)&&v>=0&&v<29,"digit");x=x*29n+BigInt(v)}
    if(x>=(1n<<BigInt(8*m)))return {status:"integer-overflow",bytesExpected:m};
    const bytes=Array(m);for(let i=m-1;i>=0;i--){bytes[i]=Number(x&255n);x>>=8n}
    assert(eq(pack(bytes),a),"byte framing");return {status:"framed",bytes};
  }
  function receive(a,wrong=false){
    const u=unpack(a);if(u.status!=="framed")return u;
    const v=decode(u.bytes,wrong);if(v.status==="canonical")assert(eq(pack(encode(v.plain,wrong).bytes),a),"exact forward cipher replay");
    return {bytes:u.bytes.length,...v};
  }
  const mod=x=>(x%29+29)%29,primes=[];
  for(let n=2;primes.length<85;n++)if(!primes.some(p=>p*p<=n&&n%p===0))primes.push(n);
  let k=0;const p56=gp.pages[56].indices.map((c,i)=>i===56?0:mod(c-(primes[k++]-1)));
  assert(k===84&&p56.map(i=>gp.translit[i]).join("")==="ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE","p56 solved");
  const runeMap=new Map(gp.runes.map((r,i)=>[r,i]));
  const lp1pages=lp1.split("%").map(s=>[...s].filter(c=>runeMap.has(c)).map(c=>runeMap.get(c))).filter(a=>a.length);
  assert(eq([3,8,9,10,11,14].map(i=>lp1pages[i].length),[157,187,207,192,169,89]),"LP1 native geometry");
  const native=[...[3,8,9,10,11,14].map(i=>({id:"LP1p"+i,a:lp1pages[i]})),{id:"LP2p56",a:p56},{id:"LP2p57",a:gp.pages[57].indices}];
  const tok=gp.translit.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);
  function translit(s){
    const a=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){
      w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
      for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3;continue}if(w.startsWith("IO",i)){a.push(27);i+=2;continue}
        const t=tok.find(x=>w.startsWith(x[0],i));assert(t,"donor token");a.push(t[1]);i+=t[0].length;}
    }return a;
  }
  const repeats=a=>a.slice(1).filter((x,i)=>x===a[i]).length;
  function control(id,a,negative=true){
    const e=encode(a),c=pack(e.bytes),v=receive(c);assert(v.status==="canonical"&&eq(v.plain,a),"native inverse "+id);
    const row={id,plain:a.length,bytes:e.bytes.length,bits:e.emitted,digits:c.length,ratio:c.length/a.length,repeats:repeats(c),rescales:e.rescales};
    if(negative){
      const tests=[["truncate-byte",pack(e.bytes.slice(0,-1)),false],["append-byte",pack([...e.bytes,0]),false],["wrong-init",c,true]];
      row.mutations=tests.map(([type,frame,wrong])=>{const result=receive(frame,wrong);return {type,status:result.status,samePlain:result.status==="canonical"&&eq(result.plain,a)}});
    }return row;
  }
  const controls=native.map(({id,a})=>control(id,a));
  const literary=[];for(let i=0;i<donorTexts.length;i++){
    const a=translit(donorTexts[i]);for(const n of [308,729,3008,12956]){
      assert(a.length>=n,"donor length");literary.push(control("donor"+i+"-"+n,a.slice(0,n),false));
    }
  }
  // Exhaustive small byte framing and long rescale controls, without original ciphertext.
  for(let b=0;b<256;b++)assert(eq(unpack(pack([b])).bytes,[b]),"octet roundtrip");
  for(const a of [[],[0,0],[0,255,0],[255,255,255]])assert(eq(unpack(pack(a)).bytes,a),"leading zeros");
  const stress=control("rescale",Array.from({length:20000},(_,i)=>i%29),false);assert(stress.rescales>0,"rescale exercised");
  const empty=receive(pack(encode([]).bytes));assert(empty.status==="canonical"&&empty.decoded===0,"empty");
  const summary={model:"WNC 1987, 16-bit, max16383, 30 symbols all counts1, descending frequency tie-swap, EOF29, LSB byte order, unconditional final zero-padding flush",frame:"big-endian bytes, fixed minimal sufficient radix29 width; exact canonical re-encode",controls,literary,stress,empty:empty.status};
  if(!testOriginal)return summary;
  const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55],[0,55]];
  const original=ranges.map(([lo,hi])=>{
    const a=gp.pages.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices);
    const v=receive(a);return {range:[lo,hi],digits:a.length,repeats:repeats(a),...v};
  });
  assert(eq(original.map(x=>x.digits),[729,1145,1729,1903,1021,1433,1680,3008,308,12956]),"physical chapter cuts");
  return {...summary,original};
}
if(typeof module!=="undefined")module.exports=experiment;
if(typeof require!=="undefined"&&typeof module!=="undefined"&&require.main===module){
  const fs=require("node:fs"),path=require("node:path"),read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
  const paths=["resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
  console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/transcriptions/lp1_wulfic_canonical.txt"),paths.map(read),!process.argv.includes("--controls-only")),null,2));
}
