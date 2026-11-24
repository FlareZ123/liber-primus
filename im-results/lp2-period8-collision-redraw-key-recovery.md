# Unknown periodic key recovery with collision-only one-redraw feedback

**Agent9 — 24 November 2026. Independent exploration after all executable Director issues were occupied.** The method recovers 3/3 secret eight-rune keys and all 2,050 solved-native planted runes, including 934 untouched continuation runes. On original LP2, no key supports two long lexical anchors in p0–2 or in the training half of any visual chapter. Every nominated original key has a nonlinguistic independent continuation. No authentic unknown plaintext or original key recovered. The spacing-free repeated-author-phrase extension below also excludes its complete and two-period cribs at historical q8/q13; the five nominated short-crib keys fail independent continuation. Neither result excludes arbitrary plaintext under the cipher relation.

## Why this is an actual key-recovery test

The genuine LP1 WELCOME solution establishes an eight-rune periodic additive key as a period-appropriate prior. The original LP2 adjacency deficit motivates a collision-only key advance. Earlier fixed-phase, true-F-hold, exact known-key prime-cursor and spectral drift experiments do not supply an unknown-key inverse for this particular short periodic model. The low repeat rate does not itself identify a rejection mechanism.

Freeze one model: plaintext and ciphertext are GP29 indices, every emitted rune consumes at least one key element. At key phase j, tentative ciphertext is (P+K[j]) mod29. If this equals the preceding emitted ciphertext, optionally consume one additional key element and emit (P+K[j+1]) mod29. Otherwise the first tentative value must be emitted. The additional redraw is accepted even if it still repeats. The hidden redraw choices are unrestricted within this rule. No F hold, other skip types, period sweep, secret alphabet, fitted shift or word reset. This conditional relation is not claimed injective without its hidden redraw path, nor authenticated as an LP2 cipher.

An intact long plaintext word from a finite dictionary supplies one exact full-key equation per rune, and two equations at a redraw. Enumerate the no-redraw and collision-only redraw alternatives, assigning K[j] and optionally K[j+1]; reject conflicting residue equations immediately. Every word of length at least eight consumes at least eight residues, so all eight key values are determined. Canonicalize cyclic rotation, allowing arbitrary anchor phase. Use all printed training groups of length ≥10; recover every key with at least one exact word witness. A key supported by ≥2 distinct anchors is especially strong. The fixed dictionary is checked-in TextBlob words (historical GP spelling normalization) plus actual solved native GP words; no unknown candidate strings added.

For every surviving key, exact dynamic programming over eight incoming phases and all legal within-word redraw histories maximizes a word-local trigram score (add-0.25, boundary symbols) plus dictionary reward 2×word length+0.1 log(1+frequency). No beam. Select the best key and end phase using only the training region. Freeze both for untouched continuation. Exact forward replay checks every rune, every redraw and final phase. Dictionary/score training for a planted target excludes its entire solved section.

## Key recovery on solved-source controls

Plant three independent keys, encrypt the actual solved-native sections using a hidden policy that redraws a collision unless the zero-based rune index is divisible by five. The inverse does not know that policy. Training ends after the second observed length≥10 word, so no held-out word influences key or phase selection.

| Native target | Recovered rotational key candidates supported by both anchors | Training exact | Held-out exact | True redraw count |
| --- | ---: | ---: | ---: | ---: |
| WELCOME | 1 (true key) | 274/274 | 241/241 | 11 |
| First KOAN | 1 (true key) | 754/754 | 26/26 | 12 |
| LOSS OF DIVINITY | 1 (true key) | 88/88 | 667/667 | 10 |
| Total | 3/3 true keys | 1,116/1,116 | 934/934 | 33 |

The first KOAN's short holdout is explicit; the much longer independent LOSS OF DIVINITY continuation supplies a stronger generalization control.

## Original opening and independent continuation

P0–2 contains 729 runes in 158 complete printed groups. Six ≥10-rune anchors occur at original global offsets 23, 62, 397, 575, 668, 708. The two 11-rune anchors admit **zero** keys across 1,451 candidate words each. The four 10-rune anchors admit 3,3,2,6 keys across 2,388 candidate words each. Their 14 rotational classes are disjoint: maximum support one out of six anchors.

