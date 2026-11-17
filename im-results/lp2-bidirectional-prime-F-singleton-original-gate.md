# Bidirectional printed-word prime pointer with exact p56 plaintext-F bypass: original-cipher gate

**Agent43, 17 November 2026, [Director Issue #1329](https://github.com/FlareZ123/liber-primus/issues/1329).** [Executable source-native Windows Node22 SFT](../sims/lp2_bidirectional_prime_F_singleton_original_sft.cjs); [manual CI workflow](../.github/workflows/agent43-word-reverse-prime-original-manual.yml). **No unknown-page plaintext or authentic new key recovered.**

## Independent causal route

The authenticated 2016 “numbers are the direction” message could mean that each original printed word tells the reader whether to move **forward or backward through a historical prime key**, rather than reversing its printed rune order. Use the exact historically solved p56 stream k(j)=phi(prime[j]) modulo29 and the **authentic plaintext-F transparent bypass**. Source-printed word boundaries, indices, and GP prime sums supply all direction decisions. This differs from the active #1329 anti-repeat collision-skip pointer engine (which uses a library of historical flat key streams and beam collision paths) and from the previous direction-by-**plaintext** prime transfer (different causal operand, previously only one starting prime).

The weak premise is that no first-party text positively specifies the prior ciphertext word's prime-sum parity or prime test, nor states that the p56 prime cipher was reused on unknown pages. Our search covers finite elementary rules, not arbitrary hidden clock state.

## Original exact test

Use all **12,956 unchanged original GP29 cipher runes and 2,896 actual printed words**, preserving words across physical page breaks. Independently process full source chapters p0–2 (729 runes), p40–53 (3,008) and p54–55 (308). Test nine fixed direction schedules: an all-forward control; either global polarity of (1) previous word's ciphertext GP-prime sum even, (2) previous sum itself prime, (3) current source word length even, and (4) current chapter-local printed word ordinal even. A missing previous word makes its predicate false. Try every initial prime-key ordinal 0..4999, with no wrap and no extra key movement at word breaks.

At a rune with direction d ∈ {−1,+1} and current pointer j, the genuine p56 model either (i) emits plaintext F=0 on ciphertext c=0 **without consuming or moving j**, or (ii) emits non-F plaintext p=(c−k(j)) modulo29 and moves the pointer j←j+d. Negative or out-of-range key indices are illegal if consumed. The SFT uses exact all-F-history dynamic programming; states with the same next-pointer offset are future-equivalent. As an independent native-language necessary condition, the original printed one-rune English word must be A/I/O, GP indices {24,10,3}. The SFT checks this over **all possible F histories**, not only one score-best inverse. The actual solved original p56 passes full 85/85 legal reachability with direction always forward at first prime2.

## Original results

| Source original chapter | Tested schedules × prime starts | Complete legal cipher-only inverse | Complete inverse retaining source A/I/O singletons |
| --- | ---: | ---: | ---: |
| p0–2, 729 runes, 5 one-rune words | 9 × 5000 | **16** | **0** |
| p40–53, 3008 runes, 13 one-rune words | 9 × 5000 | **0** | **0** |
| p54–55, 308 runes, 2 one-rune words | 9 × 5000 | **22** | **0** |

On p0–2 the 16 cipher-mechanically viable pairs are: previous-sum-even forward when predicate true starts 768/769/770, opposite polarity 3550/3551; length-even forward 3706/3707, opposite 3503/3504/3505/3506/3507; ordinal-even opposite 4319/4320/4322/4323. The previous-sum prime test, ordinal-even standard polarity, and constant all-forward have no legal full path. All 16 fail one-rune native-English grammar by a source-local offset at most **366** (first five source singletons are 176, 244, 350, 530, 644). This is stronger than ranking gibberish outputs: **no F-skip or key-pointer path** can satisfy that bounded plaintext register.

No rule and no starting prime reaches the end of p40–53 at all, even before the English assumption. The maximum singleton-constrained reach under any start/rule is 385 runes of 3008. For p54–55, 22 mathematically complete paths exist, including the previously established six all-forward starts; none meets both A/I/O singleton constraints (chapter-local offsets 0 and 122). The first is the red p54 title word, so this terminal constraint depends on the red heading using the same mode. The p0/p40 conclusions do **not** depend on that title assumption.

## Decision

Exclude these nine **no-wrap, no-extra-word-step, bidirectional authentic-prime/F schedules** at the first 5,000 prime starts as intact ordinary GP29-English decryptions of p0 and p40. This is a conditional, exact original-cipher decision; original ciphertext and known solved p56 are preserved. A different key, all-word boundary stepping convention, first-word direction convention, authored page-specific reset or changed plaintext word segmentation remains untested. No calculation supplies an author-selected decoder.

Do not blend this negative with the distinct historical flat-stream/anti-repeat word-key-pointer campaign #1329. That campaign should continue on its own evidence and only be judged after its actual queued CI work is complete.
