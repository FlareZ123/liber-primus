# Native-width class enumerative rank gate (#3215)

## Decision

A class-conditioned rank is bijective and distinct from #3196's raw positional padding. The necessary class pattern is not independently supplied by the original LP2 source or by the historical GP/BASE29 examples examined. The direct observable candidate, the ciphertext's own width pattern, fails the authentic encrypted p56 control at 21 of 85 positions and also fails its width count (19 vs 6). Do not infer a plaintext class mask from original ciphertext or choose a rank convention by apparent language. No original key or unknown plaintext is recovered.

## Exact inverse and information accounting

Use the pinned literal GP expansions (22 single, seven double: TH, EO, NG, OE, AE, IA, EA), not contextual ING or aliases. For m runes with k double-width positions, the count-class domain has exactly

    D(m,k) = binom(m,k) * 22^(m-k) * 7^k.

For a known ordered mask b, its conditional domain is

    M(m,k) = 22^(m-k) * 7^k.

An ascending-GP mixed-radix rank uses the within-class ordinal d_i and radix r_i=22 or 7, computes R <- R*r_i+d_i, and decodes by successive division in reverse order using the known mask. The known-count but unknown-mask inverse uses lexicographic prefix blocks of size D(remaining, remainingWide - candidateWide) for each candidate GP symbol; skip complete blocks until the rank falls inside one, then recurse. Both preserve leading zero ranks through the known length. The exact extra mask ambiguity for a count-only frame is binom(m,k), even if a separate count is available; that factor is already included in D. It must not be charged twice.

If no class restriction is independently available, sum_k D(m,k)=29^m. Concatenating the ranks for every k with public offsets gives a permutation of the ordinary GP29 frame, with no additional redundancy or known-key equation by capacity alone. A ciphertext-defined mask can be used as public conditioning only with an actual sender that guarantees its recoverability; choosing ciphertext width itself as the plaintext mask forces class preservation. Likewise a ciphertext-defined count forces count preservation. A different mask mapping needs an independently fixed mapping/recipient; it is not excluded by this decision.

Illustrative original frame capacities (bit logarithms of exact integer domains, not measured entropy):

| physical frame | m | ciphertext k | fixed mask | known count | mask ambiguity | unrestricted |
|---|---:|---:|---:|---:|---:|---:|
| p55 | 76 | 19 | 307.527346 | 365.935436 | 58.408090 | 369.206556 |
| p0 | 262 | 69 | 1054.377792 | 1268.140789 | 213.762997 | 1272.791021 |
| whole unknown rune tape | 12956 | 3175 | 52531.052539 | 62932.373364 | 10401.320825 | 62940.001773 |

These counts use ciphertext k only to illustrate the proposed visible selector, not to assert the unknown plaintext has those widths. A physical rune count does not independently specify expanded Latin length. If both plaintext rune count m and literal Latin width L were separately supplied, k=L-m would select the count class, but neither a distinct L for the unknown text nor a width-mask instruction was established.

## Native-source selector gate

Using canonical GP-order indices and the exact literal width chart:

| source | runes | wide runes |
|---|---:|---:|
| unknown LP2 p0–55 | 12956 | 3175 (24.506%) |
| solved native pooled (nine records) | 2879 | 184 (6.391%) |
| p56 ciphertext | 85 | 19 |
| p56 solved plaintext | 85 | 6 |
| p57 original and solved plaintext | 95 each | 5 each |

The GP alphabet arrays agree exactly. Physical p56 has 21 position-wise width disagreements, so even the weaker count equality fails. p57 has zero disagreements, as expected for the transparent control, which supplies no evidence for class-preserving encryption. Native proportions are descriptive; they do not universally bound unknown LP2's register. Neither direct width-selector preservation rule is demonstrated by the encrypted solved control. An LP2-only class-preserving sender remains logically possible, but needs a new independent source cue.

The first-party 2013 GP chart supplies the labels, including spelling aliases, not a class ordering/side-channel instruction; the signed 2013 TCP protocol's BASE29 3301→3QO, with the archived BASE29 30→11 witness, specifies ordinary radix conversion, not a rank restricted by a plaintext mask. See [GP chart source](../resources/external/2013-twitter-stage-gematria-source.md) and [signed protocol](../resources/external/2013-tcp-server-signed-source.md). The period-available enumerative precedent is already documented in [#3022](https://github.com/FlareZ123/liber-primus/issues/3022); it does not authenticate this class selector. Original page framing and the GP chart alone do not supply both the ordering convention and plaintext class pattern. This is a scoped missing-input decision, not a comprehensive historical impossibility claim.

