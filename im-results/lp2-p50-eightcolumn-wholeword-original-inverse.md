# LP2 original eight-column whole-word reading-order gate

**17 November 2026, Agent 6.** This is an original-cipher structural exclusion with no recovered unknown plaintext, cipher key or endpoint. The exact source procedure is in [`sims/lp2_p50_eightcolumn_wordorder_original_sft.cjs`](../sims/lp2_p50_eightcolumn_wordorder_original_sft.cjs); the existing manual [Agent 6 original-source inverse workflow](../.github/workflows/agent6-original-source-gates.yml) now accepts `route=eightword` ([verified original-source Node22 CI PASS 44066163642](https://github.com/FlareZ123/liber-primus/actions/runs/44066163642)).

## Question and source selector

Original physical LP2 p50, [archive image 67.jpg](../resources/liber-primus/67.jpg), prints a **32-row by eight-column** field of 256 two-character numeric cells. Independently the 55 original rune-bearing unsolved pages have **2,896 complete printed words**, which is exactly divisible by eight. A recent original-input test [word-length dependence](lp2-printed-wordlength-conditional-independence-original-gate.md) finds that those 2,896 word lengths have almost no adjacent English-like dependency: original nine-chapter MI **0.02031044 nats**, less than all 256 matched contiguous GP-English controls and close to the shuffled null. A **fixed eight-column reading-order permutation of complete printed words** is therefore a source-motivated, reversible possible explanation. Rival: p50 is a numeric table with no printed text-transposition instruction, and the missing English-length syntax could reflect another source register, decoy delimiters or different encryption.

This experiment does **not** treat the mere divisible-by-eight word count as authentication. It freezes width eight before scoring, with no unknown column key, learned permutation, random phase, vocabulary or letter substitution. It tests both inverse rectangular traversals, normal/reversed column direction, snake/nonsnake row or column traversal, and global versus nine original chapter resets: **16 fixed candidates**. Complete words are the immutable units; original rune identities are not used in the score. Source punctuation `-`, `.` and `&` separates printed words, while `/` and `%` carry lines/pages, matching [the canonical corpus](../resources/liber-primus/lp2-transcription.txt) and prior word-length SFT.

## Original-input result

The source parser reproduces the independently established **12,956 original runes** and **2,896 words**, in authentic chapter word counts `[158,255,383,437,224,326,378,669,66]`. Length classes are 1–11 and 12+, and adjacent-length mutual information is calculated only inside authentic chapters, after restoring candidate word order.

| Frozen statistic | Result |
| --- | ---: |
| Original unchanged adjacent-length MI | **0.0203104436 nats** |
| Best of 16 eight-column inverse modes | **0.0261925076** |
| Best mode | Each-chapter column-filled to row-reading; reverse columns and snake |
| Next-highest mode | Global column-filled to row-reading; reverse columns and snake, **0.0236867815** |
| Matched chapter-within word-length shuffles | **600** |
| Null mean maximum over the same 16 modes | **0.0264441522** |
| Null 95th/99th percentiles of maximum | **0.0294848502 / 0.0308214963** |
| Familywise empirical upper-tail probability | **0.54242928** |

The null reuses exactly the original nine word-length multisets, shuffles independently within each real chapter and reruns all 16 candidates, using a fixed xorshift32 seed. This is a matched maximum-over-menu test; the best original increase over its untransformed value is a statistically ordinary result **even after selecting the most favorable traversal**. English control words are independently transliterated into GP29-length units. The committed SFT was **executed directly in a V8 harness against exact fetched GitHub file bytes**; all assertions passed. Its ten independently chosen 2,896-word native-Gibran plant tests passed exact restoration under two modes: original plaintext MI 0.05288–0.06085, encrypted MI 0.01677–0.02445, and restored MI exactly equals the planted plaintext MI. The native Node22 [GitHub Actions run 44066163642](https://github.com/FlareZ123/liber-primus/actions/runs/44066163642) **passed** its specific named eight-column original-input step.

## Cryptanalytic decision

The specific **source-width-eight, simple rectangular whole-word inverse family** does not restore the absent ordinary-English adjacency grammar on the original ciphertext. It supplies neither a plausible recoverable word order nor original plaintext. Therefore do not follow it with a guessed GP29 letter-key search. This is a bounded result: it cannot exclude a p50-specified arbitrary 8-column order if independent source evidence actually supplies one, a transposition within words, the source-authenticated 2014 14-column historical operator (tested separately by [Agent 35](lp2-historical14-wholeword-transposition-mi-gate.md)), the distinct 16-column exploratory branch, or non-English/variable-length plaintext. Even a significant length-restoration result would have required an independent original-rune plaintext test.

**Next decision:** pursue a *creator-selected* word-map/key receiver or a source-visible permutation with a withheld original-text prediction. Do not treat another unsupervised length-MI gain as decryption.
