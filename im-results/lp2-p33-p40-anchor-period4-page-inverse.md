# p33/p40 candidate H-shell inverses fail as fixed and variable DH key streams

**Classification: bounded negative; intermediate result. No unknown-page plaintext or reusable key recovered.** Fixed-key page and word clocks fail; fixed DH share progressions also fail to produce prose; free-share p40 F-hold is exactly impossible, while the coupled p33 free-share inverse remains underdetermined by rune bigrams but fails both exact printed-word and spacing-free finite-lexicon tests against the matched controls. See the variable-share and lexical sections below.

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

**Decision:** retire the exact one-coordinate variable-share extension, not the whole DH hypothesis or the retrospective local fits. In particular p40 F-hold cannot survive even arbitrary independent share selection: the state DAG becomes empty at the 57th post-anchor rune (zero-based suffix56). The only surviving state class immediately before it has phase0 and previous plaintext17, with 2,409,697,382,400,000,000 state histories. The observed next ciphertext is 20, and every A forces the fixed first key digit20, hence plaintext F. A non-F ciphertext cannot represent F under this clock; this is the precise obstruction. The three ordinary/free-score survivors do not read as prose even after optimizing all allowed shares. Further changing the other shell coordinates or key clock would be a new, unsupported mechanism; do not fit them to rescue this receiver. No new unknown plaintext or authentic key was recovered.

Reproducer: [sims/lp2_p33_p40_dh_share_inverse.cjs](../sims/lp2_p33_p40_dh_share_inverse.cjs); [complete output](lp2-p33-p40-dh-share-inverse.json). The exact same core ran in connected V8 on the two pinned input blobs; the Node wrapper is supplied but not separately executed. No CI used.

### DH-consistent p33 coupling: K=A^15 mod23

The p33 shell has a different meaning from p40: its third component is interpreted as the shared key K, not the constant inverse exponent e. Varying A while holding K fixed is not the ordinary historical DH exchange. Freeze b=15, let K=A^15 mod23 for every four-consuming-rune block, and construct H=[23,A,K,−K mod29]. At A=8 this exactly reproduces the existing WILL anchor. Both generator directions and the full free-share inverse retain this exact coupling; the same original 78-rune suffix and same two consumption clocks are used. This is a correction to the mechanism premise, not tuning extra free parameters.

| Clock | Forward DH progression | Reflected DH progression | Arbitrary A, coupled K |
|---|---:|---:|---:|
| ordinary | -3.937216 | -3.767236 | -2.753688 |
| F hold | -3.925926 | impossible at suffix offset44 | -2.775156 |

All 22 planted controls have a valid replay and optimum at least the planted score. Reference/model caveats are identical to the preceding section. No readable candidate has emerged. The ordinary free-share optimum −2.753688 is **inside** the finite editorial-reference band (floor −2.772464), while the F-hold optimum −2.775156 is only slightly below it. This precludes a blanket score-based exclusion of the coupled family. The outputs are nonprose and the 22^20 ordinary share histories leave the schedule underdetermined. Both fixed DH progressions fail as direct decipherments; retain the arbitrary-share coupled family only as an underconstrained receiver that needs an independent state selector or stronger language constraint. No new key or plaintext. [Reproducer](../sims/lp2_p33_dh_coupled_share_inverse.cjs) · [Raw output](lp2-p33-dh-coupled-share-inverse.json).

### Exact printed-group lexical inverse of the underdetermined p33 coupled family

The preceding coupled free-share score overlaps the editorial reference band; a language score alone is not a decisive exclusion. Test the strongest alternate interpretation that the printed words are true word units. On physical p33 after the WILL candidate (offset136), the 17 complete groups have lengths 2, 1, 9, 8, 4, 4, 9, 5, 5, 2, 4, 2, 4, 3, 7, 3, 5 (77 runes), followed by the first rune of a three-rune carry into p34. Keep the final fragment unconstrained. The canonical seam-aware parser reproduces all 2,896 manuscript groups. Retain every A∈1..22 per block and exact K=A^15 mod23, with the same ordinary and transparent-F clocks. Do not optimize spacing, anchor, phase or DH tuple.

Use the pinned TextBlob English dictionary and additional editorial LP1 reference words; limit forms to lengths1–9, the longest target group. Compare the native greedy QU→CW/V→U/K,Q→C/Z→S and ING/IO encoding with a superset allowing all token segmentations including split composites. For each ciphertext rune maintain exact (block phase, current share, trie node, previous decoded rune); non-prefix transitions go to an absorbing OOV sentinel until the next printed boundary. At each boundary charge one OOV iff the current string is not a complete dictionary form. Merge only identical future-relevant states, minimize OOV first and maximize an add-0.5 native-reference bigram score second; the latter uses all 3,510 runes of the established source-calibrated editorial reference. It cannot alter the exact minimum OOV count.

| GP word register | Clock | Distinct forms length1–9 | Minimum OOV | Max live states |
|---|---|---:|---:|---:|
| Native greedy | ordinary | 23,877 | 12/17 | 258 |
| Native greedy | F hold | 23,877 | 10/17 | 294 |
| All tokenizations | ordinary | 31,833 | 12/17 | 265 |
| All tokenizations | F hold | 31,833 | 10/17 | 299 |

