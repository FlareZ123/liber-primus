# LP2 p8–p14 repeated-tree chapter: original-source common-pad decision

## Scope and current understanding

The seven consecutive original LP2 physical pages **p8–p14** reproduce the distinctive botanical tree artwork. This is a human-visible reason to ask whether each page reused the *same position-indexed additive key*, reset at its physical page start. It is a plausible simple, falsifiable route to recovering original plaintext without guessing any key. It is **not** a decipherment: all 56 LP2 unknown pages remain unread, and no authentic key, opcode, or original plaintext emerged.

The full seven pages have **[255, 268, 263, 273, 261, 272, 137]** GP29 ciphertext runes, checked against `resources/liber-primus/lp2-corpus.json`. The first page has a 12-rune red heading, so a heading-excluded variant was included before concluding. The 137-rune last page could be truncated relative to the others, motivating the longer-only checks. This experiment addresses **same-position modulo-29 addition on original runes with a common page-reset key**. It says nothing decisive about independently encrypted pages, offsets chosen by a printed rule, nonadditive transforms, an evolving state, external material, or an intermediate register other than source-native GP29.

## Key-independent experiment

Assume each page (j) has ciphertext (C_j(i)=[P_j(i)+K(i)]_{29}). Then for any two pages (j,k), aligned ciphertext differences (D_{jk}(i)=[C_j(i)-C_k(i)]_{29}) must equal ([P_j(i)-P_k(i)]_{29}), eliminating every unknown symbol of the reused key. A repeated key therefore creates source-language structure in original differences even if the ciphertext individually looks uniform.

The differential reference `q(d)` was constructed once from the **2,979 actual solved native-GP rune symbols** in `resources/external/relikd-solved-gp29-native-v1.json`: `q(d)=sum_r f(r)f((r-d) mod29)`. The unmodified, preselected score for all original aligned pairs was `sum log(29*q(d))`, the log-likelihood ratio for independent native-GP plaintext symbols against uniform differences. A positive value favors native-language differences over uniform. Because actual English is dependent rather than independent by token, calibration used genuine text controls instead of assuming asymptotic statistical significance.

The controls were independently sourced plaintexts converted **whole word by whole word** to the manuscript's native GP spelling, including the solved-page ING→GP21 and IO→GP27 conventions: Gibran's `The Prophet` (62,492 runes), Shakespeare (217,106 runes), and Emerson (321,327 runes), all already in `resources/control/`. Each scope has 300 deterministic cross-source placements using the published script's offsets; placements can overlap and are empirical comparisons, **not 300 formally independent tests**. A planted same-pad native-English seven-page construction and independent authentic solved p57 (95 runes) are included as code controls.

## Original ciphertext results

| Source receiver | Original same-position identical rune pairs | Original differential LLR | Minimum of 300 native-GP controls | Control median | Controls with score ≤ original |
| --- | ---: | ---: | ---: | ---: | ---: |
| All physical p8–p14 page starts | 178 / 4,738 | **−115.681629** | +43.722229 | +104.574903 | 0 |
| p8 after red12 heading; other pages unchanged | 159 / 4,678 | **−92.534767** | +40.595938 | +104.026092 | 0 |
| Full p9–p13 longer continuation pages | 93 / 2,641 | **−58.216372** | +10.606926 | +56.580991 | 0 |
| Full p9–p14 continuation pages | 119 / 3,326 | **−69.051526** | +17.068658 | +71.892737 | 0 |

The most direct full seven-page hypothesis is sharply disfavored, and the natural variants fail the same discriminator. This extends the separate negative for the p24–p26 mayfly triptych in `im-results/lp2-p24p26-mayfly-sourcealigned-sharedpad-decision.md`; the experiments concern different original artwork-based page groupings, and neither exhausts every alignment or cipher family.

**Decision:** retire the simple reset-at-page-start shared additive GP29 key across the complete seven-tree sequence for source-native ordinary English. Do not expand to arbitrary offset fitting or secret key brute force merely to rescue this rejected register. A genuinely new original page-level clock or source-selected value-changing opcode would constitute a distinct hypothesis and deserves separate evaluation.

**Exact reproduction:** `sims/lp2_tree7_sharedpad_original_sft.cjs` (Windows 11 / Node22 CommonJS, standard library only). It verifies all original source counts, all four exact LLRs, every native control comparison, the solved p57 authentic orthography, a planted shared-key seven-message inverse, and exact deterministic output. CI: [Windows manual original-source test](https://github.com/FlareZ123/liber-primus/actions/runs/45053883271). The first dispatch [45053715575](https://github.com/FlareZ123/liber-primus/actions/runs/45053715575) failed only at the platform's Windows CRLF paragraph delimiter when reading the known p57 positive; the corrected runner normalizes CRLF. Final result status is established by the corrected run, not by merely executing the earlier V8 arithmetic.

## What changes next

The repeated botanical image does not, by itself, establish any GP29 shared-pad clock. The simplest historically plausible page-key reuse on this independent chapter is now a closed negative. The highest-value successor remains an original author-visible key or operator that can act on complete untouched ciphertext and predict a second authentic passage; an arbitrary alternative pad period or phase is unsupported here.
