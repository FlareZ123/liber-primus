"use strict";

const assert=require("node:assert/strict");
const {execFileSync}=require("node:child_process");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");

const URL="https://gitlab.com/onecool/3301-public.git";
const N=29;
const EXPECT=["ANEND","WITHIN","THEDEEPWEB","THEREEXISTS","HASHES","DUTY","PILGRIM","SEECOUTTHISPAGE"];

/** @param {number} x */
function mod(x){return ((x%N)+N)%N;}

/** @param {number} count */
function primes(count){
  const out=[];
  for(let n=2;out.length<count;n++){
    if(out.every(p=>p*p>n||n%p)) out.push(n);
  }
  return out;
}

/** @param {unknown} x */
function strings(x){
  if(typeof x==="string") return [x];
  return Array.isArray(x)?x.flatMap(strings):[];
}

/** @param {string} s */
function canon(s){
  return s.toUpperCase().replace(/[^A-Z]/g,"")
    .replaceAll("K","C").replaceAll("V","U").replaceAll("Z","S").replaceAll("Q","C");
}

function main(){
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"onecool-p56-"));
  const clone=path.join(tmp,"repo");
  execFileSync("git",["clone","--depth=1",URL,clone],{encoding:"utf8",timeout:180000});

  const map=JSON.parse(fs.readFileSync(path.join(clone,"liber_primus","rune.json"),"utf8"));
  const letters=Array.from({length:N},(_,i)=>map[String(i)].letter);
  const page=JSON.parse(fs.readFileSync(path.join(clone,"liber_primus","json","56.json"),"utf8"));
  const cipher=strings(page.ciphertext).flatMap(s=>(s.match(/\d+/g)||[]).map(Number));
  assert.equal(cipher.length,85);

  const ps=primes(120);
  for(const p of ps){
    assert.equal(mod(59-p),mod(-(p-1)));
    for(let c=0;c<N;c++){
      const c1=c+1;
      const d1=mod((c1-1)+mod(59-p))+1;
      assert.equal(d1-1,mod(c-(p-1)));
    }
  }

  let states=[{text:"",key:0,nulls:[],fSeen:0}];
  for(const c of cipher){
    const next=[];
    for(const st of states){
      if(c===0){
        next.push({...st,nulls:[...st.nulls,st.fSeen],fSeen:st.fSeen+1});
      }
      const p=ps[st.key];
      const d=mod(c+mod(59-p));
      next.push({
        text:st.text+letters[d],
        key:st.key+1,
        nulls:[...st.nulls],
        fSeen:st.fSeen+(c===0?1:0)
      });
    }
    states=next;
  }

  const passing=states.filter(s=>EXPECT.every(w=>canon(s.text).includes(canon(w))));
  assert.equal(passing.length,1);
  assert.deepEqual(passing[0].nulls,[3]);

  const out={
    source_repo:URL,
    source_page:"liber_primus/json/56.json",
    cipher_runes:cipher.length,
    literal_f_ciphertexts:cipher.filter(x=>x===0).length,
    forum_coordinate_formula:"modifier = (59 - p_n) mod 29",
    established_formula:"key = (p_n - 1) mod 29; decrypt C-K",
    identity:"59 == 1 (mod 29), hence (59-p_n) == -(p_n-1) (mod 29)",
    unique_control_nulls:passing[0].nulls,
    decoded_transliteration:passing[0].text
  };
  fs.writeFileSync(path.join(process.env.RUNNER_TEMP||os.tmpdir(),"onecool-2016-p56-formula-equivalence.json"),JSON.stringify(out,null,2));
  console.log(JSON.stringify(out,null,2));
}
try{main();}catch(e){console.error(e);process.exitCode=1;}
