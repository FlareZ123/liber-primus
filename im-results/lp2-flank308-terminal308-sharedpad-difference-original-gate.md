# A second 308-rune test: table-flanking prose and terminal ciphertext under one repeated additive key

**Agent 2, 16 November 2026. Classification: key-independent, original-source statistical negative for one specific two-time-pad hypothesis.** No unknown original plaintext, authenticated key, decipherment or destination is recovered.

## Distinct causal hypothesis, beyond the existing word-boundary gate

The [exact original-source sentence extraction](lp2-p49-table-complete-flanking-sentences.md) and [earlier equal-length control](lp2-flank308-terminal308-original-wordbreak-gate.md) prove two independently visible 308-rune inputs:

- The **complete sentence before** the p49–51 numerical table: p48 last 72 runes + p49 first 66, **138 GP29 runes**, 33 original complete words.
- The **complete sentence after** that table: p51 first 92 + p52 first 78, **170 GP29 runes**, 40 complete original words.
- The **terminal section**: p54 all 232 + p55 all 76, **308 GP29 runes**.

Thus the intact 138+170 flank also has **308 runes**. The earlier gate showed that their word-boundary masks differ from the terminal 308-rune passage, excluding **duplicated printed plaintext** encrypted separately under a length-preserving, word-boundary-preserving cipher. But this says nothing about **different plaintexts encrypted with the same secret additive keystream**: a repeated pad could act on two distinct prose messages with different word boundaries. This is a genuinely distinct original-plaintext-recovery possibility. If present, the key would cancel, permitting a classical two-time-pad dictionary attack on both passages.

The weakest assumption is the selection of the same pad and its alignment for these distant source units: the original text supplies the exact equal lengths but **no instruction** to reuse a GP29 additive pad between them, or to treat the table as the source of such a pad. This report freezes only **source-order, offset-zero** reuse, the simplest interpretation of the exact alignment.

## No-key equation and genuine-language test

Keep both exact source strips unmodified: \`A[308]\` is the two table-flanking sentences concatenated **without inserting numeric-table cells**; \`B[308]\` is p54+p55. If the same secret keystream \`K[i]\` were added modulo29 to ordinary GP-native English plaintexts \`PA[i]\` and \`PB[i]\`,

\`A[i]=(PA[i]+K[i]) mod29\`, \`B[i]=(PB[i]+K[i]) mod29\`,

then the observable fixed vector is \`D[i]=(A[i]−B[i]) mod29=(PA[i]−PB[i]) mod29\`, **independent of all 29^308 possible pad keys**. It has no fitted parameters and can be compared directly against the difference register for two independently selected genuine English texts.

As a finite language model, GP-normalize the **29,154** usable independent TextBlob source vocabulary types, weighted by **4,809,810** source rune occurrences, using the repository's established QU→CW, ING→NG, K→C, V→U, Z→S and seven native digraph conventions. Let \`p[j]\` be its empirical GP-rune probabilities. The difference law under independently distributed English-like plaintext runes is fixed:

\`q[d]=Σ_j p[j] p[(j−d) mod29]\`.

Compute a log-likelihood ratio against uniform GP29 differences for all 308 observed symbols:
\`L=Σ_i log(29 q[D[i]])\`.

**Original untouched result:** \`L=−9.404449199555213\`. The 29-bin difference histogram is
\`[14,11,8,9,12,10,9,16,10,11,10,16,11,7,10,10,11,13,6,7,6,9,9,10,9,16,15,10,13]\`, totaling exactly 308. This is less English-like than the uniform GP29 null under the particular GP-normalized lexicon model; it is **not** a universal cipher impossibility.

## Real independent English control and reproducibility

To avoid interpreting one negative scalar without a native text baseline, use the independently checked-in **Shakespeare first-300k source bytes**, normalized to **215,695 GP29 rune indices** under the same conventions. Freeze **150 distinct paired 308-rune original-source windows**, with deterministic source starts \`(797i) mod (N−320)\` and \`(1049i+40000) mod (N−320)\` for \`i=0..149\`, and calculate the same GP29 difference likelihood ratios. The 150 controls range from **−4.516777305591676** to **+17.26984621399287**, with median **+5.3998218451462305**; **zero of 150** are as low as the actual **−9.40445**. These windows share a literary author and are not a calibrated population-level random sample. The result **disfavors** the direct, aligned reuse of one independent additive pad between two ordinary GP-native English passages; it is not a probability that Cicada 3301 used such a pad.

A source-native positive plant independently encrypts two genuine 308-GP-rune Shakespeare windows under the **same nontrivial position-dependent GP29 additive pad**, recovers all **308/308** original plaintext runes of each with the known test pad, and proves the ciphertext difference is exactly the two native plaintexts' difference with the pad canceled. The plant confirms the algebra and control direction, and is explicitly synthetic.

[Standalone, read-only Windows-compatible Node22 source SFT](../sims/lp2_flank308_terminal308_sharedpad_delta_sft.cjs) loads the original LP2 pages and fixed vocabulary/reference bytes, asserts the exact source windows, dictionary sizes and untouched score, reproduces the 150 genuine-language comparators, and tests the real-text shared-key plant. The quantitative original/control code kernels were independently executed in the GitHub-backed JavaScript runtime before committing this SFT; no separate Windows CI run is asserted.

## Decision

**Do not assume that the visually equal 308-rune flank and terminal regions contain two recoverable ordinary-English texts under an identically aligned additive GP29 keystream.** Their original difference vector has a notably weak language-pair fit on this frozen source comparison, and their printed word breaks already exclude copied identical prose under the earlier report's specific premise.

The test does **not** exclude a *different* pad clock, plaintext-dependent state, non-additive encryption, correlated or highly unusual plaintexts, per-word gap resets, transposition, or a published word-length grammar beyond the source-native comparison. A new original author-selected key-reuse rule or independent decrypted word crib could justify revisiting one clearly specified alternative; freely searching all alignments and keys to rescue the 308 count would not constitute plaintext recovery.
