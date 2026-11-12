# Director #583: exact three-parameter GP29 reciprocal-feedback cipher

**Decision (12 November 2026): reject the entire frozen 24,389-model three-parameter reciprocal-feedback family under its specified original GP29 alphabet and zero-reset rule.** Every original pp0–2 training output is ciphertext-like, and the ten top keys also fail complete untrained pp54–55. A source-native planted key is uniquely recovered. There is no unknown LP2 plaintext, key, decoder or destination. This is a bounded family exclusion, not an exclusion of arbitrary feedback ciphers.

## Source-motivated hypothesis and finite attack

The unsolved original LP2 has 29 GP runes and very few equal-adjacent outputs. Its p0 infinity/loop drawing and solved p57's circumference language suggest feedback only weakly; neither source selects this particular recurrence. Unlike an arbitrary contextual lookup inverse, this exact candidate has only three field parameters and is exhaustively enumerable:

\[
C_i=P_i+aC_{i-1}+bP_{i-1}+c\pmod {29},
\quad a,b,c\in\{0,\ldots,28\}.
\]

Reset the previous ciphertext and plaintext symbols to **zero** at each source-visible chapter start. There is no recovered secret IV, adjustment to rune indices, transparent rune, phase shift, word-local reset, hidden table or output-dependent exception.

Use original physical **pp0–2** (729 runes) as the one key-selection chapter. Derive *one* source-native GP29 unigram/bigram/trigram language model before looking at the original candidate outputs: 3,249 runes converted from the canonical solved LP1 and final-page plaintext reference, preserving known GP digraph tokenization. Additive interpolated conditional probabilities have fixed smoothing 1/4/4 and fixed scoring weights **0.33 unigram / 0.34 bigram / 0.33 trigram**. The model supplies one score per original rune, not word-length postselection. Search all 29³=**24,389** triples, retain exactly the top ten by pp0–2 score. Freeze those keys, decode the independent source-visible **pp54–55** (308 runes), with the exact original 158 and 66 word boundaries respectively, including words carried over within chapters.

The repository [single-file CommonJS SFT](../sims/lp2_reciprocal_feedback_abc_sft.cjs) deciphers and **exactly re-enciphers all 1,037 original rune positions** under every retained key, preserves full word-separated candidate outputs for both chapters in JSON, and carries the independent native-English plant and wrong-key control. It reads the original JSON rune indices and exact rune/transcription word boundaries in the repository; no pre-solved unknowns are used.

## Frozen exhaustive original training and independent results

Scores are natural-log model likelihood per rune (higher is better). Every complete original output begins as nonlinguistic GP transliteration and remains nonlinguistic under the printed word segmentation.

| Frozen rank | a,b,c | Original pp0–2 score | Untrained pp54–55 score | Known LP1 words length≥3, train / test |
| ---: | --- | ---: | ---: | ---: |
| 1 | 24,17,6 | −4.770306 | −5.254170 | 0 / 0 |
| 2 | 18,3,17 | −4.778647 | −5.133728 | 0 / 0 |
| 3 | 19,26,16 | −4.807385 | **−5.013365** | 0 / 0 |
| 4 | 23,6,4 | −4.835248 | −5.245500 | 0 / 0 |
| 5 | 22,6,11 | −4.835941 | −5.148694 | 0 / 0 |
| 6 | 13,22,14 | −4.836111 | −5.271029 | 1 / 0 |
| 7 | 23,23,20 | −4.841430 | −5.317102 | 0 / 0 |
| 8 | 2,14,26 | −4.843849 | −5.112738 | 0 / 0 |
| 9 | 13,5,26 | −4.847782 | −5.270888 | 0 / 0 |
| 10 | 7,11,12 | −4.848990 | −5.357559 | 0 / 0 |

The single 3+-rune reference-word match in all top-ten training outputs is **TWO** at rank6; no such exact known GP word appears in any of the ten independent 66-word outputs. This limited vocabulary lookup is a display diagnostic only. The full frozen-model score and readable-word requirement, not a lone dictionary hit, determine the outcome.

Controls from the **same pre-fitted model**:

| Original or controlled register | GP model score |
| --- | ---: |
| Raw original pp0–2 | −5.106159 |
| Raw original pp54–55 | −5.015940 |
| Authentic solved-native GP29 text, 729-rune heldout reference window | **−2.340620** |
| Native Shakespeare GP29 729-rune *untrained* plant plaintext | **−2.985183** |
| Same native plant, encrypted with frozen secret (7,11,19), then decrypted with wrong (8,11,19) | −5.161865 |
| Native Shakespeare GP29 separate independent 308-rune sample | **−3.090459** |

The independent native source is pinned \`resources/control/shakespeare_first300k.txt\`, starting from original text character offset 180,000. The model is trained only on the pinned LP1/solved reference, not Shakespeare. Exhaustive 24,389-key search on a 729-rune simulated ciphertext encrypted with (7,11,19) ranks the exact true key **#1**, with all 729 training runes and all 308 independent GP runes exactly recovered and re-encrypted. This demonstrates the test detects that compact family under a different authentic English source despite historical-register mismatch. There is no comparable original plaintext under any of the predeclared ten keys.

## Scope and research decision

The problem is an inverse that includes previous **plaintext** state, so ranking only a direct ciphertext lag is inadequate. This test explicitly decodes the actual recurrence for each parameter triple and verifies the same key on a completely separate chapter with chapter-local zero reset. The negative is limited to the **fixed common affine recurrence**, GP29 numeric alphabet, chapter-zero states and the source-native language register. A missing historical IV, a different feedback operation, original-page-specific key schedule or non-ordinary language is outside this experiment.

The original p0 loop and p57 circumference are *possible motivations*, not authenticated instructions. The family lacks a source-selected opcode and produces no material original plaintext, so no larger recurrence sweep is justified by this result. #583 can close without a successor in this branch. Preserve the source data, SFT and frozen exact top-ten failure as the independently reproducible boundary.
