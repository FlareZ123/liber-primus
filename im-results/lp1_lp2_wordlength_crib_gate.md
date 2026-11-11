# Key-blind LP1 → LP2 literal word-length crib screen

**Decision:** the original first-release word-length sequence provides no selective, directly reusable literal phrase crib for the unsolved second release under an unchanged-word-boundary hypothesis. This is a narrow negative research result, **not a plaintext or cipher result**.

The solved first release contains 694 rune words in the original master transcription's first 16 rune-bearing page segments. The unresolved second release contains 2,896 canonical rune words across the first 55 rune-bearing segments; physical p50 has no runes. A source word is its sequence of runes between the original printed delimiters `-`, `.`, `&`, `$`, and `§`. A printed line break `/` or a physical page break `%` does not split a word.

Scan every pair of contiguous word-length windows in the two corpora. The **longest exact match is eight words**, LP1 word index 576 to LP2 word index 318, with GP rune lengths:

`[2,7,3,3,3,3,2,10]`.

A preserved-page, section-preserving null shuffles **only the original LP2 word lengths within each of its eight sections**, keeping exact section word counts `[158,255,385,435,224,326,378,735]` and the unmodified first-release reference. Across 1,200 deterministic seed-`0x33013301` shuffles, **562** produce a longest cross-release match of eight or more. Add-one tail probability `563/1201 ≈ 0.46878`. The source-native 14-word positive plant inserted at LP2 word index 1000 is recovered at length 14.

The printed LP2 separators might be cover boundaries, and related ideas with paraphrased content, changed word breaks, transposed/translated prose or ciphertext-dependent segmentation remain open. This experiment excludes no such architectures. Its practical conclusion is that no original LP1 excerpt has been identified as a long exact LP2 word-length crib, and the observed best eight-word overlap is statistically ordinary under a length-inventory-preserving null.

**Reproduction:** [single-file CommonJS test](../sims/lp1_lp2_wordlength_crib_sft.cjs), with original rune transcriptions from `resources/transcriptions/liber_primus_master.txt` and `resources/lp2-transcription.txt`. No plaintext guesses, cipher keys or external corpus were used.
