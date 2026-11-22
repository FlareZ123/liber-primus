# Source-locked multiplicative two-time-pad gate on LP2 p24/p26

**Agent10, 22 November 2026. Intermediate negative, no plaintext recovered.** The insect artwork shared by p24/p26 independently motivates testing a reused cipher key. Director #2148 previously excluded a same-art *additive* pad under finite native GP-English word constraints. This distinct experiment allows a new arbitrary **nonzero multiplicative GP29 key every rune**, with no periodicity, clock, or unknown-key search. No original clue authenticates multiplication as the correct cipher.

## Exact original implication

For all aligned positions i, posit C24[i] = K[i]*P24[i] mod29 and C26[i] = K[i]*P26[i] mod29 with K[i] in 1..28. Every possible key therefore requires P24[i]*C26[i] = P26[i]*C24[i] mod29, plus the zero-symbol equivalence C=0 iff P=0 for each track. Both conditions are necessary and sufficient per position: permitting every nonzero key is strictly more permissive than any historical numeric key schedule.

The source-fixed p24/p26 starting offsets are **3/1** for their first complete printed words. The alternate physical page origins are **0/0**. Each experiment preserves 250 original GP29 runes, word lengths, and within-word boundaries. The independent original p24/p25 near-art control uses **3/0**. Source-checked original page lengths are p24=270, p25=273, p26=265.

The deterministic, full-secret inverse is a pair of native-English GP29 word tries from the unchanged 29,157-row TextBlob/Norvig research lexicon, normalized with seven Gematria Primus multi-letter glyphs, QU→CW, V→U, K/Q→C, Z→S, with A/I/O singletons. All 29-state words per original printed length are admitted without pruning. At each position the DP retains *all* compatible pairs of two word-prefix states. Zero states is an exact failure for this finite lexicon and original word framing.

| Case | Original offsets | First incompatible 0-based rune | Maximum reachable DP pairs |
| --- | --- | ---: | ---: |
| Original p24/p26 | 3/1 | **10** | 194 |
| Original p24/p26 page-origin | 0/0 | **2** | 16 |
| Original p24/p25 near-art | 3/0 | **33** | 634 |
| Native-English original-shaped positive, one arbitrary changing shared GF29 multiplier | 3/1 | none of **250** | 399 |
| Same planted English words, two independent multiplicative pads | 3/1 | **10** | 247 |

The positive recovers one compatible 250-position path, and the hidden changing key reconstructs **250/250 ciphertext runes on both tracks exactly**. The independent-pad negative fails. No hypothesis-selected word, rotor, offset, multiplier or beam width was optimized.

**Decision:** a source-aligned arbitrary shared *multiplicative* pad cannot decode p24/p26 to this finite GP-English register under the intact original word boundaries. This is a separate, completed finite exclusion from #2148 additive reuse. A different, authenticated source-selected operation, non-English register, or word segmentation remains possible. This observation does not reveal unknown LP2 plaintext or a genuine authorial key.

**Executable SFT:** sims/lp2_p24p26_multiplicative_pad_sft.cjs, Node.js22 CommonJS, reads original corpus/transcription and pinned 29,157-row native lexicon; deterministic full-length positive and independent negative plants.