Even grant all 14 single-anchor classes as candidates. The optimal training candidate K=[0,11,22,27,21,12,5,22], initial phase3, end phase7, has 1/69 long (≥5-rune) dictionary hits. Freeze the key and phase and continue into untouched p3–7: 0/98 long words across 1,145 original runes, score −5024.2702638197725, 17 legal redraws. Both regions re-encipher exactly. The continuation begins `IAJ USDPMJOJCNGT RAEF STHJH CYMPEOIT NHXRAEAT`; it is not a plaintext candidate.

## Independently keyed visual chapters

Allow a fresh rotational key for every source-defined chapter. Train on the first half of its printed groups, freeze the best key and outgoing phase, and decode the untouched half. Physical p50 has zero runes; parser inserts that page before partitioning. All 58 page rune tapes are compared to canonical indices in the reproducer. Words wrapping lines and pages are kept whole.

| Original chapter | Training anchors | Candidate keys | Keys with ≥2 anchors | Untouched long-word hits |
| --- | ---: | ---: | ---: | ---: |
| p0–2 | 2 | 0 | 0 | no key to continue |
| p3–7 | 5 | 4 | 0 | 0/48 |
| p8–14 | 8 | 6 | 0 | 0/72 |
| p15–22 | 4 | 9 | 0 | 0/85 |
| p23–26 | 4 | 11 | 0 | 0/49 |
| p27–32 | 10 | 26 | 0 | 0/64 |
| p33–39 | 6 | 10 | 0 | 0/82 |
| p40–53 | 13 | 42 | 0 | 0/124 |
| p54–55 | 1 | 2 | 0 | 0/16 |

All 540 long held-out words of the eight nominated-key chapters miss the fixed dictionary; zero independently coherent continuations. The exact multi-anchor exclusion is conditional on a shared eight-rune key and at least two intact training words in the finite lexicon. The one-anchor key choice is a calibrated predictive negative, not an exhaustive language theorem. The terminal chapter has only one training anchor and cannot be excluded by multi-anchor support. Other periods, true-F holds, multiple redraws, variable plaintext segmentation, or unrelated source-selected keys remain outside scope.

**Decision:** retire the precise q8 collision-only one-redraw intact-group architecture as an ordinary native GP prose receiver. Do not tune the redraw law or phase to the observed noise. The reusable full-key anchor recovery procedure is a genuine blind key recovery positive, not a source authentication or a newly solved original page.

[Standalone Node22 SFT](../sims/lp2_period8_collision_redraw_key_recovery_sft.cjs). The exact computations were executed directly against pinned repository contents in JavaScript, then preserved here; no claim of a separate CI run.

## Spacing-free authentic repeated-phrase key recovery, q8 and q13 (24 November, Agent9)

**Decision:** removing the intact-printed-word constraint does not rescue the fixed collision-only optional one-redraw model when an exact author formula from solved LP1 is the crib. All 56 original unknown pages are searched as a continuous GP29 tape, with no trust in printed spacing. The repeated-source hypothesis is distinct from dictionary anchor inference above: it explicitly allows a crib to start inside any printed group or across any page/line boundary.

The independent selection rule is maximal exact repeated substrings of length at least 20 in each solved LP1 native section, excluding LP2 p56/p57 from crib generation. The six distinct spans have lengths 37,29,42,41 (first KOAN) and 22,20 (LOSS OF DIVINITY), with first offsets 54,62,62,407,215,446. These are real repeated phrases; there is no authenticated instruction establishing that LP2 repeats them. Preserve exact source spellings and rune indices. The q8 and q13 periods come from the historical solved additive keys DIUINITY and FIRFUMFERENFE. The collision-only optional redraw law is an exploratory extension, not a historical fact.

