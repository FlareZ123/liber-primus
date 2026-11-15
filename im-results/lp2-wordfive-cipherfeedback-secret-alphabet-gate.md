# One-back and five-back source-motif feedback with arbitrary page-secret alphabets

**Original-input key-independent source-native-English/Latin exclusions with independently inverted positive controls.** Agent28 (14 November 2026) resolved the one-back page-phase feedback family; Agent4 (15 November 2026) independently resolved the source-shaped **five-back** feedback variant. Both use arbitrary 275-map secret page/phase permutations. Neither recovered unknown LP2 plaintext, creator key, intended decipherment mechanism or destination.

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

For each of Shakespeare, Gibran, Emerson and the eight-book Latin Vulgate, the reproducible program samples **250 complete GP-native English or Latin controls** from a source-calibrated alphabet register (`ING`, `IO`, `QU→CW`, `V→U`, and the canonical GP variants), **holding all 2,896 exact original word lengths and physical page/rune positions fixed**. Every control is generated from its archived source text, and the target/controls are compared on the same noninitial positions:

| Source corpus | Controls | Minimum 275-class rate | Median rate | Controls ≤ original |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare | 250 | **0.0821835** | 0.0854103 | 0 |
| Gibran | 250 | **0.0786799** | 0.0834119 | 0 |
| Emerson | 250 | **0.0756088** | 0.0788442 | 0 |
| Latin Vulgate | 250 | **0.0768156** | 0.0794152 | 0 |

Thus **0/1,000** matched source-native English and Latin controls give the original's sparse differential collisions, even when all 275 phases allow independent hidden relabeling. This is a finite language-register exclusion, not a probability of authorship or proof against every conceivable source text.

**Constructive positive:** On exactly the same original word/page length geometry, choose independent hidden random bijections at each of 275 page×phase slots, encrypt 12,956 GP runes of a length-matched English control under the declared evolving feedback mechanism, and invert directly. The decoder recovers **12,956/12,956** original control plaintext runes. Its **20,059** observed within-class differential equalities are preserved exactly from source-native plaintext before encryption to ciphertext difference outputs. The authentic real-cipher rejection is therefore discriminating within this wide family.


## Distinct five-back feedback source-motif gate (Agent4, 15 November 2026)

The same original illustrated **five-circle stencil** and **104/2,105** observed fifth-position echoes suggest an even more direct *five-back* ciphertext-feedback interpretation, distinct from the previously tested one-back recurrence. For each **exact original printed word** and index `j`, propose `C[w,j]=π[page,j mod5](P[w,j])` for its first five rune positions and `C[w,j]=(C[w,j−5]+π[page,j mod5](P[w,j])) mod29` for later positions. Each of the **55 original rune-bearing pages** has five independent arbitrary **29!** secret bijections, with the original 32 carried words assigned according to their physical rune locations. The model is exactly invertible word by word. No source instruction authenticates this model or its unprovided permutations.

The observable five-back residual `D[w,j]=(C[w,j]−C[w,j−5]) mod29` for `j≥5` equals a **secret-permuted plaintext rune** under any key in this family. Within each physical-page×word-phase group, a bijection **cannot change the number of identical-symbol pairs**. Source-original **2,105** eligible fifth-back positions occupy **261 nonempty page×phase groups** out of the possible 275; there are exactly **388 equal-symbol pairs among 11,664 comparisons**, a **0.03326475** collision rate. The same five global phases produce **21,817/634,908 = 0.03436246**. These are key-independent properties of original ciphertext, without choosing a key, guessed word, page offset, or stage after inspecting the values.

The [dedicated original-input SFT](../sims/lp2_lagfive_feedback_allsecret_original_sft.cjs) samples **250 original-word-length-matched complete native GP books per reference**, from each of the four archived original reference registers. Every sampled book preserves the actual **2,896 original printed word lengths, 12,956 rune positions, page assignment and five-step classes**. The minimum source-native **261-class** collision rates were:

| Source-native reference | 250 sampled books | Lowest collision rate | Median rate | Controls ≤ original 0.03326475 |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare | 250 | **0.07784636** | 0.08753429 | 0 |
| Gibran | 250 | **0.08058985** | 0.09147805 | 0 |
| Emerson | 250 | **0.07253086** | 0.08384774 | 0 |
| Latin Vulgate | 250 | **0.08221879** | 0.09190672 | 0 |

An independently constructed **full 12,956-rune positive plant** encrypts and decrypts a source-native English control with **275 independently shuffled secret alphabets**, word-reset five-back feedback, and **12,956/12,956 exactly recovered plaintext symbols**. It preserves the plaintext's original **1,001/11,664** equal-symbol pairs in the ciphertext-derived residual **exactly**. Therefore the original's **388** equal pairs are not caused by a failure to implement or invert the proposed feedback.

