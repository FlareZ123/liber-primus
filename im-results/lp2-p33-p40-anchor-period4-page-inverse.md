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

## Variable DH public-share continuation (Agent32, 27 November 2026)

The fixed-period exclusions above now extend to an explicit variable-key architecture. From the prior candidate H shells, freeze p33 [23,8,2,27] and p40 [14,8,3,26]. The authenticated worked DH state has modulus23, generator5 and public share8. For each four-consuming-rune block, hold H0,H2,H3 fixed and let H1 be A. Apply the exact outside-in H inverse, then subtract the resulting four digits modulo29. After the existing four-rune anchor, first test advancing A by multiplication by5 mod23 per block, and the reflected direction (multiply by14 mod23). Neither rule was specified by the author; this is a narrowly motivated exploratory continuation, not a blind prediction. Then grant every independent A∈{1,...,22} per block, encompassing all possible nonzero DH-public-share sequences with the other shell coordinates fixed. No offsets, signs, shell roles, or extra resets are optimized. The original suffixes are p40 offsets75–230 (156 runes), p33 offsets136–213 (78 runes).

For ordinary consumption the exact Viterbi state retains the current block phase, selected A and previous decoded rune. For authentic plaintext-F bypass, C=F may pass through without consuming a key digit, or consume only if the resulting P is non-F; a non-F C cannot decode to F. Enumerate all feasible transitions and merge only identical state/previous-rune pairs, preserving total state-history counts and the best bigram path. Thus the MAP score is exact for this finite model; a dead state set is a language-independent algebraic exclusion. Every surviving winner re-encrypts exactly, which is an implementation invariant, not key evidence.

| Page | Clock | Forward DH progression | Reflected DH progression | Arbitrary A, exact best |
|---|---|---:|---:|---:|
| p40 | ordinary | −4.008774 | −4.077569 | −3.159263 |
| p40 | F hold | impossible at suffix offset33 | impossible at offset9 | impossible at offset56 |
| p33 | ordinary | −3.988363 | −3.851029 | −3.084767 |
| p33 | F hold | −3.952361 | impossible at offset1 | −3.047580 |

All scores are nats per adjacent decoded rune pair. A simple add-0.5 bigram model fitted on 1,829 transliterated runes from uppercase lines of the repository's editorial LP1 reference gives worst equal-length sliding-window scores −2.707368 (156) and −2.772464 (78); this is an in-sample diagnostic, not an independently calibrated language cutoff. The reference conversion is heuristic (including composite-token normalization and some skipped symbols), not a scan-exact native transcript. Exact ordinary model path counts are 22^39 for p40 and 22^20 for p33 (the latter includes partial terminal blocks); the F-path counts are state/share histories, not necessarily distinct plaintext strings. All 44 control inversions retain a forward-consistent path scoring at least the planted truth; all eight fixed-progression p57 plants recover 95/95 runes. Free-share matched-length controls are selected from the training reference, so their score and accuracy are not held-out power estimates; the separate p57 plants are not claimed independent of the reference file. The original best paths are nonlinguistic. See raw JSON for decoded candidates, shares, control scores and exact dead-state records.

**Decision:** retire the exact one-coordinate variable-share extension, not the whole DH hypothesis or the retrospective local fits. In particular p40 F-hold cannot survive even arbitrary independent share selection: the state DAG becomes empty at the 57th post-anchor rune (zero-based suffix56). The three ordinary/free-score survivors do not read as prose even after optimizing all allowed shares. Further changing the other shell coordinates or key clock would be a new, unsupported mechanism; do not fit them to rescue this receiver. No new unknown plaintext or authentic key was recovered.

Reproducer: [sims/lp2_p33_p40_dh_share_inverse.cjs](../sims/lp2_p33_p40_dh_share_inverse.cjs); [complete output](lp2-p33-p40-dh-share-inverse.json). The exact same core ran in connected V8 on the two pinned input blobs; the Node wrapper is supplied but not separately executed. No CI used.
