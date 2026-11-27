# p24–26 half-turn inverse gates: repeated-plaintext, literal paired-pad and shared affine routes

**Agent21 / Agent1 / Agent3 · Director Issues #2713 / #3023 and independent paired-coordinate follow-up · 25–27 November 2026.** Classification: source-frozen exact necessary-condition negatives for repeated plaintext; calibrated native-prose negatives for the literal paired pad and shared affine pair map. No unknown LP2 plaintext, authentic key, or intended continuation was recovered.

## Hypothesis and frozen source alignment

The test asks whether the two physical six-line halves of p24 encode the same 135-rune plaintext, with the lower half read in the source-supported half-turn order, and whether each copy was encrypted with its own period-eight additive Gematria Primus key.

The original physical p24 image is **resources/liber-primus/41.jpg** (SHA-256 **62148ef272d17bcedf5df30f6cc9e52df127113c18c1cf57ea92c75feedfce80**). The repository's image registration work fixes the upper/lower rotation center at y=1788.7783, in the blank band between line 6 ending at y=1728 and line 7 starting at y=1802. There are no central text pixels in that band. The original source transcription gives twelve line lengths:

**[22,24,21,24,23,21,22,23,23,22,22,23]**

The first six lines contain 135 runes; the last six contain 135. The only tested alignment is therefore:

- A = p24 runes 0–134, in printed order.
- B = p24 runes 135–269, reversed.

No offset, phase, split, or orientation is fitted. The natural mismatched comparators p25 (137/136) and p26 (134/131) are not padded or truncated into artificial equal halves.

**Boundary carry preserved:** p24 line 6 ends with ᛈᛟ and line 7 begins with ᚠ, forming the printed word ᛈᛟᚠ across the geometric split. The split is not silently treated as a word boundary; this carry is recorded in the SFT. It does not affect the rune-only differential test.

## Exact q8 differential constraint

For identical plaintext P in the two aligned halves, let

\[
C_A[i] = P[i] + K_A[(a+n_i)\bmod 8]\pmod{29}
\]

\[
C_B[i] = P[i] + K_B[(b+n_i)\bmod 8]\pmod{29},
\]

where \(n_i\) is the number of preceding non-F plaintext runes. A plaintext F (GP index 0) is emitted literally and consumes neither key. A ciphertext F may also be an encrypted non-F, so a simultaneous ciphertext-F pair is only a *possible* hold, not a forced one.

For every non-held position,

\[
D_i=(C_B[i]-C_A[i])\bmod 29
=K_B[(b+n_i)\bmod8]-K_A[(a+n_i)\bmod8]\pmod{29}.
\]

Thus D must repeat whenever the two key clocks return to the same ordered phase pair. Since both halves contain the same plaintext, their F holds must be synchronized.

The original aligned ciphertext has exactly one simultaneous ciphertext-F position: **108**. It is optional, so the complete set of legal transparent-F hold masks is just the empty mask and **{108}**. In particular, there is no possible hold at offsets 0–7. Positions 0 and 8 therefore follow exactly eight consuming non-F symbols apart and must use the same ordered pair of q8 key phases, regardless of either starting phase.

The original values are:

| Offset | A | B | D = (B−A) mod 29 |
|---:|---:|---:|---:|
| 0 | 23 (D) | 10 (I) | **16 (T)** |
| 8 | 8 (H) | 26 (Y) | **18 (E)** |

The required equality 16 = 18 mod 29 is false. This two-position contradiction rejects every independent q8 additive key pair and all 64 combinations of starting phases before any language or word fitting.

The complete enumerator additionally checks all 29-valued key choices through exact residual key domains: at each phase a key value equal to a non-held ciphertext symbol would decode that position to plaintext F and is therefore forbidden. Across both possible hold masks and all 64 starting-phase pairs, the SFT tests **128 configurations and finds zero survivors**.

## Native-GP calibration

The SFT uses known solved-page plaintext, not a fitted dictionary.

**Positive control:** concatenate all 85 solved p56 runes with the first 50 solved p57 runes. Encrypt this same 135-rune native-GP string twice, under independent keys:

- K_A = [19,1,13,14,15,1,25,4], start phase 3;
- K_B = [1,19,28,8,2,25,9,8], start phase 6.

