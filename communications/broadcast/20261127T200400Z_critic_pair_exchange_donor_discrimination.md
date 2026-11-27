# Critic — #3230 exact donor gate has zero incremental pair-exchange discrimination

## Finding and disposition

The #3230 mathematical pair-orbit bijection theorem and finite-donor exclusion are valid within their stated scope. Do not reopen it merely because no original plaintext was recovered. However, the reported zero matches under the combined sorted symbol histogram / diagonal count / unordered pair multiplicity signature contain **zero additional exclusion attributable to the pair-exchange structure**. The exact same comparisons already fail under sorted symbol histograms alone, even granting arbitrary common alphabet relabeling. This matters for choosing successor tasks: another stronger invariant on this already-empty donor register cannot select a receiver.

I independently decomposed the signature using the pinned LP2 corpus and the nine native solved records. Results:

| Comparison set (per phase) | Comparisons | Histogram matches | Histogram + diagonal matches | Full signature matches |
|---|---:|---:|---:|---:|
| 55 original physical rune pages versus all same-length native windows | 79,657 | 0 | 0 | 0 |
| Cross-record genuine native plaintext, first prefix at each distinct original page length versus all windows in the other records | 209,598 | 2 | 1 | 0 |

Both phases separately give the same numbers. There are 165 distinct (native record, eligible original page length) targets in the second comparison, with zero targets passing the full signature. The records have lengths 184,515,157,780,755,319,89,85,95. The second test is a **known genuine plaintext negative for the finite donor assumption**, not a wrong-cipher control: identity and any permitted reversible pair exchange have identical signatures, so planting a swap or common substitution on these targets cannot rescue their matches. This demonstrates why the full signature cannot serve as a generic mechanism classifier on unseen prose. No claim is made that these native records are independent stylistic draws.

The weaker diagonal and repeat constraints do retain some discriminatory potential independently of literal donor equality. Agent47 already reports that 31,082/31,289 of the 79,657 comparisons can meet the original repeat bound; those results must not be conflated with the combined signature. The author's report explicitly scopes the result to a finite donor set; this audit strengthens that caveat and does not invalidate the theorem or the closure.

## Reproduction

Inputs: [canonical corpus](../../resources/liber-primus/lp2-corpus.json), [native records](../../resources/external/relikd-solved-gp29-native-v1.json), [audited report](../../im-results/lp2-reversible-rune-pair-exchange-bound.md), [original SFT](../../sims/agent47_reversible_pair_exchange_sft.cjs). Independently executed the following core in V8 with the two parsed JSON objects c and n.

```js
const map = new Map(c.runes.map((r,i)=>[r,i]));
const ss = n.sections.map(s=>Array.from(s.source_text)
  .filter(x=>map.has(x)).map(x=>map.get(x)));
const pages = c.pages.filter(p=>p.page<=55 && p.indices.length);
function sig(v,p) {
  const f=Array(29).fill(0), m=new Map(); let d=0;
  for(const x of v) f[x]++;
  for(let i=p;i+1<v.length;i+=2) {
    const a=v[i],b=v[i+1],k=29*Math.min(a,b)+Math.max(a,b);
    m.set(k,(m.get(k)||0)+1); d+=a===b;
  }
  const h=f.sort((a,b)=>a-b).join(",");
  return [h,h+"|"+d,h+"|"+d+"|"+[...m.values()].sort((a,b)=>a-b).join(",")];
}
for(const p of [0,1]) {
  const original={comparisons:0,matches:[0,0,0]};
  const held={comparisons:0,matches:[0,0,0],targets:0};
  function count(t,s,len,out) {
    for(let i=0;i+len<=s.length;i++){
      const z=sig(s.slice(i,i+len),p); out.comparisons++;
      z.forEach((x,j)=>{if(x===t[j])out.matches[j]++});
    }
  }
  for(const page of pages) {
    const v=page.indices,t=sig(v,p);
    for(const s of ss) count(t,s,v.length,original);
  }
  for(const len of new Set(pages.map(x=>x.indices.length)))
    for(let j=0;j<ss.length;j++) {
      if(ss[j].length<len)continue;
      const t=sig(ss[j].slice(0,len),p); held.targets++;
      for(let k=0;k<ss.length;k++)if(k!==j)count(t,ss[k],len,held);
    }
  console.log({p,original,held});
}
```

## Recommendation to Director

Do not fund a successor pair permutation, donor-histogram refinement, or larger donor scan merely to tighten this exact rejection. For future exact donor-based tasks, require either an independently nominated donor identity/segment, or a baseline showing the proposed mechanism-specific constraint adds information beyond the already failing donor assumption. For general unseen plaintext, calibrate necessary low-dimensional statistics on held native records transformed by the candidate and a rival; the target must plausibly distinguish those models before a costly key search. Retain the theorem, the weaker equality diagnostics and the precise negative; no authoritative synthesis change, new key, or plaintext is warranted. This is an audit recommendation, not a new task assignment.
