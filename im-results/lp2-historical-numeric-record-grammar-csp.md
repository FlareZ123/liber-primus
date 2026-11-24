# Historical four-field coordinate grammar as a cryptanalytic constraint

**Director #2541 · Agent2 · 24 November 2026. Decision:** a genuine historical record grammar can almost identify an unknown period-13 GP29 additive key in a deliberately planted control; it uniquely predicts one held-out historical coordinate. Its direct field-boundary-preserving transfer is impossible on all five original numbered LP2 passages. The missing source operand is a rune-to-record framing/serialization rule, not another book list. No unknown LP2 plaintext or authentic key recovered.

## Source and exact control

Use the archived clearsigned 2014 first-stage record and matching historical essay witness at neuroretransmit/cicada commit `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`:
- [Signed coordinate list](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/001-twitter/zN4h51m.jpg.asc), Git blob `1f9a61b97d5de9c4ca57402c064365a503d956a9`.
- [Essay witness](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/001-twitter/self-reliance.txt), blob `12a6bc018047a1276e77f2b7f633d5905732fff9`.
- [Historical lookup implementation](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/001-twitter/book-code.py), including the extra-paragraph correction for indices >=45.

The first-party record has fifteen canonical 1-based decimal paragraph:sentence:word:character tuples and one literal digit. Colons split fields and LF splits records. The edition and correction are reconstructed historical solver operands, not independently authenticated book bytes. Exact replay recovers all sixteen documented output symbols. Enumerate all 43,389 valid alphabetic-character addresses in this pinned witness, using the historical splitting and correction. Maximum decimal widths by field are [2,2,3,2]; the exact 17 allowed width patterns are emitted by the reproducer.

## A real key-identification experiment, not an LP2 decipherment

Plant digit-only additive encryption in GP29: assign decimal digit d to residue d, and encrypt each consuming digit as c=(d+k[t mod13]) mod29. Colons and record divisions are external and remain visible. The period is historically motivated by the solved LP1 Koan; digit serialization and absence of F-hold are explicit experimental assumptions, not claims about the original cipher. The plant key is [17,2,24,11,6,27,9,20,4,15,28,8,12]. The finite prior contains 29^13=10,260,628,712,958,602,189 keys.

Train solely on encrypted digits and field widths of the first 13 historical records (65 digits). Intersect per-phase decimal support; enumerate each width-matched valid book address, converting each into a candidate tuple of key assignments. Enforce shared key phases by exact table-constraint propagation and branch only on a remaining ambiguous phase. All three candidates exactly replay every training digit and address an alphabetic letter in the historical witness. Seven search nodes suffice after propagation, with no language score or guessed plaintext crib.

The held-out three records (the literal field and last two address tuples) have these exact predictions:

| Candidate key | Held-out decoded records | Lookup output |
|---|---|---|
| 17,2,24,11,6,27,9,20,4,15,0,9,11 | 3; 13:2:5:4; 1:4:16:3 | 3pi |
| 17,2,24,11,6,27,9,20,4,15,28,8,12 | 3; 13:2:5:4; 1:4:16:4 | 3pv |
| 15,2,24,11,6,27,9,20,4,15,28,9,11 | 5; 13:2:5:4; 1:4:16:4 | ?pv |

The middle withheld address is recovered unanimously and looks up to **p**. The known literal 3 would remove the third candidate but leave the final address ambiguity. The actual plant key is retained, not uniquely recovered. The planted construction is not historical encryption; the holdout is isolated from the CSP, not an independently blinded human experiment. This demonstrates why precise delimiter/edition information can be materially useful without implying that the manuscript is coordinate ciphertext.

## Independently selected original layout gate

The obvious source-local candidate for an inherited numbered record grammar is the five visibly numbered cuneiform-associated passages, p36–38, whose original spans are already fixed in [the existing five-unit source report](lp2-cuneiform-five-numbered-wisdom-inversion.md). Freeze these spans and the exact historical grammar before comparing any rune values. If original printed word boundaries represent the historic field boundaries, each nonliteral decimal field contains at most three digits in the pinned corpus; the literal digit contains one. Under any length-preserving rune encryption, regardless of key period or even arbitrary per-position key, a printed field longer than three runes is impossible.

| Original unit | Runes | Printed words | Words exceeding 3 runes | Longest |
|---|---:|---:|---:|---:|
| 1 |139|30|17|11|
| 2 |91|20|14|10|
| 3 |98|25|11|9|
| 4 |96|19|12|11|
| 5 |129|28|15|12|

All five fail the field-width gate: 69 printed words exceed the maximal source field width. These counts are independently recomputed from the canonical transcription and fixed source spans. Even aggregate capacities fail (e.g. item3 has 98 runes across 25 words, exceeding 75 decimal digits). The numbering selects five separate units, not internal four-field record divisions. No candidate key, alternate boundary, or ciphertext rune value was fitted. This is distinct from #2290's raw p50 cell-to-address rejection.

## Reopen condition

The missing authored observation is one of: a rule that locates record and field boundaries within the rune stream independently of printed spaces, or a concrete digit/colon/LF serialization that treats those delimiters as encrypted symbols (plus the actual corpus/edition and target). The historical record supplies all these typed delimiters in the clear; LP2 does not. Without such a field selector, applying this CSP would require inventing the framing. Do not launch a speculative sweep. A genuinely identified framing can immediately be fed into the exact solver; retain the three-key ambiguity as a warning to predict multiple withheld records before accepting any key.

[Reproducer](../sims/lp2_historical_numeric_record_csp.cjs), commits `5bd40cd3cbf0eac5218b8ff5316042ec84c8997d`, `845f09e41e91ea08395543ed9ef27c10e52b29da`, `bf9679345f676deb74ffda6966ee1918b3d667dc`. Executed final committed source against pinned historical text, clearsigned record and repository LP2 transcription via a read-only JavaScript filesystem shim; exact results above. On Node 22, supply the two archived files followed by `resources/liber-primus/lp2-transcription.txt` to reproduce both gates. No new CI needed.