The actual plaintext-F hold positions are **[35,47,51,56,74,118]**. The blind differential enumerator returns 64 valid configurations, all with that exact hold mask, including the actual pair of starting phases and hence the planted hidden construction.

**Independent-plaintext negative:** encrypt a different 135-rune source-native stream (solved p57 followed by the first 40 solved p56 runes) under independent keys [25,19,3,22,4,3,8,18] and [7,22,17,19,8,25,14,11], with starts 1 and 5. The same receiver tests both possible common-F masks and all 64 phase pairs: zero configurations survive.

These controls verify that the test accepts genuine same-plaintext independent-q8 plants with transparent-F holds and rejects this independent-plaintext control. They do not turn the original negative into a general theorem about other cipher families.

## Stronger necessary condition: any global monoalphabetic substitution pair

The affine search above is a special case of a simpler bound. If both halves encode the same plaintext under any two deterministic global monoalphabetic substitutions \(\sigma_A,\sigma_B\), each plaintext rune \(p\) produces one fixed ordered ciphertext pair \((\sigma_A(p),\sigma_B(p))\). There are only 29 possible plaintext runes, so the aligned streams can contain **at most 29 distinct ordered symbol pairs**, regardless of key values, affine structure, or the transparent-F convention.

The original p24 halves contain **126 distinct ordered pairs** across 135 aligned positions. This alone rules out every common-plaintext pair of global monoalphabetic encoders. A supplementary transparent-F/permutation consistency check also finds **52 mapping conflicts**: a nonzero A symbol repeatedly pairs with different B symbols, and vice versa. The test does not rely on language scoring or fitted keys.

Calibration: the positive solved-p56/p57 control encrypted under independent affine keys has 29 distinct pairs and zero mapping conflicts, so it passes. A deterministic seed-3301 shuffle of the same native plaintext, encrypted under the second key, has 124 distinct pairs and 53 mapping conflicts, so the supplementary consistency check rejects it. The pair-count bound is necessary, not sufficient; the original's 126-pair contradiction is decisive.

The exhaustive 1,624-map affine test above is retained as an independent subcase cross-check. These results exclude **global monoalphabetic** repeated-plaintext encodings only; they do not exclude position-dependent or polyalphabetic transforms, nonlinear relations, or another source-selected traversal.

## Additional simple relation: independent global affine substitutions

If the two halves contain the same plaintext under two independent monoalphabetic affine GP29 substitutions,

\[
C_A=a_A P+b_A,\qquad C_B=a_B P+b_B\pmod{29},
\]

then, because every nonzero multiplier is invertible in GP29, the ciphertexts must obey one global relation

\[
C_B=\alpha C_A+\beta\pmod{29},\qquad \alpha\ne0.
\]

The only possible transparent-F hold masks remain the empty mask and {108}. Exhausting all 28×29 affine maps under both masks tests **1,624 configurations**. Offsets 0 and 8 alone determine the candidate \(\alpha=26,\beta=21\), but it does not fit the remaining original symbols. The complete test finds **zero survivors**.

The same detector passes a native positive control: solved p56 plus the first 50 solved p57 runes, encrypted twice with independent affine keys \((a_A,b_A)=(3,7)\) and \((a_B,b_B)=(11,19)\). It recovers the unique relation \((\alpha,\beta)=(23,3)\), the true plaintext-F hold mask [35,47,51,56,74,118], and the planted construction. A distinct solved-page plaintext stream under the same independent affine keys is the negative control and yields zero survivors.

This excludes only the global monoalphabetic-affine repeated-plaintext relation. It does not exclude periodic affine keys, nonlinear transforms, different plaintext relations, or another source-selected traversal. The q8 and global-affine SFTs are combined in the same reproducible script.

## Distinct literal half-turn paired-pad receiver (Director #3023)

The same frozen geometry supplies two equally plausible roles: the top 135 runes A carry the payload and the reversed lower 135 B are its literal pad, or vice versa. Earlier differential computations used B−A to test a repeated-plaintext periodicity constraint, without treating the entire difference as the candidate message. Here the complete positional GP29 inverse is P=A−B mod29 or P=B−A mod29, with no secret, phase, alphabet fitting, offset, F skip, or extra layer. Retain the mask and add it back for exact replay. This is specifically a one-rune-per-position literal pad, as required by the geometry. The actual 41.jpg was inspected: no visible role distinction between upper and lower insects selects one carrier.

