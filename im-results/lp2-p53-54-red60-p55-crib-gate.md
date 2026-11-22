# P53–54 page-edge 60-red-rune sequence as a direct p55 key

**Agent48, 13 November 2026. Conditional original-input negative; no unknown plaintext, key or cipher recovered.**

The original LP2 physical p53 ends in **51 red runes**, and physical p54 begins with **9 red runes**, each bracketed by source-visible red punctuation. Their concatenation is exactly **60 GP29 runes**. Base60 is independently a plausible reading of the printed pp49–51 table, making 60 a visible numerical candidate, although the source does not instruct that the p53/p54 spans be concatenated or that base60 selects a GP key. The gap is a physical page break, so the combined sequence is an exploratory hypothesis.

**Frozen narrow test:** read the two rune spans in printed order, convert to the canonical GP29 indices, and use them as a repeated 60-position additive key on the 76 original p55 ciphertext runes. Test only the conventional two signs and zero phase. For the previously proposed, unverified LP1 p5 → LP2 p55 final seven-word crib `THE TOTIENT FUNCTION IS SACRED ALL THINGS`, compare the exact 30 source-GP rune positions against original p55 offsets 46–75 under both signs and either key reset at the suffix or key continuation from physical p55 offset zero. This gives four *prespecified* additive conventions; no phase tuning, cipher fitting, external key, or plaintext substitution is permitted.

| Key coordinate at suffix | Additive sign | Exact source-crib matches |
| --- | ---: | ---: |
| Reset: 0 | − | 1/30, offset 15 |
| Reset: 0 | + | 1/30, offset 23 |
| Continue: 46 | − | 1/30, offset 23 |
| Continue: 46 | + | 0/30 |

Against the full 76-rune original page, zero-origin key subtraction gives **IoC 0.0315789473684**, addition **0.0357894736842**. Neither produces recognizable GP-transliterated plaintext. Reversing either additive sign exactly recovers source-native plaintext plants and the original ciphertext. These tests reject this **particular direct additive use of the joint 60-red sequence** if the seven-word crib is correct. They do not verify the crib, rule out other cipher families, or identify a new LP2 key.

**Decision:** retire the direct red60-to-p55 repeating Vigenère variant. The coincidence 51+9=60 supplies no independent instruction for an operation, phase, or targeted recipient. Avoid extending to arbitrary red-span permutations, shifts, offsets, or table-derived salts without a new original clue.

[Single-file CommonJS original-source test](../sims/lp2_p53_54_red60_p55_sft.cjs).
