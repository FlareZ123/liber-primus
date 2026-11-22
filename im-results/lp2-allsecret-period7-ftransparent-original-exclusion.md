# Original LP2 period-seven all-secret F-clock: eight keys survive page resets, one survives globally

**14 November 2026, Agent47. Classification:** exact source-side key-space reduction with a finite English-register obstruction. **No unknown plaintext, key, creator-selected cipher or destination recovered.** The authentic solved-p56 plaintext-F bypass rule supplies the cipher model, while the 2014 7×7 numerical square gives an independently historical reason to examine period seven. Neither clue authenticates its application to unsolved LP2.

## Precise model and source coverage

Use all **12,956 original unknown GP29 rune indices** from 55 rune-bearing physical LP2 pages, pp0–55 including the blank-rune p50 gap. One completely arbitrary secret vector \`K[0..6]\` is shared across the manuscript. At a plaintext GP index \`P != 0\` (non-F), output \`C=(P+K[phase]) mod29\` and consume one key slot modulo seven. A plaintext **F=0** outputs literal ciphertext F and **does not** advance the key. A ciphertext F has two possible origins when \`K[phase]!=0\`, and the exact inverse carries both. A page may select **any of seven initial phases**, independently of other pages. Both additive signs are included because effective keys span the entire GP29 alphabet.

This explicitly grants the model page reset freedoms unavailable to a continuous repeated key. No crib, guessed key, preferred page start, English scorer or tuned F-skip schedule enters the original-cipher feasibility test.

## Complete all-secret key search without enumerating 29⁷

**Necessary single-digit gate.** Let one unspecified phase carry a proposed nonzero value \`v\`. Renumber this phase zero because the starting phase is unrestricted. Treat all six remaining key positions as entirely unknown, and allow **every** observed ciphertext F either to advance or skip the clock even where the actual cipher would forbid a branch. This is a strict superset of all legitimate inverses. At a nonzero ciphertext rune with value \`v\`, phase zero is forbidden because it would require encrypting plaintext F, which must bypass the cipher. One physical page alone suffices to veto each of five values \`5,8,9,22,28\`; the remaining **24 choices per key slot** are \`[0,1,2,3,4,6,7,10,11,12,13,14,15,16,17,18,19,20,21,23,24,25,26,27]\`.

**Monotone partial-key search.** Assign key positions one by one. At each assignment, run the same overpermissive seven-state automaton against all original pages with all page-initial phases. Any partial assignment rejected under the relaxed cipher cannot become valid after assigning more key digits, so its entire subtree is discarded. The full key-space is thereby searched exactly without scanning every one of the approximately 17 billion 29⁷ vectors.

| Assigned key digits | Candidate partial keys visited | Relaxed source-feasible |
| ---: | ---: | ---: |
| 0 | 1 | 1 |
| 1 | 24 | 24 |
| 2 | 576 | 87 |
| 3 | 2,088 | 185 |
| 4 | 4,440 | 315 |
| 5 | 7,560 | 477 |
| 6 | 11,448 | 674 |
| 7 | **16,176** | **911** |

The exact historical F-state decoder, now using each complete assigned key, is run on those **911** necessary-condition survivors with all page phases and no F choices omitted.

**Exact result:** only **eight** full keys survive every original page: the all-zero identity and the **seven cyclic rotations of \`[14,0,0,0,0,0,0]\`**. GP index14 is **X**. These seven rotations describe one underlying nontrivial key under the permitted free page phase. Under the stricter *single continuous clock for the whole book*, **all seven nonzero rotations contradict the original source at global zero-based rune index 971**; only the all-zero identity remains.

## Why the seven page-reset survivors do not decode ordinary GP English

The seven sparse surviving keys all have a nonzero shift at **only one out of seven consumed key positions**. Thus on a page of \`n\` ciphertext runes they can change at most \`ceil(n/7)\` symbols relative to the observed ciphertext, irrespective of phase, plaintext F, or ambiguities in the key clock. Summing this bound over all 55 pages gives **at most 1,873 changed runes among 12,956**, or **14.4566%** of the text.

The unchanged source has empirical GP29 marginal entropy **4.856503613708271 bits/rune**. To find the mathematically *smallest* entropy obtainable under even **1,873 entirely arbitrary rune replacements**, forget all key restrictions and move symbols from the least common original classes into the most common class. This maximally concentrated frequency vector majorizes every other attainable histogram. Its entropy is **4.423603076224787 bits/rune**, so **every exact decipherment under the seven nontrivial keys has entropy at least 4.42360**.

The independently established GP-native prose controls in [the all-secret feedback entropy analysis](lp2-cipher-feedback-conditional-entropy-gate.md) have at most **4.28909395 bits/rune** across **89 Shakespeare, Gibran and Emerson windows** of approximately matching original text length. Therefore the seven surviving keys cannot yield original plaintext in that tested ordinary-English register, even after choosing the most favorable page phases and all legal ciphertext-F readings. This is a finite register comparison, not a theorem excluding every possible language, non-English plaintext, artificial encoding, or high-entropy preprocessed text.

## Native source control, exact scope, and decision

A positive plant takes the **95 actual clear GP29 runes from p57**, including its three native F runes, encrypts with a nontrivial seven-slot additive key and a hidden starting phase, then verifies exact decoder feasibility. Its key consumes precisely **92** positions because three authentic plaintext F runes bypass. The all-zero identity accepts the untouched original clear page. The full SFT asserts each key search depth, original source rune counts, all surviving keys, continuous-clock failure index971, exact edit bound and exact entropy bound.

**Decision:** exclude every nontrivial **book-continuous** GP29 period-seven additive key with plaintext-F bypass, and exclude every same-key **page-reset period-seven** candidate from the tested GP-native ordinary-English register. This builds on the separately derived [period-five all-secret no-go](lp2-allsecret-period5-ftransparent-original-exclusion.md) and the older [periods 1–4 result](lp2-allsecret-period4-ftransparent-original-exclusion.md). A source-selected evolving key or a different cipher operation is necessary for a credible new decipherment in this mechanism family. Avoid retrying phases or a 7-symbol dictionary key against the same source without new instructions.

[Original-source exact Windows Node22 SFT](../sims/lp2_allsecret_period7_ftransparent_exact_sft.cjs) · [canonical LP2 GP index source](../resources/liber-primus/lp2-corpus.json).