Both complete original candidates were decoded and exactly re-encrypted. Their beginnings in canonical transliteration are `PNGJOMPAIJTHLDYIGEA...` and `THEYITCMEIANGOMDUTLTTHHOGTONTHCXIA...`. The latter begins with the isolated word THEY, but neither 135-rune output forms coherent spacing-free prose. The full outputs and ordinal tapes are preserved in [raw results](lp2-p24-literal-halfturn-pad-output.json).

The independent native-GP calibration trains a smoothed conditional bigram model on all solved source sections except the target control section; its diagnostic is mean natural-log likelihood ratio per transition against uniform GP29 (unigram prior with weight 10). Seventeen disjoint 135-rune native plaintext blocks were encoded with masks drawn from unrelated original pages, alternating the concealed carrier role. The two-candidate blind receiver correctly selects and recovers all **17/17** blocks exactly, including exact reencryption. Control sections are held out from fitting; windows within one section are not independent samples. In these same leave-one-section-out models:

| Diagnostic | Mean log likelihood ratio per transition |
|---|---:|
| Held-out authentic plaintext blocks | +0.402466 to +0.909449 |
| Both original p24 candidates | −1.515168 to −1.350816 |
| Original A−B / B−A, full model | −1.486834 / −1.514674 |
| 48 unrelated original-page pair candidates, full model | −1.925626 to −1.139614 |

Sixteen of the 48 unrelated pair candidates equal or exceed the best original score. This is a matched diagnostic, not an independently sampled p-value. The native controls and full decoded strings reject the literal positional paired-pad interpretation as a route to native prose. Perfect replay is automatic for this bijection and cannot authenticate the key. The repeated-art analogues p25 and p26 split 137/136 and 134/131; neither admits the same full-page one-to-one receiver without inventing a trimming or padding rule. No such repair or additional operator was tested.

Reproduce with `node sims/lp2_p24_literal_halfturn_pad_sft.cjs` from the checkout. The computational core was executed on the actual committed canonical corpus, raw transcription and native solved reference in connected V8, producing the committed JSON; the standalone filesystem wrapper was not separately executed in Node. This scope does not exclude F-skip, alternative clocks, arbitrary nonlinear transforms or a different source-selected mechanism; they are not justified successors from this result.

## Shared reversible paired-coordinate affine inverse (Agent3, 27 November)

**Decision:** a single fixed invertible affine map mixing the two coordinates of the source half-turn does not recover native GP29 prose. Unlike the earlier repeated-plaintext and literal-pad branches, this receiver permits two different independently readable lanes, transforms both, and retains the complete original ciphertext length. No historical clue selects an affine matrix; this is a bounded ciphertext-only test of the simplest lossless two-coordinate arithmetic interpretation of the geometry.

Use the already established six-line splits (135/135, 137/136, 134/131). Two fixed discrete geometry interpretations are tested: (i) flatten each half and pair from the outer page ends, (ii) pair the six opposite physical line pairs in reversed lower-line order, pairing rune ordinals from the opposite outer ends within each line. All unmatched runes pass unchanged, without deletion or invented padding. These ordinal pairings are explicit test conventions, not a claim that exact pixel centers correspond. Pair counts and unpaired glyphs are:

| Physical page | Flat pairs / unmatched | Line pairs / unmatched |
| --- | ---: | ---: |
| 24 | 135 / 0 | 132 / 6 |
| 25 | 136 / 1 | 134 / 5 |
| 26 | 131 / 3 | 128 / 9 |

For each pair (A,B), let the decoded coordinates be P=aA+bB+k and Q=dA+eB+h mod29. Require ae−bd ≠ 0 mod29. For each geometry, score the upper lane forward and the lower lane in either physical forward or half-turn order. Preserve both lanes and copy unmatched runes through. Invert the matrix exactly to re-encode both original coordinates. Printed words and the 6|7 carry are not assumed plaintext segmentation; the scorer is spacing-free and separately scores the two lanes, not their seam.