### Independent fresh alphabet for every word: original-data survival

A more flexible, still exactly invertible **five-back feedback model** uses **one new arbitrary 29! permutation per printed word**, reused across all five word phases. This model can change its key at each of the **2,896 original word starts** and leaves the same five-back residual `D[j]=C[j]−C[j−5]` observable, but only **within-word** equality comparisons remain invariant. Across the **815 words with at least one original five-back residual**, the original has exactly **105 matching residue pairs in 2,750 eligible pairs**, or **0.03818182**. In contrast, the page-phase model pools residuals from unrelated words in the same physical page.

The same four independently archived source registers, with **250 length- and page-layout-matched complete-book controls each**, give the following genuinely **unfitted** within-word collision distributions:

| Native-GP reference | Minimum 250 sampled books | Median | Controls at or below original 0.03818182 |
| --- | ---: | ---: | ---: |
| Shakespeare | 0.03309091 | 0.04254545 | **22/250** |
| Gibran | 0.03090909 | 0.04181818 | **42/250** |
| Emerson | 0.02654545 | 0.03709091 | **160/250** |
| Latin Vulgate | 0.02509091 | 0.03272727 | **239/250** |

The original statistic is **within the observed reference range** in every corpus. A separate positive plant implements **2,896 independent hidden word maps**, applies the five-back feedback at all **12,956** original-format GP positions and exactly recovers **12,956/12,956** plaintext runes. The plant retains all **110/2,750** within-word equal-residual pairs before and after encryption. Thus the all-secret page-reused five-phase **exclusion cannot be generalized to fresh per-word keys**. In particular, a flexible word-rekeyed family survives these equality tests, although there is **no Cicada-selected per-word key schedule or original plaintext**. A still freer choice of five independent maps for every word has only **92** original eligible same-word/phase pair comparisons, so absence of a discriminating key-independent test is even more severe.

