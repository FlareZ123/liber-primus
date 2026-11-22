'use strict';
/**
 * p32 11x11 prime-sum / 2013 DH / BASE29 hypothesis gate.
 * Reproduces the candidate p=569,g=563,A=463,B=499 mapping and tests
 * only two source-motivated direct consumers: repeating BASE29 key A1,
 * and the simplest A1-origin route with step K mod 121.
 * This is a hypothesis test, not an established LP2 cipher.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { plaintextWords } = require('./authentic_decryption_regression.cjs');
const { trainNativeGP, languageScore } = require('./historical_solve_path_transfer.cjs');
const ROOT = path.resolve(__dirname, '..');
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRS';
const EXPECTED_ROWS = [563,617,287,540,743,513,577,579,603,537,486];
const EXPECTED_COLS = [569,429,641,669,518,611,463,690,378,578,499];
const DIRECT = {sub:-6.197463570060401,add:-6.3356693893211515,beaufort:-6.314105908028523};
const ROUTE = {pathRead:-6.517839670740096,scatter:-6.288564971551836};
const mod=(a,m)=>(a%m+m)%m;
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
function isPrime(n){if(n<2)return false;for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true;}
function powMod(a,e,m){let x=mod(a,m),z=1;while(e>0){if(e%2)z=z*x%m;x=x*x%m;e=Math.floor(e/2);}return z;}
function order(a,m){let x=1;for(let e=1;e<m;e++){x=x*a%m;if(x===1)return e;}return null;}
function dlog(g,y,p){let x=1;for(let e=0;e<p-1;e++){if(x===y)return e;x=x*g%p;}return null;}
function invMod(a,m){for(let x=1;x<m;x++)if(a*x%m===1)return x;return null;}
function toBase29(n){if(!n)return'0';let s='';while(n){s=ALPHABET[n%29]+s;n=Math.floor(n/29);}return s;}
function run(){
  const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
  const page=corpus.pages.find(p=>p.page===32),cipher=page.indices;
  assert.equal(cipher.length,121);
  const w=cipher.map(i=>corpus.prime[i]);
  const rows=Array.from({length:11},(_,r)=>w.slice(11*r,11*r+11).reduce((a,b)=>a+b,0));
  const cols=Array.from({length:11},(_,c)=>Array.from({length:11},(_,r)=>w[11*r+c]).reduce((a,b)=>a+b,0));
  assert.deepEqual(rows,EXPECTED_ROWS);assert.deepEqual(cols,EXPECTED_COLS);
  const primeRows=rows.filter(isPrime),primeCols=cols.filter(isPrime);
  assert.deepEqual(primeRows,[563,617,743,577]);assert.deepEqual(primeCols,[569,641,463,499]);
  // Positive controls reproduce the signed 2013 DH/BASE29 examples.
  assert.equal(toBase29(3301),'3QO');
  const exA=dlog(5,8,23),exB=dlog(5,19,23);
  assert.equal(exA,6);assert.equal(exB,15);
  assert.equal(powMod(8,exB,23),2);assert.equal(powMod(19,exA,23),2);
  // Candidate role assignment: image height p, width g; only remaining prime sums <p are A,B.
  const p=569,g=563,ab=[...primeRows,...primeCols].filter(x=>x<p&&x!==g).sort((a,b)=>a-b);
  assert.deepEqual(ab,[463,499]);const [A,B]=ab;
  assert.ok(isPrime(p));assert.equal(order(g,p),568);
  const a=dlog(g,A,p),b=dlog(g,B,p);
  assert.equal(a,149);assert.equal(b,256);
  const K=powMod(A,b,p);assert.equal(K,powMod(B,a,p));assert.equal(K,291);
  const digits=[10,1];assert.equal(toBase29(K),'A1');
  // Direct repeating BASE29 digits as a GP29 additive key.
  const direct=['sub','add','beaufort'].map(mode=>{
    const plain=cipher.map((c,i)=>{const k=digits[i%2];return mode==='sub'?mod(c-k,29):mode==='add'?mod(c+k,29):mod(k-c,29);});
    return {mode,plain,text:plain.map(i=>corpus.translit[i]).join('')};
  });
  // A1-origin route: start at linear cell 0 and step K mod 121.
  const step=K%121,inv=invMod(step,121);assert.equal(step,49);assert.equal(inv,42);assert.equal(gcd(step,121),1);
  const pathRead=Array.from({length:121},(_,k)=>cipher[k*step%121]);
  const scatter=Array(121);for(let k=0;k<121;k++)scatter[k*step%121]=cipher[k];
  const recovered=Array(121);for(let i=0;i<121;i++)recovered[i]=pathRead[i*inv%121];
  assert.deepEqual(recovered,cipher);
  const route=[{name:'pathRead',plain:pathRead,text:pathRead.map(i=>corpus.translit[i]).join('')},
               {name:'scatter',plain:scatter,text:scatter.map(i=>corpus.translit[i]).join('')}];
  const nativeText=fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp1-plaintext-reference.txt'),'utf8');
  const native=plaintextWords(nativeText.replace(/^#.*$/gm,'')).flat();
  const model=trainNativeGP(fs.readFileSync(path.join(ROOT,'resources/control/gibran_prophet_58585.txt'),'utf8'));
  const controls=[];for(let i=0;i+121<=native.length;i+=23)controls.push(languageScore(native.slice(i,i+121),model));
  assert.equal(controls.length,150);
  const nativeMin=Math.min(...controls),sorted=[...controls].sort((x,y)=>x-y);
  const directScored=direct.map(x=>({mode:x.mode,score:languageScore(x.plain,model),text:x.text}));
  const routeScored=route.map(x=>({name:x.name,score:languageScore(x.plain,model),text:x.text}));
  for(const x of directScored){assert.ok(x.score<nativeMin);assert.ok(Math.abs(x.score-DIRECT[x.mode])<1e-12);}
  for(const x of routeScored){assert.ok(x.score<nativeMin);assert.ok(Math.abs(x.score-ROUTE[x.name])<1e-12);}
  return {
    status:'Provisional p32 DH parameter mapping; no LP2 plaintext',
    p32PrimeSums:{rows,cols,primeRows,primeCols},
    candidateDH:{p,g,A,B,order:568,privateExponents:[a,b],publicChecks:[powMod(g,a,p),powMod(g,b,p)],sharedSecret:K,base29Digits:digits,base29:'A1',unverifiedAlignment:'private exponent 256 equals p50 table size 256'},
    directRepeatingKey:{keyDigits:digits,outputs:directScored},
    A1OriginRoute:{start:'A1',linearStart:0,step,inverseStep:inv,outputs:routeScored},
    nativeControls:{model:'Gibran-trained GP trigram',length:121,count:controls.length,minimum:nativeMin,median:sorted[75],maximum:Math.max(...controls),rawP32:languageScore(cipher,model)},
    limitation:'Mapping p32 sums to DH roles is inferred, not specified by Cicada. Direct A1 key and simplest step-49 route are negative. A1-as-coordinate/tree traversal and the 256-cell p50 alignment remain hypotheses without a source-selected next operation.'
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run};
