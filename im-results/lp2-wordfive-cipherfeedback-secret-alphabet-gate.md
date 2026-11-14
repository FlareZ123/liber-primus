# Five-phase ciphertext-feedback with arbitrary page-secret alphabets: complete source-native exclusion

**Agent28, 14 November 2026. Evidence class: original-input key-independent necessary-condition failure under a source-native-English plaintext register, plus source-shaped positive plant.** This yields no unknown LP2 plaintext, creator key, intended decipherment mechanism or destination.

## Motivating clue and fixed cipher family

Original LP2 pages p7, p23 and p56 display a repeated five-circle stencil. The unknown manuscript's **2,896** complete printed GP words, including **32** words joined across physical page boundaries, have **104/2,105** equal-rune matches at positions five apart, unusually concentrated within printed words. The original solved p56 uses GP29 modular arithmetic. These invite, without authenticating, a five-phase **modular ciphertext-feedback** mechanism. It is a more ambitious alternative to fixed substitution: the output depends on the previous ciphertext rune, so apparently uniform ciphertext marginals alone cannot exclude it.

For every printed word `w` and rune `j`, let `π[page,j mod5]` be an arbitrary unknown **29-symbol alphabet permutation**. Grant each of the **55 rune-bearing original physical pages** its own **five independent 29! secret permutations** (275 secret maps, no source-specified values). The proposed encryption is:

- `C[w,0]=π[page,0](P[w,0])`; the first symbol seeds its word
- `C[w,j]=(C[w,j-1]+π[page,j mod5](P[w,j])) mod29` for `j>=1`
- phase and ciphertext-feedback state reset for every printed word; page membership for the 32 crossing words is determined by each rune's original physical page

The **exact reversible necessary condition** is that `D[w,j]=(C[w,j]-C[w,j-1]) mod29=π[page,j mod5](P[w,j])` for `j>=1`. Arbitrary bijective symbol changes preserve equality pairs in each original page×phase class, whatever the secret 275 maps. No plaintext word, key, shift phase or score is fitted after seeing the ciphertext.

## Original 10,060 internal steps and entire all-secret gate

The unchanged 55-page, 12,956-rune manuscript has **10,060 within-word consecutive differences**. Group each at its original physical page and position-within-word modulo five. The original residual `D` is nearly uniform, even after accounting for the feedback subtraction:

| Frozen classes | Original equal pairs | Eligible same-class pairs | Exact equality rate |
| --- | ---: | ---: | ---: |
| Five global word-local phases | **434,173** | **12,284,232** | **0.0353439** |
| 275 independent physical-page×phase classes | **8,277** | **231,190** | **0.0358017** |

A concrete unchanged original key drawn from this family would merely *relabel* the 29 plaintext rune identities in each class; it could not change these class-collision rates.

For each of Shakespeare, Gibran and Emerson, the reproducible program samples **250 complete GP-native English controls** from a source-calibrated alphabet register (`ING`, `IO`, `QU→CW`, `V→U`, and the canonical GP variants), **holding all 2,896 exact original word lengths and physical page/rune positions fixed**. Every control is generated from its archived source text, and the target/controls are compared on the same noninitial positions:

| Source corpus | Controls | Minimum 275-class rate | Median rate | Controls ≤ original |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare | 250 | **0.0821835** | 0.0854103 | 0 |
| Gibran | 250 | **0.0786799** | 0.0834119 | 0 |
| Emerson | 250 | **0.0756088** | 0.0788442 | 0 |

Thus **0/750** matched source-native English controls give the original's sparse differential collisions, even when all 275 phases allow independent hidden relabeling. This is a finite language-register exclusion, not a probability of authorship or proof against every conceivable source text.

**Constructive positive:** On exactly the same original word/page length geometry, choose independent hidden random bijections at each of 275 page×phase slots, encrypt 12,956 GP runes of a length-matched English control under the declared evolving feedback mechanism, and invert directly. The decoder recovers **12,956/12,956** original control plaintext runes. Its **20,059** observed within-class differential equalities are preserved exactly from source-native plaintext before encryption to ciphertext difference outputs. The authentic real-cipher rejection is therefore discriminating within this wide family.

## Cryptanalytic decision

**Reject this complete page-reused five-phase modular ciphertext-feedback family for ordinary source-native GP English under the original printed segmentation.** The cipher may change raw letter marginals and still cannot conceal the strong phase-conditioned *plaintext equality frequencies* in its observable one-step differences. This is distinct from the earlier direct five-phase substitution all-secret test and from per-word affine/Vigenère exclusions.

It does not reject noninvertible phase maps; an independent map for **every word**; keyed nonlinear feedback; a hidden intermediate encoding; edit/insert/delete operations; plaintext written in another register; or a mechanism whose phase changes with state. Those would require an original instruction or a source-locked recovered-key prediction before serious compute. There is no authentic new unknown-page decryption.

**Reproduction:** [standalone Node22 original-input all-key SFT](../sims/lp2_wordfive_cipherfeedback_secret_alphabet_sft.cjs) · [successful GitHub Actions 43617442619](https://github.com/FlareZ123/liber-primus/actions/runs/43617442619). It checks two independent full source rune registers against each other, 750 native-English controls, 275 independent secret maps, full positive inversion and preserved equal-pair invariants.
