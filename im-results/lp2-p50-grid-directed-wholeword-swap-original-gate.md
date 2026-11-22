# LP2's 256 printed numbers as literal directed word swaps

**Original-cipher decision, Agent14, 22 November 2026:** No unknown LP2 plaintext, key, reversible intended mechanism or continuation was recovered. The complete source-fixed grid-byte word-swap family below does not restore the ordinary GP29-English word-length order on any whole-book inverse.

## Concrete potential human path

The first-party 2016 signed wording states that words are the map, their meaning the road and their numbers the direction. LP2 physical pages 49–51 visibly print a **32×8 numeric table**. The complete 2014 manuscript has **2,896 printed words**, or eleven complete 256-word blocks plus 80 words. This prompts one simple, completely reversible possible word-order decoding step: at each word position, take the next printed number as an **integer forward displacement** and swap two intact words. Words are an original source-observable unit, and a reordering could in principle restore English word-length grammar even if the GP29 letters remain encrypted.

**The weakest premise** is exactly the extrapolation from “numbers … direction” to *cyclic position swaps*. Neither the signed wording nor the table names this operation. The source also lacks a reset instruction, which is why three *fully specified* physical scopes are tested. The published 256 bytes have 161 distinct values; no secret permutation, guessed plaintext, phase, word segmentation or numerical edit is introduced.

## Frozen inverse and actual result

For each segment of `N` intact source words and source table bytes `B[0..255]`, start with its printed word sequence, then for `i=0..N-1`, exchange words at local positions `i` and `(i+B[i mod 256]) mod N`. Its exact inverse repeats those same swaps in descending `i`. Test both directions under one all-book segment, the **nine independently visible chapters**, or eleven complete 256-word blocks plus the final 80-word tail. The unchanged text is the seventh scored variant.

The original 12,956 runes comprise **2,896 words** across the authentic nine visual chapters, counts `[158,255,383,437,224,326,378,669,66]`. Their boundaries include the runeless physical p50 gap. Source `resources/lp2-transcription.txt`, canonical `resources/liber-primus/lp2-grid-256.json`, and original chapter margins determine all inputs.

The fixed discriminator is a smoothed 18-bin next-word-length log conditional advantage over independent word lengths, trained *only* on pinned Shakespeare and Emerson prose converted to attested GP rune lengths. It is evaluated at the original nine chapter limits for each proposed permutation. A familywise null of **500** deterministic samples shuffles original word lengths **within each chapter**, then grants each sample the best of all seven readouts. No English word forms or LP2 cipher text were used to train a key.

| Original readout | Trained English grammar log advantage |
| --- | ---: |
| Original printed order | **−0.0281070893** |
| All-book forward | −0.0242500842 |
| All-book inverse | −0.0319316692 |
| Nine-chapter forward | −0.0266177606 |
| Nine-chapter inverse, **best of seven** | **−0.0238971036** |
| Eleven 256-word blocks, forward | −0.0286771548 |
| Eleven 256-word blocks, inverse | −0.0271752606 |

The full-family shuffled baseline has mean **−0.0217733237**, SD **0.0021727179**, and one-sided selection-corrected tail **0.8483033932** for the actual best original score. The *selected* original output is **below the null mean**, with standardized score **−0.9775**. The last five source chapters of the best candidate average **−0.0253550590**, showing no held-out source order restoration.

## Real native-language positive and research consequence

An independently frozen **2,896-word Gibran** passage scores **+0.0179996503** under the same Shakespeare+Emerson language model. For each of the three clocks, synthetically apply exactly the **inverse** word swaps; the readout then falls to **−0.0146949** (whole book), **−0.0173497** (chapters), or **−0.0145471** (256-records). Forward swaps recover the native source **word for word, 2,896/2,896**, in every clock and restore the **+0.0179996503** grammar advantage. All forward/reverse numeric-index permutations independently round-trip the exact original tape of word indices.

**Decision:** Retire the direct `j=(i+B[i mod256]) mod N` whole-word swap as an isolated route to native English plaintext under these three human-visible clocks and both directions. It does not explain the observed word-order independence. It leaves unrelated numeric routes, altered spacings, unknown other languages and other table roles undecided. A future successor needs an independently specified operation and exact unsolved-text plaintext confirmation; tweaking displacements or reset phases after this negative would be unrestricted fitting.

**Reproducer:** [single-file CommonJS original-input SFT](../sims/lp2_p50_bytes_directed_word_swap_source_gate_sft.cjs), executed successfully on Windows Node.js 22 in [manual run 45008951347](https://github.com/FlareZ123/liber-primus/actions/runs/45008951347). The initially dispatched source had a positional mismatch after the omitted runeless physical p50; corrected by restoring the physical page gap before the passing run. No original rune, grid digit or reference source was altered.
