# GP29 predecessor-ciphertext quasigroup: exact all-secret rank-capacity obstruction

**Agent 2, 22 November 2026.** An exact, original-ciphertext, secret-key-independent theorem excludes several large reversible GP29 one-step feedback families as sole length-preserving decoders of ordinary source-native GP English or Latin. This is a language-conditional exclusion, with **no unknown plaintext, author-selected key, historical cipher or Cicada destination recovered**. The [single-file Windows/Node22 SFT](../sims/lp2_cipherprev_quasigroup_majorization_original_sft.cjs) has passed original-input and native-GP planted-control tests on [run 45004361283](https://github.com/FlareZ123/liber-primus/actions/runs/45004361283).

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

The global, eight-section, *every-word-position*, red/black, eight-section×red/black and word-position×red/black secret tables all have **strictly insufficient capacity** to encode the common-rune profiles of the native-GP English and Latin original-layout controls below. The section-parity combination excludes the sampled English profiles under B1, while the Latin profile remains possible within that separate combination. The page-specific family has enough secret freedom that the present rank bounds **do not exclude it**.

### Original ink cannot rescue a static predecessor cipher

The printed [full original ink annotation](../resources/liber-primus/lp2-ink-annotations.json) contains **213 red GP runes across unknown p0–p55**. Their literal identities, page counts and locations are independently checked against the canonical GP29 corpus in the SFT. **Every one of the 10,060 within-word rune transitions retains its red or black state**: all red/black changes occur at an authentic printed word boundary. Red/black can select a new cipher table between printed words, but cannot provide any within-word changing state in the original observed typography.

Even granting fully independent, arbitrarily secret 29-permutation alphabets **per observed ink color and per literal word position**, the original top-five source GP plaintext occupancy is capped at **4,089/10,060 (40.65%)**. Allowing an independent ink-specific table per original `$` section caps the same top-five occupancy at **4,024/10,060 (40.00%)**. Every Gibran, Shakespeare and Latin length-matched source-native GP control requires at least **4,555/10,060 (45.28%)**, so all 180 are still excluded. The stricter single global alphabet plus red/black state is limited to **2,610/10,060 (25.94%)**. These are exact necessary inequalities for the tested reversible families, without assuming a particular red/black key. They do not apply if the colors are *only one input* to a larger changing state, or if printed boundaries do not represent plaintext word boundaries. The color-specific planted inverses recover all 12,956 source-sized runes, and [Windows Node22 PASS 45005418665](https://github.com/FlareZ123/liber-primus/actions/runs/45005418665) covers original ink source identity and the exact capacities.

### Stronger unknown-schedule two-mode theorem

Even if an **unknown binary hidden mode** chooses between *two arbitrary independent* permutation tables **at every symbol**, with unrestricted choice of mode at each site and no recoverable clock, every fixed plaintext glyph can map to **at most two** next ciphertext glyphs per observed predecessor s. Its total original frequency therefore cannot exceed the same global B2 = **1,086/10,060 = 10.7952%**. The result holds even if mode selection depends on the plaintext and is chosen adversarially after seeing the original ciphertext. A **one-mode** system gives the tighter B1 = 578. A **three-mode** system has the weaker B3 = 1,582 for any single plaintext glyph and is **not excluded by this bound**.

Thus a decoder with at most **two stationary predecessor-ciphertext alphabets**, regardless of their switching schedule, cannot yield a source-native GP text with a common glyph above 10.7952% at these original word-interior positions. This is a cardinality/occupancy impossibility, independent of key entropy or computational search. It does not rule out three or more modes, location-specific key tables, changing symbol lengths, resegmentation, extra hidden state or exceptional language.

## Real solved-script and independent language controls

The authentic solved LP1 p10–13 sample contains 181 complete printed words with **574 internal GP runes**: literal E occurs **98/574 = 17.0732%**, and the five most common GP runes comprise **284/574 = 49.4774%**. The separate solved LP2 p57 has **15 E among 95 GP runes**. These demonstrate actual solved-Cicada spelling, rather than assuming generic Latin-letter-to-GP conversion.

Using the repo's [native GP encoder calibrated against literal solved LP1/p57](../sims/lp2_native_gp_source_orthography_sft.cjs), the passing SFT draws **60 seeded placements of 2,896 words, matched to each original GP word length**, from each pinned English and Latin source. All 180 language placements have exactly 10,060 within-word runes. The following are the **minimum** values across each source's 60 placements in [Windows PASS 45004361283](https://github.com/FlareZ123/liber-primus/actions/runs/45004361283):

| Source-native GP word-placement corpus | Lowest top-one plaintext glyph | Lowest top-five glyphs |
| --- | ---: | ---: |
| Gibran, The Prophet | **1,404 / 10,060 (13.9563%)** | 4,617 / 10,060 (45.8946%) |
| Shakespeare | **1,391 / 10,060 (13.8270%)** | 4,555 / 10,060 (45.2783%) |
| Latin Vulgate | **1,135 / 10,060 (11.2823%)** | 4,891 / 10,060 (48.6183%) |

All **180** sampled source-native placements exceed B2=1,086 for the arbitrary two-mode family, exceed the global/eight-section/word-position B1 values, and exceed the global/eight-section/word-position B5 values. Neither control sampling nor solved-page reference establishes the language, spelling register, frequency spectrum or word semantics of the unknown original plaintext. These are stringent explicit *source-language-conditional* exclusions.

### Positive, exact full-manuscript inverses

The same SFT creates independently secret, random but fixed GP29 row permutations for **all eight group scopes** and also plants **two-mode and three-mode** predecessor-based substitution families with a freely varying secret mode at *every* site. Source-native controls are encoded on the original 2,896-word shapes and decoded using their actual planted keys/modes, recovering **12,956/12,956 original-sized GP plaintext runes** for every tested architecture. The planted ciphertexts satisfy their own theoretical rank capacities. These implementation controls do not identify a creator cipher, key, or actual LP2 plaintext.

The original file parsing, GP alphabet, original printed word joins, real section/page clocks, exact row histograms, 60-trial source sampling and positive inverses are contained in one executable source file. An initial Windows run failed due CRLF-sensitive parsing of the solved LP1 fixture; that was corrected before the successful original-input controls.

## Cryptanalytic decision

For source-native English or Latin, retire **all fixed global one-step predecessor-cipher alphabet substitutions, all independently secret eight-section tables, all per-word-position stationary tables, all source-red/black-specific versions of those stationary models, and even two independent tables with an entirely arbitrary unknown sitewise switching schedule**. Under these assumptions, no secret mapping of those families has capacity to represent the observed original ciphertext as ordinary GP prose. An exhaustive key search of those families would be causally pointless.

The remaining credible choices require new independently selected information: at least three genuinely different predecessor-state alphabet choices for ordinary GP common-rune density; more complex memory; fresh per-page or evolving secrets; an original source-specific non-GP register; or altered word/letter boundaries. The art and first-party Cicada materials have **not yet selected** one such decoding rule. Do not promote numerical coincidences or synthetic key recovery as plaintext.

**Reproducer:** [`sims/lp2_cipherprev_quasigroup_majorization_original_sft.cjs`](../sims/lp2_cipherprev_quasigroup_majorization_original_sft.cjs), Windows11/Node22 [PASS 45004361283](https://github.com/FlareZ123/liber-primus/actions/runs/45004361283). A later runner at [45004366865](https://github.com/FlareZ123/liber-primus/actions/runs/45004366865) independently executed the same committed source revision.
