# Original 255-word → p8 conditional GF4 receiver: nonlinear rune-bag digest capacity

**Research decision (22 Nov 2026, Agent16):** A new fourth anagram equality in the p3–p7 scroll makes a *commutative*, potentially nonlinear word digest worth pursuing under the independently constructed but **still unauthenticated** GF4/radix59 p50→p8 correction. This report establishes a bounded original-source necessary-condition exclusion for **arbitrary secret lookup functions of simple GP29 rune-bag aggregates**. It recovers no unknown plaintext or key. It does not reject all nonlinear checksums, cryptographic hashes, variable-state operations or alternative p8 transforms.

## Original source and frozen receiver

Use all 255 original *complete* printed words of physical p3–p7 and all 255 original physical p8 runes, plus the fixed p7 five red rune-index products [11,26,8,15,2] and p49–p51 literal radix59 table. The previously fitted GF4 recurrence is state [2,0,0,0], taps [3,2,0,3], full period255, with source table addresses 1..255 each once and source address0 unused. Correct p8 rune i as H[i] = (C8[i] + table59[address[i]]) mod29, unrotated and no retuning. The four unchanged source Parikh collisions at pairs (47,240), (48,231), (235,236), (88,179) all satisfy H[i]=H[j] with outputs [20,8,2,9]. The fourth is anagrammed EO-X versus X-EO, one source-black and one source-red.

This correction has a postselection history, even though the fourth pair was previously unused by its key-fit stage. The four matches are valuable only as conditional evidence, **not** an authenticated word hash or plaintext.

## Exact all-secret nonlinear test

For each source word w define a fingerprint T(w) with GP index sum mod29, published prime sum mod29, GP ordinal product mod29, published prime product mod29, authentic source word length, or frozen tuples of two/three of these. Allow an otherwise arbitrary secret lookup f from the **entire** fingerprint domain to GP29, including a completely nonlinear 29-, 29²- or larger-entry codebook. Even such an unconstrained f must satisfy H[i]=H[j] when T(w_i)=T(w_j). Thus collisions with unequal H are absolute all-key obstructions, independent of search difficulty or a chosen lexicon. Evaluate all 255 source words and count the minimum incorrect H values, using the most frequent H independently in each class.

| Published-fingerprint inputs T(word) | Distinct source classes | Classes with incompatible H | Minimum incorrect runes out of 255 |
| --- | ---: | ---: | ---: |
| GP-index sum | 29 | 29 | 198 |
| GP-prime sum | 29 | 29 | 199 |
| GP-ordinal product | 29 | 29 | 201 |
| GP-prime product | 29 | 29 | 199 |
| GP-index sum, GP-prime product | 203 | 37 | 46 |
| GP-prime sum, GP-prime product | 203 | 39 | 47 |
| GP-index sum, GP-ordinal product | 204 | 36 | 46 |
| True word length, GP-prime product | 124 | 64 | 118 |
| True length, GP-prime sum, GP-prime product | 235 | 15 | 15 |
| True length, GP-index sum, GP-ordinal product | 240 | 11 | 11 |

The last row is the most permissive of these ten tested keys: even an **arbitrary independently secret 240-entry nonlinear codebook** must fail **11 of the 255 original corrected p8 rune positions**. Example obstruction for the simplest published index-sum source: word0 GP indices [20,11] and word34 [10,11,10] both sum to2 mod29, yet their corrected p8 indices are9 and27, respectively. No single-valued map f(2) fits both. The SFT prints the first exact original contradictory word pair for every row, validates source page joins, confirms all four previously fixed Parikh equalities, confirms no table address0 is consumed, and passes consistency controls on artificial f(T) outputs.

**Reproducer:** [Windows-compatible Node22 CommonJS original-input all-secret test](../sims/lp2_scroll255_nonlinear_baghash_allsecret_sft.cjs) and [successful Windows workflow run45044086500](https://github.com/FlareZ123/liber-primus/actions/runs/45044086500).

## Interpretation and next discriminating choice

This is distinct from previous exclusions of additive secret rune-position codebooks: here f may be an **arbitrary nonlinear mapping of an entire symmetric source-word signature**. The canonical sum/product/length families cannot be the historical word-value law under this particular fitted receiver. More expressive hashes that distinguish almost all source words fit by construction, but such fitting does not explain source-selected parameters or recover an independent original rune. Prioritize a first-party **named nonlinear operation** with an authentically constrained key/byte representation and a held-out original receiver, or pivot away from the conditional GF4 chain. Do not promote these source arithmetic matches to decrypted plaintext.

The authoritative status remains unchanged: all 56 unknown LP2 physical pages remain undeciphered.
