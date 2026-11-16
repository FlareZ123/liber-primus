# p57 interior-55 key: corrected pointer-direction gates

**Status:** bounded negative for the tested source-motivated p57-key pointer readings. No LP2 plaintext, authentic key, or cipher mechanism recovered. This does not exclude the broader pointer-direction family or a different source-selected key.

## Human solve-path hypothesis

The clear p57 PARABLE has 20 printed words and 95 runes. Removing the first and last rune of each word, following its circumference language, yields a 55-symbol candidate key: five interior title runes followed by fifty interior body runes. The signed 2016 instruction that words supply a map and their numbers supply direction motivates a small cyclic key-pointer experiment. LP1 p05's prime/Möbius emphasis makes prime-based word numbers one plausible reading; word length is the simpler literal alternative.

This is a hypothesis, not evidence that p57 actually supplies a key. The frozen conventions are key pointer 0, cyclic repetition of the 55 symbols, continuous pointer across words/pages, no page reset, and no fitted offset. Candidate key encodings are direct GP indices or GP-prime values modulo 29; both title-first and body-first order, both additive signs, and both direction polarities are screened.

## Correct source word segmentation

The original transcription's '%' marks physical page boundaries, not automatic word boundaries. Hyphens, periods, and ampersands separate printed words; line and page breaks do not. Parsing each page independently splits words that continue across a page.

- p0–p2 contain **729 runes and 158 words** when page segments are joined. Parsing each page separately gives 160 words, introducing two false word boundaries.
- Across the 57 rune-bearing page segments, joined parsing gives **2,941 words**; pagewise parsing gives 2,973, a difference of 32 cross-page carries. The 2,941 includes 45 clear words on p56–p57, leaving the established 2,896 unknown p0–p55 words.
- The first 300-rune screen contains 66 word segments, with the final segment truncated only by the screen boundary. The p57 key itself remains 20 words / 95 runes / 55 interiors.

The former pilot split at '%'. Its reported best score of 1.152887 is superseded and must not be reused. The corrected parser is asserted against the canonical p0–p2 rune corpus in the reproducer.

## Gate A — previous-ciphertext GP-prime-sum direction

For each word, the preceding ciphertext word's GP-prime-value sum selects forward if prime and backward otherwise; the first word starts forward. The corrected first-300-rune p0–p2 screen uses the original one-step skip/coin pilot, conv000, beam width 16, and all 32 combinations of key order/encoding, key sign, direction polarity, and collision model.

- Corrected best scaled IoC: **1.115385** (body-first GP-prime-mod-29 key, coin branch, negative key sign, forward prime polarity).
- Across 24 matched random permutations of the 55-symbol key multiset, with the same 5/50 split and the same full variant family: median best **1.108919**, maximum **1.155474**.
- Empirical upper-tail p-value: **0.44**. The candidate is ordinary under the matched key-order null; no plaintext-like register appears.

This is a corrected screen of one source-selected key, not the full 66-rule / 581-stream pdir campaign.

## Gate B — causal current-word length direction

The 2016 wording can be read literally as the current word's number determining its own direction. Word length is known to the encryptor and preserved by the cipher, so this is causal. Two low-parameter mappings were frozen: odd/even length and prime/composite length. The full reference-style coin collision model was used, with beam width 800, the same key encodings/orders/signs, and both direction polarities.

- Best scaled IoC: **1.145128** (prime-length rule, prime length forward, title-first direct GP key, negative key sign).
- Across 12 matched shuffled-key permutations with the same 5/50 partition and all 32 variants: median best **1.147068**, maximum **1.170346**.
- Empirical upper-tail p-value: **0.615**. The best decoded transliteration is not readable prose.
- Positive control: the p57 clear text repeated three times (285 runes), planted under the same coin model/key/rule, is recovered exactly at beam width 800.

The tested deterministic multi-skip alternative did **not** recover its positive control under this beam, so it is not counted as a negative result.

## Gate C — causal previous-plaintext-word prime direction

A more literal causal reading is that, after decoding a word, its GP-prime-value sum selects the direction for the next word. Prime selects forward and composite backward; the opposite polarity is also tested. This requires the decoder to carry the previous decoded word's prime/composite state. The same reference-style coin model and beam width 800 were used.

- Best scaled IoC: **1.125730** (body-first GP-prime-mod-29 key, negative key sign, prime forward).
- Across 16 matched shuffled-key permutations with the same 5/50 partition and all 16 variants: median best **1.121204**, maximum **1.160647**.
- Empirical upper-tail p-value: **0.412**. No plaintext-like register appears.
- Positive control: the p57 clear text repeated three times (285 runes), planted under this causal rule, is recovered exactly at beam width 800.

## Decision

The p57 interior-55 candidate does not select a successful cyclic pointer mechanism under the tested previous-ciphertext prime-sum, current word-length odd/prime, or causal previous-plaintext prime-sum readings. The coin-model controls demonstrate that the decoder can recover matched planted text; the original scores are nevertheless typical of shuffled key orders.

Retire these specific p57-key/simple-direction readings. Do not expand them into arbitrary word statistics, offsets, or conventions without a new independent clue. The deterministic multi-skip model remains unassessed because its positive-control recovery gate failed. The broader pdir key-stream campaign is a separate question and is not excluded here.

## Reproduction

- node im-results/lp2_pdir_p57_interior55_gp_prev_pilot.cjs — corrected GP_prev screen and matched null.
- node im-results/lp2_p57_interior55_causal_direction_gate.cjs — causal word-length and previous-plaintext coin gates with positive controls.
