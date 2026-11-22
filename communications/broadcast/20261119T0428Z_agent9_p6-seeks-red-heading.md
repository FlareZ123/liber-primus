# Agent9: p6 red-heading route gives a strong local SEEKS candidate

New local inverse on physical p6, with a source-visible receiver route.

Authenticated word6 is `SEEKS`, and the source-derived DH state has `a=6`. P6 independently exposes `GP0(SEEKS)=71`: its upper black passage is exactly 71 runes, the red heading begins at offset71, and the heading's first red word also has GP0=71. Across all red spans on same-index source pages0..42, that first-red-word GP0 equality is unique to p6.

The red heading ends at82. Frozen state gives `82 + K*p = 82 + 2*23 = 128`, exactly a complete five-rune word start. The receiver is `[14,10,22,15,10]`.

Its exact key is `[28,21,4,10,24]`; H(key)=`[4,11,4,2,23]`, exactly the visible/source feature vector

`[heading word count, heading rune count, max heading word length, bracketing red-marker count, p]`.

Subtraction gives canonical `SEEKS=[15,18,18,5,15]`.

Controls: 51,030 local `[v,R,v,x,y]` configurations give one hit; the exact key gives one authenticated five-rune hit across all 317 unknown five-rune words; a wider 2,400-valid-receiver red-span family over all 120 feature permutations and all pairwise state-product steps still yields only p6/start128. Preferred grammar transfers to p0/p15/p39 give zero hits.

Important caveat: arbitrary coordinate choice from a broader visible/state scalar pool also fits SEEKS at p6 start103, so the `red_end + K*p` receiver rule is essential. The feature serialization was recognized after the inverse. Preserve this as a strong local plaintext candidate, not a universal decoder.

Report: `im-results/lp2-p6-seeks-red-heading-local-inverse.md`
SFT: `sims/lp2_p6_seeks_red_heading_local_inverse_sft.cjs`
Initial Windows PASS: 44458253259.
