'use strict';
/**
 * Original-input Old English fixed-substitution SFT, Director #802.
 * CommonJS for Node.js 22 on Windows 11; no local file writes.
 */
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_REPO = 'old-english-learner-texts/old-english-texts';
const SOURCE_COMMIT = '117a910ab47b74b9b1964a589c044ab5fd59a307';
const SIZE = 12956;
const ALPHABET = 'F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA'.split(' ');
const INDEX = new Map(ALPHABET.map((x, i) => [x, i]));
const PAIRS = new Set(['TH','NG','EO','OE','AE','IA','EA']);
const SOURCES = [
  ['Beowulf', 'beowulf/beowulf_with_line_numbers.txt', '671f8292157d9d422cde0c426090605495a34f33', false],
  ['Chronicle', 'ISWOC/chrona.conll', '5f366333ee67cf09f57b972730c9de4a66f182c9', true],
  ['Aelfric', 'ISWOC/æls.conll', '8fc1f9278f53534ea6305c0a80dfed40b6618ca9', true],
  ['Apollonius', 'ISWOC/apt.conll', '1659d05b87372142de07b12d4621b627721afdf4', true],
  ['Gospel', 'ISWOC/wscp.conll', '659efd69eeac65687ca080cc19f9d05a11ba0018', true]
];

/** @param {string} text @param {boolean} foreign */
function encode(text, foreign=false) {
  let s = text.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase()
    .replace(/ð|þ/g,'th').replace(/æ/g,'ae').replace(/œ/g,'oe')
    .replace(/ƿ/g,'w').replace(/ȝ/g,'g').replace(/ſ/g,'s')
    .replace(/k/g,'c').replace(/v/g,'u');
  if (foreign) s=s.replace(/q/g,'c').replace(/z/g,'s');
  const out=[];
  for(let i=0;i<s.length;) {
    const d=s.slice(i,i+2).toUpperCase();
    if(PAIRS.has(d)) { out.push(INDEX.get(d));i+=2; }
    else {
      const v=INDEX.get(s[i].toUpperCase());
      if(v===undefined) return null;
      out.push(v);i++;
    }
  }
  return out;
}

/** @param {string} text @param {boolean} conll */
function words(text,conll) {
  if(!conll) return text.replace(/^\d+\s+/gm,'').match(/\p{L}+/gu)||[];
  return text.split(/\r?\n/).map(x=>x.split('\t')[1]).filter(Boolean)
    .flatMap(x=>x.match(/\p{L}+/gu)||[]);
}

/** @param {number[]} runes */
function ioc(runes) {
  const f=new Int32Array(29);
  for(const x of runes)f[x]++;
  let a=0;
  for(const n of f)a+=n*(n-1);
  return a/(runes.length*(runes.length-1));
}

/** @param {number[]} x @param {number} n */
function minWindowIoc(x,n) {
  assert(x.length>=n);
  const f=new Int32Array(29);
  for(let i=0;i<n;i++)f[x[i]]++;
  let pairs=0;
  for(const m of f)pairs+=m*(m-1);
  let minimum=pairs;
  for(let i=n;i<x.length;i++){
    const a=x[i-n],b=x[i];
    if(a!==b){
      pairs-=2*(f[a]-1);
      f[a]--;
      pairs+=2*f[b];
      f[b]++;
    }
    if(pairs<minimum)minimum=pairs;
  }
  return {min:minimum/(n*(n-1)),windows:x.length-n+1};
}

/** @param {string} relative */
const read = relative=>readFileSync(path.join(ROOT,relative),'utf8');

/** @param {[string,string,string,boolean]} source */
async function frozen(source){
  const url='https://raw.githubusercontent.com/'+SOURCE_REPO+'/'+SOURCE_COMMIT+
    '/'+source[1].split('/').map(encodeURIComponent).join('/');
  const r=await fetch(url);
  if(!r.ok) throw new Error('HTTP '+r.status+' '+url);
  const b=Buffer.from(await r.arrayBuffer());
  const sha=createHash('sha1').update(Buffer.from('blob '+b.length+'\0'))
    .update(b).digest('hex');
  assert.equal(sha,source[2],'upstream source changed: '+source[1]);
  return b.toString('utf8');
}

function plantedPositive(sourceRunes) {
  const c=sourceRunes.map(x=>(7*x+11)%29);
  const p=c.map(x=>((x-11+29)*25)%29);
  assert.deepEqual(p,sourceRunes);
  assert.equal(ioc(c),ioc(sourceRunes));
}

async function main(){
  const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
  assert.deepEqual(corpus.translit,ALPHABET);
  const original=corpus.pages.filter(p=>p.page>=0&&p.page<=55).flatMap(p=>p.indices);
  assert.equal(original.length,SIZE);
  const ink=read('im-results/lp2-original-ink-critical-sites.tsv')
    .trim().split(/\r?\n/).slice(1).map(s=>s.split('\t'));
  const singles=ink.filter(row=>row[2]==='S');
  const singletonTypes=new Set(singles.map(row=>corpus.runes.indexOf(row[4])));
  assert.equal(singles.length,83);
  assert.equal(singletonTypes.size,28);
  assert(!singletonTypes.has(-1));
  const observed=ioc(original);
  console.log('Original LP2: N='+SIZE+' words1='+singles.length+
    ' types1='+singletonTypes.size+' IoC='+observed.toFixed(11));
  const union=new Set();
  let min=Infinity,windows=0;
  for(const source of SOURCES){
    const tokens=words(await frozen(source),source[3]);
    const converted=tokens.map(w=>encode(w));
    const accepted=converted.filter(Boolean);
    const stream=accepted.flat();
    const ones=new Set(accepted.filter(w=>w.length===1).map(w=>w[0]));
    for(const x of ones)union.add(x);
    const win=minWindowIoc(stream,SIZE);
    min=Math.min(min,win.min);windows+=win.windows;
    plantedPositive(stream.slice(0,SIZE));
    console.log(source[0]+': words='+accepted.length+' rejected='+
      (tokens.length-accepted.length)+' runes='+stream.length+
      ' types1='+ones.size+' IoC='+ioc(stream).toFixed(11)+
      ' min_window_IoC='+win.min.toFixed(11)+' windows='+win.windows);
  }
  assert.equal(union.size,8);
  assert(observed<min);
  assert(singletonTypes.size>union.size);
  assert.equal(windows,126383);
  console.log('Old English union types1='+union.size+
    ' exact-length windows='+windows+' lowest_IoC='+min.toFixed(11));
  for(const c of [
    ['Modern English','resources/control/shakespeare_first300k.txt'],
    ['Latin','resources/control/latin-vulgate-latin26-wholewords.txt']
  ]){
    const stream=words(read(c[1]),false).map(w=>encode(w,true))
      .filter(Boolean).flat();
    console.log(c[0]+' wrong-language control runes='+stream.length+
      ' IoC='+ioc(stream).toFixed(11));
  }
  let seed=0x3301;
  const next=()=>{
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    return seed%29;
  };
  const random=Array.from({length:SIZE},next);
  const randomSingles=Array.from({length:83},next);
  console.log('Uniform 29-symbol control: IoC='+ioc(random).toFixed(11)+
    ' distinct_singletons='+new Set(randomSingles).size);
  console.log('DECISION: no original unknown plaintext; frozen global Old English substitution fails.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
