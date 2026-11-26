'use strict';
/** Director #2958: exact ordered equality-partition gate; no fitted remapping, shifts, or radix selection. */
const fs=require('node:fs'), path=require('node:path');
const specs=[
  [
    "resources/external/2014-stage05-three-onion-hex-blocks.txt",
    "threeHex"
  ],
  [
    "resources/historical/cicada2013-second-onion-icmp-echo.hex.txt",
    "hex"
  ],
  [
    "resources/historical/cicada-2013-os-wisdom-folly.bin.b64",
    "b64"
  ],
  [
    "resources/historical/cicada2013-twitter-560.13-xor-png.b64",
    "b64"
  ],
  [
    "resources/historical/cicada2013-twitter-b64-carrier.b64",
    "b64"
  ],
  [
    "resources/historical/cicada2013-twitter-decoded.png.b64",
    "b64"
  ],
  [
    "resources/historical/cicada2013-twitter-outt-mirror.png.b64",
    "b64"
  ],
  [
    "resources/historical/cicada2013-2014-twitter-profile.png.b64",
    "b64"
  ],
  [
    "resources/historical/cicada2013-gematria-jpeg.b64",
    "b64"
  ],
  [
    "resources/historical/cicada2014-onion5-signed.asc",
    "signedMedia"
  ],
  [
    "resources/cicada2014-outguess-hex.json",
    "shards"
  ],
  [
    "resources/external/cicada2012-midi-source.json",
    "midiLength"
  ],
  [
    "resources/cicada2014-openpuff-magic-squares.txt",
    "integers"
  ],
  [
    "resources/external/2013-01-14-missing-primes-pastebin.md",
    "missingPrimes"
  ],
  [
    "resources/historical/cicada2012-midi-50-entries.txt",
    "words"
  ],
  [
    "resources/historical/2015-thomasandfriends-07b0d26589b807c1daa3.txt",
    "indexedCounts"
  ]
];
function decode64(raw){const A="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";const s=raw.replace(/\s/g,"");if(!/^[A-Za-z0-9+/]*={0,2}$/.test(s)||s.length%4)throw Error("base64 format");let n=0,b=0,arr=[];for(const c of s.replace(/=+$/,"")){n=(n<<6)|A.indexOf(c);b+=6;if(b>=8){b-=8;arr.push((n>>>b)&255)}}return arr;}

function hex(s){const t=s.replace(/\s/g,"");if(!/^(?:[0-9a-f]{2})+$/i.test(t))throw Error("hex");return t.match(/../g);}

function extract(path,kind,raw){
const out=[];const add=(label,seq,unit="byte",literal=null)=>out.push({label,path,unit,seq,literal});
const addHex=(label,s)=>{const t=hex(s);add(label,t.map(x=>parseInt(x,16)),"byte",t)};
if(kind==="threeHex"){const m=[...raw.matchAll(/^[^\n]*:\s*-\s*(1033|761|3301)\s*\r?\n([0-9a-f]+)\s*$/gmi)];if(m.length!==3)throw Error("threeHex framing");for(const x of m)addHex("2014 preliminary onion "+x[1],x[2]);}
else if(kind==="hex")addHex(path.split("/").pop(),raw);
else if(kind==="b64")add(path.split("/").pop(),decode64(raw));
else if(kind==="signedMedia"){let part=raw.split("-----BEGIN PGP SIGNATURE-----")[0];let groups=[],run=[];for(const line of part.split(/\r?\n/)){if(/^(?:[0-9a-f]{2})+$/i.test(line))run.push(line);else if(run.length){groups.push(run.join(""));run=[];}}if(run.length)groups.push(run.join(""));const media=groups.filter(x=>x.startsWith("ffd8")||x.startsWith("fff3"));if(media.length!==3)throw Error("signedMedia framing");media.forEach((x,i)=>addHex("signed stage05 media "+(i+1),x));}
else if(kind==="shards"){const j=JSON.parse(raw);for(let i=0;i<j.sources.length;i++)addHex("LP1 original OutGuess hex shard "+i,j.sources[i].hex);}
else if(kind==="midiLength"){const j=JSON.parse(raw);out.push({label:"2012 signed MIDI literal file",path,unit:"byte",declaredLength:j.size_bytes,seq:null,literal:null});}
else if(kind==="integers"){add("2014 three magic squares",raw.trim().split(/\s+/).map(Number),"integer");}
else if(kind==="missingPrimes"){const block=raw.split("~~~~text")[1].split("~~~~")[0];const ns=block.trim().split(/\r?\n/).flatMap(l=>l.replace(/^\d+\.\s*/,"").split(/\s+/).map(Number));add("2013 missing prime list (participant witness)",ns,"integer");}
else if(kind==="words"){add("2012 MIDI submission list (derived)",raw.trim().split(/\s+/),"word");}
else if(kind==="indexedCounts"){add("2015 LP2 page length list (derived)",raw.trim().split(/\r?\n/).map(l=>Number(l.split(":")[1])),"integer");}
return out;
}

