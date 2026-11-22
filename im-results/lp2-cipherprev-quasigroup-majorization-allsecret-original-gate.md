# GP29 predecessor-ciphertext quasigroup: exact all-secret rank-capacity obstruction

**Agent 2, 22 November 2026.** An exact, original-ciphertext, secret-key-independent theorem excludes several large reversible GP29 one-step feedback families as sole length-preserving decoders of ordinary source-native GP English or Latin. This is a language-conditional exclusion, with **no unknown plaintext, author-selected key, historical cipher or Cicada destination recovered**. The [single-file Windows/Node22 SFT](../sims/lp2_cipherprev_quasigroup_majorization_original_sft.cjs) has passed original-input and native-GP planted-control tests on [run 45006835347](https://github.com/FlareZ123/liber-primus/actions/runs/45006835347).

## Original evidence and cipher class

The authentic unknown LP2 source contains **12,956 GP29 runes in 2,896 complete printed words** (the rune-free p50 numeric table is excluded). The canonical word join across physical pages is checked against the canonical rune array. Exactly **10,060 positions follow a rune inside the same complete word**. They contain 63 adjacent-equal glyph pairs; the manuscript-wide within-physical-page statistic of 86 uses a different boundary definition.

Consider any one-step ciphertext-predecessor substitution:

    C[w,j] = Q[g][C[w,j-1]][P[w,j]], j>=1.

Here each secret row Q[g][s] is an **arbitrary bijection on 29 GP symbols**, indexed by the visible previous ciphertext rune s and a permitted group g. Different groups and different previous-rune states may have wholly unrelated permutations. Every one of the 2,896 word-initial plaintext runes is unconstrained. Ciphertext states are recoverable from the original ciphertext, so a known-row table admits a sequential inverse and forward re-encryption.

The eight bounded group choices are: (1) a global fixed table, (2) one independently secret table for each of the eight original `$` sections, (3) a separate table at every literal within-word position 1–13 (which includes **every fixed within-word periodic clock**), (4) a combined original-section and within-word parity clock, (5) an independent full table per physical rune-bearing page, plus (6) the original printed red/black ink color, (7) section×ink color, and (8) within-word position×ink color. The ink-color states are genuine original-source visible parameters rather than post-fitted clock guesses. These choices are tests of distinct reversible architectures; their existence is **not** evidence that the creator selected them.

## Exact theorem and original capacities

Let n[g,s,t] count observed original transitions from predecessor s to next ciphertext glyph t within one true printed word. A secret permutation Q[g][s] can only **reassign** the counts in each histogram row to plaintext glyph identities. Hence the number of positions occupied by the k most frequent recovered plaintext runes is no greater than

    B_k = sum over (g,s) of the k largest entries in n[g,s,*].

This is an exact, attainable upper bound over **all** hidden row permutations; no 29! enumeration, additive or affine assumption, language fit, secret optimizer or model-selection heuristic is used. It says nothing about the first rune in each word and cannot exclude atypical source plaintext with a flat marginal.

| Scope of independent unknown secret rows | Groups | B1 / 10,060 | B2 / 10,060 | B5 / 10,060 |
| --- | ---: | ---: | ---: | ---: |
| Global fixed | 1 | **578 (5.7455%)** | 1,086 (10.7952%) | **2,510 (24.9503%)** |
| Eight literal manuscript sections | 8 | **1,031 (10.2485%)** | 1,881 (18.6978%) | **3,912 (38.8867%)** |
| Every distinct within-word position | up to 13 | **1,058 (10.5169%)** | 1,925 (19.1352%) | **3,974 (39.5030%)** |
| Section × even/odd word position | up to 16 | **1,354 (13.4592%)** | 2,414 (23.9960%) | 4,842 (48.1312%) |
| Every physical source page | 55 | 2,401 (23.8668%) | 4,140 (41.1531%) | 8,019 (79.7117%) |
| Original red / black rune ink | 2 | **614 (6.1034%)** | 1,147 (11.4016%) | **2,610 (25.9443%)** |
| Eight authentic sections × red / black | up to 16 | **1,134 (11.2724%)** | 2,008 (19.9602%) | **4,024 (40.0000%)** |
| Every within-word position × red / black | up to 28 | **1,160 (11.5308%)** | 2,060 (20.4771%) | **4,089 (40.6461%)** |

The global, eight-section, *every-word-position*, section×word-position-parity, red/black, eight-section×red/black and word-position×red/black secret tables all have **strictly insufficient capacity** to encode the common-rune profiles of the native-GP English and Latin original-layout controls below. The combined original-eight-section × alternating word-position state family is also incompatible with every tested native GP register: Gibran's top-one minimum 1,404 and Shakespeare's 1,391 exceed its exact B1=1,354; Latin's top-five minimum 4,891 exceeds its exact B5=4,842 even though Latin's top-one count does not exceed B1. Corrected Old English Beowulf's top-one minimum 1,437 on just 10,021 matched sites likewise exceeds the full-original B1=1,354. Thus even all secret tables for sixteen such source-motivated state classes cannot directly yield these native GP prose controls. The page-specific family has enough secret freedom that the present **rank bounds** do not exclude it. A separately necessary word-collision invariant excludes the page-specific subclass with a deterministic per-word reset under source-native language models; see the page-local section below.

### Original ink cannot rescue a static predecessor cipher

The printed [full original ink annotation](../resources/liber-primus/lp2-ink-annotations.json) contains **213 red GP runes across unknown p0–p55**. Their literal identities, page counts and locations are independently checked against the canonical GP29 corpus in the SFT. **Every one of the 10,060 within-word rune transitions retains its red or black state**: all red/black changes occur at an authentic printed word boundary. Red/black can select a new cipher table between printed words, but cannot provide any within-word changing state in the original observed typography.

Even granting fully independent, arbitrarily secret 29-permutation alphabets **per observed ink color and per literal word position**, the original top-five source GP plaintext occupancy is capped at **4,089/10,060 (40.65%)**. Allowing an independent ink-specific table per original `$` section caps the same top-five occupancy at **4,024/10,060 (40.00%)**. Every Gibran, Shakespeare and Latin length-matched source-native GP control requires at least **4,555/10,060 (45.28%)**, so all 180 are still excluded. The stricter single global alphabet plus red/black state is limited to **2,610/10,060 (25.94%)**. These are exact necessary inequalities for the tested reversible families, without assuming a particular red/black key. They do not apply if the colors are *only one input* to a larger changing state, or if printed boundaries do not represent plaintext word boundaries. The color-specific planted inverses recover all 12,956 source-sized runes, and [Windows Node22 PASS 45005418665](https://github.com/FlareZ123/liber-primus/actions/runs/45005418665) covers original ink source identity and the exact capacities.

### Stronger unknown-schedule two-mode theorem

Even if an **unknown binary hidden mode** chooses between *two arbitrary independent* permutation tables **at every symbol**, with unrestricted choice of mode at each site and no recoverable clock, every fixed plaintext glyph can map to **at most two** next ciphertext glyphs per observed predecessor s. Its total original frequency therefore cannot exceed the same global B2 = **1,086/10,060 = 10.7952%**. The result holds even if mode selection depends on the plaintext and is chosen adversarially after seeing the original ciphertext. A **one-mode** system gives the tighter B1 = 578. A **three-mode** system has the weaker B3 = 1,582 for any single plaintext glyph and is **not excluded by this bound**.

Thus a decoder with at most **two stationary predecessor-ciphertext alphabets**, regardless of their switching schedule, cannot yield a source-native GP text with a common glyph above 10.7952% at these original word-interior positions.

The authentic [large-punctuation source annotation](../resources/liber-primus/lp2-ink-annotations.json) contains **28 thirteen-dot marks and 3 ten-dot marks on unknown p0–p55**, with **no twenty-three-dot mark** before the separately solved ending; the single 23-dot mark closes p57. Consequently, **a proposed rule using only the last seen 10- versus 13-dot mark to select one of two stationary previous-ciphertext alphabets** falls directly under the exact arbitrary-binary-mode obstruction. The original dot-count clue by itself cannot supply the extra independently changing rune-state required by native GP English/Latin/Old English. This conclusion is explicitly conditional on the mark size selecting the *sole* cipher mode; additional chapter, ink, number, word or evolving secret state changes the architecture. This is a cardinality/occupancy impossibility, independent of key entropy or computational search. It does not rule out three or more modes, location-specific key tables, changing symbol lengths, resegmentation, extra hidden state or exceptional language.

## Real solved-script and independent language controls

The authentic solved LP1 p10–13 sample contains 181 complete printed words with **574 internal GP runes**: literal E occurs **98/574 = 17.0732%**, and the five most common GP runes comprise **284/574 = 49.4774%**. The separate solved LP2 p57 has **15 E among 95 GP runes**. These demonstrate actual solved-Cicada spelling, rather than assuming generic Latin-letter-to-GP conversion.

Using the repo's [native GP encoder calibrated against literal solved LP1/p57](../sims/lp2_native_gp_source_orthography_sft.cjs), the passing SFT draws **60 seeded placements of 2,896 words, matched to each original GP word length**, from each pinned English and Latin source. All 180 language placements have exactly 10,060 within-word runes. The following are the **minimum** values across each source's 60 placements in [Windows PASS 45004361283](https://github.com/FlareZ123/liber-primus/actions/runs/45004361283):

| Source-native GP word-placement corpus | Lowest top-one plaintext glyph | Lowest top-five glyphs |
| --- | ---: | ---: |
| Gibran, The Prophet | **1,404 / 10,060 (13.9563%)** | 4,617 / 10,060 (45.8946%) |
| Shakespeare | **1,391 / 10,060 (13.8270%)** | 4,555 / 10,060 (45.2783%) |
| Latin Vulgate | **1,135 / 10,060 (11.2823%)** | 4,891 / 10,060 (48.6183%) |

All **180** sampled source-native placements exceed B2=1,086 for the arbitrary two-mode family, exceed the global/eight-section/word-position B1 values, and exceed the global/eight-section/word-position B5 values. Neither control sampling nor solved-page reference establishes the language, spelling register, frequency spectrum or word semantics of the unknown original plaintext. These are stringent explicit *source-language-conditional* exclusions.

### Corrected Old English source, including the three unmatched long words

A fourth, linguistically distinct GP29-native source is the repository's [independently corrected Beowulf GP stream](../resources/control/beowulf_oe_gp_profile_corrected.json): **10,885 actual source words and 48,012 already normalized GP runes**, with all 29 GP29 source-rune counts verified against the literal corrected profile. The original source has maximum GP word length 13; unknown LP2 has three printed words of length 14. The SFT therefore samples only the **2,893 exactly supportable original word lengths**, containing **10,021 complete-word interior GP positions**, without fabricating 14-rune Old English tokens. There are 180 independent seeded source-register draws, each using the original GP word-length inventory for those 2,893 words.

| 180 corrected Old English Beowulf GP placements | Minimum | Maximum |
| --- | ---: | ---: |
| Most frequent GP rune within 10,021 matched sites | **1,437 (14.3399%)** | 1,604 |
| Five most frequent GP runes within 10,021 matched sites | **4,735 (47.2508%)** | 4,958 |

These **partial-plaintext source counts already exceed the full-manuscript original-cipher capacities over all 10,060 sites**, even without choosing any plaintext at the three unrepresented length-14 words: the single most common old-English GP rune requires at least **1,437 occurrences**, versus the *generous original position×color-table upper bound* of **1,160**, and any five common native runes require at least **4,735**, versus the same full-original bound **4,089**. Adding the missing three words can never reduce the frequency of any fixed set of letters already counted. The other original source-visible stationary scopes have strictly tighter B1/B5 ceilings. The completely unknown binary mode still has B2=1,086 below every sampled Old English top-one count.

This is a source-register-conditional exclusion even when the unknown prose is modeled on premodern **Old English** rather than modern English or Latin, grounded in a corrected primary word stream. It does not prove LP2 actually contains Old English, and it does not supply any plaintext. The completed [Windows/Node22 run 45006092151](https://github.com/FlareZ123/liber-primus/actions/runs/45006092151) passed all exact source-profile counts, original capacity assertions and 180 subset placements.

### The remaining page-local family needs a changing word state

A fresh `Q[page][previousC]` at each physical page has sufficient first-order alphabet capacity to evade the row-histogram exclusion. This does **not** rescue the natural subclass in which the *first ciphertext symbol of every word* is initialized deterministically from that word's first plaintext symbol with one fixed function per page. All words entirely within a page then share one fixed deterministic **plaintext-word → ciphertext-word** map for that page. Identical plaintext words must encipher identically under every possible secret row permutation. This follows independently of the GP ranks and is a special case of the already established [original page-local word-collision theorem](lp2-word-collision-injective-source-gate.md).

For a new archaic-language cross-check, the same corrected Beowulf source was drawn **300 times** with the authentic GP word lengths **and physical starting-page assignments** for all **2,861 complete words fully inside an original page**. The 32 words carried across a physical page boundary were omitted, so a hypothetical cipher-table change *inside* a carried word cannot weaken the argument. The three length-14 words missing from Beowulf's genuine source register were also omitted. The original ciphertext has exactly **four** identical-word pairs among the remaining fully contained source words; every Beowulf source draw has **290–435 pairs** (median **360**). No sample reaches four. The [completed Windows original-source run 45006351256](https://github.com/FlareZ123/liber-primus/actions/runs/45006351256) tests both the ranked-count and page-local-word-collision constraints.

**Conditional decision:** a page-specific stationary previous-ciphertext table with a deterministic per-word initializer cannot represent ordinary source-native English or corrected Old English prose under preserved printed word boundaries. A page-local table with *state carried across words*, or a genuinely fresh word-dependent nonce or key, is not ruled out by this collision test. As with all source controls, deliberately repetition-free plaintext is outside the sampled natural-language premise.

### Positive, exact full-manuscript inverses

The same SFT creates independently secret, random but fixed GP29 row permutations for **all eight group scopes** and also plants **two-mode and three-mode** predecessor-based substitution families with a freely varying secret mode at *every* site. Source-native controls are encoded on the original 2,896-word shapes and decoded using their actual planted keys/modes, recovering **12,956/12,956 original-sized GP plaintext runes** for every tested architecture. The planted ciphertexts satisfy their own theoretical rank capacities. These implementation controls do not identify a creator cipher, key, or actual LP2 plaintext.

The original corpus parsing, GP alphabet, canonical full-word joins, physically printed source-ink/section/page clocks, exact state-histogram capacities, all four native-GP language-register controls, real word-collision counts and exact positive inverses are contained in the single reproducible CommonJS script. Source integrity assertions include the literal GP29 red-rune identities and the corrected Beowulf GP symbol-count profile.

### Independent 29-start word-repetition bound (source-language sensitive)

The all-secret predecessor-state model also has a **word-level constraint** that does not use ciphertext rune rank frequencies. For a single fixed global GP29 transition table, each given plaintext word can produce at most **29 distinct ciphertext words**, even if the word's first ciphertext rune can be any of the 29 symbols and is selected adversarially afresh at every word. The remaining ciphertext letters are uniquely determined by that initial rune and the fixed per-state secret bijections. If a plaintext word appears `n=29q+r` times, the unavoidable number of equal complete ciphertext-word pairs among its realizations is at least

`r · q(q+1)/2 + (29−r) · q(q−1)/2`.

Summing over all source plaintext word identities yields a second exact, all-secret **necessary** constraint. The original 2,896 printed ciphertext words have precisely **230 equal-word pairs** across the manuscript. This theorem assumes fixed global word-transition dynamics with 29 possible initial ciphertext symbols; it does not apply unchanged to fresh word-dependent tables, section-specific tables or freely switching internal cipher modes.

The final SFT applies that exact bound to the same **60 full original-length native-GP controls per Gibran/Shakespeare/Latin source**. **All 60 Gibran and all 60 Latin controls** have a necessary minimum exceeding the original 230 cipher word-pair events, regardless of the 29 permitted initial ciphertext choices. Shakespeare remains a counterexample to any **universal** word-variant-only exclusion, so the code records its complete source range without claiming every sample violates the bound. For the 180 corrected Beowulf source placements on 2,893 supportable original word lengths, **170/180** force more than 230 ciphertext word pairs, while **10/180 do not**; their actual bound range is **208–346**. The earlier, much stronger rank-capacity theorem excludes all these sampled source registers under the fully stationary global and source-visible color/position models. The complete original-word counts and planted inverses pass [Windows Node22 run 45006835347](https://github.com/FlareZ123/liber-primus/actions/runs/45006835347).

This independent word-variant limitation pinpoints an additional required degree of cipher nonstationarity for highly repetitive plaintext, even if its rune frequencies were atypically flat. It is not a proposed plaintext readout.

## Cryptanalytic decision

For source-native English, Latin or corrected Old English Beowulf-like GP prose, retire **all fixed global one-step predecessor-cipher alphabet substitutions, all independently secret eight-section tables, all per-word-position stationary tables, all source-red/black-specific versions of those stationary models, and even two independent tables with an entirely arbitrary unknown sitewise switching schedule**. Under these assumptions, no secret mapping of those families has capacity to represent the observed original ciphertext as ordinary GP prose. An exhaustive key search of those families would be causally pointless.

The remaining credible choices require new independently selected information: at least three genuinely different predecessor-state alphabet choices for ordinary GP common-rune density; more complex memory; fresh per-page or evolving secrets; an original source-specific non-GP register; or altered word/letter boundaries. The art and first-party Cicada materials have **not yet selected** one such decoding rule. Do not promote numerical coincidences or synthetic key recovery as plaintext.

**Reproducer:** [`sims/lp2_cipherprev_quasigroup_majorization_original_sft.cjs`](../sims/lp2_cipherprev_quasigroup_majorization_original_sft.cjs), exact original-input Windows Node22 [PASS 45006835347](https://github.com/FlareZ123/liber-primus/actions/runs/45006835347), including the fully secret 29-initial-codeword word-variant bound.
