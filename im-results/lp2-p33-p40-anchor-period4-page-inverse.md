# p33/p40 local inverse keys fail as period-four page/word streams

**Classification: bounded negative; intermediate result. No unknown-page plaintext or reusable key recovered.**

## Question and source-motivated premise

The existing numbered-diagonal work identifies two local four-rune receivers: the 2016 signed-message word at zero-based ordinal 33 selects p33/WILL, and ordinal 40 selects p40/PATHS. Their local additive inverses produce four-rune key candidates whose outside-in H shells coincide with named DH-state coordinates:

| Page / selected word | Cipher at receiver | Candidate plaintext | Local key C−P mod 29 | H(key) |
| --- | --- | --- | --- | --- |
| p33 / WILL, offset 132 | [3,15,17,22] | [7,10,20,20] | [25,5,26,2] | [23,8,2,27] |
| p40 / PATHS, offset 71 | [4,15,14,21] | [13,24,2,15] | [20,20,12,6] | [14,8,3,26] |

These are **local inverse candidates**, not independently authenticated page plaintext. The key interpretation is already recognized in the prior p33/p40 reports; this experiment asks whether the same four-rune key has a simple, reusable page-level consequence.

The minimal extensions worth testing are:
1. **Page-reset period four:** repeat the recovered four-symbol additive key across the selected physical page, with its phase fixed by the anchor's page-local offset.
2. **Printed-word-reset period four:** restart the same key at the first rune of each complete printed word on that page.

The two clocks are source-visible (physical page and printed word boundaries). No phase, period, or key is optimized.

## Method

- Original inputs: resources/liber-primus/lp2-corpus.json, lp2-transcription.txt, and lp1-plaintext-reference.txt.
- The word parser uses the repository's canonical cross-page contract: slash/whitespace are printed wraps that may continue a word; other non-runes close it; words spanning pages are not assigned to either page. It reproduces 2,864 complete words plus 32 cross-page words.
- For each anchor, derive k[i] = C[offset+i] - P[i] (mod 29).
- Page-reset model: rotate this local key by offset mod 4 to obtain the physical-page-start key, then decrypt every page rune with the repeated key.
- Word-reset model: decrypt every complete page-local word with the same key, restarting phase zero at each printed word.
- In both models, exclude the four-rune anchor from the language score. Score the remaining prefix and suffix separately so no trigram crosses the removed known-plaintext word.
- The word-reset model additionally omits the 1 p33 rune and 2 p40 runes belonging to words that cross the page boundary; the page-reset model covers every page rune.
- Use the repository's source-native GP29 trigram model, trained on the 3,510-rune LP1 plaintext reference. Its pinned training score is −2.260728 nats/rune; the independent clear p57 positive control scores −2.468145.

Reproducer: node sims/lp2_p33_p40_anchor_period4_page_inverse_sft.cjs.

## Results

| Page | Raw page score (anchor excluded) | Page-reset score | Raw complete-word score | Word-reset score | Page IoC | Word IoC | Complete words / runes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| p33 | −3.442945 | −3.399072 | −3.443314 | −3.425334 | 0.034450 | 0.033125 | 52 / 213 |
| p40 | −3.412189 | −3.420880 | −3.412595 | −3.418402 | 0.035359 | 0.034167 | 54 / 229 |

The source-native positive control p57 scores −2.468145; the GP29 uniform collision baseline is 1/29 ≈ 0.034483. Both decrypted pages remain near the uniform IoC baseline and far below the clear-text control. The decoded word streams are nonlinguistic; aside from the deliberately fixed WILL/PATHS anchors, neither model yields a coherent phrase.

The page-reset p33 score improves slightly over raw ciphertext, but the change is small and does not approach English. p40 worsens. Word-reset scores remain at the same cipher-like level on both pages.

## Decision

Reject only these two direct extensions:
- repeating each local C−P key across its entire selected page with page-start phase;
- repeating the same key independently from every complete page-local printed word start.

The result does **not** disprove the local WILL/PATHS inverse candidates, and does not exclude a different cipher, a different independently sourced key, or another page-specific operation. It does show that the two local four-rune keys are not straightforward period-four additive page/word keys. Do not expand this into arbitrary period, phase, or key searches: the source supplies no further clock or operation selector.

This corrected version uses the canonical cross-page word parser; it supersedes the preliminary word-reset metrics in the first checkpoint broadcast. The page-reset metrics are unchanged.

Prior context: im-results/lp2-p40-paths-index40-local-inverse.md · im-results/lp2-p33-p40-shared-shell-pair.md · im-results/lp2-numbered-diagonal-unitrun-direction-grammar.md.
