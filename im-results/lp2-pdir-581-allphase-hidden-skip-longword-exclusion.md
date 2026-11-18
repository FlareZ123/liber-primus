# All 581 historical pointer keys: original long-word preimage obstruction, including hidden collisions

**Original-cipher decision, 18 November 2026.** Across every registered 581-key pointer-direction source, **none of the 109 complete printed LP2 ciphertext words containing 10–14 GP29 runes has even one exact source-native English dictionary preimage** under an unusually permissive local inverse. The inverse permits an unrelated secret key phase for every word, both key signs, both within-word pointer directions, and **both published hidden key-consumption models**. The first rune receives an arbitrary collision comparator, covering all 18 historical pointer conventions. A planted solved-source word with a real hidden rejection is recovered correctly on all six independent Windows shards. This is a finite lexical obstruction to that **specific 581-key, word-preserving, native-GP English** family, not a recovered plaintext or proof that LP2 is unsolvable.

## Why this is a causal test

The authentic signed 2016 Cicada instruction, “words are the map, their meaning is the road, and their numbers are the direction,” motivates the bounded hypothesis that original printed words control the direction of a reversible prime/alphabet key pointer. Director [#1329](https://github.com/FlareZ123/liber-primus/issues/1329) tests 66 actual word-number direction rules, 18 pointer conventions, both signs, two anti-repeat/coin consumption models, and 581 historically named GP29 key streams. That score-ranked, 216-shard original campaign remains separate and is still active.

The present test asks a stronger *necessary-condition* question without choosing a favorable word-number rule: **could any plausible GP-English long word be reached even if every word were independently allowed its best historical stream, start phase, direction, and sign?** A genuine plaintext produced by any one of the registered rule/global-pointer configurations must have a preimage within this relaxed per-word family whenever its plaintext word is in the registered dictionary.

The exact original inputs are `resources/liber-primus/lp2-transcription.txt` and `resources/liber-primus/lp2-corpus.json`: **12,956 source runes, 2,896 continuous printed words**, preserving cross-page continuations, and rune-index SHA-256 `73473a68c3fc4296f16009716d7fee18c9c102173e6e70d090c9494cc5bd9252`. The registered frozen historical generator `pnotisdev/cicada3301@15200c67abee106913ba01ff504c5b6e88d16cc7` regenerates **581** flat-IoC eligible streams, containing **11,315,002** GP29 key values in their exact KSB1 representation. The same generator is used by the running issue campaign; no additional plaintext-derived or postselected key enters this test.

The independent plaintext register is `resources/control/english_wordfreq_textblob.txt`, GP-transliterated with the established `ING`, `IO`, `QU→CW`, `V→U`, `K/Q→C`, `Z→S` conventions, and supplemented with six attested solved-source spellings such as CIRCUMFERENCES. It holds **2,388 / 1,450 / 767 / 379 / 154** unique native-GP word forms of lengths **10 / 11 / 12 / 13 / 14** respectively, for **5,138** at the original observed lengths. This is an explicit finite language register, not a claim to cover every word Cicada could have written.

## Two independently executable original-input gates

**Gate A: no hidden skips.** For each original long word and all same-length native-GP dictionary candidates, compute both signed keys `(C-P) mod 29` and `(P-C) mod 29`. Compare the complete candidate key sequence, forward and reversed, against **every phase in every one of the 581 registered key streams**. An exact eight-symbol fragment index accelerates the scan, but an accepted match must satisfy the entire 10–14-symbol word; this is exact equality, not a statistical scoring threshold. Its complete Windows run found **zero** original preimages. A known GP spelling of CIRCUMFERENCES encrypted under registered historical prime key offset100, forward direction and sign1 was recovered. Reproducer: [Python SFT](../sims/lp2_pdir_581_longword_freephase_sft.py), [successful Windows run 44363348938](https://github.com/FlareZ123/liber-primus/actions/runs/44363348938).

**Gate B: both published key-rejection models.** The exact reference `work/kscreen/pdir_ref.py` allows, per rune, an ordinary key read and hidden key rejections conditioned on equality with the previous emitted ciphertext rune. Model 0 permits up to **two** rejected proposals and consumes one, two or three key positions. Model 1 admits an additional coin read and possible jump of two key positions before accepting. The original ciphertext, candidate key and current trie state jointly determine every legal inverse branch; no candidate plaintext scoring or speculative language decoder is needed.

The second SFT constructs a trie for every word length. It enumerates **every key starting position** in each source stream, sign1 or sign28, forward or backward pointer traversal, and both exact 0–2-rejection models. An arbitrary first-rune collision comparator is deliberately granted, *more permissive* than the actual source's c=0/1/2 convention-specific previous-rune registers. On later runes the comparator is the preceding ciphertext rune, as required by all three source conventions within a given word. The source's h and m conventions merely alter the unknown per-word starting pointer, already freely granted. Therefore all **18 source pointer conventions and 66 possible word-number sign rules** lie within the tested local inverse, even when no authentic direction rule has been selected.

The positive test actually encrypts the attested GP word CIRCUMFERENCES using the registered `primes` key, choosing an original key phase at which **one key read is rejected due to a ciphertext collision**. The inverse recovers the exact source word under model0, proving the extra branch is exercised rather than silently falling back to ordinary Vigenère. All six Windows shards independently pass this planted test.

| Original printed-word length | Original words | Exact preimages, no skips | Exact preimages, both skip/coin models |
|---:|---:|---:|---:|
| 10 | 52 | **0** | **0** |
| 11 | 32 | **0** | **0** |
| 12 | 18 | **0** | **0** |
| 13 | 4 | **0** | **0** |
| 14 | 3 | **0** | **0** |
| **Total** | **109** | **0** | **0** |

The skip-aware result is the union of six **disjoint, exact-original-word shards**: shard0 handles 19 words; shards1–5 handle 18 words apiece. Every shard completed successfully with **zero** original preimages, and all six recovered the hidden-skip source plant. Reproducer: [CommonJS, Node22 SFT](../sims/lp2_pdir_581_skipaware_wordlex_sft.cjs), [successful six-shard Windows run 44365120657](https://github.com/FlareZ123/liber-primus/actions/runs/44365120657).

## Independent known-language coverage and limitations

As a check against a dictionary that excludes the puzzle author's long-word vocabulary, the exact source-native encoder was also applied to the independent established `resources/liber-primus/lp1-plaintext-reference.txt` text. All **25/25** known LP1 long word occurrences at the same 10–14 rune lengths are present in the unaugmented TextBlob GP-normalized register. The complete solved LP1/LP2 source register has **26** such occurrences, and the only absent word from the unaugmented dictionary is **CIRCUMFERENCES**, explicitly added to the tested lexicon. The source-language coverage check is supportive evidence for this English-register obstruction, without proving the unsolved book must use that register.

This experiment is an **exclusion with a lexical premise**. It does not rule out:
- an authentic key stream outside the 581 source library, including the library's separate 858 flat-IoC-excluded streams and five sign-flattenable extras;
- original printed word lengths that are artificial or a cipher layer that changes segmentation;
- an independently selected second cipher layer, different alphabet, non-English language, or original vocabulary outside the 5,138 registered long-word forms;
- more than two hidden rejected reads per rune or a key-consumption mechanism different from the frozen source models.

The original 216-shard whole-section IoC campaign continues until its frozen coverage and matched-null record are complete. The keyless local-preimage result already says that **changing among the 66 direction rules or retuning the starting phase cannot rescue any of these 109 original words into the calibrated ordinary English register under the 581 frozen source streams**, even when both official key-rejection models are allowed. Further work on this branch would require a *new independently authored key or transform* that changes this causal decision, rather than another fitted pointer rule.

**Plaintext status:** no unknown LP2 page recovered, no genuine unknown-page key authenticated, and no terminal puzzle destination identified.
