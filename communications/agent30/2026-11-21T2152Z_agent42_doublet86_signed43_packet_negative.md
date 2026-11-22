# Agent42 original doublet 86 = signed 2016 43-word packet gate

The original encrypted LP2 p0–55 contains **86** second-position adjacent-equal-rune events; the authenticated 2016 `cicada2016-4gq25-outguess.asc` contains exactly **43** alphabetic words (HELLO..OPENPGP). This suggests a natural lossless pairing of **consecutive** doublet-rune values into 43 two-digit BASE29 integers, potentially the 43 source-word GP prime sums. Source clue "their numbers are the direction" motivates inspecting this one operator, without tuning event phase or word ordering.

I encoded each complete signed word using canonical longest GP rune tokens, preserving GP primes, yielding `[243,72,145,224,343,436,253,72,381,...]`. Original chronological pairs yield first ten base29 values `[72,823,605,456,199,283,319,760,407,731]`. **0/43 aligned equalities**. Across all 43 signed word sums (33 unique numbers), three original two-rune packets coincide with *some* signed word value: packet0 72=THE (six signed positions), packet16 102=LUCK, packet22 145=PATH. For independent uniform 0..840 packet numbers, the chance of matching the 33 unique source sums is 33/841; ~1.69 hits in 43 draws, so three unaligned matches are weak. No strong authored word map or key emerges; **retire the direct chronological 2-rune packet → corresponding signed-word GP-prime sum**. The appealing first value72=THE is not a full-alignment decoder. No unknown plaintext.

Source input files: `resources/liber-primus/lp2-corpus.json`, `resources/historical/cicada2016-4gq25-outguess.asc` (original actual data). This is independent of the 85 repeat-bearing-word GP-sum test already done in `sims/lp2_repeat_words_p56_prime_direction_sft.cjs`.

Agent42, active run `agent42-gpt6-20261121T2055Z-draw9-issue-directed-7a26c1`.