**Exact all-key search without matrix enumeration:** the two lane scores are separable by affine row. Enumerate all (29²−1)×29=24,360 nonzero linear rows with arbitrary offset. Nonzero row pairs are independent exactly when their projective directions differ. Retain the best row for each of the 30 directions on each lane and choose the best distinct-direction pair. This computes the global maximum of the mean of the two lane trigram scores over all 29²(29²−1)(29²−29)=573,629,280 invertible affine keys for each frozen geometry/orientation. There are no heuristic caps or beam pruning. The three natural zero-offset sum/difference, shear and reverse-shear keys are also decoded explicitly in the raw output.

Train the interpolated unigram/bigram/trigram score on the pinned Gibran text (47,629 GP-rendered runes after removing Gutenberg outer wrapper; internal front matter is retained). Fit **only p24**; freeze the two affine rows before decoding p25 and p26. The held pages are scored including the unmatched copied runes. Two disjoint windows of the separate editorial solved-native LP1 reference serve as the controls, with two fixed hidden matrices/offsets, each tested under both geometries and both lower-lane directions. These are synthetic sender controls, not eight independent text samples. Three deterministic uniform GP29 null tapes are processed under the same four configurations. The original and all controls exactly replay.

| Geometry; lower order | p24 best mean nats/rune | p25 mean, frozen | p26 mean, frozen |
| --- | ---: | ---: | ---: |
| Flat; half-turn | −5.262518 | −6.674940 | −6.095042 |
| Flat; physical | −5.273249 | −6.288337 | −6.461581 |
| Line; half-turn | −5.245373 | −6.524448 | −5.929142 |
| Line; physical | −5.180239 | −6.209253 | −6.301222 |

All eight plant/configuration combinations recover all six key coefficients and every rune on p24/p25/p26 (270 fit + 538 held per combination); the true p24 mean scores are −2.450731 and −2.843490. All individual held control lanes score at least −2.559; the original maximum individual held-lane score is −5.732. Three nulls per configuration give p24 means comparable to the original and similarly nonprose frozen continuations. These nulls are illustrative, not enough to estimate a tail probability. The full original outputs, fitted keys, simple-key candidates and control diagnostics are preserved. No coherent original lane is recovered, even at the exact score optimum.

Retire this specific static affine pair receiver with either named geometry and lane ordering under ordinary native prose. This is an exact optimization of a finite statistical objective, not a language-independent exclusion of every possible message or a general nonlinear-pair exclusion. The unmatched-copy rule and ordinal pairing are model assumptions; other independently selected coordinate rules remain possible. No new source-selected operation, genuine key, plaintext or frontier change.

Reproduce: [SFT](../sims/lp2_mayfly_halfturn_pair_affine_sft.cjs), [complete output](lp2-mayfly-halfturn-pair-affine-output.json). Computational core executed on exact repository inputs in connected V8; standalone Node filesystem wrapper not independently executed. Source split and original geometry are established in the earlier source image report; no repeated image registration was needed.

## Exact shared arbitrary-pad extension across p24–26 (Agent3, 27 November)

The repeated insect artwork motivates a distinctly stronger candidate than the static matrix: a common full-rank two-coordinate matrix and an arbitrary two-component additive pad at each paired position, shared by the three pages. This permits a different pad at every position, absorbs all fixed affine offsets, and does not require repeated plaintext. It is not the earlier three-page shared affine receiver, which mixes pages only at a single corresponding rune rather than mixing opposite coordinates within each page. Neither the artwork nor the historical record specifies this combination; test it before any key optimization.

Freeze the outer-end ordinal pairing of the first 131 upper/lower rune pairs on p24, p25, p26 (upper printed forward, lower reversed from page end). For each lane and each nonzero row (a,b) in GF29², define D_j[t]=a C_upper,j[t]+b C_lower,j[t] modulo29. A shared arbitrary additive pad k[t] implies P_j[t]=D_j[t]+k[t] for every page j. For each upper lane, require each complete enclosed printed group to be one word from the pinned TextBlob register; for the lower lane use the reversed spelling of each native word so the physical forward plaintext is readable. The source-derived word lengths and page rune sequences are checked against the canonical corpus; the first and last printed groups of every physical page and all groups cut by the 131-position window are deliberately unconstrained. No assumptions about the rest of the page or a particular pad generator are made. The native register normalizes GP digraphs and ING/IO aliases, QU/CW, V/U, K/Q/C, Z/S; includes **25 one-rune forms** (many single-letter forms, intentionally permissive); and retains 29,041 unique forms of length1–15. Full lexical coverage is a conditional model assumption, not established LP2 segmentation.

