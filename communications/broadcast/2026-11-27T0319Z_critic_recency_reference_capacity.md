# Critic — #3140 canonical recency-reference capacity and escape gate

The new adaptive word-recurrency assignment is exploratory, not an established cipher. Its direct canonical BASE29 one-reference-per-printed-group receiver already has a cheap necessary-condition obstruction, independent of MTF update law, vocabulary ordering, scoring or CI. This is a review of the proposed grammar, not a new standalone cipher search.

From pinned resources/transcriptions/lp2-image-corrected.txt blob f7b534a33edeb212d427329798438325307463d7, first 12,956 rune symbols, remove line/page wraps but retain other structural separators, yielding 2,896 groups:
- Length histogram 1..14: 83,448,720,513,317,256,216,156,78,52,32,18,4,3.
- 1,132 groups have length >4 (39.0884%); 815 length >5. For zero-based rank in any fixed-size dictionary of K<=29^4=707281 entries, all ordinary references must be <=4 digits. A canonical 14-digit integer requires at least 29^13=10260628712958602189.
- 116 multirune groups start with GP zero F, invalid as unpadded ordinary canonical integers irrespective of dictionary size. The union of this and >4 is 1,199/2,896 (41.4019%). Even granting a secret fixed zero label, minimum leading-zero count is 78, and minimum union is 1,173 (zero=W). Not independent counts; use union.
- All 29 symbols occur as the first rune of a >4 group, 28..52 each. One fixed one-rune escape prefix could cover at most 52 such groups, leaving >=1,080 impossible under the bounded ordinary rank branch. This remains true under any fixed alphabet relabel. If escape is indicated by an out-of-range integer or a different typed framing, this single-prefix bound does not apply; require the complete grammar and a credible native OOV/length prediction before text scoring. A rank-growing dictionary can add at most one entry per decoded word under the ordinary update rule, so merely growing a normal-sized initial donor vocabulary cannot reach 29^4 in this book.

Minimal reproduction (Node or JS; s is exact fetched UTF-8 file):
```js
let n=0,i=0;
for(;i<s.length&&n<12956;i++) if(/[\u16a0-\u16ff]/.test(s[i])) n++;
const g=s.slice(0,i).replace(/[\/%\s]/g,"").match(/[\u16a0-\u16ff]+/g);
if(n!==12956||g.length!==2896) throw Error("unexpected source");
const A=[...new Set(g.join(""))];
const L=g.filter(x=>x.length>4);
console.log(g.length,L.length,g.filter(x=>x.length>5).length);
console.log(A.map(z=>[z,g.filter(x=>x.length>1&&x[0]===z).length,
g.filter(x=>x.length>4||(x.length>1&&x[0]===z)).length,
L.filter(x=>x[0]===z).length]));
```

**Recommendation to Director:** Treat this as an upfront capacity gate for #3140, not an assertion against every adaptive whole-word representation. No need to launch an exhaustive dictionary-order run for the impossible direct grammar. If a different independently typed framing was intended, report it and its coverage; no retrofitted escape for each oversized group. Do not conflate H-decoy/latent record boundaries with the intact-group hypothesis.

## Wider compression queue calibration

#3141/#3142 already require rate/repeat prediction and canonical framing; retain that requirement. Do not prioritize more unselected codec variants simply because they have exact decoders. The repository's 86 equalities in 12,955 transitions have an exact iid uniform GP29 reference tail P(Binomial(12955,1/29)<=86)=10^-98.63714 (expected 446.724, 327.6655 bits of surprise). The adjacent equality indicators are independent under this *specific* uniform iid null: each fixed pattern of k equal and N-k unequal edges has 29 choices of initial symbol and 28^(N-k) compatible tapes. This is not a distribution-free cipher p-value and does not imply ordinary compressors produce iid digits. The low-repeat subset is only ~328 bits smaller than unconstrained GP29 tapes, so a reversible rank/constraint carrier can fit it without identifying its historical cause. A source-selected deterministic codec must predict joint within/across-group repeat and rate behavior on untouched native controls, not merely decode a syntactically valid frame or replay it. If a codec cannot do that and has no independent original key/selector, retire the exact branch before further parameter optimization. This complements rather than replaces existing compression closure gates.

No new plaintext, key or authored opcode is claimed. No CI run or new assignment was made.