For each source crib and every possible original start, fix cyclic phase zero without loss of generality and enumerate **all** legal zero/one-redraw schedules. A normal emission binds K[j]=C-P mod29; a redraw binds K[j]=Cprev-P and K[j+1]=C-P mod29. Conflicts eliminate the path immediately. Since all tested cribs exceed the period, every successful path yields the complete key and outgoing phase. The previous original ciphertext rune is known, except at manuscript start where no redraw can occur. The original input has 12,956 runes. The partial formula variants take every distinct contiguous fragment of a fixed length from the six maximal phrases; they do not introduce new vocabulary or change the cipher.

| Period | Crib scope | Distinct cribs | Original start/crib comparisons | Compatible key/phase/start paths | Best untouched 150-rune score |
| --- | --- | ---: | ---: | ---: | ---: |
| 8 | Whole maximal spans | 6 | 77,551 | 0 | — |
| 13 | Whole maximal spans | 6 | 77,551 | 0 | — |
| 8 | 16-rune fragments | 59 | 763,519 | 0 | — |
| 13 | 26-rune fragments | 37 | 478,447 | 0 | — |
| 8 | 12-rune fragments | 71 | 919,095 | 3 | −3.510633 |
| 13 | 17-rune fragments | 56 | 724,640 | 2 | −3.504781 |

Total 3,040,803 original start/crib comparisons; exact counts are not independent statistical trials. The shorter q+4 fragments are a deliberately weaker key-nomination step, following failure of complete and two-period phrases. The five keys are fixed by their cribs before looking at the continuation. The continuation is spacing-free exact trigram Viterbi over (phase, previous two plaintext runes), including both legal redraw paths, with additive 0.2 smoothing. All five candidates forward-replay their 150-rune continuations exactly, as any legal inverse should. All five continuations are nonprose. Scores (nats/rune): q8 offsets 7734/4001/8478 = −3.510633/−3.514718/−3.514789; q13 offsets 3788/9665 = −3.504781/−3.517187. No candidate warrants a second independent continuation or a plaintext claim.

**Controls:** six distinct hidden periodic keys (three at each period) encrypt actual solved-native first KOAN and LOSS OF DIVINITY text, with hidden collision redraw except at rune indices divisible by five. The same keys are reused across fragment lengths; 17 total recovery runs, each with a single key/phase/start candidate, and 2,550/2,550 untouched continuation runes recovered exactly. The 26-rune fragment mode has only two KOAN controls because the LOSS repeated spans are shorter than 26. The native calibration searches a prefix whose end is the first occurrence of the selected crib, so its boundary is not independently hidden; start and key are inferred within that prefix. The continuation is excluded from key fitting, and the target's whole native section is excluded from trigram training. Short-crib control scores range from −2.945375 to −2.347177 nats/rune, above every original candidate. These are planted-control recovery results, not original LP1 ciphertext decryptions with the new law. The five original candidates do not generalize, and there is no familywise language-score null or general exclusion of this cipher without the crib premise.

**Disposition:** retire exact reused source formulas and the stated continuous q8/q13 optional collision-redraw receiver under these specific crib constraints. Do not mine further variants of the same phrases or claim a general rejection of q13, alternative clocks, F holds, or arbitrary plaintext. A genuinely new source-selected crib or state generator is required. No unknown LP2 plaintext, authentic key, or destination.

[Executable SFT](../sims/lp2_spacingfree_repeated_author_crib_redraw_sft.cjs) · [q8 full](lp2-spacingfree-repeated-author-crib-redraw-output.json) · [q13 full](lp2-spacingfree-repeated-author-crib-redraw-q13-output.json) · [q8 two-period](lp2-spacingfree-repeated-author-crib-redraw-q8-partial-output.json) · [q13 two-period](lp2-spacingfree-repeated-author-crib-redraw-q13-partial-output.json) · [q8 short](lp2-spacingfree-repeated-author-crib-redraw-q8-short-output.json) · [q13 short](lp2-spacingfree-repeated-author-crib-redraw-q13-short-output.json). The SFT accepts period 8 or 13, optional `partial`, and optional fragment length (default twice period). Example: `node sims/lp2_spacingfree_repeated_author_crib_redraw_sft.cjs 13 partial 17`. Executed in the JavaScript Code Mode runtime using repository corpus/source strings; standalone Node and CI execution are not separately claimed.
