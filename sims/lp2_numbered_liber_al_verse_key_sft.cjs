// Agent50: Director #2885, exact historical verse-indexed key test.
// Run: node sims/lp2_numbered_liber_al_verse_key_sft.cjs
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function experiment(corpus,chapters,native) {
  const assert=(v,m)=>{if(!v)throw Error(m)};
  const gp=corpus.translit, mod=x=>((x%29)+29)%29;
  const tokens=gp.map((t,i)=>[t,i]).sort((a,b)=>b[0].length-a[0].length);
  function encode(s) {
    s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
    const a=[];
    for(let i=0;i<s.length;){if(!/[A-Z]/.test(s[i])){i++;continue}const t=tokens.find(([t])=>s.startsWith(t,i));assert(t,"Unencodable "+s[i]);a.push(t[1]);i+=t[0].length}
    return a;
  }
  const p=n=>corpus.pages.find(x=>x.page===n).indices;
  const items=[p(36).slice(99),p(37).slice(0,91),p(37).slice(91,189),p(37).slice(189).concat(p(38).slice(0,57)),p(38).slice(57,186)];
  assert(items.map(x=>x.length).join()==="139,91,98,96,129","original item slices");
  const reference=native.originals.slice(0,4).flatMap(x=>Array.from(x.runic_text).map(r=>corpus.runes.indexOf(r)).filter(i=>i>=0));
  const held=p(57);assert(held.length===95,"p57");
  const counts=Array.from({length:29},()=>Array(29).fill(.5));
  for(let i=1;i<reference.length;i++)counts[reference[i-1]][reference[i]]++;
  const log=counts.map(row=>{const sum=row.reduce((a,b)=>a+b,0);return row.map(x=>Math.log(29*x/sum))});
  const score=a=>a.slice(1).reduce((s,x,i)=>s+log[a[i]][x],0)/Math.max(1,a.length-1);
  const ioc=a=>{const h=Array(29).fill(0);a.forEach(x=>h[x]++);return h.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1))};
  const render=a=>a.slice(0,35).map(x=>gp[x]).join(" ");
  function encrypt(a,k,sign,hold){let j=0;return a.map(x=>hold&&x===0?0:mod(x+sign*k[j++%k.length]))}
  function inverse(c,k,sign){
    let states=new Map([["0,-1",{j:0,last:-1,n:1n,s:0,a:[]}]]);
    for(let i=0;i<c.length;i++){
      const next=new Map();
      const push=(st,j,x)=>{const key=j+","+x, s=st.s+(st.last<0?0:log[st.last][x]),old=next.get(key);if(!old)next.set(key,{j,last:x,n:st.n,s,a:st.a.concat(x)});else{old.n+=st.n;if(s>old.s){old.s=s;old.a=st.a.concat(x)}}};
      for(const st of states.values()){
        if(c[i]===0)push(st,st.j,0);
        const x=mod(c[i]-sign*k[st.j%k.length]);if(x!==0)push(st,st.j+1,x);
      }
      if(!next.size)return {paths:"0",failure:i};
      states=next;
    }
    let n=0n,best=null;for(const st of states.values()){n+=st.n;if(!best||st.s>best.s)best=st}
    assert(encrypt(best.a,k,sign,true).join()===c.join(),"strict replay");
    return {paths:String(n),score:score(best.a),ioc:ioc(best.a),prefix:render(best.a),decoded:best.a};
  }
  const rows=[], controls=[];
  chapters.forEach((raw,ci)=>{
    const verses=[...raw.matchAll(/^([1-9]\d*)\.\s*([\s\S]*?)(?=^[1-9]\d*\.\s*|(?![\s\S]))/gm)];
    assert(verses.slice(0,5).map(v=>Number(v[1])).join()==="1,2,3,4,5","verse labels");
    for(let j=0;j<5;j++){
      const verse=verses[j][2],k=encode(verse);assert(k.length>0,"key");
      for(const sign of [1,-1]){
        const c=items[j],a=c.map((v,i)=>mod(v-sign*k[i%k.length]));
        assert(encrypt(a,k,sign,false).join()===c.join(),"ordinary replay");
        const strict=inverse(c,k,sign);
        const plant=Array.from({length:c.length},(_,i)=>held[i%held.length]);
        const planted=encrypt(plant,k,sign,true), pinv=inverse(planted,k,sign);
        assert(BigInt(pinv.paths)>0n,"native plant lost");
        const plain=encrypt(plant,k,sign,false).map((v,i)=>mod(v-sign*k[i%k.length]));
        assert(plain.join()===plant.join(),"ordinary plant");
        controls.push({chapter:ci+1,item:j+1,sign,paths:pinv.paths,mapCorrect:pinv.decoded.filter((v,i)=>v===plant[i]).length,total:plant.length});
        const {decoded,...strictSummary}=strict;
        rows.push({chapter:ci+1,item:j+1,sign,keyLength:k.length,wordCount:(verse.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g)||[]).length,cipherLength:c.length,ordinary:{score:score(a),ioc:ioc(a),prefix:render(a)},strict:strictSummary});
      }
    }
  });
  return {encoding:"GP longest token; QU→CW,V→U,K→C,Z→S; ignore nonletters, no cross-punctuation digraph; each literal verse repeated cyclically and reset at matching red label",referenceRunes:reference.length,heldoutP57:{score:score(held),ioc:ioc(held)},rows,controls};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/2013-liber-al-bookcode-I.txt","resources/external/2013-liber-al-bookcode-II.txt","resources/external/2013-liber-al-bookcode-III.txt","resources/external/2014-onion6-seven-rune-pages.json"];
const result=experiment(JSON.parse(read(paths[0])),paths.slice(1,4).map(read),JSON.parse(read(paths[4])));
console.log(JSON.stringify(result,null,2));