[Expanded single-file exact-input SFT](../sims/lp2_lagfive_feedback_allsecret_original_sft.cjs) · [Successful second independent CI run 43740312208](https://github.com/FlareZ123/liber-primus/actions/runs/43740312208). **Research decision:** If an original source selects an actual word-key derivation, five-back word-reset models remain candidates; repeating same-key five-phase sweeps across pages is already contradicted. The survival of freely assigned 29! word keys is a capacity observation, not evidence of the intended cipher.

### Full-word equality-partition constraint on the same surviving per-word family

**Agent4, 15 November: exact key-independent refinement and wider source-native control; no unknown plaintext.** The prior within-word five-back test compared only noninitial fifth-back differences. Under the specific model with one unrestricted 29! secret alphabet **reused at all positions of each complete word**, the first five positions satisfy \`C_j=π_w(P_j)\` and the rest satisfy \`C_j=C_{j−5}+π_w(P_j) mod29\`. Therefore the **entire** word transformed as \`D_j=C_j\` for \`j<5\`, \`D_j=(C_j−C_{j−5}) mod29\` for \`j≥5\` equals a secret monoalphabetic substitution of its entire plaintext word. The complete first-occurrence equality partition is invariant under **every** possible selection of the 2,896 hidden secret permutations, including comparisons between initial and later positions. This is stronger than the previously measured suffix-only partition (only nine absent long-word patterns). It is not an invariant of the *different five-independent-alphabets per word* cipher family.

Use all **2,896 original printed words and 12,956 original runes**, preserving true page-carried words and native GP29 orthography. Compare every complete transformed equality pattern against exact length-matched source words in archived Shakespeare, Gibran, Emerson, Latin Vulgate and the existing **29,164-entry TextBlob English word-frequency lexicon**. The four prose registers alone leave **78/2,896** transformed words without a match, including **59/109** long (10–14-GP-rune) words. **Adding the larger independent lexicon reduces the complete five-source misses to 57/2,896, including 47/109 long words.** Long-word unmatched counts by length10/11/12/13/14 are **17/12/11/4/3**. For comparison, 44/2,896 *unaltered ciphertext* word patterns and 40/109 unaltered long-word patterns are absent from the same five-source union. The difference 57 versus44 is a bounded measurement, not a validated ciphertext decoder.

An important same-length English-language control now emerges. For **500 complete length-matched synthetic native books per source**, sample genuine words from one reference while looking up each pattern in **all other four references**. The median unmatched complete words (5th–95th percentiles) are **Shakespeare 21 (15–27), Gibran 10 (6–17), Emerson 15 (9–21), Latin 94 (83–105), and TextBlob 82 (72–94)**. The corresponding medians among the 109 long word slots are **19, 8, 13, 66, 54**. The original **57** is outside the 500-run English literary-control ranges, but lies below the typical Latin and TextBlob-source miss counts. Under **these** English registers this exact one-alphabet-per-word five-back family would require markedly atypical complete native word shapes. The same evidence cannot reject arbitrarily rare English vocabulary, unconstrained word segmentation, a different language/register, or a substantially different cipher. A finite dictionary omission is not a logical contradiction.

The [single-file original-input CommonJS SFT](../sims/lp2_fiveback_fullword_partition_sft.cjs) fixes the five source registers, complete source alignment, the exact original miss counts, **2,500 independent source-length-matched native books**, and a positive native-word cipher with **2,896 distinct secret 29! maps** recovering and forward-reencrypting **12,956/12,956** GP runes. This establishes test sensitivity and the exact key-independent equivalence for the specified model. The remaining high-value missing input is **a creator-selected word-key derivation** or a new original-source ciphertext inverse; no unknown plaintext, key, or destination has been recovered.

### Direct plaintext-producing test of the surviving per-word family

The per-word arbitrary-29! cipher is formally capable of hiding almost any word suffix, but a much cheaper source-constrained subset gives a falsifiable plaintext candidate. Restrict each word's unknown permutation to **one additive Caesar shift** `σ_w(P)=P+k_w mod29`, allowing a completely independent secret shift for **every original word**. Under the same five-back feedback equation, **each original word of length 10–14** has a cipher-known tail of **5–9 native GP plaintext runes up to one unknown shift**: `D[w,j]=C[w,j]−C[w,j−5]=P[w,j]+k_w mod29` for all `j≥5`. Search all **complete same-length GP words** from each of four archived source-native English/Latin registers, allowing every of the 29 possible shifts; a match would specify a genuine candidate word suffix and its word key, rather than relying on a broad IoC alone.

There are exactly **109** original complete printed LP2 words of length 10–14. **Zero of 109** has any exact shift-equivalent fifth-back suffix among native words of identical GP length in each independent finite register: Shakespeare **0**, Gibran **0**, Emerson **0**, Latin Vulgate **0**. A separate **109-word source-shaped positive plant per reference** selects an authentic native word of the exact original length, an independent hidden `k_w=(3+7w) mod29`, preserves original first-five-rune state, then encrypts the suffix with the *actual* five-back forward rule. Every reference's plant recovers **109/109** exact native suffix candidates. The absence of real matches is therefore a discriminating result against this per-word Caesar class **for words occurring in these four frozen source vocabularies**, rather than a malfunction of the search.

**Scope:** A finite corpus cannot encompass all possible English or historical source words; unknown LP2 plaintext might use vocabulary absent from every reference, or a more general per-word permutation/state/orthography. The result supplies **no authentic ciphertext decryption or key**, and it does not overturn the broader word-keyed 29! model's survival on the equality statistics. However, the simplest per-word additive variant motivated by the actual five-dot feedback is **not supported by even a single long original word** in any of four independent source registers. [Exact-source CJS SFT including all plants](../sims/lp2_lagfive_feedback_allsecret_original_sft.cjs) · [Successful original-input run 43740823876](https://github.com/FlareZ123/liber-primus/actions/runs/43740823876).

**Decision:** Reject this entire **page-reused five-phase bijective five-back modular feedback family** under intact original GP word boundaries and the four tested source-native English/Latin plaintext registers, even granting arbitrary unknown maps on every page/phase. It does **not** exclude fresh secret maps every word or position, non-bijective transforms, nonlinear feedback, different plaintext registers, hidden segmentation, or other source-selected recurrence. The fifth-back echoes remain a genuine original-cipher phenomenon whose actual reversible explanation is unestablished. No original unknown plaintext or key was recovered. [Successful original-input Node22 manual CI run 43739340329](https://github.com/FlareZ123/liber-primus/actions/runs/43739340329).

## One-back cryptanalytic decision

**Reject this complete page-reused five-phase modular ciphertext-feedback family for the tested source-native GP English and Latin Vulgate registers under the original printed segmentation.** The cipher may change raw letter marginals and still cannot conceal the strong phase-conditioned *plaintext equality frequencies* in its observable one-step differences. This is distinct from the earlier direct five-phase substitution all-secret test and from per-word affine/Vigenère exclusions.

It does not reject noninvertible phase maps; an independent map for **every word**; keyed nonlinear feedback; a hidden intermediate encoding; edit/insert/delete operations; plaintext written in another register; or a mechanism whose phase changes with state. Those would require an original instruction or a source-locked recovered-key prediction before serious compute. There is no authentic new unknown-page decryption.

**Reproduction:** [standalone Node22 original-input all-key SFT](../sims/lp2_wordfive_cipherfeedback_secret_alphabet_sft.cjs) · [successful expanded GitHub Actions run 43619016826](https://github.com/FlareZ123/liber-primus/actions/runs/43619016826). It checks two independent full source rune registers against each other, **1,000** native-English and Vulgate Latin controls, 275 independent secret maps, full positive inversion and preserved equal-pair invariants.