**Exact inverse:** for fixed row, at each position one candidate plaintext rune in any one page fixes the other two via their projected-cipher differences and fixes the common pad value. Maintain every reachable triple of length-specific trie prefixes, resetting a completed word to the root, allowing every symbol in an unconstrained fragment. State merging retains all possible future continuations. No beam, scores, arbitrary reset times, or pad-key search. Exhaust all 840 nonzero rows separately on the upper and lower lanes; the full two-coordinate sender requires at least one surviving row from each lane with distinct projective directions. On a surviving row, reconstruct a witness pad and plaintext by backtracking; this need not be the unique path.

| Lane | Constrained original runes p24/p25/p26 | Rows | Survivors | Latest first-impossibility offset |
| --- | --- | ---: | ---: | ---: |
| Upper | 127/127/130 | 840 | 0 | 10 |
| Lower (reverse trie) | 120/123/123 | 840 | 0 | 18 |

The full failure histogram and maximum live states (1,110 upper, 208 lower) are in the raw file. All 1,680 row/lane cases become impossible on original ciphertext. Thus zero invertible matrices can satisfy this complete finite lexical receiver, even granting arbitrary independent pad values for both lanes at every position and unconstrained edge fragments. This is stronger than a language-score negative in the stated register, but not language-independent: decoy segmentation, missing native forms, other reading orders or independently varying page pads escape it.

Two source-shaped plants use independently drawn GP words from the same pinned lexicon, random unconstrained fragments, two different fixed hidden matrices and independent arbitrary two-component pads, with the identical word cuts. Both recover **exactly one row per lane and exactly the true full matrix**. Backtracked witnesses replay every projected ciphertext relation; the witness is not necessarily the planted plaintext: upper 129/131 per page on both plants, lower 117/131 and 115/131 per page. The missing recovered runes reflect alternative admissible paths; no assertion of unique pad recovery. These controls are synthetic finite-register controls, not natural contiguous prose or independent exact-replay original evidence.

Retire this shared-pad extension for the frozen outer-end geometry and physical forward word reading. Do not tune alignments, lexicon variants or page membership after failure. A different source-selected receiver or demonstrated alternate segmentation would be a new premise. The exact source cue is only the repeated artwork and the half-turn; no authentic matrix, pad or unknown text recovered.

Reproducer: [SFT](../sims/lp2_mayfly_halfturn_sharedpad_allrow_sft.cjs), [raw complete outputs](lp2-mayfly-halfturn-sharedpad-allrow-output.json). Core executed on exact repository corpus/transcription and lexicon using connected V8; standalone Node wrapper not independently executed.

## Decision and scope

**Reject the exact repeated-plaintext / independent-q8-additive interpretation and the independent global-affine-substitution relation for the p24 halves.** The contradiction is algebraic, source-aligned, and independent of English assumptions. The separate direct literal paired-pad inverse is likewise nonprose in both roles. The distinct shared invertible affine pair receiver is also nonprose at the global score maximum, with no frozen held continuation. Its arbitrary shared-pad extension has zero feasible rows on either lane under the stated finite printed-group register. No further matrix, phase, offset or geometry search is justified by these failures.

This does not reject the mayfly identification, the geometric half-turn, the wider p23–26 text, or all possible page mechanisms. It does not cover non-q8 periods, non-additive transformations, different plaintext relationships, or an independently source-selected alternative traversal. No successor is justified without new source evidence selecting such a mechanism.

## Reproduction

- Source geometry and blank-gap SFT: **sims/lp2_p23_26_halfturn_text_split_geometry_sft.py**
- This exact differential SFT: **sims/lp2_p24_halfturn_repeated_plaintext_q8_sft.cjs**
- Execute with Node.js 22: **node sims/lp2_p24_halfturn_repeated_plaintext_q8_sft.cjs**
- Original-image archive mapping: **resources/liber-primus/README.md**
