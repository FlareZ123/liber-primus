# GF(29²) ciphertext-driven exponent feedback: blind key recovery and original decision

The full physical pp33–39 span has 1,680 runes (840 pairs), but it is **not the exact cuneiform body**: a 91-rune preface and a 121-rune tail flank the marked body of 1,468 runes. Both the physical span and exact body are separately tested. The signed 2013 BASE29 digits give H=3+26z+24z², hence z²=18+11z and z primitive of order840. Distinct from prior additive pair-feedback and fixed-period masks, test the total reversible law

    C_i = P_i * z^(k+e L(C_(i-1)))
    P_i = C_i * z^(-k-e L(C_(i-1)))

where pair (a,b) represents a+bz, L(x)=log_z(x) if nonzero, L(0)=0, and e,k range over 0..839. Initial previous ciphertext pair=1 at p33; carry across p39→40. The field is source-derived; no original instruction selects this feedback law.

For all840 exponents, normalize the ciphertext pair logs by subtracting e L(previous). Multiplication by the unknown fixed z^k merely rotates the 840 nonzero bins, leaving pair IoC invariant (also invariant under any stationary outer pair bijection). Score the top32 collision-ranked exponents × all840 scalar shifts with a smoothed native-pair likelihood trained on four solved-GP sections (818 pairs). The last five sections give671 independent control pairs; fit first500 and decode remaining171 without refitting.

| Test | Recovered e,k | Pair IoC | Rune IoC |
|---|---|---:|---:|
| Native planted 17,237 | 17,237 | .00622846 | — |
| Native planted 331,103 | 331,103 | .00622846 | — |
| Native planted 839,56 | 839,56 | .00622846 | — |
| Original pp33–39 | 414,418 | .00131108 | .03480884 |
| Untouched pp40–53 | frozen 414,418 | .00121831 | .03444578 |

All three control keys and all171 continuation pairs per control recovered exactly. All original/plant candidates replay. Original best mean log score -8.703276 nats/pair, unseen -9.000697; native plants -6.000876. Original maximum pair IoC over ALL840 e is .001373517 (e=664), versus raw .001308247. Concatenating the nine solved GP source sections gives2,979 runes and1,300 overlapping 1,680-rune windows, whose local adjacent pair IoCs range .005982178–.006927181. This comparison is computed by counting pairs (a,b) at offsets 0,2,...,1678 in each window. Thus all705,600 keys (and arbitrary stationary outer pair relabeling) fail this finite native-pair diagnostic under the declared framing and state law. The actual language-likelihood search covers26,880 shortlisted keys, not all keys.

The exact visual section separately begins at p33 offset91 and ends at p39 offset119, in accordance with the [original boundary correction](lp2-cuneiform-base29-typed-register-original-gate.md). It contains734 pairs; only its first367 pairs select the key, with the last367 untouched. The maximum possible training pair IoC is .001622966, versus 0.005315585–0.009901580 over 2246 contiguous 734-rune native solved-source windows. The scored key (114,503) gives training rune IoC .035433495 and unseen rune IoC .034058087, pair log scores -8.561413 and -9.089648. Neither produces coherent text. All source pairs round-trip. The result therefore applies separately to the full physical 840-pair span and the actual illustrated body, rather than conflating the latter with the former.

No original plaintext or key recovered. Retire this model rather than tuning unrelated offsets or extra stages. The transferable attack separates exponent recovery from scalar recovery in field-log coordinates.

Reproduce: `node sims/lp2_h_gf841_exponent_feedback_blind_sft.cjs`. Full actual output in `lp2-h-gf841-exponent-feedback-blind-output.json`. Both experiment functions were executed directly against repository source objects; no CI run is claimed. Sources: `resources/liber-primus/lp2-corpus.json`, `resources/external/relikd-solved-gp29-native-v1.json`, H derivation in `lp2-2014-3301-square-base29-spectral-original-gate.md`.
