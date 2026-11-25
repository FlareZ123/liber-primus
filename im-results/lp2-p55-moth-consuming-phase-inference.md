# Fully consuming moth-square repeated-message gate (#2758)

## Decision
Both exact 76-rune source reads are impossible on p55 under all independently unknown bijective phase alphabets of periods 1..32. This includes additive Vigenère and arbitrary phase-dependent affine maps. No transparent-F premise, no inferred plaintext, no key or unknown text recovered.

The prior full-square known-message test (#2623) used a transparent F clock. Prior period25 arbitrary-bijection work concerned a different 30-rune tail phrase. This gate removes literal-F preservation and uses the entire two fixed source tapes and physical p55 offset0, including the incoming NG.

## Exact test
For each order and q, collect P→C and C→P constraints independently for i mod q, all 76 positions consuming. A function collision or injectivity collision is an exact contradiction. For the additive subfamily require C−P constant within phase. First 50 only infer maps; never infer from last26 before predicting. Unknown slots remain unknown. Residual map count after fitting is the product of (29−assigned entries)! over phases.

| Source read | p55 bijection periods surviving first50 | Correct / wrong / unknown last26 | All76 viable periods |
|---|---|---|---|
| Row | none | — | none |
| Column | 30 | 0 / 1 / 25 | none |
| Column | 31 | 0 / 4 / 22 | none |

q30 first50 constraints still allow about 10^855.58 completions; source offsets6 and66 require different outputs from the same phase/plaintext input. q31 allows about 10^886.51 completions; offsets20 and51 conflict. All additive periods 1..32 fail the full data. No other alignments, transpositions or periods searched.

Native positives: for each of row, column and clear p57 first76, hidden additive and nonadditive phase bijections at q8,13,25,32 (24 plants). All 12 additive plants predict 26/26; all 12 affine-map plants give zero wrong on their identified map entries and 0..10 identified positions, consistent with incomplete maps. Native data alone cannot recover a completely unrestricted permutation from such a short fit.

p53 first76/last76 comparisons: no additive survives. Column-major with q30 on the last76 is compatible with all76, but only 1/26 predicted from prefix and 25/26 unknown; the complete known pairs still leave about 10^819.64 permutations. This negative comparison demonstrates why unconstrained fits and a single match do not identify a historical key.

Reproduce: `node sims/lp2_p55_moth_consuming_phase_inference_sft.cjs`. Core executed in connected V8 against canonical corpus and original LP1 transcription. No standalone Node or hosted CI run claimed. Script commit ed377bec87785533ada7d9b0c845a76407f80b6a.

Retire the compact ordinary consuming phase family for these two exact p55 messages. The motif and equal length do not establish repeated content or select a larger model.