function standards(){const ps=[];for(let n=2;ps.length<64;n++)if(ps.every(q=>n%q))ps.push(n);const K=ps.map(p=>Math.floor((Math.cbrt(p)-Math.floor(Math.cbrt(p)))*2**32)>>>0);const T=Array.from({length:64},(_,i)=>Math.floor(Math.abs(Math.sin(i+1))*2**32)>>>0);const words=(w,le)=>w.flatMap(x=>[0,1,2,3].map(i=>(x>>>(8*(le?i:3-i)))&255));if(K[0]!==0x428a2f98||K[63]!==0xc67178f2||T[0]!==0xd76aa478||T[63]!==0xeb86d391)throw Error("standard constants");return [[K,"SHA-256 K","https://datatracker.ietf.org/doc/html/rfc6234#section-5.1"],[T,"MD5 T","https://www.rfc-editor.org/rfc/rfc1321.html#section-3.4"]].flatMap(([w,name,path])=>[false,true].map(le=>({label:name+" "+(le?"LE":"BE"),path,unit:"byte",seq:words(w,le),literal:null})));}

function compare(a,b){if(a.length!==b.length)throw Error("shape");let e=0,t=0,c=0,firstGridOnly=null,firstSourceOnly=null;for(let i=0;i<a.length;i++)for(let j=0;j<i;j++){const x=a[i]===a[j],y=b[i]===b[j];e+=Number(x);t+=Number(y);c+=Number(x&&y);if(x&&!y&&!firstGridOnly)firstGridOnly=[j,i,a[j],a[i],b[j],b[i]];if(y&&!x&&!firstSourceOnly)firstSourceOnly=[j,i,a[j],a[i],b[j],b[i]];}return {distinct:new Set(b).size,gridEqualPairs:e,sourceEqualPairs:t,sharedEqualPairs:c,gridOnly:e-c,sourceOnly:t-c,firstGridOnly,firstSourceOnly,exact:e===c&&t===c};}

function run(grid,corpus){const a=grid.pages.flatMap(p=>p.tokens);if(a.length!==256||new Set(a).size!==161||a[7]!==a[14])throw Error("original shape");const unique=[...new Set(a)];const positive=a.map(x=>(unique.indexOf(x)*73+19)&255);const wrong=positive.slice();wrong[14]=255;while(wrong[14]===wrong[7])wrong[14]--;if(!compare(a,positive).exact||compare(a,wrong).exact)throw Error("control");
return {schema:1,original:{length:a.length,distinct:unique.length,equalPairs:compare(a,a).gridEqualPairs},controls:"bijection positive and broken-repeat negative pass",candidates:corpus.map(({label,path,unit,seq,literal,declaredLength})=>{const length=seq?seq.length:declaredLength;return {label,path,unit,length,comparison:length===256&&seq?compare(a,seq):null,literalMatches:literal&&length===256?literal.filter((x,i)=>x===a[i]).length:null};})};}
if(require.main===module){const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-grid-256.json")),[...specs.flatMap(([p,k])=>extract(p,k,read(p))),...standards()]),null,2));}
module.exports={compare,run};
