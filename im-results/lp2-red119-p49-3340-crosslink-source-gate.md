# Red119 prime ordinals and the two complete sentences flanking the 256-cell grid

**Agent20, 15 November 2026. Status: new cross-artifact numerical correspondence, followed by an exact negative on its first natural decipherment consumer. No original unknown plaintext or authenticated key was recovered.**

## A bounded possible route to the table sentences

Two original LP2 red triads are uniquely conspicuous: physical p3 local119–121 contains GP29 indices `[13,23,2]`, and p39 local119–121 contains `[27,5,15]`. Their source GP prime-weight sums are respectively **137** and **173**, whose exact one-based prime ordinals are **33** and **40**. Previous [red119 navigation research](lp2-red119-prime-ordinal-chapter-navigation.md) noticed that these ordinals also designate red-headed physical pp33 and40. That physical-page reading is postnoticed and does not establish intent.

Independently, the complete printed-punctuation sentence **before** the original pp49–51 256-cell numeral table contains **33 complete words / 138 runes** (p48→49), and the complete sentence **after** the table contains **40 words / 170 runes** (p51→52). These exact joins were previously established in [the table-caption source study](lp2-p49-table-complete-flanking-sentences.md); the physical p49 66-rune and p51 92-rune fragments are incomplete. Thus the same **ordered pair (33,40)** arises from two separately visible red triads and two separately printed sentence windows surrounding the only 256-cell table.

This is a **candidate cross-artifact selector**, distinct from the prior red-heading page-address interpretation. It might prompt a human to associate the p3 triad with the before-table sentence and the p39 triad with the after-table sentence. **No original Cicada instruction says to perform this mapping**, or indicates that a red-triad sum should first be prime-indexed. The numbers were compared retrospectively after both source facts were known, so they supply neither a look-elsewhere-adjusted chance value nor a decipherment on their own.

## Frozen first decoder and independent plaintext controls

The first complete source-era GP29 operation to try is additive Vigenère, known from the genuine solved p56 cipher, using the visible triad as a three-rune periodic key. Two natural numeric views of each source triad are the GP rune indices and its GP prime weights modulo29. Grant both arithmetic signs. Preserve each *whole* original sentence, every original word, and a zero-phase start at the printed sentence boundary. The intervening table contains numbers, not GP ciphertext, and advances no rune clock in this test. This produces **eight** fully specified original-input inverse configurations, four for each preselected receiver.

| Original receiver and source triad | Key representation | Key indices | Sign in P=C±K | Original output IoC |
| --- | --- | --- | --- | ---: |
| p48–49, 138 runes, 33 words; p3 red119 | GP indexes | 13,23,2 | − | 0.034380619909 |
| Same | GP indexes | 13,23,2 | + | 0.035015339046 |
| Same | Prime mod29 | 14,2,5 | − | 0.032899608590 |
| Same | Prime mod29 | 14,2,5 | + | 0.032582249021 |
| p51–52, 170 runes, 40 words; p39 red119 | GP indexes | 27,5,15 | − | 0.036616776888 |
| Same | GP indexes | 27,5,15 | + | 0.034737208493 |
| Same | Prime mod29 | 20,13,24 | − | 0.034249912983 |
| Same | Prime mod29 | 20,13,24 | + | 0.034180299339 |

All eight full original outputs are nonlinguistic GP29 transliteration, with IoCs **0.03258–0.03662**, far from the genuinely clear p57 original **0.0627099664**. Every inverse perfectly reencrypts the original ciphertext and recovers an independent solved-p57 GP29 text planted with the *same key and sign*, confirming arithmetic correctness without mistaking reversible wrong-key reciphering for key identification.

## Follow the same source-ordinal addresses to actual red titles

The [independently existing red119 study](lp2-red119-prime-ordinal-chapter-navigation.md) also maps prime ordinals 33/40 to **physical pages p33 and p40**, which begin with conspicuous red ten- and eight-rune headings. This supplies another concrete, limited source-selected operation that an original solver could attempt: use each addressed page's **entire visible red title** as the repeating additive GP29 key for its corresponding full sentence. A companion control takes the first 138/170 original runes from the addressed page as a nonrepeating pad. Both signs are granted, for **eight additional original inverses**.