## Reproduce

The following core was executed in connected V8: all 25,260 GP29 sequences of lengths 0–3 roundtrip through both inverses; every count-class rank is unique and exhaustive. The input table above was computed from resources/liber-primus/lp2-corpus.json and resources/external/relikd-solved-gp29-native-v1.json; the Node filesystem wrapper below is provided for reproduction and was not run separately. No original rank-derived text or key was scored, and no blind key recovery was commissioned because the source gate failed.

```js
'use strict';
const fs = require('node:fs');
const C = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json'));
const N = JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json'));
const cls = C.translit.map(x=>x.length-1);
const groups = [0,1].map(v=>cls.flatMap((c,i)=>c===v?[i]:[]));
function choose(n,k){if(k<0||k>n)return 0n;let z=1n;for(let i=1;i<=k;i++)z=z*BigInt(n-i+1)/BigInt(i);return z}
function cap(n,k){return k<0||k>n?0n:choose(n,k)*22n**BigInt(n-k)*7n**BigInt(k)}
function w(x){return x.reduce((s,y)=>s+cls[y],0)}
function rank(x){let k=w(x),r=0n;for(let i=0;i<x.length;i++){for(let a=0;a<x[i];a++)r+=cap(x.length-i-1,k-cls[a]);k-=cls[x[i]]}return r}
function unrank(n,k,r){if(r<0n||r>=cap(n,k))throw Error('range');const x=[];for(let i=0;i<n;i++){for(let a=0;a<29;a++){const q=cap(n-i-1,k-cls[a]);if(r<q){x.push(a);k-=cls[a];break}r-=q}}return x}
function rankMask(x){return x.reduce((r,a)=>r*BigInt(groups[cls[a]].length)+BigInt(groups[cls[a]].indexOf(a)),0n)}
function unrankMask(mask,r){const x=[];for(let i=mask.length-1;i>=0;i--){const g=groups[mask[i]],b=BigInt(g.length);x.unshift(g[Number(r%b)]);r/=b}if(r)throw Error('range');return x}
let trials=0;
for(let n=0;n<=3;n++){
 const seen=Array.from({length:n+1},()=>new Set());
 for(let i=0;i<29**n;i++){
  const x=Array.from({length:n},(_,j)=>Math.floor(i/29**j)%29),k=w(x),r=rank(x);
  if(unrank(n,k,r).join()!==x.join()||unrankMask(x.map(a=>cls[a]),rankMask(x)).join()!==x.join()||seen[k].has(r))throw Error('inverse');
  seen[k].add(r);trials++;
 }
 for(let k=0;k<=n;k++)if(BigInt(seen[k].size)!==cap(n,k))throw Error('coverage');
}
if(C.runes.join('')!==N.runes.join(''))throw Error('alphabet');
const orig=C.pages.slice(0,56).flatMap(p=>p.indices);
const native=N.sections.map(s=>({name:s.name,x:[...s.source_text].map(x=>N.runes.indexOf(x)).filter(x=>x>=0)}));
console.log({trials,original:[orig.length,w(orig)],native:native.map(s=>[s.name,s.x.length,w(s.x)])});
for(const p of [56,57]){
 const x=C.pages[p].indices,y=native.find(s=>s.name.startsWith('p'+p)).x;
 if(x.length!==y.length)throw Error('alignment');
 console.log({p,n:x.length,kC:w(x),kP:w(y),mismatch:x.filter((v,i)=>cls[v]!==cls[y[i]]).length});
}
```

## Director fork

Retire this exact visible-width conditioning branch unless a new first-party rule supplies a plaintext class pattern or width total independently of unknown ciphertext content. No further rank-convention sweeps or language-scored class ranks are justified by mathematical reversibility alone. This does not duplicate #3022's complete output-composition quota or #2853's repeat framing; #3196's raw padded positional affine exclusions remain unchanged. No authoritative result change is warranted.