All 24 deterministic matched-length dictionary-word plants achieve zero OOV and exact forward replay. They calibrate feasibility, not natural-prose power; sampled words are not coherent sentences. Original best paths replay exactly. The lexical conclusion is conditional on this finite register and preservation of printed word units (order not tested); arbitrary OOV words and decoy segmentation are outside scope. The optimal word lists, exact selected shares, and planted control outputs are preserved in [raw JSON](lp2-p33-dh-coupled-lexical-inverse.json). No new authentic plaintext or state schedule follows from the best path. [Reproducer](../sims/lp2_p33_dh_coupled_lexical_inverse.cjs), exact core run in connected V8; standalone wrapper unrun.

### Spacing-free word-probability inverse (decoy-separator rival)

Remove every printed group boundary in the same 78 original suffix runes; assume only that the candidate WILL anchor ends a true word. Retain all independently chosen shares and exact K=A^15 mod23. Build a frequency-weighted GP trie from the pinned TextBlob register plus missing editorial LP1 words at count1. Restrict one-letter Latin words to A/I/O and forms to at most16 runes; compare source-native greedy and every token segmentation. Aggregate probability mass of homophonous GP forms and divide a word's mass among its permitted spellings. The exact DP state (block phase, share, trie node) branches on every allowed share, F hold and lexical termination. Charge −log normalized word frequency at each termination and −log prefix mass for the unfinished last word, so the physical page cut need not be a true word boundary. No beam or pruning beyond identical-state dominance. Surviving paths replay exactly.

Twelve deterministic natural Gibran word-boundary starts per register are selected only for complete lexicon coverage, encrypted with deterministic variable shares and the same clock. These are non-LP2 controls, but the TextBlob source training corpus may overlap Gibran and the controls are not a claim of held-out corpus independence. Forty phase-preserving within-column ciphertext shuffles per configuration supply a descriptive finite null (not an exhaustive randomization test).

| Register | Clock | GP forms | Original optimum cost/rune | 12 plant optimum range | Null feasible | Null ≤ original cost |
|---|---|---:|---:|---:|---:|---:|
| Native greedy | ordinary | 29056 | 3.962475 | 1.589717 to 2.132372 | 38/40 | 10/40 |
| Native greedy | F hold | 29056 | 3.932457 | 1.588520 to 2.132372 | 38/40 | 5/40 |
| All tokenizations | ordinary | 40730 | 4.017304 | 1.643033 to 2.176805 | 38/40 | 11/40 |
| All tokenizations | F hold | 40730 | 4.019852 | 1.640919 to 2.176805 | 38/40 | 6/40 |

Lower cost is better. Word-probability optimization is intentionally independent of the earlier rune bigram score. Actual candidate word sequences, prefix fragments, exact share choices, controls and null scores are in [raw output](lp2-p33-dh-coupled-spacingfree-inverse.json). Reproducer [sims/lp2_p33_dh_coupled_spacingfree_inverse.cjs](../sims/lp2_p33_dh_coupled_spacingfree_inverse.cjs), executed core in connected V8; standalone wrapper not separately run. This is an explicitly finite lexical register, not all possible English or a proof that no other decoy-boundary cipher exists. No authentic schedule or unknown plaintext is established.

**Consolidated 27 November decision:** The p40 one-coordinate transparent-F family is algebraically impossible after its proposed anchor. For p33, even the DH-consistent coupled K law with all independently variable public shares needs at least 10/17 out-of-register words when the printed groups are retained. Discarding the separators still leaves the best possible lexical cost at 3.93–4.02 nats/rune, versus 1.59–2.18 on the matched natural-prose plants and comparable or better shuffled-ciphertext controls. This is an empirical negative conditional on the receiver, anchor, direction, clocks, and finite register, not a theorem about all English. Retire these body-cipher extensions; any successor requires an independent source-selected operation or independently predicted state, not further fitting. The four-rune anchor fits remain unauthenticated.

### Exact anchor-compatible alternate private exponent

The candidate anchor has A=8 and K=2 in GF23. The multiplicative order of 8 is 11 (8=5^6, order(5)=22). Exhausting b in 0..21 gives exactly b=4,15 satisfying 8^b=2 mod23. The authentic worked example independently uses b=15, but the local anchor alone does not select that exponent. Test the only other constant-exponent receiver, K=A^4 mod23, without changing any other parameter of the spacing-free inverse above.

Both registers (29,056 native and 40,730 permissive forms) and both clocks have empty reachable lexical state sets at original suffix offset3, the fourth glyph of [16,11,13,18]. No original F occurs in that four-rune block, so no bypass advances the clock differently; three of the 22 ordinary first-block candidates additionally contain prohibited decoded F under the F-hold model. Even allowing arbitrary boundaries, the remaining ordinary and F-compatible forms cannot be segmented into complete registered words followed by a registered prefix. All 48 matched-prose controls retain legal paths; worst optimum cost 2.161 nats/rune. This is an exact conditional lexical infeasibility, not a proof about arbitrary words, alternative start position, or varying b across blocks. The two constant private exponents permitted by the anchor have now been covered. No further tuning is warranted.

[Exact outputs](lp2-p33-dh-coupled-exponent4-spacingfree-inverse.json) · [reproducer](../sims/lp2_p33_dh_coupled_exponent4_spacingfree_inverse.cjs). Core executed in connected V8; Node wrapper not separately executed.