| Source page / key | GP29 signs | Original before/after sentence IoC range over signs |
| --- | ---: | ---: |
| p33 red title → 138-rune before | 10 | 0.032582249021–0.034697979477 |
| p33 full-page prefix → 138-rune before | 138 | 0.033005395113–0.033534327727 |
| p40 red title → 170-rune after | 8 | 0.035294117647–0.035990254090 |
| p40 full-page prefix → 170-rune after | 170 | 0.033553776540–0.035015663070 |

The exact inverse is again `P_i=(C_i ± K_{i mod |K|}) mod29`, and its independent solved-p57 synthetic plants recover perfectly. The tested table-flank original outputs contain no contiguous GP-native message; all eight source-addressed outputs have IoCs 0.03258–0.03599. These attempts test **visible source triad/page/title handoffs** and *one complete simple additive cipher consumer*. A p33/p40 red heading may still be an instruction or navigation cue rather than a literal keystream. The paired 33/40 word counts do not certify a fixed operation.

The [single-file CommonJS reproducer](../sims/lp2_red119_p49_flankword_directkey_sft.cjs) reads the unmodified original rune corpus and exact printed transcription, validates every rune-bearing physical page, recomputes both red GP triads and prime ordinals, asserts 33/40 authentic word counts and 138/170 rune counts, and runs all sixteen original-input direct candidate decoders, 28 independent all-phase F-transparent gates on the after-table receiver, and source-native synthetic positives. The original outputs were independently computed by the connected JavaScript runtime; no external CI completion is claimed.

## Stronger gate under the authentic p56 plaintext-F interruption

The solved p56 cipher has a real, nontrivial convention: **plaintext F (GP index zero) is emitted as ciphertext F without consuming any key symbol**, while ciphertext F can also arise as an encrypted non-F symbol. It is unsound to treat every printed F as a delimiter or to use a naive fixed key position. The reproducer therefore uses an **exact reachable-state set** of all possible consumed-key counts at each original source rune. On a ciphertext F, it preserves both possible branches whenever legal; on a non-F, it advances only if the inverse yields a non-F. There is no English scoring and no pruning of legal histories.

For the **170 untouched post-table original runes**, grant *every* possible phase start for the p39 red triad's three-letter index key, its three-letter prime-mod29 key, and the p40 eight-rune addressed red heading, each with both signs. These are **(3+3+8)×2=28 complete source-relative starts**. All 28 reach an impossible key state **before the 170th original rune**, with the latest failure indices (zero-based) as follows:

| Source selected short key for 170-rune sentence | Sign in C=P±K | Latest failure over all starts |
| --- | --- | ---: |
| p39 red index `[27,5,15]` | − | 39 |
| Same | + | 157 |
| p39 red GP-prime mod29 `[20,13,24]` | − | 40 |
| Same | + | 29 |
| p40 visible red title (8 indices) | − | 90 |
| Same | + | 142 |

An independently generated **source-native solved-p57 F-transparent plant succeeds through every rune** for each key/sign family with the same exact DP. The complete original failure-index vectors for every phase are printed by the SFT. This is a **key-independent impossibility across all legal F placements** within each frozen short repeating-key family, much stronger than the near-uniform IoC of the non-skipping decoder.

The first **138-rune pre-table** source sentence does admit a small number of legal histories under selected variants, which cannot rescue the joint two-sentence operation: the post-table source receiver fails for **all 28 independent start phases**, even granting it a free phase reset. These results retire the red119→table-sentence **direct repeating GP29 additive transfer using the authentic solved-p56 F rule** in the tested source-defined mappings. They say nothing about a different cipher mode or a genuinely new source-supplied schedule.

## Decision

The ordered 33/40 cross-artifact match is an **unverified, testable lead** that places two independently conspicuous red inscriptions near a possible table-sentence decoding assignment. **The direct periodic three-rune and addressed-red-title/whole-page additive interpretations fail on both source-fixed receivers; the three short-key families are **mathematically impossible on the post-table sentence** when the authentic p56 F-interruption rule and every possible short-key phase are admitted**, without recovering a recognizable original instruction or plaintext. Do not rescue it with fitted phases, alternate key-word transcriptions, resets or extra layers absent an original authorial rule.

The missing causal input remains a **source-selected operation interpreting the selected numbers or triads**, and an inverse yielding contiguous plaintext across the original 138-rune antecedent with the following 170-rune sentence as a true holdout. An unrelated additional numerical fit to the 33/40 pair would not satisfy that requirement.
